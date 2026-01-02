<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import UserInfoEditDialog from '../components/UserInfoEditDialog.vue'
import UserPasswordChangeDialog from '../components/UserPasswordChangeDialog.vue'
import type { UserInfoResponseData } from '../types/electron'

const userStore = useUserStore()
const loading = ref(false)

const userInfo = ref<UserInfoResponseData>()

const showEditInfoDialog = ref(false)
const showChangePasswordDialog = ref(false)

const loadUserInfo = async () => {
  if (!userStore.userInfo?.user_id) {
    ElMessage.error('用户信息异常，请重新登录')
    return
  }

  loading.value = true
  try {
    const result = await window.electronAPI.userInfoGet({ user_id: userStore.userInfo?.user_id })
    if (result.success) {
      userInfo.value = result.data
      userStore.updateUserInfo(userInfo.value)
    } else {
      ElMessage.error(result?.message || '加载用户信息失败')  
    }
  } catch (error) {
    ElMessage.error('加载用户信息失败')
    console.error('加载用户信息失败:', error)
  } finally {
    loading.value = false
  }
}

const handleEditInfo = () => {
  if (!userInfo.value) return
  showEditInfoDialog.value = true
}

const handleEditInfoSuccess = () => {
  loadUserInfo()
}

const handleChangePassword = () => {
  showChangePasswordDialog.value = true
}

const handleChangePasswordSuccess = () => {
  userStore.logout()
  window.location.href = '#/login'
}

onMounted(() => {
  loadUserInfo()
})
</script>

<template>
  <div class="user-info-container">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <h2>个人信息</h2>
          <div class="header-actions">
            <el-button type="primary" @click="handleEditInfo">修改基本信息</el-button>
            <el-button @click="handleChangePassword">修改登录口令</el-button>
          </div>
        </div>
      </template>

      <el-descriptions :column="1" border>
        <el-descriptions-item label="用户名">
          {{ userInfo?.username || '无' }}
        </el-descriptions-item>
        <el-descriptions-item label="姓名">
          {{ userInfo?.name || '无' }}
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">
          {{ userInfo?.email || '无' }}
        </el-descriptions-item>
        <el-descriptions-item label="手机号">
          {{ userInfo?.phone || '无' }}
        </el-descriptions-item>
        <el-descriptions-item label="根口令是否设置">
          {{ userInfo?.root_password_status === 1 ? '是' : '否' }}
        </el-descriptions-item>
        <el-descriptions-item label="密码数量">
          {{ userInfo?.platform_password_count || '0' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ userInfo?.created_at || '未知' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <UserInfoEditDialog
      v-model="showEditInfoDialog"
      :user-info="userInfo"
      @success="handleEditInfoSuccess"
    />

    <UserPasswordChangeDialog
      v-model="showChangePasswordDialog"
      @success="handleChangePasswordSuccess"
    />
  </div>
</template>

<style scoped>
.user-info-container {
  padding: 20px;
}

.info-card {
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

.header-actions {
  display: flex;
  gap: 12px;
}

:deep(.info-descriptions .el-descriptions__label) {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-weight: 500;
  width: 140px;
}

:deep(.info-descriptions .el-descriptions__body) {
  background: var(--bg-primary);
}

:deep(.info-descriptions .el-descriptions__content) {
  color: var(--text-secondary);
}

.info-value {
  font-size: 14px;
  color: var(--text-secondary);
}

:deep(.el-button) {
  transition: all 0.3s;
}

:deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
</style>
