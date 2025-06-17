//* public/runtime-env.js - 백엔드 API 경로에 맞게 수정
console.log('=== RUNTIME-ENV.JS 로드됨 ===');

window.__runtime_config__ = {
  // ⚠️ 수정: 백엔드 API 구조에 맞게 URL 설정
  AUTH_URL: 'http://localhost:8081/api/auth',
  MEMBER_URL: 'http://localhost:8081/api/member',  
  STORE_URL: 'http://localhost:8082/api/store',
  MENU_URL: 'http://localhost:8082/api/menu',
  SALES_URL: 'http://localhost:8082/api/sales',  // store 서비스
  CONTENT_URL: 'http://localhost:8083/api/content',
  RECOMMEND_URL: 'http://localhost:8084/api/recommendations', // ⚠️ 수정: 올바른 경로
  
  // Gateway URL (운영 환경용)
  GATEWAY_URL: 'http://20.1.2.3',
  
  // 기능 플래그
  FEATURES: {
    ANALYTICS: true,
    PUSH_NOTIFICATIONS: true,
    SOCIAL_LOGIN: false,
    MULTI_LANGUAGE: false,
    API_HEALTH_CHECK: true, // ⚠️ 추가
  },

  // 환경 설정
  ENV: 'development',
  DEBUG: true,

  // ⚠️ 추가: API 타임아웃 설정
  API_TIMEOUT: 30000,
  
  // ⚠️ 추가: 재시도 설정
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,

  // 버전 정보
  VERSION: '1.0.0',
  BUILD_DATE: new Date().toISOString(),
  
  // ⚠️ 추가: 백엔드 서비스 포트 정보 (디버깅용)
  BACKEND_PORTS: {
    AUTH: 8081,
    STORE: 8082,
    CONTENT: 8083,
    AI_RECOMMEND: 8084
  }
};

// ⚠️ 추가: 설정 검증 함수
const validateConfig = () => {
  const config = window.__runtime_config__;
  const requiredUrls = ['AUTH_URL', 'STORE_URL', 'SALES_URL', 'RECOMMEND_URL'];
  
  for (const url of requiredUrls) {
    if (!config[url]) {
      console.error(`❌ [CONFIG] 필수 URL 누락: ${url}`);
      return false;
    }
  }
  
  console.log('✅ [CONFIG] 설정 검증 완료');
  return true;
};

// ⚠️ 추가: 개발 환경에서만 상세 로깅
if (window.__runtime_config__.DEBUG) {
  console.log('=== 백엔드 API URLs ===');
  console.log('🔐 AUTH_URL:', window.__runtime_config__.AUTH_URL);
  console.log('🏪 STORE_URL:', window.__runtime_config__.STORE_URL);
  console.log('📊 SALES_URL:', window.__runtime_config__.SALES_URL);
  console.log('🤖 RECOMMEND_URL:', window.__runtime_config__.RECOMMEND_URL);
  console.log('📄 CONTENT_URL:', window.__runtime_config__.CONTENT_URL);
  
  console.log('=== 설정 상세 정보 ===');
  console.log('전체 설정:', window.__runtime_config__);
  
  // 설정 검증 실행
  validateConfig();
}

// ⚠️ 추가: 전역 설정 접근 함수
window.getApiConfig = () => window.__runtime_config__;
window.getApiUrl = (serviceName) => {
  const config = window.__runtime_config__;
  const urlKey = `${serviceName.toUpperCase()}_URL`;
  return config[urlKey] || null;
};

console.log('✅ [RUNTIME] 런타임 설정 로드 완료');