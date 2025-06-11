//* src/components/common/ContentCard.vue
<template>
  <v-card :class="cardClass" :elevation="elevation" :color="cardColor" @click="handleCardClick">
    <!-- 카드 헤더 -->
    <div v-if="showHeader" class="card-header">
      <div class="header-content">
        <!-- 타입 아이콘 -->
        <v-icon v-if="typeIcon" :color="typeIconColor" size="small" class="mr-2">
          {{ typeIcon }}
        </v-icon>

        <!-- 제목 -->
        <div class="header-title">
          <div class="text-body-2 font-weight-medium">
            {{ title }}
          </div>
          <div v-if="subtitle" class="text-caption text-grey-600">
            {{ subtitle }}
          </div>
        </div>
      </div>

      <!-- 헤더 액션 -->
      <div v-if="headerActions.length > 0" class="header-actions">
        <v-btn
          v-for="action in headerActions"
          :key="action.id"
          :icon="action.icon"
          :color="action.color || 'grey'"
          :size="action.size || 'small'"
          variant="text"
          @click.stop="handleActionClick(action)"
        >
          <v-icon>{{ action.icon }}</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- 이미지 섹션 -->
    <div v-if="image" class="image-section">
      <v-img
        :src="image"
        :alt="imageAlt"
        :aspect-ratio="imageAspectRatio"
        cover
        class="content-image"
      >
        <!-- 이미지 오버레이 -->
        <div v-if="imageOverlay" class="image-overlay">
          <slot name="image-overlay">
            {{ imageOverlay }}
          </slot>
        </div>
      </v-img>
    </div>

    <!-- 컨텐츠 영역 -->
    <v-card-text :class="contentClass">
      <!-- 상태 칩 -->
      <div v-if="status" class="status-section mb-3">
        <v-chip :color="statusColor" :variant="statusVariant" size="small">
          {{ status }}
        </v-chip>
      </div>

      <!-- 메인 컨텐츠 -->
      <div class="main-content">
        <slot>
          <div v-if="content" class="content-text">
            {{ content }}
          </div>
        </slot>
      </div>

      <!-- 메타 정보 -->
      <div v-if="showMeta" class="meta-section mt-3">
        <div class="meta-row">
          <div v-if="platform" class="meta-item">
            <v-icon size="x-small" class="mr-1">mdi-web</v-icon>
            <span class="text-caption">{{ platform }}</span>
          </div>

          <div v-if="createdAt" class="meta-item">
            <v-icon size="x-small" class="mr-1">mdi-clock-outline</v-icon>
            <span class="text-caption">{{ formatDate(createdAt) }}</span>
          </div>

          <div v-if="viewCount" class="meta-item">
            <v-icon size="x-small" class="mr-1">mdi-eye-outline</v-icon>
            <span class="text-caption">{{ viewCount }}</span>
          </div>
        </div>
      </div>

      <!-- 해시태그 -->
      <div v-if="hashtags && hashtags.length > 0" class="hashtags-section mt-3">
        <v-chip
          v-for="(tag, index) in displayHashtags"
          :key="index"
          size="x-small"
          variant="outlined"
          color="primary"
          class="mr-1 mb-1"
        >
          #{{ tag }}
        </v-chip>

        <v-btn
          v-if="hashtags.length > maxHashtags"
          variant="text"
          size="x-small"
          @click.stop="showAllHashtags = !showAllHashtags"
        >
          {{ showAllHashtags ? '간략히' : `+${hashtags.length - maxHashtags}개 더` }}
        </v-btn>
      </div>
    </v-card-text>

    <!-- 카드 액션 -->
    <v-card-actions v-if="actions.length > 0" class="px-4 pb-4">
      <v-spacer v-if="actionsAlign === 'right'" />

      <v-btn
        v-for="action in actions"
        :key="action.id"
        :color="action.color || 'primary'"
        :variant="action.variant || 'text'"
        :size="action.size || 'small'"
        :loading="action.loading"
        :disabled="action.disabled"
        @click.stop="handleActionClick(action)"
      >
        <v-icon v-if="action.icon" :start="action.text" size="small">
          {{ action.icon }}
        </v-icon>
        {{ action.text }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'

/**
 * AI 마케팅 서비스 - 콘텐츠 카드 컴포넌트
 * 마케팅 콘텐츠를 표시하는 재사용 가능한 카드 컴포넌트
 */

// Props 정의
const props = defineProps({
  // 카드 스타일
  elevation: {
    type: [Number, String],
    default: 2,
  },
  cardColor: {
    type: String,
    default: 'white',
  },
  clickable: {
    type: Boolean,
    default: false,
  },

  // 헤더
  showHeader: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  typeIcon: {
    type: String,
    default: '',
  },
  typeIconColor: {
    type: String,
    default: 'primary',
  },
  headerActions: {
    type: Array,
    default: () => [],
  },

  // 이미지
  image: {
    type: String,
    default: '',
  },
  imageAlt: {
    type: String,
    default: '',
  },
  imageAspectRatio: {
    type: [Number, String],
    default: '16/9',
  },
  imageOverlay: {
    type: String,
    default: '',
  },

  // 컨텐츠
  content: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: '',
  },
  statusColor: {
    type: String,
    default: 'primary',
  },
  statusVariant: {
    type: String,
    default: 'tonal',
  },

  // 메타 정보
  showMeta: {
    type: Boolean,
    default: true,
  },
  platform: {
    type: String,
    default: '',
  },
  createdAt: {
    type: [String, Date],
    default: '',
  },
  viewCount: {
    type: [Number, String],
    default: '',
  },

  // 해시태그
  hashtags: {
    type: Array,
    default: () => [],
  },
  maxHashtags: {
    type: Number,
    default: 3,
  },

  // 액션
  actions: {
    type: Array,
    default: () => [],
  },
  actionsAlign: {
    type: String,
    default: 'left',
    validator: (value) => ['left', 'center', 'right'].includes(value),
  },
})

