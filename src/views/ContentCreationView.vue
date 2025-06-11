//* src/views/ContentCreationView.vue
<template>
  <v-container fluid class="pa-4">
    <!-- 페이지 헤더 -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center">
          <v-btn icon variant="text" @click="$router.go(-1)" class="mr-2">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <h1 class="text-h4 font-weight-bold">콘텐츠 생성</h1>
        </div>
      </v-col>
    </v-row>

    <!-- 콘텐츠 타입 선택 -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title>콘텐츠 유형 선택</v-card-title>
          <v-card-text>
            <v-row>
              <v-col v-for="type in contentTypes" :key="type.value" cols="6" md="3">
                <v-card
                  :color="selectedType === type.value ? 'primary' : 'default'"
                  :variant="selectedType === type.value ? 'flat' : 'outlined'"
                  class="text-center cursor-pointer"
                  @click="selectContentType(type.value)"
                >
                  <v-card-text class="pa-4">
                    <v-icon
                      :color="selectedType === type.value ? 'white' : type.color"
                      size="48"
                      class="mb-2"
                    >
                      {{ type.icon }}
                    </v-icon>
                    <div
                      class="text-body-1 font-weight-medium"
                      :class="selectedType === type.value ? 'text-white' : ''"
                    >
                      {{ type.label }}
                    </div>
                    <div
                      class="text-caption"
                      :class="selectedType === type.value ? 'text-white' : 'text-grey'"
                    >
                      {{ type.description }}
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 콘텐츠 생성 폼 -->
    <div v-if="selectedType">
      <v-row>
        <!-- 좌측: 기본 정보 입력 -->
        <v-col cols="12" md="8">
          <v-card elevation="2">
            <v-card-title>기본 정보</v-card-title>
            <v-card-text>
              <v-form ref="contentForm" v-model="formValid">
                <!-- 제목 -->
                <v-text-field
                  v-model="formData.title"
                  label="제목"
                  variant="outlined"
                  :rules="titleRules"
                  required
                  class="mb-4"
                />

                <!-- 플랫폼 선택 -->
                <v-select
                  v-model="formData.platform"
                  :items="platformOptions"
                  label="발행 플랫폼"
                  variant="outlined"
                  :rules="platformRules"
                  required
                  class="mb-4"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template v-slot:prepend>
                        <v-icon :color="getPlatformColor(item.value)">
                          {{ getPlatformIcon(item.value) }}
                        </v-icon>
                      </template>
                    </v-list-item>
                  </template>
                </v-select>

                <!-- 홍보 대상 -->
                <v-select
                  v-model="formData.targetType"
                  :items="targetTypes"
                  label="홍보 대상"
                  variant="outlined"
                  :rules="targetRules"
                  required
                  class="mb-4"
                />

                <!-- 이벤트명 (홍보 대상이 이벤트인 경우) -->
                <v-text-field
                  v-if="formData.targetType === 'event'"
                  v-model="formData.eventName"
                  label="이벤트명"
                  variant="outlined"
                  :rules="eventNameRules"
                  class="mb-4"
                />

                <!-- 홍보 기간 -->
                <v-row class="mb-4">
                  <v-col cols="6">
                    <v-text-field
                      v-model="formData.startDate"
                      label="홍보 시작일"
                      type="date"
                      variant="outlined"
                      :rules="startDateRules"
                      required
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model="formData.endDate"
                      label="홍보 종료일"
                      type="date"
                      variant="outlined"
                      :rules="endDateRules"
                      required
                    />
                  </v-col>
                </v-row>

                <!-- 콘텐츠 내용 (수동 입력 모드) -->
                <div v-if="!useAI">
                  <v-textarea
                    v-model="formData.content"
                    label="콘텐츠 내용"
                    variant="outlined"
                    rows="6"
                    :rules="contentRules"
                    counter="500"
                    class="mb-4"
                  />

                  <!-- 해시태그 -->
                  <v-combobox
                    v-model="formData.hashtags"
                    label="해시태그"
                    variant="outlined"
                    multiple
                    chips
                    closable-chips
                    hint="엔터로 해시태그를 추가하세요"
                    persistent-hint
                    class="mb-4"
                  />
                </div>
              </v-form>
            </v-card-text>
          </v-card>

          <!-- AI 생성 옵션 -->
          <v-card elevation="2" class="mt-4">
            <v-card-title class="d-flex align-center">
              <v-icon color="primary" class="mr-2">mdi-robot</v-icon>
              AI 콘텐츠 생성
              <v-spacer />
              <v-switch v-model="useAI" color="primary" hide-details />
            </v-card-title>

            <v-card-text v-if="useAI">
              <v-row>
                <!-- 톤앤매너 -->
                <v-col cols="6" md="3">
                  <v-select
                    v-model="aiOptions.toneAndManner"
                    :items="toneOptions"
                    label="톤앤매너"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>

                <!-- 프로모션 -->
                <v-col cols="6" md="3">
                  <v-select
                    v-model="aiOptions.promotion"
                    :items="promotionOptions"
                    label="프로모션"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>

                <!-- 감정 강도 -->
                <v-col cols="6" md="3">
                  <v-select
                    v-model="aiOptions.emotionIntensity"
                    :items="emotionOptions"
                    label="감정 강도"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>

                <!-- 사진 스타일 (포스터인 경우) -->
                <v-col v-if="selectedType === 'poster'" cols="6" md="3">
                  <v-select
                    v-model="aiOptions.photoStyle"
                    :items="photoStyleOptions"
                    label="사진 스타일"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>
              </v-row>

              <!-- AI 생성 요구사항 -->
              <v-textarea
                v-model="aiOptions.requirements"
                label="AI 생성 요구사항 (선택사항)"
                variant="outlined"
                rows="3"
                hint="특별한 요구사항이나 포함하고 싶은 내용을 입력하세요"
                persistent-hint
                class="mb-4"
              />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- 우측: 이미지 업로드 및 미리보기 -->
        <v-col cols="12" md="4">
          <v-card elevation="2">
            <v-card-title>이미지 업로드</v-card-title>
            <v-card-text>
              <!-- 이미지 업로드 영역 -->
              <div class="upload-area mb-4">
                <v-file-input
                  v-model="uploadedFiles"
                  label="이미지 선택"
                  variant="outlined"
                  multiple
                  accept="image/*"
                  prepend-icon="mdi-camera"
                  @change="handleFileUpload"
                />

                <div class="drop-zone" @dragover.prevent @drop.prevent="handleFileDrop">
                  <v-icon size="48" color="grey-lighten-2">mdi-cloud-upload</v-icon>
                  <p class="text-grey mt-2">드래그 앤 드롭으로 이미지를 업로드하세요</p>
                  <p class="text-caption text-grey">JPG, PNG, GIF (최대 10MB)</p>
                </div>
              </div>

              <!-- 업로드된 이미지 미리보기 -->
              <div v-if="previewImages.length > 0">
                <h4 class="text-subtitle-1 mb-2">미리보기</h4>
                <v-row>
                  <v-col v-for="(image, index) in previewImages" :key="index" cols="6">
                    <div class="image-preview">
                      <v-img :src="image.url" aspect-ratio="1" cover class="rounded" />
                      <v-btn
                        icon
                        size="small"
                        color="error"
                        class="remove-btn"
                        @click="removeImage(index)"
                      >
                        <v-icon size="16">mdi-close</v-icon>
                      </v-btn>
                    </div>
                  </v-col>
                </v-row>
              </div>
            </v-card-text>
          </v-card>

          <!-- 생성 버튼 -->
          <v-card elevation="2" class="mt-4">
            <v-card-text>
              <v-btn
                color="primary"
                size="large"
                block
                :loading="isGenerating"
                :disabled="!canGenerate"
                @click="generateContent"
              >
                <v-icon class="mr-2">
                  {{ useAI ? 'mdi-robot' : 'mdi-content-save' }}
                </v-icon>
                {{ useAI ? 'AI 콘텐츠 생성' : '콘텐츠 저장' }}
              </v-btn>

              <v-btn
                variant="outlined"
                block
                class="mt-2"
                @click="saveDraft"
                :disabled="!formData.title"
              >
                임시저장
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- 생성 결과 미리보기 -->
    <v-dialog v-model="showPreview" max-width="600" scrollable>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-eye</v-icon>
          콘텐츠 미리보기
          <v-spacer />
          <v-btn icon @click="showPreview = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider />

        <v-card-text v-if="generatedContent">
          <div class="preview-content">
            <h3 class="text-h6 mb-2">{{ generatedContent.title }}</h3>

            <v-chip :color="getPlatformColor(generatedContent.platform)" size="small" class="mb-3">
              <v-icon start>{{ getPlatformIcon(generatedContent.platform) }}</v-icon>
              {{ getPlatformLabel(generatedContent.platform) }}
            </v-chip>

            <div class="content-text mb-3">
              {{ generatedContent.content }}
            </div>

            <div v-if="generatedContent.hashtags?.length" class="hashtags mb-3">
              <v-chip
                v-for="tag in generatedContent.hashtags"
                :key="tag"
                size="small"
                variant="outlined"
                class="mr-1 mb-1"
              >
                #{{ tag }}
              </v-chip>
            </div>

            <div v-if="generatedContent.images?.length" class="images">
              <v-row>
                <v-col v-for="(image, index) in generatedContent.images" :key="index" cols="6">
                  <v-img :src="image" aspect-ratio="1" cover class="rounded" />
                </v-col>
              </v-row>
            </div>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-btn color="secondary" variant="outlined" @click="editContent"> 수정하기 </v-btn>
          <v-spacer />
          <v-btn color="primary" @click="publishContent" :loading="isPublishing"> 발행하기 </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 로딩 오버레이 -->
    <v-overlay v-if="isGenerating" class="align-center justify-center">
      <div class="text-center">
        <v-progress-circular color="primary" indeterminate size="64" class="mb-4" />
        <h3 class="text-h6 text-white mb-2">AI가 콘텐츠를 생성 중입니다</h3>
        <p class="text-white opacity-90">잠시만 기다려주세요...</p>
      </div>
    </v-overlay>
  </v-container>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useContentStore } from '@/store/content'
