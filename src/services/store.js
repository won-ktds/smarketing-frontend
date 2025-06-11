//* src/services/store.js
import { storeApi, handleApiError, formatSuccessResponse } from './api.js'

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
        instaAccount: storeData.instaAccount,
        naverBlogAccount: storeData.naverBlogAccount,
        operatingHours: storeData.operatingHours,
        closedDays: storeData.closedDays,
        seatCount: storeData.seatCount,
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
   * @param {number} storeId - 매장 ID
   * @param {Object} storeData - 수정할 매장 정보
   * @returns {Promise<Object>} 매장 수정 결과
   */
  async updateStore(storeId, storeData) {
    try {
      const response = await storeApi.put(`/${storeId}`, storeData)

      return formatSuccessResponse(response.data.data, '매장 정보가 수정되었습니다.')
    } catch (error) {
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
      const response = await storeApi.get(`/sales?period=${period}`)

      return formatSuccessResponse(response.data.data, '매출 정보를 조회했습니다.')
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
      const response = await storeApi.post('/menu/register', {
        menuName: menuData.menuName,
        menuCategory: menuData.menuCategory,
        menuImage: menuData.menuImage,
        price: menuData.price,
        description: menuData.description,
        isPopular: menuData.isPopular || false,
        isRecommended: menuData.isRecommended || false,
      })

      return formatSuccessResponse(response.data.data, '메뉴가 등록되었습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 메뉴 목록 조회 (STR-025: 메뉴 조회)
   * @param {Object} filters - 필터링 옵션
   * @returns {Promise<Object>} 메뉴 목록
   */
  async getMenus(filters = {}) {
    try {
      const queryParams = new URLSearchParams()

      if (filters.category) queryParams.append('category', filters.category)
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy)
      if (filters.isPopular !== undefined) queryParams.append('isPopular', filters.isPopular)

      const response = await storeApi.get(`/menu?${queryParams.toString()}`)

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
   * 다중 메뉴 삭제
   * @param {number[]} menuIds - 삭제할 메뉴 ID 배열
   * @returns {Promise<Object>} 삭제 결과
   */
  async deleteMenus(menuIds) {
    try {
      const deletePromises = menuIds.map((menuId) => this.deleteMenu(menuId))
      await Promise.all(deletePromises)

      return formatSuccessResponse(null, `${menuIds.length}개의 메뉴가 삭제되었습니다.`)
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
