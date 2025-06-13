//* src/views/ContentManagementView.vue
<template>
  <v-container fluid class="pa-4">
    <!-- 필터 영역 -->
    <v-card class="mb-6">
      <v-card-text>
        <v-row align="center">
          <!-- 콘텐츠 타입 필터 - 칩 형태로 변경 -->
          <v-col cols="12" md="6">
            <div class="d-flex align-center flex-wrap ga-2">
              <span class="text-subtitle-2 font-weight-medium mr-2">콘텐츠 타입:</span>
              <v-chip
                v-for="type in contentTypeOptions"
                :key="type.value"
                :color="selectedContentType === type.value ? type.color : 'default'"
                :variant="selectedContentType === type.value ? 'flat' : 'outlined'"
                size="small"
                class="mr-1 chip-hover"
                @click="selectContentType(type.value)"
              >
                <span class="mr-1">{{ type.emoji }}</span>
                {{ type.title.replace(type.emoji + ' ', '') }}
                <span v-if="type.value !== 'all'" class="ml-1">({{ getTypeCount(type.value) }})</span>
                <span v-else class="ml-1">({{ getTotalCount() }})</span>
              </v-chip>
            </div>
          </v-col>

          <!-- 검색 및 새콘텐츠생성 버튼 -->
          <v-col cols="12" md="6">
            <div class="d-flex align-center ga-2">
              <!-- 제목 검색 -->
              <v-text-field
                v-model="searchQuery"
                label="제목, 해시태그로 검색"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                clearable
                hide-details
                @update:model-value="applyFilters"
              />
              
              <!-- 새 콘텐츠 생성 버튼 -->
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                @click="$router.push('/content/create')"
                class="ml-2"
              >
                새콘텐츠생성
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 선택된 항목 일괄 작업 -->
    <div v-if="selectedItems.length > 0" class="mb-4">
      <v-alert color="info" variant="tonal">
        <div class="d-flex justify-space-between align-center">
          <span>{{ selectedItems.length }}개 항목이 선택됨</span>
          <v-btn
            color="error"
            variant="text"
            @click="deleteSelectedItems"
          >
            선택 항목 삭제
          </v-btn>
        </div>
      </v-alert>
    </div>

    <!-- 콘텐츠 목록 -->
    <v-card>
      <v-card-text class="pa-0">
        <div v-if="loading" class="text-center pa-8">
          <v-progress-circular indeterminate color="primary" />
          <div class="mt-4">콘텐츠를 불러오는 중...</div>
        </div>

        <div v-else-if="paginatedContents.length === 0" class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-file-document-outline</v-icon>
          <div class="text-h6 mb-2">표시할 콘텐츠가 없습니다</div>
          <div class="text-body-2 text-grey-600 mb-4">새로운 콘텐츠를 생성해보세요</div>
          <v-btn
            color="primary"
            @click="$router.push('/content/create')"
          >
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
                      {{ content.content ? content.content.substring(0, 80) + '...' : '' }}
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
                  <div class="d-flex ga-1">
                    <v-btn
                      icon="mdi-eye"
                      size="small"
                      variant="text"
                      @click="showDetail(content)"
                    />
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
        </div>
      </v-card-text>
    </v-card>

    <!-- 페이지네이션 -->
    <div v-if="totalPages > 1" class="d-flex justify-center mt-6">
      <v-pagination
        v-model="currentPage"
        :length="totalPages"
        :total-visible="7"
        color="primary"
        @update:model-value="scrollToTop"
      />
    </div>

    <!-- 상세 보기/수정 다이얼로그 -->
    <v-dialog v-model="showDetailDialog" max-width="800px" scrollable>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ isEditMode ? '콘텐츠 수정' : '콘텐츠 상세 정보' }}</span>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="closeDialog"
          />
        </v-card-title>
        
        <v-divider />
        
        <v-card-text class="pa-4" style="max-height: 70vh;">
          <v-form ref="editForm" v-model="editFormValid" v-if="selectedContent">
            <!-- 제목 -->
            <div class="mb-4">
              <label class="text-subtitle-2 font-weight-medium mb-2 d-block">제목</label>
              <v-text-field
                v-if="isEditMode"
                v-model="editingContent.title"
                :rules="titleRules"
                variant="outlined"
                density="compact"
              />
              <div v-else class="text-body-1 font-weight-medium">
                {{ selectedContent.title }}
              </div>
            </div>

            <!-- 플랫폼 (수정 시 비활성화) -->
            <div class="mb-4">
              <label class="text-subtitle-2 font-weight-medium mb-2 d-block">플랫폼</label>
              <v-chip :color="getPlatformColor(selectedContent.platform)" variant="tonal">
                {{ getPlatformText(selectedContent.platform) }}
              </v-chip>
              <div v-if="isEditMode" class="text-caption text-grey-600 mt-1">
                플랫폼은 수정할 수 없습니다.
              </div>
            </div>

            <!-- 홍보 기간 -->
            <div class="mb-4">
              <label class="text-subtitle-2 font-weight-medium mb-2 d-block">홍보 기간</label>
              <div v-if="isEditMode" class="d-flex ga-2">
                <v-text-field
                  v-model="editingContent.startDate"
                  type="date"
                  label="시작일"
                  variant="outlined"
                  density="compact"
                />
                <v-text-field
                  v-model="editingContent.endDate"
                  type="date"
                  label="종료일"
                  variant="outlined"
                  density="compact"
                />
              </div>
              <div v-else class="text-body-1">
                {{ formatDateRange(selectedContent.startDate, selectedContent.endDate) }}
              </div>
            </div>

            <!-- 내용 (수정 시 비활성화) -->
            <div class="mb-4">
              <label class="text-subtitle-2 font-weight-medium mb-2 d-block">내용</label>
              <div v-if="isEditMode" class="pa-3 bg-grey-lighten-4 rounded">
                <div class="text-body-2 text-grey-600 mb-2">
                  내용은 수정할 수 없습니다. 새로 생성해주세요.
                </div>
              </div>
              <div v-else class="text-body-1" style="white-space: pre-wrap;">
                {{ selectedContent.content }}
              </div>
            </div>

            <!-- 해시태그 (수정 시 비활성화) -->
            <div class="mb-4">
              <label class="text-subtitle-2 font-weight-medium mb-2 d-block">해시태그</label>
              <div class="d-flex flex-wrap ga-1">
                <v-chip
                  v-for="tag in selectedContent.hashtags"
                  :key="tag"
                  class="mr-1 mb-1"
                  size="small"
                  color="primary"
                >
                  #{{ tag }}
                </v-chip>
              </div>
              <div v-if="isEditMode" class="text-caption text-grey-600 mt-1">
                해시태그는 수정할 수 없습니다. 새로 생성해주세요.
              </div>
            </div>

            <!-- 상태 -->
            <div class="mb-4">
              <label class="text-subtitle-2 font-weight-medium mb-2 d-block">상태</label>
              <v-select
                v-if="isEditMode"
                v-model="editingContent.status"
                :items="statusOptions"
                variant="outlined"
                density="compact"
              />
              <v-chip v-else :color="getStatusColor(selectedContent.status)" variant="tonal">
                {{ getStatusText(selectedContent.status) }}
              </v-chip>
            </div>
          </v-form>
        </v-card-text>
        
        <!-- 개선된 버튼 영역 -->
        <v-card-actions class="pa-4">
          <v-spacer />
          <div v-if="isEditMode" class="d-flex ga-3">
            <v-btn 
              variant="outlined"
              color="grey"
              @click="cancelEdit"
              class="px-6"
            >
              취소
            </v-btn>
            <v-btn 
              color="primary" 
              @click="saveEdit"
              :loading="updating"
              :disabled="!editFormValid"
              class="px-6 elevation-2"
            >
              저장
            </v-btn>
          </div>
          <div v-else class="d-flex ga-3">
            <v-btn 
              variant="outlined"
              color="primary"
              prepend-icon="mdi-pencil"
              @click="showEditMode"
              class="px-6 elevation-1"
            >
              수정
            </v-btn>
            <v-btn 
              variant="outlined"
              color="error"
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

