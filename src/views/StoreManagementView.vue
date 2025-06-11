<template>
  <v-container fluid class="pa-4">
    <!-- 페이지 헤더 -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">매장 관리</h1>
            <p class="text-grey">매장 정보를 관리하고 설정을 변경할 수 있습니다</p>
          </div>
          <v-btn
            v-if="!storeStore.hasStoreInfo"
            color="primary"
            size="large"
            prepend-icon="mdi-plus"
            @click="showCreateDialog = true"
          >
            매장 등록
          </v-btn>
        </div>
      </v-col>
    </v-row>

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
            <v-btn
              color="primary"
              size="large"
              prepend-icon="mdi-store-plus"
              @click="showCreateDialog = true"
            >
              매장 정보 등록하기
            </v-btn>
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
            <v-tab value="operation">운영 설정</v-tab>
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
                <v-col cols="12" md="4">
                  <div class="text-center">
                    <v-avatar size="120" class="mb-4">
                      <v-img
                        :src="storeInfo.imageUrl || '/images/store-placeholder.png'"
                        :alt="storeInfo.storeName"
                      />
                    </v-avatar>
                    <h3 class="text-h6 font-weight-bold">{{ storeInfo.storeName }}</h3>
                    <p class="text-caption text-grey">{{ storeInfo.businessType }}</p>
                  </div>
                </v-col>
                
                <v-col cols="12" md="8">
                  <v-row>
                    <v-col cols="12" sm="6">
                      <div class="mb-4">
                        <h4 class="text-subtitle-2 text-grey mb-1">사업자명</h4>
                        <p class="text-body-1">{{ storeInfo.ownerName }}</p>
                      </div>
                    </v-col>
                    
                    <v-col cols="12" sm="6">
                      <div class="mb-4">
                        <h4 class="text-subtitle-2 text-grey mb-1">사업자등록번호</h4>
                        <p class="text-body-1">{{ storeInfo.businessNumber }}</p>
                      </div>
                    </v-col>
                    
                    <v-col cols="12">
                      <div class="mb-4">
                        <h4 class="text-subtitle-2 text-grey mb-1">주소</h4>
                        <p class="text-body-1">{{ storeInfo.address }}</p>
                      </div>
                    </v-col>
                    
                    <v-col cols="12" sm="6">
                      <div class="mb-4">
                        <h4 class="text-subtitle-2 text-grey mb-1">연락처</h4>
                        <p class="text-body-1">{{ storeInfo.phoneNumber }}</p>
                      </div>
                    </v-col>
                    
                    <v-col cols="12" sm="6">
                      <div class="mb-4">
                        <h4 class="text-subtitle-2 text-grey mb-1">좌석 수</h4>
                        <p class="text-body-1">{{ storeInfo.seatCount }}석</p>
                      </div>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              
              <!-- SNS 계정 정보 -->
              <v-divider class="my-6" />
              
              <h4 class="text-h6 font-weight-bold mb-4">SNS 계정 정보</h4>
              
              <v-row>
                <v-col cols="12" sm="6">
                  <div class="d-flex align-center">
                    <v-icon color="purple" class="mr-3">mdi-instagram</v-icon>
                    <div>
                      <p class="text-body-2 text-grey mb-1">Instagram</p>
                      <p class="text-body-1">{{ storeInfo.instagramUrl || '등록되지 않음' }}</p>
                    </div>
                  </div>
                </v-col>
                
                <v-col cols="12" sm="6">
                  <div class="d-flex align-center">
                    <v-icon color="green" class="mr-3">mdi-blogger</v-icon>
                    <div>
                      <p class="text-body-2 text-grey mb-1">네이버 블로그</p>
                      <p class="text-body-1">{{ storeInfo.blogUrl || '등록되지 않음' }}</p>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-tabs-window-item>

        <!-- 운영 설정 탭 -->
        <v-tabs-window-item value="operation">
          <v-card elevation="2">
            <v-card-title class="pa-4 d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-clock</v-icon>
                운영 설정
              </div>
              <v-btn
                color="primary"
                variant="outlined"
                prepend-icon="mdi-pencil"
                @click="editOperationInfo"
              >
                수정
              </v-btn>
            </v-card-title>
            
            <v-divider />
            
            <v-card-text class="pa-6">
              <!-- 영업시간 -->
              <div class="mb-6">
                <h4 class="text-h6 font-weight-bold mb-4">영업시간</h4>
                <v-row>
                  <v-col 
                    v-for="day in daysOfWeek" 
                    :key="day.value"
                    cols="12" 
                    sm="6" 
                    md="4"
                  >
                    <div class="d-flex align-center justify-space-between pa-3 bg-grey-lighten-5 rounded">
                      <span class="font-weight-medium">{{ day.text }}</span>
                      <span class="text-body-2">
                        {{ getOperatingHours(day.value) }}
                      </span>
                    </div>
                  </v-col>
                </v-row>
              </div>
              
              <!-- 휴무일 -->
              <div class="mb-6">
                <h4 class="text-h6 font-weight-bold mb-4">휴무일</h4>
                <v-chip-group>
                  <v-chip
                    v-for="holiday in storeInfo.holidays"
                    :key="holiday"
                    color="error"
                    variant="tonal"
                  >
                    {{ holiday }}
                  </v-chip>
                  <v-chip v-if="!storeInfo.holidays?.length" color="success" variant="tonal">
                    연중무휴
                  </v-chip>
                </v-chip-group>
              </div>
              
              <!-- 기타 설정 -->
              <div>
                <h4 class="text-h6 font-weight-bold mb-4">기타 설정</h4>
                <v-row>
                  <v-col cols="12" sm="6">
                    <div class="mb-4">
                      <h5 class="text-subtitle-2 text-grey mb-1">배달 서비스</h5>
                      <v-chip 
                        :color="storeInfo.deliveryAvailable ? 'success' : 'error'"
                        variant="tonal"
                      >
                        {{ storeInfo.deliveryAvailable ? '이용 가능' : '이용 불가' }}
                      </v-chip>
                    </div>
                  </v-col>
                  
                  <v-col cols="12" sm="6">
                    <div class="mb-4">
                      <h5 class="text-subtitle-2 text-grey mb-1">포장 서비스</h5>
                      <v-chip 
                        :color="storeInfo.takeoutAvailable ? 'success' : 'error'"
                        variant="tonal"
                      >
                        {{ storeInfo.takeoutAvailable ? '이용 가능' : '이용 불가' }}
                      </v-chip>
                    </div>
                  </v-col>
                </v-row>
              </div>
            </v-card-text>
          </v-card>
        </v-tabs-window-item>
      </v-tabs-window>
    </div>

    <!-- 매장 등록/수정 다이얼로그 -->
    <v-dialog
      v-model="showCreateDialog"
      max-width="800"
      persistent
      scrollable
    >
      <v-card>
        <v-card-title class="pa-4">
          <span class="text-h6">{{ editMode ? '매장 정보 수정' : '매장 정보 등록' }}</span>
          <v-spacer />
          <v-btn
            icon
            @click="closeDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-6" style="max-height: 500px;">
          <v-form ref="storeForm" v-model="formValid">
            <v-row>
              <!-- 매장 이미지 -->
              <v-col cols="12">
                <h4 class="text-subtitle-1 font-weight-bold mb-3">매장 이미지</h4>
                <div class="text-center mb-4">
                  <v-avatar size="120" class="mb-3">
                    <v-img
                      :src="formData.imageUrl || '/images/store-placeholder.png'"
                      alt="매장 이미지"
                    />
                  </v-avatar>
                  <br>
                  <v-btn
                    color="primary"
                    variant="outlined"
                    prepend-icon="mdi-camera"
                    @click="selectImage"
                  >
                    이미지 선택
                  </v-btn>
                  <input
                    ref="imageInput"
                    type="file"
                    accept="image/*"
                    style="display: none;"
                    @change="handleImageUpload"
                  >
                </div>
              </v-col>

              <!-- 기본 정보 -->
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.storeName"
                  label="매장명 *"
                  variant="outlined"
                  :rules="[v => !!v || '매장명을 입력해주세요']"
                  required
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-select
                  v-model="formData.businessType"
                  label="업종 *"
                  variant="outlined"
                  :items="businessTypes"
                  :rules="[v => !!v || '업종을 선택해주세요']"
                  required
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.ownerName"
                  label="사업자명 *"
                  variant="outlined"
                  :rules="[v => !!v || '사업자명을 입력해주세요']"
                  required
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.businessNumber"
                  label="사업자등록번호 *"
                  variant="outlined"
                  :rules="businessNumberRules"
                  required
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="formData.address"
                  label="주소 *"
                  variant="outlined"
                  :rules="[v => !!v || '주소를 입력해주세요']"
                  required
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.phoneNumber"
                  label="연락처 *"
                  variant="outlined"
                  :rules="phoneRules"
                  required
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="formData.seatCount"
                  label="좌석 수"
                  variant="outlined"
                  type="number"
                  min="0"
                />
              </v-col>

              <!-- SNS 정보 -->
              <v-col cols="12">
                <h4 class="text-subtitle-1 font-weight-bold mb-3">SNS 계정 정보</h4>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.instagramUrl"
                  label="Instagram URL"
                  variant="outlined"
                  prepend-inner-icon="mdi-instagram"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.blogUrl"
                  label="네이버 블로그 URL"
                  variant="outlined"
                  prepend-inner-icon="mdi-blogger"
                />
              </v-col>

              <!-- 운영 설정 -->
              <v-col cols="12">
                <h4 class="text-subtitle-1 font-weight-bold mb-3">운영 설정</h4>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.openTime"
                  label="오픈 시간"
                  variant="outlined"
                  type="time"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.closeTime"
                  label="마감 시간"
                  variant="outlined"
                  type="time"
                />
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="formData.holidays"
                  label="휴무일"
                  variant="outlined"
                  :items="daysOfWeek"
                  multiple
                  chips
                  closable-chips
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-switch
                  v-model="formData.deliveryAvailable"
                  label="배달 서비스 이용 가능"
                  color="primary"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-switch
                  v-model="formData.takeoutAvailable"
                  label="포장 서비스 이용 가능"
                  color="primary"
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
            variant="text"
            @click="closeDialog"
          >
            취소
          </v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            :disabled="!formValid"
            @click="saveStore"
          >
            {{ editMode ? '수정하기' : '등록하기' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 로딩 오버레이 -->
    <v-overlay v-if="storeStore.loading" class="align-center justify-center">
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      />
    </v-overlay>

    <!-- 스낵바 -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="top"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStoreStore, useAppStore } from '@/store/index'

const storeStore = useStoreStore()
const appStore = useAppStore()

// 반응형 데이터
const currentTab = ref('basic')
const showCreateDialog = ref(false)
const editMode = ref(false)
const formValid = ref(false)
const saving = ref(false)
const imageInput = ref(null)

const snackbar = reactive({
  show: false,
  message: '',
  color: 'success'
})

// 폼 데이터
const formData = reactive({
  storeName: '',
  businessType: '',
  ownerName: '',
  businessNumber: '',
  address: '',
  phoneNumber: '',
  seatCount: 0,
  instagramUrl: '',
  blogUrl: '',
  openTime: '09:00',
  closeTime: '21:00',
  holidays: [],
  deliveryAvailable: false,
  takeoutAvailable: true,
  imageUrl: ''
})

// 컴퓨티드 속성
const storeInfo = computed(() => storeStore.storeInfo || {})

// 옵션 데이터
const businessTypes = [
  '한식',
  '중식',
  '일식',
  '양식',
  '분식',
  '치킨',
  '피자',
  '카페',
  '베이커리',
  '기타'
]

const daysOfWeek = [
  { text: '월요일', value: 'monday' },
  { text: '화요일', value: 'tuesday' },
  { text: '수요일', value: 'wednesday' },
  { text: '목요일', value: 'thursday' },
  { text: '금요일', value: 'friday' },
  { text: '토요일', value: 'saturday' },
  { text: '일요일', value: 'sunday' }
]

// 유효성 검사 규칙
const businessNumberRules = [
  v => !!v || '사업자등록번호를 입력해주세요',
  v => /^\d{3}-\d{2}-\d{5}$/.test(v) || '올바른 사업자등록번호 형식이 아닙니다 (예: 123-45-67890)'
]

const phoneRules = [
  v => !!v || '연락처를 입력해주세요',
  v => /^[\d-+().\s]+$/.test(v) || '올바른 전화번호 형식이 아닙니다'
]

// 메서드
const editBasicInfo = () => {
  editMode.value = true
  Object.assign(formData, storeInfo.value)
  showCreateDialog.value = true
}

const editOperationInfo = () => {
  editMode.value = true
  Object.assign(formData, storeInfo.value)
  currentTab.value = 'operation'
  showCreateDialog.value = true
}

const closeDialog = () => {
  showCreateDialog.value = false
  editMode.value = false
  resetForm()
}

const resetForm = () => {
  Object.assign(formData, {
    storeName: '',
    businessType: '',
    ownerName: '',
    businessNumber: '',
    address: '',
    phoneNumber: '',
    seatCount: 0,
    instagramUrl: '',
    blogUrl: '',
    openTime: '09:00',
    closeTime: '21:00',
    holidays: [],
    deliveryAvailable: false,
    takeoutAvailable: true,
    imageUrl: ''
  })
}

const selectImage = () => {
  imageInput.value?.click()
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.imageUrl = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const saveStore = async () => {
  if (!formValid.value) return

  try {
    saving.value = true
    
    if (editMode.value) {
      await storeStore.updateStoreInfo(formData)
      snackbar.message = '매장 정보가 수정되었습니다'
    } else {
      await storeStore.createStoreInfo(formData)
      snackbar.message = '매장 정보가 등록되었습니다'
    }
    
    snackbar.color = 'success'
    snackbar.show = true
    closeDialog()
  } catch (error) {
    snackbar.message = error.response?.data?.message || '저장 중 오류가 발생했습니다'
    snackbar.color = 'error'
    snackbar.show = true
  } finally {
    saving.value = false
  }
}

const getOperatingHours = (day) => {
  if (storeInfo.value.holidays?.includes(day)) {
    return '휴무'
  }
  return `${storeInfo.value.openTime || '09:00'} - ${storeInfo.value.closeTime || '21:00'}`
}

// 라이프사이클
onMounted(async () => {
  try {
    await storeStore.fetchStoreInfo()
  } catch (error) {
    console.error('매장 정보 로드 실패:', error)
  }
})
</script>

<style scoped>
.bg-grey-lighten-5 {
  background-color: #fafafa !important;
}

@media (max-width: 600px) {
  .text-h4 {
    font-size: 1.5rem !important;
  }
}
</style>