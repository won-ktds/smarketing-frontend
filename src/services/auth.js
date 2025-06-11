//* src/services/auth.js
import { memberApi, authApi, handleApiError, formatSuccessResponse } from './api.js'

/**
 * 인증 관련 API 서비스
 * 유저스토리: USR-005, USR-010, USR-020, USR-030, USR-035, USR-040
 */
class AuthService {
  /**
   * 로그인 (USR-005: 정상 로그인)
   * @param {Object} credentials - 로그인 정보
   * @param {string} credentials.userId - 사용자 ID
   * @param {string} credentials.password - 비밀번호
   * @returns {Promise<Object>} 로그인 결과
   */
  async login(credentials) {
    try {
      const response = await authApi.post('/login', {
        userId: credentials.userId,
        password: credentials.password,
      })

      const { accessToken, refreshToken, expiresIn } = response.data.data

      // 토큰 저장
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('tokenExpiresIn', expiresIn.toString())
      localStorage.setItem('userId', credentials.userId)

      return formatSuccessResponse(response.data.data, '로그인되었습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 로그아웃 (USR-020: 로그아웃)
   * @returns {Promise<Object>} 로그아웃 결과
   */
  async logout() {
    try {
      const refreshToken = localStorage.getItem('refreshToken')

      if (refreshToken) {
        await authApi.post('/logout', { refreshToken })
      }

      // 로컬 스토리지 정리
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('tokenExpiresIn')
      localStorage.removeItem('userId')

      return formatSuccessResponse(null, '로그아웃되었습니다.')
    } catch (error) {
      // 로그아웃은 실패해도 로컬 데이터는 정리
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('tokenExpiresIn')
      localStorage.removeItem('userId')

      return handleApiError(error)
    }
  }

  /**
   * 토큰 갱신
   * @returns {Promise<Object>} 토큰 갱신 결과
   */
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken')

      if (!refreshToken) {
        throw new Error('리프레시 토큰이 없습니다.')
      }

      const response = await authApi.post('/refresh', { refreshToken })

      const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data.data

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', newRefreshToken)
      localStorage.setItem('tokenExpiresIn', expiresIn.toString())

      return formatSuccessResponse(response.data.data, '토큰이 갱신되었습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 회원가입 (USR-030: 회원등록)
   * @param {Object} memberData - 회원가입 정보
   * @param {string} memberData.userId - 사용자 ID
   * @param {string} memberData.password - 비밀번호
   * @param {string} memberData.name - 이름
   * @param {string} memberData.businessNumber - 사업자 번호
   * @param {string} memberData.email - 이메일
   * @returns {Promise<Object>} 회원가입 결과
   */
  async register(memberData) {
    try {
      const response = await memberApi.post('/register', {
        userId: memberData.userId,
        password: memberData.password,
        name: memberData.name,
        businessNumber: memberData.businessNumber,
        email: memberData.email,
      })

      return formatSuccessResponse(response.data.data, '회원가입이 완료되었습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * ID 중복 확인 (USR-035: 중복ID검사)
   * @param {string} userId - 확인할 사용자 ID
   * @returns {Promise<Object>} 중복 확인 결과
   */
  async checkDuplicate(userId) {
    try {
      const response = await memberApi.get(`/check-duplicate?userId=${userId}`)

      const { isDuplicate } = response.data.data

      if (isDuplicate) {
        return {
          success: false,
          message: '이미 사용 중인 ID입니다.',
          data: { isDuplicate: true },
        }
      }

      return formatSuccessResponse({ isDuplicate: false }, '사용 가능한 ID입니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 비밀번호 유효성 검증 (USR-040: 암호유효성 검사)
   * @param {string} password - 검증할 비밀번호
   * @returns {Promise<Object>} 유효성 검증 결과
   */
  async validatePassword(password) {
    try {
      const response = await memberApi.post('/validate-password', { password })

      const { isValid, errors } = response.data.data

      if (!isValid) {
        return {
          success: false,
          message: '비밀번호가 규칙에 맞지 않습니다.',
          data: { isValid: false, errors },
        }
      }

      return formatSuccessResponse({ isValid: true, errors: [] }, '사용 가능한 비밀번호입니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 현재 로그인 상태 확인
   * @returns {boolean} 로그인 여부
   */
  isAuthenticated() {
    const token = localStorage.getItem('accessToken')
    const expiresIn = localStorage.getItem('tokenExpiresIn')

    if (!token || !expiresIn) {
      return false
    }

    // 토큰 만료 시간 확인 (여유를 두고 5분 전에 만료로 처리)
    const now = Date.now()
    const expiryTime = parseInt(expiresIn) - 5 * 60 * 1000

    return now < expiryTime
  }

  /**
   * 현재 사용자 정보 가져오기
   * @returns {Object|null} 사용자 정보
   */
  getCurrentUser() {
    const userId = localStorage.getItem('userId')
    const token = localStorage.getItem('accessToken')

    if (!userId || !token || !this.isAuthenticated()) {
      return null
    }

    return { userId }
  }
}

export const authService = new AuthService()
export default authService
