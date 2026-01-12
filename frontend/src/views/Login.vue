<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>登录</h2>
        </div>
      </template>
      
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="form.username" 
            placeholder="请输入用户名"
            clearable
          ></el-input>
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码"
            show-password
          ></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="login" :loading="loading" class="login-btn">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const instance = getCurrentInstance()
    const $axios = instance.appContext.config.globalProperties.$axios
    const formRef = ref(null)
    const loading = ref(false)
    
    const form = reactive({
      username: '',
      password: ''
    })
    
    const rules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' }
      ]
    }
    
    const login = async () => {
      await formRef.value.validate(async (valid) => {
        if (valid) {
          loading.value = true
          try {
            // 注意：axios.defaults.baseURL 已经设置为 'http://localhost:3000/api'，所以只需要 '/login' 即可
            const response = await $axios.post('/login', {
              username: form.username,
              password: form.password
            })
            
            if (response.data.success) {
              // 保存登录信息到localStorage
              localStorage.setItem('token', response.data.data.token)
              localStorage.setItem('user', JSON.stringify(response.data.data))
              
              // 跳转到首页
              router.push('/')
            } else {
              ElMessage.error(response.data.message)
            }
          } catch (error) {
            console.error('登录失败:', error)
            ElMessage.error('登录失败，请稍后重试')
          } finally {
            loading.value = false
          }
        }
      })
    }
    
    return {
      formRef,
      form,
      rules,
      loading,
      login
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: url('/login-bg.jpg') no-repeat center center;
  background-size: cover;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
  background: white;
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.login-btn {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  font-weight: 500;
}
</style>