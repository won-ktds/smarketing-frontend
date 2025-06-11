<template>
  <v-container fluid class="fill-height pa-0">
    <v-row no-gutters class="fill-height">
      <v-col cols="12" class="d-flex flex-column">
        <!-- 로고 및 헤더 -->
        <div class="text-center pa-8 bg-primary">
          <v-img
            src="/images/logo.png"
            alt="AI 마케팅 로고"
            max-width="80"
            class="mx-auto mb-4"
          />
          <h1 class="text-h4 text-white font-weight-bold mb-2">
            AI 마케팅
          </h1>
          <p class="text-white opacity-90">
            소상공인을 위한 똑똑한 마케팅 솔루션
          </p>
        </div>

        <!-- 로그인 폼 -->
        <div class="flex-grow-1 pa-6">
          <v-card class="mx-auto" max-width="400" elevation="8">
            <v-card-title class="text-h5 text-center pa-6">
              로그인
            </v-card-title>

            <v-card-text class="pa-6">
              <v-form 
                ref="loginForm" 
                v-model="formValid"
                @submit.prevent="login"
              >
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
                  @keyup.enter="login"
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

                <div class="text-center">
                  <v-btn
                    variant="text"
                    color="primary"
                    @click="showRegisterDialog = true"
                  >
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
          <v-btn
            icon
            @click="showRegisterDialog = false"
          >
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
              :rules="passwordRules"
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
          <v-btn
            color="grey"
            variant="text"
            @click="showRegisterDialog = false"
          >
            취소
          </v-btn>
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

    <!-- 스낵바 -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="top"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/index'

const router = useRouter()
const authStore = useAuthStore()

// 반응형 데이터
const formValid = ref(false)
const registerFormValid = ref(false)
const loading = ref(false)
const registerLoading = ref(false)
const showPassword = ref(false)
const showRegisterDialog = ref(false)

const loginData = reactive({
  userId: '',
  password: ''
})

const registerData = reactive({
  userId: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  businessNumber: '',
  email: ''
})

const snackbar = reactive({
  show: false,
  message: '',
  color: 'success'
})

// 유효성 검사 규칙
const userIdRules = [
  v => !!v || '아이디를 입력해주세요',
  v => v.length >= 4 || '아이디는 4자 이상이어야 합니다'
]

const passwordRules = [
  v => !!v || '비밀번호를 입력해주세요',
  v => v.length >= 8 || '비밀번호는 8자 이상이어야 합니다',
  v => /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(v) || '영문, 숫자, 특수문자를 포함해야 합니다'
]

const confirmPasswordRules = [
  v => !!v || '비밀번호 확인을 입력해주세요',
  v => v === registerData.password || '비밀번호가 일치하지 않습니다'
]

const nicknameRules = [
  v => !!v || '닉네임을 입력해주세요',
  v => v.length >= 2 || '닉네임은 2자 이상이어야 합니다'
]

const businessNumberRules = [
  v => !!v || '사업자등록번호를 입력해주세요',
  v => /^\d{3}-\d{2}-\d{5}$/.test(v) || '올바른 사업자등록번호 형식이 아닙니다 (예: 123-45-67890)'
]

const emailRules = [
  v => !!v || '이메일을 입력해주세요',
  v => /.+@.+\..+/.test(v) || '올바른 이메일 형식이 아닙니다'
]

// 메서드
const login = async () => {
  if (!formValid.value) return
  
  try {
    loading.value = true
    await authStore.login(loginData)
    
    snackbar.show = true
    snackbar.message = '로그인되었습니다'
    snackbar.color = 'success'
    
    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
  } catch (error) {
    snackbar.show = true
    snackbar.message = error.response?.data?.message || '로그인에 실패했습니다'
    snackbar.color = 'error'
  } finally {
    loading.value = false
  }
}

const register = async () => {
  if (!registerFormValid.value) return
  
  try {
    registerLoading.value = true
    await authStore.register(registerData)
    
    snackbar.show = true
    snackbar.message = '회원가입이 완료되었습니다'
    snackbar.color = 'success'
    
    showRegisterDialog.value = false
    
    // 폼 초기화
    Object.assign(registerData, {
      userId: '',
      password: '',
      confirmPassword: '',
      nickname: '',
      businessNumber: '',
      email: ''
    })
  } catch (error) {
    snackbar.show = true
    snackbar.message = error.response?.data?.message || '회원가입에 실패했습니다'
    snackbar.color = 'error'
  } finally {
    registerLoading.value = false
  }
}
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}

.bg-primary {
  background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
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