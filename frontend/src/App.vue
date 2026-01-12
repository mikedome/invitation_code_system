<template>
  <!-- 登录页面直接渲染，不包含公共布局 -->
  <router-view v-if="route.path === '/login'" />
  
  <!-- 其他页面包含公共布局 -->
  <div v-else class="app-container">
    <!-- 顶部导航 -->
    <div class="app-header">
      <div class="header-content">
        <div class="logo-section">
          <el-icon class="logo-icon"><Ticket /></el-icon>
          <h1 class="app-title">邀请码生成系统</h1>
        </div>
        <div class="header-actions">
          <el-dropdown trigger="click">
            <span class="user-info">
              <el-icon><User /></el-icon>
              {{ user?.username }}
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
    
    <!-- 主要内容区域 -->
    <div class="app-body">
      <!-- 左侧导航菜单 -->
      <nav class="sidebar">
        <el-menu
          :default-active="activeMenu"
          class="nav-menu"
          @select="handleMenuSelect"
          background-color="transparent"
          text-color="#606266"
          active-text-color="#fff"
        >
          <el-menu-item index="/">
            <el-icon class="menu-icon"><Plus /></el-icon>
            <span class="menu-text">生成/核销</span>
          </el-menu-item>
          <el-menu-item index="/history">
            <el-icon class="menu-icon"><Document /></el-icon>
            <span class="menu-text">历史记录</span>
          </el-menu-item>
          <el-menu-item index="/performance">
            <el-icon class="menu-icon"><TrendCharts /></el-icon>
            <span class="menu-text">员工绩效</span>
          </el-menu-item>
          <!-- 只有管理员可以看到员工花名册菜单 -->
          <el-menu-item index="/roster" v-if="user?.role === 'admin'">
            <el-icon class="menu-icon"><UserFilled /></el-icon>
            <span class="menu-text">员工花名册</span>
          </el-menu-item>
          <!-- 只有管理员可以看到用户管理菜单 -->
          <el-menu-item index="/users" v-if="user?.role === 'admin'">
            <el-icon class="menu-icon"><Setting /></el-icon>
            <span class="menu-text">用户管理</span>
          </el-menu-item>
        </el-menu>
      </nav>
      
      <!-- 右侧内容区域 -->
      <main class="content-wrapper">
        <div class="content-header">
          <h2 class="content-title">{{ currentTitle }}</h2>
        </div>
        <div class="content-body">
          <router-view />
        </div>
      </main>
    </div>
    
    <!-- 底部信息 -->
    <footer class="app-footer">
      <div class="footer-content">
        <span>邀请码生成系统 © 2026</span>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus, Document, Check, Ticket, User, Setting, ArrowDown, TrendCharts, UserFilled } from '@element-plus/icons-vue'
import { getCurrentUser, logout } from './utils/auth'

export default {
  name: 'App',
  components: {
    Plus,
    Document,
    Check,
    Ticket,
    User,
    Setting,
    ArrowDown,
    TrendCharts,
    UserFilled
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const user = ref(null)
    
    // 初始化用户信息
    const initUserInfo = () => {
      user.value = getCurrentUser()
    }
    
    const activeMenu = computed(() => {
      return route.path
    })
    
    // 根据当前路由计算页面标题
    const currentTitle = computed(() => {
      const titleMap = {
        '/': '生成/核销',
        '/history': '历史记录',
        '/users': '用户管理',
        '/performance': '员工绩效',
        '/roster': '员工花名册',
        '/redeemers': '核销人员管理'
      }
      return titleMap[route.path] || '邀请码生成系统'
    })
    
    const handleMenuSelect = (key) => {
      router.push(key)
    }
    
    // 退出登录
    const handleLogout = () => {
      logout()
      router.push('/login')
    }
    
    onMounted(() => {
      initUserInfo()
    })
    
    return {
      route,
      user,
      activeMenu,
      currentTitle,
      handleMenuSelect,
      logout: handleLogout
    }
  }
}
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: #303133;
  line-height: 1.6;
}

/* 应用容器 */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 1600px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.1);
}

/* 头部样式 */
.app-header {
  background: white;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
  padding: 0 40px;
  height: 72px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e8e8e8;
}

.header-content {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    background-color: rgba(102, 126, 234, 0.1);
    color: #667eea;
  }

