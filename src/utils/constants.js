//* src/utils/constants.js
/**
 * 애플리케이션 전역 상수 정의
 */

// 콘텐츠 타입
export const CONTENT_TYPES = {
  SNS: 'sns',
  POSTER: 'poster',
  BLOG: 'blog'
}

// 플랫폼
export const PLATFORMS = {
  INSTAGRAM: 'instagram',
  NAVER_BLOG: 'naver_blog',
  FACEBOOK: 'facebook',
  KAKAO_STORY: 'kakao_story'
}

// 플랫폼 라벨
export const PLATFORM_LABELS = {
  [PLATFORMS.INSTAGRAM]: '인스타그램',
  [PLATFORMS.NAVER_BLOG]: '네이버 블로그',
  [PLATFORMS.FACEBOOK]: '페이스북',
  [PLATFORMS.KAKAO_STORY]: '카카오스토리'
}

// 플랫폼 컬러
export const PLATFORM_COLORS = {
  [PLATFORMS.INSTAGRAM]: 'pink',
  [PLATFORMS.NAVER_BLOG]: 'green',
  [PLATFORMS.FACEBOOK]: 'blue',
  [PLATFORMS.KAKAO_STORY]: 'amber'
}

// 플랫폼 아이콘
export const PLATFORM_ICONS = {
  [PLATFORMS.INSTAGRAM]: 'mdi-instagram',
  [PLATFORMS.NAVER_BLOG]: 'mdi-web',
  [PLATFORMS.FACEBOOK]: 'mdi-facebook',
  [PLATFORMS.KAKAO_STORY]: 'mdi-chat'
}

// 플랫폼 사양 정의 (누락된 PLATFORM_SPECS 추가)
export const PLATFORM_SPECS = {
  [PLATFORMS.INSTAGRAM]: {
    name: '인스타그램',
    icon: 'mdi-instagram',
    color: 'pink',
    maxLength: 2200,
    hashtags: true,
    imageRequired: true,
    format: 'sns'
  },
  [PLATFORMS.NAVER_BLOG]: {
    name: '네이버 블로그',
    icon: 'mdi-web',
    color: 'green',
    maxLength: 5000,
    hashtags: false,
    imageRequired: false,
    format: 'blog'
  },
  [PLATFORMS.FACEBOOK]: {
    name: '페이스북',
    icon: 'mdi-facebook',
    color: 'blue',
    maxLength: 63206,
    hashtags: true,
    imageRequired: false,
    format: 'sns'
  },
  [PLATFORMS.KAKAO_STORY]: {
    name: '카카오스토리',
    icon: 'mdi-chat',
    color: 'amber',
    maxLength: 1000,
    hashtags: true,
    imageRequired: false,
    format: 'sns'
  }
}

// 톤앤매너
export const TONE_AND_MANNER = {
  FRIENDLY: 'friendly',
  PROFESSIONAL: 'professional',
  CASUAL: 'casual',
  HUMOROUS: 'humorous'
}

// 감정 강도
export const EMOTION_INTENSITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
}

// 프로모션 타입
export const PROMOTION_TYPES = {
  DISCOUNT: 'DISCOUNT',
  EVENT: 'EVENT',
  NEW_PRODUCT: 'NEW_PRODUCT',
  REVIEW: 'REVIEW'
}

// 사진 스타일
export const PHOTO_STYLES = {
  MODERN: 'modern',
  VINTAGE: 'vintage',
  MINIMALIST: 'minimalist',
  COLORFUL: 'colorful',
  BRIGHT: 'bright',
  CALM: 'calm',
  NATURAL: 'natural'
}

// 콘텐츠 상태
export const CONTENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
}

// 타겟 대상
export const TARGET_TYPES = {
  NEW_MENU: 'new_menu',
  DISCOUNT: 'discount',
  STORE: 'store',
  EVENT: 'event'
}

// 타겟 대상 라벨
export const TARGET_TYPE_LABELS = {
  [TARGET_TYPES.NEW_MENU]: '신메뉴',
  [TARGET_TYPES.DISCOUNT]: '할인 이벤트',
  [TARGET_TYPES.STORE]: '매장 홍보',
  [TARGET_TYPES.EVENT]: '일반 이벤트'
}

// 백엔드 플랫폼 매핑 (프론트엔드 -> 백엔드)
export const BACKEND_PLATFORM_MAPPING = {
  [PLATFORMS.INSTAGRAM]: 'INSTAGRAM',
  [PLATFORMS.NAVER_BLOG]: 'NAVER_BLOG',
  [PLATFORMS.FACEBOOK]: 'FACEBOOK',
  [PLATFORMS.KAKAO_STORY]: 'KAKAO_STORY'
}

// 백엔드에서 프론트엔드로 매핑 (백엔드 -> 프론트엔드)
export const FRONTEND_PLATFORM_MAPPING = {
  'INSTAGRAM': PLATFORMS.INSTAGRAM,
  'NAVER_BLOG': PLATFORMS.NAVER_BLOG,
  'FACEBOOK': PLATFORMS.FACEBOOK,
  'KAKAO_STORY': PLATFORMS.KAKAO_STORY
}

// API 응답 상태
export const API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading'
}

// 페이지 크기
export const PAGE_SIZES = {
  SMALL: 10,
  MEDIUM: 20,
  LARGE: 50
}

// 정렬 방향
export const SORT_DIRECTION = {
  ASC: 'asc',
  DESC: 'desc'
}

// 날짜 포맷
export const DATE_FORMATS = {
  DISPLAY: 'YYYY-MM-DD HH:mm',
  API: 'YYYY-MM-DD',
  FULL: 'YYYY-MM-DD HH:mm:ss'
}

// 파일 업로드 제한
export const FILE_LIMITS = {
  MAX_SIZE: 10485760, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  MAX_FILES: 5
}

// 콘텐츠 생성 제한
export const CONTENT_LIMITS = {
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  REQUIREMENTS_MAX_LENGTH: 1000,
  MAX_HASHTAGS: 30
}

// 알림 타입
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

// 로컬 스토리지 키
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_INFO: 'userInfo',
  THEME: 'theme',
  LANGUAGE: 'language'
}