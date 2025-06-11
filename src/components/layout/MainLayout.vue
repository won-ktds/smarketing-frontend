//* src/components/layout/MainLayout.vue
<template>
  <v-app>
    <!-- 메인 네비게이션 (데스크톱용 사이드바) -->
    <Sidebar
      v-if="!isMobile"
      v-model="drawer"
      :rail="rail"
      :permanent="!isMobile"
      :temporary="isMobile"
      :menu-groups="menuGroups"
      :user-name="userStore.user?.name || '사용자'"
      :business-name="userStore.user?.businessName || ''"
      :user-avatar="userStore.user?.avatar || ''"
      @menu-click="handleMenuClick"
      @action-click="handleSidebarAction"
      @update:rail="rail = $event"
    />

    <!-- 모바일용 임시 사이드바 -->
    <Sidebar
      v-if="isMobile"
      v-model="drawer"
      :temporary="true"
      :menu-groups="menuGroups"
      :user-name="userStore.user?.name || '사용자'"
      :business-name="userStore.user?.businessName || ''"
      :user-avatar="userStore.user?.avatar || ''"
      @menu-click="handleMenuClick"
      @action-click="handleSidebarAction"
    />

    <!-- 상단 앱바 -->
    <AppHeader
      v-if="showHeader"
      :title="currentPageTitle"
      :show-back-button="showBackButton"
      :show-menu-button="isMobile"
      :show-user-menu="!isMobile"
      :actions="headerActions"
      :user-name="userStore.user?.name || '사용자'"
      :user-email="userStore.user?.email || ''"
      :user-avatar="userStore.user?.avatar || ''"
      @toggle-drawer="drawer = !drawer"
      @back-click="handleBackClick"
      @action-click="handleHeaderAction"
      @user-menu-click="handleUserMenuClick"
    />

    <!-- 메인 컨텐츠 -->
    <v-main :class="mainClass">
      <v-container 
        :fluid="fluidContainer"
        :class="containerClass"
      >
        <!-- 로딩 오버레이 -->
        <LoadingSpinner
          v-if="loading"
          overlay
          :message="loadingMessage"
          :sub-message="loadingSubMessage"
        />

        <!-- 에러 알림 -->
        <ErrorAlert
          v-if="error"
          v-model="showError"
          :type="error.type || 'error'"
          :title="error.title"
          :message="error.message"
          :details="error.details"
          :show-retry-button="error.retryable"
          @retry="handleErrorRetry"
          @close="clearError"
        />

        <!-- 페이지 컨텐츠 -->
        <router-view v-slot="{ Component, route }">
          <transition :name="pageTransition" mode="out-in">
            <component 
              :is="Component" 
              :key="route.path"
              @loading="setLoading"
              @error="setError"
            />
          </transition>
        </router-view>
      </v-container>
    </v-main>

    <!-- 하단 네비게이션 (모바일용) -->
    <BottomNavigation
      v-if="isMobile && showBottomNav"
      :navigation-items="bottomNavItems"
      :hide-on-routes="bottomNavHideRoutes"
      @nav-click="handleBottomNavClick"
    />

    <!-- 전역 스낵바 -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      :location="snackbar.location"
      :multi-line="snackbar.multiLine"
    >
      {{ snackbar.message }}
      
      <template v-slot:actions>
        <v-btn
          v-if="snackbar.action"
          variant="text"
          @click="handleSnackbarAction"
        >
          {{ snackbar.actionText }}
        </v-btn>
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="snackbar.show = false"
        />
      </template>
    </v-snackbar>

    <!-- 확인 다이얼로그 -->
    <ConfirmDialog
      v-model="confirmDialog.show"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :icon="confirmDialog.icon"
      :confirm-text="confirmDialog.confirmText"
      :cancel-text="confirmDialog.cancelText"
      :confirm-loading="confirmDialog.loading"
      @confirm="handleConfirmDialog"
      @cancel="confirmDialog.show = false"
    />
  </v-app>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'

// 컴포넌트 임포트
import AppHeader from '../common/AppHeader.vue'
import LoadingSpinner from '../common/LoadingSpinner.vue'
import ErrorAlert from '../common/ErrorAlert.vue'
import ConfirmDialog from '../common/ConfirmDialog.vue'
import Sidebar from './Sidebar.vue'
import BottomNavigation from './BottomNavigation.vue'

// 스토어 (Pinia 사용 가정)
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'

/**
 * AI 마케팅 서비스 - 메인 레이아웃 컴포넌트
 * 전체 애플리케이션의 레이아웃을 관리하는 최상위 컴포넌트
 */

// Props 정의
const props = defineProps({
  // 레이아웃 설정
  showHeader: {
    type: Boolean,
    default: true
  },
  showBottomNav: {
    type: Boolean,
    default: true
  },
  fluidContainer: {
    type: Boolean,
    default: false
  },
  pageTransition: {
    type: String,
    default: 'fade'
  },
  
  // 커스텀 클래스
  containerClass: {
    type: [String, Array, Object],
    default: 'pa-4'
  }
})

