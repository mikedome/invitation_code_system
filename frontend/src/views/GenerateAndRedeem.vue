<template>
  <el-card class="combined-card">
    <template #header>
      <div class="card-header">
        <!-- 页面标题已在App.vue中显示，此处不再重复 -->
      </div>
    </template>
    
    <el-tabs v-model="activeTab" type="card">
      <!-- 生成邀请码标签页 -->
      <el-tab-pane label="生成邀请码" name="generate">
        <el-form ref="generateFormRef" :model="generateForm" :rules="generateRules" label-width="120px">
          <el-form-item label="员工编号" prop="employeeId">
            <el-input 
              v-model="generateForm.employeeId" 
              placeholder="请输入4位员工编号（如0001）"
              maxlength="4"
              show-word-limit
            ></el-input>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="generateCode" :loading="generateLoading">生成邀请码</el-button>
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
      </el-tab-pane>
      
      <!-- 核销邀请码标签页 -->
      <el-tab-pane label="核销邀请码" name="redeem">
        <el-form ref="redeemFormRef" :model="redeemForm" :rules="redeemRules" label-width="120px">
          <el-form-item label="邀请码" prop="code">
            <el-input 
              v-model="redeemForm.code" 
              placeholder="请输入16位邀请码"
              maxlength="16"
              show-word-limit
            ></el-input>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="redeemCode" :loading="redeemLoading">核销邀请码</el-button>
          </el-form-item>
        </el-form>
        
        <div v-if="redeemResult" class="redeem-result" :class="redeemResult.success ? 'success' : 'error'">
          <h3>{{ redeemResult.success ? '核销成功' : '核销失败' }}</h3>
          <p>{{ redeemResult.message }}</p>
          <el-button type="info" @click="resetRedeemResult" class="reset-btn">重置</el-button>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

// 创建API请求实例
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// 添加请求拦截器，自动添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default {
  name: 'GenerateAndRedeem',
  setup() {
    // 当前激活的标签页
    const activeTab = ref('generate');
    
    // 生成邀请码相关
    const generateForm = reactive({
      employeeId: ''
    });
    
    const generateRules = {
      employeeId: [
        { required: true, message: '请输入员工编号', trigger: 'blur' },
        { pattern: /^\d{4}$/, message: '员工编号必须是4位数字', trigger: 'blur' }
      ]
    };
    
    const generateLoading = ref(false);
    const generatedCode = ref('');
    
    // 核销邀请码相关
    const redeemForm = reactive({
      code: ''
    });
    
    const redeemRules = {
      code: [
        { required: true, message: '请输入邀请码', trigger: 'blur' },
        { pattern: /^[A-Za-z0-9]{16}$/, message: '邀请码必须是16位字母数字组合', trigger: 'blur' }
      ]
    };
    
    const redeemLoading = ref(false);
    const redeemResult = ref(null);
    
    // 生成邀请码方法
    const generateFormRef = ref(null);
    const generateCode = async () => {
      await generateFormRef.value.validate(async (valid) => {
        if (valid) {
          generateLoading.value = true;
          try {
            const response = await api.post('/generate', {
              employee_id: generateForm.employeeId
            });
            
            if (response.data.success) {
              generatedCode.value = response.data.data.code;
              ElMessage.success('邀请码生成成功');
            } else {
              ElMessage.error(response.data.message);
            }
          } catch (error) {
            console.error('生成邀请码失败:', error);
            ElMessage.error('生成邀请码失败，请稍后重试');
          } finally {
            generateLoading.value = false;
          }
        }
      });
    };
    
    // 复制邀请码
    const copyCode = async () => {
      try {
        await navigator.clipboard.writeText(generatedCode.value);
        ElMessage.success('邀请码已复制到剪贴板');
      } catch (error) {
        console.error('复制失败:', error);
        ElMessage.error('复制失败，请手动复制');
      }
    };
    
    // 核销邀请码方法
    const redeemFormRef = ref(null);
    const redeemCode = async () => {
      await redeemFormRef.value.validate(async (valid) => {
        if (valid) {
          redeemLoading.value = true;
          try {
            const response = await api.post('/redeem', {
              code: redeemForm.code
            });
            
            if (response.data.success) {
              redeemResult.value = {
                success: true,
                message: response.data.message
              };
              ElMessage.success(response.data.message);
            } else {
              redeemResult.value = {
                success: false,
                message: response.data.message
              };
              ElMessage.error(response.data.message);
            }
          } catch (error) {
            console.error('核销邀请码失败:', error);
            redeemResult.value = {
              success: false,
              message: '核销失败，请稍后重试'
            };
            ElMessage.error('核销失败，请稍后重试');
          } finally {
            redeemLoading.value = false;
          }
        }
      });
    };
    
    // 重置核销结果
    const resetRedeemResult = () => {
      redeemResult.value = null;
      redeemForm.code = '';
      if (redeemFormRef.value) {
        redeemFormRef.value.resetFields();
      }
    };
    
    return {
      activeTab,
      // 生成相关
      generateForm,
      generateRules,
      generateLoading,
      generatedCode,
      generateFormRef,
      generateCode,
      copyCode,
      // 核销相关
      redeemForm,
      redeemRules,
      redeemLoading,
      redeemResult,
      redeemFormRef,
      redeemCode,
      resetRedeemResult
    };
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

.copy-btn {
  margin-top: 10px;
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

.reset-btn {
  margin-top: 10px;
}

.combined-card {
  min-height: 400px;
}
</style>