//* src/views/ContentManagementView.vue
<template>
  <v-container fluid class="pa-4">
    <!-- 헤더 -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-2">콘텐츠 관리</h1>
        <p class="text-subtitle-1 text-grey-600">
          생성된 콘텐츠를 관리하고 편집할 수 있습니다.
        </p>
      </div>
      
      <!-- 새 콘텐츠 생성 버튼 - ContentCreationView로 redirect -->
      <v-btn
        color="primary"
        size="large"
        prepend-icon="mdi-plus"
        @click="$router.push('/content/create')"
      >
        새 콘텐츠 생성
      </v-btn>
    </div>

    <!-- 통계 카드 -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4">
          <div class="d-flex align-center">
            <v-icon color="primary" size="32" class="mr-3">mdi-file-document-multiple</v-icon>
            <div>
              <div class="text-h5 font-weight-bold">{{ getTotalCount() }}</div>
              <div class="text-caption text-grey-600">전체 콘텐츠</div>
            </div>
          </div>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4">
          <div class="d-flex align-center">
            <v-icon color="success" size="32" class="mr-3">mdi-instagram</v-icon>
            <div>
              <div class="text-h5 font-weight-bold">{{ getTypeCount('instagram') }}</div>
              <div class="text-caption text-grey-600">인스타그램</div>
            </div>
          </div>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4">
          <div class="d-flex align-center">
            <v-icon color="info" size="32" class="mr-3">mdi-facebook</v-icon>
            <div>
              <div class="text-h5 font-weight-bold">{{ getTypeCount('facebook') }}</div>
              <div class="text-caption text-grey-600">페이스북</div>
            </div>
          </div>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4">
          <div class="d-flex align-center">
            <v-icon color="warning" size="32" class="mr-3">mdi-web</v-icon>
            <div>
              <div class="text-h5 font-weight-bold">{{ getTypeCount('blog') }}</div>
              <div class="text-caption text-grey-600">블로그</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 필터 및 검색 -->
    <v-card class="mb-6">
      <v-card-text>
        <v-row align="center">
          <!-- 콘텐츠 타입 필터 -->
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedContentType"
              :items="contentTypeItems"
              label="콘텐츠 타입"
              prepend-inner-icon="mdi-filter-variant"
              variant="outlined"
              density="compact"
              @update:model-value="applyContentTypeFilter"
            />
          </v-col>

          <!-- 검색 -->
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchQuery"
              label="제목으로 검색"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              @update:model-value="applyFilters"
            />
          </v-col>

          <!-- 필터 초기화 -->
          <v-col cols="12" md="2">
            <v-btn
              color="grey"
              variant="outlined"
              block
              @click="resetFilters"
            >
              필터 초기화
            </v-btn>
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

        <!-- 리스트 뷰 - 테이블 형태 -->
        <div v-else-if="viewMode === 'list'">
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
                <th width="200">프로모션 기간</th>
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
                      {{ content.content }}
                    </div>
                    <div v-if="content.hashtags?.length" class="mt-1">
                      <v-chip
                        v-for="tag in content.hashtags.slice(0, 3)"
                        :key="tag"
                        size="x-small"
                        variant="outlined"
                        class="mr-1"
                      >
                        #{{ tag }}
                      </v-chip>
                      <span v-if="content.hashtags.length > 3" class="text-caption text-grey-600">
                        +{{ content.hashtags.length - 3 }}개
                      </span>
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
                  <div class="d-flex ga-2">
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      color="primary"
                      @click="editContent(content)"
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

        <!-- 카드 뷰 -->
        <div v-else-if="viewMode === 'card'" class="pa-4">
          <v-row>
            <v-col
              v-for="content in paginatedContents"
              :key="content.id"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card class="h-100 cursor-pointer" @click="showDetail(content)">
                <v-card-text>
                  <div class="d-flex justify-space-between align-start mb-2">
                    <v-chip
                      :color="getPlatformColor(content.platform)"
                      size="small"
                      variant="tonal"
                    >
                      {{ getPlatformText(content.platform) }}
                    </v-chip>
                    <v-checkbox
                      v-model="selectedItems"
                      :value="content.id"
                      density="compact"
                      @click.stop
                    />
                  </div>
                  
                  <h4 class="text-subtitle-1 font-weight-bold mb-2 text-truncate">
                    {{ content.title }}
                  </h4>
                  
                  <p class="text-body-2 text-grey-600 mb-3" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    {{ content.content }}
                  </p>
                  
                  <div class="mb-3">
                    <div class="text-caption text-grey-600 mb-1">프로모션 기간</div>
                    <div class="text-body-2">
                      {{ formatDateRange(content.startDate, content.endDate) }}
                    </div>
                  </div>
                  
                  <div v-if="content.hashtags?.length" class="mb-3">
                    <v-chip
                      v-for="tag in content.hashtags.slice(0, 2)"
                      :key="tag"
                      size="x-small"
                      variant="outlined"
                      class="mr-1 mb-1"
                    >
                      #{{ tag }}
                    </v-chip>
                    <span v-if="content.hashtags.length > 2" class="text-caption text-grey-600">
                      +{{ content.hashtags.length - 2 }}
                    </span>
                  </div>
                  
                  <div class="d-flex justify-space-between align-center">
                    <v-chip
                      :color="getStatusColor(content.status)"
                      size="small"
                      variant="tonal"
                    >
                      {{ getStatusText(content.status) }}
                    </v-chip>
                    
                    <div class="text-caption text-grey-600">
                      {{ formatDate(content.createdAt) }}
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-card-text>

      <!-- 페이지네이션 -->
      <v-card-actions v-if="totalPages > 1" class="justify-center">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="7"
          circle
        />
      </v-card-actions>
    </v-card>

    <!-- 상세보기/편집 다이얼로그 -->
    <v-dialog v-model="showDetailDialog" max-width="800" scrollable>
      <v-card v-if="selectedContent">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ isEditMode ? '콘텐츠 편집' : '콘텐츠 상세보기' }}</span>
          <v-btn icon="mdi-close" variant="text" @click="showDetailDialog = false" />
        </v-card-title>
        
        <v-divider />
        
        <v-card-text style="max-height: 600px;">
          <v-form ref="editForm" v-model="editFormValid">
            <!-- 제목 -->
            <div class="mb-4">
              <label class="text-subtitle-2 font-weight-medium mb-2 d-block">제목</label>
              <v-text-field
                v-if="isEditMode"
                v-model="editingContent.title"
                variant="outlined"
                density="compact"
                :rules="titleRules"
              />
              <div v-else class="text-body-1">{{ selectedContent.title }}</div>
            </div>

            <!-- 플랫폼 -->
            <div class="mb-4">
              <label class="text-subtitle-2 font-weight-medium mb-2 d-block">플랫폼</label>
              <v-select
                v-if="isEditMode"
                v-model="editingContent.platform"
                :items="platformOptions"
                variant="outlined"
                density="compact"
              />
              <v-chip v-else :color="getPlatformColor(selectedContent.platform)" variant="tonal">
                {{ getPlatformText(selectedContent.platform) }}
              </v-chip>
            </div>

            <!-- 프로모션 기간 -->
            <div class="mb-4">
              <label class="text-subtitle-2 font-weight-medium mb-2 d-block">프로모션 기간</label>
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

            <!-- 콘텐츠 내용 -->
            <div class="mb-4">
              <label class="text-subtitle-2 font-weight-medium mb-2 d-block">콘텐츠 내용</label>
              <v-textarea
                v-if="isEditMode"
                v-model="editingContent.content"
                variant="outlined"
                rows="4"
                auto-grow
              />
              <div v-else class="text-body-1" style="white-space: pre-wrap;">
                {{ selectedContent.content }}
              </div>
            </div>

            <!-- 해시태그 -->
            <div class="mb-4">
              <label class="text-subtitle-2 font-weight-medium mb-2 d-block">해시태그</label>
              <div v-if="isEditMode">
                <!-- 편집 모드 해시태그 입력 -->
                <div class="d-flex flex-wrap ga-1 mb-2">
                  <v-chip
                    v-for="(tag, index) in editingContent.hashtags"
                    :key="index"
                    closable
                    @click:close="editingContent.hashtags.splice(index, 1)"
                  >
                    #{{ tag }}
                  </v-chip>
                </div>
                <v-text-field
                  v-model="newHashtag"
                  label="새 해시태그 추가"
                  variant="outlined"
                  density="compact"
                  @keydown.enter="addHashtagToEdit"
                />
              </div>
              <div v-else class="d-flex flex-wrap ga-1">
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

