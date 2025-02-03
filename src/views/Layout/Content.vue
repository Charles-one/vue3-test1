<script setup>
import { ref, onMounted, watch, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import { logout } from '@/api/user'
import { ElMessageBox, ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { getAdminList, editAdmin } from '@/api/admin'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const currentPath = ref('系统首页')

const routeNameMap = {
  '/': '系统首页',
  '/goods/goodlist': '商品管理/商品列表',
  '/goods/category': '商品管理/商品分类',
  '/orders/orderlist': '订单管理/订单列表',
  '/orders/orderdetail': '订单管理/订单详情',
  '/users': '用户管理/用户列表',
  '/permissions': '权限管理'
}

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    currentPath.value = routeNameMap[newPath] || '系统首页'
  },
  { immediate: true }  // 确保组件加载时就执行一次
)

const props = defineProps({
  isClose: {
    type: Boolean,
    default: false
  }
})
// 定义 emits
const emit = defineEmits(['change'])

// 定义方法
const change = () => {
  emit('change', !props.isClose)
}
// 获取当前时间
const time = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'))

const userStore = useUserStore()

// 使用 store 中的用户信息
const userInfo = computed(() => userStore.userInfo)

onMounted(async () => {
  // 获取当前登录的用户名
  const username = localStorage.getItem('username')
  if (username) {
    try {
      const res = await getAdminList()
      if (res.code === 200) {
        const currentAdmin = res.data.find(admin => admin.username === username)
        if (currentAdmin) {
          userInfo.value = {
            username: currentAdmin.username,
            nickname: currentAdmin.nickname
          }
        }
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }
  
  // 立即更新一次时间
  updateTime()
  // 每秒更新时间
  const timer = setInterval(updateTime, 1000)
  
  // 组件卸载时清除定时器
  onUnmounted(() => {
    clearInterval(timer)
  })
})

const updateTime = () => {
  time.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
}

// 添加修改信息对话框的控制变量
const editDialogVisible = ref(false)

// 添加编辑表单数据
const editFormData = ref({
  username: '',
  nickname: '',
  password: ''
})

// 添加表单规则
const editRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

// 修改 handleCommand 方法
const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      // 不等待 logout 的结果，直接处理登出逻辑
      localStorage.removeItem('token')
      ElMessage.success('退出成功')
      router.push('/login')
      
      // 在后台调用 logout 接口
      logout().catch(error => {
        console.error('退出接口调用失败:', error)
      })
      
    } catch (error) {
      if (error !== 'cancel') {
        console.error('退出失败:', error)
        ElMessage.error('退出失败')
      }
    }
  } else if (command === 'edit') {
    // 打开编辑对话框并填充数据
    editFormData.value = {
      username: userInfo.value.username,
      nickname: userInfo.value.nickname,
      password: ''
    }
    editDialogVisible.value = true
  }
}

// 添加提交编辑的方法
const handleEditSubmit = async () => {
  try {
    // 先获取当前用户的完整信息
    const res = await getAdminList()
    if (res.code === 200) {
      const currentAdmin = res.data.find(admin => admin.username === userInfo.value.username)
      if (currentAdmin) {
        // 提交编辑
        const editRes = await editAdmin({
          ...currentAdmin, // 保留原有信息
          nickname: editFormData.value.nickname,
          password: editFormData.value.password || currentAdmin.password // 如果没有输入新密码,保留原密码
        })
        
        if (editRes.code === 200) {
          ElMessage.success('修改成功')
          editDialogVisible.value = false
          // 更新本地存储和显示的用户信息
          localStorage.setItem('nickname', editFormData.value.nickname)
          userInfo.value.nickname = editFormData.value.nickname
          // 重新获取用户信息
          const newRes = await getAdminList()
          if (newRes.code === 200) {
            const updatedAdmin = newRes.data.find(admin => admin.username === userInfo.value.username)
            if (updatedAdmin) {
              userInfo.value = {
                username: updatedAdmin.username,
                nickname: updatedAdmin.nickname
              }
            }
          }
        } else {
          ElMessage.error(editRes.message || '修改失败')
        }
      }
    }
  } catch (error) {
    console.error('修改信息失败:', error)
    ElMessage.error('修改失败')
  }
}

