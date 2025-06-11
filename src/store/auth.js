//* src/store/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 인증 관리 스토어
 * 로그인/로그아웃 상태 관리
 */
export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(localStorage.getItem('auth_token') || null)
  const isLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userInfo = computed(() => user.value)

  // Actions
  const login = async (credentials) => {
    isLoading.value = true
    try {
      console.log('Auth Store - 로그인 시도:', credentials)

      // 임시 로그인 로직 (실제 API 연동 전)
      if (credentials.userId === 'user01' && credentials.password === 'passw0rd') {
        const userData = {
          id: 1,
          userId: credentials.userId,
          name: '테스트 사용자',
          email: 'test@example.com',
        }

        const tokenData = 'temp_jwt_token_' + Date.now()

        // 상태 업데이트
        token.value = tokenData
        user.value = userData

        // 로컬 스토리지에 저장
        localStorage.setItem('auth_token', tokenData)
        localStorage.setItem('user_info', JSON.stringify(userData))

        console.log('Auth Store - 로그인 성공:', { token: tokenData, user: userData })
        console.log('Auth Store - isAuthenticated:', isAuthenticated.value)

        return { success: true, user: userData, token: tokenData }
      } else {
        return { success: false, message: '아이디 또는 비밀번호가 틀렸습니다' }
      }
    } catch (error) {
      console.error('Auth Store - 로그인 에러:', error)
      return { success: false, message: '로그인 중 오류가 발생했습니다' }
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    console.log('Auth Store - 로그아웃')
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_info')
  }

  const clearAuth = () => {
    console.log('Auth Store - 인증 정보 클리어')
    logout()
  }

  const checkAuth = () => {
    console.log('Auth Store - 인증 상태 체크')
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user_info')

    if (storedToken && storedUser) {
      try {
        token.value = storedToken
        user.value = JSON.parse(storedUser)
        console.log('Auth Store - 저장된 인증 정보 복원:', { token: storedToken, user: user.value })
      } catch (error) {
        console.error('Auth Store - 인증 정보 복원 실패:', error)
        clearAuth()
      }
    }
  }

  const refreshUserInfo = async () => {
    console.log('Auth Store - 사용자 정보 갱신')
    // 임시로 현재 사용자 정보 반환
    if (token.value) {
      return Promise.resolve(user.value)
    } else {
      throw new Error('토큰이 없습니다')
    }
  }

  // 초기 인증 상태 체크
  checkAuth()

  return {
    // State
    user,
    token,
    isLoading,
    // Getters
    isAuthenticated,
    userInfo,
    // Actions
    login,
    logout,
    clearAuth,
    checkAuth,
    refreshUserInfo,
  }
})
