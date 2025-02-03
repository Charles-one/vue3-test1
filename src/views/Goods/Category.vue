<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCategoryList, getSubCategoryList, editCategory, addCategory, deleteCategory, addSubCategory, deleteSubCategory, editSubCategory } from '@/api/goods'
import { Plus, Delete } from '@element-plus/icons-vue'

// 分类数据
const categoryList = ref([])

// 添加分页相关的数据
const currentPage = ref(1)
const pageSize = ref(8)
const total = ref(0)

// 计算当前页的数据，只显示主分类（没有 parentId 的分类）
const currentTableData = computed(() => {
  // 过滤出主分类
  const mainCategories = categoryList.value.filter(item => !item.parentId)
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return mainCategories.slice(start, end)
})

// 添加 allSubCategories 的声明
const allSubCategories = ref([])

// 构建树形结构
const buildTree = (list) => {
  const map = {}
  const tree = []

  // 首先创建一个以id为键的映射
  list.forEach(item => {
    map[item.id] = { ...item, children: [] }
  })

  // 构建树形结构
  list.forEach(item => {
    const node = map[item.id]
    if (item.parentId) {
      // 如果有父节点，将当前节点添加到父节点的children中
      const parent = map[item.parentId]
      if (parent) {
        parent.children.push(node)
      }
    } else {
      // 如果没有父节点，则为顶级节点
      tree.push(node)
    }
  })

  return tree
}

// 获取分类列表
const fetchCategoryList = async () => {
  try {
    const [categoriesRes, subcategoriesRes] = await Promise.all([
      getCategoryList(),
      getSubCategoryList()
    ])
    
    if (Array.isArray(categoriesRes)) {
      categoryList.value = categoriesRes.sort((a, b) => b.sort - a.sort)
      total.value = categoriesRes.length
    }
    
    if (Array.isArray(subcategoriesRes)) {
      allSubCategories.value = subcategoriesRes
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败')
  }
}

// 在组件挂载时获取数据
onMounted(() => {
  fetchCategoryList()
})

// 添加分类对话框
const dialogVisible = ref(false)
const addForm = ref({
  name: '',
  sort: 0
})

// 添加表单的引用
const addFormRef = ref(null)

// 编辑对话框
const editDialogVisible = ref(false)
const editForm = ref({
  id: '',
  name: '',
  sort: 0
})

// 表单规则
const rules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: 'blur' }
  ]
}

// 处理添加分类
const handleAdd = () => {
  addForm.value = {
    name: '',
    sort: 0
  }
  dialogVisible.value = true
}

// 提交添加分类
const submitAdd = async () => {
  if (!addFormRef.value) return
  
  try {
    console.log('开始添加，表单数据:', addForm.value)
    // 表单验证
    await addFormRef.value.validate()
    
    // 生成一个随机的 id（实际项目中应该由后端生成）
    const newId = Math.random().toString(36).substr(2, 4)
    const newCategory = {
      ...addForm.value,
      id: newId,
      createTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
    }
    
    // 调用添加分类接口
    const res = await addCategory(newCategory)
    console.log('添加接口返回:', res)
    
    if (res && res.code === 200) {
      // 重新获取列表数据并按照 sort 值排序
      await fetchCategoryList()
      
      // 关闭对话框并重置表单
      dialogVisible.value = false
      addFormRef.value.resetFields()
      
      ElMessage.success('添加成功')
    } else {
      console.error('添加失败，接口返回:', res)
      ElMessage.error(res?.message || '添加失败')
    }
  } catch (error) {
    console.error('添加失败，错误详情:', error)
    console.error('错误堆栈:', error.stack)
    ElMessage.error('添加失败: ' + (error.message || '未知错误'))
  }
}

// 取消添加
const cancelAdd = () => {
  dialogVisible.value = false
  if (addFormRef.value) {
    addFormRef.value.resetFields()
  }
}

// 修改分类
const handleEdit = (row) => {
  // 深拷贝当前行数据
  editForm.value = JSON.parse(JSON.stringify(row))
  editDialogVisible.value = true
}

// 提交编辑
const submitEdit = async () => {
  try {
    console.log('开始编辑，表单数据:', editForm.value)
    const res = await editCategory(editForm.value)
    console.log('编辑接口返回:', res)
    
    if (res.code === 200) {
      // 重新获取列表数据并按照 sort 值排序
      await fetchCategoryList()
      editDialogVisible.value = false
      ElMessage.success('修改成功')
    } else {
      console.error('编辑失败，接口返回:', res)
      ElMessage.error(res.message || '修改失败')
    }
  } catch (error) {
    console.error('编辑失败，错误详情:', error)
    console.error('错误堆栈:', error.stack)
    ElMessage.error('修改失败: ' + (error.message || '未知错误'))
  }
}

// 下分类
const handleDown = (row) => {
  ElMessage.success('下分类')
}

