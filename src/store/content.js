//* src/store/content.js 수정 - generateContent 함수 호출 방식 수정
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import contentService from '@/services/content'

export const useContentStore = defineStore('content', () => {
  // 기존 상태들 유지
  const contentList = ref([])
  const ongoingContents = ref([])
  const selectedContent = ref(null)
  const generatedContent = ref(null)
  const isLoading = ref(false)
  const generating = ref(false)

  // 기존 computed 속성들 유지
  const contentCount = computed(() => contentList.value.length)
  const ongoingContentCount = computed(() => ongoingContents.value.length)

  // generateContent를 실제 API 호출로 수정 - 단일 파라미터로 변경하고 contentService.generateContent 사용
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

  // saveContent를 실제 API 호출로 수정 - 단일 파라미터로 변경
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

  // fetchContentList를 실제 API 호출로 수정
  const fetchContentList = async (filters = {}) => {
    isLoading.value = true
    
    try {
      const result = await contentService.getContents(filters)
      
      if (result && result.success) {
        contentList.value = result.data || []
        return { success: true }
      } else {
        return { 
          success: false, 
          error: result?.message || result?.error || '목록 조회에 실패했습니다.'
        }
      }
    } catch (error) {
      console.error('❌ [STORE] fetchContentList 실패:', error)
      return { 
        success: false, 
        error: error.message || '네트워크 오류가 발생했습니다.' 
      }
    } finally {
      isLoading.value = false
    }
  }

  // fetchOngoingContents를 실제 API 호출로 수정
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

  // 콘텐츠 상세 조회
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

  // 콘텐츠 삭제
  const deleteContent = async (contentId) => {
    isLoading.value = true
    
    try {
      const result = await contentService.deleteContent(contentId)
      
      if (result && result.success) {
        // 목록에서 제거
        contentList.value = contentList.value.filter(content => content.id !== contentId)
        return { success: true, message: '콘텐츠가 삭제되었습니다.' }
      } else {
        return { 
          success: false, 
          error: result?.message || result?.error || '삭제에 실패했습니다.'
        }
      }
    } catch (error) {
      console.error('❌ [STORE] deleteContent 실패:', error)
      return { 
        success: false, 
        error: error.message || '네트워크 오류가 발생했습니다.' 
      }
    } finally {
      isLoading.value = false
    }
  }

  // 콘텐츠 발행
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

  // 콘텐츠 통계 조회
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

  // 상태 초기화
  const resetState = () => {
    contentList.value = []
    ongoingContents.value = []
    selectedContent.value = null
    generatedContent.value = null
    isLoading.value = false
    generating.value = false
  }

  return {
    // 상태
    contentList,
    ongoingContents,
    selectedContent,
    generatedContent,
    isLoading,
    generating,
    
    // computed
    contentCount,
    ongoingContentCount,
    
    // 액션
    generateContent,
    saveContent,
    fetchContentList,
    fetchOngoingContents,
    fetchContentDetail,
    deleteContent,
    publishContent,
    fetchContentStats,
    resetState
  }
})