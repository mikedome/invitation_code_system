<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <h2>核销人员管理</h2>
        <el-button type="primary" @click="openAddDialog" class="add-btn">添加核销人员</el-button>
      </div>
    </template>
    
    <div class="search-form">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <el-table :data="tableData" style="width: 100%" stripe>
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="name" label="姓名" min-width="150"></el-table-column>
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
          <el-button type="danger" size="small" @click="deleteRedeemer(scope.row)">删除</el-button>
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
    
    <!-- 添加核销人员对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      title="添加核销人员"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="addFormRef" :model="addForm" :rules="addRules" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="addForm.name" placeholder="请输入核销人员姓名"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addRedeemer" :loading="addLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 编辑核销人员对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑核销人员"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入核销人员姓名"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="updateRedeemer" :loading="editLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script>
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'RedeemerManagement',
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
    
    const searchForm = reactive({})
    
    const pagination = reactive({
      currentPage: 1,
      pageSize: 10,
      total: 0
    })
    
    const addForm = reactive({
      name: ''
    })
    
    const editForm = reactive({
      id: '',
      name: ''
    })
    
    const addRules = {
      name: [
        { required: true, message: '请输入核销人员姓名', trigger: 'blur' }
      ]
    }
    
    const editRules = {
      name: [
        { required: true, message: '请输入核销人员姓名', trigger: 'blur' }
      ]
    }
    
    // 获取核销人员列表
    const getRedeemers = async () => {
      loading.value = true
      try {
        const params = {
          page: pagination.currentPage,
          pageSize: pagination.pageSize
        }
        
        const response = await $axios.get('/redeemers', { params })
        
        if (response.data.success) {
          tableData.value = response.data.data.list
          pagination.total = response.data.data.total
        } else {
          ElMessage.error(response.data.message)
        }
      } catch (error) {
        console.error('获取核销人员列表失败:', error)
        ElMessage.error('获取核销人员列表失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
    
    // 查询
    const search = () => {
      pagination.currentPage = 1
      getRedeemers()
    }
    
    // 重置查询
    const resetSearch = () => {
      searchForm.name = ''
      pagination.currentPage = 1
      getRedeemers()
    }
    
    // 处理分页大小变化
    const handleSizeChange = (val) => {
      pagination.pageSize = val
      pagination.currentPage = 1
      getRedeemers()
    }
    
    // 处理当前页变化
    const handleCurrentChange = (val) => {
      pagination.currentPage = val
      getRedeemers()
    }
    
    // 打开添加核销人员对话框
    const openAddDialog = () => {
      addForm.name = ''
      addDialogVisible.value = true
    }
    
    // 添加核销人员
    const addRedeemer = async () => {
      await addFormRef.value.validate(async (valid) => {
        if (valid) {
          addLoading.value = true
          try {
            const response = await $axios.post('/redeemers', addForm)
            
            if (response.data.success) {
              ElMessage.success('核销人员添加成功')
              addDialogVisible.value = false
              getRedeemers()
            } else {
              ElMessage.error(response.data.message)
            }
          } catch (error) {
            console.error('添加核销人员失败:', error)
            ElMessage.error('添加核销人员失败，请稍后重试')
          } finally {
            addLoading.value = false
          }
        }
      })
    }
    
    // 打开编辑核销人员对话框
    const openEditDialog = (row) => {
      editForm.id = row.id
      editForm.name = row.name
      editDialogVisible.value = true
    }
    
    // 更新核销人员
    const updateRedeemer = async () => {
      await editFormRef.value.validate(async (valid) => {
        if (valid) {
          editLoading.value = true
          try {
            const response = await $axios.put(`/redeemers/${editForm.id}`, editForm)
            
            if (response.data.success) {
              ElMessage.success('核销人员更新成功')
              editDialogVisible.value = false
              getRedeemers()
            } else {
              ElMessage.error(response.data.message)
            }
          } catch (error) {
            console.error('更新核销人员失败:', error)
            ElMessage.error('更新核销人员失败，请稍后重试')
          } finally {
            editLoading.value = false
          }
        }
      })
    }
    
    // 删除核销人员
    const deleteRedeemer = (row) => {
      ElMessageBox.confirm(`确定要删除核销人员 "${row.name}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await $axios.delete(`/redeemers/${row.id}`)
          
          if (response.data.success) {
            ElMessage.success('核销人员删除成功')
            getRedeemers()
          } else {
            ElMessage.error(response.data.message)
          }
        } catch (error) {
          console.error('删除核销人员失败:', error)
          ElMessage.error('删除核销人员失败，请稍后重试')
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
      getRedeemers()
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
      addRedeemer,
      openEditDialog,
      updateRedeemer,
      deleteRedeemer,
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