// 콘텐츠 타입 필터 (단순한 방식으로 변경)
const selectedContentType = ref('all')

// 기존 필터 상태
const filters = ref({
  published: false,
  draft: false,
  period: '전체'
})

// 정렬 상태
const sortBy = ref('latest')

// 다이얼로그 상태
const showDetailDialog = ref(false)
const selectedContent = ref(null)
const isEditMode = ref(false)
const editingContent = ref(null)
const editForm = ref(null)
const editFormValid = ref(false)
const updating = ref(false)
const newHashtag = ref('')

// 메시지 상태
const showSuccess = ref(false)
const showError = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// 옵션 데이터
const contentTypeItems = [
  { title: '전체', value: 'all' },
  { title: '인스타그램', value: 'instagram' },
  { title: '페이스북', value: 'facebook' },
  { title: '블로그', value: 'blog' },
  { title: '유튜브', value: 'youtube' }
]

const platformOptions = [
  { title: '인스타그램', value: 'instagram' },
  { title: '페이스북', value: 'facebook' },
  { title: '블로그', value: 'blog' },
  { title: '유튜브', value: 'youtube' }
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
    contents = contents.filter(content => content.platform === selectedContentType.value)
  }
  
  // 검색 필터
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    contents = contents.filter(content => 
      content.title.toLowerCase().includes(query) ||
      content.content.toLowerCase().includes(query)
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
  
  // 기간 필터
  if (filters.value.period !== '전체') {
    const now = new Date()
    const startDate = new Date()
    
    switch (filters.value.period) {
      case '1주일':
        startDate.setDate(now.getDate() - 7)
        break
      case '1개월':
        startDate.setMonth(now.getMonth() - 1)
        break
      case '3개월':
        startDate.setMonth(now.getMonth() - 3)
        break
      case '6개월':
        startDate.setMonth(now.getMonth() - 6)
        break
    }
    
    contents = contents.filter(content => 
      new Date(content.createdAt) >= startDate
    )
  }

  // 정렬
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

// 헬퍼 메서드
const getTotalCount = () => {
  return contentStore.contents?.length || 0
}

const getTypeCount = (type) => {
  return contentStore.contents?.filter(content => content.platform === type).length || 0
}

const getPlatformColor = (platform) => {
  const colors = {
    instagram: 'pink',
    facebook: 'blue',
    blog: 'orange',
    youtube: 'red'
  }
  return colors[platform] || 'grey'
}

const getPlatformText = (platform) => {
  const texts = {
    instagram: '인스타그램',
    facebook: '페이스북',
    blog: '블로그',
    youtube: '유튜브'
  }
  return texts[platform] || platform
}

const getStatusColor = (status) => {
  const colors = {
    published: 'success',
    draft: 'warning',
    archived: 'grey'
  }
  return colors[status] || 'grey'
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\./g, '.').replace(/ /g, '')
}

