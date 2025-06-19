//* src/components/poster/PosterPreview.vue
<template>
  <div class="poster-preview">
    <!-- 로딩 상태 -->
    <div v-if="loading" class="text-center py-12">
      <v-progress-circular
        indeterminate
        size="64"
        color="primary"
        class="mb-4"
      />
      <div class="text-h6">포스터 생성 중...</div>
      <div class="text-body-2 text-grey-600 mt-2">AI가 멋진 포스터를 만들고 있어요</div>
    </div>

    <!-- 포스터 없음 -->
    <div v-else-if="!posterData" class="text-center py-12">
      <v-icon size="80" color="grey-lighten-2" class="mb-4">
        mdi-image-outline
      </v-icon>
      <div class="text-h6 mb-2">포스터 미리보기</div>
      <div class="text-body-2 text-grey-600">
        좌측 폼을 작성하고 'AI 포스터 생성' 버튼을 클릭하세요
      </div>
    </div>

    <!-- 생성된 포스터 -->
    <div v-else class="poster-result">
      <!-- 포스터 이미지 -->
      <div class="poster-image-container mb-4">
        <v-img
          :src="posterData.posterImage || '/images/placeholder-poster.jpg'"
          :alt="posterData.title"
          cover
          class="rounded-lg elevation-4"
          style="aspect-ratio: 3/4; max-height: 400px;"
        >
          <template v-slot:placeholder>
            <div class="d-flex align-center justify-center fill-height">
              <v-progress-circular indeterminate />
            </div>
          </template>
          
          <template v-slot:error>
            <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
              <v-icon size="48" color="grey">mdi-image-broken</v-icon>
            </div>
          </template>
        </v-img>

        <!-- 이미지 액션 버튼 -->
        <div class="image-actions mt-3">
          <v-btn
            size="small"
            variant="outlined"
            prepend-icon="mdi-download"
            @click="downloadPoster"
            class="mr-2"
          >
            다운로드
          </v-btn>
          
          <v-btn
            size="small"
            variant="outlined"
            prepend-icon="mdi-share-variant"
            @click="sharePoster"
          >
            공유
          </v-btn>
        </div>
      </div>

      <!-- 포스터 정보 -->
      <v-card variant="outlined" class="mb-4">
        <v-card-title class="text-h6">
          {{ posterData.title }}
        </v-card-title>
        
        <v-card-text>
          <div v-if="posterData.content" class="mb-3">
            <div class="text-subtitle-2 mb-1">포스터 내용:</div>
            <div class="text-body-2">{{ posterData.content }}</div>
          </div>

          <div class="d-flex align-center mb-2">
            <v-chip
              :color="getStatusColor(posterData.status)"
              size="small"
              class="mr-2"
            >
              {{ getStatusText(posterData.status) }}
            </v-chip>
            <v-chip
              color="primary"
              size="small"
              variant="outlined"
            >
              {{ posterData.contentType }}
            </v-chip>
          </div>

          <div v-if="posterData.imageStyle" class="text-caption text-grey-600">
            스타일: {{ posterData.imageStyle }}
          </div>
        </v-card-text>
      </v-card>

      <!-- 포스터 사이즈 옵션 -->
      <v-card v-if="posterData.posterSizes && Object.keys(posterData.posterSizes).length > 0" variant="outlined">
        <v-card-title class="text-subtitle-1">
          <v-icon class="mr-2">mdi-resize</v-icon>
          다양한 사이즈
        </v-card-title>
        
        <v-card-text>
          <div class="d-flex flex-wrap gap-2">
            <v-chip
              v-for="(url, size) in posterData.posterSizes"
              :key="size"
              @click="viewPosterSize(size, url)"
              class="cursor-pointer"
              variant="outlined"
            >
              {{ size }}
            </v-chip>
          </div>
        </v-card-text>
      </v-card>

      <!-- 원본 이미지들 -->
      <div v-if="posterData.originalImages && posterData.originalImages.length > 0" class="mt-4">
        <div class="text-subtitle-2 mb-2">사용된 원본 이미지:</div>
        <v-row>
          <v-col
            v-for="(image, index) in posterData.originalImages"
            :key="index"
            cols="6"
            sm="4"
          >
            <v-img
              :src="image"
              :alt="`원본 이미지 ${index + 1}`"
              cover
              height="80"
              class="rounded"
            />
          </v-col>
        </v-row>
      </div>
    </div>

    <!-- 포스터 사이즈 보기 다이얼로그 -->
    <v-dialog v-model="showSizeDialog" max-width="600">
      <v-card>
        <v-card-title>
          포스터 사이즈: {{ selectedSize }}
        </v-card-title>
        
        <v-card-text class="text-center">
          <v-img
            :src="selectedSizeUrl"
            :alt="`포스터 ${selectedSize}`"
            contain
            max-height="400"
          />
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            prepend-icon="mdi-download"
            @click="downloadSelectedSize"
          >
            다운로드
          </v-btn>
          <v-btn @click="showSizeDialog = false">
            닫기
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'

/**
 * 포스터 미리보기 컴포넌트
 * - 생성된 포스터 표시
 * - 다운로드 및 공유 기능
 * - 다양한 사이즈 보기
 */

// Props 정의
const props = defineProps({
  posterData: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// 반응형 데이터
const showSizeDialog = ref(false)
const selectedSize = ref('')
const selectedSizeUrl = ref('')

/**
 * 상태 색상 반환
 */
const getStatusColor = (status) => {
  const colors = {
    'DRAFT': 'orange',
    'PUBLISHED': 'success',
    'ARCHIVED': 'grey'
  }
  return colors[status] || 'primary'
}

/**
 * 상태 텍스트 반환
 */
const getStatusText = (status) => {
  const texts = {
    'DRAFT': '임시저장',
    'PUBLISHED': '발행',
    'ARCHIVED': '보관'
  }
  return texts[status] || status
}

/**
 * 포스터 다운로드
 */
const downloadPoster = () => {
  if (!props.posterData?.posterImage) return

  const link = document.createElement('a')
  link.href = props.posterData.posterImage
  link.download = `${props.posterData.title || '포스터'}.jpg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 포스터 공유
 */
const sharePoster = async () => {
  if (!props.posterData?.posterImage) return

  if (navigator.share) {
    try {
      await navigator.share({
        title: props.posterData.title,
        text: '생성된 홍보 포스터를 확인해보세요!',
        url: props.posterData.posterImage
      })
    } catch (error) {
      console.log('공유 취소됨')
    }
  } else {
    // 클립보드에 URL 복사
    try {
      await navigator.clipboard.writeText(props.posterData.posterImage)
      // 성공 알림 표시 (부모 컴포넌트에서 처리)
    } catch (error) {
      console.error('클립보드 복사 실패:', error)
    }
  }
}

/**
 * 특정 사이즈 포스터 보기
 */
const viewPosterSize = (size, url) => {
  selectedSize.value = size
  selectedSizeUrl.value = url
  showSizeDialog.value = true
}

/**
 * 선택된 사이즈 포스터 다운로드
 */
const downloadSelectedSize = () => {
  const link = document.createElement('a')
  link.href = selectedSizeUrl.value
  link.download = `${props.posterData.title || '포스터'}_${selectedSize.value}.jpg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
.poster-preview {
  min-height: 400px;
}

.poster-image-container {
  position: relative;
}

.image-actions {
  display: flex;
  justify-content: center;
}

.cursor-pointer {
  cursor: pointer;
}
</style>