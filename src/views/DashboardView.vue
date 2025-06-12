//* src/views/DashboardView.vue
<template>
  <v-container fluid class="pa-4">
    <!-- 페이지 헤더 -->
    <div class="d-flex align-center justify-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold text-grey-darken-4">대시보드</h1>
        <p class="text-body-1 text-grey-darken-1 mb-0">
          {{ businessName }}의 실시간 현황을 확인하세요
        </p>
      </div>
      <v-chip :color="'success'" variant="flat" class="text-body-2 font-weight-medium">
        <v-icon start size="16">mdi-circle</v-icon>
        실시간 업데이트
      </v-chip>
    </div>

    <!-- 주요 지표 카드 - 새로운 스타일 적용 (3개 카드) -->
    <v-row class="mb-6">
      <v-col
        v-for="(metric, index) in dashboardMetrics"
        :key="metric.title"
        cols="12"
        sm="4"
        md="4"
      >
        <v-card
          class="metric-card h-100"
          :class="`metric-card--${metric.color}`"
          elevation="0"
          border
        >
          <v-card-text class="pa-6">
            <!-- 카드 헤더 -->
            <div class="d-flex align-center justify-between mb-3">
              <div class="metric-icon-wrapper" :class="`bg-${metric.color}`">
                <v-icon :icon="metric.icon" size="24" :color="`${metric.color}-darken-2`" />
              </div>
              <v-chip
                :color="
                  metric.trend === 'up' ? 'success' : metric.trend === 'down' ? 'error' : 'warning'
                "
                size="small"
                variant="tonal"
                class="metric-trend"
              >
                <v-icon size="12" class="mr-1">
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

            <!-- 메트릭 값 - 애니메이션 적용 -->
            <div class="metric-value-wrapper mb-2">
              <span
                class="metric-value text-h4 font-weight-bold"
                :class="`text-${metric.color}-darken-2`"
                :ref="`metricValue${index}`"
              >
                {{ animatedValues[index] || '0' }}
              </span>
            </div>

            <!-- 메트릭 제목 -->
            <p class="metric-title text-body-2 text-grey-darken-1 mb-0 font-weight-medium">
              {{ metric.title }}
            </p>

            <!-- 추가 정보 -->
            <div class="metric-detail mt-2">
              <span class="text-caption text-grey">
                {{ metric.detail || '전월 대비' }}
              </span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 매출 추이 분석 차트 -->
    <v-row class="mb-6">
      <v-col cols="12" lg="8">
        <v-card elevation="0" border class="chart-card h-100">
          <v-card-title class="pa-6 pb-0">
            <div class="d-flex align-center justify-between w-100">
              <div>
                <h3 class="text-h6 font-weight-bold mb-1">매출 추이 분석</h3>
                <p class="text-body-2 text-grey-darken-1 mb-0">최근 7일간 매출 현황</p>
              </div>
              <v-btn-toggle
                v-model="chartPeriod"
                variant="outlined"
                density="compact"
                color="primary"
                rounded="lg"
                @update:model-value="updateChart"
              >
                <v-btn value="7d" size="small">7일</v-btn>
                <v-btn value="30d" size="small">30일</v-btn>
                <v-btn value="90d" size="small">90일</v-btn>
              </v-btn-toggle>
            </div>
          </v-card-title>
          <v-card-text class="pa-6">
            <div class="sales-chart-container">
              <!-- Chart.js 차트가 들어갈 영역 -->
              <canvas id="salesChart" class="sales-chart" style="height: 300px"></canvas>

              <!-- Chart.js 없을 때 표시될 플레이스홀더 -->
              <div v-if="!chartInitialized" class="chart-placeholder">
                <v-icon size="64" color="grey-lighten-2">mdi-chart-line</v-icon>
                <p class="text-grey mt-2 mb-1">매출 추이 차트</p>
                <p class="text-caption text-grey">Chart.js를 설치하면 실제 차트가 표시됩니다</p>

                <!-- 간단한 가짜 차트 -->
                <div class="fake-chart mt-4">
                  <div class="fake-chart-bars">
                    <div v-for="(value, i) in fakeChartData" :key="i" class="fake-bar">
                      <div class="fake-bar-fill" :style="{ height: `${value}%` }"></div>
                      <span class="fake-bar-label">{{ i + 1 }}일</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- AI 추천 요약 -->
      <v-col cols="12" lg="4">
        <v-card elevation="0" border class="ai-recommend-card h-100">
          <v-card-title class="pa-6 pb-0">
            <div class="d-flex align-center mb-1">
              <v-icon color="primary" class="mr-2">mdi-robot</v-icon>
              <h3 class="text-h6 font-weight-bold">AI 추천 활용</h3>
            </div>
            <p class="text-body-2 text-grey-darken-1 mb-0">맞춤형 마케팅 제안</p>
          </v-card-title>
          <v-card-text class="pa-6">
            <div v-if="aiLoading" class="text-center py-8">
              <v-progress-circular color="primary" indeterminate size="40" />
              <p class="text-body-2 text-grey mt-3">AI가 분석 중...</p>
            </div>
            <div v-else>
              <div
                v-for="(recommendation, index) in aiRecommendations"
                :key="index"
                class="ai-recommendation-item mb-4"
              >
                <v-alert
                  :type="recommendation.type"
                  variant="tonal"
                  density="compact"
                  :icon="recommendation.icon"
                  class="mb-0"
                >
                  <v-alert-title class="text-subtitle-2 font-weight-bold mb-1">
                    {{ recommendation.title }}
                  </v-alert-title>
                  <div class="text-body-2">
                    {{ recommendation.content }}
                  </div>
                </v-alert>
              </div>

              <v-btn
                color="primary"
                variant="outlined"
                block
                size="small"
                class="mt-2"
                @click="router.push('/recommend')"
              >
                <v-icon start>mdi-lightbulb-on</v-icon>
                더 많은 추천 보기
              </v-btn>
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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useAppStore } from '@/store/app'
import { formatCurrency, formatNumber, formatRelativeTime } from '@/utils/formatters'

