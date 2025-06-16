//* public/runtime-env.js - 수정버전
console.log('=== RUNTIME-ENV.JS 로드됨 ===');

window.__runtime_config__ = {
  // 기존 설정들...
  AUTH_URL: 'http://localhost:8081/api/auth',
  MEMBER_URL: 'http://localhost:8081/api/member',  
  STORE_URL: 'http://localhost:8082/api/store',
  SALES_URL: 'http://localhost:8082/api/sales',        // ← 이 줄 추가
  CONTENT_URL: 'http://localhost:8083/api/content',
  RECOMMEND_URL: 'http://localhost:8084/api/recommendation',
  
  // 프로덕션 환경 (주석 처리)
  // GATEWAY_URL: 'http://20.1.2.3',
  // STORE_URL: 'http://20.1.2.3/api/store',
  // SALES_URL: 'http://20.1.2.3/api/sales',
  
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
console.log('STORE_URL:', window.__runtime_config__.STORE_URL);
console.log('SALES_URL:', window.__runtime_config__.SALES_URL);
console.log('RECOMMEND_URL:', window.__runtime_config__.RECOMMEND_URL);
console.log('전체 설정:', window.__runtime_config__);