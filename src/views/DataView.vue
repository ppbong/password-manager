<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { DataOperationLogsResponseData } from '../types/electron'

const userStore = useUserStore()

const backupLoading = ref(false)
const restoreLoading = ref(false)
const logsLoading = ref(false)
const operationLogs = ref<DataOperationLogsResponseData[]>([])

const handleBackup = async () => {
  if (!userStore.userInfo?.username) {
    ElMessage.error('用户信息异常，请重新登录')
    return
  }

  try {
    await ElMessageBox.confirm(
      '确定要备份数据吗？备份将生成一个包含所有密码数据的文件。',
      '确认备份',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  } catch {
    return
  }

  backupLoading.value = true
  try {
    const result = await window.electronAPI.dataBackup({
      username: userStore.userInfo.username
    })
    if (result.success && result.data?.file_name) {
      ElMessage.success(`数据备份成功，文件名：${result.data.file_name}`)
      loadOperationLogs()
    } else {
      ElMessage.error(result.message || '数据备份失败')
    }
  } catch (error) {
    ElMessage.error('数据备份失败')
    console.error('数据备份失败:', error)
  } finally {
    backupLoading.value = false
  }
}

const handleRestore = async (fileName: string) => {
  if (!userStore.userInfo?.username) {
    ElMessage.error('用户信息异常，请重新登录')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要恢复备份文件 "${fileName}" 吗？此操作将覆盖当前数据，请谨慎操作！`,
      '确认恢复',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  } catch {
    return
  }

  restoreLoading.value = true
  try {
    const result = await window.electronAPI.dataRestore({
      username: userStore.userInfo.username,
      file_name: fileName
    })
    if (result.success) {
      ElMessage.success('数据恢复成功')
      loadOperationLogs()
    } else {
      ElMessage.error(result.message || '数据恢复失败')
    }
  } catch (error) {
    ElMessage.error('数据恢复失败')
    console.error('数据恢复失败:', error)
  } finally {
    restoreLoading.value = false
  }
}

const loadOperationLogs = async () => {
  if (!userStore.userInfo?.username) {
    ElMessage.error('用户信息异常，请重新登录')
    return
  }

  logsLoading.value = true
  try {
    const result = await window.electronAPI.dataOperationLogs({
      username: userStore.userInfo.username
    })
    if (result.success) {
      operationLogs.value = result.data || []
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    ElMessage.error('加载操作日志失败')
    console.error('加载操作日志失败:', error)
  } finally {
    logsLoading.value = false
  }
}

const getOperationTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    '备份': 'success',
    '恢复': 'warning'
  }
  return typeMap[type] || 'info'
}

onMounted(() => {
  loadOperationLogs()
})
</script>

<template>
  <div class="data-container">
    <el-card>
      <template #header>
        <h2>数据管理</h2>
      </template>

      <div class="data-actions">
        <el-button type="primary" @click="handleBackup" :loading="backupLoading">
          备份数据
        </el-button>
        <el-button @click="loadOperationLogs" :loading="logsLoading">
          刷新日志
        </el-button>
      </div>

      <el-alert
        title="提示"
        type="info"
        description="数据管理功能用于备份和恢复您的密码数据。请定期备份数据以防止数据丢失。恢复数据将覆盖当前数据，请谨慎操作。"
        :closable="false"
        show-icon
        style="margin-top: 20px"
      />

      <el-divider />

      <div class="logs-section">
        <h3>操作日志</h3>
        <el-table :data="operationLogs" style="width: 100%" v-loading="logsLoading">
          <el-table-column prop="operation_time" label="操作时间" width="180" />
          <el-table-column prop="operation_type" label="操作类型" width="100">
            <template #default="scope">
              <el-tag :type="getOperationTypeTag(scope.row.operation_type)">
                {{ scope.row.operation_type }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="file_name" label="文件名" min-width="200" />
          <el-table-column prop="operator" label="操作人" width="150" />
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="scope">
              <el-button
                v-if="scope.row.operation_type === '备份'"
                type="warning"
                size="small"
                @click="handleRestore(scope.row.file_name)"
                :loading="restoreLoading"
              >
                恢复
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="!logsLoading && operationLogs.length === 0" description="暂无操作日志" />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.data-container {
  padding: 20px;
}

.data-container h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.data-actions {
  display: flex;
  gap: 12px;
}

.logs-section {
  margin-top: 20px;
}

.logs-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
}
</style>