/**
 * 대시보드 메인 페이지 - 수정된 버전
 * - 새로운 카드 스타일 적용
 * - 숫자 증가 애니메이션 추가
 * - 빠른 액션 제거
 * - 매출 추이 분석 차트 추가
 * - 최근 활동 제거
 */

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

// 반응형 데이터
const loading = ref(false)
const aiLoading = ref(false)
const chartInitialized = ref(false)
const chartPeriod = ref('7d')
const animatedValues = ref({})

// 비즈니스 정보
const businessName = ref('김사장님의 분식점')

// 대시보드 지표 - 새로운 스타일 적용 (AI 추천 활용 카드 제거)
const dashboardMetrics = ref([
  {
    title: '오늘의 매출',
    value: 123000,
    displayValue: '₩123,000',
    change: '+15%',
    trend: 'up',
    icon: 'mdi-cash-multiple',
    color: 'success',
    detail: '목표 달성률: 85%',
  },
  {
    title: '이번 달 매출',
    value: 2450000,
    displayValue: '₩2,450,000',
    change: '+8%',
    trend: 'up',
    icon: 'mdi-trending-up',
    color: 'primary',
    detail: '목표까지 ₩450,000',
  },
  {
    title: '일일 조회수',
    value: 1234,
    displayValue: '1,234',
    change: '+23%',
    trend: 'up',
    icon: 'mdi-eye',
    color: 'warning',
    detail: '참여율: 4.2%',
  },
])

// AI 추천 (간소화)
const aiRecommendations = ref([
  {
    type: 'info',
    icon: 'mdi-weather-rainy',
    title: '날씨 기반 추천',
    content: '오늘은 비가 와서 따뜻한 음식이 인기 있을 것 같아요.',
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
    content: '점심시간(12-14시)에 주문이 집중됩니다.',
  },
])

// 가짜 차트 데이터 (Chart.js 없을 때 표시용)
const fakeChartData = ref([65, 78, 82, 45, 90, 67, 88])

// 숫자 애니메이션 함수
const animateNumber = (targetValue, index, duration = 2000) => {
  const startValue = 0
  const startTime = Date.now()

  const updateValue = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)

    // easeOutCubic 애니메이션
    const easedProgress = 1 - Math.pow(1 - progress, 3)
    const currentValue = Math.floor(startValue + (targetValue - startValue) * easedProgress)

    // 숫자 형식에 따라 표시
    if (typeof targetValue === 'number') {
      if (index === 0 || index === 1) {
        // 매출 - 원화 표시
        animatedValues.value[index] = `₩${currentValue.toLocaleString()}`
      } else {
        // 일반 숫자 (조회수 등)
        animatedValues.value[index] = currentValue.toLocaleString()
      }
    }

    if (progress < 1) {
      requestAnimationFrame(updateValue)
    }
  }

  updateValue()
}

// 모든 지표 애니메이션 시작
const startMetricsAnimation = () => {
  dashboardMetrics.value.forEach((metric, index) => {
    setTimeout(() => {
      animateNumber(metric.value, index, 1500 + index * 200)
    }, index * 300)
  })
}

// 차트 업데이트
const updateChart = (period) => {
  console.log('차트 기간 변경:', period)
  // Chart.js 구현 시 여기에 차트 업데이트 로직 추가
}

