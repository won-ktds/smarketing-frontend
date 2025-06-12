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

    <!-- 콘텐츠 타입 필터 (상단 이동) -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card elevation="2" class="pa-4">
          <div class="d-flex align-center justify-space-between flex-wrap">
            <!-- 콘텐츠 타입 필터 -->
            <div class="d-flex align-center flex-wrap">
              <div class="text-subtitle-2 mr-4 mb-2">콘텐츠 타입:</div>
              <v-chip-group 
                v-model="selectedContentType" 
                mandatory
                @update:model-value="applyContentTypeFilter"
                class="mb-2"
              >
                <v-chip 
                  filter 
                  variant="outlined" 
                  color="primary"
                  value="all"
                >
                  <v-icon class="mr-1" size="16">mdi-view-grid</v-icon>
                  전체 ({{ getTotalCount() }})
                </v-chip>
                <v-chip 
                  filter 
                  variant="outlined" 
                  color="pink"
                  value="INSTAGRAM"
                >
                  <v-icon class="mr-1" size="16">mdi-instagram</v-icon>
                  Instagram ({{ getTypeCount('INSTAGRAM') }})
                </v-chip>
                <v-chip 
                  filter 
                  variant="outlined" 
                  color="green"
                  value="NAVER_BLOG"
                >
                  <v-icon class="mr-1" size="16">mdi-blogger</v-icon>
                  네이버 블로그 ({{ getTypeCount('NAVER_BLOG') }})
                </v-chip>
                <v-chip 
                  filter 
                  variant="outlined" 
                  color="purple"
                  value="POSTER"
                >
                  <v-icon class="mr-1" size="16">mdi-file-image</v-icon>
                  포스터 ({{ getTypeCount('POSTER') }})
                </v-chip>
              </v-chip-group>
            </div>

            <!-- 검색 -->
            <div class="d-flex align-center">
              <v-text-field
                v-model="searchQuery"
                placeholder="제목, 해시태그로 검색..."
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-magnify"
                hide-details
                style="min-width: 280px;"
                @input="applyFilters"
                clearable
              />
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- 메인 콘텐츠 영역 -->
    <v-row>
      <!-- 좌측 사이드바 필터 - Desktop 비율 수정 -->
      <v-col cols="12" lg="3" md="4">
        <v-card elevation="2" height="400" class="sticky-sidebar">
          <v-card-title class="text-h6 pa-4">
            <v-icon class="mr-2" color="primary">mdi-filter</v-icon>
            추가 필터
          </v-card-title>
          
          <v-card-text class="pa-4">
            <!-- 상태 필터 -->
            <div class="mb-4">
              <div class="text-subtitle-2 mb-2">상태</div>
              <v-checkbox
                v-model="filters.published"
                label="게시됨 (18)"
                color="success"
                @change="applyFilters"
                density="compact"
              />
              <v-checkbox
                v-model="filters.draft"
                label="임시저장 (6)"
                color="orange"
                @change="applyFilters"
                density="compact"
              />
            </div>

            <!-- 기간 필터 -->
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

            <!-- 정렬 필터 -->
            <div class="mb-4">
              <div class="text-subtitle-2 mb-2">정렬</div>
              <v-select
                v-model="sortBy"
                label="최신순"
                variant="outlined"
                density="compact"
                :items="sortOptions"
                @update:model-value="applySorting"
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

      <!-- 콘텐츠 목록 - Desktop 비율 수정 -->
      <v-col cols="12" lg="9" md="8">
        <v-card elevation="2">
          <!-- 상단 툴바 -->
          <v-card-title class="d-flex align-center justify-space-between pa-4">
            <div class="d-flex align-center">
              <v-checkbox
                v-model="selectAll"
                @change="toggleSelectAll"
                class="mr-2"
                density="compact"
              />
              <span class="text-h6">{{ filteredContents.length }}개 콘텐츠</span>
            </div>
            
            <div class="d-flex align-center">
              <!-- 선택된 항목 액션 -->
              <div v-if="selectedItems.length > 0" class="mr-3">
                <v-btn
                  color="error"
                  variant="outlined"
                  size="small"
                  @click="deleteSelectedItems"
                >
                  선택 삭제 ({{ selectedItems.length }})
                </v-btn>
              </div>
              
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
              
              <!-- 새 콘텐츠 생성 -->
              <v-btn
                color="primary"
                @click="$router.push('/content/create')"
              >
                <v-icon class="mr-1">mdi-plus</v-icon>
                새 콘텐츠
              </v-btn>
            </div>
          </v-card-title>

          <v-divider />

          <!-- 콘텐츠 목록 -->
          <v-card-text class="pa-0">
            <div v-if="loading" class="text-center pa-8">
              <v-progress-circular
                indeterminate
                color="primary"
                size="64"
              />
              <div class="mt-4 text-h6">콘텐츠를 불러오는 중...</div>
            </div>
            
            <div v-else-if="filteredContents.length === 0" class="text-center pa-8">
              <v-icon size="64" color="grey">mdi-file-document-outline</v-icon>
              <div class="mt-4 text-h6 grey--text">콘텐츠가 없습니다</div>
              <div class="text-body-1 grey--text">새로운 콘텐츠를 생성해보세요</div>
              <v-btn
                color="primary"
                class="mt-4"
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
                    <th width="150">생성일</th>
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
                            color="primary"
                            variant="outlined"
                            class="mr-1"
                          >
                            {{ tag }}
                          </v-chip>
                          <span v-if="content.hashtags.length > 3" class="text-caption grey--text">
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
                        <v-icon class="mr-1" size="14">{{ getPlatformIcon(content.platform) }}</v-icon>
                        {{ getPlatformText(content.platform) }}
                      </v-chip>
                    </td>
                    <td>
                      <div class="text-body-2">{{ formatDate(content.createdAt) }}</div>
                      <div class="text-caption grey--text">{{ formatTime(content.createdAt) }}</div>
                    </td>
                    <td @click.stop>
                      <div class="d-flex">
                        <v-btn
                          icon
                          size="small"
                          variant="text"
                          @click="showDetail(content)"
                          class="mr-1"
                        >
                          <v-icon size="16">mdi-eye</v-icon>
                        </v-btn>
                        <v-btn
                          icon
                          size="small"
                          variant="text"
                          @click="editContent(content)"
                          class="mr-1"
                        >
                          <v-icon size="16">mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn
                          icon
                          size="small"
                          variant="text"
                          color="error"
                          @click="confirmDelete(content)"
                        >
                          <v-icon size="16">mdi-delete</v-icon>
                        </v-btn>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>

            <!-- 그리드 뷰 -->
            <div v-else class="pa-4">
              <v-row>
                <v-col
                  v-for="content in paginatedContents"
                  :key="content.id"
                  cols="12"
                  sm="6"
                  md="4"
                  lg="3"
                >
                  <v-card
                    elevation="2"
                    @click="showDetail(content)"
                    class="position-relative"
                    hover
                  >
                    <v-checkbox
                      v-model="selectedItems"
                      :value="content.id"
                      class="position-absolute"
                      style="top: 8px; left: 8px; z-index: 1;"
                      @click.stop
                      density="compact"
                    />

                    <v-img
                      :src="content.imageUrl || '/images/default-content.png'"
                      height="150"
                      cover
                    >
                      <template #placeholder>
                        <div class="d-flex align-center justify-center fill-height">
                          <v-icon size="48" color="grey">{{ getPlatformIcon(content.platform) }}</v-icon>
                        </div>
                      </template>
                    </v-img>

                    <v-card-text class="pb-2">
                      <div class="d-flex align-center mb-2">
                        <v-chip
                          :color="getPlatformColor(content.platform)"
                          size="x-small"
                          class="mr-2"
                        >
                          {{ getPlatformText(content.platform) }}
                        </v-chip>
                        <v-chip
                          :color="getStatusColor(content.status)"
                          size="x-small"
                        >
                          {{ getStatusText(content.status) }}
                        </v-chip>
                      </div>
                      
                      <div class="text-subtitle-2 mb-1 text-truncate">{{ content.title }}</div>
                      <div class="text-caption grey--text">{{ formatDateTime(content.createdAt) }}</div>
                      <div class="text-caption grey--text">조회수: {{ formatNumber(content.views || 0) }}</div>
                    </v-card-text>

                    <v-card-actions class="pt-0">
                      <v-spacer />
                      <v-btn
                        icon
                        size="small"
                        @click.stop="confirmDelete(content)"
                      >
                        <v-icon size="16">mdi-delete-outline</v-icon>
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <!-- 페이지네이션 -->
            <div v-if="filteredContents.length > itemsPerPage" class="d-flex justify-center pa-4">
              <v-pagination
                v-model="currentPage"
                :length="totalPages"
                :total-visible="5"
                @update:model-value="scrollToTop"
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 상세 다이얼로그 -->
    <v-dialog v-model="showDetailDialog" max-width="800" scrollable>
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <span class="text-h5">콘텐츠 상세</span>
          <v-btn icon @click="showDetailDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-6" style="max-height: 70vh;">
          <!-- 수정 모드일 때 -->
          <div v-if="isEditMode">
            <v-form ref="editForm" v-model="editFormValid">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="editingContent.title"
                    label="제목"
                    variant="outlined"
                    :rules="[v => !!v || '제목을 입력해주세요']"
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="editingContent.content"
                    label="콘텐츠"
                    variant="outlined"
                    rows="8"
                    :rules="[v => !!v || '콘텐츠를 입력해주세요']"
                  />
                </v-col>
                <v-col cols="12">
                  <v-select
                    v-model="editingContent.status"
                    label="상태"
                    variant="outlined"
                    :items="[
                      { title: '게시됨', value: 'PUBLISHED' },
                      { title: '임시저장', value: 'DRAFT' }
                    ]"
                    :rules="[v => !!v || '상태를 선택해주세요']"
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

