//* src/services/content.js - 두 파일 완전 통합 버전
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
 * 백엔드 API 설계서와 일치하도록 구현
 */
class ContentService {
  /**
   * 콘텐츠 목록 조회 (CON-021: 콘텐츠 조회)
   * @param {Object} filters - 필터 조건
   * @param {string} filters.platform - 플랫폼 (instagram, blog, poster)
   * @param {number} filters.storeId - 매장 ID
   * @param {string} filters.contentType - 콘텐츠 타입
   * @param {string} filters.period - 조회 기간
   * @param {string} filters.sortBy - 정렬 기준
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
   * SNS 콘텐츠 생성 (CON-019: AI 콘텐츠 생성)
   * @param {Object} contentData - 콘텐츠 생성 데이터
   * @returns {Promise<Object>} 생성된 콘텐츠
   */
  async generateSnsContent(contentData) {
    try {
      console.log('🤖 SNS 콘텐츠 생성 요청:', contentData)
      
      // ✅ 이미지 처리 (SNS는 선택사항)
      let processedImages = []
      if (contentData.images && Array.isArray(contentData.images) && contentData.images.length > 0) {
        console.log('📁 [API] SNS 이미지 처리:', contentData.images.length, '개')
        
        processedImages = contentData.images.filter(img => {
          const isValid = img && typeof img === 'string' && img.length > 0
          console.log('📁 [API] SNS 이미지 유효성:', { isValid, type: typeof img, length: img?.length })
          return isValid
        })
        
        console.log('📁 [API] SNS 유효 이미지:', processedImages.length, '개')
      }
      
      // ✅ 실제 전달받은 데이터만 사용 (백엔드 API 스펙에 맞춤)
      const requestData = {}
      
      if (contentData.storeId !== undefined) requestData.storeId = contentData.storeId
      if (contentData.storeName) requestData.storeName = contentData.storeName
      if (contentData.storeType) requestData.storeType = contentData.storeType
      if (contentData.platform) requestData.platform = contentData.platform
      if (contentData.title) requestData.title = contentData.title
      if (contentData.category) requestData.category = contentData.category
      if (contentData.requirement || contentData.requirements) {
        requestData.requirement = contentData.requirement || contentData.requirements
      }
      if (contentData.target || contentData.targetAudience) {
        requestData.target = contentData.target || contentData.targetAudience
      }
      if (contentData.contentType) requestData.contentType = contentData.contentType
      if (contentData.eventName) requestData.eventName = contentData.eventName
      if (contentData.startDate) requestData.startDate = contentData.startDate
      if (contentData.endDate) requestData.endDate = contentData.endDate
      if (contentData.photoStyle) requestData.photoStyle = contentData.photoStyle
      if (contentData.targetAge) requestData.targetAge = contentData.targetAge
      if (contentData.toneAndManner) requestData.toneAndManner = contentData.toneAndManner
      if (contentData.emotionalIntensity || contentData.emotionIntensity) {
        requestData.emotionalIntensity = contentData.emotionalIntensity || contentData.emotionIntensity
      }
      if (contentData.promotionalType || contentData.promotionType) {
        requestData.promotionalType = contentData.promotionalType || contentData.promotionType
      }
      if (contentData.eventDate) requestData.eventDate = contentData.eventDate
      if (contentData.hashtagStyle) requestData.hashtagStyle = contentData.hashtagStyle
      if (contentData.hashtagCount) requestData.hashtagCount = contentData.hashtagCount
      if (contentData.contentLength) requestData.contentLength = contentData.contentLength
      
      // 이미지는 처리된 것으로 설정
      requestData.images = processedImages
      
      // Boolean 필드들 (기본값 처리)
      if (contentData.includeHashtags !== undefined) requestData.includeHashtags = contentData.includeHashtags
      if (contentData.includeEmojis !== undefined) requestData.includeEmojis = contentData.includeEmojis
      if (contentData.includeEmoji !== undefined) requestData.includeEmoji = contentData.includeEmoji
      if (contentData.includeCallToAction !== undefined) requestData.includeCallToAction = contentData.includeCallToAction
      if (contentData.includeLocation !== undefined) requestData.includeLocation = contentData.includeLocation
      if (contentData.forInstagramStory !== undefined) requestData.forInstagramStory = contentData.forInstagramStory
      if (contentData.forNaverBlogPost !== undefined) requestData.forNaverBlogPost = contentData.forNaverBlogPost
      
      if (contentData.alternativeTitleCount !== undefined) requestData.alternativeTitleCount = contentData.alternativeTitleCount
      if (contentData.alternativeHashtagSetCount !== undefined) requestData.alternativeHashtagSetCount = contentData.alternativeHashtagSetCount
      if (contentData.preferredAiModel) requestData.preferredAiModel = contentData.preferredAiModel
      
      console.log('📝 [API] SNS 요청 데이터:', {
        ...requestData,
        images: `${requestData.images.length}개 이미지`
      })
      
      // 기본 유효성 검사
      if (!requestData.platform) {
        throw new Error('플랫폼은 필수입니다.')
      }
      
      if (!requestData.title) {
        throw new Error('제목은 필수입니다.')
      }
      
      const response = await contentApi.post('/sns/generate', requestData, {
        timeout: 30000 // 30초
      })

      console.log('✅ [API] SNS 콘텐츠 생성 응답:', response.data)
      return formatSuccessResponse(response.data, 'SNS 게시물이 생성되었습니다.')
    } catch (error) {
      console.error('❌ [API] SNS 콘텐츠 생성 실패:', error)
      return handleApiError(error)
    }
  }

