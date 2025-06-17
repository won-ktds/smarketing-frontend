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
          <!-- 헤더 -->
          <div class="pa-4 d-flex align-center" style="min-height: 64px;">
            <v-btn
              icon="mdi-arrow-left"
              variant="text"
              @click="$router.go(-1)"
              class="mr-2"
            />
            <v-icon class="mr-2" color="primary">mdi-creation</v-icon>
            <h2 class="text-h5 font-weight-bold">콘텐츠 생성</h2>
            <v-spacer />
            <v-chip color="info" size="small">
              생성 가능: {{ remainingGenerations }}회
            </v-chip>
          </div>

          <v-divider />

          <v-card-text class="pa-4">
            <!-- 콘텐츠 타입 선택 -->
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
              <!-- 기본 정보 -->
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
                      placeholder="예: 신메뉴 출시 이벤트"
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
                      placeholder="예: 신메뉴 할인 이벤트"
                    />

                    <!-- 이벤트 기간 (이벤트인 경우) -->
                    <v-row v-if="formData.targetType === 'event'">
                      <v-col cols="6">
                        <v-text-field
                          v-model="formData.startDate"
                          label="시작일"
                          type="date"
                          variant="outlined"
                          density="compact"
                          :rules="startDateRules"
                        />
                      </v-col>
                      <v-col cols="6">
                        <v-text-field
                          v-model="formData.endDate"
                          label="종료일"
                          type="date"
                          variant="outlined"
                          density="compact"
                          :rules="endDateRules"
                        />
                      </v-col>
                    </v-row>
                  </v-form>
                </v-card-text>
              </v-card>

              <!-- AI 설정 (백엔드 지원 필드만) -->
              <v-card class="mb-4" elevation="1">
                <v-card-title class="text-h6 py-3">
                  <v-icon class="mr-2" color="primary">mdi-robot</v-icon>
                  AI 설정
                </v-card-title>
                <v-card-text>
                  <!-- 사진 스타일 -->
                  <v-select
                    v-model="aiOptions.photoStyle"
                    :items="photoStyleOptions"
                    label="사진 스타일"
                    variant="outlined"
                    density="compact"
                    class="mb-3"
                  />

                  <!-- 요구사항 -->
                  <v-textarea
                    v-model="formData.requirements"
                    label="구체적인 요구사항 (선택사항)"
                    variant="outlined"
                    rows="3"
                    density="compact"
                    placeholder="예: 젊은 고객층을 타겟으로 트렌디한 문구를 사용하고 싶어요"
                  />
                </v-card-text>
              </v-card>

              <!-- 사진 업로드 -->
              <v-card class="mb-4" elevation="1">
                <v-card-title class="text-h6 py-3">
                  <v-icon class="mr-2" color="primary">mdi-camera</v-icon>
                  사진 업로드 (선택사항)
                </v-card-title>
                <v-card-text>
                  <v-file-input
                    v-model="uploadedFiles"
                    label="사진을 선택하세요"
                    variant="outlined"
                    multiple
                    accept="image/*"
                    prepend-icon="mdi-camera"
                    @change="handleFileUpload"
                    density="compact"
                  />
                  
                  <!-- 미리보기 -->
                  <div v-if="previewImages.length > 0" class="mt-3">
                    <v-row>
                      <v-col
                        v-for="(image, index) in previewImages"
                        :key="index"
                        cols="3"
                      >
                        <v-card class="position-relative">
                          <v-img
                            :src="image.url"
                            aspect-ratio="1"
                            cover
                          />
                          <v-btn
                            icon="mdi-close"
                            size="small"
                            color="error"
                            class="position-absolute"
                            style="top: 4px; right: 4px;"
                            @click="removeImage(index)"
                          />
                        </v-card>
                      </v-col>
                    </v-row>
                  </div>
                </v-card-text>
              </v-card>

              <!-- 생성 버튼 -->
              <v-card class="mb-4" elevation="1">
                <v-card-text class="text-center">
                  <v-btn
                    color="primary"
                    size="large"
                    :disabled="!formValid || remainingGenerations <= 0 || contentStore.generating"
                    :loading="contentStore.generating"
                    @click="generateContent"
                    class="px-8"
                  >
                    <v-icon class="mr-2">mdi-robot</v-icon>
                    AI로 콘텐츠 생성하기
                  </v-btn>
                  
                  <div v-if="remainingGenerations <= 0" class="text-caption text-error mt-2">
                    생성 가능 횟수를 모두 사용했습니다.
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 오른쪽 패널: 생성된 콘텐츠 미리보기 -->
      <v-col 
        v-if="generatedVersions.length > 0"
        cols="6"
        class="right-panel"
      >
        <v-card flat tile style="height: 100vh; overflow-y: auto;">
          <!-- 헤더 -->
          <div class="pa-4 d-flex align-center" style="min-height: 64px;">
            <v-icon class="mr-2" color="success">mdi-eye</v-icon>
            <h2 class="text-h5 font-weight-bold">생성된 콘텐츠</h2>
            <v-spacer />
            <v-chip color="success" size="small">
              {{ generatedVersions.length }}개 생성됨
            </v-chip>
          </div>

          <v-divider />

          <v-card-text class="pa-4">
            <!-- 버전 목록 -->
            <div class="mb-4">
              <h3 class="text-h6 mb-3">생성된 버전들</h3>
              <v-row>
                <v-col
                  v-for="(version, index) in generatedVersions"
                  :key="index"
                  cols="12"
                  class="mb-3"
                >
                  <v-card
                    :color="selectedVersion === index ? 'primary' : 'grey-lighten-5'"
                    :elevation="selectedVersion === index ? 8 : 2"
                    class="cursor-pointer"
                    @click="selectVersion(index)"
                  >
                    <v-card-text class="pa-3">
                      <div class="d-flex justify-space-between align-center">
                        <div>
                          <div class="font-weight-medium text-subtitle-2">
                            버전 {{ index + 1 }}
                          </div>
                          <div class="text-caption text-grey">
                            {{ formatDateTime(version.createdAt) }}
                          </div>
                        </div>
                        <div class="d-flex align-center">
                          <v-chip
                            :color="getStatusColor(version.status)"
                            size="x-small"
                            class="mr-2"
                          >
                            {{ getStatusText(version.status) }}
                          </v-chip>
                          <v-icon
                            :color="selectedVersion === index ? 'white' : 'grey'"
                            size="20"
                          >
                            mdi-chevron-right
                          </v-icon>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <!-- 선택된 버전 미리보기 -->
            <div v-if="currentVersion">
              <h3 class="text-h6 mb-3">미리보기</h3>
              <v-card elevation="4" class="preview-card">
                <v-card-title class="d-flex align-center py-2">
                  <v-icon :color="getPlatformColor(currentVersion.platform)" class="mr-2">
                    {{ getPlatformIcon(currentVersion.platform) }}
                  </v-icon>
                  {{ getPlatformLabel(currentVersion.platform) }}
                  <v-spacer />
                  <v-btn
                    color="primary"
                    size="small"
                    @click="showDetailDialog = true"
                  >
                    자세히 보기
                  </v-btn>
                </v-card-title>
                
                <v-divider />
                
                <v-card-text class="pa-3">
                  <!-- 제목 -->
                  <div class="font-weight-bold text-h6 mb-2">
                    {{ currentVersion.title }}
                  </div>
                  
                  <!-- 콘텐츠 내용 (HTML 렌더링) -->
                  <div class="text-body-2 mb-3" style="line-height: 1.6;">
                    <div v-if="isHtmlContent(currentVersion.content)" 
                         class="html-content preview-content">
                      <!-- 미리보기용 축약 HTML -->
                      <div v-html="truncateHtmlContent(currentVersion.content, 200)"></div>
                      <div v-if="currentVersion.content.length > 500" class="text-caption text-grey mt-2">
                        ... 더 보려면 '자세히 보기'를 클릭하세요
                      </div>
                    </div>
                    <div v-else>{{ truncateText(currentVersion.content, 150) }}</div>
                  </div>

                  
                  <!-- 해시태그 -->
                  <div v-if="currentVersion.hashtags && currentVersion.hashtags.length > 0" class="mb-3">
                    <v-chip
                      v-for="(hashtag, idx) in currentVersion.hashtags.slice(0, 5)"
                      :key="idx"
                      size="small"
                      color="primary"
                      variant="outlined"
                      class="mr-1 mb-1"
                    >
                      {{ hashtag }}
                    </v-chip>
                    <span v-if="currentVersion.hashtags.length > 5" class="text-caption text-grey">
                      +{{ currentVersion.hashtags.length - 5 }}개 더
                    </span>
                  </div>
                  
                  <!-- 액션 버튼 -->
                  <div class="d-flex gap-2">
                    <v-btn
                      color="success"
                      variant="flat"
                      @click="saveVersion(selectedVersion)"
                      :loading="isPublishing && publishingIndex === selectedVersion"
                      :disabled="currentVersion.status === 'published'"
                    >
                      <v-icon class="mr-1">mdi-content-save</v-icon>
                      저장하기
                    </v-btn>
                    
                    <v-btn
                      color="primary"
                      variant="outlined"
                      @click="copyToClipboard(currentVersion.content)"
                    >
                      <v-icon class="mr-1">mdi-content-copy</v-icon>
                      복사
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 상세 다이얼로그 -->
    <v-dialog
      v-model="showDetailDialog"
      max-width="800"
      scrollable
    >
      <v-card v-if="currentVersion">
        <v-card-title class="d-flex align-center">
          <v-icon :color="getPlatformColor(currentVersion.platform)" class="mr-2">
            {{ getPlatformIcon(currentVersion.platform) }}
          </v-icon>
          {{ currentVersion.title }}
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="showDetailDialog = false"
          />
        </v-card-title>
        
        <v-divider />
        
        <v-card-text class="pa-4" style="max-height: 500px;">

          <!-- 전체 콘텐츠 (HTML 렌더링) -->
          <div class="mb-4">
            <h4 class="text-h6 mb-2">콘텐츠</h4>
            <div v-if="isHtmlContent(currentVersion.content)" 
                 class="pa-3 bg-grey-lighten-5 rounded html-content" 
                 style="line-height: 1.6;"
                 v-html="currentVersion.content">
            </div>
            <div v-else 
                 class="text-body-2 pa-3 bg-grey-lighten-5 rounded" 
                 style="white-space: pre-wrap; line-height: 1.6;">
              {{ currentVersion.content }}
            </div>
          </div>

        
          
          <!-- 해시태그 -->
          <div v-if="currentVersion.hashtags && currentVersion.hashtags.length > 0" class="mb-4">
            <h4 class="text-h6 mb-2">해시태그</h4>
            <div>
              <v-chip
                v-for="(hashtag, idx) in currentVersion.hashtags"
                :key="idx"
                size="small"
                color="primary"
                variant="outlined"
                class="mr-1 mb-1"
              >
                {{ hashtag }}
              </v-chip>
            </div>
          </div>
          
          <!-- 메타 정보 -->
          <div>
            <h4 class="text-h6 mb-2">정보</h4>
            <v-list density="compact">
              <v-list-item>
                <v-list-item-title>플랫폼</v-list-item-title>
                <template v-slot:append>
                  <v-chip size="small" :color="getPlatformColor(currentVersion.platform)">
                    {{ getPlatformLabel(currentVersion.platform) }}
                  </v-chip>
                </template>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>홍보 대상</v-list-item-title>
                <template v-slot:append>
                  {{ currentVersion.targetType }}
                </template>
              </v-list-item>
              <v-list-item v-if="currentVersion.eventName">
                <v-list-item-title>이벤트명</v-list-item-title>
                <template v-slot:append>
                  {{ currentVersion.eventName }}
                </template>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>생성일시</v-list-item-title>
                <template v-slot:append>
                  {{ formatDateTime(currentVersion.createdAt) }}
                </template>
              </v-list-item>
            </v-list>
          </div>
        </v-card-text>
        
        <v-divider />
        
        <v-card-actions class="px-4 py-3">
          <v-spacer />
          <v-btn
            color="primary"
            variant="outlined"
            @click="copyFullContent(currentVersion)"
          >
            <v-icon class="mr-1">mdi-content-copy</v-icon>
            전체 복사
          </v-btn>
          <v-btn
            color="success"
            @click="saveVersion(selectedVersion); showDetailDialog = false"
            :loading="isPublishing && publishingIndex === selectedVersion"
            :disabled="currentVersion.status === 'published'"
          >
            <v-icon class="mr-1">mdi-content-save</v-icon>
            저장하기
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 로딩 오버레이 -->
    <v-overlay v-model="contentStore.generating" contained persistent class="d-flex align-center justify-center">
      <div class="text-center">
        <v-progress-circular color="primary" indeterminate size="64" class="mb-4" />
        <h3 class="text-h6 text-white mb-2">AI가 콘텐츠를 생성 중입니다</h3>
        <p class="text-white opacity-90">잠시만 기다려주세요...</p>
      </div>
    </v-overlay>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useContentStore } from '@/store/content'
