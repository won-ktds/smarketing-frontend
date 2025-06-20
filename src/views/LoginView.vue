//* src/views/LoginView.vue
<template>
  <v-container fluid class="login-container">
    <!-- 배경 패턴 -->
    <div class="login-background">
      <div class="bg-pattern pattern-1"></div>
      <div class="bg-pattern pattern-2"></div>
      <div class="bg-pattern pattern-3"></div>
      <div class="bg-pattern pattern-4"></div>
    </div>

    <v-row justify="center" align="center" class="main-row">
      <v-col cols="12" sm="10" md="8" lg="6" xl="4">
        <!-- 브랜드 섹션 -->
        <div class="brand-section">
          <div class="logo-wrapper">
            <v-img 
              src="/images/logo192.png" 
              alt="AI Marketing Logo"
              max-width="80"
              class="logo-image mx-auto"
            />
            <div class="logo-glow"></div>
          </div>
          
          <h1 class="brand-title">AI 마케팅</h1>
          <p class="brand-subtitle">소상공인을 위한 스마트 마케팅 솔루션</p>
        </div>

        <!-- 로그인 카드 -->
        <v-card class="login-card" elevation="0">
          <v-card-text class="card-content">
            <v-form v-model="isFormValid" ref="loginForm" @submit.prevent="handleLogin">
              <!-- 로그인 제목과 테스트 계정 버튼 -->
              <div class="login-header">
                <h2 class="login-title">로그인</h2>
                <v-btn
                  size="small"
                  variant="text"
                  color="info"
                  @click="showTestAccountHint"
                  class="hint-btn-header"
                >
                  💡 테스트 계정
                </v-btn>
              </div>

              <!-- 아이디 입력 -->
              <div class="input-group">
                <label class="input-label">아이디</label>
                <v-text-field
                  v-model="credentials.username"
                  prepend-inner-icon="mdi-account-outline"
                  variant="outlined"
                  :rules="usernameRules"
                  :error-messages="fieldErrors.username"
                  class="custom-input"
                  autocomplete="username"
                  @keyup.enter="handleLogin"
                  hide-details="auto"
                />
              </div>

              <!-- 비밀번호 입력 -->
              <div class="input-group">
                <label class="input-label">비밀번호</label>
                <v-text-field
                  v-model="credentials.password"
                  prepend-inner-icon="mdi-lock-outline"
                  :type="showPassword ? 'text' : 'password'"
                  :append-inner-icon="showPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                  variant="outlined"
                  :rules="passwordRules"
                  :error-messages="fieldErrors.password"
                  class="custom-input"
                  autocomplete="current-password"
                  @click:append-inner="showPassword = !showPassword"
                  @keyup.enter="handleLogin"
                  hide-details="auto"
                />
              </div>

              <!-- 로그인 옵션 -->
              <div class="login-options">
                <v-checkbox
                  v-model="rememberMe"
                  label="로그인 상태 유지"
                  density="compact"
                  hide-details
                  class="remember-checkbox"
                />
                <v-btn
                  variant="text"
                  size="small"
                  class="forgot-password-btn"
                  @click="showForgotPassword = true"
                >
                  비밀번호 찾기
                </v-btn>
              </div>

              <!-- 에러 메시지 -->
              <v-alert
                v-if="loginError"
                type="error"
                variant="tonal"
                class="error-alert"
                closable
                @click:close="loginError = ''"
              >
                <v-icon class="error-icon">mdi-alert-circle-outline</v-icon>
                {{ loginError }}
              </v-alert>

              <!-- 로그인 버튼 -->
              <v-btn
                type="submit"
                size="large"
                block
                :loading="authStore.isLoading"
                :disabled="!isFormValid || authStore.isLoading"
                class="login-btn"
              >
                <v-icon start>mdi-login</v-icon>
                로그인
              </v-btn>

              <!-- 회원가입 링크 -->
              <div class="signup-section">
                <span class="signup-text">아직 계정이 없으신가요?</span>
                <v-btn 
                  variant="text" 
                  class="signup-btn" 
                  @click="showSignup = true"
                >
                  회원가입
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 비밀번호 찾기 다이얼로그 -->
    <v-dialog v-model="showForgotPassword" max-width="400">
      <v-card class="forgot-password-card">
        <v-card-title class="dialog-title">
          <v-icon class="title-icon">mdi-key-variant</v-icon>
          비밀번호 찾기
        </v-card-title>
        <v-card-text class="dialog-content">
          <p class="dialog-text">등록하신 이메일 주소를 입력해주세요.</p>
          <v-text-field
            v-model="forgotEmail"
            label="이메일"
            type="email"
            variant="outlined"
            prepend-inner-icon="mdi-email-outline"
            class="dialog-input"
          />
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn variant="text" @click="showForgotPassword = false" class="cancel-btn">
            취소
          </v-btn>
          <v-btn @click="handleForgotPassword" class="submit-btn">
            <v-icon start>mdi-send</v-icon>
            전송
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 회원가입 다이얼로그 -->
    <v-dialog v-model="showSignup" max-width="600" persistent>
      <v-card class="signup-card">
        <v-card-title class="dialog-title">
          <div class="title-section">
            <v-icon class="title-icon">mdi-account-plus-outline</v-icon>
            <span>회원가입</span>
          </div>
          <v-btn 
            icon 
            variant="text" 
            @click="closeSignupDialog"
            class="close-btn"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-card-text class="dialog-content">
          <p class="welcome-text">AI 마케팅 서비스에 오신 것을 환영합니다!</p>
          
          <!-- 회원가입 폼 -->
          <v-form v-model="isSignupFormValid" ref="signupForm">
            <!-- 아이디 -->
            <div class="input-group">
              <label class="input-label">아이디</label>
              <v-text-field
                v-model="signupData.userId"
                placeholder="4자 이상의 아이디를 입력하세요"
                variant="outlined"
                :rules="signupUserIdRules"
                class="signup-input"
                hide-details="auto"
              />
            </div>
            
            <!-- 이메일 -->
            <div class="input-group">
              <label class="input-label">이메일</label>
              <v-text-field
                v-model="signupData.email"
                placeholder="example@email.com"
                type="email"
                variant="outlined"
                :rules="emailRules"
                class="signup-input"
                hide-details="auto"
              />
            </div>
            
            <!-- 비밀번호 -->
            <div class="input-group">
              <label class="input-label">비밀번호</label>
              <v-text-field
                v-model="signupData.password"
                placeholder="8자 이상, 영문+숫자+특수문자"
                type="password"
                variant="outlined"
                :rules="signupPasswordRules"
                class="signup-input"
                hint="영문, 숫자, 특수문자(@$!%*?&)를 모두 포함해야 합니다"
                persistent-hint
              />
            </div>
            
            <!-- 비밀번호 확인 -->
            <div class="input-group">
              <label class="input-label">비밀번호 확인</label>
              <v-text-field
                v-model="signupData.passwordConfirm"
                placeholder="비밀번호를 다시 입력하세요"
                type="password"
                variant="outlined"
                :rules="passwordConfirmRules"
                class="signup-input"
                hide-details="auto"
              />
            </div>
            
            <!-- 이름 -->
            <div class="input-group">
              <label class="input-label">이름</label>
              <v-text-field
                v-model="signupData.name"
                placeholder="이름을 입력하세요"
                variant="outlined"
                :rules="nameRules"
                class="signup-input"
                hide-details="auto"
              />
            </div>
            
            <!-- 사업자 번호 -->
            <div class="input-group">
              <label class="input-label">사업자번호 (선택사항)</label>
              <v-text-field
                v-model="signupData.businessNumber"
                placeholder="10자리 숫자를 입력하세요"
                variant="outlined"
                :rules="businessNumberRules"
                class="signup-input"
                hint="사업자등록증의 10자리 숫자를 입력해주세요"
                persistent-hint
              />
            </div>
            
            <!-- 에러/성공 메시지 -->
            <v-alert
              v-if="signupError"
              type="error"
              variant="tonal"
              class="signup-alert"
              closable
              @click:close="signupError = ''"
            >
              {{ signupError }}
            </v-alert>
            
            <v-alert
              v-if="signupSuccess"
              type="success"
              variant="tonal"
              class="signup-alert"
            >
              {{ signupSuccess }}
            </v-alert>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn @click="closeSignupDialog" class="cancel-btn">
            취소
          </v-btn>
          <v-btn 
            @click="handleSignup"
            :loading="signupLoading"
            :disabled="!canSignup"
            class="signup-submit-btn"
          >
            <v-icon start>mdi-account-plus</v-icon>
            가입하기
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 테스트 계정 스낵바 - 가운데 위치 -->
    <v-snackbar
      v-model="showTestSnackbar"
      :timeout="4000"
      color="info"
      location="center"
      class="test-snackbar-center"
    >
      <div class="snackbar-content-center">
        <v-icon start>mdi-information</v-icon>
        <div class="test-info">
          <div><strong>테스트 계정 정보</strong></div>
          <div>아이디: testuser1</div>
          <div>비밀번호: password123!</div>
        </div>
      </div>
      <template #actions>
        <v-btn variant="text" @click="fillTestAccountFromSnackbar" class="snackbar-btn">
          자동 입력
        </v-btn>
        <v-btn icon @click="showTestSnackbar = false" class="snackbar-close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useAppStore } from '@/store/app'
