//* src/views/DashboardView.vue
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
                  안녕하세요, {{ authStore.user?.name || '사용자' }}님! 👋
                </h2>
                <p class="text-white opacity-90 mb-0">오늘도 성공적인 마케팅을 위해 함께해요</p>
              </div>
              <v-img src="/images/ai-character.png" max-width="80" class="ml-4" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 주요 지표 카드 -->
    <v-row class="mb-4">
      <v-col v-for="metric in dashboardMetrics" :key="metric.title" cols="6" md="3">
        <v-card elevation="2" class="h-100">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between mb-2">
              <v-icon :color="metric.color" size="24">{{ metric.icon }}</v-icon>
              <v-chip
                :color="
                  metric.trend === 'up' ? 'success' : metric.trend === 'down' ? 'error' : 'warning'
                "
                size="small"
                variant="tonal"
              >
                <v-icon size="16" class="mr-1">
                  {{
                    metric.trend === 'up'
                      ? 'mdi-trending-up'
                      : metric.trend === 'down'
                      ? 'mdi-trending-down'
                      : 'mdi-minus'
                  }}
                </v-icon>
                {{ metric.change }}
              </v-chip>
            </div>
            <h3 class="text-h6 font-weight-bold mb-1">{{ metric.value }}</h3>
            <p class="text-body-2 text-grey mb-0">{{ metric.title }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 빠른 액션 -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="pb-2">빠른 액션</v-card-title>
          <v-card-text>
            <v-row>
              <v-col v-for="action in quickActions" :key="action.title" cols="6" md="3">
                <v-card
                  :color="action.color"
                  variant="tonal"
                  class="text-center"
                  @click="action.action"
                  style="cursor: pointer"
                >
                  <v-card-text class="pa-4">
                    <v-icon :color="action.color" size="32" class="mb-2">
                      {{ action.icon }}
                    </v-icon>
                    <div class="text-body-2 font-weight-medium">
                      {{ action.title }}
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- AI 추천 -->
    <v-row class="mb-4">
      <v-col cols="12" md="8">
        <v-card elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-robot</v-icon>
            AI 마케팅 추천
            <v-spacer />
            <v-btn icon size="small" @click="refreshAIRecommendations" :loading="aiLoading">
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <div v-if="aiRecommendations.length > 0">
              <v-alert
                v-for="recommendation in aiRecommendations"
                :key="recommendation.title"
                :type="recommendation.type"
                :icon="recommendation.icon"
                variant="tonal"
                class="mb-3"
              >
                <v-alert-title>{{ recommendation.title }}</v-alert-title>
                {{ recommendation.content }}
              </v-alert>
            </div>
            <div v-else class="text-center pa-4">
              <v-icon size="48" color="grey-lighten-2">mdi-robot</v-icon>
              <p class="text-grey mt-2">AI 추천을 불러오는 중...</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 최근 활동 -->
      <v-col cols="12" md="4">
        <v-card elevation="2">
          <v-card-title>최근 활동</v-card-title>
          <v-card-text>
            <div v-if="recentActivities.length > 0">
              <div
                v-for="activity in recentActivities"
                :key="activity.id"
                class="d-flex align-center mb-3"
              >
                <v-avatar :color="activity.color" size="32" class="mr-3">
                  <v-icon color="white" size="16">{{ activity.icon }}</v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-body-2 font-weight-medium">
                    {{ activity.title }}
                  </div>
                  <div class="text-caption text-grey">
                    {{ formatRelativeTime(activity.timestamp) }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center pa-4">
              <v-icon size="48" color="grey-lighten-2">mdi-history</v-icon>
              <p class="text-grey mt-2">최근 활동이 없습니다</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 로딩 오버레이 -->
    <v-overlay v-if="loading" class="align-center justify-center">
      <v-progress-circular color="primary" indeterminate size="64" />
    </v-overlay>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth' // 수정된 import
import { useAppStore } from '@/store/app' // 추가된 import
import { formatCurrency, formatNumber, formatRelativeTime } from '@/utils/formatters'

/**
 * 대시보드 메인 페이지
 */

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

// 반응형 데이터
const loading = ref(false)
const aiLoading = ref(false)

// 대시보드 지표
const dashboardMetrics = ref([
  {
    title: '오늘 매출',
    value: '₩567,000',
    change: '+12%',
    trend: 'up',
    icon: 'mdi-cash',
    color: 'success',
  },
  {
    title: '월 매출',
    value: '₩12,340,000',
    change: '+8%',
    trend: 'up',
    icon: 'mdi-chart-line',
    color: 'primary',
  },
  {
    title: '콘텐츠 수',
    value: '24',
    change: '+3',
    trend: 'up',
    icon: 'mdi-file-document',
    color: 'info',
  },
  {
    title: '조회수',
    value: '15.2K',
    change: '+25%',
    trend: 'up',
    icon: 'mdi-eye',
    color: 'warning',
  },
])

// 빠른 액션
const quickActions = ref([
  {
    title: 'SNS 콘텐츠',
    icon: 'mdi-plus-circle',
    color: 'primary',
    action: () => router.push('/content/create?type=sns'),
  },
  {
    title: '포스터 생성',
    icon: 'mdi-image-plus',
    color: 'secondary',
    action: () => router.push('/content/create?type=poster'),
  },
  {
    title: '메뉴 등록',
    icon: 'mdi-food-apple',
    color: 'success',
    action: () => router.push('/menu'),
  },
  {
    title: '매출 분석',
    icon: 'mdi-chart-bar',
    color: 'info',
    action: () => router.push('/sales'),
  },
])

// AI 추천
const aiRecommendations = ref([
  {
    type: 'info',
    icon: 'mdi-weather-rainy',
    title: '날씨 기반 추천',
    content: '오늘은 비가 와서 따뜻한 음식이 인기 있을 것 같아요. 국물 요리를 추천해보세요!',
  },
  {
    type: 'success',
    icon: 'mdi-trending-up',
    title: '트렌드 알림',
    content: '최근 #떡볶이챌린지가 인기입니다. 관련 콘텐츠를 만들어보세요.',
  },
  {
    type: 'warning',
    icon: 'mdi-clock-outline',
    title: '시간대 팁',
    content: '점심시간(12-14시)에 주문이 집중됩니다. 미리 준비하세요.',
  },
])

// 최근 활동
const recentActivities = ref([
  {
    id: 1,
    title: 'SNS 콘텐츠 "떡볶이 신메뉴 출시" 발행',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    icon: 'mdi-instagram',
    color: 'purple',
  },
  {
    id: 2,
    title: '메뉴 "치즈떡볶이" 등록',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    icon: 'mdi-food',
    color: 'orange',
  },
  {
    id: 3,
    title: '매장 정보 업데이트',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    icon: 'mdi-store',
    color: 'blue',
  },
])

// 메서드
const refreshAIRecommendations = async () => {
  try {
    aiLoading.value = true
    // API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1000))
    appStore.showSnackbar('AI 추천이 갱신되었습니다', 'success')
  } catch (error) {
    console.error('AI 추천 갱신 실패:', error)
    appStore.showSnackbar('AI 추천 갱신에 실패했습니다', 'error')
  } finally {
    aiLoading.value = false
  }
}

// 라이프사이클
onMounted(async () => {
  console.log('DashboardView 마운트됨')
  console.log('사용자 정보:', authStore.user)

  try {
    loading.value = true

    // 대시보드 데이터 로드 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 500))

    console.log('대시보드 데이터 로드 완료')
  } catch (error) {
    console.error('대시보드 로드 실패:', error)
    appStore.showSnackbar('대시보드를 불러오는데 실패했습니다', 'error')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}

.h-100 {
  height: 100%;
}

@media (max-width: 600px) {
  .text-h5 {
    font-size: 1.3rem !important;
  }
}
</style>
