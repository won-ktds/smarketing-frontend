//* src/views/ContentManagementView.vue
<template>
  <v-container fluid class="pa-6">
    <!-- 페이지 헤더 -->
    <div class="d-flex align-center mb-6">
      <v-icon @click="$router.go(-1)" class="mr-3 cursor-pointer">mdi-arrow-left</v-icon>
      <h1 class="text-h4 font-weight-bold">콘텐츠 관리</h1>
    </div>

    <!-- 컨트롤 영역 -->
    <v-row class="mb-4">
      <!-- 콘텐츠 타입 필터 -->
      <v-col cols="12" md="6">
        <v-chip-group
          v-model="selectedContentType"
          selected-class="text-white"
          mandatory
          class="mb-3"
        >
          <v-chip
            v-for="option in contentTypeOptions"
            :key="option.value"
            :value="option.value"
            :color="option.color"
            @click="selectContentType(option.value)"
            class="mr-2"
          >
            <span class="mr-1">{{ option.emoji }}</span>
            {{ option.title }}
          </v-chip>
        </v-chip-group>
      </v-col>

      <!-- 검색 및 정렬 -->
      <v-col cols="12" md="6">
        <div class="d-flex gap-3">
          <!-- 검색 -->
          <v-text-field
            v-model="searchQuery"
            placeholder="제목, 내용, 해시태그로 검색..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            @input="applyFilters"
            class="flex-grow-1"
          />
        </div>
      </v-col>
    </v-row>

    <!-- 액션 버튼 영역 -->
    <div class="d-flex justify-space-between align-center mb-4">
      <div class="d-flex align-center">
        <span class="text-body-2 text-grey-600">
          총 {{ filteredContents.length }}개 콘텐츠
        </span>
        <v-btn
          v-if="selectedItems.length > 0"
          color="error"
          variant="text"
          prepend-icon="mdi-delete"
          @click="deleteSelectedItems"
          class="ml-4"
        >
          선택 삭제 ({{ selectedItems.length }})
        </v-btn>
      </div>

      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="$router.push('/content/create')"
      >
        새 콘텐츠 생성
      </v-btn>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" size="64" />
      <div class="mt-4 text-body-1">콘텐츠를 불러오는 중...</div>
    </div>

    <!-- 콘텐츠가 없는 경우 -->
    <div v-else-if="filteredContents.length === 0" class="text-center py-12">
      <v-icon size="120" color="grey-lighten-2" class="mb-4">mdi-file-document-outline</v-icon>
      <div class="text-h6 mb-2">표시할 콘텐츠가 없습니다</div>
      <div class="text-body-2 text-grey-600 mb-4">새로운 콘텐츠를 생성해보세요</div>
      <v-btn color="primary" @click="$router.push('/content/create')">
        콘텐츠 생성하기
      </v-btn>
    </div>

    <!-- 리스트 뷰 - 정렬 가능한 테이블 -->
    <div v-else>
      <v-table>
        <thead>
          <tr>
            <th width="50">
              <v-checkbox
                v-model="selectAll"
                @change="toggleSelectAll"
                density="compact"
              />
            </th>
            <th width="450">제목</th>
            <th width="150">플랫폼</th>
            <!-- 프로모션 기간 - 정렬 가능 -->
            <th 
              width="200" 
              class="sortable-header cursor-pointer"
              @click="sortByPromotionDate"
            >
              <div class="d-flex align-center">
                <span>프로모션 기간</span>
                <v-icon 
                  :color="promotionSortOrder === 'none' ? 'grey-lighten-1' : 'primary'"
                  size="16" 
                  class="ml-1"
                >
                  {{
                    promotionSortOrder === 'asc' ? 'mdi-arrow-up' :
                    promotionSortOrder === 'desc' ? 'mdi-arrow-down' :
                    'mdi-unfold-more-horizontal'
                  }}
                </v-icon>
              </div>
            </th>
            <th width="120">액션</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="content in paginatedContents" :key="content.id" class="cursor-pointer" @click="showDetail(content)">
            <td @click.stop>
              <v-checkbox
                v-model="selectedItems"
                :value="content.id"
                density="compact"
              />
            </td>
            <td>
              <div class="d-flex flex-column">
                <div class="d-flex align-center mb-1">
                  <span class="font-weight-medium text-subtitle-2 mr-2">{{ content.title }}</span>
                  <v-chip
                    :color="getStatusColor(content.status)"
                    size="x-small"
                    variant="tonal"
                  >
                    {{ getStatusText(content.status) }}
                  </v-chip>
                </div>
                <div class="text-caption text-truncate grey--text" style="max-width: 400px;">
                  {{ content.content ? content.content.substring(0, 100) + '...' : '' }}
                </div>
              </div>
            </td>
            <td>
              <v-chip
                :color="getPlatformColor(content.platform)"
                size="small"
                variant="tonal"
              >
                {{ getPlatformText(content.platform) }}
              </v-chip>
            </td>
            <td>
              <div class="text-body-2">
                {{ formatDateRange(content.startDate, content.endDate) }}
              </div>
            </td>
            <td @click.stop>
              <div class="d-flex">
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  @click="showDetailWithEdit(content)"
                />
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="confirmDelete(content)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- 페이지네이션 -->
      <div class="d-flex justify-center mt-6" v-if="totalPages > 1">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="7"
          @update:model-value="scrollToTop"
        />
      </div>
    </div>

    <!-- 상세/수정 다이얼로그 -->
    <v-dialog v-model="showDetailDialog" max-width="800px" scrollable>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span class="text-h6">{{ isEditMode ? '콘텐츠 수정' : '콘텐츠 상세' }}</span>
          <v-btn icon="mdi-close" variant="text" @click="closeDialog" />
        </v-card-title>

        <v-card-text v-if="selectedContent">
          <v-form ref="editForm" v-model="editFormValid" v-if="isEditMode">
            <!-- 수정 모드 -->
            <v-text-field
              v-model="editingContent.title"
              label="제목"
              :rules="titleRules"
              variant="outlined"
              class="mb-4"
            />
            
            <v-textarea
              v-model="editingContent.content"
              label="내용"
              rows="8"
              variant="outlined"
              class="mb-4"
            />
            
            <v-text-field
              v-model="editingContent.hashtags"
              label="해시태그 (쉼표로 구분)"
              variant="outlined"
              class="mb-4"
              hint="예: #맛집, #신메뉴, #이벤트"
            />
            
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="editingContent.startDate"
                  label="시작일"
                  type="date"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="editingContent.endDate"
                  label="종료일"
                  type="date"
                  variant="outlined"
                />
              </v-col>
            </v-row>
          </v-form>

          <div v-else>
            <!-- 상세 보기 모드 -->
            <div class="mb-4">
              <div class="text-subtitle-2 text-grey-600 mb-1">제목</div>
              <div class="text-body-1">{{ selectedContent.title }}</div>
            </div>
            
            <div class="mb-4">
              <div class="text-subtitle-2 text-grey-600 mb-1">플랫폼</div>
              <v-chip :color="getPlatformColor(selectedContent.platform)" size="small" variant="tonal">
                {{ getPlatformText(selectedContent.platform) }}
              </v-chip>
            </div>
            
            <div class="mb-4">
              <div class="text-subtitle-2 text-grey-600 mb-1">내용</div>
              <div class="text-body-1 content-preview">{{ selectedContent.content }}</div>
            </div>
            
            <div class="mb-4" v-if="selectedContent.hashtags && selectedContent.hashtags.length > 0">
              <div class="text-subtitle-2 text-grey-600 mb-1">해시태그</div>
              <div class="d-flex flex-wrap gap-1">
                <v-chip
                  v-for="tag in selectedContent.hashtags"
                  :key="tag"
                  size="small"
                  variant="outlined"
                  color="primary"
                >
                  {{ tag }}
                </v-chip>
              </div>
            </div>
            
            <div class="mb-4">
              <div class="text-subtitle-2 text-grey-600 mb-1">프로모션 기간</div>
              <div class="text-body-1">{{ formatDateRange(selectedContent.startDate, selectedContent.endDate) }}</div>
            </div>
            
            <div class="mb-4">
              <div class="text-subtitle-2 text-grey-600 mb-1">상태</div>
              <v-chip :color="getStatusColor(selectedContent.status)" size="small" variant="tonal">
                {{ getStatusText(selectedContent.status) }}
              </v-chip>
            </div>
            
            <div class="mb-4">
              <div class="text-subtitle-2 text-grey-600 mb-1">생성일</div>
              <div class="text-body-1">{{ formatDateTime(selectedContent.createdAt) }}</div>
            </div>
          </div>
        </v-card-text>

        <v-card-actions v-if="selectedContent">
          <div v-if="isEditMode" class="d-flex justify-end w-100 gap-2">
            <v-btn
              variant="outlined"
              @click="cancelEdit"
              :disabled="updating"
            >
              취소
            </v-btn>
            <v-btn
              color="primary"
              @click="saveEdit"
              :loading="updating"
              :disabled="!editFormValid"
              class="px-6 elevation-1"
            >
              저장
            </v-btn>
          </div>
          
          <div v-else class="d-flex justify-end w-100 gap-2">
            <v-btn
              variant="outlined"
              @click="showEditMode"
              class="px-6 elevation-1"
            >
              수정
            </v-btn>
            <v-btn
              color="error"
              variant="outlined"
              prepend-icon="mdi-delete"
              @click="confirmDelete(selectedContent)"
              class="px-6 elevation-1"
            >
              삭제
            </v-btn>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useContentStore } from '@/store/content'
