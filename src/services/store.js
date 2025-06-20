//* src/services/store.js - 매장 서비스 완전 수정
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
      console.log('=== 매장 등록 API 호출 ===')
      console.log('요청 데이터:', storeData)
      
      // 백엔드 StoreCreateRequest에 맞는 형태로 변환
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
    
    const response = await storeApi.get('')
    
    console.log('매장 정보 조회 API 응답:', response.data)
    
    // 성공 응답 처리
    if (response.data && response.data.status === 200 && response.data.data) {
      console.log('✅ 매장 정보 조회 성공:', response.data.data)
      return {
        success: true,
        message: response.data.message || '매장 정보를 조회했습니다.',
        data: response.data.data
      }
    } else if (response.data && response.data.status === 404) {
      // 매장이 없는 경우
      console.log('📝 등록된 매장이 없음 (정상)')
      return {
        success: false,
        message: '등록된 매장이 없습니다',
        data: null
      }
    } else {
      console.log('예상치 못한 응답 구조:', response.data)
      return {
        success: false,
        message: '등록된 매장이 없습니다',
        data: null
      }
    }
  } catch (error) {
    console.log('매장 정보 조회 중 오류:', error.message)
    
    // 404 오류 - 매장이 없음 (정상)
    if (error.response?.status === 404) {
      console.log('📝 404: 등록된 매장이 없음 (정상)')
      return {
        success: false,
        message: '등록된 매장이 없습니다',
        data: null
      }
    }
    
    // 500 오류 - 서버 에러지만 매장이 없어서 발생할 수 있음
    if (error.response?.status === 500) {
      console.log('📝 500: 서버 에러 - 매장 없음으로 간주')
      return {
        success: false,
        message: '등록된 매장이 없습니다',
        data: null
      }
    }
    
    // 401 오류 - 인증 문제
    if (error.response?.status === 401) {
      return {
        success: false,
        message: '로그인이 필요합니다',
        data: null
      }
    }
    
    // 기타 모든 에러도 매장 없음으로 간주
    console.log('📝 기타 에러 - 매장 없음으로 간주')
    return {
      success: false,
      message: '등록된 매장이 없습니다',
      data: null
    }
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
      console.log('=== 매장 정보 수정 API 호출 ===')
      console.log('요청 데이터:', storeData)
      
      // 백엔드 StoreUpdateRequest에 맞는 형태로 변환
      const requestData = {
        storeName: storeData.storeName,
        businessType: storeData.businessType,
        address: storeData.address,
        phoneNumber: storeData.phoneNumber,
        businessHours: storeData.businessHours,  // 그대로 전달
        closedDays: storeData.closedDays,        // 그대로 전달
        seatCount: parseInt(storeData.seatCount) || 0,
        instaAccounts: storeData.instaAccounts || '',
        blogAccounts: storeData.blogAccounts || '',
        description: storeData.description || ''
      }
      
      console.log('백엔드 전송 데이터:', requestData)
      
      // ✅ 핵심 수정: 슬래시 제거하고 빈 문자열 사용
      console.log('API 호출 경로: PUT /api/store (baseURL + 빈 문자열)')
      const response = await storeApi.put('', requestData)
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
      console.error('매출 정보 조회 실패:', error)
      return handleApiError(error)
    }
  }

  /**
   * 메뉴 목록 조회 (개발 예정)
   * @returns {Promise<Object>} 메뉴 목록
   */
  async getMenus() {
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
        }
      ]
      
      return formatSuccessResponse(mockMenus, '메뉴 목록을 조회했습니다.')
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