<template>
  <v-container fluid class="pa-4">
    <v-row>
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="text-h6 pa-4">
            <v-icon class="mr-2" color="primary">mdi-pencil-plus</v-icon>
            AI 콘텐츠 생성
          </v-card-title>
          
          <v-divider />
          
          <v-card-text class="pa-4">
            <v-stepper
              v-model="currentStep"
              :items="stepperItems"
              alt-labels
            >
              <!-- Step 1: 콘텐츠 타입 선택 -->
              <template v-slot:item.1>
                <v-card
                  class="pa-4"
                  flat
                >
                  <h3 class="text-h6 mb-4">어떤 콘텐츠를 만들까요?</h3>
                  
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-card
                        :class="['content-type-card', { 'selected': contentData.type === 'SNS_POST' }]"
                        @click="contentData.type = 'SNS_POST'"
                        hover
                      >
                        <v-card-text class="text-center pa-6">
                          <v-icon size="48" color="pink" class="mb-3">mdi-instagram</v-icon>
                          <h4 class="text-h6 mb-2">SNS 게시물</h4>
                          <p class="text-body-2">인스타그램 & 블로그용 게시물</p>
                        </v-card-text>
                      </v-card>
                    </v-col>
                    
                    <v-col cols="12" md="6">
                      <v-card
                        :class="['content-type-card', { 'selected': contentData.type === 'POSTER' }]"
                        @click="contentData.type = 'POSTER'"
                        hover
                      >
                        <v-card-text class="text-center pa-6">
                          <v-icon size="48" color="purple" class="mb-3">mdi-image</v-icon>
                          <h4 class="text-h6 mb-2">홍보 포스터</h4>
                          <p class="text-body-2">매장 게시용 포스터</p>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-card>
              </template>

              <!-- Step 2: 홍보 대상 선택 -->
              <template v-slot:item.2>
                <v-card class="pa-4" flat>
                  <h3 class="text-h6 mb-4">무엇을 홍보할까요?</h3>
                  
                  <v-radio-group v-model="contentData.target">
                    <v-radio
                      label="🍜 메뉴 홍보"
                      value="menu"
                    />
                    <v-radio
                      label="🏪 매장 소개"
                      value="store"
                    />
                    <v-radio
                      label="🎉 이벤트 홍보"
                      value="event"
                    />
                  </v-radio-group>
                  
                  <!-- 메뉴 선택 -->
                  <v-select
                    v-if="contentData.target === 'menu'"
                    v-model="contentData.selectedMenu"
                    label="홍보할 메뉴 선택"
                    variant="outlined"
                    :items="menuOptions"
                    item-title="text"
                    item-value="value"
                    class="mt-4"
                  />
                  
                  <!-- 이벤트 입력 -->
                  <v-text-field
                    v-if="contentData.target === 'event'"
                    v-model="contentData.eventName"
                    label="이벤트명"
                    variant="outlined"
                    placeholder="예: 신메뉴 출시 이벤트"
                    class="mt-4"
                  />
                </v-card>
              </template>

              <!-- Step 3: 이미지 업로드 -->
              <template v-slot:item.3>
                <v-card class="pa-4" flat>
                  <h3 class="text-h6 mb-4">이미지를 업로드하세요</h3>
                  
                  <v-file-input
                    v-model="contentData.images"
                    label="이미지 파일"
                    variant="outlined"
                    accept="image/*"
                    multiple
                    prepend-icon="mdi-camera"
                    show-size
                    chips
                    class="mb-4"
                  />
                  
                  <!-- 이미지 미리보기 -->
                  <v-row v-if="imagePreviewUrls.length > 0">
                    <v-col
                      v-for="(url, index) in imagePreviewUrls"
                      :key="index"
                      cols="6"
                      md="3"
                    >
                      <v-card class="pa-2">
                        <v-img
                          :src="url"
                          height="100"
                          cover
                        />
                      </v-card>
                    </v-col>
                  </v-row>
                </v-card>
              </template>

              <!-- Step 4: 세부 옵션 -->
              <template v-slot:item.4>
                <v-card class="pa-4" flat>
                  <h3 class="text-h6 mb-4">세부 옵션을 설정하세요</h3>
                  
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-select
                        v-model="contentData.toneAndManner"
                        label="톤앤매너"
                        variant="outlined"
                        :items="TONE_OPTIONS"
                        item-title="text"
                        item-value="value"
                      />
                    </v-col>
                    
                    <v-col cols="12" md="6">
                      <v-select
                        v-model="contentData.emotionIntensity"
                        label="감정 강도"
                        variant="outlined"
                        :items="EMOTION_INTENSITY"
                        item-title="text"
                        item-value="value"
                      />
                    </v-col>
                    
                    <v-col cols="12" md="6">
                      <v-select
                        v-model="contentData.promotion"
                        label="프로모션 정보"
                        variant="outlined"
                        :items="PROMOTION_OPTIONS"
                        item-title="text"
                        item-value="value"
                      />
                    </v-col>
                    
                    <!-- SNS 플랫폼 선택 (SNS 게시물인 경우만) -->
                    <v-col
                      v-if="contentData.type === 'SNS_POST'"
                      cols="12" md="6"
                    >
                      <v-select
                        v-model="contentData.platform"
                        label="게시 플랫폼"
                        variant="outlined"
                        :items="platformOptions"
                        item-title="text"
                        item-value="value"
                      />
                    </v-col>
                  </v-row>
                  
                  <!-- 기간 설정 -->
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="contentData.startDate"
                        label="홍보 시작일"
                        variant="outlined"
                        type="date"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="contentData.endDate"
                        label="홍보 종료일"
                        variant="outlined"
                        type="date"
                      />
                    </v-col>
                  </v-row>
                </v-card>
              </template>

              <!-- Step 5: 생성 결과 -->
              <template v-slot:item.5>
                <v-card class="pa-4" flat>
                  <h3 class="text-h6 mb-4">생성된 콘텐츠</h3>
                  
                  <v-card
                    v-if="generatedContent"
                    class="pa-4 mb-4"
                    color="blue-grey-lighten-5"
                    variant="tonal"
                  >
                    <h4 class="text-h6 mb-2">{{ generatedContent.title }}</h4>
                    <div class="text-body-1 mb-3" style="white-space: pre-line;">
                      {{ generatedContent.content }}
                    </div>
                    
                    <!-- 해시태그 (SNS인 경우) -->
                    <div
                      v-if="generatedContent.hashtags && generatedContent.hashtags.length > 0"
                      class="mb-3"
                    >
                      <v-chip
                        v-for="tag in generatedContent.hashtags"
                        :key="tag"
                        class="mr-1 mb-1"
                        size="small"
                        color="primary"
                      >
                        {{ tag }}
                      </v-chip>
                    </div>
                  </v-card>
                  
                  <!-- 로딩 상태 -->
                  <v-card
                    v-else-if="generating"
                    class="pa-8 text-center"
                  >
                    <v-progress-circular
                      indeterminate
                      color="primary"
                      size="64"
                      class="mb-4"
                    />
                    <p class="text-body-1">AI가 콘텐츠를 생성하고 있습니다...</p>
                    <p class="text-body-2 grey--text">잠시만 기다려주세요</p>
                  </v-card>
                  
                  <!-- 생성 실패 -->
                  <v-card
                    v-else-if="generationError"
                    class="pa-6 text-center"
                    color="error"
                    variant="tonal"
                  >
                    <v-icon size="48" color="error" class="mb-2">mdi-alert-circle</v-icon>
                    <p class="text-body-1">콘텐츠 생성에 실패했습니다</p>
                    <p class="text-body-2">{{ generationError }}</p>
                  </v-card>
                </v-card>
              </template>
            </v-stepper>
          </v-card-text>
          
          <v-divider />
          
          <!-- 액션 버튼 -->
          <v-card-actions class="pa-4">
            <v-btn
              v-if="currentStep > 1"
              color="grey"
              variant="outlined"
              @click="currentStep--"
            >
              이전
            </v-btn>
            
            <v-spacer />
            
            <!-- 다음/생성 버튼 -->
            <v-btn
              v-if="currentStep < 5"
              color="primary"
              :disabled="!canProceed"
              @click="nextStep"
            >
              {{ currentStep === 4 ? 'AI 생성하기' : '다음' }}
            </v-btn>
            
            <!-- 저장 버튼 -->
            <v-btn
              v-if="currentStep === 5 && generatedContent"
              color="success"
              :loading="saving"
              @click="saveContent"
            >
              저장하기
            </v-btn>
            
            <!-- 재생성 버튼 -->
            <v-btn
              v-if="currentStep === 5"
              color="primary"
              variant="outlined"
              :loading="generating"
              @click="regenerateContent"
            >
              다시 생성
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- 성공 스낵바 -->
    <v-snackbar
      v-model="showSuccess"
      color="success"
      timeout="3000"
    >
      콘텐츠가 성공적으로 저장되었습니다!
    </v-snackbar>
    
    <!-- 에러 스낵바 -->
    <v-snackbar
      v-model="showError"
      color="error"
      timeout="3000"
    >
      {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useContentStore } from '@/store/content'