import { useAuthStore } from '@/store/auth'

/**
 * 콘텐츠 관리 화면
 * - 생성된 콘텐츠 목록 조회
 * - 필터링 및 검색
 * - 콘텐츠 상세 보기, 수정, 삭제
 * - 프로모션 기간 정렬 기능
 */

// 스토어 및 라우터
const contentStore = useContentStore()
const authStore = useAuthStore()
const router = useRouter()

// 반응형 데이터
const loading = ref(false)
const searchQuery = ref('')
const selectAll = ref(false)
const selectedItems = ref([])
const currentPage = ref(1)
const itemsPerPage = ref(20)

// 콘텐츠 타입 필터
const selectedContentType = ref('all')

// 기존 필터 상태 (생성 기간 제거)
const filters = ref({
  published: false,
  draft: false
})

// 정렬 상태
const sortBy = ref('latest')

// 프로모션 기간 정렬 상태
const promotionSortOrder = ref('none') // 'none', 'asc', 'desc'

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
const contentTypeOptions = [
  { title: '전체', value: 'all', color: 'primary', emoji: '📊' },
  { title: 'Instagram', value: 'instagram', color: 'pink', emoji: '📷' },
  { title: '네이버 블로그', value: 'blog', color: 'green', emoji: '📝' },
  { title: '포스터', value: 'poster', color: 'orange', emoji: '🎨' }
]

