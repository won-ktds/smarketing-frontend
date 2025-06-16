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

        <!-- AI 추천 활용 - 단일 상세 콘텐츠로 변경 -->
        <v-col cols="12" lg="4">
          <v-card elevation="0" border class="ai-recommend-card h-100">
            <v-card-title class="pa-4 pb-0">
              <div class="d-flex align-center justify-space-between w-100">
                <div class="d-flex align-center">
                  <v-icon color="primary" class="mr-2">mdi-robot</v-icon>
                  <div>
                    <h3 class="text-h6 font-weight-bold mb-0">AI 추천 활용</h3>
                    <p class="text-caption text-grey-darken-1 mb-0">맞춤형 마케팅 제안</p>
                  </div>
                </div>
                <v-btn 
                  icon="mdi-refresh" 
                  size="small" 
                  variant="text" 
                  color="primary"
                  :loading="aiLoading"
                  @click="refreshAiRecommendation"
                />
              </div>
            </v-card-title>
            
            <v-card-text class="pa-4 pt-2">
              <div v-if="aiLoading" class="text-center py-8">
                <v-progress-circular color="primary" indeterminate size="40" />
                <p class="text-body-2 text-grey mt-3">AI가 분석 중...</p>
              </div>
              
              <div v-else-if="aiRecommendation" class="ai-recommendation-content">
                <!-- 추천 제목 -->
                <div class="recommendation-header mb-4">
                  <div class="d-flex align-center mb-2">
                    <span class="recommendation-emoji mr-2">{{ aiRecommendation.emoji }}</span>
                    <h4 class="text-h6 font-weight-bold text-primary">
                      {{ aiRecommendation.title }}
                    </h4>
                  </div>
                </div>

                <!-- 스크롤 가능한 콘텐츠 영역 -->
                <div class="recommendation-scroll-content" style="max-height: 400px; overflow-y: auto;">
                  <!-- 기획 아이디어 섹션 -->
                  <div v-if="aiRecommendation.sections?.ideas" class="recommendation-section mb-4">
                    <h5 class="text-subtitle-1 font-weight-bold mb-2 d-flex align-center">
                      <v-icon icon="mdi-lightbulb" size="16" color="warning" class="mr-1" />
                      {{ aiRecommendation.sections.ideas.title }}
                    </h5>
                    <div class="ml-4">
                      <div 
                        v-for="(idea, index) in aiRecommendation.sections.ideas.items" 
                        :key="index" 
                        class="idea-item mb-2"
                      >
                        <div class="d-flex align-start">
                          <v-icon icon="mdi-circle-small" size="12" color="primary" class="mt-1 mr-1" />
                          <span class="text-body-2" v-html="idea"></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 비용 및 효과 섹션 -->
                  <div v-if="aiRecommendation.sections?.costs" class="recommendation-section mb-4">
                    <h5 class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center">
                      <v-icon icon="mdi-calculator" size="16" color="success" class="mr-1" />
                      {{ aiRecommendation.sections.costs.title }}
                    </h5>
                    
                    <!-- 비용 테이블 -->
                    <div v-if="aiRecommendation.sections.costs.items" class="ml-4 mb-3">
                      <v-table density="compact" class="cost-table">
                        <tbody>
                          <tr v-for="(cost, index) in aiRecommendation.sections.costs.items" :key="index">
                            <td class="text-body-2 font-weight-medium">{{ cost.item }}</td>
                            <td class="text-body-2 text-primary font-weight-bold text-right">{{ cost.amount }}</td>
                          </tr>
                        </tbody>
                      </v-table>
                    </div>

                    <!-- 기대 효과 -->
                    <div v-if="aiRecommendation.sections.costs.effects" class="ml-4">
                      <p class="text-body-2 font-weight-bold mb-2">📈 기대 효과:</p>
                      <div 
                        v-for="(effect, index) in aiRecommendation.sections.costs.effects" 
                        :key="index" 
                        class="effect-item mb-1"
                      >
                        <div class="d-flex align-start">
                          <v-icon icon="mdi-check-circle" size="12" color="success" class="mt-1 mr-1" />
                          <span class="text-body-2">{{ effect }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 주의사항 섹션 -->
                  <div v-if="aiRecommendation.sections?.warnings" class="recommendation-section mb-4">
                    <h5 class="text-subtitle-1 font-weight-bold mb-2 d-flex align-center">
                      <v-icon icon="mdi-alert" size="16" color="warning" class="mr-1" />
                      {{ aiRecommendation.sections.warnings.title }}
                    </h5>
                    <div class="ml-4">
                      <div 
                        v-for="(warning, index) in aiRecommendation.sections.warnings.items" 
                        :key="index" 
                        class="warning-item mb-2"
                      >
                        <div class="d-flex align-start">
                          <v-icon icon="mdi-alert-circle" size="12" color="warning" class="mt-1 mr-1" />
                          <span class="text-body-2" v-html="warning"></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 현재 상황 정보 -->
                  <div v-if="aiRecommendation.currentInfo" class="recommendation-section">
                    <h5 class="text-subtitle-1 font-weight-bold mb-2 d-flex align-center">
                      <v-icon :icon="aiRecommendation.currentInfo.icon" size="16" :color="aiRecommendation.currentInfo.color" class="mr-1" />
                      {{ aiRecommendation.currentInfo.title }}
                    </h5>
                    <div class="current-info-box pa-3" :class="`bg-${aiRecommendation.currentInfo.color}-lighten-5`">
                      <div 
                        v-for="(info, index) in aiRecommendation.currentInfo.items" 
                        :key="index" 
                        class="info-item mb-1"
                      >
                        <span class="text-body-2">
                          <strong>{{ info.label }}:</strong> {{ info.value }}
                        </span>
                      </div>
                      <div v-if="aiRecommendation.currentInfo.insight" class="insight-box mt-2 pa-2 bg-white rounded">
                        <div class="d-flex align-start">
                          <v-icon icon="mdi-lightbulb" size="16" color="amber" class="mt-1 mr-2" />
                          <span class="text-body-2 font-weight-medium" v-html="aiRecommendation.currentInfo.insight"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

        
              </div>

              <!-- 에러 상태 -->
              <div v-else-if="aiError" class="text-center py-8">
                <v-icon icon="mdi-alert-circle" size="48" color="error" class="mb-4" />
                <p class="text-body-2 text-error mb-4">{{ aiError }}</p>
                <v-btn 
                  color="primary" 
                  variant="outlined" 
                  @click="refreshAiRecommendation"
                >
                  다시 시도
                </v-btn>
              </div>

              <!-- 초기 상태 -->
              <div v-else class="text-center py-8">
                <v-icon icon="mdi-robot" size="48" color="grey-lighten-2" class="mb-4" />
                <p class="text-body-2 text-grey-darken-1 mb-4">
                  AI 추천을 불러오고 있습니다
                </p>
                <v-btn 
                  color="primary" 
                  variant="outlined" 
                  @click="refreshAiRecommendation"
                >
                  추천 받기
                </v-btn>
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
 * - AI 추천을 단일 상세 콘텐츠로 변경
 * - Claude API 연동 준비된 구조
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
const aiError = ref('')

// 툴팁 관련
const tooltip = ref({
  show: false,
  x: 0,
  y: 0,
  title: '',
  sales: 0,
  target: 0
})

// 대시보드 지표
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

// 차트 데이터
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

const yAxisLabels = ref(['0', '25', '50', '75', '100'])

// AI 추천 데이터 (Claude API 연동용 구조)
const aiRecommendation = ref({
  emoji: '☀️',
  title: '여름 시즌 인스타그램 마케팅 계획',
  sections: {
    ideas: {
      title: '1. 기획 아이디어',
      items: [
        '여름 음료 메뉴 개발 예: 시원한 아이스 아메리카노, 프라페 등',
        '카페 내부에서 <strong>음료와 함께 촬영한 인스타그램용 사진 및 영상</strong> 제작',
        '<strong>지역 인플루언서</strong>와 협업하여 방문 후기 및 신메뉴 소개 게시물 게시',
        '<strong>인스타그램 스토리</strong>를 활용해 <strong>매일 음료 프로모션</strong> 소식 공유'
      ]
    },
    costs: {
      title: '2. 예상 비용 및 기대 효과',
      items: [
        { item: '촬영 및 편집', amount: '약 300,000원' },
        { item: '인플루언서 협찬', amount: '약 200,000원' }
      ],
      effects: [
        '고객 관심 유도 및 매출 상승',
        'SNS를 통한 브랜드 인지도 상승',
        '재방문율 및 공유 유도'
      ]
    },
    warnings: {
      title: '3. 주의사항 및 유의점',
      items: [
        '인스타그램 콘텐츠는 <strong>창의적이고 시각적으로 매력적</strong>이어야 함',
        '인플루언서 협업 시, <strong>합리적인 혜택과 협의 조건</strong> 필요'
      ]
    }
  },
  currentInfo: {
    title: '현재 지역 날씨 (서울 강남구 역삼동 기준)',
    icon: 'mdi-weather-sunny',
    color: 'orange',
    items: [
      { label: '기온', value: '30도' },
      { label: '기상 상황', value: '무더위 지속' }
    ],
    insight: '<strong>시원한 음료에 대한 수요가 매우 높을 것으로 예상</strong>'
  }
})

// 계산된 속성들
const currentChartData = computed(() => chartData.value[chartPeriod.value])

const chartDataPoints = computed(() => {
  const data = currentChartData.value
  const maxSales = Math.max(...data.map(d => Math.max(d.sales, d.target)))
  
  return data.map((item, index) => {
    const chartStartPercent = 8
    const chartEndPercent = 92
    const chartWidth = chartEndPercent - chartStartPercent
    
    return {
      x: chartStartPercent + (index * chartWidth / (data.length - 1)),
      y: 10 + ((item.sales / maxSales) * 80),
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

// 메서드들
const getCurrentPeriodLabel = () => {
  switch (chartPeriod.value) {
    case '7d': return '7일'
    case '30d': return '30일'
    case '90d': return '90일'
    default: return '7일'
  }
}

const animateNumber = (targetValue, index, duration = 2000) => {
  const startValue = 0
  const startTime = Date.now()

  const updateValue = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)

    const easedProgress = 1 - Math.pow(1 - progress, 3)
    const currentValue = Math.floor(startValue + (targetValue - startValue) * easedProgress)

    if (typeof targetValue === 'number') {
      if (index === 0 || index === 1) {
        animatedValues.value[index] = `₩${currentValue.toLocaleString()}`
      } else {
        animatedValues.value[index] = currentValue.toLocaleString()
      }
    }

    if (progress < 1) {
      requestAnimationFrame(updateValue)
    }
  }

  updateValue()
}

const startMetricsAnimation = () => {
  dashboardMetrics.value.forEach((metric, index) => {
    setTimeout(() => {
      animateNumber(metric.value, index, 1500 + index * 200)
    }, index * 300)
  })
}

const drawChart = async () => {
  await nextTick()
  
  if (!chartCanvas.value) return
  
  const canvas = chartCanvas.value
  const ctx = canvas.getContext('2d')
  const data = currentChartData.value
  
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

const updateChart = async (period) => {
  console.log('차트 기간 변경:', period)
  await nextTick()
  drawChart()
}

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

// AI 추천 관련 메서드들
const refreshAiRecommendation = async () => {
  console.log('AI 추천 새로고침')
  aiLoading.value = true
  aiError.value = ''
  
  try {
    // Claude API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 실제 Claude API 호출은 여기서
    // const response = await callClaudeAPI(prompt)
    // aiRecommendation.value = parseClaudeResponse(response)
    
    console.log('AI 추천 새로고침 완료')
    appStore.showSnackbar('AI 추천이 업데이트되었습니다', 'success')
  } catch (error) {
    console.error('AI 추천 로드 실패:', error)
    aiError.value = 'AI 추천을 불러오는데 실패했습니다'
    appStore.showSnackbar('AI 추천 로드에 실패했습니다', 'error')
  } finally {
    aiLoading.value = false
  }
}

const copyRecommendation = async () => {
  try {
    let text = `${aiRecommendation.value.emoji} ${aiRecommendation.value.title}\n\n`
    
    // 각 섹션을 텍스트로 변환
    Object.values(aiRecommendation.value.sections).forEach(section => {
      text += `${section.title}\n`
      if (section.items) {
        section.items.forEach(item => {
          // HTML 태그 제거
          const cleanItem = item.replace(/<[^>]*>/g, '')
          text += `• ${cleanItem}\n`
        })
      }
      if (section.effects) {
        text += '\n기대 효과:\n'
        section.effects.forEach(effect => {
          text += `• ${effect}\n`
        })
      }
      text += '\n'
    })
    
    await navigator.clipboard.writeText(text)
    appStore.showSnackbar('추천 내용이 복사되었습니다', 'success')
  } catch (error) {
    console.error('복사 실패:', error)
    appStore.showSnackbar('복사에 실패했습니다', 'error')
  }
}

const createContentFromRecommendation = () => {
  // 추천 내용을 기반으로 콘텐츠 생성 페이지로 이동
  router.push({
    path: '/content/create',
    query: {
      type: 'sns',
      title: aiRecommendation.value.title,
      template: 'ai_recommendation'
    }
  })
}

const confirmLogout = () => {
  try {
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

// 라이프사이클
onMounted(async () => {
  console.log('DashboardView 마운트됨')
  
  // 실제 API 호출 추가
  try {
    // 매장 정보 로드
    if (!storeStore.hasStoreInfo) {
      await storeStore.fetchStoreInfo()
    }
    
    // 매출 데이터 로드
    await storeStore.fetchSalesData()
    
    // 진행 중인 콘텐츠 로드
    await contentStore.fetchOngoingContents()
    
  } catch (error) {
    console.warn('대시보드 데이터 로드 실패 (개발 중이므로 무시):', error)
    // 개발 중에는 에러를 무시하고 계속 진행
  }
})

onBeforeUnmount(() => {
  animatedValues.value = {}
})
</script>

<style scoped>
/* 기존 스타일들 유지 */
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
  padding-right: 48px;
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

/* 차트 스타일들 유지 */
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

/* AI 추천 카드 새로운 스타일 */
.ai-recommend-card {
  transition: all 0.3s ease;
}

.ai-recommend-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
}

.ai-recommendation-content {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.recommendation-emoji {
  font-size: 1.5rem;
}

.recommendation-section {
  border-left: 3px solid var(--v-theme-primary);
  padding-left: 12px;
}

.recommendation-scroll-content {
  scrollbar-width: thin;
  scrollbar-color: #ddd transparent;
}

.recommendation-scroll-content::-webkit-scrollbar {
  width: 4px;
}

.recommendation-scroll-content::-webkit-scrollbar-track {
  background: transparent;
}

.recommendation-scroll-content::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 2px;
}

.recommendation-scroll-content::-webkit-scrollbar-thumb:hover {
  background: #bbb;
}

.idea-item,
.warning-item,
.effect-item {
  line-height: 1.5;
}

.cost-table {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.cost-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
}

.cost-table tr:last-child td {
  border-bottom: none;
}

.current-info-box {
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.insight-box {
  border: 1px solid #e8f5e8;
}

.recommendation-actions {
  border-top: 1px solid #e0e0e0;
}

.info-item {
  line-height: 1.4;
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

  .recommendation-scroll-content {
    max-height: 300px !important;
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

  .recommendation-scroll-content {
    max-height: 250px !important;
  }

  .recommendation-emoji {
    font-size: 1.2rem;
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

.v-theme--dark .current-info-box {
  border-color: rgba(255, 255, 255, 0.1);
}

.v-theme--dark .insight-box {
  background-color: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.1);
}

.v-theme--dark .recommendation-actions {
  border-color: rgba(255, 255, 255, 0.1);
}
</style>