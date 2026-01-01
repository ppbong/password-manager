import { defineStore } from 'pinia'

export const usePasswordStore = defineStore('password', {
  state: () => ({
    categories: [] as any[],
    passwords: [] as any[],
    selectedPassword: null as any
  }),
  actions: {
    // 密码分类相关
    setCategories(categories: any[]) {
      this.categories = categories
    },
    addCategory(category: any) {
      this.categories.push(category)
    },
    updateCategory(category: any) {
      const index = this.categories.findIndex(c => c.category_id === category.category_id)
      if (index !== -1) {
        this.categories[index] = category
      }
    },
    deleteCategory(categoryId: number) {
      this.categories = this.categories.filter(c => c.category_id !== categoryId)
    },
    // 密码相关
    setPasswords(passwords: any[]) {
      this.passwords = passwords
    },
    addPassword(password: any) {
      this.passwords.push(password)
    },
    updatePassword(password: any) {
      const index = this.passwords.findIndex(p => p.password_id === password.password_id)
      if (index !== -1) {
        this.passwords[index] = password
      }
    },
    deletePassword(passwordId: number) {
      this.passwords = this.passwords.filter(p => p.password_id !== passwordId)
    },
    // 选择密码
    setSelectedPassword(password: any) {
      this.selectedPassword = password
    }
  }
})