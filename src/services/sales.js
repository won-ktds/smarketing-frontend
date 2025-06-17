//* src/services/sales.js - 백엔드 API 직접 연동 버전
import { salesApi, handleApiError, formatSuccessResponse } from './api.js'

/**
 * 매출 관련 API 서비스 - 백엔드 직접 연동
 */
class SalesService {
  constructor() {
    this.fallbackData = this.createFallbackData()
    this.cachedStoreId = null
  }

  /**
   * 매장 매출 정보 조회 - 백엔드 /api/sales/{storeId} 직접 호출
   * @param {number} storeId - 매장 ID
   * @returns {Promise<Object>} 매출 정보
   */
  async getSales(storeId) {
    try {
      console.log(`🔗 [SALES_API] 백엔드 매출 API 직접 호출: /api/sales/${storeId}`)
      
      const response = await salesApi.get(`/${storeId}`)
      
      console.log('📊 [SALES_API] 응답 데이터:', response.data)
      
      // 백엔드 ApiResponse 구조: { status, message, data }
      if (response.data && response.data.status === 200 && response.data.data) {
        const salesData = response.data.data
        
        // BigDecimal을 숫자로 변환
        const processedData = {
          todaySales: Number(salesData.todaySales) || 0,
          monthSales: Number(salesData.monthSales) || 0,
          previousDayComparison: Number(salesData.previousDayComparison) || 0,
          previousDayChangeRate: Number(salesData.previousDayChangeRate) || 0,
          goalAchievementRate: Number(salesData.goalAchievementRate) || 0,
          yearSales: salesData.yearSales || []
        }
        
        console.log('✅ [SALES_API] 매출 데이터 변환 완료:', {
          todaySales: processedData.todaySales,
          monthSales: processedData.monthSales,
          yearSalesCount: processedData.yearSales.length
        })
        
        return formatSuccessResponse(processedData, '매출 정보를 조회했습니다.')
      } else {
        throw new Error('응답 데이터 형식 오류')
      }
    } catch (error) {
      console.error(`❌ [SALES_API] 매장 ${storeId} 매출 조회 실패:`, error.message)
      return handleApiError(error)
    }
  }

  /**
   * 스마트 매출 조회 - 여러 매장 ID 시도 후 성공하는 것 사용
   * @param {boolean} useCache - 캐시 사용 여부
   * @returns {Promise<Object>} 매출 정보
   */
  async getSalesWithSmartDetection(useCache = true) {
    console.log('🎯 [SMART_SALES] 스마트 매출 조회 시작')
    
    // 1. 캐시된 매장 ID 시도
    if (useCache && this.cachedStoreId) {
      try {
        console.log(`📡 [CACHE] 캐시된 매장 ${this.cachedStoreId} 시도`)
        const result = await this.getSales(this.cachedStoreId)
        if (result.success) {
          console.log('✅ [CACHE] 캐시된 매장 성공')
          return {
            ...result,
            method: 'CACHE',
            foundStoreId: this.cachedStoreId
          }
        }
      } catch (error) {
        console.warn('⚠️ [CACHE] 캐시된 매장 실패:', error.message)
        this.cachedStoreId = null
      }
    }
    
    // 2. 1~10번 매장 순차 시도 (빠른 탐지)
    console.log('🔍 [AUTO] 자동 매장 탐지 시작 (1~10번)')
    for (let storeId = 1; storeId <= 10; storeId++) {
      try {
        console.log(`📡 [AUTO] 매장 ${storeId} 시도`)
        const result = await this.getSales(storeId)
        
        if (result.success && result.data) {
          // 실제 데이터가 있는지 확인
          const hasRealData = this.checkDataQuality(result.data).hasRealData
          
          if (hasRealData) {
            console.log(`🎉 [AUTO] 매장 ${storeId}에서 실제 데이터 발견!`)
            this.cachedStoreId = storeId
            
            return {
              ...result,
              method: 'AUTO_DETECTION',
              foundStoreId: storeId,
              message: `매장 ${storeId}의 실제 매출 데이터`
            }
          }
        }
        
        // 매장 간 짧은 대기
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.log(`❌ [AUTO] 매장 ${storeId} 실패: ${error.message}`)
      }
    }
    
    // 3. 실제 데이터를 찾지 못하면 폴백 데이터 사용
    console.log('🔄 [FALLBACK] 실제 데이터 미발견, 폴백 데이터 사용')
    return {
      success: true,
      data: this.fallbackData,
      method: 'FALLBACK',
      message: '데모 데이터를 사용합니다'
    }
  }

