<template>
  <v-container fluid class="pa-4">
    <!-- 🎨 소이님 UI 개선: 필터 → 검색+버튼 순서로 변경 -->
    <v-card class="mb-6" elevation="2">
      <v-card-text class="pa-4">
        <!-- 1단계: 필터 탭들 (전체 너비로 배치) -->
        <v-row class="mb-4">
          <v-col cols="12">
            <div class="d-flex align-center flex-wrap ga-2">
              <span class="text-subtitle-2 font-weight-medium mr-3 text-grey-darken-1">콘텐츠 타입:</span>
              <v-chip
                v-for="type in contentTypeOptions"
                :key="type.value"
                :color="selectedContentType === type.value ? type.color : 'default'"
                :variant="selectedContentType === type.value ? 'flat' : 'outlined'"
                size="small"
                class="mr-2 mb-1 chip-hover"
                @click="selectContentType(type.value)"
              >
                <span class="mr-1">{{ type.emoji }}</span>
                {{ type.title.replace(type.emoji + ' ', '') }}
                <span v-if="type.value !== 'all'" class="ml-1">({{ getTypeCount(type.value) }})</span>
                <span v-else class="ml-1">({{ getTotalCount() }})</span>
              </v-chip>
            </div>
          </v-col>
        </v-row>

        <!-- 2단계: 검색박스 + 새 콘텐츠 생성 버튼 (같은 줄에 배치) -->
        <v-row align="center" class="ga-3">
          <!-- 검색박스 (왼쪽, 넓게) -->
          <v-col cols="12" md="9">
            <v-text-field
              v-model="searchQuery"
              label="제목, 내용, 해시태그로 검색..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
              class="search-field"
              @update:model-value="applyFilters"
            />
          </v-col>
          
          <!-- 새 콘텐츠 생성 버튼 (오른쪽) -->
          <v-col cols="12" md="3" class="d-flex justify-end">
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="$router.push('/content/create')"
              size="large"
              class="text-none font-weight-medium create-btn"
              elevation="2"
            >
              새 콘텐츠 생성
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 선택된 항목 일괄 작업 -->
    <div v-if="selectedItems.length > 0" class="mb-4">
      <v-alert color="info" variant="tonal" class="selected-alert">
        <div class="d-flex justify-space-between align-center">
          <span class="font-weight-medium">{{ selectedItems.length }}개 항목이 선택됨</span>
          <v-btn
            color="error"
            variant="text"
            prepend-icon="mdi-delete"
            @click="deleteSelectedItems"
            class="font-weight-medium"
          >
            선택 항목 삭제
          </v-btn>
        </div>
      </v-alert>
    </div>

    <!-- 콘텐츠 목록 -->
    <v-card elevation="2">
      <v-card-text class="pa-0">
        <div v-if="loading" class="text-center pa-8">
          <v-progress-circular indeterminate color="primary" size="48" width="4" />
          <div class="mt-4 text-body-1 text-grey-darken-1">콘텐츠를 불러오는 중...</div>
        </div>

        <div v-else-if="paginatedContents.length === 0" class="text-center pa-12 empty-state">
          <v-icon size="80" color="grey-lighten-2" class="mb-4">mdi-file-document-outline</v-icon>
          <div class="text-h6 mb-3 text-grey-darken-1">표시할 콘텐츠가 없습니다</div>
          <div class="text-body-2 text-grey mb-6">새로운 콘텐츠를 생성해보세요</div>
          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-plus"
            @click="$router.push('/content/create')"
            class="font-weight-medium"
            elevation="2"
          >
            콘텐츠 생성하기
          </v-btn>
        </div>

        <!-- 콘텐츠 목록 테이블 -->
        <div v-else>
          <v-table hover class="content-table">
            <thead>
              <tr class="table-header">
                <th width="50" class="pa-4">
                  <v-checkbox
                    v-model="selectAll"
                    @change="toggleSelectAll"
                    density="compact"
                    color="primary"
                  />
                </th>
                <th width="450" class="pa-4 font-weight-bold text-grey-darken-2">제목</th>
                <th width="150" class="pa-4 font-weight-bold text-grey-darken-2">플랫폼</th>
                <th width="200" class="pa-4 sortable-header cursor-pointer" @click="sortByPromotionDate">
                  <div class="d-flex align-center">
                    <span class="font-weight-bold text-grey-darken-2">프로모션 기간</span>
                    <v-icon 
                      :color="promotionSortOrder === 'none' ? 'grey-lighten-1' : 'primary'"
                      size="18" 
                      class="ml-2"
                    >
                      {{
                        promotionSortOrder === 'asc' ? 'mdi-arrow-up' :
                        promotionSortOrder === 'desc' ? 'mdi-arrow-down' :
                        'mdi-unfold-more-horizontal'
                      }}
                    </v-icon>
                  </div>
                </th>
                <th width="120" class="pa-4 font-weight-bold text-grey-darken-2">액션</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="content in paginatedContents" 
                :key="content.id" 
                class="content-row cursor-pointer" 
                @click="showDetail(content)"
              >
                <td class="pa-4" @click.stop>
                  <v-checkbox
                    v-model="selectedItems"
                    :value="content.id"
                    density="compact"
                    color="primary"
                  />
                </td>
                <td class="pa-4">
                  <div class="d-flex flex-column">
                    <div class="d-flex align-center mb-2">
                      <span class="font-weight-medium text-subtitle-2 mr-3">{{ content.title }}</span>
                      <v-chip
                        :color="getStatusColor(content.status)"
                        size="x-small"
                        variant="tonal"
                        class="font-weight-medium"
                      >
                        {{ getStatusText(content.status) }}
                      </v-chip>
                    </div>
                    <div class="text-caption text-truncate text-grey-darken-1" style="max-width: 400px;">
                      {{ content.content ? content.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : 'string...' }}
                    </div>
                  </div>
                </td>
                <td class="pa-4">
                  <v-chip
                    :color="getPlatformColor(content.platform)"
                    size="small"
                    variant="tonal"
                    class="font-weight-medium"
                  >
                    {{ getPlatformText(content.platform) }}
                  </v-chip>
                </td>
                <td class="pa-4">
                  <div class="text-body-2 text-grey-darken-1">
                    {{ formatDateRange(content.startDate, content.endDate) }}
                  </div>
                </td>
                <td class="pa-4" @click.stop>
                  <div class="d-flex align-center ga-1">
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      color="primary"
                      @click="showDetailWithEdit(content)"
                      class="action-btn"
                    />
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click="confirmDelete(content)"
                      class="action-btn"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </v-table>

          <!-- 페이지네이션 -->
          <div v-if="totalPages > 1" class="pa-4 d-flex justify-center">
            <v-pagination
              v-model="currentPage"
              :length="totalPages"
              :total-visible="7"
              rounded="circle"
              color="primary"
              class="pagination-custom"
            />
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- 콘텐츠 상세/수정 다이얼로그 -->
    <v-dialog v-model="showDetailDialog" max-width="800" persistent>
      <v-card class="detail-dialog">
        <v-card-title class="pa-6 pb-4">
          <div class="d-flex align-center">
            <v-icon class="mr-3" color="primary">
              {{ isEditMode ? 'mdi-pencil' : 'mdi-eye' }}
            </v-icon>
            <span class="text-h6 font-weight-bold">
              {{ isEditMode ? '콘텐츠 수정' : '콘텐츠 상세' }}
            </span>
          </div>
        </v-card-title>
        
        <v-divider />
        
        <v-card-text class="pa-6" style="max-height: 70vh; overflow-y: auto;">
          <v-form ref="editForm" v-model="editFormValid" v-if="selectedContent">
            <!-- 제목 -->
            <div class="mb-6">
              <label class="text-subtitle-2 font-weight-bold mb-3 d-block text-grey-darken-2">제목</label>
              <v-text-field
                v-if="isEditMode"
                v-model="editingContent.title"
                variant="outlined"
                density="comfortable"
                :rules="titleRules"
                hide-details="auto"
                class="edit-field"
              />
              <div v-else class="text-body-1 pa-3 bg-grey-lighten-5 rounded">
                {{ selectedContent.title }}
              </div>
            </div>

            <!-- 콘텐츠 내용 -->
            <div class="mb-6">
              <label class="text-subtitle-2 font-weight-bold mb-3 d-block text-grey-darken-2">내용</label>
              <div v-if="isEditMode">
                <v-textarea
                  v-model="editingContent.content"
                  variant="outlined"
                  rows="8"
                  auto-grow
                  hide-details
                  class="edit-field"
                />
              </div>
              <div v-else class="content-display pa-4 bg-grey-lighten-5 rounded">
                <div v-if="selectedContent.content && selectedContent.content.includes('<')" 
                     v-html="selectedContent.content"
                     class="content-html">
                </div>
                <div v-else class="text-body-1" style="white-space: pre-wrap;">
                  {{ selectedContent.content }}
                </div>
              </div>
            </div>

            <!-- 해시태그 -->
            <div class="mb-6">
              <label class="text-subtitle-2 font-weight-bold mb-3 d-block text-grey-darken-2">해시태그</label>
              <div class="d-flex flex-wrap ga-2">
                <v-chip
                  v-for="tag in selectedContent.hashtags"
                  :key="tag"
                  size="small"
                  color="primary"
                  variant="tonal"
                  class="font-weight-medium"
                >
                  #{{ tag }}
                </v-chip>
              </div>
              <div v-if="isEditMode" class="text-caption text-grey mt-2">
                해시태그는 수정할 수 없습니다. 새로 생성해주세요.
              </div>
            </div>

            <!-- 플랫폼 및 상태 정보 -->
            <v-row>
              <v-col cols="6">
                <label class="text-subtitle-2 font-weight-bold mb-3 d-block text-grey-darken-2">플랫폼</label>
                <v-chip
                  :color="getPlatformColor(selectedContent.platform)"
                  variant="tonal"
                  class="font-weight-medium"
                >
                  {{ getPlatformText(selectedContent.platform) }}
                </v-chip>
              </v-col>
              <v-col cols="6">
                <label class="text-subtitle-2 font-weight-bold mb-3 d-block text-grey-darken-2">상태</label>
                <v-chip
                  :color="getStatusColor(selectedContent.status)"
                  variant="tonal"
                  class="font-weight-medium"
                >
                  {{ getStatusText(selectedContent.status) }}
                </v-chip>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-divider />
        
        <!-- 다이얼로그 액션 버튼 -->
        <v-card-actions class="pa-6 pt-4">
          <v-spacer />
          <div v-if="isEditMode" class="d-flex ga-3">
            <v-btn 
              variant="outlined"
              color="grey-darken-1"
              @click="cancelEdit"
              class="px-6 font-weight-medium"
            >
              취소
            </v-btn>
            <v-btn 
              color="primary" 
              @click="saveEdit"
              :loading="updating"
              :disabled="!editFormValid"
              class="px-6 font-weight-medium"
              elevation="2"
            >
              저장
            </v-btn>
          </div>
          <div v-else class="d-flex ga-3">
            <v-btn 
              variant="outlined"
              color="grey-darken-1"
              @click="closeDialog"
              class="px-6 font-weight-medium"
            >
              닫기
            </v-btn>
            <v-btn 
              variant="outlined"
              color="primary"
              prepend-icon="mdi-pencil"
              @click="showEditMode"
              class="px-6 font-weight-medium"
            >
              수정
            </v-btn>
            <v-btn 
              variant="outlined"
              color="error"
              prepend-icon="mdi-delete"
              @click="confirmDelete(selectedContent)"
              class="px-6 font-weight-medium"
            >
              삭제
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 성공/오류 스낵바 -->
    <v-snackbar v-model="showSuccess" color="success" timeout="4000" location="bottom">
      <v-icon class="mr-2">mdi-check-circle</v-icon>
      {{ successMessage }}
    </v-snackbar>
    
    <v-snackbar v-model="showError" color="error" timeout="4000" location="bottom">
      <v-icon class="mr-2">mdi-alert-circle</v-icon>
      {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>


<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useStoreStore } from '@/store/index'