// 处理退出
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      type: 'warning'
    })
    await userStore.logout()
    router.push('/login')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('退出失败:', error)
    }
  }
}
</script>

<template>
  <div class="header">
    <div class="left">
      <div class="icon">
      <el-icon v-if="isClose" @click="change"><Expand /></el-icon>
      <el-icon v-else @click="change"><Fold /></el-icon>
      </div>
      <div class="nav-display">
        <span>{{ currentPath }}</span>
      </div>
    </div>
    
   
    
    <div class="right">
      <div class="time">{{ time }}</div>
      <div class="line">|</div>
      <el-dropdown trigger="click" @command="handleCommand">
        <div class="user-info-box">
          {{ userInfo.username }}
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>
              <div class="dropdown-content">
                <div class="user-info">
                  <div>登录名: {{ userInfo.username }}</div>
                  <div>昵称: {{ userInfo.nickname }}</div>
                </div>
                <div class="button-group">
                  <el-button type="primary" size="small" @click="handleCommand('edit')">修改信息</el-button>
                  <el-button type="success" size="small" @click="handleCommand('logout')">退出</el-button>
                </div>
              </div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
  <div class="wrapper">
    <router-view></router-view>
  </div>
  
  <!-- 添加修改信息对话框 -->
  <el-dialog
    v-model="editDialogVisible"
    title="修改信息"
    width="400px"
    center
  >
    <el-form
      :model="editFormData"
      :rules="editRules"
      label-width="80px"
    >
      <el-form-item label="登录名">
        <el-input v-model="editFormData.username" disabled />
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="editFormData.nickname" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="editFormData.password" type="password" show-password />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEditSubmit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.wrapper {
  margin: 0;
  padding: 0;
}

.header {
  height: 50px;
  line-height: 50px;
  background-color: #1e78bf;
  color: white;
  display: flex;
  justify-content: space-between;
 
}
.left{
  display: flex;
  align-items: center;
}

.nav-display{
  margin-left: 5px;
  margin-top: -6px;
  
}
.nav-display span{
  font-size: 12px;
}

.header .icon {
  font-size: 24px;
  cursor: pointer;
  padding: 0 10px;
}
.header .icon i {
  cursor: pointer;
}

.right {
  display: flex;
  align-items: center;
  padding-right: 20px;
  font-size: 12px;
  height: 50px;
}
.line {
  padding: 0 10px;
  color: #fff;
}

.avatar-container {
  cursor: pointer;
}

.user-info-box {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  color: #fff;
  font-size: 12px;
  padding: 0 4px;
}

.el-icon--right {
  font-size: 12px;
}

.dropdown-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 200px;
  padding: 15px 20px;
}

.user-info {
  color: #303133;
  font-size: 14px;
  line-height: 2;
  text-align: left;
  flex: 1;
}

:deep(.el-dropdown-menu__item) {
  padding: 0 !important;
  margin: 0 !important;
}

:deep(.el-button--small) {
  padding: 6px 16px;
  width: 80px;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.el-dropdown-menu) {
  min-width: 150px;
  padding: 0 !important;
  margin: 0 !important;
  border-radius: 4px;
}

:deep(.el-dropdown-menu__item:hover),
:deep(.el-dropdown-menu__item:focus),
:deep(.el-dropdown-menu__item:not(.is-disabled):hover) {
  background-color: transparent !important;
  color: #303133 !important;
}

:deep(.el-popper.is-light) {
  padding: 0 !important;
  margin: 0 !important;
}

:deep(.el-popper__arrow) {
  display: none !important;
}

:deep(.el-dropdown-menu__item.el-dropdown-menu__item--divided) {
  margin: 0 !important;
  padding: 0 !important;
}

:deep(.el-dropdown-menu__item.el-dropdown-menu__item--divided::before) {
  height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
  margin-left: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-dialog__body) {
  padding: 20px 40px;
}
</style>

<style>
.el-main {
  padding: 0 !important;
}

.el-container {
  padding: 0;
  margin: 0;
}
</style>
