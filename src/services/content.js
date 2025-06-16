//* src/services/content.js - 기존 파일 수정 (API 설계서 기준)
import { contentApi, handleApiError, formatSuccessResponse } from './api.js'

/**
 * 마케팅 콘텐츠 관련 API 서비스
 * API 설계서 기준으로 수정됨
 */
class ContentService {
  /**
   * SNS 게시물 생성 (CON-005: SNS 게시물 생성)
   * @param {Object} contentData - SNS 콘텐츠 생성 정보
   * @returns {Promise<Object>} 생성된 SNS 콘텐츠
   */
  async generateSnsContent(contentData) {
    try {
      const response = await contentApi.post('/sns/generate', {
        storeId: contentData.storeId,
        platform: contentData.platform,
        title: contentData.title,
        category: contentData.category,
        requirement: contentData.requirement || contentData.requirements,
        toneAndManner: contentData.toneAndManner,
        emotionalIntensity: contentData.emotionalIntensity || contentData.emotionIntensity,
        targetAudience: contentData.targetAudience,
        promotionalType: contentData.promotionalType || contentData.promotionType,
        eventName: contentData.eventName,
        eventDate: contentData.eventDate,
        hashtagStyle: contentData.hashtagStyle,
        hashtagCount: contentData.hashtagCount || 10,
        includeCallToAction: contentData.includeCallToAction || false,
        includeEmoji: contentData.includeEmoji || true,
        contentLength: contentData.contentLength || '보통'
      })

      return formatSuccessResponse(response.data.data, 'SNS 게시물이 생성되었습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * SNS 게시물 저장 (CON-010: SNS 게시물 저장)
   * @param {Object} saveData - 저장할 SNS 콘텐츠 정보
   * @returns {Promise<Object>} 저장 결과
   */
  async saveSnsContent(saveData) {
    try {
      const response = await contentApi.post('/sns/save', {
        title: saveData.title,
        content: saveData.content,
        hashtags: saveData.hashtags,
        platform: saveData.platform,
        category: saveData.category,
        toneAndManner: saveData.toneAndManner,
        targetAudience: saveData.targetAudience,
        promotionalType: saveData.promotionalType,
        eventName: saveData.eventName,
        eventDate: saveData.eventDate,
        status: saveData.status || 'DRAFT'
      })

      return formatSuccessResponse(response.data.data, 'SNS 게시물이 저장되었습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 홍보 포스터 생성 (CON-015: 홍보 포스터 생성)
   * @param {Object} posterData - 포스터 생성 정보
   * @returns {Promise<Object>} 생성된 포스터
   */
  async generatePoster(posterData) {
    try {
      const response = await contentApi.post('/poster/generate', {
        storeId: posterData.storeId,
        title: posterData.title,
        targetType: posterData.targetType,
        eventName: posterData.eventName,
        eventDate: posterData.eventDate,
        discountInfo: posterData.discountInfo,
        designStyle: posterData.designStyle,
        colorScheme: posterData.colorScheme,
        includeQrCode: posterData.includeQrCode || false,
        includeContact: posterData.includeContact || true,
        imageStyle: posterData.imageStyle || posterData.photoStyle,
        layoutType: posterData.layoutType,
        sizes: posterData.sizes || ['1:1', '9:16', '16:9']
      })

      return formatSuccessResponse(response.data.data, '홍보 포스터가 생성되었습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 홍보 포스터 저장 (CON-016: 홍보 포스터 저장)
   * @param {Object} saveData - 저장할 포스터 정보
   * @returns {Promise<Object>} 저장 결과
   */
  async savePoster(saveData) {
    try {
      const response = await contentApi.post('/poster/save', {
        title: saveData.title,
        images: saveData.images,
        posterSizes: saveData.posterSizes,
        targetType: saveData.targetType,
        eventName: saveData.eventName,
        status: saveData.status || 'DRAFT'
      })

      return formatSuccessResponse(response.data.data, '홍보 포스터가 저장되었습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 콘텐츠 목록 조회 (CON-020: 마케팅 콘텐츠 이력)
   * @param {Object} filters - 필터링 옵션
   * @returns {Promise<Object>} 콘텐츠 목록
   */
  async getContents(filters = {}) {
    try {
      const queryParams = new URLSearchParams()

      if (filters.contentType) queryParams.append('contentType', filters.contentType)
      if (filters.platform) queryParams.append('platform', filters.platform)
      if (filters.period) queryParams.append('period', filters.period)
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy || 'latest')
      if (filters.page) queryParams.append('page', filters.page)
      if (filters.size) queryParams.append('size', filters.size || 20)
      if (filters.search) queryParams.append('search', filters.search)

      const response = await contentApi.get(`/?${queryParams.toString()}`)

      return formatSuccessResponse(response.data.data, '콘텐츠 목록을 조회했습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 진행 중인 콘텐츠 조회
   * @param {string} period - 조회 기간
   * @returns {Promise<Object>} 진행 중인 콘텐츠 목록
   */
  async getOngoingContents(period = 'month') {
    try {
      const response = await contentApi.get(`/ongoing?period=${period}`)

      return formatSuccessResponse(response.data.data, '진행 중인 콘텐츠를 조회했습니다.')
    } catch (error) {
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
      return handleApiError(error)
    }
  }

  /**
   * 콘텐츠 수정
   * @param {number} contentId - 콘텐츠 ID
   * @param {Object} updateData - 수정할 콘텐츠 정보
   * @returns {Promise<Object>} 수정 결과
   */
  async updateContent(contentId, updateData) {
    try {
      const response = await contentApi.put(`/${contentId}`, {
        title: updateData.title,
        content: updateData.content,
        hashtags: updateData.hashtags,
        startDate: updateData.startDate,
        endDate: updateData.endDate,
        status: updateData.status
      })

      return formatSuccessResponse(response.data.data, '콘텐츠가 수정되었습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 콘텐츠 삭제 (CON-025: 콘텐츠 삭제)
   * @param {number} contentId - 콘텐츠 ID
   * @returns {Promise<Object>} 삭제 결과
   */
  async deleteContent(contentId) {
    try {
      await contentApi.delete(`/${contentId}`)

      return formatSuccessResponse(null, '콘텐츠가 삭제되었습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }
}

export const contentService = new ContentService()
export default contentService