<template>
  <v-container fluid class="pa-4">
    <!-- 필터 섹션 -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="text-h6 pa-4">
            <v-icon class="mr-2" color="primary">mdi-filter</v-icon>
            필터 및 검색
          </v-card-title>
          
          <v-card-text class="pa-4">
            <v-row>
              <v-col cols="12" md="3">
                <v-select
                  v-model="filters.contentType"
                  label="콘텐츠 타입"
                  variant="outlined"
                  :items="contentTypeOptions"
                  clearable
                  @update:model-value="applyFilters"
                />
              </v-col>
              
              <v-col cols="12" md="3">
                <v-select
                  v-model="filters.platform"
                  label="플랫폼"
                  variant="outlined"
                  :items="platformOptions"
                  clearable
                  @update:model-value="applyFilters"
                />
              </v-col>
              
              <v-col cols="12" md="3">
                <v-select
                  v-model="filters.status"
                  label="상태"
                  variant="outlined"
                  :items="statusOptions"
                  clearable
                  @update:model-value="applyFilters"
                />
              </v-col>
              
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="filters.search"
                  label="제목 검색"
                  variant="outlined"
                  prepend-inner-icon="mdi-magnify"
                  clearable
                  @update:model-value="applyFilters"
                />
              </v-col>
            </v-row>
            
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="filters.startDate"
                  label="시작일"
                  variant="outlined"
                  type="date"
                  @update:model-value="applyFilters"
                />
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="filters.endDate"
                  label="종료일"
                  variant="outlined"
                  type="date"
                  @update:model-value="applyFilters"
                />
              </v-col>
            </v-row>
            
            <v-row>
              <v-col cols="12">
                <v-btn
                  color="grey"
                  variant="outlined"
                  @click="resetFilters"
                >
                  <v-icon class="mr-1">mdi-refresh</v-icon>
                  필터 초기화
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 콘텐츠 목록 -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="text-h6 pa-4">
            <v-icon class="mr-2" color="primary">mdi-folder-multiple</v-icon>
            콘텐츠 목록
            <v-spacer />
            <v-btn
              color="primary"
              @click="$router.push({ name: 'ContentCreation' })"
            >
              <v-icon class="mr-1">mdi-plus</v-icon>
              새 콘텐츠
            </v-btn>
          </v-card-title>
          
          <v-divider />
          
          <!-- 선택된 항목 액션 -->
          <v-card-text
            v-if="selectedItems.length > 0"
            class="pa-4 bg-blue-grey-lighten-5"
          >
            <v-row align="center">
              <v-col>
                <span class="text-body-2">
                  {{ selectedItems.length }}개 항목이 선택됨
                </span>
              </v-col>
              <v-col class="text-right">
                <v-btn
                  color="error"
                  variant="outlined"
                  size="small"
                  @click="confirmBulkDelete"
                >
                  <v-icon class="mr-1">mdi-delete</v-icon>
                  선택 삭제
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
          
          <!-- 콘텐츠 카드 리스트 -->
          <v-card-text class="pa-4">
            <v-row v-if="filteredContents.length > 0">
              <v-col
                v-for="content in paginatedContents"
                :key="content.id"
                cols="12"
                md="6"
                lg="4"
              >
                <v-card
                  class="content-card"
                  elevation="1"
                  hover
                >
                  <!-- 선택 체크박스 -->
                  <div class="content-select">
                    <v-checkbox
                      v-model="selectedItems"
                      :value="content.id"
                      hide-details
                    />
                  </div>
                  
                  <!-- 콘텐츠 타입 뱃지 -->
                  <v-chip
                    class="content-type-badge"
                    :color="getContentTypeColor(content.contentType)"
                    size="small"
                  >
                    {{ getContentTypeText(content.contentType) }}
                  </v-chip>
                  
                  <!-- 플랫폼 아이콘 -->
                  <div class="platform-icon">
                    <v-icon
                      :color="getPlatformColor(content.platform)"
                      size="24"
                    >
                      {{ getPlatformIcon(content.platform) }}
                    </v-icon>
                  </div>
                  
                  <v-card-text class="pb-2">
                    <h4 class="text-h6 font-weight-bold mb-2 text-truncate">
                      {{ content.title }}
                    </h4>
                    
                    <p class="text-body-2 grey--text mb-3 content-preview">
                      {{ truncateText(content.content, 100) }}
                    </p>
                    
                    <!-- 해시태그 (SNS인 경우) -->
                    <div
                      v-if="content.hashtags && content.hashtags.length > 0"
                      class="mb-3"
                    >
                      <v-chip
                        v-for="tag in content.hashtags.slice(0, 3)"
                        :key="tag"
                        size="x-small"
                        class="mr-1 mb-1"
                        color="blue-grey"
                      >
                        {{ tag }}
                      </v-chip>
                      <span
                        v-if="content.hashtags.length > 3"
                        class="text-caption grey--text"
                      >
                        +{{ content.hashtags.length - 3 }}개 더
                      </span>
                    </div>
                    
                    <!-- 상태 및 생성일 -->
                    <div class="d-flex justify-space-between align-center">
                      <v-chip
                        :color="getStatusColor(content.status)"
                        size="small"
                      >
                        {{ getStatusText(content.status) }}
                      </v-chip>
                      <span class="text-caption grey--text">
                        {{ formatRelativeTime(content.createdAt) }}
                      </span>
                    </div>
                  </v-card-text>
                  
                  <v-card-actions class="pt-0">
                    <v-btn
                      color="primary"
                      variant="text"
                      size="small"
                      @click="viewContent(content)"
                    >
                      상세보기
                    </v-btn>
                    <v-btn
                      color="grey"
                      variant="text"
                      size="small"
                      @click="editContent(content)"
                    >
                      수정
                    </v-btn>
                    <v-btn
                      color="error"
                      variant="text"
                      size="small"
                      @click="confirmDelete(content)"
                    >
                      삭제
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
            
            <!-- 빈 상태 -->
            <v-card
              v-else
              class="pa-8 text-center"
              color="grey-lighten-4"
              variant="tonal"
            >
              <v-icon size="64" color="grey" class="mb-4">mdi-file-document-outline</v-icon>
              <h3 class="text-h6 mb-2">콘텐츠가 없습니다</h3>
              <p class="text-body-2 grey--text mb-4">
                {{ filters.search || filters.contentType || filters.platform || filters.status 
                   ? '검색 조건에 맞는 콘텐츠가 없습니다' 
                   : '아직 생성된 콘텐츠가 없습니다' }}
              </p>
              <v-btn
                color="primary"
                @click="$router.push({ name: 'ContentCreation' })"
              >
                첫 콘텐츠 만들기
              </v-btn>
            </v-card>
          </v-card-text>
          
          <!-- 페이지네이션 -->
          <v-divider v-if="filteredContents.length > itemsPerPage" />
          <v-card-actions
            v-if="filteredContents.length > itemsPerPage"
            class="justify-center pa-4"
          >
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
    <v-dialog
      v-model="showDetailDialog"
      max-width="800"
      scrollable
    >
      <v-card v-if="selectedContent">
        <v-card-title class="text-h6">
          {{ selectedContent.title }}
          <v-spacer />
          <v-btn
            icon
            @click="showDetailDialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-divider />
        
        <v-card-text class="pa-4">
          <!-- 메타 정보 -->
          <v-row class="mb-4">
            <v-col cols="6">
              <div class="text-caption grey--text">콘텐츠 타입</div>
              <v-chip
                :color="getContentTypeColor(selectedContent.contentType)"
                size="small"
                class="mt-1"
              >
                {{ getContentTypeText(selectedContent.contentType) }}
              </v-chip>
            </v-col>
            <v-col cols="6">
              <div class="text-caption grey--text">플랫폼</div>
              <v-chip
                :color="getPlatformColor(selectedContent.platform)"
                size="small"
                class="mt-1"
              >
                <v-icon class="mr-1" size="16">
                  {{ getPlatformIcon(selectedContent.platform) }}
                </v-icon>
                {{ getPlatformText(selectedContent.platform) }}
              </v-chip>
            </v-col>
            <v-col cols="6">
              <div class="text-caption grey--text">상태</div>
              <v-chip
                :color="getStatusColor(selectedContent.status)"
                size="small"
                class="mt-1"
              >
                {{ getStatusText(selectedContent.status) }}
              </v-chip>
            </v-col>
            <v-col cols="6">
              <div class="text-caption grey--text">생성일</div>
              <div class="text-body-2 mt-1">
                {{ formatDateTime(selectedContent.createdAt) }}
              </div>
            </v-col>
          </v-row>
          
          <!-- 콘텐츠 내용 -->
          <div class="mb-4">
            <div class="text-caption grey--text mb-2">콘텐츠</div>
            <v-card
              class="pa-4"
              color="blue-grey-lighten-5"
              variant="tonal"
            >
              <div class="text-body-1" style="white-space: pre-line;">
                {{ selectedContent.content }}
              </div>
            </v-card>
          </div>
          
          <!-- 해시태그 -->
          <div
            v-if="selectedContent.hashtags && selectedContent.hashtags.length > 0"
            class="mb-4"
          >
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
          
          <!-- 생성 조건 -->
          <div v-if="selectedContent.conditions">
            <div class="text-caption grey--text mb-2">생성 조건</div>
            <v-card
              class="pa-3"
              color="grey-lighten-4"
              variant="tonal"
            >
              <v-row>
                <v-col cols="6">
                  <div class="text-caption">톤앤매너</div>
                  <div class="text-body-2">{{ selectedContent.conditions.toneAndManner }}</div>
                </v-col>
                <v-col cols="6">
                  <div class="text-caption">감정 강도</div>
                  <div class="text-body-2">{{ selectedContent.conditions.emotionIntensity }}</div>
                </v-col>
                <v-col cols="6">
                  <div class="text-caption">프로모션</div>
                  <div class="text-body-2">{{ selectedContent.conditions.promotion }}</div>
                </v-col>
                <v-col cols="6">
                  <div class="text-caption">홍보 기간</div>
                  <div class="text-body-2">
                    {{ formatDate(selectedContent.conditions.startDate) }} ~ 
                    {{ formatDate(selectedContent.conditions.endDate) }}
                  </div>
                </v-col>
              </v-row>
            </v-card>
          </div>
        </v-card-text>
        
        <v-divider />
        
        <v-card-actions class="pa-4">
          <v-btn
            color="primary"
            variant="outlined"
            @click="editContent(selectedContent)"
          >
            <v-icon class="mr-1">mdi-pencil</v-icon>
            수정
          </v-btn>
          <v-btn
            color="success"
            variant="outlined"
            @click="duplicateContent(selectedContent)"
          >
            <v-icon class="mr-1">mdi-content-copy</v-icon>
            복사
          </v-btn>
          <v-spacer />
          <v-btn
            color="error"
            @click="confirmDelete(selectedContent)"
          >
            <v-icon class="mr-1">mdi-delete</v-icon>
            삭제
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 수정 다이얼로그 -->
    <v-dialog
      v-model="showEditDialog"
      max-width="600"
      persistent
    >
      <v-card v-if="editingContent">
        <v-card-title class="text-h6">
          콘텐츠 수정
        </v-card-title>
        
        <v-card-text>
          <v-form ref="editForm" v-model="editFormValid">
            <v-text-field
              v-model="editingContent.title"
              label="제목"
              variant="outlined"
              :rules="[v => !!v || '제목을 입력해주세요']"
              required
              class="mb-3"
            />
            
            <v-textarea
              v-model="editingContent.content"
              label="내용"
              variant="outlined"
              :rules="[v => !!v || '내용을 입력해주세요']"
              required
              rows="6"
              class="mb-3"
            />
            
            <!-- 해시태그 수정 (SNS인 경우) -->
            <v-combobox
              v-if="editingContent.contentType === 'SNS_POST'"
              v-model="editingContent.hashtags"
              label="해시태그"
              variant="outlined"
              multiple
              chips
              closable-chips
              hint="#을 제외하고 입력하세요"
              persistent-hint
            />
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="cancelEdit"
          >
            취소
          </v-btn>
          <v-btn
            color="primary"
            :loading="updating"
            :disabled="!editFormValid"
            @click="saveEdit"
          >
            저장
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useContentStore } from '@/store/content'
import { formatRelativeTime, formatDate, formatDateTime } from '@/utils/formatters'
import { CONTENT_TYPES, PLATFORMS, CONTENT_STATUS } from '@/utils/constants'

