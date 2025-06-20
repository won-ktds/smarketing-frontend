// src/router/index.js - 완전히 수정된 버전

import { createRouter, createWebHistory } from 'vue-router'

// 뷰 컴포넌트 lazy loading
const LoginView = () => import('@/views/LoginView.vue')
const DashboardView = () => import('@/views/DashboardView.vue')
const StoreManagementView = () => import('@/views/StoreManagementView.vue')
const ContentCreationView = () => import('@/views/ContentCreationView.vue')
const ContentManagementView = () => import('@/views/ContentManagementView.vue')

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: {
      requiresAuth: false,
      title: '로그인',
    },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: {
      requiresAuth: true,
      requiresStore: true, // ✅ 매장 정보 필수
      title: '대시보드',
    },
  },
  {
    path: '/store',
    name: 'StoreManagement',
    component: StoreManagementView,
    meta: {
      requiresAuth: true,
      requiresStore: false, // ✅ 매장 정보 없어도 접근 가능
      title: '매장 관리',
    },
  },
  {
    path: '/content/create',
    name: 'ContentCreation',
    component: ContentCreationView,
    meta: {
      requiresAuth: true,
      requiresStore: true, // ✅ 매장 정보 필수
      title: '콘텐츠 생성',
    },
  },
  {
    path: '/content',
    name: 'ContentManagement',
    component: ContentManagementView,
    meta: {
      requiresAuth: true,
      requiresStore: true, // ✅ 매장 정보 필수
      title: '콘텐츠 관리',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// ✅ 개선된 네비게이션 가드
router.beforeEach(async (to, from, next) => {
  console.log('=== 라우터 가드 실행 ===')
  console.log('이동 경로:', `${from.path} → ${to.path}`)

  // Pinia 스토어를 동적으로 가져오기
  const { useAuthStore } = await import('@/store/auth')
  const authStore = useAuthStore()

  // 인증 상태 확인
  authStore.checkAuthState()

  console.log('현재 인증 상태:', authStore.isAuthenticated)
  console.log('토큰 존재:', !!authStore.token)
  console.log('사용자 정보:', authStore.user?.nickname)

  // 1단계: 인증 체크
  const requiresAuth = to.meta.requiresAuth !== false

  if (requiresAuth && !authStore.isAuthenticated) {
    console.log('🚫 인증 필요 - 로그인 페이지로 이동')
    next('/login')
    return
  }

  if (to.path === '/login' && authStore.isAuthenticated) {
    console.log('✅ 이미 로그인됨 - 매장 정보 체크 후 리다이렉트')
    
    // 로그인 상태에서 /login 접근 시 매장 정보에 따라 리다이렉트
    try {
      const { useStoreStore } = await import('@/store/index')
      const storeStore = useStoreStore()
      const result = await storeStore.fetchStoreInfo()
      
      if (result.success && result.data) {
        console.log('🏪 매장 정보 있음 - 대시보드로 이동')
        next('/dashboard')
      } else {
        console.log('📝 매장 정보 없음 - 매장 관리로 이동')
        next('/store')
      }
    } catch (error) {
      console.log('❌ 매장 정보 조회 실패 - 매장 관리로 이동')
      next('/store')
    }
    return
  }

  // 2단계: 매장 정보 체크 (인증된 사용자만)
  const requiresStore = to.meta.requiresStore === true

  if (authStore.isAuthenticated && requiresStore) {
    console.log('🏪 매장 정보 체크 필요한 페이지:', to.name)
    
    try {
      const { useStoreStore } = await import('@/store/index')
      const storeStore = useStoreStore()
      
      // 매장 정보 조회
      const result = await storeStore.fetchStoreInfo()
      
      if (!result.success || !result.data) {
        console.log('🚫 매장 정보 없음 - 매장 관리 페이지로 리다이렉트')
        
        // 사용자에게 알림 (스낵바)
        const { useAppStore } = await import('@/store/app')
        const appStore = useAppStore()
        appStore.showSnackbar('매장 정보를 먼저 등록해주세요', 'warning')
        
        next('/store')
        return
      } else {
        console.log('✅ 매장 정보 확인됨 - 페이지 접근 허용')
      }
    } catch (error) {
      console.log('❌ 매장 정보 조회 실패 - 매장 관리 페이지로 리다이렉트')
      
      // 에러 시에도 매장 관리로
      const { useAppStore } = await import('@/store/app')
      const appStore = useAppStore()
      appStore.showSnackbar('매장 정보를 확인할 수 없습니다. 매장 정보를 등록해주세요', 'error')
      
      next('/store')
      return
    }
  }

  console.log('✅ 이동 허용:', to.path)
  next()
})

router.afterEach((to) => {
  // 페이지 타이틀 설정
  document.title = to.meta.title ? `${to.meta.title} - AI 마케팅` : 'AI 마케팅'
})

export default router