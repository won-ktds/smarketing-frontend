//* src/services/api.js
import axios from 'axios'

// 런타임 환경 설정에서 API URL 가져오기
const getApiUrls = () => {
  const config = window.__runtime_config__ || {}
  return {
    GATEWAY_URL: config.GATEWAY_URL || 'http://20.1.2.3',
    AUTH_URL: 'http://localhost:8081/api/auth',
    MEMBER_URL: 'http://localhost:8081/api/member',
    STORE_URL: config.STORE_URL || 'http://localhost:8082/api/store',
    CONTENT_URL: config.CONTENT_URL || 'http://20.1.2.3/api/content',
    MENU_URL: config.MENU_URL || 'http://20.1.2.3/api/menu',
    SALES_URL: config.SALES_URL || 'http://20.1.2.3/api/sales',
    RECOMMEND_URL: config.RECOMMEND_URL || 'http://20.1.2.3/api/recommendation',
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
      const token = localStorage.getItem('accessToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
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
      return response
    },
    async (error) => {
      const originalRequest = error.config

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
            localStorage.setItem('refreshToken', newRefreshToken)

            // 원래 요청에 새 토큰으로 재시도
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            return instance(originalRequest)
          }
        } catch (refreshError) {
          // 토큰 갱신 실패 시 로그아웃 처리
          localStorage.removeItem('accessToken')
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
export const memberApi = createApiInstance(apiUrls.MEMBER_URL)
export const authApi = createApiInstance(apiUrls.AUTH_URL)
export const storeApi = createApiInstance(apiUrls.STORE_URL)
export const contentApi = createApiInstance(apiUrls.CONTENT_URL)
export const menuApi = createApiInstance(apiUrls.MENU_URL)
export const salesApi = createApiInstance(apiUrls.SALES_URL)
export const recommendApi = createApiInstance(apiUrls.RECOMMEND_URL)

// 기본 API 인스턴스 (Gateway URL 사용)
export const api = createApiInstance(apiUrls.GATEWAY_URL)

// 공통 에러 핸들러
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

