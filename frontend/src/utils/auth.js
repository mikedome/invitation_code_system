// 认证工具函数

// 获取当前登录用户
export function getCurrentUser() {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    return JSON.parse(userStr)
  }
  return null
}

// 获取认证令牌
export function getToken() {
  return localStorage.getItem('token')
}

// 检查是否已登录
export function isLoggedIn() {
  return !!getToken()
}

// 检查用户是否为管理员
export function isAdmin() {
  const user = getCurrentUser()
  return user && user.role === 'admin'
}

// 登录
export function login(token, user) {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

// 登出
export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.reload()
}

// 配置Axios拦截器，自动添加认证令牌
export function setupAxiosInterceptors(axios) {
  // 请求拦截器
  axios.interceptors.request.use(
    config => {
      const token = getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    error => {
      return Promise.reject(error)
    }
  )

  // 响应拦截器
  axios.interceptors.response.use(
    response => {
      return response
    },
    error => {
      // 处理401错误
      if (error.response && error.response.status === 401) {
        logout()
      }
      return Promise.reject(error)
    }
  )
}