// Chart.js 초기화 (설치 후 사용)
/*
const initSalesChart = () => {
  const ctx = document.getElementById('salesChart')
  if (ctx && window.Chart) {
    chartInitialized.value = true
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['6일전', '5일전', '4일전', '3일전', '2일전', '어제', '오늘'],
        datasets: [{
          label: '매출액',
          data: [390000, 425000, 520000, 380000, 450000, 520000, 567000],
          borderColor: '#1976D2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#1976D2',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#1976D2',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                return '매출: ₩' + context.parsed.y.toLocaleString()
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#666666'
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              color: '#666666',
              callback: function(value) {
                return '₩' + (value / 1000) + 'K'
              }
            }
          }
        }
      }
    })
  }
}
*/

// 데이터 새로고침
const refreshData = async () => {
  try {
    loading.value = true

    // API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log('대시보드 데이터 새로고침 완료')
  } catch (error) {
    console.error('데이터 새로고침 실패:', error)
    appStore.showSnackbar('데이터를 불러오는데 실패했습니다.', 'error')
  } finally {
    loading.value = false
  }
}

// 라이프사이클
onMounted(async () => {
  console.log('DashboardView 마운트됨')

  try {
    // 초기 데이터 로드
    await refreshData()

    // 지표 애니메이션 시작
    setTimeout(() => {
      startMetricsAnimation()
    }, 500)

    // Chart.js 초기화 (설치 후 주석 해제)
    // setTimeout(() => {
    //   initSalesChart()
    // }, 1000)
  } catch (error) {
    console.error('대시보드 초기화 실패:', error)
  }
})

onBeforeUnmount(() => {
  // 애니메이션 정리
  animatedValues.value = {}
})
</script>

<style scoped>
/* 메트릭 카드 스타일 */
.metric-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--v-theme-primary), var(--v-theme-primary-lighten-1));
}

.metric-card--success::before {
  background: linear-gradient(90deg, var(--v-theme-success), var(--v-theme-success-lighten-1));
}

.metric-card--warning::before {
  background: linear-gradient(90deg, var(--v-theme-warning), var(--v-theme-warning-lighten-1));
}

.metric-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.1;
}

.metric-value {
  font-size: 2rem !important;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.metric-trend {
  font-size: 0.75rem;
  font-weight: 600;
}

.metric-title {
  font-size: 0.875rem;
  line-height: 1.4;
}

.metric-detail {
  font-size: 0.75rem;
  opacity: 0.7;
}

/* 차트 카드 스타일 */
.chart-card {
  transition: all 0.3s ease;
}

.chart-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
}

.sales-chart-container {
  position: relative;
  height: 300px;
}

.sales-chart {
  width: 100% !important;
  height: 100% !important;
}

.chart-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  border: 2px dashed #e2e8f0;
}

/* 가짜 차트 스타일 */
.fake-chart {
  width: 100%;
  max-width: 300px;
}

.fake-chart-bars {
  display: flex;
  align-items: end;
  gap: 8px;
  height: 60px;
  padding: 0 16px;
}

.fake-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.fake-bar-fill {
  width: 100%;
  background: linear-gradient(to top, #1976d2, #42a5f5);
  border-radius: 2px 2px 0 0;
  transition: all 0.3s ease;
  animation: barGrow 1s ease-out forwards;
  transform-origin: bottom;
}

.fake-bar-label {
  font-size: 0.7rem;
  color: #666;
  margin-top: 4px;
}

@keyframes barGrow {
  from {
    transform: scaleY(0);
  }
  to {
    transform: scaleY(1);
  }
}

/* AI 추천 카드 스타일 */
.ai-recommend-card {
  transition: all 0.3s ease;
}

.ai-recommend-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
}

.ai-recommendation-item {
  transition: all 0.2s ease;
}

.ai-recommendation-item:hover {
  transform: translateX(2px);
}

/* 반응형 디자인 */
@media (max-width: 960px) {
  .metric-value {
    font-size: 1.75rem !important;
  }

  .metric-icon-wrapper {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 600px) {
  .metric-value {
    font-size: 1.5rem !important;
  }

  .chart-placeholder {
    padding: 16px;
  }

  .fake-chart-bars {
    height: 40px;
  }
}

/* 다크 테마 지원 */
.v-theme--dark .metric-card {
  background-color: rgb(var(--v-theme-surface-variant));
}

.v-theme--dark .chart-placeholder {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-color: #334155;
}

.v-theme--dark .fake-bar-fill {
  background: linear-gradient(to top, #60a5fa, #93c5fd);
}
</style>
