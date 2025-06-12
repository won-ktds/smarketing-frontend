//* src/views/LoginView.vue
<template>
  <v-container fluid class="login-container">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" sm="8" md="6" lg="4" xl="3">
        <v-card class="login-card" elevation="8">
          <!-- 로고 섹션 -->
          <v-card-text class="text-center pa-8">
            <div class="logo-section mb-6">
              <v-img
                src="/images/logo192.png"
                alt="AI 마케팅 로고"
                width="80"
                height="80"
                class="mx-auto mb-4"
              />
              <h1 class="text-h4 font-weight-bold primary--text mb-2">AI 마케팅</h1>
              <p class="text-subtitle-1 text-grey-darken-1">소상공인을 위한 스마트 마케팅 솔루션</p>
            </div>

            <!-- 로그인 폼 -->
            <v-form ref="loginForm" v-model="isFormValid" @submit.prevent="handleLogin">
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

              <!-- 디버그 정보 (개발 중에만 표시) -->
              <v-card v-if="showDebugInfo" variant="outlined" class="mb-4 pa-3">
                <div class="text-caption">디버그 정보:</div>
                <div class="text-caption">아이디: "{{ credentials.username }}"</div>
                <div class="text-caption">비밀번호: "{{ credentials.password }}"</div>
                <div class="text-caption">폼 유효성: {{ isFormValid }}</div>
                <div class="text-caption">로딩 상태: {{ authStore.isLoading }}</div>
              </v-card>

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
                <span class="text-body-2 text-grey-darken-1"> 계정이 없으신가요? </span>
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
    <v-dialog v-model="showSignup" max-width="500">
      <v-card>
        <v-card-title>회원가입</v-card-title>
        <v-card-text>
          <p class="mb-4">AI 마케팅 서비스에 오신 것을 환영합니다!</p>
          <v-form>
            <v-text-field label="아이디" variant="outlined" class="mb-2" />
            <v-text-field label="비밀번호" type="password" variant="outlined" class="mb-2" />
            <v-text-field label="비밀번호 확인" type="password" variant="outlined" class="mb-2" />
            <v-text-field label="이메일" type="email" variant="outlined" class="mb-2" />
            <v-text-field label="매장명" variant="outlined" class="mb-2" />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showSignup = false">취소</v-btn>
          <v-btn color="primary" @click="handleSignup">가입하기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useAppStore } from '@/store/app'

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

// 반응형 데이터
const loginForm = ref(null)
const isFormValid = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)
const loginError = ref('')
const showForgotPassword = ref(false)
const showSignup = ref(false)
const forgotEmail = ref('')
const showDebugInfo = ref(true) // 개발 중에는 true로 설정

// 로그인 자격 증명 - 기본값 설정
const credentials = ref({
  username: 'user01', // 기본값 설정
  password: 'passw0rd', // 기본값 설정
})

const fieldErrors = ref({
  username: [],
  password: [],
})

// 유효성 검사 규칙
const usernameRules = [
  (v) => !!v || '아이디를 입력해주세요',
  (v) => (v && v.length >= 3) || '아이디는 3자 이상이어야 합니다',
]

const passwordRules = [
  (v) => !!v || '비밀번호를 입력해주세요',
  (v) => (v && v.length >= 6) || '비밀번호는 6자 이상이어야 합니다',
]

// 메서드
const fillDemoCredentials = () => {
  credentials.value.username = 'user01'
  credentials.value.password = 'passw0rd'
  loginError.value = ''
  console.log('데모 계정 정보 자동 입력 완료')
}

const handleLogin = async () => {
  console.log('=== 로그인 시도 시작 ===')
  console.log('폼 유효성:', isFormValid.value)
  console.log('입력된 자격증명:', {
    username: credentials.value.username,
    password: credentials.value.password,
    usernameLength: credentials.value.username?.length,
    passwordLength: credentials.value.password?.length,
  })

  // 폼 유효성 검사
  if (!isFormValid.value) {
    console.log('폼 유효성 검사 실패')
    return
  }

  // 빈 값 체크
  if (!credentials.value.username || !credentials.value.password) {
    loginError.value = '아이디와 비밀번호를 모두 입력해주세요'
    return
  }

  // 에러 초기화
  loginError.value = ''
  fieldErrors.value = { username: [], password: [] }

  try {
    console.log('auth store 로그인 호출 중...')
    const result = await authStore.login({
      username: credentials.value.username.trim(), // 공백 제거
      password: credentials.value.password.trim(), // 공백 제거
    })

    console.log('로그인 결과:', result)

    if (result.success) {
      console.log('로그인 성공!')
      appStore.showSnackbar('로그인되었습니다', 'success')
      router.push('/dashboard')
    } else {
      console.log('로그인 실패:', result.error)
      loginError.value = result.error || '로그인에 실패했습니다'
    }
  } catch (error) {
    console.error('로그인 에러:', error)
    loginError.value = '서버 오류가 발생했습니다'
  }
}

const handleForgotPassword = () => {
  appStore.showSnackbar('비밀번호 재설정 이메일을 발송했습니다', 'info')
  showForgotPassword.value = false
  forgotEmail.value = ''
}

const handleSignup = () => {
  appStore.showSnackbar('회원가입 기능은 곧 제공될 예정입니다', 'info')
  showSignup.value = false
}

// 컴포넌트 마운트 시 실행
onMounted(() => {
  console.log('LoginView 마운트됨')
  console.log('초기 자격증명:', credentials.value)

  // 이미 로그인된 상태라면 대시보드로 리다이렉트
  if (authStore.isAuthenticated) {
    console.log('이미 로그인된 상태 - 대시보드로 이동')
    router.push('/dashboard')
  }

  // 디버그용 - 3초 후 디버그 정보 숨기기
  setTimeout(() => {
    showDebugInfo.value = false
  }, 10000)
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

@media (max-width: 600px) {
  .login-card {
    margin: 16px;
  }

  .logo-section {
    padding: 16px 0;
  }
}
</style>