import { useAppStore } from '@/store/app'
import {
  CONTENT_TYPES,
  PLATFORMS,
  TONE_AND_MANNER,
  EMOTION_INTENSITY,
  PROMOTION_TYPES,
  PHOTO_STYLES,
  PLATFORM_LABELS,
  PLATFORM_COLORS,
} from '@/utils/constants'

/**
 * 콘텐츠 생성 페이지
 * SNS 게시물, 홍보 포스터 등 마케팅 콘텐츠 생성
 */

const router = useRouter()
const contentStore = useContentStore()
const appStore = useAppStore()

// 반응형 데이터
const selectedType = ref('')
const formValid = ref(false)
const useAI = ref(true)
const uploadedFiles = ref([])
const previewImages = ref([])
const isGenerating = ref(false)
const isPublishing = ref(false)
const showPreview = ref(false)
const generatedContent = ref(null)

// 폼 데이터
const formData = ref({
  title: '',
  platform: '',
  targetType: '',
  eventName: '',
  startDate: '',
  endDate: '',
  content: '',
  hashtags: [],
})

// AI 옵션
const aiOptions = ref({
  toneAndManner: 'friendly',
  promotion: 'none',
  emotionIntensity: 'normal',
  photoStyle: 'modern',
  requirements: '',
})

