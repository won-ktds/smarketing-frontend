//* src/views/ContentManagementView.vue
<template>
  <v-container fluid class="pa-4">
    <!-- 페이지 헤더 -->
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-4">
          <v-btn
            icon
            @click="$router.go(-1)"
            class="mr-3"
          >
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <h1 class="text-h5">📝 콘텐츠 관리</h1>
        </div>
        <p class="text-subtitle-1 grey--text">생성된 콘텐츠를 관리하고 성과를 분석합니다</p>
      </v-col>
    </v-row>

    <!-- 필터 섹션 -->
    <v-row class="mb-4">
      <v-col cols="12" md="3">
        <v-card elevation="2" height="400">
          <v-card-title class="text-h6 pa-4">
            <v-icon class="mr-2" color="primary">mdi-filter</v-icon>
            필터
          </v-card-title>
          
          <v-card-text class="pa-4">
            <!-- 콘텐츠 타입 -->
            <div class="mb-4">
              <div class="text-subtitle-2 mb-2">콘텐츠 타입</div>
              <v-checkbox
                v-model="filters.showAll"
                label="전체 (24)"
                color="primary"
                @change="updateContentTypeFilter"
              />
              <v-checkbox
                v-model="filters.instagram"
                label="📷 Instagram (18)"
                color="pink"
                @change="updateContentTypeFilter"
              />
              <v-checkbox
                v-model="filters.naverBlog"
                label="🌿 네이버 블로그 (4)"
                color="green"
                @change="updateContentTypeFilter"
              />
              <v-checkbox
                v-model="filters.poster"
                label="📄 포스터 (2)"
                color="purple"
                @change="updateContentTypeFilter"
              />
            </div>

            <!-- 상태 -->
            <div class="mb-4">
              <div class="text-subtitle-2 mb-2">상태</div>
              <v-checkbox
                v-model="filters.published"
                label="게시됨 (18)"
                color="success"
                @change="applyFilters"
              />
              <v-checkbox
                v-model="filters.draft"
                label="임시저장 (6)"
                color="orange"
                @change="applyFilters"
              />
            </div>

            <!-- 기간 -->
            <div class="mb-4">
              <div class="text-subtitle-2 mb-2">기간</div>
              <v-select
                v-model="filters.period"
                label="전체 기간"
                variant="outlined"
                density="compact"
                :items="periodOptions"
                @update:model-value="applyFilters"
              />
            </div>

            <!-- 필터 초기화 -->
            <v-btn
              color="grey"
              variant="outlined"
              block
              @click="resetFilters"
            >
              <v-icon class="mr-1">mdi-refresh</v-icon>
              필터 초기화
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 콘텐츠 목록 -->
      <v-col cols="12" md="9">
        <v-card elevation="2">
          <!-- 상단 툴바 -->
          <v-card-title class="d-flex align-center justify-space-between pa-4">
            <div class="d-flex align-center">
              <v-checkbox
                v-model="selectAll"
                @change="toggleSelectAll"
                class="mr-2"
              />
              <span class="text-h6">24개 콘텐츠</span>
            </div>
            
            <div class="d-flex align-center">
              <!-- 검색 -->
              <v-text-field
                v-model="searchQuery"
                placeholder="제목, 해시태그로 검색..."
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-magnify"
                hide-details
                class="mr-3"
                style="max-width: 300px;"
                @input="filterContent"
              />
              
              <!-- 뷰 옵션 -->
              <v-btn-toggle
                v-model="viewMode"
                mandatory
                class="mr-3"
              >
                <v-btn icon size="small" value="list">
                  <v-icon>mdi-view-list</v-icon>
                </v-btn>
                <v-btn icon size="small" value="grid">
                  <v-icon>mdi-view-grid</v-icon>
                </v-btn>
              </v-btn-toggle>
            </div>
          </v-card-title>

          <v-divider />

          <!-- 테이블 헤더 -->
          <div class="content-table">
            <div class="table-header">
              <div class="header-cell" style="width: 50px;"></div>
              <div class="header-cell" style="width: 300px;">제목</div>
              <div class="header-cell" style="width: 100px;">플랫폼</div>
              <div class="header-cell" style="width: 100px;">생성일</div>
              <div class="header-cell" style="width: 80px;">상태</div>
              <div class="header-cell" style="width: 80px;">액션</div>
            </div>

            <!-- 콘텐츠 행들 -->
            <div class="table-body">
              <div
                v-for="content in paginatedContents"
                :key="content.id"
                class="content-row"
                @click="viewContent(content)"
              >
                <div class="cell" style="width: 50px;">
                  <v-checkbox
                    v-model="selectedItems"
                    :value="content.id"
                    @click.stop
                  />
                </div>
                
                <div class="cell" style="width: 300px;">
                  <div class="content-title">
                    <h4>{{ content.title }}</h4>
                    <p class="text-caption grey--text">{{ truncateText(content.content, 50) }}</p>
                    <div class="hashtags mt-1">
                      <v-chip
                        v-for="tag in content.hashtags?.slice(0, 3)"
                        :key="tag"
                        size="x-small"
                        color="primary"
                        class="mr-1"
                      >
                        {{ tag }}
                      </v-chip>
                    </div>
                  </div>
                </div>
                
                <div class="cell" style="width: 100px;">
                  <v-chip
                    :color="getPlatformColor(content.platform)"
                    size="small"
                  >
                    {{ getPlatformText(content.platform) }}
                  </v-chip>
                </div>
                
                <div class="cell" style="width: 100px;">
                  <div class="text-body-2">{{ formatDate(content.createdAt) }}</div>
                  <div class="text-caption grey--text">{{ formatTime(content.createdAt) }}</div>
                </div>
                
                <div class="cell" style="width: 80px;">
                  <v-chip
                    :color="getStatusColor(content.status)"
                    size="small"
                  >
                    {{ getStatusText(content.status) }}
                  </v-chip>
                </div>
                
                <div class="cell" style="width: 80px;">
                  <div class="action-buttons">
                    <v-btn
                      icon
                      size="small"
                      @click.stop="viewContent(content)"
                    >
                      <v-icon size="16">mdi-eye</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      size="small"
                      @click.stop="editContent(content)"
                    >
                      <v-icon size="16">mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      size="small"
                      color="error"
                      @click.stop="confirmDelete(content)"
                    >
                      <v-icon size="16">mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 빈 상태 -->
          <v-card-text v-if="filteredContents.length === 0" class="text-center pa-8">
            <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-folder-open</v-icon>
            <p class="text-h6 grey--text mb-4">
              {{ searchQuery ? '검색 조건에 맞는 콘텐츠가 없습니다' : '아직 생성된 콘텐츠가 없습니다' }}
            </p>
            <v-btn color="primary" @click="$router.push({ name: 'ContentCreation' })">
              첫 콘텐츠 만들기
            </v-btn>
          </v-card-text>

          <!-- 페이지네이션 -->
          <v-divider v-if="totalPages > 1" />
          <v-card-actions v-if="totalPages > 1" class="justify-center pa-4">
            <v-pagination
              v-model="currentPage"
              :length="totalPages"
              :total-visible="5"
              color="primary"
            />
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- 콘텐츠 상세 다이얼로그 -->
    <v-dialog v-model="showDetailDialog" max-width="800" scrollable>
      <v-card v-if="selectedContent">
        <v-card-title class="d-flex align-center justify-space-between">
          <span class="text-h6">{{ selectedContent.title }}</span>
          <v-btn icon @click="showDetailDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-divider />
        
        <v-card-text class="pa-4">
          <!-- 수정 모드일 때 -->
          <div v-if="isEditMode">
            <v-form ref="editForm" v-model="editFormValid">
              <v-row class="mb-4">
                <v-col cols="12">
                  <v-text-field
                    v-model="editingContent.title"
                    label="제목"
                    variant="outlined"
                    :rules="[v => !!v || '제목을 입력해주세요']"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="editingContent.createdAt"
                    label="생성일"
                    variant="outlined"
                    type="datetime-local"
                    :rules="[v => !!v || '생성일을 입력해주세요']"
                  />
                </v-col>
              </v-row>
            </v-form>
          </div>
          
          <!-- 보기 모드일 때 -->
          <div v-else>
            <!-- 메타 정보 -->
            <v-row class="mb-4">
              <v-col cols="6">
                <div class="text-caption grey--text">플랫폼</div>
                <v-chip :color="getPlatformColor(selectedContent.platform)" size="small" class="mt-1">
                  <v-icon class="mr-1" size="16">{{ getPlatformIcon(selectedContent.platform) }}</v-icon>
                  {{ getPlatformText(selectedContent.platform) }}
                </v-chip>
              </v-col>
              <v-col cols="6">
                <div class="text-caption grey--text">상태</div>
                <v-chip :color="getStatusColor(selectedContent.status)" size="small" class="mt-1">
                  {{ getStatusText(selectedContent.status) }}
                </v-chip>
              </v-col>
              <v-col cols="6">
                <div class="text-caption grey--text">생성일</div>
                <div class="text-body-2 mt-1">{{ formatDateTime(selectedContent.createdAt) }}</div>
              </v-col>
              <v-col cols="6">
                <div class="text-caption grey--text">조회수</div>
                <div class="text-body-2 mt-1">{{ formatNumber(selectedContent.views || 0) }}</div>
              </v-col>
            </v-row>
            
            <!-- 콘텐츠 내용 -->
            <div class="mb-4">
              <div class="text-caption grey--text mb-2">콘텐츠</div>
              <v-card class="pa-4" color="blue-grey-lighten-5" variant="tonal">
                <div class="text-body-1" style="white-space: pre-line;">{{ selectedContent.content }}</div>
              </v-card>
            </div>
            
            <!-- 해시태그 -->
            <div v-if="selectedContent.hashtags?.length" class="mb-4">
              <div class="text-caption grey--text mb-2">해시태그</div>
              <v-chip
                v-for="tag in selectedContent.hashtags"
                :key="tag"
                class="mr-1 mb-1"
                size="small"
                color="primary"
              >
                {{ tag }}
              </v-chip>
            </div>
          </div>
        </v-card-text>
        
        <v-card-actions class="pa-4">
          <div v-if="isEditMode">
            <v-btn 
              color="primary" 
              @click="saveEdit"
              :loading="updating"
              :disabled="!editFormValid"
            >
              저장
            </v-btn>
            <v-btn color="grey" @click="cancelEdit" class="ml-2">취소</v-btn>
          </div>
          <div v-else>
            <v-btn color="primary" @click="showEditMode">수정</v-btn>
            <v-spacer />
            <v-btn color="error" @click="confirmDelete(selectedContent)">삭제</v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 성공/오류 스낵바 -->
    <v-snackbar v-model="showSuccess" color="success" timeout="3000">
      {{ successMessage }}
    </v-snackbar>
    
    <v-snackbar v-model="showError" color="error" timeout="3000">
      {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useContentStore } from '@/store/content'

