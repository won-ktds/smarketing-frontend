//* src/services/recommend.js - 백엔드 API 직접 연동 버전
import { recommendApi, handleApiError, formatSuccessResponse } from './api.js'

/**
 * AI 추천 관련 API 서비스
 * 백엔드 /api/recommendations/marketing-tips API 직접 연동
 */
class RecommendService {
  constructor() {
    this.lastTip = null
  }

  /**
   * AI 마케팅 팁 생성/조회 - 백엔드 API 직접 호출
   * @param {Object} requestData - 요청 데이터 (사용되지 않음)
   * @returns {Promise<Object>} 생성된 마케팅 팁
   */
  async generateMarketingTips(requestData = {}) {
    try {
      console.log('🤖 [AI_TIP] 백엔드 마케팅 팁 API 직접 호출')
      
      // 백엔드 API: POST /api/recommendations/marketing-tips (파라미터 없음)
      const response = await recommendApi.post('/marketing-tips')
      
      console.log('📊 [AI_TIP] 응답 데이터:', response.data)
      
      // 백엔드 ApiResponse 구조: { status, message, data }
      if (response.data && response.data.status === 200 && response.data.data) {
        const tipData = response.data.data
        
        console.log('✅ [AI_TIP] 마케팅 팁 조회/생성 성공:', {
          tipId: tipData.tipId,
          tipSummary: tipData.tipSummary?.substring(0, 50) + '...',
          isRecentlyCreated: tipData.isRecentlyCreated,
          createdAt: tipData.createdAt
        })
        
        // 캐시 저장
        this.lastTip = tipData
        
        return formatSuccessResponse(tipData, 
          tipData.isRecentlyCreated 
            ? 'AI 마케팅 팁이 새로 생성되었습니다.' 
            : '최근 생성된 AI 마케팅 팁을 조회했습니다.'
        )
      } else {
        throw new Error('응답 데이터 형식 오류')
      }
      
    } catch (error) {
      console.error('❌ [AI_TIP] 마케팅 팁 API 호출 실패:', error.message)
      
      // 실패시 Fallback 데이터 생성
      const fallbackTip = this.createFallbackTip()
      return formatSuccessResponse(fallbackTip, 
        'AI 서비스 연결 실패로 기본 마케팅 팁을 제공합니다.'
      )
    }
  }

  /**
   * 마케팅 팁 이력 조회 (향후 구현)
   * @param {Object} pagination - 페이지네이션 정보
   * @returns {Promise<Object>} 마케팅 팁 이력
   */
  async getMarketingTipHistory(pagination = {}) {
    try {
      // 현재는 캐시된 데이터가 있으면 배열로 반환
      if (this.lastTip) {
        const historyData = {
          content: [this.lastTip],
          totalElements: 1,
          totalPages: 1,
          size: 1,
          number: 0
        }
        
        return formatSuccessResponse(historyData, '마케팅 팁 이력을 조회했습니다.')
      } else {
        return formatSuccessResponse({
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: 0,
          number: 0
        }, '마케팅 팁 이력이 없습니다.')
      }
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 마케팅 팁 상세 조회 (향후 구현)
   * @param {number} tipId - 팁 ID
   * @returns {Promise<Object>} 마케팅 팁 상세 정보
   */
  async getMarketingTip(tipId) {
    try {
      // 현재는 캐시된 데이터가 해당 ID면 반환
      if (this.lastTip && this.lastTip.tipId === tipId) {
        return formatSuccessResponse(this.lastTip, '마케팅 팁 상세 정보를 조회했습니다.')
      } else {
        throw new Error('해당 팁을 찾을 수 없습니다.')
      }
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 종합 AI 추천 (대시보드용)
   * @param {number} storeId - 매장 ID (사용되지 않음)
   */
  async getComprehensiveRecommendation(storeId) {
    try {
      // 마케팅 팁 생성 및 이력 조회
      const [marketingTips, tipHistory] = await Promise.allSettled([
        this.generateMarketingTips(),
        this.getMarketingTipHistory({ size: 5 })
      ])

      const result = {
        marketingTips: marketingTips.status === 'fulfilled' ? marketingTips.value : null,
        recentHistory: tipHistory.status === 'fulfilled' ? tipHistory.value : null
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
      // 현재는 Mock 응답
      const mockResponse = {
        feedbackId: Date.now(),
        tipId: tipId,
        rating: feedback.rating,
        useful: feedback.useful,
        submittedAt: new Date().toISOString()
      }

      return formatSuccessResponse(mockResponse, '피드백이 제공되었습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }




  /**
   * 캐시 초기화
   */
  clearCache() {
    this.lastTip = null
    console.log('🧹 [AI_TIP] AI 추천 서비스 캐시 초기화')
  }

  /**
   * 마지막 팁 반환
   */
  getLastTip() {
    return this.lastTip
  }
}

export const recommendService = new RecommendService()
export default recommendService