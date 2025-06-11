//* src/views/SalesAnalysisView.vue
<template>
  <v-container fluid class="pa-4">
    <!-- 기간 선택 및 필터 -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="text-h6 pa-4">
            <v-icon class="mr-2" color="primary">mdi-chart-line</v-icon>
            매출 분석
            <v-spacer />
            <v-btn
              color="primary"
              @click="exportReport"
              :loading="exporting"
            >
              <v-icon class="mr-1">mdi-download</v-icon>
              보고서 다운로드
            </v-btn>
          </v-card-title>
          
          <v-divider />
          
          <v-card-text class="pa-4">
            <v-row>
              <v-col cols="12" md="3">
                <v-select
                  v-model="selectedPeriod"
                  label="분석 기간"
                  variant="outlined"
                  :items="periodOptions"
                  @update:model-value="loadSalesData"
                />
              </v-col>
              
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="customStartDate"
                  label="시작일"
                  variant="outlined"
                  type="date"
                  :disabled="selectedPeriod !== 'custom'"
                  @update:model-value="loadSalesData"
                />
              </v-col>
              
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="customEndDate"
                  label="종료일"
                  variant="outlined"
                  type="date"
                  :disabled="selectedPeriod !== 'custom'"
                  @update:model-value="loadSalesData"
                />
              </v-col>
              
              <v-col cols="12" md="3">
                <v-select
                  v-model="selectedCategory"
                  label="메뉴 카테고리"
                  variant="outlined"
                  :items="categoryOptions"
                  clearable
                  @update:model-value="loadSalesData"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 매출 요약 카드 -->
    <v-row class="mb-4">
      <v-col cols="6" md="3">
        <v-card elevation="2" class="text-center pa-4">
          <v-icon size="32" color="success" class="mb-2">mdi-currency-krw</v-icon>
          <div class="text-h5 font-weight-bold">{{ formatCurrency(salesSummary.totalSales) }}</div>
          <div class="text-body-2 grey--text">총 매출</div>
          <v-chip
            :color="salesSummary.salesChange >= 0 ? 'success' : 'error'"
            size="small"
            class="mt-2"
          >
            {{ salesSummary.salesChange >= 0 ? '+' : '' }}{{ salesSummary.salesChange }}%
          </v-chip>
        </v-card>
      </v-col>
      
      <v-col cols="6" md="3">
        <v-card elevation="2" class="text-center pa-4">
          <v-icon size="32" color="info" class="mb-2">mdi-cart</v-icon>
          <div class="text-h5 font-weight-bold">{{ salesSummary.totalOrders.toLocaleString() }}</div>
          <div class="text-body-2 grey--text">총 주문 수</div>
          <v-chip
            :color="salesSummary.ordersChange >= 0 ? 'success' : 'error'"
            size="small"
            class="mt-2"
          >
            {{ salesSummary.ordersChange >= 0 ? '+' : '' }}{{ salesSummary.ordersChange }}%
          </v-chip>
        </v-card>
      </v-col>
      
      <v-col cols="6" md="3">
        <v-card elevation="2" class="text-center pa-4">
          <v-icon size="32" color="warning" class="mb-2">mdi-calculator</v-icon>
          <div class="text-h5 font-weight-bold">{{ formatCurrency(salesSummary.averageOrder) }}</div>
          <div class="text-body-2 grey--text">평균 주문금액</div>
          <v-chip
            :color="salesSummary.averageChange >= 0 ? 'success' : 'error'"
            size="small"
            class="mt-2"
          >
            {{ salesSummary.averageChange >= 0 ? '+' : '' }}{{ salesSummary.averageChange }}%
          </v-chip>
        </v-card>
      </v-col>
      
      <v-col cols="6" md="3">
        <v-card elevation="2" class="text-center pa-4">
          <v-icon size="32" color="purple" class="mb-2">mdi-star</v-icon>
          <div class="text-h5 font-weight-bold">{{ salesSummary.topMenuItem }}</div>
          <div class="text-body-2 grey--text">최고 인기 메뉴</div>
          <div class="text-caption">{{ formatCurrency(salesSummary.topMenuSales) }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 차트 섹션 -->
    <v-row class="mb-4">
      <v-col cols="12" lg="8">
        <v-card elevation="2">
          <v-card-title class="text-h6 pa-4">
            매출 추이
            <v-spacer />
            <v-btn-toggle
              v-model="chartType"
              mandatory
              size="small"
              @update:model-value="updateChart"
            >
              <v-btn value="daily">일별</v-btn>
              <v-btn value="weekly">주별</v-btn>
              <v-btn value="monthly">월별</v-btn>
            </v-btn-toggle>
          </v-card-title>
          
          <v-divider />
          
          <v-card-text class="pa-4">
            <div class="chart-container">
              <canvas ref="salesChart" height="400"></canvas>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" lg="4">
        <v-card elevation="2" class="mb-4">
          <v-card-title class="text-h6 pa-4">
            메뉴별 매출 비율
          </v-card-title>
          
          <v-divider />
          
          <v-card-text class="pa-4">
            <div class="chart-container">
              <canvas ref="menuChart" height="300"></canvas>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 상세 분석 테이블 -->
    <v-row class="mb-4">
      <v-col cols="12" lg="6">
        <v-card elevation="2">
          <v-card-title class="text-h6 pa-4">
            메뉴별 매출 순위
          </v-card-title>
          
          <v-divider />
          
          <v-card-text class="pa-0">
            <v-table>
              <thead>
                <tr>
                  <th>순위</th>
                  <th>메뉴명</th>
                  <th>매출액</th>
                  <th>주문수</th>
                  <th>비율</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in menuRanking"
                  :key="item.menuName"
                >
                  <td>
                    <v-chip
                      :color="index < 3 ? ['error', 'warning', 'success'][index] : 'grey'"
                      size="small"
                    >
                      {{ index + 1 }}
                    </v-chip>
                  </td>
                  <td class="font-weight-bold">{{ item.menuName }}</td>
                  <td>{{ formatCurrency(item.sales) }}</td>
                  <td>{{ item.orders.toLocaleString() }}회</td>
                  <td>
                    <div class="d-flex align-center">
                      <v-progress-linear
                        :model-value="item.percentage"
                        color="primary"
                        height="6"
                        class="mr-2"
                        style="width: 60px;"
                      />
                      {{ item.percentage }}%
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" lg="6">
        <v-card elevation="2">
          <v-card-title class="text-h6 pa-4">
            시간대별 매출 분석
          </v-card-title>
          
          <v-divider />
          
          <v-card-text class="pa-0">
            <v-table>
              <thead>
                <tr>
                  <th>시간대</th>
                  <th>매출액</th>
                  <th>주문수</th>
                  <th>비율</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in timeSlotAnalysis"
                  :key="item.timeSlot"
                >
                  <td class="font-weight-bold">{{ item.timeSlot }}</td>
                  <td>{{ formatCurrency(item.sales) }}</td>
                  <td>{{ item.orders.toLocaleString() }}회</td>
                  <td>
                    <div class="d-flex align-center">
                      <v-progress-linear
                        :model-value="item.percentage"
                        color="success"
                        height="6"
                        class="mr-2"
                        style="width: 60px;"
                      />
                      {{ item.percentage }}%
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 인사이트 및 제안 -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="text-h6 pa-4">
            <v-icon class="mr-2" color="info">mdi-lightbulb</v-icon>
            AI 매출 분석 인사이트
          </v-card-title>
          
          <v-divider />
          
          <v-card-text class="pa-4">
            <v-row>
              <v-col
                v-for="insight in salesInsights"
                :key="insight.id"
                cols="12"
                md="4"
              >
                <v-card
                  :color="insight.type === 'positive' ? 'success' : insight.type === 'warning' ? 'warning' : 'info'"
                  variant="tonal"
                  class="pa-4"
                >
                  <div class="d-flex align-center mb-2">
                    <v-icon
                      :color="insight.type === 'positive' ? 'success' : insight.type === 'warning' ? 'warning' : 'info'"
                      class="mr-2"
                    >
                      {{ insight.icon }}
                    </v-icon>
                    <h4 class="text-h6 font-weight-bold">{{ insight.title }}</h4>
                  </div>
                  <p class="text-body-2 mb-3">{{ insight.description }}</p>
                  <v-btn
                    :color="insight.type === 'positive' ? 'success' : insight.type === 'warning' ? 'warning' : 'info'"
                    size="small"
                    @click="viewInsightDetail(insight)"
                  >
                    자세히 보기
                  </v-btn>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 인사이트 상세 다이얼로그 -->
    <v-dialog
      v-model="showInsightDialog"
      max-width="600"
    >
      <v-card v-if="selectedInsight">
        <v-card-title class="text-h6">
          <v-icon class="mr-2" :color="selectedInsight.type === 'positive' ? 'success' : selectedInsight.type === 'warning' ? 'warning' : 'info'">
            {{ selectedInsight.icon }}
          </v-icon>
          {{ selectedInsight.title }}
          <v-spacer />
          <v-btn
            icon
            @click="showInsightDialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-divider />
        
        <v-card-text class="pa-4">
          <p class="text-body-1 mb-4">{{ selectedInsight.description }}</p>
          
          <div v-if="selectedInsight.details" class="mb-4">
            <h4 class="text-h6 mb-2">상세 분석</h4>
            <v-card class="pa-3" color="blue-grey-lighten-5" variant="tonal">
              <p class="text-body-2">{{ selectedInsight.details }}</p>
            </v-card>
          </div>
          
          <div v-if="selectedInsight.recommendations">
            <h4 class="text-h6 mb-2">개선 제안</h4>
            <v-list class="pa-0">
              <v-list-item
                v-for="(rec, index) in selectedInsight.recommendations"
                :key="index"
                class="px-0"
              >
                <template v-slot:prepend>
                  <v-icon color="primary" class="mr-2">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title>{{ rec }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </div>
        </v-card-text>
        
        <v-divider />
        
        <v-card-actions class="pa-4">
          <v-btn
            color="primary"
            @click="applyInsightRecommendation(selectedInsight)"
          >
            <v-icon class="mr-1">mdi-check</v-icon>
            제안 적용하기
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
import { ref, onMounted, nextTick } from 'vue'
import { formatCurrency } from '@/utils/formatters'
import Chart from 'chart.js/auto'

// 상태 관리
const selectedPeriod = ref('week')
const customStartDate = ref('')
const customEndDate = ref('')
const selectedCategory = ref('')
const chartType = ref('daily')
const exporting = ref(false)
const showInsightDialog = ref(false)
const selectedInsight = ref(null)
const showSuccess = ref(false)
const showError = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// 차트 참조
const salesChart = ref(null)
const menuChart = ref(null)
let salesChartInstance = null
let menuChartInstance = null

// 옵션 설정
const periodOptions = [
  { title: '오늘', value: 'today' },
  { title: '이번 주', value: 'week' },
  { title: '이번 달', value: 'month' },
  { title: '지난 3개월', value: 'quarter' },
  { title: '직접 선택', value: 'custom' }
]

const categoryOptions = [
  { title: '전체', value: '' },
  { title: '면류', value: '면류' },
  { title: '튀김', value: '튀김' },
  { title: '음료', value: '음료' },
  { title: '기타', value: '기타' }
]

// 매출 요약 데이터
const salesSummary = ref({
  totalSales: 2450000,
  salesChange: 8.2,
  totalOrders: 1234,
  ordersChange: 5.7,
  averageOrder: 19900,
  averageChange: 2.3,
  topMenuItem: '떡볶이',
  topMenuSales: 980000
})

// 메뉴별 매출 순위
const menuRanking = ref([
  {
    menuName: '떡볶이',
    sales: 980000,
    orders: 327,
    percentage: 40
  },
  {
    menuName: '김밥',
    sales: 735000,
    orders: 294,
    percentage: 30
  },
  {
    menuName: '오징어튀김',
    sales: 490000,
    orders: 123,
    percentage: 20
  },
  {
    menuName: '콜라',
    sales: 245000,
    orders: 163,
    percentage: 10
  }
])

// 시간대별 매출 분석
const timeSlotAnalysis = ref([
  {
    timeSlot: '11:00-13:00',
    sales: 980000,
    orders: 456,
    percentage: 45
  },
  {
    timeSlot: '17:00-19:00',
    sales: 735000,
    orders: 342,
    percentage: 35
  },
  {
    timeSlot: '13:00-17:00',
    sales: 294000,
    orders: 189,
    percentage: 15
  },
  {
    timeSlot: '19:00-21:00',
    sales: 147000,
    orders: 67,
    percentage: 5
  }
])

// AI 인사이트
const salesInsights = ref([
  {
    id: 1,
    type: 'positive',
    icon: 'mdi-trending-up',
    title: '매출 성장세',
    description: '지난 주 대비 매출이 8.2% 증가했습니다. 특히 떡볶이 매출이 크게 늘었습니다.',
    details: '떡볶이의 경우 SNS 마케팅 효과로 인해 젊은 고객층의 주문이 증가했습니다. 인스타그램 게시물 조회수가 1,234회를 기록하며 브랜드 인지도가 상승했습니다.',
    recommendations: [
      '떡볶이 관련 추가 콘텐츠 제작',
      '떡볶이 + 김밥 세트 메뉴 홍보',
      'SNS 마케팅 예산 확대 고려'
    ]
  },
  {
    id: 2,
    type: 'warning',
    icon: 'mdi-clock-alert',
    title: '오후 시간대 매출 저조',
    description: '13-17시 시간대 매출이 전체의 15%에 그치고 있습니다.',
    details: '점심시간 이후 저녁시간 전까지의 매출이 상대적으로 낮습니다. 이 시간대는 주로 학생들과 재택근무자들이 주요 고객층입니다.',
    recommendations: [
      '오후 특가 메뉴 운영',
      '학생 할인 이벤트 진행',
      '간식류 메뉴 개발 및 홍보'
    ]
  },
  {
    id: 3,
    type: 'info',
    icon: 'mdi-chart-bar',
    title: '메뉴 다양성 확대 기회',
    description: '상위 2개 메뉴가 전체 매출의 70%를 차지하고 있습니다.',
    details: '떡볶이와 김밥에 대한 의존도가 높아 메뉴 포트폴리오 다양화가 필요합니다. 새로운 메뉴 개발로 매출 안정성을 높일 수 있습니다.',
    recommendations: [
      '신메뉴 개발 및 테스트 마케팅',
      '계절 한정 메뉴 출시',
      '고객 설문을 통한 니즈 파악'
    ]
  }
])

/**
 * 매출 데이터 로드
 */
const loadSalesData = async () => {
  try {
    // 실제로는 API 호출
    await updateChart()
  } catch (error) {
    console.error('매출 데이터 로드 실패:', error)
    errorMessage.value = '매출 데이터를 불러오는 중 오류가 발생했습니다.'
    showError.value = true
  }
}

/**
 * 차트 업데이트
 */
const updateChart = async () => {
  await nextTick()
  
  // 매출 추이 차트
  if (salesChartInstance) {
    salesChartInstance.destroy()
  }
  
  if (salesChart.value) {
    const ctx = salesChart.value.getContext('2d')
    salesChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: getSalesChartLabels(),
        datasets: [
          {
            label: '매출액',
            data: getSalesChartData(),
            borderColor: '#1976D2',
            backgroundColor: 'rgba(25, 118, 210, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: '전년 동기',
            data: getComparisonData(),
            borderColor: '#FF9800',
            backgroundColor: 'rgba(255, 152, 0, 0.1)',
            borderDash: [5, 5],
            tension: 0.4,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return formatCurrency(value)
              }
            }
          }
        }
      }
    })
  }
  
  // 메뉴별 매출 차트
  if (menuChartInstance) {
    menuChartInstance.destroy()
  }
  
  if (menuChart.value) {
    const ctx2 = menuChart.value.getContext('2d')
    menuChartInstance = new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: menuRanking.value.map(item => item.menuName),
        datasets: [{
          data: menuRanking.value.map(item => item.sales),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    })
  }
}

