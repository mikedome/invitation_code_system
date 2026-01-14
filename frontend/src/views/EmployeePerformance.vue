<template>
  <el-card class="performance-card">
    <template #header>
      <div class="card-header">
        <!-- 页面标题已在App.vue中显示，此处不再重复 -->
      </div>
    </template>
    
    <div class="filter-section">
      <el-form :model="filterForm" inline>
        <el-form-item label="开始日期">
          <el-input
            v-model="filterForm.startDate"
            type="date"
            placeholder="选择开始日期"
            @change="fetchPerformanceData"
          />
        </el-form-item>
        <el-form-item label="结束日期">
          <el-input
            v-model="filterForm.endDate"
            type="date"
            placeholder="选择结束日期"
            @change="fetchPerformanceData"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="resetFilter">重置</el-button>
          <el-button @click="showHistoricalOverview">历史总览</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <div v-if="!showHistoricalView">
      <el-table 
        :data="performanceList" 
        v-loading="loading"
        style="width: 100%"
        stripe
      >
        <el-table-column prop="employee_id" label="员工编号" width="120" />
        <el-table-column prop="employee_name" label="员工姓名" width="150" />
        <el-table-column prop="redemption_count" label="核销数量" width="120">
          <template #default="{ row }">
            <span class="redemption-count">{{ row.redemption_count }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="rank" label="排名" width="80">
          <template #default="{ row }">
            <el-tag 
              :type="getRankType(row.rank)" 
              size="small"
            >
              第{{ row.rank }}名
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="performance_score" label="绩效评分" width="120">
          <template #default="{ row }">
            <el-progress 
              :percentage="row.performance_score" 
              :color="getScoreColor(row.performance_score)"
              :format="formatScore"
            />
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="更新时间" width="180" />
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
        />
      </div>
    </div>
    
    <div v-else>
      <div class="historical-header">
        <h3>历史绩效总览</h3>
        <el-button @click="exitHistoricalView" size="small">返回</el-button>
      </div>
      
      <el-table 
        :data="historicalList" 
        v-loading="loading"
        style="width: 100%"
        stripe
      >
        <el-table-column prop="month" label="月份" width="120" />
        <el-table-column prop="employee_id" label="员工编号" width="120" />
        <el-table-column prop="employee_name" label="员工姓名" width="150" />
        <el-table-column prop="redemption_count" label="核销数量" width="120">
          <template #default="{ row }">
            <span class="redemption-count">{{ row.redemption_count }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="rank" label="排名" width="80">
          <template #default="{ row }">
            <el-tag 
              :type="getRankType(row.rank)" 
              size="small"
            >
              第{{ row.rank }}名
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="performance_score" label="绩效评分" width="120">
          <template #default="{ row }">
            <el-progress 
              :percentage="row.performance_score" 
              :color="getScoreColor(row.performance_score)"
              :format="formatScore"
            />
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="更新时间" width="180" />
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          @size-change="(val) => {
            historicalPagination.pageSize = val;
            historicalPagination.currentPage = 1;
            showHistoricalOverview();
          }"
          @current-change="(val) => {
            historicalPagination.currentPage = val;
            showHistoricalOverview();
          }"
          :current-page="historicalPagination.currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="historicalPagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="historicalPagination.total"
        />
      </div>
    </div>
  </el-card>
</template>

<script>
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

