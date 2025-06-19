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
        <!-- ✅ 이미지 URL 유효성 검사 후 렌더링 -->
        <v-img
          v-if="getPosterImageUrl()"
          :src="getPosterImageUrl()"
          :alt="posterData.title"
          cover
          class="rounded-lg elevation-4 poster-image"
          style="aspect-ratio: 3/4; max-height: 400px; width: 100%;"
        >
          <template v-slot:placeholder>
            <div class="d-flex align-center justify-center fill-height">
              <v-progress-circular indeterminate color="primary" />
              <span class="ml-2">이미지 로딩 중...</span>
            </div>
          </template>
          
          <template v-slot:error>
            <div class="d-flex flex-column align-center justify-center fill-height bg-grey-lighten-3">
              <v-icon size="48" color="grey" class="mb-2">mdi-image-broken</v-icon>
              <span class="text-body-2 text-grey">이미지를 불러올 수 없습니다</span>
              <span class="text-caption text-grey mt-1">{{ getPosterImageUrl() }}</span>
            </div>
          </template>
        </v-img>

        <!-- ✅ 이미지가 없거나 유효하지 않은 경우 -->
        <div v-else class="d-flex flex-column align-center justify-center fill-height bg-grey-lighten-4 rounded-lg" style="aspect-ratio: 3/4; max-height: 400px;">
          <v-icon size="48" color="grey" class="mb-2">mdi-image-off</v-icon>
          <span class="text-body-2 text-grey">포스터 이미지가 없습니다</span>
          <span class="text-caption text-grey mt-1" v-if="posterData.posterImage">
            URL: {{ posterData.posterImage }}
          </span>
        </div>

        <!-- 이미지 액션 버튼 -->
        <div class="image-actions mt-4 d-flex gap-2 justify-center">
          <v-btn
            color="primary"
            variant="outlined"
            prepend-icon="mdi-download"
            @click="downloadPoster"
            :disabled="!getPosterImageUrl()"
          >
            다운로드
          </v-btn>
          
          <v-btn
            color="secondary"
            variant="outlined"
            prepend-icon="mdi-share-variant"
            @click="sharePoster"
            :disabled="!getPosterImageUrl()"
          >
            공유
          </v-btn>
        </div>
      </div>

      <!-- 포스터 정보 -->
      <v-card class="mb-4" variant="outlined">
        <v-card-title class="text-h6">
          {{ posterData.title || '제목 없음' }}
        </v-card-title>
        
        <v-card-text>
          <div class="poster-details">
            <div v-if="posterData.targetAudience" class="detail-item mb-2">
              <v-icon class="mr-2" size="small">mdi-target</v-icon>
              <span class="text-body-2">
                <strong>홍보 대상:</strong> {{ posterData.targetAudience }}
              </span>
            </div>
            
            <div v-if="posterData.imageStyle" class="detail-item mb-2">
              <v-icon class="mr-2" size="small">mdi-palette</v-icon>
              <span class="text-body-2">
                <strong>이미지 스타일:</strong> {{ posterData.imageStyle }}
              </span>
            </div>
            
            <div v-if="posterData.category" class="detail-item mb-2">
              <v-icon class="mr-2" size="small">mdi-tag</v-icon>
              <span class="text-body-2">
                <strong>카테고리:</strong> {{ posterData.category }}
              </span>
            </div>
            
            <div v-if="posterData.promotionStartDate" class="detail-item mb-2">
              <v-icon class="mr-2" size="small">mdi-calendar-start</v-icon>
              <span class="text-body-2">
                <strong>홍보 기간:</strong> 
                {{ formatDate(posterData.promotionStartDate) }} 
                <span v-if="posterData.promotionEndDate">
                  ~ {{ formatDate(posterData.promotionEndDate) }}
                </span>
              </span>
            </div>

            <div v-if="posterData.status" class="detail-item">
              <v-chip 
                :color="getStatusColor(posterData.status)" 
                size="small"
                variant="flat"
              >
                {{ getStatusText(posterData.status) }}
              </v-chip>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- 다양한 사이즈 포스터 (있는 경우) -->
      <v-card v-if="posterData.posterSizes && Object.keys(posterData.posterSizes).length > 0" variant="outlined">
        <v-card-title class="text-h6">
          <v-icon class="mr-2">mdi-resize</v-icon>
          다양한 사이즈
        </v-card-title>
        
        <v-card-text>
          <div class="d-flex flex-wrap gap-2">
            <v-btn
              v-for="(url, size) in posterData.posterSizes"
              :key="size"
              variant="outlined"
              size="small"
              @click="viewPosterSize(size, url)"
              class="cursor-pointer"
            >
              {{ size }}
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- 사이즈별 포스터 보기 다이얼로그 -->
    <v-dialog v-model="showSizeDialog" max-width="600px">
      <v-card>
        <v-card-title>
          {{ selectedSize }} 포스터
        </v-card-title>
        
        <v-card-text>
          <v-img
            :src="selectedSizeUrl"
            cover
            class="rounded-lg"
            style="max-height: 500px;"
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
import { ref, computed } from 'vue'

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
 * ✅ 포스터 이미지 URL 검증 및 반환
 */
