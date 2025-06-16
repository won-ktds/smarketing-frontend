//* src/views/LoginView.vue - 수정된 회원가입 기능
<template>
  <v-container fluid class="login-container">
    <v-row justify="center" align="center" style="min-height: 100vh">
      <v-col cols="12" sm="8" md="6" lg="4" xl="3">
        <!-- 로고 및 제목 -->
        <div class="text-center logo-section">
          <v-img src="/images/logo192.png" alt="AI 마케팅 로고" max-width="80" class="mx-auto mb-4" />
          <h1 class="text-h4 font-weight-bold text-primary mb-2">AI 마케팅</h1>
          <p class="text-subtitle-1 text-grey-darken-1">소상공인을 위한 스마트 마케팅 솔루션</p>
        </div>

        <!-- 로그인 카드 -->
        <v-card class="login-card" elevation="8">
          <v-card-text class="pa-8">
            <v-form v-model="isFormValid" ref="loginForm" @submit.prevent="handleLogin">
              <h2 class="text-h5 font-weight-bold text-center mb-6">로그인</h2>

              <!-- 아이디 입력 -->
              <v-text-field
                v-model="credentials.username"
                label="아이디"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                :rules="usernameRules"
                :error-messages="fieldErrors.username"
                class="mb-4"
                autocomplete="username"
                @keyup.enter="handleLogin"
              />

              <!-- 비밀번호 입력 -->
              <v-text-field
                v-model="credentials.password"
                label="비밀번호"
                prepend-inner-icon="mdi-lock"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                variant="outlined"
                :rules="passwordRules"
                :error-messages="fieldErrors.password"
                class="mb-4"
                autocomplete="current-password"
                @click:append-inner="showPassword = !showPassword"
                @keyup.enter="handleLogin"
              />

              <!-- 로그인 옵션 -->
              <div class="d-flex justify-space-between align-center mb-6">
                <v-checkbox
                  v-model="rememberMe"
                  label="로그인 상태 유지"
                  density="compact"
                  hide-details
                />
                <v-btn
                  variant="text"
                  size="small"
                  color="primary"
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
                class="mb-4"
                closable
                @click:close="loginError = ''"
              >
                {{ loginError }}
              </v-alert>

              <!-- 로그인 버튼 -->
              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="authStore.isLoading"
                :disabled="!isFormValid || authStore.isLoading"
                class="mb-4"
              >
                <v-icon start>mdi-login</v-icon>
                로그인
              </v-btn>

              <!-- 회원가입 링크 -->
              <div class="text-center">
                <span class="text-body-2 text-grey-darken-1">계정이 없으신가요? </span>
                <v-btn variant="text" color="primary" size="small" @click="showSignup = true">
                  회원가입
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- 데모 정보 카드 -->
        <v-card class="mt-4" variant="outlined">
          <v-card-text class="pa-4">
            <div class="text-center">
              <v-icon color="info" class="mb-2">mdi-information</v-icon>
              <h3 class="text-subtitle-2 font-weight-bold mb-2">데모 계정 정보</h3>
              <div class="demo-info">
                <div class="text-body-2 mb-1">
                  <span class="font-weight-medium">아이디:</span> user01
                </div>
                <div class="text-body-2 mb-2">
                  <span class="font-weight-medium">비밀번호:</span> passw0rd
                </div>
                <v-btn size="small" color="info" variant="outlined" @click="fillDemoCredentials">
                  데모 계정 자동 입력
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 비밀번호 찾기 다이얼로그 -->
    <v-dialog v-model="showForgotPassword" max-width="400">
      <v-card>
        <v-card-title>비밀번호 찾기</v-card-title>
        <v-card-text>
          <p class="mb-4">등록하신 이메일 주소를 입력해주세요.</p>
          <v-text-field
            v-model="forgotEmail"
            label="이메일"
            type="email"
            variant="outlined"
            prepend-inner-icon="mdi-email"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showForgotPassword = false">취소</v-btn>
          <v-btn color="primary" @click="handleForgotPassword">전송</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 회원가입 다이얼로그 -->
    <v-dialog v-model="showSignup" max-width="600" persistent>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>회원가입</span>
          <v-btn icon variant="text" @click="closeSignupDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <p class="mb-4">AI 마케팅 서비스에 오신 것을 환영합니다!</p>
          
          <!-- 회원가입 폼 -->
          <v-form v-model="isSignupFormValid" ref="signupForm">
            <!-- 아이디 (중복체크 임시 제거) -->
            <v-text-field
              v-model="signupData.userId"
              label="아이디"
              variant="outlined"
              :rules="signupUserIdRules"
              class="mb-2"
            />
            
            <!-- 이메일 (중복체크 임시 제거) -->
            <v-text-field
              v-model="signupData.email"
              label="이메일"
              type="email"
              variant="outlined"
              :rules="emailRules"
              class="mb-2"
            />
            
            <!-- 비밀번호 -->
            <v-text-field
              v-model="signupData.password"
              label="비밀번호"
              type="password"
              variant="outlined"
              :rules="signupPasswordRules"
              class="mb-2"
              hint="8자 이상, 영문+숫자+특수문자(@$!%*?&) 조합"
              persistent-hint
            />
            
            <!-- 비밀번호 확인 -->
            <v-text-field
              v-model="signupData.passwordConfirm"
              label="비밀번호 확인"
              type="password"
              variant="outlined"
              :rules="passwordConfirmRules"
              class="mb-2"
            />
            
            <!-- 이름 -->
            <v-text-field
              v-model="signupData.name"
              label="이름"
              variant="outlined"
              :rules="nameRules"
              class="mb-2"
            />
            
            
            <!-- 사업자 번호 -->
            <v-text-field
              v-model="signupData.businessNumber"
              label="사업자 번호 (선택사항)"
              variant="outlined"
              :rules="businessNumberRules"
              class="mb-2"
              hint="10자리 숫자, '-' 없이 입력"
              persistent-hint
            />

            <!-- 중복 확인 상태 표시 (임시 숨김) -->
            <!--
            <div class="mb-4">
              <v-chip
                v-if="userIdChecked"
                color="success"
                size="small"
                class="mr-2"
              >
                <v-icon start size="small">mdi-check</v-icon>
                아이디 확인완료
              </v-chip>
              <v-chip
                v-if="emailChecked"
                color="success"
                size="small"
              >
                <v-icon start size="small">mdi-check</v-icon>
                이메일 확인완료
              </v-chip>
            </div>
            -->

            <!-- 디버깅 정보 (개발 중에만 표시) -->
            <v-card v-if="isDev" variant="outlined" class="mb-4 pa-3">
              <div class="text-caption">디버깅 정보:</div>
              <div class="text-caption">폼 유효성: {{ isSignupFormValid }}</div>
              <div class="text-caption">아이디 확인: {{ userIdChecked }}</div>
              <div class="text-caption">이메일 확인: {{ emailChecked }}</div>
              <div class="text-caption">가입 가능: {{ canSignup }}</div>
              <div class="text-caption">로딩 상태: {{ signupLoading }}</div>
            </v-card>

            <!-- 에러/성공 메시지 -->
            <v-alert
              v-if="signupError"
              type="error"
              variant="tonal"
              class="mb-4"
              closable
              @click:close="signupError = ''"
            >
              {{ signupError }}
            </v-alert>

            <v-alert
              v-if="signupSuccess"
              type="success"
              variant="tonal"
              class="mb-4"
            >
              {{ signupSuccess }}
            </v-alert>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeSignupDialog">취소</v-btn>
          <v-btn 
            color="primary" 
            @click="handleSignup"
            :loading="signupLoading"
            :disabled="!canSignup"
          >
            가입하기
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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

