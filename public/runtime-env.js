//* public/runtime-env.js - 배포 환경 우선 설정
console.log('=== RUNTIME-ENV.JS 로드됨 ===');

// 배포 환경 감지 함수
const isProduction = () => {
  // 프로덕션 환경 감지 로직
  return window.location.hostname !== 'localhost' && 
         window.location.hostname !== '127.0.0.1' &&
         !window.location.hostname.includes('dev');
};

// 기본 ingress host 설정 (deploy_env_vars에서 설정된 값)
const DEFAULT_INGRESS_HOST = 'smarketing.20.249.184.228.nip.io';

// 환경별 API URL 설정
const getBaseUrl = () => {
  if (isProduction()) {
    // 프로덕션: ingress host 사용
    return `http://${DEFAULT_INGRESS_HOST}`;
  } else {
    // 개발환경: localhost 사용
    return '';
  }
};

const baseUrl = getBaseUrl();

window.__runtime_config__ = {
  // 프로덕션 환경에서는 ingress host 사용, 개발환경에서는 localhost
  AUTH_URL: isProduction() ? 
    `${baseUrl}/api/auth` : 
    'http://localhost:8081/api/auth',
    
  MEMBER_URL: isProduction() ? 
    `${baseUrl}/api/member` : 
    'http://localhost:8081/api/member',
    
  STORE_URL: isProduction() ? 
    `${baseUrl}/api/store` : 
    'http://localhost:8082/api/store',
    
  MENU_URL: isProduction() ? 
    `${baseUrl}/api/menu` : 
    'http://localhost:8082/api/menu',
    
  SALES_URL: isProduction() ? 
    `${baseUrl}/api/sales` : 
    'http://localhost:8082/api/sales',
    
  CONTENT_URL: isProduction() ? 
    `${baseUrl}/api/content` : 
    'http://localhost:8083/api/content',
    
  RECOMMEND_URL: isProduction() ? 
    `${baseUrl}/api/recommend` : 
    'http://localhost:8084/api/recommendations',
  
  // Gateway URL
  GATEWAY_URL: isProduction() ? baseUrl : 'http://20.1.2.3',
  
  // 기능 플래그
  FEATURES: {
    ANALYTICS: true,
    PUSH_NOTIFICATIONS: true,
    SOCIAL_LOGIN: false,
    MULTI_LANGUAGE: false,
    API_HEALTH_CHECK: true,
  },

  // 환경 설정
  ENV: isProduction() ? 'production' : 'development',
  DEBUG: !isProduction(),

  // API 타임아웃 설정
  API_TIMEOUT: 30000,
  
  // 재시도 설정
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,

  // 버전 정보
  VERSION: '1.0.0',
  BUILD_DATE: new Date().toISOString(),
  
  // 백엔드 서비스 포트 정보 (디버깅용)
  BACKEND_PORTS: {
    AUTH: 8081,
    STORE: 8082,
    CONTENT: 8083,
    AI_RECOMMEND: 8084
  }
};

// 설정 검증 함수
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

// 환경별 상세 로깅
if (window.__runtime_config__.DEBUG) {
  console.log('=== 현재 환경 정보 ===');
  console.log('🌍 Environment:', window.__runtime_config__.ENV);
  console.log('🏠 Hostname:', window.location.hostname);
  console.log('🔧 Is Production:', isProduction());
  
  console.log('=== 백엔드 API URLs ===');
  console.log('🔐 AUTH_URL:', window.__runtime_config__.AUTH_URL);
  console.log('🏪 STORE_URL:', window.__runtime_config__.STORE_URL);
  console.log('📊 SALES_URL:', window.__runtime_config__.SALES_URL);
  console.log('🤖 RECOMMEND_URL:', window.__runtime_config__.RECOMMEND_URL);
  console.log('📄 CONTENT_URL:', window.__runtime_config__.CONTENT_URL);
  
  console.log('=== 설정 상세 정보 ===');
  console.log('전체 설정:', window.__runtime_config__);
}

// 전역 설정 접근 함수
window.getApiConfig = () => window.__runtime_config__;
window.getApiUrl = (serviceName) => {
  const config = window.__runtime_config__;
  const urlKey = `${serviceName.toUpperCase()}_URL`;
  return config[urlKey] || null;
};

// 설정 검증 실행
validateConfig();

console.log(`✅ [RUNTIME] 런타임 설정 로드 완료 (${window.__runtime_config__.ENV} 환경)`);