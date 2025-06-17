//* src/views/SalesAnalysisView.vue
<template>
  <v-container fluid class="pa-4">
    <!-- 페이지 헤더 -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center">
          <h1 class="text-h4 font-weight-bold">매출 분석</h1>
          <v-spacer />
          <v-btn color="primary" prepend-icon="mdi-refresh" @click="refreshData" :loading="loading">
            새로고침
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- 기간 선택 -->
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-select
          v-model="selectedPeriod"
          :items="periodOptions"
          label="분석 기간"
          variant="outlined"
          @update:model-value="updatePeriod"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-select
          v-model="selectedMetric"
          :items="metricOptions"
          label="분석 지표"
          variant="outlined"
          @update:model-value="updateMetric"
        />
      </v-col>
    </v-row>

    <!-- 주요 지표 카드 -->
    <v-row class="mb-4">
      <v-col v-for="metric in mainMetrics" :key="metric.title" cols="6" md="3">
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

    <!-- 차트 영역 -->
    <v-row class="mb-4">
      <v-col cols="12" md="8">
        <v-card elevation="2">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>📈 매출 추이 분석</span>
            <div v-if="salesData.trendAnalysis">
              <v-chip 
                :color="getTrendColor(salesData.trendAnalysis.overallTrend)" 
                size="small" 
                variant="tonal"
                class="mr-2"
              >
                {{ getTrendLabel(salesData.trendAnalysis.overallTrend) }}
              </v-chip>
              <v-chip color="info" size="small" variant="tonal">
                {{ salesData.trendAnalysis.growthRate }}% 변화
              </v-chip>
            </div>
          </v-card-title>
          <v-card-text>
            <!-- 변곡점 정보 -->
            <div v-if="salesData.trendAnalysis && salesData.trendAnalysis.inflectionPoints.length > 0" class="mb-4">
              <h4 class="text-subtitle-1 font-weight-bold mb-2">🔍 주요 변곡점</h4>
              <div class="d-flex flex-wrap gap-2">
                <v-chip
                  v-for="(point, index) in salesData.trendAnalysis.inflectionPoints.slice(0, 3)"
                  :key="index"
                  :color="point.type === 'peak' ? 'success' : 'warning'"
                  size="small"
                  variant="outlined"
                >
                  <v-icon size="14" class="mr-1">
                    {{ point.type === 'peak' ? 'mdi-arrow-up-bold' : 'mdi-arrow-down-bold' }}
                  </v-icon>
                  {{ formatDate(point.date) }} - {{ formatCurrency(point.amount) }}
                </v-chip>
              </div>
            </div>

            <!-- 간단한 차트 표현 (Chart.js 없이) -->
            <div class="chart-container">
              <div v-if="salesData.chartData && salesData.chartData.salesData.length > 0" class="simple-chart">
                <h4 class="text-subtitle-2 mb-3">최근 90일 매출 추이</h4>
                <div class="chart-bars">
                  <div 
                    v-for="(amount, index) in getChartDisplayData()" 
                    :key="index"
                    class="chart-bar"
                    :style="{ 
                      height: `${getBarHeight(amount)}px`,
                      backgroundColor: getBarColor(amount, index)
                    }"
                    :title="`${salesData.chartData.labels[index]}: ${formatCurrency(amount)}`"
                  ></div>
                </div>
                <div class="chart-labels">
                  <span 
                    v-for="(label, index) in getChartLabels()" 
                    :key="index"
                    class="chart-label"
                  >
                    {{ label }}
                  </span>
                </div>
              </div>
              
              <div v-else class="chart-placeholder">
                <v-icon size="64" color="grey-lighten-2">mdi-chart-line</v-icon>
                <p class="text-grey mt-2">매출 데이터를 불러오는 중...</p>
                <p class="text-caption text-grey">잠시 후 다시 시도해주세요</p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 매출 순위 -->
      <v-col cols="12" md="4">
        <v-card elevation="2">
          <v-card-title>📊 매출 요약</v-card-title>
          <v-card-text>
            <div class="mb-4">
              <div class="d-flex justify-space-between align-center mb-2">
                <span class="text-body-2">오늘 매출</span>
                <span class="text-h6 font-weight-bold text-primary">
                  {{ formatCurrency(salesData.todaySales) }}
                </span>
              </div>
              <div class="d-flex justify-space-between align-center mb-2">
                <span class="text-body-2">이번 달 매출</span>
                <span class="text-h6 font-weight-bold text-success">
                  {{ formatCurrency(salesData.monthSales) }}
                </span>
              </div>
              <div class="d-flex justify-space-between align-center">
                <span class="text-body-2">전일 대비</span>
                <v-chip 
                  :color="salesData.previousDayComparison >= 0 ? 'success' : 'error'"
                  size="small"
                  variant="tonal"
                >
                  <v-icon size="14" class="mr-1">
                    {{ salesData.previousDayComparison >= 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}
                  </v-icon>
                  {{ formatCurrency(Math.abs(salesData.previousDayComparison)) }}
                </v-chip>
              </div>
            </div>

            <v-divider class="mb-3"></v-divider>

            <!-- 인기 메뉴 (기존 목업 데이터 유지) -->
            <h4 class="text-subtitle-1 font-weight-bold mb-2">인기 메뉴 순위</h4>
            <div v-if="topMenus.length > 0">
              <div
                v-for="(menu, index) in topMenus.slice(0, 3)"
                :key="menu.id"
                class="d-flex align-center justify-space-between mb-2"
              >
                <div class="d-flex align-center">
                  <v-chip
                    :color="index === 0 ? 'warning' : index === 1 ? 'info' : 'success'"
                    size="x-small"
                    class="mr-2"
                  >
                    {{ index + 1 }}
                  </v-chip>
                  <span class="text-body-2">{{ menu.name }}</span>
                </div>
                <span class="text-caption text-grey">{{ formatCurrency(menu.sales) }}</span>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 상세 데이터 테이블 -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title>📋 일별 매출 상세</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="tableHeaders"
              :items="tableData"
              :items-per-page="10"
              class="elevation-0"
            >
              <template #item.sales="{ item }">
                {{ formatCurrency(item.sales) }}
              </template>
              <template #item.average="{ item }">
                {{ formatCurrency(item.average) }}
              </template>
              <template #item.change="{ item }">
                <v-chip
                  :color="item.change > 0 ? 'success' : item.change < 0 ? 'error' : 'warning'"
                  size="small"
                  variant="tonal"
                >
                  {{ item.change > 0 ? '+' : '' }}{{ item.change }}%
                </v-chip>
              </template>
            </v-data-table>
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
import { ref, onMounted, computed } from 'vue'
import { formatCurrency } from '@/utils/formatters'
import { storeService } from '@/services/store'

/**
 * 매출 분석 페이지 - 실제 API 데이터 연동
 */

// 상태 관리
const loading = ref(false)
const selectedPeriod = ref('week')
const selectedMetric = ref('sales')
const salesData = ref({
  todaySales: 0,
  monthSales: 0,
  previousDayComparison: 0,
  yearSales: [],
  trendAnalysis: null,
  chartData: null
})

// 옵션 데이터
const periodOptions = ref([
  { title: '최근 1주일', value: 'week' },
  { title: '최근 1개월', value: 'month' },
  { title: '최근 3개월', value: 'quarter' },
  { title: '최근 1년', value: 'year' },
])

const metricOptions = ref([
  { title: '매출액', value: 'sales' },
  { title: '주문수', value: 'orders' },
  { title: '고객수', value: 'customers' },
  { title: '평균 주문금액', value: 'average' },
])

// 계산된 주요 지표
const mainMetrics = computed(() => {
  const dayChange = salesData.value.previousDayComparison || 0
  const dayChangePercent = salesData.value.todaySales > 0 
    ? ((dayChange / salesData.value.todaySales) * 100).toFixed(1)
    : '0.0'
  
  return [
    {
      title: '오늘 매출',
      value: formatCurrency(salesData.value.todaySales),
      change: `${dayChange >= 0 ? '+' : ''}${dayChangePercent}%`,
      trend: dayChange > 0 ? 'up' : dayChange < 0 ? 'down' : 'neutral',
      icon: 'mdi-cash',
      color: 'success',
    },
    {
      title: '이달 매출',
      value: formatCurrency(salesData.value.monthSales),
      change: '+12.5%', // TODO: 월간 변화율 API 추가 필요
      trend: 'up',
      icon: 'mdi-chart-line',
      color: 'primary',
    },
    {
      title: '전일 대비',
      value: formatCurrency(Math.abs(dayChange)),
      change: dayChange >= 0 ? '증가' : '감소',
      trend: dayChange >= 0 ? 'up' : 'down',
      icon: 'mdi-trending-up',
      color: dayChange >= 0 ? 'success' : 'error',
    },
    {
      title: '성장률',
      value: salesData.value.trendAnalysis ? `${salesData.value.trendAnalysis.growthRate}%` : '0%',
      change: '연간 기준',
      trend: (salesData.value.trendAnalysis?.growthRate || 0) >= 0 ? 'up' : 'down',
      icon: 'mdi-calculator',
      color: 'info',
    },
  ]
})

// 인기 메뉴 (기존 목업 데이터 유지)
const topMenus = ref([
  { id: 1, name: '떡볶이', sales: 1250000, quantity: 450 },
  { id: 2, name: '순대', sales: 980000, quantity: 320 },
  { id: 3, name: '튀김', sales: 750000, quantity: 280 },
  { id: 4, name: '김밥', sales: 620000, quantity: 210 },
  { id: 5, name: '라면', sales: 580000, quantity: 190 },
])

// 테이블 헤더
const tableHeaders = ref([
  { title: '날짜', key: 'date', sortable: true },
  { title: '매출액', key: 'sales', sortable: true },
  { title: '주문수', key: 'orders', sortable: true },
  { title: '평균 주문액', key: 'average', sortable: true },
  { title: '전일 대비', key: 'change', sortable: true },
])

// 테이블 데이터 (yearSales 기반으로 생성)
const tableData = computed(() => {
  if (!salesData.value.yearSales || salesData.value.yearSales.length === 0) {
    return []
  }

  // 최근 10일 데이터만 표시
  const recent = salesData.value.yearSales
    .sort((a, b) => new Date(b.salesDate) - new Date(a.salesDate))
    .slice(0, 10)

  return recent.map((item, index) => {
    const sales = parseFloat(item.salesAmount) || 0
    const prevItem = recent[index + 1]
    const prevSales = prevItem ? parseFloat(prevItem.salesAmount) || 0 : sales
    const change = prevSales > 0 ? ((sales - prevSales) / prevSales * 100).toFixed(1) : 0

    return {
      date: formatDate(item.salesDate),
      sales: sales,
      orders: Math.floor(sales / 8000), // 추정 주문수
      average: sales > 0 ? Math.floor(sales / Math.max(1, Math.floor(sales / 8000))) : 0,
      change: parseFloat(change)
    }
  })
})

// 메서드
const refreshData = async (storeId = 1) => {
  try {
    loading.value = true
    console.log('매출 데이터 새로고침 시작')

    const response = await storeService.getSales(storeId)
    
    if (response.success) {
      salesData.value = response.data
      console.log('매출 데이터 로드 완료:', response.data)
    } else {
      console.error('매출 데이터 로드 실패:', response.message)
    }
  } catch (error) {
    console.error('데이터 새로고침 실패:', error)
  } finally {
    loading.value = false
  }
}

const updatePeriod = (period) => {
  console.log('기간 변경:', period)
  refreshData()
}

const updateMetric = (metric) => {
  console.log('지표 변경:', metric)
  refreshData()
}

// 트렌드 관련 헬퍼 함수
const getTrendColor = (trend) => {
  switch (trend) {
    case 'increasing': return 'success'
    case 'decreasing': return 'error'
    case 'stable': return 'info'
    default: return 'grey'
  }
}

const getTrendLabel = (trend) => {
  switch (trend) {
    case 'increasing': return '상승 추세'
    case 'decreasing': return '하락 추세' 
    case 'stable': return '안정적'
    default: return '데이터 부족'
  }
}

// 차트 관련 함수
const getChartDisplayData = () => {
  if (!salesData.value.chartData?.salesData) return []
  // 10개씩 간격으로 표시 (90일 → 9개 포인트)
  const data = salesData.value.chartData.salesData
  const step = Math.floor(data.length / 9) || 1
  return data.filter((_, index) => index % step === 0).slice(0, 9)
}

const getChartLabels = () => {
  if (!salesData.value.chartData?.labels) return []
  const labels = salesData.value.chartData.labels
  const step = Math.floor(labels.length / 9) || 1
  return labels.filter((_, index) => index % step === 0).slice(0, 9)
}

const getBarHeight = (amount) => {
  if (!salesData.value.chartData?.salesData) return 20
  const maxAmount = Math.max(...salesData.value.chartData.salesData)
  return Math.max(20, (amount / maxAmount) * 80) // 최소 20px, 최대 80px
}

const getBarColor = (amount, index) => {
  // 변곡점이 있는 날짜는 다른 색상
  if (salesData.value.trendAnalysis?.inflectionPoints) {
    const isInflectionPoint = salesData.value.trendAnalysis.inflectionPoints.some(point => {
      const pointIndex = salesData.value.chartData?.labels.findIndex(label => 
        label === formatDate(point.date).slice(5) // MM/dd 형태로 비교
      )
      return Math.abs(pointIndex - index * Math.floor(salesData.value.chartData.salesData.length / 9)) < 2
    })
    
    if (isInflectionPoint) {
      return '#FF6B6B' // 변곡점 강조 색상
    }
  }
  return '#1976D2' // 기본 색상
}

// 유틸리티 함수
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
}

// 라이프사이클
onMounted(async () => {
  console.log('SalesAnalysisView 마운트됨')
  await refreshData()
})
</script>

<style scoped>
.h-100 {
  height: 100%;
}

.chart-container {
  min-height: 300px;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.simple-chart {
  padding: 16px;
}

.chart-bars {
  display: flex;
  align-items: end;
  justify-content: space-around;
  height: 120px;
  margin-bottom: 8px;
  border-bottom: 2px solid #e0e0e0;
  padding: 0 10px;
}

.chart-bar {
  width: 20px;
  background-color: #1976D2;
  border-radius: 2px 2px 0 0;
  transition: all 0.3s ease;
  cursor: pointer;
}

.chart-bar:hover {
  opacity: 0.8;
  transform: scaleY(1.1);
}

.chart-labels {
  display: flex;
  justify-content: space-around;
  padding: 0 10px;
}

.chart-label {
  font-size: 11px;
  color: #666;
}

@media (max-width: 600px) {
  .text-h4 {
    font-size: 1.5rem !important;
  }
  
  .chart-bars {
    height: 80px;
  }
  
  .chart-bar {
    width: 15px;
  }
}
</style>