// 콘텐츠 타입 옵션
const contentTypes = [
  {
    value: CONTENT_TYPES.SNS,
    label: 'SNS 게시물',
    description: '인스타그램, 블로그 게시물',
    icon: 'mdi-instagram',
    color: 'purple',
  },
  {
    value: CONTENT_TYPES.POSTER,
    label: '홍보 포스터',
    description: '이벤트, 메뉴 홍보 포스터',
    icon: 'mdi-image',
    color: 'orange',
  },
]

// 플랫폼 옵션
const platformOptions = [
  { title: '인스타그램', value: PLATFORMS.INSTAGRAM },
  { title: '네이버 블로그', value: PLATFORMS.NAVER_BLOG },
  { title: '페이스북', value: PLATFORMS.FACEBOOK },
]

// 홍보 대상 타입
const targetTypes = [
  { title: '메뉴', value: 'menu' },
  { title: '매장', value: 'store' },
  { title: '이벤트', value: 'event' },
]

// AI 옵션들
const toneOptions = Object.entries(TONE_AND_MANNER).map(([key, value]) => ({
  title:
    key === 'FRIENDLY'
      ? '친근함'
      : key === 'PROFESSIONAL'
      ? '전문적'
      : key === 'HUMOROUS'
      ? '유머러스'
      : '고급스러운',
  value,
}))

