//* public/runtime-env.js
window.__runtime_config__ = {
  // API 서버 URL들
  AUTH_URL: 'http://20.1.2.3/auth',
  STORE_URL: 'http://20.1.2.3/store',
  CONTENT_URL: 'http://20.1.2.3/content',
  RECOMMEND_URL: 'http://20.1.2.3/recommend',

  // 외부 API 설정
  CLAUDE_AI_ENABLED: true,
  WEATHER_API_ENABLED: true,

  // 기능 플래그
  FEATURES: {
    ANALYTICS: true,
    PUSH_NOTIFICATIONS: true,
    SOCIAL_LOGIN: false,
    MULTI_LANGUAGE: false,
  },

  // 환경 설정
  ENV: 'production',
  DEBUG: false,

  // 버전 정보
  VERSION: '1.0.0',
  BUILD_DATE: new Date().toISOString(),
}
