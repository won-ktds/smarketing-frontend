/**
 * 데이터 포맷팅 유틸리티
 * 
 * @description 다양한 데이터 타입을 사용자 친화적인 형태로 포맷팅하는 함수들을 제공합니다.
 * @author AI Marketing Team
 * @version 1.0
 */

/**
 * 숫자를 통화 형식으로 포맷팅
 * @param {number} amount - 포맷팅할 금액
 * @param {string} currency - 통화 단위 (기본값: 'KRW')
 * @param {boolean} showSymbol - 통화 기호 표시 여부 (기본값: true)
 * @returns {string} 포맷팅된 통화 문자열
 */
export const formatCurrency = (amount, currency = 'KRW', showSymbol = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0원'
  }

  const formatter = new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })

  if (showSymbol) {
    return formatter.format(amount)
  } else {
    return amount.toLocaleString('ko-KR')
  }
}

/**
 * 큰 숫자를 축약된 형태로 포맷팅 (예: 1000 -> 1K)
 * @param {number} num - 포맷팅할 숫자
 * @param {number} digits - 소수점 자릿수 (기본값: 1)
 * @returns {string} 축약된 숫자 문자열
 */
export const formatAbbreviatedNumber = (num, digits = 1) => {
  if (num === null || num === undefined || isNaN(num)) {
    return '0'
  }

  const units = [
    { value: 1e9, symbol: 'B' },
    { value: 1e8, symbol: '억' },
    { value: 1e6, symbol: 'M' },
    { value: 1e4, symbol: '만' },
    { value: 1e3, symbol: 'K' }
  ]

  for (let unit of units) {
    if (Math.abs(num) >= unit.value) {
      return (num / unit.value).toFixed(digits) + unit.symbol
    }
  }

  return num.toString()
}

/**
 * 퍼센트를 포맷팅
 * @param {number} value - 퍼센트 값
 * @param {number} decimals - 소수점 자릿수 (기본값: 1)
 * @param {boolean} showSign - 부호 표시 여부 (기본값: false)
 * @returns {string} 포맷팅된 퍼센트 문자열
 */
export const formatPercentage = (value, decimals = 1, showSign = false) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%'
  }

  const sign = showSign && value > 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}

/**
 * 날짜를 한국어 형식으로 포맷팅
 * @param {Date|string} date - 포맷팅할 날짜
 * @param {string} format - 포맷 형식 ('full', 'date', 'time', 'datetime', 'relative')
 * @returns {string} 포맷팅된 날짜 문자열
 */
export const formatDate = (date, format = 'date') => {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) {
    return '잘못된 날짜'
  }

  const options = {
    full: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    },
    date: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    },
    time: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    datetime: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }
  }

  if (format === 'relative') {
    return formatRelativeTime(dateObj)
  }

  const formatOptions = options[format] || options.date
  return new Intl.DateTimeFormat('ko-KR', formatOptions).format(dateObj)
}

/**
 * 상대적 시간 포맷팅 (예: 2시간 전, 3일 후)
 * @param {Date|string} date - 기준 날짜
 * @param {Date} baseDate - 비교 기준 날짜 (기본값: 현재 시간)
 * @returns {string} 상대적 시간 문자열
 */
export const formatRelativeTime = (date, baseDate = new Date()) => {
  if (!date) return ''

  const dateObj = typeof date === 'string' ? new Date(date) : date
  const baseDateObj = typeof baseDate === 'string' ? new Date(baseDate) : baseDate

  if (isNaN(dateObj.getTime()) || isNaN(baseDateObj.getTime())) {
    return '잘못된 날짜'
  }

  const diffInSeconds = Math.floor((baseDateObj - dateObj) / 1000)
  const absDiff = Math.abs(diffInSeconds)

  const units = [
    { name: '년', seconds: 31536000 },
    { name: '개월', seconds: 2592000 },
    { name: '일', seconds: 86400 },
    { name: '시간', seconds: 3600 },
    { name: '분', seconds: 60 }
  ]

  for (let unit of units) {
    const interval = Math.floor(absDiff / unit.seconds)
    if (interval >= 1) {
      return diffInSeconds > 0 
        ? `${interval}${unit.name} 전`
        : `${interval}${unit.name} 후`
    }
  }

  return diffInSeconds > 0 ? '방금 전' : '곧'
}

/**
 * 날짜와 시간을 사용자 친화적 형식으로 포맷팅
 * @param {Date|string} dateTime - 포맷팅할 날짜시간
 * @returns {string} 포맷팅된 날짜시간 문자열
 */
