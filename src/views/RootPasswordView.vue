<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores'
import { ElMessage } from 'element-plus'
import { Key, Edit } from '@element-plus/icons-vue'

const userStore = useUserStore()

const loading = ref(false)
const rootPasswordSet = ref(false)
const showSetDialog = ref(false)
const showUpdateDialog = ref(false)
const setFormRef = ref()
const updateFormRef = ref()

const setForm = ref({
  root_password: '',
  confirm_password: '',
  hint: ''
})

const updateForm = ref({
  old_password: '',
  new_password: '',
  confirm_password: '',
  hint: ''
})

const validateConfirmPassword = (_rule: any, value: any, callback: any, password: string) => {
  if (value !== password) {
    callback(new Error('两次输入的口令不一致'))
  } else {
    callback()
  }
}

const setRules = {
  root_password: [
    { required: true, message: '请输入根口令', trigger: 'blur' },
    { min: 6, message: '根口令长度至少 6 个字符', trigger: 'blur' }
  ],
  confirm_password: [
    { required: true, message: '请再次输入根口令', trigger: 'blur' },
    {
      validator: (_rule: any, value: any, callback: any) => {
        validateConfirmPassword(_rule, value, callback, setForm.value.root_password)
      },
      trigger: 'blur'
    }
  ]
}

const updateRules = {
  old_password: [
    { required: true, message: '请输入当前根口令', trigger: 'blur' }
  ],
  new_password: [
    { required: true, message: '请输入新根口令', trigger: 'blur' },
    { min: 6, message: '根口令长度至少 6 个字符', trigger: 'blur' }
  ],
  confirm_password: [
    { required: true, message: '请再次输入新根口令', trigger: 'blur' },
    {
      validator: (_rule: any, value: any, callback: any) => {
        validateConfirmPassword(_rule, value, callback, updateForm.value.new_password)
      },
      trigger: 'blur'
    }
  ]
}

const checkRootPasswordStatus = async () => {
  if (!userStore.userInfo?.user_id) {
    ElMessage.error('用户信息异常，请重新登录')
    return
  }
  try {
    const result = await window.electronAPI.rootPasswordStatus({
      user_id: userStore.userInfo.user_id
    })
    if (result.success && result.data?.root_password_status === 1) {
      rootPasswordSet.value = true
    }
  } catch (error) {
    console.error('检查根口令状态失败:', error)
  }
}

const handleSetRootPassword = async () => {
  if (!setFormRef.value) return
  const valid = await setFormRef.value.validate()
  if (valid) {
    if (!userStore.userInfo?.user_id) {
      ElMessage.error('用户信息异常，请重新登录')
      return
    }
    loading.value = true
    try {
      const result = await window.electronAPI.rootPasswordSet({
        user_id: userStore.userInfo.user_id,
        root_password: setForm.value.root_password,
        root_password_hint: setForm.value.hint
      })
      if (result.success) {
        ElMessage.success('根口令设置成功')
        showSetDialog.value = false
        setForm.value = {
          root_password: '',
          confirm_password: '',
          hint: ''
        }
        rootPasswordSet.value = true

        // 更新用户状态为已设置根口令
        userStore.userInfo.root_password_status = 1
      } else {
        ElMessage.error(result.message)
      }
    } catch (error) {
      ElMessage.error('设置根口令失败')
      console.error('设置根口令失败:', error)
    } finally {
      loading.value = false
    }
  }
}

const handleUpdateRootPassword = async () => {
  if (!updateFormRef.value) return
  const valid = await updateFormRef.value.validate()
  if (valid) {
    if (!userStore.userInfo?.user_id) {
      ElMessage.error('用户信息异常，请重新登录')
      return
    }
    loading.value = true
    try {
      const result = await window.electronAPI.rootPasswordUpdate({
        user_id: userStore.userInfo.user_id,
        old_root_password: updateForm.value.old_password,
        new_root_password: updateForm.value.new_password,
        new_root_password_hint: updateForm.value.hint
      })
      if (result.success) {
        ElMessage.success('根口令修改成功')
        showUpdateDialog.value = false
        updateForm.value = {
          old_password: '',
          new_password: '',
          confirm_password: '',
          hint: ''
        }
      } else {
        ElMessage.error(result.message)
      }
    } catch (error) {
      ElMessage.error('修改根口令失败')
      console.error('修改根口令失败:', error)
    } finally {
      loading.value = false
    }
  }
}