// 스토어
const userStore = useUserStore()
const appStore = useAppStore()

// 라우터
const route = useRoute()
const router = useRouter()

// Vuetify Display
const { mobile } = useDisplay()

// Reactive data
const drawer = ref(false)
const rail = ref(false)
const loading = ref(false)
const loadingMessage = ref('')
const loadingSubMessage = ref('')
const error = ref(null)
const showError = ref(false)

// 스낵바 상태
const snackbar = ref({
  show: false,
  message: '',
  color: 'info',
  timeout: 4000,
  location: 'bottom',
  multiLine: false,
  action: null,
  actionText: '확인'
})

// 확인 다이얼로그 상태
const confirmDialog = ref({
  show: false,
  title: '',
  message: '',
  icon: '',
  confirmText: '확인',
  cancelText: '취소',
  loading: false,
  callback: null
})

// Computed
const isMobile = computed(() => mobile.value)

const mainClass = computed(() => ({
  'main-content': true,
  'main-content--rail': rail.value && !isMobile.value,
  'main-content--mobile': isMobile.value
}))

const showBackButton = computed(() => {
  // 메인 페이지가 아닌 경우 뒤로가기 버튼 표시
  const mainRoutes = ['/dashboard', '/store', '/content', '/menu']
  return !mainRoutes.includes(route.path)
})

const currentPageTitle = computed(() => {
  return route.meta?.title || 'AI 마케팅'
})

const headerActions = computed(() => {
  // 라우트별 헤더 액션 버튼들
  const actions = []
  
  if (route.path.startsWith('/content')) {
    actions.push({
      id: 'add-content',
      icon: 'mdi-plus',
      text: '생성',
      color: 'white'
    })
  }
  
  // 알림 버튼
  actions.push({
    id: 'notifications',
    icon: 'mdi-bell',
    badge: true,
    badgeCount: appStore.notificationCount || 0,
    color: 'white'
  })
  
  return actions
})

// 메뉴 구성
const menuGroups = computed(() => [
  {
    title: '대시보드',
    items: [
      {
        id: 'dashboard',
        title: '홈',
        icon: 'mdi-home',
        route: '/dashboard'
      }
    ]
  },
  {
    title: '매장 관리',
    items: [
      {
        id: 'store',
        title: '매장 정보',
        icon: 'mdi-store',
        route: '/store'
      },
      {
        id: 'menu',
        title: '메뉴 관리',
        icon: 'mdi-food',
        route: '/menu'
      }
    ]
  },
  {
    title: '마케팅',
    items: [
      {
        id: 'content-create',
        title: '콘텐츠 생성',
        icon: 'mdi-plus-circle',
        route: '/content/create'
      },
      {
        id: 'content-list',
        title: '콘텐츠 목록',
        icon: 'mdi-file-document-multiple',
        route: '/content'
      },
      {
        id: 'ai-recommend',
        title: 'AI 추천',
        icon: 'mdi-robot',
        route: '/recommend'
      }
    ]
  },
  {
    title: '분석',
    items: [
      {
        id: 'sales',
        title: '매출 분석',
        icon: 'mdi-chart-line',
        route: '/sales'
      }
    ]
  }
])

// 하단 네비게이션 아이템들
const bottomNavItems = computed(() => [
  {
    id: 'dashboard',
    label: '홈',
    icon: 'mdi-home-outline',
    activeIcon: 'mdi-home',
    route: '/dashboard'
  },
  {
    id: 'store',
    label: '매장',
    icon: 'mdi-store-outline',
    activeIcon: 'mdi-store',
    route: '/store'
  },
  {
    id: 'content-create',
    label: '생성',
    icon: 'mdi-plus-circle-outline',
    activeIcon: 'mdi-plus-circle',
    route: '/content/create'
  },
  {
    id: 'content-list',
    label: '목록',
    icon: 'mdi-file-document-outline',
    activeIcon: 'mdi-file-document',
    route: '/content'
  },
  {
    id: 'more',
    label: '더보기',
    icon: 'mdi-menu',
    route: '/more'
  }
])

const bottomNavHideRoutes = ['/login', '/register']

// Methods
const setLoading = (isLoading, message = '', subMessage = '') => {
  loading.value = isLoading
  loadingMessage.value = message
  loadingSubMessage.value = subMessage
}

const setError = (errorData) => {
  error.value = errorData
  showError.value = true
}

const clearError = () => {
  error.value = null
  showError.value = false
}

const handleErrorRetry = () => {
  if (error.value?.retryCallback) {
    error.value.retryCallback()
  }
  clearError()
}

