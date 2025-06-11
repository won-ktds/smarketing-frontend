//* src/services/recommend.js
import { recommendApi, handleApiError, formatSuccessResponse } from './api.js'

/**
 * AI 추천 관련 API 서비스
 * 유저스토리: REC-005
 */
class RecommendService {
  /**
   * AI 마케팅 팁 생성 (REC-005: AI 마케팅 방법 추천)
   * @param {Object} requestData - 마케팅 팁 요청 정보
   * @returns {Promise<Object>} 생성된 마케팅 팁
   */
  async generateMarketingTips(requestData = {}) {
    try {
      const response = await recommendApi.post('/marketing-tips', {
        storeId: requestData.storeId,
        includeWeather: requestData.includeWeather !== false, // 기본값 true
        includeTrends: requestData.includeTrends !== false, // 기본값 true
        maxTips: requestData.maxTips || 3,
        tipType: requestData.tipType || 'general', // general, menu, marketing, operation
      })

      return formatSuccessResponse(response.data.data, 'AI 마케팅 팁이 생성되었습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 날씨 기반 메뉴 추천
   * @param {number} storeId - 매장 ID
   * @returns {Promise<Object>} 날씨 기반 메뉴 추천
   */
  async getWeatherBasedMenuRecommendation(storeId) {
    try {
      const response = await recommendApi.get(`/weather-menu/${storeId}`)

      return formatSuccessResponse(response.data.data, '날씨 기반 메뉴 추천을 조회했습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 매출 예측 추천
   * @param {number} storeId - 매장 ID
   * @param {string} period - 예측 기간 (day, week, month)
   * @returns {Promise<Object>} 매출 예측 정보
   */
  async getSalesPrediction(storeId, period = 'day') {
    try {
      const response = await recommendApi.get(`/sales-prediction/${storeId}?period=${period}`)

      return formatSuccessResponse(response.data.data, '매출 예측 정보를 조회했습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 인기 메뉴 추천
   * @param {number} storeId - 매장 ID
   * @param {string} period - 분석 기간
   * @returns {Promise<Object>} 인기 메뉴 추천
   */
  async getPopularMenuRecommendation(storeId, period = 'month') {
    try {
      const response = await recommendApi.get(`/popular-menu/${storeId}?period=${period}`)

      return formatSuccessResponse(response.data.data, '인기 메뉴 추천을 조회했습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 마케팅 전략 추천
   * @param {number} storeId - 매장 ID
   * @param {string} strategyType - 전략 유형 (sales_boost, customer_retention, cost_reduction)
   * @returns {Promise<Object>} 마케팅 전략 추천
   */
  async getMarketingStrategy(storeId, strategyType = 'sales_boost') {
    try {
      const response = await recommendApi.get(`/marketing-strategy/${storeId}?type=${strategyType}`)

      return formatSuccessResponse(response.data.data, '마케팅 전략 추천을 조회했습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 통합 AI 추천 (매출 예측 + 메뉴 추천 + 마케팅 전략)
   * @param {number} storeId - 매장 ID
   * @returns {Promise<Object>} 통합 AI 추천 정보
   */
  async getComprehensiveRecommendation(storeId) {
    try {
      const response = await recommendApi.get(`/comprehensive-recommendation/${storeId}`)

      return formatSuccessResponse(response.data.data, '통합 AI 추천을 조회했습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 추천 기록 조회
   * @param {Object} filters - 필터링 옵션
   * @returns {Promise<Object>} 추천 기록 목록
   */
  async getRecommendationHistory(filters = {}) {
    try {
      const queryParams = new URLSearchParams()

      if (filters.type) queryParams.append('type', filters.type)
      if (filters.startDate) queryParams.append('startDate', filters.startDate)
      if (filters.endDate) queryParams.append('endDate', filters.endDate)
      if (filters.page) queryParams.append('page', filters.page)
      if (filters.size) queryParams.append('size', filters.size || 20)

      const response = await recommendApi.get(`/history?${queryParams.toString()}`)

      return formatSuccessResponse(response.data.data, '추천 기록을 조회했습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 추천 피드백 제공
   * @param {number} recommendationId - 추천 ID
   * @param {Object} feedback - 피드백 정보
   * @returns {Promise<Object>} 피드백 제공 결과
   */
  async provideFeedback(recommendationId, feedback) {
    try {
      const response = await recommendApi.post(`/feedback/${recommendationId}`, {
        rating: feedback.rating, // 1-5 점수
        useful: feedback.useful, // true/false
        comment: feedback.comment || '',
        appliedSuggestions: feedback.appliedSuggestions || [],
      })

      return formatSuccessResponse(response.data.data, '피드백이 제공되었습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }
}

export const recommendService = new RecommendService()
export default recommendService
