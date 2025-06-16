//* src/services/sales.js - 스마트 데이터 탐지 버전
import { salesApi, handleApiError, formatSuccessResponse } from './api.js'

/**
 * 매출 관련 API 서비스 - 스마트 데이터 탐지 버전
 */
class SalesService {
  /**
   * 현재 사용자의 매출 정보 조회 (JWT 기반)
   */
  async getMySales() {
    try {
      const response = await salesApi.get('/my')
      return formatSuccessResponse(response.data.data, '내 매출 정보를 조회했습니다.')
    } catch (error) {
      return handleApiError(error)
    }
  }

  /**
   * 매장 매출 정보 조회
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
   * 실제 데이터가 있는 Store 자동 탐지 🔍
   */
  async findStoreWithData(maxStoreId = 50) {
    console.log(`🔍 [DETECTOR] 실제 데이터 탐지 시작 (1~${maxStoreId}번까지)`)
    
    const foundStores = []
    const errors = []
    
    // 1~maxStoreId까지 모든 Store ID 시도
    for (let storeId = 1; storeId <= maxStoreId; storeId++) {
      try {
        console.log(`📡 [SCAN] Store ${storeId} 스캔 중... (${storeId}/${maxStoreId})`)
        
        const result = await this.getSales(storeId)
        
        if (result.success && result.data) {
          // 데이터 품질 검사
          const dataQuality = this.checkDataQuality(result.data)
          
          if (dataQuality.hasRealData) {
            console.log(`✅ [FOUND] Store ${storeId}에서 실제 데이터 발견!`, {
              todaySales: result.data.todaySales,
              monthSales: result.data.monthSales,
              yearSalesCount: result.data.yearSales?.length || 0,
              quality: dataQuality
            })
            
            foundStores.push({
              storeId,
              data: result.data,
              quality: dataQuality,
              foundAt: new Date().toLocaleTimeString()
            })
            
            // 첫 번째 실제 데이터를 찾으면 즉시 반환 (옵션)
            // return foundStores[0]
          } else {
            console.log(`⚠️ [EMPTY] Store ${storeId}에 빈 데이터:`, dataQuality)
          }
        } else {
          console.debug(`❌ [FAIL] Store ${storeId}: ${result.message}`)
        }
        
      } catch (error) {
        // 개별 Store 에러는 기록만 하고 계속 진행
        const errorInfo = {
          storeId,
          error: error.message,
          status: error.response?.status,
          type: this.classifyError(error)
        }
        
        errors.push(errorInfo)
        
        // 404는 정상(데이터 없음), 다른 에러는 로깅
        if (error.response?.status !== 404) {
          console.debug(`⚠️ [ERROR] Store ${storeId}: ${errorInfo.type} - ${error.message}`)
        }
      }
      
      // 서버 부하 방지를 위한 짧은 대기 (개발 중에는 제거 가능)
      if (storeId % 10 === 0) {
        console.log(`⏸️ [PAUSE] ${storeId}번까지 스캔 완료, 잠시 대기...`)
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    // 탐지 결과 요약
    console.log('📊 [SUMMARY] 데이터 탐지 완료:', {
      totalScanned: maxStoreId,
      foundStores: foundStores.length,
      errors: errors.length,
      errorTypes: this.summarizeErrors(errors)
    })
    
    if (foundStores.length > 0) {
      // 품질 점수가 높은 순으로 정렬
      foundStores.sort((a, b) => b.quality.score - a.quality.score)
      
      console.log('🏆 [BEST] 최고 품질 데이터:', {
        storeId: foundStores[0].storeId,
        score: foundStores[0].quality.score,
        reasons: foundStores[0].quality.reasons
      })
      
      return {
        success: true,
        bestStore: foundStores[0],
        allStores: foundStores,
        totalFound: foundStores.length
      }
    } else {
      console.warn('❌ [NOT_FOUND] 실제 데이터를 가진 Store를 찾지 못했습니다')
      return {
        success: false,
        bestStore: null,
        allStores: [],
        totalFound: 0,
        errors: errors
      }
    }
  }

  /**
   * 데이터 품질 검사 📋
   */
  checkDataQuality(data) {
    const quality = {
      hasRealData: false,
      score: 0,
      reasons: [],
      issues: []
    }
    
    // 1. 기본 데이터 존재 여부
    if (data.todaySales && Number(data.todaySales) > 0) {
      quality.score += 30
      quality.reasons.push('오늘 매출 데이터 존재')
    } else {
      quality.issues.push('오늘 매출 없음')
    }
    
    if (data.monthSales && Number(data.monthSales) > 0) {
      quality.score += 30
      quality.reasons.push('월간 매출 데이터 존재')
    } else {
      quality.issues.push('월간 매출 없음')
    }
    
    // 2. 연간 데이터 품질
    if (data.yearSales && Array.isArray(data.yearSales) && data.yearSales.length > 0) {
      quality.score += 25
      quality.reasons.push(`연간 매출 ${data.yearSales.length}건`)
      
      // 실제 금액이 있는 데이터 개수 확인
      const validSales = data.yearSales.filter(sale => 
        sale.salesAmount && Number(sale.salesAmount) > 0
      )
      
      if (validSales.length > 0) {
        quality.score += 15
        quality.reasons.push(`유효한 매출 ${validSales.length}건`)
      }
    } else {
      quality.issues.push('연간 매출 데이터 없음')
    }
    
    // 3. 전일 대비 데이터
    if (data.previousDayComparison !== undefined) {
      quality.score += 10
      quality.reasons.push('전일 대비 데이터 존재')
    }
    
    // 4. 품질 점수가 50점 이상이면 실제 데이터로 판정
    quality.hasRealData = quality.score >= 50
    
    // 5. 품질 등급 매기기
    if (quality.score >= 90) quality.grade = 'A'
    else if (quality.score >= 70) quality.grade = 'B'
    else if (quality.score >= 50) quality.grade = 'C'
    else quality.grade = 'D'
    
    return quality
  }

  /**
   * 에러 분류 🏷️
   */
  classifyError(error) {
    if (error.response) {
      switch (error.response.status) {
        case 404: return 'NOT_FOUND'
        case 401: return 'UNAUTHORIZED'
        case 403: return 'FORBIDDEN'
        case 500: return 'SERVER_ERROR'
        default: return `HTTP_${error.response.status}`
      }
    } else if (error.code === 'NETWORK_ERROR') {
      return 'NETWORK_ERROR'
    } else {
      return 'UNKNOWN_ERROR'
    }
  }

  /**
   * 에러 요약 📊
   */
  summarizeErrors(errors) {
    const summary = {}
    errors.forEach(error => {
      summary[error.type] = (summary[error.type] || 0) + 1
    })
    return summary
  }

  /**
   * 스마트 매출 조회 - 데이터 탐지 기반 🎯
   */
  async getSalesWithSmartDetection(storeId = null) {
    console.log('🎯 [SMART] 스마트 매출 조회 시작')
    
    // 1. 먼저 JWT 기반 조회 시도
    try {
      console.log('📡 [JWT] JWT 기반 매출 조회 시도')
      const result = await this.getMySales()
      if (result.success && result.data) {
        const quality = this.checkDataQuality(result.data)
        if (quality.hasRealData) {
          console.log('✅ [JWT] JWT 기반 매출 조회 성공 (실제 데이터)')
          return {
            ...result,
            method: 'JWT',
            quality
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ [JWT] JWT 기반 매출 조회 실패:', error.message)
    }
    
    // 2. 지정된 storeId가 있으면 먼저 시도
    if (storeId) {
      try {
        console.log(`📡 [SPECIFIED] Store ${storeId} 우선 시도`)
        const result = await this.getSales(storeId)
        if (result.success && result.data) {
          const quality = this.checkDataQuality(result.data)
          if (quality.hasRealData) {
            console.log(`✅ [SPECIFIED] Store ${storeId} 성공 (실제 데이터)`)
            return {
              ...result,
              method: 'SPECIFIED',
              foundStoreId: storeId,
              quality
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️ [SPECIFIED] Store ${storeId} 실패:`, error.message)
      }
    }
    
    // 3. 자동 탐지로 실제 데이터가 있는 Store 찾기
    console.log('🔍 [AUTO] 자동 데이터 탐지 시작')
    const detectionResult = await this.findStoreWithData(30) // 30개까지 스캔
    
    if (detectionResult.success && detectionResult.bestStore) {
      console.log('🎉 [AUTO] 자동 탐지 성공!')
      return {
        success: true,
        data: detectionResult.bestStore.data,
        method: 'AUTO_DETECTION',
        foundStoreId: detectionResult.bestStore.storeId,
        quality: detectionResult.bestStore.quality,
        totalFound: detectionResult.totalFound,
        message: `Store ${detectionResult.bestStore.storeId}에서 실제 데이터 발견`
      }
    } else {
      console.error('❌ [AUTO] 자동 탐지 실패 - 실제 데이터를 찾지 못했습니다')
      throw new Error('실제 매출 데이터를 찾을 수 없습니다')
    }
  }

  /**
   * 특정 Store ID 테스트
   */
  async testSpecificStore(storeId) {
    try {
      console.log(`🧪 [TEST] Store ${storeId} 테스트`)
      const result = await this.getSales(storeId)
      
      if (result.success && result.data) {
        const quality = this.checkDataQuality(result.data)
        console.log(`📊 [TEST] Store ${storeId} 결과:`, {
          hasData: quality.hasRealData,
          grade: quality.grade,
          score: quality.score,
          reasons: quality.reasons
        })
        return { ...result, quality }
      } else {
        console.warn(`⚠️ [TEST] Store ${storeId} 실패:`, result.message)
        return null
      }
    } catch (error) {
      console.error(`❌ [TEST] Store ${storeId} 에러:`, error)
      return null
    }
  }
}

export const salesService = new SalesService()
export default salesService