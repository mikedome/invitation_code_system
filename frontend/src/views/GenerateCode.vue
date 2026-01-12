<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <!-- 页面标题已在App.vue中显示，此处不再重复 -->
      </div>
    </template>
    
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="员工编号" prop="employeeId">
        <el-input 
          v-model="form.employeeId" 
          placeholder="请输入4位员工编号（如0001）"
          maxlength="4"
          show-word-limit
        ></el-input>
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="generateCode" :loading="loading">生成邀请码</el-button>
      </el-form-item>
    </el-form>
    
    <div v-if="generatedCode" class="code-result">
      <h3>生成结果</h3>
      <el-input 
        v-model="generatedCode" 
        readonly 
        class="code-input"
      ></el-input>
      <el-button type="success" @click="copyCode" class="copy-btn">复制邀请码</el-button>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'GenerateCode',
  data() {
    return {
      form: {
        employeeId: ''
      },
      rules: {
        employeeId: [
          { required: true, message: '请输入员工编号', trigger: 'blur' },
          { pattern: /^\d{4}$/, message: '员工编号必须是4位数字', trigger: 'blur' }
        ]
      },
      generatedCode: '',
      loading: false
    }
  },
  methods: {
    async generateCode() {
      await this.$refs.formRef.validate(async (valid) => {
        if (valid) {
          this.loading = true
          try {
            const response = await this.$axios.post('/generate', {
              employee_id: this.form.employeeId
            })
            
            if (response.data.success) {
              this.generatedCode = response.data.data.code
              this.$message.success('邀请码生成成功')
            } else {
              this.$message.error(response.data.message)
            }
          } catch (error) {
            console.error('生成邀请码失败:', error)
            this.$message.error('生成邀请码失败，请稍后重试')
          } finally {
            this.loading = false
          }
        }
      })
    },
    async copyCode() {
      try {
        await navigator.clipboard.writeText(this.generatedCode)
        this.$message.success('邀请码已复制到剪贴板')
      } catch (error) {
        console.error('复制失败:', error)
        this.$message.error('复制失败，请手动复制')
      }
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

.code-result {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.code-result h3 {
  margin-bottom: 10px;
  color: #303133;
}

.code-input {
  margin-bottom: 10px;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

.copy-btn {
  margin-top: 10px;
}
</style>