import { defineStore } from 'pinia'
import { login, logout } from '@/api/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: {
      username: '',
      nickname: '',
      role: ''
    },
    token: localStorage.getItem('token') || ''
  }),

  actions: {
    // 登录
    async login(username, password) {
      const res = await login({ username, password })
      this.userInfo = res.data
      this.token = res.data.token
      return res
    },

    // 退出登录
    async logout() {
      await logout()
      this.userInfo = {
        username: '',
        nickname: '',
        role: ''
      }
      this.token = ''
      localStorage.removeItem('token')
    }
  },

  persist: true // 开启状态持久化
}) 