import { memberApi } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

// 로그인 관련 반응형 데이터
const loginForm = ref(null)
const isFormValid = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)
const loginError = ref('')
const showForgotPassword = ref(false)
const forgotEmail = ref('')

// 테스트 계정 관련
const showTestSnackbar = ref(false)

// 회원가입 관련 반응형 데이터
const showSignup = ref(false)
const signupForm = ref(null)
const isSignupFormValid = ref(false)
const signupLoading = ref(false)
const signupError = ref('')
const signupSuccess = ref('')
const checkingUserId = ref(false)
const checkingEmail = ref(false)
const userIdChecked = ref(false)
const emailChecked = ref(false)

// 로그인 자격 증명 - 빈 값으로 초기화
const credentials = ref({
  username: '',
  password: '',
})

// 회원가입 데이터 - 백엔드 검증 규칙에 맞는 기본값
const signupData = ref({
  userId: '',
  password: '',
  passwordConfirm: '',
  name: '',
  email: '',
  businessNumber: '',
})

const fieldErrors = ref({
  username: [],
  password: [],
})

// 개발 모드 여부
const isDev = ref(import.meta.env.DEV)

// 가입 가능 여부 computed
const canSignup = computed(() => {
  return isSignupFormValid.value && !signupLoading.value
})

// 로그인 유효성 검사 규칙
const usernameRules = [
  (v) => !!v || '아이디를 입력해주세요',
  (v) => (v && v.length >= 3) || '아이디는 3자 이상이어야 합니다',
]