/**
 * 콘텐츠 관리 화면
 * - 생성된 콘텐츠 목록 조회
 * - 필터링 및 검색
 * - 콘텐츠 상세 보기, 수정, 삭제
 */

// 스토어 및 라우터
const contentStore = useContentStore()
const router = useRouter()

// 반응형 데이터
const loading = ref(false)
const searchQuery = ref('')
const viewMode = ref('list')
const selectAll = ref(false)
const selectedItems = ref([])
const currentPage = ref(1)
const itemsPerPage = ref(20)

// 필터 상태
const filters = ref({
  showAll: true,
  instagram: false,
  naverBlog: false,
  poster: false,
  published: false,
  draft: false,
  period: '전체'
})

// 다이얼로그 상태
const showDetailDialog = ref(false)
const selectedContent = ref(null)
const isEditMode = ref(false)
const editingContent = ref(null)
const editForm = ref(null)
const editFormValid = ref(false)
const updating = ref(false)

// 메시지 상태
const showSuccess = ref(false)
const showError = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// 옵션 데이터
const periodOptions = [
  { title: '전체', value: '전체' },
  { title: '오늘', value: '오늘' },
  { title: '일주일', value: '일주일' },
  { title: '한달', value: '한달' },
  { title: '3개월', value: '3개월' }
]

