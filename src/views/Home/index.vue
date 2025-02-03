<script setup>
import { ref } from 'vue'

const systemInfo = ref({
  name: '商品采购系统',
  version: 'v1.0.0',
  description: '基于 Vue 3 + Element Plus 的后台管理系统',
  features: [
    {
      title: '商品管理',
      desc: '商品增删改查、分类管理、库存管理'
    },
    {
      title: '订单管理',
      desc: '订单状态流转、订单详情查看'
    },
    {
      title: '用户管理',
      desc: '用户状态管理、批量操作'
    },
    {
      title: '权限管理',
      desc: '管理员账户管理、角色分配'
    }
  ],
  techStack: [
    {
      category: '核心技术',
      items: [
        'Vue 3 组合式 API',
        'Vue Router 路由管理',
        'Pinia 状态管理',
        'Element Plus 组件库'
      ]
    },
    {
      category: '性能优化',
      items: [
        '路由懒加载',
        '组件按需加载',
        '图片懒加载',
        '虚拟列表',
        '数据本地缓存'
      ]
    },
    {
      category: '工程化',
      items: [
        'Vite 构建工具',
        'ESLint 代码规范',
        'Prettier 代码格式化',
        'Git 版本控制',
        'TypeScript 类型检查'
      ]
    },
    {
      category: '项目亮点',
      items: [
        '权限控制系统',
        '错误处理机制',
        '数据可视化',
        'Mock 数据模拟',
        '单元测试'
      ]
    }
  ]
})
</script>

<template>
  <div class="home-container">
    <div class="welcome-section">
      <h1>{{ systemInfo.name }}</h1>
      <p class="version">{{ systemInfo.version }}</p>
      <p class="description">{{ systemInfo.description }}</p>
    </div>

    <div class="features-section">
      <h2>系统功能</h2>
      <div class="features-grid">
        <el-card v-for="feature in systemInfo.features" :key="feature.title" class="feature-card">
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.desc }}</p>
        </el-card>
      </div>
    </div>

    <div class="tech-section">
      <h2>技术选型</h2>
      <div class="tech-grid">
        <el-card v-for="tech in systemInfo.techStack" :key="tech.category" class="tech-card">
          <template #header>
            <div class="tech-header">
              {{ tech.category }}
            </div>
          </template>
          <div class="tech-items">
            <el-tag
              v-for="item in tech.items"
              :key="item"
              class="tech-tag"
            >
              {{ item }}
            </el-tag>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  padding: 20px;
  background-color: #fff;
}

.welcome-section {
  text-align: center;
  padding: 40px 0;
}

.welcome-section h1 {
  font-size: 32px;
  color: #303133;
  margin-bottom: 10px;
}

.version {
  color: #909399;
  margin-bottom: 20px;
}

.description {
  color: #606266;
  font-size: 16px;
}

.features-section,
.tech-section {
  margin-top: 40px;
}

h2 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 20px;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.feature-card {
  height: 100%;
}

.feature-card h3 {
  color: #303133;
  margin-bottom: 10px;
}

.feature-card p {
  color: #606266;
  line-height: 1.6;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.tech-card {
  height: 100%;
}

.tech-header {
  font-weight: bold;
  color: #303133;
}

.tech-items {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tech-tag {
  margin: 5px;
}

:deep(.el-card__header) {
  padding: 15px 20px;
  border-bottom: 1px solid #EBEEF5;
}

:deep(.el-card__body) {
  padding: 20px;
}
</style>
