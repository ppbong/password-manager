<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'
import type { UserInfoUpdateRequest } from '../types/electron'

interface Props {
  modelValue: boolean
  userInfo?: {
    name?: string
    email?: string
    phone?: string
    remark?: string
  }
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const userStore = useUserStore()
const formRef = ref()

const form = ref({
  name: '',
  email: '',
  phone: '',
  remark: ''
})

const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

watch(() => props.modelValue, (val) => {
  if (val && props.userInfo) {
    form.value = {
      name: props.userInfo.name || '',
      email: props.userInfo.email || '',
      phone: props.userInfo.phone || '',
      remark: props.userInfo.remark || ''
    }
  }
})

const handleConfirm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    
    if (!userStore.userInfo?.user_id) {
      ElMessage.error('用户信息异常，请重新登录')
      return
    }

    try {
      const requestData: UserInfoUpdateRequest = {
        user_id: userStore.userInfo.user_id,
        name: form.value.name,
        email: form.value.email,
        phone: form.value.phone,
        remark: form.value.remark
      }
      const result = await window.electronAPI.userInfoUpdate(requestData)
      if (result.success) {
        ElMessage.success('修改成功')
        emit('success')
        emit('update:modelValue', false)
      } else {
        ElMessage.error(result.message)
      }
    } catch (error) {
      ElMessage.error('修改失败')
      console.error('修改用户信息失败:', error)
    }
  })
}

const handleClose = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="修改基本信息"
    width="500px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="姓名" prop="name">
        <el-input v-model="form.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="form.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>