import { useAppStore } from '@/store/app'

/**
 * 콘텐츠 생성 페이지
 * SNS 게시물, 홍보 포스터 등 마케팅 콘텐츠 생성
 */

const router = useRouter()
const contentStore = useContentStore()
const appStore = useAppStore()

// 반응형 데이터
const selectedType = ref('sns')
const formValid = ref(false)
const uploadedFiles = ref([])
const previewImages = ref([])
const isPublishing = ref(false)
const publishingIndex = ref(-1)
const showDetailDialog = ref(false)
const selectedVersion = ref(0)
const generatedVersions = ref([])
const remainingGenerations = ref(3) // AI 생성 가능 횟수

// 폼 데이터
const formData = ref({
  title: '',
  platform: '',
  targetType: '',
  eventName: '',
  startDate: '',
  endDate: '',
  requirements: '',
})

// AI 옵션 (백엔드 DTO에 맞게 단순화)
const aiOptions = ref({
  photoStyle: 'bright' // 백엔드에서 지원하는 photoStyle만 유지
})

// 상수 정의
const contentTypes = [
  {
    value: 'sns',
    label: 'SNS 게시물',
    description: '인스타그램, 페이스북 등',
    icon: 'mdi-instagram',
    color: 'pink'
  },
  {
    value: 'poster',
    label: '홍보 포스터',
    description: '이벤트, 할인 포스터',
    icon: 'mdi-image',
    color: 'blue'
  }
]

