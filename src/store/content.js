//* src/store/content.js - 콘텐츠 관리 기능이 통합된 최종 버전
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

  // ===== 기존 API 호출 함수들을 통합된 방식으로 수정 =====
  
  /**
   * generateContent를 실제 API 호출로 수정 - 단일 파라미터로 변경하고 contentService.generateContent 사용
   */
  const generateContent = async (contentData) => {
    generating.value = true
    
    try {
      console.log('🎯 [STORE] generateContent 호출됨:', contentData)
      
      // contentService의 통합 generateContent 함수 사용
      const result = await contentService.generateContent(contentData)
      
      console.log('🎯 [STORE] API 응답:', result)
      
      if (result && result.success) {
        generatedContent.value = result.data
        return { 
          success: true, 
          data: result.data, 
          content: result.data?.content || result.data?.text,
          hashtags: result.data?.hashtags || []
        }
      } else {
        return { 
          success: false, 
          error: result?.message || result?.error || 'API 응답이 올바르지 않습니다.'
        }
      }
    } catch (error) {
      console.error('❌ [STORE] generateContent 실패:', error)
      return { 
        success: false, 
        error: error.message || '네트워크 오류가 발생했습니다.' 
      }
    } finally {
      generating.value = false
    }
  }

  /**
   * saveContent를 실제 API 호출로 수정 - 단일 파라미터로 변경
   */
  const saveContent = async (contentData) => {
    isLoading.value = true
    
    try {
      console.log('💾 [STORE] saveContent 호출됨:', contentData)
      
      // contentService의 통합 saveContent 함수 사용
      const result = await contentService.saveContent(contentData)
      
      if (result && result.success) {
        // 콘텐츠 목록 새로고침
        await fetchContentList()
        return { success: true, message: '콘텐츠가 저장되었습니다.' }
      } else {
        return { 
          success: false, 
          error: result?.message || result?.error || '저장에 실패했습니다.'
        }
      }
    } catch (error) {
      console.error('❌ [STORE] saveContent 실패:', error)
      return { 
        success: false, 
        error: error.message || '네트워크 오류가 발생했습니다.' 
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * fetchContentList를 실제 API 호출로 수정 (기존 호환성 유지)
   */
  const fetchContentList = async (requestFilters = {}) => {
    console.log('📋 [STORE] fetchContentList 호출:', requestFilters)
    return await loadContents(requestFilters)
  }

  /**
   * fetchOngoingContents를 실제 API 호출로 수정
   */
  const fetchOngoingContents = async (period = 'month') => {
    isLoading.value = true
    
    try {
      const result = await contentService.getOngoingContents(period)
      
      if (result && result.success) {
        ongoingContents.value = result.data || []
        return { success: true }
      } else {
        return { 
          success: false, 
          error: result?.message || result?.error || '진행 중인 콘텐츠 조회에 실패했습니다.'
        }
      }
    } catch (error) {
      console.error('❌ [STORE] fetchOngoingContents 실패:', error)
      return { 
        success: false, 
        error: error.message || '네트워크 오류가 발생했습니다.' 
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 콘텐츠 상세 조회
   */
  const fetchContentDetail = async (contentId) => {
    isLoading.value = true
    
    try {
      const result = await contentService.getContentDetail(contentId)
      
      if (result && result.success) {
        selectedContent.value = result.data
        return { success: true, data: result.data }
      } else {
        return { 
          success: false, 
          error: result?.message || result?.error || '콘텐츠 상세 조회에 실패했습니다.'
        }
      }
    } catch (error) {
      console.error('❌ [STORE] fetchContentDetail 실패:', error)
      return { 
        success: false, 
        error: error.message || '네트워크 오류가 발생했습니다.' 
      }
    } finally {
      isLoading.value = false
    }
  }

  // ===== 콘텐츠 관리 기능들 (첫 번째 코드에서 추가) =====
  
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

  /**
   * 콘텐츠 발행
   */
  const publishContent = async (contentId, publishData) => {
    isLoading.value = true
    
    try {
      const result = await contentService.publishContent(contentId, publishData)
      
      if (result && result.success) {
        // 목록 새로고침
        await fetchContentList()
        return { success: true, message: '콘텐츠가 발행되었습니다.' }
      } else {
        return { 
          success: false, 
          error: result?.message || result?.error || '발행에 실패했습니다.'
        }
      }
    } catch (error) {
      console.error('❌ [STORE] publishContent 실패:', error)
      return { 
        success: false, 
        error: error.message || '네트워크 오류가 발생했습니다.' 
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 콘텐츠 통계 조회
   */
  const fetchContentStats = async (options = {}) => {
    isLoading.value = true
    
    try {
      const result = await contentService.getContentStats(options)
      
      if (result && result.success) {
        return { success: true, data: result.data }
      } else {
        return { 
          success: false, 
          error: result?.message || result?.error || '통계 조회에 실패했습니다.'
        }
      }
    } catch (error) {
      console.error('❌ [STORE] fetchContentStats 실패:', error)
      return { 
        success: false, 
        error: error.message || '네트워크 오류가 발생했습니다.' 
      }
    } finally {
      isLoading.value = false
    }
  }

  // ===== 추가된 고급 콘텐츠 관리 기능들 =====
  
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
   * 콘텐츠 통계 조회 (추가)
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
  const resetState = () => {
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

  return {
    // 상태 (readonly로 보호)
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
    
    // 기본 CRUD 액션들
    loadContents, // 새로 추가된 메서드 (매장 정보 조회 포함)
    generateContent,
    saveContent,
    fetchContentList, // 기존 호환성 유지
    fetchOngoingContents,
    fetchContentDetail,
    updateContent,
    deleteContent,
    
    // 추가 액션들
    publishContent,
    fetchContentStats,
    
    // 고급 콘텐츠 관리 기능들
    searchContents,
    getContentStats,
    duplicateContent,
    updateContentStatus,
    toggleContentFavorite,
    
    // 유틸리티
    mapTargetToCategory,
    getPlatformSpec,
    validatePlatform,
    setFilters,
    setPagination,
    resetState
  }
})