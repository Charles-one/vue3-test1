<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserList, updateUserStatus } from '@/api/user'
import { Check, Close } from '@element-plus/icons-vue'

const tableData = ref([])

// 添加表格选择相关的数据和方法
const selectedRows = ref([])

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 获取用户列表
const fetchUserList = async () => {
  try {
    const res = await getUserList()
    if (res.code === 200) {
      tableData.value = res.data.list
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  }
}

// 处理禁用/解除禁用
const handleStatusChange = async (row) => {
  const action = row.status === '禁用' ? '解除禁用' : '禁用'
  try {
    await ElMessageBox.confirm(
      `确定要${action}该用户吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const newStatus = row.status === '禁用' ? '正常' : '禁用'
    const res = await updateUserStatus(row.id, newStatus)
    
    if (res.code === 200) {
      ElMessage.success(`${action}成功`)
      await fetchUserList()  // 刷新列表
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`${action}失败`)
    }
  }
}

// 批量解除禁用
const handleBatchEnable = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要解除禁用的用户')
    return
  }

  try {
    await ElMessageBox.confirm('确定要解除禁用选中的用户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    for (const row of selectedRows.value) {
      await updateUserStatus(row.id, '正常')
    }
    
    ElMessage.success('解除禁用成功')
    await fetchUserList()  // 刷新列表
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('解除禁用失败')
    }
  }
}

// 批量禁用
const handleBatchDisable = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要禁用的用户')
    return
  }

  try {
    await ElMessageBox.confirm('确定要禁用选中的用户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    for (const row of selectedRows.value) {
      await updateUserStatus(row.id, '禁用')
    }
    
    ElMessage.success('禁用成功')
    await fetchUserList()  // 刷新列表
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('禁用失败')
    }
  }
}

onMounted(() => {
  fetchUserList()
})
</script>

<template>
  <div class="user-list">
    <div class="header">
      <div class="buttons">
        <el-button 
          type="success" 
          @click="handleBatchEnable"
          :disabled="selectedRows.length === 0"
        >
          <el-icon><Check /></el-icon>
          解除禁用
        </el-button>
        <el-button 
          type="danger"
          @click="handleBatchDisable"
          :disabled="selectedRows.length === 0"
        >
          <el-icon><Close /></el-icon>
          禁用账户
        </el-button>
      </div>
    </div>

    <el-table 
      :data="tableData" 
      style="width: 100%" 
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      
      <el-table-column prop="nickname" label="昵称" min-width="120" />
      
      <el-table-column prop="username" label="登录名" min-width="120" />
      
      <el-table-column prop="status" label="身份状态" min-width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === '正常' ? 'success' : 'danger'">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="isVip" label="是否注销" min-width="100">
        <template #default="scope">
          <el-tag :type="scope.row.isVip === '正常' ? 'success' : 'danger'">
            {{ scope.row.isVip }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="createTime" label="注册时间" min-width="180" />
    </el-table>
  </div>
</template>

<style scoped>
.user-list {
  padding: 20px;
  background-color: #fff;
}

.header {
  margin-bottom: 20px;
}

.buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-start;
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
</style>