/**
 * 콘텐츠 관리 화면
 * - 생성된 콘텐츠 목록 조회
 * - 필터링 및 검색
 * - 콘텐츠 상세 보기, 수정, 삭제
 * - 프로모션 기간 정렬 기능
 */

// 스토어 및 라우터
const contentStore = useContentStore()
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
  { title: '📊 전체', value: 'all', color: 'primary', emoji: '📊' },
  { title: '📷 Instagram', value: 'instagram', color: 'pink', emoji: '📷' },
  { title: '📝 네이버 블로그', value: 'blog', color: 'green', emoji: '📝' },
  { title: '🎨 포스터', value: 'poster', color: 'orange', emoji: '🎨' }
]

const statusOptions = [
  { title: '발행됨', value: 'published' },
  { title: '임시저장', value: 'draft' },
  { title: '보관됨', value: 'archived' }
]

const sortOptions = [
  { title: '최신순', value: 'latest' },
  { title: '오래된순', value: 'oldest' },
  { title: '제목순', value: 'title' },
  { title: '조회수순', value: 'views' }
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
  
  // 상태 필터
  if (filters.value.published || filters.value.draft) {
    contents = contents.filter(content => {
      if (filters.value.published && content.status === 'published') return true
      if (filters.value.draft && content.status === 'draft') return true
      return false
    })
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
    await contentStore.loadContents()
  } catch (error) {
    console.error('콘텐츠 로딩 실패:', error)
    showError.value = true
    errorMessage.value = '콘텐츠를 불러오는데 실패했습니다.'
  } finally {
    loading.value = false
  }
}

const selectContentType = (type) => {
  selectedContentType.value = type
  currentPage.value = 1
  // 필터 변경 시 정렬 상태 초기화하지 않음 (별도 처리)
}

const applyFilters = () => {
  currentPage.value = 1
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

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = paginatedContents.value.map(content => content.id)
  } else {
    selectedItems.value = []
  }
}

