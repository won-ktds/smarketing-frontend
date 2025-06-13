//* src/views/ContentCreationView.vue
<template>
  <v-container fluid class="pa-0" style="height: 100vh; overflow: hidden;">
    <!-- 책자 형식 레이아웃 -->
    <v-row no-gutters style="height: 100vh;">
      <!-- 왼쪽 패널: 콘텐츠 생성 기능 -->
      <v-col 
        :cols="generatedVersions.length === 0 ? 12 : 6" 
        :class="['left-panel', { 'left-panel-full': generatedVersions.length === 0 }]"
      >
        <v-card flat tile style="height: 100vh; overflow-y: auto;">
          <!-- 헤더 - 제목 형태로 변경 -->
          <div class="pa-4 d-flex align-center" style="min-height: 64px;">
            <v-icon class="mr-2" color="primary">mdi-creation</v-icon>
            <h2 class="text-h5 font-weight-bold">콘텐츠 생성 (최대 3개)</h2>
          </div>

          <v-divider />

          <v-card-text class="pa-4">
            <!-- 첫번째 화면 -->
            <div v-if="currentStep === 1">
              <!-- 1. 콘텐츠 타입 선택 -->
              <v-card class="mb-4" elevation="1">
                <v-card-title class="text-h6 py-3">콘텐츠 유형 선택</v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col
                      v-for="type in contentTypes"
                      :key="type.value"
                      cols="6"
                    >
                      <v-card
                        :color="selectedType === type.value ? 'primary' : 'grey-lighten-4'"
                        :elevation="selectedType === type.value ? 8 : 2"
                        class="pa-3 text-center cursor-pointer"
                        @click="selectContentType(type.value)"
                      >
                        <v-icon
                          :color="selectedType === type.value ? 'white' : type.color"
                          size="32"
                          class="mb-2"
                        >
                          {{ type.icon }}
                        </v-icon>
                        <div
                          class="text-body-2 font-weight-medium"
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
                      </v-card>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <!-- 콘텐츠 생성 폼 -->
              <div v-if="selectedType">
                <!-- 2. 기본 정보 -->
                <v-card class="mb-4" elevation="1">
                  <v-card-title class="text-h6 py-3">기본 정보</v-card-title>
                  <v-card-text>
                    <v-form ref="contentForm" v-model="formValid">
                      <!-- 제목 -->
                      <v-text-field
                        v-model="formData.title"
                        label="제목"
                        variant="outlined"
                        :rules="titleRules"
                        required
                        density="compact"
                        class="mb-3"
                      />

                      <!-- 플랫폼 선택 -->
                      <v-select
                        v-model="formData.platform"
                        :items="platformOptions"
                        label="발행 플랫폼"
                        variant="outlined"
                        :rules="platformRules"
                        required
                        density="compact"
                        class="mb-3"
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
                        density="compact"
                        class="mb-3"
                      />

                      <!-- 이벤트명 (홍보 대상이 이벤트인 경우) -->
                      <v-text-field
                        v-if="formData.targetType === 'event'"
                        v-model="formData.eventName"
                        label="이벤트명"
                        variant="outlined"
                        :rules="eventNameRules"
                        density="compact"
                        class="mb-3"
                      />

                      <!-- 시작일, 종료일 (모든 홍보 대상에 대해 표시) -->
                      <v-row v-if="formData.targetType">
                        <v-col cols="6">
                          <v-text-field
                            v-model="formData.startDate"
                            label="시작일"
                            type="date"
                            variant="outlined"
                            :rules="startDateRules"
                            density="compact"
                          />
                        </v-col>
                        <v-col cols="6">
                          <v-text-field
                            v-model="formData.endDate"
                            label="종료일"
                            type="date"
                            variant="outlined"
                            :rules="endDateRules"
                            density="compact"
                          />
                        </v-col>
                      </v-row>
                    </v-form>
                  </v-card-text>
                </v-card>

                <!-- 4. 이미지 업로드 -->
                <v-card class="mb-4" elevation="1">
                  <v-card-title class="text-h6 py-3">이미지 첨부</v-card-title>
                  <v-card-text>
                    <v-file-input
                      v-model="uploadedFiles"
                      label="이미지 선택"
                      multiple
                      accept="image/*"
                      variant="outlined"
                      density="compact"
                      prepend-icon="mdi-camera"
                      @change="handleFileUpload"
                      class="mb-3"
                    />
                    
                    <!-- 업로드된 이미지 미리보기 -->
                    <div v-if="previewImages.length" class="image-preview-grid">
                      <div
                        v-for="(image, index) in previewImages"
                        :key="index"
                        class="image-preview-item"
                      >
                        <v-img
                          :src="image.url"
                          aspect-ratio="1"
                          cover
                          class="rounded"
                        />
                        <v-btn
                          icon
                          size="small"
                          color="error"
                          class="remove-btn"
                          @click="removeImage(index)"
                        >
                          <v-icon size="small">mdi-close</v-icon>
                        </v-btn>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>

                <!-- 다음 버튼 -->
                <v-card elevation="1">
                  <v-card-text>
                    <v-btn
                      color="primary"
                      size="large"
                      block
                      :disabled="!canProceedToNext"
                      @click="goToNextStep"
                    >
                      <v-icon class="mr-2">mdi-arrow-right</v-icon>
                      다음
                    </v-btn>
                  </v-card-text>
                </v-card>
              </div>
            </div>

            <!-- 두번째 화면 -->
            <div v-if="currentStep === 2">
              <!-- 이전 버튼 -->
              <v-btn
                variant="text"
                color="primary"
                class="mb-4"
                @click="goToPreviousStep"
              >
                <v-icon class="mr-2">mdi-arrow-left</v-icon>
                이전
              </v-btn>

              <!-- 3. AI 옵션 설정 -->
              <v-card class="mb-4" elevation="1" v-if="useAI">
                <v-card-title class="text-h6 py-3">AI 옵션 설정</v-card-title>
                <v-card-text>
                  <!-- 톤앤매너 -->
                  <v-select
                    v-model="aiOptions.toneAndManner"
                    :items="toneOptions"
                    label="톤앤매너"
                    variant="outlined"
                    density="compact"
                    class="mb-3"
                  />

                  <!-- 홍보 유형 -->
                  <v-select
                    v-model="aiOptions.promotion"
                    :items="promotionOptions"
                    label="홍보 유형"
                    variant="outlined"
                    density="compact"
                    class="mb-3"
                  />

                  <!-- 감정 강도 -->
                  <v-select
                    v-model="aiOptions.emotionIntensity"
                    :items="emotionOptions"
                    label="감정 강도"
                    variant="outlined"
                    density="compact"
                    class="mb-3"
                  />

                  <!-- 포토 스타일 (포스터인 경우) -->
                  <v-select
                    v-if="selectedType === 'poster'"
                    v-model="aiOptions.photoStyle"
                    :items="photoStyleOptions"
                    label="포토 스타일"
                    variant="outlined"
                    density="compact"
                    class="mb-3"
                  />

                  <!-- 추가 요구사항 -->
                  <v-textarea
                    v-model="aiOptions.requirements"
                    label="추가 요구사항"
                    variant="outlined"
                    rows="3"
                    density="compact"
                    placeholder="특별히 포함하고 싶은 내용이나 요구사항을 입력해주세요"
                  />
                </v-card-text>
              </v-card>

            

              <!-- 생성 방식 선택 및 버튼 -->
              <v-card elevation="1">
                <v-card-text>
                  <!-- AI 사용 여부 토글 -->
  

                  <!-- 생성 버튼 -->
                  <v-btn
                    color="primary"
                    size="large"
                    block
                    :loading="isGenerating"
                    :disabled="!canGenerate || remainingGenerations <= 0"
                    @click="generateContent"
                    class="mb-2"
                  >
                    <v-icon class="mr-2">
                      {{ useAI ? 'mdi-robot' : 'mdi-content-save' }}
                    </v-icon>
                    {{ useAI ? `AI 콘텐츠 신규 생성 (${remainingGenerations}회)` : '콘텐츠 저장' }}
                  </v-btn>

                  <!-- 생성 횟수 안내 -->
                  <div v-if="useAI" class="text-caption text-grey text-center">
                    <v-icon size="small" class="mr-1">mdi-information</v-icon>
                    AI 생성은 최대 3회까지 가능합니다. (남은 횟수: {{ remainingGenerations }}회)
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 오른쪽 패널: 생성된 콘텐츠 버전 관리 -->
      <v-col v-if="generatedVersions.length > 0" cols="6" class="right-panel">
        <v-card flat tile style="height: 100vh; overflow-y: auto;">
          <!-- 헤더 - 제목 형태로 변경 -->
          <div class="pa-4 d-flex align-center justify-between">
            <div class="d-flex align-center" style="min-height: 32px;">
              <v-icon class="mr-2" color="primary">mdi-file-document-multiple</v-icon>
              <h2 class="text-h5 font-weight-bold">콘텐츠 생성 결과</h2>
            </div>
          </div>

          <v-divider />

          <v-card-text class="pa-4">
            <!-- 생성된 콘텐츠가 없는 경우 -->
            <div v-if="generatedVersions.length === 0" class="text-center pa-8">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">
                mdi-file-document-outline
              </v-icon>
              <h3 class="text-h6 text-grey-darken-1 mb-2">
                아직 생성된 콘텐츠가 없습니다
              </h3>
              <p class="text-grey">
                왼쪽에서 정보를 입력하고 '{{ useAI ? 'AI 콘텐츠 생성' : '콘텐츠 저장' }}' 버튼을 클릭해주세요
              </p>
            </div>

            <!-- 생성된 콘텐츠 버전들 -->
            <div v-else>
              <v-card
                v-for="(version, index) in generatedVersions"
                :key="version.id"
                class="mb-4 version-card"
                :elevation="selectedVersion === index ? 4 : 2"
                :color="selectedVersion === index ? 'primary' : ''"
                :variant="selectedVersion === index ? 'elevated' : 'outlined'"
                @click="selectVersion(index)"
              >
                <v-card-title class="pa-3">
                  <div class="d-flex align-center">
                    <v-chip
                      :color="selectedVersion === index ? 'white' : 'primary'"
                      :text-color="selectedVersion === index ? 'primary' : 'white'"
                      size="small"
                      class="mr-2"
                    >
                      버전 {{ index + 1 }}
                    </v-chip>
                    <span :class="selectedVersion === index ? 'text-white' : ''" class="flex-grow-1">
                      {{ version.title }}
                    </span>
                  </div>
                </v-card-title>

                <v-card-text class="pa-3" :class="selectedVersion === index ? 'text-white' : ''">
                  <!-- 플랫폼 정보 -->
                  <div class="mb-2">
                    <v-chip
                      :color="getPlatformColor(version.platform)"
                      size="small"
                      class="mr-2"
                    >
                      <v-icon left size="small">{{ getPlatformIcon(version.platform) }}</v-icon>
                      {{ getPlatformLabel(version.platform) }}
                    </v-chip>
                    <small :class="selectedVersion === index ? 'text-white' : 'text-grey'">
                      {{ formatDate(version.createdAt) }}
                    </small>
                  </div>

                  <!-- 콘텐츠 내용 미리보기 -->
                  <div class="content-preview mb-2">
                    <p class="text-body-2 content-text">
                      {{ truncateText(version.content, 120) }}
                    </p>
                  </div>

                  <!-- 해시태그 -->
                  <div v-if="version.hashtags?.length" class="hashtags mb-2">
                    <v-chip
                      v-for="tag in version.hashtags.slice(0, 3)"
                      :key="tag"
                      size="x-small"
                      variant="outlined"
                      :color="selectedVersion === index ? 'white' : 'primary'"
                      class="mr-1 mb-1"
                    >
                      #{{ tag }}
                    </v-chip>
                    <span v-if="version.hashtags.length > 3" 
                          :class="selectedVersion === index ? 'text-white' : 'text-grey'"
                          class="text-caption">
                      +{{ version.hashtags.length - 3 }}개 더
                    </span>
                  </div>

                  <!-- 이미지 -->
                  <div v-if="version.images?.length" class="images">
                    <v-row>
                      <v-col
                        v-for="(image, imgIndex) in version.images.slice(0, 2)"
                        :key="imgIndex"
                        cols="6"
                      >
                        <v-img
                          :src="image"
                          aspect-ratio="1"
                          cover
                          class="rounded"
                        />
                      </v-col>
                    </v-row>
                    <p v-if="version.images.length > 2" 
                       :class="selectedVersion === index ? 'text-white' : 'text-grey'"
                       class="text-caption mt-1">
                      +{{ version.images.length - 2 }}개 이미지 더
                    </p>
                  </div>
                </v-card-text>

                <!-- 버전별 액션 (수정 버튼 제거, 삭제 기능 제거) -->
                <v-card-actions class="pa-3">
                  <v-spacer />
                  <v-btn
                    :color="selectedVersion === index ? 'white' : 'primary'"
                    :text-color="selectedVersion === index ? 'primary' : 'white'"
                    size="small"
                    @click.stop="publishVersion(index)"
                    :loading="isPublishing && publishingIndex === index"
                  >
                    <v-icon size="small" class="mr-1">mdi-send</v-icon>
                    발행
                  </v-btn>
                </v-card-actions>
              </v-card>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 상세 보기 다이얼로그 -->
    <v-dialog
      v-model="showDetailDialog"
      max-width="800"
      scrollable
    >
      <v-card v-if="selectedVersionData">
        <v-card-title class="text-h6 d-flex align-center">
          {{ selectedVersionData.title }} (버전 {{ selectedVersion + 1 }})
          <v-spacer />
          <v-btn icon @click="showDetailDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-4">
          <!-- 플랫폼 정보 -->
          <div class="mb-4">
            <v-chip
              :color="getPlatformColor(selectedVersionData.platform)"
              size="small"
              class="mr-2"
            >
              <v-icon left>{{ getPlatformIcon(selectedVersionData.platform) }}</v-icon>
              {{ getPlatformLabel(selectedVersionData.platform) }}
            </v-chip>
            <small class="text-grey">{{ formatDate(selectedVersionData.createdAt) }}</small>
          </div>

          <!-- 콘텐츠 내용 -->
          <div class="content-full mb-4">
            <h4 class="text-h6 mb-2">콘텐츠</h4>
            <div class="text-body-1 content-text">
              {{ selectedVersionData.content }}
            </div>
          </div>

          <!-- 해시태그 -->
          <div v-if="selectedVersionData.hashtags?.length" class="hashtags mb-4">
            <h4 class="text-h6 mb-2">해시태그</h4>
            <v-chip
              v-for="tag in selectedVersionData.hashtags"
              :key="tag"
              variant="outlined"
              class="mr-1 mb-1"
            >
              #{{ tag }}
            </v-chip>
          </div>

          <!-- 이미지 -->
          <div v-if="selectedVersionData.images?.length" class="images">
            <h4 class="text-h6 mb-2">이미지</h4>
            <v-row>
              <v-col
                v-for="(image, index) in selectedVersionData.images"
                :key="index"
                cols="6"
              >
                <v-img :src="image" aspect-ratio="1" cover class="rounded" />
              </v-col>
            </v-row>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4 d-flex justify-end">
          <v-btn
            color="primary"
            @click="publishVersion(selectedVersion)"
            :loading="isPublishing && publishingIndex === selectedVersion"
          >
            <v-icon class="mr-1">mdi-send</v-icon>
            발행하기
          </v-btn>
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
const currentStep = ref(1) // 현재 단계 (1: 첫번째 화면, 2: 두번째 화면)
const selectedType = ref('')
const formValid = ref(false)
const useAI = ref(true)
const uploadedFiles = ref([])
const previewImages = ref([])
const isGenerating = ref(false)
const isPublishing = ref(false)
const publishingIndex = ref(-1)
const showDetailDialog = ref(false)
const selectedVersion = ref(0)
const generatedVersions = ref([])
const hashtagInput = ref('')
const remainingGenerations = ref(3) // AI 생성 가능 횟수

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

