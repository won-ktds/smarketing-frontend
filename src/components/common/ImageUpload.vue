//* src/components/common/ImageUpload.vue
<template>
  <div class="image-upload-container">
    <!-- 업로드 영역 -->
    <div
      ref="dropZone"
      :class="dropZoneClass"
      @click="openFileDialog"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <!-- 파일 선택 input -->
      <input
        ref="fileInput"
        type="file"
        :accept="acceptTypes"
        :multiple="multiple"
        @change="handleFileSelect"
        style="display: none"
      />

      <!-- 업로드 아이콘 및 텍스트 -->
      <div v-if="!hasImages" class="upload-prompt">
        <v-icon :size="iconSize" :color="iconColor" class="mb-4">
          {{ uploadIcon }}
        </v-icon>

        <div class="text-h6 font-weight-medium mb-2">
          {{ uploadText }}
        </div>

        <div class="text-body-2 text-grey-600 mb-4">
          {{ uploadSubText }}
        </div>

        <v-chip :color="chipColor" variant="outlined" size="small">
          {{ acceptTypesText }} | 최대 {{ maxSizeText }}
        </v-chip>
      </div>

      <!-- 이미지 미리보기 그리드 -->
      <div v-else class="image-preview-grid">
        <div v-for="(image, index) in previewImages" :key="index" class="image-preview-item">
          <!-- 이미지 -->
          <div class="image-wrapper">
            <v-img :src="image.url" :alt="image.name" aspect-ratio="1" cover class="rounded" />

            <!-- 삭제 버튼 -->
            <v-btn
              icon
              size="small"
              color="error"
              class="delete-btn"
              @click.stop="removeImage(index)"
            >
              <v-icon size="small">mdi-close</v-icon>
            </v-btn>

            <!-- 메인 이미지 표시 -->
            <v-chip
              v-if="index === 0 && multiple"
              color="primary"
              size="x-small"
              class="main-badge"
            >
              메인
            </v-chip>
          </div>

          <!-- 이미지 정보 -->
          <div class="image-info">
            <div class="text-caption font-weight-medium">
              {{ image.name }}
            </div>
            <div class="text-caption text-grey-600">
              {{ formatFileSize(image.size) }}
            </div>
          </div>
        </div>

        <!-- 추가 업로드 버튼 (다중 업로드시) -->
        <div
          v-if="multiple && previewImages.length < maxFiles"
          class="add-more-btn"
          @click.stop="openFileDialog"
        >
          <v-icon size="large" color="grey-400">mdi-plus</v-icon>
          <div class="text-caption text-grey-600 mt-2">추가 업로드</div>
        </div>
      </div>
    </div>

    <!-- 에러 메시지 -->
    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      density="compact"
      class="mt-4"
      @click:close="clearError"
      closable
    >
      {{ errorMessage }}
    </v-alert>

    <!-- 업로드 진행률 -->
    <v-progress-linear
      v-if="uploading"
      :model-value="uploadProgress"
      color="primary"
      height="4"
      class="mt-4"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

/**
 * AI 마케팅 서비스 - 이미지 업로드 컴포넌트
 * 드래그&드롭 및 클릭 업로드를 지원하는 이미지 업로드 컴포넌트
 */

// Props 정의
const props = defineProps({
  // 모델 값 (업로드된 파일들)
  modelValue: {
    type: Array,
    default: () => [],
  },

  // 업로드 설정
  multiple: {
    type: Boolean,
    default: false,
  },
  maxFiles: {
    type: Number,
    default: 5,
  },
  maxSize: {
    type: Number,
    default: 10 * 1024 * 1024, // 10MB
  },
  acceptTypes: {
    type: String,
    default: 'image/jpeg,image/png,image/webp',
  },

  // UI 설정
  uploadText: {
    type: String,
    default: '이미지를 업로드하세요',
  },
  uploadSubText: {
    type: String,
    default: '클릭하거나 파일을 드래그하세요',
  },
  uploadIcon: {
    type: String,
    default: 'mdi-cloud-upload',
  },
  iconSize: {
    type: [String, Number],
    default: 64,
  },
  iconColor: {
    type: String,
    default: 'grey-400',
  },
  chipColor: {
    type: String,
    default: 'primary',
  },

  // 드래그 앤 드롭
  enableDragDrop: {
    type: Boolean,
    default: true,
  },
})