  /**
   * 포스터 생성 (CON-020: AI 포스터 생성) - 이미지 처리 강화 및 상세 검증
   * @param {Object} posterData - 포스터 생성 데이터
   * @returns {Promise<Object>} 생성된 포스터
   */
  async generatePoster(posterData) {
    try {
      console.log('🎯 [API] 포스터 생성 요청 받음:', posterData)
      
      // ✅ 1. 이미지 상세 분석 및 검증
      console.log('📁 [API] 이미지 상세 분석 시작...')
      console.log('📁 [API] posterData.images 타입:', typeof posterData.images)
      console.log('📁 [API] posterData.images 배열 여부:', Array.isArray(posterData.images))
      console.log('📁 [API] posterData.images 길이:', posterData.images?.length)
      
      let processedImages = []
      
      if (posterData.images && Array.isArray(posterData.images) && posterData.images.length > 0) {
        console.log('📁 [API] 원본 이미지 배열 처리 시작...')
        
        // 각 이미지를 개별적으로 검증
        posterData.images.forEach((img, index) => {
          console.log(`📁 [API] 이미지 ${index + 1} 분석:`, {
            type: typeof img,
            isString: typeof img === 'string',
            length: img?.length,
            isNull: img === null,
            isUndefined: img === undefined,
            isEmpty: img === '',
            isBase64: typeof img === 'string' && img.startsWith('data:image/'),
            preview: typeof img === 'string' ? img.substring(0, 50) + '...' : 'Not string'
          })
        })
        
        // 유효한 이미지만 필터링 (더 엄격한 검증)
        processedImages = posterData.images.filter((img, index) => {
          const isValid = img && 
                         typeof img === 'string' && 
                         img.length > 100 && // 최소 길이 체크 (Base64는 보통 매우 길다)
                         (img.startsWith('data:image/') || img.startsWith('http'))
          
          console.log(`📁 [API] 이미지 ${index + 1} 유효성:`, {
            isValid,
            reason: !img ? 'null/undefined' :
                   typeof img !== 'string' ? 'not string' :
                   img.length <= 100 ? 'too short' :
                   !img.startsWith('data:image/') && !img.startsWith('http') ? 'invalid format' :
                   'valid'
          })
          
          return isValid
        })
        
        console.log('📁 [API] 필터링 결과:', {
          원본개수: posterData.images.length,
          유효개수: processedImages.length,
          제거된개수: posterData.images.length - processedImages.length
        })
        
        if (processedImages.length === 0) {
          console.error('❌ [API] 유효한 이미지가 없습니다!')
          console.error('❌ [API] 원본 이미지 상태:', posterData.images.map((img, i) => ({
            index: i,
            type: typeof img,
            length: img?.length,
            preview: typeof img === 'string' ? img.substring(0, 30) : 'not string'
          })))
          
          throw new Error('유효한 이미지가 없습니다. 이미지를 다시 선택해 주세요.')
        }
      } else {
        console.warn('⚠️ [API] 이미지가 없거나 유효하지 않음!')
        console.warn('⚠️ [API] posterData.images:', posterData.images)
        processedImages = []
      }
      
      // ✅ 2. 필수 필드 검증 강화
      const validationErrors = []
      
      if (!posterData.title || posterData.title.trim() === '') {
        validationErrors.push('제목은 필수입니다.')
      }
      
      if (!posterData.targetAudience) {
        validationErrors.push('홍보 대상은 필수입니다.')
      }
      
      if (processedImages.length === 0) {
        validationErrors.push('포스터 생성을 위해서는 최소 1개의 유효한 이미지가 필요합니다.')
      }
      
      if (validationErrors.length > 0) {
        console.error('❌ [API] 유효성 검사 실패:', validationErrors)
        throw new Error(validationErrors.join(' '))
      }
      
      // ✅ 3. 실제 전달받은 데이터만 사용 (백엔드 API 스펙에 맞춤)
      const requestData = {}
      
      // 필수 필드들 (값이 있을 때만 추가)
      if (posterData.storeId !== undefined && posterData.storeId !== null) {
        requestData.storeId = posterData.storeId
      }
      
      if (posterData.title) {
        requestData.title = posterData.title.trim()
      }
      
      if (posterData.targetAudience || posterData.targetType) {
        requestData.targetAudience = posterData.targetAudience || posterData.targetType
      }
      
      if (posterData.promotionStartDate) {
        requestData.promotionStartDate = posterData.promotionStartDate
      }
      
      if (posterData.promotionEndDate) {
        requestData.promotionEndDate = posterData.promotionEndDate
      }
      
      // 선택적 필드들 (값이 있을 때만 추가)
      if (posterData.eventName) {
        requestData.eventName = posterData.eventName
      }
      
      if (posterData.imageStyle) {
        requestData.imageStyle = posterData.imageStyle
      }
      
      if (posterData.promotionType || posterData.targetType) {
        requestData.promotionType = posterData.promotionType || posterData.targetType
      }
      
      if (posterData.emotionIntensity) {
        requestData.emotionIntensity = posterData.emotionIntensity
      }
      
      // 이미지는 검증된 것만 포함
      requestData.images = processedImages
      
      if (posterData.category) {
        requestData.category = posterData.category
      }
      
      if (posterData.requirement || posterData.requirements) {
        requestData.requirement = posterData.requirement || posterData.requirements
      }
      
      if (posterData.toneAndManner) {
        requestData.toneAndManner = posterData.toneAndManner
      }
      
      if (posterData.startDate) {
        requestData.startDate = posterData.startDate
      }
      
      if (posterData.endDate) {
        requestData.endDate = posterData.endDate
      }
      
      if (posterData.photoStyle) {
        requestData.photoStyle = posterData.photoStyle
      }
      
      if (posterData.targetAge) {
        requestData.targetAge = posterData.targetAge
      }
      
      console.log('📝 [API] 최종 요청 데이터 구성 완료:')
      console.log('📝 [API] 제목:', requestData.title)
      console.log('📝 [API] 홍보대상:', requestData.targetAudience)
      console.log('📝 [API] 이미지개수:', requestData.images.length)
      console.log('📝 [API] 첫번째이미지크기:', requestData.images[0]?.length, 'chars')
      console.log('📝 [API] 매장ID:', requestData.storeId)
      console.log('📝 [API] 타겟연령:', requestData.targetAge)
      
      // ✅ 4. 최종 요청 데이터 검증
      if (!requestData.images || requestData.images.length === 0) {
        throw new Error('처리된 이미지가 없습니다. 이미지 업로드를 다시 시도해 주세요.')
      }
      
      // JSON 직렬화 테스트
      try {
        const testJson = JSON.stringify(requestData)
        console.log('📝 [API] JSON 직렬화 테스트 성공, 크기:', Math.round(testJson.length / 1024), 'KB')
      } catch (jsonError) {
        console.error('❌ [API] JSON 직렬화 실패:', jsonError)
        throw new Error('요청 데이터 직렬화에 실패했습니다.')
      }
      
      console.log('🚀 [API] 백엔드 API 호출 시작:', '/poster/generate')
      
      // ✅ 5. 실제 백엔드 API 호출 (타임아웃 증가)
      const response = await contentApi.post('/poster/generate', requestData, {
        timeout: 60000, // 60초로 증가 (포스터 생성은 시간이 걸림)
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('✅ [API] 포스터 생성 응답 수신:', {
        status: response.status,
        hasData: !!response.data,
        dataType: typeof response.data
      })
      console.log('✅ [API] 응답 데이터:', response.data)
      
      // ✅ 6. 백엔드 응답 구조에 맞춰 처리
      if (response.data && response.data.success !== false) {
        return formatSuccessResponse(response.data, '홍보 포스터가 생성되었습니다.')
      } else {
        throw new Error(response.data?.message || '포스터 생성에 실패했습니다.')
      }
      
    } catch (error) {
      console.error('❌ [API] 포스터 생성 실패:', error)
      
      // ✅ 7. 백엔드 오류 상세 정보 추출 및 분석
      if (error.response) {
        console.error('❌ [API] HTTP 응답 오류:')
        console.error('  - Status:', error.response.status)
        console.error('  - Status Text:', error.response.statusText)
        console.error('  - Headers:', error.response.headers)
        console.error('  - Data:', JSON.stringify(error.response.data, null, 2))
        
        // 백엔드에서 반환하는 구체적인 오류 메시지 추출
        let backendMessage = '서버 오류가 발생했습니다.'
        
        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            backendMessage = error.response.data
          } else if (error.response.data.message) {
            backendMessage = error.response.data.message
          } else if (error.response.data.error) {
            backendMessage = error.response.data.error
          } else if (error.response.data.detail) {
            backendMessage = error.response.data.detail
          }
        }
        
        console.error('❌ [API] 백엔드 오류 메시지:', backendMessage)
        
        // 특정 오류 코드별 처리
        if (error.response.status === 400) {
          if (backendMessage.includes('이미지') || backendMessage.includes('image')) {
            backendMessage = '이미지 처리 중 오류가 발생했습니다. 이미지를 다시 선택해 주세요.'
          }
        } else if (error.response.status === 413) {
          backendMessage = '이미지 파일이 너무 큽니다. 더 작은 이미지를 선택해 주세요.'
        } else if (error.response.status === 500) {
          backendMessage = '서버에서 포스터 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
        }
        
        // 유효성 검사 오류가 있다면 추출
        if (error.response.data && error.response.data.errors) {
          console.error('❌ [API] 유효성 검사 오류:', error.response.data.errors)
          const validationMessages = Object.values(error.response.data.errors).flat()
          if (validationMessages.length > 0) {
            backendMessage = validationMessages.join(', ')
          }
        }
        
        return {
          success: false,
          message: backendMessage,
          error: error.response.data,
          statusCode: error.response.status
        }
      } else if (error.request) {
        console.error('❌ [API] 네트워크 요청 오류:', error.request)
        return {
          success: false,
          message: '서버에 연결할 수 없습니다. 네트워크 연결을 확인해 주세요.',
          error: 'NETWORK_ERROR'
        }
      } else {
        console.error('❌ [API] 일반 오류:', error.message)
        return {
          success: false,
          message: error.message || '포스터 생성 중 예상치 못한 오류가 발생했습니다.',
          error: 'UNKNOWN_ERROR'
        }
      }
    }
  }

