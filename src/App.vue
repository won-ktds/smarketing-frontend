//* src/App.vue
<template>
  <v-app>
    <!-- 로딩 오버레이 -->
    <v-overlay 
      v-if="loading" 
      class="align-center justify-center"
      persistent
    >
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      />
    </v-overlay>

    <!-- 메인 네비게이션 -->
    <v-navigation-drawer
      v-if="isAuthenticated && !isLoginPage"
      v-model="drawer"
      app
      temporary
      width="280"
    >
      <v-list>
        <v-list-item
          prepend-avatar="/images/logo.png"
          :title="userStore.user?.nickname || '사용자'"
          :subtitle="userStore.user?.businessName || '매장명'"
        />
      </v-list>

      <v-divider />

      <v-list nav density="compact">
        <v-list-item
          v-for="item in menuItems"
          :key="item.route"
          :to="item.route"
          :prepend-icon="item.icon"
          :title="item.title"
          exact
        />
      </v-list>

      <template v-slot:append>
        <div class="pa-4">
          <v-btn
            block
            color="primary"
            variant="outlined"
            prepend-icon="mdi-logout"
            @click="logout"
          >
            로그아웃
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- 상단 앱바 -->
    <v-app-bar
      v-if="isAuthenticated && !isLoginPage"
      app
      elevation="1"
      color="primary"
    >
      <v-app-bar-nav-icon
        @click="drawer = !drawer"
        color="white"
      />
      
      <v-toolbar-title class="text-white font-weight-bold">
        {{ currentPageTitle }}
      </v-toolbar-title>

      <v-spacer />

      <!-- 알림 버튼 -->
      <v-btn
        icon
        color="white"
        @click="showNotifications = true"
      >
        <v-badge
          v-if="notificationCount > 0"
          :content="notificationCount"
          color="error"
        >
          <v-icon>mdi-bell</v-icon>
        </v-badge>
        <v-icon v-else>mdi-bell</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- 메인 콘텐츠 -->
    <v-main>
      <router-view />
    </v-main>

    <!-- 하단 네비게이션 (모바일) -->
    <v-bottom-navigation
      v-if="isAuthenticated && !isLoginPage && $vuetify.display.mobile"
      v-model="bottomNav"
      app
      grow
      height="70"
    >
      <v-btn
        v-for="item in bottomMenuItems"
        :key="item.route"
        :to="item.route"
        :value="item.route"
        stacked
      >
        <v-icon>{{ item.icon }}</v-icon>
        <span class="text-caption">{{ item.title }}</span>
      </v-btn>
    </v-bottom-navigation>

    <!-- 알림 다이얼로그 -->
    <v-dialog
      v-model="showNotifications"
      max-width="400"
      scrollable
    >
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          알림
          <v-btn
            icon
            size="small"
            @click="showNotifications = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-divider />
        
        <v-card-text style="max-height: 400px;">
          <v-list v-if="notifications.length > 0">
            <v-list-item
              v-for="notification in notifications"
              :key="notification.id"
              :subtitle="notification.message"
              :title="notification.title"
            >
              <template v-slot:prepend>
                <v-icon :color="notification.type">
                  {{ getNotificationIcon(notification.type) }}
                </v-icon>
              </template>
            </v-list-item>
          </v-list>
          
          <div v-else class="text-center pa-4">
            <v-icon size="48" color="grey-lighten-2">mdi-bell-off</v-icon>
            <p class="text-grey mt-2">새로운 알림이 없습니다</p>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- 글로벌 스낵바 -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      location="top"
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbar.show = false"
        >
          닫기
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useAppStore } from '@/store/app'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

// 반응형 데이터
const drawer = ref(false)
const bottomNav = ref('')
const showNotifications = ref(false)
const loading = ref(false)

// 컴퓨티드 속성
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isLoginPage = computed(() => route.name === 'Login')
const userStore = computed(() => authStore)
const notificationCount = computed(() => appStore.notificationCount)
const notifications = computed(() => appStore.notifications)
const snackbar = computed(() => appStore.snackbar)

// 현재 페이지 제목
const currentPageTitle = computed(() => {
  const titles = {
    'Dashboard': '대시보드',
    'StoreManagement': '매장 관리',
    'MenuManagement': '메뉴 관리',
    'ContentCreation': '콘텐츠 생성',
    'ContentManagement': '콘텐츠 관리',
    'AIRecommendation': 'AI 추천',
    'SalesAnalysis': '매출 분석'
  }
  return titles[route.name] || 'AI 마케팅'
})

// 메뉴 아이템
const menuItems = [
  { title: '대시보드', icon: 'mdi-view-dashboard', route: '/dashboard' },
  { title: '매장 관리', icon: 'mdi-store', route: '/store' },
  { title: '메뉴 관리', icon: 'mdi-food', route: '/menu' },
  { title: '콘텐츠 생성', icon: 'mdi-plus-circle', route: '/content/create' },
  { title: '콘텐츠 관리', icon: 'mdi-folder-multiple', route: '/content' },
  { title: 'AI 추천', icon: 'mdi-robot', route: '/ai-recommend' },
  { title: '매출 분석', icon: 'mdi-chart-line', route: '/sales' }
]

const bottomMenuItems = [
  { title: '홈', icon: 'mdi-home', route: '/dashboard' },
  { title: '매장', icon: 'mdi-store', route: '/store' },
  { title: '생성', icon: 'mdi-plus-circle', route: '/content/create' },
  { title: '분석', icon: 'mdi-chart-line', route: '/sales' }
]

// 메서드
const logout = async () => {
  try {
    loading.value = true
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    appStore.showSnackbar('로그아웃 중 오류가 발생했습니다', 'error')
  } finally {
    loading.value = false
  }
}

const getNotificationIcon = (type) => {
  const icons = {
    'success': 'mdi-check-circle',
    'error': 'mdi-alert-circle',
    'warning': 'mdi-alert',
    'info': 'mdi-information'
  }
  return icons[type] || 'mdi-bell'
}

// 라이프사이클
onMounted(async () => {
  // 앱 초기화
  if (authStore.token) {
    try {
      await authStore.refreshUserInfo()
    } catch (error) {
      console.error('사용자 정보 갱신 실패:', error)
    }
  }
})

// 라우트 변경 감지
watch(route, (to) => {
  bottomNav.value = to.path
})
</script>

<style>
/* 글로벌 스타일 */
.v-application {
  font-family: 'Noto Sans KR', sans-serif !important;
}

/* 모바일 최적화 */
@media (max-width: 600px) {
  .v-toolbar-title {
    font-size: 1.1rem !important;
  }
  
  .v-navigation-drawer {
    max-width: 280px;
  }
}

/* 커스텀 스타일 */
.fade-transition {
  transition: opacity 0.3s ease;
}

.slide-transition {
  transition: transform 0.3s ease;
}
</style>