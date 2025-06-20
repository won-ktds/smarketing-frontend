//* src/views/ContentCreationView.vue - 완전 통합 버전

<template>
  <v-container fluid class="pa-0" style="height: 100vh; overflow: hidden;">
    <!-- 책자 형식 레이아웃 -->
    <v-row no-gutters style="height: 100vh;">
      <!-- 왼쪽 패널: 콘텐츠 생성 기능 -->
      <v-col 
        :cols="generatedVersions.length === 0 ? 12 : 6" 
        :class="['left-panel', { 'left-panel-full': generatedVersions.length === 0 }]"
      >
        <v-card flat tile style="height: 100vh; overflow-y: auto;">
          <!-- 헤더 -->
          <div class="pa-4 d-flex align-center" style="min-height: 64px;">
            <v-btn
              icon="mdi-arrow-left"
              variant="text"
              @click="$router.go(-1)"
              class="mr-2"
            />
            <v-icon class="mr-2" color="primary">mdi-creation</v-icon>
            <h2 class="text-h5 font-weight-bold">콘텐츠 생성</h2>
            <v-spacer />
            <v-chip color="info" size="small">
              생성 가능: {{ remainingGenerations }}회
            </v-chip>
          </div>

          <v-divider />

          <v-card-text class="pa-4">
            <!-- 콘텐츠 타입 선택 -->
            <v-card class="mb-4" elevation="1">
              <v-card-title class="text-h6 py-3">콘텐츠 유형 선택</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col
                    v-for="type in contentTypes"
                    :key="type.value"
                    cols="6"
                  >
                    <v-card
                      :color="selectedType === type.value ? 'primary' : 'grey-lighten-4'"
                      :elevation="selectedType === type.value ? 8 : 2"
                      class="pa-3 text-center cursor-pointer"
                      @click="selectContentType(type.value)"
                    >
                      <v-icon
                        :color="selectedType === type.value ? 'white' : type.color"
                        size="32"
                        class="mb-2"
                      >
                        {{ type.icon }}
                      </v-icon>
                      <div
                        class="text-body-2 font-weight-medium"
                        :class="selectedType === type.value ? 'text-white' : ''"
                      >
                        {{ type.label }}
                      </div>
                      <div
                        class="text-caption"
                        :class="selectedType === type.value ? 'text-white' : 'text-grey'"
                      >
                        {{ type.description }}
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- 콘텐츠 생성 폼 - SNS와 포스터 통합 -->
            <div v-if="selectedType">
              <!-- 기본 정보 -->
              <v-card class="mb-4" elevation="1">
                <v-card-title class="text-h6 py-3">기본 정보</v-card-title>
                <v-card-text>
                  <v-form ref="contentForm" v-model="formValid">
                    <!-- 제목 -->
                    <v-text-field
                      v-model="formData.title"
                      :label="selectedType === 'poster' ? '포스터 제목' : '게시물 제목'"
                      variant="outlined"
                      :rules="titleRules"
                      required
                      density="compact"
                      class="mb-3"
                      :placeholder="selectedType === 'poster' ? '예: 신메뉴 출시 이벤트' : '예: 맛있는 신메뉴 소개'"
                    />

                    <!-- 플랫폼 선택 (SNS만) -->
                    <v-select
                      v-if="selectedType === 'sns'"
                      v-model="formData.platform"
                      :items="platformOptions"
                      label="발행 플랫폼"
                      variant="outlined"
                      :rules="platformRules"
                      required
                      density="compact"
                      class="mb-3"
                    >
                      <template v-slot:item="{ props, item }">
                        <v-list-item v-bind="props">
                          <template v-slot:prepend>
                            <v-icon :color="getPlatformColor(item.value)">
                              {{ getPlatformIcon(item.value) }}
                            </v-icon>
                          </template>
                        </v-list-item>
                      </template>
                    </v-select>

                    <!-- 홍보 대상 선택 (SNS) / 음식명 입력 (포스터) -->
                    <v-text-field
                      v-if="selectedType === 'poster'"
                      v-model="formData.menuName"
                      label="메뉴명"
                      variant="outlined"
                      :rules="menuNameRules"
                      required
                      density="compact"
                      class="mb-3"
                      placeholder="예: 치킨 마요 덮밥, 딸기 라떼"
                    />

                    <v-select
                      v-else
                      v-model="formData.targetType"
                      :items="getTargetTypes(selectedType)"
                      :label="selectedType === 'poster' ? '포스터 대상' : '홍보 대상'"
                      variant="outlined"
                      :rules="targetRules"
                      required
                      density="compact"
                      class="mb-3"
                      item-title="title"
                      item-value="value"
                      @update:model-value="handleTargetTypeChange"
                    />

                    <!-- 이벤트명 (SNS에서 이벤트 선택 시) -->
                    <v-text-field
                      v-if="selectedType === 'sns' && formData.targetType === 'event'"
                      v-model="formData.eventName"
                      label="이벤트명"
                      variant="outlined"
                      :rules="eventNameRules"
                      density="compact"
                      class="mb-3"
                      placeholder="예: 신메뉴 할인 이벤트"
                    />

                    <!-- 프로모션 기간 (포스터만) -->
                    <v-row v-if="selectedType === 'poster'">
                      <v-col cols="6">
                        <v-text-field
                          v-model="formData.promotionStartDate"
                          label="홍보 시작일"
                          type="date"
                          variant="outlined"
                          density="compact"
                          :rules="promotionStartDateRules"
                          required
                        />
                      </v-col>
                      <v-col cols="6">
                        <v-text-field
                          v-model="formData.promotionEndDate"
                          label="홍보 종료일"
                          type="date"
                          variant="outlined"
                          density="compact"
                          :rules="promotionEndDateRules"
                          required
                        />
                      </v-col>
                    </v-row>

                    <!-- 이벤트 기간 (SNS에서 이벤트인 경우) -->
                    <v-row v-if="selectedType === 'sns' && formData.targetType === 'event'">
                      <v-col cols="6">
                        <v-text-field
                          v-model="formData.startDate"
                          label="시작일"
                          type="date"
                          variant="outlined"
                          density="compact"
                          :rules="startDateRules"
                        />
                      </v-col>
                      <v-col cols="6">
                        <v-text-field
                          v-model="formData.endDate"
                          label="종료일"
                          type="date"
                          variant="outlined"
                          density="compact"
                          :rules="endDateRules"
                        />
                      </v-col>
                    </v-row>
                  </v-form>
                </v-card-text>
              </v-card>

              <!-- AI 설정 -->
              <v-card class="mb-4" elevation="1">
                <v-card-title class="text-h6 py-3">
                  <v-icon class="mr-2" color="primary">mdi-robot</v-icon>
                  AI 설정
                </v-card-title>
                <v-card-text>
                  <!-- 타겟 연령층 -->
                  <v-select
                    v-model="aiOptions.targetAge"
                    :items="targetAgeOptions"
                    label="타겟 연령층"
                    variant="outlined"
                    density="compact"
                    class="mb-3"
                  />

                  <!-- 요구사항 -->
                  <v-textarea
                    v-model="formData.requirements"
                    label="구체적인 요구사항"
                    variant="outlined"
                    rows="3"
                    density="compact"
                    :placeholder="selectedType === 'poster' ? 
                      '예: 밝고 활기찬 분위기의 포스터를 만들어주세요' : 
                      '예: 젊은 고객층을 타겟으로 트렌디한 문구를 사용하고 싶어요'"
                  />
                </v-card-text>
              </v-card>

              <!-- 이미지 업로드 -->
              <v-card class="mb-4" elevation="1">
                <v-card-title class="text-h6 py-3">
                  <v-icon class="mr-2" color="primary">mdi-camera</v-icon>
                  {{ selectedType === 'poster' ? '포스터용 이미지 업로드' : '사진 업로드 (선택사항)' }}
                </v-card-title>
                <v-card-text>
                  <v-file-input
                    v-model="uploadedFiles"
                    :label="selectedType === 'poster' ? '포스터에 포함할 이미지를 선택하세요' : '사진을 선택하세요'"
                    variant="outlined"
                    multiple
                    accept="image/*"
                    prepend-icon="mdi-camera"
                    @update:model-value="handleFileUpload"
                    density="compact"
                    :rules="selectedType === 'poster' ? imageRequiredRules : []"
                  />
                  
                  <!-- 미리보기 -->
                  <div v-if="previewImages.length > 0" class="mt-3">
                    <v-row>
                      <v-col
                        v-for="(image, index) in previewImages"
                        :key="index"
                        cols="3"
                      >
                        <v-card class="position-relative">
                          <v-img
                            :src="image.url"
                            aspect-ratio="1"
                            cover
                          />
                          <v-btn
                            icon="mdi-close"
                            size="small"
                            color="error"
                            class="position-absolute"
                            style="top: 4px; right: 4px;"
                            @click="removeImage(index)"
                          />
                        </v-card>
                      </v-col>
                    </v-row>
                  </div>
                </v-card-text>
              </v-card>

              <!-- 생성 버튼 -->
              <v-card class="mb-4" elevation="1">
                <v-card-text class="text-center">
                  <v-btn
                    color="primary"
                    size="large"
                    :disabled="!canGenerate || remainingGenerations <= 0 || isGenerating"
                    :loading="isGenerating"
                    @click="generateContent"
                    class="px-8"
                  >
                    <v-icon class="mr-2">{{ selectedType === 'poster' ? 'mdi-image' : 'mdi-robot' }}</v-icon>
                    {{ selectedType === 'poster' ? 'AI 포스터 생성하기' : 'AI로 콘텐츠 생성하기' }}
                  </v-btn>
                  
                  <div v-if="remainingGenerations <= 0" class="text-caption text-error mt-2">
                    생성 가능 횟수를 모두 사용했습니다.
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 오른쪽 패널: 생성된 콘텐츠 미리보기 -->
      <v-col 
        v-if="generatedVersions.length > 0"
        cols="6"
        class="right-panel"
      >
        <v-card flat tile style="height: 100vh; overflow-y: auto;">
          <!-- 헤더 -->
          <div class="pa-4 d-flex align-center" style="min-height: 64px;">
            <v-icon class="mr-2" color="success">mdi-eye</v-icon>
            <h2 class="text-h5 font-weight-bold">생성된 콘텐츠</h2>
            <v-spacer />
            <v-chip color="success" size="small">
              {{ generatedVersions.length }}개 생성됨
            </v-chip>
          </div>

          <v-divider />

          <v-card-text class="pa-4">
            <!-- 버전 목록 -->
            <div class="mb-4">
              <h3 class="text-h6 mb-3">생성된 버전들</h3>
              <v-row>
                <v-col
                  v-for="(version, index) in generatedVersions"
                  :key="`version-${index}`"
                  cols="12"
                  class="mb-3"
                >
                  <v-card
                    :color="selectedVersion === index ? 'primary' : 'grey-lighten-5'"
                    :elevation="selectedVersion === index ? 8 : 2"
                    class="cursor-pointer"
                    @click="selectVersion(index)"
                  >
                    <v-card-text class="pa-3">
                      <div class="d-flex justify-space-between align-center">
                        <div>
                          <div class="font-weight-medium text-subtitle-2">
                            버전 {{ index + 1 }}
                          </div>
                          <div class="text-caption text-grey">
                            {{ formatDateTime(version.createdAt) }}
                          </div>
                        </div>
                        <div class="d-flex align-center">
                          <v-chip
                            :color="getStatusColor(version.status)"
                            size="x-small"
                            class="mr-2"
                          >
                            {{ getStatusText(version.status) }}
                          </v-chip>
                          <v-icon
                            :color="selectedVersion === index ? 'white' : 'grey'"
                            size="20"
                          >
                            mdi-chevron-right
                          </v-icon>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <!-- 선택된 버전 미리보기 -->
            <div v-if="currentVersion">
              <h3 class="text-h6 mb-3">미리보기</h3>
              <v-card elevation="4" class="preview-card">
                <v-card-title class="d-flex align-center py-2">
                  <v-icon :color="getPlatformColor(currentVersion.platform)" class="mr-2">
                    {{ getPlatformIcon(currentVersion.platform) }}
                  </v-icon>
                  {{ getPlatformLabel(currentVersion.platform) }}
                  <v-spacer />
                  <v-btn
                    color="primary"
                    size="small"
                    @click="showDetailDialog = true"
                  >
                    자세히 보기
                  </v-btn>
                </v-card-title>
                
                <v-divider />
                
                <v-card-text class="pa-3">
                  <!-- 제목 -->
                  <div class="font-weight-bold text-h6 mb-2">
                    {{ currentVersion.title }}
                  </div>
                  
                  <!-- 콘텐츠 내용 -->
                  <div class="text-body-2 mb-3" style="line-height: 1.6;">
                    <!-- 포스터인 경우 이미지로 표시 -->
                    <div v-if="currentVersion.contentType === 'poster' || currentVersion.type === 'poster'">
                      <v-img
                        v-if="currentVersion.posterImage || currentVersion.content"
                        :src="currentVersion.posterImage || currentVersion.content"
                        :alt="currentVersion.title"
                        cover
                        class="rounded-lg elevation-2 mb-3"
                        style="max-width: 100%; max-height: 300px; aspect-ratio: 3/4;"
                        @click="previewImage(currentVersion.posterImage || currentVersion.content, currentVersion.title)"
                        @error="handleImageError"
                      >
                        <template v-slot:placeholder>
                          <div class="d-flex align-center justify-center fill-height bg-grey-lighten-4">
                            <v-progress-circular indeterminate color="primary" size="32" />
                            <span class="ml-2 text-grey">이미지 로딩 중...</span>
                          </div>
                        </template>
                        
                        <template v-slot:error>
                          <div class="d-flex flex-column align-center justify-center fill-height bg-grey-lighten-3">
                            <v-icon size="32" color="grey" class="mb-2">mdi-image-broken</v-icon>
                            <span class="text-caption text-grey">이미지를 불러올 수 없습니다</span>
                          </div>
                        </template>
                      </v-img>
                      
                      <div v-else class="d-flex flex-column align-center justify-center bg-grey-lighten-4 rounded-lg pa-8">
                        <v-icon size="48" color="grey" class="mb-2">mdi-image-off</v-icon>
                        <span class="text-body-2 text-grey">포스터 이미지가 없습니다</span>
                      </div>
                    </div>
                    
                    <!-- SNS인 경우 기존 텍스트 표시 -->
                    <div v-else>
                      <div v-if="isHtmlContent(currentVersion.content)" 
                           class="html-content preview-content">
                        <div v-html="truncateHtmlContent(currentVersion.content, 200)"></div>
                        <div v-if="currentVersion.content.length > 500" class="text-caption text-grey mt-2">
                          ... 더 보려면 '자세히 보기'를 클릭하세요
                        </div>
                      </div>
                      <div v-else>{{ truncateText(currentVersion.content, 150) }}</div>
                    </div>
                  </div>
                  
                  <!-- 해시태그 -->
                  <div v-if="currentVersion.hashtags && currentVersion.hashtags.length > 0" class="mb-3">
                    <v-chip
                      v-for="(hashtag, idx) in currentVersion.hashtags.slice(0, 5)"
                      :key="idx"
                      size="small"
                      color="primary"
                      variant="outlined"
                      class="mr-1 mb-1"
                    >
                      {{ hashtag }}
                    </v-chip>
                    <span v-if="currentVersion.hashtags.length > 5" class="text-caption text-grey">
                      +{{ currentVersion.hashtags.length - 5 }}개 더
                    </span>
                  </div>
                  
                  <!-- 액션 버튼 -->
                  <div class="d-flex gap-2">
                    <v-btn
                      color="success"
                      variant="flat"
                      @click="saveVersion(selectedVersion)"
                      :loading="isPublishing && publishingIndex === selectedVersion"
                      :disabled="currentVersion.status === 'published'"
                    >
                      <v-icon class="mr-1">mdi-content-save</v-icon>
                      저장하기
                    </v-btn>
                    
                    <v-btn
                      color="primary"
                      variant="outlined"
                      @click="copyFullContent(currentVersion)"
                    >
                      <v-icon class="mr-1">mdi-content-copy</v-icon>
                      복사
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 상세 다이얼로그 -->
    <v-dialog
      v-model="showDetailDialog"
      max-width="800"
      scrollable
    >
      <v-card v-if="currentVersion">
        <v-card-title class="d-flex align-center">
          <v-icon :color="getPlatformColor(currentVersion.platform)" class="mr-2">
            {{ getPlatformIcon(currentVersion.platform) }}
          </v-icon>
          {{ currentVersion.title }}
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="showDetailDialog = false"
          />
        </v-card-title>
        
        <v-divider />
        
        <v-card-text class="pa-4" style="max-height: 500px;">
          <!-- 포스터인 경우 이미지 표시, SNS인 경우 텍스트 표시 -->
          <div class="mb-4">
            <h4 class="text-h6 mb-2">콘텐츠</h4>
            
            <!-- 포스터인 경우 이미지로 표시 -->
            <div v-if="currentVersion.contentType === 'poster' || currentVersion.type === 'poster'">
              <v-img
                v-if="currentVersion.posterImage || currentVersion.content"
                :src="currentVersion.posterImage || currentVersion.content"
                :alt="currentVersion.title"
                cover
                class="rounded-lg elevation-2"
                style="max-width: 400px; aspect-ratio: 3/4; cursor: pointer;"
                @click="previewImage(currentVersion.posterImage || currentVersion.content, currentVersion.title)"
                @error="handleImageError"
              >
                <template v-slot:placeholder>
                  <div class="d-flex align-center justify-center fill-height bg-grey-lighten-4">
                    <v-progress-circular indeterminate color="primary" size="32" />
                    <span class="ml-2 text-grey">이미지 로딩 중...</span>
                  </div>
                </template>
                
                <template v-slot:error>
                  <div class="d-flex flex-column align-center justify-center fill-height bg-grey-lighten-3">
                    <v-icon size="32" color="grey" class="mb-2">mdi-image-broken</v-icon>
                    <span class="text-caption text-grey">이미지를 불러올 수 없습니다</span>
                    <span class="text-caption text-grey mt-1" style="word-break: break-all; max-width: 200px;">
                      {{ (currentVersion.posterImage || currentVersion.content)?.substring(0, 50) }}...
                    </span>
                  </div>
                </template>
              </v-img>
              
              <div v-else class="d-flex flex-column align-center justify-center bg-grey-lighten-4 rounded-lg pa-8">
                <v-icon size="48" color="grey" class="mb-2">mdi-image-off</v-icon>
                <span class="text-body-2 text-grey">포스터 이미지가 없습니다</span>
                <span class="text-caption text-grey mt-1" v-if="currentVersion.posterImage || currentVersion.content">
                  URL: {{ currentVersion.posterImage || currentVersion.content }}
                </span>
              </div>
            </div>
            
            <!-- SNS인 경우 기존 텍스트 표시 -->
            <div v-else>
              <div v-if="isHtmlContent(currentVersion.content)" 
                   class="pa-3 bg-grey-lighten-5 rounded html-content" 
                   style="line-height: 1.6;"
                   v-html="currentVersion.content">
              </div>
              <div v-else 
                   class="text-body-2 pa-3 bg-grey-lighten-5 rounded" 
                   style="white-space: pre-wrap; line-height: 1.6;">
                {{ currentVersion.content }}
              </div>
            </div>
          </div>
          
          <!-- 해시태그 -->
          <div v-if="currentVersion.hashtags && currentVersion.hashtags.length > 0" class="mb-4">
            <h4 class="text-h6 mb-2">해시태그</h4>
            <div>
              <v-chip
                v-for="(hashtag, idx) in currentVersion.hashtags"
                :key="idx"
                size="small"
                color="primary"
                variant="outlined"
                class="mr-1 mb-1"
              >
                {{ hashtag }}
              </v-chip>
            </div>
          </div>
          
          <!-- 메타 정보 -->
          <div>
            <h4 class="text-h6 mb-2">정보</h4>
            <v-list density="compact">
              <v-list-item>
                <v-list-item-title>플랫폼</v-list-item-title>
                <template v-slot:append>
                  <v-chip size="small" :color="getPlatformColor(currentVersion.platform)">
                    {{ getPlatformLabel(currentVersion.platform) }}
                  </v-chip>
                </template>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>홍보 대상</v-list-item-title>
                <template v-slot:append>
                  {{ currentVersion.targetType || '메뉴' }}
                </template>
              </v-list-item>
              <v-list-item v-if="currentVersion.eventName || formData.eventName">
                <v-list-item-title>이벤트명</v-list-item-title>
                <template v-slot:append>
                  {{ currentVersion.eventName || formData.eventName }}
                </template>
              </v-list-item>
              <v-list-item v-if="currentVersion.menuName || formData.menuName">
                <v-list-item-title>메뉴명</v-list-item-title>
                <template v-slot:append>
                  {{ currentVersion.menuName || formData.menuName }}
                </template>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>생성일시</v-list-item-title>
                <template v-slot:append>
                  {{ formatDateTime(currentVersion.createdAt) }}
                </template>
              </v-list-item>
            </v-list>
          </div>
        </v-card-text>
        
        <v-divider />
        
        <v-card-actions class="px-4 py-3">
          <v-spacer />
          <v-btn
            color="primary"
            variant="outlined"
            @click="copyFullContent(currentVersion)"
          >
            <v-icon class="mr-1">mdi-content-copy</v-icon>
            전체 복사
          </v-btn>
          <v-btn
            color="success"
            @click="saveVersion(selectedVersion); showDetailDialog = false"
            :loading="isPublishing && publishingIndex === selectedVersion"
            :disabled="currentVersion.status === 'published'"
          >
            <v-icon class="mr-1">mdi-content-save</v-icon>
            저장하기
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 로딩 오버레이 -->
    <v-overlay v-model="isGenerating" contained persistent class="d-flex align-center justify-center">
      <div class="text-center">
        <v-progress-circular color="primary" indeterminate size="64" class="mb-4" />
        <h3 class="text-h6 text-white mb-2">AI가 콘텐츠를 생성 중입니다</h3>
        <p class="text-white opacity-90">잠시만 기다려주세요...</p>
      </div>
    </v-overlay>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useContentStore } from '@/store/content'
