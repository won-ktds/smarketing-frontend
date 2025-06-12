//* src/App.vue
<template>
  <v-app>
    <!-- 로딩 오버레이 -->
    <v-overlay v-if="loading" class="align-center justify-center" persistent>
      <v-progress-circular color="primary" indeterminate size="64" />
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
          prepend-avatar="/images/logo192.png"
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
          <v-btn block color="primary" variant="outlined" prepend-icon="mdi-logout" @click="logout">
            로그아웃
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- 상단 앱바 -->
    <v-app-bar v-if="isAuthenticated && !isLoginPage" app elevation="1" color="primary">
      <v-app-bar-nav-icon @click="drawer = !drawer" color="white" />

      <v-toolbar-title class="text-white font-weight-bold">
        {{ currentPageTitle }}
      </v-toolbar-title>

      <v-spacer />

      <!-- 종모양 알림 제거하고 로그아웃 버튼으로 대체 -->
      <v-btn icon color="white" @click="logout">
        <v-icon>mdi-logout</v-icon>
        <v-tooltip activator="parent" location="bottom">로그아웃</v-tooltip>
      </v-btn>
    </v-app-bar>

    <!-- 메인 컨텐츠 -->
    <v-main>
      <router-view />
    </v-main>

    <!-- 글로벌 스낵바 -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      location="top"
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false"> 닫기 </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useAppStore } from '@/store/app'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

// 반응형 데이터
const drawer = ref(false)
const loading = ref(false)

// 컴퓨티드 속성
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isLoginPage = computed(() => route.name === 'Login')
const userStore = computed(() => authStore)
const snackbar = computed(() => appStore.snackbar)

// 현재 페이지 제목
const currentPageTitle = computed(() => {
  const titles = {
    Dashboard: '대시보드',
    StoreManagement: '매장 관리',
    ContentCreation: '콘텐츠 생성',
    ContentManagement: '콘텐츠 관리',
  }
  return titles[route.name] || 'AI 마케팅'
})

// 메뉴 아이템 (수정된 메뉴 구조)
const menuItems = [
  { title: '대시보드', icon: 'mdi-view-dashboard', route: '/dashboard' },
  { title: '매장 관리', icon: 'mdi-store', route: '/store' },
  { title: '콘텐츠 생성', icon: 'mdi-creation', route: '/content/create' },
  { title: '콘텐츠 관리', icon: 'mdi-folder-multiple', route: '/content' },
]

// 로그아웃
const logout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('로그아웃 실패:', error)
  }
}

// 초기화
onMounted(() => {
  console.log('App 컴포넌트 마운트됨')
  console.log('현재 라우트:', route.path)
  console.log('인증 상태:', authStore.isAuthenticated)
})
</script>

<style scoped>
.v-app-bar-title {
  font-size: 1.25rem;
  font-weight: 600;
}
</style>