const platformOptions = [
  { title: '인스타그램', value: 'instagram' },
  { title: '네이버 블로그', value: 'naver_blog' },
  { title: '페이스북', value: 'facebook' },
  { title: '카카오스토리', value: 'kakao_story' }
]

const targetTypes = [
  { title: '신메뉴', value: 'new_menu' },
  { title: '할인 이벤트', value: 'discount' },
  { title: '매장 홍보', value: 'store' },
  { title: '일반 이벤트', value: 'event' }
]

// 백엔드에서 지원하지 않는 옵션들은 제거
const photoStyleOptions = [
  { title: '밝고 화사한', value: 'bright' },
  { title: '차분하고 세련된', value: 'calm' },
  { title: '빈티지한', value: 'vintage' },
  { title: '모던한', value: 'modern' },
  { title: '자연스러운', value: 'natural' }
]

// 유효성 검사 규칙
const titleRules = [
  v => !!v || '제목은 필수입니다',
  v => (v && v.length <= 100) || '제목은 100자 이하로 입력해주세요'
]

const platformRules = [
  v => !!v || '플랫폼을 선택해주세요'
]

const targetRules = [
  v => !!v || '홍보 대상을 선택해주세요'
]

const eventNameRules = [
  v => !formData.value.targetType || formData.value.targetType !== 'event' || !!v || '이벤트명은 필수입니다'
]

