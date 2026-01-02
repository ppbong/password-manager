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
  >
    <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="120px">
      <el-form-item label="平台分类" prop="category_id">
        <el-select v-model="passwordForm.category_id" placeholder="请选择平台分类" style="width: 100%">
          <el-option
            v-for="category in categories"
            :key="category.category_id"
            :label="category.name"
            :value="category.category_id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="平台名称" prop="platform_name">
        <el-input v-model="passwordForm.platform_name" placeholder="请输入平台名称" />
      </el-form-item>
      <el-form-item label="平台账号" prop="platform_account">
        <el-input v-model="passwordForm.platform_account" placeholder="请输入平台账号" />
      </el-form-item>
      <el-form-item label="平台口令" prop="platform_password">
        <el-input v-model="passwordForm.platform_password" type="password" placeholder="请输入平台口令" show-password />
      </el-form-item>
      <el-form-item label="关联邮箱" prop="related_email">
        <el-input v-model="passwordForm.related_email" placeholder="请输入关联邮箱" />
      </el-form-item>
      <el-form-item label="关联手机" prop="related_phone">
        <el-input v-model="passwordForm.related_phone" placeholder="请输入关联手机" />
      </el-form-item>
      <el-form-item label="保密信息" prop="secret_info">
        <el-input v-model="passwordForm.secret_info" type="textarea" placeholder="请输入保密信息" :rows="2" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="passwordForm.remark" type="textarea" placeholder="请输入备注" :rows="3" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">更新</el-button>
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
</style>
