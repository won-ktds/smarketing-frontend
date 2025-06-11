//* src/store/index.js
/**
 * Pinia 스토어 설정
 * 전역 상태 관리
 */
import { defineStore } from 'pinia'
import authService from '@/services/auth'
import storeService from '@/services/store'

// 인증 스토어
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refreshToken'),
    isAuthenticated: false
  }),
  
  getters: {
    getUserInfo: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated && !!state.token
  },
  
  actions: {
    async login(credentials) {
      try {
        const response = await authService.login(credentials)
        this.setAuth(response.data)
        return response
      } catch (error) {
        this.clearAuth()
        throw error
      }
    },
    
    async register(userData) {
      try {
        const response = await authService.register(userData)
        return response
      } catch (error) {
        throw error
      }
    },
    
    async logout() {
      try {
        if (this.token) {
          await authService.logout()
        }
      } catch (error) {
        console.error('로그아웃 오류:', error)
      } finally {
        this.clearAuth()
      }
    },
    
    async refreshUserInfo() {
      try {
        const response = await authService.getUserInfo()
        this.user = response.data
        this.isAuthenticated = true
        return response
      } catch (error) {
        this.clearAuth()
        throw error
      }
    },
    
    setAuth(authData) {
      this.user = authData.user
      this.token = authData.accessToken
      this.refreshToken = authData.refreshToken
      this.isAuthenticated = true
      
      localStorage.setItem('token', authData.accessToken)
      localStorage.setItem('refreshToken', authData.refreshToken)
    },
    
    clearAuth() {
      this.user = null
      this.token = null
      this.refreshToken = null
      this.isAuthenticated = false
      
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
    }
  }
})

// 앱 전역 스토어
export const useAppStore = defineStore('app', {
  state: () => ({
    loading: false,
    snackbar: {
      show: false,
      message: '',
      color: 'success',
      timeout: 3000
    },
    notifications: [],
    notificationCount: 0
  }),
  
  actions: {
    setLoading(status) {
      this.loading = status
    },
    
    showSnackbar(message, color = 'success', timeout = 3000) {
      this.snackbar = {
        show: true,
        message,
        color,
        timeout
      }
    },
    
    hideSnackbar() {
      this.snackbar.show = false
    },
    
    addNotification(notification) {
      this.notifications.unshift({
        id: Date.now(),
        timestamp: new Date(),
        ...notification
      })
      this.notificationCount = this.notifications.length
    },
    
    clearNotifications() {
      this.notifications = []
      this.notificationCount = 0
    }
  }
})

// 매장 스토어
export const useStoreStore = defineStore('store', {
  state: () => ({
    storeInfo: null,
    loading: false
  }),
  
  getters: {
    hasStoreInfo: (state) => !!state.storeInfo
  },
  
  actions: {
    async fetchStoreInfo() {
      try {
        this.loading = true
        const response = await storeService.getStoreInfo()
        this.storeInfo = response.data
        return response
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async updateStoreInfo(storeData) {
      try {
        this.loading = true
        const response = await storeService.updateStoreInfo(storeData)
        this.storeInfo = response.data
        return response
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async createStoreInfo(storeData) {
      try {
        this.loading = true
        const response = await storeService.createStoreInfo(storeData)
        this.storeInfo = response.data
        return response
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})

// 메뉴 스토어
export const useMenuStore = defineStore('menu', {
  state: () => ({
    menus: [],
    loading: false,
    totalCount: 0
  }),
  
  getters: {
    getMenuById: (state) => (id) => {
      return state.menus.find(menu => menu.id === id)
    },
    
    getMenusByCategory: (state) => (category) => {
      return state.menus.filter(menu => menu.category === category)
    }
  },
  
  actions: {
    async fetchMenus() {
      try {
        this.loading = true
        const response = await storeService.getMenus()
        this.menus = response.data
        this.totalCount = response.data.length
        return response
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async createMenu(menuData) {
      try {
        this.loading = true
        const response = await storeService.createMenu(menuData)
        this.menus.push(response.data)
        this.totalCount++
        return response
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async updateMenu(menuId, menuData) {
      try {
        this.loading = true
        const response = await storeService.updateMenu(menuId, menuData)
        const index = this.menus.findIndex(menu => menu.id === menuId)
        if (index !== -1) {
          this.menus[index] = response.data
        }
        return response
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async deleteMenu(menuId) {
      try {
        this.loading = true
        await storeService.deleteMenu(menuId)
        this.menus = this.menus.filter(menu => menu.id !== menuId)
        this.totalCount--
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})