onMounted(() => {
  checkRootPasswordStatus()
})
</script>

<template>
  <div class="root-password-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>根口令管理</h2>
        </div>
      </template>

      <div v-if="!rootPasswordSet" class="root-password-set">
        <el-alert title="根口令说明" type="info" :closable="false" class="mb-20" show-icon center>
          根口令用于加密和解密您的平台口令，请妥善保管。设置后无法找回，请务必牢记。
        </el-alert>
        <el-button type="primary" size="large" @click="showSetDialog = true">
          <el-icon><Key /></el-icon>
          <span>设置根口令</span>
        </el-button>
      </div>

      <div v-else class="root-password-update">
        <el-alert title="根口令已设置" type="success" :closable="false" class="mb-20" show-icon center>
          根口令已成功设置，可随时修改。请妥善保管您的根口令。
        </el-alert>
        <el-button type="warning" size="large" @click="showUpdateDialog = true">
          <el-icon><Edit /></el-icon>
          <span>修改根口令</span>
        </el-button>
      </div>
    </el-card>

    <!-- 设置根口令对话框 -->
    <el-dialog v-model="showSetDialog" title="设置根口令" width="500px" :close-on-click-modal="false">
      <el-form :model="setForm" :rules="setRules" ref="setFormRef" label-width="120px">
        <el-form-item label="根口令" prop="root_password">
          <el-input v-model="setForm.root_password" type="password" placeholder="请输入根口令" show-password />
        </el-form-item>
        <el-form-item label="确认口令" prop="confirm_password">
          <el-input v-model="setForm.confirm_password" type="password" placeholder="请再次输入根口令" show-password />
        </el-form-item>
        <el-form-item label="安全提示" prop="hint">
          <el-input v-model="setForm.hint" placeholder="请输入安全提示（可选）" />
        </el-form-item>
        <el-alert title="重要提示" type="warning" :closable="false" class="mt-10" show-icon center>
          根口令用于加密您的所有平台口令，请务必牢记。设置后无法找回，丢失根口令将导致无法访问您的数据。
        </el-alert>
      </el-form>
      <template #footer>
        <el-button @click="showSetDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSetRootPassword" :loading="loading">设置</el-button>
      </template>
    </el-dialog>

    <!-- 修改根口令对话框 -->
    <el-dialog v-model="showUpdateDialog" title="修改根口令" width="500px" :close-on-click-modal="false">
      <el-form :model="updateForm" :rules="updateRules" ref="updateFormRef" label-width="120px">
        <el-form-item label="当前口令" prop="old_password">
          <el-input v-model="updateForm.old_password" type="password" placeholder="请输入当前根口令" show-password />
        </el-form-item>
        <el-form-item label="新口令" prop="new_password">
          <el-input v-model="updateForm.new_password" type="password" placeholder="请输入新根口令" show-password />
        </el-form-item>
        <el-form-item label="确认口令" prop="confirm_password">
          <el-input v-model="updateForm.confirm_password" type="password" placeholder="请再次输入新根口令" show-password />
        </el-form-item>
        <el-form-item label="安全提示" prop="hint">
          <el-input v-model="updateForm.hint" placeholder="请输入安全提示（可选）" />
        </el-form-item>
        <el-alert title="重要提示" type="warning" :closable="false" class="mt-10" show-icon center>
          根口令用于加密您的所有平台口令，请务必牢记。设置后无法找回，丢失根口令将导致无法访问您的数据。
        </el-alert>
      </el-form>
      <template #footer>
        <el-button @click="showUpdateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateRootPassword" :loading="loading">修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.root-password-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.root-password-set,
.root-password-update {
  text-align: center;
  padding: 60px 20px;
}

.root-password-set .el-button,
.root-password-update .el-button {
  margin: 10px;
}

.mb-20 {
  margin-bottom: 20px;
}

.mt-10 {
  margin-top: 10px;
}
</style>
