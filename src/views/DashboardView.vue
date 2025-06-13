//* src/views/DashboardView.vue
<template>
  <div>
    <!-- 메인 컨텐츠 -->
    <v-container fluid class="pa-4">
      <!-- 주요 지표 카드 - 아이콘을 카드 맨 오른쪽으로 이동 -->
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
            <v-card-text class="pa-6 position-relative">
              <!-- 아이콘을 카드 맨 오른쪽 상단에 절대 위치로 배치 -->
              <div class="metric-icon-wrapper-absolute" :class="`bg-${metric.color}`">
                <v-icon :icon="metric.icon" size="20" :color="`${metric.color}-darken-2`" />
              </div>

              <!-- 제목 -->
              <div class="mb-2">
                <h4 class="metric-title text-subtitle-1 font-weight-bold">
                  {{ metric.title }}
                </h4>
              </div>

              <!-- 증감율 -->
              <div class="mb-3">
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

              <!-- 메트릭 값 -->
              <div class="metric-value-wrapper mb-2">
                <span
                  class="metric-value text-h4 font-weight-bold"
                  :class="`text-${metric.color}-darken-2`"
                  :ref="`metricValue${index}`"
                >
                  {{ animatedValues[index] || '0' }}
                </span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 매출 추이 분석 차트 - 명확한 임시 데이터로 구성 -->
      <v-row class="mb-6">
        <v-col cols="12" lg="8">
          <v-card elevation="0" border class="chart-card h-100">
            <v-card-title class="pa-6 pb-0">
              <div class="d-flex align-center justify-between w-100">
                <div>
                  <h3 class="text-h6 font-weight-bold mb-1">📊 매출 추이 분석</h3>
                  <p class="text-body-2 text-grey-darken-1 mb-0">
                    최근 {{ getCurrentPeriodLabel() }}간 매출 현황
                  </p>
                </div>
                <v-btn-toggle class="d-flex align-center justify-end w-100"
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
                <!-- 실제 같은 차트 구현 -->
                <div class="real-chart">
                  <!-- 차트 헤더 정보 -->
                  <div class="chart-header-info mb-4">
                    <div class="d-flex justify-between align-center">

                      <div class="chart-legend d-flex">
                        <div class="legend-item mr-4">
                          <span class="legend-dot" style="background: #1976D2;"></span>
                          <span class="text-caption">실제 매출</span>
                        </div>
                        <div class="legend-item">
                          <span class="legend-dot" style="background: #FF5722;"></span>
                          <span class="text-caption">목표 매출</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 차트 영역 -->
                  <div class="chart-area" style="height: 300px; position: relative;">
                    <!-- Y축 라벨 -->
                    <div class="y-axis-labels">
                      <div v-for="(label, i) in yAxisLabels" :key="i" 
                           class="y-label" 
                           :style="{ bottom: `${i * 20}%` }">
                        {{ label }}
                      </div>
                    </div>

                    <!-- 그리드 -->
                    <div class="chart-grid">
                      <div v-for="i in 6" :key="i" 
                           class="grid-line" 
                           :style="{ bottom: `${(i-1) * 20}%` }"></div>
                    </div>

                    <!-- 실제 라인 차트 (Canvas 활용) -->
                    <canvas 
                      ref="chartCanvas" 
                      class="chart-canvas"
                      width="800" 
                      height="300"
                      @mousemove="handleMouseMove"
                      @mouseleave="hideTooltip">
                    </canvas>

                    <!-- 데이터 포인트 -->
                    <div class="data-points">
                      <div 
                        v-for="(point, i) in chartDataPoints" 
                        :key="i"
                        class="data-point"
                        :style="{ 
                          left: `${point.x}%`, 
                          bottom: `${point.y}%` 
                        }"
                        @mouseenter="showDataTooltip(i, $event)"
                        @mouseleave="hideDataTooltip">
                        <div class="point-circle sales-point"></div>
                        <div class="point-circle target-point" 
                             :style="{ bottom: `${point.targetY - point.y}%` }"></div>
                      </div>
                    </div>

                    <!-- 툴팁 -->
                    <div v-if="tooltip.show" 
                         class="chart-tooltip" 
                         :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }">
                      <div class="tooltip-content">
                        <div class="tooltip-title">{{ tooltip.title }}</div>
                        <div class="tooltip-sales">매출: {{ formatCurrency(tooltip.sales) }}</div>
                        <div class="tooltip-target">목표: {{ formatCurrency(tooltip.target) }}</div>
                      </div>
                    </div>
                  </div>

                  <!-- X축 라벨 - 데이터 포인트와 동일한 위치에 배치 -->
                  <div class="x-axis-labels mt-3" style="position: relative; height: 20px;">
                    <div class="x-axis-container" style="position: relative; padding-left: 60px; padding-right: 20px;">
                      <span 
                        v-for="(point, index) in chartDataPoints" 
                        :key="index" 
                        class="x-label text-caption"
                        :style="{ 
                          position: 'absolute',
                          left: `${point.x}%`,
                          transform: 'translateX(-50%)',
                          textAlign: 'center',
                          whiteSpace: 'nowrap'
                        }"
                      >
                        {{ currentChartData[index].label }}
                      </span>
                    </div>
                  </div>

                  <!-- 차트 통계 정보 -->
                  <div class="chart-stats mt-4 pa-3" style="background: #F5F5F5; border-radius: 8px;">
                    <v-row>
                      <v-col cols="4" class="text-center">
                        <div class="text-caption text-grey-darken-1">평균 매출</div>
                        <div class="text-subtitle-2 font-weight-bold text-primary">{{ avgSales }}</div>
                      </v-col>
                      <v-col cols="4" class="text-center">
                        <div class="text-caption text-grey-darken-1">최고 매출</div>
                        <div class="text-subtitle-2 font-weight-bold text-success">{{ maxSales }}</div>
                      </v-col>
                      <v-col cols="4" class="text-center">
                        <div class="text-caption text-grey-darken-1">목표 달성률</div>
                        <div class="text-subtitle-2 font-weight-bold" 
                             :class="achievementRate >= 100 ? 'text-success' : 'text-warning'">
                          {{ achievementRate }}%
                        </div>
                      </v-col>
                    </v-row>
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
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- 로그아웃 확인 다이얼로그 -->
    <v-dialog v-model="logoutDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">로그아웃 확인</v-card-title>
        <v-card-text>정말 로그아웃 하시겠습니까?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="logoutDialog = false">취소</v-btn>
          <v-btn color="error" variant="text" @click="confirmLogout">로그아웃</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useAppStore } from '@/store/app'
