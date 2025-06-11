//* src/store/content.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 콘텐츠 관리 스토어
 * 마케팅 콘텐츠 CRUD 및 상태 관리
 */
export const useContentStore = defineStore('content', () => {
  // State
  const contents = ref([])
  const currentContent = ref(null)
  const isLoading = ref(false)
  const isGenerating = ref(false)
  const filters = ref({
    type: 'all',
    platform: 'all',
    status: 'all',
    dateRange: 'all',
  })

  // 임시 데이터 (실제로는 API에서 가져옴)
  const sampleContents = [
    {
      id: 1,
      title: '떡볶이 신메뉴 출시 이벤트',
      type: 'sns',
      platform: 'instagram',
      content: '🌶️ 떡볶이 신메뉴 출시! 치즈가 듬뿍 들어간 치즈떡볶이가 새로 나왔어요!',
      hashtags: ['떡볶이', '신메뉴', '치즈떡볶이', '맛집'],
      images: ['/images/menu-placeholder.png'],
      status: 'published',
      views: 1240,
      likes: 85,
      comments: 12,
      createdAt: new Date('2024-01-15T10:30:00'),
      publishedAt: new Date('2024-01-15T14:00:00'),
    },
    {
      id: 2,
      title: '매장 소개 포스터',
      type: 'poster',
      platform: 'blog',
      content: '우리 매장을 소개하는 포스터입니다.',
      hashtags: ['매장소개', '분식집', '맛집'],
      images: ['/images/store-placeholder.png'],
      status: 'draft',
      views: 0,
      likes: 0,
      comments: 0,
      createdAt: new Date('2024-01-14T16:20:00'),
      publishedAt: null,
    },
    {
      id: 3,
      title: '할인 이벤트 안내',
      type: 'sns',
      platform: 'instagram',
      content: '🎉 특별 할인 이벤트! 오늘 하루만 모든 메뉴 20% 할인!',
      hashtags: ['할인', '이벤트', '특가', '분식'],
      images: ['/images/ai-character.png'],
      status: 'scheduled',
      views: 0,
      likes: 0,
      comments: 0,
      createdAt: new Date('2024-01-13T09:15:00'),
      scheduledAt: new Date('2024-01-16T12:00:00'),
    },
  ]

  // Getters
  const contentCount = computed(() => contents.value.length)

  const filteredContents = computed(() => {
    let filtered = contents.value

    if (filters.value.type !== 'all') {
      filtered = filtered.filter((content) => content.type === filters.value.type)
    }

    if (filters.value.platform !== 'all') {
      filtered = filtered.filter((content) => content.platform === filters.value.platform)
    }

    if (filters.value.status !== 'all') {
      filtered = filtered.filter((content) => content.status === filters.value.status)
    }

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  })

  const publishedContents = computed(() =>
    contents.value.filter((content) => content.status === 'published')
  )

  const draftContents = computed(() =>
    contents.value.filter((content) => content.status === 'draft')
  )

  const scheduledContents = computed(() =>
    contents.value.filter((content) => content.status === 'scheduled')
  )

  const recentContents = computed(() => {
    return contents.value.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
  })

  const totalViews = computed(() =>
    contents.value.reduce((sum, content) => sum + (content.views || 0), 0)
  )

  const totalLikes = computed(() =>
    contents.value.reduce((sum, content) => sum + (content.likes || 0), 0)
  )

  // Actions
  const loadContents = async () => {
    try {
      isLoading.value = true

      // API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 임시로 샘플 데이터 사용
      contents.value = [...sampleContents]

      console.log('콘텐츠 목록 로드 완료:', contents.value.length)
    } catch (error) {
      console.error('콘텐츠 로드 실패:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const getContentById = (id) => {
    return contents.value.find((content) => content.id === parseInt(id))
  }

  const addContent = (content) => {
    const newContent = {
      ...content,
      id: Date.now(), // 임시 ID
      createdAt: new Date(),
      views: 0,
      likes: 0,
      comments: 0,
    }
    contents.value.unshift(newContent)
    return newContent
  }

  const updateContent = (contentId, updatedData) => {
    const index = contents.value.findIndex((content) => content.id === contentId)
    if (index !== -1) {
      contents.value[index] = {
        ...contents.value[index],
        ...updatedData,
        updatedAt: new Date(),
      }
      return contents.value[index]
    }
    return null
  }

  const deleteContent = (contentId) => {
    const index = contents.value.findIndex((content) => content.id === contentId)
    if (index !== -1) {
      const deletedContent = contents.value[index]
      contents.value.splice(index, 1)
      return deletedContent
    }
    return null
  }

  const publishContent = async (contentId) => {
    try {
      isLoading.value = true

      // API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const content = updateContent(contentId, {
        status: 'published',
        publishedAt: new Date(),
      })

      console.log('콘텐츠 발행 완료:', content?.title)
      return content
    } catch (error) {
      console.error('콘텐츠 발행 실패:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const scheduleContent = async (contentId, scheduledTime) => {
    try {
      isLoading.value = true

      // API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 500))

      const content = updateContent(contentId, {
        status: 'scheduled',
        scheduledAt: new Date(scheduledTime),
      })

      console.log('콘텐츠 예약 완료:', content?.title)
      return content
    } catch (error) {
      console.error('콘텐츠 예약 실패:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const generateContent = async (options) => {
    try {
      isGenerating.value = true

      // AI 콘텐츠 생성 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const generatedContent = {
        title: `AI 생성 콘텐츠 - ${options.type}`,
        type: options.type,
        platform: options.platform,
        content: `AI가 생성한 ${options.type} 콘텐츠입니다. ${options.description || ''}`,
        hashtags: options.hashtags || [],
        images: options.images || [],
        status: 'draft',
      }

      const newContent = addContent(generatedContent)
      console.log('AI 콘텐츠 생성 완료:', newContent.title)

      return newContent
    } catch (error) {
      console.error('AI 콘텐츠 생성 실패:', error)
      throw error
    } finally {
      isGenerating.value = false
    }
  }

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const resetFilters = () => {
    filters.value = {
      type: 'all',
      platform: 'all',
      status: 'all',
      dateRange: 'all',
    }
  }

  const setCurrentContent = (content) => {
    currentContent.value = content
  }

  const clearCurrentContent = () => {
    currentContent.value = null
  }

  return {
    // State
    contents,
    currentContent,
    isLoading,
    isGenerating,
    filters,
    // Getters
    contentCount,
    filteredContents,
    publishedContents,
    draftContents,
    scheduledContents,
    recentContents,
    totalViews,
    totalLikes,
    // Actions
    loadContents,
    getContentById,
    addContent,
    updateContent,
    deleteContent,
    publishContent,
    scheduleContent,
    generateContent,
    setFilters,
    resetFilters,
    setCurrentContent,
    clearCurrentContent,
  }
})
