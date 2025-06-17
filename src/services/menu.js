// src/services/menu.js - 메뉴 관련 API 서비스
import { menuApi, handleApiError, formatSuccessResponse } from './api.js'

/**
 * 메뉴 관련 API 서비스
 * 백엔드 Menu Controller와 연동 (포트 8082)
 */
class MenuService {
  /**
   * 메뉴 목록 조회
   * @param {number} storeId - 매장 ID
   * @returns {Promise<Object>} 메뉴 목록
   */
  async getMenus(storeId) {
    try {
      console.log('=== 메뉴 목록 조회 API 호출 ===')
      console.log('매장 ID:', storeId)
      
      if (!storeId) {
        throw new Error('매장 ID가 필요합니다')
      }
      
      // GET /api/menu?storeId={storeId}
      const response = await menuApi.get('', {
        params: { storeId }
      })
      
      console.log('메뉴 목록 조회 API 응답:', response.data)
      
      if (response.data && response.data.status === 200) {
        return formatSuccessResponse(response.data.data, '메뉴 목록을 조회했습니다.')
      } else {
        throw new Error(response.data.message || '메뉴 목록을 찾을 수 없습니다.')
      }
    } catch (error) {
      console.error('메뉴 목록 조회 실패:', error)
      
      // 404 오류 또는 네트워크 오류 시 빈 배열 반환 (개발 중)
      if (error.response?.status === 404 || 
          error.code === 'ECONNREFUSED' || 
          error.message.includes('Network Error')) {
        console.warn('백엔드 미구현 또는 네트워크 오류 - 빈 메뉴 목록 반환')
        return formatSuccessResponse([], '메뉴 목록이 비어있습니다.')
      }
      
      return handleApiError(error)
    }
  }

  /**
   * 메뉴 상세 조회
   * @param {number} menuId - 메뉴 ID
   * @returns {Promise<Object>} 메뉴 상세 정보
   */
  async getMenuDetail(menuId) {
    try {
      console.log('=== 메뉴 상세 조회 API 호출 ===')
      console.log('메뉴 ID:', menuId)
      
      if (!menuId || menuId === 'undefined') {
        throw new Error('올바른 메뉴 ID가 필요합니다')
      }
      
      const numericMenuId = parseInt(menuId)
      if (isNaN(numericMenuId)) {
        throw new Error('메뉴 ID는 숫자여야 합니다')
      }
      
      // GET /api/menu/{menuId}
      const response = await menuApi.get(`/${numericMenuId}`)
      
      console.log('메뉴 상세 조회 API 응답:', response.data)
      
      if (response.data && response.data.status === 200) {
        return formatSuccessResponse(response.data.data, '메뉴 상세 정보를 조회했습니다.')
      } else {
        throw new Error(response.data.message || '메뉴를 찾을 수 없습니다.')
      }
    } catch (error) {
      console.error('메뉴 상세 조회 실패:', error)
      return handleApiError(error)
    }
  }

  /**
   * 메뉴 등록
   * @param {Object} menuData - 메뉴 정보
   * @returns {Promise<Object>} 등록 결과
   */
  async createMenu(menuData) {
    try {
      console.log('=== 메뉴 등록 API 호출 ===')
      console.log('요청 데이터:', menuData)
      
      const requestData = {
        storeId: menuData.storeId,
        menuName: menuData.menuName,
        category: menuData.category,
        price: parseInt(menuData.price) || 0,
        description: menuData.description || ''
      }
      
      console.log('백엔드 전송 데이터:', requestData)
      
      // POST /api/menu/register
      const response = await menuApi.post('/register', requestData)
      
      console.log('메뉴 등록 API 응답:', response.data)
      
      if (response.data && response.data.status === 200) {
        return formatSuccessResponse(response.data.data, '메뉴가 성공적으로 등록되었습니다.')
      } else {
        throw new Error(response.data.message || '메뉴 등록에 실패했습니다.')
      }
    } catch (error) {
      console.error('메뉴 등록 실패:', error)
      return handleApiError(error)
    }
  }

  /**
   * 메뉴 수정
   * @param {number} menuId - 메뉴 ID
   * @param {Object} menuData - 수정할 메뉴 정보
   * @returns {Promise<Object>} 수정 결과
   */
  async updateMenu(menuId, menuData) {
    try {
      console.log('=== 메뉴 수정 API 호출 ===')
      console.log('메뉴 ID:', menuId)
      console.log('수정 데이터:', menuData)
      
      if (!menuId || menuId === 'undefined') {
        throw new Error('올바른 메뉴 ID가 필요합니다')
      }
      
      const numericMenuId = parseInt(menuId)
      if (isNaN(numericMenuId)) {
        throw new Error('메뉴 ID는 숫자여야 합니다')
      }
      
      const requestData = {
        menuName: menuData.menuName,
        category: menuData.category,
        price: parseInt(menuData.price) || 0,
        description: menuData.description || ''
      }
      
      console.log('백엔드 전송 데이터:', requestData)
      
      // PUT /api/menu/{menuId}
      const response = await menuApi.put(`/${numericMenuId}`, requestData)
      
      console.log('메뉴 수정 API 응답:', response.data)
      
      if (response.data && response.data.status === 200) {
        return formatSuccessResponse(response.data.data, '메뉴가 성공적으로 수정되었습니다.')
      } else {
        throw new Error(response.data.message || '메뉴 수정에 실패했습니다.')
      }
    } catch (error) {
      console.error('메뉴 수정 실패:', error)
      return handleApiError(error)
    }
  }

  /**
   * 메뉴 삭제
   * @param {number} menuId - 메뉴 ID
   * @returns {Promise<Object>} 삭제 결과
   */
  async deleteMenu(menuId) {
    try {
      console.log('=== 메뉴 삭제 API 호출 ===')
      console.log('메뉴 ID:', menuId)
      
      if (!menuId || menuId === 'undefined') {
        throw new Error('올바른 메뉴 ID가 필요합니다')
      }
      
      const numericMenuId = parseInt(menuId)
      if (isNaN(numericMenuId)) {
        throw new Error('메뉴 ID는 숫자여야 합니다')
      }
      
      // DELETE /api/menu/{menuId}
      const response = await menuApi.delete(`/${numericMenuId}`)
      
      console.log('메뉴 삭제 API 응답:', response.data)
      
      if (response.data && response.data.status === 200) {
        return formatSuccessResponse(response.data.data, '메뉴가 성공적으로 삭제되었습니다.')
      } else {
        throw new Error(response.data.message || '메뉴 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('메뉴 삭제 실패:', error)
      return handleApiError(error)
    }
  }
}

// 싱글톤 인스턴스 생성 및 export
export const menuService = new MenuService()
export default menuService

// 디버깅을 위한 전역 노출 (개발 환경에서만)
if (process.env.NODE_ENV === 'development') {
  window.menuService = menuService
}