<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import RootPasswordDialog from '../components/RootPasswordDialog.vue'
import type { PlatformPasswordHistoryDetailResponseData } from '../types/electron'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const showDetail = ref(false)
const showRootPasswordDialog = ref(false)
const historyDetail = ref<PlatformPasswordHistoryDetailResponseData | null>(null)
const rootPasswordDialogRef = ref()
const passwordId = ref<number>(Number(route.params.passwordId))
const historyId = ref<number>(Number(route.params.historyId))
const rootPassword = ref<string>((route.query.rootPassword as string) || '')

const getChangeTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    '创建': 'success',
    '修改': 'warning',
    '删除': 'danger'
  }
  return typeMap[type] || 'info'
}

const loadHistoryDetail = async () => {
  if (!rootPassword.value) {
    showRootPasswordDialog.value = true
    return
  }
  await loadHistoryDetailWithPassword(rootPassword.value)
}

const loadHistoryDetailWithPassword = async (password: string) => {
  if (!userStore.userInfo?.user_id) {
    ElMessage.error('用户信息异常，请重新登录')
    rootPasswordDialogRef.value?.closeDialog()
    return
  }

  loading.value = true
  try {
    const result = await window.electronAPI.platformPasswordHistoryDetail({
      history_id: historyId.value,
      user_id: userStore.userInfo.user_id,
      root_password: password
    })
    if (result.success) {
      const historyItem = result.data
      if (historyItem) {
        historyDetail.value = historyItem
        showDetail.value = true
        rootPasswordDialogRef.value?.closeDialog()
      } else {
        ElMessage.error('未找到该历史记录')
        rootPasswordDialogRef.value?.setLoading(false)
      }
    } else {
      ElMessage.error(result.message)
      rootPasswordDialogRef.value?.setLoading(false)
    }
  } catch (error) {
    ElMessage.error('加载历史详情失败')
    console.error('加载历史详情失败:', error)
    rootPasswordDialogRef.value?.setLoading(false)
  } finally {
    loading.value = false
  }
}

const handleRootPasswordConfirm = async (password: string) => {
  rootPassword.value = password
  await loadHistoryDetailWithPassword(password)
}

const handleBack = () => {
  router.push({
    name: 'PasswordHistory',
    params: { passwordId: passwordId.value }
  })
}

onMounted(() => {
  loadHistoryDetail()
})
</script>

<template>
  <div class="history-detail-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <div class="header-icon" @click="handleBack">
              <el-icon :size="20"><ArrowLeft /></el-icon>
            </div>
            <h2>历史记录详情</h2>
          </div>
        </div>
      </template>

      <div v-if="loading" class="loading-section">
        <el-skeleton :rows="5" animated />
      </div>

      <div v-else-if="historyDetail" class="detail-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="历史记录ID">
            {{ historyDetail.history_id }}
          </el-descriptions-item>
          <el-descriptions-item label="平台名称">
            {{ historyDetail.platform_name || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="平台账号">
            {{ historyDetail.platform_account || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="平台口令">
            {{ historyDetail.platform_password || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="关联邮箱">
            {{ historyDetail.related_email || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="关联手机">
            {{ historyDetail.related_phone || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="保密信息">
            {{ historyDetail.secret_info || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="备注">
            {{ historyDetail.remark || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="操作类型">
            <el-tag :type="getChangeTypeTag(historyDetail.operation_type)">
              {{ historyDetail.operation_type }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作时间">
            {{ historyDetail.operated_at }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <el-empty v-else description="暂无数据" />
    </el-card>

    <!-- 根口令验证对话框 -->
    <RootPasswordDialog
      ref="rootPasswordDialogRef"
      v-model="showRootPasswordDialog"
      title="验证根口令"
      message="查看历史记录详情需要验证根口令"
      @confirm="handleRootPasswordConfirm"
    />
  </div>
</template>

<style scoped>
.history-detail-container {
  padding: 20px;
}

.detail-card {
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
  gap: 16px;
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
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.password-input-section {
  padding: 20px 0;
}

.detail-content {
  margin-top: 20px;
}

:deep(.detail-descriptions .el-descriptions__label) {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-weight: 500;
  width: 140px;
}

:deep(.detail-descriptions .el-descriptions__body) {
  background: var(--bg-primary);
}

:deep(.detail-descriptions .el-descriptions__content) {
  color: var(--text-secondary);
}

.info-value {
  font-size: 14px;
  color: var(--text-secondary);
}
</style>
