//* src/services/store.js - 백엔드 API 연동 수정
import { storeApi, handleApiError, formatSuccessResponse } from './api.js'

/**
 * 매장 관련 API 서비스
 * 백엔드 Store Controller와 연동 (포트 8082)
 */
class StoreService {
  /**
   * 매장 등록 (STR-015: 매장 등록)
   * @param {Object} storeData - 매장 정보
   * @returns {Promise<Object>} 매장 등록 결과
   */
  async registerStore(storeData) {
    try {
      console.log('매장 등록 API 호출 - 요청 데이터:', storeData)
      
      // 백엔드 StoreCreateRequest에 맞는 형태로 변환
      const requestData = {
        storeName: storeData.storeName,
        businessType: storeData.businessType,
        address: storeData.address,
        phoneNumber: storeData.phoneNumber,
        businessHours: storeData.businessHours || `${storeData.openTime}-${storeData.closeTime}`,
        closedDays: Array.isArray(storeData.holidays) ? storeData.holidays.join(',') : storeData.closedDays,
        seatCount: parseInt(storeData.seatCount) || 0,
        snsAccounts: {
          instagram: storeData.instagramUrl || '',
          blog: storeData.blogUrl || ''
        },
        description: storeData.description || ''
      }
      
      console.log('백엔드 전송 데이터:', requestData)
      
      const response = await storeApi.post('/register', requestData)
      
      console.log('매장 등록 API 응답:', response.data)
      
      // 백엔드 응답 구조에 맞게 처리
      if (response.data.status === 200 || response.data.message?.includes('성공')) {
        return formatSuccessResponse(response.data.data, response.data.message || '매장이 등록되었습니다.')
      } else {
        throw new Error(response.data.message || '매장 등록에 실패했습니다.')
      }
    } catch (error) {
      console.error('매장 등록 실패:', error)
      return handleApiError(error)
    }
  }

  /**
   * 매장 정보 조회 (STR-005: 매장 정보 관리)
   * @returns {Promise<Object>} 매장 정보
   */
  async getStore() {
    try {
      console.log('매장 정보 조회 API 호출')
      
      const response = await storeApi.get('/')
      
      console.log('매장 정보 조회 API 응답:', response.data)
      
      // 백엔드 응답 구조에 맞게 처리
      if (response.data.status === 200 && response.data.data) {
        return formatSuccessResponse(response.data.data, '매장 정보를 조회했습니다.')
      } else if (response.data.data === null) {
        // 매장이 없는 경우
        return {
          success: false,
          message: '등록된 매장이 없습니다',
          data: null
        }
      } else {
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
      console.log('매장 정보 수정 API 호출 - 요청 데이터:', storeData)
      
      // 백엔드 StoreUpdateRequest에 맞는 형태로 변환
      const requestData = {
        storeName: storeData.storeName,
        businessType: storeData.businessType,
        address: storeData.address,
        phoneNumber: storeData.phoneNumber,
        businessHours: storeData.businessHours || `${storeData.openTime}-${storeData.closeTime}`,
        closedDays: Array.isArray(storeData.holidays) ? storeData.holidays.join(',') : storeData.closedDays,
        seatCount: parseInt(storeData.seatCount) || 0,
        snsAccounts: {
          instagram: storeData.instagramUrl || '',
          blog: storeData.blogUrl || ''
        },
        description: storeData.description || ''
      }
      
      console.log('백엔드 전송 데이터:', requestData)
      
      // PUT 요청 (storeId는 JWT에서 추출하므로 URL에 포함하지 않음)
      const response = await storeApi.put('/', requestData)
      
      console.log('매장 정보 수정 API 응답:', response.data)
      
      if (response.data.status === 200 || response.data.message?.includes('성공')) {
        return formatSuccessResponse(response.data.data, response.data.message || '매장 정보가 수정되었습니다.')
      } else {
        throw new Error(response.data.message || '매장 정보 수정에 실패했습니다.')
      }
    } catch (error) {
      console.error('매장 정보 수정 실패:', error)
      return handleApiError(error)
    }
  }

  /**
   * 매출 정보 조회 (STR-020: 대시보드)
   * @param {string} period - 조회 기간 (today, week, month, year)
   * @returns {Promise<Object>} 매출 정보
   */
  async getSales(period = 'today') {
    try {
      // 현재는 목업 데이터 반환 (추후 실제 API 연동 시 수정)
      const mockSalesData = {
        todaySales: 150000,
        yesterdaySales: 120000,
        changeRate: 25.0,
        monthlyTarget: 3000000,
        achievementRate: 45.2
      }
      
      return formatSuccessResponse(mockSalesData, '매출 정보를 조회했습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 메뉴 등록 (STR-030: 메뉴 등록)
   * @param {Object} menuData - 메뉴 정보
   * @returns {Promise<Object>} 메뉴 등록 결과
   */
  async registerMenu(menuData) {
    try {
      // 현재는 목업 처리 (추후 실제 API 연동 시 수정)
      console.log('메뉴 등록 - 목업 처리:', menuData)
      
      const mockMenuResponse = {
        id: Date.now(),
        ...menuData,
        createdAt: new Date().toISOString()
      }
      
      return formatSuccessResponse(mockMenuResponse, '메뉴가 등록되었습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 메뉴 목록 조회 (STR-025: 메뉴 조회)
   * @returns {Promise<Object>} 메뉴 목록
   */
  async getMenus() {
    try {
      // 현재는 목업 데이터 반환 (추후 실제 API 연동 시 수정)
      const mockMenus = [
        {
          id: 1,
          name: '김치찌개',
          category: '찌개',
          price: 8000,
          description: '푸짐한 김치찌개',
          imageUrl: '/images/menu-placeholder.png',
          isPopular: true
        },
        {
          id: 2,
          name: '제육볶음',
          category: '볶음',
          price: 12000,
          description: '매콤한 제육볶음',
          imageUrl: '/images/menu-placeholder.png',
          isRecommended: true
        }
      ]
      
      return formatSuccessResponse(mockMenus, '메뉴 목록을 조회했습니다.')
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
      // 현재는 목업 처리 (추후 실제 API 연동 시 수정)
      console.log('메뉴 수정 - 목업 처리:', { menuId, menuData })
      
      const mockMenuResponse = {
        id: menuId,
        ...menuData,
        updatedAt: new Date().toISOString()
      }
      
      return formatSuccessResponse(mockMenuResponse, '메뉴가 수정되었습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 메뉴 삭제 (STR-040: 메뉴 삭제)
   * @param {number} menuId - 삭제할 메뉴 ID
   * @returns {Promise<Object>} 메뉴 삭제 결과
   */
  async deleteMenu(menuId) {
    try {
      // 현재는 목업 처리 (추후 실제 API 연동 시 수정)
      console.log('메뉴 삭제 - 목업 처리:', menuId)
      
      return formatSuccessResponse(null, '메뉴가 삭제되었습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }
}

export const storeService = new StoreService()
export default storeService