const passwordRules = [
  (v) => !!v || '비밀번호를 입력해주세요',
  (v) => (v && v.length >= 6) || '비밀번호는 6자 이상이어야 합니다',
]

// 회원가입 유효성 검사 규칙 - 백엔드와 일치하도록 수정
const signupUserIdRules = [
  (v) => !!v || '아이디를 입력해주세요',
  (v) => (v && v.length >= 4) || '아이디는 4자 이상이어야 합니다',
  (v) => (v && v.length <= 20) || '아이디는 20자 이하여야 합니다',
  (v) => /^[a-zA-Z0-9]+$/.test(v) || '아이디는 영문과 숫자만 사용 가능합니다',
]

const signupPasswordRules = [
  (v) => !!v || '비밀번호를 입력해주세요',
  (v) => (v && v.length >= 8) || '비밀번호는 8자 이상이어야 합니다',
  (v) => (v && v.length <= 20) || '비밀번호는 20자 이하여야 합니다',
  (v) => /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/.test(v) || 
        '영문, 숫자, 특수문자(@$!%*?&)를 모두 포함해야 합니다',
]

const passwordConfirmRules = [
  (v) => !!v || '비밀번호 확인을 입력해주세요',
  (v) => v === signupData.value.password || '비밀번호가 일치하지 않습니다',
]

const nameRules = [
  (v) => !!v || '이름을 입력해주세요',
  (v) => (v && v.length >= 2) || '이름은 2자 이상이어야 합니다',
  (v) => (v && v.length <= 50) || '이름은 50자 이하여야 합니다',
]

const emailRules = [
  (v) => !!v || '이메일을 입력해주세요',
  (v) => /.+@.+\..+/.test(v) || '올바른 이메일 형식이 아닙니다',
  (v) => (v && v.length <= 100) || '이메일은 100자 이하여야 합니다',
]

const businessNumberRules = [
  (v) => !v || (v.length === 10 && /^\d{10}$/.test(v)) || '사업자번호는 10자리 숫자여야 합니다',
]

// 테스트 계정 관련 메서드
const showTestAccountHint = () => {
  showTestSnackbar.value = true
}

const fillTestAccountFromSnackbar = () => {
  credentials.value.username = 'testuser1'
  credentials.value.password = 'password123!'
  loginError.value = ''
  showTestSnackbar.value = false
  appStore.showSnackbar('테스트 계정이 입력되었습니다', 'success')
}

