<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getGoodsList, addGoods, uploadImage, editGoods, deleteGoods } from '@/api/goods'
import { createOrder } from '@/api/order'
import { useRouter } from 'vue-router'
import { Search, RefreshLeft } from '@element-plus/icons-vue'
import { useGoodsStore } from '@/stores/goods'
import LazyImage from '@/components/LazyImage.vue'

const goodsStore = useGoodsStore()

// 使用 store 中的商品数据
const goodsList = computed(() => goodsStore.goodsList)
const loading = computed(() => goodsStore.loading)

// 表格数据
const tableData = ref([])  // 初始化为空数组，数据会从后端获取

// 搜索表单
const searchForm = ref({
  name: '',
  category: ''
})

// 添加商品对话框的显示状态
const dialogVisible = ref(false)

// 添加商品的表单数据
const addForm = ref({
  name: '',
  category: '',
  price: '',
  stock: '',
  image: '',
  status: 1
})

// 添加编辑相关的数据
const editDialogVisible = ref(false)
const editForm = ref({
  id: '',
  name: '',
  category: '',
  price: '',
  stock: '',
  image: '',
  status: 1
})

// 表单规则
const rules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请输入商品分类', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' },
    { type: 'number', message: '价格必须为数字', trigger: 'blur', transform: (value) => Number(value) }
  ],
  stock: [
    { required: true, message: '请输入库存数量', trigger: 'blur' },
    { type: 'number', message: '库存必须为数字', trigger: 'blur', transform: (value) => Number(value) }
  ],
  image: [
    { required: true, message: '请上传商品图片', trigger: 'blur' }
  ]
}

const addFormRef = ref(null)

// 添加分页相关的数据
const currentPage = ref(1)
const pageSize = ref(6)
const total = ref(0)

// 计算当前页的数据
const currentTableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return tableData.value.slice(start, end)
})

// 处理搜索
const handleSearch = () => {
  // 根据搜索条件过滤表格数据
  const filteredData = tableData.value.filter(item => {
    const nameMatch = item.name.toLowerCase().includes(searchForm.value.name.toLowerCase())
    const categoryMatch = item.category.toLowerCase().includes(searchForm.value.category.toLowerCase())
    
    // 如果都没有输入搜索条件，返回所有数据
    if (!searchForm.value.name && !searchForm.value.category) {
      return true
    }
    
    // 如果只输入了商品名称
    if (searchForm.value.name && !searchForm.value.category) {
      return nameMatch
    }
    
    // 如果只输入了商品分类
    if (!searchForm.value.name && searchForm.value.category) {
      return categoryMatch
    }
    
    // 如果两个条件都输入了
    return nameMatch && categoryMatch
  })
  
  // 更新表格数据
  tableData.value = filteredData
}

// 处理重置
const handleReset = () => {
  // 重置搜索表单
  searchForm.value = {
    name: '',
    category: ''
  }
  
  // 重新获取所有数据
  fetchGoodsList()
}

// 处理添加
const handleAdd = () => {
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row) => {
  editForm.value = { ...row }  // 复制当前行的数据到编辑表单
  editDialogVisible.value = true
}

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    '确定要删除该商品吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await goodsStore.deleteGoods(row.id)
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
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

// 获取商品列表
const fetchGoodsList = async () => {
  try {
    const res = await getGoodsList()
    if (res.code === 200) {
      tableData.value = res.data.list
      total.value = res.data.total
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
  }
}

// 提交表单（添加商品）
const submitForm = async () => {
  if (!addFormRef.value) return
  
  try {
    await addFormRef.value.validate()
    
    // 调用添加商品接口
    await goodsStore.addGoods(addForm.value)
    
    // 关闭对话框并重置表单
    dialogVisible.value = false
    addFormRef.value.resetFields()
    
    ElMessage.success('添加商品成功')
  } catch (error) {
    console.error('添加商品失败:', error)
    ElMessage.error('添加商品失败，请重试')
  }
}

// 修改图片上传处理函数
const handleAvatarSuccess = (uploadFile) => {
  if (uploadFile.raw) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64Url = e.target.result
      // 根据当前操作的是添加还是编辑，更新对应的表单
      if (dialogVisible.value) {
        addForm.value.image = base64Url
      } else if (editDialogVisible.value) {
        editForm.value.image = base64Url
      }
    }
    reader.readAsDataURL(uploadFile.raw)
  }
}

