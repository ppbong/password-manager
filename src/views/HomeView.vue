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
          <div class="logo">
            <img src="../assets/logo.png" alt="logo">
          </div>
          <div class="title">
            密码管理系统
          </div>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleDropdownCommand">
            <span class="user-info">
              <el-icon><UserFilled /></el-icon>
              {{ userStore.userInfo?.name || '用户' }}
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="userInfo">
                  <el-icon><User /></el-icon>
                  个人信息
                </el-dropdown-item>
                <el-dropdown-item command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-container>
        <el-aside>
          <el-menu :default-active="activeMenuIndex" @select="handleMenuSelect">
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
        <el-main>
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
}

.home-container .el-container {
  height: 100%;
}

.el-aside {
  background-color: #545c64;
  width: 160px;
}

.el-aside .el-menu {
  border-right: none;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-left h1 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.header-right .user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.header-right .user-info:hover {
  background-color: #f5f5f5;
}

.el-main {
  background-color: #f5f5f5;
  padding: 20px;
}
</style>