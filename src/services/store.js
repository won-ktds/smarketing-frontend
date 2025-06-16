//* src/services/store.js - 기존 파일 수정 (API 설계서 기준)
import { storeApi, menuApi, salesApi, handleApiError, formatSuccessResponse } from './api.js'

/**
 * 매장 관련 API 서비스
 * API 설계서 기준으로 수정됨
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
        businessType: storeData.businessType,
        address: storeData.address,
        phoneNumber: storeData.phoneNumber,
        businessHours: storeData.businessHours || storeData.operatingHours,
        closedDays: storeData.closedDays,
        seatCount: storeData.seatCount,
        snsAccounts: storeData.snsAccounts || `인스타그램: ${storeData.instaAccount || ''}, 네이버블로그: ${storeData.naverBlogAccount || ''}`,
        description: storeData.description || ''
      })

      return formatSuccessResponse(response.data.data, '매장이 등록되었습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 매장 정보 조회 (STR-005: 매장 조회)
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
      const response = await storeApi.put('/', {
        storeName: storeData.storeName,
        businessType: storeData.businessType,
        address: storeData.address,
        phoneNumber: storeData.phoneNumber,
        businessHours: storeData.businessHours || storeData.operatingHours,
        closedDays: storeData.closedDays,
        seatCount: storeData.seatCount,
        snsAccounts: storeData.snsAccounts || `인스타그램: ${storeData.instaAccount || ''}, 네이버블로그: ${storeData.naverBlogAccount || ''}`,
        description: storeData.description || ''
      })

      return formatSuccessResponse(response.data.data, '매장 정보가 수정되었습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 매출 정보 조회 (SAL-005: 매출 조회)
   * @param {number} storeId - 매장 ID
   * @returns {Promise<Object>} 매출 정보
   */
  async getSales(storeId) {
    try {
      const response = await salesApi.get(`/${storeId}`)

      return formatSuccessResponse(response.data.data, '매출 정보를 조회했습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 메뉴 등록 (MNU-010: 메뉴 등록)
   * @param {Object} menuData - 메뉴 정보
   * @returns {Promise<Object>} 메뉴 등록 결과
   */
  async registerMenu(menuData) {
    try {
      const response = await menuApi.post('/register', {
        menuName: menuData.menuName,
        menuCategory: menuData.menuCategory || menuData.category,
        menuImage: menuData.menuImage || menuData.image,
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
   * 메뉴 목록 조회 (MNU-005: 메뉴 조회)
   * @param {number} storeId - 매장 ID
   * @returns {Promise<Object>} 메뉴 목록
   */
  async getMenus(storeId) {
    try {
      const response = await menuApi.get(`/${storeId}`)

      return formatSuccessResponse(response.data.data, '메뉴 목록을 조회했습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 메뉴 수정 (MNU-015: 메뉴 수정)
   * @param {number} menuId - 메뉴 ID
   * @param {Object} menuData - 수정할 메뉴 정보
   * @returns {Promise<Object>} 메뉴 수정 결과
   */
  async updateMenu(menuId, menuData) {
    try {
      const response = await menuApi.put(`/${menuId}`, {
        menuName: menuData.menuName,
        menuCategory: menuData.menuCategory || menuData.category,
        menuImage: menuData.menuImage || menuData.image,
        price: menuData.price,
        description: menuData.description,
        isPopular: menuData.isPopular || false,
        isRecommended: menuData.isRecommended || false,
      })

      return formatSuccessResponse(response.data.data, '메뉴가 수정되었습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 메뉴 삭제 (MNU-020: 메뉴 삭제)
   * @param {number} menuId - 메뉴 ID
   * @returns {Promise<Object>} 메뉴 삭제 결과
   */
  async deleteMenu(menuId) {
    try {
      await menuApi.delete(`/${menuId}`)

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
}

export const storeService = new StoreService()
export default storeService