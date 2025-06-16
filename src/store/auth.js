//* src/store/auth.js 수정 - 기존 구조 유지하고 API 연동만 추가
import { defineStore } from 'pinia'
import { ref } from 'vue'
import authService from '@/services/auth'

export const useAuthStore = defineStore('auth', () => {
  // 기존 상태들 유지
  const user = ref(null)
  const token = ref(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)

  // 기존 checkAuthState 메서드 유지
  const checkAuthState = () => {
    const storedToken = localStorage.getItem('accessToken')
    const storedUser = localStorage.getItem('userInfo')
    
    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
      isAuthenticated.value = true
    } else {
      token.value = null
      user.value = null
      isAuthenticated.value = false
    }
  }

  // login 메서드를 실제 API 호출로 수정
  const login = async (credentials) => {
    isLoading.value = true
    
    try {
      const result = await authService.login(credentials)
      
      if (result.success) {
        token.value = result.data.token
        user.value = result.data.user
        isAuthenticated.value = true
        
        return { success: true }
      } else {
        return { success: false, error: result.message }
      }
    } catch (error) {
      return { success: false, error: '네트워크 오류가 발생했습니다.' }
    } finally {
      isLoading.value = false
    }
  }

  // logout 메서드를 실제 API 호출로 수정
  const logout = async () => {
    isLoading.value = true
    
    try {
      await authService.logout()
    } catch (error) {
      console.warn('로그아웃 API 호출 실패:', error)
    } finally {
      // 상태 초기화
      token.value = null
      user.value = null
      isAuthenticated.value = false
      isLoading.value = false
    }
  }

  // 초기화 시 인증 상태 확인
  checkAuthState()

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuthState
  }
})

