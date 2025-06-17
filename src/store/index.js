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
     * 메뉴 목록 조회 - 실제 API 연동 (매장 ID 필요)
     */
    async fetchMenus() {
      console.log('=== Store 스토어: 메뉴 목록 조회 시작 ===')
      
      try {
        // 매장 정보에서 storeId 가져오기
        const storeId = this.storeInfo?.storeId
        if (!storeId) {
          console.warn('매장 ID가 없습니다. 매장 정보를 먼저 조회해주세요.')
          return { success: false, message: '매장 정보가 필요합니다', data: [] }
        }
        
        // 메뉴 서비스 임포트
        const { menuService } = await import('@/services/menu')
        
        console.log('메뉴 목록 API 호출, 매장 ID:', storeId)
        const result = await menuService.getMenus(storeId)
        
        console.log('=== Store 스토어: 메뉴 API 응답 분석 ===')
        console.log('Result:', result)
        console.log('Result.success:', result.success)
        console.log('Result.data:', result.data)
        console.log('Result.message:', result.message)
        
        if (result.success && result.data) {
          // 메뉴 목록이 있는 경우
          console.log('✅ 메뉴 목록 설정:', result.data)
          this.menus = result.data
          return { success: true, data: result.data }
        } else {
          // 메뉴가 없거나 조회 실패한 경우
          console.log('⚠️ 메뉴 목록 없음 또는 조회 실패')
          this.menus = []
          
          if (result.message === '등록된 메뉴가 없습니다') {
            return { success: false, message: '등록된 메뉴가 없습니다', data: [] }
          } else {
            return { success: false, message: result.message || '메뉴 목록 조회에 실패했습니다', data: [] }
          }
        }
      } catch (error) {
        console.error('=== Store 스토어: 메뉴 목록 조회 실패 ===')
        console.error('Error:', error)
        
        this.menus = []
        return { success: false, message: error.message || '메뉴 목록을 불러오는데 실패했습니다', data: [] }
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