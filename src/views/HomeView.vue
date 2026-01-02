<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { User, UserFilled, ArrowDown, Lock, Key, Document, FolderOpened, SwitchButton } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeMenuIndex = computed(() => {
  const path = route.path
  if (path.startsWith('/home/userInfo')) return 'userInfo'
  if (path.startsWith('/home/password')) return 'passwordManager'
  if (path.startsWith('/home/categoryManager')) return 'categoryManager'
  if (path.startsWith('/home/rootPasswordManager')) return 'rootPasswordManager'
  if (path.startsWith('/home/dataManager')) return 'dataManager'
  return 'passwordManager'
})

const handleMenuSelect = (index: string) => {
  router.push({ path: `/home/${index}` })
}

const handleDropdownCommand = (command: string) => {
  if (command === 'logout') {
    userStore.logout()
    router.push({ path: '/login' })
  } else {
    router.push({ path: `/home/${command}` })
  }
}
</script>

<template>
  <div class="home-container">
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <div class="logo-section">
            <div class="logo-icon">
              <el-icon :size="28"><Lock /></el-icon>
            </div>
            <div class="title">密码管理系统</div>
          </div>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleDropdownCommand">
            <span class="user-info">
              <div class="user-avatar">
                <el-icon :size="20"><UserFilled /></el-icon>
              </div>
              <span class="user-name">{{ userStore.userInfo?.name || '用户' }}</span>
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="userInfo">
                  <el-icon><User /></el-icon>
                  <span>个人信息</span>
                </el-dropdown-item>
                <el-dropdown-item command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  <span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-container>
        <el-aside class="sidebar">
          <el-menu 
            :default-active="activeMenuIndex" 
            @select="handleMenuSelect"
            class="sidebar-menu"
          >
            <el-menu-item index="userInfo">
              <el-icon><User /></el-icon>
              <span>用户信息</span>
            </el-menu-item>
            <el-menu-item index="passwordManager">
              <el-icon><Lock /></el-icon>
              <span>密码管理</span>
            </el-menu-item>
            <el-menu-item index="rootPasswordManager">
              <el-icon><Key /></el-icon>
              <span>根口令管理</span>
            </el-menu-item>
            <el-menu-item index="categoryManager">
              <el-icon><FolderOpened /></el-icon>
              <span>分类管理</span>
            </el-menu-item>
            <el-menu-item index="dataManager">
              <el-icon><Document /></el-icon>
              <span>数据管理</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main class="main-content">
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.home-container {
  height: 100vh;
  width: 100vw;
  background: var(--bg-secondary);
}

.home-container .el-container {
  height: 100%;
}

.header {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  box-shadow: var(--shadow-sm);
  height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 44px;
  height: 44px;
  background: var(--gradient-primary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: var(--shadow-md);
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  border-radius: var(--radius-full);
  transition: all 0.3s;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
}

.user-info:hover {
  background: var(--bg-tertiary);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: var(--gradient-primary);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.user-name {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

.sidebar {
  background: var(--bg-primary);
  width: 200px;
  border-right: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.sidebar-menu {
  border-right: none;
  padding: 12px 8px;
}

:deep(.sidebar-menu .el-menu-item) {
  border-radius: var(--radius-md);
  margin-bottom: 4px;
  transition: all 0.3s;
  color: var(--text-secondary);
  font-weight: 500;
}

:deep(.sidebar-menu .el-menu-item:hover) {
  background: var(--bg-secondary);
  color: var(--primary-color);
}

:deep(.sidebar-menu .el-menu-item.is-active) {
  background: var(--gradient-primary);
  color: white;
  box-shadow: var(--shadow-md);
}

:deep(.sidebar-menu .el-menu-item.is-active .el-icon) {
  color: white;
}

:deep(.sidebar-menu .el-menu-item .el-icon) {
  margin-right: 8px;
  font-size: 18px;
}

.main-content {
  background: var(--bg-secondary);
  padding: 24px;
  overflow-y: auto;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
}

:deep(.el-dropdown-menu__item .el-icon) {
  font-size: 16px;
}
</style>