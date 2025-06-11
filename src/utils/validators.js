/**
 * 유효성 검증 유틸리티
 * 
 * @description 다양한 입력값의 유효성을 검증하는 함수들을 제공합니다.
 * @author AI Marketing Team
 * @version 1.0
 */

/**
 * 필수 입력값 검증
 * @param {any} value - 검증할 값
 * @param {string} fieldName - 필드명 (에러 메시지용)
 * @returns {boolean|string} 유효하면 true, 유효하지 않으면 에러 메시지
 */
export const validateRequired = (value, fieldName = '필드') => {
  if (value === null || value === undefined || value === '') {
    return `${fieldName}은(는) 필수 입력항목입니다.`
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return `${fieldName}을(를) 입력해주세요.`
  }
  
  if (Array.isArray(value) && value.length === 0) {
    return `${fieldName}을(를) 선택해주세요.`
  }
  
  return true
}

/**
 * 이메일 형식 검증
 * @param {string} email - 검증할 이메일
 * @returns {boolean|string} 유효하면 true, 유효하지 않으면 에러 메시지
 */
export const validateEmail = (email) => {
  if (!email) return '이메일을 입력해주세요.'
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(email)) {
    return '올바른 이메일 형식이 아닙니다.'
  }
  
  return true
}

/**
 * 비밀번호 강도 검증
 * @param {string} password - 검증할 비밀번호
 * @param {Object} options - 검증 옵션
 * @returns {boolean|string} 유효하면 true, 유효하지 않으면 에러 메시지
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    maxLength = 50,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true
  } = options
  
  if (!password) {
    return '비밀번호를 입력해주세요.'
  }
  
  if (password.length < minLength) {
    return `비밀번호는 최소 ${minLength}자 이상이어야 합니다.`
  }
  
  if (password.length > maxLength) {
    return `비밀번호는 최대 ${maxLength}자까지 가능합니다.`
  }
  
  if (requireUppercase && !/[A-Z]/.test(password)) {
    return '비밀번호에 대문자가 포함되어야 합니다.'
  }
  
  if (requireLowercase && !/[a-z]/.test(password)) {
    return '비밀번호에 소문자가 포함되어야 합니다.'
  }
  
  if (requireNumbers && !/\d/.test(password)) {
    return '비밀번호에 숫자가 포함되어야 합니다.'
  }
  
  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return '비밀번호에 특수문자가 포함되어야 합니다.'
  }
  
  return true
}

/**
 * 비밀번호 확인 검증
 * @param {string} password - 원본 비밀번호
 * @param {string} confirmPassword - 확인 비밀번호
 * @returns {boolean|string} 유효하면 true, 유효하지 않으면 에러 메시지
 */
export const validatePasswordConfirm = (password, confirmPassword) => {
  if (!confirmPassword) {
    return '비밀번호 확인을 입력해주세요.'
  }
  
  if (password !== confirmPassword) {
    return '비밀번호가 일치하지 않습니다.'
  }
  
  return true
}

/**
 * 전화번호 형식 검증
 * @param {string} phoneNumber - 검증할 전화번호
 * @returns {boolean|string} 유효하면 true, 유효하지 않으면 에러 메시지
 */
export const validatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) {
    return '전화번호를 입력해주세요.'
  }
  
  // 숫자만 추출
  const numbers = phoneNumber.replace(/\D/g, '')
  
  // 휴대폰 번호 (010-xxxx-xxxx)
  const mobileRegex = /^010\d{8}$/
  // 일반 전화번호 (02-xxx-xxxx, 03x-xxx-xxxx 등)
  const landlineRegex = /^(02|0[3-9]\d)\d{7,8}$/
  
  if (!mobileRegex.test(numbers) && !landlineRegex.test(numbers)) {
    return '올바른 전화번호 형식이 아닙니다.'
  }
  
  return true
}

/**
 * 사업자등록번호 검증
 * @param {string} businessNumber - 검증할 사업자등록번호
 * @returns {boolean|string} 유효하면 true, 유효하지 않으면 에러 메시지
 */
export const validateBusinessNumber = (businessNumber) => {
  if (!businessNumber) {
    return '사업자등록번호를 입력해주세요.'
  }
  
  const numbers = businessNumber.replace(/\D/g, '')
  
  if (numbers.length !== 10) {
    return '사업자등록번호는 10자리 숫자여야 합니다.'
  }
  
  // 사업자등록번호 체크섬 검증
  const checkSum = [1, 3, 7, 1, 3, 7, 1, 3, 5]
  let sum = 0
  
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * checkSum[i]
  }
  
  sum += parseInt((parseInt(numbers[8]) * 5) / 10)
  const remainder = (10 - (sum % 10)) % 10
  
  if (remainder !== parseInt(numbers[9])) {
    return '올바르지 않은 사업자등록번호입니다.'
  }
  
  return true
}

/**
 * 문자열 길이 검증
 * @param {string} value - 검증할 문자열
 * @param {number} minLength - 최소 길이
 * @param {number} maxLength - 최대 길이
 * @param {string} fieldName - 필드명
 * @returns {boolean|string} 유효하면 true, 유효하지 않으면 에러 메시지
 */
