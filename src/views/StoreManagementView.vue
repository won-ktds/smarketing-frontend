//* src/views/StoreManagementView.vue - 완전한 매장 등록 화면

<template>
  <v-container fluid class="pa-4">
    <!-- 매장 정보가 없는 경우 -->
    <div v-if="!storeStore.hasStoreInfo && !storeStore.loading">
      <v-row justify="center">
        <v-col cols="12" md="8">
          <v-card class="text-center pa-8" elevation="4">
            <v-img
              src="/images/store-placeholder.png"
              max-width="200"
              class="mx-auto mb-4"
            />
            <h2 class="text-h5 font-weight-bold mb-3">첫 매장을 등록해볼까요?</h2>
            <p class="text-grey mb-4">
              매장 정보를 등록하면 AI 마케팅 서비스를 이용할 수 있습니다
            </p>
            <div class="d-flex flex-column gap-3">
              <v-btn
                color="primary"
                size="large"
                prepend-icon="mdi-store-plus"
                @click="openCreateDialog"
              >
                매장 정보 등록하기
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- 매장 정보가 있는 경우 -->
    <div v-else-if="storeStore.hasStoreInfo">
      <!-- 탭 메뉴 -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-tabs v-model="currentTab" color="primary">
            <v-tab value="basic">기본 정보</v-tab>
            <v-tab value="menu">메뉴 관리</v-tab>
          </v-tabs>
        </v-col>
      </v-row>

      <v-tabs-window v-model="currentTab">
        <!-- 기본 정보 탭 -->
        <v-tabs-window-item value="basic">
          <v-card elevation="2">
            <v-card-title class="pa-4 d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-store</v-icon>
                매장 기본 정보
              </div>
              <v-btn
                color="primary"
                variant="outlined"
                prepend-icon="mdi-pencil"
                @click="editBasicInfo"
              >
                수정
              </v-btn>
            </v-card-title>
            
            <v-divider />
            
            <v-card-text class="pa-6">
              <v-row>
                <!-- 매장 이미지 -->
                <v-col cols="12" md="4" class="text-center">
                  <v-avatar size="120" class="mb-3">
                    <v-img
                      :src="storeInfo.imageUrl || '/images/store-placeholder.png'"
                      alt="매장 이미지"
                    />
                  </v-avatar>
                  <h3 class="text-h6 font-weight-bold">{{ storeInfo.storeName }}</h3>
                  <p class="text-grey">{{ storeInfo.businessType }}</p>
                </v-col>

                <!-- 기본 정보 -->
                <v-col cols="12" md="8">
                  <v-row>
                    <v-col cols="12" sm="6">
                      <div class="info-item">
                        <v-icon class="mr-2" color="grey">mdi-map-marker</v-icon>
                        <div>
                          <div class="text-caption text-grey">주소</div>
                          <div class="text-body-1">{{ storeInfo.address || '미입력' }}</div>
                        </div>
                      </div>
                    </v-col>
                    
                    <v-col cols="12" sm="6">
                      <div class="info-item">
                        <v-icon class="mr-2" color="grey">mdi-phone</v-icon>
                        <div>
                          <div class="text-caption text-grey">전화번호</div>
                          <div class="text-body-1">{{ storeInfo.phoneNumber || '미입력' }}</div>
                        </div>
                      </div>
                    </v-col>
                    
                    <v-col cols="12" sm="6">
                      <div class="info-item">
                        <v-icon class="mr-2" color="grey">mdi-clock</v-icon>
                        <div>
                          <div class="text-caption text-grey">영업시간</div>
                          <div class="text-body-1">{{ storeInfo.businessHours || '미입력' }}</div>
                        </div>
                      </div>
                    </v-col>
                
                    <v-col cols="12" sm="6">
                      <div class="info-item">
                        <v-icon class="mr-2" color="grey">mdi-calendar-remove</v-icon>
                        <div>
                          <div class="text-caption text-grey">휴무일</div>
                          <div class="text-body-1">
                            {{ formatClosedDays(storeInfo.closedDays) }}
                          </div>
                        </div>
                      </div>
                    </v-col>
                  </v-row>

                  <!-- SNS 정보 -->
                  <v-divider class="my-6" />
                  
                  <h4 class="text-h6 font-weight-bold mb-4">
                    <v-icon class="mr-2" color="primary">mdi-share-variant</v-icon>
                    SNS 정보
                  </h4>
                  
                  <v-row>
                    <v-col cols="12" sm="6">
                      <div class="info-item">
                        <v-icon class="mr-2" color="pink">mdi-instagram</v-icon>
                        <div>
                          <div class="text-caption text-grey">인스타그램</div>
                          <div class="text-body-1">
                            {{ storeInfo.instaAccounts || '미연동' }}
                          </div>
                        </div>
                      </div>
                    </v-col>
                    
                    <v-col cols="12" sm="6">
                      <div class="info-item">
                        <v-icon class="mr-2" color="green">mdi-post</v-icon>
                        <div>
                          <div class="text-caption text-grey">네이버 블로그</div>
                          <div class="text-body-1">
                            {{ storeInfo.blogAccounts || '미연동' }}
                          </div>
                        </div>
                      </div>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-tabs-window-item>

         <!-- 메뉴 관리 탭 -->
        <v-tabs-window-item value="menu">
          <!-- 메뉴 관리 도구 -->
          <v-card class="mb-4">
            <v-card-title class="pa-4 d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-food</v-icon>
                메뉴 관리
              </div>
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                @click="openCreateMenuDialog"
              >
                메뉴 등록
              </v-btn>
            </v-card-title>
            
            <v-divider />
            
            <v-card-text class="pa-4">
              <!-- 검색 및 필터 -->
              <v-row class="mb-4">
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="menuSearch"
                    label="메뉴 검색"
                    variant="outlined"
                    prepend-inner-icon="mdi-magnify"
                    clearable
                    hide-details
                  />
                </v-col>
                <v-col cols="12" sm="3">
                  <v-select
                    v-model="menuCategoryFilter"
                    label="카테고리 필터"
                    variant="outlined"
                    :items="['전체', ...menuCategories]"
                    hide-details
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- 메뉴 목록 -->
          <div v-if="filteredMenus.length > 0">
            <v-row>
              <v-col
                v-for="menu in filteredMenus"
                :key="menu.id"
                cols="12"
                sm="6"
                md="4"
                lg="3"
              >
                <v-card
                  class="menu-card h-100 position-relative"
                  elevation="2"
                  @click="viewMenuDetail(menu)"
                >
                  <!-- 메뉴 상태 배지 -->
                  <div class="position-absolute top-0 right-0 pa-2" style="z-index: 1;">
                    <v-chip
                      :color="menu.available ? 'success' : 'error'"
                      size="small"
                      variant="elevated"
                    >
                      {{ menu.available ? '판매중' : '품절' }}
                    </v-chip>
                  </div>
                  
                  <!-- 추천 메뉴 배지 -->
                  <div
                    v-if="menu.recommended"
                    class="position-absolute top-0 left-0 pa-2"
                    style="z-index: 1;"
                  >
                    <v-chip
                      color="warning"
                      size="small"
                      variant="elevated"
                    >
                      <v-icon size="small" class="mr-1">mdi-star</v-icon>
                      추천
                    </v-chip>
                  </div>

                  <v-img
                    :src="menu.imageUrl || '/images/menu-placeholder.png'"
                    :alt="menu.menuName"
                    height="200"
                    cover
                  />

                  <v-card-title class="pa-3">
                    <div class="w-100">
                      <div class="d-flex align-center justify-space-between mb-2">
                        <h4 class="text-subtitle-1 font-weight-bold text-truncate">
                          {{ menu.menuName }}
                        </h4>
                        <div class="d-flex align-center">
                          <v-btn
                            icon
                            size="small"
                            variant="text"
                            color="error"
                            @click.stop="confirmDeleteMenu(menu)"
                          >
                            <v-icon size="small">mdi-delete</v-icon>
                          </v-btn>
                          <v-btn
                            icon
                            size="small"
                            variant="text"
                            @click.stop="editMenu(menu)"
                          >
                            <v-icon size="small">mdi-pencil</v-icon>
                          </v-btn>
                        </div>
                      </div>
                      
                      <div class="d-flex align-center justify-space-between">
                        <v-chip
                          :color="getCategoryColor(menu.category)"
                          size="small"
                          variant="tonal"
                        >
                          {{ menu.category }}
                        </v-chip>
                        <span class="text-h6 font-weight-bold text-primary">
                          {{ formatCurrency(menu.price) }}
                        </span>
                      </div>
                      
                      <p class="text-body-2 text-grey mt-2 text-truncate-2">
                        {{ menu.description }}
                      </p>
                    </div>
                  </v-card-title>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <!-- 메뉴가 없는 경우 -->
          <div v-else-if="menus.length === 0" class="empty-state pa-8">
            <v-img
              src="/images/menu-placeholder.png"
              max-width="200"
              class="mx-auto mb-4"
            />
            <h3 class="text-h6 font-weight-bold mb-3 text-center">등록된 메뉴가 없습니다</h3>
            <p class="text-grey text-center mb-4">
              첫 메뉴를 등록하여 AI 마케팅 콘텐츠를 생성해보세요
            </p>
            <div class="text-center">
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                @click="openCreateMenuDialog"
              >
                메뉴 등록하기
              </v-btn>
            </div>
          </div>

          <!-- 필터 결과가 없는 경우 -->
          <div v-else class="text-center pa-8">
            <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-magnify</v-icon>
            <h3 class="text-h6 font-weight-bold mb-3">검색 결과가 없습니다</h3>
            <p class="text-grey mb-4">다른 검색 조건을 시도해보세요</p>
            <v-btn
              variant="outlined"
              @click="clearFilters"
            >
              필터 초기화
            </v-btn>
          </div>
        </v-tabs-window-item>
      </v-tabs-window>
    </div>

    <!-- 로딩 상태 -->
    <div v-else-if="storeStore.loading" class="text-center pa-8">
      <v-progress-circular
        size="64"
        color="primary"
        indeterminate
        class="mb-4"
      />
      <p class="text-body-1">매장 정보를 불러오는 중...</p>
    </div>

    <!-- 매장 등록/수정 다이얼로그 -->
    <v-dialog
      v-model="showCreateDialog"
      max-width="600"
      persistent
    >
      <v-card>
        <v-card-title class="pa-4">
          <div class="d-flex align-center">
            <v-icon class="mr-2" color="primary">mdi-store-plus</v-icon>
            {{ editMode ? '매장 정보 수정' : '매장 정보 등록' }}
          </div>
        </v-card-title>
        
        <v-divider />
        
        <v-card-text class="pa-4">
          <v-form ref="storeFormRef" v-model="formValid">
            <v-row>
              <!-- 매장명 -->
              <v-col cols="12">
                <v-text-field
                  v-model="formData.storeName"
                  label="매장명 *"
                  :rules="[v => !!v || '매장명을 입력해주세요']"
                  prepend-inner-icon="mdi-store"
                  variant="outlined"
                />
              </v-col>

              <!-- 업종 -->
              <v-col cols="12" sm="6">
                <v-select
                  v-model="formData.businessType"
                  label="업종 *"
                  :items="businessTypes"
                  :rules="[v => !!v || '업종을 선택해주세요']"
                  prepend-inner-icon="mdi-domain"
                  variant="outlined"
                />
              </v-col>

              <!-- 좌석수 -->
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="formData.seatCount"
                  label="좌석수"
                  type="number"
                  prepend-inner-icon="mdi-chair-school"
                  variant="outlined"
                  :min="0"
                  :max="500"
                />
              </v-col>

              <!-- 주소 -->
              <v-col cols="12">
                <v-text-field
                  v-model="formData.address"
                  label="주소 *"
                  :rules="[v => !!v || '주소를 입력해주세요']"
                  prepend-inner-icon="mdi-map-marker"
                  variant="outlined"
                />
              </v-col>

              <!-- 전화번호 -->
              <v-col cols="12">
                <v-text-field
                  v-model="formData.phoneNumber"
                  label="전화번호"
                  prepend-inner-icon="mdi-phone"
                  variant="outlined"
                  placeholder="예) 02-1234-5678"
                />
              </v-col>

              <!-- 영업시간 -->
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.openTime"
                  label="오픈 시간"
                  type="time"
                  prepend-inner-icon="mdi-clock-start"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.closeTime"
                  label="마감 시간"
                  type="time"
                  prepend-inner-icon="mdi-clock-end"
                  variant="outlined"
                />
              </v-col>

              <!-- 휴무일 -->
              <v-col cols="12">
                <v-select
                  v-model="formData.holidays"
                  label="휴무일"
                  :items="weekDays"
                  prepend-inner-icon="mdi-calendar-remove"
                  variant="outlined"
                  multiple
                  chips
                  closable-chips
                />
              </v-col>

              <!-- SNS 계정 -->
              <v-col cols="12">
                <v-text-field
                  v-model="formData.instagramUrl"
                  label="인스타그램 계정"
                  prepend-inner-icon="mdi-instagram"
                  variant="outlined"
                  placeholder="예) @your_instagram"
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="formData.blogUrl"
                  label="네이버 블로그"
                  prepend-inner-icon="mdi-post"
                  variant="outlined"
                  placeholder="예) blog.naver.com/your_blog"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-divider />
        
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            @click="cancelForm"
            :disabled="saving"
          >
            취소
          </v-btn>
          <v-btn
            color="primary"
            @click="saveStoreInfo"
            :loading="saving"
            :disabled="!formValid"
          >
            {{ editMode ? '수정' : '등록' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 스낵바 -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="bottom"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStoreStore } from '@/store/index'

const storeStore = useStoreStore()

// 반응형 상태
const currentTab = ref('basic')
const showCreateDialog = ref(false)
const editMode = ref(false)
const formValid = ref(false)
const saving = ref(false)
const storeFormRef = ref(null) // 폼 참조

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

// 유틸리티 함수들
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

// 메서드들
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

const addMenu = () => {
  console.log('메뉴 추가 (개발 예정)')
  showSnackbar('메뉴 관리 기능은 곧 업데이트 예정입니다', 'info')
}

const cancelForm = () => {
  console.log('폼 취소')
  showCreateDialog.value = false
  editMode.value = false
  resetForm()
}

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
  
  // 폼 validation 초기화
  if (storeFormRef.value) {
    storeFormRef.value.resetValidation()
  }
}

