//* src/components/common/ErrorAlert.vue
<template>
  <v-alert
    v-model="isVisible"
    :type="alertType"
    :variant="variant"
    :density="density"
    :elevation="elevation"
    :color="alertColor"
    :icon="alertIcon"
    :closable="closable"
    :class="alertClass"
    @click:close="handleClose"
  >
    <!-- 제목 -->
    <template v-if="title" v-slot:title>
      <div class="d-flex align-center">
        {{ title }}
        <v-spacer />
        <v-btn
          v-if="showRetryButton"
          variant="outlined"
          size="small"
          :color="retryButtonColor"
          :loading="retryLoading"
          @click="handleRetry"
          class="ml-3"
        >
          {{ retryText }}
        </v-btn>
      </div>
    </template>

    <!-- 메시지 -->
    <div class="alert-content">
      <div v-if="message" class="alert-message">
        {{ message }}
      </div>

      <!-- 커스텀 슬롯 -->
      <slot />

      <!-- 상세 정보 -->
      <div v-if="details" class="alert-details mt-2">
        <v-expansion-panels variant="accordion" flat>
          <v-expansion-panel>
            <v-expansion-panel-title class="text-caption"> 상세 정보 보기 </v-expansion-panel-title>
            <v-expansion-panel-text>
              <pre class="text-caption">{{ details }}</pre>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>

      <!-- 추천 액션 -->
      <div v-if="recommendations && recommendations.length > 0" class="alert-recommendations mt-3">
        <div class="text-caption text-grey-700 mb-2">해결 방법:</div>
        <ul class="text-caption">
          <li v-for="(rec, index) in recommendations" :key="index" class="mb-1">
            {{ rec }}
          </li>
        </ul>
      </div>
    </div>

    <!-- 액션 버튼들 -->
    <template v-if="actions.length > 0" v-slot:append>
      <div class="alert-actions">
        <v-btn
          v-for="action in actions"
          :key="action.id"
          :variant="action.variant || 'text'"
          :color="action.color || alertType"
          :size="action.size || 'small'"
          :loading="action.loading"
          :disabled="action.disabled"
          @click="handleActionClick(action)"
          class="ml-2"
        >
          <v-icon v-if="action.icon" size="small" class="mr-1">
            {{ action.icon }}
          </v-icon>
          {{ action.text }}
        </v-btn>
      </div>
    </template>
  </v-alert>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

/**
 * AI 마케팅 서비스 - 에러 알림 컴포넌트
 * 다양한 종류의 에러 및 알림 메시지를 표시하는 컴포넌트
 */

// Props 정의
const props = defineProps({
  // 표시 여부
  modelValue: {
    type: Boolean,
    default: true,
  },

  // 알림 타입
  type: {
    type: String,
    default: 'error',
    validator: (value) => ['error', 'warning', 'info', 'success'].includes(value),
  },

  // 스타일
  variant: {
    type: String,
    default: 'tonal',
    validator: (value) => ['flat', 'tonal', 'outlined', 'text', 'elevated'].includes(value),
  },
  density: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'comfortable', 'compact'].includes(value),
  },
  elevation: {
    type: [Number, String],
    default: 0,
  },
  color: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },

  // 닫기 설정
  closable: {
    type: Boolean,
    default: true,
  },
  autoHide: {
    type: Boolean,
    default: false,
  },
  autoHideDelay: {
    type: Number,
    default: 5000,
  },

  // 컨텐츠
  title: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    default: '',
  },
  details: {
    type: String,
    default: '',
  },
  recommendations: {
    type: Array,
    default: () => [],
  },

  // 재시도 버튼
  showRetryButton: {
    type: Boolean,
    default: false,
  },
  retryText: {
    type: String,
    default: '다시 시도',
  },
  retryButtonColor: {
    type: String,
    default: 'primary',
  },
  retryLoading: {
    type: Boolean,
    default: false,
  },

  // 액션 버튼들
  actions: {
    type: Array,
    default: () => [],
  },
})

// Emits 정의
const emit = defineEmits(['update:modelValue', 'close', 'retry', 'action-click'])

// Reactive data
const autoHideTimer = ref(null)

// Computed
const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const alertType = computed(() => props.type)

const alertColor = computed(() => {
  if (props.color) return props.color
  return props.type
})

const alertIcon = computed(() => {
  if (props.icon) return props.icon

  const iconMap = {
    error: 'mdi-alert-circle',
    warning: 'mdi-alert',
    info: 'mdi-information',
    success: 'mdi-check-circle',
  }

  return iconMap[props.type] || 'mdi-information'
})

const alertClass = computed(() => ({
  'error-alert': true,
  [`error-alert--${props.type}`]: true,
}))

// Methods
const handleClose = () => {
  isVisible.value = false
  emit('close')
  clearAutoHideTimer()
}

const handleRetry = () => {
  emit('retry')
}

const handleActionClick = (action) => {
  emit('action-click', action)
}

const startAutoHideTimer = () => {
  if (props.autoHide && props.autoHideDelay > 0) {
    autoHideTimer.value = setTimeout(() => {
      handleClose()
    }, props.autoHideDelay)
  }
}

const clearAutoHideTimer = () => {
  if (autoHideTimer.value) {
    clearTimeout(autoHideTimer.value)
    autoHideTimer.value = null
  }
}

// 자동 숨김 타이머 시작
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      startAutoHideTimer()
    } else {
      clearAutoHideTimer()
    }
  },
  { immediate: true },
)

// 컴포넌트 언마운트시 타이머 정리
import { onUnmounted } from 'vue'
onUnmounted(() => {
  clearAutoHideTimer()
})
</script>

<style scoped>
.error-alert {
  margin: 16px 0;
}

.alert-content {
  line-height: 1.6;
}

.alert-message {
  font-weight: 500;
}

.alert-details pre {
  background: rgba(0, 0, 0, 0.05);
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.alert-recommendations ul {
  margin: 0;
  padding-left: 16px;
}

.alert-actions {
  display: flex;
  align-items: center;
}

/* 타입별 커스텀 스타일 */
.error-alert--error {
  border-left: 4px solid rgb(var(--v-theme-error));
}

.error-alert--warning {
  border-left: 4px solid rgb(var(--v-theme-warning));
}

.error-alert--info {
  border-left: 4px solid rgb(var(--v-theme-info));
}

.error-alert--success {
  border-left: 4px solid rgb(var(--v-theme-success));
}

@media (max-width: 600px) {
  .error-alert {
    margin: 12px 0;
  }

  .alert-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .alert-actions .v-btn {
    margin: 0 !important;
  }
}
</style>
