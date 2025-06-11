//* src/views/LoginView.vue
<template>
  <v-container fluid class="fill-height pa-0">
    <v-row no-gutters class="fill-height">
      <v-col cols="12" class="d-flex flex-column">
        <!-- 로고 및 헤더 -->
        <div class="text-center pa-8 bg-primary">
          <v-img src="/images/logo.png" alt="AI 마케팅 로고" max-width="80" class="mx-auto mb-4" />
          <h1 class="text-h4 text-white font-weight-bold mb-2">AI 마케팅</h1>
          <p class="text-white opacity-90">소상공인을 위한 똑똑한 마케팅 솔루션</p>
        </div>

        <!-- 로그인 폼 -->
        <div class="flex-grow-1 pa-6">
          <v-card class="mx-auto" max-width="400" elevation="8">
            <v-card-title class="text-h5 text-center pa-6"> 로그인 </v-card-title>

            <v-card-text class="pa-6">
              <v-form ref="loginForm" v-model="formValid" @submit.prevent="handleLogin">
                <v-text-field
                  v-model="loginData.userId"
                  label="아이디"
                  prepend-inner-icon="mdi-account"
                  variant="outlined"
                  :rules="userIdRules"
                  required
                  class="mb-4"
                />

                <v-text-field
                  v-model="loginData.password"
                  label="비밀번호"
                  prepend-inner-icon="mdi-lock"
                  variant="outlined"
                  :type="showPassword ? 'text' : 'password'"
                  :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  :rules="passwordRules"
                  required
                  @click:append-inner="showPassword = !showPassword"
                  @keyup.enter="handleLogin"
                />

                <v-btn
                  type="submit"
                  block
                  size="large"
                  color="primary"
                  :loading="loading"
                  :disabled="!formValid"
                  class="mb-4"
                >
                  로그인
                </v-btn>

                <!-- 테스트용 기본값 설정 버튼 -->
                <v-btn
                  variant="outlined"
                  block
                  color="secondary"
                  @click="setTestCredentials"
                  class="mb-4"
                >
                  테스트 계정으로 입력
                </v-btn>

                <div class="text-center">
                  <v-btn variant="text" color="primary" @click="showRegisterDialog = true">
                    회원가입
                  </v-btn>
                </div>
              </v-form>
            </v-card-text>
          </v-card>
        </div>

        <!-- 푸터 -->
        <div class="text-center pa-4 text-caption text-grey">
          © 2024 AI Marketing Service. All rights reserved.
        </div>
      </v-col>
    </v-row>

    <!-- 회원가입 다이얼로그 -->
    <v-dialog v-model="showRegisterDialog" max-width="500" scrollable>
      <v-card>
        <v-card-title class="text-h6">
          회원가입
          <v-spacer />
          <v-btn icon @click="showRegisterDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-6">
          <v-form ref="registerForm" v-model="registerFormValid">
            <v-text-field
              v-model="registerData.userId"
              label="아이디"
              variant="outlined"
              :rules="userIdRules"
              required
              class="mb-4"
            />

            <v-text-field
              v-model="registerData.password"
              label="비밀번호"
              variant="outlined"
              type="password"
              :rules="registerPasswordRules"
              required
              class="mb-4"
            />

            <v-text-field
              v-model="registerData.confirmPassword"
              label="비밀번호 확인"
              variant="outlined"
              type="password"
              :rules="confirmPasswordRules"
              required
              class="mb-4"
            />

            <v-text-field
              v-model="registerData.nickname"
              label="닉네임"
              variant="outlined"
              :rules="nicknameRules"
              required
              class="mb-4"
            />

            <v-text-field
              v-model="registerData.businessNumber"
              label="사업자등록번호"
              variant="outlined"
              :rules="businessNumberRules"
              required
              class="mb-4"
            />

            <v-text-field
              v-model="registerData.email"
              label="이메일"
              variant="outlined"
              type="email"
              :rules="emailRules"
              required
            />
          </v-form>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-6">
          <v-spacer />
          <v-btn color="grey" variant="text" @click="showRegisterDialog = false"> 취소 </v-btn>
          <v-btn
            color="primary"
            :loading="registerLoading"
            :disabled="!registerFormValid"
            @click="register"
          >
            가입하기
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth' // 수정된 import 경로
import { useAppStore } from '@/store/app' // App Store 추가

/**
 * 로그인 페이지
 * 사용자 인증 및 회원가입 기능 제공
 */

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore() // App Store 사용