// AI 옵션들 - 중복 제거 및 명시적 매핑
const toneOptions = [
  { title: '친근함', value: 'friendly' },
  { title: '전문적', value: 'professional' },
  { title: '유머러스', value: 'humorous' },
  { title: '고급스러운', value: 'luxurious' },
]

const promotionOptions = [
  { title: '할인 정보', value: 'discount' },
  { title: '이벤트 정보', value: 'event' },
  { title: '신메뉴 알림', value: 'new_menu' },
  { title: '없음', value: 'none' },
]

const emotionOptions = [
  { title: '차분함', value: 'calm' },
  { title: '보통', value: 'normal' },
  { title: '열정적', value: 'enthusiastic' },
  { title: '과장된', value: 'exaggerated' },
]

const photoStyleOptions = [
  { title: '모던', value: 'modern' },
  { title: '클래식', value: 'classic' },
  { title: '감성적', value: 'emotional' },
  { title: '미니멀', value: 'minimal' },
]

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
]

// 컴퓨티드 속성
const canProceedToNext = computed(() => {
  if (!selectedType.value || !formData.value.title || !formData.value.platform || !formData.value.targetType) {
    return false
  }
  
  if (formData.value.targetType === 'event' && (!formData.value.eventName || !formData.value.startDate || !formData.value.endDate)) {
    return false
  }
  
  return true
})

