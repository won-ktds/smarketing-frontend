//* src/store/index.js - Store 스토어 수정 (fetchMenus 메서드 추가)
import { defineStore } from 'pinia'

export const useStoreStore = defineStore('store', {
  state: () => ({
    storeInfo: null,
    menus: [], // 메뉴 목록 추가
    loading: false,
    error: null
  }),
  
  getters: {
    hasStoreInfo: (state) => !!state.storeInfo,
    isLoading: (state) => state.loading,
    hasMenus: (state) => state.menus && state.menus.length > 0
  },
  
  actions: {
    /**
     * 매장 정보 조회
     */
    async fetchStoreInfo() {
      console.log('=== Store 스토어: 매장 정보 조회 시작 ===')
      this.loading = true
      this.error = null
      
      try {
        // 스토어 서비스 임포트
        const { storeService } = await import('@/services/store')
        
        console.log('매장 정보 API 호출')
        const result = await storeService.getStore()
        
        console.log('=== Store 스토어: API 응답 분석 ===')
        console.log('Result:', result)
        console.log('Result.success:', result.success)
        console.log('Result.data:', result.data)
        console.log('Result.message:', result.message)
        
        if (result.success && result.data) {
          // 매장 정보가 있는 경우
          console.log('✅ 매장 정보 설정:', result.data)
          this.storeInfo = result.data
          return { success: true, data: result.data }
        } else {
          // 매장이 없거나 조회 실패한 경우
          console.log('⚠️ 매장 정보 없음 또는 조회 실패')
          this.storeInfo = null
          
          if (result.message === '등록된 매장이 없습니다') {
            return { success: false, message: '등록된 매장이 없습니다' }
          } else {
            return { success: false, message: result.message || '매장 정보 조회에 실패했습니다' }
          }
        }
      } catch (error) {
        console.error('=== Store 스토어: 매장 정보 조회 실패 ===')
        console.error('Error:', error)
        
        this.error = error.message
        this.storeInfo = null
        
        // HTTP 상태 코드별 처리
        if (error.response?.status === 404) {
          return { success: false, message: '등록된 매장이 없습니다' }
        }
        
        if (error.response?.status >= 500) {
          return { success: false, message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }
        }
        
        if (error.response?.status === 401) {
          return { success: false, message: '로그인이 필요합니다' }
        }
        
        return { success: false, message: error.message || '매장 정보 조회에 실패했습니다' }
      } finally {
        this.loading = false
      }
    },

    /**
     * 메뉴 목록 조회 - 추가된 메서드
     */
    async fetchMenus() {
      console.log('=== Store 스토어: 메뉴 목록 조회 시작 ===')
      
      try {
        // 현재는 목업 데이터 반환 (추후 실제 API 연동 시 수정)
        const mockMenus = [
          {
            id: 1,
            name: '아메리카노',
            price: 4000,
            category: '커피',
            description: '진한 풍미의 아메리카노',
            imageUrl: '/images/americano.jpg',
            isAvailable: true
          },
          {
            id: 2,
            name: '카페라떼',
            price: 4500,
            category: '커피',
            description: '부드러운 우유가 들어간 라떼',
            imageUrl: '/images/latte.jpg',
            isAvailable: true
          },
          {
            id: 3,
            name: '치즈케이크',
            price: 6000,
            category: '디저트',
            description: '진한 크림치즈로 만든 케이크',
            imageUrl: '/images/cheesecake.jpg',
            isAvailable: false
          }
        ]
        
        this.menus = mockMenus
        console.log('✅ 메뉴 목록 설정 완료:', mockMenus)
        
        return { success: true, data: mockMenus }
      } catch (error) {
        console.error('메뉴 목록 조회 실패:', error)
        this.menus = []
        return { success: false, message: '메뉴 목록을 불러오는데 실패했습니다' }
      }
    },

    /**
     * 매장 등록
     */
    async registerStore(storeData) {
      console.log('매장 등록 시작:', storeData)
      this.loading = true
      this.error = null
      
      try {
        const { storeService } = await import('@/services/store')
        
        const result = await storeService.registerStore(storeData)
        
        console.log('매장 등록 결과:', result)
        
        if (result.success) {
          // 등록 성공 후 매장 정보 다시 조회
          await this.fetchStoreInfo()
          return result
        } else {
          this.error = result.message
          return result
        }
      } catch (error) {
        console.error('매장 등록 실패:', error)
        this.error = error.message
        return { success: false, message: error.message || '매장 등록에 실패했습니다' }
      } finally {
        this.loading = false
      }
    },

    /**
     * 매장 정보 수정
     */
    async updateStore(storeId, storeData) {
      console.log('매장 정보 수정 시작:', { storeId, storeData })
      this.loading = true
      this.error = null
      
      try {
        const { storeService } = await import('@/services/store')
        
        const result = await storeService.updateStore(storeId, storeData)
        
        console.log('매장 수정 결과:', result)
        
        if (result.success) {
          // 수정 성공 후 매장 정보 다시 조회
          await this.fetchStoreInfo()
          return result
        } else {
          this.error = result.message
          return result
        }
      } catch (error) {
        console.error('매장 수정 실패:', error)
        this.error = error.message
        return { success: false, message: error.message || '매장 수정에 실패했습니다' }
      } finally {
        this.loading = false
      }
    },

    /**
     * 매장 정보 초기화
     */
    clearStoreInfo() {
      this.storeInfo = null
      this.menus = []
      this.error = null
      this.loading = false
    }
  }
})