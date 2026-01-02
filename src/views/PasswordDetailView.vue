<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore, usePasswordStore } from '../stores'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import type { PlatformPasswordDetailRequest } from '../types/electron'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const passwordStore = usePasswordStore()

const loading = ref(false)
const passwordDetail = ref<any>(null)

const passwordId = computed(() => {
  return parseInt(route.params.passwordId as string) || passwordStore.selectedPassword?.password_id
})

const rootPassword = computed(() => {
  return route.query.rootPassword as string || ''
})

const loadPasswordDetail = async () => {
  if (!rootPassword.value) {
    ElMessage.error('根口令参数缺失')
    router.back()
    return
  }
  
  loading.value = true
  try {
    const requestData: PlatformPasswordDetailRequest = {
      password_id: passwordId.value,
      user_id: userStore.userInfo.user_id,
      root_password: rootPassword.value
    }
    const result = await window.electronAPI.platformPasswordDetail(requestData)
    if (result.success) {
      passwordDetail.value = result.data
    } else {
      ElMessage.error(result.message)
      router.back()
    }
  } catch (error) {
    ElMessage.error('加载密码详情失败')
    console.error('加载密码详情失败:', error)
    router.back()
  } finally {
    loading.value = false
  }
}

const handleCopyPassword = async () => {
  if (!passwordDetail.value?.platform_password) {
    ElMessage.warning('没有可复制的口令')
    return
  }
  try {
    await navigator.clipboard.writeText(passwordDetail.value.platform_password)
    ElMessage.success('口令已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
    console.error('复制口令失败:', error)
  }
}

const handleBack = () => {
  router.back()
}

onMounted(() => {
  if (!passwordId.value) {
    ElMessage.error('密码ID无效')
    router.back()
  } else {
    loadPasswordDetail()
  }
})
</script>

<template>
  <div class="password-detail-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button @click="handleBack" circle>
              <el-icon><ArrowLeft /></el-icon>
            </el-button>
            <h2>口令详情</h2>
          </div>
        </div>
      </template>

      <div v-if="loading" class="loading-section">
        <el-skeleton :rows="5" animated />
      </div>

      <div v-else-if="passwordDetail" class="password-detail-section">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="平台分类">
            {{ passwordDetail.category_name || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="平台名称">
            {{ passwordDetail.platform_name || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="平台账号">
            {{ passwordDetail.platform_account || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="平台口令">
            <div class="password-display">
              <el-input
                :model-value="passwordDetail.platform_password"
                type="password"
                show-password
                readonly
                style="width: 400px;"
              />
              <el-button type="primary" @click="handleCopyPassword" style="margin-left: 10px;">
                复制
              </el-button>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="保密信息">
            {{ passwordDetail.secret_info || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="关联邮箱">
            {{ passwordDetail.related_email || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="关联手机">
            {{ passwordDetail.related_phone || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="备注">
            {{ passwordDetail.remark || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ passwordDetail.created_at || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ passwordDetail.updated_at || '无' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <el-empty v-else-if="!loading" description="暂无数据" />
    </el-card>
  </div>
</template>

<style scoped>
.password-detail-container {
  padding: 20px;
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

.card-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.password-input-section {
  padding: 20px 0;
}

.loading-section {
  padding: 20px 0;
}

.password-detail-section {
  padding: 20px 0;
}

.password-display {
  display: flex;
  align-items: center;
}
</style>
