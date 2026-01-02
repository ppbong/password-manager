<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores'
import { ElMessage } from 'element-plus'
import { ArrowLeft, View } from '@element-plus/icons-vue'
import type { PlatformPasswordHistoryResponseData } from '../types/electron'
import RootPasswordDialog from '../components/RootPasswordDialog.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const passwordHistory = ref<PlatformPasswordHistoryResponseData[]>([])
const passwordId = ref<number>(Number(route.params.passwordId))
const passwordName = ref<string>('')
const showRootPasswordDialog = ref(false)
const viewHistoryTarget = ref<PlatformPasswordHistoryResponseData | null>(null)
const rootPasswordDialogRef = ref()

const getChangeTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    '创建': 'success',
    '修改': 'warning',
    '删除': 'danger'
  }
  return typeMap[type] || 'info'
}

const loadPasswordHistory = async () => {
  if (!userStore.userInfo?.user_id) {
    ElMessage.error('用户信息异常，请重新登录')
    return
  }
  loading.value = true
  try {
    const result = await window.electronAPI.platformPasswordHistory({
      password_id: passwordId.value,
      user_id: userStore.userInfo.user_id
    })
    if (result.success) {
      passwordHistory.value = result.data || []
      passwordName.value = passwordHistory.value[0]?.platform_name || '未知平台'
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    ElMessage.error('加载历史记录失败')
    console.error('加载历史记录失败:', error)
  } finally {
    loading.value = false
  }
}

const handleViewHistoryDetail = (historyItem: PlatformPasswordHistoryResponseData) => {
  viewHistoryTarget.value = historyItem
  showRootPasswordDialog.value = true
}

const handleRootPasswordConfirm = async (rootPassword: string) => {
  if (!viewHistoryTarget.value) {
    ElMessage.error('参数异常')
    rootPasswordDialogRef.value?.closeDialog()
    return
  }
  
  router.push({
    name: 'PasswordHistoryDetail',
    params: {
      passwordId: passwordId.value,
      historyId: viewHistoryTarget.value.history_id
    },
    query: { rootPassword }
  })
  rootPasswordDialogRef.value?.closeDialog()
  viewHistoryTarget.value = null
}

const handleBack = () => {
  router.push({ name: 'Password' })
}

onMounted(() => {
  loadPasswordHistory()
})
</script>

<template>
  <div class="password-history-container">
    <el-card class="history-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <div class="header-icon" @click="handleBack">
              <el-icon :size="20"><ArrowLeft /></el-icon>
            </div>
            <h2>{{ passwordName }} - 历史记录</h2>
          </div>
        </div>
      </template>

      <el-table :data="passwordHistory" style="width: 100%" v-loading="loading" class="history-table">
        <el-table-column prop="operated_at" label="操作时间" width="180" />
        <el-table-column prop="operation_type" label="操作类型" width="120">
          <template #default="scope">
            <el-tag :type="getChangeTypeTag(scope.row.operation_type)">
              {{ scope.row.operation_type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="platform_name" label="平台名称" />
        <el-table-column prop="platform_account" label="平台账号" />
        <el-table-column prop="related_email" label="关联邮箱" width="180" />
        <el-table-column prop="related_phone" label="关联手机" width="150" />
        <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleViewHistoryDetail(scope.row)">
              <el-icon><View /></el-icon>
              <span>详情</span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <RootPasswordDialog
      ref="rootPasswordDialogRef"
      v-model="showRootPasswordDialog"
      title="验证根口令"
      message="请输入根口令以查看历史详情"
      @confirm="handleRootPasswordConfirm"
    />
  </div>
</template>

<style scoped>
.password-history-container {
  padding: 20px;
}

.history-card {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 36px;
  height: 36px;
  background: var(--gradient-primary);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: var(--shadow-sm);
}

.header-icon:hover {
  transform: translateX(-2px);
  box-shadow: var(--shadow-md);
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

:deep(.history-table) {
  border-radius: var(--radius-md);
  overflow: hidden;
}

:deep(.history-table .el-table__header-wrapper) {
  background: var(--bg-tertiary);
}

:deep(.history-table .el-table__header th) {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-weight: 600;
  padding: 16px 12px;
}

:deep(.history-table .el-table__body tr:hover > td) {
  background: var(--bg-secondary) !important;
}

:deep(.history-table .el-table__body td) {
  color: var(--text-secondary);
  padding: 16px 12px;
}

:deep(.history-table .operation-column) {
  background: var(--bg-primary);
}

:deep(.history-table .operation-column .cell) {
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