// 매장 정보 저장 함수 - 완전히 새로 작성
const saveStoreInfo = async () => {
  console.log('=== 매장 정보 저장 시작 ===')
  console.log('편집 모드:', editMode.value)
  console.log('폼 데이터:', formData.value)
  
  // 폼 유효성 검사
  if (!storeFormRef.value) {
    console.error('폼 참조를 찾을 수 없습니다')
    showSnackbar('폼 오류가 발생했습니다', 'error')
    return
  }
  
  const { valid } = await storeFormRef.value.validate()
  if (!valid) {
    console.log('폼 유효성 검사 실패')
    showSnackbar('필수 정보를 모두 입력해주세요', 'error')
    return
  }
  
  saving.value = true
  
  try {
    // 백엔드에 보낼 데이터 형식으로 변환
    const storeData = {
      storeName: formData.value.storeName,
      businessType: formData.value.businessType,
      address: formData.value.address,
      phoneNumber: formData.value.phoneNumber,
      businessHours: `${formData.value.openTime}-${formData.value.closeTime}`,
      closedDays: Array.isArray(formData.value.holidays) ? formData.value.holidays.join(',') : '',
      seatCount: parseInt(formData.value.seatCount) || 0,
      instaAccounts: formData.value.instagramUrl || '',
      blogAccounts: formData.value.blogUrl || '',
      description: formData.value.description || ''
    }
    
    console.log('백엔드로 전송할 데이터:', storeData)
    
    let result
    if (editMode.value) {
      // 매장 정보 수정
      result = await storeStore.updateStore(storeInfo.value.storeId, storeData)
    } else {
      // 새 매장 등록
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
      
      // 매장 정보 다시 조회
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

/**
 * 컴포넌트 마운트 시 실행
 */
onMounted(async () => {
  console.log('=== StoreManagementView 마운트됨 ===')
  
  try {
    // 매장 정보 조회
    const result = await storeStore.fetchStoreInfo()
    
    console.log('매장 정보 조회 결과:', result)
    
    if (result.success) {
      console.log('✅ 매장 정보 로드 완료:', result.data)
      
      // 메뉴 관리 탭에서 사용할 메뉴 정보도 로드
      try {
        await storeStore.fetchMenus()
        console.log('메뉴 정보 로드 완료')
      } catch (menuError) {
        console.log('메뉴 정보 로드 실패 (개발 중이므로 무시):', menuError)
      }
    } else {
      if (result.message === '등록된 매장이 없습니다') {
        console.log('⚠️ 등록된 매장이 없음 - 등록 화면 표시')
        // 매장이 없는 경우는 정상적인 상황이므로 에러 메시지 표시하지 않음
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

@media (max-width: 600px) {
  .info-item {
    margin-bottom: 12px;
  }
}
</style>