const storeStore = useStoreStore()

// 반응형 상태
const currentTab = ref('basic')
const showCreateDialog = ref(false)
const editMode = ref(false)
const formValid = ref(false)
const saving = ref(false)
const storeFormRef = ref(null)

// 메뉴 관리 관련 상태
const menus = ref([])
const menuSearch = ref('')
const menuCategoryFilter = ref('전체')
const menuCategories = ref(['커피', '음료', '디저트', '베이커리', '샐러드', '샌드위치'])
const showMenuDialog = ref(false)
const menuEditMode = ref(false)
const menuFormRef = ref(null)
const menuFormValid = ref(false)

// 이미지 관련 상태
const selectedImageFile = ref(null)
const previewImageUrl = ref('')
const forceShowFileInput = ref(false) // ✅ 추가: 파일 입력 강제 표시용

// 메뉴 폼 데이터
const menuFormData = ref({
  menuName: '',
  category: '',
  price: 0,
  description: '',
  available: true,
  recommended: false,
  imageUrl: ''
})

// 메뉴 상세 관련 상태
const showMenuDetailDialog = ref(false)
const selectedMenu = ref(null)

// 스낵바 상태
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// 폼 데이터
const formData = ref({
  storeName: '',
  businessType: '',
  address: '',
  phoneNumber: '',
  seatCount: 0,
  instagramUrl: '',
  blogUrl: '',
  openTime: '09:00',
  closeTime: '21:00',
  holidays: [],
  description: ''
})

