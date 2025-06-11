//* src/utils/formatters.js
/**
 * 포맷팅 유틸리티 함수들
 */

/**
 * 통화 포맷 (한국 원화)
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₩0'
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * 숫자 포맷 (천 단위 콤마)
 */
export const formatNumber = (number) => {
  if (!number && number !== 0) return '0'
  return new Intl.NumberFormat('ko-KR').format(number)
}

/**
 * 퍼센트 포맷
 */
export const formatPercent = (value, decimals = 1) => {
  if (!value && value !== 0) return '0%'
  return `${parseFloat(value).toFixed(decimals)}%`
}

/**
 * 상대적 시간 포맷 (예: "30분 전", "2시간 전")
 */
export const formatRelativeTime = (date) => {
  if (!date) return ''

  const now = new Date()
  const targetDate = new Date(date)
  const diffInMs = now - targetDate
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) return '방금 전'
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`
  if (diffInHours < 24) return `${diffInHours}시간 전`
  if (diffInDays < 7) return `${diffInDays}일 전`

  return targetDate.toLocaleDateString('ko-KR')
}

/**
 * 날짜 포맷 (YYYY-MM-DD 형식)
 */
export const formatDate = (date, options = {}) => {
  if (!date) return ''

  const targetDate = new Date(date)
  const defaultOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }

  return targetDate.toLocaleDateString('ko-KR', { ...defaultOptions, ...options })
}

/**
 * 날짜시간 포맷 (YYYY-MM-DD HH:mm 형식)
 */
export const formatDateTime = (date, options = {}) => {
  if (!date) return ''

  const targetDate = new Date(date)
  const defaultOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }

  return targetDate.toLocaleString('ko-KR', { ...defaultOptions, ...options })
}

/**
 * 시간 포맷 (HH:mm 형식)
 */
export const formatTime = (date) => {
  if (!date) return ''

  const targetDate = new Date(date)
  return targetDate.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/**
 * 파일 크기 포맷
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * 전화번호 포맷
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return ''

  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/)

  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`
  }

  return phone
}

/**
 * 사업자등록번호 포맷
 */
export const formatBusinessNumber = (number) => {
  if (!number) return ''

  const cleaned = number.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{2})(\d{5})$/)

  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`
  }

  return number
}

/**
 * 해시태그 포맷 (#포함하여 문자열로 변환)
 */
export const formatHashtags = (hashtags) => {
  if (!hashtags || !Array.isArray(hashtags)) return ''

  return hashtags.map((tag) => (tag.startsWith('#') ? tag : `#${tag}`)).join(' ')
}

/**
 * 콘텐츠 미리보기 포맷 (길이 제한)
 */
export const formatContentPreview = (content, maxLength = 100) => {
  if (!content) return ''

  if (content.length <= maxLength) return content

  return content.substring(0, maxLength) + '...'
}

/**
 * 소셜미디어 URL 포맷
 */
export const formatSocialUrl = (username, platform) => {
  if (!username) return ''

  const urls = {
    instagram: `https://instagram.com/${username}`,
    facebook: `https://facebook.com/${username}`,
    twitter: `https://twitter.com/${username}`,
    youtube: `https://youtube.com/@${username}`,
    naver_blog: `https://blog.naver.com/${username}`,
  }

  return urls[platform] || username
}

/**
 * 성과 지표 포맷 (K, M 단위)
 */
export const formatMetric = (number) => {
  if (!number && number !== 0) return '0'

  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`
  }
  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}K`
  }

  return formatNumber(number)
}

/**
 * 진행률 포맷
 */
export const formatProgress = (current, total) => {
  if (!total || total === 0) return '0%'

  const percentage = (current / total) * 100
  return `${Math.round(percentage)}%`
}

/**
 * 이메일 마스킹 포맷
 */
export const formatEmailMask = (email) => {
  if (!email) return ''

  const [username, domain] = email.split('@')
  if (!domain) return email

  const maskedUsername =
    username.length > 2 ? username.substring(0, 2) + '*'.repeat(username.length - 2) : username

  return `${maskedUsername}@${domain}`
}

/**
 * 주소 간단 포맷
 */
export const formatAddressShort = (address) => {
  if (!address) return ''

  // 상세주소 제거하고 주요 정보만 표시
  const parts = address.split(' ')
  if (parts.length > 3) {
    return parts.slice(0, 3).join(' ') + '...'
  }

  return address
}

/**
 * 평점 포맷 (별점)
 */
export const formatRating = (rating, maxRating = 5) => {
  if (!rating && rating !== 0) return '☆'.repeat(maxRating)

  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0)

  return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars)
}

/**
 * 운영시간 포맷
 */
export const formatBusinessHours = (openTime, closeTime) => {
  if (!openTime || !closeTime) return '운영시간 미정'

  return `${formatTime(openTime)} - ${formatTime(closeTime)}`
}

/**
 * 나이 계산 및 포맷
 */
export const formatAge = (birthDate) => {
  if (!birthDate) return ''

  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()

  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return `${age}세`
}
