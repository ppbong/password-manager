<script setup lang="ts">
import { onMounted } from 'vue'
import { ElMessage } from 'element-plus'

onMounted(() => {
  if (!window.electronAPI) {
    ElMessage.error('electronAPI 未初始化')
    return
  }
})
</script>

<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<style scoped>
.app-container {
  width: 100%;
  height: 100vh;
  margin: 0 auto;
  padding: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}
</style>
