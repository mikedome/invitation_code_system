<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <!-- 页面标题已在App.vue中显示，此处不再重复 -->
      </div>
    </template>
    
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="邀请码" prop="code">
        <el-input 
          v-model="form.code" 
          placeholder="请输入16位邀请码"
          maxlength="16"
          show-word-limit
        ></el-input>
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="redeemCode" :loading="loading">核销邀请码</el-button>
      </el-form-item>
    </el-form>
    
    <div v-if="redeemResult" class="redeem-result" :class="redeemResult.success ? 'success' : 'error'">
      <h3>{{ redeemResult.success ? '核销成功' : '核销失败' }}</h3>
      <p>{{ redeemResult.message }}</p>
      <el-button type="info" @click="resetResult" class="reset-btn">重置</el-button>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'RedeemCode',
  data() {
    return {
      form: {
        code: ''
      },
      rules: {
        code: [
          { required: true, message: '请输入邀请码', trigger: 'blur' },
          { pattern: /^[A-Za-z0-9]{16}$/, message: '邀请码必须是16位字母数字组合', trigger: 'blur' }
        ]
      },
      loading: false,
      redeemResult: null
    }
  },
  methods: {
    // 获取当前登录用户信息
    getCurrentUser() {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        return JSON.parse(userStr)
      }
      return null
    },
    
    async redeemCode() {
      await this.$refs.formRef.validate(async (valid) => {
        if (valid) {
          this.loading = true
          try {
            // 获取当前登录用户
            const response = await this.$axios.post('/redeem', {
              code: this.form.code
            })
            
            if (response.data.success) {
              this.redeemResult = {
                success: true,
                message: response.data.message
              }
              this.$message.success(response.data.message)
            } else {
              this.redeemResult = {
                success: false,
                message: response.data.message
              }
              this.$message.error(response.data.message)
            }
          } catch (error) {
            console.error('核销邀请码失败:', error)
            this.redeemResult = {
              success: false,
              message: '核销失败，请稍后重试'
            }
            this.$message.error('核销失败，请稍后重试')
          } finally {
            this.loading = false
          }
        }
      })
    },
    resetResult() {
      this.redeemResult = null
      this.form.code = ''
      this.$refs.formRef.resetFields()
    }
  }
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.redeem-result {
  margin-top: 20px;
  padding: 15px;
  border-radius: 4px;
}

.redeem-result.success {
  background-color: #f0f9eb;
  border: 1px solid #c2e7b0;
  color: #67c23a;
}

.redeem-result.error {
  background-color: #fef0f0;
  border: 1px solid #fbc4ab;
  color: #f56c6c;
}

.redeem-result h3 {
  margin-bottom: 10px;
}

.reset-btn {
  margin-top: 10px;
}
</style>