const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '-'
  
  const start = new Date(startDate).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\./g, '.').replace(/ /g, '')
  
  const end = new Date(endDate).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\./g, '.').replace(/ /g, '')
  
  return `${start} ~ ${end}`
}

// 필터 메서드
const applyContentTypeFilter = () => {
  currentPage.value = 1
}

const applyFilters = () => {
  currentPage.value = 1
}

const applySorting = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  selectedContentType.value = 'all'
  searchQuery.value = ''
  filters.value = {
    published: false,
    draft: false,
    period: '전체'
  }
  sortBy.value = 'latest'
  currentPage.value = 1
}

// 선택 관련 메서드
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = paginatedContents.value.map(content => content.id)
  } else {
    selectedItems.value = []
  }
}

const deleteSelectedItems = async () => {
  if (selectedItems.value.length === 0) return
  
  if (confirm(`선택된 ${selectedItems.value.length}개의 콘텐츠를 삭제하시겠습니까?`)) {
    try {
      await contentStore.deleteMultipleContents(selectedItems.value)
      selectedItems.value = []
      selectAll.value = false
      showSuccessMessage('선택된 콘텐츠가 삭제되었습니다.')
    } catch (error) {
      showErrorMessage('콘텐츠 삭제 중 오류가 발생했습니다.')
    }
  }
}

