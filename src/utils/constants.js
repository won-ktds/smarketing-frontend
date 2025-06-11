/**
 * AI 마케팅 서비스 상수 정의
 * 
 * @description 애플리케이션 전반에서 사용되는 상수들을 정의합니다.
 * @author AI Marketing Team
 * @version 1.0
 */

// API 엔드포인트 상수
export const API_ENDPOINTS = {
  AUTH: '/auth',
  MEMBER: '/member',
  STORE: '/store',
  MENU: '/menu',
  CONTENT: '/content',
  RECOMMEND: '/recommend',
  ANALYSIS: '/analysis'
}

// 인증 관련 상수
export const AUTH_CONSTANTS = {
  ACCESS_TOKEN_KEY: 'accessToken',
  REFRESH_TOKEN_KEY: 'refreshToken',
  USER_INFO_KEY: 'userInfo',
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5분 (밀리초)
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000 // 15분 (밀리초)
}

// 콘텐츠 타입 상수
export const CONTENT_TYPES = [
  { text: 'SNS 포스트', value: 'SNS_POST', icon: 'mdi-instagram' },
  { text: '포스터', value: 'POSTER', icon: 'mdi-image' },
  { text: '블로그 글', value: 'BLOG', icon: 'mdi-post' },
  { text: '광고 문구', value: 'AD_COPY', icon: 'mdi-bullhorn' }
]

// SNS 플랫폼 상수
export const PLATFORMS = [
  { text: '인스타그램', value: 'INSTAGRAM', icon: 'mdi-instagram', color: '#E4405F' },
  { text: '페이스북', value: 'FACEBOOK', icon: 'mdi-facebook', color: '#1877F2' },
  { text: '네이버 블로그', value: 'NAVER_BLOG', icon: 'mdi-post', color: '#03C75A' },
  { text: '카카오톡', value: 'KAKAO_TALK', icon: 'mdi-chat', color: '#FEE500' },
  { text: '트위터', value: 'TWITTER', icon: 'mdi-twitter', color: '#1DA1F2' },
  { text: '유튜브', value: 'YOUTUBE', icon: 'mdi-youtube', color: '#FF0000' }
]

// 콘텐츠 상태 상수
export const CONTENT_STATUS = [
  { text: '초안', value: 'DRAFT', color: 'grey', icon: 'mdi-file-document-outline' },
  { text: '검토중', value: 'REVIEW', color: 'orange', icon: 'mdi-eye' },
  { text: '승인됨', value: 'APPROVED', color: 'green', icon: 'mdi-check-circle' },
  { text: '게시됨', value: 'PUBLISHED', color: 'blue', icon: 'mdi-publish' },
  { text: '보관됨', value: 'ARCHIVED', color: 'grey-darken-2', icon: 'mdi-archive' }
]

// 톤앤매너 옵션
export const TONE_OPTIONS = [
  { text: '친근함', value: '친근함', description: '고객과 가까운 느낌의 편안한 톤' },
  { text: '전문적', value: '전문적', description: '신뢰할 수 있는 전문가 느낌' },
  { text: '유머러스', value: '유머러스', description: '재미있고 유쾌한 분위기' },
  { text: '고급스러움', value: '고급스러움', description: '품격 있고 세련된 느낌' },
  { text: '트렌디', value: '트렌디', description: '최신 트렌드를 반영한 스타일' }
]

// 감정 강도 옵션
export const EMOTION_INTENSITY = [
  { text: '차분함', value: '차분함', description: '차분하고 안정적인 톤' },
  { text: '보통', value: '보통', description: '적당한 감정 표현' },
  { text: '활발함', value: '활발함', description: '에너지 넘치는 표현' },
  { text: '열정적', value: '열정적', description: '강렬하고 역동적인 표현' }
]

// 프로모션 옵션
export const PROMOTION_OPTIONS = [
  { text: '없음', value: '없음' },
  { text: '할인 이벤트', value: '할인 이벤트' },
  { text: '신메뉴 출시', value: '신메뉴 출시' },
  { text: '시즌 특가', value: '시즌 특가' },
  { text: '회원 혜택', value: '회원 혜택' },
  { text: '기념일 이벤트', value: '기념일 이벤트' }
]

// 업종 카테고리
export const BUSINESS_CATEGORIES = [
  { text: '음식점', value: 'RESTAURANT', icon: 'mdi-food' },
  { text: '카페', value: 'CAFE', icon: 'mdi-coffee' },
  { text: '베이커리', value: 'BAKERY', icon: 'mdi-cake' },
  { text: '치킨/피자', value: 'CHICKEN_PIZZA', icon: 'mdi-pizza' },
  { text: '분식', value: 'SNACK_BAR', icon: 'mdi-food-hot-dog' },
  { text: '술집', value: 'BAR', icon: 'mdi-glass-mug' },
  { text: '기타', value: 'OTHER', icon: 'mdi-store' }
]