const promotionOptions = Object.entries(PROMOTION_TYPES).map(([key, value]) => ({
  title:
    key === 'DISCOUNT'
      ? '할인 정보'
      : key === 'EVENT'
      ? '이벤트 정보'
      : key === 'NEW_MENU'
      ? '신메뉴 알림'
      : '없음',
  value,
}))

const emotionOptions = Object.entries(EMOTION_INTENSITY).map(([key, value]) => ({
  title:
    key === 'CALM'
      ? '차분함'
      : key === 'NORMAL'
      ? '보통'
      : key === 'ENTHUSIASTIC'
      ? '열정적'
      : '과장된',
  value,
}))

const photoStyleOptions = Object.entries(PHOTO_STYLES).map(([key, value]) => ({
  title:
    key === 'MODERN'
      ? '모던'
      : key === 'CLASSIC'
      ? '클래식'
      : key === 'EMOTIONAL'
      ? '감성적'
      : '미니멀',
  value,
}))

// 유효성 검사 규칙
const titleRules = [
  (v) => !!v || '제목을 입력해주세요',
  (v) => v.length <= 100 || '제목은 100자 이내로 입력해주세요',
]

const platformRules = [(v) => !!v || '플랫폼을 선택해주세요']

const targetRules = [(v) => !!v || '홍보 대상을 선택해주세요']

const eventNameRules = [
  (v) => formData.value.targetType !== 'event' || !!v || '이벤트명을 입력해주세요',
]

const startDateRules = [(v) => !!v || '시작일을 선택해주세요']

const endDateRules = [
  (v) => !!v || '종료일을 선택해주세요',
  (v) =>
    !formData.value.startDate ||
    v >= formData.value.startDate ||
    '종료일은 시작일보다 늦어야 합니다',
]

const contentRules = [
  (v) => useAI.value || !!v || '콘텐츠 내용을 입력해주세요',
  (v) => !v || v.length <= 500 || '콘텐츠는 500자 이내로 입력해주세요',
]

// 컴퓨티드 속성
const canGenerate = computed(() => {
  return (
    formValid.value &&
    selectedType.value &&
    (useAI.value || formData.value.content) &&
    (formData.value.targetType !== 'menu' || previewImages.value.length > 0)
  )
})

// 메서드
const selectContentType = (type) => {
  selectedType.value = type
  // 타입에 따른 기본값 설정
  if (type === CONTENT_TYPES.SNS) {
    formData.value.platform = PLATFORMS.INSTAGRAM
  }
}

const getPlatformColor = (platform) => {
  return PLATFORM_COLORS[platform] || 'grey'
}

