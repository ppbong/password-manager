<script setup lang="ts">
import { ref, watch } from 'vue'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import RootPasswordDialog from './RootPasswordDialog.vue'
import type { PlatformCategoryListResponseData, PlatformPasswordListResponseData, PlatformPasswordUpdateRequest } from '../types/electron'

interface Props {
  modelValue: boolean
  categories: PlatformCategoryListResponseData[]
  passwordData: PlatformPasswordListResponseData
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const userStore = useUserStore()
const passwordFormRef = ref()
const rootPasswordDialogRef = ref()
const loading = ref(false)
const showRootPasswordDialog = ref(false)

const passwordForm = ref({
  ...props.passwordData,
  platform_password: '',
  secret_info: '',
})

const passwordRules = {
  category_name: [
    { required: true, message: '请选择平台分类', trigger: 'change' }
  ],
  platform_name: [
    { required: true, message: '请输入平台名称', trigger: 'blur' },
    { min: 2, max: 50, message: '平台名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  platform_account: [
    { required: true, message: '请输入平台账号', trigger: 'blur' }
  ],
  platform_password: [
    { required: true, message: '请输入平台口令', trigger: 'blur' },
    { min: 6, message: '口令长度至少 6 个字符', trigger: 'blur' }
  ],
  related_email: [
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  related_phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }
  ]
}

watch(() => props.modelValue, (newVal) => {
  if (newVal && props.passwordData) {
    passwordForm.value = {
      ...props.passwordData,
      platform_password: '',
      secret_info: '',
    }
  }
})

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleSubmit = async () => {
  if (!passwordFormRef.value) return
  const valid = await passwordFormRef.value.validate()
  if (valid) {
    if (!userStore.userInfo?.user_id) {
      ElMessage.error('用户信息异常，请重新登录')
      return
    }

    showRootPasswordDialog.value = true
  }
}

const handleRootPasswordConfirm = async (rootPassword: string) => {
  loading.value = true
  try {
    const passwordUpdateRequest: PlatformPasswordUpdateRequest = {
      ...passwordForm.value,
      root_password: rootPassword,
      user_id: userStore.userInfo.user_id,
    }

    const result = await window.electronAPI.platformPasswordUpdate(passwordUpdateRequest)
    if (result.success) {
      ElMessage.success('更新成功')
      emit('success')
      emit('update:modelValue', false)
      rootPasswordDialogRef.value?.closeDialog()
    } else {
      ElMessage.error(result.message)
      rootPasswordDialogRef.value?.setLoading(false)
    }
  } catch (error) {
    ElMessage.error('更新失败')
    console.error('更新平台口令失败:', error)
    rootPasswordDialogRef.value?.setLoading(false)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="修改平台口令"
    width="600px"
    @close="handleClose"
    class="password-edit-dialog"
  >
    <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="120px" class="dialog-form">
      <el-form-item label="平台分类" prop="category_id">
        <el-select v-model="passwordForm.category_id" placeholder="请选择平台分类" style="width: 100%" class="form-select">
          <el-option
            v-for="category in categories"
            :key="category.category_id"
            :label="category.name"
            :value="category.category_id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="平台名称" prop="platform_name">
        <el-input v-model="passwordForm.platform_name" placeholder="请输入平台名称" class="form-input" />
      </el-form-item>
      <el-form-item label="平台账号" prop="platform_account">
        <el-input v-model="passwordForm.platform_account" placeholder="请输入平台账号" class="form-input" />
      </el-form-item>
      <el-form-item label="平台口令" prop="platform_password">
        <el-input v-model="passwordForm.platform_password" type="password" placeholder="请输入平台口令" show-password class="form-input" />
      </el-form-item>
      <el-form-item label="关联邮箱" prop="related_email">
        <el-input v-model="passwordForm.related_email" placeholder="请输入关联邮箱" class="form-input" />
      </el-form-item>
      <el-form-item label="关联手机" prop="related_phone">
        <el-input v-model="passwordForm.related_phone" placeholder="请输入关联手机" class="form-input" />
      </el-form-item>
      <el-form-item label="保密信息" prop="secret_info">
        <el-input v-model="passwordForm.secret_info" type="textarea" placeholder="请输入保密信息" :rows="2" class="form-textarea" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="passwordForm.remark" type="textarea" placeholder="请输入备注" :rows="3" class="form-textarea" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose" class="dialog-btn">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading" class="dialog-btn dialog-btn-primary">更新</el-button>
    </template>
  </el-dialog>
  
  <RootPasswordDialog
    ref="rootPasswordDialogRef"
    v-model="showRootPasswordDialog"
    title="验证根口令"
    message="请输入根口令以确认修改平台口令"
    @confirm="handleRootPasswordConfirm"
  />
</template>

<style scoped>
:deep(.password-edit-dialog .el-dialog__header) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-bottom: 1px solid var(--border-color);
  padding: 20px 24px;
}

:deep(.password-edit-dialog .el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

:deep(.password-edit-dialog .el-dialog__body) {
  padding: 24px;
}

:deep(.password-edit-dialog .el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
}

.dialog-form {
  margin-top: 10px;
}

:deep(.dialog-form .el-form-item__label) {
  color: var(--text-primary);
  font-weight: 500;
}

:deep(.form-input .el-input__wrapper),
:deep(.form-select .el-input__wrapper) {
  border-radius: var(--radius-md);
  transition: all 0.3s;
  box-shadow: 0 0 0 1px var(--border-color) inset;
}

:deep(.form-input .el-input__wrapper:hover),
:deep(.form-select .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--primary-color) inset;
}

:deep(.form-input .el-input__wrapper.is-focus),
:deep(.form-select .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--primary-color) inset;
}

:deep(.form-textarea .el-textarea__inner) {
  border-radius: var(--radius-md);
  transition: all 0.3s;
  box-shadow: 0 0 0 1px var(--border-color) inset;
}

:deep(.form-textarea .el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px var(--primary-color) inset;
}

:deep(.form-textarea .el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px var(--primary-color) inset;
}

.dialog-btn {
  padding: 10px 24px;
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: all 0.3s;
}

.dialog-btn-primary {
  background: var(--gradient-primary);
  border: none;
}

.dialog-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
</style>
