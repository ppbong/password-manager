<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

interface Props {
  modelValue: boolean
  title?: string
  message?: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', rootPassword: string): void
}

const props = withDefaults(defineProps<Props>(), {
  title: '验证根口令',
  message: '请输入根口令以继续操作'
})

const emit = defineEmits<Emits>()

const rootPassword = ref('')
const loading = ref(false)

const handleConfirm = () => {
  if (!rootPassword.value) {
    ElMessage.warning('请输入根口令')
    return
  }
  
  loading.value = true
  emit('confirm', rootPassword.value)
}

const handleCancel = () => {
  emit('update:modelValue', false)
}

const handleClosed = () => {
  rootPassword.value = ''
  loading.value = false
}

watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    rootPassword.value = ''
    loading.value = false
  }
})

const setLoading = (value: boolean) => {
  loading.value = value
}

const closeDialog = () => {
  emit('update:modelValue', false)
}

defineExpose({
  setLoading,
  closeDialog
})
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="title"
    width="400px"
    @close="handleClosed"
    :close-on-click-modal="false"
    class="root-password-dialog"
  >
    <el-alert :title="message" type="warning" :closable="false" class="dialog-alert" show-icon center />
    
    <el-form label-width="80px" class="dialog-form">
      <el-form-item label="根口令">
        <el-input
          v-model="rootPassword"
          type="password"
          placeholder="请输入根口令"
          show-password
          @keyup.enter="handleConfirm"
          class="form-input"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel" class="dialog-btn">取消</el-button>
      <el-button type="primary" @click="handleConfirm" :loading="loading" class="dialog-btn dialog-btn-primary">确认</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
:deep(.root-password-dialog .el-dialog__header) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-bottom: 1px solid var(--border-color);
  padding: 20px 24px;
}

:deep(.root-password-dialog .el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

:deep(.root-password-dialog .el-dialog__body) {
  padding: 24px;
}

:deep(.root-password-dialog .el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
}

.dialog-alert {
  margin-bottom: 20px;
  border-radius: var(--radius-md);
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