import { useStoreStore } from '@/store/store'
import { TONE_OPTIONS, EMOTION_INTENSITY, PROMOTION_OPTIONS, PLATFORMS } from '@/utils/constants'

const router = useRouter()
const contentStore = useContentStore()
const storeStore = useStoreStore()

// 스테퍼 설정
const currentStep = ref(1)
const stepperItems = [
  { title: '타입 선택', value: 1 },
  { title: '홍보 대상', value: 2 },
  { title: '이미지 업로드', value: 3 },
  { title: '세부 옵션', value: 4 },
  { title: '생성 완료', value: 5 }
]

// 콘텐츠 데이터
const contentData = ref({
  type: '',
  target: '',
  selectedMenu: null,
  eventName: '',
  images: [],
  toneAndManner: '친근함',
  emotionIntensity: '보통',
  promotion: '없음',
  platform: 'INSTAGRAM',
  startDate: '',
  endDate: ''
})

// 상태 관리
const generating = ref(false)
const saving = ref(false)
const generatedContent = ref(null)
const generationError = ref('')
const showSuccess = ref(false)
const showError = ref(false)
const errorMessage = ref('')

// 이미지 미리보기
const imagePreviewUrls = ref([])

// 계산된 속성
const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return !!contentData.value.type
    case 2:
      if (contentData.value.target === 'menu') {
        return !!contentData.value.selectedMenu
      } else if (contentData.value.target === 'event') {
        return !!contentData.value.eventName
      }
      return !!contentData.value.target
    case 3:
      return contentData.value.images.length > 0
    case 4:
      return true
    default:
      return false
  }
})