const titleRules = [
  v => !!v || '제목을 입력해주세요',
  v => v.length <= 100 || '제목은 100자 이내로 입력해주세요'
]

// 컴퓨티드 속성
const filteredContents = computed(() => {
  let contents = [...(contentStore.contents || [])]
  
  // 콘텐츠 타입 필터
  if (selectedContentType.value !== 'all') {
    contents = contents.filter(content => {
      // 플랫폼 매핑 처리
      const platformMapping = {
        'instagram': ['instagram', 'INSTAGRAM'],
        'blog': ['blog', 'NAVER_BLOG', 'naver_blog'],
        'poster': ['poster', 'POSTER']
      }
      
      const allowedPlatforms = platformMapping[selectedContentType.value] || [selectedContentType.value]
      return allowedPlatforms.includes(content.platform)
    })
  }
  
  // 검색 필터
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    contents = contents.filter(content => 
      content.title.toLowerCase().includes(query) ||
      content.content.toLowerCase().includes(query) ||
      content.hashtags?.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // 정렬 (프로모션 기간 정렬이 활성화되어 있지 않을 때만)
  if (promotionSortOrder.value === 'none') {
    switch (sortBy.value) {
      case 'latest':
        contents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      case 'oldest':
        contents.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        break
      case 'title':
        contents.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'views':
        contents.sort((a, b) => (b.views || 0) - (a.views || 0))
        break
    }
  } else {
    // 프로모션 기간 정렬
    contents.sort((a, b) => {
      const dateA = new Date(a.startDate || 0)
      const dateB = new Date(b.startDate || 0)
      
      if (promotionSortOrder.value === 'asc') {
        return dateA - dateB
      } else {
        return dateB - dateA
      }
    })
  }

  return contents
})

const paginatedContents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredContents.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredContents.value.length / itemsPerPage.value)
})

