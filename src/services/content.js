//* src/services/content.js
import { contentApi, handleApiError, formatSuccessResponse } from './api.js'

/**
 * 마케팅 콘텐츠 관련 API 서비스
 * 백엔드 SnsContentCreateRequest DTO에 맞게 수정
 */
class ContentService {
  /**
   * SNS 게시물 생성
   * @param {Object} contentData - SNS 콘텐츠 생성 정보
   * @returns {Promise<Object>} 생성된 SNS 콘텐츠
   */
  async generateSnsContent(contentData) {
    try {
      console.log('🚀 SNS 콘텐츠 생성 요청:', contentData)
      
      // 백엔드 SnsContentCreateRequest DTO에 맞는 데이터 구조
      const requestData = {
        // === 기본 정보 ===
        storeId: contentData.storeId || 1,
        storeName: contentData.storeName || '테스트 매장',
        storeType: contentData.storeType || '음식점',
        platform: this.mapPlatform(contentData.platform),
        title: contentData.title,
        
        // === 콘텐츠 생성 조건 ===
        category: contentData.category || this.mapTargetToCategory(contentData.targetType),
        requirement: contentData.requirements || contentData.content || '',
        target: contentData.targetType || '일반 고객',
        contentType: 'SNS 게시물',
        
        // === 이벤트 정보 ===
        eventName: contentData.eventName || null,
        startDate: contentData.startDate ? this.formatDate(contentData.startDate) : null,
        endDate: contentData.endDate ? this.formatDate(contentData.endDate) : null,
        
        // === 미디어 정보 ===
        images: contentData.images || [],
        photoStyle: this.mapPhotoStyle(contentData.aiOptions?.photoStyle),
        
        // === 추가 옵션 ===
        includeHashtags: true,
        includeEmojis: true,
        includeCallToAction: true,
        includeLocationInfo: false
      }

      console.log('📤 백엔드 DTO 맞춤 데이터:', requestData)
      
      const response = await contentApi.post('/sns/generate', requestData)
      
      console.log('📥 API 응답:', response.data)
      
      // 응답 데이터 구조에 맞게 처리
      const responseData = response.data.data || response.data
      
      return formatSuccessResponse({
        content: responseData.content || responseData,
        hashtags: responseData.hashtags || [],
        ...responseData
      }, 'SNS 게시물이 생성되었습니다.')
    } catch (error) {
      console.error('❌ SNS 콘텐츠 생성 실패:', error)
      return handleApiError(error)
    }
  }

  /**
   * 플랫폼 매핑 (프론트엔드 -> 백엔드)
   */
  mapPlatform(platform) {
    const mapping = {
      'instagram': 'INSTAGRAM',
      'naver_blog': 'NAVER_BLOG', 
      'facebook': 'FACEBOOK',
      'kakao_story': 'KAKAO_STORY'
    }
    return mapping[platform] || 'INSTAGRAM'
  }

  /**
   * 타겟 타입을 카테고리로 매핑
   */
  mapTargetToCategory(targetType) {
    const mapping = {
      'new_menu': '메뉴소개',
      'discount': '이벤트',
      'store': '인테리어', 
      'event': '이벤트'
    }
    return mapping[targetType] || '메뉴소개'
  }

  /**
   * 날짜 형식 변환 (YYYY-MM-DD -> LocalDate)
   */
  formatDate(dateString) {
    if (!dateString) return null
    // YYYY-MM-DD 형식이 LocalDate와 호환됨
    return dateString
  }

  /**
   * 사진 스타일 매핑
   */
  mapPhotoStyle(style) {
    const mapping = {
      'bright': '밝고 화사한',
      'calm': '차분하고 세련된',
      'vintage': '빈티지한',
      'modern': '모던한',
      'natural': '자연스러운'
    }
    return mapping[style] || '밝고 화사한'
  }

  /**
   * SNS 게시물 저장
   * @param {Object} saveData - 저장할 SNS 콘텐츠 정보
   * @returns {Promise<Object>} 저장 결과
   */
  async saveSnsContent(saveData) {
    try {
      console.log('💾 SNS 콘텐츠 저장 요청:', saveData)
      
      // 백엔드 SnsContentSaveRequest DTO에 맞는 구조로 변환
      const requestData = {
        title: saveData.title,
        content: saveData.content,
        hashtags: saveData.hashtags || [],
        platform: this.mapPlatform(saveData.platform),
        category: saveData.category || '메뉴소개',
        // 백엔드 DTO에서 지원하는 필드들만 포함
        eventName: saveData.eventName,
        eventDate: saveData.eventDate,
        status: saveData.status || 'DRAFT'
      }

      console.log('📤 저장 요청 데이터:', requestData)

      const response = await contentApi.post('/sns/save', requestData)

      return formatSuccessResponse(response.data.data, 'SNS 게시물이 저장되었습니다.')
    } catch (error) {
      console.error('❌ SNS 콘텐츠 저장 실패:', error)
      return handleApiError(error)
    }
  }

  /**
   * 콘텐츠 목록 조회
   * @param {Object} filters - 필터 조건
   * @returns {Promise<Object>} 콘텐츠 목록
   */
  async getContentList(filters = {}) {
    try {
      const params = new URLSearchParams()
      
      if (filters.contentType) params.append('contentType', filters.contentType)
      if (filters.platform) params.append('platform', filters.platform)
      if (filters.period) params.append('period', filters.period)
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      
      const response = await contentApi.get(`/list?${params.toString()}`)
      
      return formatSuccessResponse(response.data.data, '콘텐츠 목록을 조회했습니다.')
    } catch (error) {
      console.error('❌ 콘텐츠 목록 조회 실패:', error)
      return handleApiError(error)
    }
  }

  /**
   * 콘텐츠 상세 조회
   * @param {number} contentId - 콘텐츠 ID
   * @returns {Promise<Object>} 콘텐츠 상세 정보
   */
  async getContentDetail(contentId) {
    try {
      const response = await contentApi.get(`/${contentId}`)
      
      return formatSuccessResponse(response.data.data, '콘텐츠 상세 정보를 조회했습니다.')
    } catch (error) {
      console.error('❌ 콘텐츠 상세 조회 실패:', error)
      return handleApiError(error)
    }
  }

  /**
   * 콘텐츠 삭제
   * @param {number} contentId - 콘텐츠 ID
   * @returns {Promise<Object>} 삭제 결과
   */
  async deleteContent(contentId) {
    try {
      const response = await contentApi.delete(`/${contentId}`)
      
      return formatSuccessResponse(null, '콘텐츠가 삭제되었습니다.')
    } catch (error) {
      console.error('❌ 콘텐츠 삭제 실패:', error)
      return handleApiError(error)
    }
  }
}

export default new ContentService()