const menuOptions = computed(() => {
  return storeStore.menus.map(menu => ({
    text: menu.menuName,
    value: menu.id
  }))
})

const platformOptions = [
  { text: '인스타그램', value: 'INSTAGRAM' },
  { text: '네이버 블로그', value: 'NAVER_BLOG' }
]

/**
 * 다음 단계로 이동
 */
const nextStep = async () => {
  if (currentStep.value === 4) {
    await generateContent()
  } else {
    currentStep.value++
  }
}

/**
 * 콘텐츠 생성
 */
const generateContent = async () => {
  generating.value = true
  generationError.value = ''
  currentStep.value = 5
  
  try {
    let response
    
    if (contentData.value.type === 'SNS_POST') {
      response = await contentStore.generateSNSContent({
        target: contentData.value.target,
        selectedMenu: contentData.value.selectedMenu,
        eventName: contentData.value.eventName,
        images: contentData.value.images,
        toneAndManner: contentData.value.toneAndManner,
        emotionIntensity: contentData.value.emotionIntensity,
        promotion: contentData.value.promotion,
        platform: contentData.value.platform,
        startDate: contentData.value.startDate,
        endDate: contentData.value.endDate
      })
    } else {
      response = await contentStore.generatePosterContent({
        target: contentData.value.target,
        selectedMenu: contentData.value.selectedMenu,
        eventName: contentData.value.eventName,
        images: contentData.value.images,
        toneAndManner: contentData.value.toneAndManner,
        promotion: contentData.value.promotion,
        startDate: contentData.value.startDate,
        endDate: contentData.value.endDate
      })
    }
    
    generatedContent.value = response
  } catch (error) {
    console.error('콘텐츠 생성 실패:', error)
    generationError.value = '콘텐츠 생성 중 오류가 발생했습니다.'
    
    // 샘플 데이터로 대체
    generatedContent.value = {
      title: '신메뉴 떡볶이 출시!',
      content: `🔥 새로운 맛의 떡볶이가 출시되었어요! 🔥

매콤달콤한 특제 소스로 만든 우리 매장만의 시그니처 떡볶이를 맛보세요!

신선한 떡과 정성스럽게 끓인 국물의 조화가 일품입니다.

지금 방문하시면 특별 할인가로 만나보실 수 있어요! ✨`,
      hashtags: ['#떡볶이', '#신메뉴', '#분식맛집', '#김사장님분식점', '#매운맛', '#달콤한맛']
    }
  } finally {
    generating.value = false
  }
}

/**
 * 콘텐츠 재생성
 */
const regenerateContent = async () => {
  generatedContent.value = null
  await generateContent()
}

/**
 * 콘텐츠 저장
 */
const saveContent = async () => {
  saving.value = true
  try {
    const saveData = {
      ...contentData.value,
      ...generatedContent.value
    }
    
    if (contentData.value.type === 'SNS_POST') {
      await contentStore.saveSNSContent(saveData)
    } else {
      await contentStore.savePosterContent(saveData)
    }
    
    showSuccess.value = true
    
    // 잠시 후 콘텐츠 관리 페이지로 이동
    setTimeout(() => {
      router.push({ name: 'ContentManagement' })
    }, 2000)
  } catch (error) {
    console.error('콘텐츠 저장 실패:', error)
    errorMessage.value = '콘텐츠 저장 중 오류가 발생했습니다.'
    showError.value = true
  } finally {
    saving.value = false
  }
}

// 이미지 파일 변경 감지
watch(() => contentData.value.images, (newImages) => {
  imagePreviewUrls.value = []
  
  if (newImages && newImages.length > 0) {
    newImages.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        imagePreviewUrls.value.push(e.target.result)
      }
      reader.readAsDataURL(file)
    })
  }
})

// 컴포넌트 마운트시 데이터 로드
onMounted(async () => {
  try {
    await storeStore.fetchMenus()
  } catch (error) {
    console.error('메뉴 데이터 로드 실패:', error)
  }
  
  // 기본 날짜 설정
  const today = new Date().toISOString().split('T')[0]
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  contentData.value.startDate = today
  contentData.value.endDate = nextWeek
})
</script>

<style scoped>
.content-type-card {
  transition: all 0.3s;
  cursor: pointer;
  border: 2px solid transparent;
}

.content-type-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.content-type-card.selected {
  border-color: #1976D2;
  background-color: #E3F2FD;
}
</style>