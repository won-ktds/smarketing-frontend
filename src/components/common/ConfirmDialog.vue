//* src/components/common/ConfirmDialog.vue
<template>
  <v-dialog
    v-model="isVisible"
    :max-width="maxWidth"
    :persistent="persistent"
    :scrollable="scrollable"
  >
    <v-card :color="cardColor" :elevation="elevation">
      <!-- 헤더 -->
      <v-card-title :class="titleClass" class="d-flex align-center">
        <v-icon v-if="icon" :color="iconColor" :size="iconSize" class="mr-3">
          {{ icon }}
        </v-icon>
        {{ title }}
      </v-card-title>

      <!-- 내용 -->
      <v-card-text :class="textClass">
        <div v-if="message" class="text-body-1 mb-4">
          {{ message }}
        </div>

        <!-- 커스텀 슬롯 -->
        <slot />

        <!-- 상세 정보 -->
        <div v-if="details" class="text-caption text-grey-600 mt-4">
          {{ details }}
        </div>
      </v-card-text>

      <!-- 액션 버튼 -->
      <v-card-actions class="px-6 pb-6">
        <v-spacer v-if="!fullWidthButtons" />

        <div :class="buttonContainerClass">
          <!-- 취소 버튼 -->
          <v-btn
            v-if="showCancelButton"
            :color="cancelButtonColor"
            :variant="cancelButtonVariant"
            :size="buttonSize"
            :loading="cancelLoading"
            :disabled="disabled"
            @click="handleCancel"
            :class="{ 'flex-1': fullWidthButtons }"
          >
            {{ cancelText }}
          </v-btn>

          <!-- 확인 버튼 -->
          <v-btn
            :color="confirmButtonColor"
            :variant="confirmButtonVariant"
            :size="buttonSize"
            :loading="confirmLoading"
            :disabled="disabled"
            @click="handleConfirm"
            :class="{ 'flex-1': fullWidthButtons }"
          >
            {{ confirmText }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, watch } from 'vue'

/**
 * AI 마케팅 서비스 - 확인 다이얼로그 컴포넌트
 * 사용자 확인이 필요한 액션에 사용되는 재사용 가능한 컴포넌트
 */

// Props 정의
const props = defineProps({
  // 다이얼로그 표시 여부
  modelValue: {
    type: Boolean,
    default: false,
  },

  // 다이얼로그 설정
  maxWidth: {
    type: [String, Number],
    default: 400,
  },
  persistent: {
    type: Boolean,
    default: false,
  },
  scrollable: {
    type: Boolean,
    default: false,
  },

  // 카드 스타일
  cardColor: {
    type: String,
    default: 'white',
  },
  elevation: {
    type: [Number, String],
    default: 8,
  },

  // 헤더
  title: {
    type: String,
    default: '확인',
  },
  icon: {
    type: String,
    default: '',
  },
  iconColor: {
    type: String,
    default: 'warning',
  },
  iconSize: {
    type: [String, Number],
    default: 'large',
  },

  // 내용
  message: {
    type: String,
    default: '',
  },
  details: {
    type: String,
    default: '',
  },

  // 버튼 설정
  confirmText: {
    type: String,
    default: '확인',
  },
  cancelText: {
    type: String,
    default: '취소',
  },
  confirmButtonColor: {
    type: String,
    default: 'primary',
  },
  cancelButtonColor: {
    type: String,
    default: 'grey',
  },
  confirmButtonVariant: {
    type: String,
    default: 'flat',
  },
  cancelButtonVariant: {
    type: String,
    default: 'outlined',
  },
  buttonSize: {
    type: String,
    default: 'default',
  },
  showCancelButton: {
    type: Boolean,
    default: true,
  },
  fullWidthButtons: {
    type: Boolean,
    default: false,
  },

  // 로딩 상태
  confirmLoading: {
    type: Boolean,
    default: false,
  },
  cancelLoading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

// Emits 정의
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

// Computed
const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const titleClass = computed(() => ({
  'text-warning': props.icon && props.iconColor === 'warning',
  'text-error': props.icon && props.iconColor === 'error',
  'text-success': props.icon && props.iconColor === 'success',
  'text-info': props.icon && props.iconColor === 'info',
}))

const textClass = computed(() => ({
  'pt-4': true,
}))

const buttonContainerClass = computed(() => ({
  'd-flex': true,
  'gap-3': true,
  'w-100': props.fullWidthButtons,
}))

// Methods
const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  isVisible.value = false
}

// ESC 키로 닫기 방지 (persistent가 true일 때)
watch(
  () => props.persistent,
  (newVal) => {
    if (!newVal && !isVisible.value) {
      emit('cancel')
    }
  },
)
</script>

<style scoped>
.flex-1 {
  flex: 1;
}

.gap-3 {
  gap: 12px;
}
</style>
