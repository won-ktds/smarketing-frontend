//* src/services/memberService.js - 새로 생성
import { memberApi, handleApiError, formatSuccessResponse } from './api.js'

/**
 * 회원 관리 API 서비스
 * API 설계서 기준
 */
class MemberService {
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

export const memberService = new MemberService()
export default memberService