// Emits 정의
const emit = defineEmits(['click', 'action-click'])

// Reactive data
const showAllHashtags = ref(false)

// Computed
const cardClass = computed(() => ({
  'content-card': true,
  'content-card--clickable': props.clickable,
  'hover-elevation': props.clickable,
}))

const contentClass = computed(() => ({
  'pt-4': !props.image,
  'pt-3': props.image,
}))

const displayHashtags = computed(() => {
  if (showAllHashtags.value || props.hashtags.length <= props.maxHashtags) {
    return props.hashtags
  }
  return props.hashtags.slice(0, props.maxHashtags)
})

// Methods
const handleCardClick = () => {
  if (props.clickable) {
    emit('click')
  }
}

const handleActionClick = (action) => {
  emit('action-click', action)
}

const formatDate = (date) => {
  if (!date) return ''

  const dateObj = new Date(date)
  const now = new Date()
  const diffMs = now - dateObj
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return '오늘'
  } else if (diffDays === 1) {
    return '어제'
  } else if (diffDays < 7) {
    return `${diffDays}일 전`
  } else {
    return dateObj.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    })
  }
}
</script>

<style scoped>
.content-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

.content-card--clickable {
  cursor: pointer;
}

.content-card--clickable:hover {
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 16px 0 16px;
}

.header-content {
  display: flex;
  align-items: flex-start;
  flex: 1;
}

.header-title {
  flex: 1;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.image-section {
  position: relative;
}

.content-image {
  border-radius: 0;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: 16px;
}

.status-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.main-content {
  margin-bottom: 8px;
}

.content-text {
  line-height: 1.6;
  color: rgba(0, 0, 0, 0.87);
}

.meta-section {
  border-top: 1px solid #e0e0e0;
  padding-top: 12px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  color: #757575;
}

.hashtags-section {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

@media (max-width: 600px) {
  .card-header {
    padding: 12px 12px 0 12px;
  }

  .meta-row {
    gap: 12px;
  }

  .image-overlay {
    padding: 12px;
  }
}
</style>
