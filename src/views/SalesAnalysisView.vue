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

    <!-- 차트 영역 (Chart.js 없이 표시) -->
    <v-row class="mb-4">
      <v-col cols="12" md="8">
        <v-card elevation="2">
          <v-card-title>매출 추이</v-card-title>
          <v-card-text>
            <div class="chart-placeholder">
              <v-icon size="64" color="grey-lighten-2">mdi-chart-line</v-icon>
              <p class="text-grey mt-2">차트 라이브러리 로딩 중...</p>
              <p class="text-caption text-grey">Chart.js를 설치하면 실제 차트가 표시됩니다</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 매출 순위 -->
      <v-col cols="12" md="4">
        <v-card elevation="2">
          <v-card-title>인기 메뉴 순위</v-card-title>
          <v-card-text>
            <div v-if="topMenus.length > 0">
              <div
                v-for="(menu, index) in topMenus"
                :key="menu.id"
                class="d-flex align-center mb-3"
              >
                <v-chip
                  :color="index === 0 ? 'warning' : index === 1 ? 'grey' : 'orange'"
                  size="small"
                  class="mr-3"
                >
                  {{ index + 1 }}
                </v-chip>
                <div class="flex-grow-1">
                  <div class="text-body-2 font-weight-medium">
                    {{ menu.name }}
                  </div>
                  <div class="text-caption text-grey">
                    {{ formatCurrency(menu.sales) }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-body-2 font-weight-bold">{{ menu.quantity }}개</div>
                </div>
              </div>
            </div>
            <div v-else class="text-center pa-4">
              <v-icon size="48" color="grey-lighten-2">mdi-food-off</v-icon>
              <p class="text-grey mt-2">메뉴 데이터가 없습니다</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 상세 분석 테이블 -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title>상세 매출 분석</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="tableHeaders"
              :items="salesData"
              :loading="loading"
              no-data-text="데이터가 없습니다"
              loading-text="데이터를 불러오는 중..."
            >
              <template v-slot:item.sales="{ item }">
                <span class="font-weight-bold">
                  {{ formatCurrency(item.sales) }}
                </span>
              </template>
              <template v-slot:item.change="{ item }">
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
import { ref, onMounted } from 'vue'
import { formatCurrency } from '@/utils/formatters'
// import Chart from 'chart.js/auto'  // Chart.js 설치 후 주석 해제

/**
 * 매출 분석 페이지
 */

// 상태 관리
const loading = ref(false)
const selectedPeriod = ref('week')
const selectedMetric = ref('sales')

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

// 주요 지표
const mainMetrics = ref([
  {
    title: '총 매출',
    value: '₩8,750,000',
    change: '+15.2%',
    trend: 'up',
    icon: 'mdi-cash',
    color: 'success',
  },
  {
    title: '주문 수',
    value: '1,245',
    change: '+8.7%',
    trend: 'up',
    icon: 'mdi-cart',
    color: 'primary',
  },
  {
    title: '평균 주문액',
    value: '₩7,025',
    change: '+3.1%',
    trend: 'up',
    icon: 'mdi-calculator',
    color: 'info',
  },
  {
    title: '고객 수',
    value: '892',
    change: '+12.5%',
    trend: 'up',
    icon: 'mdi-account-group',
    color: 'warning',
  },
])

// 인기 메뉴
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

// 테이블 데이터
const salesData = ref([
  {
    date: '2024-01-15',
    sales: 450000,
    orders: 65,
    average: 6923,
    change: 12.5,
  },
  {
    date: '2024-01-14',
    sales: 380000,
    orders: 58,
    average: 6552,
    change: -3.2,
  },
  {
    date: '2024-01-13',
    sales: 520000,
    orders: 72,
    average: 7222,
    change: 18.7,
  },
  {
    date: '2024-01-12',
    sales: 425000,
    orders: 61,
    average: 6967,
    change: 8.1,
  },
  {
    date: '2024-01-11',
    sales: 390000,
    orders: 55,
    average: 7091,
    change: 5.4,
  },
])

// 메서드
const refreshData = async () => {
  try {
    loading.value = true

    // API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log('매출 데이터 새로고침 완료')
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

// Chart.js 초기화 (설치 후 사용)
/*
const initChart = () => {
  const ctx = document.getElementById('salesChart')
  if (ctx) {
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['1/11', '1/12', '1/13', '1/14', '1/15'],
        datasets: [{
          label: '매출액',
          data: [390000, 425000, 520000, 380000, 450000],
          borderColor: '#1976D2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '₩' + value.toLocaleString()
              }
            }
          }
        }
      }
    })
  }
}
*/

// 라이프사이클
onMounted(async () => {
  console.log('SalesAnalysisView 마운트됨')

  try {
    loading.value = true

    // 초기 데이터 로드
    await refreshData()

    // Chart 초기화 (Chart.js 설치 후 주석 해제)
    // initChart()
  } catch (error) {
    console.error('매출 분석 페이지 로드 실패:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.h-100 {
  height: 100%;
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

@media (max-width: 600px) {
  .text-h4 {
    font-size: 1.5rem !important;
  }
}
</style>
