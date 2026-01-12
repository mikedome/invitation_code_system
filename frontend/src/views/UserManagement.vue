<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <!-- 页面标题已在App.vue中显示，此处不再重复 -->
        <el-button type="primary" @click="openAddDialog" class="add-btn">添加用户</el-button>
      </div>
    </template>
    
    <div class="search-form">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="角色">
          <el-select v-model="searchForm.role" placeholder="请选择角色">
            <el-option label="全部" value=""></el-option>
            <el-option label="管理员" value="admin"></el-option>
            <el-option label="普通用户" value="user"></el-option>
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
      <el-table-column prop="username" label="用户名" min-width="150"></el-table-column>
      <el-table-column prop="role" label="角色" width="120">
        <template #default="scope">
          <el-tag :type="scope.row.role === 'admin' ? 'primary' : 'success'">
            {{ scope.row.role === 'admin' ? '管理员' : '普通用户' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" min-width="180">
        <template #default="scope">
          {{ formatDate(scope.row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column prop="updated_at" label="更新时间" min-width="180">
        <template #default="scope">
          {{ formatDate(scope.row.updated_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="small" @click="openEditDialog(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="deleteUser(scope.row)">删除</el-button>
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
    
    <!-- 添加用户对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      title="添加用户"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="addFormRef" :model="addForm" :rules="addRules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" type="password" placeholder="请输入密码" show-password></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="addForm.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin"></el-option>
            <el-option label="普通用户" value="user"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addUser" :loading="addLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 编辑用户对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑用户"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="editForm.password" type="password" placeholder="请输入密码（可选，不修改请留空）" show-password></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="editForm.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin"></el-option>
            <el-option label="普通用户" value="user"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="updateUser" :loading="editLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script>
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'UserManagement',
  setup() {
    const instance = getCurrentInstance()
    const $axios = instance.appContext.config.globalProperties.$axios
    
    const tableData = ref([])
    const loading = ref(false)
    const addDialogVisible = ref(false)
    const editDialogVisible = ref(false)
    const addLoading = ref(false)
    const editLoading = ref(false)
    const addFormRef = ref(null)
    const editFormRef = ref(null)
    
    const searchForm = reactive({
      role: ''
    })
    
    const pagination = reactive({
      currentPage: 1,
      pageSize: 10,
      total: 0
    })
    
    const addForm = reactive({
      username: '',
      password: '',
      role: 'user'
    })
    
    const editForm = reactive({
      id: '',
      username: '',
      password: '',
      role: 'user'
    })
    
    const addRules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' }
      ],
      role: [
        { required: true, message: '请选择角色', trigger: 'change' }
      ]
    }
    
    const editRules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' }
      ],
      role: [
        { required: true, message: '请选择角色', trigger: 'change' }
      ]
    }
    
    // 获取用户列表
    const getUsers = async () => {
      loading.value = true
      try {
        const params = {
          page: pagination.currentPage,
          pageSize: pagination.pageSize,
          role: searchForm.role
        }
        
        const response = await $axios.get('/users', { params })
        
        if (response.data.success) {
          tableData.value = response.data.data.list
          pagination.total = response.data.data.total
        } else {
          ElMessage.error(response.data.message)
        }
      } catch (error) {
        console.error('获取用户列表失败:', error)
        ElMessage.error('获取用户列表失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
    
    // 查询
    const search = () => {
      pagination.currentPage = 1
      getUsers()
    }
    
    // 重置查询
    const resetSearch = () => {
      searchForm.role = ''
      pagination.currentPage = 1
      getUsers()
    }
    
    // 处理分页大小变化
    const handleSizeChange = (val) => {
      pagination.pageSize = val
      pagination.currentPage = 1
      getUsers()
    }
    
    // 处理当前页变化
    const handleCurrentChange = (val) => {
      pagination.currentPage = val
      getUsers()
    }
    
    // 打开添加用户对话框
    const openAddDialog = () => {
      addForm.username = ''
      addForm.password = ''
      addForm.role = 'user'
      addDialogVisible.value = true
    }
    
    // 添加用户
    const addUser = async () => {
      await addFormRef.value.validate(async (valid) => {
        if (valid) {
          addLoading.value = true
          try {
            const response = await $axios.post('/register', addForm)
            
            if (response.data.success) {
              ElMessage.success('用户添加成功')
              addDialogVisible.value = false
              getUsers()
            } else {
              ElMessage.error(response.data.message)
            }
          } catch (error) {
            console.error('添加用户失败:', error)
            ElMessage.error('添加用户失败，请稍后重试')
          } finally {
            addLoading.value = false
          }
        }
      })
    }
    
    // 打开编辑用户对话框
    const openEditDialog = (row) => {
      editForm.id = row.id
      editForm.username = row.username
      editForm.password = ''
      editForm.role = row.role
      editDialogVisible.value = true
    }
    
    // 更新用户
    const updateUser = async () => {
      await editFormRef.value.validate(async (valid) => {
        if (valid) {
          editLoading.value = true
          try {
            const data = { ...editForm }
            if (!data.password) {
              delete data.password
            }
            
            const response = await $axios.put(`/users/${editForm.id}`, data)
            
            if (response.data.success) {
              ElMessage.success('用户更新成功')
              editDialogVisible.value = false
              getUsers()
            } else {
              ElMessage.error(response.data.message)
            }
          } catch (error) {
            console.error('更新用户失败:', error)
            ElMessage.error('更新用户失败，请稍后重试')
          } finally {
            editLoading.value = false
          }
        }
      })
    }
    
    // 删除用户
    const deleteUser = (row) => {
      ElMessageBox.confirm(`确定要删除用户 "${row.username}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await $axios.delete(`/users/${row.id}`)
          
          if (response.data.success) {
            ElMessage.success('用户删除成功')
            getUsers()
          } else {
            ElMessage.error(response.data.message)
          }
        } catch (error) {
          console.error('删除用户失败:', error)
          ElMessage.error('删除用户失败，请稍后重试')
        }
      }).catch(() => {
        // 取消删除
      })
    }
    
    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
    }
    
    onMounted(() => {
      getUsers()
    })
    
    return {
      tableData,
      loading,
      searchForm,
      pagination,
      addDialogVisible,
      editDialogVisible,
      addLoading,
      editLoading,
      addFormRef,
      editFormRef,
      addForm,
      editForm,
      addRules,
      editRules,
      search,
      resetSearch,
      handleSizeChange,
      handleCurrentChange,
      openAddDialog,
      addUser,
      openEditDialog,
      updateUser,
      deleteUser,
      formatDate
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

.add-btn {
  padding: 8px 16px;
  font-size: 14px;
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