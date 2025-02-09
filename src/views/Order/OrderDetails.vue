<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getOrderList } from '@/api/order'
import { ElMessage } from 'element-plus'
import LazyImage from '@/components/LazyImage.vue'

const route = useRoute()
const orderInfo = ref({})

// 获取订单详情
const getOrderDetail = async () => {
  // 检查是否有订单ID
  if (!route.query.id) {
    ElMessage.warning('未找到订单ID')
    return
  }

  try {
    const res = await getOrderList({ orderId: route.query.id })
    if (res.code === 200 && res.data.list.length > 0) {
      orderInfo.value = res.data.list[0]
    } else {
      ElMessage.warning('未找到订单信息')
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败')
  }
}

onMounted(() => {
  getOrderDetail()
})
</script>

<template>
  <div class="order-detail">
    <h2>订单详情</h2>

    <!-- 添加空状态显示 -->
    <div v-if="!route.query.id" class="empty-state">
      <el-empty description="请前往订单列表选择订单">
        <el-button type="primary" @click="$router.push('/orders/orderlist')">
          前往订单列表
        </el-button>
      </el-empty>
    </div>

    <!-- 订单信息展示 -->
    <div v-else-if="orderInfo.id" class="order-info">
      <div class="info-item">
        <span class="label">订单号：</span>
        <span>{{ orderInfo.id }}</span>
      </div>

      <div class="info-item">
        <span class="label">订单状态：</span>
        <el-tag
          :type="
            orderInfo.status === '出库成功'
              ? 'success'
              : orderInfo.status === '待支付'
              ? 'warning'
              : 'info'
          "
        >
          {{ orderInfo.status }}
        </el-tag>
      </div>

      <div class="info-item">
        <span class="label">订单总价：</span>
        <span>¥{{ orderInfo.price }}</span>
      </div>

      <div class="info-item">
        <span class="label">支付方式：</span>
        <span>{{ orderInfo.paymentMethod }}</span>
      </div>

      <div class="info-item">
        <span class="label">创建时间：</span>
        <span>{{ orderInfo.createTime }}</span>
      </div>

      <!-- 添加商品详细信息 -->
      <div class="good-detail" v-if="orderInfo.goodInfo">
        <h3>商品信息</h3>
        <div class="good-info">
          <LazyImage
            :src="orderInfo.goodInfo.image"
            :alt="orderInfo.goodInfo.name"
            style="width: 100px; height: 100px; border-radius: 4px"
          />
          <div class="good-content">
            <div class="info-row">
              <span class="label">商品名称：</span>
              <span>{{ orderInfo.goodInfo.name }}</span>
            </div>
            <div class="info-row">
              <span class="label">商品单价：</span>
              <span>¥{{ orderInfo.goodInfo.price }}</span>
            </div>
            <div class="info-row">
              <span class="label">购买数量：</span>
              <span>{{ orderInfo.goodInfo.quantity }}</span>
            </div>
            <div class="info-row">
              <span class="label">商品总价：</span>
              <span class="total-price"
                >¥{{ orderInfo.goodInfo.totalPrice }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载失败状态 -->
    <div v-else class="empty-state">
      <el-empty description="未找到订单信息" />
    </div>
  </div>
</template>

<style scoped>
.order-detail {
  padding: 20px;
  background-color: #fff;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.order-info {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.info-item {
  margin-bottom: 15px;
  line-height: 24px;
}

.label {
  font-weight: bold;
  margin-right: 10px;
  color: #606266;
  width: 100px;
  display: inline-block;
}

.good-detail {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.good-detail h3 {
  margin-bottom: 15px;
  font-size: 16px;
  color: #303133;
}

.good-info {
  display: flex;
  gap: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.good-content {
  flex: 1;
}

.info-row {
  margin-bottom: 10px;
  line-height: 24px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.total-price {
  color: #f56c6c;
  font-weight: bold;
}
</style>