// 메서드
const loadContents = async () => {
  loading.value = true
  try {
    console.log('=== 콘텐츠 목록 조회 시작 ===')
    
    // 📋 API 설계서에 따른 쿼리 파라미터 준비
    const filters = {
      contentType: selectedContentType.value !== 'all' ? selectedContentType.value : null,
      platform: getPlatformForAPI(selectedContentType.value),
      period: 'all', // 기본값
      sortBy: sortBy.value || 'latest'
    }
    
    console.log('API 요청 필터:', filters)
    
    // 📡 콘텐츠 스토어를 통해 API 호출
    await contentStore.loadContents(filters)
    
    console.log('✅ 콘텐츠 로딩 완료, 개수:', contentStore.contents?.length || 0)
    
  } catch (error) {
    console.error('❌ 콘텐츠 로딩 실패:', error)
    showError.value = true
    errorMessage.value = error.message || '콘텐츠를 불러오는데 실패했습니다.'
  } finally {
    loading.value = false
  }
}

// 플랫폼 값을 API 요청용으로 변환
const getPlatformForAPI = (contentType) => {
  const platformMapping = {
    'instagram': 'INSTAGRAM',
    'blog': 'NAVER_BLOG', 
    'poster': 'POSTER',
    'all': null
  }
  return platformMapping[contentType] || null
}

const selectContentType = (type) => {
  selectedContentType.value = type
  currentPage.value = 1
  // 타입 변경 시 다시 로딩
  loadContents()
}

const applyFilters = () => {
  currentPage.value = 1
}

const sortByPromotionDate = () => {
  // 프로모션 기간 정렬 토글
  if (promotionSortOrder.value === 'none') {
    promotionSortOrder.value = 'desc'
  } else if (promotionSortOrder.value === 'desc') {
    promotionSortOrder.value = 'asc'
  } else {
    promotionSortOrder.value = 'none'
  }
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = paginatedContents.value.map(content => content.id)
  } else {
    selectedItems.value = []
  }
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const showDetail = (content) => {
  selectedContent.value = { ...content }
  isEditMode.value = false
  showDetailDialog.value = true
}

const showDetailWithEdit = (content) => {
  selectedContent.value = { ...content }
  editingContent.value = { ...content }
  isEditMode.value = true
  showDetailDialog.value = true
}

const showEditMode = () => {
  editingContent.value = { ...selectedContent.value }
  isEditMode.value = true
}

const cancelEdit = () => {
  isEditMode.value = false
  editingContent.value = null
}

const saveEdit = async () => {
  if (!editForm.value.validate()) return
  
  updating.value = true
  try {
    await contentStore.updateContent(editingContent.value.id, editingContent.value)
    selectedContent.value = { ...editingContent.value }
    isEditMode.value = false
    editingContent.value = null
    showSuccess.value = true
    successMessage.value = '콘텐츠가 성공적으로 수정되었습니다.'
  } catch (error) {
    console.error('콘텐츠 수정 실패:', error)
    showError.value = true
    errorMessage.value = '콘텐츠 수정에 실패했습니다.'
  } finally {
    updating.value = false
  }
}