const startDateRules = [
  v => !formData.value.targetType || formData.value.targetType !== 'event' || !!v || '시작일은 필수입니다'
]

const endDateRules = [
  v => !formData.value.targetType || formData.value.targetType !== 'event' || !!v || '종료일은 필수입니다',
  v => !formData.value.startDate || !v || new Date(v) >= new Date(formData.value.startDate) || '종료일은 시작일보다 이후여야 합니다'
]

// Computed
const currentVersion = computed(() => {
  return generatedVersions.value[selectedVersion.value] || null
})

// 메서드
const selectContentType = (type) => {
  selectedType.value = type
}

const handleFileUpload = () => {
  previewImages.value = []
  
  if (uploadedFiles.value && uploadedFiles.value.length > 0) {
    uploadedFiles.value.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        previewImages.value.push({
          file,
          url: e.target.result
        })
      }
      reader.readAsDataURL(file)
    })
  }
}

const removeImage = (index) => {
  previewImages.value.splice(index, 1)
  uploadedFiles.value.splice(index, 1)
}

const generateContent = async () => {
  if (!formValid.value) {
    appStore.showSnackbar('모든 필수 항목을 입력해주세요.', 'warning')
    return
  }

  if (remainingGenerations.value <= 0) {
    appStore.showSnackbar('생성 가능 횟수를 모두 사용했습니다.', 'warning')
    return
  }

  try {
    console.log('🎯 콘텐츠 생성 요청 시작')
    
    // 백엔드 DTO에 맞는 데이터 구조
    const contentData = {
      // 기본 정보
      title: formData.value.title,
      platform: formData.value.platform, // 원본 플랫폼 값 그대로 전송
      targetType: formData.value.targetType,
      
      // 이벤트 정보
      eventName: formData.value.eventName,
      startDate: formData.value.startDate,
      endDate: formData.value.endDate,
      
      // 콘텐츠 정보
      requirements: formData.value.requirements,
      category: getCategory(formData.value.targetType),
      
      // 미디어
      images: previewImages.value.map(img => img.url),
      
      // AI 옵션 (UI에서 설정된 값들)
      aiOptions: aiOptions.value,
      
      // 메타 정보
      type: selectedType.value
    }

    console.log('📤 전송할 데이터:', contentData)

    const generated = await contentStore.generateContent(contentData)

      // ✅ 핵심: AI 생성 결과에 이미지를 직접 추가
    let finalContent = generated.content
    
    // 업로드된 이미지가 있으면 콘텐츠 최상단에 추가
    if (previewImages.value.length > 0) {
      const imageHtml = previewImages.value.map(img => 
        `<div style="margin-bottom: 15px; text-align: center;">
          <img src="${img.url}" style="width: 100%; max-width: 400px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
         </div>`
      ).join('')
      
      // HTML 콘텐츠인지 확인하고 이미지를 맨 앞에 추가
      if (isHtmlContent(finalContent)) {
        finalContent = imageHtml + finalContent
      } else {
        // 일반 텍스트면 HTML로 변환해서 이미지 추가
        finalContent = imageHtml + `<div style="padding: 15px; font-family: 'Noto Sans KR', Arial, sans-serif; line-height: 1.6;">${finalContent.replace(/\n/g, '<br>')}</div>`
      }
    }
    
    const newContent = {
      id: Date.now() + Math.random(),
      ...contentData,
      content: finalContent,
      hashtags: generated.hashtags || [],
      createdAt: new Date(),
      status: 'draft',
       uploadedImages: previewImages.value
    }

    generatedVersions.value.push(newContent)
    selectedVersion.value = generatedVersions.value.length - 1
    remainingGenerations.value--
    
    appStore.showSnackbar(`콘텐츠 버전 ${generatedVersions.value.length}이 생성되었습니다!`, 'success')
  } catch (error) {
    console.error('❌ 콘텐츠 생성 실패:', error)
    appStore.showSnackbar(error.message || '콘텐츠 생성 중 오류가 발생했습니다.', 'error')
  }
}

