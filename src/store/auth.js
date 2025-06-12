//* src/store/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // 상태
  const user = ref(null)
  const token = ref(null)
  const refreshToken = ref(null)
  const isLoading = ref(false)

  // 컴퓨티드 - 더 엄격한 인증 체크
  const isAuthenticated = computed(() => {
    return !!(token.value && user.value)
  })

  // 액션
  const login = async (credentials) => {
    console.log('=== AUTH STORE 로그인 시작 ===')
    console.log('받은 자격증명:', credentials)

    isLoading.value = true

    try {
      // 실제 API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 정확한 자격증명 확인 (대소문자 구분, 공백 제거)
      const username = credentials.username?.trim()
      const password = credentials.password?.trim()

      console.log('정제된 자격증명:', { username, password })
      console.log('예상 자격증명:', { username: 'user01', password: 'passw0rd' })
      console.log('username 일치:', username === 'user01')
      console.log('password 일치:', password === 'passw0rd')

      if (username === 'user01' && password === 'passw0rd') {
        const mockToken = 'mock_jwt_token_' + Date.now()
        const mockUser = {
          id: 1,
          username: username,
          nickname: '김사장',
          businessName: '김사장님의 분식점',
          email: 'kim@example.com',
          avatar: '/images/avatar.png',
        }

        // 토큰과 사용자 정보 저장
        token.value = mockToken
        user.value = mockUser

        // 로컬 스토리지에 저장
        localStorage.setItem('auth_token', mockToken)
        localStorage.setItem('user_info', JSON.stringify(mockUser))

        console.log('로그인 성공! 사용자:', mockUser.nickname)
        return { success: true }
      } else {
        console.log('로그인 실패 - 자격증명 불일치')
        throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.')
      }
    } catch (error) {
      console.error('로그인 실패:', error)
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      // 로컬 상태 초기화
      user.value = null
      token.value = null
      refreshToken.value = null

      // 로컬 스토리지 정리
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_info')

      console.log('로그아웃 완료')
      return { success: true }
    } catch (error) {
      console.error('로그아웃 실패:', error)
      return { success: false, error: error.message }
    }
  }

  const checkAuthState = () => {
    try {
      const savedToken = localStorage.getItem('auth_token')
      const savedUser = localStorage.getItem('user_info')

      if (savedToken && savedUser) {
        // JSON 파싱이 가능한지 확인
        const parsedUser = JSON.parse(savedUser)
        if (parsedUser && parsedUser.id) {
          token.value = savedToken
          user.value = parsedUser
          console.log('저장된 인증 정보 복원됨:', parsedUser.nickname)
        } else {
          // 잘못된 사용자 정보인 경우 정리
          clearAuthData()
        }
      } else {
        console.log('저장된 인증 정보가 없음')
      }
    } catch (error) {
      console.error('인증 상태 확인 실패:', error)
      clearAuthData()
    }
  }

  const clearAuthData = () => {
    user.value = null
    token.value = null
    refreshToken.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_info')
    console.log('인증 데이터 초기화됨')
  }

  const refreshUserInfo = async () => {
    if (!token.value) return

    try {
      // 실제 API 호출로 사용자 정보 갱신
      // const response = await api.get('/auth/me')
      // user.value = response.data
    } catch (error) {
      console.error('사용자 정보 갱신 실패:', error)
      // 토큰이 유효하지 않은 경우 로그아웃
      logout()
    }
  }

  return {
    // 상태
    user,
    token,
    isLoading,

    // 컴퓨티드
    isAuthenticated,

    // 액션
    login,
    logout,
    refreshUserInfo,
    checkAuthState,
    clearAuthData,
  }
})
