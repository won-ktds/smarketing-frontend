//* src/services/recommend.js - 수정버전
import { recommendApi, handleApiError, formatSuccessResponse } from './api.js'

/**
 * AI 추천 관련 API 서비스
 * 유저스토리: REC-005
 */
class RecommendService {
  /**
   * AI 마케팅 팁 생성 (REC-005: AI 마케팅 방법 추천)
   * ⚠️ 수정: 백엔드 API 스펙에 맞게 요청 구조 변경
   * @param {Object} requestData - 마케팅 팁 요청 정보
   * @returns {Promise<Object>} 생성된 마케팅 팁
   */
  async generateMarketingTips(requestData = {}) {
    try {
      // 백엔드 MarketingTipRequest DTO에 맞는 구조로 변경
      const requestBody = {
        storeId: requestData.storeId,
        // 필요시 추가 필드들
        additionalRequirement: requestData.additionalRequirement || '',
      }
      
      console.log('AI 마케팅 팁 생성 요청:', requestBody)
      
      const response = await recommendApi.post('/marketing-tips', requestBody)

      return formatSuccessResponse(response.data.data, 'AI 마케팅 팁이 생성되었습니다.')
    } catch (error) {
      console.error('AI 마케팅 팁 생성 실패:', error)
      return handleApiError(error)
    }
  }

  /**
   * 마케팅 팁 이력 조회
   * @param {number} storeId - 매장 ID
   * @param {Object} pagination - 페이지네이션 정보
   * @returns {Promise<Object>} 마케팅 팁 이력
   */
  async getMarketingTipHistory(storeId, pagination = {}) {
    try {
      const params = new URLSearchParams()
      params.append('storeId', storeId)
      
      if (pagination.page !== undefined) params.append('page', pagination.page)
      if (pagination.size !== undefined) params.append('size', pagination.size || 10)
      if (pagination.sort) params.append('sort', pagination.sort)

      const response = await recommendApi.get(`/marketing-tips?${params.toString()}`)

      return formatSuccessResponse(response.data.data, '마케팅 팁 이력을 조회했습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 마케팅 팁 상세 조회
   * @param {number} tipId - 팁 ID
   * @returns {Promise<Object>} 마케팅 팁 상세 정보
   */
  async getMarketingTip(tipId) {
    try {
      const response = await recommendApi.get(`/marketing-tips/${tipId}`)

      return formatSuccessResponse(response.data.data, '마케팅 팁 상세 정보를 조회했습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 종합 AI 추천 (대시보드용)
   * @param {number} storeId - 매장 ID
   * @returns {Promise<Object>} 통합 AI 추천 정보
   */
  async getComprehensiveRecommendation(storeId) {
    try {
      // 여러 추천 API를 병렬로 호출
      const [marketingTips, tipHistory] = await Promise.allSettled([
        this.generateMarketingTips({ storeId }),
        this.getMarketingTipHistory(storeId, { size: 5 })
      ])

      const result = {
        marketingTips: marketingTips.status === 'fulfilled' ? marketingTips.value : null,
        recentHistory: tipHistory.status === 'fulfilled' ? tipHistory.value : null,
      }

      return formatSuccessResponse(result, '통합 AI 추천을 조회했습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 추천 피드백 제공 (향후 구현)
   * @param {number} tipId - 추천 ID
   * @param {Object} feedback - 피드백 정보
   * @returns {Promise<Object>} 피드백 제공 결과
   */
  async provideFeedback(tipId, feedback) {
    try {
      const response = await recommendApi.post(`/marketing-tips/${tipId}/feedback`, {
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

  /**
   * 개발 모드용 Mock 추천 생성
   * @param {Object} requestData - 요청 데이터
   * @returns {Promise<Object>} Mock 추천 데이터
   */
  async generateMockRecommendation(requestData = {}) {
    // 개발 모드에서만 사용
    if (!import.meta.env.DEV) {
      return this.generateMarketingTips(requestData)
    }

    console.log('Mock AI 추천 생성')
    
    // 2초 대기 (실제 API 호출 시뮬레이션)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const mockData = {
      tipId: Date.now(),
      storeId: requestData.storeId,
      tipContent: `${requestData.storeId}번 매장을 위한 맞춤형 마케팅 전략을 제안드립니다. 
      계절 메뉴 개발, SNS 마케팅 활용, 지역 고객 대상 이벤트 기획 등을 통해 
      매출 향상과 고객 만족도를 높일 수 있습니다.`,
      storeData: {
        storeName: '테스트 매장',
        businessType: '카페',
        location: '서울시 강남구'
      },
      createdAt: new Date().toISOString()
    }

    return formatSuccessResponse(mockData, 'Mock AI 마케팅 팁이 생성되었습니다.')
  }
}

export const recommendService = new RecommendService()
export default recommendService