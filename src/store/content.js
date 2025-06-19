//* src/store/content.js - 두 파일 완전 통합 버전 (Part 1)
import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import contentService from '@/services/content'
import { useAuthStore } from '@/store/auth'

// constants가 없는 경우를 위한 기본값
const PLATFORM_SPECS = {
  INSTAGRAM: { name: '인스타그램', maxLength: 2200 },
  NAVER_BLOG: { name: '네이버 블로그', maxLength: 10000 },
  POSTER: { name: '포스터', maxLength: 500 }
}

const PLATFORM_LABELS = {
  INSTAGRAM: '인스타그램',
  NAVER_BLOG: '네이버 블로그',
  POSTER: '포스터'
}

export const useContentStore = defineStore('content', () => {
  // ===== 상태 관리 =====
  // 기본 상태
  const contentList = ref([])
  const contents = ref([]) // ContentManagementView에서 사용하는 속성
  const ongoingContents = ref([])
  const selectedContent = ref(null)
  const generatedContent = ref(null)
  const totalCount = ref(0)
  
  // 로딩 상태
  const isLoading = ref(false)
  const loading = ref(false)
  const generating = ref(false)
  
  // 필터 상태
  const filters = ref({
    contentType: '',
    platform: '',
    period: '',
    sortBy: 'latest'
  })
  
  // 페이지네이션
  const pagination = ref({
    page: 1,
    itemsPerPage: 10
  })

  // ===== Computed 속성들 =====
  const contentCount = computed(() => contentList.value.length)
  const ongoingContentCount = computed(() => ongoingContents.value.length)
  
  /**
   * 필터링된 콘텐츠 목록
   */
  const filteredContents = computed(() => {
    let filtered = [...contentList.value]
    
    if (filters.value.contentType) {
      filtered = filtered.filter(content => content.type === filters.value.contentType)
    }
    
    if (filters.value.platform) {
      filtered = filtered.filter(content => content.platform === filters.value.platform)
    }
    
    // 정렬
    const sortBy = filters.value.sortBy || 'latest'
    if (sortBy.includes('_')) {
      const [field, order] = sortBy.split('_')
      filtered.sort((a, b) => {
        let aValue = a[field]
        let bValue = b[field]
        
        if (field === 'createdAt' || field === 'updatedAt') {
          aValue = new Date(aValue)
          bValue = new Date(bValue)
        }
        
        if (order === 'desc') {
          return bValue > aValue ? 1 : -1
        } else {
          return aValue > bValue ? 1 : -1
        }
      })
    } else if (sortBy === 'latest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
    
    return filtered
  })

  /**
   * 페이지네이션된 콘텐츠 목록
   */
  const paginatedContents = computed(() => {
    const start = (pagination.value.page - 1) * pagination.value.itemsPerPage
    const end = start + pagination.value.itemsPerPage
    return filteredContents.value.slice(start, end)
  })

  /**
   * 총 페이지 수
   */
  const totalPages = computed(() => {
    return Math.ceil(filteredContents.value.length / pagination.value.itemsPerPage)
  })

  // ===== 매장 정보 조회 함수 (공통 유틸리티) =====
  const getStoreId = async () => {
    try {
      const userInfo = useAuthStore().user
      console.log('사용자 정보:', userInfo)
      
      // 매장 정보 API 호출
      const storeApiUrl = (window.__runtime_config__ && window.__runtime_config__.STORE_URL) 
        ? window.__runtime_config__.STORE_URL 
        : 'http://localhost:8082/api/store'
      
      console.log('매장 API URL:', storeApiUrl)
      
      const token = localStorage.getItem('accessToken') || localStorage.getItem('auth_token') || localStorage.getItem('token')
      const storeResponse = await fetch(`${storeApiUrl}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (storeResponse.ok) {
        const storeData = await storeResponse.json()
        const storeId = storeData.data?.storeId
        console.log('✅ 매장 정보 조회 성공, storeId:', storeId)
        return storeId
      } else {
        throw new Error(`매장 정보 조회 실패: ${storeResponse.status}`)
      }
    } catch (error) {
      console.error('❌ 매장 정보 조회 실패:', error)
      throw new Error('매장 정보를 조회할 수 없습니다.')
    }
  }

  // ===== 콘텐츠 목록 조회 =====
  /**
   * 콘텐츠 목록 로딩 (ContentManagementView에서 사용)
   */
  const loadContents = async (requestFilters = {}) => {
    console.log('=== 콘텐츠 목록 조회 시작 ===')
    isLoading.value = true
    loading.value = true
    
    try {
      // 1단계: 매장 정보 조회하여 실제 storeId 가져오기
      const storeId = await getStoreId()
      
      if (!storeId) {
        throw new Error('매장 ID를 찾을 수 없습니다.')
      }
      
      console.log('조회된 storeId:', storeId)

      // 2단계: 조회된 storeId로 콘텐츠 목록 조회
      const apiFilters = {
        platform: requestFilters.platform || filters.value.platform || null,
        storeId: storeId,
        sortBy: requestFilters.sortBy || filters.value.sortBy || 'latest'
      }
      
      console.log('API 요청 필터:', apiFilters)
      
      const result = await contentService.getContents(apiFilters)
      
      console.log('🔍 contentService.getContents 결과:', result)
      console.log('🔍 result.success:', result.success)
      console.log('🔍 result.data:', result.data)
      console.log('🔍 result.data 타입:', typeof result.data)
      console.log('🔍 result.data 길이:', result.data?.length)

      if (result.success) {
        const responseData = result.data || []
        contents.value = responseData
        contentList.value = responseData
        totalCount.value = responseData.length
        console.log('✅ 콘텐츠 로딩 성공:', contents.value.length, '개')
        return { success: true }
      } else {
        console.error('❌ 콘텐츠 로딩 실패:', result.error)
        contents.value = []
        contentList.value = []
        totalCount.value = 0
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('❌ 콘텐츠 로딩 실패:', error)
      contents.value = []
      contentList.value = []
      totalCount.value = 0
      return { success: false, error: error.message || '네트워크 오류가 발생했습니다.' }
    } finally {
      isLoading.value = false
      loading.value = false
    }
  }

  /**
   * 콘텐츠 목록 조회 (기존 호환성 유지)
   */
  const fetchContentList = async (requestFilters = {}) => {
    console.log('📋 [STORE] fetchContentList 호출:', requestFilters)
    return await loadContents(requestFilters)
  }

  // ===== AI 콘텐츠 생성 =====
  /**
   * SNS 콘텐츠 생성 (API 설계서 기준) - 이미지 디버깅 강화
   */
  const generateSnsContent = async (contentData) => {
    generating.value = true
    
    try {
      console.log('🎯 [STORE] SNS 콘텐츠 생성 요청:', contentData)
      console.log('📁 [STORE] SNS 이미지 확인:', {
        hasImages: !!contentData.images,
        imageCount: contentData.images?.length || 0,
        imageTypes: contentData.images?.map(img => typeof img) || [],
        imageSizes: contentData.images?.map(img => img?.length || 'unknown') || []
      })
      
      // 매장 ID 조회 (필요한 경우)
      let storeId = contentData.storeId
      if (!storeId) {
        try {
          storeId = await getStoreId()
        } catch (error) {
          console.warn('⚠️ 매장 ID 조회 실패, 기본값 사용:', error)
          storeId = 1
        }
      }
      
      // SnsContentCreateRequest 구조에 맞게 데이터 변환
      const requestData = {
        storeId: storeId,
        storeName: contentData.storeName || '',
        storeType: contentData.storeType || '',
        platform: contentData.platform || 'INSTAGRAM',
        title: contentData.title || 'SNS 게시물',
        category: contentData.category || '메뉴소개',
        requirement: contentData.requirement || contentData.requirements || 'SNS 게시물을 생성해주세요',
        target: contentData.target || contentData.targetAudience || '',
        contentType: contentData.contentType || 'SNS 게시물',
        eventName: contentData.eventName || '',
        startDate: contentData.startDate,
        endDate: contentData.endDate,
        images: contentData.images || [],
        photoStyle: contentData.photoStyle || '밝고 화사한',
        targetAge: contentData.targetAge || '20대',
        toneAndManner: contentData.toneAndManner || '친근함',
        emotionalIntensity: contentData.emotionalIntensity || contentData.emotionIntensity || '보통',
        promotionalType: contentData.promotionalType || contentData.promotionType || '',
        eventDate: contentData.eventDate,
        hashtagStyle: contentData.hashtagStyle || '',
        hashtagCount: contentData.hashtagCount || 10,
        contentLength: contentData.contentLength || '보통',
        includeHashtags: contentData.includeHashtags !== false,
        includeEmojis: contentData.includeEmojis !== false,
        includeEmoji: contentData.includeEmoji !== false,
        includeCallToAction: contentData.includeCallToAction !== false,
        includeLocation: contentData.includeLocation || false,
        forInstagramStory: contentData.forInstagramStory || false,
        forNaverBlogPost: contentData.forNaverBlogPost || false,
        alternativeTitleCount: contentData.alternativeTitleCount || 3,
        alternativeHashtagSetCount: contentData.alternativeHashtagSetCount || 2,
        preferredAiModel: contentData.preferredAiModel || ''
      }
      
      console.log('📤 [STORE] SNS 변환된 요청 데이터:', {
        ...requestData,
        images: `${requestData.images.length}개 이미지`
      })
      
      const result = await contentService.generateSnsContent(requestData)
      
      if (result.success) {
        console.log('✅ [STORE] SNS 콘텐츠 생성 성공:', result.data)
        generatedContent.value = result.data
        
        return {
          success: true,
          content: result.data.content || '콘텐츠가 생성되었습니다.',
          hashtags: result.data.hashtags || [],
          data: result.data
        }
      } else {
        console.error('❌ [STORE] SNS 콘텐츠 생성 실패:', result.message)
        return {
          success: false,
          message: result.message || 'SNS 콘텐츠 생성에 실패했습니다.',
          error: result.error
        }
      }
      
    } catch (error) {
      console.error('❌ [STORE] SNS 콘텐츠 생성 예외:', error)
      return {
        success: false,
        message: error.message || '네트워크 오류가 발생했습니다.',
        error: error
      }
    } finally {
      generating.value = false
    }
  }
  //* src/store/content.js - 두 파일 완전 통합 버전 (Part 2)
  /**
   * 포스터 생성 (API 설계서 기준) - 이미지 디버깅 대폭 강화
   */
  const generatePoster = async (posterData) => {
    generating.value = true
    
    try {
      console.log('🎯 [STORE] 포스터 생성 요청 받음:', posterData)
      console.log('📁 [STORE] 포스터 이미지 상세 분석:', {
        hasImages: !!posterData.images,
        imageCount: posterData.images?.length || 0,
        imageArray: Array.isArray(posterData.images),
        firstImageInfo: posterData.images?.[0] ? {
          type: typeof posterData.images[0],
          length: posterData.images[0]?.length || 'unknown',
          isBase64: posterData.images[0]?.startsWith?.('data:image/') || false,
          preview: posterData.images[0]?.substring(0, 50) + '...'
        } : null
      })
      
      // 매장 ID 조회 (필요한 경우)
      let storeId = posterData.storeId
      if (storeId === undefined || storeId === null) {
        try {
          storeId = await getStoreId()
        } catch (error) {
          console.warn('⚠️ 매장 ID 조회 실패, 기본값 사용:', error)
          storeId = 1
        }
      }
      
      // ✅ 실제 전달받은 데이터만 사용 (기본값 완전 제거)
      const requestData = {}
      
      // 조건부로 필드 추가 (값이 있을 때만)
      if (storeId !== undefined) {
        requestData.storeId = storeId
        console.log('📝 [STORE] storeId 추가:', requestData.storeId)
      }
      
      if (posterData.title) {
        requestData.title = posterData.title
        console.log('📝 [STORE] title 추가:', requestData.title)
      }
      
      if (posterData.targetAudience) {
        requestData.targetAudience = posterData.targetAudience
        console.log('📝 [STORE] targetAudience 추가:', requestData.targetAudience)
      } else if (posterData.targetType) {
        requestData.targetAudience = posterData.targetType
        console.log('📝 [STORE] targetAudience 추가 (from targetType):', requestData.targetAudience)
      }
      
      if (posterData.promotionStartDate) {
        requestData.promotionStartDate = posterData.promotionStartDate
        console.log('📝 [STORE] promotionStartDate 추가:', requestData.promotionStartDate)
      }
      
      if (posterData.promotionEndDate) {
        requestData.promotionEndDate = posterData.promotionEndDate
        console.log('📝 [STORE] promotionEndDate 추가:', requestData.promotionEndDate)
      }
      
      // 선택적 필드들
      if (posterData.eventName) {
        requestData.eventName = posterData.eventName
        console.log('📝 [STORE] eventName 추가:', requestData.eventName)
      }
      
      if (posterData.imageStyle) requestData.imageStyle = posterData.imageStyle
      if (posterData.promotionType) requestData.promotionType = posterData.promotionType
      if (posterData.emotionIntensity) requestData.emotionIntensity = posterData.emotionIntensity
      if (posterData.category) requestData.category = posterData.category
      if (posterData.requirement || posterData.requirements) {
        requestData.requirement = posterData.requirement || posterData.requirements
      }
      if (posterData.toneAndManner) requestData.toneAndManner = posterData.toneAndManner
      if (posterData.startDate) requestData.startDate = posterData.startDate
      if (posterData.endDate) requestData.endDate = posterData.endDate
      if (posterData.photoStyle) requestData.photoStyle = posterData.photoStyle
      if (posterData.targetAge) {
        requestData.targetAge = posterData.targetAge
        console.log('📝 [STORE] targetAge 추가:', requestData.targetAge)
      }
      
      // ✅ 이미지 처리 - 가장 중요한 부분
      console.log('📁 [STORE] 이미지 처리 시작...')
      if (posterData.images && Array.isArray(posterData.images) && posterData.images.length > 0) {
        console.log('📁 [STORE] 원본 이미지 배열:', posterData.images.length, '개')
        
        // 유효한 이미지만 필터링
        const validImages = posterData.images.filter(img => {
          const isValid = img && typeof img === 'string' && img.length > 0
          console.log('📁 [STORE] 이미지 유효성 검사:', { 
            isValid, 
            type: typeof img, 
            length: img?.length,
            isBase64: img?.startsWith?.('data:image/')
          })
          return isValid
        })
        
        requestData.images = validImages
        console.log('📁 [STORE] 필터링된 이미지:', validImages.length, '개')
        console.log('📁 [STORE] 첫 번째 이미지 샘플:', validImages[0]?.substring(0, 100) + '...')
      } else {
        requestData.images = []
        console.warn('📁 [STORE] ⚠️  이미지가 없거나 유효하지 않음!')
        console.warn('📁 [STORE] posterData.images:', posterData.images)
      }
      
      console.log('🔍 [STORE] 최종 요청 데이터 확인:')
      console.log('  - 제목:', requestData.title)
      console.log('  - 홍보 대상:', requestData.targetAudience)
      console.log('  - 타겟 연령층:', requestData.targetAge)
      console.log('  - 홍보 시작일:', requestData.promotionStartDate)
      console.log('  - 홍보 종료일:', requestData.promotionEndDate)
      console.log('  - 이미지 개수:', requestData.images.length)
      
      if (requestData.images.length === 0) {
        console.error('❌ [STORE] 포스터에 이미지가 없습니다!')
        return {
          success: false,
          message: '포스터 생성을 위해서는 최소 1개의 이미지가 필요합니다.'
        }
      }
      
      const result = await contentService.generatePoster(requestData)
      
      if (result.success) {
        console.log('✅ [STORE] 포스터 생성 성공:', result.data)
        generatedContent.value = result.data
        
        return {
          success: true,
          content: result.data.posterImage || result.data.content || '포스터가 생성되었습니다.',
          posterImage: result.data.posterImage,
          title: result.data.title,
          data: result.data
        }
      } else {
        console.error('❌ [STORE] 포스터 생성 실패:', result.message)
        return {
          success: false,
          message: result.message || '포스터 생성에 실패했습니다.',
          error: result.error
        }
      }
      
    } catch (error) {
      console.error('❌ [STORE] 포스터 생성 예외:', error)
      return {
        success: false,
        message: error.message || '네트워크 오류가 발생했습니다.',
        error: error
      }
    } finally {
      generating.value = false
    }
  }

  /**
   * AI 콘텐츠 생성 통합 메서드 (기존 호환성 유지)
   */
  const generateContent = async (type, formData) => {
    console.log('🎯 [STORE] 콘텐츠 생성 요청 (통합):', { type, formData })
    console.log('📁 [STORE] 통합 메서드 이미지 확인:', {
      hasImages: !!formData.images,
      imageCount: formData.images?.length || 0
    })
    
    isLoading.value = true
    
    try {
      let result
      
      // 타입에 따라 적절한 메서드 호출
      if (type === 'poster' || formData.contentType === 'poster' || formData.type === 'poster') {
        console.log('🎯 [STORE] 포스터 생성으로 라우팅')
        result = await generatePoster(formData)
      } else if (type === 'sns' || type === 'snsContent') {
        console.log('🎯 [STORE] SNS 생성으로 라우팅')
        result = await generateSnsContent(formData)
      } else {
        console.log('🎯 [STORE] 기본 SNS 생성으로 라우팅')
        result = await generateSnsContent(formData)
      }
      
      if (result.success) {
        return { success: true, data: result.data || result }
      } else {
        return { success: false, error: result.message || result.error }
      }
    } catch (error) {
      console.error('❌ [STORE] 통합 콘텐츠 생성 실패:', error)
      return { success: false, error: '네트워크 오류가 발생했습니다.' }
    } finally {
      isLoading.value = false
    }
  }

  // ===== 콘텐츠 저장 =====
  /**
   * SNS 콘텐츠 저장
   */
  const saveSnsContent = async (saveData) => {
    loading.value = true
    
    try {
      console.log('💾 [STORE] SNS 콘텐츠 저장 요청:', saveData)
      
      // 매장 ID 조회 (필요한 경우)
      let storeId = saveData.storeId
      if (!storeId) {
        try {
          storeId = await getStoreId()
        } catch (error) {
          console.warn('⚠️ 매장 ID 조회 실패, 기본값 사용:', error)
          storeId = 1
        }
      }
      
      // SnsContentSaveRequest 구조에 맞게 데이터 변환
      const requestData = {
        contentId: saveData.contentId,
        storeId: storeId,
        platform: saveData.platform || 'INSTAGRAM',
        title: saveData.title || '',
        content: saveData.content || '',
        hashtags: saveData.hashtags || [],
        images: saveData.images || [],
        finalTitle: saveData.finalTitle || saveData.title || '',
        finalContent: saveData.finalContent || saveData.content || '',
        status: saveData.status || 'DRAFT',
        category: saveData.category || '메뉴소개',
        requirement: saveData.requirement || '',
        toneAndManner: saveData.toneAndManner || '친근함',
        emotionIntensity: saveData.emotionIntensity || saveData.emotionalIntensity || '보통',
        eventName: saveData.eventName || '',
        startDate: saveData.startDate,
        endDate: saveData.endDate,
        promotionalType: saveData.promotionalType,
        eventDate: saveData.eventDate
      }
      
      const result = await contentService.saveSnsContent(requestData)
      
      if (result.success) {
        console.log('✅ [STORE] SNS 콘텐츠 저장 성공')
        
        // 목록 새로고침
        await loadContents()
        
        return { success: true, message: 'SNS 콘텐츠가 저장되었습니다.' }
      } else {
        console.error('❌ [STORE] SNS 콘텐츠 저장 실패:', result.message)
        return { success: false, error: result.message }
      }
    } catch (error) {
      console.error('❌ [STORE] SNS 콘텐츠 저장 예외:', error)
      return { success: false, error: '네트워크 오류가 발생했습니다.' }
    } finally {
      loading.value = false
    }
  }

  /**
   * 포스터 저장
   */
  const savePoster = async (saveData) => {
    loading.value = true
    
    try {
      console.log('💾 [STORE] 포스터 저장 요청:', saveData)
      
      // 매장 ID 조회 (필요한 경우)
      let storeId = saveData.storeId
      if (!storeId) {
        try {
          storeId = await getStoreId()
        } catch (error) {
          console.warn('⚠️ 매장 ID 조회 실패, 기본값 사용:', error)
          storeId = 1
        }
      }
      
      // PosterContentSaveRequest 구조에 맞게 데이터 변환
      const requestData = {
        contentId: saveData.contentId,
        storeId: storeId,
        title: saveData.title || '',
        content: saveData.content || '',
        images: saveData.images || [],
        status: saveData.status || 'DRAFT',
        category: saveData.category || '이벤트',
        requirement: saveData.requirement || '',
        toneAndManner: saveData.toneAndManner || '친근함',
        emotionIntensity: saveData.emotionIntensity || '보통',
        eventName: saveData.eventName || '',
        startDate: saveData.startDate,
        endDate: saveData.endDate,
        photoStyle: saveData.photoStyle || '밝고 화사한',
        targetAudience: saveData.targetAudience,
        promotionType: saveData.promotionType,
        imageStyle: saveData.imageStyle,
        promotionStartDate: saveData.promotionStartDate,
        promotionEndDate: saveData.promotionEndDate
      }
      
      const result = await contentService.savePoster(requestData)
      
      if (result.success) {
        console.log('✅ [STORE] 포스터 저장 성공')
        
        // 목록 새로고침
        await loadContents()
        
        return { success: true, message: '포스터가 저장되었습니다.' }
      } else {
        console.error('❌ [STORE] 포스터 저장 실패:', result.message)
        return { success: false, error: result.message }
      }
    } catch (error) {
      console.error('❌ [STORE] 포스터 저장 예외:', error)
      return { success: false, error: '네트워크 오류가 발생했습니다.' }
    } finally {
      loading.value = false
    }
  }

  /**
   * 콘텐츠 저장 통합 메서드 (기존 호환성 유지)
   */
  const saveContent = async (type, contentData) => {
    console.log('💾 [STORE] 콘텐츠 저장 요청 (통합):', { type, contentData })
    
    isLoading.value = true
    
    try {
      let result
      
      // 타입에 따라 적절한 메서드 호출
      if (type === 'poster' || contentData.contentType === 'poster' || contentData.type === 'poster') {
        result = await savePoster(contentData)
      } else if (type === 'sns' || type === 'snsContent') {
        result = await saveSnsContent(contentData)
      } else {
        // 기본적으로 SNS 콘텐츠로 간주
        result = await saveSnsContent(contentData)
      }
      
      if (result.success) {
        return { success: true, message: result.message || '콘텐츠가 저장되었습니다.' }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('❌ [STORE] 통합 콘텐츠 저장 실패:', error)
      return { success: false, error: '네트워크 오류가 발생했습니다.' }
    } finally {
      isLoading.value = false
    }
  }

  // ===== 기타 콘텐츠 관리 메서드들 =====
  /**
   * 진행 중인 콘텐츠 조회
   */
  const fetchOngoingContents = async (period = 'month') => {
    isLoading.value = true
    loading.value = true
    
    try {
      const result = await contentService.getOngoingContents(period)
      
      if (result.success) {
        ongoingContents.value = result.data || []
        return { success: true }
      } else {
        console.error('❌ 진행 중인 콘텐츠 조회 실패:', result.message)
        return { success: false, error: result.message }
      }
    } catch (error) {
      console.error('❌ 진행 중인 콘텐츠 조회 예외:', error)
      return { success: false, error: '네트워크 오류가 발생했습니다.' }
    } finally {
      isLoading.value = false
      loading.value = false
    }
  }

  /**
   * 콘텐츠 상세 조회
   */
  const fetchContentDetail = async (contentId) => {
    loading.value = true
    
    try {
      const result = await contentService.getContentDetail(contentId)
      
      if (result.success) {
        selectedContent.value = result.data
        return result.data
      } else {
        throw new Error(result.message || '콘텐츠 상세 조회에 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ 콘텐츠 상세 조회 실패:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 콘텐츠 수정
   */
  const updateContent = async (contentId, updateData) => {
    isLoading.value = true
    loading.value = true
    
    try {
      const result = await contentService.updateContent(contentId, updateData)
      
      if (result.success) {
        await loadContents()
        return { success: true, message: '콘텐츠가 수정되었습니다.' }
      } else {
        return { success: false, error: result.message }
      }
    } catch (error) {
      console.error('❌ 콘텐츠 수정 실패:', error)
      return { success: false, error: '네트워크 오류가 발생했습니다.' }
    } finally {
      isLoading.value = false
      loading.value = false
    }
  }

  /**
   * 콘텐츠 삭제
   */
  const deleteContent = async (contentId) => {
    isLoading.value = true
    loading.value = true
    
    try {
      const result = await contentService.deleteContent(contentId)
      
      if (result.success) {
        // 목록에서 제거
        contentList.value = contentList.value.filter(content => content.id !== contentId)
        contents.value = contents.value.filter(content => content.id !== contentId)
        totalCount.value = contentList.value.length
        
        await loadContents() // 최신 목록으로 새로고침
        return { success: true, message: '콘텐츠가 삭제되었습니다.' }
      } else {
        return { success: false, error: result.message }
      }
    } catch (error) {
      console.error('❌ 콘텐츠 삭제 실패:', error)
      return { success: false, error: '네트워크 오류가 발생했습니다.' }
    } finally {
      isLoading.value = false
      loading.value = false
    }
  }

  // ===== 유틸리티 메서드들 =====
  /**
   * 타겟 타입을 카테고리로 매핑
   */
  const mapTargetToCategory = (targetType) => {
    const mapping = {
      'new_menu': '메뉴소개',
      'discount': '이벤트',
      'store': '인테리어', 
      'event': '이벤트',
      'menu': '메뉴소개',
      'service': '서비스'
    }
    return mapping[targetType] || '메뉴소개'
  }

  /**
   * 플랫폼별 특성 조회
   */
  const getPlatformSpec = (platform) => {
    return PLATFORM_SPECS?.[platform] || null
  }

  /**
   * 플랫폼 유효성 검사
   */
  const validatePlatform = (platform) => {
    return PLATFORM_SPECS ? Object.keys(PLATFORM_SPECS).includes(platform) : true
  }

  /**
   * 필터 설정
   */
  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
    pagination.value.page = 1 // 필터 변경 시 첫 페이지로
  }

  /**
   * 페이지네이션 설정
   */
  const setPagination = (newPagination) => {
    pagination.value = { ...pagination.value, ...newPagination }
  }

  /**
   * 상태 초기화
   */
  const reset = () => {
    contentList.value = []
    contents.value = []
    ongoingContents.value = []
    selectedContent.value = null
    generatedContent.value = null
    totalCount.value = 0
    
    filters.value = {
      contentType: '',
      platform: '',
      period: '',
      sortBy: 'latest'
    }
    
    pagination.value = {
      page: 1,
      itemsPerPage: 10
    }
    
    isLoading.value = false
    loading.value = false
    generating.value = false
  }

  // ===== 고급 기능들 (추가) =====
  /**
   * 콘텐츠 검색
   */
  const searchContents = async (query, searchFilters = {}) => {
    loading.value = true
    
    try {
      const result = await contentService.searchContents(query, searchFilters)
      
      if (result.success) {
        contentList.value = result.data || []
        contents.value = result.data || []
        totalCount.value = result.data?.length || 0
        return { success: true }
      } else {
        return { success: false, error: result.message }
      }
    } catch (error) {
      console.error('❌ 콘텐츠 검색 실패:', error)
      return { success: false, error: '네트워크 오류가 발생했습니다.' }
    } finally {
      loading.value = false
    }
  }

  /**
   * 콘텐츠 통계 조회
   */
  const getContentStats = async (statsFilters = {}) => {
    loading.value = true
    
    try {
      const result = await contentService.getContentStats(statsFilters)
      
      if (result.success) {
        return { success: true, data: result.data }
      } else {
        return { success: false, error: result.message }
      }
    } catch (error) {
      console.error('❌ 콘텐츠 통계 조회 실패:', error)
      return { success: false, error: '네트워크 오류가 발생했습니다.' }
    } finally {
      loading.value = false
    }
  }

  /**
   * 콘텐츠 복제
   */
  const duplicateContent = async (contentId) => {
    loading.value = true
    
    try {
      const result = await contentService.duplicateContent(contentId)
      
      if (result.success) {
        await loadContents() // 목록 새로고침
        return { success: true, message: '콘텐츠가 복제되었습니다.' }
      } else {
        return { success: false, error: result.message }
      }
    } catch (error) {
      console.error('❌ 콘텐츠 복제 실패:', error)
      return { success: false, error: '네트워크 오류가 발생했습니다.' }
    } finally {
      loading.value = false
    }
  }

  /**
   * 콘텐츠 상태 변경
   */
  const updateContentStatus = async (contentId, status) => {
    loading.value = true
    
    try {
      const result = await contentService.updateContentStatus(contentId, status)
      
      if (result.success) {
        await loadContents() // 목록 새로고침
        return { success: true, message: `콘텐츠 상태가 ${status}로 변경되었습니다.` }
      } else {
        return { success: false, error: result.message }
      }
    } catch (error) {
      console.error('❌ 콘텐츠 상태 변경 실패:', error)
      return { success: false, error: '네트워크 오류가 발생했습니다.' }
    } finally {
      loading.value = false
    }
  }

  /**
   * 콘텐츠 즐겨찾기 토글
   */
  const toggleContentFavorite = async (contentId) => {
    loading.value = true
    
    try {
      const result = await contentService.toggleContentFavorite(contentId)
      
      if (result.success) {
        await loadContents() // 목록 새로고침
        return { success: true, message: '즐겨찾기가 변경되었습니다.' }
      } else {
        return { success: false, error: result.message }
      }
    } catch (error) {
      console.error('❌ 즐겨찾기 토글 실패:', error)
      return { success: false, error: '네트워크 오류가 발생했습니다.' }
    } finally {
      loading.value = false
    }
  }

  /**
   * 콘텐츠 템플릿 목록 조회
   */
  const getContentTemplates = async (type = 'all') => {
    loading.value = true
    
    try {
      const result = await contentService.getContentTemplates(type)
      
      if (result.success) {
        return { success: true, data: result.data }
      } else {
        return { success: false, error: result.message }
      }
    } catch (error) {
      console.error('❌ 템플릿 목록 조회 실패:', error)
      return { success: false, error: '네트워크 오류가 발생했습니다.' }
    } finally {
      loading.value = false
    }
  }

  /**
   * 템플릿으로 콘텐츠 생성
   */
  const generateFromTemplate = async (templateId, customData = {}) => {
    generating.value = true
    
    try {
      const result = await contentService.generateFromTemplate(templateId, customData)
      
      if (result.success) {
        generatedContent.value = result.data
        return { success: true, data: result.data }
      } else {
        return { success: false, error: result.message }
      }
    } catch (error) {
      console.error('❌ 템플릿 콘텐츠 생성 실패:', error)
      return { success: false, error: '네트워크 오류가 발생했습니다.' }
    } finally {
      generating.value = false
    }
  }

  // ===== 반환할 store 객체 =====
  return {
    // 상태
    contentList: readonly(contentList),
    contents: readonly(contents), // ContentManagementView에서 사용
    ongoingContents: readonly(ongoingContents),
    selectedContent: readonly(selectedContent),
    generatedContent: readonly(generatedContent),
    totalCount: readonly(totalCount),
    isLoading: readonly(isLoading),
    loading: readonly(loading),
    generating: readonly(generating),
    filters: readonly(filters),
    pagination: readonly(pagination),
    
    // 컴퓨티드
    contentCount,
    ongoingContentCount,
    filteredContents,
    paginatedContents,
    totalPages,
    
    // 콘텐츠 목록 조회
    loadContents, // 새로 추가된 메서드 (매장 정보 조회 포함)
    fetchContentList, // 기존 호환성 유지
    
    // AI 콘텐츠 생성
    generateContent, // 통합 메서드 (타입에 따라 라우팅)
    generateSnsContent, // SNS 전용
    generatePoster, // 포스터 전용
    
    // 콘텐츠 저장
    saveContent, // 통합 메서드 (타입에 따라 라우팅)
    saveSnsContent, // SNS 전용
    savePoster, // 포스터 전용
    
    // 기본 CRUD
    fetchOngoingContents,
    fetchContentDetail,
    updateContent,
    deleteContent,
    
    // 유틸리티
    mapTargetToCategory,
    getPlatformSpec,
    validatePlatform,
    setFilters,
    setPagination,
    reset,
    
    // 고급 기능
    searchContents,
    getContentStats,
    duplicateContent,
    updateContentStatus,
    toggleContentFavorite,
    getContentTemplates,
    generateFromTemplate
  }
})