const showSnackbar = (message, options = {}) => {
  snackbar.value = {
    show: true,
    message,
    color: options.color || 'info',
    timeout: options.timeout || 4000,
    location: options.location || 'bottom',
    multiLine: options.multiLine || false,
    action: options.action || null,
    actionText: options.actionText || '확인'
  }
}

const handleSnackbarAction = () => {
  if (snackbar.value.action) {
    snackbar.value.action()
  }
  snackbar.value.show = false
}

const showConfirm = (title, message, callback, options = {}) => {
  confirmDialog.value = {
    show: true,
    title,
    message,
    icon: options.icon || 'mdi-help-circle',
    confirmText: options.confirmText || '확인',
    cancelText: options.cancelText || '취소',
    loading: false,
    callback
  }
}

const handleConfirmDialog = () => {
  if (confirmDialog.value.callback) {
    confirmDialog.value.loading = true
    
    try {
      const result = confirmDialog.value.callback()
      
      // Promise 처리
      if (result && typeof result.then === 'function') {
        result
          .then(() => {
            confirmDialog.value.show = false
            confirmDialog.value.loading = false
          })
          .catch((error) => {
            confirmDialog.value.loading = false
            setError({
              title: '오류 발생',
              message: error.message || '작업 중 오류가 발생했습니다.',
              type: 'error'
            })
          })
      } else {
        confirmDialog.value.show = false
        confirmDialog.value.loading = false
      }
    } catch (error) {
      confirmDialog.value.loading = false
      setError({
        title: '오류 발생',
        message: error.message || '작업 중 오류가 발생했습니다.',
        type: 'error'
      })
    }
  } else {
    confirmDialog.value.show = false
  }
}

const handleBackClick = () => {
  router.go(-1)
}

const handleMenuClick = (item) => {
  console.log('Menu clicked:', item)
  
  // 모바일에서는 메뉴 클릭 시 drawer 닫기
  if (isMobile.value) {
    drawer.value = false
  }
}

const handleSidebarAction = (action) => {
  switch (action.id) {
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      showConfirm(
        '로그아웃',
        '정말 로그아웃하시겠습니까?',
        () => {
          return userStore.logout().then(() => {
            router.push('/login')
            showSnackbar('로그아웃되었습니다.', { color: 'success' })
          })
        },
        { icon: 'mdi-logout' }
      )
      break
  }
}

const handleHeaderAction = (action) => {
  switch (action.id) {
    case 'add-content':
      router.push('/content/create')
      break
    case 'notifications':
      router.push('/notifications')
      break
  }
}

const handleUserMenuClick = (menuItem) => {
  switch (menuItem.id) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      handleSidebarAction({ id: 'logout' })
      break
  }
}

const handleBottomNavClick = (item) => {
  console.log('Bottom nav clicked:', item)
}

// 모바일 방향 변경 감지
const handleOrientationChange = () => {
  // 방향 변경 시 drawer 닫기
  if (isMobile.value) {
    drawer.value = false
  }
}

// 외부에서 접근 가능한 메서드들을 expose
defineExpose({
  setLoading,
  setError,
  clearError,
  showSnackbar,
  showConfirm
})

// 라이프사이클
onMounted(() => {
  // 모바일 방향 변경 리스너 등록
  window.addEventListener('orientationchange', handleOrientationChange)
  
  // 초기 사용자 정보 로드
  if (!userStore.user) {
    userStore.fetchUser().catch(error => {
      setError({
        title: '사용자 정보 로드 실패',
        message: '사용자 정보를 불러올 수 없습니다.',
        details: error.message,
        retryable: true,
        retryCallback: () => userStore.fetchUser()
      })
    })
  }
})

onUnmounted(() => {
  window.removeEventListener('orientationchange', handleOrientationChange)
})

// 라우트 변경 감지
watch(() => route.path, (newPath) => {
  // 에러 상태 초기화
  clearError()
  
  // 모바일에서 라우트 변경 시 drawer 닫기
  if (isMobile.value) {
    drawer.value = false
  }
})

// 사용자 상태 변경 감지
watch(() => userStore.isAuthenticated, (isAuth) => {
  if (!isAuth && route.meta?.requiresAuth !== false) {
    router.push('/login')
  }
})
</script>

<style scoped>
.main-content {
  transition: all 0.3s ease;
}

.main-content--rail {
  /* Rail 모드일 때 왼쪽 여백 조정 */
  margin-left: 72px;
}

.main-content--mobile {
  /* 모바일에서는 하단 네비게이션 공간 확보 */
  padding-bottom: 80px;
}

/* 페이지 전환 애니메이션 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}

/* 반응형 디자인 */
@media (max-width: 960px) {
  .main-content--rail {
    margin-left: 0;
  }
}

/* 안전 영역 지원 */
@supports (padding-top: env(safe-area-inset-top)) {
  .v-app-bar {
    padding-top: env(safe-area-inset-top);
  }
}

@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .main-content--mobile {
    padding-bottom: calc(80px + env(safe-area-inset-bottom));
  }
}