// 선택 옵션들
const businessTypes = [
  '카페', '레스토랑', '베이커리', '디저트', '주점', '패스트푸드', '기타'
]

const weekDays = [
  { title: '월요일', value: 'monday' },
  { title: '화요일', value: 'tuesday' },
  { title: '수요일', value: 'wednesday' },
  { title: '목요일', value: 'thursday' },
  { title: '금요일', value: 'friday' },
  { title: '토요일', value: 'saturday' },
  { title: '일요일', value: 'sunday' }
]

// 컴퓨티드 속성
const storeInfo = computed(() => storeStore.storeInfo || {})

// 메뉴 관련 컴퓨티드 속성
const filteredMenus = computed(() => {
  let filtered = menus.value

  // 검색 필터
  if (menuSearch.value) {
    const search = menuSearch.value.toLowerCase()
    filtered = filtered.filter(menu => 
      (menu.menuName || '').toLowerCase().includes(search) ||
      (menu.description || '').toLowerCase().includes(search)
    )
  }

  // 카테고리 필터
  if (menuCategoryFilter.value && menuCategoryFilter.value !== '전체') {
    filtered = filtered.filter(menu => menu.category === menuCategoryFilter.value)
  }

  return filtered
})

// 이미지 미리보기 표시 조건 수정
const shouldShowImagePreview = computed(() => {
  // ✅ 강제로 파일 입력을 보여줘야 하는 경우
  if (forceShowFileInput.value) {
    return null
  }
  
  // 1순위: 새로 선택한 이미지 미리보기
  if (previewImageUrl.value) {
    return previewImageUrl.value
  }
  
  // 2순위: 수정 모드일 때 기존 이미지
  if (menuEditMode.value && menuFormData.value.imageUrl) {
    return menuFormData.value.imageUrl
  }
  
  return null
})
// ===== 유틸리티 함수들 =====

/**
 * 메뉴 이미지 URL 처리 함수
 * Azure Blob Storage URL과 플레이스홀더 구분
 */
const getMenuImageUrl = (menu) => {
  if (!menu) return '/images/menu-placeholder.png'
  
  console.log('=== 메뉴 이미지 URL 처리 ===')
  console.log('메뉴 데이터:', menu)
  console.log('이미지 필드들:', {
    image: menu.image,
    imageUrl: menu.imageUrl,
    menuImageUrl: menu.menuImageUrl
  })
  
  // 1순위: Azure Blob Storage URL (https로 시작하는 실제 URL)
  const imageUrl = menu.image || menu.imageUrl || menu.menuImageUrl
  
  if (imageUrl && imageUrl.startsWith('https://')) {
    console.log('✅ Azure Blob Storage URL 사용:', imageUrl)
    return imageUrl
  }
  
  // 2순위: 상대 경로 이미지가 있다면 절대 경로로 변환
  if (imageUrl && imageUrl.startsWith('/images/')) {
    console.log('⚠️ 상대 경로 이미지, 절대 경로로 변환:', imageUrl)
    return imageUrl
  }
  
  // 3순위: 기본 플레이스홀더
  console.log('❌ 이미지 URL 없음, 플레이스홀더 사용')
  return '/images/menu-placeholder.png'
}

/**
 * 이미지 로딩 오류 처리
 */
const handleImageError = (event, menu) => {
  console.log('이미지 로딩 실패:', menu?.menuName || 'Unknown', event)
  // 이미지 로딩 실패 시 플레이스홀더로 변경
  if (event.target) {
    event.target.src = '/images/menu-placeholder.png'
  }
}

/**
 * 플레이스홀더 이미지 존재 여부 확인
 */
const checkPlaceholderImage = async () => {
  try {
    const response = await fetch('/images/menu-placeholder.png')
    if (!response.ok) {
      console.warn('⚠️ 플레이스홀더 이미지가 없습니다:', '/images/menu-placeholder.png')
      showSnackbar('기본 이미지 파일이 없습니다. public/images 폴더를 확인해주세요', 'warning')
    } else {
      console.log('✅ 플레이스홀더 이미지 확인됨')
    }
  } catch (error) {
    console.warn('플레이스홀더 이미지 확인 실패:', error)
  }
}

/**
 * 개발용 이미지 확인 함수
 */
const checkMenuImages = () => {
  console.log('=== 현재 메뉴 이미지 상태 확인 ===')
  menus.value.forEach((menu, index) => {
    console.log(`메뉴 ${index + 1}: ${menu.menuName}`)
    console.log('  - image:', menu.image)
    console.log('  - imageUrl:', menu.imageUrl)
    console.log('  - 최종 URL:', getMenuImageUrl(menu))
    console.log('  - Azure URL 여부:', getMenuImageUrl(menu).startsWith('https://'))
  })
}

const formatClosedDays = (closedDays) => {
  if (!closedDays) return '미설정'
  
  if (typeof closedDays === 'string') {
    return closedDays
  }
  
  if (Array.isArray(closedDays)) {
    const dayNames = {
      'monday': '월요일',
      'tuesday': '화요일', 
      'wednesday': '수요일',
      'thursday': '목요일',
      'friday': '금요일',
      'saturday': '토요일',
      'sunday': '일요일'
    }
    
    return closedDays.map(day => dayNames[day] || day).join(', ') || '연중무휴'
  }
  
  return '미설정'
}

const showSnackbar = (message, color = 'success') => {
  snackbar.value.message = message
  snackbar.value.color = color
  snackbar.value.show = true
}

// ===== 이미지 관련 함수들 =====

// watch 추가 - selectedImageFile 변경 감지
watch(selectedImageFile, (newFile, oldFile) => {
  console.log('selectedImageFile 변경 감지:', newFile)
  
  // 실제로 다른 파일로 변경되었을 때만 로그 출력
  if (newFile && newFile !== oldFile) {
    console.log('새 파일 설정됨:', newFile.name)
  }
}, { immediate: false })

// ✅ 파일 입력 변경 감지 함수 개선
const onFileInputChange = (file) => {
  console.log('=== v-file-input v-model 변경 감지 ===')
  console.log('전달받은 file:', file)
  
  if (file) {
    // 파일이 선택되면 강제 표시 모드 해제
    forceShowFileInput.value = false
    selectedImageFile.value = file
    onImageFileSelected(file)
  } else {
    selectedImageFile.value = null
    previewImageUrl.value = ''
  }
}

