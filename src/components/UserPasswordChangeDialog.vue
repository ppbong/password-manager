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
    class="password-change-dialog"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="dialog-form"
    >
      <el-form-item label="旧口令" prop="old_password">
        <el-input
          v-model="form.old_password"
          type="password"
          placeholder="请输入旧口令"
          show-password
          class="form-input"
        />
      </el-form-item>
      <el-form-item label="新口令" prop="new_password">
        <el-input
          v-model="form.new_password"
          type="password"
          placeholder="请输入新口令"
          show-password
          class="form-input"
        />
      </el-form-item>
      <el-form-item label="确认口令" prop="confirm_password">
        <el-input
          v-model="form.confirm_password"
          type="password"
          placeholder="请再次输入新口令"
          show-password
          class="form-input"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose" class="dialog-btn">取消</el-button>
      <el-button type="primary" @click="handleConfirm" class="dialog-btn dialog-btn-primary">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
:deep(.password-change-dialog .el-dialog__header) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-bottom: 1px solid var(--border-color);
  padding: 20px 24px;
}

:deep(.password-change-dialog .el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

:deep(.password-change-dialog .el-dialog__body) {
  padding: 24px;
}

:deep(.password-change-dialog .el-dialog__footer) {
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

:deep(.form-input .el-input__wrapper) {
  border-radius: var(--radius-md);
  transition: all 0.3s;
  box-shadow: 0 0 0 1px var(--border-color) inset;
}

:deep(.form-input .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--primary-color) inset;
}

:deep(.form-input .el-input__wrapper.is-focus) {
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