import { useAppStore } from '@/store/app'

/**
 * 콘텐츠 생성 페이지
 * SNS 게시물, 홍보 포스터 등 마케팅 콘텐츠 생성
 */

const router = useRouter()
const contentStore = useContentStore()
const appStore = useAppStore()

// 반응형 데이터
const selectedType = ref('sns')
const uploadedFiles = ref([])
const previewImages = ref([])
const isPublishing = ref(false)
const isGenerating = ref(false)
const publishingIndex = ref(-1)
const showDetailDialog = ref(false)
const selectedVersion = ref(0)
const generatedVersions = ref([])
const remainingGenerations = ref(3)
const formValid = ref(false)

// 폼 데이터
const formData = ref({
  title: '',
  platform: '',
  targetType: '',
  menuName: '',
  eventName: '',
  startDate: '',
  endDate: '',
  content: '',
  hashtags: [],
  category: '기타',
  targetAge: '20대',
  promotionStartDate: '',
  promotionEndDate: '',
  requirements: '',
  toneAndManner: '친근함',
  emotionIntensity: '보통',
  imageStyle: '모던',
  promotionType: '할인 정보',
  photoStyle: '밝고 화사한'
})

// AI 옵션
const aiOptions = ref({
  toneAndManner: 'friendly',
  promotion: 'general',
  emotionIntensity: 'normal',
  photoStyle: '밝고 화사한',
  imageStyle: '모던',
  targetAge: '20대',
})