  /**
   * 데이터 품질 검사
   * @param {Object} data - 매출 데이터
   * @returns {Object} 품질 정보
   */
  checkDataQuality(data) {
    const quality = {
      hasRealData: false,
      score: 0,
      reasons: []
    }
    
    // 1. 오늘 매출 체크
    if (data.todaySales && Number(data.todaySales) > 0) {
      quality.score += 30
      quality.reasons.push(`오늘 매출: ${Number(data.todaySales).toLocaleString()}원`)
    }
    
    // 2. 월간 매출 체크
    if (data.monthSales && Number(data.monthSales) > 0) {
      quality.score += 25
      quality.reasons.push(`월간 매출: ${Number(data.monthSales).toLocaleString()}원`)
    }
    
    // 3. 연간 데이터 체크
    if (data.yearSales && Array.isArray(data.yearSales) && data.yearSales.length > 0) {
      quality.score += 20
      quality.reasons.push(`연간 데이터 ${data.yearSales.length}건`)
      
      // 실제 금액이 있는 데이터 확인
      const validSales = data.yearSales.filter(sale => 
        sale.salesAmount && Number(sale.salesAmount) > 0
      )
      
      if (validSales.length > 5) {
        quality.score += 25
        quality.reasons.push(`유효 매출 ${validSales.length}건`)
      }
    }
    
    quality.hasRealData = quality.score >= 60
    
    return quality
  }

  /**
   * 폴백 데이터 생성
   */
  createFallbackData() {
    const today = new Date()
    const yearSales = []
    
    // 최근 30일 데이터 생성
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      const isWeekend = date.getDay() === 0 || date.getDay() === 6
      const baseAmount = isWeekend ? 450000 : 280000
      const randomFactor = 0.7 + Math.random() * 0.6
      const salesAmount = Math.floor(baseAmount * randomFactor)
      
      yearSales.push({
        salesDate: date.toISOString().split('T')[0],
        salesAmount: salesAmount
      })
    }

    const todaySales = yearSales[yearSales.length - 1].salesAmount
    const yesterdaySales = yearSales[yearSales.length - 2].salesAmount
    const monthSales = yearSales.slice(-30).reduce((sum, sale) => sum + sale.salesAmount, 0)
    const previousDayComparison = todaySales - yesterdaySales

    return {
      todaySales,
      monthSales,
      yearSales,
      previousDayComparison,
      goalAchievementRate: 85.2,
      isDemo: true
    }
  }

  /**
   * 빠른 매출 조회 (타임아웃 포함)
   */
  async getQuickSales() {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('타임아웃')), 5000)
      )
      
      const dataPromise = this.getSalesWithSmartDetection(true)
      
      const result = await Promise.race([dataPromise, timeoutPromise])
      
      return result
    } catch (error) {
      console.warn('⚠️ [QUICK] 빠른 조회 실패, 폴백 데이터 사용:', error.message)
      return {
        success: true,
        data: this.fallbackData,
        method: 'QUICK_FALLBACK',
        message: '네트워크 지연으로 데모 데이터를 사용합니다'
      }
    }
  }

  /**
   * 캐시 초기화
   */
  clearCache() {
    this.cachedStoreId = null
    console.log('🧹 [CACHE] 매출 서비스 캐시 초기화')
  }

  /**
   * 최적 매장 ID 반환
   */
  getBestStoreId() {
    return this.cachedStoreId || null
  }

  /**
   * 특정 매장 테스트 (디버깅용)
   */
  async testSpecificStore(storeId) {
    try {
      console.log(`🧪 [TEST] 매장 ${storeId} 테스트`)
      const result = await this.getSales(storeId)
      
      if (result.success && result.data) {
        const quality = this.checkDataQuality(result.data)
        console.log(`📊 [TEST] 매장 ${storeId} 결과:`, {
          hasData: quality.hasRealData,
          score: quality.score,
          reasons: quality.reasons
        })
        return { ...result, quality }
      } else {
        console.warn(`⚠️ [TEST] 매장 ${storeId} 실패:`, result.message)
        return null
      }
    } catch (error) {
      console.error(`❌ [TEST] 매장 ${storeId} 에러:`, error)
      return null
    }
  }
}

export const salesService = new SalesService()
export default salesService