<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const goBack = () => {
  router.go(-1)
}

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="error-page">
    <div class="error-code">404</div>
    <div class="error-desc">抱歉，你访问的页面不存在</div>
    <div class="error-actions">
      <el-button type="primary" @click="goBack">返回上一页</el-button>
      <el-button @click="goHome">回到首页</el-button>
    </div>
  </div>
</template>

<style scoped>
.error-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.error-code {
  font-size: 120px;
  color: #409EFF;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.error-desc {
  font-size: 24px;
  color: #606266;
  margin-bottom: 30px;
}

.error-actions {
  display: flex;
  gap: 20px;
}
</style> 