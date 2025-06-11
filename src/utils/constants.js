//* src/utils/constants.js
/**
 * 애플리케이션 전역 상수 정의
 */

// 콘텐츠 타입
export const CONTENT_TYPES = {
  SNS: 'sns',
  POSTER: 'poster',
  VIDEO: 'video',
  BLOG: 'blog',
}

export const CONTENT_TYPE_LABELS = {
  [CONTENT_TYPES.SNS]: 'SNS 게시물',
  [CONTENT_TYPES.POSTER]: '홍보 포스터',
  [CONTENT_TYPES.VIDEO]: '비디오',
  [CONTENT_TYPES.BLOG]: '블로그 포스트',
}

// 플랫폼
export const PLATFORMS = {
  INSTAGRAM: 'instagram',
  NAVER_BLOG: 'naver_blog',
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
  YOUTUBE: 'youtube',
  KAKAO: 'kakao',
}

export const PLATFORM_LABELS = {
  [PLATFORMS.INSTAGRAM]: '인스타그램',
  [PLATFORMS.NAVER_BLOG]: '네이버 블로그',
  [PLATFORMS.FACEBOOK]: '페이스북',
  [PLATFORMS.TWITTER]: '트위터',
  [PLATFORMS.YOUTUBE]: '유튜브',
  [PLATFORMS.KAKAO]: '카카오',
}

export const PLATFORM_COLORS = {
  [PLATFORMS.INSTAGRAM]: 'purple',
  [PLATFORMS.NAVER_BLOG]: 'green',
  [PLATFORMS.FACEBOOK]: 'blue',
  [PLATFORMS.TWITTER]: 'light-blue',
  [PLATFORMS.YOUTUBE]: 'red',
  [PLATFORMS.KAKAO]: 'yellow',
}

// 콘텐츠 상태
export const CONTENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  SCHEDULED: 'scheduled',
  ARCHIVED: 'archived',
  FAILED: 'failed',
}

export const CONTENT_STATUS_LABELS = {
  [CONTENT_STATUS.DRAFT]: '임시저장',
  [CONTENT_STATUS.PUBLISHED]: '발행됨',
  [CONTENT_STATUS.SCHEDULED]: '예약됨',
  [CONTENT_STATUS.ARCHIVED]: '보관됨',
  [CONTENT_STATUS.FAILED]: '실패',
}

export const CONTENT_STATUS_COLORS = {
  [CONTENT_STATUS.DRAFT]: 'orange',
  [CONTENT_STATUS.PUBLISHED]: 'success',
  [CONTENT_STATUS.SCHEDULED]: 'info',
  [CONTENT_STATUS.ARCHIVED]: 'grey',
  [CONTENT_STATUS.FAILED]: 'error',
}

// 매장 업종
export const BUSINESS_TYPES = {
  RESTAURANT: 'restaurant',
  CAFE: 'cafe',
  SNACK_BAR: 'snack_bar',
  FAST_FOOD: 'fast_food',
  BAKERY: 'bakery',
  DESSERT: 'dessert',
  CONVENIENCE: 'convenience',
  OTHER: 'other',
}

export const BUSINESS_TYPE_LABELS = {
  [BUSINESS_TYPES.RESTAURANT]: '일반음식점',
  [BUSINESS_TYPES.CAFE]: '카페',
  [BUSINESS_TYPES.SNACK_BAR]: '분식점',
  [BUSINESS_TYPES.FAST_FOOD]: '패스트푸드',
  [BUSINESS_TYPES.BAKERY]: '제과점',
  [BUSINESS_TYPES.DESSERT]: '디저트카페',
  [BUSINESS_TYPES.CONVENIENCE]: '편의점',
  [BUSINESS_TYPES.OTHER]: '기타',
}

// 톤앤매너
export const TONE_AND_MANNER = {
  FRIENDLY: 'friendly',
  PROFESSIONAL: 'professional',
  HUMOROUS: 'humorous',
  ELEGANT: 'elegant',
  CASUAL: 'casual',
  TRENDY: 'trendy',
}

export const TONE_AND_MANNER_LABELS = {
  [TONE_AND_MANNER.FRIENDLY]: '친근함',
  [TONE_AND_MANNER.PROFESSIONAL]: '전문적',
  [TONE_AND_MANNER.HUMOROUS]: '유머러스',
  [TONE_AND_MANNER.ELEGANT]: '고급스러운',
  [TONE_AND_MANNER.CASUAL]: '캐주얼',
  [TONE_AND_MANNER.TRENDY]: '트렌디',
}

// 감정 강도
export const EMOTION_INTENSITY = {
  CALM: 'calm',
  NORMAL: 'normal',
  ENTHUSIASTIC: 'enthusiastic',
  EXCITING: 'exciting',
}

export const EMOTION_INTENSITY_LABELS = {
  [EMOTION_INTENSITY.CALM]: '차분함',
  [EMOTION_INTENSITY.NORMAL]: '보통',
  [EMOTION_INTENSITY.ENTHUSIASTIC]: '열정적',
  [EMOTION_INTENSITY.EXCITING]: '과장된',
}

// 프로모션 타입
export const PROMOTION_TYPES = {
  DISCOUNT: 'discount',
  EVENT: 'event',
  NEW_MENU: 'new_menu',
  NONE: 'none',
}

export const PROMOTION_TYPE_LABELS = {
  [PROMOTION_TYPES.DISCOUNT]: '할인 정보',
  [PROMOTION_TYPES.EVENT]: '이벤트 정보',
  [PROMOTION_TYPES.NEW_MENU]: '신메뉴 알림',
  [PROMOTION_TYPES.NONE]: '없음',
}

// 이미지 스타일
export const PHOTO_STYLES = {
  MODERN: 'modern',
  CLASSIC: 'classic',
  EMOTIONAL: 'emotional',
  MINIMALIST: 'minimalist',
}

export const PHOTO_STYLE_LABELS = {
  [PHOTO_STYLES.MODERN]: '모던',
  [PHOTO_STYLES.CLASSIC]: '클래식',
  [PHOTO_STYLES.EMOTIONAL]: '감성적',
  [PHOTO_STYLES.MINIMALIST]: '미니멀',
}

// 파일 업로드 제한
export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
}

// API 응답 상태
export const API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading',
  IDLE: 'idle',
}

// 페이지네이션
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
}

// 로컬 스토리지 키
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_INFO: 'user_info',
  APP_SETTINGS: 'app_settings',
  CONTENT_FILTERS: 'content_filters',
}

// 시간 관련 상수
export const TIME_FORMATS = {
  DATE: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  TIME: 'HH:mm',
}

export const DATE_RANGES = {
  TODAY: 'today',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
  ALL: 'all',
}

export const DATE_RANGE_LABELS = {
  [DATE_RANGES.TODAY]: '오늘',
  [DATE_RANGES.WEEK]: '최근 1주일',
  [DATE_RANGES.MONTH]: '최근 1개월',
  [DATE_RANGES.QUARTER]: '최근 3개월',
  [DATE_RANGES.YEAR]: '최근 1년',
  [DATE_RANGES.ALL]: '전체',
}
