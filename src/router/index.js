import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/views/Layout/Layout.vue'
import { useUserStore } from '@/stores/user'
import NotFound from '@/views/error/404.vue'
import Forbidden from '@/views/error/403.vue'
import ServerError from '@/views/error/500.vue'

const Goods = () => import('@/views/Goods/index.vue')
const GoodsList = () => import('@/views/Goods/GoodsList.vue')
const Category = () => import('@/views/Goods/Category.vue')

const Login = () => import('@/views/Login/Login.vue')
const Home = () => import('@/views/Home/index.vue')
const User = () => import('@/views/Users/index.vue')
const Permission = () => import('@/views/Permissions/index.vue')

const Orders = () => import('@/views/Order/index.vue')
const Orderlist = () => import('@/views/Order/OrderList.vue')
const OrderDetails = () => import('@/views/Order/OrderDetails.vue')

const Analysis = () => import('@/views/Analysis/index.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/',
      component: Layout,
      children:[
        {
          path:'/',
          name:'home',
          component:Home,
        },
        {
          path:'/goods',
          name:'goods',
          component:Goods,
          children:
          [
            {
              path:'goodlist',
              name:'goodlist',
              component:GoodsList,
            },
            {
              path:'category',
              name:'category',
              component:Category,
            }
          ]
        },
        {
          path:'/users',
          name:'users',
          component:User,
        },
        {
          path:'/permissions',
          name:'permissions',
          component:Permission,
        },
        {
          path:'/orders',
          name:'orders',
          component:Orders,
          children:
          [
            {
              path:'orderlist',
              name:'orderlist',
              component:Orderlist,
            },
            {
              path:'orderdetail',
              name:'orderdetail',
              component:OrderDetails,
            }
          ]
        },
        {
          path:'/analysis',
          name:'analysis',
          component: Analysis,
        }
      ]
    },
    {
      path: '/403',
      name: '403',
      component: Forbidden
    },
    {
      path: '/500',
      name: '500',
      component: ServerError
    },
    {
      path: '/:pathMatch(.*)*',
      name: '404',
      component: NotFound
    }
  ],
})

// 添加导航守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.path === '/login') {
    next()
    return
  }
  
  if (!userStore.token) {
    next('/login')
    return
  }
  
  next()
})

const routeNameMap = {
  '/': '系统首页',
  '/goods/goodlist': '商品管理/商品列表',
  '/goods/category': '商品管理/商品分类',
  '/orders/orderlist': '订单管理/订单列表',
  '/orders/orderdetail': '订单管理/订单详情',
  '/users': '用户管理/用户列表',
  '/permissions': '权限管理',
  '/analysis': '数据分析'
}

export default router