// 계산된 속성
const filteredContents = computed(() => {
  let contents = contentStore.contents || []

  // 검색 필터링
  if (searchQuery.value) {
    const keyword = searchQuery.value.toLowerCase()
    contents = contents.filter(content => 
      content.title.toLowerCase().includes(keyword) ||
      content.content.toLowerCase().includes(keyword) ||
      (content.hashtags && content.hashtags.some(tag => 
        tag.toLowerCase().includes(keyword)
      ))
    )
  }

  // 콘텐츠 타입 필터링
  if (!filters.value.showAll) {
    const selectedTypes = []
    if (filters.value.instagram) selectedTypes.push('INSTAGRAM')
    if (filters.value.naverBlog) selectedTypes.push('NAVER_BLOG')
    if (filters.value.poster) selectedTypes.push('POSTER')
    
    if (selectedTypes.length > 0) {
      contents = contents.filter(content => selectedTypes.includes(content.platform))
    }
  }

  // 상태 필터링
  const selectedStatuses = []
  if (filters.value.published) selectedStatuses.push('PUBLISHED')
  if (filters.value.draft) selectedStatuses.push('DRAFT')
  
  if (selectedStatuses.length > 0) {
    contents = contents.filter(content => selectedStatuses.includes(content.status))
  }

  return contents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const totalPages = computed(() => 
  Math.ceil(filteredContents.value.length / itemsPerPage.value)
)

const paginatedContents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredContents.value.slice(start, end)
})

