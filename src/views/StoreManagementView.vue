storemanagement vue백업

<template>
  <v-container fluid class="pa-4">
    <!-- 뒤로가기 버튼과 제목 -->
    <div class="d-flex align-center mb-4">
      <v-btn
        icon
        variant="text"
        @click="$router.go(-1)"
        class="me-2"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <h1 class="text-h5 font-weight-bold">매장 관리</h1>
    </div>

    <!-- 매장 정보가 없는 경우 -->
    <div v-if="!storeStore.hasStoreInfo && !storeStore.loading">
      <v-row justify="center">
        <v-col cols="12" md="8">
          <v-card class="text-center pa-8" elevation="4">
            <v-img
              src="/images/store-placeholder.png"
              max-width="200"
              class="mx-auto mb-4"
            />
            <h2 class="text-h5 font-weight-bold mb-3">첫 매장을 등록해볼까요?</h2>
            <p class="text-grey mb-4">
              매장 정보를 등록하면 AI 마케팅 서비스를 이용할 수 있습니다
            </p>
            <div class="d-flex flex-column gap-3">
              <v-btn
                color="primary"
                size="large"
                prepend-icon="mdi-store-plus"
                @click="openCreateDialog"
              >
                매장 정보 등록하기
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- 매장 정보가 있는 경우 -->
    <div v-else-if="storeStore.hasStoreInfo">
      <!-- 탭 메뉴 -->
      <v-row class="mb-4">
        <v-col cols="12">
          <v-tabs v-model="currentTab" color="primary">
            <v-tab value="basic">기본 정보</v-tab>
            <v-tab value="menu">메뉴 관리</v-tab>
          </v-tabs>
        </v-col>
      </v-row>

      <v-tabs-window v-model="currentTab">
        <!-- 기본 정보 탭 -->
        <v-tabs-window-item value="basic">
          <v-card elevation="2">
            <v-card-title class="pa-4 d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-store</v-icon>
                매장 기본 정보
              </div>
              <v-btn
                color="primary"
                variant="outlined"
                prepend-icon="mdi-pencil"
                @click="editBasicInfo"
              >
                수정
              </v-btn>
            </v-card-title>
            
            <v-divider />
            
            <v-card-text class="pa-6">
              <v-row>
                <!-- 매장 이미지 -->
                <!-- 매장 이미지 섹션 -->
                <v-col cols="12" md="4" class="text-center">
                  <div class="store-image-container mb-3">
                    <!-- 매장 사진이 있을 때 -->
                    <v-avatar 
                      v-if="storeInfo.storeImage || storeInfo.imageUrl" 
                      size="120" 
                      class="store-avatar"
                    >
                      <v-img
                        :src="storeInfo.storeImage || storeInfo.imageUrl"
                        alt="매장 이미지"
                      />
                    </v-avatar>
                    
                    <!-- 매장 사진이 없을 때 - 업종별 이모지 표시 -->
                    <div 
                      v-else 
                      class="store-emoji-container d-flex align-center justify-center"
                      :style="{ 
                        width: '120px', 
                        height: '120px', 
                        borderRadius: '50%',
                        backgroundColor: getStoreColor(storeInfo.businessType),
                        fontSize: '48px'
                      }"
                    >
                      {{ getStoreEmoji(storeInfo.businessType) }}
                    </div>
                  </div>
                  
                  <h3 class="text-h6 font-weight-bold">{{ storeInfo.storeName }}</h3>
                  <p class="text-grey">{{ storeInfo.businessType }}</p>
                </v-col>


                <!-- 기본 정보 -->
                <v-col cols="12" md="8">
                  <v-row>
                    <v-col cols="12" sm="6">
                      <div class="info-item">
                        <v-icon class="mr-2" color="grey">mdi-map-marker</v-icon>
                        <div>
                          <div class="text-caption text-grey">주소</div>
                          <div class="text-body-1">{{ storeInfo.address || '미입력' }}</div>
                        </div>
                      </div>
                    </v-col>
                    
                    <v-col cols="12" sm="6">
                      <div class="info-item">
                        <v-icon class="mr-2" color="grey">mdi-phone</v-icon>
                        <div>
                          <div class="text-caption text-grey">전화번호</div>
                          <div class="text-body-1">{{ storeInfo.phoneNumber || '미입력' }}</div>
                        </div>
                      </div>
                    </v-col>
                    
                    <v-col cols="12" sm="6">
                      <div class="info-item">
                        <v-icon class="mr-2" color="grey">mdi-clock</v-icon>
                        <div>
                          <div class="text-caption text-grey">영업시간</div>
                          <div class="text-body-1">{{ storeInfo.businessHours || '미입력' }}</div>
                        </div>
                      </div>
                    </v-col>
                
                    <v-col cols="12" sm="6">
                      <div class="info-item">
                        <v-icon class="mr-2" color="grey">mdi-account-group</v-icon>
                        <div>
                          <div class="text-caption text-grey">좌석 수</div>
                          <div class="text-body-1">{{ storeInfo.seatCount || 0 }}석</div>
                        </div>
                      </div>
                    </v-col>
                    
                    <v-col cols="12" sm="6">
                      <div class="info-item">
                        <v-icon class="mr-2" color="grey">mdi-calendar-off</v-icon>
                        <div>
                          <div class="text-caption text-grey">휴무일</div>
                          <div class="text-body-1">{{ formatClosedDays(storeInfo.closedDays) }}</div>
                        </div>
                      </div>
                    </v-col>
                    
                    <v-col cols="12" sm="6">
                      <div class="info-item">
                        <v-icon class="mr-2" color="grey">mdi-instagram</v-icon>
                        <div>
                          <div class="text-caption text-grey">인스타그램</div>
                          <div class="text-body-1">{{ storeInfo.instaAccounts || '미입력' }}</div>
                        </div>
                      </div>
                    </v-col>
                  </v-row>
                  
                  <!-- 매장 소개 -->
                  <v-divider class="my-4" />
                  <div class="info-item">
                    <v-icon class="mr-2" color="grey">mdi-text</v-icon>
                    <div>
                      <div class="text-caption text-grey">매장 소개</div>
                      <div class="text-body-1">{{ storeInfo.description || '매장 소개가 없습니다' }}</div>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-tabs-window-item>

        <!-- 메뉴 관리 탭 -->
        <v-tabs-window-item value="menu">
          <!-- 검색 및 필터 섹션 -->
          <v-card class="mb-4" elevation="2">
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="menuSearch"
                    prepend-inner-icon="mdi-magnify"
                    label="메뉴 검색"
                    variant="outlined"
                    density="compact"
                    clearable
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="menuCategoryFilter"
                    :items="['전체', ...menuCategories]"
                    label="카테고리"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>
                <v-col cols="12" md="3" class="d-flex align-center gap-2">
                  <v-btn
                    color="primary"
                    variant="outlined"
                    prepend-icon="mdi-filter-off"
                    @click="clearFilters"
                    size="small"
                  >
                    필터 초기화
                  </v-btn>
                  <v-btn
                    color="primary"
                    prepend-icon="mdi-plus"
                    @click="openCreateMenuDialog"
                    size="small"
                  >
                    메뉴 추가
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- 메뉴 목록 -->
          <div v-if="filteredMenus.length > 0">
  <v-row>
    <v-col
      v-for="menu in filteredMenus"
      :key="menu.id || menu.menuId"
      cols="12"
      sm="6"
      md="4"
      lg="3"
    >
      <v-card
        class="menu-card h-100"
        elevation="3"
        @click="viewMenuDetail(menu)"
      >
        <!-- 이미지 영역 -->
        <div class="position-relative">
          <v-img
            :src="getMenuImageUrl(menu)"
            height="200"
            cover
            class="grey lighten-2"
            @error="handleImageError($event, menu)"
          >
            <template v-slot:placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-progress-circular
                  color="grey-lighten-4"
                  indeterminate
                />
              </div>
            </template>
            <template v-slot:error>
              <div class="d-flex align-center justify-center fill-height">
                <v-icon size="64" color="grey-lighten-2">mdi-image-off</v-icon>
              </div>
            </template>
          </v-img>
          
          <!-- 상태 뱃지 - 우상단 -->
          <div class="position-absolute top-0 right-0 pa-2">
            <div class="d-flex flex-column gap-1">
              <v-chip
                v-if="!menu.available"
                color="red"
                size="small"
                variant="flat"
              >
                품절
              </v-chip>
              <v-chip
                v-if="menu.recommended"
                color="orange"
                size="small"
                variant="flat"
              >
                추천
              </v-chip>
            </div>
          </div>
        </div>
        
        <!-- 카드 내용 -->
        <v-card-text class="pa-3">
          <!-- 메뉴명과 상태 -->
          <div class="d-flex justify-space-between align-start mb-2">
            <h4 class="text-subtitle-1 font-weight-bold line-clamp-1">
              {{ menu.menuName || menu.name }}
            </h4>
            <v-chip
              :color="menu.available ? 'green' : 'red'"
              size="small"
              variant="tonal"
              class="ml-2"
            >
              {{ menu.available ? '판매중' : '품절' }}
            </v-chip>
          </div>
          
          <!-- 설명 -->
          <p class="text-body-2 text-grey text-truncate-2 mb-2">
            {{ menu.description || '설명이 없습니다' }}
          </p>
          
          <!-- 가격과 카테고리 -->
          <div class="d-flex justify-space-between align-center mb-3">
            <span class="text-h6 font-weight-bold text-primary">
              {{ menu.price ? menu.price.toLocaleString() : '0' }}원
            </span>
            <v-chip
              size="small"
              variant="outlined"
              color="primary"
            >
              {{ menu.category }}
            </v-chip>
          </div>
          
          <!-- 액션 버튼들 - 카드 하단에 명확하게 배치 -->
          <div class="d-flex gap-2 mt-3">
            <v-btn
              color="primary"
              variant="outlined"
              size="small"
              prepend-icon="mdi-pencil"
              @click.stop="editMenu(menu)"
              class="flex-1"
            >
              수정
            </v-btn>
            <v-btn
              color="error"
              variant="outlined"
              size="small"
              prepend-icon="mdi-delete"
              @click.stop="confirmDeleteMenu(menu)"
              class="flex-1"
            >
              삭제
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</div>


          <!-- 메뉴가 없는 경우 -->
          <v-card v-else class="text-center pa-8" elevation="2">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-food-off</v-icon>
            <h3 class="text-h6 mb-2">등록된 메뉴가 없습니다</h3>
            <p class="text-grey mb-4">첫 번째 메뉴를 등록해보세요</p>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="openCreateMenuDialog"
            >
              메뉴 등록하기
            </v-btn>
          </v-card>
        </v-tabs-window-item>
      </v-tabs-window>
    </div>

    <!-- 로딩 상태 -->
    <div v-else class="text-center pa-8">
      <v-progress-circular indeterminate color="primary" size="64" />
      <p class="text-grey mt-4">매장 정보를 불러오는 중...</p>
    </div>

    <!-- 매장 등록/수정 다이얼로그 -->
    <v-dialog 
      v-model="showCreateDialog" 
      max-width="600" 
      persistent
      :style="{ zIndex: 2000 }"
      class="store-dialog"
    >
      <v-card class="store-dialog-card">
        <v-card-title class="pa-4">
          <div class="d-flex align-center">
            <v-icon class="mr-2" color="primary">mdi-store</v-icon>
            {{ editMode ? '매장 정보 수정' : '새 매장 등록' }}
          </div>
        </v-card-title>
        
        <v-divider />
        
        <!-- ✅ 스크롤 가능한 컨텐츠 영역 -->
        <v-card-text class="pa-4 store-dialog-content">
          <v-form ref="storeFormRef" v-model="formValid">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.storeName"
                  label="매장명 *"
                  :rules="[v => !!v || '매장명을 입력해주세요']"
                  variant="outlined"
                  density="compact"
                  required
                />
              </v-col>
              
              <v-col cols="12" sm="6">
                <v-select
                  v-model="formData.businessType"
                  :items="businessTypes"
                  label="업종 *"
                  :rules="[v => !!v || '업종을 선택해주세요']"
                  variant="outlined"
                  density="compact"
                  required
                />
              </v-col>
              
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="formData.seatCount"
                  label="좌석 수"
                  type="number"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              
              <v-col cols="12">
                <v-text-field
                  v-model="formData.address"
                  label="주소 *"
                  :rules="[v => !!v || '주소를 입력해주세요']"
                  variant="outlined"
                  density="compact"
                  required
                />
              </v-col>
              
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.phoneNumber"
                  label="전화번호"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.instagramUrl"
                  label="인스타그램 URL"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.openTime"
                  label="오픈 시간"
                  type="time"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.closeTime"
                  label="마감 시간"
                  type="time"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              
              <v-col cols="12">
                <v-select
                  v-model="formData.holidays"
                  :items="weekDays"
                  item-title="title"
                  item-value="value"
                  label="휴무일"
                  multiple
                  chips
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              
              <v-col cols="12">
                <v-text-field
                  v-model="formData.blogUrl"
                  label="블로그 URL"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              
              <v-col cols="12">
                <v-textarea
                  v-model="formData.description"
                  label="매장 소개"
                  variant="outlined"
                  density="compact"
                  rows="2"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            variant="text"
            @click="showCreateDialog = false"
          >
            취소
          </v-btn>
          <v-btn
            color="primary"
            @click="saveStore"
            :loading="saving"
            :disabled="!formValid"
          >
            {{ editMode ? '수정' : '등록' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 메뉴 등록/수정 다이얼로그 -->
    <v-dialog 
      v-model="showMenuDialog" 
      max-width="600" 
      persistent
      :style="{ zIndex: 2000 }"
      class="menu-dialog"
    >
      <v-card class="menu-dialog-card">
        <v-card-title class="pa-4">
          <div class="d-flex align-center">
            <v-icon class="mr-2" color="primary">mdi-food</v-icon>
            {{ menuEditMode ? '메뉴 수정' : '새 메뉴 등록' }}
          </div>
        </v-card-title>
        
        <v-divider />
        
        <!-- ✅ 스크롤 가능한 컨텐츠 영역 -->
        <v-card-text class="pa-4 dialog-content">
          <v-form ref="menuFormRef" v-model="menuFormValid">
            <v-row>
              <!-- 메뉴 이미지 업로드 -->
              <v-col cols="12">
                <div class="mb-4">
                  <h4 class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center">
                    <v-icon class="mr-2" color="primary">mdi-image</v-icon>
                    메뉴 이미지 {{ !menuEditMode ? '*' : '' }}
                  </h4>
                  
                  <!-- 이미지 미리보기 -->
                  <div v-if="shouldShowImagePreview" class="mb-3">
                    <v-img
                      :src="shouldShowImagePreview"
                      max-height="180"
                      max-width="280"
                      class="rounded mx-auto"
                      style="border: 2px solid #e0e0e0;"
                    />
                    <div class="text-center mt-2">
                      <v-chip 
                        v-if="previewImageUrl" 
                        color="success" 
                        size="small" 
                        class="mr-2"
                      >
                        새 이미지 선택됨
                      </v-chip>
                      <v-chip 
                        v-else-if="menuEditMode" 
                        color="info" 
                        size="small" 
                        class="mr-2"
                      >
                        현재 이미지
                      </v-chip>
                      <v-btn
                        size="small"
                        color="primary"
                        variant="outlined"
                        prepend-icon="mdi-image-edit"
                        @click="resetImageSelection"
                      >
                        다른 이미지 선택
                      </v-btn>
                    </div>
                  </div>
                  
                  <!-- 이미지 선택 섹션 -->
                  <div v-else>
                    <v-file-input
                      v-model="selectedImageFile"
                      label="메뉴 이미지 선택 *"
                      accept="image/*"
                      prepend-icon="mdi-camera"
                      variant="outlined"
                      density="compact"
                      :rules="[
                        v => menuEditMode || !!v || '메뉴 이미지는 필수입니다',
                        v => !v || v.size < 10485760 || '파일 크기는 10MB 이하여야 합니다',
                        v => !v || v.type.startsWith('image/') || '이미지 파일만 업로드 가능합니다'
                      ]"
                      @update:modelValue="onFileInputChange"
                      show-size
                      required
                    />
                    
                    <!-- 드래그앤드롭 영역 - 높이 축소 -->
                    <div
                      class="drop-zone pa-3 text-center"
                      style="border: 2px dashed #ccc; border-radius: 8px; background: #fafafa; min-height: 80px;"
                      @drop="onDropImage"
                      @dragover.prevent
                      @dragenter.prevent
                    >
                      <v-icon size="32" color="grey-lighten-2">mdi-cloud-upload</v-icon>
                      <p class="text-grey text-center mt-1 mb-1 text-caption">
                        이미지를 드래그하여 업로드하거나 위의 버튼을 클릭하세요
                      </p>
                      <p class="text-caption text-grey text-center">
                        JPG, PNG 파일만 업로드 가능 (최대 10MB)
                      </p>
                    </div>
                  </div>
                </div>
              </v-col>
              
              <v-col cols="12">
                <v-text-field
                  v-model="menuFormData.menuName"
                  label="메뉴명 *"
                  :rules="[v => !!v || '메뉴명을 입력해주세요']"
                  variant="outlined"
                  density="compact"
                  required
                />
              </v-col>
              
              <v-col cols="12" sm="6">
                <v-select
                  v-model="menuFormData.category"
                  :items="menuCategories"
                  label="카테고리 *"
                  :rules="[v => !!v || '카테고리를 선택해주세요']"
                  variant="outlined"
                  density="compact"
                  required
                />
              </v-col>
              
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="menuFormData.price"
                  label="가격 (원) *"
                  type="number"
                  :rules="[
                    v => !!v || '가격을 입력해주세요',
                    v => v > 0 || '가격은 0보다 커야 합니다'
                  ]"
                  variant="outlined"
                  density="compact"
                  required
                />
              </v-col>
              
              <v-col cols="12">
                <v-textarea
                  v-model="menuFormData.description"
                  label="메뉴 설명"
                  variant="outlined"
                  density="compact"
                  rows="2"
                />
              </v-col>
              
              <v-col cols="12" sm="6">
                <v-switch
                  v-model="menuFormData.available"
                  label="판매 가능"
                  color="primary"
                  density="compact"
                />
              </v-col>
              
              <v-col cols="12" sm="6">
                <v-switch
                  v-model="menuFormData.recommended"
                  label="추천 메뉴"
                  color="orange"
                  density="compact"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            variant="text"
            @click="cancelMenuForm"
          >
            취소
          </v-btn>
          <v-btn
            color="primary"
            @click="saveMenu"
            :loading="saving"
            :disabled="!menuFormValid"
          >
            {{ menuEditMode ? '수정' : '등록' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 메뉴 상세 다이얼로그 -->
    <v-dialog v-model="showMenuDetailDialog" max-width="500">
      <v-card v-if="selectedMenu">
        <v-img
          :src="getMenuImageUrl(selectedMenu)"
          height="250"
          cover
          @error="handleImageError($event, selectedMenu)"
        />
        
        <v-card-title class="pa-4 d-flex justify-space-between align-center">
          <span>{{ selectedMenu.menuName || selectedMenu.name }}</span>
          <v-chip
            :color="selectedMenu.available ? 'green' : 'red'"
            size="small"
          >
            {{ selectedMenu.available ? '판매중' : '품절' }}
          </v-chip>
        </v-card-title>
        
        <v-card-text class="pa-4">
          <div class="mb-3">
            <div class="text-caption text-grey">카테고리</div>
            <div class="text-body-1">{{ selectedMenu.category }}</div>
          </div>
          
          <div class="mb-3">
            <div class="text-caption text-grey">가격</div>
            <div class="text-h6 text-primary font-weight-bold">
              {{ selectedMenu.price ? selectedMenu.price.toLocaleString() : '0' }}원
            </div>
          </div>
          
          <div class="mb-3">
            <div class="text-caption text-grey">설명</div>
            <div class="text-body-1">{{ selectedMenu.description || '설명이 없습니다' }}</div>
          </div>
          
          <div v-if="selectedMenu.recommended" class="mb-3">
            <v-chip color="orange" size="small">추천 메뉴</v-chip>
          </div>
        </v-card-text>
        
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            variant="text"
            @click="closeMenuDetail"
          >
            닫기
          </v-btn>
          <v-btn
            color="primary"
            variant="text"
            @click="editMenu(selectedMenu); closeMenuDetail()"
          >
            수정
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 스낵바 -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="bottom"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>
<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useStoreStore } from '@/store/index'

const storeStore = useStoreStore()

// 반응형 상태
const currentTab = ref('basic')
const showCreateDialog = ref(false)
const editMode = ref(false)
const formValid = ref(false)
const saving = ref(false)
const storeFormRef = ref(null)

// 메뉴 관리 관련 상태
const menus = ref([])
const menuSearch = ref('')
const menuCategoryFilter = ref('전체')
const menuCategories = ref(['커피', '음료', '디저트', '베이커리', '샐러드', '샌드위치'])
const showMenuDialog = ref(false)
const menuEditMode = ref(false)
const menuFormRef = ref(null)
const menuFormValid = ref(false)

// 이미지 관련 상태
const selectedImageFile = ref(null)
const previewImageUrl = ref('')
const forceShowFileInput = ref(false) // ✅ 추가: 파일 입력 강제 표시용

// 메뉴 폼 데이터
const menuFormData = ref({
  menuName: '',
  category: '',
  price: 0,
  description: '',
  available: true,
  recommended: false,
  imageUrl: ''
})

// 메뉴 상세 관련 상태
const showMenuDetailDialog = ref(false)
const selectedMenu = ref(null)

// 스낵바 상태
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// 폼 데이터
const formData = ref({
  storeName: '',
  businessType: '',
  address: '',
  phoneNumber: '',
  seatCount: 0,
  instagramUrl: '',
  blogUrl: '',
  openTime: '09:00',
  closeTime: '21:00',
  holidays: [],
  description: ''
})

// 선택 옵션들
const businessTypes = [
  '카페', '레스토랑', '베이커리', '디저트', '주점', '패스트푸드', '기타'
]

const weekDays = [
  { title: '월요일', value: 'monday' },
  { title: '화요일', value: 'tuesday' },
  { title: '수요일', value: 'wednesday' },
  { title: '목요일', value: 'thursday' },
  { title: '금요일', value: 'friday' },
  { title: '토요일', value: 'saturday' },
  { title: '일요일', value: 'sunday' }
]

// 컴퓨티드 속성
const storeInfo = computed(() => storeStore.storeInfo || {})

// 메뉴 관련 컴퓨티드 속성
const filteredMenus = computed(() => {
  let filtered = menus.value

  // 검색 필터
  if (menuSearch.value) {
    const search = menuSearch.value.toLowerCase()
    filtered = filtered.filter(menu => 
      (menu.menuName || '').toLowerCase().includes(search) ||
      (menu.description || '').toLowerCase().includes(search)
    )
  }

  // 카테고리 필터
  if (menuCategoryFilter.value && menuCategoryFilter.value !== '전체') {
    filtered = filtered.filter(menu => menu.category === menuCategoryFilter.value)
  }

  return filtered
})

// 이미지 미리보기 표시 조건 수정
const shouldShowImagePreview = computed(() => {
  // ✅ 강제로 파일 입력을 보여줘야 하는 경우
  if (forceShowFileInput.value) {
    return null
  }
  
  // 1순위: 새로 선택한 이미지 미리보기
  if (previewImageUrl.value) {
    return previewImageUrl.value
  }
  
  // 2순위: 수정 모드일 때 기존 이미지
  if (menuEditMode.value && menuFormData.value.imageUrl) {
    return menuFormData.value.imageUrl
  }
  
  return null
})

// ✅ 추가: Store 스토어의 메뉴 상태를 감시하여 자동 동기화
watch(() => storeStore.menus, (newMenus) => {
  console.log('Store 스토어 메뉴 상태 변경 감지:', newMenus)
  menus.value = newMenus || []
}, { immediate: true, deep: true })

// ✅ 추가: 탭 변경 시 메뉴 조회
watch(currentTab, async (newTab) => {
  if (newTab === 'menu' && storeStore.hasStoreInfo && menus.value.length === 0) {
    console.log('메뉴 탭으로 전환, 메뉴 데이터 조회 시작')
    await loadMenus()
  }
})

// ===== 유틸리티 함수들 =====

/**
 * 메뉴 이미지 URL 처리 함수
 * Azure Blob Storage URL과 플레이스홀더 구분
 */
const getMenuImageUrl = (menu) => {
  if (!menu) return '/images/menu-placeholder.png'
  
  console.log('=== 메뉴 이미지 URL 처리 ===')
  console.log('메뉴 데이터:', menu)
  console.log('이미지 필드들:', {
    image: menu.image,
    imageUrl: menu.imageUrl,
    menuImageUrl: menu.menuImageUrl
  })
  
  // 1순위: Azure Blob Storage URL (https로 시작하는 실제 URL)
  const imageUrl = menu.image || menu.imageUrl || menu.menuImageUrl
  
  if (imageUrl && imageUrl.startsWith('https://')) {
    console.log('✅ Azure Blob Storage URL 사용:', imageUrl)
    return imageUrl
  }
  
  // 2순위: 상대 경로 이미지가 있다면 절대 경로로 변환
  if (imageUrl && imageUrl.startsWith('/images/')) {
    console.log('⚠️ 상대 경로 이미지, 절대 경로로 변환:', imageUrl)
    return imageUrl
  }
  
  // 3순위: 기본 플레이스홀더
  console.log('❌ 이미지 URL 없음, 플레이스홀더 사용')
  return '/images/menu-placeholder.png'
}

/**
 * 이미지 로딩 오류 처리
 */
const handleImageError = (event, menu) => {
  console.log('이미지 로딩 실패:', menu?.menuName || 'Unknown', event)
  // 이미지 로딩 실패 시 플레이스홀더로 변경
  if (event.target) {
    event.target.src = '/images/menu-placeholder.png'
  }
}

/**
 * 플레이스홀더 이미지 존재 여부 확인
 */
const checkPlaceholderImage = async () => {
  try {
    const response = await fetch('/images/menu-placeholder.png')
    if (!response.ok) {
      console.warn('⚠️ 플레이스홀더 이미지가 없습니다:', '/images/menu-placeholder.png')
      showSnackbar('기본 이미지 파일이 없습니다. public/images 폴더를 확인해주세요', 'warning')
    } else {
      console.log('✅ 플레이스홀더 이미지 확인됨')
    }
  } catch (error) {
    console.warn('플레이스홀더 이미지 확인 실패:', error)
  }
}

/**
 * 개발용 이미지 확인 함수
 */
const checkMenuImages = () => {
  console.log('=== 현재 메뉴 이미지 상태 확인 ===')
  menus.value.forEach((menu, index) => {
    console.log(`메뉴 ${index + 1}: ${menu.menuName}`)
    console.log('  - image:', menu.image)
    console.log('  - imageUrl:', menu.imageUrl)
    console.log('  - 최종 URL:', getMenuImageUrl(menu))
    console.log('  - Azure URL 여부:', getMenuImageUrl(menu).startsWith('https://'))
  })
}

const formatClosedDays = (closedDays) => {
  console.log('=== formatClosedDays 호출 ===')
  console.log('입력값:', closedDays, '타입:', typeof closedDays)
  
  if (!closedDays) {
    console.log('closedDays가 없음 -> 미설정')
    return '미설정'
  }
  
  // ✅ 문자열인 경우 (백엔드에서 받은 "thursday,saturday" 형태)
  if (typeof closedDays === 'string') {
    console.log('문자열 형태의 closedDays:', closedDays)
    
    // 빈 문자열인 경우
    if (closedDays.trim() === '') {
      console.log('빈 문자열 -> 연중무휴')
      return '연중무휴'
    }
    
    // ✅ 쉼표로 구분된 문자열을 배열로 변환 후 한글로 변환
    const dayArray = closedDays.split(',').map(day => day.trim()).filter(day => day)
    console.log('분리된 배열:', dayArray)
    
    const dayNames = {
      'monday': '월요일',
      'tuesday': '화요일', 
      'wednesday': '수요일',
      'thursday': '목요일',
      'friday': '금요일',
      'saturday': '토요일',
      'sunday': '일요일'
    }
    
    const koreanDays = dayArray.map(day => dayNames[day] || day).filter(day => day)
    console.log('한글 변환된 배열:', koreanDays)
    
    if (koreanDays.length === 0) {
      return '연중무휴'
    }
    
    const result = koreanDays.join(', ')
    console.log('최종 결과:', result)
    return result
  }
  
  // ✅ 배열인 경우 (기존 로직 유지)
  if (Array.isArray(closedDays)) {
    console.log('배열 형태의 closedDays:', closedDays)
    
    const dayNames = {
      'monday': '월요일',
      'tuesday': '화요일', 
      'wednesday': '수요일',
      'thursday': '목요일',
      'friday': '금요일',
      'saturday': '토요일',
      'sunday': '일요일'
    }
    
    const koreanDays = closedDays.map(day => dayNames[day] || day).filter(day => day)
    
    if (koreanDays.length === 0) {
      return '연중무휴'
    }
    
    return koreanDays.join(', ')
  }
  
  console.log('예상치 못한 형태 -> 미설정')
  return '미설정'
}

const showSnackbar = (message, color = 'success') => {
  snackbar.value.message = message
  snackbar.value.color = color
  snackbar.value.show = true
}

// ===== 이미지 관련 함수들 =====

// watch 추가 - selectedImageFile 변경 감지
watch(selectedImageFile, (newFile, oldFile) => {
  console.log('selectedImageFile 변경 감지:', newFile)
  
  // 실제로 다른 파일로 변경되었을 때만 로그 출력
  if (newFile && newFile !== oldFile) {
    console.log('새 파일 설정됨:', newFile.name)
  }
}, { immediate: false })

// ✅ 파일 입력 변경 감지 함수 개선
const onFileInputChange = (file) => {
  console.log('=== v-file-input v-model 변경 감지 ===')
  console.log('전달받은 file:', file)
  
  if (file) {
    // 파일이 선택되면 강제 표시 모드 해제
    forceShowFileInput.value = false
    selectedImageFile.value = file
    onImageFileSelected(file)
  } else {
    selectedImageFile.value = null
    previewImageUrl.value = ''
  }
}

// 이미지 파일 선택 처리 함수
const onImageFileSelected = (file) => {
  console.log('=== 이미지 파일 선택 처리 ===')
  console.log('선택된 파일:', file)
  
  if (!file) {
    console.log('파일이 선택되지 않음')
    selectedImageFile.value = null
    previewImageUrl.value = ''
    return
  }
  
  console.log('파일 크기:', file.size, '바이트')
  console.log('파일 타입:', file.type)
  
  // 파일 크기 체크 (10MB)
  if (file.size > 10485760) {
    showSnackbar('파일 크기는 10MB 이하여야 합니다', 'error')
    selectedImageFile.value = null
    previewImageUrl.value = ''
    return
  }
  
  // 이미지 파일 형식 체크
  if (!file.type.startsWith('image/')) {
    showSnackbar('이미지 파일만 업로드 가능합니다', 'error')
    selectedImageFile.value = null
    previewImageUrl.value = ''
    return
  }
  
  // 미리보기 URL 생성
  const reader = new FileReader()
  reader.onload = (e) => {
    previewImageUrl.value = e.target.result
    console.log('✅ 이미지 미리보기 생성 완료')
  }
  reader.readAsDataURL(file)
}

// ✅ StoreManagementView.vue의 uploadMenuImage 함수 직접 수정

// 이미지 업로드 함수 - 직접 axios 인스턴스 생성
const uploadMenuImage = async (menuId) => {
  if (!selectedImageFile.value) {
    console.log('업로드할 이미지 파일이 없음')
    return null
  }
  
  try {
    console.log('=== 메뉴 이미지 업로드 시작 ===')
    console.log('메뉴 ID:', menuId)
    console.log('이미지 파일:', selectedImageFile.value)
    
    const formData = new FormData()
    formData.append('file', selectedImageFile.value)
    
    // ✅ 직접 axios 인스턴스 생성 (import 문제 회피)
    const axios = (await import('axios')).default
    
    // ✅ 이미지 전용 API 인스턴스 생성
    const imageApiInstance = axios.create({
      baseURL: 'http://smarketing.20.249.184.228.nip.io', // 포트만 지정
      timeout: 30000,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    // JWT 토큰 추가
    const token = localStorage.getItem('accessToken')
    if (token) {
      imageApiInstance.defaults.headers.Authorization = `Bearer ${token}`
    }
    
    console.log('🎯 ImageController로 업로드: /api/menu/images/menu/' + menuId)
    
    // ✅ 올바른 전체 경로 지정
    const response = await imageApiInstance.post(`/api/menu/images/menu/${menuId}`, formData)
    
    console.log('이미지 업로드 응답:', response.data)
    
    // ✅ 응답 데이터 구조 확인 및 URL 추출
    let imageUrl = null
    
    if (response.data) {
      // MenuResponse 구조에서 이미지 URL 추출
      if (response.data.image) {
        imageUrl = response.data.image
      } else if (response.data.imageUrl) {
        imageUrl = response.data.imageUrl  
      } else if (response.data.data && response.data.data.image) {
        imageUrl = response.data.data.image
      }
    }
    
    if (imageUrl && imageUrl.startsWith('https://')) {
      console.log('✅ 이미지 업로드 성공!')
      console.log('🔗 Azure Blob Storage URL:', imageUrl)
      return imageUrl
    } else {
      console.warn('⚠️ 응답에서 유효한 이미지 URL을 찾을 수 없음:', response.data)
      return null
    }
    
  } catch (error) {
    console.error('❌ 이미지 업로드 실패:', error)
    console.error('에러 상세:', error.response?.data)
    
    // 구체적인 에러 메시지 제공
    if (error.response?.status === 500) {
      console.error('서버 내부 오류 - ImageController 처리 로직 확인 필요')
      showSnackbar('서버에서 이미지 처리 중 오류가 발생했습니다', 'error')
    } else if (error.response?.status === 404) {
      console.error('ImageController API 경로를 찾을 수 없음')
      showSnackbar('이미지 업로드 API를 찾을 수 없습니다', 'error')
    } else if (error.response?.status === 413) {
      console.error('파일 크기 초과')
      showSnackbar('파일 크기가 너무 큽니다', 'error')
    } else {
      showSnackbar('이미지 업로드에 실패했습니다', 'error')
    }
    
    return null
  }
}

// ✅ 개선된 이미지 선택 초기화 함수
const resetImageSelection = () => {
  console.log('=== 이미지 선택 초기화 시작 ===')
  
  // 1. 모든 이미지 관련 상태 초기화
  selectedImageFile.value = null
  previewImageUrl.value = ''
  
  // 2. 강제로 파일 입력 표시
  forceShowFileInput.value = true
  
  // 3. Vue의 반응성을 위해 nextTick 사용
  nextTick(() => {
    console.log('✅ 이미지 선택 초기화 완료 - 파일 입력 표시됨')
  })
}

// 드래그앤드롭 처리
const onDropImage = (event) => {
  event.preventDefault()
  console.log('이미지 드롭 이벤트')
  
  const files = event.dataTransfer.files
  if (files.length > 0) {
    const file = files[0]
    selectedImageFile.value = file
    onImageFileSelected(file)
  }
}

// ===== 폼 관련 함수들 =====

// 폼 리셋 함수
const resetForm = () => {
  formData.value = {
    storeName: '',
    businessType: '',
    address: '',
    phoneNumber: '',
    seatCount: 0,
    instagramUrl: '',
    blogUrl: '',
    openTime: '09:00',
    closeTime: '21:00',
    holidays: [],
    description: ''
  }
  if (storeFormRef.value) {
    storeFormRef.value.resetValidation()
  }
}

// ✅ 메뉴 폼 리셋 함수 개선
const resetMenuForm = () => {
  console.log('=== 메뉴 폼 리셋 ===')
  
  menuFormData.value = {
    menuId: null,
    id: null,
    menuName: '',
    category: '',
    price: 0,
    description: '',
    available: true,
    recommended: false,
    imageUrl: ''
  }
  
  // 이미지 관련 상태 초기화
  selectedImageFile.value = null
  previewImageUrl.value = ''
  forceShowFileInput.value = false // ✅ 추가
  
  if (menuFormRef.value) {
    menuFormRef.value.resetValidation()
  }
  
  console.log('✅ 메뉴 폼 리셋 완료')
}

// ===== 다이얼로그 관련 함수들 =====

const openCreateDialog = () => {
  console.log('새 매장 등록 다이얼로그 열기')
  editMode.value = false
  resetForm()
  showCreateDialog.value = true
}

const editBasicInfo = () => {
  console.log('매장 정보 수정 시작')
  editMode.value = true
  
  const store = storeInfo.value
  
  // ✅ closedDays 문자열을 holidays 배열로 변환
  let holidaysArray = []
  if (store.closedDays && typeof store.closedDays === 'string') {
    holidaysArray = store.closedDays.split(',').map(day => day.trim()).filter(day => day)
    console.log('closedDays 문자열을 배열로 변환:', store.closedDays, '->', holidaysArray)
  }
  
  formData.value = {
    storeName: store.storeName || '',
    businessType: store.businessType || '',
    address: store.address || '',
    phoneNumber: store.phoneNumber || '',
    seatCount: store.seatCount || 0,
    instagramUrl: store.instaAccounts || '',
    blogUrl: store.blogAccounts || '',
    openTime: store.openTime || '09:00',
    closeTime: store.closeTime || '21:00',
    // ✅ 수정: closedDays 문자열을 holidays 배열로 변환
    holidays: holidaysArray,
    description: store.description || ''
  }
  
  console.log('수정용 폼 데이터 설정:', formData.value)
  showCreateDialog.value = true
}

// 메뉴 관련 메서드들
const openCreateMenuDialog = () => {
  console.log('메뉴 등록 다이얼로그 열기')
  menuEditMode.value = false
  resetMenuForm()
  showMenuDialog.value = true
}

// ✅ 메뉴 수정 함수에서 이미지 상태 올바르게 설정
const editMenu = (menu) => {
  console.log('=== 메뉴 수정 호출 ===')
  console.log('전달받은 메뉴 객체:', menu)
  
  if (!menu || menu === null || menu === undefined) {
    console.error('❌ 전달받은 메뉴 객체가 null 또는 undefined입니다')
    showSnackbar('메뉴 정보를 찾을 수 없습니다', 'error')
    return
  }
  
  const menuId = menu.menuId || menu.id
  console.log('추출된 메뉴 ID:', menuId, '타입:', typeof menuId)
  
  if (!menuId || menuId === 'undefined' || menuId === null || menuId === '') {
    console.error('❌ 메뉴 ID를 찾을 수 없음:', menu)
    showSnackbar('메뉴 ID를 찾을 수 없습니다', 'error')
    return
  }
  
  console.log('✅ 사용할 메뉴 ID:', menuId)
  menuEditMode.value = true
  
  // 메뉴 폼 데이터 설정
  menuFormData.value = {
    menuId: menuId,
    id: menuId,
    menuName: menu.menuName || menu.name || '',
    category: menu.category || '',
    price: menu.price || 0,
    description: menu.description || '',
    available: menu.available !== undefined ? menu.available : true,
    recommended: menu.recommended !== undefined ? menu.recommended : false,
    imageUrl: menu.image || menu.imageUrl || ''
  }
  
  // ✅ 이미지 상태 올바르게 초기화
  selectedImageFile.value = null
  previewImageUrl.value = ''
  forceShowFileInput.value = false // 기존 이미지를 먼저 보여줌
  
  console.log('✅ 메뉴 수정 폼 데이터 설정 완료:', menuFormData.value)
  console.log('✅ 기존 이미지 URL:', menuFormData.value.imageUrl)
  showMenuDialog.value = true
}

// 메뉴 상세 보기
const viewMenuDetail = (menu) => {
  console.log('=== 메뉴 상세 보기 호출 ===')
  console.log('전달받은 메뉴 객체:', menu)
  
  const menuId = menu.menuId || menu.id
  
  if (!menuId) {
    console.error('❌ 메뉴 ID를 찾을 수 없음:', menu)
    showSnackbar('메뉴 정보가 올바르지 않습니다', 'error')
    return
  }
  
  console.log('✅ 사용할 메뉴 ID:', menuId)
  
  selectedMenu.value = {
    ...menu,
    id: menuId,
    menuId: menuId,
    name: menu.menuName || menu.name,
    menuName: menu.menuName || menu.name,
    imageUrl: menu.image || menu.imageUrl || '/images/menu-placeholder.png'
  }
  
  console.log('✅ 메뉴 상세 정보 설정 완료:', selectedMenu.value)
  showMenuDetailDialog.value = true
}

const closeMenuDetail = () => {
  showMenuDetailDialog.value = false
  selectedMenu.value = null
}

const confirmDeleteMenu = (menu) => {
  console.log('메뉴 삭제 확인:', menu)
  if (confirm(`'${menu.menuName}' 메뉴를 삭제하시겠습니까?`)) {
    deleteMenu(menu.id || menu.menuId)
  }
}

const clearFilters = () => {
  menuSearch.value = ''
  menuCategoryFilter.value = '전체'
}

// 메뉴 폼 취소
const cancelMenuForm = () => {
  console.log('메뉴 폼 취소')
  showMenuDialog.value = false
  menuEditMode.value = false
  resetMenuForm()
}

// ===== 저장 관련 함수들 =====

// 매장 정보 저장 함수
const saveStore = async () => {
  if (!storeFormRef.value) {
    showSnackbar('폼 오류가 발생했습니다', 'error')
    return
  }
  
  const { valid } = await storeFormRef.value.validate()
  if (!valid) {
    showSnackbar('필수 정보를 모두 입력해주세요', 'error')
    return
  }
  
  saving.value = true
  
  try {
    console.log('매장 정보 저장 시작')
    
    const businessHours = `${formData.value.openTime || '09:00'}-${formData.value.closeTime || '21:00'}`
    const closedDays = Array.isArray(formData.value.holidays) 
      ? formData.value.holidays.join(',') 
      : (formData.value.holidays || '')

    // 백엔드 형식에 맞는 데이터 구조로 변환
    const storeData = {
      storeName: formData.value.storeName,
      businessType: formData.value.businessType,
      address: formData.value.address,
      phoneNumber: formData.value.phoneNumber || '',
      businessHours: businessHours,    // ✅ 추가
      closedDays: closedDays,          // ✅ 추가
      seatCount: parseInt(formData.value.seatCount) || 0,
      instaAccounts: formData.value.instagramUrl || '',
      blogAccounts: formData.value.blogUrl || '',
      description: formData.value.description || ''
    }
    
    console.log('백엔드로 전송할 데이터:', storeData)
    
    let result
    if (editMode.value) {
      result = await storeStore.updateStore(storeInfo.value.storeId, storeData)
    } else {
      result = await storeStore.registerStore(storeData)
    }
    
    console.log('저장 결과:', result)
    
    if (result.success) {
      showSnackbar(
        editMode.value ? '매장 정보가 수정되었습니다' : '매장이 등록되었습니다',
        'success'
      )
      showCreateDialog.value = false
      editMode.value = false
      resetForm()
      await storeStore.fetchStoreInfo()
    } else {
      showSnackbar(result.message || '저장에 실패했습니다', 'error')
    }
  } catch (error) {
    console.error('매장 정보 저장 중 오류:', error)
    showSnackbar('저장 중 오류가 발생했습니다', 'error')
  } finally {
    saving.value = false
  }
}

// 메뉴 저장 함수
const saveMenu = async () => {
  console.log('=== 메뉴 저장 시작 ===')
  console.log('메뉴 수정 모드:', menuEditMode.value)
  console.log('폼 데이터:', menuFormData.value)
  console.log('선택된 이미지 파일:', selectedImageFile.value)
  console.log('이미지 미리보기:', previewImageUrl.value)
  
  if (!menuFormRef.value) {
    showSnackbar('폼 오류가 발생했습니다', 'error')
    return
  }
  
  const { valid } = await menuFormRef.value.validate()
  if (!valid) {
    showSnackbar('필수 정보를 모두 입력해주세요', 'error')
    return
  }
  
  // 신규 등록 시 이미지 필수 체크
  if (!menuEditMode.value && !selectedImageFile.value) {
    showSnackbar('메뉴 이미지는 필수입니다', 'error')
    return
  }
  
  saving.value = true
  
  try {
    const { menuService } = await import('@/services/menu')
    
    let menuResult
    let savedMenuId
    
    if (menuEditMode.value) {
      // 메뉴 수정
      const menuId = menuFormData.value.id || menuFormData.value.menuId
      
      if (!menuId || menuId === 'undefined' || menuId === null) {
        showSnackbar('메뉴 ID가 없습니다', 'error')
        return
      }
      
      const menuData = {
        menuName: menuFormData.value.menuName,
        category: menuFormData.value.category,
        price: parseInt(menuFormData.value.price) || 0,
        description: menuFormData.value.description || ''
      }
      
      console.log('✅ 메뉴 수정 데이터:', menuData)
      
      menuResult = await menuService.updateMenu(menuId, menuData)
      savedMenuId = menuId
    } else {
      // 메뉴 등록
      const storeId = storeInfo.value?.storeId
      
      if (!storeId) {
        showSnackbar('매장 정보를 찾을 수 없습니다', 'error')
        return
      }
      
      const menuData = {
        storeId: storeId,
        menuName: menuFormData.value.menuName?.trim(),
        category: menuFormData.value.category,
        price: parseInt(menuFormData.value.price) || 0,
        description: menuFormData.value.description?.trim() || ''
      }
      
      console.log('✅ 메뉴 등록 데이터:', menuData)
      
      menuResult = await menuService.createMenu(menuData)
      savedMenuId = menuResult.data?.menuId
    }
    
    console.log('✅ 메뉴 저장 완료:', menuResult)
    
    if (!menuResult.success) {
      showSnackbar(menuResult.message || '메뉴 저장에 실패했습니다', 'error')
      return
    }
    
    // 이미지 업로드 처리 (새 이미지가 선택된 경우만)
    if (selectedImageFile.value && savedMenuId) {
      console.log('=== 이미지 업로드 시작 ===')
      console.log('메뉴 ID:', savedMenuId)
      console.log('이미지 파일:', selectedImageFile.value)
      
      const imageUrl = await uploadMenuImage(savedMenuId)
      
      if (imageUrl) {
        console.log('✅ 이미지 업로드 완료:', imageUrl)
        showSnackbar(`메뉴가 ${menuEditMode.value ? '수정' : '등록'}되었고 이미지도 업로드되었습니다`, 'success')
      } else {
        console.warn('⚠️ 이미지 업로드 실패')
        showSnackbar(`메뉴는 ${menuEditMode.value ? '수정' : '등록'}되었지만 이미지 업로드에 실패했습니다`, 'warning')
      }
    } else {
      console.log('새 이미지가 선택되지 않아 이미지 업로드 건너뜀')
      showSnackbar(`메뉴가 ${menuEditMode.value ? '수정' : '등록'}되었습니다`, 'success')
    }
    
    // 다이얼로그 닫기 및 목록 새로고침
    showMenuDialog.value = false
    menuEditMode.value = false
    resetMenuForm()
    await loadMenus()
    
  } catch (error) {
    console.error('❌ 메뉴 저장 중 예외 발생:', error)
    showSnackbar('저장 중 오류가 발생했습니다', 'error')
  } finally {
    saving.value = false
  }
}

// 메뉴 삭제 함수
const deleteMenu = async (menuId) => {
  console.log('=== 메뉴 삭제 시작 ===')
  console.log('삭제할 메뉴 ID:', menuId, '타입:', typeof menuId)
  
  if (!menuId || menuId === 'undefined' || menuId === null) {
    console.error('❌ 유효하지 않은 메뉴 ID:', menuId)
    showSnackbar('올바른 메뉴 ID가 필요합니다', 'error')
    return
  }
  
  try {
    const { menuService } = await import('@/services/menu')
    
    console.log('✅ 메뉴 삭제 API 호출, ID:', menuId)
    const result = await menuService.deleteMenu(menuId)
    
    if (result.success) {
      showSnackbar('메뉴가 삭제되었습니다', 'success')
      await loadMenus()
    } else {
      showSnackbar(result.message || '메뉴 삭제에 실패했습니다', 'error')
    }
  } catch (error) {
    console.error('메뉴 삭제 실패:', error)
    showSnackbar(`메뉴 삭제 중 오류가 발생했습니다: ${error.message}`, 'error')
  }
}

// ===== 데이터 로드 함수들 =====

// 메뉴 데이터 로드 함수 - 실제 API 연동
const loadMenus = async () => {
  try {
    console.log('메뉴 데이터 로드 시작')
    const result = await storeStore.fetchMenus()
    
    if (result.success) {
      // ✅ Store에서 조회한 메뉴를 로컬 상태에 동기화
      menus.value = storeStore.menus || []
      console.log('✅ 메뉴 데이터 로드 완료:', menus.value)
    } else {
      console.log('메뉴 데이터 없음 또는 로드 실패:', result.message)
      menus.value = []
    }
  } catch (error) {
    console.error('메뉴 데이터 로드 실패:', error)
    menus.value = []
  }
}


// 개발 환경에서 전역으로 노출
if (process.env.NODE_ENV === 'development') {
  window.checkMenuImages = checkMenuImages
  window.getMenuImageUrl = getMenuImageUrl
}

/**
 * 컴포넌트 마운트 시 실행
 */
onMounted(async () => {
  console.log('=== StoreManagementView 마운트됨 ===')
  
  // 플레이스홀더 이미지 확인
  checkPlaceholderImage()
  
  try {
    // 매장 정보 조회 시도
    const result = await storeStore.fetchStoreInfo()
    console.log('매장 정보 조회 결과:', result)
    
    // ✅ 수정: 매장 정보 조회 성공 여부와 관계없이 에러 메시지 표시하지 않음
    if (result && result.success && result.data) {
      console.log('✅ 매장 정보 조회 성공')
      // ✅ 수정: 매장이 있을 때만 메뉴 조회 - storeStore.fetchMenus() 직접 호출
      console.log('메뉴 목록 조회 시작')
      await storeStore.fetchMenus()
      
      // ✅ 추가: Store에서 조회한 메뉴를 로컬 상태에 동기화
      menus.value = storeStore.menus || []
      
      // 개발 모드에서만 메뉴 이미지 확인
      if (import.meta.env.DEV && currentTab.value === 'menu') {
        setTimeout(checkMenuImages, 2000)
      }
    } else {
      // 매장 정보가 없는 경우 - 조용히 처리
      console.log('📝 매장 정보 없음 - 등록 화면 표시')
      // 에러 메시지를 표시하지 않고 등록 화면만 보여줌
    }
  } catch (error) {
    // 예외 발생 시에도 조용히 처리
    console.log('매장 정보 조회 중 오류:', error.message)
    
    // 500 에러나 네트워크 에러가 발생해도 사용자에게는 등록 화면을 보여줌
    // 사용자 경험을 위해 에러 메시지 대신 등록 안내만 표시
  }
})

// 업종별 이모지 반환 함수
const getStoreEmoji = (businessType) => {
  const emojiMap = {
    '카페': '☕',
    '레스토랑': '🍽️',
    '한식': '🍲',
    '중식': '🥢',
    '일식': '🍣',
    '양식': '🍝',
    '치킨': '🍗',
    '피자': '🍕',
    '햄버거': '🍔',
    '분식': '🍜',
    '베이커리': '🥐',
    '디저트': '🧁',
    '아이스크림': '🍦',
    '술집': '🍺',
    '바': '🍸',
    '펜션': '🏠',
    '호텔': '🏨',
    '게스트하우스': '🏡',
    '마트': '🛒',
    '편의점': '🏪',
    '미용실': '💇',
    '네일샵': '💅',
    '세탁소': '👔',
    '약국': '💊',
    '병원': '🏥',
    '헬스장': '💪',
    '학원': '📚',
    '키즈카페': '🧸',
    '반려동물': '🐾',
    '꽃집': '🌸',
    '문구점': '✏️',
    '서점': '📖',
    '화장품': '💄',
    '옷가게': '👗',
    '신발가게': '👟',
    '가구점': '🪑',
    '전자제품': '📱',
    '자동차': '🚗',
    '주유소': '⛽',
    '세차장': '🚿',
    '부동산': '🏢',
    '은행': '🏦',
    '우체국': '📮',
    '기타': '🏪'
  }
  
  return emojiMap[businessType] || '🏪'
}

// 업종별 배경색 반환 함수  
const getStoreColor = (businessType) => {
  const colorMap = {
    '카페': '#8D6E63',
    '레스토랑': '#FF7043',
    '한식': '#D32F2F',
    '중식': '#F57C00',
    '일식': '#388E3C',
    '양식': '#303F9F',
    '치킨': '#FBC02D',
    '피자': '#E64A19',
    '햄버거': '#795548',
    '분식': '#FF5722',
    '베이커리': '#F57C00',
    '디저트': '#E91E63',
    '아이스크림': '#00BCD4',
    '술집': '#FF9800',
    '바': '#9C27B0',
    '펜션': '#4CAF50',
    '호텔': '#2196F3',
    '게스트하우스': '#009688',
    '마트': '#607D8B',
    '편의점': '#3F51B5',
    '미용실': '#E91E63',
    '네일샵': '#9C27B0',
    '세탁소': '#00BCD4',
    '약국': '#4CAF50',
    '병원': '#2196F3',
    '헬스장': '#FF5722',
    '학원': '#673AB7',
    '키즈카페': '#FFEB3B',
    '반려동물': '#795548',
    '꽃집': '#E91E63',
    '문구점': '#FF9800',
    '서점': '#795548',
    '화장품': '#E91E63',
    '옷가게': '#9C27B0',
    '신발가게': '#607D8B',
    '가구점': '#8BC34A',
    '전자제품': '#607D8B',
    '자동차': '#424242',
    '주유소': '#FF5722',
    '세차장': '#00BCD4',
    '부동산': '#795548',
    '은행': '#2196F3',
    '우체국': '#FF5722',
    '기타': '#9E9E9E'
  }
  
  return colorMap[businessType] || '#9E9E9E'
}
</script>

<style scoped>
/* ===== AI 마케팅 서비스 - 매장 관리 통합 스타일 ===== */

/* 기본 레이아웃 */
.info-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 16px;
}

.info-item .v-icon {
  margin-top: 2px;
}

/* 유틸리티 클래스 */
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }

.flex-1 { flex: 1; }

.position-relative { position: relative; }
.position-absolute { position: absolute; }
.top-0 { top: 0; }
.right-0 { right: 0; }
.left-0 { left: 0; }

.rounded { border-radius: 8px; }
.mx-auto { margin-left: auto; margin-right: auto; }

/* 카드 높이 통일 */
.h-100 {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.h-100 .v-card-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* 텍스트 말줄임 */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ===== 메뉴 카드 스타일 ===== */
.menu-card {
  transition: all 0.3s ease;
  cursor: pointer;
  border-radius: 12px !important;
  overflow: hidden;
  animation: fadeIn 0.3s ease-out;
  margin-bottom: 16px;
}

.menu-card:hover {
  animation: cardHover 0.3s ease-out forwards;
}

/* 메뉴 카드 진입 애니메이션 */
.menu-card:nth-child(1) { animation-delay: 0s; }
.menu-card:nth-child(2) { animation-delay: 0.05s; }
.menu-card:nth-child(3) { animation-delay: 0.1s; }
.menu-card:nth-child(4) { animation-delay: 0.15s; }
.menu-card:nth-child(n+5) { animation-delay: 0.2s; }

/* 메뉴 카드 이미지 */
.menu-card .v-img {
  transition: transform 0.2s ease;
}

.menu-card:hover .v-img {
  transform: scale(1.02);
}

/* 버튼 스타일 개선 */
.menu-card .v-btn {
  border-radius: 8px;
  font-weight: 500;
  text-transform: none;
  transition: all 0.2s ease;
}

.menu-card .v-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 버튼 그룹 스타일 */
.d-flex.gap-2.mt-3 {
  margin-top: 12px !important;
}

/* 카드 내 아이콘 색상 */
.v-btn .v-icon {
  color: inherit;
}

/* ===== 일반 카드 및 컴포넌트 스타일 ===== */
.v-card {
  transition: box-shadow 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

.v-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
}

/* 카드 텍스트 영역 패딩 조정 */
.v-card-text {
  padding: 16px !important;
}

/* 버튼 공통 스타일 */
.v-btn {
  transition: all 0.2s ease;
}

.v-btn:hover {
  transform: translateY(-1px);
}

/* 수정 버튼 호버 효과 */
.v-btn--variant-outlined.text-primary:hover {
  background-color: rgba(25, 118, 210, 0.04);
}

/* 삭제 버튼 호버 효과 */
.v-btn--variant-outlined.text-error:hover {
  background-color: rgba(244, 67, 54, 0.04);
}

/* 접근성 개선 */
.v-btn:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* 상태 뱃지 스타일 */
.v-chip {
  font-weight: 500;
  border-radius: 16px;
}

/* 상태 뱃지 컨테이너 */
.position-absolute.top-0.right-0 {
  z-index: 2;
}

/* ===== 탭 스타일 ===== */
.v-tabs {
  border-radius: 8px;
  overflow: hidden;
}

.v-tab {
  font-weight: 500;
  text-transform: none;
  min-width: 120px;
}

.v-tab--selected {
  background-color: rgba(25, 118, 210, 0.08);
}

/* ===== 폼 입력 필드 ===== */
.v-text-field, .v-select, .v-textarea {
  margin-bottom: 4px;
}

.v-text-field .v-field, 
.v-select .v-field, 
.v-textarea .v-field {
  border-radius: 8px;
}

.v-file-input {
  margin-bottom: 16px;
}

.v-file-input .v-field {
  border-radius: 8px;
}

.v-text-field:focus-within .v-field,
.v-select:focus-within .v-field,
.v-textarea:focus-within .v-field {
  border: 2px solid #1976d2;
  box-shadow: 0 0 0 1px rgba(25, 118, 210, 0.2);
}

/* ===== 다이얼로그 스타일 ===== */
.v-dialog .v-card {
  border-radius: 12px;
  overflow: hidden;
}

.v-dialog .v-card-title {
  background-color: rgba(25, 118, 210, 0.02);
  border-bottom: 1px solid #e0e0e0;
}

/* 매장 다이얼로그 */
.store-dialog .v-overlay__content {
  max-height: 90vh !important;
  margin: 24px;
}

.store-dialog-card {
  max-height: 90vh !important;
  display: flex;
  flex-direction: column;
}

.store-dialog-card .store-dialog-content {
  flex: 1;
  overflow-y: auto;
  max-height: calc(90vh - 120px);
}

/* 메뉴 다이얼로그 */
.menu-dialog .v-overlay__content {
  max-height: 90vh !important;
  margin: 24px;
}

.menu-dialog-card {
  max-height: 90vh !important;
  display: flex;
  flex-direction: column;
}

.menu-dialog-card .dialog-content {
  flex: 1;
  overflow-y: auto;
  max-height: calc(90vh - 120px);
}

.menu-dialog .drop-zone {
  min-height: 80px !important;
  max-height: 80px !important;
}

.menu-dialog .v-img {
  max-height: 180px !important;
  max-width: 280px !important;
}

/* ===== 이미지 관련 ===== */
/* 카드 이미지 영역 */
.v-img {
  border-radius: 0;
  position: relative;
}

.image-preview {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview:hover {
  border-color: #1976d2;
}

.v-img__img {
  transition: opacity 0.3s ease;
}

.v-img--loading .v-img__img {
  opacity: 0;
}

.v-img--error {
  background-color: #f5f5f5;
}

.v-img--loading {
  background-color: #f5f5f5;
}

.menu-image {
  object-fit: cover;
  width: 100%;
  height: 200px;
}

.placeholder-image {
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-image .v-icon {
  color: #bdbdbd;
}

/* 에러 상태 스타일 */
.v-img .v-icon {
  opacity: 0.5;
}

/* ===== 드래그앤드롭 ===== */
.drop-zone {
  transition: all 0.3s ease;
}

.drop-zone:hover {
  border-color: #1976d2 !important;
  background: #f3f8ff !important;
}

.drop-zone.drag-over {
  border-color: #1976d2 !important;
  background: #e3f2fd !important;
  transform: scale(1.02);
}

/* ===== 기타 컴포넌트 ===== */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.info-section {
  padding: 16px;
  border-radius: 8px;
  background-color: #fafafa;
  margin-bottom: 16px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

/* 로딩 상태 스타일 */
.v-progress-circular {
  margin: auto;
  color: #1976d2 !important;
}

.v-snackbar {
  border-radius: 12px;
  margin: 16px;
}

.v-avatar {
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* ===== 매장 관련 ===== */
.store-image-container {
  position: relative;
  display: inline-block;
}

.store-avatar {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.store-emoji-container {
  margin: 0 auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.store-emoji-container:hover {
  transform: scale(1.05);
}

/* ===== 상태별 스타일 ===== */
.error-state {
  color: #d32f2f;
}

.error-state .v-icon {
  color: #d32f2f;
}

.success-state {
  color: #2e7d32;
}

.success-state .v-icon {
  color: #2e7d32;
}

.warning-state {
  color: #ed6c02;
}

.warning-state .v-icon {
  color: #ed6c02;
}

/* ===== 애니메이션 ===== */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}

/* 호버 시 애니메이션 */
@keyframes cardHover {
  0% {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  100% {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  }
}

/* ===== 스크롤바 ===== */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.dialog-content::-webkit-scrollbar,
.store-dialog-content::-webkit-scrollbar {
  width: 6px;
}

.dialog-content::-webkit-scrollbar-track,
.store-dialog-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.dialog-content::-webkit-scrollbar-thumb,
.store-dialog-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.dialog-content::-webkit-scrollbar-thumb:hover,
.store-dialog-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* ===== 그리드 및 레이아웃 ===== */
/* 그리드 간격 조정 */
.v-row .v-col {
  padding: 8px;
}

/* ===== 반응형 디자인 ===== */
@media (max-width: 960px) {
  .info-item {
    margin-bottom: 12px;
  }
  
  .gap-3 {
    gap: 8px;
  }
  
  .v-dialog {
    margin: 16px;
  }
  
  .v-dialog .v-card {
    max-width: calc(100vw - 32px) !important;
  }
  
  .menu-card .v-btn {
    font-size: 12px;
    padding: 0 12px;
  }
}

@media (max-width: 600px) {
  .info-item {
    flex-direction: column;
    gap: 4px;
  }
  
  .info-item .v-icon {
    margin-top: 0;
  }
  
  .empty-state {
    padding: 2rem 1rem;
  }
  
  .v-container {
    padding: 8px !important;
  }
  
  .v-tab {
    min-width: 120px;
    font-size: 0.875rem;
  }
  
  .menu-card {
    margin-bottom: 16px;
  }
  
  .menu-card .v-btn {
    font-size: 11px;
    padding: 0 8px;
    min-width: 0;
  }
  
  .menu-card .v-btn .v-icon {
    font-size: 16px;
  }
  
  /* 다이얼로그 모바일 최적화 */
  .store-dialog .v-overlay__content,
  .menu-dialog .v-overlay__content {
    margin: 16px;
    max-height: 95vh !important;
  }
  
  .store-dialog-card .store-dialog-content {
    max-height: calc(95vh - 100px);
    padding: 16px !important;
  }
  
  .menu-dialog-card .dialog-content {
    max-height: calc(95vh - 100px);
    padding: 16px !important;
  }
  
  .menu-dialog .v-img {
    max-height: 150px !important;
    max-width: 200px !important;
  }
}
</style>