// 로그인 관련 메서드
const handleLogin = async () => {
  if (!isFormValid.value) return

  if (!credentials.value.username || !credentials.value.password) {
    loginError.value = '아이디와 비밀번호를 모두 입력해주세요'
    return
  }

  loginError.value = ''
  fieldErrors.value = { username: [], password: [] }

  try {
    const result = await authStore.login({
      username: credentials.value.username.trim(),
      password: credentials.value.password.trim(),
    })

    if (result.success) {
      appStore.showSnackbar('로그인되었습니다', 'success')
      router.push('/dashboard')
    } else {
      loginError.value = result.error || '로그인에 실패했습니다'
    }
  } catch (error) {
    console.error('로그인 에러:', error)
    loginError.value = '로그인 실패: ' + (error.message || '서버 오류가 발생했습니다')
  }
}

const handleForgotPassword = () => {
  appStore.showSnackbar('비밀번호 재설정 이메일을 발송했습니다', 'info')
  showForgotPassword.value = false
  forgotEmail.value = ''
}

// 회원가입 관련 메서드 - 백엔드에 맞게 수정
const handleSignup = async () => {
  console.log('회원가입 시도 시작')
  console.log('가입 데이터:', signupData.value)
  
  if (!canSignup.value) {
    signupError.value = '모든 필드를 올바르게 입력해주세요'
    return
  }

  signupLoading.value = true
  signupError.value = ''
  signupSuccess.value = ''

  try {
    const requestData = {
      userId: signupData.value.userId,
      password: signupData.value.password,
      name: signupData.value.name,
      email: signupData.value.email
    }
    
    // 사업자번호가 입력되었고 유효한 경우에만 추가
    if (signupData.value.businessNumber && signupData.value.businessNumber.length === 10) {
      requestData.businessNumber = signupData.value.businessNumber
    }
    
    console.log('회원가입 요청 데이터:', requestData)
    
    const response = await memberApi.post('/register', requestData)
    
    console.log('회원가입 응답:', response.data)

    if (response.data.status === 200 || response.data.message?.includes('완료')) {
      signupSuccess.value = '회원가입이 완료되었습니다!'
      appStore.showSnackbar('회원가입이 완료되었습니다!', 'success')
      
      setTimeout(() => {
        closeSignupDialog()
      }, 2000)
    } else {
      signupError.value = response.data.message || '회원가입에 실패했습니다'
    }
  } catch (error) {
    console.error('회원가입 에러:', error)
    
    if (error.response?.status === 400) {
      const errorData = error.response.data
      if (errorData.errors && Array.isArray(errorData.errors)) {
        const errorMessages = errorData.errors.map(err => err.message || err).join(', ')
        signupError.value = errorMessages
      } else {
        signupError.value = errorData.message || '입력값 검증에 실패했습니다.'
      }
    } else {
      signupError.value = error.response?.data?.message || '회원가입에 실패했습니다.'
    }
  } finally {
    signupLoading.value = false
  }
}

// 폼 초기화 함수
const closeSignupDialog = () => {
  showSignup.value = false
  
  // 폼 초기화
  signupData.value = {
    userId: '',
    password: '',
    passwordConfirm: '',
    name: '',
    email: '',
    businessNumber: '',
  }
  
  signupError.value = ''
  signupSuccess.value = ''
  userIdChecked.value = false
  emailChecked.value = false
  
  // 폼 validation 초기화
  if (signupForm.value) {
    signupForm.value.resetValidation()
  }
}

onMounted(() => {
  console.log('로그인 페이지 마운트됨')
})
</script>

<style scoped>
/* 메인 컨테이너 */
.login-container {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, 
    #667eea 0%, 
    #764ba2 25%, 
    #f093fb 50%, 
    #f5576c 75%, 
    #4facfe 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 배경 패턴 */
.login-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.bg-pattern {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  animation: float 6s ease-in-out infinite;
}

.pattern-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.pattern-2 {
  width: 150px;
  height: 150px;
  top: 20%;
  right: 20%;
  animation-delay: 2s;
}

.pattern-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

.pattern-4 {
  width: 120px;
  height: 120px;
  bottom: 10%;
  right: 10%;
  animation-delay: 1s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

/* 메인 로우 */
.main-row {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding: 2rem 0;
}

/* 브랜드 섹션 */
.brand-section {
  margin-bottom: 3rem;
  text-align: center;
}

.logo-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 1.5rem;
}

.logo-image {
  position: relative;
  z-index: 2;
  border-radius: 50%;
  box-shadow: 0 8px 32px rgba(255, 255, 255, 0.3);
}

.logo-glow {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3), transparent 70%);
  border-radius: 50%;
  z-index: 1;
  animation: glow 3s ease-in-out infinite alternate;
}

