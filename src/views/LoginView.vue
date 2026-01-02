<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
import { Lock, User } from '@element-plus/icons-vue'
import type { UserLoginRequest } from '../types/electron'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref()
const loading = ref(false)

const loginForm = ref({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入口令', trigger: 'blur' },
    { min: 6, max: 20, message: '口令长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  const valid = await loginFormRef.value.validate()
  if (valid) {
    loading.value = true
    try {
      const loginData : UserLoginRequest = {
        username: loginForm.value.username,
        password: loginForm.value.password
      }
      const result = await window.electronAPI.userLogin(loginData)
      if (result.success) {
        userStore.login(result.data, 'dummy-token')
        ElMessage.success('登录成功')
        router.push('/home/passwordManager')
      } else {
        ElMessage.error(result.message)
      }
    } catch (error) {
      ElMessage.error('登录失败，请稍后重试')
      console.error('Login error:', error)
    } finally {
      loading.value = false
    }
  }
}

const handleRegister = () => {
  router.push('/register')
}
</script>

<template>
  <div class="login-container">
    <div class="login-background"></div>
    <div class="login-background-2"></div>
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <div class="logo-section">
            <div class="logo-icon">
              <el-icon :size="32"><Lock /></el-icon>
            </div>
            <h2>密码管理系统</h2>
          </div>
        </div>
      </template>
      <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" label-width="0">
        <el-form-item prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入用户名" 
            autocomplete="off"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入口令" 
            show-password 
            autocomplete="off"
            size="large"
            :prefix-icon="Lock"
          />
        </el-form-item>
        <el-button 
          type="primary" 
          @click="handleLogin" 
          :loading="loading" 
          class="login-btn"
          size="large"
        >
          登录
        </el-button>
        <div class="register-link">
          <span>还没有账号？</span>
          <el-link type="primary" @click="handleRegister">立即注册</el-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: var(--gradient-primary);
  position: relative;
  overflow: hidden;
}

.login-background {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  animation: rotate 30s linear infinite;
}

.login-background-2 {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.04) 0%, transparent 30%);
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.login-card {
  width: 420px;
  box-shadow: var(--glass-shadow);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: var(--radius-xl);
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  position: relative;
  z-index: 1;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 64px;
  height: 64px;
  background: var(--gradient-primary);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: var(--shadow-md);
}

.card-header h2 {
  margin: 0;
  color: var(--primary-color);
  font-weight: 600;
  font-size: 24px;
}

.login-btn {
  width: 100%;
  margin-top: 20px;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  border-radius: var(--radius-md);
}

.register-link {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  font-size: 14px;
  color: var(--text-secondary);
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-input__wrapper) {
  border-radius: var(--radius-md);
  padding: 8px 16px;
  box-shadow: 0 0 0 1px var(--border-color) inset;
  transition: all 0.3s;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--primary-color) inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--primary-color) inset;
}

:deep(.el-input__inner) {
  font-size: 15px;
}
</style>