export const validateLength = (value, minLength, maxLength, fieldName = '입력값') => {
  if (!value) {
    return `${fieldName}을(를) 입력해주세요.`
  }
  
  if (value.length < minLength) {
    return `${fieldName}은(는) 최소 ${minLength}자 이상이어야 합니다.`
  }
  
  if (value.length > maxLength) {
    return `${fieldName}은(는) 최대 ${maxLength}자까지 가능합니다.`
  }
  
  return true
}

/**
 * 숫자 범위 검증
 * @param {number} value - 검증할 숫자
 * @param {number} min - 최소값
 * @param {number} max - 최대값
 * @param {string} fieldName - 필드명
 * @returns {boolean|string} 유효하면 true, 유효하지 않으면 에러 메시지
 */
export const validateNumberRange = (value, min, max, fieldName = '숫자') => {
  if (value === null || value === undefined || value === '') {
    return `${fieldName}을(를) 입력해주세요.`
  }
  
  const numValue = Number(value)
  
  if (isNaN(numValue)) {
    return `${fieldName}은(는) 숫자여야 합니다.`
  }
  
  if (numValue < min) {
    return `${fieldName}은(는) ${min} 이상이어야 합니다.`
  }
  
  if (numValue > max) {
    return `${fieldName}은(는) ${max} 이하여야 합니다.`
  }
  
  return true
}

/**
 * 양의 정수 검증
 * @param {any} value - 검증할 값
 * @param {string} fieldName - 필드명
 * @returns {boolean|string} 유효하면 true, 유효하지 않으면 에러 메시지
 */
export const validatePositiveInteger = (value, fieldName = '숫자') => {
  if (value === null || value === undefined || value === '') {
    return `${fieldName}을(를) 입력해주세요.`
  }
  
  const numValue = Number(value)
  
  if (isNaN(numValue) || !Number.isInteger(numValue) || numValue <= 0) {
    return `${fieldName}은(는) 양의 정수여야 합니다.`
  }
  
  return true
}

/**
 * 파일 크기 검증
 * @param {File} file - 검증할 파일
 * @param {number} maxSize - 최대 크기 (바이트)
 * @returns {boolean|string} 유효하면 true, 유효하지 않으면 에러 메시지
 */
export const validateFileSize = (file, maxSize) => {
  if (!file) {
    return '파일을 선택해주세요.'
  }
  
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024))
    return `파일 크기는 ${maxSizeMB}MB 이하여야 합니다.`
  }
  
  return true
}

/**
 * 파일 형식 검증
 * @param {File} file - 검증할 파일
 * @param {Array} allowedTypes - 허용된 MIME 타입 배열
 * @returns {boolean|string} 유효하면 true, 유효하지 않으면 에러 메시지
 */
export const validateFileType = (file, allowedTypes) => {
  if (!file) {
    return '파일을 선택해주세요.'
  }
  
  if (!allowedTypes.includes(file.type)) {
    const allowedExtensions = allowedTypes
      .map(type => type.split('/')[1])
      .join(', ')
    return `허용된 파일 형식: ${allowedExtensions}`
  }
  
  return true
}

/**
 * 이미지 파일 검증
 * @param {File} file - 검증할 파일
 * @param {number} maxSize - 최대 크기 (기본값: 10MB)
 * @returns {boolean|string} 유효하면 true, 유효하지 않으면 에러 메시지
 */
export const validateImageFile = (file, maxSize = 10 * 1024 * 1024) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  
  const sizeValidation = validateFileSize(file, maxSize)
  if (sizeValidation !== true) return sizeValidation
  
  const typeValidation = validateFileType(file, allowedTypes)
  if (typeValidation !== true) return typeValidation
  
  return true
}

/**
 * URL 형식 검증
 * @param {string} url - 검증할 URL
 * @param {boolean} requireProtocol - 프로토콜 필수 여부 (기본값: true)
 * @returns {boolean|string} 유효하면 true, 유효하지 않으면 에러 메시지
 */
export const validateUrl = (url, requireProtocol = true) => {
  if (!url) {
    return 'URL을 입력해주세요.'
  }
  
  try {
    const urlObj = new URL(url)
    
    if (requireProtocol && !['http:', 'https:'].includes(urlObj.protocol)) {
      return 'http 또는 https 프로토콜을 사용해주세요.'
    }
    
    return true
  } catch (error) {
    return '올바른 URL 형식이 아닙니다.'
  }
}

/**
 * 날짜 형식 검증
 * @param {string} dateString - 검증할 날짜 문자열
 * @param {string} format - 예상 형식 (기본값: 'YYYY-MM-DD')
 * @returns {boolean|string} 유효하면 true, 유효하지 않으면 에러 메시지
 */
