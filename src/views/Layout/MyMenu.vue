<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps({
  isClose: {
    type: Boolean,
    default: false
  }
})

const isCollapse = computed(() => props.isClose)

const handleSelect = (key) => {
  router.push(key)
}

const menuItems = [
  {
    icon: 'House',
    title: '系统首页',
    index: '/'
  },
  {
    icon: 'ShoppingCart',
    title: '商品管理',
    index: '/goods',
    children: [
      {
        title: '商品列表',
        index: '/goods/goodlist'
      },
      {
        title: '商品分类',
        index: '/goods/category'
      }
    ]
  },
  {
    icon: 'List',
    title: '订单管理',
    index: '/orders',
    children: [
      {
        title: '订单列表',
        index: '/orders/orderlist'
      }
    ]
  },
  {
    icon: 'User',
    title: '用户管理',
    index: '/users'
  },
  {
    icon: 'Setting',
    title: '权限管理',
    index: '/permissions'
  },
  {
    icon: 'DataLine', // 添加数据分析图标
    title: '数据分析',
    index: '/analysis'
  }
]
</script>

<template>
  <div class="menu">
    <div class="logo">
      <span v-show="!isCollapse">商品采购系统</span>
    </div>
    <el-menu
      :default-active="$route.path"
      class="el-menu-vertical"
      :collapse="isCollapse"
      @select="handleSelect"
      background-color="#112f50"
      text-color="#fff"
      active-text-color="#ffd04b"
    >
      <template v-for="item in menuItems" :key="item.index">
        <!-- 没有子菜单的项目 -->
        <el-menu-item v-if="!item.children" :index="item.index">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>

        <!-- 有子菜单的项目 -->
        <el-sub-menu v-else :index="item.index">
          <template #title>
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </template>
          <el-menu-item
            v-for="subItem in item.children"
            :key="subItem.index"
            :index="subItem.index"
          >
            {{ subItem.title }}
          </el-menu-item>
        </el-sub-menu>
      </template>
    </el-menu>
  </div>
</template>

<style scoped>
.menu {
  height: 100%;
  background-color: #112f50;
}

.logo {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  color: white;
  font-size: 16px;
  font-weight: bold;
  background-color: #112f50;
}

.el-menu {
  border-right: none;
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}

:deep(.el-sub-menu__title) {
  color: #fff !important;
}

:deep(.el-menu-item) {
  color: #fff !important;
}

:deep(.el-menu-item.is-active) {
  background-color: #1e78bf !important;
  color: #ffd04b !important;
}

:deep(.el-sub-menu__title:hover),
:deep(.el-menu-item:hover) {
  background-color: #1e78bf !important;
}
</style>