.logo-icon {
  font-size: 32px;
  color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-title {
  font-size: 22px;
  font-weight: 700;
  color: #303133;
  margin: 0;
  letter-spacing: 0.5px;
}

/* 主体内容区域 */
.app-body {
  display: flex;
  flex: 1;
  min-height: calc(100vh - 122px);
}

/* 左侧侧边栏 */
.sidebar {
  width: 240px;
  background: white;
  border-right: 1px solid #e8e8e8;
  padding: 20px 0;
  flex-shrink: 0;
}

/* 导航菜单 */
.nav-menu {
  border-right: none;
  background: transparent;
}

.nav-menu .el-menu-item {
  height: 56px;
  line-height: 56px;
  font-size: 15px;
  font-weight: 500;
  margin: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: #606266;
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.nav-menu .el-menu-item:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transform: translateX(4px);
}

.nav-menu .el-menu-item.is-active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.menu-icon {
  font-size: 20px;
  margin-right: 12px;
  flex-shrink: 0;
}

.menu-text {
  flex: 1;
}

/* 右侧内容区域 */
.content-wrapper {
  flex: 1;
  padding: 30px;
  background: #f5f7fa;
  overflow-y: auto;
}

.content-header {
  margin-bottom: 24px;
}

.content-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #667eea;
  display: inline-block;
}

.content-body {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

/* 卡片样式优化 */
.el-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: none;
  margin-bottom: 24px;
}

.el-card__header {
  background: #fafafa;
  border-bottom: 1px solid #e8e8e8;
  border-radius: 12px 12px 0 0;
  padding: 20px;
  font-weight: 600;
  color: #303133;
}

.el-card__header .el-card__title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* 按钮样式优化 */
.el-button {
  border-radius: 6px;
  font-weight: 500;
  padding: 10px 20px;
  font-size: 14px;
}

.el-button--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

/* 输入框样式优化 */
.el-input__wrapper {
  border-radius: 6px;
  background: white;
}

/* 表格样式优化 */
.el-table {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e8e8e8;
}

.el-table__header-wrapper {
  background: #fafafa;
}

.el-table th {
  background: transparent !important;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #e8e8e8;
  padding: 12px 0;
}

.el-table td {
  border-bottom: 1px solid #f0f0f0;
  padding: 12px 0;
  color: #606266;
}

.el-table--striped .el-table__body tr.el-table__row--striped td {
  background: #fafafa;
}

/* 分页样式优化 */
.el-pagination {
  margin-top: 20px;
  text-align: right;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

/* 表单样式优化 */
.el-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-form-item__label {
  font-weight: 500;
  color: #303133;
}

/* 底部样式 */
.app-footer {
  background: white;
  border-top: 1px solid #e8e8e8;
  padding: 20px 40px;
  text-align: center;
  color: #606266;
  font-size: 14px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-content {
  width: 100%;
}

/* 生成邀请码页面样式 */
.generate-code-container {
  /* 移除固定宽度限制，使用默认宽度 */
}

.code-result {
  margin-top: 24px;
  padding: 20px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 8px;
  text-align: center;
}

.code-result h3 {
  margin-bottom: 16px;
  color: #52c41a;
  font-size: 18px;
  font-weight: 600;
}

.code-input {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  letter-spacing: 1px;
}

/* 历史记录页面样式 */
.search-form {
  margin-bottom: 24px;
  padding: 20px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
}

.search-form .el-form-item {
  margin-right: 16px;
}

/* 核销页面样式 */
.redeem-code-container {
  /* 移除固定宽度限制，使用默认宽度 */
}

.redeem-result {
  margin-top: 24px;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.redeem-result.success {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  color: #52c41a;
}

.redeem-result.error {
  background: #fff1f0;
  border: 1px solid #ffccc7;
  color: #ff4d4f;
}

.redeem-result h3 {
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .sidebar {
    width: 200px;
  }
  
  .app-header {
    padding: 0 24px;
  }
  
  .content-wrapper {
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .app-body {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e8e8e8;
    padding: 10px 0;
  }
  
  .nav-menu {
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
  }
  
  .nav-menu .el-menu-item {
    margin: 8px;
    white-space: nowrap;
    min-width: 120px;
    justify-content: center;
  }
  
  .app-header {
    padding: 0 16px;
    height: 64px;
  }
  
  .app-title {
    font-size: 18px;
  }
  
  .logo-icon {
    font-size: 24px;
  }
  
  .content-wrapper {
    padding: 16px;
  }
  
  .content-header {
    margin-bottom: 16px;
  }
  
  .content-title {
    font-size: 20px;
  }
  
  .content-body {
    padding: 16px;
  }
}

/* 保留导航栏的动态效果 */</style>
