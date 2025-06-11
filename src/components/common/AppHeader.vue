//* src/components/common/AppHeader.vue
<template>
  <v-app-bar :color="color" :elevation="elevation" :height="height" app>
    <!-- 뒤로가기 버튼 -->
    <v-btn v-if="showBackButton" icon @click="handleBackClick" :color="backButtonColor">
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>

    <!-- 메뉴 버튼 (모바일용) -->
    <v-app-bar-nav-icon
      v-if="showMenuButton"
      @click="$emit('toggle-drawer')"
      :color="menuButtonColor"
    />

    <!-- 타이틀 -->
    <v-app-bar-title :class="titleClass" @click="handleTitleClick">
      {{ title }}
    </v-app-bar-title>

    <v-spacer />

    <!-- 액션 버튼들 -->
    <template v-for="action in actions" :key="action.id">
      <v-btn
        v-if="action.type === 'icon'"
        :icon="action.icon"
        @click="handleActionClick(action)"
        :color="action.color || 'white'"
        :loading="action.loading"
        :disabled="action.disabled"
      >
        <v-icon>{{ action.icon }}</v-icon>
        <v-badge
          v-if="action.badge && action.badgeCount > 0"
          :content="action.badgeCount"
          :color="action.badgeColor || 'error'"
          offset-x="8"
          offset-y="8"
        />
      </v-btn>

      <v-btn
        v-else
        :color="action.color || 'primary'"
        :variant="action.variant || 'text'"
        @click="handleActionClick(action)"
        :loading="action.loading"
        :disabled="action.disabled"
      >
        {{ action.text }}
      </v-btn>
    </template>

    <!-- 사용자 아바타 -->
    <v-menu v-if="showUserMenu" offset-y :close-on-content-click="false">
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props" class="ml-2">
          <v-avatar size="32" :color="avatarColor">
            <v-img v-if="userAvatar" :src="userAvatar" :alt="userName" />
            <span v-else class="text-white font-weight-bold">
              {{ userInitial }}
            </span>
          </v-avatar>
        </v-btn>
      </template>

      <v-card min-width="200">
        <v-card-title class="text-center">
          {{ userName }}
        </v-card-title>
        <v-card-subtitle class="text-center">
          {{ userEmail }}
        </v-card-subtitle>
        <v-divider />
        <v-list density="compact">
          <v-list-item
            v-for="menuItem in userMenuItems"
            :key="menuItem.id"
            @click="handleUserMenuClick(menuItem)"
            :prepend-icon="menuItem.icon"
          >
            <v-list-item-title>{{ menuItem.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
  </v-app-bar>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

/**
 * AI 마케팅 서비스 - 공통 헤더 컴포넌트
 * 모바일 최적화된 앱바 컴포넌트
 */

// Props 정의
const props = defineProps({
  // 헤더 스타일 설정
  title: {
    type: String,
    default: 'AI 마케팅',
  },
  color: {
    type: String,
    default: 'primary',
  },
  elevation: {
    type: [Number, String],
    default: 2,
  },
  height: {
    type: [Number, String],
    default: 56,
  },

  // 네비게이션 버튼
  showBackButton: {
    type: Boolean,
    default: false,
  },
  showMenuButton: {
    type: Boolean,
    default: true,
  },
  backButtonColor: {
    type: String,
    default: 'white',
  },
  menuButtonColor: {
    type: String,
    default: 'white',
  },

  // 타이틀 설정
  titleClickable: {
    type: Boolean,
    default: false,
  },

  // 액션 버튼들
  actions: {
    type: Array,
    default: () => [],
  },

  // 사용자 메뉴
  showUserMenu: {
    type: Boolean,
    default: true,
  },
  userName: {
    type: String,
    default: '사용자',
  },
  userEmail: {
    type: String,
    default: '',
  },
  userAvatar: {
    type: String,
    default: '',
  },
  avatarColor: {
    type: String,
    default: 'secondary',
  },
  userMenuItems: {
    type: Array,
    default: () => [
      { id: 'profile', title: '프로필', icon: 'mdi-account' },
      { id: 'settings', title: '설정', icon: 'mdi-cog' },
      { id: 'logout', title: '로그아웃', icon: 'mdi-logout' },
    ],
  },
})

// Emits 정의
const emit = defineEmits([
  'toggle-drawer',
  'back-click',
  'title-click',
  'action-click',
  'user-menu-click',
])

// 라우터
const router = useRouter()

// Computed
const titleClass = computed(() => ({
  'cursor-pointer': props.titleClickable,
  'text-white': props.color === 'primary',
}))

const userInitial = computed(() => {
  return props.userName.charAt(0).toUpperCase()
})

// Methods
const handleBackClick = () => {
  emit('back-click')
  router.go(-1)
}

const handleTitleClick = () => {
  if (props.titleClickable) {
    emit('title-click')
  }
}

const handleActionClick = (action) => {
  emit('action-click', action)
}

const handleUserMenuClick = (menuItem) => {
  emit('user-menu-click', menuItem)
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