const getPlatformIcon = (platform) => {
  const icons = {
    [PLATFORMS.INSTAGRAM]: 'mdi-instagram',
    [PLATFORMS.NAVER_BLOG]: 'mdi-blogger',
    [PLATFORMS.FACEBOOK]: 'mdi-facebook',
  }
  return icons[platform] || 'mdi-web'
}

const getPlatformLabel = (platform) => {
  return PLATFORM_LABELS[platform] || platform
}

const handleFileUpload = (files) => {
  if (!files || files.length === 0) return

  Array.from(files).forEach((file) => {
    if (file.size > 10 * 1024 * 1024) {
      // 10MB 제한
      appStore.showSnackbar('파일 크기는 10MB 이하여야 합니다', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      previewImages.value.push({
        file,
        url: e.target.result,
        name: file.name,
      })
    }
    reader.readAsDataURL(file)
  })
}

const handleFileDrop = (e) => {
  const files = e.dataTransfer.files
  handleFileUpload(files)
}

const removeImage = (index) => {
  previewImages.value.splice(index, 1)
}

const generateContent = async () => {
  try {
    isGenerating.value = true

    const contentData = {
      ...formData.value,
      type: selectedType.value,
      images: previewImages.value.map((img) => img.url),
      useAI: useAI.value,
      aiOptions: useAI.value ? aiOptions.value : null,
    }

    if (useAI.value) {
      // AI 콘텐츠 생성
      generatedContent.value = await contentStore.generateContent(contentData)
      showPreview.value = true
    } else {
      // 수동 입력 콘텐츠 저장
      const newContent = contentStore.addContent(contentData)
      appStore.showSnackbar('콘텐츠가 저장되었습니다', 'success')
      router.push('/content')
    }
  } catch (error) {
    console.error('콘텐츠 생성 실패:', error)
    appStore.showSnackbar('콘텐츠 생성에 실패했습니다', 'error')
  } finally {
    isGenerating.value = false
  }
}

const saveDraft = () => {
  try {
    const draftData = {
      ...formData.value,
      type: selectedType.value,
      images: previewImages.value.map((img) => img.url),
      status: 'draft',
    }

    contentStore.addContent(draftData)
    appStore.showSnackbar('임시저장되었습니다', 'success')
  } catch (error) {
    console.error('임시저장 실패:', error)
    appStore.showSnackbar('임시저장에 실패했습니다', 'error')
  }
}

const editContent = () => {
  showPreview.value = false
  // 생성된 콘텐츠를 폼에 다시 로드
  if (generatedContent.value) {
    formData.value.content = generatedContent.value.content
    formData.value.hashtags = generatedContent.value.hashtags || []
    useAI.value = false
  }
}

const publishContent = async () => {
  try {
    isPublishing.value = true

    if (generatedContent.value) {
      await contentStore.publishContent(generatedContent.value.id)
      appStore.showSnackbar('콘텐츠가 발행되었습니다', 'success')
      showPreview.value = false
      router.push('/content')
    }
  } catch (error) {
    console.error('콘텐츠 발행 실패:', error)
    appStore.showSnackbar('콘텐츠 발행에 실패했습니다', 'error')
  } finally {
    isPublishing.value = false
  }
}

// 오늘 날짜를 기본값으로 설정
const today = new Date().toISOString().substr(0, 10)
formData.value.startDate = today
formData.value.endDate = today
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.upload-area {
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  transition: border-color 0.3s;
}

.upload-area:hover {
  border-color: #1976d2;
}

.drop-zone {
  padding: 2rem;
  text-align: center;
}

.image-preview {
  position: relative;
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(255, 255, 255, 0.9);
}

.preview-content {
  max-height: 60vh;
  overflow-y: auto;
}

.content-text {
  white-space: pre-wrap;
  line-height: 1.6;
}

.hashtags .v-chip {
  margin-right: 4px;
  margin-bottom: 4px;
}

@media (max-width: 600px) {
  .text-h4 {
    font-size: 1.5rem !important;
  }
}
</style>
