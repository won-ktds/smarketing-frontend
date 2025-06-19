//* src/views/PosterCreationView.vue
<template>
  <v-container fluid class="pa-4">
    <!-- 헤더 -->
    <div class="d-flex align-center mb-6">
      <v-btn
        icon="mdi-arrow-left"
        variant="text"
        @click="$router.go(-1)"
        class="mr-2"
      />
      <div>
        <h1 class="text-h4 font-weight-bold">홍보 포스터 생성</h1>
        <p class="text-subtitle-1 text-grey-600 mt-1">AI를 활용하여 매력적인 홍보 포스터를 생성하세요</p>
      </div>
    </div>

    <!-- 메인 컨텐츠 -->
    <v-row>
      <!-- 왼쪽: 입력 폼 -->
      <v-col cols="12" md="6">
        <v-card class="elevation-2">
          <v-card-title class="bg-primary">
            <v-icon class="mr-2">mdi-form-textbox</v-icon>
            포스터 정보 입력
          </v-card-title>
          
          <v-card-text class="pa-6">
            <PosterForm
              v-model="posterForm"
              :loading="loading"
              @generate="generatePoster"
              @save="savePoster"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 오른쪽: 미리보기 -->
      <v-col cols="12" md="6">
        <v-card class="elevation-2">
          <v-card-title class="bg-secondary">
            <v-icon class="mr-2">mdi-image-outline</v-icon>
            미리보기
          </v-card-title>
          
          <v-card-text class="pa-6">
            <PosterPreview
              :poster-data="generatedPoster"
              :loading="loading"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 로딩 오버레이 -->
    <v-overlay v-model="loading" class="align-center justify-center">
      <div class="text-center">
        <v-progress-circular
          indeterminate
          size="64"
          color="primary"
        />
        <div class="text-h6 mt-4">{{ loadingMessage }}</div>
        <div class="text-body-2 text-grey-600 mt-2">{{ loadingSubMessage }}</div>
      </div>
    </v-overlay>

    <!-- 성공/오류 스낵바 -->
    <v-snackbar v-model="showSuccess" color="success" timeout="4000">
      <v-icon class="mr-2">mdi-check-circle</v-icon>
      {{ successMessage }}
    </v-snackbar>
    
    <v-snackbar v-model="showError" color="error" timeout="6000">
      <v-icon class="mr-2">mdi-alert-circle</v-icon>
      {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PosterForm from '@/components/poster/PosterForm.vue'
import PosterPreview from '@/components/poster/PosterPreview.vue'
import { usePosterStore } from '@/store/poster'
import { useAuthStore } from '@/store/auth'

/**
 * 홍보 포스터 생성 페이지
 * - 포스터 정보 입력 폼
 * - AI 포스터 생성
 * - 실시간 미리보기
 * - 포스터 저장
 */

// 스토어 및 라우터
const posterStore = usePosterStore()
const authStore = useAuthStore()
const router = useRouter()

// 반응형 데이터
const loading = ref(false)
const loadingMessage = ref('')
const loadingSubMessage = ref('')

// 폼 데이터
const posterForm = ref({
  storeId: null,
  title: '',
  targetAudience: '메뉴',
  promotionStartDate: null,
  promotionEndDate: null,
  eventName: '',
  imageStyle: '모던',
  promotionType: '할인 정보',
  emotionIntensity: '보통',
  images: [],
  category: '이벤트',
  requirement: '',
  toneAndManner: '전문적',
  startDate: null,
  endDate: null,
  photoStyle: '밝고 화사한'
})

// 생성된 포스터 데이터
const generatedPoster = ref(null)

// 메시지 상태
const showSuccess = ref(false)
const showError = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

/**
 * 포스터 생성
 */
const generatePoster = async (formData) => {
  try {
    loading.value = true
    loadingMessage.value = 'AI 포스터 생성 중...'
    loadingSubMessage.value = '멋진 포스터를 만들고 있어요'

    const result = await posterStore.generatePoster({
      ...formData,
      storeId: authStore.currentStore?.id || 1
    })

    if (result.success) {
      generatedPoster.value = result.data
      successMessage.value = '포스터가 성공적으로 생성되었습니다!'
      showSuccess.value = true
    } else {
      throw new Error(result.message || '포스터 생성에 실패했습니다.')
    }

  } catch (error) {
    console.error('포스터 생성 오류:', error)
    errorMessage.value = error.message || '포스터 생성 중 오류가 발생했습니다.'
    showError.value = true
  } finally {
    loading.value = false
  }
}

/**
 * 포스터 저장 - 수정된 버전
 */
const savePoster = async () => {
  if (!generatedPoster.value) {
    errorMessage.value = '저장할 포스터가 없습니다. 먼저 포스터를 생성해주세요.'
    showError.value = true
    return
  }

  try {
    loading.value = true
    loadingMessage.value = '포스터 저장 중...'
    loadingSubMessage.value = '잠시만 기다려주세요'

    // ✅ 생성된 포스터의 실제 데이터를 사용하고 contentId 처리 개선
    const result = await posterStore.savePoster({
      // ✅ contentId: 임시 ID 사용 (백엔드에서 @NotNull이므로)
      contentId: generatedPoster.value.contentId || Date.now(), // 임시 ID 생성
      storeId: authStore.currentStore?.id || 1,
      title: posterForm.value.title,
      
      // ✅ 생성된 포스터의 실제 콘텐츠 정보 사용
      content: generatedPoster.value.content || generatedPoster.value.description || posterForm.value.title,
      
      // ✅ 원본 이미지와 생성된 포스터 이미지 모두 포함
      images: [
        ...posterForm.value.images, // 원본 업로드 이미지들
        generatedPoster.value.posterImage || generatedPoster.value.imageUrl // 생성된 포스터 이미지
      ].filter(img => img), // null/undefined 제거
      
      status: 'PUBLISHED',
      category: posterForm.value.category,
      requirement: posterForm.value.requirement,
      toneAndManner: posterForm.value.toneAndManner,
      emotionIntensity: posterForm.value.emotionIntensity,
      eventName: posterForm.value.eventName,
      startDate: posterForm.value.startDate,
      endDate: posterForm.value.endDate,
      photoStyle: posterForm.value.photoStyle
    })

    if (result.success) {
      successMessage.value = '포스터가 성공적으로 저장되었습니다!'
      showSuccess.value = true
      
      // 3초 후 콘텐츠 관리 페이지로 이동
      setTimeout(() => {
        router.push('/content')
      }, 3000)
    } else {
      throw new Error(result.message || '포스터 저장에 실패했습니다.')
    }

  } catch (error) {
    console.error('포스터 저장 오류:', error)
    errorMessage.value = error.message || '포스터 저장 중 오류가 발생했습니다.'
    showError.value = true
  } finally {
    loading.value = false
  }
}

// 컴포넌트 마운트 시 초기화
onMounted(() => {
  // 현재 매장 정보 설정
  if (authStore.currentStore) {
    posterForm.value.storeId = authStore.currentStore.id
  }
})
</script>

<style scoped>
.v-card-title {
  color: white;
}
</style>