// 상세 보기 관련 메서드
const showDetail = (content) => {
  selectedContent.value = content
  showDetailDialog.value = true
  isEditMode.value = false
}

const showEditMode = () => {
  editingContent.value = { 
    ...selectedContent.value,
    hashtags: [...(selectedContent.value.hashtags || [])]
  }
  isEditMode.value = true
}

// 편집 관련 메서드
const editContent = (content) => {
  selectedContent.value = content
  editingContent.value = { 
    ...content,
    hashtags: [...(content.hashtags || [])]
  }
  isEditMode.value = true
  showDetailDialog.value = true
}

const cancelEdit = () => {
  editingContent.value = null
  isEditMode.value = false
  newHashtag.value = ''
}

const saveEdit = async () => {
  if (!editFormValid.value) return
  
  updating.value = true
  try {
    await contentStore.updateContent(editingContent.value.id, editingContent.value)
    selectedContent.value = { ...editingContent.value }
    showSuccessMessage('콘텐츠가 수정되었습니다.')
    isEditMode.value = false
    editingContent.value = null
  } catch (error) {
    showErrorMessage('콘텐츠 수정 중 오류가 발생했습니다.')
  } finally {
    updating.value = false
  }
}

const addHashtagToEdit = () => {
  const tag = newHashtag.value.trim().replace('#', '')
  if (tag && !editingContent.value.hashtags.includes(tag)) {
    editingContent.value.hashtags.push(tag)
    newHashtag.value = ''
  }
}

// 삭제 관련 메서드
const confirmDelete = (content) => {
  if (confirm(`"${content.title}" 콘텐츠를 삭제하시겠습니까?`)) {
    deleteContent(content.id)
  }
}

const deleteContent = async (contentId) => {
  try {  
    await contentStore.deleteContent(contentId)
    showSuccessMessage('콘텐츠가 삭제되었습니다.')
    if (showDetailDialog.value) {
      showDetailDialog.value = false
    }
  } catch (error) {
    showErrorMessage('콘텐츠 삭제 중 오류가 발생했습니다.')
  }
}

// 메시지 관련 메서드
const showSuccessMessage = (message) => {
  successMessage.value = message
  showSuccess.value = true
}

const showErrorMessage = (message) => {
  errorMessage.value = message
  showError.value = true
}

// 라이프사이클
onMounted(async () => {
  loading.value = true
  try {
    await contentStore.loadContents()
  } catch (error) {
    showErrorMessage('콘텐츠를 불러오는 중 오류가 발생했습니다.')
  } finally {
    loading.value = false
  }
})

// 와처
watch(selectedItems, (newVal) => {
  selectAll.value = newVal.length === paginatedContents.value.length && newVal.length > 0
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
</style>