<template>
  <el-card class="roster-card">
    <template #header>
      <div class="card-header">
        <!-- 页面标题已在App.vue中显示，此处不再重复 -->
      </div>
    </template>
    
    <div class="search-section">
      <el-form :model="searchForm" inline>
        <el-form-item label="部门">
          <el-select 
            v-model="searchForm.department" 
            placeholder="请选择部门"
            clearable
            @change="fetchRosterData"
          >
            <el-option 
              v-for="dept in departments" 
              :key="dept" 
              :label="dept" 
              :value="dept" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select 
            v-model="searchForm.status" 
            placeholder="请选择状态"
            clearable
            @change="fetchRosterData"
          >
            <el-option label="在职" value="active" />
            <el-option label="离职" value="inactive" />
            <el-option label="请假" value="on_leave" />
          </el-select>
        </el-form-item>
        <el-form-item label="搜索">
          <el-input 
            v-model="searchForm.keyword" 
            placeholder="输入员工姓名或编号"
            @keyup.enter="fetchRosterData"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchRosterData">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" @click="openAddDialog">新增员工</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <el-table 
      :data="rosterList" 
      v-loading="loading"
      style="width: 100%"
      stripe
    >
      <el-table-column prop="employee_id" label="员工编号" width="120" fixed="left" />
      <el-table-column prop="name" label="姓名" width="120" />
      <el-table-column prop="department" label="部门" width="150" />
      <el-table-column prop="position" label="职位" width="150" />
      <el-table-column prop="hire_date" label="入职日期" width="120">
        <template #default="{ row }">
          {{ formatDate(row.hire_date) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="联系电话" width="150" />
      <el-table-column prop="email" label="邮箱" width="200" />
      <el-table-column prop="id_card" label="身份证号" width="180" />
      <el-table-column label="操作" fixed="right" width="200">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="openEditDialog(row)">编辑</el-button>
          <el-button type="danger" size="small" @click="deleteEmployee(row)">删除</el-button>
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
      />
    </div>
    
    <!-- 新增/编辑员工对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form 
        ref="formRef" 
        :model="currentEmployee" 
        :rules="formRules" 
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="员工编号" prop="employee_id">
              <el-input 
                v-model="currentEmployee.employee_id" 
                :disabled="isEditMode"
                placeholder="请输入4位员工编号"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="currentEmployee.name" placeholder="请输入员工姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="部门" prop="department">
              <el-input v-model="currentEmployee.department" placeholder="请输入部门名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职位" prop="position">
              <el-input v-model="currentEmployee.position" placeholder="请输入职位" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="入职日期" prop="hire_date">
              <el-date-picker
                v-model="currentEmployee.hire_date"
                type="date"
                placeholder="选择入职日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="currentEmployee.status" placeholder="请选择状态">
                <el-option label="在职" value="active" />
                <el-option label="离职" value="inactive" />
                <el-option label="请假" value="on_leave" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="currentEmployee.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="currentEmployee.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="身份证号" prop="id_card">
              <el-input v-model="currentEmployee.id_card" placeholder="请输入身份证号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="紧急联系人">
              <el-input v-model="currentEmployee.emergency_contact" placeholder="请输入紧急联系人" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="紧急电话">
              <el-input v-model="currentEmployee.emergency_phone" placeholder="请输入紧急联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelDialog">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script>
import { ref, reactive, onMounted, getCurrentInstance, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'EmployeeRoster',
  setup() {
    const loading = ref(false)
    const submitting = ref(false)
    const rosterList = ref([])
    const departments = ref([])
    const dialogVisible = ref(false)
    const isEditMode = ref(false)
    
    const searchForm = reactive({
      department: '',
      status: '',
      keyword: ''
    })
    
    const pagination = reactive({
      currentPage: 1,
      pageSize: 10,
      total: 0
    })
    
    const currentEmployee = reactive({
      id: null,
      employee_id: '',
      name: '',
      department: '',
      position: '',
      hire_date: '',
      status: 'active',
      phone: '',
      email: '',
      id_card: '',
      emergency_contact: '',
      emergency_phone: ''
    })
    
    // 表单验证规则
    const formRules = {
      employee_id: [
        { required: true, message: '请输入员工编号', trigger: 'blur' },
        { pattern: /^\d{4}$/, message: '员工编号必须是4位数字', trigger: 'blur' }
      ],
      name: [
        { required: true, message: '请输入员工姓名', trigger: 'blur' }
      ],
      department: [
        { required: false, message: '请输入部门名称', trigger: 'blur' }
      ],
      position: [
        { required: false, message: '请输入职位', trigger: 'blur' }
      ]
    }
    
    const formRef = ref(null)
    
    // 获取当前实例以访问 axios
    const instance = getCurrentInstance()
    const $axios = instance.appContext.config.globalProperties.$axios
    
    // 获取员工花名册列表
    const fetchRosterData = async () => {
      loading.value = true
      try {
        const params = {
          page: pagination.currentPage,
          pageSize: pagination.pageSize,
          department: searchForm.department || undefined,
          status: searchForm.status || undefined,
          keyword: searchForm.keyword || undefined
        }
        
        const response = await $axios.get('/employees', { params })
        
        if (response.data.success) {
          rosterList.value = response.data.data.list
          pagination.total = response.data.data.total
        } else {
          ElMessage.error(response.data.message)
        }
      } catch (error) {
        console.error('获取员工花名册失败:', error)
        ElMessage.error('获取员工花名册失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
    
    // 获取部门列表
    const fetchDepartments = async () => {
      try {
        const response = await $axios.get('/departments')
        
        if (response.data.success) {
          departments.value = response.data.data.departments
        } else {
          ElMessage.error(response.data.message)
        }
      } catch (error) {
        console.error('获取部门列表失败:', error)
        ElMessage.error('获取部门列表失败，请稍后重试')
      }
    }
    
    // 重置搜索
    const resetSearch = () => {
      searchForm.department = ''
      searchForm.status = ''
      searchForm.keyword = ''
      pagination.currentPage = 1
      fetchRosterData()
    }
    
    // 处理分页大小变化
    const handleSizeChange = (val) => {
      pagination.pageSize = val
      pagination.currentPage = 1
      fetchRosterData()
    }
    
    // 处理当前页变化
    const handleCurrentChange = (val) => {
      pagination.currentPage = val
      fetchRosterData()
    }
    
    // 打开新增员工对话框
    const openAddDialog = () => {
      resetForm()
      isEditMode.value = false
      dialogVisible.value = true
    }
    
    // 打开编辑员工对话框
    const openEditDialog = (employee) => {
      Object.assign(currentEmployee, employee)
      isEditMode.value = true
      dialogVisible.value = true
    }
    
    // 重置表单
    const resetForm = () => {
      Object.keys(currentEmployee).forEach(key => {
        if (key === 'status') {
          currentEmployee[key] = 'active'
        } else {
          currentEmployee[key] = key === 'id' ? null : ''
        }
      })
    }
    
    // 提交表单
    const submitForm = async () => {
      await formRef.value.validate(async (valid) => {
        if (valid) {
          submitting.value = true
          try {
            let response
            
            if (isEditMode.value) {
              // 更新员工信息
              response = await $axios.put(`/employees/${currentEmployee.id}`, currentEmployee)
            } else {
              // 添加新员工
              response = await $axios.post('/employees', currentEmployee)
            }
            
            if (response.data.success) {
              ElMessage.success(response.data.message)
              dialogVisible.value = false
              resetForm()
              fetchRosterData() // 重新获取数据
            } else {
              ElMessage.error(response.data.message)
            }
          } catch (error) {
            console.error(isEditMode.value ? '更新员工失败:' : '添加员工失败:', error)
            ElMessage.error(isEditMode.value ? '更新员工失败，请稍后重试' : '添加员工失败，请稍后重试')
          } finally {
            submitting.value = false
          }
        }
      })
    }
    
    // 取消对话框
    const cancelDialog = () => {
      dialogVisible.value = false
      resetForm()
    }
    
    // 删除员工
    const deleteEmployee = async (employee) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除员工 "${employee.name}" 吗？删除后将无法恢复，且该员工相关信息将变为匿名，但不会影响历史数据。`,
          '危险操作确认',
          {
            confirmButtonText: '确认删除',
            cancelButtonText: '取消',
            type: 'error',
            dangerouslyUseHTMLString: true,
            center: true
          }
        )
        
        const response = await $axios.delete(`/employees/${employee.id}`)
        
        if (response.data.success) {
          ElMessage.success(response.data.message)
          fetchRosterData() // 重新获取数据
        } else {
          ElMessage.error(response.data.message)
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除员工失败:', error)
          ElMessage.error('删除员工失败，请稍后重试')
        }
      }
    }
    
    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN')
    }
    
    // 获取状态标签类型
    const getStatusTagType = (status) => {
      switch (status) {
        case 'active': return 'success'
        case 'inactive': return 'danger'
        case 'on_leave': return 'warning'
        default: return 'info'
      }
    }
    
    // 获取状态文本
    const getStatusText = (status) => {
      switch (status) {
        case 'active': return '在职'
        case 'inactive': return '离职'
        case 'on_leave': return '请假'
        default: return status
      }
    }
    
    // 计算对话框标题
    const dialogTitle = computed(() => {
      return isEditMode.value ? '编辑员工' : '新增员工'
    })
    
    onMounted(() => {
      fetchRosterData()
      fetchDepartments()
    })
    
    return {
      loading,
      submitting,
      rosterList,
      departments,
      dialogVisible,
      isEditMode,
      searchForm,
      pagination,
      currentEmployee,
      formRules,
      formRef,
      fetchRosterData,
      resetSearch,
      handleSizeChange,
      handleCurrentChange,
      openAddDialog,
      openEditDialog,
      submitForm,
      cancelDialog,
      deleteEmployee,
      formatDate,
      getStatusTagType,
      getStatusText,
      dialogTitle
    }
  }
}
</script>

<style scoped>
.roster-card {
  min-height: 500px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-section {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>