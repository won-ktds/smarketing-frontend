//* src/store/content.js 수정 - 매장 정보 조회 후 콘텐츠 목록 조회
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import contentService from '@/services/content'
import { useAuthStore } from '@/store/auth'

export const useContentStore = defineStore('content', () => {
  // 상태
  const contentList = ref([])
  const contents = ref([]) // ContentManagementView에서 사용하는 속성
  const ongoingContents = ref([])
  const selectedContent = ref(null)
  const generatedContent = ref(null)
  const isLoading = ref(false)

  // computed 속성들
  const contentCount = computed(() => contentList.value.length)
  const ongoingContentCount = computed(() => ongoingContents.value.length)

  // 콘텐츠 목록 로딩 (ContentManagementView에서 사용)
  const loadContents = async (filters = {}) => {
    console.log('=== 콘텐츠 목록 조회 시작 ===')
    isLoading.value = true
    
    try {
      // 1단계: 매장 정보 조회하여 실제 storeId 가져오기
      const userInfo = useAuthStore().user
      let storeId = null
      
      try {
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
          storeId = storeData.data?.storeId
          console.log('✅ 매장 정보 조회 성공, storeId:', storeId)
        } else {
          throw new Error(`매장 정보 조회 실패: ${storeResponse.status}`)
        }
      } catch (error) {
        console.error('❌ 매장 정보 조회 실패:', error)
        throw new Error('매장 정보를 조회할 수 없습니다.')
      }
      
      if (!storeId) {
        throw new Error('매장 ID를 찾을 수 없습니다.')
      }
      
      console.log('사용자 정보:', userInfo)
      console.log('조회된 storeId:', storeId)

      // 2단계: 조회된 storeId로 콘텐츠 목록 조회
      const apiFilters = {
        platform: filters.platform || null, // 전체, INSTAGRAM, NAVER_BLOG, POSTER 등
        storeId: storeId,
        sortBy: filters.sortBy || 'latest'
        // contentType, period는 백엔드에서 사용하지 않으므로 제외
      }
      
      console.log('API 요청 필터:', apiFilters)
      
      const result = await contentService.getContents(apiFilters)
      
      console.log('🔍 contentService.getContents 결과:', result)
      console.log('🔍 result.success:', result.success)
      console.log('🔍 result.data:', result.data)
      console.log('🔍 result.data 타입:', typeof result.data)
      console.log('🔍 result.data 길이:', result.data?.length)


      if (result.success) {
        contents.value = result.data || []
        contentList.value = result.data || []
        console.log('✅ 콘텐츠 로딩 성공:', contents.value.length, '개')
        return { success: true }
      } else {
        console.error('❌ 콘텐츠 로딩 실패:', result.error)
        contents.value = []
        contentList.value = []
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('❌ 콘텐츠 로딩 실패:', error)
      contents.value = []
      contentList.value = []
      return { success: false, error: error.message || '네트워크 오류가 발생했습니다.' }
    } finally {
      isLoading.value = false
    }
  }

  // AI 콘텐츠 생성
  const generateContent = async (type, formData) => {
    isLoading.value = true
    
    try {
      let result
      if (type === 'sns') {
        result = await contentService.generateSnsContent(formData)
      } else if (type === 'poster') {
        result = await contentService.generatePoster(formData)
      }
      
      if (result.success) {
        generatedContent.value = result.data
        return { success: true, data: result.data }
      } else {
        return { success: false, error: result.message }
      }
    } catch (error) {
      return { success: false, error: '네트워크 오류가 발생했습니다.' }
    } finally {
      isLoading.value = false
    }
  }

  // 콘텐츠 저장
  const saveContent = async (type, contentData) => {
    isLoading.value = true
    
    try {
      let result
      if (type === 'sns') {
        result = await contentService.saveSnsContent(contentData)
      } else if (type === 'poster') {
        result = await contentService.savePoster(contentData)
      }
      
      if (result.success) {
        // 콘텐츠 목록 새로고침
        await loadContents()
        return { success: true, message: '콘텐츠가 저장되었습니다.' }
      } else {
        return { success: false, error: result.message }
      }
    } catch (error) {
      return { success: false, error: '네트워크 오류가 발생했습니다.' }
    } finally {
      isLoading.value = false
    }
  }

  // fetchContentList - 기존 호환성 유지
  const fetchContentList = async (filters = {}) => {
    return await loadContents(filters)
  }

  // 진행 중인 콘텐츠 조회
  const fetchOngoingContents = async (period = 'month') => {
    isLoading.value = true
    
    try {
      const result = await contentService.getOngoingContents(period)
      
      if (result.success) {
        ongoingContents.value = result.data
        return { success: true }
      } else {
        return { success: false, error: result.message }
      }
    } catch (error) {
      return { success: false, error: '네트워크 오류가 발생했습니다.' }
    } finally {
      isLoading.value = false
    }
  }

  // 콘텐츠 수정
  const updateContent = async (contentId, updateData) => {
    isLoading.value = true
    
    try {
      const result = await contentService.updateContent(contentId, updateData)
      
      if (result.success) {
        await loadContents()
        return { success: true, message: '콘텐츠가 수정되었습니다.' }
      } else {
        return { success: false, error: result.message }
      }
    } catch (error) {
      return { success: false, error: '네트워크 오류가 발생했습니다.' }
    } finally {
      isLoading.value = false
    }
  }

  // 콘텐츠 삭제
  const deleteContent = async (contentId) => {
    isLoading.value = true
    
    try {
      const result = await contentService.deleteContent(contentId)
      
      if (result.success) {
        await loadContents()
        return { success: true, message: '콘텐츠가 삭제되었습니다.' }
      } else {
        return { success: false, error: result.message }
      }
    } catch (error) {
      return { success: false, error: '네트워크 오류가 발생했습니다.' }
    } finally {
      isLoading.value = false
    }
  }

  return {
    // 상태
    contentList,
    contents, // ContentManagementView에서 사용
    ongoingContents,
    selectedContent,
    generatedContent,
    isLoading,
    
    // 컴퓨티드
    contentCount,
    ongoingContentCount,
    
    // 메서드
    loadContents, // 새로 추가된 메서드
    generateContent,
    saveContent,
    fetchContentList, // 기존 호환성 유지
    fetchOngoingContents,
    updateContent,
    deleteContent
  }
})