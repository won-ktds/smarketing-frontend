//* src/store/content.js
import { defineStore } from 'pinia'
import ContentService from '@/services/content.js'
import { PLATFORM_SPECS, PLATFORM_LABELS } from '@/utils/constants'

/**
 * 콘텐츠 관련 상태 관리
 */
export const useContentStore = defineStore('content', {
  state: () => ({
    // 콘텐츠 목록
    contentList: [],
    totalCount: 0,
    
    // 선택된 콘텐츠
    selectedContent: null,
    
    // 로딩 상태
    loading: false,
    generating: false,
    
    // 필터 상태
    filters: {
      contentType: '',
      platform: '',
      period: '',
      sortBy: 'createdAt_desc'
    },
    
    // 페이지네이션
    pagination: {
      page: 1,
      itemsPerPage: 10
    }
  }),

  getters: {
    /**
     * 필터링된 콘텐츠 목록
     */
    filteredContents: (state) => {
      let filtered = [...state.contentList]
      
      if (state.filters.contentType) {
        filtered = filtered.filter(content => content.type === state.filters.contentType)
      }
      
      if (state.filters.platform) {
        filtered = filtered.filter(content => content.platform === state.filters.platform)
      }
      
      // 정렬
      const [field, order] = state.filters.sortBy.split('_')
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
      
      return filtered
    },

    /**
     * 페이지네이션된 콘텐츠 목록
     */
    paginatedContents: (state) => {
      const start = (state.pagination.page - 1) * state.pagination.itemsPerPage
      const end = start + state.pagination.itemsPerPage
      return state.filteredContents.slice(start, end)
    },

    /**
     * 총 페이지 수
     */
    totalPages: (state) => {
      return Math.ceil(state.filteredContents.length / state.pagination.itemsPerPage)
    }
  },

  actions: {
    /**
     * 콘텐츠 생성 (AI 기반)
     */
    async generateContent(contentData) {
      this.generating = true
      
      try {
        console.log('🎯 콘텐츠 생성 시작:', contentData)
        
        // 백엔드 DTO에 맞는 데이터 구조로 변환
        const requestData = {
          storeId: 1, // 현재는 하드코딩, 추후 로그인한 사용자의 매장 ID 사용
          storeName: '테스트 매장', // 추후 실제 매장 정보 사용
          storeType: '음식점', // 추후 실제 매장 업종 사용
          platform: contentData.platform,
          title: contentData.title,
          category: contentData.category || this.mapTargetToCategory(contentData.targetType),
          requirement: contentData.requirements || '',
          target: contentData.targetType || '일반 고객',
          contentType: 'SNS 게시물',
          eventName: contentData.eventName,
          startDate: contentData.startDate,
          endDate: contentData.endDate,
          images: contentData.images || [],
          photoStyle: '밝고 화사한',
          includeHashtags: true,
          includeEmojis: true,
          includeCallToAction: true,
          includeLocationInfo: false
        }
        
        const result = await ContentService.generateSnsContent(requestData)
        
        if (result.success) {
          console.log('✅ 콘텐츠 생성 성공:', result.data)
          return result.data
        } else {
          throw new Error(result.message || '콘텐츠 생성에 실패했습니다.')
        }
      } catch (error) {
        console.error('❌ 콘텐츠 생성 실패:', error)
        throw error
      } finally {
        this.generating = false
      }
    },

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
    },

    /**
     * 플랫폼별 특성 조회
     */
    getPlatformSpec(platform) {
      return PLATFORM_SPECS[platform] || null
    },

    /**
     * 플랫폼 유효성 검사
     */
    validatePlatform(platform) {
      return Object.keys(PLATFORM_SPECS).includes(platform)
    },

    /**
     * 콘텐츠 저장
     */
    async saveContent(contentData) {
      this.loading = true
      
      try {
        // 백엔드 DTO에 맞는 형식으로 데이터 정제
        const saveData = {
          title: contentData.title,
          content: contentData.content,
          hashtags: contentData.hashtags || [],
          platform: contentData.platform, // 이미 백엔드 형식 (INSTAGRAM, NAVER_BLOG 등)
          category: contentData.category || '메뉴소개',
          eventName: contentData.eventName,
          eventDate: contentData.eventDate,
          status: contentData.status || 'DRAFT'
        }
        
        const result = await ContentService.saveSnsContent(saveData)
        
        if (result.success) {
          // 목록 새로고침
          await this.fetchContentList()
          return result.data
        } else {
          throw new Error(result.message || '콘텐츠 저장에 실패했습니다.')
        }
      } catch (error) {
        console.error('❌ 콘텐츠 저장 실패:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 콘텐츠 목록 조회
     */
    async fetchContentList() {
      this.loading = true
      
      try {
        const result = await ContentService.getContentList(this.filters)
        
        if (result.success) {
          this.contentList = result.data || []
          this.totalCount = this.contentList.length
        } else {
          throw new Error(result.message || '콘텐츠 목록 조회에 실패했습니다.')
        }
      } catch (error) {
        console.error('❌ 콘텐츠 목록 조회 실패:', error)
        this.contentList = []
        this.totalCount = 0
      } finally {
        this.loading = false
      }
    },

    /**
     * 콘텐츠 상세 조회
     */
    async fetchContentDetail(contentId) {
      this.loading = true
      
      try {
        const result = await ContentService.getContentDetail(contentId)
        
        if (result.success) {
          this.selectedContent = result.data
          return result.data
        } else {
          throw new Error(result.message || '콘텐츠 상세 조회에 실패했습니다.')
        }
      } catch (error) {
        console.error('❌ 콘텐츠 상세 조회 실패:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 콘텐츠 삭제
     */
    async deleteContent(contentId) {
      this.loading = true
      
      try {
        const result = await ContentService.deleteContent(contentId)
        
        if (result.success) {
          // 목록에서 제거
          this.contentList = this.contentList.filter(content => content.id !== contentId)
          this.totalCount = this.contentList.length
          return true
        } else {
          throw new Error(result.message || '콘텐츠 삭제에 실패했습니다.')
        }
      } catch (error) {
        console.error('❌ 콘텐츠 삭제 실패:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 필터 설정
     */
    setFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters }
      this.pagination.page = 1 // 필터 변경 시 첫 페이지로
    },

    /**
     * 페이지네이션 설정
     */
    setPagination(newPagination) {
      this.pagination = { ...this.pagination, ...newPagination }
    },

    /**
     * 상태 초기화
     */
    reset() {
      this.contentList = []
      this.selectedContent = null
      this.totalCount = 0
      this.filters = {
        contentType: '',
        platform: '',
        period: '',
        sortBy: 'createdAt_desc'
      }
      this.pagination = {
        page: 1,
        itemsPerPage: 10
      }
    }
  }
})