const getCategory = (targetType) => {
  const mapping = {
    'new_menu': '메뉴소개',
    'discount': '이벤트',
    'store': '인테리어',
    'event': '이벤트'
  }
  return mapping[targetType] || '기타'
}

const selectVersion = (index) => {
  selectedVersion.value = index
}

const saveVersion = async (index) => {
  isPublishing.value = true
  publishingIndex.value = index
  
  try {
    const version = generatedVersions.value[index]
    
    // 백엔드 DTO에 맞는 저장 데이터 구성
    await contentStore.saveContent({
      title: version.title,
      content: version.content,
      hashtags: version.hashtags,
      platform: version.platform, // 원본 플랫폼 값 그대로 전송
      category: getCategory(version.targetType),
      eventName: version.eventName,
      eventDate: version.eventDate,
      status: 'PUBLISHED'
    })
    
    version.status = 'published'
    version.publishedAt = new Date()
    
    appStore.showSnackbar(`버전 ${index + 1}이 성공적으로 저장되었습니다!`, 'success')
    
    // 저장 후 콘텐츠 관리 페이지로 이동할지 물어보기
    setTimeout(() => {
      if (confirm('저장된 콘텐츠를 확인하시겠습니까?')) {
        router.push('/content')
      }
    }, 1000)
  } catch (error) {
    console.error('❌ 콘텐츠 저장 실패:', error)
    appStore.showSnackbar(error.message || '콘텐츠 저장 중 오류가 발생했습니다.', 'error')
  } finally {
    isPublishing.value = false
    publishingIndex.value = -1
  }
}

