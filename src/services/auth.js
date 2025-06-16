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
        userId: credentials.username || credentials.userId, // 기존 코드 호환성
        password: credentials.password,
      })

      const { accessToken, refreshToken, expiresIn, userInfo } = response.data.data

      // 토큰 및 사용자 정보 저장
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('tokenExpiresIn', expiresIn.toString())
      localStorage.setItem('userInfo', JSON.stringify(userInfo))

      return formatSuccessResponse({
        token: accessToken,
        user: {
          id: userInfo.userId,
          nickname: userInfo.name,
          email: userInfo.email
        }
      }, '로그인되었습니다.')
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
      localStorage.removeItem('userInfo')

      return formatSuccessResponse(null, '로그아웃되었습니다.')
    } catch (error) {
      // 로그아웃은 실패해도 로컬 데이터는 정리
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('tokenExpiresIn')
      localStorage.removeItem('userInfo')

      return formatSuccessResponse(null, '로그아웃되었습니다.')
    }
  }

  /**
   * 토큰 갱신 (USR-050: 인증 자동 연장)
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

      return formatSuccessResponse({ token: accessToken }, '토큰이 갱신되었습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 회원가입 (USR-030: 회원등록)
   * @param {Object} userData - 회원 정보
   * @returns {Promise<Object>} 회원가입 결과
   */
  async register(userData) {
    try {
      const response = await memberApi.post('/register', {
        userId: userData.userId,
        password: userData.password,
        name: userData.name,
        businessNumber: userData.businessNumber,
        email: userData.email
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
      const response = await memberApi.get('/check-duplicate', {
        params: { userId }
      })

      return formatSuccessResponse(response.data.data, response.data.data.message)
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 암호 유효성 검증 (USR-040: 암호유효성 검사)
   * @param {string} password - 검증할 암호
   * @returns {Promise<Object>} 유효성 검증 결과
   */
  async validatePassword(password) {
    try {
      const response = await memberApi.post('/validate-password', { password })

      return formatSuccessResponse(response.data.data, response.data.data.message)
    } catch (error) {
      return handleApiError(error)
    }
  }
}


export const authService = new AuthService()
export default authService