const sortByPromotionDate = () => {
  if (promotionSortOrder.value === 'none') {
    promotionSortOrder.value = 'asc'
  } else if (promotionSortOrder.value === 'asc') {
    promotionSortOrder.value = 'desc'
  } else {
    promotionSortOrder.value = 'none'
  }
}

// 헬퍼 메서드
const getTotalCount = () => {
  return contentStore.contents?.length || 0
}

const getTypeCount = (type) => {
  if (type === 'all') return getTotalCount()
  return contentStore.contents?.filter(content => {
    // 플랫폼 매핑 처리
    const platformMapping = {
      'instagram': ['instagram', 'INSTAGRAM'],
      'blog': ['blog', 'NAVER_BLOG', 'naver_blog'],
      'poster': ['poster', 'POSTER']
    }
    
    const allowedPlatforms = platformMapping[type] || [type]
    return allowedPlatforms.includes(content.platform)
  }).length || 0
}

const getPlatformColor = (platform) => {
  const colors = {
    'instagram': 'pink',
    'INSTAGRAM': 'pink',
    'blog': 'green',
    'NAVER_BLOG': 'green',
    'poster': 'orange',
    'POSTER': 'orange'
  }
  return colors[platform] || 'grey'
}

const getPlatformText = (platform) => {
  const texts = {
    'instagram': 'Instagram',
    'INSTAGRAM': 'Instagram',
    'blog': '네이버 블로그',
    'NAVER_BLOG': '네이버 블로그',
    'poster': '포스터',
    'POSTER': '포스터'
  }
  return texts[platform] || platform
}

const getStatusColor = (status) => {
  const colors = {
    'published': 'success',
    'draft': 'warning',
    'archived': 'grey'
  }
  return colors[status] || 'grey'
}

const getStatusText = (status) => {
  const texts = {
    'published': '발행됨',
    'draft': '임시저장',
    'archived': '보관됨'
  }
  return texts[status] || status
}

const formatDateRange = (startDate, endDate) => {
  if (!startDate && !endDate) return '-'
  
  const formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  const start = formatDate(startDate)
  const end = formatDate(endDate)
  
  if (start && end) {
    return `${start} ~ ${end}`
  } else if (start) {
    return `${start} ~`
  } else if (end) {
    return `~ ${end}`
  }
  
  return '-'
}

// 라이프사이클
onMounted(async () => {
  loading.value = true
  try {
    await contentStore.loadContents()
  } catch (error) {
    console.error('콘텐츠 로딩 실패:', error)
    showError.value = true
    errorMessage.value = '콘텐츠를 불러오는데 실패했습니다.'
  } finally {
    loading.value = false
  }
})

// 와처
watch(selectedItems, (newVal) => {
  selectAll.value = newVal.length === paginatedContents.value.length && newVal.length > 0
})

// 프로모션 정렬 상태가 변경될 때 다른 정렬 옵션 리셋
watch(promotionSortOrder, (newVal) => {
  if (newVal !== 'none') {
    // 프로모션 정렬이 활성화될 때는 다른 정렬 옵션을 비활성화
    console.log(`프로모션 기간 정렬: ${newVal === 'asc' ? '오름차순' : '내림차순'}`)
  }
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 정렬 가능한 헤더 스타일 */
.sortable-header {
  transition: background-color 0.2s ease-in-out;
}

.sortable-header:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.sortable-header .v-icon {
  transition: color 0.2s ease-in-out;
}

/* 칩 hover 효과 강화 */
.v-chip {
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.v-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chip-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 선택된 칩 강조 */
.v-chip.v-chip--variant-flat {
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

/* 버튼 hover 효과 */
.v-btn {
  transition: all 0.2s ease-in-out;
}

.v-btn:hover {
  transform: translateY(-1px);
}

/* 테이블 행 hover 효과 */
.v-table tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

/* 카드 hover 효과 */
.v-card.cursor-pointer:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease-in-out;
}

/* 다이얼로그 버튼 스타일링 */
.v-card-actions .v-btn {
  font-weight: 500;
  letter-spacing: 0.5px;
}

.v-card-actions .v-btn.elevation-2:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.v-card-actions .v-btn.elevation-1:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

/* 비활성화된 입력 필드 스타일 */
.bg-grey-lighten-4 {
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
}

/* 테이블 스타일 개선 */
.v-table {
  border-radius: 8px;
  overflow: hidden;
}

.v-table thead th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
  position: relative;
}

.v-table tbody td {
  vertical-align: middle;
}

/* 필터 카드 스타일 */
.v-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .d-flex.justify-space-between.align-center {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .v-row .v-col {
    margin-bottom: 8px;
  }
  
  .v-table {
    font-size: 0.875rem;
  }
  
  .v-table th,
  .v-table td {
    padding: 8px 4px;
  }
  
  .sortable-header {
    font-size: 0.8rem;
  }
}

/* 정렬 아이콘 애니메이션 */
@keyframes sortActive {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.sortable-header .v-icon[style*="color: rgb(25, 118, 210)"] {
  animation: sortActive 0.3s ease-in-out;
}
</style>