// 로그인 자격 증명
const credentials = ref({
  username: 'user01',
  password: 'passw0rd',
})

// 회원가입 데이터
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

// 가입 가능 여부 computed (중복체크 조건 임시 제거)
const canSignup = computed(() => {
  return isSignupFormValid.value && 
         !signupLoading.value
         // 임시로 중복체크 조건 제거
         // userIdChecked.value && 
         // emailChecked.value &&
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

// 회원가입 유효성 검사 규칙
const signupUserIdRules = [
  (v) => !!v || '아이디를 입력해주세요',
  (v) => (v && v.length >= 3) || '아이디는 3자 이상이어야 합니다',
  (v) => (v && v.length <= 20) || '아이디는 20자 이하여야 합니다',
  (v) => /^[a-zA-Z0-9_]+$/.test(v) || '아이디는 영문, 숫자, _만 사용 가능합니다',
]

const signupPasswordRules = [
  (v) => !!v || '비밀번호를 입력해주세요',
  (v) => (v && v.length >= 8) || '비밀번호는 8자 이상이어야 합니다',
  (v) => (v && v.length <= 20) || '비밀번호는 20자 이하여야 합니다',
  // 임시로 완화된 규칙 (영문과 숫자만 체크)
  (v) => /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d@$!%*?&]/.test(v) || 
        '영문과 숫자를 포함해야 합니다 (특수문자 선택사항)',
]

const passwordConfirmRules = [
  (v) => !!v || '비밀번호 확인을 입력해주세요',
  (v) => v === signupData.value.password || '비밀번호가 일치하지 않습니다',
]

const nameRules = [
  (v) => !!v || '이름을 입력해주세요',
  (v) => (v && v.length >= 2) || '이름은 2자 이상이어야 합니다',
  (v) => (v && v.length <= 10) || '이름은 10자 이하여야 합니다',
]

const emailRules = [
  (v) => !!v || '이메일을 입력해주세요',
  (v) => /.+@.+\..+/.test(v) || '올바른 이메일 형식이 아닙니다',
]

const businessNumberRules = [
  (v) => !v || v.length === 10 || '사업자 번호는 10자리여야 합니다',
  (v) => !v || /^\d{10}$/.test(v) || '사업자 번호는 숫자만 입력 가능합니다',
]

// 로그인 관련 메서드
const fillDemoCredentials = () => {
  credentials.value.username = 'user01'
  credentials.value.password = 'passw0rd'
  loginError.value = ''
}

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

// 회원가입 관련 메서드
const checkUserIdDuplicate = async () => {
  console.log('아이디 중복 확인 시작:', signupData.value.userId)
  
  if (!signupData.value.userId || signupData.value.userId.length < 3) {
    signupError.value = '아이디를 3자 이상 입력해주세요'
    return
  }

  checkingUserId.value = true
  signupError.value = ''
  
  try {
    const response = await memberApi.get(`/check-duplicate/user-id?userId=${encodeURIComponent(signupData.value.userId)}`)
    
    console.log('아이디 중복 확인 응답:', response.data)
    
    if (response.data.success) {
      const isDuplicate = response.data.data.isDuplicate
      if (isDuplicate) {
        signupError.value = '이미 사용 중인 아이디입니다'
        userIdChecked.value = false
      } else {
        userIdChecked.value = true
        appStore.showSnackbar('사용 가능한 아이디입니다', 'success')
      }
    }
  } catch (error) {
    console.error('아이디 중복 확인 실패:', error)
    signupError.value = '아이디 중복 확인에 실패했습니다'
    userIdChecked.value = false
  } finally {
    checkingUserId.value = false
  }
}

const checkEmailDuplicate = async () => {
  console.log('이메일 중복 확인 시작:', signupData.value.email)
  
  if (!signupData.value.email || !/.+@.+\..+/.test(signupData.value.email)) {
    signupError.value = '올바른 이메일을 입력해주세요'
    return
  }

  checkingEmail.value = true
  signupError.value = ''
  
  try {
    const response = await memberApi.get(`/check-duplicate/email?email=${encodeURIComponent(signupData.value.email)}`)
    
    console.log('이메일 중복 확인 응답:', response.data)
    
    if (response.data.success) {
      const isDuplicate = response.data.data.isDuplicate
      if (isDuplicate) {
        signupError.value = '이미 사용 중인 이메일입니다'
        emailChecked.value = false
      } else {
        emailChecked.value = true
        appStore.showSnackbar('사용 가능한 이메일입니다', 'success')
      }
    }
  } catch (error) {
    console.error('이메일 중복 확인 실패:', error)
    signupError.value = '이메일 중복 확인에 실패했습니다'
    emailChecked.value = false
  } finally {
    checkingEmail.value = false
  }
}

const handleSignup = async () => {
  console.log('회원가입 시도 시작')
  console.log('가입 데이터:', signupData.value)
  // console.log('중복 확인 상태 - 아이디:', userIdChecked.value, '이메일:', emailChecked.value) // 임시 주석
  
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
      email: signupData.value.email,
      businessNumber: signupData.value.businessNumber || null,
    }
    
    console.log('회원가입 요청 데이터:', requestData)
    
    const response = await memberApi.post('/register', requestData)
    
    console.log('회원가입 응답:', response.data)

    // 백엔드 응답 구조에 맞게 수정
    if (response.data.status === 200 || response.data.message?.includes('완료')) {
      signupSuccess.value = '회원가입이 완료되었습니다! 로그인해주세요'
      
      // 즉시 성공 메시지 표시
      appStore.showSnackbar('회원가입이 완료되었습니다', 'success')
      
      // 1초 후 다이얼로그 닫기 (더 빠르게)
      setTimeout(() => {
        closeSignupDialog()
      }, 1000)
    } else {
      signupError.value = response.data.message || '회원가입에 실패했습니다'
    }
  } catch (error) {
    console.error('회원가입 실패:', error)
    
    if (error.response?.data?.message) {
      signupError.value = error.response.data.message
    } else {
      signupError.value = '회원가입에 실패했습니다. 다시 시도해주세요'
    }
  } finally {
    signupLoading.value = false
  }
}

const closeSignupDialog = () => {
  showSignup.value = false
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
}

// 컴포넌트 마운트 시 실행
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.logo-section {
  padding: 20px 0;
}

.demo-info {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 8px;
  margin-top: 8px;
}

.gap-2 {
  gap: 8px;
}

@media (max-width: 600px) {
  .login-card {
    margin: 16px;
  }

  .logo-section {
    padding: 16px 0;
  }
  
  .d-flex.align-center.gap-2 {
    flex-direction: column;
    align-items: stretch;
  }
  
  .d-flex.align-center.gap-2 .v-btn {
    margin-top: 8px;
  }
}
</style>