// 添加选中的行数据
const selectedRows = ref([])

// 处理表格选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请至少选择一条记录')
    return
  }

  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedRows.value.length} 条记录吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      // 依次删除选中的记录
      for (const row of selectedRows.value) {
        await deleteCategory(row.id)
      }
      // 重新获取列表数据
      await fetchCategoryList()
      ElMessage.success('批量删除成功')
      // 清空选中
      selectedRows.value = []
    } catch (error) {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 处理页码改变
const handleCurrentChange = (val) => {
  currentPage.value = val
}

// 处理每页条数改变
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1  // 重置到第一页
}

// 子分类相关数据
const subCategoryVisible = ref(false)
const subAddDialogVisible = ref(false)
const currentCategory = ref({})
const subCategories = ref([])
const subAddFormRef = ref(null)
const subAddForm = ref({
  name: '',
  sort: 0
})

// 处理查看子分类
const handleSubCategory = (row) => {
  currentCategory.value = row
  // 从所有子分类中过滤出当前分类的子分类
  subCategories.value = allSubCategories.value.filter(
    item => item.parentId === row.id
  )
  console.log('当前子分类:', subCategories.value) // 添加调试日志
  subCategoryVisible.value = true
}

// 处理添加子分类
const handleAddSubCategory = () => {
  subAddForm.value = {
    name: '',
    sort: 0
  }
  subAddDialogVisible.value = true
}

// 提交添加子分类
const submitSubAdd = async () => {
  if (!subAddFormRef.value) return
  
  try {
    await subAddFormRef.value.validate()
    
    const newSubCategory = {
      ...subAddForm.value,
      parentId: currentCategory.value.id,
      createTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
    }
    
    // 调用添加子分类接口
    const res = await addSubCategory(newSubCategory)
    
    if (res.code === 200) {
      await fetchCategoryList()
      // 更新子分类列表
      subCategories.value = allSubCategories.value.filter(
        item => item.parentId === currentCategory.value.id
      )
      subAddDialogVisible.value = false
      subAddFormRef.value.resetFields()
      ElMessage.success('添加子分类成功')
    } else {
      ElMessage.error(res?.message || '添加子分类失败')
    }
  } catch (error) {
    console.error('添加子分类失败:', error)
    ElMessage.error('添加子分类失败: ' + (error.message || '未知错误'))
  }
}

// 取消添加子分类
const cancelSubAdd = () => {
  subAddDialogVisible.value = false
  if (subAddFormRef.value) {
    subAddFormRef.value.resetFields()
  }
}

// 关闭子分类对话框
const closeSubCategory = () => {
  subCategoryVisible.value = false
  currentCategory.value = {}
  subCategories.value = []
}