// 반응형 데이터
const formValid = ref(false)
const registerFormValid = ref(false)
const loading = ref(false)
const registerLoading = ref(false)
const showPassword = ref(false)
const showRegisterDialog = ref(false)

const loginData = reactive({
  userId: 'user01', // 테스트용 기본값
  password: 'passw0rd', // 테스트용 기본값
})

const registerData = reactive({
  userId: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  businessNumber: '',
  email: '',
})

// 유효성 검사 규칙 (테스트를 위해 완화)
const userIdRules = [(v) => !!v || '아이디를 입력해주세요']

const passwordRules = [(v) => !!v || '비밀번호를 입력해주세요']

// 회원가입용 더 엄격한 규칙
const registerPasswordRules = [
  (v) => !!v || '비밀번호를 입력해주세요',
  (v) => v.length >= 8 || '비밀번호는 8자 이상이어야 합니다',
  (v) =>
    /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(v) ||
    '영문, 숫자, 특수문자를 포함해야 합니다',
]

const confirmPasswordRules = [
  (v) => !!v || '비밀번호 확인을 입력해주세요',
  (v) => v === registerData.password || '비밀번호가 일치하지 않습니다',
]

const nicknameRules = [
  (v) => !!v || '닉네임을 입력해주세요',
  (v) => v.length >= 2 || '닉네임은 2자 이상이어야 합니다',
]

const businessNumberRules = [(v) => !!v || '사업자등록번호를 입력해주세요']

const emailRules = [
  (v) => !!v || '이메일을 입력해주세요',
  (v) => /.+@.+\..+/.test(v) || '올바른 이메일 형식이 아닙니다',
]

// 메서드
const handleLogin = async () => {
  console.log('=== 로그인 처리 시작 ===')
  console.log('입력 데이터:', loginData)

  if (!formValid.value) {
    console.log('폼 유효성 검사 실패')
    return
  }

  loading.value = true

  try {
    // Auth Store의 login 메서드 호출 (수정된 방식)
    const result = await authStore.login({
      userId: loginData.userId,
      password: loginData.password,
    })

    console.log('로그인 결과:', result)

    if (result.success) {
      appStore.showSnackbar('로그인 되었습니다', 'success')

      console.log('로그인 성공, 인증 상태 확인:', authStore.isAuthenticated)

      // 대시보드로 이동
      console.log('대시보드로 이동 시도')
      await router.push('/dashboard')
      console.log('라우터 이동 완료')
    } else {
      appStore.showSnackbar(result.message || '로그인에 실패했습니다', 'error')
    }
  } catch (error) {
    console.error('로그인 에러:', error)
    appStore.showSnackbar('로그인 중 오류가 발생했습니다', 'error')
  } finally {
    loading.value = false
  }

  console.log('=== 로그인 처리 종료 ===')
}

const setTestCredentials = () => {
  loginData.userId = 'user01'
  loginData.password = 'passw0rd'
  appStore.showSnackbar('테스트 계정 정보가 입력되었습니다', 'info')
}

const register = async () => {
  if (!registerFormValid.value) return

  try {
    registerLoading.value = true

    // 임시 회원가입 로직 (실제 API 연동 전)
    console.log('회원가입 데이터:', registerData)

    // 시뮬레이션: 성공
    appStore.showSnackbar('회원가입이 완료되었습니다', 'success')

    showRegisterDialog.value = false

    // 폼 초기화
    Object.assign(registerData, {
      userId: '',
      password: '',
      confirmPassword: '',
      nickname: '',
      businessNumber: '',
      email: '',
    })
  } catch (error) {
    console.error('회원가입 에러:', error)
    appStore.showSnackbar('회원가입에 실패했습니다', 'error')
  } finally {
    registerLoading.value = false
  }
}

// 컴포넌트 마운트 시 실행
onMounted(() => {
  console.log('LoginView 마운트됨')
  console.log('초기 인증 상태:', authStore.isAuthenticated)

  // 이미 로그인된 경우 대시보드로 리다이렉트
  if (authStore.isAuthenticated) {
    console.log('이미 로그인됨, 대시보드로 이동')
    router.push('/dashboard')
  }
})
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}

.bg-primary {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}

@media (max-width: 600px) {
  .pa-8 {
    padding: 2rem !important;
  }

  .text-h4 {
    font-size: 1.8rem !important;
  }
}
</style>
