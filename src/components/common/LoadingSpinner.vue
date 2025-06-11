//* src/components/common/LoadingSpinner.vue
<template>
  <div :class="wrapperClass" v-if="show">
    <!-- 오버레이 배경 -->
    <v-overlay
      v-if="overlay"
      :model-value="show"
      :persistent="persistent"
      :opacity="overlayOpacity"
      class="d-flex align-center justify-center"
    >
      <v-card :elevation="cardElevation" class="pa-8 text-center" :color="cardColor" rounded="lg">
        <v-progress-circular
          :size="size"
          :width="width"
          :color="color"
          indeterminate
          class="mb-4"
        />

        <div v-if="message" :class="messageClass">
          {{ message }}
        </div>

        <div v-if="subMessage" class="text-caption text-grey-600 mt-2">
          {{ subMessage }}
        </div>
      </v-card>
    </v-overlay>

    <!-- 인라인 스피너 -->
    <div v-else class="d-flex align-center justify-center flex-column">
      <v-progress-circular
        :size="size"
        :width="width"
        :color="color"
        indeterminate
        :class="spinnerClass"
      />

      <div v-if="message" :class="messageClass">
        {{ message }}
      </div>

      <div v-if="subMessage" class="text-caption text-grey-600 mt-2">
        {{ subMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

/**
 * AI 마케팅 서비스 - 로딩 스피너 컴포넌트
 * 다양한 로딩 상태를 표시하는 재사용 가능한 컴포넌트
 */

// Props 정의
const props = defineProps({
  // 표시 여부
  show: {
    type: Boolean,
    default: true,
  },

  // 스피너 스타일
  size: {
    type: [Number, String],
    default: 64,
  },
  width: {
    type: [Number, String],
    default: 4,
  },
  color: {
    type: String,
    default: 'primary',
  },

  // 오버레이 모드
  overlay: {
    type: Boolean,
    default: false,
  },
  persistent: {
    type: Boolean,
    default: true,
  },
  overlayOpacity: {
    type: Number,
    default: 0.7,
  },

  // 카드 스타일 (오버레이 모드일 때)
  cardColor: {
    type: String,
    default: 'white',
  },
  cardElevation: {
    type: [Number, String],
    default: 8,
  },

  // 메시지
  message: {
    type: String,
    default: '',
  },
  subMessage: {
    type: String,
    default: '',
  },

  // 커스텀 클래스
  wrapperClass: {
    type: [String, Array, Object],
    default: '',
  },
  spinnerClass: {
    type: [String, Array, Object],
    default: '',
  },
})

// Computed
const messageClass = computed(() => ({
  'text-h6': props.overlay,
  'text-body-1': !props.overlay,
  'font-weight-medium': true,
  'text-grey-700': true,
  'mt-4': props.overlay,
  'mt-2': !props.overlay,
}))
</script>
