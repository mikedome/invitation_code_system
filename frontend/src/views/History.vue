<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <!-- 页面标题已在App.vue中显示，此处不再重复 -->
      </div>
    </template>
    
    <div class="search-form">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="员工编号">
          <el-input v-model="searchForm.employee_id" placeholder="请输入员工编号" maxlength="4"></el-input>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态">
            <el-option label="全部" value=""></el-option>
            <el-option label="未使用" value="unused"></el-option>
            <el-option label="已使用" value="used"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <el-table :data="tableData" style="width: 100%" stripe>
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="code" label="邀请码" min-width="200">
        <template #default="scope">
          <el-tag type="success">{{ scope.row.code }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="employee_id" label="员工编号" width="120"></el-table-column>
      <el-table-column prop="generator_name" label="生成人" width="120"></el-table-column>
      <el-table-column prop="generated_at" label="生成时间" min-width="180">
        <template #default="scope">
          {{ formatDate(scope.row.generated_at) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'unused' ? 'success' : 'info'">
            {{ scope.row.status === 'unused' ? '未使用' : '已使用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="redeemer_id" label="核销人员" width="120">
        <template #default="scope">
          {{ scope.row.redeemer_id || '-' }}
        </template>
      </el-table-column>
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
      ></el-pagination>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'History',
  data() {
    return {
      searchForm: {
        employee_id: '',
        status: ''
      },
      tableData: [],
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      loading: false
    }
  },
  mounted() {
    this.getHistory()
  },
  methods: {
    async getHistory() {
      this.loading = true
      try {
        const params = {
          page: this.pagination.currentPage,
          pageSize: this.pagination.pageSize,
          employee_id: this.searchForm.employee_id,
          status: this.searchForm.status
        }
        
        const response = await this.$axios.get('/history', { params })
        
        if (response.data.success) {
          this.tableData = response.data.data.list
          this.pagination.total = response.data.data.total
        } else {
          this.$message.error(response.data.message)
        }
      } catch (error) {
        console.error('获取历史记录失败:', error)
        this.$message.error('获取历史记录失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },
    
    search() {
      this.pagination.currentPage = 1
      this.getHistory()
    },
    
    resetSearch() {
      this.searchForm = {
        employee_id: '',
        status: ''
      }
      this.pagination.currentPage = 1
      this.getHistory()
    },
    
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.pagination.currentPage = 1
      this.getHistory()
    },
    
    handleCurrentChange(val) {
      this.pagination.currentPage = val
      this.getHistory()
    },
    
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
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

.search-form {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>