// 上传之前的处理
const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('上传图片只能是 JPG/PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
    return false
  }

  return true  // 返回 true，允许选择文件
}

// 取消添加
const cancelAdd = () => {
  dialogVisible.value = false
  addFormRef.value.resetFields()
}

// 提交编辑
const submitEdit = async () => {
  try {
    // 调用编辑商品接口
    await goodsStore.editGoods(editForm.value)
    
    editDialogVisible.value = false
    ElMessage.success('编辑商品成功')
  } catch (error) {
    console.error('编辑商品失败:', error)
    ElMessage.error('编辑商品失败')
  }
}

// 取消编辑
const cancelEdit = () => {
  editDialogVisible.value = false
  editForm.value = {
    id: '',
    name: '',
    category: '',
    price: '',
    stock: '',
    image: '',
    status: 1
  }
}

// 在 script setup 中添加
const buyDialogVisible = ref(false)
const buyForm = ref({
  goodId: '',
  goodName: '',
  price: 0,
  quantity: 1,
  image: '',
  stock: 0,
  paymentMethod: '微信支付'
})

// 计算总价
const totalPrice = computed(() => {
  return (buyForm.value.price * buyForm.value.quantity).toFixed(2)
})

// 修改购买方法
const handleBuy = (row) => {
  if (row.stock <= 0) {
    ElMessage.warning('商品库存不足')
    return
  }
  
  buyForm.value = {
    goodId: row.id,
    goodName: row.name,
    price: row.price,
    quantity: 1,
    image: row.image,
    stock: row.stock,
    paymentMethod: '微信支付'
  }
  buyDialogVisible.value = true
}

const router = useRouter()

// 添加生成随机订单号的方法
const generateOrderId = () => {
  const timestamp = new Date().getTime().toString()  // 13位时间戳
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')  // 4位随机数
  return timestamp + random  // 17位订单号
}

// 修改确认购买方法
const confirmBuy = async () => {
  // 检查库存
  if (buyForm.value.quantity > buyForm.value.stock) {
    ElMessage.warning(`库存不足，当前库存: ${buyForm.value.stock}`)
    return
  }

  try {
    // 创建订单数据
    const orderData = {
      id: generateOrderId(),
      goodId: buyForm.value.goodId,
      goodName: buyForm.value.goodName,
      price: totalPrice.value,
      quantity: buyForm.value.quantity,
      status: '已支付',
      paymentMethod: buyForm.value.paymentMethod,
      createTime: new Date().toLocaleString(),
      // 添加商品详细信息
      goodInfo: {
        name: buyForm.value.goodName,
        price: buyForm.value.price,
        quantity: buyForm.value.quantity,
        image: buyForm.value.image,
        totalPrice: totalPrice.value
      }
    }

    // 调用创建订单 API
    const res = await createOrder(orderData)
    
    if (res.code === 200) {
      // 更新商品库存
      const updatedGood = {
        ...tableData.value.find(item => item.id === buyForm.value.goodId),
        stock: buyForm.value.stock - buyForm.value.quantity  // 减少库存
      }
      
      // 调用编辑商品API更新库存
      await goodsStore.editGoods(updatedGood)
      
      ElMessage.success('购买成功')
      buyDialogVisible.value = false
      
      // 重新获取商品列表以更新库存显示
      await fetchGoodsList()
      
      // 跳转到订单列表页面
      router.push({
        name: 'orderlist'
      })
    } else {
      ElMessage.error(res.message || '购买失败')
    }
  } catch (error) {
    console.error('购买失败:', error)
    ElMessage.error('购买失败')
  }
}

