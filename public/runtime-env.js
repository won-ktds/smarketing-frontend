//* public/runtime-env.js - 디버깅 포함 버전
console.log('=== RUNTIME-ENV.JS 로드됨 ===');

window.__runtime_config__ = {
  // 로컬 개발 환경 설정
  AUTH_URL: 'http://localhost:8081/api/auth',
  MEMBER_URL: 'http://localhost:8081/api/member',  
  STORE_URL: 'http://localhost:8082/api/store',
  CONTENT_URL: 'http://localhost:8083/api/content',
  RECOMMEND_URL: 'http://localhost:8084/api/recommendation',
  
  // Gateway 주석 처리 (로컬에서는 사용 안함)
  // GATEWAY_URL: 'http://20.1.2.3',
  
  // 기능 플래그
  FEATURES: {
    ANALYTICS: true,
    PUSH_NOTIFICATIONS: true,
    SOCIAL_LOGIN: false,
    MULTI_LANGUAGE: false,
  },

  // 환경 설정
  ENV: 'development',
  DEBUG: true,

  // 버전 정보
  VERSION: '1.0.0',
  BUILD_DATE: new Date().toISOString(),
};

console.log('=== 설정된 API URLs ===');
console.log('AUTH_URL:', window.__runtime_config__.AUTH_URL);
console.log('MEMBER_URL:', window.__runtime_config__.MEMBER_URL);
console.log('전체 설정:', window.__runtime_config__);