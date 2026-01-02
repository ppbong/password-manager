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
  >
    <el-alert :title="message" type="warning" :closable="false" style="margin-bottom: 20px" show-icon center />
    
    <el-form label-width="80px">
      <el-form-item label="根口令">
        <el-input
          v-model="rootPassword"
          type="password"
          placeholder="请输入根口令"
          show-password
          @keyup.enter="handleConfirm"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm" :loading="loading">确认</el-button>
    </template>
  </el-dialog>
</template>
