//* src/components/layout/BottomNavigation.vue
<template>
  <v-bottom-navigation
    v-model="activeTab"
    :color="color"
    :bg-color="bgColor"
    :elevation="elevation"
    :height="height"
    :grow="grow"
    :shift="shift"
    :selected-class="selectedClass"
    class="bottom-nav"
  >
    <v-btn
      v-for="item in navigationItems"
      :key="item.id"
      :value="item.id"
      :to="item.route"
      :color="getItemColor(item)"
      :stacked="stacked"
      @click="handleNavClick(item)"
    >
      <!-- 배지가 있는 아이콘 -->
      <v-badge
        v-if="item.badge && item.badgeCount > 0"
        :content="item.badgeCount"
        :color="item.badgeColor || 'error'"
        offset-x="8"
        offset-y="8"
      >
        <v-icon :size="iconSize">{{ item.icon }}</v-icon>
      </v-badge>

      <!-- 일반 아이콘 -->
      <v-icon v-else :size="iconSize">{{ item.icon }}</v-icon>

      <!-- 라벨 -->
      <span class="nav-label">{{ item.label }}</span>

      <!-- 새로운 기능 표시 -->
      <v-chip v-if="item.isNew" color="error" size="x-small" class="new-badge"> NEW </v-chip>
    </v-btn>
  </v-bottom-navigation>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/**
 * AI 마케팅 서비스 - 하단 네비게이션 컴포넌트
 * 모바일 최적화된 하단 탭 네비게이션
 */

// Props 정의
const props = defineProps({
  // 기본 설정
  modelValue: {
    type: String,
    default: '',
  },

  // 스타일 설정
  color: {
    type: String,
    default: 'primary',
  },
  bgColor: {
    type: String,
    default: 'white',
  },
  elevation: {
    type: [Number, String],
    default: 8,
  },
  height: {
    type: [Number, String],
    default: 64,
  },
  grow: {
    type: Boolean,
    default: false,
  },
  shift: {
    type: Boolean,
    default: false,
  },
  stacked: {
    type: Boolean,
    default: true,
  },
  selectedClass: {
    type: String,
    default: 'v-btn--active',
  },
  iconSize: {
    type: [String, Number],
    default: 24,
  },

  // 네비게이션 아이템들
  navigationItems: {
    type: Array,
    default: () => [
      {
        id: 'dashboard',
        label: '홈',
        icon: 'mdi-home',
        route: '/dashboard',
        activeIcon: 'mdi-home',
      },
      {
        id: 'store',
        label: '매장',
        icon: 'mdi-store-outline',
        activeIcon: 'mdi-store',
        route: '/store',
      },
      {
        id: 'content',
        label: '콘텐츠',
        icon: 'mdi-plus-circle-outline',
        activeIcon: 'mdi-plus-circle',
        route: '/content/create',
      },
      {
        id: 'content-list',
        label: '목록',
        icon: 'mdi-file-document-outline',
        activeIcon: 'mdi-file-document',
        route: '/content',
      },
      {
        id: 'menu',
        label: '더보기',
        icon: 'mdi-menu',
        activeIcon: 'mdi-menu',
        route: '/menu',
      },
    ],
  },

  // 자동 라우팅
  autoRoute: {
    type: Boolean,
    default: true,
  },

  // 히든 조건
  hideOnRoutes: {
    type: Array,
    default: () => ['/login', '/register'],
  },
})

// Emits 정의
const emit = defineEmits(['update:modelValue', 'nav-click'])

// 라우터
const route = useRoute()
const router = useRouter()

// Computed
const activeTab = computed({
  get: () => {
    if (props.modelValue) return props.modelValue

    // 현재 라우트를 기반으로 활성 탭 결정
    const currentPath = route.path
    const matchedItem = props.navigationItems.find((item) => {
      if (!item.route) return false
      return currentPath === item.route || currentPath.startsWith(item.route + '/')
    })

    return matchedItem?.id || props.navigationItems[0]?.id || ''
  },
  set: (value) => emit('update:modelValue', value),
})

const shouldHide = computed(() => {
  return props.hideOnRoutes.includes(route.path)
})

// Methods
const getItemColor = (item) => {
  // 활성 상태인 경우 primary 색상, 아니면 기본 색상
  return activeTab.value === item.id ? props.color : 'grey'
}

const getItemIcon = (item) => {
  // 활성 상태인 경우 activeIcon 사용, 아니면 기본 icon
  return activeTab.value === item.id && item.activeIcon ? item.activeIcon : item.icon
}

const handleNavClick = (item) => {
  emit('nav-click', item)

  // 자동 라우팅이 활성화된 경우 라우터로 이동
  if (props.autoRoute && item.route) {
    router.push(item.route)
  }
}

// 라우트 변경시 활성 탭 업데이트
watch(
  () => route.path,
  () => {
    const matchedItem = props.navigationItems.find((item) => {
      if (!item.route) return false
      return route.path === item.route || route.path.startsWith(item.route + '/')
    })

    if (matchedItem && activeTab.value !== matchedItem.id) {
      activeTab.value = matchedItem.id
    }
  },
)
</script>

<style scoped>
.bottom-nav {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.nav-label {
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  margin-top: 4px;
}

.new-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 8px;
  min-width: 20px;
  height: 16px;
}

/* 활성 상태 스타일 */
.v-btn--active .nav-label {
  font-weight: 700;
}

.v-btn--active .v-icon {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

/* 배지 스타일 */
.v-badge :deep(.v-badge__badge) {
  font-size: 10px;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
}

/* 터치 영역 확장 */
.v-btn {
  min-width: 64px;
  padding: 8px 12px;
}

/* 아이콘 전환 애니메이션 */
.v-icon {
  transition: all 0.2s ease;
}

/* 라벨 전환 애니메이션 */
.nav-label {
  transition: all 0.2s ease;
}

/* 다크 테마 지원 */
@media (prefers-color-scheme: dark) {
  .bottom-nav {
    border-top-color: rgba(255, 255, 255, 0.12);
  }
}

/* 안전 영역 지원 (노치가 있는 기기) */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .bottom-nav {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>