const closeDialog = () => {
  showDetailDialog.value = false
  isEditMode.value = false
  selectedContent.value = null
  editingContent.value = null
}

const confirmDelete = async (content) => {
  if (confirm(`"${content.title}" 콘텐츠를 삭제하시겠습니까?`)) {
    try {
      await contentStore.deleteContent(content.id)
      showSuccess.value = true
      successMessage.value = '콘텐츠가 성공적으로 삭제되었습니다.'
      closeDialog()
    } catch (error) {
      console.error('콘텐츠 삭제 실패:', error)
      showError.value = true
      errorMessage.value = '콘텐츠 삭제에 실패했습니다.'
    }
  }
}

const deleteSelectedItems = async () => {
  if (selectedItems.value.length === 0) return
  
  if (confirm(`선택된 ${selectedItems.value.length}개의 콘텐츠를 삭제하시겠습니까?`)) {
    try {
      await Promise.all(selectedItems.value.map(id => contentStore.deleteContent(id)))
      selectedItems.value = []
      selectAll.value = false
      showSuccess.value = true
      successMessage.value = '선택된 콘텐츠가 성공적으로 삭제되었습니다.'
    } catch (error) {
      console.error('콘텐츠 일괄 삭제 실패:', error)
      showError.value = true
      errorMessage.value = '콘텐츠 삭제에 실패했습니다.'
    }
  }
}

// 유틸리티 함수들
const getStatusColor = (status) => {
  const statusColors = {
    'DRAFT': 'orange',
    'PUBLISHED': 'green', 
    'SCHEDULED': 'blue',
    'ARCHIVED': 'grey'
  }
  return statusColors[status] || 'grey'
}

const getStatusText = (status) => {
  const statusTexts = {
    'DRAFT': '임시저장',
    'PUBLISHED': '발행됨',
    'SCHEDULED': '예약됨', 
    'ARCHIVED': '보관됨'
  }
  return statusTexts[status] || status
}

const getPlatformColor = (platform) => {
  const platformColors = {
    'INSTAGRAM': 'pink',
    'instagram': 'pink',
    'NAVER_BLOG': 'green',
    'blog': 'green',
    'naver_blog': 'green',
    'POSTER': 'orange',
    'poster': 'orange'
  }
  return platformColors[platform] || 'grey'
}

const getPlatformText = (platform) => {
  const platformTexts = {
    'INSTAGRAM': '인스타그램',
    'instagram': '인스타그램',
    'NAVER_BLOG': '네이버 블로그',
    'blog': '네이버 블로그',
    'naver_blog': '네이버 블로그',
    'POSTER': '포스터',
    'poster': '포스터'
  }
  return platformTexts[platform] || platform
}

const formatDateRange = (startDate, endDate) => {
  if (!startDate && !endDate) return '기간 미설정'
  if (!endDate) return formatDate(startDate) + ' ~'
  if (!startDate) return '~ ' + formatDate(endDate)
  return formatDate(startDate) + ' ~ ' + formatDate(endDate)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch (error) {
    return dateString
  }
}

const formatDateTime = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return dateString
  }
}

// 정렬 변경 감지
watch(sortBy, () => {
  // 일반 정렬 선택 시 프로모션 정렬 초기화
  promotionSortOrder.value = 'none'
})

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  console.log('🔄 ContentManagementView 마운트됨')
  
  // 인증 확인
  if (!authStore.isAuthenticated) {
    console.log('❌ 인증되지 않은 사용자')
    router.push('/login')
    return
  }
  
  // 콘텐츠 로딩
  loadContents()
})
</script>

<style scoped>
.sortable-header:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.content-preview {
  white-space: pre-wrap;
  word-break: break-word;
}

.cursor-pointer {
  cursor: pointer;
}
</style>