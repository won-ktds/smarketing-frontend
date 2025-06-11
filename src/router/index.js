//* src/router/index.js
/**
 * Vue Router 설정
 * 라우팅 및 네비게이션 가드 설정
 */
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'

// 뷰 컴포넌트 lazy loading
const LoginView = () => import('@/views/LoginView.vue')
const DashboardView = () => import('@/views/DashboardView.vue')
const StoreManagementView = () => import('@/views/StoreManagementView.vue')
const MenuManagementView = () => import('@/views/MenuManagementView.vue')
const ContentCreationView = () => import('@/views/ContentCreationView.vue')
const ContentManagementView = () => import('@/views/ContentManagementView.vue')
const AIRecommendationView = () => import('@/views/AIRecommendationView.vue')
const SalesAnalysisView = () => import('@/views/SalesAnalysisView.vue')

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { 
      requiresAuth: false,
      title: '로그인'
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: { 
      requiresAuth: true,
      title: '대시보드'
    }
  },
  {
    path: '/store',
    name: 'StoreManagement',
    component: StoreManagementView,
    meta: { 
      requiresAuth: true,
      title: '매장 관리'
    }
  },
  {
    path: '/menu',
    name: 'MenuManagement',
    component: MenuManagementView,
    meta: { 
      requiresAuth: true,
      title: '메뉴 관리'
    }
  },
  {
    path: '/content/create',
    name: 'ContentCreation',
    component: ContentCreationView,
    meta: { 
      requiresAuth: true,
      title: '콘텐츠 생성'
    }
  },
  {
    path: '/content',
    name: 'ContentManagement',
    component: ContentManagementView,
    meta: { 
      requiresAuth: true,
      title: '콘텐츠 관리'
    }
  },
  {
    path: '/ai-recommend',
    name: 'AIRecommendation',
    component: AIRecommendationView,
    meta: { 
      requiresAuth: true,
      title: 'AI 추천'
    }
  },
  {
    path: '/sales',
    name: 'SalesAnalysis',
    component: SalesAnalysisView,
    meta: { 
      requiresAuth: true,
      title: '매출 분석'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 네비게이션 가드
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 인증이 필요한 페이지인지 확인
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // 토큰이 있다면 사용자 정보 재검증
      if (authStore.token) {
        try {
          await authStore.refreshUserInfo()
          next()
        } catch (error) {
          authStore.clearAuth()
          next('/login')
        }
      } else {
        next('/login')
      }
    } else {
      next()
    }
  } else {
    // 로그인 페이지에 이미 인증된 사용자가 접근하는 경우
    if (to.name === 'Login' && authStore.isAuthenticated) {
      next('/dashboard')
    } else {
      next()
    }
  }
})

export default router