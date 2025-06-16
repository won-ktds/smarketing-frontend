//* src/services/recommendationService.js - 새로 생성
import { recommendApi, handleApiError, formatSuccessResponse } from './api.js'

/**
 * AI 추천 관련 API 서비스
 * API 설계서 기준
 */
class RecommendationService {
  /**
   * AI 마케팅 팁 생성 (REC-005: AI 마케팅 팁 생성)
   * @param {Object} requestData - 마케팅 팁 요청 정보
   * @returns {Promise<Object>} 생성된 마케팅 팁
   */
  async generateMarketingTips(requestData) {
    try {
      const response = await recommendApi.post('/marketing-tips', {
        storeId: requestData.storeId,
        businessType: requestData.businessType,
        targetSeason: requestData.targetSeason,
        currentChallenges: requestData.currentChallenges,
        marketingGoals: requestData.marketingGoals,
        budget: requestData.budget,
        preferredChannels: requestData.preferredChannels
      })

      return formatSuccessResponse(response.data.data, 'AI 마케팅 팁이 생성되었습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }
}

export const recommendationService = new RecommendationService()
export default recommendationService
