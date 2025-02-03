<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getAdminList, addAdmin, editAdmin, deleteAdmin } from '@/api/admin'

const adminList = ref([])

// 添加/编辑对话框
const dialogVisible = ref(false)
const dialogTitle = ref('添加管理员')
const formMode = ref('add') // 'add' 或 'edit'

// 表单数据
const formData = ref({
  username: '',
  nickname: '',
  password: '',
  role: '普通管理员',
  status: '正常'
})

// 表单规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// 角色选项
const roleOptions = [
  { label: '超级管理员', value: '超级管理员' },
  { label: '普通管理员', value: '普通管理员' }
]

// 获取管理员列表
const fetchAdminList = async () => {
  try {
    const res = await getAdminList()
    if (res.code === 200) {
      adminList.value = res.data
    }
  } catch (error) {
    console.error('获取管理员列表失败:', error)
    ElMessage.error('获取管理员列表失败')
  }
}

// 在 onMounted 中调用
onMounted(() => {
  fetchAdminList()
})

// 处理添加
const handleAdd = () => {
  dialogTitle.value = '添加管理员'
  formMode.value = 'add'
  formData.value = {
    username: '',
    nickname: '',
    password: '',
    role: '普通管理员',
    status: '正常'
  }
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑管理员'
  formMode.value = 'edit'
  formData.value = { ...row }
  dialogVisible.value = true
}

// 处理删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该管理员吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 调用删除 API
    const res = await deleteAdmin(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      await fetchAdminList()  // 重新获取列表
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除管理员失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (formMode.value === 'add') {
    // 添加管理员
    try {
      const res = await addAdmin(formData.value)
      if (res.code === 200) {
        ElMessage.success('添加成功')
        dialogVisible.value = false
        await fetchAdminList()  // 重新获取列表
      } else {
        ElMessage.error(res.message || '添加失败')
      }
    } catch (error) {
      console.error('添加管理员失败:', error)
      ElMessage.error('添加失败')
    }
  } else {
    // 编辑管理员
    try {
      const res = await editAdmin({
        ...formData.value,
        id: formData.value.id
      })
      if (res.code === 200) {
        ElMessage.success('编辑成功')
        dialogVisible.value = false
        await fetchAdminList()  // 重新获取列表
      } else {
        ElMessage.error(res.message || '编辑失败')
      }
    } catch (error) {
      console.error('编辑管理员失败:', error)
      ElMessage.error('编辑失败')
    }
  }
}
</script>

<template>
  <div class="permission-list">
    <div class="header">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        添加管理员
      </el-button>
    </div>

    <el-table :data="adminList" style="width: 100%" border>
      <el-table-column prop="username" label="用户名" min-width="120" />
      <el-table-column prop="nickname" label="昵称" min-width="120" />
      <el-table-column prop="password" label="密码" min-width="120">
        <template #default>
          ******
        </template>
      </el-table-column>
      <el-table-column prop="role" label="角色" min-width="120" />
      <el-table-column prop="status" label="状态" min-width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === '正常' ? 'success' : 'danger'">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" min-width="180" />
      <el-table-column label="操作" fixed="right" min-width="150">
        <template #default="scope">
          <div class="operation-buttons">
            <el-button type="primary" link @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)">
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑对话框 -->
    <el-dialog 
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
    >
      <el-form 
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="formData.nickname" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="formData.password" type="password" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="formData.role" style="width: 100%">
            <el-option 
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="formData.status"
            active-value="正常"
            inactive-value="禁用"
            active-text="正常"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <div class="dialog-buttons">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmit">确定</el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.permission-list {
  padding: 20px;
  background-color: #fff;
}

.header {
  margin-bottom: 20px;
}

.operation-buttons {
  display: flex;
  gap: 10px;
}

:deep(.el-table th) {
  background-color: #f5f7fa !important;
  font-size: 15px;
  font-weight: bold;
  padding: 15px 0;
}

:deep(.el-table td) {
  padding: 15px 0;
  font-size: 14px;
}

.el-button {
  display: flex;
  align-items: center;
  gap: 5px;
}

.el-icon {
  margin-right: 2px;
}

.dialog-footer {
  padding-top: 20px;
}

.dialog-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.dialog-buttons .el-button {
  margin-left: 0;
  margin-right: 0;
}
</style>