// 상수 정의
const contentTypes = [
  {
    value: 'sns',
    label: 'SNS 게시물',
    description: '인스타그램, 네이버블로그 등',
    icon: 'mdi-instagram',
    color: 'pink'
  },
  {
    value: 'poster',
    label: '홍보 포스터',
    description: '이벤트, 할인 포스터',
    icon: 'mdi-image',
    color: 'blue'
  }
]

const platformOptions = [
  { title: '인스타그램', value: 'instagram' },
  { title: '네이버 블로그', value: 'naver_blog' }
]

const targetTypes = [
  { title: '메뉴', value: 'menu' },
  { title: '매장', value: 'store' },
  { title: '이벤트', value: 'event' }
]

// 타겟 연령층 옵션
const targetAgeOptions = [
  { title: '10대', value: '10대' },
  { title: '20대', value: '20대' },
  { title: '30대', value: '30대' },
  { title: '40대', value: '40대' },
  { title: '50대', value: '50대' },
  { title: '60대 이상', value: '60대 이상' }
]

// 타입별 타겟 옵션 함수
const getTargetTypes = (type) => {
  if (type === 'poster') {
    return [
      { title: '메뉴', value: 'menu' },
      { title: '매장', value: 'store' },
      { title: '이벤트', value: 'event' },
      { title: '서비스', value: 'service' },
      { title: '할인혜택', value: 'discount' }
    ]
  }
  // SNS
  return [
    { title: '메뉴', value: 'menu' },
    { title: '매장', value: 'store' },
    { title: '이벤트', value: 'event' }
  ]
}

