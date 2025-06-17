<<<<<<< HEAD
//* src/services/store.js - 매출 API 수정버전
import { storeApi, salesApi, handleApiError, formatSuccessResponse } from './api.js'

/**
 * 매장 관련 API 서비스
 * 유저스토리: STR-005, STR-010, STR-015, STR-020, STR-025, STR-030, STR-035, STR-040
=======
//* src/services/store.js - 매장 서비스 완전 수정
import { storeApi, handleApiError, formatSuccessResponse } from './api.js'

/**
 * 매장 관련 API 서비스
 * 백엔드 Store Controller와 연동 (포트 8082)
>>>>>>> 87871709f2bbcdab5df004a3954d6ba0af3cadce
 */
class StoreService {
  /**
   * 매장 등록 (STR-015: 매장 등록)
   * @param {Object} storeData - 매장 정보
   * @returns {Promise<Object>} 매장 등록 결과
   */
  async registerStore(storeData) {
    try {
      console.log('=== 매장 등록 API 호출 ===')
      console.log('요청 데이터:', storeData)
      
      // 백엔드 StoreCreateRequest에 맞는 형태로 변환
      const requestData = {
        storeName: storeData.storeName,
        storeImage: storeData.storeImage,
        businessType: storeData.businessType,
        address: storeData.address,
        phoneNumber: storeData.phoneNumber,
<<<<<<< HEAD
        businessNumber: storeData.businessNumber,
        instaAccounts: storeData.instaAccounts,
        blogAccounts: storeData.blogAccounts,
        businessHours: storeData.businessHours,
        closedDays: storeData.closedDays,
        seatCount: storeData.seatCount,
        description: storeData.description,
      })

      return formatSuccessResponse(response.data.data, '매장이 등록되었습니다.')
=======
        businessHours: storeData.businessHours,
        closedDays: storeData.closedDays,
        seatCount: parseInt(storeData.seatCount) || 0,
        instaAccounts: storeData.instaAccounts || '',
        blogAccounts: storeData.blogAccounts || '',
        description: storeData.description || ''
      }
      
      console.log('=== 각 필드 상세 검증 ===')
      console.log('storeName:', requestData.storeName, '(타입:', typeof requestData.storeName, ')')
      console.log('businessType:', requestData.businessType, '(타입:', typeof requestData.businessType, ')')
      console.log('address:', requestData.address, '(타입:', typeof requestData.address, ')')
      console.log('seatCount:', requestData.seatCount, '(타입:', typeof requestData.seatCount, ')')
      
      console.log('백엔드 전송 데이터:', requestData)
      
      const response = await storeApi.post('/register', requestData)
      
      console.log('매장 등록 API 응답:', response.data)
      