// 在 script setup 中添加支付方式选项
const paymentMethods = [
  { label: '微信支付', value: '微信支付' },
  { label: '支付宝', value: '支付宝' },
  { label: '银行卡', value: '银行卡' }
]

// 处理商品操作
const handleGoods = async (action, data) => {
  try {
    switch(action) {
      case 'add':
        await goodsStore.addGoods(data)
        break
      case 'edit':
        await goodsStore.editGoods(data)
        break
      case 'delete':
        await goodsStore.deleteGoods(data.id)
        break
    }
    ElMessage.success('操作成功')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

onMounted(() => {
  fetchGoodsList()
})
</script>

<template>
  <div class="goods-list">
    <!-- 搜索区域 -->
    <div class="search-area">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品分类">
          <el-input v-model="searchForm.category" placeholder="请输入商品分类" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作按钮区域 -->
    <div class="operation-area">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>添加商品
      </el-button>
    </div>

    <!-- 表格区域 -->
    <el-table :data="currentTableData" style="width: 100%" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="商品图片" width="100">
        <template #default="scope">
          <LazyImage
            :src="scope.row.image"
            :alt="scope.row.name"
            style="width: 50px; height: 50px; border-radius: 4px;"
          />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="商品名称" />
      <el-table-column prop="category" label="商品分类" />
      <el-table-column prop="price" label="价格">
        <template #default="scope">
          ¥{{ scope.row.price }}
        </template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" />
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
            {{ scope.row.status === 1 ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250">
        <template #default="scope">
          <div class="operation-buttons">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">
              删除
            </el-button>
            <el-button type="success" size="small" @click="handleBuy(scope.row)">
              购买
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 修改分页组件的容器样式 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[6, 12, 24, 36]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 添加商品对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="添加商品"
      width="500px"
      @close="cancelAdd"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="商品图片" prop="image">
          <el-upload
            class="avatar-uploader"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            accept=".jpg,.jpeg,.png"
          >
            <img v-if="addForm.image" :src="addForm.image" class="avatar" />
            <div v-else class="avatar-uploader-box">
              <el-icon class="avatar-uploader-icon"><Plus /></el-icon>
              <div class="upload-text">点击上传图片</div>
            </div>
          </el-upload>
        </el-form-item>
        
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="addForm.name" placeholder="请输入商品名称" />
        </el-form-item>
        
        <el-form-item label="商品分类" prop="category">
          <el-input v-model="addForm.category" placeholder="请输入商品分类" />
        </el-form-item>
        
        <el-form-item label="商品价格" prop="price">
          <el-input-number 
            v-model="addForm.price" 
            :precision="2" 
            :step="0.1" 
            :min="0"
          />
        </el-form-item>
        
        <el-form-item label="库存数量" prop="stock">
          <el-input-number 
            v-model="addForm.stock" 
            :min="0" 
            :precision="0"
          />
        </el-form-item>
        
        <el-form-item label="商品状态" prop="status">
          <el-switch
            v-model="addForm.status"
            :active-value="1"
            :inactive-value="0"
            active-text="上架"
            inactive-text="下架"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <div class="dialog-buttons">
            <el-button @click="cancelAdd">取消</el-button>
            <el-button type="primary" @click="submitForm">确定</el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 添加编辑商品对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑商品"
      width="500px"
      @close="cancelEdit"
    >
      <el-form
        :model="editForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="商品图片" prop="image">
          <el-upload
            class="avatar-uploader"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            accept=".jpg,.jpeg,.png"
          >
            <img v-if="editForm.image" :src="editForm.image" class="avatar" />
            <div v-else class="avatar-uploader-box">
              <el-icon class="avatar-uploader-icon"><Plus /></el-icon>
              <div class="upload-text">点击上传图片</div>
            </div>
          </el-upload>
        </el-form-item>
        
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入商品名称" />
        </el-form-item>
        
        <el-form-item label="商品分类" prop="category">
          <el-input v-model="editForm.category" placeholder="请输入商品分类" />
        </el-form-item>
        
        <el-form-item label="商品价格" prop="price">
          <el-input-number 
            v-model="editForm.price" 
            :precision="2" 
            :step="0.1" 
            :min="0"
          />
        </el-form-item>
        
        <el-form-item label="库存数量" prop="stock">
          <el-input-number 
            v-model="editForm.stock" 
            :min="0" 
            :precision="0"
          />
        </el-form-item>
        
        <el-form-item label="商品状态" prop="status">
          <el-switch
            v-model="editForm.status"
            :active-value="1"
            :inactive-value="0"
            active-text="上架"
            inactive-text="下架"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <div class="dialog-buttons">
            <el-button @click="cancelEdit">取消</el-button>
            <el-button type="primary" @click="submitEdit">确定</el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 修改购买对话框 -->
    <el-dialog
      v-model="buyDialogVisible"
      title="商品购买"
      width="400px"
    >
      <div class="buy-dialog-content">
        <div class="good-info">
          <LazyImage
            :src="buyForm.image"
            :alt="buyForm.goodName"
            style="width: 100px; height: 100px; border-radius: 4px;"
          />
          <div class="good-details">
            <h3>{{ buyForm.goodName }}</h3>
            <p class="price">单价：¥{{ buyForm.price }}</p>
            <p class="stock">库存：{{ buyForm.stock }}</p>
          </div>
        </div>
        
        <div class="quantity-selector">
          <span class="label">购买数量：</span>
          <el-input-number 
            v-model="buyForm.quantity"
            :min="1"
            :max="buyForm.stock"
            size="large"
          />
        </div>

        <div class="payment-method">
          <span class="label">支付方式：</span>
          <el-select v-model="buyForm.paymentMethod" style="width: 200px">
            <el-option
              v-for="item in paymentMethods"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        
        <div class="total-price">
          <span class="label">总价：</span>
          <span class="price">¥{{ totalPrice }}</span>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <div class="dialog-buttons">
            <el-button @click="buyDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmBuy">确认购买</el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.goods-list {
  padding: 20px;
  background-color: #fff;
}

.search-area {
  margin-bottom: 20px;
}

.operation-area {
  margin-bottom: 20px;
}

.el-button {
  margin-right: 10px;
}

.el-button:last-child {
  margin-right: 0;
}

.el-image {
  border-radius: 4px;
  overflow: hidden;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 178px;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.dialog-footer {
  padding-top: 20px;
}

.dialog-buttons {
  display: flex;
  gap: 10px;  /* 按钮之间的间距 */
  justify-content: flex-end;  /* 靠右对齐 */
}

.dialog-buttons .el-button {
  margin-left: 0;  /* 覆盖默认的左边距 */
  margin-right: 0;  /* 覆盖默认的右边距 */
}

.avatar-uploader-box {
  width: 178px;
  height: 178px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.avatar-uploader-box:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.upload-text {
  color: #8c939d;
  font-size: 14px;
  margin-top: 8px;
}

:deep(.el-image-viewer__wrapper) {
  position: fixed;
  z-index: 2100;
}

:deep(.el-image-viewer__mask) {
  position: fixed;
  z-index: 2099;
}

:deep(.el-image) {
  cursor: pointer;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;  /* 修改为居中对齐 */
  padding: 10px 0;
}

.buy-dialog-content {
  padding: 20px;
}

.good-info {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.good-details {
  flex: 1;
}

.good-details h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
}

.quantity-selector {
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.total-price {
  margin-top: 20px;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.label {
  color: #606266;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}

.payment-method {
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.stock {
  color: #67c23a;
  margin-top: 5px;
}

.el-button {
  display: flex;
  align-items: center;
  gap: 5px;
}

.el-icon {
  margin-right: 2px;
}

.operation-buttons {
  display: flex;
  gap: 5px;  /* 按钮之间的间距 */
}

.operation-buttons .el-button {
  margin-right: 0;  /* 覆盖默认的右边距 */
}
</style>
