//* src/store/poster.js - 이미지 처리 강화 및 디버깅 추가
import { defineStore } from 'pinia'
import { contentService } from '@/services/content'
import { useAuthStore } from '@/store/auth'

export const usePosterStore = defineStore('poster', {
  state: () => ({
    posters: [],
    currentPoster: null,
    loading: false,
    error: null
  }),

  getters: {
    getPosterById: (state) => (id) => {
      return state.posters.find(poster => poster.id === id)
    },

    recentPosters: (state) => {
      return state.posters
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)
    }
  },

  actions: {
    /**
     * 포스터 생성 - 이미지 처리 강화
     */
    async generatePoster(posterData) {
      this.loading = true
      this.error = null

      try {
        console.log('🎯 [POSTER_STORE] 포스터 생성 요청 받음:', posterData)
        console.log('📁 [POSTER_STORE] 이미지 상태 확인:', {
          hasImages: !!posterData.images,
          isArray: Array.isArray(posterData.images),
          imageCount: posterData.images?.length || 0,
          imageDetails: posterData.images?.map((img, idx) => ({
            index: idx,
            type: typeof img,
            length: img?.length,
            isBase64: typeof img === 'string' && img.startsWith('data:image/'),
            preview: typeof img === 'string' ? img.substring(0, 30) + '...' : 'not string'
          })) || []
        })

        // ✅ 이미지 전처리 및 검증
        let processedImages = []
        if (posterData.images && Array.isArray(posterData.images) && posterData.images.length > 0) {
          console.log('📁 [POSTER_STORE] 이미지 전처리 시작...')
          
          processedImages = posterData.images
            .filter((img, index) => {
              const isValid = img && 
                             typeof img === 'string' && 
                             img.length > 100 &&
                             (img.startsWith('data:image/') || img.startsWith('http'))
              
              console.log(`📁 [POSTER_STORE] 이미지 ${index + 1} 검증:`, {
                isValid,
                type: typeof img,
                length: img?.length,
                format: img?.substring(0, 20) || 'unknown'
              })
              
              return isValid
            })
          
          console.log('📁 [POSTER_STORE] 전처리 결과:', {
            원본: posterData.images.length,
            유효: processedImages.length,
            제거됨: posterData.images.length - processedImages.length
          })
          
          if (processedImages.length === 0) {
            throw new Error('유효한 이미지가 없습니다. 이미지를 다시 업로드해 주세요.')
          }
        } else {
          console.warn('⚠️ [POSTER_STORE] 이미지가 없습니다!')
          throw new Error('포스터 생성을 위해 최소 1개의 이미지가 필요합니다.')
        }

        // ✅ API 요청에 맞는 형태로 데이터 변환 - 검증된 이미지 사용
        const requestData = {
          storeId: posterData.storeId,
          title: posterData.title,
          targetAudience: posterData.targetAudience,
          promotionStartDate: posterData.promotionStartDate,
          promotionEndDate: posterData.promotionEndDate,
          images: processedImages, // 검증된 이미지만 사용
          targetAge: posterData.targetAge
        }

        // 선택적 필드들
        if (posterData.eventName) requestData.eventName = posterData.eventName
        if (posterData.imageStyle) requestData.imageStyle = posterData.imageStyle
        if (posterData.promotionType) requestData.promotionType = posterData.promotionType
        if (posterData.emotionIntensity) requestData.emotionIntensity = posterData.emotionIntensity
        if (posterData.category) requestData.category = posterData.category
        if (posterData.requirement) requestData.requirement = posterData.requirement
        if (posterData.toneAndManner) requestData.toneAndManner = posterData.toneAndManner
        if (posterData.startDate) requestData.startDate = posterData.startDate
        if (posterData.endDate) requestData.endDate = posterData.endDate
        if (posterData.photoStyle) requestData.photoStyle = posterData.photoStyle

        console.log('📤 [POSTER_STORE] 최종 요청 데이터:', {
          ...requestData,
          images: `${requestData.images.length}개 이미지 (${Math.round(JSON.stringify(requestData.images).length / 1024)}KB)`
        })

        // ✅ 마지막 검증
        if (!requestData.title) {
          throw new Error('제목은 필수입니다.')
        }
        if (!requestData.targetAudience) {
          throw new Error('홍보 대상은 필수입니다.')
        }
        if (!requestData.images || requestData.images.length === 0) {
          throw new Error('이미지는 필수입니다.')
        }

        console.log('🚀 [POSTER_STORE] contentService.generatePoster 호출...')
        const result = await contentService.generatePoster(requestData)
        
        if (result.success) {
          console.log('✅ [POSTER_STORE] 포스터 생성 성공:', result.data)
          this.currentPoster = result.data
          return result
        } else {
          console.error('❌ [POSTER_STORE] 포스터 생성 실패:', result.message)
          this.error = result.message
          return result
        }

      } catch (error) {
        console.error('❌ [POSTER_STORE] 포스터 생성 예외:', error)
        
        // 상세한 오류 정보 로깅
        if (error.response) {
          console.error('❌ [POSTER_STORE] HTTP 오류:', {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data
          })
        }
        
        this.error = error.message || '포스터 생성 중 오류가 발생했습니다.'
        return {
          success: false,
          message: this.error
        }
      } finally {
        this.loading = false
      }
    },

    /**
     * 포스터 저장
     */
    async savePoster(saveData) {
      this.loading = true
      this.error = null

      try {
        console.log('💾 [POSTER_STORE] 포스터 저장 요청:', saveData)
        
        const result = await contentService.savePoster(saveData)
        
        if (result.success) {
          console.log('✅ [POSTER_STORE] 포스터 저장 성공')
          // 저장된 포스터를 목록에 추가
          if (result.data) {
            this.posters.unshift(result.data)
          }
          return result
        } else {
          console.error('❌ [POSTER_STORE] 포스터 저장 실패:', result.message)
          this.error = result.message
          return result
        }

      } catch (error) {
        console.error('❌ [POSTER_STORE] 포스터 저장 예외:', error)
        this.error = error.message || '포스터 저장 중 오류가 발생했습니다.'
        return {
          success: false,
          message: this.error
        }
      } finally {
        this.loading = false
      }
    },

    /**
     * 포스터 목록 조회
     */
    async fetchPosters() {
      this.loading = true
      this.error = null

      try {
        const result = await contentService.getContents({
          contentType: 'poster',
          sortBy: 'latest'
        })
        
        if (result.success) {
          this.posters = result.data || []
          return result
        } else {
          this.error = result.message
          return result
        }

      } catch (error) {
        console.error('❌ [POSTER_STORE] 포스터 목록 조회 예외:', error)
        this.error = error.message || '포스터 목록 조회 중 오류가 발생했습니다.'
        return {
          success: false,
          message: this.error
        }
      } finally {
        this.loading = false
      }
    },

    /**
     * 포스터 삭제
     */
    async deletePoster(posterId) {
      this.loading = true
      this.error = null

      try {
        const result = await contentService.deleteContent(posterId)
        
        if (result.success) {
          // 목록에서 삭제
          this.posters = this.posters.filter(poster => poster.id !== posterId)
          
          // 현재 포스터가 삭제된 포스터라면 초기화
          if (this.currentPoster?.id === posterId) {
            this.currentPoster = null
          }
          
          return result
        } else {
          this.error = result.message
          return result
        }

      } catch (error) {
        console.error('❌ [POSTER_STORE] 포스터 삭제 예외:', error)
        this.error = error.message || '포스터 삭제 중 오류가 발생했습니다.'
        return {
          success: false,
          message: this.error
        }
      } finally {
        this.loading = false
      }
    },

    /**
     * 에러 상태 초기화
     */
    clearError() {
      this.error = null
    },

    /**
     * 현재 포스터 설정
     */
    setCurrentPoster(poster) {
      this.currentPoster = poster
    }
  }
})