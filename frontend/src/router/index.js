import { createRouter, createWebHistory } from 'vue-router'
import GenerateAndRedeem from '../views/GenerateAndRedeem.vue'
import History from '../views/History.vue'
import Login from '../views/Login.vue'
import EmployeePerformance from '../views/EmployeePerformance.vue'
import EmployeeRoster from '../views/EmployeeRoster.vue'
import { isLoggedIn, isAdmin } from '../utils/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'GenerateAndRedeem',
    component: GenerateAndRedeem,
    meta: { requiresAuth: true }
  },
  {
    path: '/history',
    name: 'History',
    component: History,
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'UserManagement',
    component: () => import('../views/UserManagement.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/performance',
    name: 'EmployeePerformance',
    component: EmployeePerformance,
    meta: { requiresAuth: true }
  },
  {
    path: '/roster',
    name: 'EmployeeRoster',
    component: EmployeeRoster,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 如果路由不需要认证，直接放行
  if (!to.meta.requiresAuth) {
    next()
    return
  }

  // 检查是否已登录
  if (!isLoggedIn()) {
    next('/login')
    return
  }

  // 检查是否需要管理员权限
  if (to.meta.requiresAdmin && !isAdmin()) {
    next('/')
    return
  }

  // 其他情况，放行
  next()
})

export default router