const copyToClipboard = async (content) => {
  try {
    // HTML 콘텐츠인 경우 텍스트만 추출해서 복사
    const textToCopy = isHtmlContent(content) ? extractTextFromHtml(content) : content
    
    await navigator.clipboard.writeText(textToCopy)
    appStore.showSnackbar('클립보드에 복사되었습니다.', 'success')
  } catch (error) {
    console.error('클립보드 복사 실패:', error)
    appStore.showSnackbar('복사에 실패했습니다.', 'error')
  }
}

// 전체 콘텐츠 복사 (콘텐츠 + 해시태그)
const copyFullContent = async (version) => {
  try {
    let fullContent = ''
    
    // 콘텐츠 추가 (HTML인 경우 텍스트만 추출)
    if (isHtmlContent(version.content)) {
      fullContent += extractTextFromHtml(version.content)
    } else {
      fullContent += version.content
    }
    
    // 해시태그 추가
    if (version.hashtags && version.hashtags.length > 0) {
      fullContent += '\n\n' + version.hashtags.join(' ')
    }
    
    await navigator.clipboard.writeText(fullContent)
    appStore.showSnackbar('전체 콘텐츠가 클립보드에 복사되었습니다.', 'success')
  } catch (error) {
    console.error('전체 콘텐츠 복사 실패:', error)
    appStore.showSnackbar('복사에 실패했습니다.', 'error')
  }
}

// 유틸리티 함수들
const getPlatformIcon = (platform) => {
  const icons = {
    'instagram': 'mdi-instagram',
    'naver_blog': 'mdi-web',
    'facebook': 'mdi-facebook',
    'kakao_story': 'mdi-chat',
    // 백엔드에서 받는 값에 대한 매핑 추가
    'INSTAGRAM': 'mdi-instagram',
    'NAVER_BLOG': 'mdi-web',
    'FACEBOOK': 'mdi-facebook',
    'KAKAO_STORY': 'mdi-chat'
  }
  return icons[platform] || 'mdi-web'
}

const getPlatformColor = (platform) => {
  const colors = {
    'instagram': 'pink',
    'naver_blog': 'green',
    'facebook': 'blue',
    'kakao_story': 'amber',
    // 백엔드에서 받는 값에 대한 매핑 추가
    'INSTAGRAM': 'pink',
    'NAVER_BLOG': 'green',
    'FACEBOOK': 'blue',
    'KAKAO_STORY': 'amber'
  }
  return colors[platform] || 'grey'
}

const getPlatformLabel = (platform) => {
  const labels = {
    'instagram': '인스타그램',
    'naver_blog': '네이버 블로그',
    'facebook': '페이스북',
    'kakao_story': '카카오스토리',
    // 백엔드에서 받는 값에 대한 매핑 추가
    'INSTAGRAM': '인스타그램',
    'NAVER_BLOG': '네이버 블로그',
    'FACEBOOK': '페이스북',
    'KAKAO_STORY': '카카오스토리'
  }
  return labels[platform] || platform
}

