<template>
  <v-container fluid class="pa-4">
    <!-- 페이지 헤더 -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">메뉴 관리</h1>
            <p class="text-grey">매장의 메뉴를 등록하고 관리할 수 있습니다</p>
          </div>
          <v-btn
            color="primary"
            size="large"
            prepend-icon="mdi-plus"
            @click="openCreateDialog"
          >
            메뉴 추가
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- 검색 및 필터 -->
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="searchQuery"
          label="메뉴 검색"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          clearable
          hide-details
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="selectedCategory"
          label="카테고리"
          variant="outlined"
          :items="categories"
          clearable
          hide-details
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select
          v-model="sortBy"
          label="정렬"
          variant="outlined"
          :items="sortOptions"
          hide-details
        />
      </v-col>
    </v-row>

    <!-- 메뉴가 없는 경우 -->
    <div v-if="filteredMenus.length === 0 && !menuStore.loading">
      <v-row justify="center">
        <v-col cols="12" md="8">
          <v-card class="text-center pa-8" elevation="4">
            <v-img
              src="/images/menu-placeholder.png"
              max-width="200"
              class="mx-auto mb-4"
            />
            <h2 class="text-h5 font-weight-bold mb-3">첫 메뉴를 등록해보세요!</h2>
            <p class="text-grey mb-4">
              메뉴를 등록하면 AI가 더 정확한 마케팅 콘텐츠를 생성할 수 있습니다
            </p>
            <v-btn
              color="primary"
              size="large"
              prepend-icon="mdi-food-apple"
              @click="openCreateDialog"
            >
              메뉴 등록하기
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- 메뉴 목록 -->
    <div v-else>
      <!-- 메뉴 통계 -->
      <v-row class="mb-4">
        <v-col cols="6" sm="3">
          <v-card elevation="2" class="text-center pa-4">
            <h3 class="text-h4 font-weight-bold text-primary">{{ menuStore.totalCount }}</h3>
            <p class="text-caption text-grey">전체 메뉴</p>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3">
          <v-card elevation="2" class="text-center pa-4">
            <h3 class="text-h4 font-weight-bold text-success">{{ availableMenuCount }}</h3>
            <p class="text-caption text-grey">판매중</p>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3">
          <v-card elevation="2" class="text-center pa-4">
            <h3 class="text-h4 font-weight-bold text-info">{{ categoriesCount }}</h3>
            <p class="text-caption text-grey">카테고리</p>
          </v-card>
        </v-col>
        <v-col cols="6" sm="3">
          <v-card elevation="2" class="text-center pa-4">
            <h3 class="text-h4 font-weight-bold text-warning">{{ formatCurrency(averagePrice) }}</h3>
            <p class="text-caption text-grey">평균 가격</p>
          </v-card>
        </v-col>
      </v-row>

      <!-- 메뉴 그리드 -->
      <v-row>
        <v-col
          v-for="menu in filteredMenus"
          :key="menu.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card elevation="2" class="h-100">
            <!-- 메뉴 이미지 -->
            <v-img
              :src="menu.imageUrl || '/images/menu-placeholder.png'"
              :alt="menu.menuName"
              height="200"
              cover
            >
              <div class="d-flex pa-2">
                <v-spacer />
                <v-chip
                  :color="menu.available ? 'success' : 'error'"
                  size="small"
                  variant="elevated"
                >
                  {{ menu.available ? '판매중' : '품절' }}
                </v-chip>
              </div>
            </v-img>

            <!-- 메뉴 정보 -->
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-2">
                <v-chip
                  :color="getCategoryColor(menu.category)"
                  size="small"
                  variant="tonal"
                >
                  {{ menu.category }}
                </v-chip>
                <div class="d-flex">
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    @click="editMenu(menu)"
                  >
                    <v-icon size="20">mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    color="error"
                    @click="confirmDelete(menu)"
                  >
                    <v-icon size="20">mdi-delete</v-icon>
                  </v-btn>
                </div>
              </div>

              <h3 class="text-h6 font-weight-bold mb-2">{{ menu.menuName }}</h3>
              <p class="text-body-2 text-grey mb-3" style="min-height: 40px;">
                {{ menu.description || '메뉴 설명이 없습니다' }}
              </p>
              
              <div class="d-flex align-center justify-space-between">
                <span class="text-h6 font-weight-bold text-primary">
                  {{ formatCurrency(menu.price) }}
                </span>
                <v-rating
                  :model-value="menu.rating || 0"
                  readonly
                  size="small"
                  color="warning"
                  density="compact"
                />
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- 메뉴 등록/수정 다이얼로그 -->
    <v-dialog
      v-model="showMenuDialog"
      max-width="600"
      persistent
      scrollable
    >
      <v-card>
        <v-card-title class="pa-4">
          <span class="text-h6">{{ editMode ? '메뉴 수정' : '메뉴 등록' }}</span>
          <v-spacer />
          <v-btn
            icon
            @click="closeMenuDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-6" style="max-height: 500px;">
          <v-form ref="menuForm" v-model="menuFormValid">
            <!-- 메뉴 이미지 -->
            <div class="text-center mb-6">
              <v-img
                :src="menuFormData.imageUrl || '/images/menu-placeholder.png'"
                :alt="menuFormData.menuName"
                max-width="200"
                max-height="150"
                class="mx-auto mb-3 rounded"
              />
              <v-btn
                color="primary"
                variant="outlined"
                prepend-icon="mdi-camera"
                @click="selectMenuImage"
              >
                이미지 선택
              </v-btn>
              <input
                ref="menuImageInput"
                type="file"
                accept="image/*"
                style="display: none;"
                @change="handleMenuImageUpload"
              >
            </div>

            <v-row>
              <v-col cols="12" sm="8">
                <v-text-field
                  v-model="menuFormData.menuName"
                  label="메뉴명 *"
                  variant="outlined"
                  :rules="[v => !!v || '메뉴명을 입력해주세요']"
                  required
                />
              </v-col>

              <v-col cols="12" sm="4">
                <v-text-field
                  v-model.number="menuFormData.price"
                  label="가격 *"
                  variant="outlined"
                  type="number"
                  prefix="₩"
                  :rules="priceRules"
                  required
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-combobox
                  v-model="menuFormData.category"
                  label="카테고리 *"
                  variant="outlined"
                  :items="categories"
                  :rules="[v => !!v || '카테고리를 선택해주세요']"
                  required
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-switch
                  v-model="menuFormData.available"
                  label="판매 가능"
                  color="primary"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="menuFormData.description"
                  label="메뉴 설명"
                  variant="outlined"
                  rows="3"
                  counter="200"
                  :rules="[v => !v || v.length <= 200 || '200자 이내로 입력해주세요']"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="menuFormData.ingredients"
                  label="주요 재료"
                  variant="outlined"
                  hint="쉼표로 구분하여 입력"
                  persistent-hint
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-select
                  v-model="menuFormData.spicyLevel"
                  label="매운맛 정도"
                  variant="outlined"
                  :items="spicyLevels"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="menuFormData.calories"
                  label="칼로리"
                  variant="outlined"
                  type="number"
                  suffix="kcal"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-switch
                  v-model="menuFormData.recommended"
                  label="추천 메뉴"
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
            @click="closeMenuDialog"
          >
            취소
          </v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            :disabled="!menuFormValid"
            @click="saveMenu"
          >
            {{ editMode ? '수정하기' : '등록하기' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 삭제 확인 다이얼로그 -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">메뉴 삭제</v-card-title>
        <v-card-text>
          <p>정말로 <strong>{{ deleteTarget?.menuName }}</strong> 메뉴를 삭제하시겠습니까?</p>
          <v-alert type="warning" variant="tonal" class="mt-3">
            삭제된 메뉴는 복구할 수 없습니다.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="showDeleteDialog = false"
          >
            취소
          </v-btn>
          <v-btn
            color="error"
            :loading="deleting"
            @click="deleteMenu"
          >
            삭제
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 로딩 오버레이 -->
    <v-overlay v-if="menuStore.loading" class="align-center justify-center">
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
import { useMenuStore, useAppStore } from '@/store/index'
import { formatCurrency } from '@/utils/formatters'

const menuStore = useMenuStore()
const appStore = useAppStore()

// 반응형 데이터
const searchQuery = ref('')
const selectedCategory = ref('')
const sortBy = ref('name')
const showMenuDialog = ref(false)
const showDeleteDialog = ref(false)
const editMode = ref(false)
const menuFormValid = ref(false)
const saving = ref(false)
const deleting = ref(false)
const deleteTarget = ref(null)
const menuImageInput = ref(null)

const snackbar = reactive({
  show: false,
  message: '',
  color: 'success'
})

// 메뉴 폼 데이터
const menuFormData = reactive({
  menuName: '',
  price: 0,
  category: '',
  description: '',
  ingredients: '',
  spicyLevel: '보통',
  calories: 0,
  available: true,
  recommended: false,
  imageUrl: ''
})

// 옵션 데이터
const categories = computed(() => {
  const menuCategories = menuStore.menus.map(menu => menu.category)
  const defaultCategories = ['면류', '튀김류', '음료', '안주', '디저트']
  return [...new Set([...defaultCategories, ...menuCategories])]
})

const sortOptions = [
  { title: '이름순', value: 'name' },
  { title: '가격 낮은순', value: 'price_asc' },
  { title: '가격 높은순', value: 'price_desc' },
  { title: '추천순', value: 'recommended' }
]

const spicyLevels = ['안매움', '조금매움', '보통', '매움', '아주매움']

// 유효성 검사 규칙
const priceRules = [
  v => !!v || '가격을 입력해주세요',
  v => v > 0 || '0원보다 큰 가격을 입력해주세요'
]

// 컴퓨티드 속성
const filteredMenus = computed(() => {
  let filtered = menuStore.menus

  // 검색 필터
  if (searchQuery.value) {
    filtered = filtered.filter(menu =>
      menu.menuName.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // 카테고리 필터
  if (selectedCategory.value) {
    filtered = filtered.filter(menu => menu.category === selectedCategory.value)
  }

  // 정렬
  switch (sortBy.value) {
    case 'name':
      filtered.sort((a, b) => a.menuName.localeCompare(b.menuName))
      break
    case 'price_asc':
      filtered.sort((a, b) => a.price - b.price)
      break
    case 'price_desc':
      filtered.sort((a, b) => b.price - a.price)
      break
    case 'recommended':
      filtered.sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0))
      break
  }

  return filtered
})

const availableMenuCount = computed(() => 
  menuStore.menus.filter(menu => menu.available).length
)

const categoriesCount = computed(() => 
  new Set(menuStore.menus.map(menu => menu.category)).size
)

const averagePrice = computed(() => {
  if (menuStore.menus.length === 0) return 0
  const total = menuStore.menus.reduce((sum, menu) => sum + menu.price, 0)
  return Math.round(total / menuStore.menus.length)
})

// 메서드
const getCategoryColor = (category) => {
  const colors = {
    '면류': 'orange',
    '튀김류': 'red',
    '음료': 'blue',
    '안주': 'purple',
    '디저트': 'pink'
  }
  return colors[category] || 'grey'
}

const openCreateDialog = () => {
  editMode.value = false
  resetMenuForm()
  showMenuDialog.value = true
}

const editMenu = (menu) => {
  editMode.value = true
  Object.assign(menuFormData, menu)
  showMenuDialog.value = true
}

const closeMenuDialog = () => {
  showMenuDialog.value = false
  resetMenuForm()
}

const resetMenuForm = () => {
  Object.assign(menuFormData, {
    menuName: '',
    price: 0,
    category: '',
    description: '',
    ingredients: '',
    spicyLevel: '보통',
    calories: 0,
    available: true,
    recommended: false,
    imageUrl: ''
  })
}

const selectMenuImage = () => {
  menuImageInput.value?.click()
}

const handleMenuImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      menuFormData.imageUrl = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const saveMenu = async () => {
  if (!menuFormValid.value) return

  try {
    saving.value = true
    
    if (editMode.value) {
      await menuStore.updateMenu(menuFormData.id, menuFormData)
      snackbar.message = '메뉴가 수정되었습니다'
    } else {
      await menuStore.createMenu(menuFormData)
      snackbar.message = '메뉴가 등록되었습니다'
    }
    
    snackbar.color = 'success'
    snackbar.show = true
    closeMenuDialog()
  } catch (error) {
    snackbar.message = error.response?.data?.message || '저장 중 오류가 발생했습니다'
    snackbar.color = 'error'
    snackbar.show = true
  } finally {
    saving.value = false
  }
}

const confirmDelete = (menu) => {
  deleteTarget.value = menu
  showDeleteDialog.value = true
}

const deleteMenu = async () => {
  if (!deleteTarget.value) return

  try {
    deleting.value = true
    await menuStore.deleteMenu(deleteTarget.value.id)
    
    snackbar.message = '메뉴가 삭제되었습니다'
    snackbar.color = 'success'
    snackbar.show = true
    
    showDeleteDialog.value = false
    deleteTarget.value = null
  } catch (error) {
    snackbar.message = error.response?.data?.message || '삭제 중 오류가 발생했습니다'
    snackbar.color = 'error'
    snackbar.show = true
  } finally {
    deleting.value = false
  }
}

// 라이프사이클
onMounted(async () => {
  try {
    await menuStore.fetchMenus()
  } catch (error) {
    console.error('메뉴 목록 로드 실패:', error)
  }
})
</script>

<style scoped>
.h-100 {
  height: 100%;
}

@media (max-width: 600px) {
  .text-h4 {
    font-size: 1.5rem !important;
  }
}
</style>