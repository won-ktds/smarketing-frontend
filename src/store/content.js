//* src/store/content.js 수정 - 기존 구조 유지하고 API 연동만 추가
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

  // 기존 computed 속성들 유지
  const contentCount = computed(() => contentList.value.length)
  const ongoingContentCount = computed(() => ongoingContents.value.length)

  // generateContent를 실제 API 호출로 수정
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

  // saveContent를 실제 API 호출로 수정
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
        await fetchContentList()
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

  // fetchContentList를 실제 API 호출로 수정
  const fetchContentList = async (filters = {}) => {
    isLoading.value = true
    
    try {
      const result = await contentService.getContents(filters)
      
      if (result.success) {
        contentList.value = result.data
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

  // fetchOngoingContents를 실제 API 호출로 수정
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

  // 콘텐츠 수정/삭제 메서드 추가
  const updateContent = async (contentId, updateData) => {
    isLoading.value = true
    
    try {
      const result = await contentService.updateContent(contentId, updateData)
      
      if (result.success) {
        await fetchContentList()
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

  const deleteContent = async (contentId) => {
    isLoading.value = true
    
    try {
      const result = await contentService.deleteContent(contentId)
      
      if (result.success) {
        await fetchContentList()
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
    ongoingContents,
    selectedContent,
    generatedContent,
    isLoading,
    
    // 컴퓨티드
    contentCount,
    ongoingContentCount,
    
    // 메서드
    generateContent,
    saveContent,
    fetchContentList,
    fetchOngoingContents,
    updateContent,
    deleteContent
  }
})