const canGenerate = computed(() => {
  if (!useAI.value && !formData.value.content) {
    return false
  }
  
  return true
})

const selectedVersionData = computed(() => {
  return generatedVersions.value[selectedVersion.value] || null
})

// 메서드
const selectContentType = (type) => {
  selectedType.value = type
}

const goToNextStep = () => {
  if (canProceedToNext.value) {
    currentStep.value = 2
  }
}

const goToPreviousStep = () => {
  currentStep.value = 1
}

const handleFileUpload = (files) => {
  if (files?.length) {
    previewImages.value = []
    const imagePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve({
          file,
          url: e.target.result,
          name: file.name
        })
        reader.readAsDataURL(file)
      })
    })
    
    Promise.all(imagePromises).then(images => {
      previewImages.value = images
    })
  }
}

const removeImage = (index) => {
  previewImages.value.splice(index, 1)
  // 파일 입력도 업데이트
  const dt = new DataTransfer()
  previewImages.value.forEach(img => dt.items.add(img.file))
  uploadedFiles.value = dt.files
}

const addHashtag = () => {
  const tag = hashtagInput.value.trim().replace('#', '')
  if (tag && !formData.value.hashtags.includes(tag)) {
    formData.value.hashtags.push(tag)
    hashtagInput.value = ''
  }
}

