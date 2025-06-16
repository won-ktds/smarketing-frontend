//* src/store/auth.js - 토큰 관리 수정버전
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token && !!state.user,
    userInfo: (state) => state.user,
    hasValidToken: (state) => {
      if (!state.token) return false
      
      try {
        // JWT 토큰 만료 확인 (간단한 체크)
        const payload = JSON.parse(atob(state.token.split('.')[1]))
        const now = Date.now() / 1000
        return payload.exp > now
      } catch {
        return false
      }
    }
  },

  actions: {
    /**
     * 로그인 처리
     */
    async login(credentials) {
      try {
        // 로그인 API 호출은 별도 서비스에서 처리
        const { authService } = await import('@/services/auth')
        const response = await authService.login(credentials)
        
        if (response.success) {
          this.setAuth(response.data)
          return response
        } else {
          throw new Error(response.message)
        }
      } catch (error) {
        this.clearAuth()
        throw error
      }
    },

    /**
     * 회원가입 처리
     */
    async register(userData) {
      try {
        const { authService } = await import('@/services/auth')
        const response = await authService.register(userData)
        return response
      } catch (error) {
        throw error
      }
    },

    /**
     * 로그아웃 처리
     */
    async logout() {
      try {
        if (this.token) {
          const { authService } = await import('@/services/auth')
          await authService.logout()
        }
      } catch (error) {
        console.error('로그아웃 API 오류:', error)
      } finally {
        this.clearAuth()
      }
    },

    /**
     * 사용자 정보 새로고침
     */
    async refreshUserInfo() {
      try {
        if (!this.token) {
          throw new Error('토큰이 없습니다')
        }

        const { authService } = await import('@/services/auth')
        const response = await authService.getUserInfo()
        
        if (response.success) {
          this.user = response.data
          this.isAuthenticated = true
          return response
        } else {
          throw new Error(response.message)
        }
      } catch (error) {
        this.clearAuth()
        throw error
      }
    },

    /**
     * 인증 정보 설정
     * ⚠️ 수정: 토큰을 여러 형태로 저장하여 호환성 확보
     */
    setAuth(authData) {
      console.log('인증 정보 설정:', authData)
      
      this.user = authData.user || authData.userInfo
      this.token = authData.accessToken || authData.token
      this.refreshToken = authData.refreshToken
      this.isAuthenticated = true

      // localStorage에 여러 형태로 저장 (호환성)
      if (this.token) {
        localStorage.setItem('accessToken', this.token)
        localStorage.setItem('token', this.token)
      }
      if (this.refreshToken) {
        localStorage.setItem('refreshToken', this.refreshToken)
      }
      if (this.user) {
        localStorage.setItem('userInfo', JSON.stringify(this.user))
      }
      
      console.log('토큰 저장 완료:', {
        token: this.token?.substring(0, 20) + '...',
        hasRefreshToken: !!this.refreshToken,
        hasUser: !!this.user
      })
    },

    /**
     * 인증 정보 초기화
     */
    clearAuth() {
      console.log('인증 정보 초기화')
      
      this.user = null
      this.token = null
      this.refreshToken = null
      this.isAuthenticated = false

      // localStorage에서 모든 토큰 제거
      localStorage.removeItem('accessToken')
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userInfo')
    },

    /**
     * 앱 시작 시 인증 상태 복원
     */
    checkAuthState() {
      console.log('인증 상태 확인 중...')
      
      try {
        // localStorage에서 토큰 복원
        const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('token')
        const refreshToken = localStorage.getItem('refreshToken')
        const userInfo = localStorage.getItem('userInfo')

        if (accessToken && userInfo) {
          this.token = accessToken
          this.refreshToken = refreshToken
          this.user = JSON.parse(userInfo)
          
          // 토큰 유효성 간단 확인
          if (this.hasValidToken) {
            this.isAuthenticated = true
            console.log('인증 상태 복원 성공')
          } else {
            console.log('토큰 만료됨 - 재로그인 필요')
            this.clearAuth()
          }
        } else {
          console.log('저장된 인증 정보 없음')
          this.clearAuth()
        }
      } catch (error) {
        console.error('인증 상태 복원 실패:', error)
        this.clearAuth()
      }
    },

    /**
     * 토큰 갱신
     */
    async refreshAccessToken() {
      try {
        if (!this.refreshToken) {
          throw new Error('리프레시 토큰이 없습니다')
        }

        const { authService } = await import('@/services/auth')
        const response = await authService.refreshToken(this.refreshToken)
        
        if (response.success) {
          this.setAuth({
            ...response.data,
            user: this.user // 기존 사용자 정보 유지
          })
          return response
        } else {
          throw new Error(response.message)
        }
      } catch (error) {
        console.error('토큰 갱신 실패:', error)
        this.clearAuth()
        throw error
      }
    }
  }
})