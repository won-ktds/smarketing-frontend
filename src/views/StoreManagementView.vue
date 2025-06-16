//* src/views/StoreManagementView.vue - 데모 기능 제거 및 백엔드 연동 수정

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
                @click="showCreateDialog = true"
              >
                매장 정보 등록하기
              </v-btn>
              <!-- 데모 매장 정보 버튼 제거 -->
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
                        <v-icon class="mr-2" color="grey">mdi-account</v-icon>
                        <div>
                          <div class="text-caption text-grey">사업자명</div>
                          <div class="text-body-1">{{ storeInfo.ownerName || '미입력' }}</div>
                        </div>
                      </div>
                    </v-col>
                    
                    <v-col cols="12" sm="6">
                      <div class="info-item">
                        <v-icon class="mr-2" color="grey">mdi-card-account-details</v-icon>
                        <div>
                          <div class="text-caption text-grey">사업자등록번호</div>
                          <div class="text-body-1">{{ storeInfo.businessNumber || '미입력' }}</div>
                        </div>
                      </div>
                    </v-col>
                    
                    <v-col cols="12">
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
                        <v-icon class="mr-2" color="grey">mdi-chair-rolling</v-icon>
                        <div>
                          <div class="text-caption text-grey">좌석 수</div>
                          <div class="text-body-1">{{ storeInfo.seatCount || 0 }}석</div>
                        </div>
                      </div>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>

              <!-- 운영 정보 -->
              <v-divider class="my-6" />
              
              <h4 class="text-h6 font-weight-bold mb-4">
                <v-icon class="mr-2" color="primary">mdi-clock</v-icon>
                운영 정보
              </h4>
              
              <v-row>
                <v-col cols="12" sm="6">
                  <div class="info-item">
                    <v-icon class="mr-2" color="grey">mdi-clock-start</v-icon>
                    <div>
                      <div class="text-caption text-grey">영업시간</div>
                      <div class="text-body-1">
                        {{ storeInfo.businessHours || `${storeInfo.openTime || '09:00'} - ${storeInfo.closeTime || '21:00'}` }}
                      </div>
                    </div>
                  </div>
                </v-col>
                
                <v-col cols="12" sm="6">
                  <div class="info-item">
                    <v-icon class="mr-2" color="grey">mdi-calendar-remove</v-icon>
                    <div>
                      <div class="text-caption text-grey">휴무일</div>
                      <div class="text-body-1">
                        {{ formatClosedDays(storeInfo.closedDays || storeInfo.holidays) }}
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
                        {{ getSnsAccount('instagram') || '미연동' }}
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
                        {{ getSnsAccount('blog') || '미연동' }}
                      </div>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-tabs-window-item>

        <!-- 메뉴 관리 탭 (기존 코드 유지) -->
        <v-tabs-window-item value="menu">
          <!-- 메뉴 관리 내용은 기존과 동일하게 유지 -->
          <v-card elevation="2">
            <v-card-title class="pa-4">메뉴 관리</v-card-title>
            <!-- 메뉴 관리 내용... -->
          </v-card>
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

    <!-- 스낵바 -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="bottom"
    >
      {{ snackbar.message }}
    </v-snackbar>
    
    <!-- 매장 등록/수정 다이얼로그는 기존과 동일 -->
    <!-- ... -->
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStoreStore } from '@/store/index'

const storeStore = useStoreStore()

// 기존 상태들...
const currentTab = ref('basic')
const showCreateDialog = ref(false)
const editMode = ref(false)
const formValid = ref(false)
const saving = ref(false)
const imageInput = ref(null)
const storeForm = ref(null)

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// 기존 폼 데이터들...
const formData = ref({
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

const getSnsAccount = (platform) => {
  const snsAccounts = storeInfo.value.snsAccounts
  
  if (!snsAccounts) return null
  
  if (typeof snsAccounts === 'string') {
    try {
      const parsed = JSON.parse(snsAccounts)
      return parsed[platform]
    } catch {
      return null
    }
  }
  
  if (typeof snsAccounts === 'object') {
    return snsAccounts[platform]
  }
  
  return null
}

const showSnackbar = (message, color = 'success') => {
  snackbar.value.message = message
  snackbar.value.color = color
  snackbar.value.show = true
}

/**
 * 컴포넌트 마운트 시 실행 (데모 기능 제거, 백엔드 연동만)
 */
onMounted(async () => {
  console.log('=== StoreManagementView 마운트됨 ===')
  
  try {
    // 매장 정보 조회
    const result = await storeStore.fetchStoreInfo()
    
    console.log('매장 정보 조회 결과:', result)
    
    if (result.success) {
      console.log('✅ 매장 정보 로드 완료:', result.data)
      showSnackbar('매장 정보를 불러왔습니다', 'success')
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

// 기존 메서드들 유지 (데모 데이터 로드 함수만 제거)
// loadDemoStoreData 함수 제거

// 나머지 함수들은 기존과 동일하게 유지...
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