// Emits 정의
const emit = defineEmits(['update:modelValue', 'upload', 'error'])

// Reactive data
const fileInput = ref(null)
const dropZone = ref(null)
const isDragging = ref(false)
const errorMessage = ref('')
const uploading = ref(false)
const uploadProgress = ref(0)
const previewImages = ref([])

// Computed
const hasImages = computed(() => previewImages.value.length > 0)

const dropZoneClass = computed(() => ({
  'drop-zone': true,
  'drop-zone--dragging': isDragging.value,
  'drop-zone--has-images': hasImages.value,
  clickable: true,
}))

const acceptTypesText = computed(() => {
  return props.acceptTypes
    .split(',')
    .map((type) => type.split('/')[1].toUpperCase())
    .join(', ')
})

const maxSizeText = computed(() => {
  const size = props.maxSize
  if (size >= 1024 * 1024) {
    return `${Math.round(size / (1024 * 1024))}MB`
  }
  return `${Math.round(size / 1024)}KB`
})

// Methods
const openFileDialog = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  processFiles(files)

  // input 초기화
  event.target.value = ''
}

const handleDragOver = (event) => {
  if (!props.enableDragDrop) return

  event.dataTransfer.dropEffect = 'copy'
  isDragging.value = true
}

const handleDragLeave = () => {
  if (!props.enableDragDrop) return
  isDragging.value = false
}

const handleDrop = (event) => {
  if (!props.enableDragDrop) return

  isDragging.value = false
  const files = Array.from(event.dataTransfer.files)
  processFiles(files)
}

const processFiles = (files) => {
  clearError()

  // 파일 타입 및 크기 검증
  const validFiles = []
  const acceptedTypes = props.acceptTypes.split(',').map((type) => type.trim())

  for (const file of files) {
    // 파일 타입 체크
    if (!acceptedTypes.includes(file.type)) {
      setError(`${file.name}: 지원하지 않는 파일 형식입니다.`)
      continue
    }

    // 파일 크기 체크
    if (file.size > props.maxSize) {
      setError(`${file.name}: 파일 크기가 너무 큽니다. (최대: ${maxSizeText.value})`)
      continue
    }

    // 최대 파일 수 체크
    if (previewImages.value.length + validFiles.length >= props.maxFiles) {
      setError(`최대 ${props.maxFiles}개의 파일만 업로드할 수 있습니다.`)
      break
    }

    validFiles.push(file)
  }

  // 미리보기 생성
  validFiles.forEach((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageData = {
        file,
        url: e.target.result,
        name: file.name,
        size: file.size,
      }

      if (props.multiple) {
        previewImages.value.push(imageData)
      } else {
        previewImages.value = [imageData]
      }

      updateModelValue()
    }
    reader.readAsDataURL(file)
  })
}

const removeImage = (index) => {
  previewImages.value.splice(index, 1)
  updateModelValue()
}

const updateModelValue = () => {
  const files = previewImages.value.map((img) => img.file)
  emit('update:modelValue', files)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const setError = (message) => {
  errorMessage.value = message
  emit('error', message)
}

const clearError = () => {
  errorMessage.value = ''
}

// Watch for external model value changes
watch(
  () => props.modelValue,
  (newFiles) => {
    if (newFiles.length === 0) {
      previewImages.value = []
    }
  },
  { deep: true },
)
</script>

<style scoped>
.image-upload-container {
  width: 100%;
}

.drop-zone {
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s ease;
  background-color: #fafafa;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drop-zone.clickable {
  cursor: pointer;
}

.drop-zone:hover {
  border-color: #1976d2;
  background-color: #f3f8ff;
}

.drop-zone--dragging {
  border-color: #1976d2;
  background-color: #e3f2fd;
  transform: scale(1.02);
}

.drop-zone--has-images {
  padding: 16px;
  min-height: auto;
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  width: 100%;
}

.image-preview-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.image-wrapper {
  position: relative;
}

.delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background-color: rgba(255, 255, 255, 0.9) !important;
}

.main-badge {
  position: absolute;
  bottom: 4px;
  left: 4px;
}

.add-more-btn {
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-more-btn:hover {
  border-color: #1976d2;
  background-color: #f3f8ff;
}

.image-info {
  text-align: center;
}

@media (max-width: 600px) {
  .image-preview-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
  }

  .drop-zone {
    padding: 16px;
    min-height: 160px;
  }
}
</style>
