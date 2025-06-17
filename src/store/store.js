//* src/services/store.js
import { api } from './api'
import { formatSuccessResponse, formatErrorResponse, handleApiError } from '@/utils/api-helpers'

/**
 * 매장 관련 API 서비스
 * 매장 정보 조회, 수정, 매출 정보 등을 처리합니다.
 */
class StoreService {
  constructor() {
    this.baseURL = '/api/store'
    this.salesURL = '/api/sales'
  }

  /**
   * 매장 정보 조회 (STR-001: 매장 정보 조회)
   * @returns {Promise<Object>} 매장 정보
   */
  async getStore() {
    try {
      const response = await api.get(`${this.baseURL}/info`)
      
      if (response.data.success) {
        return {
          success: true,
          message: '매장 정보를 조회했습니다.',
          data: response.data.data
        }
      } else {
        throw new Error(response.data.message || '매장 정보 조회에 실패했습니다.')
      }
    } catch (error) {
      console.error('매장 정보 조회 실패:', error)
      return handleApiError(error)
    }
  }

  /**
   * 매장 정보 수정 (STR-002: 매장 정보 수정)
   * @param {Object} storeData - 수정할 매장 정보
   * @returns {Promise<Object>} 수정된 매장 정보
   */
  async updateStore(storeData) {
    try {
      const response = await api.put(`${this.baseURL}/info`, storeData)
      
      if (response.data.success) {
        return {
          success: true,
          message: '매장 정보를 수정했습니다.',
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
   * @param {number} storeId - 매장 ID (기본값: 1)
   * @returns {Promise<Object>} 매출 정보
   */
  async getSales(storeId = 1) {
    try {
      console.log('매출 조회 API 호출:', `${this.salesURL}/${storeId}`)
      
      const response = await api.get(`${this.salesURL}/${storeId}`)
      
      if (response.data.success) {
        const salesData = response.data.data
        
        // API 응답 데이터 로그
        console.log('매출 API 응답:', salesData)
        
        // yearSales 데이터가 있는지 확인하고 변곡점 계산
        let processedData = {
          todaySales: salesData.todaySales || 0,
          monthSales: salesData.monthSales || 0, 
          previousDayComparison: salesData.previousDayComparison || 0,
          yearSales: salesData.yearSales || []
        }
        
        // 변곡점 분석 추가
        if (salesData.yearSales && salesData.yearSales.length > 0) {
          processedData.trendAnalysis = this.analyzeSalesTrend(salesData.yearSales)
          processedData.chartData = this.prepareChartData(salesData.yearSales)
        }
        
        return formatSuccessResponse(processedData, '매출 정보를 조회했습니다.')
      } else {
        throw new Error(response.data.message || '매출 정보 조회에 실패했습니다.')
      }
    } catch (error) {
      console.error('매출 정보 조회 실패:', error)
      
      // API 오류 시 기본 데이터 반환 (개발 단계)
      const fallbackData = {
        todaySales: 170000,
        monthSales: 4500000,
        previousDayComparison: 15000,
        yearSales: [],
        trendAnalysis: {
          inflectionPoints: [],
          overallTrend: 'stable',
          growthRate: 0
        },
        chartData: {
          labels: [],
          salesData: [],
          targetData: []
        }
      }
      
      return formatSuccessResponse(fallbackData, '임시 매출 데이터를 표시합니다.')
    }
  }

  /**
   * 매출 트렌드 분석 및 변곡점 계산
   * @param {Array} yearSales - 연간 매출 데이터 (Sales 엔티티 배열)
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

    // 날짜순 정렬 (salesDate 기준)
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
      
      // 변곡점 조건: 이전 주 → 현재 주 → 다음 주의 트렌드 변화
      const trend1 = currentWeekAvg - prevWeekAvg
      const trend2 = nextWeekAvg - currentWeekAvg
      
      // 트렌드 방향이 바뀌고 변화량이 일정 이상인 경우
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

    // 전체적인 트렌드 계산
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

    // 최근 90일 데이터만 사용 (차트 표시용)
    const sortedData = [...yearSales]
      .sort((a, b) => new Date(a.salesDate) - new Date(b.salesDate))
      .slice(-90)

    const labels = sortedData.map(item => {
      const date = new Date(item.salesDate)
      return `${date.getMonth() + 1}/${date.getDate()}`
    })

    const salesData = sortedData.map(item => parseFloat(item.salesAmount) || 0)
    
    // 목표 매출 라인 (평균의 110%)
    const averageSales = salesData.reduce((a, b) => a + b, 0) / salesData.length
    const targetData = salesData.map(() => averageSales * 1.1)

    return {
      labels,
      salesData,
      targetData
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