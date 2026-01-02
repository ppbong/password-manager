<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'
import type { UserPasswordUpdateRequest } from '../types/electron'

interface Props {
  modelValue: boolean
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
  old_password: '',
  new_password: '',
  confirm_password: ''
})

const rules = {
  old_password: [
    { required: true, message: '请输入旧口令', trigger: 'blur' }
  ],
  new_password: [
    { required: true, message: '请输入新口令', trigger: 'blur' },
    { min: 6, message: '口令长度不能少于6位', trigger: 'blur' }
  ],
  confirm_password: [
    { required: true, message: '请确认新口令', trigger: 'blur' },
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (value !== form.value.new_password) {
          callback(new Error('两次输入的口令不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

watch(() => props.modelValue, (val) => {
  if (val) {
    form.value = {
      old_password: '',
      new_password: '',
      confirm_password: ''
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
      const requestData: UserPasswordUpdateRequest = {
        user_id: userStore.userInfo.user_id,
        old_password: form.value.old_password,
        new_password: form.value.new_password
      }
      const result = await window.electronAPI.userPasswordUpdate(requestData)
      if (result.success) {
        ElMessage.success('修改成功，请重新登录')
        emit('success')
        emit('update:modelValue', false)
      } else {
        ElMessage.error(result.message)
      }
    } catch (error) {
      ElMessage.error('修改失败')
      console.error('修改登录口令失败:', error)
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
    title="修改登录口令"
    width="500px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="旧口令" prop="old_password">
        <el-input
          v-model="form.old_password"
          type="password"
          placeholder="请输入旧口令"
          show-password
        />
      </el-form-item>
      <el-form-item label="新口令" prop="new_password">
        <el-input
          v-model="form.new_password"
          type="password"
          placeholder="请输入新口令"
          show-password
        />
      </el-form-item>
      <el-form-item label="确认口令" prop="confirm_password">
        <el-input
          v-model="form.confirm_password"
          type="password"
          placeholder="请再次输入新口令"
          show-password
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>