const sortOptions = [
  { title: '최신순', value: 'latest' },
  { title: '오래된순', value: 'oldest' },
  { title: '제목순', value: 'title' },
  { title: '조회수순', value: 'views' }
]

// 콘텐츠 타입 옵션 제거 (더 이상 필요 없음)
// const contentTypeOptions = [...]

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

  // 콘텐츠 타입 필터링 (수정된 로직)
  if (selectedContentType.value && selectedContentType.value !== 'all') {
    contents = contents.filter(content => 
      content.platform === selectedContentType.value
    )
  }

  // 상태 필터링
  if (filters.value.published || filters.value.draft) {
    const statusFilters = []
    if (filters.value.published) statusFilters.push('PUBLISHED')
    if (filters.value.draft) statusFilters.push('DRAFT')
    
    contents = contents.filter(content => 
      statusFilters.includes(content.status)
    )
  }

  // 기간 필터링
  if (filters.value.period !== '전체') {
    const now = new Date()
    let startDate = new Date()
    
    switch (filters.value.period) {
      case '오늘':
        startDate.setDate(now.getDate())
        break
      case '일주일':
        startDate.setDate(now.getDate() - 7)
        break
      case '한달':
        startDate.setMonth(now.getMonth() - 1)
        break
      case '3개월':
        startDate.setMonth(now.getMonth() - 3)
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

// 콘텐츠 개수 계산 메서드
const getTotalCount = () => {
  return contentStore.contents?.length || 0
}

const getTypeCount = (type) => {
  return contentStore.contents?.filter(content => content.platform === type).length || 0
}

// 필터 메서드 (수정된 로직)
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
  selectedContentType.value = 'all' // 전체 선택
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
  editingContent.value = { ...selectedContent.value }
  isEditMode.value = true
}

// 편집 관련 메서드
const editContent = (content) => {
  selectedContent.value = content
  editingContent.value = { ...content }
  isEditMode.value = true
  showDetailDialog.value = true
}

const cancelEdit = () => {
  editingContent.value = null
  isEditMode.value = false
}

const saveEdit = async () => {
  if (!editFormValid.value) return
  
  updating.value = true
  try {
    await contentStore.updateContent(editingContent.value.id, editingContent.value)
    selectedContent.value = { ...editingContent.value }
    showSuccessMessage('콘텐츠가 수정되었습니다.')
    isEditMode.value = false
  } catch (error) {
    showErrorMessage('콘텐츠 수정 중 오류가 발생했습니다.')
  } finally {
    updating.value = false
  }
}

const confirmDelete = async (content) => {
  if (confirm(`"${content.title}" 콘텐츠를 삭제하시겠습니까?`)) {
    try {
      await contentStore.deleteContent(content.id)
      showDetailDialog.value = false
      showSuccessMessage('콘텐츠가 삭제되었습니다.')
    } catch (error) {
      showErrorMessage('콘텐츠 삭제 중 오류가 발생했습니다.')
    }
  }
}

// 유틸리티 메서드
const getPlatformIcon = (platform) => {
  switch (platform) {
    case 'INSTAGRAM': return 'mdi-instagram'
    case 'NAVER_BLOG': return 'mdi-blogger'
    case 'POSTER': return 'mdi-file-image'
    default: return 'mdi-file-document'
  }
}

const getPlatformText = (platform) => {
  switch (platform) {
    case 'INSTAGRAM': return 'Instagram'
    case 'NAVER_BLOG': return '네이버 블로그'
    case 'POSTER': return '포스터'
    default: return '기타'
  }
}

const getPlatformColor = (platform) => {
  switch (platform) {
    case 'INSTAGRAM': return 'pink'
    case 'NAVER_BLOG': return 'green'
    case 'POSTER': return 'purple'
    default: return 'grey'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'PUBLISHED': return '게시됨'
    case 'DRAFT': return '임시저장'
    default: return '알 수 없음'
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case 'PUBLISHED': return 'success'
    case 'DRAFT': return 'orange'
    default: return 'grey'
  }
}

const formatDate = (dateTime) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleDateString('ko-KR', {
    month: '2-digit',
    day: '2-digit'
  })
}

