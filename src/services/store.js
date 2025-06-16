//* src/services/store.js - 매출 API 수정버전
import { storeApi, salesApi, handleApiError, formatSuccessResponse } from './api.js'

/**
 * 매장 관련 API 서비스
 * 유저스토리: STR-005, STR-010, STR-015, STR-020, STR-025, STR-030, STR-035, STR-040
 */
class StoreService {
  /**
   * 매장 등록 (STR-015: 매장 등록)
   * @param {Object} storeData - 매장 정보
   * @returns {Promise<Object>} 매장 등록 결과
   */
  async registerStore(storeData) {
    try {
      const response = await storeApi.post('/register', {
        storeName: storeData.storeName,
        storeImage: storeData.storeImage,
        businessType: storeData.businessType,
        address: storeData.address,
        phoneNumber: storeData.phoneNumber,
        businessNumber: storeData.businessNumber,
        instaAccounts: storeData.instaAccounts,
        blogAccounts: storeData.blogAccounts,
        businessHours: storeData.businessHours,
        closedDays: storeData.closedDays,
        seatCount: storeData.seatCount,
        description: storeData.description,
      })

      return formatSuccessResponse(response.data.data, '매장이 등록되었습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 매장 정보 조회 (STR-005: 매장 정보 관리)
   * @returns {Promise<Object>} 매장 정보
   */
  async getStore() {
    try {
      const response = await storeApi.get('/')

      return formatSuccessResponse(response.data.data, '매장 정보를 조회했습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 매장 정보 수정 (STR-010: 매장 수정)
   * @param {Object} storeData - 수정할 매장 정보
   * @returns {Promise<Object>} 매장 수정 결과
   */
  async updateStore(storeData) {
    try {
      const response = await storeApi.put('/', storeData)

      return formatSuccessResponse(response.data.data, '매장 정보가 수정되었습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 매출 정보 조회 (STR-020: 대시보드)
   * ⚠️ 수정: salesApi 사용하고 storeId 매개변수 추가
   * @param {number} storeId - 매장 ID
   * @returns {Promise<Object>} 매출 정보
   */
  async getSales(storeId) {
    try {
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
    } catch (error) {
      console.error('매출 정보 조회 실패:', error)
      return handleApiError(error)
    }
  }

  /**
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
   * @returns {Promise<Object>} 메뉴 목록
   */
  async getMenus(storeId) {
    try {
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
    } catch (error) {
      return handleApiError(error)
    }
  }
}

export const storeService = new StoreService()
export default storeService