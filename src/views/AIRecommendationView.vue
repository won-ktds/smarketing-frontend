//* src/views/AIRecommendationView.vue
<template>
  <v-container fluid class="pa-4">
    <!-- AI 추천 대시보드 -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card
          class="pa-6"
          elevation="2"
          color="gradient-primary"
        >
          <v-row align="center">
            <v-col cols="12" md="8">
              <div class="d-flex align-center mb-3">
                <v-avatar
                  size="64"
                  color="white"
                  class="mr-4"
                >
                  <v-icon size="32" color="primary">mdi-robot</v-icon>
                </v-avatar>
                <div>
                  <h2 class="text-h4 font-weight-bold white--text">
                    AI 마케팅 어시스턴트
                  </h2>
                  <p class="text-h6 white--text opacity-90">
                    데이터 기반 맞춤형 마케팅 전략을 제공합니다
                  </p>
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="4" class="text-center">
              <v-btn
                size="large"
                color="white"
                class="text-primary"
                @click="generateAllRecommendations"
                :loading="generatingAll"
              >
                <v-icon class="mr-2">mdi-refresh</v-icon>
                전체 추천 새로고침
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- 오늘의 추천 카드 -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="text-h6 pa-4">
            <v-icon class="mr-2" color="warning">mdi-star</v-icon>
            오늘의 특별 추천
            <v-spacer />
            <v-chip color="success" size="small">
              {{ getCurrentDate() }}
            </v-chip>
          </v-card-title>
          
          <v-divider />
          
          <v-card-text class="pa-4">
            <v-card
              v-if="todayRecommendation"
              class="pa-4 mb-4"
              color="amber-lighten-5"
              variant="tonal"
            >
              <v-row align="center">
                <v-col cols="12" md="8">
                  <div class="d-flex align-center mb-2">
                    <v-icon color="amber-darken-2" class="mr-2">mdi-lightbulb</v-icon>
                    <h4 class="text-h6 font-weight-bold">
                      {{ todayRecommendation.title }}
                    </h4>
                  </div>
                  <p class="text-body-1 mb-3">
                    {{ todayRecommendation.content }}
                  </p>
                  <div class="d-flex flex-wrap gap-2">
                    <v-chip
                      v-for="tag in todayRecommendation.tags"
                      :key="tag"
                      size="small"
                      color="amber"
                    >
                      {{ tag }}
                    </v-chip>
                  </div>
                </v-col>
                <v-col cols="12" md="4" class="text-center">
                  <v-btn
                    color="primary"
                    size="large"
                    @click="applyRecommendation(todayRecommendation)"
                  >
                    <v-icon class="mr-1">mdi-check-circle</v-icon>
                    추천 적용하기
                  </v-btn>
                </v-col>
              </v-row>
            </v-card>
            
            <div class="text-right">
              <v-btn
                color="primary"
                variant="outlined"
                size="small"
                @click="generateTodayRecommendation"
                :loading="generatingToday"
              >
                <v-icon class="mr-1">mdi-refresh</v-icon>
                새 추천 받기
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 추천 카테고리 -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="text-h6 pa-4">
            <v-icon class="mr-2" color="info">mdi-view-grid</v-icon>
            AI 추천 카테고리
          </v-card-title>
          
          <v-divider />
          
          <v-card-text class="pa-4">
            <v-row>
              <v-col
                v-for="category in recommendationCategories"
                :key="category.id"
                cols="12"
                sm="6"
                md="4"
              >
                <v-card
                  class="recommendation-category-card"
                  :class="{ 'selected': selectedCategory === category.id }"
                  @click="selectCategory(category.id)"
                  hover
                >
                  <v-card-text class="text-center pa-6">
                    <v-icon
                      :color="category.color"
                      size="48"
                      class="mb-3"
                    >
                      {{ category.icon }}
                    </v-icon>
                    <h4 class="text-h6 font-weight-bold mb-2">
                      {{ category.title }}
                    </h4>
                    <p class="text-body-2 grey--text">
                      {{ category.description }}
                    </p>
                    <v-chip
                      :color="category.color"
                      size="small"
                      class="mt-2"
                    >
                      {{ category.count }}개 추천
                    </v-chip>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 선택된 카테고리 추천 목록 -->
    <v-row v-if="selectedCategory">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="text-h6 pa-4">
            <v-icon class="mr-2" :color="getCategoryInfo(selectedCategory).color">
              {{ getCategoryInfo(selectedCategory).icon }}
            </v-icon>
            {{ getCategoryInfo(selectedCategory).title }} 추천
            <v-spacer />
            <v-btn
              color="primary"
              variant="outlined"
              size="small"
              @click="generateCategoryRecommendations(selectedCategory)"
              :loading="generatingCategory"
            >
              <v-icon class="mr-1">mdi-refresh</v-icon>
              새로고침
            </v-btn>
          </v-card-title>
          
          <v-divider />
          
          <v-card-text class="pa-4">
            <v-row v-if="categoryRecommendations.length > 0">
              <v-col
                v-for="(recommendation, index) in categoryRecommendations"
                :key="index"
                cols="12"
                md="6"
              >
                <v-card
                  class="recommendation-item-card"
                  elevation="1"
                  hover
                >
                  <v-card-text class="pa-4">
                    <div class="d-flex align-start mb-3">
                      <v-avatar
                        size="40"
                        :color="recommendation.priority === 'high' ? 'error' : 
                               recommendation.priority === 'medium' ? 'warning' : 'success'"
                        class="mr-3"
                      >
                        <span class="white--text font-weight-bold">
                          {{ index + 1 }}
                        </span>
                      </v-avatar>
                      <div class="flex-grow-1">
                        <h4 class="text-h6 font-weight-bold mb-1">
                          {{ recommendation.title }}
                        </h4>
                        <p class="text-body-2 grey--text mb-2">
                          {{ recommendation.description }}
                        </p>
                      </div>
                    </div>
                    
                    <!-- 추천 이유 -->
                    <v-card
                      class="pa-3 mb-3"
                      color="blue-grey-lighten-5"
                      variant="tonal"
                    >
                      <div class="text-caption grey--text mb-1">추천 이유</div>
                      <div class="text-body-2">{{ recommendation.reason }}</div>
                    </v-card>
                    
                    <!-- 예상 효과 -->
                    <div class="mb-3">
                      <div class="text-caption grey--text mb-1">예상 효과</div>
                      <v-chip
                        v-for="effect in recommendation.expectedEffects"
                        :key="effect"
                        size="small"
                        color="green"
                        class="mr-1 mb-1"
                      >
                        {{ effect }}
                      </v-chip>
                    </div>
                    
                    <!-- 우선순위 -->
                    <div class="d-flex justify-space-between align-center">
                      <v-chip
                        :color="recommendation.priority === 'high' ? 'error' : 
                               recommendation.priority === 'medium' ? 'warning' : 'success'"
                        size="small"
                      >
                        {{ getPriorityText(recommendation.priority) }}
                      </v-chip>
                      <v-chip
                        color="info"
                        size="small"
                      >
                        예상 소요시간: {{ recommendation.estimatedTime }}
                      </v-chip>
                    </div>
                  </v-card-text>
                  
                  <v-card-actions class="pt-0 px-4 pb-4">
                    <v-btn
                      color="primary"
                      variant="outlined"
                      size="small"
                      @click="viewRecommendationDetail(recommendation)"
                    >
                      상세보기
                    </v-btn>
                    <v-btn
                      color="success"
                      size="small"
                      @click="applyRecommendation(recommendation)"
                    >
                      적용하기
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
            
            <!-- 로딩 상태 -->
            <v-card
              v-else-if="generatingCategory"
              class="pa-8 text-center"
            >
              <v-progress-circular
                indeterminate
                color="primary"
                size="64"
                class="mb-4"
              />
              <p class="text-body-1">AI가 추천을 분석하고 있습니다...</p>
            </v-card>
            
            <!-- 빈 상태 -->
            <v-card
              v-else
              class="pa-6 text-center"
              color="grey-lighten-4"
              variant="tonal"
            >
              <v-icon size="48" color="grey" class="mb-2">mdi-robot-outline</v-icon>
              <p class="text-body-2">해당 카테고리의 추천을 생성해주세요</p>
            </v-card>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 추천 상세 다이얼로그 -->
    <v-dialog
      v-model="showDetailDialog"
      max-width="700"
      scrollable
    >
      <v-card v-if="selectedRecommendation">
        <v-card-title class="text-h6">
          {{ selectedRecommendation.title }}
          <v-spacer />
          <v-btn
            icon
            @click="showDetailDialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-divider />
        
        <v-card-text class="pa-4">
          <!-- 기본 정보 -->
          <div class="mb-4">
            <h4 class="text-h6 mb-2">📋 추천 개요</h4>
            <p class="text-body-1">{{ selectedRecommendation.description }}</p>
          </div>
          
          <!-- 추천 이유 -->
          <div class="mb-4">
            <h4 class="text-h6 mb-2">🔍 추천 이유</h4>
            <v-card
              class="pa-3"
              color="blue-grey-lighten-5"
              variant="tonal"
            >
              <p class="text-body-1">{{ selectedRecommendation.reason }}</p>
            </v-card>
          </div>
          
          <!-- 실행 단계 -->
          <div class="mb-4" v-if="selectedRecommendation.steps">
            <h4 class="text-h6 mb-2">📝 실행 단계</h4>
            <v-list>
              <v-list-item
                v-for="(step, index) in selectedRecommendation.steps"
                :key="index"
                class="px-0"
              >
                <template v-slot:prepend>
                  <v-avatar
                    size="32"
                    color="primary"
                  >
                    <span class="white--text font-weight-bold">
                      {{ index + 1 }}
                    </span>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ step }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </div>
          
          <!-- 예상 효과 -->
          <div class="mb-4">
            <h4 class="text-h6 mb-2">📈 예상 효과</h4>
            <v-chip
              v-for="effect in selectedRecommendation.expectedEffects"
              :key="effect"
              color="success"
              class="mr-1 mb-1"
            >
              {{ effect }}
            </v-chip>
          </div>
          
          <!-- 관련 데이터 -->
          <div class="mb-4" v-if="selectedRecommendation.relatedData">
            <h4 class="text-h6 mb-2">📊 관련 데이터</h4>
            <v-card
              class="pa-3"
              color="info"
              variant="tonal"
            >
              <div
                v-for="(data, key) in selectedRecommendation.relatedData"
                :key="key"
                class="d-flex justify-space-between mb-1"
              >
                <span>{{ key }}:</span>
                <strong>{{ data }}</strong>
              </div>
            </v-card>
          </div>
          
          <!-- 주의사항 -->
          <div v-if="selectedRecommendation.warnings">
            <h4 class="text-h6 mb-2">⚠️ 주의사항</h4>
            <v-alert
              color="warning"
              variant="tonal"
              icon="mdi-alert"
            >
              <ul class="pl-4">
                <li
                  v-for="warning in selectedRecommendation.warnings"
                  :key="warning"
                >
                  {{ warning }}
                </li>
              </ul>
            </v-alert>
          </div>
        </v-card-text>
        
        <v-divider />
        
        <v-card-actions class="pa-4">
          <v-btn
            color="success"
            @click="applyRecommendation(selectedRecommendation)"
          >
            <v-icon class="mr-1">mdi-check</v-icon>
            추천 적용하기
          </v-btn>
          <v-btn
            color="primary"
            variant="outlined"
            @click="saveRecommendation(selectedRecommendation)"
          >
            <v-icon class="mr-1">mdi-bookmark</v-icon>
            나중에 하기
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 성공 스낵바 -->
    <v-snackbar
      v-model="showSuccess"
      color="success"
      timeout="3000"
    >
      {{ successMessage }}
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as recommendService from '@/services/recommend'

