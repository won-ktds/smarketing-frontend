//* src/components/layout/Sidebar.vue
<template>
  <v-navigation-drawer
    v-model="isOpen"
    :location="location"
    :width="width"
    :rail="rail"
    :permanent="permanent"
    :temporary="temporary"
    :floating="floating"
    :color="drawerColor"
    :elevation="elevation"
    :scrim="scrimColor"
  >
    <!-- 헤더 -->
    <div class="sidebar-header">
      <div class="header-content">
        <!-- 로고 -->
        <div class="sidebar-logo">
          <v-img :src="logoSrc" :alt="logoAlt" :width="logoWidth" :height="logoHeight" contain />
        </div>

        <!-- 사용자 정보 -->
        <div v-if="showUserInfo && !rail" class="user-info">
          <v-avatar :size="avatarSize" :color="avatarColor" class="mb-2">
            <v-img v-if="userAvatar" :src="userAvatar" :alt="userName" />
            <span v-else class="text-white font-weight-bold">
              {{ userInitial }}
            </span>
          </v-avatar>

          <div class="user-details">
            <div class="text-body-2 font-weight-medium">
              {{ userName }}
            </div>
            <div class="text-caption text-grey-600">
              {{ userRole }}
            </div>
            <div class="text-caption text-grey-600">
              {{ businessName }}
            </div>
          </div>
        </div>
      </div>

      <!-- 축소/확장 버튼 -->
      <v-btn v-if="showToggleButton" icon size="small" @click="toggleRail" class="toggle-btn">
        <v-icon>{{ rail ? 'mdi-chevron-right' : 'mdi-chevron-left' }}</v-icon>
      </v-btn>
    </div>

    <v-divider />

    <!-- 네비게이션 메뉴 -->
    <v-list :density="listDensity" nav class="sidebar-menu">
      <!-- 메뉴 그룹 -->
      <template v-for="(group, groupIndex) in menuGroups" :key="groupIndex">
        <!-- 그룹 헤더 -->
        <v-list-subheader v-if="group.title && !rail" class="text-grey-600 font-weight-medium">
          {{ group.title }}
        </v-list-subheader>

        <!-- 메뉴 아이템들 -->
        <template v-for="item in group.items" :key="item.id">
          <!-- 단일 메뉴 아이템 -->
          <v-list-item
            v-if="!item.children"
            :to="item.route"
            :value="item.id"
            :prepend-icon="item.icon"
            :title="item.title"
            :subtitle="item.subtitle"
            :active="isActiveRoute(item.route)"
            :class="getMenuItemClass(item)"
            @click="handleMenuClick(item)"
          >
            <!-- 배지 -->
            <template v-if="item.badge" v-slot:append>
              <v-chip
                :color="item.badgeColor || 'primary'"
                size="x-small"
                :variant="item.badgeVariant || 'flat'"
              >
                {{ item.badge }}
              </v-chip>
            </template>
          </v-list-item>

          <!-- 하위 메뉴가 있는 아이템 -->
          <v-list-group v-else :value="item.id" :prepend-icon="item.icon">
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                :title="item.title"
                :subtitle="item.subtitle"
                :class="getMenuItemClass(item)"
              />
            </template>

            <v-list-item
              v-for="child in item.children"
              :key="child.id"
              :to="child.route"
              :value="child.id"
              :title="child.title"
              :prepend-icon="child.icon"
              :active="isActiveRoute(child.route)"
              class="ml-4"
              @click="handleMenuClick(child)"
            >
              <template v-if="child.badge" v-slot:append>
                <v-chip
                  :color="child.badgeColor || 'primary'"
                  size="x-small"
                  :variant="child.badgeVariant || 'flat'"
                >
                  {{ child.badge }}
                </v-chip>
              </template>
            </v-list-item>
          </v-list-group>
        </template>

        <!-- 그룹 구분선 -->
        <v-divider v-if="groupIndex < menuGroups.length - 1" class="my-2" />
      </template>
    </v-list>

    <!-- 하단 액션 -->
    <template v-slot:append>
      <div class="sidebar-footer">
        <v-divider />

        <v-list density="compact" nav>
          <v-list-item
            v-for="action in footerActions"
            :key="action.id"
            :prepend-icon="action.icon"
            :title="action.title"
            :color="action.color"
            @click="handleActionClick(action)"
          />
        </v-list>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

/**
 * AI 마케팅 서비스 - 사이드바 네비게이션 컴포넌트
 * 메인 네비게이션을 제공하는 사이드바
 */

