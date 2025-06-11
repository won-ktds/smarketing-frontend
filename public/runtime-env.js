window.__runtime_config__ = {
  // API Gateway URL (단일 진입점)
  GATEWAY_URL: 'http://20.1.2.3',
  
  // 각 마이크로서비스별 URL (Ingress 라우팅)
  MEMBER_URL: 'http://20.1.2.3/api/member',
  AUTH_URL: 'http://20.1.2.3/api/auth',
  STORE_URL: 'http://20.1.2.3/api/store',
  CONTENT_URL: 'http://20.1.2.3/api/content',
  RECOMMEND_URL: 'http://20.1.2.3/api/recommendation',
  
  // 애플리케이션 설정
  APP_VERSION: '1.0.0',
  APP_NAME: '₩ON',
  
  // 환경 설정
  ENVIRONMENT: 'production',
  DEBUG_MODE: false,
  
  // API 설정
  API_TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  
  // 파일 업로드 설정
  MAX_FILE_SIZE: 10485760, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm'],
  
  // 인증 설정
  TOKEN_REFRESH_MARGIN: 300, // 5분 전 토큰 갱신
  SESSION_TIMEOUT: 1800, // 30분
  
  // UI 설정
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  
  // 페이지네이션 설정
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // 알림 설정
  NOTIFICATION_TIMEOUT: 5000,
  MAX_NOTIFICATIONS: 5,
  
  // 캐시 설정
  CACHE_DURATION: 300000, // 5분
  
  // 지도 API (필요한 경우)
  // KAKAO_MAP_API_KEY: '',
  // NAVER_MAP_API_KEY: '',
  
  // 소셜 로그인 (향후 확장)
  // KAKAO_APP_KEY: '',
  // NAVER_CLIENT_ID: '',
  // GOOGLE_CLIENT_ID: '',
  
  // 분석 도구 (필요한 경우)
  // GOOGLE_ANALYTICS_ID: '',
  // HOTJAR_ID: '',
  
  // CDN 설정
  IMAGE_CDN_URL: 'http://20.1.2.3/images',
  STATIC_CDN_URL: 'http://20.1.2.3/static',
  
  // 피처 플래그
  FEATURES: {
    AI_RECOMMENDATION: true,
    VOICE_INPUT: false,
    DARK_MODE: true,
    OFFLINE_MODE: false,
    PUSH_NOTIFICATIONS: true,
    REAL_TIME_UPDATES: true,
    MULTI_STORE_SUPPORT: false,
    ADVANCED_ANALYTICS: true
  },
  
  // 테마 설정
  THEME: {
    PRIMARY_COLOR: '#1976D2',
    SECONDARY_COLOR: '#FFC107',
    SUCCESS_COLOR: '#4CAF50',
    WARNING_COLOR: '#FF9800',
    ERROR_COLOR: '#F44336',
    INFO_COLOR: '#2196F3'
  },
  
  // 국제화 설정
  LOCALE: 'ko-KR',
  TIMEZONE: 'Asia/Seoul',
  CURRENCY: 'KRW',
  
  // 콘텐츠 생성 설정
  AI_CONTENT: {
    MAX_REGENERATION_COUNT: 5,
    CONTENT_TYPES: ['sns_post', 'poster', 'banner'],
    PLATFORMS: ['instagram', 'naver_blog', 'facebook'],
    TONE_OPTIONS: ['friendly', 'professional', 'humorous', 'elegant'],
    EMOTION_LEVELS: ['calm', 'normal', 'passionate', 'exaggerated']
  },
  
  // 메뉴 카테고리 기본값
  DEFAULT_MENU_CATEGORIES: ['면류', '밥류', '튀김', '분식', '음료', '디저트', '기타'],
  
  // 매장 업종 기본값
  BUSINESS_TYPES: [
    '한식', '중식', '일식', '양식', '분식', '치킨', '피자', '카페', 
    '베이커리', '아이스크림', '패스트푸드', '기타'
  ],
  
  // 운영시간 기본값
  DEFAULT_OPERATING_HOURS: {
    WEEKDAY: { open: '09:00', close: '22:00' },
    WEEKEND: { open: '10:00', close: '21:00' }
  },
  
  // 에러 메시지
  ERROR_MESSAGES: {
    NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
    TIMEOUT_ERROR: '요청 시간이 초과되었습니다.',
    UNAUTHORIZED: '로그인이 필요합니다.',
    FORBIDDEN: '접근 권한이 없습니다.',
    NOT_FOUND: '요청한 페이지를 찾을 수 없습니다.',
    SERVER_ERROR: '서버 오류가 발생했습니다.',
    VALIDATION_ERROR: '입력 정보를 확인해주세요.',
    FILE_SIZE_ERROR: '파일 크기가 너무 큽니다.',
    FILE_TYPE_ERROR: '지원하지 않는 파일 형식입니다.'
  },
  
  // 성공 메시지
  SUCCESS_MESSAGES: {
    LOGIN_SUCCESS: '로그인이 완료되었습니다.',
    LOGOUT_SUCCESS: '로그아웃이 완료되었습니다.',
    REGISTER_SUCCESS: '회원가입이 완료되었습니다.',
    UPDATE_SUCCESS: '정보가 수정되었습니다.',
    DELETE_SUCCESS: '삭제가 완료되었습니다.',
    SAVE_SUCCESS: '저장이 완료되었습니다.',
    UPLOAD_SUCCESS: '업로드가 완료되었습니다.',
    CONTENT_GENERATED: 'AI 콘텐츠가 생성되었습니다.'
  },
  
  // 확인 메시지
  CONFIRM_MESSAGES: {
    DELETE_CONFIRM: '정말 삭제하시겠습니까?',
    LOGOUT_CONFIRM: '로그아웃 하시겠습니까?',
    CANCEL_CONFIRM: '작업을 취소하시겠습니까?',
    OVERWRITE_CONFIRM: '기존 내용을 덮어쓰시겠습니까?'
  }
};

// 환경별 설정 오버라이드
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  // 개발 환경 설정
  window.__runtime_config__.ENVIRONMENT = 'development';
  window.__runtime_config__.DEBUG_MODE = true;
  window.__runtime_config__.GATEWAY_URL = 'http://localhost:8080';
  window.__runtime_config__.MEMBER_URL = 'http://localhost:8080/api/member';
  window.__runtime_config__.AUTH_URL = 'http://localhost:8080/api/auth';
  window.__runtime_config__.STORE_URL = 'http://localhost:8080/api/store';
  window.__runtime_config__.CONTENT_URL = 'http://localhost:8080/api/content';
  window.__runtime_config__.RECOMMEND_URL = 'http://localhost:8080/api/recommendation';
}

// 설정 유효성 검사
if (!window.__runtime_config__.GATEWAY_URL) {
  console.error('GATEWAY_URL이 설정되지 않았습니다.');
}

// 전역 함수로 설정 노출
window.getConfig = function(key) {
  return window.__runtime_config__[key];
};

window.getFeature = function(featureName) {
  return window.__runtime_config__.FEATURES[featureName] || false;
};

console.log('₩ON Runtime Configuration loaded:', window.__runtime_config__.ENVIRONMENT);