      // 백엔드 응답 구조에 맞게 처리
      if (response.data && (response.data.status === 200 || response.data.success !== false)) {
        return {
          success: true,
          message: response.data.message || '매장이 등록되었습니다.',
          data: response.data.data
        }
      } else {
        throw new Error(response.data.message || '매장 등록에 실패했습니다.')
      }
>>>>>>> 87871709f2bbcdab5df004a3954d6ba0af3cadce
    } catch (error) {
      console.error('매장 등록 실패:', error)
      
      if (error.response) {
        console.error('응답 상태:', error.response.status)
        console.error('응답 데이터:', error.response.data)
      }
      
      return handleApiError(error)
    }
  }

  /**
   * 매장 정보 조회 (STR-005: 매장 정보 관리)
   * @returns {Promise<Object>} 매장 정보
   */
  async getStore() {
    try {
      console.log('=== 매장 정보 조회 API 호출 ===')
      
      // URL 슬래시 문제 해결: 빈 문자열로 호출하여 '/api/store'가 되도록 함
      const response = await storeApi.get('')
      
      console.log('매장 정보 조회 API 응답:', response.data)
      
      // 백엔드 응답 구조 수정: 디버깅 결과에 맞게 처리
      if (response.data && response.data.status === 200 && response.data.data) {
        console.log('✅ 매장 정보 조회 성공:', response.data.data)
        return {
          success: true,
          message: response.data.message || '매장 정보를 조회했습니다.',
          data: response.data.data
        }
      } else if (response.data && response.data.status === 404) {
        // 매장이 없는 경우
        console.log('⚠️ 등록된 매장이 없음')
        return {
          success: false,
          message: '등록된 매장이 없습니다',
          data: null
        }
      } else {
        console.warn('예상치 못한 응답 구조:', response.data)
        throw new Error(response.data.message || '매장 정보를 찾을 수 없습니다.')
      }
    } catch (error) {
      console.error('매장 정보 조회 실패:', error)
      
      // 404 오류 처리 (매장이 없음)
      if (error.response?.status === 404) {
        return {
          success: false,
          message: '등록된 매장이 없습니다',
          data: null
        }
      }
      
      // 500 오류 처리 (서버 내부 오류)
      if (error.response?.status === 500) {
        console.error('서버 내부 오류 - 백엔드 로그 확인 필요:', error.response?.data)
        return {
          success: false,
          message: '서버 오류가 발생했습니다. 관리자에게 문의하세요.',
          data: null
        }
      }
      
      return handleApiError(error)
    }
  }

  /**
   * 매장 정보 수정 (STR-010: 매장 수정)
   * @param {number} storeId - 매장 ID (현재는 사용하지 않음 - JWT에서 사용자 확인)
   * @param {Object} storeData - 수정할 매장 정보
   * @returns {Promise<Object>} 매장 수정 결과
   */
  async updateStore(storeId, storeData) {
    try {
<<<<<<< HEAD
      const response = await storeApi.put('/', storeData)

      return formatSuccessResponse(response.data.data, '매장 정보가 수정되었습니다.')
=======
      console.log('=== 매장 정보 수정 API 호출 ===')
      console.log('요청 데이터:', storeData)
      
      // 백엔드 StoreUpdateRequest에 맞는 형태로 변환
      const requestData = {
        storeName: storeData.storeName,
        businessType: storeData.businessType,
        address: storeData.address,
        phoneNumber: storeData.phoneNumber,
        businessHours: storeData.businessHours,
        closedDays: storeData.closedDays,
        seatCount: parseInt(storeData.seatCount) || 0,
        instaAccounts: storeData.instaAccounts || '',
        blogAccounts: storeData.blogAccounts || '',
        description: storeData.description || ''
      }
      
      console.log('백엔드 전송 데이터:', requestData)
      
      // PUT 요청 (storeId는 JWT에서 추출하므로 URL에 포함하지 않음)
      const response = await storeApi.put('/', requestData)
      
      console.log('매장 정보 수정 API 응답:', response.data)
      
      if (response.data && (response.data.status === 200 || response.data.success !== false)) {
        return {
          success: true,
          message: response.data.message || '매장 정보가 수정되었습니다.',
          data: response.data.data
        }
      } else {
        throw new Error(response.data.message || '매장 정보 수정에 실패했습니다.')
      }
>>>>>>> 87871709f2bbcdab5df004a3954d6ba0af3cadce
    } catch (error) {
      console.error('매장 정보 수정 실패:', error)
      return handleApiError(error)
    }
  }

  /**
   * 매출 정보 조회 (STR-020: 대시보드)
<<<<<<< HEAD
   * ⚠️ 수정: salesApi 사용하고 storeId 매개변수 추가
   * @param {number} storeId - 매장 ID
=======
   * @param {string} period - 조회 기간 (today, week, month, year)
>>>>>>> 87871709f2bbcdab5df004a3954d6ba0af3cadce
   * @returns {Promise<Object>} 매출 정보
   */
  async getSales(period = 'today') {
    try {
<<<<<<< HEAD
      // storeId가 없으면 먼저 매장 정보를 조회해서 storeId를 가져옴
      if (!storeId) {
        const storeResponse = await this.getStore()
        if (storeResponse.success && storeResponse.data.storeId) {
          storeId = storeResponse.data.storeId
        } else {
          throw new Error('매장 정보를 찾을 수 없습니다.')
        }
      }

      // Sales API 호출 (Store 서비스의 /api/sales/{storeId} 엔드포인트)
      const response = await salesApi.get(`/${storeId}`)

      return formatSuccessResponse(response.data.data, '매출 정보를 조회했습니다.')
=======
      // 현재는 목업 데이터 반환 (추후 실제 API 연동 시 수정)
      const mockSalesData = {
        todaySales: 150000,
        yesterdaySales: 120000,
        changeRate: 25.0,
        monthlyTarget: 3000000,
        achievementRate: 45.2
      }
      
      return formatSuccessResponse(mockSalesData, '매출 정보를 조회했습니다.')
>>>>>>> 87871709f2bbcdab5df004a3954d6ba0af3cadce
    } catch (error) {
      console.error('매출 정보 조회 실패:', error)
      return handleApiError(error)
    }
  }

  /**
<<<<<<< HEAD
   * 메뉴 등록 (STR-030: 메뉴 등록) 
   * ⚠️ 수정: 올바른 API 경로 사용
   * @param {Object} menuData - 메뉴 정보
   * @returns {Promise<Object>} 메뉴 등록 결과
   */
  async registerMenu(menuData) {
    try {
      // Store 서비스의 Menu API 사용
      const response = await storeApi.post('/menu/register', {
        storeId: menuData.storeId,
        menuName: menuData.menuName,
        category: menuData.category,
        price: menuData.price,
        description: menuData.description,
      })

      return formatSuccessResponse(response.data.data, '메뉴가 등록되었습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 메뉴 목록 조회 (STR-025: 메뉴 조회)
   * @param {number} storeId - 매장 ID
=======
   * 메뉴 목록 조회 (개발 예정)
>>>>>>> 87871709f2bbcdab5df004a3954d6ba0af3cadce
   * @returns {Promise<Object>} 메뉴 목록
   */
  async getMenus() {
    try {
<<<<<<< HEAD
      const response = await storeApi.get(`/menu?storeId=${storeId}`)

      return formatSuccessResponse(response.data.data, '메뉴 목록을 조회했습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 메뉴 수정 (STR-035: 메뉴 수정)
   * @param {number} menuId - 메뉴 ID
   * @param {Object} menuData - 수정할 메뉴 정보
   * @returns {Promise<Object>} 메뉴 수정 결과
   */
  async updateMenu(menuId, menuData) {
    try {
      const response = await storeApi.put(`/menu/${menuId}`, menuData)

      return formatSuccessResponse(response.data.data, '메뉴가 수정되었습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 메뉴 삭제 (STR-040: 메뉴 삭제)
   * @param {number} menuId - 메뉴 ID
   * @returns {Promise<Object>} 메뉴 삭제 결과
   */
  async deleteMenu(menuId) {
    try {
      await storeApi.delete(`/menu/${menuId}`)

      return formatSuccessResponse(null, '메뉴가 삭제되었습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 매장 통계 정보 조회
   * @returns {Promise<Object>} 매장 통계
   */
  async getStoreStatistics() {
    try {
      const response = await storeApi.get('/statistics')

      return formatSuccessResponse(response.data.data, '매장 통계를 조회했습니다.')
=======
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
        }
      ]
      
      return formatSuccessResponse(mockMenus, '메뉴 목록을 조회했습니다.')
>>>>>>> 87871709f2bbcdab5df004a3954d6ba0af3cadce
    } catch (error) {
      return handleApiError(error)
    }
  }
}

// 싱글톤 인스턴스 생성 및 export
export const storeService = new StoreService()
export default storeService

// 디버깅을 위한 전역 노출 (개발 환경에서만)
if (process.env.NODE_ENV === 'development') {
  window.storeService = storeService
}