const removeHashtag = (index) => {
  formData.value.hashtags.splice(index, 1)
}

const generateContent = async () => {
  if (!canGenerate.value || remainingGenerations.value <= 0) return

  // 최대 3개 버전 체크
  if (generatedVersions.value.length >= 3) {
    appStore.showSnackbar('최대 3개의 버전까지만 생성할 수 있습니다.', 'warning')
    return
  }

  isGenerating.value = true
  
  try {
    const contentData = {
      title: formData.value.title,
      type: selectedType.value,
      platform: formData.value.platform,
      targetType: formData.value.targetType,
      eventName: formData.value.eventName,
      startDate: formData.value.startDate,
      endDate: formData.value.endDate,
      images: previewImages.value.map(img => img.url),
      aiOptions: useAI.value ? aiOptions.value : null,
      content: useAI.value ? null : formData.value.content,
      hashtags: useAI.value ? null : formData.value.hashtags,
    }

    let newContent
    if (useAI.value) {
      // AI 콘텐츠 생성
      const generated = await contentStore.generateContent(contentData)
      newContent = {
        id: Date.now() + Math.random(),
        ...contentData,
        content: generated.content,
        hashtags: generated.hashtags,
        createdAt: new Date(),
        status: 'draft',
      }
      // AI 생성 횟수 차감
      remainingGenerations.value--
    } else {
      // 수동 입력 콘텐츠
      newContent = {
        id: Date.now() + Math.random(),
        ...contentData,
        createdAt: new Date(),
        status: 'draft',
      }
    }

    generatedVersions.value.push(newContent)
    selectedVersion.value = generatedVersions.value.length - 1
    
    appStore.showSnackbar(`콘텐츠 버전 ${generatedVersions.value.length}이 생성되었습니다!`, 'success')
  } catch (error) {
    console.error('콘텐츠 생성 실패:', error)
    appStore.showSnackbar('콘텐츠 생성 중 오류가 발생했습니다.', 'error')
  } finally {
    isGenerating.value = false
  }
}

