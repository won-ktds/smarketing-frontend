//* src/services/api.js - 수정버전
import axios from 'axios'

// 런타임 환경 설정에서 API URL 가져오기
const getApiUrls = () => {
  const config = window.__runtime_config__ || {}
  return {
    // 환경변수에서 가져오도록 수정
    AUTH_URL: config.AUTH_URL || 'http://localhost:8081/api/auth',
    MEMBER_URL: config.MEMBER_URL || 'http://localhost:8081/api/member',
    STORE_URL: config.STORE_URL || 'http://localhost:8082/api/store',
    CONTENT_URL: config.CONTENT_URL || 'http://localhost:8083/api/content',
    RECOMMEND_URL: config.RECOMMEND_URL || 'http://localhost:8084/api/recommendation',
    
    // Store 서비스에 포함된 API들 - STORE_URL 기반으로 구성
    SALES_URL: (config.STORE_URL || 'http://localhost:8082') + '/api/sales',
    MENU_URL: (config.STORE_URL || 'http://localhost:8082') + '/api/menu',
    IMAGES_URL: (config.STORE_URL || 'http://localhost:8082') + '/api/images',
    
    // Gateway는 필요시에만 사용
    GATEWAY_URL: config.GATEWAY_URL || 'http://20.1.2.3',
  }
}

// Axios 인스턴스 생성
const createApiInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })

  // 요청 인터셉터 - JWT 토큰 자동 추가
  instance.interceptors.request.use(
    (config) => {
      // accessToken 또는 token 둘 다 확인
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      
      // 디버깅용 로그 (개발 모드에서만)
      if (import.meta.env.DEV) {
        console.log(`API 요청: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
        if (token) {
          console.log(`토큰 사용: ${token.substring(0, 20)}...`)
        }
      }
      
      return config
    },
    (error) => {
      return Promise.reject(error)
    },
  )

  // 응답 인터셉터 - 토큰 갱신 및 에러 처리
  instance.interceptors.response.use(
    (response) => {
      // 성공 응답 로깅 (개발 모드에서만)
      if (import.meta.env.DEV) {
        console.log(`API 응답: ${response.status} ${response.config.url}`)
      }
      return response
    },
    async (error) => {
      const originalRequest = error.config

      // 개발 모드에서 에러 로깅
      if (import.meta.env.DEV) {
        console.error(`API 에러: ${error.response?.status} ${error.config?.url}`, error.response?.data)
      }

      // 401 에러이고 토큰 갱신을 시도하지 않은 경우
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        try {
          const refreshToken = localStorage.getItem('refreshToken')
          if (refreshToken) {
            const refreshResponse = await axios.post(`${getApiUrls().AUTH_URL}/refresh`, {
              refreshToken,
            })

            const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('token', accessToken) // 호환성을 위해 둘 다 저장
            localStorage.setItem('refreshToken', newRefreshToken)

            // 원래 요청에 새 토큰으로 재시도
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            return instance(originalRequest)
          }
        } catch (refreshError) {
          // 토큰 갱신 실패 시 로그아웃 처리
          localStorage.removeItem('accessToken')
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('userInfo')
          window.location.href = '/login'
        }
      }

      return Promise.reject(error)
    },
  )

  return instance
}

// API 인스턴스들 생성
const apiUrls = getApiUrls()

// 디버깅용 로그 (개발 모드에서만)
if (import.meta.env.DEV) {
  console.log('=== API URLs 설정 ===')
  Object.entries(apiUrls).forEach(([key, url]) => {
    console.log(`${key}: ${url}`)
  })
}

export const memberApi = createApiInstance(apiUrls.MEMBER_URL)
export const authApi = createApiInstance(apiUrls.AUTH_URL)
export const storeApi = createApiInstance(apiUrls.STORE_URL)
export const contentApi = createApiInstance(apiUrls.CONTENT_URL)
export const menuApi = createApiInstance(apiUrls.MENU_URL)
export const salesApi = createApiInstance(apiUrls.SALES_URL)
export const recommendApi = createApiInstance(apiUrls.RECOMMEND_URL)
export const imagesApi = createApiInstance(apiUrls.IMAGES_URL)

// 기본 API 인스턴스 (Gateway URL 사용)
export const api = createApiInstance(apiUrls.GATEWAY_URL)

// 공통 에러 핸들러 (기존과 동일)
export const handleApiError = (error) => {
  const response = error.response

  if (!response) {
    return {
      success: false,
      message: '네트워크 연결을 확인해주세요.',
      error: error.message
    }
  }

  const status = response.status
  const data = response.data

  switch (status) {
    case 400:
      return {
        success: false,
        message: data?.message || '잘못된 요청입니다.',
        error: data?.error
      }
    case 401:
      return {
        success: false,
        message: '인증이 필요합니다.',
        error: 'UNAUTHORIZED'
      }
    case 403:
      return {
        success: false,
        message: '접근 권한이 없습니다.',
        error: 'FORBIDDEN'
      }
    case 404:
      return {
        success: false,
        message: '요청한 리소스를 찾을 수 없습니다.',
        error: 'NOT_FOUND'
      }
    case 500:
      return {
        success: false,
        message: '서버 오류가 발생했습니다.',
        error: 'INTERNAL_SERVER_ERROR'
      }
    default:
      return {
        success: false,
        message: data?.message || `오류가 발생했습니다. (${status})`,
        error: data?.error
      }
  }
}

// 성공 응답 포맷터
export const formatSuccessResponse = (data, message = '요청이 성공적으로 처리되었습니다.') => {
  return {
    success: true,
    message,
    data
  }
}