// 이미지 파일 선택 처리 함수
const onImageFileSelected = (file) => {
  console.log('=== 이미지 파일 선택 처리 ===')
  console.log('선택된 파일:', file)
  
  if (!file) {
    console.log('파일이 선택되지 않음')
    selectedImageFile.value = null
    previewImageUrl.value = ''
    return
  }
  
  console.log('파일 크기:', file.size, '바이트')
  console.log('파일 타입:', file.type)
  
  // 파일 크기 체크 (10MB)
  if (file.size > 10485760) {
    showSnackbar('파일 크기는 10MB 이하여야 합니다', 'error')
    selectedImageFile.value = null
    previewImageUrl.value = ''
    return
  }
  
  // 이미지 파일 형식 체크
  if (!file.type.startsWith('image/')) {
    showSnackbar('이미지 파일만 업로드 가능합니다', 'error')
    selectedImageFile.value = null
    previewImageUrl.value = ''
    return
  }
  
  // 미리보기 URL 생성
  const reader = new FileReader()
  reader.onload = (e) => {
    previewImageUrl.value = e.target.result
    console.log('✅ 이미지 미리보기 생성 완료')
  }
  reader.readAsDataURL(file)
}

// ✅ StoreManagementView.vue의 uploadMenuImage 함수 직접 수정

