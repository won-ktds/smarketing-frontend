//* src/services/store.js - 병합 충돌 해결된 매장 서비스
import { storeApi, menuApi, handleApiError, formatSuccessResponse } from './api.js'

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
      console.log('=== 매출 정보 조회 API 호출 ===')
      console.log('조회 기간:', period)
      
      // 현재는 목업 데이터 반환 (추후 실제 API 연동 시 수정)
      const mockSalesData = {
        todaySales: 150000,
        yesterdaySales: 120000,
        changeRate: 25.0,
        monthlyTarget: 3000000,
        achievementRate: 45.2,
        yearSales: this.generateMockYearSales()
      }
      
      // 매출 트렌드 분석 추가
      if (mockSalesData.yearSales && mockSalesData.yearSales.length > 0) {
        mockSalesData.trendAnalysis = this.analyzeSalesTrend(mockSalesData.yearSales)
        mockSalesData.chartData = this.prepareChartData(mockSalesData.yearSales)
      }
      
      return formatSuccessResponse(mockSalesData, '매출 정보를 조회했습니다.')
    } catch (error) {
      console.error('매출 정보 조회 실패:', error)
      return handleApiError(error)
    }
  }

  /**
   * 메뉴 목록 조회 (최종 통합 버전 - 모든 충돌 해결)
   * @param {number} storeId - 매장 ID (옵션, 없으면 목업 데이터 반환)
   * @returns {Promise<Object>} 메뉴 목록
   */
  async getMenus(storeId) {
    try {
      console.log('=== 메뉴 목록 조회 API 호출 ===')
      console.log('매장 ID:', storeId)
      
      // storeId가 없으면 목업 데이터 반환 (개발 중)
      if (!storeId) {
        console.warn('매장 ID가 없어서 목업 데이터 반환')
        const mockMenus = [
          {
            menuId: 1, // id 대신 menuId 사용
            id: 1, // 호환성을 위해
            name: '아메리카노',
            menuName: '아메리카노', // 백엔드 형식
            price: 4000,
            category: '커피',
            description: '진한 풍미의 아메리카노',
            imageUrl: '/images/americano.jpg',
            isAvailable: true,
            available: true // 백엔드 형식
          },
          {
            menuId: 2,
            id: 2,
            name: '카페라떼',
            menuName: '카페라떼',
            price: 4500,
            category: '커피',
            description: '부드러운 우유가 들어간 라떼',
            imageUrl: '/images/latte.jpg',
            isAvailable: true,
            available: true
          }
        ]
        return formatSuccessResponse(mockMenus, '목업 메뉴 목록을 조회했습니다.')
      }
      
      // 실제 백엔드 API 호출 시도
      try {
        // GET /api/menu?storeId={storeId}
        const response = await menuApi.get('', {
          params: { storeId }
        })
        
        console.log('메뉴 목록 조회 API 응답:', response.data)
        
        if (response.data && response.data.status === 200) {
          // 백엔드에서 받은 메뉴 데이터를 프론트엔드 형식으로 변환
          const menus = response.data.data.map(menu => ({
            menuId: menu.menuId,
            id: menu.menuId, // 호환성을 위해
            storeId: menu.storeId,
            menuName: menu.menuName,
            name: menu.menuName, // 호환성을 위해
            category: menu.category,
            price: menu.price,
            description: menu.description,
            available: menu.available !== undefined ? menu.available : true,
            isAvailable: menu.available !== undefined ? menu.available : true, // 호환성
            imageUrl: menu.imageUrl || '/images/menu-placeholder.png',
            createdAt: menu.createdAt,
            updatedAt: menu.updatedAt
          }))
          
          return formatSuccessResponse(menus, '메뉴 목록을 조회했습니다.')
        } else {
          throw new Error(response.data.message || '메뉴 목록을 찾을 수 없습니다.')
        }
      } catch (apiError) {
        console.error('백엔드 API 호출 실패:', apiError)
        
        // 백엔드 미구현이나 네트워크 오류 시 목업 데이터 반환
        if (apiError.response?.status === 404 || 
            apiError.code === 'ECONNREFUSED' || 
            apiError.message.includes('Network Error')) {
          console.warn('백엔드 미구현 - 목업 데이터 반환')
          
          const mockMenus = [
            {
              menuId: 1,
              id: 1,
              storeId: storeId,
              name: '아메리카노',
              menuName: '아메리카노',
              price: 4000,
              category: '커피',
              description: '진한 풍미의 아메리카노',
              imageUrl: '/images/americano.jpg',
              isAvailable: true,
              available: true
            },
            {
              menuId: 2,
              id: 2,
              storeId: storeId,
              name: '카페라떼',
              menuName: '카페라떼',
              price: 4500,
              category: '커피',
              description: '부드러운 우유가 들어간 라떼',
              imageUrl: '/images/latte.jpg',
              isAvailable: true,
              available: true
            }
          ]
          
          return formatSuccessResponse(mockMenus, '목업 메뉴 목록을 조회했습니다. (백엔드 미구현)')
        }
        
        throw apiError
      }
    } catch (error) {
      console.error('메뉴 목록 조회 실패:', error)
      return handleApiError(error)
    }
  }

  /**
   * 메뉴 목록 조회 별칭 (fetchMenus)
   * @param {number} storeId - 매장 ID
   * @returns {Promise<Object>} 메뉴 목록
   */
  async fetchMenus(storeId) {
    return await this.getMenus(storeId)
  }

  /**
   * 목업 메뉴 데이터 생성
   * @param {number} storeId - 매장 ID (옵션)
   * @returns {Array} 목업 메뉴 배열
   */
  getMockMenus(storeId = null) {
    return [
      {
        menuId: 1,
        id: 1,
        storeId: storeId,
        name: '아메리카노',
        menuName: '아메리카노',
        price: 4000,
        category: '커피',
        description: '진한 풍미의 아메리카노',
        imageUrl: '/images/americano.jpg',
        isAvailable: true,
        available: true
      },
      {
        menuId: 2,
        id: 2,
        storeId: storeId,
        name: '카페라떼',
        menuName: '카페라떼',
        price: 4500,
        category: '커피',
        description: '부드러운 우유가 들어간 라떼',
        imageUrl: '/images/latte.jpg',
        isAvailable: true,
        available: true
      },
      {
        menuId: 3,
        id: 3,
        storeId: storeId,
        name: '에스프레소',
        menuName: '에스프레소',
        price: 3500,
        category: '커피',
        description: '진한 에스프레소 한 잔',
        imageUrl: '/images/espresso.jpg',
        isAvailable: true,
        available: true
      }
    ]
  }

  /**
   * 목업 연간 매출 데이터 생성
   * @returns {Array} 목업 매출 데이터
   */
  generateMockYearSales() {
    const salesData = []
    const today = new Date()
    
    // 최근 90일 데이터 생성
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      // 랜덤하지만 현실적인 매출 패턴 생성
      const baseAmount = 120000 + Math.random() * 80000 // 120,000 ~ 200,000
      const weekendBonus = date.getDay() === 0 || date.getDay() === 6 ? 1.3 : 1.0
      const monthlyTrend = 1 + (Math.sin(i / 30) * 0.2) // 월별 트렌드
      
      salesData.push({
        salesDate: date.toISOString().split('T')[0],
        salesAmount: Math.round(baseAmount * weekendBonus * monthlyTrend)
      })
    }
    
    return salesData
  }

  /**
   * 매출 트렌드 분석 및 변곡점 계산
   * @param {Array} yearSales - 연간 매출 데이터
   * @returns {Object} 트렌드 분석 결과
   */
  analyzeSalesTrend(yearSales) {
    if (!yearSales || yearSales.length < 7) {
      return {
        inflectionPoints: [],
        overallTrend: 'insufficient_data',
        growthRate: 0
      }
    }

    // 날짜순 정렬
    const sortedData = [...yearSales].sort((a, b) => 
      new Date(a.salesDate) - new Date(b.salesDate)
    )

    const inflectionPoints = []
    const dailyData = sortedData.map(item => ({
      date: item.salesDate,
      amount: parseFloat(item.salesAmount) || 0
    }))

    // 7일 이동평균으로 변곡점 탐지
    for (let i = 7; i < dailyData.length - 7; i++) {
      const prevWeekAvg = this.calculateMovingAverage(dailyData, i - 7, 7)
      const currentWeekAvg = this.calculateMovingAverage(dailyData, i, 7)
      const nextWeekAvg = this.calculateMovingAverage(dailyData, i + 7, 7)
      
      const trend1 = currentWeekAvg - prevWeekAvg
      const trend2 = nextWeekAvg - currentWeekAvg
      
      // 변곡점 조건: 트렌드 방향 변화 + 임계값 초과
      if (Math.sign(trend1) !== Math.sign(trend2) && 
          Math.abs(trend1) > 10000 && Math.abs(trend2) > 10000) {
        
        inflectionPoints.push({
          date: dailyData[i].date,
          amount: dailyData[i].amount,
          type: trend1 > 0 ? 'peak' : 'valley',
          significance: Math.abs(trend1) + Math.abs(trend2)
        })
      }
    }

    // 전체 트렌드 계산
    const firstWeekAvg = this.calculateMovingAverage(dailyData, 0, 7)
    const lastWeekAvg = this.calculateMovingAverage(dailyData, dailyData.length - 7, 7)
    const growthRate = ((lastWeekAvg - firstWeekAvg) / firstWeekAvg) * 100

    let overallTrend = 'stable'
    if (Math.abs(growthRate) > 5) {
      overallTrend = growthRate > 0 ? 'increasing' : 'decreasing'
    }

    console.log('변곡점 분석 결과:', { inflectionPoints, overallTrend, growthRate })

    return {
      inflectionPoints: inflectionPoints.slice(0, 5), // 상위 5개만
      overallTrend,
      growthRate: Math.round(growthRate * 10) / 10
    }
  }

  /**
   * 이동평균 계산
   * @param {Array} data - 데이터 배열
   * @param {number} startIndex - 시작 인덱스
   * @param {number} period - 기간
   * @returns {number} 이동평균값
   */
  calculateMovingAverage(data, startIndex, period) {
    const slice = data.slice(startIndex, startIndex + period)
    const sum = slice.reduce((acc, item) => acc + item.amount, 0)
    return sum / slice.length
  }

  /**
   * 차트용 데이터 준비
   * @param {Array} yearSales - 연간 매출 데이터
   * @returns {Object} 차트 데이터
   */
  prepareChartData(yearSales) {
    if (!yearSales || yearSales.length === 0) {
      return { labels: [], salesData: [], targetData: [] }
    }

    // 최근 30일 데이터만 사용 (차트 표시용)
    const sortedData = [...yearSales]
      .sort((a, b) => new Date(a.salesDate) - new Date(b.salesDate))
      .slice(-30)

    const labels = sortedData.map(item => {
      const date = new Date(item.salesDate)
      return `${date.getMonth() + 1}/${date.getDate()}`
    })

    const salesData = sortedData.map(item => parseFloat(item.salesAmount) || 0)
    
    // 목표 매출 라인 (평균의 110%)
    const averageSales = salesData.reduce((a, b) => a + b, 0) / salesData.length
    const targetData = salesData.map(() => Math.round(averageSales * 1.1))

    return {
      labels,
      salesData,
      targetData
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