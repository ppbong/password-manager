import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue')
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: 'userInfo',
          name: 'UserInfo',
          component: () => import('../views/UserInfoView.vue')
        },
        {
          path: 'passwordManager',
          name: 'Password',
          component: () => import('../views/PasswordView.vue')
        },
        {
          path: 'password/:passwordId',
          name: 'PasswordDetail',
          component: () => import('../views/PasswordDetailView.vue')
        },
        {
          path: 'password/:passwordId/history',
          name: 'PasswordHistory',
          component: () => import('../views/PasswordHistoryView.vue')
        },
        {
          path: 'password/:passwordId/history/:historyId',
          name: 'PasswordHistoryDetail',
          component: () => import('../views/PasswordHistoryDetailView.vue')
        },
        {
          path: 'categoryManager',
          name: 'Category',
          component: () => import('../views/CategoryView.vue')
        },
        {
          path: 'rootPasswordManager',
          name: 'RootPassword',
          component: () => import('../views/RootPasswordView.vue')
        },
        {
          path: 'dataManager',
          name: 'Data',
          component: () => import('../views/DataView.vue')
        },
      ]
    }
  ]
})

// 路由守卫，检查登录状态
router.beforeEach((to, _from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next('/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router