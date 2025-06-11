<template>
  <v-container fluid class="pa-4">
    <v-row>
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="text-h6 pa-4">
            <v-icon class="mr-2" color="primary">mdi-pencil-plus</v-icon>
            AI 콘텐츠 생성
          </v-card-title>
          
          <v-divider />
          
          <v-card-text class="pa-4">
            <v-stepper
              v-model="currentStep"
              :items="stepperItems"
              alt-labels
            >
              <!-- Stepper Window로 각 단계 구현 -->
              <v-stepper-window>
                
                <!-- Step 1: 콘텐츠 타입 선택 -->
                <v-stepper-window-item value="1">
                  <v-card class="pa-4" flat>
                    <h3 class="text-h6 mb-4">어떤 콘텐츠를 만들까요?</h3>
                    
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-card
                          :class="['content-type-card', { 'selected': contentData.type === 'SNS_POST' }]"
                          @click="contentData.type = 'SNS_POST'"
                          hover
                        >
                          <v-card-text class="text-center pa-6">
                            <v-icon size="48" color="pink" class="mb-3">mdi-instagram</v-icon>
                            <h4 class="text-h6 mb-2">SNS 게시물</h4>
                            <p class="text-body-2">인스타그램 & 블로그용 게시물</p>
                          </v-card-text>
                        </v-card>
                      </v-col>
                      
                      <v-col cols="12" md="6">
                        <v-card
                          :class="['content-type-card', { 'selected': contentData.type === 'POSTER' }]"
                          @click="contentData.type = 'POSTER'"
                          hover
                        >
                          <v-card-text class="text-center pa-6">
                            <v-icon size="48" color="purple" class="mb-3">mdi-image</v-icon>
                            <h4 class="text-h6 mb-2">홍보 포스터</h4>
                            <p class="text-body-2">매장 게시용 포스터</p>
                          </v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-stepper-window-item>

                <!-- Step 2: 홍보 대상 선택 -->
                <v-stepper-window-item value="2">
                  <v-card class="pa-4" flat>
                    <h3 class="text-h6 mb-4">무엇을 홍보할까요?</h3>
                    
                    <v-radio-group v-model="contentData.target">
                      <v-radio label="🍜 메뉴 홍보" value="menu" />
                      <v-radio label="🏪 매장 소개" value="store" />
                      <v-radio label="🎉 이벤트 홍보" value="event" />
                    </v-radio-group>
                    
                    <!-- 메뉴 선택 -->
                    <v-select
                      v-if="contentData.target === 'menu'"
                      v-model="contentData.selectedMenu"
                      label="홍보할 메뉴 선택"
                      variant="outlined"
                      :items="menuOptions"
                      item-title="text"
                      item-value="value"
                      class="mt-4"
                    />
                    
                    <!-- 이벤트 입력 -->
                    <v-text-field
                      v-if="contentData.target === 'event'"
                      v-model="contentData.eventName"
                      label="이벤트명"
                      variant="outlined"
                      placeholder="예: 신메뉴 출시 이벤트"
                      class="mt-4"
                    />
                  </v-card>
                </v-stepper-window-item>

                <!-- Step 3: 이미지 업로드 -->
                <v-stepper-window-item value="3">
                  <v-card class="pa-4" flat>
                    <h3 class="text-h6 mb-4">이미지를 업로드하세요</h3>
                    
                    <v-file-input
                      v-model="contentData.images"
                      label="이미지 파일"
                      variant="outlined"
                      accept="image/*"
                      multiple
                      prepend-icon="mdi-camera"
                      show-size
                      chips
                      class="mb-4"
                    />
                    
                    <!-- 이미지 미리보기 -->
                    <v-row v-if="imagePreviewUrls.length > 0">
                      <v-col
                        v-for="(url, index) in imagePreviewUrls"
                        :key="index"
                        cols="6"
                        md="3"
                      >
                        <v-card class="pa-2">
                          <v-img :src="url" height="100" cover />
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-stepper-window-item>

                <!-- Step 4: 세부 옵션 -->
                <v-stepper-window-item value="4">
                  <v-card class="pa-4" flat>
                    <h3 class="text-h6 mb-4">세부 옵션을 설정하세요</h3>
                    
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-select
                          v-model="contentData.toneAndManner"
                          label="톤앤매너"
                          variant="outlined"
                          :items="TONE_OPTIONS"
                          item-title="text"
                          item-value="value"
                        />
                      </v-col>
                      
                      <v-col cols="12" md="6">
                        <v-select
                          v-model="contentData.emotionIntensity"
                          label="감정 강도"
                          variant="outlined"
                          :items="EMOTION_INTENSITY"
                          item-title="text"
                          item-value="value"
                        />
                      </v-col>
                      
                      <v-col cols="12" md="6">
                        <v-select
                          v-model="contentData.promotion"
                          label="프로모션 정보"
                          variant="outlined"
                          :items="PROMOTION_OPTIONS"
                          item-title="text"
                          item-value="value"
                        />
                      </v-col>
                      
                      <!-- SNS 플랫폼 선택 (SNS 게시물인 경우만) -->
                      <v-col
                        v-if="contentData.type === 'SNS_POST'"
                        cols="12" md="6"
                      >
                        <v-select
                          v-model="contentData.platform"
                          label="게시 플랫폼"
                          variant="outlined"
                          :items="platformOptions"
                          item-title="text"
                          item-value="value"
                        />
                      </v-col>
                    </v-row>
                    
                    <!-- 기간 설정 -->
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="contentData.startDate"
                          label="홍보 시작일"
                          variant="outlined"
                          type="date"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="contentData.endDate"
                          label="홍보 종료일"
                          variant="outlined"
                          type="date"
                        />
                      </v-col>
                    </v-row>
                  </v-card>
                </v-stepper-window-item>

                <!-- Step 5: 생성 결과 -->
                <v-stepper-window-item value="5">
                  <v-card class="pa-4" flat>
                    <h3 class="text-h6 mb-4">생성된 콘텐츠</h3>
                    
                    <v-card
                      v-if="generatedContent"
                      class="pa-4 mb-4"
                      color="blue-grey-lighten-5"
                      variant="tonal"
                    >
                      <h4 class="text-h6 mb-2">{{ generatedContent.title }}</h4>
                      <div class="text-body-1 mb-3" style="white-space: pre-line;">
                        {{ generatedContent.content }}
                      </div>
                      
                      <!-- 해시태그 (SNS인 경우) -->
                      <div
                        v-if="generatedContent.hashtags && generatedContent.hashtags.length > 0"
                        class="mb-3"
                      >
                        <v-chip
                          v-for="tag in generatedContent.hashtags"
                          :key="tag"
                          class="mr-1 mb-1"
                          size="small"
                          color="primary"
                        >
                          {{ tag }}
                        </v-chip>
                      </div>
                    </v-card>
                    
                    <!-- 로딩 상태 -->
                    <v-card
                      v-else-if="generating"
                      class="pa-8 text-center"
                    >
                      <v-progress-circular
                        indeterminate
                        color="primary"
                        size="64"
                        class="mb-4"
                      />
                      <p class="text-body-1">AI가 콘텐츠를 생성하고 있습니다...</p>
                      <p class="text-body-2 grey--text">잠시만 기다려주세요</p>
                    </v-card>
                    
                    <!-- 생성 실패 -->
                    <v-card
                      v-else-if="generationError"
                      class="pa-6 text-center"
                      color="error"
                      variant="tonal"
                    >
                      <v-icon size="48" color="error" class="mb-2">mdi-alert-circle</v-icon>
                      <p class="text-body-1">콘텐츠 생성에 실패했습니다</p>
                      <p class="text-body-2">{{ generationError }}</p>
                    </v-card>
                  </v-card>
                </v-stepper-window-item>
                
              </v-stepper-window>
            </v-stepper>
          </v-card-text>
          
          <v-divider />
          
          <!-- 액션 버튼 -->
          <v-card-actions class="pa-4">
            <v-btn
              v-if="currentStep > 1"
              color="grey"
              variant="outlined"
              @click="currentStep--"
            >
              이전
            </v-btn>
            
            <v-spacer />
            
            <!-- 다음/생성 버튼 -->
            <v-btn
              v-if="currentStep < 5"
              color="primary"
              :disabled="!canProceed"
              @click="nextStep"
            >
              {{ currentStep === 4 ? 'AI 생성하기' : '다음' }}
            </v-btn>
            
            <!-- 저장 버튼 -->
            <v-btn
              v-if="currentStep === 5 && generatedContent"
              color="success"
              :loading="saving"
              @click="saveContent"
            >
              저장하기
            </v-btn>
            
            <!-- 재생성 버튼 -->
            <v-btn
              v-if="currentStep === 5"
              color="primary"
              variant="outlined"
              :loading="generating"
              @click="regenerateContent"
            >
              다시 생성
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- 성공 스낵바 -->
    <v-snackbar
      v-model="showSuccess"
      color="success"
      timeout="3000"
    >
      콘텐츠가 성공적으로 저장되었습니다!
    </v-snackbar>
    
    <!-- 에러 스낵바 -->
    <v-snackbar
      v-model="showError"
      color="error"
      timeout="3000"
    >
      {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>