const router = useRouter()

// 상태 관리
const selectedCategory = ref('')
const todayRecommendation = ref(null)
const categoryRecommendations = ref([])
const selectedRecommendation = ref(null)

const generatingAll = ref(false)
const generatingToday = ref(false)
const generatingCategory = ref(false)
const showDetailDialog = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// 추천 카테고리 설정
const recommendationCategories = ref([
  {
    id: 'content',
    title: '콘텐츠 마케팅',
    description: 'SNS 게시물 및 홍보 포스터 아이디어',
    icon: 'mdi-pencil-plus',
    color: 'purple',
    count: 5
  },
  {
    id: 'promotion',
    title: '프로모션 전략',
    description: '할인 이벤트 및 특가 제안',
    icon: 'mdi-sale',
    color: 'orange',
    count: 4
  },
  {
    id: 'menu',
    title: '메뉴 최적화',
    description: '인기 메뉴 분석 및 신메뉴 제안',
    icon: 'mdi-food',
    color: 'green',
    count: 6
  },
  {
    id: 'customer',
    title: '고객 관리',
    description: '고객 만족도 향상 방안',
    icon: 'mdi-account-heart',
    color: 'pink',
    count: 3
  },
  {
    id: 'timing',
    title: '타이밍 전략',
    description: '최적 홍보 시점 및 계절 마케팅',
    icon: 'mdi-clock',
    color: 'blue',
    count: 4
  },
  {
    id: 'analysis',
    title: '데이터 분석',
    description: '매출 분석 및 트렌드 인사이트',
    icon: 'mdi-chart-line',
    color: 'teal',
    count: 5
  }
])