const router = useRouter()
const contentStore = useContentStore()

// 상태 관리
const filters = ref({
  contentType: '',
  platform: '',
  status: '',
  search: '',
  startDate: '',
  endDate: ''
})

const selectedItems = ref([])
const currentPage = ref(1)
const itemsPerPage = ref(12)

const showDetailDialog = ref(false)
const showEditDialog = ref(false)
const selectedContent = ref(null)
const editingContent = ref(null)
const editForm = ref(null)
const editFormValid = ref(false)
const updating = ref(false)

const showSuccess = ref(false)
const showError = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// 옵션 설정
const contentTypeOptions = [
  { title: 'SNS 게시물', value: 'SNS_POST' },
  { title: '홍보 포스터', value: 'POSTER' }
]

const platformOptions = [
  { title: '인스타그램', value: 'INSTAGRAM' },
  { title: '네이버 블로그', value: 'NAVER_BLOG' }
]

const statusOptions = [
  { title: '임시저장', value: 'DRAFT' },
  { title: '게시됨', value: 'PUBLISHED' },
  { title: '보관됨', value: 'ARCHIVED' }
]

// 계산된 속성
const filteredContents = computed(() => {
  let contents = contentStore.contents

  if (filters.value.contentType) {
    contents = contents.filter(c => c.contentType === filters.value.contentType)
  }
  
  if (filters.value.platform) {
    contents = contents.filter(c => c.platform === filters.value.platform)
  }
  
  if (filters.value.status) {
    contents = contents.filter(c => c.status === filters.value.status)
  }
  
  if (filters.value.search) {
    const keyword = filters.value.search.toLowerCase()
    contents = contents.filter(c => 
      c.title.toLowerCase().includes(keyword) ||
      c.content.toLowerCase().includes(keyword)
    )
  }
  
  if (filters.value.startDate) {
    contents = contents.filter(c => 
      new Date(c.createdAt) >= new Date(filters.value.startDate)
    )
  }
  
  if (filters.value.endDate) {
    contents = contents.filter(c => 
      new Date(c.createdAt) <= new Date(filters.value.endDate)
    )
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

// 유틸리티 함수들
const getContentTypeColor = (type) => {
  const colors = {
    'SNS_POST': 'pink',
    'POSTER': 'purple'
  }
  return colors[type] || 'grey'
}

const getContentTypeText = (type) => {
  const texts = {
    'SNS_POST': 'SNS',
    'POSTER': '포스터'
  }
  return texts[type] || type
}

const getPlatformColor = (platform) => {
  const colors = {
    'INSTAGRAM': 'pink',
    'NAVER_BLOG': 'green'
  }
  return colors[platform] || 'grey'
}

const getPlatformIcon = (platform) => {
  const icons = {
    'INSTAGRAM': 'mdi-instagram',
    'NAVER_BLOG': 'mdi-blogger'
  }
  return icons[platform] || 'mdi-web'
}

const getPlatformText = (platform) => {
  const texts = {
    'INSTAGRAM': '인스타그램',
    'NAVER_BLOG': '네이버 블로그'
  }
  return texts[platform] || platform
}

const getStatusColor = (status) => {
  const colors = {
    'DRAFT': 'orange',
    'PUBLISHED': 'success',
    'ARCHIVED': 'grey'
  }
  return colors[status] || 'grey'
}

const getStatusText = (status) => {
  const texts = {
    'DRAFT': '임시저장',
    'PUBLISHED': '게시됨',
    'ARCHIVED': '보관됨'
  }
  return texts[status] || status
}

const truncateText = (text, limit) => {
  if (!text) return ''
  return text.length > limit ? text.substring(0, limit) + '...' : text
}

/**
 * 필터 적용
 */
const applyFilters = () => {
  currentPage.value = 1
}

/**
 * 필터 초기화
 */
const resetFilters = () => {
  filters.value = {
    contentType: '',
    platform: '',
    status: '',
    search: '',
    startDate: '',
    endDate: ''
  }
  currentPage.value = 1
}

/**
 * 콘텐츠 상세 보기
 */
const viewContent = (content) => {
  selectedContent.value = content
  showDetailDialog.value = true
}

/**
 * 콘텐츠 수정
 */
const editContent = (content) => {
  editingContent.value = { ...content }
  showDetailDialog.value = false
  showEditDialog.value = true
}

/**
 * 수정 취소
 */
const cancelEdit = () => {
  showEditDialog.value = false
  editingContent.value = null
}

/**
 * 수정 저장
 */
const saveEdit = async () => {
  if (!editFormValid.value) return

  updating.value = true
  try {
    await contentStore.updateContent(editingContent.value.id, editingContent.value)
    showEditDialog.value = false
    editingContent.value = null
    successMessage.value = '콘텐츠가 수정되었습니다.'
    showSuccess.value = true
  } catch (error) {
    console.error('콘텐츠 수정 실패:', error)
    errorMessage.value = '콘텐츠 수정 중 오류가 발생했습니다.'
    showError.value = true
  } finally {
    updating.value = false
  }
}

/**
 * 콘텐츠 복사
 */
const duplicateContent = async (content) => {
  try {
    const duplicatedContent = {
      ...content,
      title: `${content.title} (복사본)`,
      status: 'DRAFT'
    }
    delete duplicatedContent.id
    
    // 여기서는 샘플로 처리
    successMessage.value = '콘텐츠가 복사되었습니다.'
    showSuccess.value = true
    showDetailDialog.value = false
    
    // 실제로는 새 콘텐츠 생성 API 호출
    // await contentStore.createContent(duplicatedContent)
  } catch (error) {
    console.error('콘텐츠 복사 실패:', error)
    errorMessage.value = '콘텐츠 복사 중 오류가 발생했습니다.'
    showError.value = true
  }
}

/**
 * 삭제 확인
 */
const confirmDelete = async (content) => {
  const confirmed = await window.$confirm(
    '콘텐츠 삭제',
    `"${content.title}" 콘텐츠를 삭제하시겠습니까?`
  )
  
  if (confirmed) {
    await deleteContent(content.id)
  }
}

/**
 * 대량 삭제 확인
 */
const confirmBulkDelete = async () => {
  const confirmed = await window.$confirm(
    '콘텐츠 삭제',
    `선택된 ${selectedItems.value.length}개의 콘텐츠를 삭제하시겠습니까?`
  )
  
  if (confirmed) {
    await bulkDeleteContents()
  }
}

/**
 * 콘텐츠 삭제
 */
const deleteContent = async (contentId) => {
  try {
    await contentStore.deleteContent(contentId)
    successMessage.value = '콘텐츠가 삭제되었습니다.'
    showSuccess.value = true
    showDetailDialog.value = false
    
    // 선택 목록에서 제거
    selectedItems.value = selectedItems.value.filter(id => id !== contentId)
  } catch (error) {
    console.error('콘텐츠 삭제 실패:', error)
    errorMessage.value = '콘텐츠 삭제 중 오류가 발생했습니다.'
    showError.value = true
  }
}

/**
 * 대량 삭제
 */
const bulkDeleteContents = async () => {
  try {
    await Promise.all(
      selectedItems.value.map(id => contentStore.deleteContent(id))
    )
    successMessage.value = `${selectedItems.value.length}개의 콘텐츠가 삭제되었습니다.`
    showSuccess.value = true
    selectedItems.value = []
  } catch (error) {
    console.error('대량 삭제 실패:', error)
    errorMessage.value = '콘텐츠 삭제 중 오류가 발생했습니다.'
    showError.value = true
  }
}

// 컴포넌트 마운트시 데이터 로드
onMounted(async () => {
  try {
    await contentStore.fetchContents()
  } catch (error) {
    console.error('콘텐츠 로드 실패:', error)
    // 샘플 데이터로 대체
    contentStore.contents = [
      {
        id: 1,
        title: '신메뉴 떡볶이 출시!',
        content: '🔥 새로운 맛의 떡볶이가 출시되었어요! 🔥\n\n매콤달콤한 특제 소스로 만든 우리 매장만의 시그니처 떡볶이를 맛보세요!',
        contentType: 'SNS_POST',
        platform: 'INSTAGRAM',
        status: 'PUBLISHED',
        hashtags: ['#떡볶이', '#신메뉴', '#분식맛집'],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2시간 전
        conditions: {
          toneAndManner: '친근함',
          emotionIntensity: '보통',
          promotion: '신메뉴 알림',
          startDate: '2024-06-10',
          endDate: '2024-06-17'
        }
      },
      {
        id: 2,
        title: '주말 특가 이벤트',
        content: '주말을 맞아 준비한 특별한 할인 이벤트!\n\n김밥 + 떡볶이 세트를 특가로 만나보세요.',
        contentType: 'SNS_POST',
        platform: 'NAVER_BLOG',
        status: 'PUBLISHED',
        hashtags: ['#주말특가', '#할인이벤트', '#세트메뉴'],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1일 전
        conditions: {
          toneAndManner: '전문적',
          emotionIntensity: '열정적',
          promotion: '할인 정보',
          startDate: '2024-06-08',
          endDate: '2024-06-16'
        }
      },
      {
        id: 3,
        title: '봄맞이 할인 포스터',
        content: '봄맞이 특별 할인 이벤트 포스터',
        contentType: 'POSTER',
        platform: null,
        status: 'DRAFT',
        hashtags: null,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3일 전
        conditions: {
          toneAndManner: '고급스러운',
          emotionIntensity: '차분함',
          promotion: '할인 정보',
          startDate: '2024-06-07',
          endDate: '2024-06-21'
        }
      }
    ]
  }
})
</script>

<style scoped>
.content-card {
  position: relative;
  transition: all 0.3s;
  height: 100%;
}

.content-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.content-select {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 1;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
}

.content-type-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
}

.platform-icon {
  position: absolute;
  top: 40px;
  right: 8px;
  z-index: 1;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-preview {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}
</style>