// 포스터 대상 선택 제한 함수들 (첫 번째 파일에서 추가)
const handleTargetItemClick = (value, event) => {
  if (selectedType.value === 'poster' && value !== 'menu') {
    event.preventDefault()
    event.stopPropagation()
    appStore.showSnackbar('현재 포스터는 메뉴 대상만 지원됩니다.', 'warning')
    return false
  }
}

const handleTargetTypeChange = (value) => {
  if (selectedType.value === 'poster' && value !== 'menu') {
    formData.value.targetType = 'menu'
    appStore.showSnackbar('현재 포스터는 메뉴 대상만 지원됩니다.', 'warning')
  }
}

// 유효성 검사 규칙
const titleRules = [
  v => !!v || '제목은 필수입니다',
  v => (v && v.length <= 100) || '제목은 100자 이하로 입력해주세요'
]

const platformRules = [
  v => !!v || '플랫폼을 선택해주세요'
]

const targetRules = [
  v => !!v || '홍보 대상을 선택해주세요'
]

const menuNameRules = [
  v => !!v || '메뉴명은 필수입니다',
  v => (v && v.length <= 50) || '메뉴명은 50자 이하로 입력해주세요'
]

const eventNameRules = [
  v => !formData.value.targetType || formData.value.targetType !== 'event' || !!v || '이벤트명은 필수입니다'
]

const startDateRules = [
  v => !formData.value.targetType || formData.value.targetType !== 'event' || !!v || '시작일은 필수입니다'
]

