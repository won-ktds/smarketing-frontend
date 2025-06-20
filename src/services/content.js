//* src/services/content.js - 최종 완전한 파일 (콘텐츠 관리 기능 통합)

import axios from 'axios'

// runtime-env.js에서 API URL 가져오기 (대체 방식 포함)
const getApiUrl = (serviceName) => {
  if (typeof window !== 'undefined' && window.__runtime_config__) {
    const urlKey = `${serviceName.toUpperCase()}_URL`
    const apiUrl = window.__runtime_config__[urlKey]
    if (apiUrl) {
      console.log(`✅ ${serviceName} API URL 로드됨:`, apiUrl)
      return apiUrl
    }
  }
  
  // 대체 URL 반환 - /api/content 사용 (백엔드 경로에 맞춤)
  const fallbackUrl = `http://localhost:8083/api/content`
  console.log(`⚠️ ${serviceName} API URL 대체값 사용:`, fallbackUrl)
  return fallbackUrl
}

// Content API 인스턴스 생성 - baseURL 수정 (마지막 슬래시 제거)
const contentApi = axios.create({
  baseURL: getApiUrl('CONTENT').replace(/\/$/, ''), // 마지막 슬래시 제거
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 요청 인터셉터 - JWT 토큰 자동 추가
contentApi.interceptors.request.use(
  (config) => {
    console.log('🔄 Content API 요청:', config.method?.toUpperCase(), config.url)
    
    const token = localStorage.getItem('accessToken') || localStorage.getItem('auth_token') || localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      console.warn('⚠️ JWT 토큰이 없습니다!')
    }
    
    console.log('요청 데이터:', config.data || config.params)
    return config
  },
  (error) => {
    console.error('❌ Content API 요청 오류:', error)
    return Promise.reject(error)
  }
)

// 응답 인터셉터
contentApi.interceptors.response.use(
  (response) => {
    console.log('✅ Content API 응답:', response.status, response.data)
    return response
  },
  (error) => {
    console.error('❌ Content API 응답 오류:', error.response?.status, error.response?.data)
    
    if (error.response?.status === 401) {
      // 토큰 만료 처리
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)

// 공통 응답 처리 함수
const formatSuccessResponse = (data, message = '요청이 성공했습니다.') => ({
  success: true,
  data,
  message
})

const handleApiError = (error) => {
  console.error('API 오류 처리:', error)
  
  if (error.response) {
    return {
      success: false,
      error: error.response.data?.message || `서버 오류 (${error.response.status})`,
      status: error.response.status
    }
  } else if (error.request) {
    return {
      success: false,
      error: '네트워크 연결을 확인해주세요.',
      status: 0
    }
  } else {
    return {
      success: false,
      error: error.message || '알 수 없는 오류가 발생했습니다.',
      status: 0
    }
  }
}

/**
 * 콘텐츠 서비스 클래스 - 완전 통합 버전
 * Java 백엔드 multipart/form-data API와 연동 + 콘텐츠 관리 기능 통합
 */
class ContentService {
  /**
   * 콘텐츠 목록 조회 (CON-021: 콘텐츠 조회)
   * @param {Object} filters - 필터 조건
   * @returns {Promise<Object>} 콘텐츠 목록
   */
  async getContents(filters = {}) {
    try {
      console.log('🔄 콘텐츠 목록 조회 요청:', filters)
      
      // 쿼리 파라미터 구성 - 빈 값 제거
      const params = new URLSearchParams()
      
      // 필수 파라미터만 추가 (값이 있을 때만)
      if (filters.storeId) {
        params.append('storeId', filters.storeId.toString())
      }
      if (filters.sortBy) {
        params.append('sortBy', filters.sortBy)
      }
      
      // 선택적 파라미터 (값이 있고 'all'이 아닐 때만)
      if (filters.platform && filters.platform !== 'all') {
        params.append('platform', filters.platform)
      }
      if (filters.contentType && filters.contentType !== 'all') {
        params.append('contentType', filters.contentType)
      }
      if (filters.period && filters.period !== 'all') {
        params.append('period', filters.period)
      }
      
      const queryString = params.toString()
      const fullUrl = `${getApiUrl('CONTENT').replace(/\/$/, '')}${queryString ? `?${queryString}` : ''}`
      
      console.log('📡 완전한 API URL:', fullUrl)
      
      // axios 대신 fetch 사용 (브라우저 콘솔 테스트와 동일하게)
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('auth_token') || localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const responseData = await response.json()

      // 백엔드 응답 구조에 따른 데이터 추출
      let contentData = []
      
      if (responseData.success) {
        contentData = responseData.data || []
      } else if (Array.isArray(responseData)) {
        contentData = responseData
      } else if (responseData.contents) {
        contentData = responseData.contents
      } else if (responseData.data) {
        contentData = responseData.data || []
      }
      
      console.log('✅ 콘텐츠 조회 성공:', contentData.length, '개')
      
      return formatSuccessResponse(contentData, '콘텐츠 목록을 조회했습니다.')
    } catch (error) {
      console.error('❌ 콘텐츠 조회 실패:', error)
      return handleApiError(error)
    }
  }

  /**
   * ✅ 통합 콘텐츠 생성 (타입에 따라 SNS 또는 포스터 생성)
   * @param {Object} contentData - 콘텐츠 생성 데이터
   * @returns {Promise<Object>} 생성 결과
   */
  async generateContent(contentData) {
    console.log('🎯 [API] 통합 콘텐츠 생성:', contentData)
    
    // ✅ contentData 유효성 검사 강화
    if (!contentData || typeof contentData !== 'object') {
      console.error('❌ [API] contentData가 유효하지 않음:', contentData)
      return {
        success: false,
        message: '콘텐츠 데이터가 유효하지 않습니다.',
        error: 'INVALID_CONTENT_DATA'
      }
    }
    
    // ✅ images 속성 보장 - 이 부분이 핵심 수정사항
    if (!contentData.hasOwnProperty('images')) {
      console.warn('⚠️ [API] images 속성이 없음, 빈 배열로 설정')
      contentData.images = []
    }
    
    if (!Array.isArray(contentData.images)) {
      console.warn('⚠️ [API] images가 배열이 아님, 빈 배열로 변환:', typeof contentData.images)
      contentData.images = []
    }
    
    console.log('✅ [API] images 속성 보장 완료:', contentData.images.length, '개')
    
    // 타입에 따른 분기 처리
    if (contentData.contentType === 'poster' || contentData.type === 'poster') {
      return await this.generatePoster(contentData)
    } else {
      return await this.generateSnsContent(contentData)
    }
  }

 /**
   * ✅ 완전한 SnsContentCreateRequest DTO에 맞춘 SNS 콘텐츠 생성
   * @param {Object} contentData - 콘텐츠 생성 데이터
   * @returns {Promise<Object>} 생성된 콘텐츠
   */
  async generateSnsContent(contentData) {
    try {
      console.log('🤖 SNS 콘텐츠 생성 요청:', contentData)
      
      // ✅ 필수 필드 검증
      if (!contentData.storeId) {
        throw new Error('매장 ID는 필수입니다.')
      }
      
      if (!contentData.platform) {
        throw new Error('플랫폼은 필수입니다.')
      }
      
      if (!contentData.title) {
        throw new Error('콘텐츠 제목은 필수입니다.')
      }
      
      // ✅ FormData 생성
      const formData = new FormData()
      
      // ✅ 완전한 SnsContentCreateRequest DTO에 맞춘 데이터 구성
      const requestData = {
        // ========== 기본 정보 ==========
        storeId: parseInt(contentData.storeId),
        storeName: contentData.storeName || '샘플 매장',
        storeType: contentData.storeType || '음식점',
        platform: this.normalizePlatform(contentData.platform),
        title: String(contentData.title).trim(),
        
        // ========== 콘텐츠 생성 조건 ==========
        category: contentData.category || '메뉴소개',
        requirement: contentData.requirement || contentData.requirements || `${contentData.title}에 대한 SNS 게시물을 만들어주세요`,
        target: contentData.target || contentData.targetAudience || '일반고객',
        toneAndManner: contentData.toneAndManner || '친근함',
        emotionIntensity: contentData.emotionIntensity || contentData.emotionalIntensity || '보통',
        
        // ========== 이벤트 정보 ==========
        eventName: contentData.eventName || '',
        startDate: this.convertToJavaDate(contentData.startDate),
        endDate: this.convertToJavaDate(contentData.endDate),
        
        // ========== 미디어 정보 ==========
        images: [], // 파일로 별도 전송
        photoStyle: contentData.photoStyle || '밝고 화사한',
        
        // ========== 추가 옵션 ==========
        includeHashtags: contentData.includeHashtags !== false,
        includeEmojis: contentData.includeEmojis !== false,
        includeCallToAction: contentData.includeCallToAction !== false,
        includeLocation: contentData.includeLocation || false,
        
        // ========== 플랫폼별 옵션 ==========
        forInstagramStory: contentData.forInstagramStory || false,
        forNaverBlogPost: contentData.forNaverBlogPost || false,
        
        // ========== AI 생성 옵션 ==========
        alternativeTitleCount: contentData.alternativeTitleCount || 3,
        alternativeHashtagSetCount: contentData.alternativeHashtagSetCount || 2,
        preferredAiModel: contentData.preferredAiModel || 'gpt-4-turbo',
        
        // ========== 검증 플래그 ==========
        validForPlatform: true,
        validEventDates: true
      }
      
      // ✅ null/undefined 값 정리
      Object.keys(requestData).forEach(key => {
        if (requestData[key] === null || requestData[key] === undefined) {
          delete requestData[key]
        }
        // 빈 문자열도 제거 (Boolean과 Number 제외)
        if (typeof requestData[key] === 'string' && requestData[key].trim() === '') {
          delete requestData[key]
        }
      })
      
      console.log('📝 [API] 완전한 SNS 요청 데이터:', requestData)
      
      // ✅ FormData에 JSON 추가
      formData.append('request', JSON.stringify(requestData))
      
      // ✅ 이미지 파일 처리
      let imageCount = 0
      if (contentData.images && Array.isArray(contentData.images) && contentData.images.length > 0) {
        for (let i = 0; i < contentData.images.length; i++) {
          const imageData = contentData.images[i]
          if (typeof imageData === 'string' && imageData.startsWith('data:image/')) {
            try {
              const blob = this.base64ToBlob(imageData)
              formData.append('files', blob, `image_${i}.jpg`)
              imageCount++
            } catch (error) {
              console.warn(`⚠️ 이미지 ${i} 변환 실패:`, error)
            }
          }
        }
      }
      
      console.log(`📁 [API] FormData 구성 완료 (이미지 ${imageCount}개)`)
      
      // ✅ 디버깅을 위한 FormData 내용 출력
      console.log('📋 [DEBUG] FormData 항목들:')
      for (let [key, value] of formData.entries()) {
        if (value instanceof Blob) {
          console.log(`  ${key}: Blob (${value.size} bytes, ${value.type})`)
        } else {
          console.log(`  ${key}:`, value)
        }
      }
      
      // ✅ API 호출
      const response = await contentApi.post('/sns/generate', formData, {
        timeout: 0,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('✅ [API] SNS 콘텐츠 생성 응답:', response.data)
      
      // ✅ 응답 처리
      if (response.data?.success && response.data?.data) {
        return formatSuccessResponse({
          content: response.data.data.content || '',
          hashtags: response.data.data.hashtags || [],
          contentId: response.data.data.contentId,
          platform: response.data.data.platform,
          title: response.data.data.title,
          alternativeTitles: response.data.data.alternativeTitles || [],
          alternativeHashtagSets: response.data.data.alternativeHashtagSets || []
        }, 'SNS 게시물이 생성되었습니다.')
      } else if (response.data?.data?.content) {
        // success 필드가 없는 경우도 처리
        return formatSuccessResponse({
          content: response.data.data.content,
          hashtags: response.data.data.hashtags || []
        }, 'SNS 게시물이 생성되었습니다.')
      } else {
        throw new Error(response.data?.message || 'SNS 콘텐츠 생성에 실패했습니다.')
      }
      
    } catch (error) {
      console.error('❌ [API] SNS 콘텐츠 생성 실패:', error)
      
      // ✅ 상세한 에러 로깅
      if (error.response) {
        console.error('❌ [DEBUG] HTTP Status:', error.response.status)
        console.error('❌ [DEBUG] Response Headers:', error.response.headers)
        console.error('❌ [DEBUG] Response Data:', error.response.data)
        
        if (error.response.status === 400) {
          const backendMessage = error.response.data?.message || '요청 데이터가 잘못되었습니다.'
          return {
            success: false,
            message: `요청 검증 실패: ${backendMessage}`,
            error: error.response.data
          }
        } else if (error.response.status === 500) {
          return {
            success: false,
            message: 'AI 서비스에서 콘텐츠 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
            error: error.response.data
          }
        }
      } else if (error.request) {
        console.error('❌ [DEBUG] Request timeout or network error')
        return {
          success: false,
          message: '서버에 연결할 수 없습니다. 네트워크 연결을 확인해 주세요.',
          error: 'NETWORK_ERROR'
        }
      }
      
      return handleApiError(error)
    }
  }

  /**
   * ✅ multipart/form-data 형식으로 수정된 포스터 생성
   * @param {Object} posterData - 포스터 생성 데이터
   * @returns {Promise<Object>} 생성 결과
   */
  async generatePoster(posterData) {
    try {
      console.log('🎯 [API] 포스터 생성 요청 받음:', posterData)
      
      // ✅ Java 백엔드 필수 필드 검증 (PosterContentCreateRequest 기준)
      if (!posterData.title) {
        throw new Error('제목은 필수입니다.')
      }
      
      if (!posterData.targetAudience && !posterData.targetType) {
        throw new Error('홍보 대상은 필수입니다.')
      }
      
      if (!posterData.promotionStartDate) {
        throw new Error('홍보 시작일은 필수입니다.')
      }
      
      if (!posterData.promotionEndDate) {
        throw new Error('홍보 종료일은 필수입니다.')
      }
      
      // ✅ FormData 생성 (multipart/form-data)
      const formData = new FormData()
      
      // ✅ request JSON 부분 구성 (Java PosterContentCreateRequest DTO에 맞춤)
      const requestData = {
        storeId: posterData.storeId || 1,
        title: posterData.title,
        targetAudience: posterData.targetAudience || posterData.targetType || posterData.target,
        promotionStartDate: this.convertToJavaDateTime(posterData.promotionStartDate || posterData.startDate),
        promotionEndDate: this.convertToJavaDateTime(posterData.promotionEndDate || posterData.endDate),
        menuName: posterData.menuName || (posterData.targetType === 'menu' ? posterData.title : null),
        eventName: posterData.eventName || null,
        imageStyle: posterData.imageStyle || '모던',
        category: posterData.category || '이벤트',
        requirement: posterData.requirement || posterData.requirements || `${posterData.title}에 대한 포스터를 만들어주세요`,
        startDate: this.convertToJavaDate(posterData.startDate),
        endDate: this.convertToJavaDate(posterData.endDate),
        photoStyle: posterData.photoStyle || '밝고 화사한'
      }
      
      // null 값 제거
      Object.keys(requestData).forEach(key => {
        if (requestData[key] === null || requestData[key] === undefined) {
          delete requestData[key]
        }
      })
      
      console.log('📝 [API] Java 백엔드용 요청 데이터:', requestData)
      
      // ✅ request를 JSON 문자열로 FormData에 추가
      formData.append('request', JSON.stringify(requestData))
      
      // ✅ 이미지 파일들을 FormData에 추가
      if (posterData.images && posterData.images.length > 0) {
        // Base64 이미지를 Blob으로 변환하여 추가
        for (let i = 0; i < posterData.images.length; i++) {
          const imageData = posterData.images[i]
          if (typeof imageData === 'string' && imageData.startsWith('data:image/')) {
            try {
              const blob = this.base64ToBlob(imageData)
              formData.append('images', blob, `image_${i}.jpg`)
            } catch (error) {
              console.warn(`⚠️ 이미지 ${i} 변환 실패:`, error)
            }
          }
        }
      }
      
      console.log('📁 [API] FormData 구성 완료')
      
      // ✅ multipart/form-data로 Java 백엔드 API 호출
      const response = await contentApi.post('/poster/generate', formData, {
        timeout: 0,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('✅ [API] 포스터 생성 응답:', response.data)
      
      // ✅ Java 백엔드 ApiResponse 구조에 맞춰 처리
      if (response.data && response.data.success && response.data.data) {
        return formatSuccessResponse(response.data.data, '홍보 포스터가 생성되었습니다.')
      } else if (response.data && response.data.status === 200 && response.data.data) {
        return formatSuccessResponse(response.data.data, '홍보 포스터가 생성되었습니다.')
      } else {
        throw new Error(response.data?.message || '포스터 생성에 실패했습니다.')
      }
      
    } catch (error) {
      console.error('❌ [API] 포스터 생성 실패:', error)
      
      if (error.response) {
        console.error('❌ [API] HTTP 응답 오류:')
        console.error('  - Status:', error.response.status)
        console.error('  - Data:', error.response.data)
        
        let errorMessage = '서버 오류가 발생했습니다.'
        
        if (error.response.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error
        }
        
        return {
          success: false,
          message: errorMessage,
          error: error.response.data,
          statusCode: error.response.status
        }
      } else {
        return {
          success: false,
          message: error.message || '포스터 생성 중 예상치 못한 오류가 발생했습니다.',
          error: 'UNKNOWN_ERROR'
        }
      }
    }
  }

  /**
   * ✅ Base64 이미지를 Blob으로 변환
   * @param {string} base64Data - Base64 이미지 데이터
   * @returns {Blob} 변환된 Blob 객체
   */
  base64ToBlob(base64Data) {
    const arr = base64Data.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    
    return new Blob([u8arr], { type: mime })
  }

  /**
   * ✅ 날짜를 Java LocalDateTime 형식으로 변환
   * @param {string} dateTimeString - 날짜 문자열
   * @returns {string} Java LocalDateTime 형식 (yyyy-MM-ddTHH:mm:ss)
   */
  convertToJavaDateTime(dateTimeString) {
    if (!dateTimeString) return null
    
    try {
      // "2025-06-19T09:58" 형식이면 그대로 사용하고 초 추가
      if (dateTimeString.includes('T')) {
        return dateTimeString.length === 16 ? dateTimeString + ':00' : dateTimeString
      }
      
      // "2025-06-19" 형식이면 시간 추가
      return dateTimeString + 'T00:00:00'
    } catch (error) {
      console.error('❌ DateTime 변환 오류:', error)
      return null
    }
  }

  /**
   * ✅ 날짜를 Java LocalDate 형식으로 변환
   * @param {string} dateString - 날짜 문자열
   * @returns {string} Java LocalDate 형식 (yyyy-MM-dd)
   */
  convertToJavaDate(dateString) {
    if (!dateString) return null
    
    try {
      // "2025-06-19T09:58" -> "2025-06-19"
      if (dateString.includes('T')) {
        return dateString.split('T')[0]
      }
      
      // 이미 yyyy-MM-dd 형식이면 그대로 반환
      return dateString
    } catch (error) {
      console.error('❌ Date 변환 오류:', error)
      return null
    }
  }

  /**
   * ✅ 플랫폼 이름 정규화
   * @param {string} platform - 플랫폼 이름
   * @returns {string} 정규화된 플랫폼 이름
   */
  normalizePlatform(platform) {
    const platformMap = {
      'instagram': 'INSTAGRAM',
      'naver_blog': 'NAVER_BLOG', 
      'facebook': 'FACEBOOK',
      'kakao_story': 'KAKAO_STORY'
    }
    return platformMap[platform] || platform.toUpperCase()
  }

  /**
   * SNS 콘텐츠 저장 (CON-010: SNS 게시물 저장)
   * @param {Object} saveData - 저장할 콘텐츠 데이터
   * @returns {Promise<Object>} 저장 결과
   */
  async saveSnsContent(saveData) {
  try {
    const requestData = {}
    
    // ❌ contentId 제거 (백엔드 DTO에 없음)
    // if (saveData.contentId) requestData.contentId = saveData.contentId
    
    // ✅ 필수 필드들
    if (saveData.storeId !== undefined) requestData.storeId = saveData.storeId
    
    // ✅ contentType 필수 필드 추가 - enum 값에 맞게
    requestData.contentType = 'SNS' // 첫 번째 enum 버전에 맞춤
    
    // ✅ platform 필수 필드 보장
    if (saveData.platform) {
      requestData.platform = saveData.platform
    } else {
      requestData.platform = 'INSTAGRAM' // 기본값
    }
    
    // 선택적 필드들
    if (saveData.title) requestData.title = saveData.title
    if (saveData.content) requestData.content = saveData.content
    if (saveData.hashtags) requestData.hashtags = saveData.hashtags
    if (saveData.images) requestData.images = saveData.images
    if (saveData.finalTitle) requestData.finalTitle = saveData.finalTitle
    if (saveData.finalContent) requestData.finalContent = saveData.finalContent
    if (saveData.status) requestData.status = saveData.status
    if (saveData.category) requestData.category = saveData.category
    if (saveData.requirement) requestData.requirement = saveData.requirement
    if (saveData.toneAndManner) requestData.toneAndManner = saveData.toneAndManner
    if (saveData.emotionIntensity || saveData.emotionalIntensity) {
      requestData.emotionIntensity = saveData.emotionIntensity || saveData.emotionalIntensity
    }
    if (saveData.eventName) requestData.eventName = saveData.eventName
    if (saveData.startDate) requestData.startDate = saveData.startDate
    if (saveData.endDate) requestData.endDate = saveData.endDate
    if (saveData.promotionalType) requestData.promotionalType = saveData.promotionalType
    if (saveData.eventDate) requestData.eventDate = saveData.eventDate
    
    console.log('📤 [API] SNS 저장 요청 데이터:', requestData)
    
    const response = await contentApi.post('/sns/save', requestData)
    return formatSuccessResponse(response.data.data, 'SNS 게시물이 저장되었습니다.')
  } catch (error) {
    console.error('❌ [API] SNS 저장 실패:', error)
    return handleApiError(error)
  }
}

  /**
   * 포스터 저장 (CON-015: 포스터 저장) - 수정된 버전
   * @param {Object} saveData - 저장할 포스터 데이터
   * @returns {Promise<Object>} 저장 결과
   */
  async savePoster(saveData) {
  try {
    const requestData = {}
    
    // ❌ contentId 제거 (백엔드 DTO에 없음)
    // if (saveData.contentId) requestData.contentId = saveData.contentId
    
    if (saveData.storeId !== undefined) requestData.storeId = saveData.storeId
    if (saveData.title) requestData.title = saveData.title
    if (saveData.content) requestData.content = saveData.content
    if (saveData.images) requestData.images = saveData.images
    if (saveData.status) requestData.status = saveData.status
    if (saveData.category) requestData.category = saveData.category
    if (saveData.requirement) requestData.requirement = saveData.requirement
    if (saveData.toneAndManner) requestData.toneAndManner = saveData.toneAndManner
    if (saveData.emotionIntensity) requestData.emotionIntensity = saveData.emotionIntensity
    if (saveData.eventName) requestData.eventName = saveData.eventName
    if (saveData.startDate) requestData.startDate = saveData.startDate
    if (saveData.endDate) requestData.endDate = saveData.endDate
    if (saveData.photoStyle) requestData.photoStyle = saveData.photoStyle
    if (saveData.targetAudience) requestData.targetAudience = saveData.targetAudience
    if (saveData.promotionType) requestData.promotionType = saveData.promotionType
    if (saveData.imageStyle) requestData.imageStyle = saveData.imageStyle
    if (saveData.promotionStartDate) requestData.promotionStartDate = saveData.promotionStartDate
    if (saveData.promotionEndDate) requestData.promotionEndDate = saveData.promotionEndDate
    
    console.log('📤 [API] 포스터 저장 요청 데이터:', requestData)
    
    const response = await contentApi.post('/poster/save', requestData)
    return formatSuccessResponse(response.data.data, '포스터가 저장되었습니다.')
  } catch (error) {
    console.error('❌ [API] 포스터 저장 실패:', error)
    return handleApiError(error)
  }
}

  /**
   * ✅ 콘텐츠 저장 (통합)
   * @param {Object} saveData - 저장할 콘텐츠 데이터
   * @returns {Promise<Object>} 저장 결과
   */
  async saveContent(saveData) {
    try {
    console.log('💾 [API] 콘텐츠 저장 요청:', saveData)
    
    // ✅ 콘텐츠 타입에 따라 다른 API 호출
    if (saveData.contentType === 'SNS' || saveData.platform) {
      // SNS 콘텐츠 저장
      console.log('📱 [API] SNS 콘텐츠 저장 API 호출')
      return await this.saveSnsContent(saveData)
    } else {
      // 포스터 콘텐츠 저장
      console.log('🖼️ [API] 포스터 콘텐츠 저장 API 호출')
      return await this.savePoster(saveData)
    }
  } catch (error) {
    console.error('❌ [API] 콘텐츠 저장 실패:', error)
    return handleApiError(error)
  }
}

  /**
   * ✅ 진행 중인 콘텐츠 조회 (첫 번째 코드에서 추가)
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
   * ✅ 콘텐츠 상세 조회 (두 번째 코드에서 유지)
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
   * ✅ 콘텐츠 수정 (CON-024: 콘텐츠 수정) - 두 번째 코드에서 유지
   * @param {number} contentId - 콘텐츠 ID
   * @param {Object} updateData - 수정할 콘텐츠 정보
   * @returns {Promise<Object>} 수정 결과
   */
  async updateContent(contentId, updateData) {
    try {
      const requestData = {}
      
      if (updateData.title) requestData.title = updateData.title
      if (updateData.content) requestData.content = updateData.content
      if (updateData.hashtags) requestData.hashtags = updateData.hashtags
      if (updateData.startDate) requestData.startDate = updateData.startDate
      if (updateData.endDate) requestData.endDate = updateData.endDate
      if (updateData.status) requestData.status = updateData.status
      if (updateData.category) requestData.category = updateData.category
      if (updateData.requirement) requestData.requirement = updateData.requirement
      if (updateData.eventName) requestData.eventName = updateData.eventName
      if (updateData.images) requestData.images = updateData.images
      
      const response = await contentApi.put(`/${contentId}`, requestData)
      return formatSuccessResponse(response.data.data, '콘텐츠가 수정되었습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * ✅ 콘텐츠 삭제 (CON-025: 콘텐츠 삭제) - 두 번째 코드에서 유지
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

  /**
   * ✅ 타겟 타입을 카테고리로 매핑 (첫 번째 코드에서 추가)
   * @param {string} targetType - 타겟 타입
   * @returns {string} 매핑된 카테고리
   */
  mapTargetToCategory(targetType) {
    const mapping = {
      'new_menu': '메뉴소개',
      'discount': '이벤트',
      'store': '인테리어', 
      'event': '이벤트',
      'menu': '메뉴소개',
      'service': '서비스'
    }
    return mapping[targetType] || '이벤트'
  }

  /**
   * ✅ 콘텐츠 검색 (첫 번째 코드에서 추가)
   * @param {string} query - 검색어
   * @param {Object} filters - 필터 조건
   * @returns {Promise<Object>} 검색 결과
   */
  async searchContents(query, filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      if (query) queryParams.append('search', query)
      if (filters.contentType) queryParams.append('contentType', filters.contentType)
      if (filters.platform) queryParams.append('platform', filters.platform)
      if (filters.period) queryParams.append('period', filters.period)
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy)
      if (filters.page) queryParams.append('page', filters.page)
      if (filters.size) queryParams.append('size', filters.size)

      const queryString = queryParams.toString()
      const url = queryString ? `/search?${queryString}` : '/search'
      
      const response = await contentApi.get(url)
      return formatSuccessResponse(response.data.data, '콘텐츠 검색을 완료했습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * ✅ 콘텐츠 통계 조회 (첫 번째 코드에서 추가)
   * @param {Object} filters - 필터 조건
   * @returns {Promise<Object>} 통계 데이터
   */
  async getContentStats(filters = {}) {
    try {
      const queryParams = new URLSearchParams()
      if (filters.period) queryParams.append('period', filters.period)
      if (filters.storeId) queryParams.append('storeId', filters.storeId)

      const queryString = queryParams.toString()
      const url = queryString ? `/stats?${queryString}` : '/stats'
      
      const response = await contentApi.get(url)
      return formatSuccessResponse(response.data.data, '콘텐츠 통계를 조회했습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * ✅ 콘텐츠 복제 (첫 번째 코드에서 추가)
   * @param {number} contentId - 복제할 콘텐츠 ID
   * @returns {Promise<Object>} 복제 결과
   */
  async duplicateContent(contentId) {
    try {
      const response = await contentApi.post(`/${contentId}/duplicate`)
      return formatSuccessResponse(response.data.data, '콘텐츠가 복제되었습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * ✅ 콘텐츠 상태 변경 (첫 번째 코드에서 추가)
   * @param {number} contentId - 콘텐츠 ID
   * @param {string} status - 변경할 상태
   * @returns {Promise<Object>} 상태 변경 결과
   */
  async updateContentStatus(contentId, status) {
    try {
      const response = await contentApi.patch(`/${contentId}/status`, { status })
      return formatSuccessResponse(response.data.data, `콘텐츠 상태가 ${status}로 변경되었습니다.`)
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * ✅ 콘텐츠 즐겨찾기 토글 (첫 번째 코드에서 추가)
   * @param {number} contentId - 콘텐츠 ID
   * @returns {Promise<Object>} 즐겨찾기 토글 결과
   */
  async toggleContentFavorite(contentId) {
    try {
      const response = await contentApi.post(`/${contentId}/favorite`)
      return formatSuccessResponse(response.data.data, '즐겨찾기가 변경되었습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * ✅ 콘텐츠 템플릿 목록 조회 (첫 번째 코드에서 추가)
   * @param {string} type - 템플릿 타입
   * @returns {Promise<Object>} 템플릿 목록
   */
  async getContentTemplates(type = 'all') {
    try {
      const response = await contentApi.get(`/templates?type=${type}`)
      return formatSuccessResponse(response.data.data, '콘텐츠 템플릿을 조회했습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * ✅ 템플릿으로 콘텐츠 생성 (첫 번째 코드에서 추가)
   * @param {number} templateId - 템플릿 ID
   * @param {Object} customData - 커스터마이징 데이터
   * @returns {Promise<Object>} 생성 결과
   */
  async generateFromTemplate(templateId, customData = {}) {
    try {
      const response = await contentApi.post(`/templates/${templateId}/generate`, customData)
      return formatSuccessResponse(response.data.data, '템플릿으로 콘텐츠가 생성되었습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }
}

// 서비스 인스턴스 생성 및 내보내기
const contentService = new ContentService()

// API 인스턴스와 유틸리티 함수도 함께 내보내기
export { contentApi, handleApiError, formatSuccessResponse }
export default contentService