export const formatDateTime = (dateTime) => {
  if (!dateTime) return ''

  const dateObj = typeof dateTime === 'string' ? new Date(dateTime) : dateTime
  
  if (isNaN(dateObj.getTime())) {
    return '잘못된 날짜'
  }

  const now = new Date()
  const diffInDays = Math.floor((now - dateObj) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) {
    // 오늘인 경우 시간만 표시
    return formatDate(dateObj, 'time')
  } else if (diffInDays === 1) {
    // 어제인 경우
    return `어제 ${formatDate(dateObj, 'time')}`
  } else if (diffInDays < 7) {
    // 일주일 이내인 경우
    const weekday = dateObj.toLocaleDateString('ko-KR', { weekday: 'short' })
    return `${weekday} ${formatDate(dateObj, 'time')}`
  } else {
    // 일주일 이상인 경우 전체 날짜 표시
    return formatDate(dateObj, 'datetime')
  }
}

/**
 * 파일 크기를 사람이 읽기 쉬운 형태로 포맷팅
 * @param {number} bytes - 파일 크기 (바이트)
 * @param {number} decimals - 소수점 자릿수 (기본값: 2)
 * @returns {string} 포맷팅된 파일 크기 문자열
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 B'
  if (!bytes) return ''

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

/**
 * 전화번호를 포맷팅
 * @param {string} phoneNumber - 전화번호 문자열
 * @returns {string} 포맷팅된 전화번호
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return ''

  // 숫자만 추출
  const numbers = phoneNumber.replace(/\D/g, '')

  // 휴대폰 번호 (010-xxxx-xxxx)
  if (numbers.length === 11 && numbers.startsWith('010')) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`
  }
  
  // 일반 전화번호 (02-xxx-xxxx 또는 03x-xxx-xxxx)
  if (numbers.length === 10) {
    if (numbers.startsWith('02')) {
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6)}`
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`
    }
  }

  if (numbers.length === 11 && !numbers.startsWith('010')) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`
  }

  return phoneNumber
}

/**
 * 사업자등록번호를 포맷팅
 * @param {string} businessNumber - 사업자등록번호
 * @returns {string} 포맷팅된 사업자등록번호
 */
export const formatBusinessNumber = (businessNumber) => {
  if (!businessNumber) return ''

  const numbers = businessNumber.replace(/\D/g, '')
  
  if (numbers.length === 10) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5)}`
  }

  return businessNumber
}

/**
 * 텍스트를 지정된 길이로 자르고 말줄임표 추가
 * @param {string} text - 자를 텍스트
 * @param {number} maxLength - 최대 길이
 * @param {string} suffix - 말줄임표 (기본값: '...')
 * @returns {string} 잘린 텍스트
 */
export const truncateText = (text, maxLength, suffix = '...') => {
  if (!text) return ''
  
  if (text.length <= maxLength) {
    return text
  }

  return text.slice(0, maxLength - suffix.length) + suffix
}

/**
 * 해시태그 배열을 문자열로 포맷팅
 * @param {Array} hashtags - 해시태그 배열
 * @param {string} separator - 구분자 (기본값: ' ')
 * @returns {string} 포맷팅된 해시태그 문자열
 */
export const formatHashtags = (hashtags, separator = ' ') => {
  if (!Array.isArray(hashtags) || hashtags.length === 0) {
    return ''
  }

  return hashtags
    .filter(tag => tag && tag.trim())
    .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
    .join(separator)
}

/**
 * 주소를 간단한 형태로 포맷팅
 * @param {string} fullAddress - 전체 주소
 * @param {boolean} showDetail - 상세 주소 표시 여부 (기본값: false)
 * @returns {string} 포맷팅된 주소
 */
export const formatAddress = (fullAddress, showDetail = false) => {
  if (!fullAddress) return ''

  const parts = fullAddress.split(' ')
  
  if (showDetail) {
    return fullAddress
  }

  // 시/도, 구/군만 표시
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[1]}`
  }

  return fullAddress
}

/**
 * 배열을 문자열로 포맷팅
 * @param {Array} array - 포맷팅할 배열
 * @param {string} separator - 구분자 (기본값: ', ')
 * @param {number} maxItems - 최대 표시 항목 수
 * @returns {string} 포맷팅된 문자열
 */
export const formatArrayToString = (array, separator = ', ', maxItems = null) => {
  if (!Array.isArray(array) || array.length === 0) {
    return ''
  }

  const items = maxItems ? array.slice(0, maxItems) : array
  const result = items.join(separator)

  if (maxItems && array.length > maxItems) {
    const remaining = array.length - maxItems
    return `${result} 외 ${remaining}개`
  }

  return result
}