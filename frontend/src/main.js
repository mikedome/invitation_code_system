import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import axios from 'axios'
import router from './router'
import { ElMessage } from 'element-plus'
import { setupAxiosInterceptors } from './utils/auth'

const app = createApp(App)

// 配置Axios
axios.defaults.baseURL = '/api'
// 应用Axios拦截器
setupAxiosInterceptors(axios)
app.config.globalProperties.$axios = axios
app.config.globalProperties.$message = ElMessage

app.use(ElementPlus)
app.use(router)
app.mount('#app')