// 메뉴 카테고리
export const MENU_CATEGORIES = [
  { text: '주메뉴', value: 'MAIN', color: 'primary' },
  { text: '사이드', value: 'SIDE', color: 'secondary' },
  { text: '음료', value: 'BEVERAGE', color: 'info' },
  { text: '디저트', value: 'DESSERT', color: 'warning' },
  { text: '세트메뉴', value: 'SET', color: 'success' }
]

// 매출 분석 기간 옵션
export const ANALYSIS_PERIODS = [
  { text: '오늘', value: 'today' },
  { text: '어제', value: 'yesterday' },
  { text: '이번 주', value: 'this_week' },
  { text: '지난 주', value: 'last_week' },
  { text: '이번 달', value: 'this_month' },
  { text: '지난 달', value: 'last_month' },
  { text: '지난 3개월', value: 'last_3_months' },
  { text: '직접 선택', value: 'custom' }
]

// 차트 타입 옵션
export const CHART_TYPES = [
  { text: '일별', value: 'daily', icon: 'mdi-calendar-today' },
  { text: '주별', value: 'weekly', icon: 'mdi-calendar-week' },
  { text: '월별', value: 'monthly', icon: 'mdi-calendar-month' }
]

// AI 추천 타입
export const AI_RECOMMENDATION_TYPES = [
  { text: '마케팅 팁', value: 'MARKETING_TIP', icon: 'mdi-lightbulb' },
  { text: '메뉴 제안', value: 'MENU_SUGGESTION', icon: 'mdi-food' },
  { text: '프로모션 아이디어', value: 'PROMOTION_IDEA', icon: 'mdi-sale' },
  { text: '콘텐츠 아이디어', value: 'CONTENT_IDEA', icon: 'mdi-lightbulb-variant' }
]

// 날씨 조건 상수
export const WEATHER_CONDITIONS = [
  { text: '맑음', value: 'SUNNY', icon: 'mdi-weather-sunny' },
  { text: '흐림', value: 'CLOUDY', icon: 'mdi-weather-cloudy' },
  { text: '비', value: 'RAINY', icon: 'mdi-weather-rainy' },
  { text: '눈', value: 'SNOWY', icon: 'mdi-weather-snowy' },
  { text: '바람', value: 'WINDY', icon: 'mdi-weather-windy' }
]

// 시간대 분류
export const TIME_SLOTS = [
  { text: '아침 (06:00-11:00)', value: 'MORNING', start: 6, end: 11 },
  { text: '점심 (11:00-14:00)', value: 'LUNCH', start: 11, end: 14 },
  { text: '오후 (14:00-17:00)', value: 'AFTERNOON', start: 14, end: 17 },
  { text: '저녁 (17:00-21:00)', value: 'DINNER', start: 17, end: 21 },
  { text: '밤 (21:00-24:00)', value: 'NIGHT', start: 21, end: 24 },
  { text: '심야 (00:00-06:00)', value: 'LATE_NIGHT', start: 0, end: 6 }
]

// 페이지네이션 상수
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
  MAX_VISIBLE_PAGES: 5
}

// 파일 업로드 상수
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/avi', 'video/mov'],
  MAX_IMAGES_COUNT: 10,
  MAX_VIDEOS_COUNT: 3
}

// UI 관련 상수
export const UI_CONSTANTS = {
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1200,
  HEADER_HEIGHT: 64,
  FOOTER_HEIGHT: 80,
  SIDEBAR_WIDTH: 280
}

// 알림 타입
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

// 로딩 상태 메시지
export const LOADING_MESSAGES = {
  GENERATING_CONTENT: 'AI가 콘텐츠를 생성하고 있습니다...',
  UPLOADING_FILE: '파일을 업로드하고 있습니다...',
  SAVING_DATA: '데이터를 저장하고 있습니다...',
  LOADING_DATA: '데이터를 불러오고 있습니다...',
  ANALYZING_DATA: '데이터를 분석하고 있습니다...'
}

// 에러 메시지
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  SERVER_ERROR: '서버에서 오류가 발생했습니다.',
  UNAUTHORIZED: '로그인이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  NOT_FOUND: '요청한 데이터를 찾을 수 없습니다.',
  VALIDATION_ERROR: '입력 정보를 확인해주세요.',
  FILE_SIZE_ERROR: '파일 크기가 너무 큽니다.',
  FILE_TYPE_ERROR: '지원하지 않는 파일 형식입니다.'
}

// 성공 메시지
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: '성공적으로 저장되었습니다.',
  UPDATE_SUCCESS: '성공적으로 수정되었습니다.',
  DELETE_SUCCESS: '성공적으로 삭제되었습니다.',
  UPLOAD_SUCCESS: '파일이 성공적으로 업로드되었습니다.',
  CONTENT_GENERATED: 'AI 콘텐츠가 성공적으로 생성되었습니다.',
  LOGIN_SUCCESS: '로그인되었습니다.',
  LOGOUT_SUCCESS: '로그아웃되었습니다.'
}