// 이미지 업로드 함수 - 직접 axios 인스턴스 생성
const uploadMenuImage = async (menuId) => {
  if (!selectedImageFile.value) {
    console.log('업로드할 이미지 파일이 없음')
    return null
  }
  
  try {
    console.log('=== 메뉴 이미지 업로드 시작 ===')
    console.log('메뉴 ID:', menuId)
    console.log('이미지 파일:', selectedImageFile.value)
    
    const formData = new FormData()
    formData.append('file', selectedImageFile.value)
    
    // ✅ 직접 axios 인스턴스 생성 (import 문제 회피)
    const axios = (await import('axios')).default
    
    // ✅ 이미지 전용 API 인스턴스 생성
    const imageApiInstance = axios.create({
      baseURL: 'http://localhost:8082', // 포트만 지정
      timeout: 30000,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    // JWT 토큰 추가
    const token = localStorage.getItem('accessToken')
    if (token) {
      imageApiInstance.defaults.headers.Authorization = `Bearer ${token}`
    }
    
    console.log('🎯 ImageController로 업로드: /api/images/menu/' + menuId)
    
    // ✅ 올바른 전체 경로 지정
    const response = await imageApiInstance.post(`/api/images/menu/${menuId}`, formData)
    
    console.log('이미지 업로드 응답:', response.data)
    
    // ✅ 응답 데이터 구조 확인 및 URL 추출
    let imageUrl = null
    
    if (response.data) {
      // MenuResponse 구조에서 이미지 URL 추출
      if (response.data.image) {
        imageUrl = response.data.image
      } else if (response.data.imageUrl) {
        imageUrl = response.data.imageUrl  
      } else if (response.data.data && response.data.data.image) {
        imageUrl = response.data.data.image
      }
    }
    
    if (imageUrl && imageUrl.startsWith('https://')) {
      console.log('✅ 이미지 업로드 성공!')
      console.log('🔗 Azure Blob Storage URL:', imageUrl)
      return imageUrl
    } else {
      console.warn('⚠️ 응답에서 유효한 이미지 URL을 찾을 수 없음:', response.data)
      return null
    }
    
  } catch (error) {
    console.error('❌ 이미지 업로드 실패:', error)
    console.error('에러 상세:', error.response?.data)
    
    // 구체적인 에러 메시지 제공
    if (error.response?.status === 500) {
      console.error('서버 내부 오류 - ImageController 처리 로직 확인 필요')
      showSnackbar('서버에서 이미지 처리 중 오류가 발생했습니다', 'error')
    } else if (error.response?.status === 404) {
      console.error('ImageController API 경로를 찾을 수 없음')
      showSnackbar('이미지 업로드 API를 찾을 수 없습니다', 'error')
    } else if (error.response?.status === 413) {
      console.error('파일 크기 초과')
      showSnackbar('파일 크기가 너무 큽니다', 'error')
    } else {
      showSnackbar('이미지 업로드에 실패했습니다', 'error')
    }
    
    return null
  }
}

// ✅ 개선된 이미지 선택 초기화 함수
const resetImageSelection = () => {
  console.log('=== 이미지 선택 초기화 시작 ===')
  
  // 1. 모든 이미지 관련 상태 초기화
  selectedImageFile.value = null
  previewImageUrl.value = ''
  
  // 2. 강제로 파일 입력 표시
  forceShowFileInput.value = true
  
  // 3. Vue의 반응성을 위해 nextTick 사용
  nextTick(() => {
    console.log('✅ 이미지 선택 초기화 완료 - 파일 입력 표시됨')
  })
}

// 드래그앤드롭 처리
const onDropImage = (event) => {
  event.preventDefault()
  console.log('이미지 드롭 이벤트')
  
  const files = event.dataTransfer.files
  if (files.length > 0) {
    const file = files[0]
    selectedImageFile.value = file
    onImageFileSelected(file)
  }
}

// ===== 폼 관련 함수들 =====

// 폼 리셋 함수
const resetForm = () => {
  formData.value = {
    storeName: '',
    businessType: '',
    address: '',
    phoneNumber: '',
    seatCount: 0,
    instagramUrl: '',
    blogUrl: '',
    openTime: '09:00',
    closeTime: '21:00',
    holidays: [],
    description: ''
  }
  if (storeFormRef.value) {
    storeFormRef.value.resetValidation()
  }
}

// ✅ 메뉴 폼 리셋 함수 개선
const resetMenuForm = () => {
  console.log('=== 메뉴 폼 리셋 ===')
  
  menuFormData.value = {
    menuId: null,
    id: null,
    menuName: '',
    category: '',
    price: 0,
    description: '',
    available: true,
    recommended: false,
    imageUrl: ''
  }
  
  // 이미지 관련 상태 초기화
  selectedImageFile.value = null
  previewImageUrl.value = ''
  forceShowFileInput.value = false // ✅ 추가
  
  if (menuFormRef.value) {
    menuFormRef.value.resetValidation()
  }
  
  console.log('✅ 메뉴 폼 리셋 완료')
}

// ===== 다이얼로그 관련 함수들 =====

const openCreateDialog = () => {
  console.log('새 매장 등록 다이얼로그 열기')
  editMode.value = false
  resetForm()
  showCreateDialog.value = true
}

const editBasicInfo = () => {
  console.log('매장 정보 수정 시작')
  editMode.value = true
  
  // 기존 매장 정보로 폼 데이터 설정
  const store = storeInfo.value
  formData.value = {
    storeName: store.storeName || '',
    businessType: store.businessType || '',
    address: store.address || '',
    phoneNumber: store.phoneNumber || '',
    seatCount: store.seatCount || 0,
    instagramUrl: store.instaAccounts || '',
    blogUrl: store.blogAccounts || '',
    openTime: store.openTime || '09:00',
    closeTime: store.closeTime || '21:00',
    holidays: store.holidays || [],
    description: store.description || ''
  }
  
  showCreateDialog.value = true
}

// 메뉴 관련 메서드들
const openCreateMenuDialog = () => {
  console.log('메뉴 등록 다이얼로그 열기')
  menuEditMode.value = false
  resetMenuForm()
  showMenuDialog.value = true
}

// ✅ 메뉴 수정 함수에서 이미지 상태 올바르게 설정
const editMenu = (menu) => {
  console.log('=== 메뉴 수정 호출 ===')
  console.log('전달받은 메뉴 객체:', menu)
  
  if (!menu || menu === null || menu === undefined) {
    console.error('❌ 전달받은 메뉴 객체가 null 또는 undefined입니다')
    showSnackbar('메뉴 정보를 찾을 수 없습니다', 'error')
    return
  }
  
  const menuId = menu.menuId || menu.id
  console.log('추출된 메뉴 ID:', menuId, '타입:', typeof menuId)
  
  if (!menuId || menuId === 'undefined' || menuId === null || menuId === '') {
    console.error('❌ 메뉴 ID를 찾을 수 없음:', menu)
    showSnackbar('메뉴 ID를 찾을 수 없습니다', 'error')
    return
  }
  
  console.log('✅ 사용할 메뉴 ID:', menuId)
  menuEditMode.value = true
  
  // 메뉴 폼 데이터 설정
  menuFormData.value = {
    menuId: menuId,
    id: menuId,
    menuName: menu.menuName || menu.name || '',
    category: menu.category || '',
    price: menu.price || 0,
    description: menu.description || '',
    available: menu.available !== undefined ? menu.available : true,
    recommended: menu.recommended !== undefined ? menu.recommended : false,
    imageUrl: menu.image || menu.imageUrl || ''
  }
  
  // ✅ 이미지 상태 올바르게 초기화
  selectedImageFile.value = null
  previewImageUrl.value = ''
  forceShowFileInput.value = false // 기존 이미지를 먼저 보여줌
  
  console.log('✅ 메뉴 수정 폼 데이터 설정 완료:', menuFormData.value)
  console.log('✅ 기존 이미지 URL:', menuFormData.value.imageUrl)
  showMenuDialog.value = true
}

// 메뉴 상세 보기
const viewMenuDetail = (menu) => {
  console.log('=== 메뉴 상세 보기 호출 ===')
  console.log('전달받은 메뉴 객체:', menu)
  
  const menuId = menu.menuId || menu.id
  
  if (!menuId) {
    console.error('❌ 메뉴 ID를 찾을 수 없음:', menu)
    showSnackbar('메뉴 정보가 올바르지 않습니다', 'error')
    return
  }
  
  console.log('✅ 사용할 메뉴 ID:', menuId)
  
  selectedMenu.value = {
    ...menu,
    id: menuId,
    menuId: menuId,
    name: menu.menuName || menu.name,
    menuName: menu.menuName || menu.name,
    imageUrl: menu.image || menu.imageUrl || '/images/menu-placeholder.png'
  }
  
  console.log('✅ 메뉴 상세 정보 설정 완료:', selectedMenu.value)
  showMenuDetailDialog.value = true
}

const closeMenuDetail = () => {
  showMenuDetailDialog.value = false
  selectedMenu.value = null
}

const confirmDeleteMenu = (menu) => {
  console.log('메뉴 삭제 확인:', menu)
  if (confirm(`'${menu.menuName}' 메뉴를 삭제하시겠습니까?`)) {
    deleteMenu(menu.id || menu.menuId)
  }
}

const clearFilters = () => {
  menuSearch.value = ''
  menuCategoryFilter.value = '전체'
}

// 메뉴 폼 취소
const cancelMenuForm = () => {
  console.log('메뉴 폼 취소')
  showMenuDialog.value = false
  menuEditMode.value = false
  resetMenuForm()
}

// ===== 저장 관련 함수들 =====

// ✅ StoreManagementView.vue의 saveStore 함수 수정

// 매장 정보 저장 함수
const saveStore = async () => {
  if (!storeFormRef.value) {
    showSnackbar('폼 오류가 발생했습니다', 'error')
    return
  }
  
  const { valid } = await storeFormRef.value.validate()
  if (!valid) {
    showSnackbar('필수 정보를 모두 입력해주세요', 'error')
    return
  }
  
  saving.value = true
  
  try {
    console.log('매장 정보 저장 시작')
    console.log('폼 데이터:', formData.value)
    
    // ✅ 백엔드 형식에 맞는 데이터 구조로 변환
    const storeData = {
      storeName: formData.value.storeName,
      businessType: formData.value.businessType,
      address: formData.value.address,
      phoneNumber: formData.value.phoneNumber || '',
      // ✅ 수정: 시간 범위 문자열로 생성
      businessHours: `${formData.value.openTime || '09:00'}-${formData.value.closeTime || '21:00'}`,
      // ✅ 수정: 휴무일 배열을 문자열로 변환
      closedDays: Array.isArray(formData.value.holidays) ? 
        formData.value.holidays.join(',') : (formData.value.holidays || ''),
      seatCount: parseInt(formData.value.seatCount) || 0,
      instaAccounts: formData.value.instagramUrl || '',
      blogAccounts: formData.value.blogUrl || '',
      description: formData.value.description || ''
    }
    
    console.log('백엔드로 전송할 데이터:', storeData)
    console.log('=== 필드별 상세 정보 ===')
    console.log('storeName:', storeData.storeName, '(타입:', typeof storeData.storeName, ')')
    console.log('businessType:', storeData.businessType, '(타입:', typeof storeData.businessType, ')')
    console.log('businessHours:', storeData.businessHours, '(타입:', typeof storeData.businessHours, ')')
    console.log('closedDays:', storeData.closedDays, '(타입:', typeof storeData.closedDays, ')')
    console.log('seatCount:', storeData.seatCount, '(타입:', typeof storeData.seatCount, ')')
    
    let result
    if (editMode.value) {
      console.log('🔄 매장 정보 수정 API 호출')
      result = await storeStore.updateStore(storeInfo.value.storeId, storeData)
    } else {
      console.log('➕ 매장 정보 등록 API 호출')
      result = await storeStore.registerStore(storeData)
    }
    
    console.log('저장 결과:', result)
    
    if (result.success) {
      showSnackbar(
        editMode.value ? '매장 정보가 수정되었습니다' : '매장이 등록되었습니다',
        'success'
      )
      showCreateDialog.value = false
      editMode.value = false
      resetForm()
      await storeStore.fetchStoreInfo()
    } else {
      showSnackbar(result.message || '저장에 실패했습니다', 'error')
    }
  } catch (error) {
    console.error('매장 정보 저장 중 오류:', error)
    showSnackbar('저장 중 오류가 발생했습니다', 'error')
  } finally {
    saving.value = false
  }
}

// ✅ 메뉴 수정 후 위치 유지를 위한 saveMenu 함수 개선

// 메뉴 저장 함수
const saveMenu = async () => {
  console.log('=== 메뉴 저장 시작 ===')
  console.log('메뉴 수정 모드:', menuEditMode.value)
  console.log('폼 데이터:', menuFormData.value)
  console.log('선택된 이미지 파일:', selectedImageFile.value)
  console.log('이미지 미리보기:', previewImageUrl.value)
  
  if (!menuFormRef.value) {
    showSnackbar('폼 오류가 발생했습니다', 'error')
    return
  }
  
  const { valid } = await menuFormRef.value.validate()
  if (!valid) {
    showSnackbar('필수 정보를 모두 입력해주세요', 'error')
    return
  }
  
  // 신규 등록 시 이미지 필수 체크
  if (!menuEditMode.value && !selectedImageFile.value) {
    showSnackbar('메뉴 이미지는 필수입니다', 'error')
    return
  }
  
  saving.value = true
  
  try {
    const { menuService } = await import('@/services/menu')
    
    let menuResult
    let savedMenuId
    let isEdit = menuEditMode.value // ✅ 수정 모드 여부 저장
    
    if (menuEditMode.value) {
      // 메뉴 수정
      const menuId = menuFormData.value.id || menuFormData.value.menuId
      
      if (!menuId || menuId === 'undefined' || menuId === null) {
        showSnackbar('메뉴 ID가 없습니다', 'error')
        return
      }
      
      const menuData = {
        menuName: menuFormData.value.menuName,
        category: menuFormData.value.category,
        price: parseInt(menuFormData.value.price) || 0,
        description: menuFormData.value.description || ''
      }
      
      console.log('✅ 메뉴 수정 데이터:', menuData)
      
      menuResult = await menuService.updateMenu(menuId, menuData)
      savedMenuId = menuId
    } else {
      // 메뉴 등록
      const storeId = storeInfo.value?.storeId
      
      if (!storeId) {
        showSnackbar('매장 정보를 찾을 수 없습니다', 'error')
        return
      }
      
      const menuData = {
        storeId: storeId,
        menuName: menuFormData.value.menuName?.trim(),
        category: menuFormData.value.category,
        price: parseInt(menuFormData.value.price) || 0,
        description: menuFormData.value.description?.trim() || ''
      }
      
      console.log('✅ 메뉴 등록 데이터:', menuData)
      
      menuResult = await menuService.createMenu(menuData)
      savedMenuId = menuResult.data?.menuId
    }
    
    console.log('✅ 메뉴 저장 완료:', menuResult)
    
    if (!menuResult.success) {
      showSnackbar(menuResult.message || '메뉴 저장에 실패했습니다', 'error')
      return
    }
    
    // 이미지 업로드 처리 (새 이미지가 선택된 경우만)
    if (selectedImageFile.value && savedMenuId) {
      console.log('=== 이미지 업로드 시작 ===')
      console.log('메뉴 ID:', savedMenuId)
      console.log('이미지 파일:', selectedImageFile.value)
      
      const imageUrl = await uploadMenuImage(savedMenuId)
      
      if (imageUrl) {
        console.log('✅ 이미지 업로드 완료:', imageUrl)
        showSnackbar(`메뉴가 ${isEdit ? '수정' : '등록'}되었고 이미지도 업로드되었습니다`, 'success')
      } else {
        console.warn('⚠️ 이미지 업로드 실패')
        showSnackbar(`메뉴는 ${isEdit ? '수정' : '등록'}되었지만 이미지 업로드에 실패했습니다`, 'warning')
      }
    } else {
      console.log('새 이미지가 선택되지 않아 이미지 업로드 건너뜀')
      showSnackbar(`메뉴가 ${isEdit ? '수정' : '등록'}되었습니다`, 'success')
    }
    
    // ✅ 다이얼로그 닫기 및 상태 초기화
    showMenuDialog.value = false
    menuEditMode.value = false
    resetMenuForm()
    
    // ✅ 메뉴 목록 새로고침 (수정 모드일 때는 지연 없이 즉시)
    if (isEdit) {
      // 수정인 경우: 즉시 새로고침하여 위치 유지
      await loadMenus()
      console.log('✅ 메뉴 수정 완료 - 목록 새로고침됨 (위치 유지)')
    } else {
      // 신규 등록인 경우: 약간의 지연 후 새로고침 (새 메뉴가 맨 앞에 추가됨)
      setTimeout(async () => {
        await loadMenus()
        console.log('✅ 메뉴 등록 완료 - 목록 새로고침됨')
      }, 500)
    }
    
  } catch (error) {
    console.error('❌ 메뉴 저장 중 예외 발생:', error)
    showSnackbar('저장 중 오류가 발생했습니다', 'error')
  } finally {
    saving.value = false
  }
}

// 메뉴 삭제 함수
const deleteMenu = async (menuId) => {
  console.log('=== 메뉴 삭제 시작 ===')
  console.log('삭제할 메뉴 ID:', menuId, '타입:', typeof menuId)
  
  if (!menuId || menuId === 'undefined' || menuId === null) {
    console.error('❌ 유효하지 않은 메뉴 ID:', menuId)
    showSnackbar('올바른 메뉴 ID가 필요합니다', 'error')
    return
  }
  
  try {
    const { menuService } = await import('@/services/menu')
    
    console.log('✅ 메뉴 삭제 API 호출, ID:', menuId)
    const result = await menuService.deleteMenu(menuId)
    
    if (result.success) {
      showSnackbar('메뉴가 삭제되었습니다', 'success')
      await loadMenus()
    } else {
      showSnackbar(result.message || '메뉴 삭제에 실패했습니다', 'error')
    }
  } catch (error) {
    console.error('메뉴 삭제 실패:', error)
    showSnackbar(`메뉴 삭제 중 오류가 발생했습니다: ${error.message}`, 'error')
  }
}

// ===== 데이터 로드 함수들 =====

// 메뉴 데이터 로드 함수 - 실제 API 연동
const loadMenus = async () => {
  try {
    console.log('메뉴 데이터 로드 시작')
    const result = await storeStore.fetchMenus()
    
    if (result.success) {
      menus.value = result.data
      console.log('✅ 메뉴 데이터 로드 완료:', result.data)
    } else {
      console.log('메뉴 데이터 없음 또는 로드 실패:', result.message)
      menus.value = []
    }
  } catch (error) {
    console.error('메뉴 데이터 로드 실패:', error)
    menus.value = []
  }
}

// 개발 환경에서 전역으로 노출
if (process.env.NODE_ENV === 'development') {
  window.checkMenuImages = checkMenuImages
  window.getMenuImageUrl = getMenuImageUrl
}

/**
 * 컴포넌트 마운트 시 실행
 */
onMounted(async () => {
  console.log('=== StoreManagementView 마운트됨 ===')
  
  // 플레이스홀더 이미지 확인
  await checkPlaceholderImage()
  
  try {
    const result = await storeStore.fetchStoreInfo()
    
    console.log('매장 정보 조회 결과:', result)
    
    if (result.success) {
      console.log('✅ 매장 정보 로드 완료:', result.data)
      await loadMenus()
      
      // 개발 환경에서 이미지 상태 확인
      if (process.env.NODE_ENV === 'development') {
        setTimeout(checkMenuImages, 2000)
      }
    } else {
      if (result.message === '등록된 매장이 없습니다') {
        console.log('⚠️ 등록된 매장이 없음 - 등록 화면 표시')
      } else {
        console.warn('❌ 매장 정보 조회 실패:', result.message)
        showSnackbar(result.message || '매장 정보를 불러오는데 실패했습니다', 'error')
      }
    }
  } catch (error) {
    console.error('매장 정보 조회 중 예외 발생:', error)
    showSnackbar('매장 정보를 불러오는 중 오류가 발생했습니다', 'error')
  }
})
</script>

<style scoped>
.info-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 16px;
}

.info-item .v-icon {
  margin-top: 2px;
}

.gap-3 {
  gap: 12px;
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 메뉴 카드 스타일 */
.menu-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  cursor: pointer;
}

.menu-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.position-relative {
  position: relative;
}

.position-absolute {
  position: absolute;
}

.top-0 {
  top: 0;
}

.right-0 {
  right: 0;
}

.left-0 {
  left: 0;
}

.h-100 {
  height: 100%;
}

/* 드래그앤드롭 영역 스타일 */
.drop-zone {
  transition: all 0.3s ease;
}

.drop-zone:hover {
  border-color: #1976d2 !important;
  background: #f3f8ff !important;
}

/* 이미지 미리보기 스타일 */
.image-preview {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview:hover {
  border-color: #1976d2;
}

/* 카드 그림자 효과 */
.v-card {
  transition: box-shadow 0.3s ease;
}

.v-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
}

/* 버튼 호버 효과 */
.v-btn {
  transition: all 0.2s ease;
}

.v-btn:hover {
  transform: translateY(-1px);
}

/* 탭 스타일 */
.v-tabs {
  border-radius: 8px;
  overflow: hidden;
}

.v-tab {
  font-weight: 500;
  text-transform: none;
}

.v-tab--selected {
  background-color: rgba(25, 118, 210, 0.08);
}

/* 폼 입력 필드 스타일 */
.v-text-field, .v-select, .v-textarea {
  margin-bottom: 4px;
}

.v-text-field .v-field, 
.v-select .v-field, 
.v-textarea .v-field {
  border-radius: 8px;
}

/* 다이얼로그 스타일 */
.v-dialog .v-card {
  border-radius: 12px;
  overflow: hidden;
}

.v-dialog .v-card-title {
  background-color: rgba(25, 118, 210, 0.02);
  border-bottom: 1px solid #e0e0e0;
}

/* 메뉴 카드 내 액션 버튼 */
.menu-card .v-btn {
  backdrop-filter: blur(4px);
  background-color: rgba(255, 255, 255, 0.9);
}

.menu-card .v-btn:hover {
  background-color: rgba(255, 255, 255, 1);
  transform: scale(1.05);
}

/* 스낵바 스타일 */
.v-snackbar {
  border-radius: 12px;
  margin: 16px;
}

/* 칩 스타일 */
.v-chip {
  font-weight: 500;
  border-radius: 16px;
}

/* 아바타 스타일 */
.v-avatar {
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 프로그레스 원형 스타일 */
.v-progress-circular {
  margin: auto;
}

/* 메뉴 정보 레이아웃 */
.info-section {
  padding: 16px;
  border-radius: 8px;
  background-color: #fafafa;
  margin-bottom: 16px;
}

/* 이미지 업로드 관련 스타일 */
.rounded {
  border-radius: 8px;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

/* 파일 입력 스타일 */
.v-file-input {
  margin-bottom: 16px;
}

.v-file-input .v-field {
  border-radius: 8px;
}

/* 로딩 상태 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

/* 이미지 로딩 실패 시 스타일 */
.v-img--error {
  background-color: #f5f5f5;
}

.v-img--error .v-icon {
  opacity: 0.3;
}

/* 이미지 로딩 중 스타일 */
.v-img--loading {
  background-color: #f5f5f5;
}

/* Azure Blob Storage 이미지 최적화 */
.menu-image {
  object-fit: cover;
  width: 100%;
  height: 200px;
}

/* 플레이스홀더 이미지 스타일 */
.placeholder-image {
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-image .v-icon {
  color: #bdbdbd;
}

/* 이미지 호버 효과 */
.menu-card .v-img {
  transition: transform 0.2s ease;
}

.menu-card:hover .v-img {
  transform: scale(1.02);
}

/* 반응형 디자인 */
@media (max-width: 960px) {
  .info-item {
    margin-bottom: 12px;
  }
  
  .menu-card {
    margin-bottom: 16px;
  }
  
  .gap-3 {
    gap: 8px;
  }
  
  .v-dialog {
    margin: 16px;
  }
  
  .v-dialog .v-card {
    max-width: calc(100vw - 32px) !important;
  }
}

@media (max-width: 600px) {
  .info-item {
    flex-direction: column;
    gap: 4px;
  }
  
  .info-item .v-icon {
    margin-top: 0;
  }
  
  .empty-state {
    padding: 2rem 1rem;
  }
  
  .v-container {
    padding: 8px !important;
  }
  
  .menu-card .position-absolute {
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  
  .menu-card:hover .position-absolute,
  .menu-card:active .position-absolute {
    opacity: 1;
  }
  
  /* 모바일에서 버튼 크기 조정 */
  .menu-card .v-btn {
    min-width: 32px;
    width: 32px;
    height: 32px;
  }
  
  /* 모바일에서 탭 크기 조정 */
  .v-tab {
    min-width: 120px;
    font-size: 0.875rem;
  }
}

/* 스크롤바 스타일 (웹킷 브라우저) */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 로딩 애니메이션 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}

/* 메뉴 카드 진입 애니메이션 */
.menu-card {
  animation: fadeIn 0.3s ease-out;
}

.menu-card:nth-child(1) { animation-delay: 0s; }
.menu-card:nth-child(2) { animation-delay: 0.05s; }
.menu-card:nth-child(3) { animation-delay: 0.1s; }
.menu-card:nth-child(4) { animation-delay: 0.15s; }
.menu-card:nth-child(n+5) { animation-delay: 0.2s; }

/* 이미지 로딩 플레이스홀더 */
.v-img__img {
  transition: opacity 0.3s ease;
}

.v-img--loading .v-img__img {
  opacity: 0;
}

/* 포커스 스타일 개선 */
.v-btn:focus-visible {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

.v-text-field:focus-within .v-field,
.v-select:focus-within .v-field,
.v-textarea:focus-within .v-field {
  border: 2px solid #1976d2;
  box-shadow: 0 0 0 1px rgba(25, 118, 210, 0.2);
}

/* 드롭존 드래그 오버 효과 */
.drop-zone.drag-over {
  border-color: #1976d2 !important;
  background: #e3f2fd !important;
  transform: scale(1.02);
}

/* 상태별 스타일 */
.error-state {
  color: #d32f2f;
}

.error-state .v-icon {
  color: #d32f2f;
}

.success-state {
  color: #2e7d32;
}

.success-state .v-icon {
  color: #2e7d32;
}

.warning-state {
  color: #ed6c02;
}

.warning-state .v-icon {
  color: #ed6c02;
}

/* ✅ 메뉴 다이얼로그 스타일 추가 - Style 부분에 추가 */

/* 메뉴 다이얼로그 전용 스타일 */
.menu-dialog .v-overlay__content {
  max-height: 90vh !important;
  margin: 24px;
}

.menu-dialog-card {
  max-height: 90vh !important;
  display: flex;
  flex-direction: column;
}

.menu-dialog-card .dialog-content {
  flex: 1;
  overflow-y: auto;
  max-height: calc(90vh - 120px); /* 헤더와 푸터 공간 제외 */
}

/* 드래그앤드롭 영역 크기 조정 */
.menu-dialog .drop-zone {
  min-height: 80px !important;
  max-height: 80px !important;
}

/* 이미지 미리보기 크기 조정 */
.menu-dialog .v-img {
  max-height: 180px !important;
  max-width: 280px !important;
}

/* 모바일에서 다이얼로그 최적화 */
@media (max-width: 600px) {
  .menu-dialog .v-overlay__content {
    margin: 16px;
    max-height: 95vh !important;
  }
  
  .menu-dialog-card .dialog-content {
    max-height: calc(95vh - 100px);
    padding: 16px !important;
  }
  
  .menu-dialog .v-img {
    max-height: 150px !important;
    max-width: 200px !important;
  }
}

/* 스크롤바 스타일 개선 */
.dialog-content::-webkit-scrollbar {
  width: 6px;
}

.dialog-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.dialog-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.dialog-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* ✅ 매장 다이얼로그 스타일 추가 - Style 부분에 추가 */

/* 매장 다이얼로그 전용 스타일 */
.store-dialog .v-overlay__content {
  max-height: 90vh !important;
  margin: 24px;
}

.store-dialog-card {
  max-height: 90vh !important;
  display: flex;
  flex-direction: column;
}

.store-dialog-card .store-dialog-content {
  flex: 1;
  overflow-y: auto;
  max-height: calc(90vh - 120px); /* 헤더와 푸터 공간 제외 */
}

/* 모바일에서 매장 다이얼로그 최적화 */
@media (max-width: 600px) {
  .store-dialog .v-overlay__content {
    margin: 16px;
    max-height: 95vh !important;
  }
  
  .store-dialog-card .store-dialog-content {
    max-height: calc(95vh - 100px);
    padding: 16px !important;
  }
}

/* 매장 다이얼로그 스크롤바 스타일 */
.store-dialog-content::-webkit-scrollbar {
  width: 6px;
}

.store-dialog-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.store-dialog-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.store-dialog-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
/* 🎨 소이님 UI 개선을 위한 스타일 */

/* 필터 칩 호버 효과 */
.chip-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.chip-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* 검색 필드 스타일 */
.search-field {
  transition: all 0.3s ease;
}

.search-field:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* 새 콘텐츠 생성 버튼 */
.create-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 160px;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.3);
}

/* 선택된 항목 알림 */
.selected-alert {
  border-left: 4px solid #2196F3;
  background: linear-gradient(90deg, rgba(33, 150, 243, 0.05) 0%, rgba(33, 150, 243, 0.02) 100%);
}

/* 테이블 스타일 */
.content-table {
  border-radius: 0;
}

.table-header {
  background: linear-gradient(90deg, #fafafa 0%, #f5f5f5 100%);
  border-bottom: 2px solid #e0e0e0;
}

.content-row {
  transition: all 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
}

.content-row:hover {
  background: linear-gradient(90deg, rgba(25, 118, 210, 0.02) 0%, rgba(25, 118, 210, 0.01) 100%);
  transform: translateX(2px);
  box-shadow: 2px 0 8px rgba(0,0,0,0.05);
}

.content-row:last-child {
  border-bottom: none;
}

/* 정렬 가능한 헤더 */
.sortable-header {
  transition: all 0.2s ease;
  border-radius: 4px;
}

.sortable-header:hover {
  background: rgba(25, 118, 210, 0.08);
  color: #1976D2;
}

/* 액션 버튼 */
.action-btn {
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: scale(1.1);
}

/* 빈 상태 */
.empty-state {
  background: linear-gradient(145deg, #fafafa 0%, #f0f0f0 100%);
  border-radius: 12px;
  margin: 20px;
}

/* 다이얼로그 스타일 */
.detail-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.edit-field {
  transition: all 0.3s ease;
}

.edit-field:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.content-display {
  min-height: 100px;
  border: 1px solid #e0e0e0;
}

.content-html {
  line-height: 1.6;
}

.content-html img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 8px 0;
}

.content-html p {
  margin-bottom: 12px;
}

/* 페이지네이션 */
.pagination-custom {
  margin-top: 16px;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .create-btn {
    width: 100%;
    min-width: unset;
  }
  
  .content-row:hover {
    transform: none;
  }
  
  .chip-hover:hover {
    transform: none;
  }
}

/* 스크롤바 커스터마이징 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>