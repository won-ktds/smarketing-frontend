//* src/services/api.js - 수정된 버전 (createImageApiInstance 함수 추가)

import axios from 'axios'

// 런타임 환경 설정에서 API URL 가져오기
const getApiUrls = () => {
  const config = window.__runtime_config__ || {}
  return {
    GATEWAY_URL: config.GATEWAY_URL || 'http://20.1.2.3',
    AUTH_URL: config.AUTH_URL || 'http://smarketing.20.249.184.228.nip.io/api/auth',
    MEMBER_URL: config.MEMBER_URL || 'http://smarketing.20.249.184.228.nip.io/api/member',
    STORE_URL: config.STORE_URL || 'http://smarketing.20.249.184.228.nip.io/api/store',
    CONTENT_URL: config.CONTENT_URL || 'http://smarketing.20.249.184.228.nip.io/api/content',
    MENU_URL: config.MENU_URL || 'http://smarketing.20.249.184.228.nip.io/api/menu',
    SALES_URL: config.SALES_URL || 'http://smarketing.20.249.184.228.nip.io/api/sales',
    RECOMMEND_URL: config.RECOMMEND_URL || 'http://smarketing.20.249.184.228.nip.io/api/recommendations',
    IMAGE_URL: config.IMAGE_URL || 'http://smarketing.20.249.184.228.nip.io/api/menu/images'
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
      
      if (import.meta.env.DEV) {
        console.log(`🌐 [API_REQ] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
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
      if (import.meta.env.DEV) {
        console.log(`✅ [API_RES] ${response.status} ${response.config?.method?.toUpperCase()} ${response.config?.url}`)
      }
      return response
    },
    async (error) => {
      if (import.meta.env.DEV) {
        console.error(`❌ [API_ERR] ${error.response?.status || 'Network'} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data)
      }
      
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
          console.warn('⚠️ [TOKEN] 토큰 갱신 실패, 로그아웃 처리')
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

// ✅ 이미지 업로드 전용 API 인스턴스 생성 함수 추가
const createImageApiInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    timeout: 60000, // 이미지 업로드는 시간이 더 걸릴 수 있음
    headers: {
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
      
      if (import.meta.env.DEV) {
        console.log(`🌐 [IMG_REQ] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
        console.log('FormData 포함:', config.data instanceof FormData)
      }
      
      return config
    },
    (error) => {
      return Promise.reject(error)
    },
  )

  // 응답 인터셉터
  instance.interceptors.response.use(
    (response) => {
      if (import.meta.env.DEV) {
        console.log(`✅ [IMG_RES] ${response.status} ${response.config?.method?.toUpperCase()} ${response.config?.url}`)
      }
      return response
    },
    async (error) => {
      if (import.meta.env.DEV) {
        console.error(`❌ [IMG_ERR] ${error.response?.status || 'Network'} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data)
      }
      
      // 토큰 갱신 로직은 기존과 동일
      const originalRequest = error.config
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
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            return instance(originalRequest)
          }
        } catch (refreshError) {
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

// ✅ 메뉴 이미지 업로드 전용 API 인스턴스 생성 함수 추가
const createMenuImageApiInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    timeout: 60000, // 이미지 업로드는 시간이 더 걸릴 수 있음
    headers: {
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
      
      if (import.meta.env.DEV) {
        console.log(`🌐 [MENU_IMG_REQ] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
        console.log('FormData 포함:', config.data instanceof FormData)
      }
      
      return config
    },
    (error) => {
      return Promise.reject(error)
    },
  )

  // 응답 인터셉터
  instance.interceptors.response.use(
    (response) => {
      if (import.meta.env.DEV) {
        console.log(`✅ [MENU_IMG_RES] ${response.status} ${response.config?.method?.toUpperCase()} ${response.config?.url}`)
      }
      return response
    },
    async (error) => {
      if (import.meta.env.DEV) {
        console.error(`❌ [MENU_IMG_ERR] ${error.response?.status || 'Network'} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data)
      }
      
      // 토큰 갱신 로직은 기존과 동일
      const originalRequest = error.config
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
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            return instance(originalRequest)
          }
        } catch (refreshError) {
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

if (import.meta.env.DEV) {
  console.log('🔧 [API_CONFIG] API URLs 설정:', apiUrls)
}

export const memberApi = createApiInstance(apiUrls.MEMBER_URL)
export const authApi = createApiInstance(apiUrls.AUTH_URL)
export const storeApi = createApiInstance(apiUrls.STORE_URL)
export const contentApi = createApiInstance(apiUrls.CONTENT_URL)
export const menuApi = createApiInstance(apiUrls.MENU_URL)
export const menuImageApi = createMenuImageApiInstance(apiUrls.MENU_URL) // ✅ 추가
export const salesApi = createApiInstance(apiUrls.SALES_URL)
export const recommendApi = createApiInstance(apiUrls.RECOMMEND_URL)
export const imageApi = createApiInstance(apiUrls.IMAGE_URL)
export const apiWithImage = imageApi // 별칭 (기존 코드 호환성)

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

// API 상태 확인 함수
export const checkApiHealth = async () => {
  const results = {}
  
  try {
    // 각 API 서버 상태 확인
    const checks = [
      { name: 'Auth', api: authApi, endpoint: '/health' },
      { name: 'Store', api: storeApi, endpoint: '/health' },
      { name: 'Sales', api: salesApi, endpoint: '/health' },
      { name: 'Recommend', api: recommendApi, endpoint: '/health' }
    ]
    
    for (const check of checks) {
      try {
        await check.api.get(check.endpoint)
        results[check.name] = 'OK'
      } catch (error) {
        results[check.name] = `ERROR: ${error.response?.status || 'Network'}`
      }
    }
    
  } catch (error) {
    console.error('API 상태 확인 실패:', error)
  }
  
  return results
}

// 개발 환경에서 전역 노출
if (import.meta.env.DEV) {
  window.__api_debug__ = {
    urls: apiUrls,
    instances: { 
      memberApi, authApi, storeApi, contentApi, menuApi, menuImageApi, 
      salesApi, recommendApi, imageApi 
    },
    checkHealth: checkApiHealth
  }
  console.log('🔧 [DEBUG] API 인스턴스가 window.__api_debug__에 노출됨')
}