export const validateDate = (dateString, format = 'YYYY-MM-DD') => {
  if (!dateString) {
    return '날짜를 입력해주세요.'
  }
  
  const date = new Date(dateString)
  
  if (isNaN(date.getTime())) {
    return '올바른 날짜 형식이 아닙니다.'
  }
  
  return true
}

/**
 * 날짜 범위 검증
 * @param {string} startDate - 시작 날짜
 * @param {string} endDate - 종료 날짜
 * @returns {boolean|string} 유효하면 true, 유효하지 않으면 에러 메시지
 */
export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return '시작날짜와 종료날짜를 모두 입력해주세요.'
  }
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return '올바른 날짜 형식이 아닙니다.'
  }
  
  if (start > end) {
    return '시작날짜는 종료날짜보다 이전이어야 합니다.'
  }
  
  return true
}

/**
 * 한국어만 허용하는 검증
 * @param {string} value - 검증할 문자열
 * @param {string} fieldName - 필드명
 * @returns {boolean|string} 유효하면 true, 유효하지 않으면 에러 메시지
 */
export const validateKoreanOnly = (value, fieldName = '입력값') => {
  if (!value) {
    return `${fieldName}을(를) 입력해주세요.`
  }
  
  const koreanRegex = /^[가-힣\s]+$/
  
  if (!koreanRegex.test(value)) {
    return `${fieldName}은(는) 한글만 입력 가능합니다.`
  }
  
  return true
}

/**
 * 영문과 숫자만 허용하는 검증
 * @param {string} value - 검증할 문자열
 * @param {string} fieldName - 필드명
 * @returns {boolean|string} 유효하면 true, 유효하지 않으면 에러 메시지
 */
export const validateAlphanumeric = (value, fieldName = '입력값') => {
  if (!value) {
    return `${fieldName}을(를) 입력해주세요.`
  }
  
  const alphanumericRegex = /^[a-zA-Z0-9]+$/
  
  if (!alphanumericRegex.test(value)) {
    return `${fieldName}은(는) 영문과 숫자만 입력 가능합니다.`
  }
  
  return true
}

/**
 * 배열의 최소/최대 항목 수 검증
 * @param {Array} array - 검증할 배열
 * @param {number} min - 최소 항목 수
 * @param {number} max - 최대 항목 수
 * @param {string} fieldName - 필드명
 * @returns {boolean|string} 유효하면 true, 유효하지 않으면 에러 메시지
 */
export const validateArrayLength = (array, min, max, fieldName = '항목') => {
  if (!Array.isArray(array)) {
    return `${fieldName}을(를) 선택해주세요.`
  }
  
  if (array.length < min) {
    return `${fieldName}은(는) 최소 ${min}개 이상 선택해야 합니다.`
  }
  
  if (array.length > max) {
    return `${fieldName}은(는) 최대 ${max}개까지 선택 가능합니다.`
  }
  
  return true
}

/**
 * 해시태그 형식 검증
 * @param {string} hashtag - 검증할 해시태그
 * @returns {boolean|string} 유효하면 true, 유효하지 않으면 에러 메시지
 */
export const validateHashtag = (hashtag) => {
  if (!hashtag) {
    return '해시태그를 입력해주세요.'
  }
  
  // #으로 시작하고 공백이 없어야 함
  const hashtagRegex = /^#[a-zA-Z가-힣0-9_]+$/
  
  if (!hashtagRegex.test(hashtag)) {
    return '해시태그는 #으로 시작하고 공백 없이 작성해주세요.'
  }
  
  if (hashtag.length > 50) {
    return '해시태그는 50자를 초과할 수 없습니다.'
  }
  
  return true
}

/**
 * 여러 검증 규칙을 순차적으로 실행
 * @param {any} value - 검증할 값
 * @param {Array} validators - 검증 함수 배열
 * @returns {boolean|string} 모든 검증을 통과하면 true, 실패하면 첫 번째 에러 메시지
 */
export const validateMultiple = (value, validators) => {
  for (const validator of validators) {
    const result = validator(value)
    if (result !== true) {
      return result
    }
  }
  return true
}

/**
 * 객체의 여러 필드를 한번에 검증
 * @param {Object} data - 검증할 데이터 객체
 * @param {Object} rules - 검증 규칙 객체 { fieldName: [validators] }
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validateForm = (data, rules) => {
  const errors = {}
  let isValid = true
  
  for (const [fieldName, validators] of Object.entries(rules)) {
    const value = data[fieldName]
    const result = validateMultiple(value, validators)
    
    if (result !== true) {
      errors[fieldName] = result
      isValid = false
    }
  }
  
  return { isValid, errors }
}

/**
 * 실시간 검증을 위한 디바운스된 검증 함수 생성
 * @param {Function} validator - 검증 함수
 * @param {number} delay - 지연 시간 (기본값: 300ms)
 * @returns {Function} 디바운스된 검증 함수
 */
export const createDebouncedValidator = (validator, delay = 300) => {
  let timeoutId
  
  return (value, callback) => {
    clearTimeout(timeoutId)
    
    timeoutId = setTimeout(() => {
      const result = validator(value)
      callback(result)
    }, delay)
  }
}