const selectVersion = (index) => {
  selectedVersion.value = index
  showDetailDialog.value = true
}

const publishVersion = async (index) => {
  isPublishing.value = true
  publishingIndex.value = index
  
  try {
    const version = generatedVersions.value[index]
    
    // 실제로는 발행 API 호출
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    version.status = 'published'
    version.publishedAt = new Date()
    
    appStore.showSnackbar(`버전 ${index + 1}이 성공적으로 발행되었습니다!`, 'success')
    showDetailDialog.value = false
    
    // 발행 후 콘텐츠 관리 페이지로 이동할지 물어보기
    setTimeout(() => {
      if (confirm('발행된 콘텐츠를 확인하시겠습니까?')) {
        router.push('/content')
      }
    }, 1000)
  } catch (error) {
    console.error('콘텐츠 발행 실패:', error)
    appStore.showSnackbar('콘텐츠 발행 중 오류가 발생했습니다.', 'error')
  } finally {
    isPublishing.value = false
    publishingIndex.value = -1
  }
}

// 유틸리티 함수
const getPlatformColor = (platform) => {
  return PLATFORM_COLORS[platform] || 'grey'
}

const getPlatformIcon = (platform) => {
  const icons = {
    [PLATFORMS.INSTAGRAM]: 'mdi-instagram',
    [PLATFORMS.FACEBOOK]: 'mdi-facebook',
    [PLATFORMS.NAVER_BLOG]: 'mdi-post',
  }
  return icons[platform] || 'mdi-web'
}

const getPlatformLabel = (platform) => {
  return PLATFORM_LABELS[platform] || platform
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const truncateText = (text, length) => {
  if (!text || text.length <= length) return text
  return text.substring(0, length) + '...'
}

// 오늘 날짜를 기본값으로 설정
const today = new Date().toISOString().substr(0, 10)
formData.value.startDate = today
formData.value.endDate = today
</script>

<style scoped>
.left-panel {
  background-color: #fafafa;
  border-right: 1px solid #e0e0e0;
}

.left-panel-full {
  border-right: none !important;
}

.right-panel {
  background-color: #f5f5f5;
}

.cursor-pointer {
  cursor: pointer;
}

.version-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.version-card:hover {
  transform: translateY(-2px);
}

.content-preview {
  max-height: 80px;
  overflow: hidden;
}

.content-text {
  white-space: pre-wrap;
  line-height: 1.5;
}

.hashtags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.images {
  margin-top: 8px;
}

.image-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
  margin-top: 8px;
}

.image-preview-item {
  position: relative;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: rgba(255, 255, 255, 0.9);
}

/* 스크롤바 스타일링 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

@media (max-width: 600px) {
  .text-h4 {
    font-size: 1.5rem !important;
  }
}
</style>