// 处理删除主分类
const handleDelete = (row) => {
  ElMessageBox.confirm(
    '删除该分类将同时删除其下所有子分类，是否继续？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      // 先删除所有相关的子分类
      const subCategories = allSubCategories.value.filter(item => item.parentId === row.id)
      for (const subCategory of subCategories) {
        await deleteSubCategory(subCategory.id)
      }
      
      // 再删除主分类
      await deleteCategory(row.id)
      
      await fetchCategoryList()
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 处理删除子分类
const handleDeleteSub = (row) => {
  ElMessageBox.confirm(
    '确定要删除该子分类吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await deleteSubCategory(row.id)
      // 重新获取子分类列表
      await fetchCategoryList()
      // 更新当前显示的子分类列表
      subCategories.value = allSubCategories.value.filter(
        item => item.parentId === currentCategory.value.id
      )
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  })
}

// 添加子分类编辑相关的数据
const subEditDialogVisible = ref(false)
const subEditForm = ref({
  id: '',
  name: '',
  sort: 0,
  parentId: ''
})

// 处理编辑子分类
const handleEditSub = (row) => {
  subEditForm.value = { ...row }  // 复制当前行的数据到编辑表单
  subEditDialogVisible.value = true
}

// 提交子分类编辑
const submitSubEdit = async () => {
  try {
    const res = await editSubCategory(subEditForm.value)
    
    if (res.code === 200) {
      await fetchCategoryList()
      // 更新子分类列表
      subCategories.value = allSubCategories.value.filter(
        item => item.parentId === currentCategory.value.id
      )
      subEditDialogVisible.value = false
      ElMessage.success('修改子分类成功')
    } else {
      ElMessage.error(res?.message || '修改子分类失败')
    }
  } catch (error) {
    console.error('修改子分类失败:', error)
    ElMessage.error('修改子分类失败: ' + (error.message || '未知错误'))
  }
}

// 取消子分类编辑
const cancelSubEdit = () => {
  subEditDialogVisible.value = false
  subEditForm.value = {
    id: '',
    name: '',
    sort: 0,
    parentId: ''
  }
}
</script>

<template>
  <div class="category-container">
    <!-- 顶部操作区域 -->
    <div class="operation-area">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>增加
      </el-button>
      <el-button type="danger" @click="handleBatchDelete">
        <el-icon><Delete /></el-icon>批量删除
      </el-button>
    </div>
    
    <!-- 主分类表格 -->
    <el-table 
      :data="currentTableData" 
      border 
      style="width: 100%; font-size: 15px;"
      :row-style="{ height: '60px' }"
      :header-row-style="{ height: '65px' }"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="60" />
      <el-table-column prop="name" label="分类名称" min-width="250" />
      <el-table-column prop="sort" label="排序值" width="150" />
      <el-table-column prop="createTime" label="添加时间" width="220" />
      <el-table-column label="操作" width="280">
        <template #default="scope">
          <div class="operation-buttons">
            <el-button
              size="small"
              type="primary"
              @click="handleEdit(scope.row)"
            >
              修改
            </el-button>
            <el-button
              size="small"
              type="primary"
              @click="handleSubCategory(scope.row)"
            >
              下级分类
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[8, 16, 24, 32]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 子分类表格 -->
    <el-dialog
      v-model="subCategoryVisible"
      :title="`${currentCategory.name || ''} - 下级分类`"
      width="80%"
      @close="closeSubCategory"
    >
      <div class="sub-category-container">
        <div class="operation-area">
          <el-button type="primary" @click="handleAddSubCategory">
            <el-icon><Plus /></el-icon>增加
          </el-button>
        </div>
        
        <el-table 
          :data="subCategories" 
          border 
          style="width: 100%; font-size: 15px;"
          :row-style="{ height: '60px' }"
          :header-row-style="{ height: '65px' }"
        >
          <el-table-column prop="name" label="分类名称" min-width="250" />
          <el-table-column prop="sort" label="排序值" width="150" />
          <el-table-column prop="createTime" label="添加时间" width="220" />
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <div class="operation-buttons">
                <el-button
                  link
                  type="primary"
                  @click="handleEditSub(scope.row)"
                >
                  修改
                </el-button>
                <el-button
                  link
                  type="danger"
                  @click="handleDeleteSub(scope.row)"
                >
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 修改添加分类对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="添加分类"
      width="500px"
      @close="cancelAdd"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="addForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="排序值" prop="sort">
          <el-input-number v-model="addForm.sort" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="dialog-btn" @click="cancelAdd">取消</el-button>
          <el-button class="dialog-btn" type="primary" @click="submitAdd">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑分类对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="修改分类"
      width="500px"
    >
      <el-form :model="editForm" :rules="rules" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="排序值" prop="sort">
          <el-input-number v-model="editForm.sort" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="dialog-btn" @click="editDialogVisible = false">取消</el-button>
          <el-button class="dialog-btn" type="primary" @click="submitEdit">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加子分类对话框 -->
    <el-dialog
      v-model="subAddDialogVisible"
      title="添加子分类"
      width="500px"
      @close="cancelSubAdd"
    >
      <el-form
        ref="subAddFormRef"
        :model="subAddForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="父级分类">
          <el-input v-model="currentCategory.name" disabled />
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="subAddForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="排序值" prop="sort">
          <el-input-number v-model="subAddForm.sort" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelSubAdd">取消</el-button>
          <el-button type="primary" @click="submitSubAdd">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加子分类编辑对话框 -->
    <el-dialog
      v-model="subEditDialogVisible"
      title="修改子分类"
      width="500px"
      @close="cancelSubEdit"
    >
      <el-form
        :model="subEditForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="父级分类">
          <el-input v-model="currentCategory.name" disabled />
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="subEditForm.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="排序值" prop="sort">
          <el-input-number v-model="subEditForm.sort" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelSubEdit">取消</el-button>
          <el-button type="primary" @click="submitSubEdit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.category-container {
  padding: 20px;
  background-color: #fff;
}

.operation-area {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

/* 按钮样式 */
.el-button {
  display: flex;
  align-items: center;
  gap: 5px;
}

.el-button [class*='el-icon'] + span {
  margin-left: 5px;
}

/* 表格相关样式 */
:deep(.el-table) {
  margin-top: 15px;
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

.operation-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
  align-items: center;
}

:deep(.el-button--link) {
  padding: 0 12px;
  height: 32px;
  line-height: 32px;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: right;  /* 居中对齐 */
  gap: 5px;  /* 按钮之间的间距 */
  padding-top: 20px;
}

.dialog-btn {
  width: 80px;  /* 统一按钮宽度 */
  height: 40px;
}

:deep(.el-dialog__body) {
  padding: 20px 40px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  padding: 10px 0;
}

.sub-category-container {
  padding: 20px;
}

.sub-category-container .operation-area {
  margin-bottom: 20px;
}
</style>