import { formatCurrency, formatNumber, formatRelativeTime } from '@/utils/formatters'

/**
 * 대시보드 메인 페이지 - App.vue의 단일 AppBar 사용
 * - 중복된 AppBar 제거 (App.vue에서 제공)
 * - 로그아웃 확인 다이얼로그 유지
 * - 메인 컨텐츠는 그대로 유지
 */

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

// 반응형 데이터
const loading = ref(false)
const aiLoading = ref(false)
const chartPeriod = ref('7d')
const animatedValues = ref({})
const logoutDialog = ref(false)
const chartCanvas = ref(null)
const currentTime = ref('')

// 툴팁 관련
const tooltip = ref({
  show: false,
  x: 0,
  y: 0,
  title: '',
  sales: 0,
  target: 0
})

// 대시보드 지표 - 제목과 증감율 위치 변경
const dashboardMetrics = ref([
  {
    title: '오늘의 매출',
    value: 567000,
    displayValue: '₩567,000',
    change: '전일 대비 +15%',
    trend: 'up',
    icon: 'mdi-cash-multiple',
    color: 'success'
  },
  {
    title: '이번 달 매출',
    value: 12450000,
    displayValue: '₩12,450,000',
    change: '전월 대비 +8%',
    trend: 'up',
    icon: 'mdi-trending-up',
    color: 'primary'
  },
  {
    title: '일일 조회수',
    value: 2547,
    displayValue: '2,547',
    change: '전일 대비 +23%',
    trend: 'up',
    icon: 'mdi-eye',
    color: 'warning'
  },
])

// 실제 차트 데이터 (더 구체적이고 현실적인 데이터)
const chartData = ref({
  '7d': [
    { label: '6일전', sales: 45, target: 50, date: '06-04' },
    { label: '5일전', sales: 52, target: 50, date: '06-05' },
    { label: '4일전', sales: 38, target: 50, date: '06-06' },
    { label: '3일전', sales: 65, target: 50, date: '06-07' },
    { label: '2일전', sales: 48, target: 50, date: '06-08' },
    { label: '어제', sales: 72, target: 50, date: '06-09' },
    { label: '오늘', sales: 57, target: 50, date: '06-10' },
  ],
  '30d': [
    { label: '1주차', sales: 320, target: 350, date: '5/13-19' },
    { label: '2주차', sales: 385, target: 350, date: '5/20-26' },
    { label: '3주차', sales: 425, target: 350, date: '5/27-6/2' },
    { label: '4주차', sales: 468, target: 350, date: '6/3-9' },
    { label: '이번주', sales: 380, target: 350, date: '6/10-16' },
  ],
  '90d': [
    { label: '3월', sales: 1250, target: 1400, date: '2024-03' },
    { label: '4월', sales: 1380, target: 1400, date: '2024-04' },
    { label: '5월', sales: 1520, target: 1400, date: '2024-05' },
    { label: '6월', sales: 1450, target: 1400, date: '2024-06' },
  ],
})