const endDateRules = [
  v => !formData.value.targetType || formData.value.targetType !== 'event' || !!v || '종료일은 필수입니다',
  v => !formData.value.startDate || !v || new Date(v) >= new Date(formData.value.startDate) || '종료일은 시작일보다 이후여야 합니다'
]

const imageRequiredRules = [
  v => selectedType.value !== 'poster' || (previewImages.value && previewImages.value.length > 0) || '포스터 생성을 위해 최소 1개의 이미지가 필요합니다'
]

const promotionStartDateRules = [
  v => selectedType.value !== 'poster' || !!v || '홍보 시작일은 필수입니다'
]

const promotionEndDateRules = [
  v => selectedType.value !== 'poster' || !!v || '홍보 종료일은 필수입니다',
  v => {
    if (selectedType.value !== 'poster' || !v || !formData.value.promotionStartDate) return true
    return new Date(v) > new Date(formData.value.promotionStartDate) || '종료일은 시작일보다 늦어야 합니다'
  }
]

// Computed 속성들
const canGenerate = computed(() => {
  try {
    if (!selectedType.value) return false
    if (!formData.value.title) return false
    
    // SNS 타입인 경우 플랫폼 필수
    if (selectedType.value === 'sns' && !formData.value.platform) return false
    
    // 포스터 타입인 경우 음식명과 이미지, 홍보 기간 필수
    if (selectedType.value === 'poster') {
      if (!formData.value.menuName) return false
      if (!previewImages.value || previewImages.value.length === 0) return false
      if (!formData.value.promotionStartDate || !formData.value.promotionEndDate) return false
    }
    
    // 이벤트 타입인 경우 추가 조건들
    if (formData.value.targetType === 'event') {
      if (!formData.value.eventName) return false
      if (!formData.value.startDate || !formData.value.endDate) return false
    }
    
    return true
  } catch (error) {
    console.error('❌ canGenerate computed 에러:', error)
    return false
  }
})

const currentVersion = computed(() => {
  return generatedVersions.value[selectedVersion.value] || null
})

// 메서드
const selectContentType = (type) => {
  selectedType.value = type
  console.log(`${type} 타입 선택됨 - 폼 데이터 초기화`)
  
  // ✅ 폼 데이터만 초기화 (생성된 콘텐츠는 보존)
  formData.value = {
    title: '',
    platform: '',
    targetType: type === 'poster' ? 'menu' : '', // 포스터는 메뉴로 기본 설정
    menuName: '',
    eventName: '',
    startDate: '',
    endDate: '',
    content: '',
    hashtags: [],
    category: '기타',
    targetAge: '20대',
    promotionStartDate: '',
    promotionEndDate: '',
    requirements: '',
    toneAndManner: '친근함',
    emotionIntensity: '보통',
    imageStyle: '모던',
    promotionType: '할인 정보',
    photoStyle: '밝고 화사한'
  }
  
  // ✅ 이미지 업로드 상태도 초기화
  uploadedFiles.value = []
  previewImages.value = []
  
  // ✅ AI 옵션도 초기화
  aiOptions.value = {
    toneAndManner: 'friendly',
    promotion: 'general',
    emotionIntensity: 'normal',
    photoStyle: '밝고 화사한',
    imageStyle: '모던',
    targetAge: '20대',
  }
  
  console.log('✅ 폼 데이터 초기화 완료:', {
    type: type,
    targetType: formData.value.targetType,
    preservedVersions: generatedVersions.value.length
  })
}

const handleFileUpload = (files) => {
  console.log('📁 파일 업로드 이벤트:', files)
  
  if (!files || (Array.isArray(files) && files.length === 0)) {
    console.log('📁 파일이 없음 - 기존 이미지 유지')
    return
  }
  
  let fileArray = []
  if (files instanceof FileList) {
    fileArray = Array.from(files)
  } else if (Array.isArray(files)) {
    fileArray = files
  } else {
    console.warn('⚠️ 파일 형태를 인식할 수 없음:', files)
    return
  }
  
  console.log('📁 처리할 파일 개수:', fileArray.length)
  
  previewImages.value = []
  
  fileArray.forEach((file, index) => {
    if (file && file.type && file.type.startsWith('image/')) {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        console.log(`📁 파일 ${index + 1} 읽기 완료: ${file.name}`)
        
        const existingIndex = previewImages.value.findIndex(img => img.name === file.name && img.size === file.size)
        
        if (existingIndex === -1) {
          previewImages.value.push({
            file: file,
            url: e.target.result,
            name: file.name,
            size: file.size
          })
          console.log(`✅ 파일 추가됨: ${file.name}, 현재 총 ${previewImages.value.length}개`)
        } else {
          console.log(`⚠️ 중복 파일 무시됨: ${file.name}`)
        }
      }
      
      reader.onerror = (error) => {
        console.error(`❌ 파일 ${index + 1} 읽기 실패:`, error)
      }
      
      reader.readAsDataURL(file)
    } else {
      console.warn(`⚠️ 이미지가 아닌 파일 건너뜀: ${file?.name}`)
    }
  })
}

const removeImage = (index) => {
  console.log('🗑️ 이미지 삭제:', index)
  previewImages.value.splice(index, 1)
  
  if (uploadedFiles.value && uploadedFiles.value.length > index) {
    const newFiles = Array.from(uploadedFiles.value)
    newFiles.splice(index, 1)
    uploadedFiles.value = newFiles
  }
}