const getPosterImageUrl = () => {
  if (!props.posterData) return null
  
  const posterImage = props.posterData.posterImage
  
  // 디버깅을 위한 로그
  console.log('🖼️ [PosterPreview] 이미지 URL 검증:', {
    posterImage,
    type: typeof posterImage,
    length: posterImage?.length,
    isString: typeof posterImage === 'string',
    isValidUrl: posterImage && typeof posterImage === 'string' && posterImage.length > 10
  })
  
  // URL 유효성 검사
  if (posterImage && typeof posterImage === 'string' && posterImage.length > 10) {
    // HTTP(S) URL 또는 Data URL 확인
    if (posterImage.startsWith('http') || 
        posterImage.startsWith('data:image/') || 
        posterImage.startsWith('blob:') ||
        posterImage.startsWith('//')) {
      return posterImage
    }
  }
  
  console.warn('⚠️ [PosterPreview] 유효하지 않은 이미지 URL:', posterImage)
  return null
}

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
 * 날짜 포맷팅
 */
const formatDate = (dateString) => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    return dateString
  }
}

/**
 * ✅ 포스터 다운로드 - URL 검증 추가
 */
const downloadPoster = () => {
  const imageUrl = getPosterImageUrl()
  if (!imageUrl) {
    console.error('❌ [PosterPreview] 다운로드할 이미지 URL이 없습니다')
    return
  }

  console.log('📥 [PosterPreview] 포스터 다운로드 시도:', imageUrl)

  try {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `${props.posterData.title || '포스터'}.jpg`
    link.target = '_blank' // 새 탭에서 열기
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    console.log('✅ [PosterPreview] 다운로드 링크 클릭 완료')
  } catch (error) {
    console.error('❌ [PosterPreview] 다운로드 실패:', error)
  }
}

/**
 * ✅ 포스터 공유 - URL 검증 추가
 */
const sharePoster = async () => {
  const imageUrl = getPosterImageUrl()
  if (!imageUrl) {
    console.error('❌ [PosterPreview] 공유할 이미지 URL이 없습니다')
    return
  }

  console.log('🔗 [PosterPreview] 포스터 공유 시도:', imageUrl)

  if (navigator.share) {
    try {
      await navigator.share({
        title: props.posterData.title || '생성된 포스터',
        text: '생성된 홍보 포스터를 확인해보세요!',
        url: imageUrl
      })
      console.log('✅ [PosterPreview] 공유 완료')
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('❌ [PosterPreview] 공유 실패:', error)
      }
    }
  } else {
    // 클립보드에 URL 복사
    try {
      await navigator.clipboard.writeText(imageUrl)
      console.log('✅ [PosterPreview] 클립보드 복사 완료')
      // 성공 알림은 부모 컴포넌트에서 처리
    } catch (error) {
      console.error('❌ [PosterPreview] 클립보드 복사 실패:', error)
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
  if (!selectedSizeUrl.value) return
  
  const link = document.createElement('a')
  link.href = selectedSizeUrl.value
  link.download = `${props.posterData.title || '포스터'}_${selectedSize.value}.jpg`
  link.target = '_blank'
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

.poster-image {
  border: 1px solid #e0e0e0;
}

.image-actions {
  display: flex;
  justify-content: center;
}

.detail-item {
  display: flex;
  align-items: center;
}

.cursor-pointer {
  cursor: pointer;
}

.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}

/* 호버 효과 */
.v-btn:hover {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}

/* 이미지 로딩 애니메이션 */
.v-img {
  transition: opacity 0.3s ease;
}

/* 상세 정보 스타일링 */
.poster-details .detail-item {
  padding: 4px 0;
  border-bottom: 1px solid #f5f5f5;
}

.poster-details .detail-item:last-child {
  border-bottom: none;
}
</style>