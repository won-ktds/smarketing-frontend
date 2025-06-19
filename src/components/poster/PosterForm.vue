//* src/components/poster/PosterForm.vue
<template>
  <v-form ref="form" v-model="valid" @submit.prevent="handleGenerate">
    <!-- 기본 정보 -->
    <div class="mb-6">
      <h3 class="text-h6 mb-4">
        <v-icon class="mr-2">mdi-information</v-icon>
        기본 정보
      </h3>
      
      <v-text-field
        v-model="formData.title"
        label="포스터 제목"
        placeholder="예: 신메뉴 출시 이벤트"
        :rules="titleRules"
        variant="outlined"
        class="mb-4"
      />

      <v-select
        v-model="formData.targetAudience"
        label="홍보 대상"
        :items="targetAudienceOptions"
        variant="outlined"
        class="mb-4"
      />

      <v-textarea
        v-model="formData.requirement"
        label="구체적인 요구사항"
        placeholder="어떤 포스터를 원하시는지 자세히 설명해주세요"
        rows="3"
        variant="outlined"
        class="mb-4"
      />
    </div>

    <!-- 프로모션 정보 -->
    <div class="mb-6">
      <h3 class="text-h6 mb-4">
        <v-icon class="mr-2">mdi-calendar-range</v-icon>
        프로모션 정보
      </h3>

      <v-text-field
        v-model="formData.eventName"
        label="이벤트명"
        placeholder="예: 신메뉴 출시 기념 이벤트"
        variant="outlined"
        class="mb-4"
      />

      <v-row>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.promotionStartDate"
            label="홍보 시작일"
            type="datetime-local"
            variant="outlined"
            :rules="startDateRules"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.promotionEndDate"
            label="홍보 종료일"
            type="datetime-local"
            variant="outlined"
            :rules="endDateRules"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.startDate"
            label="이벤트 시작일"
            type="date"
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="formData.endDate"
            label="이벤트 종료일"
            type="date"
            variant="outlined"
          />
        </v-col>
      </v-row>
    </div>

    <!-- 디자인 설정 -->
    <div class="mb-6">
      <h3 class="text-h6 mb-4">
        <v-icon class="mr-2">mdi-palette</v-icon>
        디자인 설정
      </h3>

      <v-row>
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.imageStyle"
            label="이미지 스타일"
            :items="imageStyleOptions"
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.photoStyle"
            label="사진 스타일"
            :items="photoStyleOptions"
            variant="outlined"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.promotionType"
            label="프로모션 유형"
            :items="promotionTypeOptions"
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <v-select
            v-model="formData.emotionIntensity"
            label="감정 강도"
            :items="emotionIntensityOptions"
            variant="outlined"
          />
        </v-col>
      </v-row>

      <v-select
        v-model="formData.toneAndManner"
        label="톤앤매너"
        :items="toneAndMannerOptions"
        variant="outlined"
        class="mb-4"
      />

      <v-select
        v-model="formData.category"
        label="카테고리"
        :items="categoryOptions"
        variant="outlined"
        class="mb-4"
      />
    </div>

    <!-- 이미지 업로드 -->
    <div class="mb-6">
      <h3 class="text-h6 mb-4">
        <v-icon class="mr-2">mdi-image-multiple</v-icon>
        이미지 업로드
      </h3>

      <v-file-input
        v-model="uploadedFiles"
        label="이미지 선택"
        placeholder="포스터에 포함할 이미지를 선택하세요"
        accept="image/*"
        multiple
        show-size
        variant="outlined"
        prepend-icon="mdi-camera"
        @change="handleFileUpload"
        :rules="imageRules"
        class="mb-4"
      />

      <!-- 업로드된 이미지 미리보기 -->
      <div v-if="formData.images.length > 0" class="mb-4">
        <v-row>
          <v-col
            v-for="(image, index) in formData.images"
            :key="index"
            cols="6"
            sm="4"
            md="3"
          >
            <v-card class="elevation-2">
              <v-img
                :src="image"
                height="120"
                cover
              />
              <v-card-actions class="pa-2">
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  color="error"
                  variant="text"
                  @click="removeImage(index)"
                />
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </div>

    <!-- 액션 버튼 -->
    <div class="d-flex gap-3">
      <v-btn
        color="primary"
        size="large"
        variant="elevated"
        :loading="loading"
        :disabled="!valid || formData.images.length === 0"
        @click="handleGenerate"
        class="flex-grow-1"
      >
        <v-icon class="mr-2">mdi-magic-staff</v-icon>
        AI 포스터 생성
      </v-btn>

      <v-btn
        color="success"
        size="large"
        variant="elevated"
        :disabled="!canSave"
        @click="handleSave"
        class="flex-grow-1"
      >
        <v-icon class="mr-2">mdi-content-save</v-icon>
        포스터 저장
      </v-btn>
    </div>
  </v-form>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