// Props 정의
const props = defineProps({
  // 기본 설정
  modelValue: {
    type: Boolean,
    default: true,
  },
  location: {
    type: String,
    default: 'start',
  },
  width: {
    type: [Number, String],
    default: 280,
  },
  rail: {
    type: Boolean,
    default: false,
  },
  permanent: {
    type: Boolean,
    default: false,
  },
  temporary: {
    type: Boolean,
    default: true,
  },
  floating: {
    type: Boolean,
    default: false,
  },

  // 스타일
  drawerColor: {
    type: String,
    default: 'white',
  },
  elevation: {
    type: [Number, String],
    default: 1,
  },
  scrimColor: {
    type: String,
    default: 'rgba(0, 0, 0, 0.5)',
  },
  listDensity: {
    type: String,
    default: 'default',
  },

  // 로고
  logoSrc: {
    type: String,
    default: '/images/logo.png',
  },
  logoAlt: {
    type: String,
    default: 'AI 마케팅 로고',
  },
  logoWidth: {
    type: [Number, String],
    default: 40,
  },
  logoHeight: {
    type: [Number, String],
    default: 40,
  },

  // 사용자 정보
  showUserInfo: {
    type: Boolean,
    default: true,
  },
  userName: {
    type: String,
    default: '사용자',
  },
  userRole: {
    type: String,
    default: '점주',
  },
  businessName: {
    type: String,
    default: '',
  },
  userAvatar: {
    type: String,
    default: '',
  },
  avatarSize: {
    type: [Number, String],
    default: 48,
  },
  avatarColor: {
    type: String,
    default: 'primary',
  },

  // 토글 버튼
  showToggleButton: {
    type: Boolean,
    default: true,
  },

  // 메뉴 구성
  menuGroups: {
    type: Array,
    default: () => [
      {
        title: '대시보드',
        items: [
          {
            id: 'dashboard',
            title: '홈',
            icon: 'mdi-home',
            route: '/dashboard',
          },
        ],
      },
      {
        title: '매장 관리',
        items: [
          {
            id: 'store',
            title: '매장 정보',
            icon: 'mdi-store',
            route: '/store',
          },
          {
            id: 'menu',
            title: '메뉴 관리',
            icon: 'mdi-food',
            route: '/menu',
          },
        ],
      },
      {
        title: '마케팅',
        items: [
          {
            id: 'content-create',
            title: '콘텐츠 생성',
            icon: 'mdi-plus-circle',
            route: '/content/create',
          },
          {
            id: 'content-list',
            title: '콘텐츠 목록',
            icon: 'mdi-file-document-multiple',
            route: '/content',
          },
          {
            id: 'ai-recommend',
            title: 'AI 추천',
            icon: 'mdi-robot',
            route: '/recommend',
          },
        ],
      },
      {
        title: '분석',
        items: [
          {
            id: 'sales',
            title: '매출 분석',
            icon: 'mdi-chart-line',
            route: '/sales',
          },
        ],
      },
    ],
  },

  // 하단 액션
  footerActions: {
    type: Array,
    default: () => [
      {
        id: 'settings',
        title: '설정',
        icon: 'mdi-cog',
        color: 'grey',
      },
      {
        id: 'logout',
        title: '로그아웃',
        icon: 'mdi-logout',
        color: 'error',
      },
    ],
  },
})

// Emits 정의
const emit = defineEmits(['update:modelValue', 'update:rail', 'menu-click', 'action-click'])

// 라우터
const route = useRoute()

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const userInitial = computed(() => {
  return props.userName.charAt(0).toUpperCase()
})

// Methods
const toggleRail = () => {
  emit('update:rail', !props.rail)
}

const isActiveRoute = (routePath) => {
  if (!routePath) return false
  return route.path === routePath || route.path.startsWith(routePath + '/')
}

const getMenuItemClass = (item) => {
  return {
    'menu-item': true,
    'menu-item--important': item.important,
    'menu-item--new': item.isNew,
  }
}

const handleMenuClick = (item) => {
  emit('menu-click', item)

  // 모바일에서는 메뉴 클릭시 사이드바 닫기
  if (props.temporary && window.innerWidth < 960) {
    isOpen.value = false
  }
}

const handleActionClick = (action) => {
  emit('action-click', action)
}
</script>

<style scoped>
.sidebar-header {
  position: relative;
  padding: 20px 16px 16px;
  background: linear-gradient(
    135deg,
    rgb(var(--v-theme-primary)),
    rgb(var(--v-theme-primary-darken-1))
  );
  color: white;
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.sidebar-logo {
  margin-bottom: 16px;
}

.user-info {
  width: 100%;
}

.user-details {
  line-height: 1.4;
}

.toggle-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.1) !important;
}

.sidebar-menu {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.menu-item--important {
  background: rgba(var(--v-theme-primary), 0.1);
  border-radius: 8px;
  margin: 0 8px;
}

.menu-item--new::after {
  content: 'NEW';
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgb(var(--v-theme-error));
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: bold;
}

.sidebar-footer {
  background: rgb(var(--v-theme-surface-variant));
}

@media (max-width: 960px) {
  .sidebar-header {
    padding: 16px 12px 12px;
  }

  .user-info {
    margin-top: 12px;
  }
}
</style>