  /**
   * SNS 콘텐츠 저장 (CON-010: SNS 게시물 저장)
   * @param {Object} saveData - 저장할 콘텐츠 데이터
   * @returns {Promise<Object>} 저장 결과
   */
  async saveSnsContent(saveData) {
    try {
      const requestData = {}
      
      if (saveData.contentId) requestData.contentId = saveData.contentId
      if (saveData.storeId !== undefined) requestData.storeId = saveData.storeId
      if (saveData.platform) requestData.platform = saveData.platform
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
      
      const response = await contentApi.post('/sns/save', requestData)
      return formatSuccessResponse(response.data.data, 'SNS 게시물이 저장되었습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 포스터 저장 (CON-015: 포스터 저장)
   * @param {Object} saveData - 저장할 포스터 데이터
   * @returns {Promise<Object>} 저장 결과
   */
  async savePoster(saveData) {
    try {
      const requestData = {}
      
      if (saveData.contentId) requestData.contentId = saveData.contentId
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
      
      const response = await contentApi.post('/poster/save', requestData)
      return formatSuccessResponse(response.data.data, '포스터가 저장되었습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 통합 콘텐츠 생성 (타입에 따라 SNS 또는 포스터 생성)
   * @param {Object} contentData - 콘텐츠 생성 데이터
   * @returns {Promise<Object>} 생성 결과
   */
  async generateContent(contentData) {
    console.log('🎯 [API] 통합 콘텐츠 생성:', contentData)
    
    if (contentData.contentType === 'poster' || contentData.type === 'poster') {
      return await this.generatePoster(contentData)
    } else {
      return await this.generateSnsContent(contentData)
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
   * 콘텐츠 수정 (CON-024: 콘텐츠 수정)
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
      if (updateData.toneAndManner) requestData.toneAndManner = updateData.toneAndManner
      if (updateData.emotionIntensity) requestData.emotionIntensity = updateData.emotionIntensity
      if (updateData.eventName) requestData.eventName = updateData.eventName
      if (updateData.images) requestData.images = updateData.images
      
      const response = await contentApi.put(`/${contentId}`, requestData)

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

  /**
   * 타겟 타입을 카테고리로 매핑
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
   * 콘텐츠 검색 (추가 기능)
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
   * 콘텐츠 통계 조회 (추가 기능)
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
   * 콘텐츠 복제 (추가 기능)
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
   * 콘텐츠 상태 변경 (추가 기능)
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
   * 콘텐츠 즐겨찾기 토글 (추가 기능)
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
   * 콘텐츠 템플릿 목록 조회 (추가 기능)
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
   * 템플릿으로 콘텐츠 생성 (추가 기능)
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