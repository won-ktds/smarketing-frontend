<template>
  <v-container fluid class="pa-4">
    <!-- 환영 메시지 -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card class="bg-gradient-primary" elevation="4">
          <v-card-text class="pa-6">
            <div class="d-flex align-center">
              <div class="flex-grow-1">
                <h2 class="text-h5 text-white font-weight-bold mb-2">
                  안녕하세요, {{ authStore.user?.nickname }}님! 👋
                </h2>
                <p class="text-white opacity-90 mb-0">
                  오늘도 성공적인 마케팅을 위해 함께해요
                </p>
              </div>
              <v-img
                src="/images/ai-character.png"
                max-width="80"
                class="ml-4"
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 주요 지표 카드 -->
    <v-row class="mb-4">
      <v-col 
        v-for="metric in dashboardMetrics" 
        :key="metric.title"
        cols="6" 
        md="3"
      >
        <v-card elevation="2" class="h-100">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between mb-2">
              <v-icon :color="metric.color" size="24">{{ metric.icon }}</v-icon>
              <v-chip 
                :color="metric.trend === 'up' ? 'success' : metric.trend === 'down' ? 'error' : 'warning'"
                size="small"
                variant="tonal"
              >
                <v-icon size="16" class="mr-1">
                  {{ metric.trend === 'up' ? 'mdi-trending-up' : 
                     metric.trend === 'down' ? 'mdi-trending-down' : 'mdi-minus' }}
                </v-icon>
                {{ metric.change }}
              </v-chip>
            </div>
            <p class="text-caption text-grey mb-1">{{ metric.title }}</p>
            <h3 class="text-h6 font-weight-bold">{{ metric.value }}</h3>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 빠른 액션 -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="pa-4">
            <v-icon class="mr-2" color="primary">mdi-flash</v-icon>
            빠른 액션
          </v-card-title>
          <v-card-text class="pa-4">
            <v-row>
              <v-col 
                v-for="action in quickActions" 
                :key="action.title"
                cols="6" 
                md="3"
              >
                <v-btn
                  block
                  size="large"
                  :color="action.color"
                  variant="tonal"
                  class="pa-4 flex-column"
                  style="height: 80px;"
                  @click="action.action"
                >
                  <v-icon size="28" class="mb-1">{{ action.icon }}</v-icon>
                  <span class="text-caption">{{ action.title }}</span>
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- AI 추천 & 매출 차트 -->
    <v-row class="mb-4">
      <!-- AI 마케팅 추천 -->
      <v-col cols="12" md="6">
        <v-card elevation="2" class="h-100">
          <v-card-title class="pa-4">
            <v-icon class="mr-2" color="purple">mdi-robot</v-icon>
            AI 마케팅 추천
            <v-spacer />
            <v-btn
              icon
              size="small"
              @click="refreshAIRecommendations"
              :loading="aiLoading"
            >
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text class="pa-4">
            <div v-if="aiRecommendations.length > 0">
              <div 
                v-for="(recommendation, index) in aiRecommendations" 
                :key="index"
                class="mb-4 last:mb-0"
              >
                <v-alert
                  :type="recommendation.type"
                  variant="tonal"
                  class="mb-2"
                >
                  <div class="d-flex align-center">
                    <v-icon class="mr-2">{{ recommendation.icon }}</v-icon>
                    <div class="flex-grow-1">
                      <h4 class="text-subtitle-2 font-weight-bold mb-1">
                        {{ recommendation.title }}
                      </h4>
                      <p class="text-body-2 mb-0">{{ recommendation.content }}</p>
                    </div>
                  </div>
                </v-alert>
              </div>
            </div>
            <div v-else class="text-center pa-4">
              <v-icon size="48" color="grey-lighten-2">mdi-robot-outline</v-icon>
              <p class="text-grey mt-2">AI 추천을 가져오는 중...</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 매출 차트 -->
      <v-col cols="12" md="6">
        <v-card elevation="2" class="h-100">
          <v-card-title class="pa-4">
            <v-icon class="mr-2" color="success">mdi-chart-line</v-icon>
            매출 현황
            <v-spacer />
            <v-select
              v-model="chartPeriod"
              :items="chartPeriods"
              item-title="text"
              item-value="value"
              variant="outlined"
              density="compact"
              hide-details
              style="max-width: 120px;"
              @update:model-value="updateChart"
            />
          </v-card-title>
          <v-card-text class="pa-4">
            <div class="chart-container" style="height: 200px;">
              <canvas ref="salesChart" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 최근 활동 & 콘텐츠 성과 -->
    <v-row>
      <!-- 최근 활동 -->
      <v-col cols="12" md="6">
        <v-card elevation="2" class="h-100">
          <v-card-title class="pa-4">
            <v-icon class="mr-2" color="info">mdi-history</v-icon>
            최근 활동
          </v-card-title>
          <v-card-text class="pa-4">
            <v-list density="compact">
              <v-list-item
                v-for="activity in recentActivities"
                :key="activity.id"
                class="px-0"
              >
                <template v-slot:prepend>
                  <v-avatar :color="activity.color" size="32">
                    <v-icon color="white" size="16">{{ activity.icon }}</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="text-body-2">
                  {{ activity.title }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  {{ formatRelativeTime(activity.timestamp) }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 콘텐츠 성과 -->
      <v-col cols="12" md="6">
        <v-card elevation="2" class="h-100">
          <v-card-title class="pa-4">
            <v-icon class="mr-2" color="orange">mdi-chart-donut</v-icon>
            콘텐츠 성과
          </v-card-title>
          <v-card-text class="pa-4">
            <div v-if="contentPerformance.length > 0">
              <div 
                v-for="content in contentPerformance" 
                :key="content.id"
                class="d-flex align-center justify-space-between py-2"
              >
                <div class="d-flex align-center">
                  <v-chip
                    :color="content.platform === 'instagram' ? 'purple' : 'blue'"
                    size="small"
                    class="mr-2"
                  >
                    {{ content.platform }}
                  </v-chip>
                  <span class="text-body-2">{{ content.title }}</span>
                </div>
                <div class="text-right">
                  <div class="text-caption text-grey">조회수</div>
                  <div class="font-weight-bold">{{ formatNumber(content.views) }}</div>
                </div>
              </div>
            </div>
            <div v-else class="text-center pa-4">
              <v-icon size="48" color="grey-lighten-2">mdi-chart-donut</v-icon>
              <p class="text-grey mt-2">콘텐츠 성과 데이터가 없습니다</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 로딩 오버레이 -->
    <v-overlay v-if="loading" class="align-center justify-center">
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      />
    </v-overlay>
  </v-container>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, useStoreStore } from '@/store/index'
import { formatCurrency, formatNumber, formatRelativeTime } from '@/utils/formatters'

const router = useRouter()
const authStore = useAuthStore()
const storeStore = useStoreStore()

// 반응형 데이터
const loading = ref(false)
const aiLoading = ref(false)
const chartPeriod = ref('week')
const salesChart = ref(null)

// 대시보드 지표
const dashboardMetrics = ref([
  {
    title: '오늘 매출',
    value: '₩567,000',
    change: '+12%',
    trend: 'up',
    icon: 'mdi-cash',
    color: 'success'
  },
  {
    title: '월 매출',
    value: '₩12,340,000',
    change: '+8%',
    trend: 'up',
    icon: 'mdi-chart-line',
    color: 'primary'
  },
  {
    title: '콘텐츠 수',
    value: '24',
    change: '+3',
    trend: 'up',
    icon: 'mdi-file-document',
    color: 'info'
  },
  {
    title: '조회수',
    value: '15.2K',
    change: '+25%',
    trend: 'up',
    icon: 'mdi-eye',
    color: 'warning'
  }
])

// 빠른 액션
const quickActions = ref([
  {
    title: 'SNS 콘텐츠',
    icon: 'mdi-plus-circle',
    color: 'primary',
    action: () => router.push('/content/create?type=sns')
  },
  {
    title: '포스터 생성',
    icon: 'mdi-image-plus',
    color: 'secondary',
    action: () => router.push('/content/create?type=poster')
  },
  {
    title: '메뉴 등록',
    icon: 'mdi-food-apple',
    color: 'success',
    action: () => router.push('/menu')
  },
  {
    title: '매출 분석',
    icon: 'mdi-chart-bar',
    color: 'info',
    action: () => router.push('/sales')
  }
])

// AI 추천
const aiRecommendations = ref([
  {
    type: 'info',
    icon: 'mdi-weather-rainy',
    title: '날씨 기반 추천',
    content: '오늘은 비가 와서 따뜻한 음식이 인기 있을 것 같아요. 국물 요리를 추천해보세요!'
  },
  {
    type: 'success',
    icon: 'mdi-trending-up',
    title: '트렌드 알림',
    content: '최근 #떡볶이챌린지가 인기입니다. 관련 콘텐츠를 만들어보세요.'
  },
  {
    type: 'warning',
    icon: 'mdi-clock-outline',
    title: '시간대 팁',
    content: '점심시간(12-14시)에 주문이 집중됩니다. 미리 준비하세요.'
  }
])

// 차트 기간 옵션
const chartPeriods = ref([
  { text: '일주일', value: 'week' },
  { text: '한달', value: 'month' },
  { text: '3개월', value: 'quarter' }
])

// 최근 활동
const recentActivities = ref([
  {
    id: 1,
    title: 'SNS 콘텐츠 "떡볶이 신메뉴 출시" 발행',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    icon: 'mdi-instagram',
    color: 'purple'
  },
  {
    id: 2,
    title: '메뉴 "치즈떡볶이" 등록',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    icon: 'mdi-food',
    color: 'orange'
  },
  {
    id: 3,
    title: '매장 정보 업데이트',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    icon: 'mdi-store',
    color: 'blue'
  }
])

// 콘텐츠 성과
const contentPerformance = ref([
  {
    id: 1,
    title: '떡볶이 신메뉴 홍보',
    platform: 'instagram',
    views: 1240
  },
  {
    id: 2,
    title: '매장 소개 포스터',
    platform: 'blog',
    views: 850
  },
  {
    id: 3,
    title: '할인 이벤트 안내',
    platform: 'instagram',
    views: 2100
  }
])

// 메서드
const refreshAIRecommendations = async () => {
  try {
    aiLoading.value = true
    // API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1000))
    // AI 추천 데이터 갱신 로직
  } catch (error) {
    console.error('AI 추천 갱신 실패:', error)
  } finally {
    aiLoading.value = false
  }
}

const updateChart = () => {
  // 차트 업데이트 로직
  console.log('차트 업데이트:', chartPeriod.value)
}

const initChart = () => {
  // Chart.js를 사용한 차트 초기화 로직
  // 실제 구현에서는 Chart.js 라이브러리 사용
  console.log('차트 초기화')
}

// 라이프사이클
onMounted(async () => {
  try {
    loading.value = true
    
    // 대시보드 데이터 로드
    await Promise.all([
      // 매장 정보 로드 (필요시)
      // storeStore.fetchStoreInfo(),
      // AI 추천 로드
      // refreshAIRecommendations()
    ])
    
    // 차트 초기화
    await nextTick()
    initChart()
  } catch (error) {
    console.error('대시보드 로드 실패:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
}

.h-100 {
  height: 100%;
}

.chart-container {
  position: relative;
}

@media (max-width: 600px) {
  .text-h5 {
    font-size: 1.3rem !important;
  }
}
</style>