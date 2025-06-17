//* src/views/StoreManagementView.vue - 완전한 매장 관리 화면 (이미지 업로드 포함)

<template>
  <v-container fluid class="pa-4">
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
                <v-col cols="12" md="4" class="text-center">
                  <v-avatar size="120" class="mb-3">
                    <v-img
                      :src="storeInfo.imageUrl || '/images/store-placeholder.png'"
                      alt="매장 이미지"
                    />
                  </v-avatar>
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
                        <v-icon class="mr-2" color="grey">mdi-calendar-remove</v-icon>
                        <div>
                          <div class="text-caption text-grey">휴무일</div>
                          <div class="text-body-1">
                            {{ formatClosedDays(storeInfo.closedDays) }}
                          </div>
                        </div>
                      </div>
                    </v-col>
                  </v-row>

                  <!-- SNS 정보 -->
                  <v-divider class="my-6" />
                  
                  <h4 class="text-h6 font-weight-bold mb-4">
                    <v-icon class="mr-2" color="primary">mdi-share-variant</v-icon>
                    SNS 정보
                  </h4>
                  
                  <v-row>
                    <v-col cols="12" sm="6">
                      <div class="info-item">
                        <v-icon class="mr-2" color="pink">mdi-instagram</v-icon>
                        <div>
                          <div class="text-caption text-grey">인스타그램</div>
                          <div class="text-body-1">
                            {{ storeInfo.instaAccounts || '미연동' }}
                          </div>
                        </div>
                      </div>
                    </v-col>
                    
                    <v-col cols="12" sm="6">
                      <div class="info-item">
                        <v-icon class="mr-2" color="green">mdi-post</v-icon>
                        <div>
                          <div class="text-caption text-grey">네이버 블로그</div>
                          <div class="text-body-1">
                            {{ storeInfo.blogAccounts || '미연동' }}
                          </div>
                        </div>
                      </div>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-tabs-window-item>

        <!-- 메뉴 관리 탭 -->
        <v-tabs-window-item value="menu">
          <!-- 메뉴 관리 도구 -->
          <v-card class="mb-4">
            <v-card-title class="pa-4 d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-food</v-icon>
                메뉴 관리
              </div>
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                @click="openCreateMenuDialog"
              >
                메뉴 등록
              </v-btn>
            </v-card-title>
            
            <v-divider />
            
            <v-card-text class="pa-4">
              <!-- 검색 및 필터 -->
              <v-row class="mb-4">
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="menuSearch"
                    label="메뉴 검색"
                    variant="outlined"
                    prepend-inner-icon="mdi-magnify"
                    clearable
                    hide-details
                  />
                </v-col>
                <v-col cols="12" sm="3">
                  <v-select
                    v-model="menuCategoryFilter"
                    label="카테고리 필터"
                    variant="outlined"
                    :items="['전체', ...menuCategories]"
                    hide-details
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- 메뉴 목록 -->
          <div v-if="filteredMenus.length > 0">
            <v-row>
              <v-col
                v-for="menu in filteredMenus"
                :key="menu.id"
                cols="12"
                sm="6"
                md="4"
                lg="3"
              >
                <v-card
                  class="menu-card h-100 position-relative"
                  elevation="2"
                  @click="viewMenuDetail(menu)"
                >
                  <!-- 메뉴 상태 배지 -->
                  <div class="position-absolute top-0 right-0 pa-2" style="z-index: 1;">
                    <v-chip
                      :color="menu.available ? 'success' : 'error'"
                      size="small"
                      variant="elevated"
                    >
                      {{ menu.available ? '판매중' : '품절' }}
                    </v-chip>
                  </div>
                  
                  <!-- 추천 메뉴 배지 -->
                  <div
                    v-if="menu.recommended"
                    class="position-absolute top-0 left-0 pa-2"
                    style="z-index: 1;"
                  >
                    <v-chip
                      color="warning"
                      size="small"
                      variant="elevated"
                    >
                      <v-icon size="small" class="mr-1">mdi-star</v-icon>
                      추천
                    </v-chip>
                  </div>

                  <v-img
                    :src="menu.imageUrl || menu.image || '/images/menu-placeholder.png'"
                    :alt="menu.menuName"
                    height="200"
                    cover
                  />

                  <v-card-title class="pa-3">
                    <div class="w-100">
                      <div class="d-flex align-center justify-space-between mb-2">
                        <h4 class="text-subtitle-1 font-weight-bold text-truncate">
                          {{ menu.menuName }}
                        </h4>
                        <div class="d-flex align-center">
                          <!-- 삭제 버튼 -->
                          <v-btn
                            icon
                            size="small"
                            variant="text"
                            color="error"
                            @click="deleteMenuDirect(menu, $event)"
                          >
                            <v-icon size="small">mdi-delete</v-icon>
                          </v-btn>
                          <!-- 수정 버튼 -->
                          <v-btn
                            icon
                            size="small"
                            variant="text"
                            @click="editMenuDirect(menu, $event)"
                          >
                            <v-icon size="small">mdi-pencil</v-icon>
                          </v-btn>
                        </div>
                      </div>
                      
                      <div class="d-flex align-center justify-space-between">
                        <v-chip
                          :color="getCategoryColor(menu.category)"
                          size="small"
                          variant="tonal"
                        >
                          {{ menu.category }}
                        </v-chip>
                        <span class="text-h6 font-weight-bold text-primary">
                          {{ formatCurrency(menu.price) }}
                        </span>
                      </div>
                      
                      <p class="text-body-2 text-grey mt-2 text-truncate-2">
                        {{ menu.description }}
                      </p>
                    </div>
                  </v-card-title>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <!-- 메뉴가 없는 경우 -->
          <div v-else-if="menus.length === 0" class="empty-state pa-8">
            <v-img
              src="/images/menu-placeholder.png"
              max-width="200"
              class="mx-auto mb-4"
            />
            <h3 class="text-h6 font-weight-bold mb-3 text-center">등록된 메뉴가 없습니다</h3>
            <p class="text-grey text-center mb-4">
              첫 메뉴를 등록하여 AI 마케팅 콘텐츠를 생성해보세요
            </p>
            <div class="text-center">
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                @click="openCreateMenuDialog"
              >
                메뉴 등록하기
              </v-btn>
            </div>
          </div>

          <!-- 필터 결과가 없는 경우 -->
          <div v-else class="text-center pa-8">
            <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-magnify</v-icon>
            <h3 class="text-h6 font-weight-bold mb-3">검색 결과가 없습니다</h3>
            <p class="text-grey mb-4">다른 검색 조건을 시도해보세요</p>
            <v-btn
              variant="outlined"
              @click="clearFilters"
            >
              필터 초기화
            </v-btn>
          </div>
        </v-tabs-window-item>
      </v-tabs-window>
    </div>

    <!-- 로딩 상태 -->
    <div v-else-if="storeStore.loading" class="text-center pa-8">
      <v-progress-circular
        size="64"
        color="primary"
        indeterminate
        class="mb-4"
      />
      <p class="text-body-1">매장 정보를 불러오는 중...</p>
    </div>

    <!-- 매장 등록/수정 다이얼로그 -->
    <!-- 기존 매장 등록/수정 다이얼로그를 다음 내용으로 교체해주세요 -->

    <!-- 매장 등록/수정 다이얼로그 -->
    <v-dialog
      v-model="showCreateDialog"
      max-width="600"
      persistent
    >
      <v-card>
        <v-card-title class="pa-4">
          <div class="d-flex align-center">
            <v-icon class="mr-2" color="primary">mdi-store-plus</v-icon>
            {{ editMode ? '매장 정보 수정' : '매장 정보 등록' }}
          </div>
        </v-card-title>
        
        <v-divider />
        
        <v-card-text class="pa-4">
          <v-form ref="storeFormRef" v-model="formValid">
            <v-row>
              <!-- 매장명 -->
              <v-col cols="12">
                <v-text-field
                  v-model="formData.storeName"
                  label="매장명 *"
                  :rules="[v => !!v || '매장명을 입력해주세요']"
                  prepend-inner-icon="mdi-store"
                  variant="outlined"
                />
              </v-col>

              <!-- 업종 -->
              <v-col cols="12" sm="6">
                <v-select
                  v-model="formData.businessType"
                  label="업종 *"
                  :items="businessTypes"
                  :rules="[v => !!v || '업종을 선택해주세요']"
                  prepend-inner-icon="mdi-domain"
                  variant="outlined"
                />
              </v-col>

              <!-- 좌석수 -->
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="formData.seatCount"
                  label="좌석수"
                  type="number"
                  prepend-inner-icon="mdi-chair-school"
                  variant="outlined"
                  :min="0"
                  :max="500"
                />
              </v-col>

              <!-- 주소 -->
              <v-col cols="12">
                <v-text-field
                  v-model="formData.address"
                  label="주소 *"
                  :rules="[v => !!v || '주소를 입력해주세요']"
                  prepend-inner-icon="mdi-map-marker"
                  variant="outlined"
                />
              </v-col>

              <!-- 전화번호 -->
              <v-col cols="12">
                <v-text-field
                  v-model="formData.phoneNumber"
                  label="전화번호"
                  prepend-inner-icon="mdi-phone"
                  variant="outlined"
                  placeholder="예) 02-1234-5678"
                />
              </v-col>

              <!-- 영업시간 -->
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.openTime"
                  label="오픈 시간"
                  type="time"
                  prepend-inner-icon="mdi-clock-start"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.closeTime"
                  label="마감 시간"
                  type="time"
                  prepend-inner-icon="mdi-clock-end"
                  variant="outlined"
                />
              </v-col>

              <!-- 휴무일 -->
              <v-col cols="12">
                <v-select
                  v-model="formData.holidays"
                  label="휴무일"
                  :items="weekDays"
                  prepend-inner-icon="mdi-calendar-remove"
                  variant="outlined"
                  multiple
                  chips
                  closable-chips
                />
              </v-col>

              <!-- SNS 계정 -->
              <v-col cols="12">
                <v-text-field
                  v-model="formData.instagramUrl"
                  label="인스타그램 계정"
                  prepend-inner-icon="mdi-instagram"
                  variant="outlined"
                  placeholder="예) @your_instagram"
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="formData.blogUrl"
                  label="네이버 블로그"
                  prepend-inner-icon="mdi-post"
                  variant="outlined"
                  placeholder="예) blog.naver.com/your_blog"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-divider />
        
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            @click="cancelForm"
            :disabled="saving"
          >
            취소
          </v-btn>
          <v-btn
            color="primary"
            @click="saveStoreInfo"
            :loading="saving"
            :disabled="!formValid"
          >
            {{ editMode ? '수정' : '등록' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- 누락된 다이얼로그들을 매장 등록 다이얼로그 뒤에 추가해주세요 -->

    <!-- 메뉴 상세 다이얼로그 -->
    <v-dialog
      v-model="showMenuDetailDialog"
      max-width="600"
      persistent
    >
      <v-card v-if="selectedMenu">
        <v-card-title class="pa-4">
          <div class="d-flex align-center justify-space-between w-100">
            <div class="d-flex align-center">
              <v-icon class="mr-2" color="primary">mdi-food</v-icon>
              메뉴 상세 정보
            </div>
            <div class="d-flex align-center">
              <!-- 상태 배지 -->
              <v-chip
                :color="selectedMenu.available ? 'success' : 'error'"
                size="small"
                variant="elevated"
                class="mr-2"
              >
                {{ selectedMenu.available ? '판매중' : '품절' }}
              </v-chip>
              
              <!-- 추천 메뉴 배지 -->
              <v-chip
                v-if="selectedMenu.recommended"
                color="warning"
                size="small"
                variant="elevated"
              >
                <v-icon size="small" class="mr-1">mdi-star</v-icon>
                추천
              </v-chip>
            </div>
          </div>
        </v-card-title>
        
        <v-divider />
        
        <v-card-text class="pa-0">
          <!-- 메뉴 이미지 -->
          <v-img
            :src="selectedMenu.imageUrl || selectedMenu.image || '/images/menu-placeholder.png'"
            :alt="selectedMenu.menuName"
            height="300"
            cover
            class="mb-4"
          >
            <template v-slot:placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-icon size="64" color="grey-lighten-2">mdi-food</v-icon>
              </div>
            </template>
          </v-img>
          
          <div class="pa-4">
            <!-- 메뉴 기본 정보 -->
            <div class="mb-4">
              <div class="d-flex align-center justify-space-between mb-2">
                <h2 class="text-h5 font-weight-bold">{{ selectedMenu.menuName }}</h2>
                <span class="text-h4 font-weight-bold text-primary">
                  {{ formatCurrency(selectedMenu.price) }}
                </span>
              </div>
              
              <v-chip
                :color="getCategoryColor(selectedMenu.category)"
                size="small"
                variant="tonal"
                class="mb-3"
              >
                {{ selectedMenu.category }}
              </v-chip>
              
              <p class="text-body-1 text-grey-darken-1 mb-0">
                {{ selectedMenu.description || '메뉴 설명이 없습니다.' }}
              </p>
            </div>
            
            <!-- 메뉴 상세 정보 -->
            <v-divider class="my-4" />
            
            <div class="mb-4">
              <h4 class="text-h6 font-weight-bold mb-3 d-flex align-center">
                <v-icon class="mr-2" color="primary">mdi-information</v-icon>
                상세 정보
              </h4>
              
              <v-row>
                <v-col cols="6">
                  <div class="info-item">
                    <v-icon class="mr-2" color="grey">mdi-tag</v-icon>
                    <div>
                      <div class="text-caption text-grey">카테고리</div>
                      <div class="text-body-1">{{ selectedMenu.category }}</div>
                    </div>
                  </div>
                </v-col>
                
                <v-col cols="6">
                  <div class="info-item">
                    <v-icon class="mr-2" color="grey">mdi-currency-krw</v-icon>
                    <div>
                      <div class="text-caption text-grey">가격</div>
                      <div class="text-body-1">{{ formatCurrency(selectedMenu.price) }}</div>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </div>
          </div>
        </v-card-text>
        
        <v-divider />
        
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            @click="closeMenuDetail"
          >
            닫기
          </v-btn>
          <v-btn
            color="primary"
            variant="outlined"
            prepend-icon="mdi-pencil"
            @click="editMenuFromDetail"
            :disabled="!selectedMenu"
          >
            수정
          </v-btn>
          <v-btn
            color="error"
            variant="outlined"
            prepend-icon="mdi-delete"
            @click="deleteMenuFromDetail"
            :disabled="!selectedMenu"
          >
            삭제
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 메뉴 등록/수정 다이얼로그 (✅ 이미지 업로드 기능 추가) -->
    <v-dialog
      v-model="showMenuDialog"
      max-width="700"
      persistent
    >
      <v-card>
        <v-card-title class="pa-4">
          <div class="d-flex align-center">
            <v-icon class="mr-2" color="primary">mdi-food-plus</v-icon>
            {{ menuEditMode ? '메뉴 수정' : '메뉴 등록' }}
          </div>
        </v-card-title>
        
        <v-divider />
        
        <v-card-text class="pa-4">
          <v-form ref="menuFormRef" v-model="formValid">
            <v-row>
              <!-- ✅ 메뉴 이미지 업로드 섹션 추가 -->
              <v-col cols="12">
                <div class="image-upload-section">
                  <h4 class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center">
                    <v-icon class="mr-2" color="primary">mdi-image</v-icon>
                    메뉴 이미지
                  </h4>
                  
                  <!-- 이미지 미리보기 -->
                  <div v-if="menuFormData.imagePreview" class="mb-3">
                    <v-img
                      :src="menuFormData.imagePreview"
                      max-height="200"
                      max-width="300"
                      class="rounded mx-auto"
                    />
                    <div class="text-center mt-2">
                      <v-btn
                        size="small"
                        color="error"
                        variant="outlined"
                        prepend-icon="mdi-delete"
                        @click="removeImage"
                      >
                        이미지 제거
                      </v-btn>
                    </div>
                  </div>
                  
                  <!-- 이미지 업로드 영역 -->
                  <div v-else>
                    <v-file-input
                      v-model="menuFormData.imageFile"
                      label="메뉴 이미지 선택"
                      variant="outlined"
                      prepend-icon="mdi-camera"
                      accept="image/*"
                      show-size
                      @change="onImageSelected"
                      :rules="imageRules"
                      class="mb-3"
                    />
                    
                    <!-- 드래그앤드롭 영역 -->
                    <div
                      class="drop-zone"
                      @drop="onDrop"
                      @dragover.prevent
                      @dragenter.prevent
                    >
                      <v-icon size="48" color="grey-lighten-2">mdi-cloud-upload</v-icon>
                      <p class="text-grey text-center mt-2 mb-1">
                        이미지를 드래그하여 업로드하거나 위의 버튼을 클릭하세요
                      </p>
                      <p class="text-caption text-grey text-center">
                        JPG, PNG 파일만 업로드 가능 (최대 10MB)
                      </p>
                    </div>
                  </div>
                </div>
              </v-col>

              <!-- 기존 메뉴 정보 필드들 -->
              <v-col cols="12">
                <v-text-field
                  v-model="menuFormData.menuName"
                  label="메뉴명 *"
                  :rules="[v => !!v || '메뉴명을 입력해주세요']"
                  prepend-inner-icon="mdi-food"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-select
                  v-model="menuFormData.category"
                  label="카테고리 *"
                  :items="menuCategories"
                  :rules="[v => !!v || '카테고리를 선택해주세요']"
                  prepend-inner-icon="mdi-tag"
                  variant="outlined"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="menuFormData.price"
                  label="가격 *"
                  type="number"
                  :rules="[v => !!v || '가격을 입력해주세요', v => v > 0 || '가격은 0원보다 커야 합니다']"
                  prepend-inner-icon="mdi-currency-krw"
                  variant="outlined"
                  :min="0"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="menuFormData.description"
                  label="메뉴 설명"
                  prepend-inner-icon="mdi-text"
                  variant="outlined"
                  rows="3"
                  :rules="[v => !v || v.length <= 500 || '설명은 500자 이하로 입력해주세요']"
                />
              </v-col>

              <!-- 메뉴 옵션 -->
              <v-col cols="12">
                <v-row>
                  <v-col cols="6">
                    <v-switch
                      v-model="menuFormData.available"
                      label="판매 중"
                      color="success"
                      hide-details
                    />
                  </v-col>
                  <v-col cols="6">
                    <v-switch
                      v-model="menuFormData.recommended"
                      label="추천 메뉴"
                      color="warning"
                      hide-details
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-divider />
        
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            @click="cancelMenuForm"
            :disabled="saving"
          >
            취소
          </v-btn>
          <v-btn
            color="primary"
            @click="saveMenuWithImage"
            :loading="saving"
            :disabled="!formValid"
          >
            {{ menuEditMode ? '수정' : '등록' }}
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
import { ref, computed, onMounted } from 'vue'
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

// ✅ 이미지 업로드 기능이 포함된 메뉴 폼 데이터
const menuFormData = ref({
  menuId: null,
  id: null,
  menuName: '',
  category: '',
  price: 0,
  description: '',
  available: true,
  recommended: false,
  imageUrl: '',
  imageFile: null, // ✅ 새 이미지 파일
  imagePreview: null // ✅ 이미지 미리보기 URL
})

// 메뉴 상세 관련 상태
const showMenuDetailDialog = ref(false)
const selectedMenu = ref(null)

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

// ✅ 이미지 업로드 관련 검증 규칙
const imageRules = ref([
  value => {
    if (!value || !value.length) return true // 이미지는 선택사항
    const file = Array.isArray(value) ? value[0] : value
    if (file.size > 10 * 1024 * 1024) {
      return '이미지 크기는 10MB 이하여야 합니다'
    }
    if (!file.type.startsWith('image/')) {
      return '이미지 파일만 업로드 가능합니다'
    }
    return true
  }
])

// 컴퓨티드 속성
const storeInfo = computed(() => storeStore.storeInfo || {})

// 메뉴 관련 컴퓨티드 속성
const filteredMenus = computed(() => {
  let filtered = menus.value

  // 검색 필터
  if (menuSearch.value) {
    const search = menuSearch.value.toLowerCase()
    filtered = filtered.filter(menu => 
      menu.menuName.toLowerCase().includes(search) ||
      menu.description.toLowerCase().includes(search)
    )
  }

  // 카테고리 필터
  if (menuCategoryFilter.value && menuCategoryFilter.value !== '전체') {
    filtered = filtered.filter(menu => menu.category === menuCategoryFilter.value)
  }

  return filtered
})

// 유틸리티 함수들
const formatClosedDays = (closedDays) => {
  if (!closedDays) return '미설정'
  
  if (typeof closedDays === 'string') {
    return closedDays
  }
  
  if (Array.isArray(closedDays)) {
    const dayNames = {
      'monday': '월요일',
      'tuesday': '화요일', 
      'wednesday': '수요일',
      'thursday': '목요일',
      'friday': '금요일',
      'saturday': '토요일',
      'sunday': '일요일'
    }
    
    return closedDays.map(day => dayNames[day] || day).join(', ') || '연중무휴'
  }
  
  return '미설정'
}

const showSnackbar = (message, color = 'success') => {
  snackbar.value.message = message
  snackbar.value.color = color
  snackbar.value.show = true
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(amount)
}

const getCategoryColor = (category) => {
  const colors = {
    '커피': 'brown',
    '음료': 'blue',
    '디저트': 'pink',
    '베이커리': 'orange',
    '샐러드': 'green',
    '샌드위치': 'purple'
  }
  return colors[category] || 'grey'
}

// ===== 이미지 관련 메서드들 =====

// ✅ 이미지 파일 선택 시 처리
const onImageSelected = (files) => {
  console.log('이미지 파일 선택:', files)
  
  if (!files || !files.length) {
    menuFormData.value.imageFile = null
    menuFormData.value.imagePreview = null
    return
  }
  
  const file = Array.isArray(files) ? files[0] : files
  
  // 파일 크기 및 타입 검증
  if (file.size > 10 * 1024 * 1024) {
    showSnackbar('이미지 크기는 10MB 이하여야 합니다', 'error')
    return
  }
  
  if (!file.type.startsWith('image/')) {
    showSnackbar('이미지 파일만 업로드 가능합니다', 'error')
    return
  }
  
  menuFormData.value.imageFile = file
  
  // 이미지 미리보기 생성
  const reader = new FileReader()
  reader.onload = (e) => {
    menuFormData.value.imagePreview = e.target.result
  }
  reader.readAsDataURL(file)
}

// ✅ 드래그앤드롭 처리
const onDrop = (event) => {
  event.preventDefault()
  
  const files = event.dataTransfer.files
  if (files.length > 0) {
    onImageSelected([files[0]])
  }
}

// ✅ 이미지 제거
const removeImage = () => {
  menuFormData.value.imageFile = null
  menuFormData.value.imagePreview = null
  menuFormData.value.imageUrl = ''
}

// ===== 매장 관련 메서드들 =====
const openCreateDialog = () => {
  console.log('새 매장 등록 다이얼로그 열기')
  editMode.value = false
  resetForm()
  showCreateDialog.value = true
}

const editBasicInfo = () => {
  console.log('매장 정보 수정 시작')
  editMode.value = true
  
  // 기존 매장 정보로 폼 데이터 설정
  const store = storeInfo.value
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
    holidays: store.holidays || [],
    description: store.description || ''
  }
  
  showCreateDialog.value = true
}

const cancelForm = () => {
  console.log('폼 취소')
  showCreateDialog.value = false
  editMode.value = false
  resetForm()
}

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

// 매장 정보 저장 함수
const saveStoreInfo = async () => {
  console.log('=== 매장 정보 저장 시작 ===')
  console.log('편집 모드:', editMode.value)
  console.log('폼 데이터:', formData.value)
  
  if (!storeFormRef.value) {
    console.error('폼 참조를 찾을 수 없습니다')
    showSnackbar('폼 오류가 발생했습니다', 'error')
    return
  }
  
  const { valid } = await storeFormRef.value.validate()
  if (!valid) {
    console.log('폼 유효성 검사 실패')
    showSnackbar('필수 정보를 모두 입력해주세요', 'error')
    return
  }
  
  saving.value = true
  
  try {
    const storeData = {
      storeName: formData.value.storeName,
      businessType: formData.value.businessType,
      address: formData.value.address,
      phoneNumber: formData.value.phoneNumber,
      businessHours: `${formData.value.openTime}-${formData.value.closeTime}`,
      closedDays: Array.isArray(formData.value.holidays) ? formData.value.holidays.join(',') : '',
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

// ===== 메뉴 관련 메서드들 =====

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
  
  menuFormData.value = {
    menuId: menuId,
    id: menuId,
    menuName: menu.menuName || menu.name || '',
    category: menu.category || '',
    price: menu.price || 0,
    description: menu.description || '',
    available: menu.available !== undefined ? menu.available : true,
    recommended: menu.recommended !== undefined ? menu.recommended : false,
    imageUrl: menu.imageUrl || menu.image || '',
    imageFile: null, // ✅ 수정 시에는 새 이미지 파일 없음
    imagePreview: menu.imageUrl || menu.image || null // ✅ 기존 이미지 미리보기
  }
  
  console.log('✅ 수정 폼 데이터 설정 완료:', menuFormData.value)
  showMenuDialog.value = true
}

const viewMenuDetail = async (menu) => {
  console.log('=== 메뉴 상세 보기 호출 ===')
  console.log('전달받은 메뉴 객체:', menu)
  
  if (!menu || menu === null || menu === undefined) {
    console.error('❌ 전달받은 메뉴 객체가 null 또는 undefined입니다')
    showSnackbar('메뉴 정보를 찾을 수 없습니다', 'error')
    return
  }
  
  const menuId = menu.menuId || menu.id
  
  if (!menuId || menuId === 'undefined' || menuId === null) {
    console.error('❌ 메뉴 ID를 찾을 수 없음:', menu)
    showSnackbar('메뉴 ID를 찾을 수 없습니다', 'error')
    return
  }
  
  console.log('✅ 사용할 메뉴 ID:', menuId)
  
  try {
    const { menuService } = await import('@/services/menu')
    
    console.log('메뉴 상세 API 호출 시작, ID:', menuId)
    const result = await menuService.getMenuDetail(menuId)
    
    if (result.success && result.data) {
      selectedMenu.value = {
        ...result.data,
        id: result.data.menuId || result.data.id,
        menuId: result.data.menuId || result.data.id
      }
      showMenuDetailDialog.value = true
      console.log('✅ 메뉴 상세 정보 로드 성공:', selectedMenu.value)
    } else {
      console.warn('⚠️ 상세 정보 로드 실패, 기본 정보 사용:', result.message)
      selectedMenu.value = {
        ...menu,
        id: menuId,
        menuId: menuId
      }
      showMenuDetailDialog.value = true
      console.log('기본 메뉴 정보로 설정:', selectedMenu.value)
    }
  } catch (error) {
    console.error('메뉴 상세 정보 로드 실패:', error)
    selectedMenu.value = {
      ...menu,
      id: menuId,
      menuId: menuId
    }
    showMenuDetailDialog.value = true
    console.log('오류 발생으로 기본 메뉴 정보 사용:', selectedMenu.value)
  }
}

const closeMenuDetail = () => {
  console.log('=== 메뉴 상세 다이얼로그 닫기 ===')
  showMenuDetailDialog.value = false
  
  setTimeout(() => {
    selectedMenu.value = null
    console.log('selectedMenu.value가 null로 설정됨')
  }, 100)
}

const editMenuFromDetail = () => {
  console.log('=== 메뉴 상세에서 수정 버튼 클릭 ===')
  console.log('selectedMenu.value:', selectedMenu.value)
  
  if (!selectedMenu.value || selectedMenu.value === null || selectedMenu.value === undefined) {
    console.error('❌ 선택된 메뉴가 null 또는 undefined입니다')
    showSnackbar('선택된 메뉴 정보가 없습니다. 다시 시도해주세요.', 'error')
    showMenuDetailDialog.value = false
    return
  }
  
  const menuId = selectedMenu.value.menuId || selectedMenu.value.id
  if (!menuId) {
    console.error('❌ 선택된 메뉴에 ID가 없습니다:', selectedMenu.value)
    showSnackbar('메뉴 ID를 찾을 수 없습니다', 'error')
    return
  }
  
  console.log('✅ 수정할 메뉴 정보:', {
    id: menuId,
    name: selectedMenu.value.menuName || selectedMenu.value.name,
    category: selectedMenu.value.category
  })
  
  closeMenuDetail()
  editMenu(selectedMenu.value)
}

const deleteMenuFromDetail = () => {
  console.log('=== 메뉴 상세에서 삭제 버튼 클릭 ===')
  console.log('selectedMenu.value:', selectedMenu.value)
  
  if (!selectedMenu.value || selectedMenu.value === null || selectedMenu.value === undefined) {
    console.error('❌ 선택된 메뉴가 null 또는 undefined입니다')
    showSnackbar('선택된 메뉴 정보가 없습니다. 다시 시도해주세요.', 'error')
    showMenuDetailDialog.value = false
    return
  }
  
  const menuId = selectedMenu.value.menuId || selectedMenu.value.id
  if (!menuId) {
    console.error('❌ 선택된 메뉴에 ID가 없습니다:', selectedMenu.value)
    showSnackbar('메뉴 ID를 찾을 수 없습니다', 'error')
    return
  }
  
  console.log('✅ 삭제할 메뉴 정보:', {
    id: menuId,
    name: selectedMenu.value.menuName || selectedMenu.value.name
  })
  
  closeMenuDetail()
  confirmDeleteMenu(selectedMenu.value)
}

const editMenuDirect = (menu, event) => {
  console.log('=== 메뉴 카드에서 직접 수정 ===')
  
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  
  console.log('직접 수정할 메뉴:', menu)
  
  if (!menu || menu === null || menu === undefined) {
    console.error('❌ 메뉴 객체가 null 또는 undefined입니다')
    showSnackbar('메뉴 정보를 찾을 수 없습니다', 'error')
    return
  }
  
  editMenu(menu)
}

const deleteMenuDirect = (menu, event) => {
  console.log('=== 메뉴 카드에서 직접 삭제 ===')
  
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }
  
  console.log('직접 삭제할 메뉴:', menu)
  
  if (!menu || menu === null || menu === undefined) {
    console.error('❌ 메뉴 객체가 null 또는 undefined입니다')
    showSnackbar('메뉴 정보를 찾을 수 없습니다', 'error')
    return
  }
  
  confirmDeleteMenu(menu)
}

const openCreateMenuDialog = () => {
  console.log('메뉴 등록 다이얼로그 열기')
  menuEditMode.value = false
  resetMenuForm()
  showMenuDialog.value = true
}

const confirmDeleteMenu = (menu) => {
  console.log('=== 메뉴 삭제 확인 ===')
  console.log('전달받은 메뉴 객체:', menu)
  
  const menuId = menu.menuId || menu.id
  
  if (!menuId || menuId === 'undefined' || menuId === null) {
    console.error('❌ 메뉴 ID를 찾을 수 없음:', menu)
    showSnackbar('메뉴 ID를 찾을 수 없습니다', 'error')
    return
  }
  
  console.log('✅ 삭제할 메뉴 ID:', menuId)
  
  if (confirm(`'${menu.menuName || menu.name}' 메뉴를 삭제하시겠습니까?`)) {
    deleteMenu(menuId)
  }
}

const clearFilters = () => {
  menuSearch.value = ''
  menuCategoryFilter.value = '전체'
}

const cancelMenuForm = () => {
  console.log('메뉴 폼 취소')
  showMenuDialog.value = false
  menuEditMode.value = false
  resetMenuForm()
}

// ✅ 메뉴 폼 초기화 (이미지 관련 필드 포함)
const resetMenuForm = () => {
  menuFormData.value = {
    menuId: null,
    id: null,
    menuName: '',
    category: '',
    price: 0,
    description: '',
    available: true,
    recommended: false,
    imageUrl: '',
    imageFile: null, // ✅ 이미지 파일 초기화
    imagePreview: null // ✅ 미리보기 초기화
  }
  
  if (menuFormRef.value) {
    menuFormRef.value.resetValidation()
  }
}

// ✅ 메뉴 저장 + 이미지 업로드 (2단계 처리)
const saveMenuWithImage = async () => {
  console.log('=== 메뉴 저장 + 이미지 업로드 시작 ===')
  
  if (!menuFormRef.value) {
    console.error('❌ 폼 참조를 찾을 수 없음')
    showSnackbar('폼 오류가 발생했습니다', 'error')
    return
  }
  
  const { valid } = await menuFormRef.value.validate()
  if (!valid) {
    console.log('❌ 폼 유효성 검사 실패')
    showSnackbar('필수 정보를 모두 입력해주세요', 'error')
    return
  }
  
  saving.value = true
  
  try {
    const { menuService } = await import('@/services/menu')
    
    let menuResult
    let savedMenuId
    
    if (menuEditMode.value) {
  // 메뉴 수정 - PUT /api/menu/{menuId}
  const menuId = menuFormData.value.id || menuFormData.value.menuId
  if (!menuId) {
    showSnackbar('메뉴 ID가 없습니다', 'error')
    return
  }
  
  console.log('=== 메뉴 수정 데이터 준비 ===')
  console.log('폼 데이터:', menuFormData.value)
  console.log('메뉴 ID:', menuId)
  
  // 메뉴 데이터 검증 및 준비
  const menuName = menuFormData.value.menuName || menuFormData.value.name
  const category = menuFormData.value.category
  const price = menuFormData.value.price
  const description = menuFormData.value.description
  
  // 프론트엔드에서 기본 검증
  if (!menuName || !category || price === undefined || price === null) {
    console.error('❌ 필수 필드 누락:', { menuName, category, price, description })
    showSnackbar('메뉴명, 카테고리, 가격을 모두 입력해주세요', 'error')
    return
  }
  
  if (isNaN(parseInt(price)) || parseInt(price) < 0) {
    showSnackbar('올바른 가격을 입력해주세요', 'error')
    return
  }
  
  const menuData = {
    menuName: menuName,
    category: category,
    price: parseInt(price),
    description: description || ''
  }
  
  console.log('✅ 최종 메뉴 수정 데이터:', menuData)
  
  menuResult = await menuService.updateMenu(menuId, menuData)
}else {
      // ✅ 메뉴 등록
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
      
      menuResult = await menuService.registerMenu(menuData)
      savedMenuId = menuResult.data?.menuId
    }
    
    console.log('✅ 메뉴 저장 완료:', menuResult)
    
    if (!menuResult.success) {
      showSnackbar(menuResult.message || '메뉴 저장에 실패했습니다', 'error')
      return
    }
    
    // ✅ 2단계: 이미지 업로드 (이미지가 있는 경우만)
    if (menuFormData.value.imageFile && savedMenuId) {
      console.log('=== 이미지 업로드 시작 ===')
      console.log('메뉴 ID:', savedMenuId)
      console.log('이미지 파일:', menuFormData.value.imageFile)
      
      const imageResult = await menuService.uploadMenuImage(savedMenuId, menuFormData.value.imageFile)
      
      if (imageResult.success) {
        console.log('✅ 이미지 업로드 완료:', imageResult)
        showSnackbar(`메뉴가 ${menuEditMode.value ? '수정' : '등록'}되었고 이미지도 업로드되었습니다`, 'success')
      } else {
        console.warn('⚠️ 이미지 업로드 실패:', imageResult.message)
        showSnackbar(`메뉴는 ${menuEditMode.value ? '수정' : '등록'}되었지만 이미지 업로드에 실패했습니다`, 'warning')
      }
    } else {
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

// 메뉴 데이터 로드 함수 - 실제 API 연동
const loadMenus = async () => {
  try {
    console.log('메뉴 데이터 로드 시작')
    const result = await storeStore.fetchMenus()
    
    if (result.success) {
      menus.value = result.data
      console.log('✅ 메뉴 데이터 로드 완료:', result.data)
    } else {
      console.log('메뉴 데이터 없음 또는 로드 실패:', result.message)
      menus.value = []
    }
  } catch (error) {
    console.error('메뉴 데이터 로드 실패:', error)
    menus.value = []
  }
}

/**
 * 컴포넌트 마운트 시 실행
 */
onMounted(async () => {
  console.log('=== StoreManagementView 마운트됨 ===')
  
  try {
    const result = await storeStore.fetchStoreInfo()
    
    console.log('매장 정보 조회 결과:', result)
    
    if (result.success) {
      console.log('✅ 매장 정보 로드 완료:', result.data)
      await loadMenus()
    } else {
      if (result.message === '등록된 매장이 없습니다') {
        console.log('⚠️ 등록된 매장이 없음 - 등록 화면 표시')
      } else {
        console.warn('❌ 매장 정보 조회 실패:', result.message)
        showSnackbar(result.message || '매장 정보를 불러오는데 실패했습니다', 'error')
      }
    }
  } catch (error) {
    console.error('매장 정보 조회 중 예외 발생:', error)
    showSnackbar('매장 정보를 불러오는 중 오류가 발생했습니다', 'error')
  }
})
</script>

<style scoped>
.info-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 16px;
}

.info-item .v-icon {
  margin-top: 2px;
}

.gap-3 {
  gap: 12px;
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 메뉴 카드 스타일 */
.menu-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  cursor: pointer;
}

.menu-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.position-relative {
  position: relative;
}

.position-absolute {
  position: absolute;
}

.top-0 {
  top: 0;
}

.right-0 {
  right: 0;
}

.left-0 {
  left: 0;
}

.h-100 {
  height: 100%;
}

/* ✅ 이미지 업로드 관련 스타일 */
.image-upload-section {
  border: 1px dashed #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background-color: #fafafa;
}

.drop-zone {
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  margin-top: 12px;
  transition: border-color 0.3s ease, background-color 0.3s ease;
  cursor: pointer;
}

.drop-zone:hover {
  border-color: #1976d2;
  background-color: #f5f5f5;
}

@media (max-width: 600px) {
  .info-item {
    margin-bottom: 12px;
  }
  
  .menu-card {
    margin-bottom: 16px;
  }
  
  .empty-state {
    padding: 2rem 1rem;
  }
  
  .image-upload-section {
    padding: 12px;
  }
  
  .drop-zone {
    padding: 16px;
  }
}
</style>