// Y축 라벨
const yAxisLabels = ref(['0', '25', '50', '75', '100'])

// AI 추천
const aiRecommendations = ref([
  {
    type: 'info',
    icon: 'mdi-weather-sunny',
    title: '날씨 기반 추천',
    content: '오늘은 맑은 날씨로 야외 테이크아웃 주문이 증가할 예정입니다.',
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
    content: '점심시간(12-14시) 주문 집중. 미리 재료를 준비하세요.',
  },
])

// 계산된 속성들
const currentChartData = computed(() => chartData.value[chartPeriod.value])

// 수정된 chartDataPoints - 차트 컨테이너의 실제 여백을 고려
const chartDataPoints = computed(() => {
  const data = currentChartData.value
  const maxSales = Math.max(...data.map(d => Math.max(d.sales, d.target)))
  
  return data.map((item, index) => {
    // 차트 영역의 실제 너비를 고려한 위치 계산
    // 차트 컨테이너에서 Y축 라벨 영역(60px)과 오른쪽 여백(20px)을 제외한 영역에서 계산
    const chartStartPercent = 8  // 차트 시작 지점 (약간의 여백)
    const chartEndPercent = 92   // 차트 끝 지점 (약간의 여백)
    const chartWidth = chartEndPercent - chartStartPercent
    
    return {
      x: chartStartPercent + (index * chartWidth / (data.length - 1)),
      y: 10 + ((item.sales / maxSales) * 80), // 10%에서 90%까지 높이
      targetY: 10 + ((item.target / maxSales) * 80),
      sales: item.sales,
      target: item.target,
      label: item.label
    }
  })
})

const avgSales = computed(() => {
  const data = currentChartData.value
  const avg = data.reduce((sum, item) => sum + item.sales, 0) / data.length
  const unit = chartPeriod.value === '90d' ? 100 : chartPeriod.value === '30d' ? 10 : 1
  return formatCurrency(avg * unit * 10000)
})

const maxSales = computed(() => {
  const data = currentChartData.value
  const max = Math.max(...data.map(d => d.sales))
  const unit = chartPeriod.value === '90d' ? 100 : chartPeriod.value === '30d' ? 10 : 1
  return formatCurrency(max * unit * 10000)
})

const achievementRate = computed(() => {
  const data = currentChartData.value
  const totalSales = data.reduce((sum, item) => sum + item.sales, 0)
  const totalTarget = data.reduce((sum, item) => sum + item.target, 0)
  return Math.round((totalSales / totalTarget) * 100)
})

// 현재 기간 라벨
const getCurrentPeriodLabel = () => {
  switch (chartPeriod.value) {
    case '7d': return '7일'
    case '30d': return '30일'
    case '90d': return '90일'
    default: return '7일'
  }
}

// 시간 업데이트
const updateTime = () => {
  const now = new Date()
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }
  currentTime.value = now.toLocaleString('ko-KR', options)
}

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