// 1. generateContent 함수 - 완전한 버전
const generateContent = async () => {
  if (!formData.value.title?.trim()) {
    appStore.showSnackbar('제목을 입력해주세요.', 'warning')
    return
  }

  if (remainingGenerations.value <= 0) {
    appStore.showSnackbar('생성 가능 횟수를 모두 사용했습니다.', 'warning')
    return
  }

  // 포스터의 경우 메뉴 대상만 허용하는 최종 검증
  if (selectedType.value === 'poster' && formData.value.targetType !== 'menu') {
    appStore.showSnackbar('포스터는 메뉴 대상만 생성 가능합니다.', 'warning')
    formData.value.targetType = 'menu'
    return
  }

  isGenerating.value = true

  try {
    console.log('🚀 [UI] 콘텐츠 생성 시작')
    console.log('📋 [UI] 폼 데이터:', formData.value)
    console.log('📁 [UI] 이미지 데이터:', previewImages.value)
    
    // 매장 ID 가져오기 - API 호출로 변경
    let storeId = null
    
    try {
      const storeApiUrl = (window.__runtime_config__ && window.__runtime_config__.STORE_URL) 
        ? window.__runtime_config__.STORE_URL 
        : 'http://localhost:8082/api/store'
      
      const token = localStorage.getItem('accessToken') || localStorage.getItem('auth_token') || localStorage.getItem('token')
      
      if (!token) {
        throw new Error('인증 토큰이 없습니다.')
      }
      
      const storeResponse = await fetch(`${storeApiUrl}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (storeResponse.ok) {
        const storeData = await storeResponse.json()
        storeId = storeData.data?.storeId
        console.log('✅ 매장 정보 조회 성공, storeId:', storeId)
      } else {
        throw new Error(`매장 정보 조회 실패: ${storeResponse.status}`)
      }
    } catch (error) {
      console.error('❌ 매장 정보 조회 실패:', error)
      
      // fallback: localStorage에서 이전에 저장된 매장 정보 확인
      try {
        const storeInfo = JSON.parse(localStorage.getItem('storeInfo') || '{}')
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
        
        if (storeInfo.storeId) {
          storeId = storeInfo.storeId
          console.log('⚠️ fallback - localStorage에서 매장 ID 사용:', storeId)
        } else if (userInfo.storeId) {
          storeId = userInfo.storeId
          console.log('⚠️ fallback - userInfo에서 매장 ID 사용:', storeId)
        } else {
          throw new Error('매장 정보를 찾을 수 없습니다. 매장 관리 페이지에서 매장을 등록해주세요.')
        }
      } catch (fallbackError) {
        console.error('❌ fallback 실패:', fallbackError)
        throw new Error('매장 정보를 찾을 수 없습니다. 매장 관리 페이지에서 매장을 등록해주세요.')
      }
    }
    
    if (!storeId) {
      throw new Error('매장 ID를 가져올 수 없습니다. 매장 관리 페이지에서 매장을 등록해주세요.')
    }
    
    console.log('🏪 [UI] 사용할 매장 ID:', storeId)
    
    // Base64 이미지 URL 추출
    const imageUrls = previewImages.value?.map(img => img.url).filter(url => url) || []
    console.log('📁 [UI] 추출된 이미지 URL들:', imageUrls)
    
    // 포스터 타입의 경우 이미지 필수 검증
    if (selectedType.value === 'poster' && imageUrls.length === 0) {
      throw new Error('포스터 생성을 위해 최소 1개의 이미지가 필요합니다.')
    }

    // 콘텐츠 생성 데이터 구성
    const contentData = {
      title: formData.value.title,
      platform: formData.value.platform || (selectedType.value === 'poster' ? 'POSTER' : 'INSTAGRAM'),
      contentType: selectedType.value,
      type: selectedType.value,
      category: getCategory(formData.value.targetType),
      requirement: formData.value.requirements || `${formData.value.title}에 대한 ${selectedType.value === 'poster' ? '포스터' : 'SNS 게시물'}를 만들어주세요`,
      targetType: formData.value.targetType,
      targetAudience: formData.value.targetType,
      eventName: formData.value.eventName,
      eventDate: formData.value.eventDate,
      startDate: formData.value.startDate,
      endDate: formData.value.endDate,
      toneAndManner: formData.value.toneAndManner || '친근함',
      emotionIntensity: formData.value.emotionIntensity || '보통',
      images: imageUrls,
      storeId: storeId
    }

    // 포스터 전용 필드 추가
    if (selectedType.value === 'poster') {
      contentData.menuName = formData.value.menuName.trim()
      contentData.targetAudience = aiOptions.value.targetAge || '20대'
      contentData.category = '메뉴소개'
      
      if (formData.value.promotionStartDate) {
        contentData.promotionStartDate = new Date(formData.value.promotionStartDate).toISOString()
      }
      if (formData.value.promotionEndDate) {
        contentData.promotionEndDate = new Date(formData.value.promotionEndDate).toISOString()
      }
    }

    console.log('📤 [UI] 생성 요청 데이터:', contentData)

    // contentData 무결성 체크
    if (!contentData || typeof contentData !== 'object') {
      throw new Error('콘텐츠 데이터 구성에 실패했습니다.')
    }
    
    if (!Array.isArray(contentData.images)) {
      console.error('❌ [UI] contentData.images가 배열이 아님!')
      contentData.images = []
    }

    // Store 호출
    console.log('🚀 [UI] contentStore.generateContent 호출')
    const generated = await contentStore.generateContent(contentData)

    if (!generated || !generated.success) {
      throw new Error(generated?.message || '콘텐츠 생성에 실패했습니다.')
    }

    // 포스터 생성 결과 처리 개선
    let finalContent = ''
    let posterImageUrl = ''
    
    if (selectedType.value === 'poster') {
      posterImageUrl = generated.data?.posterImage || generated.data?.content || generated.content || ''
      finalContent = posterImageUrl
      
      console.log('🖼️ [UI] 포스터 이미지 URL:', posterImageUrl)
    } else {
      finalContent = generated.content || generated.data?.content || ''
      
      // SNS용 이미지 추가
      if (contentData.images && contentData.images.length > 0) {
        const imageHtml = contentData.images.map(imageUrl => 
          `<div style="margin-bottom: 15px; text-align: center;">
            <img src="${imageUrl}" style="width: 100%; max-width: 400px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
           </div>`
        ).join('')
        
        if (isHtmlContent(finalContent)) {
          finalContent = imageHtml + finalContent
        } else {
          finalContent = imageHtml + `<div style="padding: 15px; font-family: 'Noto Sans KR', Arial, sans-serif; line-height: 1.6;">${finalContent.replace(/\n/g, '<br>')}</div>`
        }
      }
    }
    
    // 생성된 콘텐츠 객체에 이미지 정보 포함
    const newContent = {
      id: Date.now() + Math.random(),
      ...contentData,
      content: finalContent,
      posterImage: posterImageUrl,
      hashtags: generated.hashtags || generated.data?.hashtags || [],
      createdAt: new Date(),
      status: 'draft',
      uploadedImages: previewImages.value || [],
      images: imageUrls,
      platform: contentData.platform || 'POSTER',
      menuName: formData.value.menuName || ''
    }

    generatedVersions.value.push(newContent)
    selectedVersion.value = generatedVersions.value.length - 1
    remainingGenerations.value--
    
    appStore.showSnackbar(`콘텐츠 버전 ${generatedVersions.value.length}이 생성되었습니다!`, 'success')
    
  } catch (error) {
    console.error('❌ [UI] 콘텐츠 생성 실패:', error)
    console.error('❌ [UI] 에러 스택:', error.stack)
    appStore.showSnackbar(error.message || '콘텐츠 생성 중 오류가 발생했습니다.', 'error')
  } finally {
    isGenerating.value = false
  }
}

const getCategory = (targetType) => {
  const mapping = {
    'new_menu': '메뉴소개',
    'discount': '이벤트',
    'store': '인테리어',
    'event': '이벤트',
    'menu': '메뉴소개',
    'service': '서비스'
  }
  return mapping[targetType] || '기타'
}

const selectVersion = (index) => {
  selectedVersion.value = index
}

// 2. saveVersion 함수 - 완전한 버전
const saveVersion = async (index) => {
  isPublishing.value = true
  publishingIndex.value = index
  
  try {
    const version = generatedVersions.value[index]
    
    console.log('💾 [UI] 저장할 버전 데이터:', version)
    
    // 매장 ID 가져오기 - API 호출로 변경
    let storeId = null
    
    try {
      const storeApiUrl = (window.__runtime_config__ && window.__runtime_config__.STORE_URL) 
        ? window.__runtime_config__.STORE_URL 
        : 'http://localhost:8082/api/store'
      
      const token = localStorage.getItem('accessToken') || localStorage.getItem('auth_token') || localStorage.getItem('token')
      
      if (!token) {
        throw new Error('인증 토큰이 없습니다.')
      }
      
      const storeResponse = await fetch(`${storeApiUrl}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (storeResponse.ok) {
        const storeData = await storeResponse.json()
        storeId = storeData.data?.storeId
        console.log('✅ [저장] 매장 정보 조회 성공, storeId:', storeId)
      } else {
        throw new Error(`매장 정보 조회 실패: ${storeResponse.status}`)
      }
    } catch (error) {
      console.error('❌ [저장] 매장 정보 조회 실패:', error)
      
      // fallback
      const storeInfo = JSON.parse(localStorage.getItem('storeInfo') || '{}')
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      
      if (storeInfo.storeId) {
        storeId = storeInfo.storeId
      } else if (userInfo.storeId) {
        storeId = userInfo.storeId
      } else {
        throw new Error('매장 정보를 찾을 수 없습니다.')
      }
    }
    
    if (!storeId) {
      throw new Error('매장 ID를 가져올 수 없습니다.')
    }
    
    console.log('🏪 [UI] 사용할 매장 ID:', storeId)
    
    // 이미지 데이터 준비
    let imageUrls = []
    
    if (selectedType.value === 'poster') {
      if (version.posterImage) {
        imageUrls.push(version.posterImage)
        console.log('💾 [UI] 생성된 포스터 이미지:', version.posterImage)
      }
      
      if (previewImages.value && previewImages.value.length > 0) {
        const originalImages = previewImages.value.map(img => img.url).filter(url => url)
        imageUrls = [...imageUrls, ...originalImages]
        console.log('💾 [UI] 원본 이미지들:', originalImages)
      }
      
      if (version.uploadedImages && version.uploadedImages.length > 0) {
        const versionImages = version.uploadedImages.map(img => img.url).filter(url => url)
        imageUrls = [...imageUrls, ...versionImages]
      }
      
      if (version.images && Array.isArray(version.images) && version.images.length > 0) {
        imageUrls = [...imageUrls, ...version.images]
      }
      
      imageUrls = [...new Set(imageUrls)]
      
      console.log('💾 [UI] 포스터 최종 이미지 URL들:', imageUrls)
      
      if (!imageUrls || imageUrls.length === 0) {
        throw new Error('포스터 저장을 위해 최소 1개의 이미지가 필요합니다.')
      }
    } else {
      if (previewImages.value && previewImages.value.length > 0) {
        imageUrls = previewImages.value.map(img => img.url).filter(url => url)
      }
      if (version.images && Array.isArray(version.images)) {
        imageUrls = [...new Set([...imageUrls, ...version.images])]
      }
    }
    
    console.log('💾 [UI] 최종 이미지 URL들:', imageUrls)
    
    // 저장 데이터 구성 - 타입에 따라 다르게 처리
    let saveData
    
    if (selectedType.value === 'poster') {
      saveData = {
        storeId: storeId,
        title: version.title,
        content: version.posterImage || version.content,
        images: imageUrls,
        category: getCategory(version.targetType || formData.value.targetType),
        requirement: formData.value.requirements || `${version.title}에 대한 포스터를 만들어주세요`,
        eventName: version.eventName || formData.value.eventName,
        startDate: formData.value.startDate,
        endDate: formData.value.endDate,
        photoStyle: formData.value.photoStyle || '밝고 화사한'
      }
    } else {
      saveData = {
        storeId: storeId,
        contentType: 'SNS',
        platform: version.platform || formData.value.platform || 'INSTAGRAM',
        title: version.title,
        content: version.content,
        hashtags: version.hashtags || [],
        images: imageUrls,
        category: getCategory(version.targetType || formData.value.targetType),
        requirement: formData.value.requirements || `${version.title}에 대한 SNS 게시물을 만들어주세요`,
        toneAndManner: formData.value.toneAndManner || '친근함',
        emotionIntensity: formData.value.emotionIntensity || '보통',
        eventName: version.eventName || formData.value.eventName,
        startDate: formData.value.startDate,
        endDate: formData.value.endDate,
        status: 'PUBLISHED'
      }
    }
    
    console.log('💾 [UI] 최종 저장 데이터:', saveData)
    
    await contentStore.saveContent(saveData)
    
    version.status = 'published'
    version.publishedAt = new Date()
    
    appStore.showSnackbar(`버전 ${index + 1}이 성공적으로 저장되었습니다!`, 'success')
    
    setTimeout(() => {
      if (confirm('저장된 콘텐츠를 확인하시겠습니까?')) {
        router.push('/content')
      }
    }, 1000)
  } catch (error) {
    console.error('❌ 콘텐츠 저장 실패:', error)
    appStore.showSnackbar(error.message || '콘텐츠 저장 중 오류가 발생했습니다.', 'error')
  } finally {
    isPublishing.value = false
    publishingIndex.value = -1
  }
}

const copyToClipboard = async (content) => {
  try {
    const textToCopy = isHtmlContent(content) ? extractTextFromHtml(content) : content
    
    await navigator.clipboard.writeText(textToCopy)
    appStore.showSnackbar('클립보드에 복사되었습니다.', 'success')
  } catch (error) {
    console.error('클립보드 복사 실패:', error)
    appStore.showSnackbar('복사에 실패했습니다.', 'error')
  }
}

// 개선된 복사 기능 - 포스터와 SNS 구분하여 처리
const copyFullContent = async (version) => {
  try {
    let fullContent = ''
    
    // 포스터인 경우 제목과 간단한 설명만 복사
    if (selectedType.value === 'poster' || version.contentType === 'poster' || version.type === 'poster') {
      fullContent = version.title || '포스터'
      if (formData.value.requirements) {
        fullContent += '\n\n' + formData.value.requirements
      }
      if (version.posterImage || version.content) {
        fullContent += '\n\n포스터 이미지: ' + (version.posterImage || version.content)
      }
    } else {
      // SNS 콘텐츠인 경우 HTML 태그 제거하고 텍스트만 추출
      if (isHtmlContent(version.content)) {
        fullContent += extractTextFromHtml(version.content)
      } else {
        fullContent += version.content || ''
      }
      
      // 해시태그 추가
      if (version.hashtags && version.hashtags.length > 0) {
        fullContent += '\n\n' + version.hashtags.join(' ')
      }
    }
    
    await navigator.clipboard.writeText(fullContent)
    appStore.showSnackbar('전체 콘텐츠가 클립보드에 복사되었습니다.', 'success')
  } catch (error) {
    console.error('전체 콘텐츠 복사 실패:', error)
    appStore.showSnackbar('복사에 실패했습니다.', 'error')
  }
}

// 유틸리티 함수들
const getPlatformIcon = (platform) => {
  const icons = {
    'instagram': 'mdi-instagram',
    'naver_blog': 'mdi-web',
    'facebook': 'mdi-facebook',
    'kakao_story': 'mdi-chat',
    'INSTAGRAM': 'mdi-instagram',
    'NAVER_BLOG': 'mdi-web',
    'FACEBOOK': 'mdi-facebook',
    'KAKAO_STORY': 'mdi-chat',
    'POSTER': 'mdi-image'
  }
  return icons[platform] || 'mdi-web'
}

const getPlatformColor = (platform) => {
  const colors = {
    'instagram': 'pink',
    'naver_blog': 'green',
    'facebook': 'blue',
    'kakao_story': 'amber',
    'INSTAGRAM': 'pink',
    'NAVER_BLOG': 'green',
    'FACEBOOK': 'blue',
    'KAKAO_STORY': 'amber',
    'POSTER': 'orange'
  }
  return colors[platform] || 'grey'
}

const getPlatformLabel = (platform) => {
  const labels = {
    'INSTAGRAM': '인스타그램',
    'NAVER_BLOG': '네이버 블로그',
    'POSTER': '포스터'
  }
  return labels[platform] || platform
}

const getStatusColor = (status) => {
  const colors = {
    'draft': 'grey',
    'published': 'success'
  }
  return colors[status] || 'grey'
}

const getStatusText = (status) => {
  const texts = {
    'draft': '임시저장',
    'published': '발행됨'
  }
  return texts[status] || status
}

const formatDateTime = (date) => {
  if (!date) return ''
  
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  
  const textOnly = text.replace(/<[^>]*>/g, '')
  
  if (textOnly.length <= maxLength) return textOnly
  return textOnly.substring(0, maxLength) + '...'
}

const isHtmlContent = (content) => {
  if (!content) return false
  return /<[^>]+>/.test(content)
}

// 개선된 HTML 텍스트 추출 함수
const extractTextFromHtml = (html) => {
  if (!html) return ''
  
  try {
    // HTML 태그를 제거하고 텍스트만 추출
    const textContent = html
      .replace(/<br\s*\/?>/gi, '\n')  // <br> 태그를 줄바꿈으로
      .replace(/<\/p>/gi, '\n\n')     // </p> 태그를 두 줄바꿈으로
      .replace(/<[^>]*>/g, '')        // 모든 HTML 태그 제거
      .replace(/&nbsp;/g, ' ')        // &nbsp; 를 공백으로
      .replace(/&amp;/g, '&')         // &amp; 를 &로
      .replace(/&lt;/g, '<')          // &lt; 를 <로
      .replace(/&gt;/g, '>')          // &gt; 를 >로
      .replace(/&quot;/g, '"')        // &quot; 를 "로
      .trim()
    
    return textContent
  } catch (error) {
    console.error('HTML 텍스트 추출 실패:', error)
    return html
  }
}

const truncateHtmlContent = (html, maxLength) => {
  if (!html) return ''
  
  const textContent = extractTextFromHtml(html)
  if (textContent.length <= maxLength) {
    return html
  }
  
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  
  const firstSection = tempDiv.querySelector('div[style*="background"]')
  if (firstSection) {
    return firstSection.outerHTML
  }
  
  return `<div style="padding: 10px; font-family: 'Noto Sans KR', Arial, sans-serif;">${truncateText(textContent, maxLength)}</div>`
}

const previewImage = (imageUrl, title) => {
  if (!imageUrl) return
  window.open(imageUrl, '_blank')
}

const handleImageError = (event) => {
  console.error('❌ 이미지 로딩 실패:', event.target?.src)
}

// 라이프사이클
onMounted(() => {
  console.log('📱 콘텐츠 생성 페이지 로드됨')
  
  // 초기 상태 확인
  console.log('🔍 초기 상태 확인:')
  console.log('- selectedType:', selectedType.value)
  console.log('- formData:', formData.value)
  console.log('- previewImages:', previewImages.value)
  console.log('- canGenerate 존재:', typeof canGenerate)
  
  // 5초 후 상태 재확인
  setTimeout(() => {
    console.log('🔍 5초 후 상태:')
    console.log('- formData.title:', formData.value.title)
    console.log('- formData.menuName:', formData.value.menuName)
    console.log('- canGenerate:', canGenerate?.value)
  }, 5000)
})

// 실시간 formData 변화 감지
watch(() => formData.value, (newVal) => {
  console.log('📝 formData 실시간 변경:', {
    title: newVal.title,
    menuName: newVal.menuName,
    targetType: newVal.targetType,
    promotionStartDate: newVal.promotionStartDate,
    promotionEndDate: newVal.promotionEndDate
  })
}, { deep: true })

// canGenerate 변화 감지  
watch(canGenerate, (newVal) => {
  console.log('🎯 canGenerate 변경:', newVal)
})

// previewImages 변화 감지
watch(() => previewImages.value, (newVal) => {
  console.log('📁 previewImages 변경:', newVal.length, '개')
}, { deep: true })
</script>

<style scoped>
.left-panel {
  border-right: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.left-panel-full {
  border-right: none;
}

.right-panel {
  background-color: #fafafa;
}

.cursor-pointer {
  cursor: pointer;
}

.preview-card {
  border: 2px solid #e3f2fd;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
}

@media (max-width: 960px) {
  .left-panel {
    border-right: none;
  }
  
  .right-panel {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1000;
    background: white;
  }
}

:deep(.html-content) {
  font-family: 'Noto Sans KR', Arial, sans-serif;
}

:deep(.html-content h1),
:deep(.html-content h2),
:deep(.html-content h3) {
  margin: 0;
  font-weight: bold;
}

:deep(.html-content p) {
  margin: 0 0 10px 0;
}

:deep(.html-content span[style*="#1DA1F2"]) {
  color: #1976d2 !important;
}

.preview-card :deep(.html-content) {
  font-size: 14px;
  line-height: 1.5;
}

.preview-content {
  max-height: 300px;
  overflow: hidden;
  position: relative;
}

.preview-content::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30px;
  background: linear-gradient(transparent, white);
  pointer-events: none;
}
</style>