/**
 * 차트 라벨 생성
 */
const getSalesChartLabels = () => {
  if (chartType.value === 'daily') {
    return ['월', '화', '수', '목', '금', '토', '일']
  } else if (chartType.value === 'weekly') {
    return ['1주차', '2주차', '3주차', '4주차']
  } else {
    return ['1월', '2월', '3월', '4월', '5월', '6월']
  }
}

/**
 * 차트 데이터 생성
 */
const getSalesChartData = () => {
  if (chartType.value === 'daily') {
    return [120000, 135000, 118000, 145000, 160000, 180000, 155000]
  } else if (chartType.value === 'weekly') {
    return [580000, 620000, 595000, 655000]
  } else {
    return [2200000, 2350000, 2180000, 2420000, 2380000, 2450000]
  }
}

/**
 * 비교 데이터 생성
 */
const getComparisonData = () => {
  if (chartType.value === 'daily') {
    return [110000, 125000, 108000, 135000, 150000, 165000, 145000]
  } else if (chartType.value === 'weekly') {
    return [520000, 560000, 535000, 590000]
  } else {
    return [2000000, 2150000, 1980000, 2200000, 2160000, 2250000]
  }
}

/**
 * 인사이트 상세보기
 */
const viewInsightDetail = (insight) => {
  selectedInsight.value = insight
  showInsightDialog.value = true
}

/**
 * 인사이트 제안 적용
 */
const applyInsightRecommendation = (insight) => {
  successMessage.value = `"${insight.title}" 제안이 적용되었습니다.`
  showSuccess.value = true
  showInsightDialog.value = false
}

/**
 * 보고서 내보내기
 */
const exportReport = async () => {
  exporting.value = true
  try {
    // 실제로는 보고서 생성 API 호출
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    successMessage.value = '매출 분석 보고서가 다운로드되었습니다.'
    showSuccess.value = true
  } catch (error) {
    console.error('보고서 내보내기 실패:', error)
    errorMessage.value = '보고서 내보내기 중 오류가 발생했습니다.'
    showError.value = true
  } finally {
    exporting.value = false
  }
}

// 컴포넌트 마운트시 데이터 로드
onMounted(async () => {
  await loadSalesData()
})
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 400px;
}

.chart-container canvas {
  max-height: 100%;
}
</style>