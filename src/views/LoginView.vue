<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>用户登录</h2>
        </div>
      </template>
      <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" autocomplete="off" />
        </el-form-item>
        <el-form-item label="口令" prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入口令" show-password autocomplete="off" />
        </el-form-item>
        <el-button type="primary" @click="handleLogin" :loading="loading" class="login-btn">登录</el-button>
        <el-button @click="handleRegister" class="register-btn">注册</el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'
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
        router.push('/home')
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

onMounted(() => {
  if (!window.electronAPI) {
    ElMessage.error('electronAPI 未初始化')
    return
  }
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  animation: rotate 20s linear infinite;
}

.login-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.05) 0%, transparent 30%);
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
  width: 400px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.95);
  position: relative;
  z-index: 1;
}

.card-header {
  display: flex;
  justify-content: center;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  color: #667eea;
  font-weight: 600;
}

.login-btn {
  width: 100%;
}

.register-btn {
  width: 100%;
  margin: 15px auto;
}

:deep(.el-form-item__label) {
  color: #667eea;
  font-weight: 500;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  transition: all 0.3s;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #667eea inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #667eea inset;
}
</style>