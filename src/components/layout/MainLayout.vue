<!-- src/components/layout/MainLayout.vue 또는 네비게이션 컴포넌트 수정 -->

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useStoreStore } from '@/store/index'
import { useAppStore } from '@/store/app'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const storeStore = useStoreStore()
const appStore = useAppStore()

const drawer = ref(false)

// ✅ 매장 정보 유무에 따른 동적 메뉴 생성
const navigationItems = computed(() => {
  const baseItems = [
    {
      title: '매장 관리',
      icon: 'mdi-store',
      to: '/store',
      color: 'primary',
      available: true, // 항상 접근 가능
      description: '매장 정보를 등록하고 관리하세요'
    }
  ]

  // ✅ 매장 정보가 있을 때만 추가되는 메뉴들
  if (storeStore.hasStoreInfo) {
    baseItems.unshift( // 대시보드를 맨 앞에 추가
      {
        title: '대시보드',
        icon: 'mdi-view-dashboard',
        to: '/dashboard',
        color: 'success',
        available: true,
        description: '매출 현황과 주요 지표를 확인하세요'
      }
    )
    
    baseItems.push(
      {
        title: '콘텐츠 생성',
        icon: 'mdi-plus-circle',
        to: '/content/create',
        color: 'orange',
        available: true,
        description: 'AI로 마케팅 콘텐츠를 생성하세요'
      },
      {
        title: '콘텐츠 관리',
        icon: 'mdi-folder-multiple',
        to: '/content',
        color: 'purple',
        available: true,
        description: '생성된 콘텐츠를 관리하고 발행하세요'
      }
    )
  }

  return baseItems
})

// ✅ 현재 사용할 수 없는 메뉴들 (매장 정보가 없을 때)
const unavailableItems = computed(() => {
  if (storeStore.hasStoreInfo) {
    return [] // 매장 정보가 있으면 모든 메뉴 사용 가능
  }
  
  return [
    {
      title: '대시보드',
      icon: 'mdi-view-dashboard',
      color: 'grey',
      disabled: true,
      description: '매장 정보 등록 후 이용 가능합니다'
    },
    {
      title: '콘텐츠 생성',
      icon: 'mdi-plus-circle',
      color: 'grey',
      disabled: true,
      description: '매장 정보 등록 후 이용 가능합니다'
    },
    {
      title: '콘텐츠 관리',
      icon: 'mdi-folder-multiple',
      color: 'grey',
      disabled: true,
      description: '매장 정보 등록 후 이용 가능합니다'
    }
  ]
})

// ✅ 비활성 메뉴 클릭 처리
const handleDisabledMenuClick = (item) => {
  appStore.showSnackbar('매장 정보를 먼저 등록해주세요', 'warning')
  router.push('/store')
}

// ✅ 매장 정보 상태 감지
const storeInfoStatus = computed(() => {
  if (storeStore.loading) {
    return {
      status: 'loading',
      message: '매장 정보를 확인하는 중...',
      color: 'orange'
    }
  }
  
  if (storeStore.hasStoreInfo) {
    return {
      status: 'complete',
      message: '매장 정보 등록 완료',
      color: 'success'
    }
  }
  
  return {
    status: 'required',
    message: '매장 정보 등록 필요',
    color: 'warning'
  }
})

// 컴포넌트 마운트 시 매장 정보 확인
onMounted(async () => {
  if (authStore.isAuthenticated && !storeStore.hasStoreInfo) {
    await storeStore.fetchStoreInfo()
  }
})
</script>

<template>
  <v-app>
    <!-- 네비게이션 드로어 -->
    <v-navigation-drawer
      v-model="drawer"
      app
      :rail="!drawer"
      rail-width="72"
      width="300"
    >
      <!-- 매장 정보 상태 카드 -->
      <v-card
        v-if="authStore.isAuthenticated"
        class="ma-3 mb-4"
        :color="storeInfoStatus.color"
        variant="tonal"
        elevation="2"
      >
        <v-card-text class="py-3">
          <div class="d-flex align-center">
            <v-icon 
              :icon="storeInfoStatus.status === 'loading' ? 'mdi-loading mdi-spin' : 
                    storeInfoStatus.status === 'complete' ? 'mdi-check-circle' : 'mdi-alert'"
              class="mr-2"
            />
            <span class="text-body-2 font-weight-medium">
              {{ storeInfoStatus.message }}
            </span>
          </div>
          
          <!-- 매장명 표시 (매장 정보가 있을 때) -->
          <div v-if="storeStore.hasStoreInfo && storeStore.storeInfo" class="mt-2">
            <div class="text-h6 font-weight-bold">
              {{ storeStore.storeInfo.storeName }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ storeStore.storeInfo.businessType }}
            </div>
          </div>
        </v-card-text>
      </v-card>

      <v-divider class="mx-3 mb-2" />

      <!-- 사용 가능한 메뉴들 -->
      <v-list density="compact" nav>
        <v-list-item
          v-for="item in navigationItems"
          :key="item.title"
          :to="item.to"
          :color="item.color"
          class="mb-1 mx-2"
          rounded="lg"
        >
          <template v-slot:prepend>
            <v-icon :icon="item.icon" />
          </template>
          
          <v-list-item-title class="font-weight-medium">
            {{ item.title }}
          </v-list-item-title>
          
          <v-list-item-subtitle class="text-caption">
            {{ item.description }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <!-- 사용할 수 없는 메뉴들 (매장 정보가 없을 때만 표시) -->
      <template v-if="unavailableItems.length > 0">
        <v-divider class="mx-3 my-2" />
        
        <v-list density="compact">
          <v-list-subheader class="text-caption text-medium-emphasis px-4">
            매장 등록 후 이용 가능
          </v-list-subheader>
          
          <v-list-item
            v-for="item in unavailableItems"
            :key="item.title"
            :disabled="item.disabled"
            class="mb-1 mx-2"
            rounded="lg"
            @click="handleDisabledMenuClick(item)"
          >
            <template v-slot:prepend>
              <v-icon :icon="item.icon" :color="item.color" />
            </template>
            
            <v-list-item-title class="font-weight-medium text-medium-emphasis">
              {{ item.title }}
            </v-list-item-title>
            
            <v-list-item-subtitle class="text-caption">
              {{ item.description }}
            </v-list-item-subtitle>
            
            <template v-slot:append>
              <v-icon icon="mdi-lock" size="small" color="grey" />
            </template>
          </v-list-item>
        </v-list>
      </template>

      <!-- 하단 로그아웃 버튼 -->
      <template v-slot:append>
        <v-divider class="mx-3 mb-2" />
        <div class="pa-3">
          <v-btn
            block
            color="red"
            variant="outlined"
            @click="authStore.logout"
          >
            <v-icon start>mdi-logout</v-icon>
            로그아웃
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- 앱바 -->
    <v-app-bar app color="primary" dark elevation="1">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      
      <v-app-bar-title class="font-weight-bold">
        AI 마케팅
      </v-app-bar-title>

      <v-spacer />

      <!-- 사용자 정보 -->
      <div v-if="authStore.user" class="d-flex align-center">
        <v-chip color="white" variant="outlined" class="mr-2">
          <v-icon start>mdi-account</v-icon>
          {{ authStore.user.nickname }}님
        </v-chip>
      </div>
    </v-app-bar>

    <!-- 메인 컨텐츠 -->
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<style scoped>
.v-navigation-drawer {
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}

.v-list-item--active {
  font-weight: 600;
}

.mdi-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>