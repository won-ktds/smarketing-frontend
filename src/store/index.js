//* src/store/index.js - Store 스토어 (완전한 버전)
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
    hasMenus: (state) => state.menus && state.menus.length > 0,

    storeInfoSummary: (state) => {
      if (!state.storeInfo) {
        return {
          hasStore: false,
          message: '매장 정보를 등록해주세요',
          action: '등록하기'
        }
      }
      
      return {
        hasStore: true,
        storeName: state.storeInfo.storeName,
        businessType: state.storeInfo.businessType,
        message: `${state.storeInfo.storeName} 운영 중`,
        action: '관리하기'
      }
    }
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
      console.log('📝 매장 정보 없음 - 신규 사용자')
      this.storeInfo = null
      
      // 매장이 없는 것은 정상 상황이므로 success: false이지만 에러가 아님
      return { 
        success: false, 
        message: '등록된 매장이 없습니다',
        isNewUser: true // 신규 사용자 플래그 추가
      }
    }
  } catch (error) {
    console.log('=== Store 스토어: 매장 정보 조회 중 오류 ===')
    console.log('Error:', error.message)
    
    this.error = null // 에러 상태를 설정하지 않음
    this.storeInfo = null
    
    // HTTP 상태 코드별 처리 - 모두 신규 사용자로 간주
    if (error.response?.status === 404) {
      return { 
        success: false, 
        message: '등록된 매장이 없습니다',
        isNewUser: true
      }
    }
    
    if (error.response?.status >= 500) {
      // 서버 에러도 신규 사용자로 간주 (매장이 없어서 발생할 수 있음)
      console.log('서버 에러 발생, 신규 사용자로 간주')
      return { 
        success: false, 
        message: '등록된 매장이 없습니다',
        isNewUser: true
      }
    }
    
    if (error.response?.status === 401) {
      return { 
        success: false, 
        message: '로그인이 필요합니다',
        needLogin: true
      }
    }
    
    // 기타 모든 에러도 신규 사용자로 간주
    return { 
      success: false, 
      message: '등록된 매장이 없습니다',
      isNewUser: true
    }
  } finally {
    this.loading = false
  }
},
async getLoginRedirectPath() {
      try {
        const result = await this.fetchStoreInfo()
        
        if (result.success && result.data) {
          return {
            path: '/dashboard',
            message: `${result.data.storeName}에 오신 것을 환영합니다!`,
            type: 'success'
          }
        } else {
          return {
            path: '/store',
            message: '매장 정보를 등록하고 AI 마케팅을 시작해보세요!',
            type: 'info'
          }
        }
      } catch (error) {
        return {
          path: '/store',
          message: '매장 정보를 확인할 수 없습니다. 매장 정보를 등록해주세요',
          type: 'warning'
        }
      }
    },

    // src/store/index.js에서 fetchMenus 부분만 수정

/**
 * 메뉴 목록 조회 - 실제 API 연동 (매장 ID 필요) - ✅ 이미지 필드 매핑 수정
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
      // ✅ 백엔드 MenuResponse의 필드명에 맞게 매핑 수정
      const menusWithId = (result.data || []).map(menu => {
        // ID 필드가 확실히 있도록 보장
        const menuId = menu.menuId || menu.id
        
        if (!menuId) {
          console.warn('⚠️ 메뉴 ID가 없는 항목 발견:', menu)
        }
        
        console.log('메뉴 원본 데이터:', menu) // 디버깅용
        
        return {
          ...menu,
          id: menuId, // ✅ id 필드 확실히 설정
          menuId: menuId, // ✅ menuId 필드도 설정
          // 기타 필드들 보장
          menuName: menu.menuName || menu.name || '이름 없음',
          category: menu.category || '기타',
          price: menu.price || 0,
          description: menu.description || '',
          available: menu.available !== undefined ? menu.available : true,
          recommended: menu.recommended !== undefined ? menu.recommended : false,
          // ✅ 이미지 필드 수정: 백엔드는 'image' 필드 사용
          imageUrl: menu.image || menu.imageUrl || '/images/menu-placeholder.png',
          image: menu.image || menu.imageUrl, // 백엔드 호환성
          createdAt: menu.createdAt,
          updatedAt: menu.updatedAt
        }
      })
      
      // 메뉴 목록이 있는 경우
      console.log('✅ 메뉴 목록 설정 (이미지 필드 매핑 완료):', menusWithId)
      this.menus = menusWithId
      return { success: true, data: menusWithId }
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