/**
 * 현재 날짜 반환
 */
const getCurrentDate = () => {
  return new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

/**
 * 카테고리 정보 반환
 */
const getCategoryInfo = (categoryId) => {
  return recommendationCategories.value.find(cat => cat.id === categoryId) || {}
}

/**
 * 우선순위 텍스트 반환
 */
const getPriorityText = (priority) => {
  const priorities = {
    high: '높음',
    medium: '보통',
    low: '낮음'
  }
  return priorities[priority] || priority
}

/**
 * 카테고리 선택
 */
const selectCategory = async (categoryId) => {
  selectedCategory.value = categoryId
  await generateCategoryRecommendations(categoryId)
}

/**
 * 오늘의 추천 생성
 */
const generateTodayRecommendation = async () => {
  generatingToday.value = true
  try {
    const response = await recommendService.generateMarketingTips({
      type: 'daily',
      includeWeather: true,
      includeTrends: true
    })
    
    todayRecommendation.value = response
  } catch (error) {
    console.error('오늘의 추천 생성 실패:', error)
    // 샘플 데이터로 대체
    todayRecommendation.value = {
      title: '오늘은 날씨가 좋으니 테이크아웃 마케팅을 강화하세요!',
      content: '맑은 날씨로 인해 야외 활동이 증가할 것으로 예상됩니다. 테이크아웃 전용 할인이나 피크닉 세트 메뉴를 홍보하면 좋은 반응을 얻을 수 있을 것입니다.',
      tags: ['날씨연동', '테이크아웃', '야외활동', '피크닉']
    }
  } finally {
    generatingToday.value = false
  }
}

/**
 * 카테고리별 추천 생성
 */
const generateCategoryRecommendations = async (categoryId) => {
  generatingCategory.value = true
  try {
    const response = await recommendService.generateMarketingTips({
      type: 'category',
      category: categoryId,
      limit: 6
    })
    
    categoryRecommendations.value = response
  } catch (error) {
    console.error('카테고리 추천 생성 실패:', error)
    // 샘플 데이터로 대체
    categoryRecommendations.value = getSampleRecommendations(categoryId)
  } finally {
    generatingCategory.value = false
  }
}

/**
 * 전체 추천 새로고침
 */
const generateAllRecommendations = async () => {
  generatingAll.value = true
  try {
    await generateTodayRecommendation()
    if (selectedCategory.value) {
      await generateCategoryRecommendations(selectedCategory.value)
    }
    successMessage.value = '모든 추천이 새로고침되었습니다.'
    showSuccess.value = true
  } catch (error) {
    console.error('전체 추천 새로고침 실패:', error)
    errorMessage.value = '추천 새로고침 중 오류가 발생했습니다.'
    showError.value = true
  } finally {
    generatingAll.value = false
  }
}

/**
 * 추천 상세보기
 */
const viewRecommendationDetail = (recommendation) => {
  selectedRecommendation.value = recommendation
  showDetailDialog.value = true
}

/**
 * 추천 적용
 */
const applyRecommendation = async (recommendation) => {
  try {
    // 추천 타입에 따라 다른 페이지로 이동
    if (recommendation.type === 'content' || recommendation.title.includes('콘텐츠')) {
      router.push({ name: 'ContentCreation' })
    } else if (recommendation.type === 'menu' || recommendation.title.includes('메뉴')) {
      router.push({ name: 'MenuManagement' })
    } else {
      // 기본적으로 대시보드로 이동
      router.push({ name: 'Dashboard' })
    }
    
    successMessage.value = '추천이 적용되었습니다!'
    showSuccess.value = true
    showDetailDialog.value = false
  } catch (error) {
    console.error('추천 적용 실패:', error)
    errorMessage.value = '추천 적용 중 오류가 발생했습니다.'
    showError.value = true
  }
}

/**
 * 추천 저장
 */
const saveRecommendation = async (recommendation) => {
  try {
    // 실제로는 추천 저장 API 호출
    successMessage.value = '추천이 저장되었습니다. 나중에 확인해보세요.'
    showSuccess.value = true
    showDetailDialog.value = false
  } catch (error) {
    console.error('추천 저장 실패:', error)
    errorMessage.value = '추천 저장 중 오류가 발생했습니다.'
    showError.value = true
  }
}

/**
 * 샘플 추천 데이터 생성
 */
const getSampleRecommendations = (categoryId) => {
  const samples = {
    content: [
      {
        title: '인스타그램 스토리 활용 강화',
        description: '일상적인 요리 과정을 스토리로 공유하여 고객과의 친밀감을 높이세요',
        reason: '스토리는 24시간 후 사라지는 특성으로 인해 부담 없이 자주 업로드할 수 있고, 고객들의 참여도가 높습니다',
        priority: 'high',
        estimatedTime: '30분/일',
        expectedEffects: ['브랜드 인지도 상승', '고객 참여도 증가', '일상적 소통 증가'],
        steps: [
          '매일 요리 과정 1-2장 촬영',
          '간단한 텍스트와 함께 스토리 업로드',
          '고객 댓글에 적극적으로 반응',
          '주간 결산 스토리 하이라이트로 저장'
        ],
        type: 'content'
      },
      {
        title: '고객 리뷰 기반 콘텐츠 제작',
        description: '긍정적인 고객 리뷰를 활용하여 신뢰도 높은 홍보 콘텐츠를 만드세요',
        reason: '실제 고객의 생생한 후기는 잠재 고객들에게 강한 신뢰감을 줍니다',
        priority: 'medium',
        estimatedTime: '1시간/주',
        expectedEffects: ['신뢰도 향상', '구매 의사결정 도움', 'WOM 효과'],
        type: 'content'
      }
    ],
    promotion: [
      {
        title: '우천 시 특별 할인 이벤트',
        description: '비 오는 날 방문 고객에게 특별 할인 혜택을 제공하세요',
        reason: '비 오는 날은 외출을 꺼리는 고객들에게 방문 동기를 부여할 수 있습니다',
        priority: 'high',
        estimatedTime: '2시간',
        expectedEffects: ['비 오는 날 매출 증대', '고객 만족도 상승', '재방문 유도'],
        relatedData: {
          '우천 시 평균 매출 감소율': '-23%',
          '할인 이벤트 시 예상 증가율': '+15%',
          '타 업체 유사 이벤트 성공률': '78%'
        },
        type: 'promotion'
      }
    ],
    menu: [
      {
        title: '계절 한정 메뉴 개발',
        description: '여름철에 어울리는 시원한 메뉴나 음료를 개발해보세요',
        reason: '계절감 있는 메뉴는 고객들의 관심을 끌고 화제성을 만들 수 있습니다',
        priority: 'medium',
        estimatedTime: '1주일',
        expectedEffects: ['신규 고객 유입', '매출 다양성 확보', '브랜드 이미지 개선'],
        warnings: [
          '계절 메뉴는 재료 수급이 불안정할 수 있습니다',
          '초기 테스트 기간을 거쳐 고객 반응을 확인하세요'
        ],
        type: 'menu'
      }
    ],
    customer: [
      {
        title: '단골 고객 VIP 프로그램 운영',
        description: '자주 방문하는 고객들을 위한 특별 혜택 프로그램을 만드세요',
        reason: '단골 고객의 재방문율을 높이고 신규 고객의 단골화를 유도할 수 있습니다',
        priority: 'high',
        estimatedTime: '반나절',
        expectedEffects: ['고객 충성도 향상', '재방문율 증가', '구전 효과'],
        type: 'customer'
      }
    ],
    timing: [
      {
        title: '점심시간 사전 예약 시스템',
        description: '바쁜 점심시간에 미리 주문받아 대기시간을 단축하세요',
        reason: '직장인들의 짧은 점심시간을 고려한 서비스로 고객 만족도를 높일 수 있습니다',
        priority: 'medium',
        estimatedTime: '3시간',
        expectedEffects: ['점심시간 매출 증대', '고객 만족도 상승', '운영 효율성 향상'],
        type: 'timing'
      }
    ],
    analysis: [
      {
        title: '주간 매출 패턴 분석 리포트',
        description: '요일별, 시간대별 매출 데이터를 분석하여 운영 최적화 방안을 찾으세요',
        reason: '데이터 기반의 의사결정으로 효율적인 매장 운영이 가능합니다',
        priority: 'medium',
        estimatedTime: '2시간/주',
        expectedEffects: ['운영 효율성 향상', '재고 관리 최적화', '인력 배치 개선'],
        type: 'analysis'
      }
    ]
  }
  
  return samples[categoryId] || []
}

// 컴포넌트 마운트시 초기 데이터 로드
onMounted(async () => {
  await generateTodayRecommendation()
})
</script>

<style scoped>
.gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.recommendation-category-card {
  transition: all 0.3s;
  cursor: pointer;
  border: 2px solid transparent;
}

.recommendation-category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.recommendation-category-card.selected {
  border-color: #1976D2;
  background-color: #E3F2FD;
}

.recommendation-item-card {
  transition: all 0.3s;
  height: 100%;
}

.recommendation-item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.1);
}
</style>