@keyframes glow {
  from { opacity: 0.5; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1.05); }
}

.brand-title {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #ffffff, #f0f8ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  text-shadow: 0 4px 20px rgba(255, 255, 255, 0.3);
}

.brand-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

/* 로그인 카드 */
.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.15);
}

.card-content {
  padding: 3rem;
}

.login-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

/* 입력 필드 */
.input-group {
  margin-bottom: 1.5rem;
}

.input-label {
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.custom-input :deep(.v-field) {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.custom-input :deep(.v-field--focused) {
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.custom-input :deep(.v-field__input) {
  padding: 1rem 1.2rem;
  font-size: 1rem;
}

.custom-input :deep(.v-field__input::placeholder) {
  color: rgba(0, 0, 0, 0.4) !important;
  font-style: italic;
}

/* 로그인 옵션 */
.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.remember-checkbox :deep(.v-label) {
  color: #6b7280;
  font-size: 0.9rem;
}

.forgot-password-btn {
  color: #667eea;
  font-weight: 600;
  text-transform: none;
}

.forgot-password-btn:hover {
  background: rgba(102, 126, 234, 0.1);
}

/* 로그인 헤더 */
.login-header {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2rem;
}

.login-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

.hint-btn-header {
  position: absolute;
  right: 0;
  color: #667eea;
  font-weight: 500;
  text-transform: none;
  border-radius: 12px;
  font-size: 0.85rem;
  padding: 0.4rem 0.8rem;
}

.hint-btn-header:hover {
  background: rgba(102, 126, 234, 0.1);
}

/* 에러 알림 */
.error-alert {
  margin-bottom: 1.5rem;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-icon {
  margin-right: 0.5rem;
}

/* 로그인 버튼 */
.login-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 16px;
  height: 56px;
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: none;
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.3);
  margin-bottom: 2rem;
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4);
}

.login-btn:active {
  transform: translateY(0px);
}

/* 회원가입 섹션 */
.signup-section {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.signup-text {
  color: #6b7280;
  font-size: 0.95rem;
}

.signup-btn {
  color: #667eea;
  font-weight: 700;
  text-transform: none;
  border-radius: 12px;
}

.signup-btn:hover {
  background: rgba(102, 126, 234, 0.1);
}

/* 다이얼로그 스타일 */
.forgot-password-card,
.signup-card {
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
}

.dialog-title {
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border-radius: 20px 20px 0 0;
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  color: #1a202c;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.title-icon {
  color: #667eea;
  font-size: 1.5rem;
}

.close-btn {
  color: #6b7280;
}

.dialog-content {
  padding: 2rem;
}

.dialog-text {
  color: #4a5568;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.welcome-text {
  color: #4a5568;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  text-align: center;
  font-size: 1rem;
}

.dialog-input,
.signup-input {
  border-radius: 12px;
}

.dialog-input :deep(.v-field),
.signup-input :deep(.v-field) {
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.dialog-actions {
  padding: 1rem 2rem 2rem;
  gap: 1rem;
}

.cancel-btn {
  color: #6b7280;
  text-transform: none;
}

.submit-btn,
.signup-submit-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  text-transform: none;
  border-radius: 12px;
  font-weight: 600;
}

.submit-btn:hover,
.signup-submit-btn:hover {
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
}

.signup-alert {
  margin-top: 1rem;
  border-radius: 12px;
}

/* 스낵바 스타일 - 가운데 위치 */
.test-snackbar-center {
  backdrop-filter: blur(10px);
}

.test-snackbar-center :deep(.v-snackbar__wrapper) {
  min-width: 320px;
  background: rgba(33, 150, 243, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(33, 150, 243, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.snackbar-content-center {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.test-info {
  line-height: 1.4;
}

.test-info > div:first-child {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.test-info > div:not(:first-child) {
  font-size: 0.9rem;
  opacity: 0.95;
}

.snackbar-btn {
  color: white;
  font-weight: 600;
}

.snackbar-close {
  color: white;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .card-content {
    padding: 2rem 1.5rem;
  }
  
  .brand-title {
    font-size: 2.5rem;
  }
  
  .brand-subtitle {
    font-size: 1rem;
  }
  
  .dialog-content {
    padding: 1.5rem;
  }
  
  .main-row {
    padding: 1rem 0;
  }
}

@media (max-width: 480px) {
  .card-content {
    padding: 1.5rem 1rem;
  }
  
  .brand-title {
    font-size: 2rem;
  }
  
  .login-title {
    font-size: 1.5rem;
  }
}
</style>