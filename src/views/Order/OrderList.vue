<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getOrderList, closeOrder, completeStocking, deliverOrder } from '@/api/order'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import LazyImage from '@/components/LazyImage.vue'

const router = useRouter()
const orderStore = useOrderStore()

// 表格数据
const tableData = ref([])

// 搜索表单
const searchForm = ref({
  orderId: '',
  status: ''
})

// 添加分页相关的数据
const currentPage = ref(1)
const pageSize = ref(8)  // 设置为8条每页
const total = ref(0)

// 计算当前页的数据
const currentTableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return tableData.value.slice(start, end)
})

// 处理页码改变
const handleCurrentChange = (val) => {
  currentPage.value = val
}

// 处理每页条数改变
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1  // 重置到第一页
}

// 使用 store 中的订单数据
const orderList = computed(() => orderStore.orderList)
const loading = computed(() => orderStore.loading)

// 获取订单列表
const fetchOrderList = async () => {
  try {
    const res = await getOrderList(searchForm.value)
    if (res.code === 200) {
      tableData.value = res.data.list
      total.value = res.data.total
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  }
}

// 处理搜索
const handleSearch = () => {
  let filteredData = [...tableData.value]
  
  // 根据订单号搜索
  if (searchForm.value.orderId) {
    filteredData = filteredData.filter(item => 
      item.id.includes(searchForm.value.orderId)
    )
  }
  
  // 根据状态筛选
  if (searchForm.value.status) {
    filteredData = filteredData.filter(item => 
      item.status === searchForm.value.status
    )
  }
  
  // 如果都为空，重新获取所有数据
  if (!searchForm.value.orderId && !searchForm.value.status) {
    fetchOrderList()
    return
  }
  
  tableData.value = filteredData
}

// 重置搜索
const handleReset = () => {
  searchForm.value.orderId = ''
  searchForm.value.status = ''
  fetchOrderList()
}

// 表格选择
const selectedRows = ref([])
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 判断是否可以配货完成
const canCompleteStocking = computed(() => {
  return selectedRows.value.every(row => row.status === '已支付')
})

// 判断是否可以出库
const canDeliver = computed(() => {
  return selectedRows.value.every(row => row.status === '配货完成')
})

// 处理配货完成
const handleStockComplete = async (rows) => {
  try {
    // 检查所选订单状态
    if (!canCompleteStocking.value) {
      ElMessage.warning('只有已支付的订单才能进行配货完成操作')
      return
    }

    for (const row of rows) {
      await orderStore.completeStocking(row.id)
    }
    ElMessage.success('配货完成')
    fetchOrderList()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 处理出库
const handleDeliver = async (rows) => {
  try {
    // 检查所选订单状态
    if (!canDeliver.value) {
      ElMessage.warning('只有配货完成的订单才能进行出库操作')
      return
    }

    for (const row of rows) {
      await orderStore.deliverOrder(row.id)
    }
    ElMessage.success('出库成功')
    fetchOrderList()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 关闭订单
const handleClose = async (rows) => {
  try {
    await ElMessageBox.confirm('确定要关闭选中的订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    for (const row of rows) {
      await orderStore.closeOrder(row.id)
    }
    ElMessage.success('关闭订单成功')
    fetchOrderList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('关闭订单失败')
    }
  }
}

// 查看订单详情
const handleDetail = (row) => {
  router.push({
    name: 'orderdetail',
    query: {
      id: row.id
    }
  })
}

// 处理订单状态变更
const handleOrderStatus = async (orderId, action) => {
  try {
    switch(action) {
      case 'close':
        await orderStore.closeOrder(orderId)
        break
      case 'stock':
        await orderStore.completeStocking(orderId)
        break
      case 'deliver':
        await orderStore.deliverOrder(orderId)
        break
    }
    ElMessage.success('操作成功')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

onMounted(() => {
  fetchOrderList()
})
</script>

<template>
  <div class="order-list">
    <!-- 搜索区域 -->
    <div class="search-area">
      <el-input
        v-model="searchForm.orderId"
        placeholder="请输入订单号"
        style="width: 200px; margin-right: 10px"
      />
      
      <el-select
        v-model="searchForm.status"
        placeholder="订单状态"
        style="width: 200px; margin-right: 10px"
        clearable
      >
        <el-option label="全部" value="" />
        <el-option label="待支付" value="待支付" />
        <el-option label="已支付" value="已支付" />
        <el-option label="配货完成" value="配货完成" />
        <el-option label="出库成功" value="出库成功" />
        <el-option label="交易成功" value="交易成功" />
        <el-option label="手动关闭" value="手动关闭" />
        <el-option label="超时关闭" value="超时关闭" />
      </el-select>
      
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>
        查询
      </el-button>
      
      <el-button @click="handleReset">
        <el-icon><Refresh /></el-icon>
        重置
      </el-button>

      <el-button 
        type="success" 
        :disabled="!selectedRows.length || !canCompleteStocking"
        @click="handleStockComplete(selectedRows)"
      >
        配货
      </el-button>

      <el-button 
        type="primary"
        :disabled="!selectedRows.length || !canDeliver"
        @click="handleDeliver(selectedRows)"
      >
        出库
      </el-button>

      <el-button 
        type="danger"
        :disabled="!selectedRows.length"
        @click="handleClose(selectedRows)"
      >
        关闭订单
      </el-button>
    </div>

    <!-- 表格区域 -->
    <el-table 
      :data="currentTableData" 
      style="width: 100%" 
      border 
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      
      <el-table-column prop="id" label="订单号" min-width="280" />
      
      <el-table-column prop="price" label="订单总价" min-width="150">
        <template #default="scope">
          ¥{{ scope.row.price }}
        </template>
      </el-table-column>
      
      <el-table-column prop="status" label="订单状态" min-width="150">
        <template #default="scope">
          <el-tag 
            :type="scope.row.status === '出库成功' ? 'success' : 
                  scope.row.status === '待支付' ? 'warning' : 'info'"
          >
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="paymentMethod" label="支付方式" min-width="150" />
      
      <el-table-column prop="createTime" label="创建时间" min-width="200" />
      
      <el-table-column label="商品图片" width="100" v-if="showGoodImage">
        <template #default="scope">
          <LazyImage
            :src="scope.row.goodInfo.image"
            :alt="scope.row.goodInfo.name"
            style="width: 50px; height: 50px; border-radius: 4px;"
          />
        </template>
      </el-table-column>
      
      <el-table-column label="操作" fixed="right" min-width="120">
        <template #default="scope">
          <el-button 
            size="small"
            type="primary" 
            @click="handleDetail(scope.row)"
          >
            订单详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加分页组件 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[8]"  
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<style scoped>
.order-list {
  padding: 20px;
  background-color: #fff;
}

.search-area {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.el-button {
  margin-right: 10px;
  display: flex;
  align-items: center;
}

.el-button [class^="el-icon"] {
  margin-right: 4px;
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  padding: 10px 0;
}
</style> 