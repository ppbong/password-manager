<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore, usePasswordStore } from '../stores'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Unlock, View, Edit, Delete, Lock } from '@element-plus/icons-vue'
import PasswordAdd from '../components/PasswordAdd.vue'
import PasswordEdit from '../components/PasswordEdit.vue'
import RootPasswordDialog from '../components/RootPasswordDialog.vue'
import type { PlatformCategoryListResponseData, PlatformPasswordListResponseData } from '../types/electron'

const router = useRouter()
const userStore = useUserStore()
const passwordStore = usePasswordStore()

const loading = ref(false)
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showRootPasswordDialog = ref(false)
const passwords = ref<PlatformPasswordListResponseData[]>([])
const categories = ref<PlatformCategoryListResponseData[]>([])
const currentPassword = ref<PlatformPasswordListResponseData>()
const currentCategory = ref<PlatformCategoryListResponseData>()
const searchPlatform = ref('')
const rootPasswordDialogRef = ref()
const deleteTarget = ref<PlatformPasswordListResponseData | null>(null)
const viewDetailTarget = ref<PlatformPasswordListResponseData | null>(null)
const rootPasswordDialogTitle = ref('验证根口令')
const rootPasswordDialogMessage = ref('请输入根口令以继续操作')

const loadPasswords = async () => {
  if (!userStore.userInfo?.user_id) {
    ElMessage.error('用户信息异常，请重新登录')
    return
  }
  loading.value = true
  try {
    const result = await window.electronAPI.platformPasswordList({ 
      user_id: userStore.userInfo.user_id,
      category_id: currentCategory.value?.category_id || null,
      platform_name: searchPlatform.value || null
     })
    if (result.success) {
      passwords.value = result.data || []
      passwordStore.setPasswords(passwords.value)
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    ElMessage.error('加载平台口令失败')
    console.error('加载平台口令失败:', error)
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const result = await window.electronAPI.platformCategoryList({ sort_order: 'asc' })
    if (result.success) {
      categories.value = result.data || []
      passwordStore.setCategories(categories.value)
    }
  } catch (error) {
    console.error('加载平台分类失败:', error)
  }
}

const handleEdit = (row: any) => {
  currentPassword.value = row
  showEditDialog.value = true
}

const handleDelete = async (row: any) => {
  if (!userStore.userInfo?.user_id) {
    ElMessage.error('用户信息异常，请重新登录')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要删除平台口令 "${row.platform_name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    deleteTarget.value = row
    showRootPasswordDialog.value = true
  } catch {
    ElMessage.info('已取消删除')
  }
}

const handleRootPasswordConfirm = async (rootPassword: string) => {
  if (!userStore.userInfo?.user_id) {
    ElMessage.error('参数异常')
    rootPasswordDialogRef.value?.closeDialog()
    return
  }
  
  if (deleteTarget.value) {
    try {
      const result = await window.electronAPI.platformPasswordDelete({
        password_id: deleteTarget.value.password_id,
        user_id: userStore.userInfo.user_id,
        root_password: rootPassword
      })
      if (result.success) {
        ElMessage.success('删除成功')
        rootPasswordDialogRef.value?.closeDialog()
        deleteTarget.value = null
        loadPasswords()
      } else {
        ElMessage.error(result.message)
        rootPasswordDialogRef.value?.setLoading(false)
      }
    } catch (error) {
      ElMessage.error('删除失败')
      console.error('删除平台口令失败:', error)
      rootPasswordDialogRef.value?.setLoading(false)
    }
  } else if (viewDetailTarget.value) {
    router.push({
      name: 'PasswordDetail',
      params: { passwordId: viewDetailTarget.value.password_id },
      query: { rootPassword }
    })
    rootPasswordDialogRef.value?.closeDialog()
    viewDetailTarget.value = null
  } else {
    ElMessage.error('参数异常')
    rootPasswordDialogRef.value?.closeDialog()
  }
}

const handleViewDetail = (row: any) => {
  viewDetailTarget.value = row
  showRootPasswordDialog.value = true
}

const handleViewHistory = (row: any) => {
  router.push({
    name: 'PasswordHistory',
    params: { passwordId: row.password_id }
  })
}

const handleFormSuccess = () => {
  loadPasswords()
}

onMounted(() => {
  loadCategories()
  loadPasswords()
})
</script>

<template>
  <div class="password-container">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <div class="header-icon">
              <el-icon :size="24"><Lock /></el-icon>
            </div>
            <h2>平台口令管理</h2>
          </div>
          <el-button type="primary" @click="showAddDialog = true" size="large">
            <el-icon><Plus /></el-icon>
            <span>创建平台口令</span>
          </el-button>
        </div>
        <div class="filter-section">
          <div class="filter-row">
            <div class="filter-item">
              <span class="filter-label">平台分类：</span>
              <el-select 
                v-model="currentCategory" 
                placeholder="请选择平台分类"
                clearable
                @change="loadPasswords"
                size="large"
              >
                <el-option v-for="item in categories" :key="item.category_id" :label="item.name" :value="item" />
              </el-select>
            </div>
            <div class="filter-item">
              <span class="filter-label">平台名称：</span>
              <el-input
                v-model="searchPlatform"
                placeholder="请输入平台名称"
                clearable
                @keyup.enter="loadPasswords"
                size="large"
              >
                <template #append>
                  <el-button @click="loadPasswords">
                    <el-icon><Search /></el-icon>
                  </el-button>
                </template>
              </el-input>
            </div>
          </div>
        </div>
      </template>

      <el-table :data="passwords" align="center" style="width: 100%" v-loading="loading" class="password-table">
        <el-table-column prop="category_name" label="平台分类" width="180" />
        <el-table-column prop="platform_name" label="平台名称" />
        <el-table-column prop="platform_account" label="平台账号" />
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column prop="updated_at" label="更新时间" width="180" />
        <el-table-column label="操作" width="340" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleViewDetail(scope.row)">
              <el-icon><Unlock /></el-icon>
              <span>详情</span>
            </el-button>
            <el-button type="info" size="small" @click="handleViewHistory(scope.row)">
              <el-icon><View /></el-icon>
              <span>历史</span>
            </el-button>
            <el-button type="warning" size="small" @click="handleEdit(scope.row)">
              <el-icon><Edit /></el-icon>
              <span>修改</span>
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">
              <el-icon><Delete /></el-icon>
              <span>删除</span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加口令对话框 -->
    <PasswordAdd
      v-model="showAddDialog"
      :categories="categories"
      @success="handleFormSuccess"
    />

    <!-- 编辑口令对话框 -->
    <PasswordEdit
      v-if="currentPassword"
      v-model="showEditDialog"
      :categories="categories"
      :passwordData="currentPassword"
      @success="handleFormSuccess"
    />

    <!-- 根口令验证对话框 -->
    <RootPasswordDialog
      ref="rootPasswordDialogRef"
      v-model="showRootPasswordDialog"
      :title="rootPasswordDialogTitle"
      :message="rootPasswordDialogMessage"
      @confirm="handleRootPasswordConfirm"
    />
  </div>
</template>

<style scoped>
.password-container {
  padding: 20px;
}

.main-card {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 40px;
  height: 40px;
  background: var(--gradient-primary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: var(--shadow-md);
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.filter-section {
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.filter-row {
  display: flex;
  gap: 24px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  color: var(--text-secondary);
  white-space: nowrap;
  font-weight: 500;
}

.filter-item .el-select,
.filter-item .el-input {
  width: 240px;
}

:deep(.password-table) {
  border-radius: var(--radius-md);
  overflow: hidden;
}

:deep(.password-table .el-table__header-wrapper) {
  background: var(--bg-tertiary);
}

:deep(.password-table .el-table__header th) {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-weight: 600;
  padding: 16px 12px;
}

:deep(.password-table .el-table__body tr:hover > td) {
  background: var(--bg-secondary) !important;
}

:deep(.password-table .el-table__body td) {
  color: var(--text-secondary);
  padding: 16px 12px;
}

:deep(.password-table .operation-column) {
  background: var(--bg-primary);
}

:deep(.password-table .operation-column .cell) {
  padding: 0;
}

.table-btn {
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: all 0.3s;
  margin-right: 8px;
}

.table-btn:last-child {
  margin-right: 0;
}

.table-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
</style>