// 创建API请求实例
const api = axios.create({
  baseURL: '/api',
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
  name: 'EmployeePerformance',
  setup() {
    const loading = ref(false)
    const calculationLoading = ref(false)
    const performanceList = ref([])
    const historicalList = ref([])
    const showHistoricalView = ref(false)
    
    const filterForm = reactive({
      startDate: '',
      endDate: ''
    })
    
    const pagination = reactive({
      currentPage: 1,
      pageSize: 10,
      total: 0
    })
    
    const historicalPagination = reactive({
      currentPage: 1,
      pageSize: 10,
      total: 0
    })
    
    // 获取绩效数据
    const fetchPerformanceData = async () => {
      loading.value = true
      try {
        const params = {
          page: pagination.currentPage,
          pageSize: pagination.pageSize
        }
        
        // 如果选择了开始和结束日期，则添加到参数中
        if (filterForm.startDate && filterForm.endDate) {
          params.startDate = filterForm.startDate;
          params.endDate = filterForm.endDate;
        }
        
        const response = await api.get('/performance', { params })
        
        if (response.data.success) {
          performanceList.value = response.data.data.list
          pagination.total = response.data.data.total
        } else {
          ElMessage.error(response.data.message)
        }
      } catch (error) {
        console.error('获取绩效数据失败:', error)
        ElMessage.error('获取绩效数据失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
    
    // 重置筛选条件
    const resetFilter = () => {
      filterForm.startDate = ''
      filterForm.endDate = ''
      pagination.currentPage = 1
      fetchPerformanceData()
    }
    
    // 处理分页大小变化
    const handleSizeChange = (val) => {
      pagination.pageSize = val
      pagination.currentPage = 1
      fetchPerformanceData()
    }
    
    // 处理当前页变化
    const handleCurrentChange = (val) => {
      pagination.currentPage = val
      fetchPerformanceData()
    }
    
    // 根据排名返回标签类型
    const getRankType = (rank) => {
      if (rank === 1) return 'warning'
      if (rank <= 3) return 'success'
      if (rank <= 10) return 'primary'
      return 'info'
    }
    
    // 根据分数返回进度条颜色
    const getScoreColor = (score) => {
      if (score >= 80) return '#67C23A' // 绿色
      if (score >= 60) return '#E6A23C' // 黄色
      return '#F56C6C' // 红色
    }
    
    // 格式化分数显示
    const formatScore = (percentage) => `${percentage}分`
    
    // 手动计算绩效
    const manualCalculate = async () => {
      calculationLoading.value = true;
      try {
        const targetMonth = filterForm.month || new Date().toISOString().slice(0, 7);
        
        const response = await api.post('/performance/manual-calculate', {
          month: targetMonth
        });
        
        if (response.data.success) {
          ElMessage.success(`已成功计算 ${targetMonth} 的绩效数据`);
          // 重新获取当前月份的数据
          fetchPerformanceData();
        } else {
          ElMessage.error(response.data.message);
        }
      } catch (error) {
        console.error('手动计算绩效失败:', error);
        ElMessage.error('手动计算绩效失败，请稍后重试');
      } finally {
        calculationLoading.value = false;
      }
    };
    
    // 显示历史总览
    const showHistoricalOverview = async () => {
      try {
        const params = {
          page: historicalPagination.currentPage,
          pageSize: historicalPagination.pageSize
        };
        
        const response = await api.get('/performance/historical', { params });
        
        if (response.data.success) {
          historicalList.value = response.data.data.list;
          historicalPagination.total = response.data.data.total;
          showHistoricalView.value = true;
        } else {
          ElMessage.error(response.data.message);
        }
      } catch (error) {
        console.error('获取历史绩效数据失败:', error);
        ElMessage.error('获取历史绩效数据失败，请稍后重试');
      }
    };
    
    // 退出历史总览
    const exitHistoricalView = () => {
      showHistoricalView.value = false;
      historicalList.value = [];
      // 退出历史视图后重新获取当前月份的数据
      fetchPerformanceData();
    };
    
    onMounted(() => {
      fetchPerformanceData()
    })
    
    return {
      loading,
      calculationLoading,
      performanceList,
      historicalList,
      showHistoricalView,
      filterForm,
      pagination,
      historicalPagination,
      fetchPerformanceData,
      resetFilter,
      handleSizeChange,
      handleCurrentChange,
      manualCalculate,
      showHistoricalOverview,
      exitHistoricalView,
      getRankType,
      getScoreColor,
      formatScore
    }
  }
}
</script>

<style scoped>
.performance-card {
  min-height: 500px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-section {
  margin-bottom: 20px;
}

.historical-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.redemption-count {
  font-weight: bold;
  color: #67C23A;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style>