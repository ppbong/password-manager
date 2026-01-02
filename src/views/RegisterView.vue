<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Message, Phone } from '@element-plus/icons-vue'
import type { UserRegisterRequest } from '../types/electron'

const router = useRouter()
const registerFormRef = ref()
const loading = ref(false)

const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
  name: '',
  email: '',
  phone: '',
  remark: ''
})

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入口令', trigger: 'blur' },
    { min: 6, max: 20, message: '口令长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认口令', trigger: 'blur' },
    { validator: (_rule: any, value: string, callback: (error?: Error) => void) => {
        if (value !== registerForm.value.password) {
          callback(new Error('两次输入的口令不一致'))
        } else {
          callback()
        }
      }, trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: false, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: false, message: '请输入手机', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  const valid = await registerFormRef.value.validate()
  if (valid) {
    loading.value = true
    try {
      const registerData : UserRegisterRequest = {
        username: registerForm.value.username,
        password: registerForm.value.password,
        name: registerForm.value.name,
        email: registerForm.value.email,
        phone: registerForm.value.phone,
        remark: registerForm.value.remark
      }
      const result = await window.electronAPI.userRegister(registerData)
      if (result.success) {
        ElMessage.success('注册成功，请登录')
        router.push('/login')
      } else {
        ElMessage.error(result.message)
      }
    } catch (error) {
      ElMessage.error('注册失败，请稍后重试')
      console.error('Register error:', error)
    } finally {
      loading.value = false
    }
  }
}

const handleLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="register-container">
    <div class="register-background"></div>
    <div class="register-background-2"></div>
    <el-card class="register-card">
      <template #header>
        <div class="card-header">
          <div class="logo-section">
            <div class="logo-icon">
              <el-icon :size="32"><Lock /></el-icon>
            </div>
            <h2>用户注册</h2>
          </div>
        </div>
      </template>
      <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef" label-width="0">
        <el-form-item prop="username">
          <el-input 
            v-model="registerForm.username" 
            placeholder="请输入用户名" 
            autocomplete="off"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input 
            v-model="registerForm.password" 
            type="password" 
            placeholder="请输入口令" 
            show-password 
            autocomplete="off"
            size="large"
            :prefix-icon="Lock"
          />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input 
            v-model="registerForm.confirmPassword" 
            type="password" 
            placeholder="请确认口令" 
            show-password 
            autocomplete="off"
            size="large"
            :prefix-icon="Lock"
          />
        </el-form-item>
        <el-form-item prop="name">
          <el-input 
            v-model="registerForm.name" 
            placeholder="请输入姓名" 
            autocomplete="off"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="email">
          <el-input 
            v-model="registerForm.email" 
            placeholder="请输入邮箱" 
            autocomplete="off"
            size="large"
            :prefix-icon="Message"
          />
        </el-form-item>
        <el-form-item prop="phone">
          <el-input 
            v-model="registerForm.phone" 
            placeholder="请输入手机" 
            autocomplete="off"
            size="large"
            :prefix-icon="Phone"
          />
        </el-form-item>
        <el-form-item prop="remark">
          <el-input 
            v-model="registerForm.remark" 
            type="textarea" 
            placeholder="请输入留存信息" 
            :rows="2" 
            autocomplete="off"
            size="large"
          />
        </el-form-item>
        <el-button 
          type="primary" 
          @click="handleRegister" 
          :loading="loading" 
          class="register-btn"
          size="large"
        >
          注册
        </el-button>
        <div class="login-link">
          <span>已有账号？</span>
          <el-link type="primary" @click="handleLogin">立即登录</el-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--gradient-primary);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

.register-background {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  animation: rotate 20s linear infinite;
}

.register-background-2 {
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

.register-card {
  width: 100%;
  max-width: 480px;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: var(--radius-xl);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  position: relative;
  z-index: 1;
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
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
  padding: 8px 0;
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
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: var(--shadow-lg);
}

.card-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 24px;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-input__wrapper) {
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s;
  padding: 8px 16px;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px var(--primary-light);
}

:deep(.el-input__inner) {
  font-size: 15px;
}

:deep(.el-textarea__inner) {
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s;
  font-size: 15px;
}

:deep(.el-textarea__inner:hover) {
  box-shadow: var(--shadow-md);
}

:deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 2px var(--primary-light);
}

.register-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 8px;
  border-radius: var(--radius-md);
  background: var(--gradient-primary);
  border: none;
  transition: all 0.3s;
}

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.login-link {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  color: var(--text-secondary);
  font-size: 14px;
}

.login-link .el-link {
  font-weight: 500;
}
</style>