// 유틸리티 함수
const getPlatformColor = (platform) => {
  const colors = {
    'INSTAGRAM': 'pink',
    'NAVER_BLOG': 'green',
    'POSTER': 'purple'
  }
  return colors[platform] || 'grey'
}

const getPlatformIcon = (platform) => {
  const icons = {
    'INSTAGRAM': 'mdi-instagram',
    'NAVER_BLOG': 'mdi-blogger',
    'POSTER': 'mdi-image'
  }
  return icons[platform] || 'mdi-web'
}

const getPlatformText = (platform) => {
  const texts = {
    'INSTAGRAM': 'Instagram',
    'NAVER_BLOG': 'N.Blog',
    'POSTER': '포스터'
  }
  return texts[platform] || platform
}

const getStatusColor = (status) => {
  const colors = {
    'DRAFT': 'orange',
    'PUBLISHED': 'success'
  }
  return colors[status] || 'grey'
}

const getStatusText = (status) => {
  const texts = {
    'DRAFT': '임시저장',
    'PUBLISHED': '게시됨'
  }
  return texts[status] || status
}

const truncateText = (text, limit) => {
  if (!text) return ''
  return text.length > limit ? text.substring(0, limit) + '...' : text
}

const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
}

const formatTime = (dateString) => {
  const date = new Date(dateString)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR')
}

// 이벤트 핸들러
const updateContentTypeFilter = () => {
  if (filters.value.showAll) {
    filters.value.instagram = false
    filters.value.naverBlog = false
    filters.value.poster = false
  } else {
    if (!filters.value.instagram && !filters.value.naverBlog && !filters.value.poster) {
      filters.value.showAll = true
    }
  }
  applyFilters()
}

const applyFilters = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  filters.value = {
    showAll: true,
    instagram: false,
    naverBlog: false,
    poster: false,
    published: false,
    draft: false,
    period: '전체'
  }
  searchQuery.value = ''
  currentPage.value = 1
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = paginatedContents.value.map(content => content.id)
  } else {
    selectedItems.value = []
  }
}

const filterContent = () => {
  currentPage.value = 1
}

const viewContent = (content) => {
  selectedContent.value = content
  isEditMode.value = false
  showDetailDialog.value = true
}

const showEditMode = () => {
  editingContent.value = {
    ...selectedContent.value,
    createdAt: new Date(selectedContent.value.createdAt).toISOString().slice(0, 16)
  }
  isEditMode.value = true
}

const cancelEdit = () => {
  isEditMode.value = false
  editingContent.value = null
}