const getStatusColor = (status) => {
  const colors = {
    'draft': 'grey',
    'published': 'success'
  }
  return colors[status] || 'grey'
}

const getStatusText = (status) => {
  const texts = {
    'draft': '임시저장',
    'published': '발행됨'
  }
  return texts[status] || status
}

const formatDateTime = (date) => {
  if (!date) return ''
  
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  
  // HTML 태그가 있으면 제거하고 텍스트만 추출
  const textOnly = text.replace(/<[^>]*>/g, '')
  
  if (textOnly.length <= maxLength) return textOnly
  return textOnly.substring(0, maxLength) + '...'
}

// HTML 콘텐츠 감지 함수
const isHtmlContent = (content) => {
  if (!content) return false
  // HTML 태그가 포함되어 있으면 HTML 콘텐츠로 판단
  return /<[^>]+>/.test(content)
}

// HTML에서 텍스트만 추출하는 함수
const extractTextFromHtml = (html) => {
  if (!html) return ''
  // 임시 div 엘리먼트를 만들어서 텍스트만 추출
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  return tempDiv.textContent || tempDiv.innerText || ''
}

// HTML 콘텐츠를 축약하는 함수 (미리보기용)
const truncateHtmlContent = (html, maxLength) => {
  if (!html) return ''
  
  // 텍스트 길이가 maxLength보다 짧으면 그대로 반환
  const textContent = extractTextFromHtml(html)
  if (textContent.length <= maxLength) {
    return html
  }
  
  // HTML을 간단하게 축약
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  
  // 첫 번째 섹션만 가져오기 (보통 제목 부분)
  const firstSection = tempDiv.querySelector('div[style*="background"]')
  if (firstSection) {
    return firstSection.outerHTML
  }
  
  // 첫 번째 섹션이 없으면 텍스트만 축약해서 반환
  return `<div style="padding: 10px; font-family: 'Noto Sans KR', Arial, sans-serif;">${truncateText(textContent, maxLength)}</div>`
}

// 라이프사이클
onMounted(() => {
  console.log('📱 콘텐츠 생성 페이지 로드됨')
})
</script>

<style scoped>
.left-panel {
  border-right: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.left-panel-full {
  border-right: none;
}

.right-panel {
  background-color: #fafafa;
}

.cursor-pointer {
  cursor: pointer;
}

.preview-card {
  border: 2px solid #e3f2fd;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
}

.sortable-header:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

/* 모바일 최적화 */
@media (max-width: 960px) {
  .left-panel {
    border-right: none;
  }
  
  .right-panel {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1000;
    background: white;
  }
}

/* HTML 콘텐츠 스타일링 */
:deep(.html-content) {
  font-family: 'Noto Sans KR', Arial, sans-serif;
}

:deep(.html-content h1),
:deep(.html-content h2),
:deep(.html-content h3) {
  margin: 0;
  font-weight: bold;
}

:deep(.html-content p) {
  margin: 0 0 10px 0;
}

:deep(.html-content br) {
  line-height: 1.6;
}

:deep(.html-content span[style*="color"]) {
  font-weight: 500;
}

/* 해시태그 스타일 보정 */
:deep(.html-content span[style*="#1DA1F2"]) {
  color: #1976d2 !important; /* Vuetify primary 색상으로 조정 */
}

/* 미리보기 카드 내 HTML 콘텐츠 스타일 */
.preview-card :deep(.html-content) {
  font-size: 14px;
  line-height: 1.5;
}

.preview-card :deep(.html-content div[style*="background"]) {
  border-radius: 8px;
  overflow: hidden;
}

/* 미리보기 콘텐츠 최대 높이 제한 */
.preview-content {
  max-height: 300px;
  overflow: hidden;
  position: relative;
}

.preview-content::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30px;
  background: linear-gradient(transparent, white);
  pointer-events: none;
}

/* 다이얼로그 내 HTML 콘텐츠 스타일 */
.v-dialog :deep(.html-content) {
  max-width: 100%;
  overflow-x: auto;
}

.v-dialog :deep(.html-content div[style*="max-width"]) {
  max-width: 100% !important;
}
</style>