//* src/router/index.js
/**
 * Vue Router 설정
 * 라우팅 및 네비게이션 가드 설정
 */
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
    redirect: '/login', // 항상 로그인 페이지로 먼저 리다이렉트
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
      title: '대시보드',
    },
  },
  {
    path: '/store',
    name: 'StoreManagement',
    component: StoreManagementView,
    meta: {
      requiresAuth: true,
      title: '매장 관리',
    },
  },
  {
    path: '/content/create',
    name: 'ContentCreation',
    component: ContentCreationView,
    meta: {
      requiresAuth: true,
      title: '콘텐츠 생성',
    },
  },
  {
    path: '/content',
    name: 'ContentManagement',
    component: ContentManagementView,
    meta: {
      requiresAuth: true,
      title: '콘텐츠 관리',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login', // 404시 로그인으로 이동
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 네비게이션 가드 - 수정된 버전
router.beforeEach(async (to, from, next) => {
  console.log('=== 라우터 가드 실행 ===')
  console.log('이동 경로:', `${from.path} → ${to.path}`)

  // Pinia 스토어를 동적으로 가져오기 (순환 참조 방지)
  const { useAuthStore } = await import('@/store/auth')
  const authStore = useAuthStore()

  // 인증 상태 확인
  authStore.checkAuthState()

  console.log('현재 인증 상태:', authStore.isAuthenticated)
  console.log('토큰 존재:', !!authStore.token)
  console.log('사용자 정보:', authStore.user?.nickname)

  // 인증이 필요한 페이지인지 확인
  const requiresAuth = to.meta.requiresAuth !== false

  if (requiresAuth && !authStore.isAuthenticated) {
    console.log('인증 필요 - 로그인 페이지로 이동')
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    console.log('이미 로그인됨 - 대시보드로 이동')
    next('/dashboard')
  } else {
    console.log('이동 허용:', to.path)
    next()
  }
})

router.afterEach((to) => {
  // 페이지 타이틀 설정
  document.title = to.meta.title ? `${to.meta.title} - AI 마케팅` : 'AI 마케팅'
})

export default router
