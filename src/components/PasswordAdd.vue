<script setup lang="ts">
import { ref, watch } from 'vue'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import type { PlatformPasswordCreateRequest, PlatformCategoryListResponseData } from '../types/electron'

interface Props {
  modelValue: boolean
  categories: PlatformCategoryListResponseData[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const userStore = useUserStore()
const passwordFormRef = ref()
const loading = ref(false)

const passwordForm = ref({
  category_id: props.categories.find(c => c.name === '其他')?.category_id || 0,
  platform_name: '',
  platform_account: '',
  platform_password: '',
  related_email: '',
  related_phone: '',
  secret_info: '',
  remark: ''
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
  if (newVal) {
    passwordForm.value = {
      category_id: props.categories.find(c => c.name === '其他')?.category_id || 0,
      platform_name: '',
      platform_account: '',
      platform_password: '',
      related_email: '',
      related_phone: '',
      secret_info: '',
      remark: ''
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
    loading.value = true
    try {
      const createData: PlatformPasswordCreateRequest = {
        user_id: userStore.userInfo.user_id,
        category_id: passwordForm.value.category_id,
        platform_name: passwordForm.value.platform_name,
        platform_account: passwordForm.value.platform_account,
        platform_password: passwordForm.value.platform_password,
        related_email: passwordForm.value.related_email,
        related_phone: passwordForm.value.related_phone,
        secret_info: passwordForm.value.secret_info,
        remark: passwordForm.value.remark
      }
      const result = await window.electronAPI.platformPasswordCreate(createData)
      if (result.success) {
        ElMessage.success('创建成功')
        emit('success')
        emit('update:modelValue', false)
      } else {
        ElMessage.error(result.message)
      }
    } catch (error) {
      ElMessage.error('创建失败')
      console.error('创建平台口令失败:', error)
    } finally {
      loading.value = false
    }
  }
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="创建平台口令"
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
      <el-button type="primary" @click="handleSubmit" :loading="loading">创建</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
</style>