// 차트 그리기
const drawChart = async () => {
  await nextTick()
  
  if (!chartCanvas.value) return
  
  const canvas = chartCanvas.value
  const ctx = canvas.getContext('2d')
  const data = currentChartData.value
  
  // 캔버스 초기화
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  const padding = 60
  const chartWidth = canvas.width - padding * 2
  const chartHeight = canvas.height - padding * 2
  
  const maxValue = Math.max(...data.map(d => Math.max(d.sales, d.target)))
  
  // 매출 라인 그리기
  ctx.beginPath()
  ctx.strokeStyle = '#1976D2'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  
  data.forEach((item, index) => {
    const x = padding + (index * chartWidth / (data.length - 1))
    const y = padding + chartHeight - ((item.sales / maxValue) * chartHeight)
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  ctx.stroke()
  
  // 목표 라인 그리기
  ctx.beginPath()
  ctx.strokeStyle = '#FF5722'
  ctx.lineWidth = 2
  ctx.setLineDash([5, 5])
  
  data.forEach((item, index) => {
    const x = padding + (index * chartWidth / (data.length - 1))
    const y = padding + chartHeight - ((item.target / maxValue) * chartHeight)
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  ctx.stroke()
  ctx.setLineDash([])
}

// 차트 업데이트
const updateChart = async (period) => {
  console.log('차트 기간 변경:', period)
  await nextTick()
  drawChart()
}

// 툴팁 표시
const showDataTooltip = (index, event) => {
  const data = currentChartData.value[index]
  const unit = chartPeriod.value === '90d' ? 100 : chartPeriod.value === '30d' ? 10 : 1
  
  tooltip.value = {
    show: true,
    x: event.clientX,
    y: event.clientY - 80,
    title: data.label,
    sales: data.sales * unit * 10000,
    target: data.target * unit * 10000
  }
}

const hideDataTooltip = () => {
  tooltip.value.show = false
}

const handleMouseMove = (event) => {
  // 차트 위 마우스 이동 처리
}

const hideTooltip = () => {
  tooltip.value.show = false
}

// 로그아웃 핸들러 (App.vue의 로그아웃 버튼과 연결 가능)
const handleLogout = () => {
  logoutDialog.value = true
}

const confirmLogout = () => {
  try {
    // 로그아웃 처리
    authStore.logout()
    appStore.showSnackbar('로그아웃되었습니다.', 'success')
    router.push('/login')
  } catch (error) {
    console.error('로그아웃 실패:', error)
    appStore.showSnackbar('로그아웃에 실패했습니다.', 'error')
  } finally {
    logoutDialog.value = false
  }
}

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

// 로그아웃 함수를 전역에서 호출할 수 있도록 노출 (App.vue에서 사용 가능)
defineExpose({
  handleLogout
})

// 라이프사이클
onMounted(async () => {
  console.log('DashboardView 마운트됨')

  try {
    // 시간 업데이트
    updateTime()
    setInterval(updateTime, 60000) // 1분마다 업데이트

    // 초기 데이터 로드
    await refreshData()

    // 지표 애니메이션 시작
    setTimeout(() => {
      startMetricsAnimation()
    }, 500)

    // 차트 그리기
    setTimeout(() => {
      drawChart()
    }, 1000)
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
/* 메트릭 카드 스타일 - 수정된 버전 */
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

/* 아이콘을 카드 맨 오른쪽 상단에 절대 위치로 배치 */
.metric-icon-wrapper-absolute {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.15;
  z-index: 1;
}

.metric-title {
  color: var(--v-theme-on-surface);
  font-weight: 600;
  padding-right: 48px; /* 아이콘 공간 확보 */
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
  height: 100%;
}

/* 실제 차트 스타일 */
.real-chart {
  width: 100%;
  height: 100%;
}

.chart-header-info {
  padding-bottom: 10px;
  border-bottom: 1px solid #E5E7EB;
}

.chart-legend {
  display: flex;
  align-items: center;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: #6B7280;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 4px;
}

.chart-area {
  position: relative;
  background: linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%);
  border: 1px solid #E5E7EB;
  border-radius: 8px;
}

.y-axis-labels {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 40px;
}

.y-label {
  position: absolute;
  font-size: 0.7rem;
  color: #6B7280;
  transform: translateY(-50%);
}

.chart-grid {
  position: absolute;
  left: 40px;
  right: 0;
  top: 0;
  bottom: 0;
}

.grid-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: #E5E7EB;
}

.chart-canvas {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.data-points {
  position: absolute;
  left: 40px;
  right: 0;
  top: 0;
  bottom: 0;
}

.data-point {
  position: absolute;
  transform: translate(-50%, 50%);
}

.point-circle {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  position: absolute;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sales-point {
  background: #1976D2;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(25, 118, 210, 0.3);
}

.target-point {
  background: #FF5722;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(255, 87, 34, 0.3);
}

.point-circle:hover {
  transform: scale(1.5);
}

/* 수정된 X축 라벨 스타일 */
.x-axis-labels {
  position: relative;
  margin-top: 12px;
}

.x-axis-container {
  position: relative;
  width: 100%;
}

.x-label {
  font-size: 0.75rem;
  color: #6B7280;
  min-width: 40px;
  display: inline-block;
}

/* 툴팁 스타일 */
.chart-tooltip {
  position: fixed;
  z-index: 1000;
  pointer-events: none;
}

.tooltip-content {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.tooltip-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.tooltip-sales,
.tooltip-target {
  margin: 2px 0;
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

  .metric-icon-wrapper-absolute {
    width: 36px;
    height: 36px;
    top: 12px;
    right: 12px;
  }
  
  .metric-title {
    padding-right: 44px;
  }
  
  .chart-area {
    height: 250px !important;
  }
}

@media (max-width: 600px) {
  .metric-value {
    font-size: 1.5rem !important;
  }

  .metric-icon-wrapper-absolute {
    width: 32px;
    height: 32px;
    top: 10px;
    right: 10px;
  }
  
  .metric-title {
    padding-right: 40px;
  }

  .chart-area {
    height: 200px !important;
  }
  
  .y-axis-labels {
    width: 30px;
  }
  
  .x-label {
    font-size: 0.65rem;
    min-width: 30px;
  }
}

/* 다크 테마 지원 */
.v-theme--dark .metric-card {
  background-color: rgb(var(--v-theme-surface-variant));
}

.v-theme--dark .chart-area {
  background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
  border-color: #334155;
}

.v-theme--dark .grid-line {
  background: #334155;
}

.v-theme--dark .chart-stats {
  background: #1E293B !important;
  border-color: #334155;
}
</style>