/**
 * 포스터 생성 폼 컴포넌트
 * - 포스터 정보 입력
 * - 이미지 업로드
 * - 폼 유효성 검증
 */

// Props 정의
const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits 정의
const emit = defineEmits(['update:modelValue', 'generate', 'save'])

// 반응형 데이터
const form = ref(null)
const valid = ref(false)
const uploadedFiles = ref([])

// 컴퓨티드 속성
const formData = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const canSave = computed(() => {
  return formData.value.title && formData.value.images.length > 0
})

// 옵션 데이터
const targetAudienceOptions = [
  '메뉴', '이벤트', '매장', '서비스', '할인혜택'
]

const imageStyleOptions = [
  '모던', '클래식', '미니멀', '화려한', '자연스러운', '빈티지'
]

const photoStyleOptions = [
  '밝고 화사한', '따뜻한 톤', '차분한 톤', '선명하고 대비가 강한', '부드러운 톤', '시크한 톤'
]

const promotionTypeOptions = [
  '할인 정보', '신메뉴 소개', '이벤트 안내', '매장 홍보', '서비스 안내'
]

const emotionIntensityOptions = [
  '약함', '보통', '강함', '매우 강함'
]

const toneAndMannerOptions = [
  '전문적', '친근한', '활기찬', '고급스러운', '캐주얼한', '신뢰감 있는'
]

const categoryOptions = [
  '이벤트', '메뉴', '할인', '공지', '홍보'
]

// 유효성 검증 규칙
const titleRules = [
  v => !!v || '제목은 필수입니다',
  v => (v && v.length <= 100) || '제목은 100자 이하로 입력해주세요'
]

const startDateRules = [
  v => !!v || '홍보 시작일은 필수입니다'
]

const endDateRules = [
  v => !!v || '홍보 종료일은 필수입니다',
  v => {
    if (!v || !formData.value.promotionStartDate) return true
    return new Date(v) > new Date(formData.value.promotionStartDate) || '종료일은 시작일보다 늦어야 합니다'
  }
]

const imageRules = [
  v => formData.value.images.length > 0 || '최소 1개의 이미지를 업로드해야 합니다'
]

/**
 * 파일 업로드 처리 - 오류 수정된 버전
 */
const handleFileUpload = (files) => {
  console.log('📁 파일 업로드 시작:', files)
  
  // 파일이 없는 경우 처리
  if (!files || files.length === 0) {
    console.log('파일이 선택되지 않음')
    return
  }

  // FileList를 배열로 변환
  const fileArray = Array.from(files)
  console.log('📁 변환된 파일 배열:', fileArray)

  const newImages = []
  let processedCount = 0
  
  fileArray.forEach((file, index) => {
    // 이미지 파일인지 확인
    if (file && file.type && file.type.startsWith('image/')) {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        newImages.push(e.target.result)
        processedCount++
        
        // 모든 파일 처리 완료 시
        if (processedCount === fileArray.length) {
          console.log('📁 모든 이미지 처리 완료:', newImages.length)
          // 기존 이미지에 새 이미지 추가
          formData.value.images.push(...newImages)
        }
      }
      
      reader.onerror = (error) => {
        console.error('파일 읽기 오류:', error)
        processedCount++
      }
      
      reader.readAsDataURL(file)
    } else {
      console.warn('지원하지 않는 파일 형식:', file?.type)
      processedCount++
    }
  })
}

/**
 * 이미지 제거
 */
const removeImage = (index) => {
  formData.value.images.splice(index, 1)
}

/**
 * 포스터 생성 요청
 */
const handleGenerate = () => {
  if (form.value?.validate()) {
    emit('generate', formData.value)
  }
}

/**
 * 포스터 저장 요청
 */
const handleSave = () => {
  emit('save')
}

// 시작일이 변경되면 종료일 유효성 재검증
watch(() => formData.value.promotionStartDate, () => {
  if (form.value) {
    form.value.validate()
  }
})
</script>