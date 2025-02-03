import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'normalize.css'
import './assets/css/base.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// 导入 Element Plus 样式
import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
// 按需导入 Element Plus 组件
import { 
  ElButton,
  ElTable,
  ElForm,
  ElInput,
  ElMessage,
  ElMessageBox
} from 'element-plus'

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(router)
app.use(ElementPlus)
app.use(pinia)

const components = [
  ElButton,
  ElTable,
  ElForm,
  ElInput
]

// 注册组件
components.forEach(component => {
  app.use(component)
})

// 注册全局方法
app.config.globalProperties.$message = ElMessage
app.config.globalProperties.$confirm = ElMessageBox.confirm

app.mount('#app')