const saveEdit = async () => {
  if (!editFormValid.value) return

  updating.value = true
  try {
    // 실제로는 API 호출
    selectedContent.value.title = editingContent.value.title
    selectedContent.value.createdAt = new Date(editingContent.value.createdAt).toISOString()
    
    isEditMode.value = false
    editingContent.value = null
    successMessage.value = '콘텐츠가 수정되었습니다.'
    showSuccess.value = true
  } catch (error) {
    console.error('수정 실패:', error)
    errorMessage.value = '콘텐츠 수정 중 오류가 발생했습니다.'
    showError.value = true
  } finally {
    updating.value = false
  }
}

const editContent = (content) => {
  router.push({
    name: 'ContentCreation',
    query: { edit: content.id }
  })
}

const duplicateContent = async (content) => {
  // 복사 기능 제거됨
}

const confirmDelete = async (content) => {
  if (confirm(`"${content.title}" 콘텐츠를 삭제하시겠습니까?`)) {
    try {
      // 실제로는 API 호출
      successMessage.value = '콘텐츠가 삭제되었습니다.'
      showSuccess.value = true
      showDetailDialog.value = false
    } catch (error) {
      console.error('삭제 실패:', error)
      errorMessage.value = '콘텐츠 삭제 중 오류가 발생했습니다.'
      showError.value = true
    }
  }
}

// 컴포넌트 마운트
onMounted(async () => {
  try {
    await contentStore.fetchContents()
  } catch (error) {
    console.error('콘텐츠 로드 실패:', error)
    // 샘플 데이터 설정
    contentStore.contents = [
      {
        id: 1,
        title: '신메뉴 떡볶이 출시!',
        content: '🔥 새로운 맛의 떡볶이가 출시되었어요! 매콤달콤한 특제 소스로 만든 우리 매장만의 시그니처 떡볶이를 맛보세요!',
        platform: 'INSTAGRAM',
        status: 'PUBLISHED',
        hashtags: ['떡볶이', '신메뉴', '맛집'],
        views: 1234,
        likes: 87,
        revenue: 15000,
        createdAt: '2024-06-10T14:30:00Z'
      },
      {
        id: 2,
        title: '주말 특가 이벤트 안내',
        content: '주말을 맞이하여 준비한 특별 이벤트를 알려드립니다. 온라인 주문시 특별 할인!',
        platform: 'NAVER_BLOG',
        status: 'PUBLISHED',
        hashtags: ['이벤트', '할인'],
        views: 567,
        likes: 45,
        revenue: 8500,
        createdAt: '2024-06-09T10:15:00Z'
      },
      {
        id: 3,
        title: '김밥 세트 홍보 (임시저장)',
        content: '신선한 재료로 만든 김밥 세트를 한번 드셔보세요...',
        platform: 'INSTAGRAM',
        status: 'DRAFT',
        hashtags: ['김밥', '세트메뉴'],
        views: 0,
        likes: 0,
        revenue: 0,
        createdAt: '2024-06-06T15:20:00Z'
      }
    ]
  }
})
</script>

<style scoped>
.content-table {
  border: 1px solid #e0e0e0;
}

.table-header {
  display: flex;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  padding: 12px 0;
  font-weight: 600;
}

.header-cell {
  padding: 8px 12px;
  border-right: 1px solid #e0e0e0;
  text-align: center;
  font-size: 14px;
}

.header-cell:last-child {
  border-right: none;
}

.table-body {
  max-height: 600px;
  overflow-y: auto;
}

.content-row {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.content-row:hover {
  background-color: #f9f9f9;
}

.cell {
  padding: 12px;
  border-right: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cell:last-child {
  border-right: none;
}

.thumbnail {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-title {
  text-align: left;
  width: 100%;
}

.content-title h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
}

.content-title p {
  margin: 0;
  font-size: 12px;
  line-height: 1.3;
}

.hashtags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.performance {
  text-align: center;
}

.performance > div {
  margin-bottom: 2px;
  font-size: 12px;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.action-buttons .v-btn {
  min-width: 24px !important;
  width: 24px;
  height: 24px;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .content-table {
    overflow-x: auto;
  }
  
  .table-header,
  .content-row {
    min-width: 710px;
  }
  
  .cell {
    padding: 8px;
  }
  
  .header-cell {
    padding: 8px;
    font-size: 12px;
  }
  
  .content-title h4 {
    font-size: 13px;
  }
  
  .content-title p {
    font-size: 11px;
  }
}
</style>