const formatTime = (dateTime) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatNumber = (num) => {
  if (!num) return '0'
  return num.toLocaleString()
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 메시지 표시 메서드
const showSuccessMessage = (message) => {
  successMessage.value = message
  showSuccess.value = true
}

const showErrorMessage = (message) => {
  errorMessage.value = message
  showError.value = true
}

// selectedItems 변화 감지
watch(selectedItems, (newVal) => {
  selectAll.value = newVal.length === paginatedContents.value.length && paginatedContents.value.length > 0
}, { deep: true })

// 라이프사이클
onMounted(async () => {
  loading.value = true
  try {
    await contentStore.fetchContents()
  } catch (error) {
    showErrorMessage('콘텐츠를 불러오는 중 오류가 발생했습니다.')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* 테이블 스타일 - 개선된 Border */
.v-table {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.v-table thead th {
  background-color: #f8f9fa;
  font-weight: 600;
  border-bottom: 2px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
  padding: 12px 16px;
}

.v-table thead th:last-child {
  border-right: none;
}

.v-table tbody td {
  border-bottom: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
  padding: 12px 16px;
  vertical-align: top;
}

.v-table tbody td:last-child {
  border-right: none;
}

.v-table tbody tr:last-child td {
  border-bottom: none;
}

.v-table tbody tr:hover {
  background-color: #f5f5f5;
}

.cursor-pointer {
  cursor: pointer;
}

.v-chip-group {
  max-width: 100%;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.position-relative {
  position: relative;
}

.position-absolute {
  position: absolute;
}

.sticky-sidebar {
  position: sticky;
  top: 20px;
}

/* Desktop 레이아웃 최적화 */
@media (min-width: 1264px) {
  .v-col-lg-3 {
    flex: 0 0 20%;
    max-width: 20%;
  }
  
  .v-col-lg-9 {
    flex: 0 0 80%;
    max-width: 80%;
  }
}

@media (min-width: 960px) and (max-width: 1263px) {
  .v-col-md-4 {
    flex: 0 0 25%;
    max-width: 25%;
  }
  
  .v-col-md-8 {
    flex: 0 0 75%;
    max-width: 75%;
  }
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .d-flex.align-center.justify-space-between.flex-wrap > div {
    width: 100%;
    margin-bottom: 16px;
  }
  
  .d-flex.align-center.justify-space-between.flex-wrap > div:last-child {
    margin-bottom: 0;
  }
  
  .sticky-sidebar {
    position: static;
  }
}
</style>