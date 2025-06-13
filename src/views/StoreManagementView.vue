//* src/views/StoreManagementView.vue
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
                @click="showCreateDialog = true"
              >
                매장 정보 등록하기
              </v-btn>
              <v-btn
                color="success"
                size="large"
                variant="outlined"
                prepend-icon="mdi-eye"
                @click="loadDemoStoreData"
              >
                데모 매장 정보로 미리보기
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
        <!-- 기본 정보 탭 (운영 설정 포함) -->
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
                <v-col cols="12" md="4">
                  <div class="text-center">
                    <v-avatar size="120" class="mb-4">
                      <v-img
                        :src="storeInfo.imageUrl || '/images/store-placeholder.png'"
                        :alt="storeInfo.storeName"
                      />
                    </v-avatar>
                    <h3 class="text-h6 font-weight-bold">{{ storeInfo.storeName }}</h3>
                    <p class="text-caption text-grey">{{ storeInfo.businessType }}</p>
                  </div>
                </v-col>
                
                <v-col cols="12" md="8">
                  <v-row>
                    <v-col cols="12" sm="6">
                      <div class="mb-4">
                        <h4 class="text-subtitle-2 text-grey mb-1">사업자명</h4>
                        <p class="text-body-1">{{ storeInfo.ownerName }}</p>
                      </div>
                    </v-col>
                    
                    <v-col cols="12" sm="6">
                      <div class="mb-4">
                        <h4 class="text-subtitle-2 text-grey mb-1">사업자등록번호</h4>
                        <p class="text-body-1">{{ storeInfo.businessNumber }}</p>
                      </div>
                    </v-col>
                    
                    <v-col cols="12">
                      <div class="mb-4">
                        <h4 class="text-subtitle-2 text-grey mb-1">주소</h4>
                        <p class="text-body-1">{{ storeInfo.address }}</p>
                      </div>
                    </v-col>
                    
                    <v-col cols="12" sm="6">
                      <div class="mb-4">
                        <h4 class="text-subtitle-2 text-grey mb-1">연락처</h4>
                        <p class="text-body-1">{{ storeInfo.phoneNumber }}</p>
                      </div>
                    </v-col>
                    
                    <v-col cols="12" sm="6">
                      <div class="mb-4">
                        <h4 class="text-subtitle-2 text-grey mb-1">좌석 수</h4>
                        <p class="text-body-1">{{ storeInfo.seatCount }}석</p>
                      </div>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              
              <!-- SNS 계정 정보 -->
              <v-divider class="my-6" />
              
              <h4 class="text-h6 font-weight-bold mb-4">SNS 계정 정보</h4>
              
              <v-row>
                <v-col cols="12" sm="6">
                  <div class="d-flex align-center justify-space-between">
                    <div class="d-flex align-center">
                      <v-icon color="purple" class="mr-3">mdi-instagram</v-icon>
                      <div>
                        <p class="text-body-2 text-grey mb-1">Instagram</p>
                        <p class="text-body-1">{{ storeInfo.instagramUrl || '등록되지 않음' }}</p>
                      </div>
                    </div>
                  
                  </div>
                </v-col>
                
                <v-col cols="12" sm="6">
                  <div class="d-flex align-center justify-space-between">
                    <div class="d-flex align-center">
                      <v-icon color="green" class="mr-3">mdi-blogger</v-icon>
                      <div>
                        <p class="text-body-2 text-grey mb-1">네이버 블로그</p>
                        <p class="text-body-1">{{ storeInfo.blogUrl || '등록되지 않음' }}</p>
                      </div>
                    </div>
                  
                  </div>
                </v-col>
              </v-row>
              
              <!-- 운영 정보 -->
              <v-divider class="my-6" />
              
              <h4 class="text-h6 font-weight-bold mb-4">운영 정보</h4>
              
              <v-row>
                <v-col cols="12" sm="4">
                  <div class="mb-4">
                    <h4 class="text-subtitle-2 text-grey mb-1">영업시간</h4>
                    <p class="text-body-1">{{ storeInfo.openTime }} - {{ storeInfo.closeTime }}</p>
                  </div>
                </v-col>
                
                <v-col cols="12" sm="4">
                  <div class="mb-4">
                    <h4 class="text-subtitle-2 text-grey mb-1">휴무일</h4>
                    <p class="text-body-1">{{ formatHolidays(storeInfo.holidays) }}</p>
                  </div>
                </v-col>
                
                <v-col cols="12" sm="4">
                  <div class="mb-4">
                    <h4 class="text-subtitle-2 text-grey mb-1">서비스</h4>
                    <div class="d-flex gap-2">
                      <v-chip
                        v-if="storeInfo.deliveryAvailable"
                        color="success"
                        size="small"
                        variant="tonal"
                      >
                        배달
                      </v-chip>
                      <v-chip
                        v-if="storeInfo.takeoutAvailable"
                        color="primary"
                        size="small"
                        variant="tonal"
                      >
                        포장
                      </v-chip>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-tabs-window-item>

        <!-- 메뉴 관리 탭 -->
        <v-tabs-window-item value="menu">
          <!-- 메뉴 통계 카드 -->
          <v-row class="mb-4">
            <v-col cols="6" sm="3">
              <v-card class="text-center pa-4" variant="tonal" color="primary">
                <div class="text-h4 font-weight-bold">{{ menus.length }}</div>
                <div class="text-caption text-grey">전체 메뉴</div>
              </v-card>
            </v-col>
            <v-col cols="6" sm="3">
              <v-card class="text-center pa-4" variant="tonal" color="success">
                <div class="text-h4 font-weight-bold">{{ availableMenusCount }}</div>
                <div class="text-caption text-grey">판매중</div>
              </v-card>
            </v-col>
            <v-col cols="6" sm="3">
              <v-card class="text-center pa-4" variant="tonal" color="warning">
                <div class="text-h4 font-weight-bold">{{ recommendedMenusCount }}</div>
                <div class="text-caption text-grey">추천메뉴</div>
              </v-card>
            </v-col>
            <v-col cols="6" sm="3">
              <v-card class="text-center pa-4" variant="tonal" color="info">
                <div class="text-h4 font-weight-bold">{{ averagePrice }}</div>
                <div class="text-caption text-grey">평균가격</div>
              </v-card>
            </v-col>
          </v-row>

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
                <v-col cols="12" sm="3">
                  <v-select
                    v-model="menuStatusFilter"
                    label="상태 필터"
                    variant="outlined"
                    :items="['전체', '판매중', '품절']"
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
                    :src="menu.imageUrl || '/images/menu-placeholder.png'"
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
                          <v-btn
                            icon
                            size="small"
                            variant="text"
                            color="error"
                            @click.stop="confirmDeleteMenu(menu)"
                          >
                            <v-icon size="small">mdi-delete</v-icon>
                          </v-btn>
                          <v-btn
                            icon
                            size="small"
                            variant="text"
                            @click.stop="editMenu(menu)"
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

    <!-- 스낵바 -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="bottom"
    >
      {{ snackbar.message }}
    </v-snackbar>
    
    <!-- 매장 등록/수정 다이얼로그 -->
    <v-dialog
      v-model="showCreateDialog"
      max-width="800"
      persistent
      scrollable
    >
      <v-card>
        <v-card-title class="pa-4">
          <span class="text-h6">{{ editMode ? '매장 정보 수정' : '매장 정보 등록' }}</span>
          <v-spacer />
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-6" style="max-height: 500px;">
          <v-form ref="storeForm" v-model="formValid">
            <v-row>
              <!-- 매장 이미지 -->
              <v-col cols="12">
                <h4 class="text-subtitle-1 font-weight-bold mb-3">매장 이미지</h4>
                <div class="text-center mb-4">
                  <v-avatar size="120" class="mb-3">
                    <v-img
                      :src="formData.imageUrl || '/images/store-placeholder.png'"
                      alt="매장 이미지"
                    />
                  </v-avatar>
                  <br>
                  <v-btn
                    color="primary"
                    variant="outlined"
                    prepend-icon="mdi-camera"
                    @click="selectImage"
                  >
                    이미지 선택
                  </v-btn>
                  <input
                    ref="imageInput"
                    type="file"
                    accept="image/*"
                    style="display: none;"
                    @change="handleImageUpload"
                  >
                </div>
              </v-col>

              <!-- 기본 정보 -->
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.storeName"
                  label="매장명 *"
                  variant="outlined"
                  :rules="[v => !!v || '매장명을 입력해주세요']"
                  required
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-select
                  v-model="formData.businessType"
                  label="업종 *"
                  variant="outlined"
                  :items="businessTypes"
                  :rules="[v => !!v || '업종을 선택해주세요']"
                  required
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.ownerName"
                  label="사업자명 *"
                  variant="outlined"
                  :rules="[v => !!v || '사업자명을 입력해주세요']"
                  required
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.businessNumber"
                  label="사업자등록번호 *"
                  variant="outlined"
                  :rules="businessNumberRules"
                  required
                />
              </v-col>

              <v-col cols="12">
                <v-text-field
                  v-model="formData.address"
                  label="주소 *"
                  variant="outlined"
                  :rules="[v => !!v || '주소를 입력해주세요']"
                  required
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.phoneNumber"
                  label="연락처 *"
                  variant="outlined"
                  :rules="phoneRules"
                  required
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="formData.seatCount"
                  label="좌석 수"
                  variant="outlined"
                  type="number"
                  min="0"
                />
              </v-col>

            </v-row>

            <!-- SNS 정보 섹션 -->
            <v-divider class="my-4" />
            <h3 class="text-h6 font-weight-bold mb-6">SNS 계정 정보</h3>
            
            <!-- 인스타그램 -->
            <div class="mb-6">
              <div class="d-flex align-center mb-3">
                <v-icon color="purple" class="mr-2">mdi-instagram</v-icon>
                <span class="text-subtitle-2 font-weight-medium">인스타그램</span>
              </div>
              
              <div class="sns-input-container">
                <div class="sns-input-row">
                  <v-text-field
                    v-model="formData.instagramUrl"
                    placeholder="@계정명 또는 URL 입력"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-at"
                    hide-details="auto"
                    class="sns-text-field"
                  />
                  <v-btn
                    color="purple"
                    variant="tonal"
                    :loading="snsCheckLoading.instagram"
                    @click="checkSnsConnection('instagram')"
                    class="sns-check-btn ml-4"
                  >
                    연동 확인
                  </v-btn>
                </div>
              </div>
            </div>

            <!-- 네이버 블로그 -->
            <div class="mb-6">
              <div class="d-flex align-center mb-3">
                <v-icon color="green" class="mr-2">mdi-web</v-icon>
                <span class="text-subtitle-2 font-weight-medium">네이버 블로그</span>
              </div>
              
              <div class="sns-input-container">
                <div class="sns-input-row">
                  <v-text-field
                    v-model="formData.blogUrl"
                    placeholder="blog.naver.com/계정명 형식으로 입력"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-web"
                    hide-details="auto"
                    class="sns-text-field"
                  />
                  <v-btn
                    color="green"
                    variant="tonal"
                    :loading="snsCheckLoading.blog"
                    @click="checkSnsConnection('blog')"
                    class="sns-check-btn ml-4"
                  >
                    연동 확인
                  </v-btn>
                </div>
              </div>
            </div>

            <!-- 운영 정보 -->
            <v-divider class="my-4" />
            <h4 class="text-subtitle-1 font-weight-bold mb-3">운영 정보</h4>
            
            <v-row>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.openTime"
                  label="오픈 시간"
                  variant="outlined"
                  type="time"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.closeTime"
                  label="마감 시간"
                  variant="outlined"
                  type="time"
                />
              </v-col>

              <v-col cols="12">
                <v-select
                  v-model="formData.holidays"
                  label="휴무일"
                  variant="outlined"
                  :items="daysOfWeek"
                  multiple
                  chips
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-switch
                  v-model="formData.deliveryAvailable"
                  label="배달 서비스"
                  color="primary"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-switch
                  v-model="formData.takeoutAvailable"
                  label="포장 서비스"
                  color="primary"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            variant="text"
            @click="closeDialog"
          >
            취소
          </v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            :disabled="!formValid"
            @click="saveStoreInfo"
          >
            {{ editMode ? '수정하기' : '등록하기' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 메뉴 등록/수정 다이얼로그 -->
    <v-dialog
      v-model="showMenuDialog"
      max-width="600"
      persistent
      scrollable
    >
      <v-card>
        <v-card-title class="pa-4 d-flex align-center justify-space-between">
          <span class="text-h6">{{ editMenuMode ? '메뉴 수정' : '메뉴 등록' }}</span>
          <v-btn
            icon
            @click="closeMenuDialog"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-6" style="max-height: 500px;">
          <v-form ref="menuForm" v-model="menuFormValid">
            <!-- 메뉴 이미지 -->
            <div class="text-center mb-6">
              <v-img
                :src="menuFormData.imageUrl || '/images/menu-placeholder.png'"
                :alt="menuFormData.menuName"
                max-width="200"
                max-height="150"
                class="mx-auto mb-3 rounded"
              />
              <v-btn
                color="primary"
                variant="outlined"
                prepend-icon="mdi-camera"
                @click="selectMenuImage"
              >
                이미지 선택
              </v-btn>
              <input
                ref="menuImageInput"
                type="file"
                accept="image/*"
                style="display: none;"
                @change="handleMenuImageUpload"
              >
            </div>

            <v-row>
              <v-col cols="12" sm="8">
                <v-text-field
                  v-model="menuFormData.menuName"
                  label="메뉴명 *"
                  variant="outlined"
                  :rules="[v => !!v || '메뉴명을 입력해주세요']"
                  required
                />
              </v-col>

              <v-col cols="12" sm="4">
                <v-text-field
                  v-model.number="menuFormData.price"
                  label="가격 *"
                  variant="outlined"
                  type="number"
                  prefix="₩"
                  :rules="priceRules"
                  required
                />
              </v-col>

              <v-col cols="12">
                <v-combobox
                  v-model="menuFormData.category"
                  label="카테고리 *"
                  variant="outlined"
                  :items="menuCategories"
                  :rules="[v => !!v || '카테고리를 선택해주세요']"
                  required
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="menuFormData.description"
                  label="메뉴 설명"
                  variant="outlined"
                  rows="3"
                  placeholder="메뉴에 대한 자세한 설명을 입력해주세요"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <div class="d-flex flex-column gap-2 mt-4">
                  <v-switch
                    v-model="menuFormData.available"
                    label="판매 중"
                    color="success"
                  />
                  <v-switch
                    v-model="menuFormData.recommended"
                    label="추천 메뉴"
                    color="warning"
                  />
                </div>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            variant="text"
            @click="closeMenuDialog"
          >
            취소
          </v-btn>
          <v-btn
            color="primary"
            :loading="savingMenu"
            :disabled="!menuFormValid"
            @click="saveMenu"
          >
            {{ editMenuMode ? '수정하기' : '등록하기' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 메뉴 삭제 확인 다이얼로그 -->
    <v-dialog v-model="showDeleteMenuDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">메뉴 삭제</v-card-title>
        <v-card-text>
          <p>정말로 <strong>{{ deleteMenuTarget?.menuName }}</strong> 메뉴를 삭제하시겠습니까?</p>
          <v-alert type="warning" variant="tonal" class="mt-3">
            삭제된 메뉴는 복구할 수 없습니다.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="showDeleteMenuDialog = false"
          >
            취소
          </v-btn>
          <v-btn
            color="error"
            :loading="deletingMenu"
            @click="deleteMenu"
          >
            삭제
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 메뉴 상세 다이얼로그 -->
    <v-dialog v-model="showMenuDetailDialog" max-width="500">
      <v-card class="menu-detail-card">
        <v-card-title class="pa-4 d-flex align-center justify-space-between">
          <span class="text-h6">메뉴 상세 정보</span>
          <v-btn
            icon
            @click="showMenuDetailDialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-4" v-if="selectedMenuDetail">
          <!-- 메뉴 이미지 -->
          <div class="text-center mb-4">
            <v-img
              :src="selectedMenuDetail.imageUrl || '/images/menu-placeholder.png'"
              :alt="selectedMenuDetail.menuName"
              max-width="300"
              max-height="200"
              class="mx-auto rounded"
            />
          </div>

          <!-- 메뉴 기본 정보 -->
          <div class="menu-detail-info mb-4">
            <h3 class="text-h6 font-weight-bold mb-2">{{ selectedMenuDetail.menuName }}</h3>
            <p class="text-body-1 mb-2">
              {{ selectedMenuDetail.description || '설명이 없습니다.' }}
            </p>
          </div>

          <!-- 메뉴 정보 카드들 -->
          <v-row>
            <v-col cols="6">
              <v-card variant="tonal" color="primary" class="text-center pa-4">
                <v-icon size="32" class="mb-2">mdi-food</v-icon>
                <h4 class="text-subtitle-1 font-weight-bold">카테고리</h4>
                <p class="text-body-2">{{ selectedMenuDetail.category }}</p>
              </v-card>
            </v-col>
            <v-col cols="6">
              <v-card variant="tonal" color="success" class="text-center pa-4">
                <v-icon size="32" class="mb-2">mdi-currency-krw</v-icon>
                <h4 class="text-subtitle-1 font-weight-bold">가격</h4>
                <p class="text-body-2">{{ formatCurrency(selectedMenuDetail.price) }}</p>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4 justify-end">
          <v-btn
            variant="text"
            @click="showMenuDetailDialog = false"
          >
            닫기
          </v-btn>
          <v-btn
            color="primary"
            @click="editFromDetail"
          >
            수정하기
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- SNS 연동 확인 결과 다이얼로그 -->
    <v-dialog v-model="showSnsResultDialog" max-width="400">
      <v-card>
        <v-card-title class="pa-4">
          <v-icon :color="snsConnectionResult.success ? 'success' : 'error'" class="mr-2">
            {{ snsConnectionResult.success ? 'mdi-check-circle' : 'mdi-alert-circle' }}
          </v-icon>
          SNS 연동 확인
        </v-card-title>
        <v-card-text class="pa-4">
          <p>{{ snsConnectionResult.message }}</p>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="primary"
            @click="showSnsResultDialog = false"
          >
            확인
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStoreStore } from '@/store/index'

/**
 * AI 마케팅 서비스 - 매장 관리 페이지
 * 매장 정보 관리 및 메뉴 관리 기능 제공
 * 유저스토리: STR-005, STR-010, STR-015, STR-020, STR-025, STR-030, STR-035, STR-040
 */

// 스토어
const storeStore = useStoreStore()

// 탭 관리
const currentTab = ref('basic')

// 매장 정보 관련 상태
const showCreateDialog = ref(false)
const editMode = ref(false)
const formValid = ref(false)
const saving = ref(false)
const imageInput = ref(null)

// 메뉴 관리 관련 상태
const showMenuDialog = ref(false)
const editMenuMode = ref(false)
const menuFormValid = ref(false)
const savingMenu = ref(false)
const deletingMenu = ref(false)
const showDeleteMenuDialog = ref(false)
const deleteMenuTarget = ref(null)
const menuImageInput = ref(null)
const menuSearch = ref('')
const menuCategoryFilter = ref('전체')
const menuStatusFilter = ref('전체')

// SNS 연동 관련 상태
const snsCheckLoading = ref({
  instagram: false,
  blog: false
})
const showSnsResultDialog = ref(false)
const snsConnectionResult = ref({
  success: false,
  platform: '',
  message: ''
})

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
  ownerName: '',
  businessNumber: '',
  address: '',
  phoneNumber: '',
  seatCount: 0,
  instagramUrl: '',
  blogUrl: '',
  openTime: '09:00',
  closeTime: '21:00',
  holidays: [],
  deliveryAvailable: false,
  takeoutAvailable: true,
  imageUrl: ''
})

// 메뉴 폼 데이터
const menuFormData = ref({
  menuName: '',
  price: 0,
  category: '',
  description: '',
  available: true,
  recommended: false,
  imageUrl: ''
})

// 메뉴 목록 (데모 데이터)
const menus = ref([
  {
    id: 1,
    menuName: '김치찌개',
    category: '찌개류',
    price: 8000,
    description: '돼지고기와 신김치로 끓인 얼큰한 김치찌개',
    available: true,
    recommended: true,
    imageUrl: '/images/kimchi-jjigae.jpg'
  },
  {
    id: 2,
    menuName: '된장찌개',
    category: '찌개류',
    price: 7000,
    description: '집된장으로 끓인 구수한 된장찌개',
    available: true,
    recommended: false,
    imageUrl: '/images/doenjang-jjigae.jpg'
  },
  {
    id: 3,
    menuName: '제육볶음',
    category: '볶음류',
    price: 12000,
    description: '매콤달콤한 양념에 볶은 제육볶음',
    available: false,
    recommended: true,
    imageUrl: '/images/jeyuk-bokkeum.jpg'
  }
])

// 컴퓨티드 속성
const storeInfo = computed(() => storeStore.storeInfo || {})

const availableMenusCount = computed(() => 
  menus.value.filter(menu => menu.available).length
)

const recommendedMenusCount = computed(() => 
  menus.value.filter(menu => menu.recommended).length
)

const averagePrice = computed(() => {
  if (menus.value.length === 0) return '0원'
  const total = menus.value.reduce((sum, menu) => sum + menu.price, 0)
  const average = Math.round(total / menus.value.length)
  return formatCurrency(average)
})

const filteredMenus = computed(() => {
  let filtered = menus.value

  // 검색 필터
  if (menuSearch.value) {
    filtered = filtered.filter(menu =>
      menu.menuName.toLowerCase().includes(menuSearch.value.toLowerCase()) ||
      menu.description.toLowerCase().includes(menuSearch.value.toLowerCase())
    )
  }

  // 카테고리 필터
  if (menuCategoryFilter.value !== '전체') {
    filtered = filtered.filter(menu => menu.category === menuCategoryFilter.value)
  }

  // 상태 필터
  if (menuStatusFilter.value !== '전체') {
    const isAvailable = menuStatusFilter.value === '판매중'
    filtered = filtered.filter(menu => menu.available === isAvailable)
  }

  return filtered
})

const menuCategories = computed(() => {
  const categories = [...new Set(menus.value.map(menu => menu.category))]
  return categories.sort()
})

// 선택 옵션
const businessTypes = [
  '한식', '중식', '일식', '양식', '분식', '치킨', '피자', '버거',
  '카페', '디저트', '술집', '기타'
]

const daysOfWeek = [
  { title: '월요일', value: 'monday' },
  { title: '화요일', value: 'tuesday' },
  { title: '수요일', value: 'wednesday' },
  { title: '목요일', value: 'thursday' },
  { title: '금요일', value: 'friday' },
  { title: '토요일', value: 'saturday' },
  { title: '일요일', value: 'sunday' }
]

// 유효성 검사 규칙
const businessNumberRules = [
  v => !!v || '사업자등록번호를 입력해주세요',
  v => /^\d{3}-\d{2}-\d{5}$/.test(v) || '올바른 사업자등록번호 형식이 아닙니다 (예: 123-45-67890)'
]

const phoneRules = [
  v => !!v || '연락처를 입력해주세요',
  v => /^[0-9-+\s()]+$/.test(v) || '올바른 연락처 형식이 아닙니다'
]

const priceRules = [
  v => !!v || '가격을 입력해주세요',
  v => v > 0 || '가격은 0보다 커야 합니다'
]

// 유틸리티 함수
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(amount)
}

const formatHolidays = (holidays) => {
  if (!holidays || holidays.length === 0) return '없음'
  const dayNames = {
    monday: '월요일',
    tuesday: '화요일',
    wednesday: '수요일',
    thursday: '목요일',
    friday: '금요일',
    saturday: '토요일',
    sunday: '일요일'
  }
  return holidays.map(day => dayNames[day]).join(', ')
}

const getCategoryColor = (category) => {
  const colors = {
    '면류': 'orange',
    '튀김류': 'amber',
    '음료': 'blue',
    '안주': 'green',
    '디저트': 'pink',
    '찌개류': 'red',
    '볶음류': 'purple'
  }
  return colors[category] || 'grey'
}

// 메서드

/**
 * SNS 계정 연동 확인
 * @param {string} platform - SNS 플랫폼 (instagram, blog)
 */
const checkSnsConnection = async (platform) => {
  console.log(`${platform} 연동 확인 시작`)
  
  snsCheckLoading.value[platform] = true
  
  try {
    // 개발 모드에서는 빠른 시뮬레이션
    const delay = import.meta.env.DEV ? 1000 : 2000
    await new Promise(resolve => setTimeout(resolve, delay))
    
    // 랜덤하게 성공/실패 결정 (실제로는 API 응답에 따라 결정)
    const isSuccess = Math.random() > 0.3
    
    snsConnectionResult.value.success = isSuccess
    snsConnectionResult.value.platform = platform
    
    if (isSuccess) {
      snsConnectionResult.value.message = platform === 'instagram' 
        ? '인스타그램 계정 연동이 확인되었습니다!' 
        : '네이버 블로그 연동이 확인되었습니다!'
    } else {
      snsConnectionResult.value.message = platform === 'instagram' 
        ? '인스타그램 계정을 찾을 수 없거나 연동할 수 없습니다. URL을 확인해주세요.' 
        : '네이버 블로그를 찾을 수 없거나 연동할 수 없습니다. URL을 확인해주세요.'
    }
    
    showSnsResultDialog.value = true
    
  } catch (error) {
    console.error('SNS 연동 확인 중 오류:', error)
    snsConnectionResult.value.success = false
    snsConnectionResult.value.message = '연동 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    showSnsResultDialog.value = true
  } finally {
    snsCheckLoading.value[platform] = false
  }
}

/**
 * 데모 매장 데이터 로드 (개발용)
 */
const loadDemoStoreData = () => {
  console.log('데모 매장 데이터 로드')
  
  // 데모 매장 정보 설정
  const demoStoreInfo = {
    id: 1,
    storeName: '김씨네 분식점',
    businessType: '분식',
    ownerName: '김점주',
    businessNumber: '123-45-67890',
    address: '서울특별시 강남구 테헤란로 123',
    phoneNumber: '02-1234-5678',
    seatCount: 20,
    instagramUrl: '@kimfood_bunsik',
    blogUrl: 'blog.naver.com/kimfood123',
    openTime: '09:00',
    closeTime: '21:00',
    holidays: ['sunday'],
    deliveryAvailable: true,
    takeoutAvailable: true,
    imageUrl: '/images/store-demo.jpg'
  }
  
  // 스토어에 데모 데이터 직접 설정
  storeStore.storeInfo = demoStoreInfo
  
  showSnackbar('데모 매장 정보가 로드되었습니다', 'success')
}

/**
 * 기본 정보 수정 모드로 전환
 */
const editBasicInfo = () => {
  editMode.value = true
  
  // 현재 매장 정보를 폼 데이터에 복사
  Object.assign(formData.value, {
    storeName: storeInfo.value.storeName || '',
    businessType: storeInfo.value.businessType || '',
    ownerName: storeInfo.value.ownerName || '',
    businessNumber: storeInfo.value.businessNumber || '',
    address: storeInfo.value.address || '',
    phoneNumber: storeInfo.value.phoneNumber || '',
    seatCount: storeInfo.value.seatCount || 0,
    instagramUrl: storeInfo.value.instagramUrl || '',
    blogUrl: storeInfo.value.blogUrl || '',
    openTime: storeInfo.value.openTime || '09:00',
    closeTime: storeInfo.value.closeTime || '21:00',
    holidays: storeInfo.value.holidays || [],
    deliveryAvailable: storeInfo.value.deliveryAvailable || false,
    takeoutAvailable: storeInfo.value.takeoutAvailable || true,
    imageUrl: storeInfo.value.imageUrl || ''
  })
  
  showCreateDialog.value = true
}

/**
 * 이미지 선택
 */
const selectImage = () => {
  imageInput.value?.click()
}

/**
 * 이미지 업로드 처리
 */
const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    // 실제로는 서버에 업로드하고 URL을 받아옴
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.value.imageUrl = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

/**
 * 매장 정보 저장
 */
const saveStoreInfo = async () => {
  console.log('매장 정보 저장 시작')
  
  if (!formValid.value) {
    showSnackbar('입력 정보를 확인해주세요', 'error')
    return
  }

  saving.value = true

  try {
    // 개발 모드에서는 시뮬레이션으로 처리
    if (import.meta.env.DEV) {
      console.log('개발 모드: 매장 정보 저장 시뮬레이션')
      
      // 1초 대기 (로딩 상태 표시)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 폼 데이터를 스토어에 직접 저장
      const storeData = { ...formData.value, id: Date.now() }
      storeStore.storeInfo = storeData
      
      showSnackbar(
        editMode.value ? '매장 정보가 수정되었습니다' : '매장 정보가 등록되었습니다', 
        'success'
      )
      closeDialog()
      return
    }

    // 프로덕션에서는 실제 API 호출
    let result
    if (editMode.value) {
      // 매장 정보 수정
      result = await storeStore.updateStore(storeInfo.value.id, formData.value)
    } else {
      // 매장 정보 등록
      result = await storeStore.registerStore(formData.value)
    }

    if (result.success) {
      showSnackbar(
        editMode.value ? '매장 정보가 수정되었습니다' : '매장 정보가 등록되었습니다', 
        'success'
      )
      closeDialog()
      
      // 매장 정보 새로고침
      await storeStore.fetchStoreInfo()
    } else {
      showSnackbar(result.message || '저장 중 오류가 발생했습니다', 'error')
    }
  } catch (error) {
    console.error('매장 정보 저장 중 오류:', error)
    showSnackbar('저장 중 오류가 발생했습니다', 'error')
  } finally {
    saving.value = false
  }
}

/**
 * 다이얼로그 닫기
 */
const closeDialog = () => {
  showCreateDialog.value = false
  editMode.value = false
  
  // 폼 데이터 초기화
  Object.assign(formData.value, {
    storeName: '',
    businessType: '',
    ownerName: '',
    businessNumber: '',
    address: '',
    phoneNumber: '',
    seatCount: 0,
    instagramUrl: '',
    blogUrl: '',
    openTime: '09:00',
    closeTime: '21:00',
    holidays: [],
    deliveryAvailable: false,
    takeoutAvailable: true,
    imageUrl: ''
  })
}

// 메뉴 관리 메서드

/**
 * 메뉴 등록 다이얼로그 열기
 */
const openCreateMenuDialog = () => {
  editMenuMode.value = false
  resetMenuForm()
  showMenuDialog.value = true
}

/**
 * 메뉴 수정
 */
const editMenu = (menu) => {
  editMenuMode.value = true
  Object.assign(menuFormData.value, menu)
  showMenuDialog.value = true
}

/**
 * 메뉴 삭제 확인
 */
const confirmDeleteMenu = (menu) => {
  deleteMenuTarget.value = menu
  showDeleteMenuDialog.value = true
}

/**
 * 메뉴 이미지 선택
 */
const selectMenuImage = () => {
  menuImageInput.value?.click()
}

/**
 * 메뉴 이미지 업로드 처리
 */
const handleMenuImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      menuFormData.value.imageUrl = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

/**
 * 메뉴 저장
 */
const saveMenu = async () => {
  if (!menuFormValid.value) {
    showSnackbar('입력 정보를 확인해주세요', 'error')
    return
  }

  savingMenu.value = true

  try {
    // 1초 대기 (시뮬레이션)
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (editMenuMode.value) {
      // 메뉴 수정
      const index = menus.value.findIndex(m => m.id === menuFormData.value.id)
      if (index !== -1) {
        menus.value[index] = { ...menuFormData.value }
      }
      showSnackbar('메뉴가 수정되었습니다', 'success')
    } else {
      // 메뉴 등록
      const newMenu = {
        ...menuFormData.value,
        id: Date.now(),
        rating: 0
      }
      menus.value.push(newMenu)
      showSnackbar('메뉴가 등록되었습니다', 'success')
    }

    closeMenuDialog()
  } catch (error) {
    console.error('메뉴 저장 중 오류:', error)
    showSnackbar('저장 중 오류가 발생했습니다', 'error')
  } finally {
    savingMenu.value = false
  }
}

/**
 * 메뉴 삭제
 */
const deleteMenu = async () => {
  deletingMenu.value = true

  try {
    // 1초 대기 (시뮬레이션)
    await new Promise(resolve => setTimeout(resolve, 1000))

    menus.value = menus.value.filter(m => m.id !== deleteMenuTarget.value.id)
    showSnackbar('메뉴가 삭제되었습니다', 'success')
    showDeleteMenuDialog.value = false
    deleteMenuTarget.value = null
  } catch (error) {
    console.error('메뉴 삭제 중 오류:', error)
    showSnackbar('삭제 중 오류가 발생했습니다', 'error')
  } finally {
    deletingMenu.value = false
  }
}

/**
 * 메뉴 다이얼로그 닫기
 */
const closeMenuDialog = () => {
  showMenuDialog.value = false
  editMenuMode.value = false
  resetMenuForm()
}

/**
 * 메뉴 폼 초기화
 */
const resetMenuForm = () => {
  Object.assign(menuFormData.value, {
    menuName: '',
    price: 0,
    category: '',
    description: '',
    available: true,
    recommended: false,
    imageUrl: ''
  })
}

/**
 * 필터 초기화
 */
const clearFilters = () => {
  menuSearch.value = ''
  menuCategoryFilter.value = '전체'
  menuStatusFilter.value = '전체'
}

/**
 * 스낵바 표시
 */
const showSnackbar = (message, color = 'success') => {
  snackbar.value.message = message
  snackbar.value.color = color
  snackbar.value.show = true
}

// 메뉴 상세 다이얼로그 관련 상태 (기존 상태들에 추가)
const showMenuDetailDialog = ref(false)
const selectedMenuDetail = ref(null)

// 메뉴 관리 메서드에 추가할 함수들

/**
 * 메뉴 상세보기
 */
const viewMenuDetail = (menu) => {
  selectedMenuDetail.value = { ...menu }
  showMenuDetailDialog.value = true
}

/**
 * 상세화면에서 수정 모드로 전환
 */
const editFromDetail = () => {
  showMenuDetailDialog.value = false
  editMenuMode.value = true
  Object.assign(menuFormData.value, selectedMenuDetail.value)
  showMenuDialog.value = true
}

/**
 * 컴포넌트 마운트 시 실행
 */
onMounted(async () => {
  console.log('StoreManagementView 마운트됨')
  
  // 개발 모드에서는 API 호출을 건너뛰고 바로 UI 표시
  if (import.meta.env.DEV) {
    console.log('개발 모드: API 호출 건너뛰기')
    // 개발 중에는 즉시 UI 표시
    return
  }
  
  // 프로덕션에서만 실제 API 호출
  if (!storeStore.hasStoreInfo) {
    try {
      await storeStore.fetchStoreInfo()
    } catch (error) {
      console.warn('매장 정보 로드 실패 (개발 중이므로 무시):', error)
      // 개발 중에는 에러를 무시하고 계속 진행
    }
  }
})
</script>

<style scoped>
/* 버튼 그룹 스타일 */
.gap-3 {
  gap: 12px;
}

.flex-grow-1 {
  flex-grow: 1;
}

.d-flex.flex-column.gap-3 {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

/* SNS 연동 상태 표시 */
.sns-connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sns-connection-success {
  color: rgb(76, 175, 80);
}

.sns-connection-error {
  color: rgb(244, 67, 54);
}

/* SNS 입력 컨테이너 스타일 - 마진 추가 */
.sns-input-container {
  margin: 16px 0;
}

.sns-input-row {
  display: flex !important;
  align-items: center !important;
  gap: 16px !important;
  margin-bottom: 8px;
}

.sns-text-field {
  flex: 1 !important;
}

.sns-check-btn {
  flex-shrink: 0 !important;
  min-width: 120px !important;
  height: 56px !important;
  margin-left: 16px !important;
}

/* 카드 스타일 개선 */
.v-card {
  border-radius: 12px;
}

.v-card-title {
  font-weight: 600;
}

/* 탭 스타일 */
.v-tabs {
  background-color: transparent;
}

.v-tab {
  font-weight: 500;
}

/* 다이얼로그 스타일 */
.v-dialog .v-card {
  border-radius: 16px;
}

/* 폼 스타일 */
.v-text-field, .v-select {
  margin-bottom: 8px;
}

/* 버튼 스타일 */
.v-btn {
  text-transform: none;
  font-weight: 500;
}

/* 아바타 스타일 */
.v-avatar {
  border: 2px solid #e0e0e0;
}

/* 스위치 스타일 */
.v-switch {
  margin-top: 8px;
}

/* 칩 스타일 */
.v-chip {
  font-weight: 500;
}

/* 로딩 상태 */
.v-progress-circular {
  margin: 16px;
}

/* 메뉴 카드 스타일 */
.h-100 {
  height: 100%;
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

/* 반응형 스타일 */
@media (max-width: 600px) {
  .v-container {
    padding: 16px 8px;
  }
  
  .v-card-text {
    padding: 16px !important;
  }
  
  .v-dialog {
    margin: 16px;
  }
  
  .d-flex.gap-3 {
    flex-direction: column;
    gap: 16px;
  }
  
  .d-flex.gap-3 .v-btn {
    align-self: stretch;
  }

  .text-h4 {
    font-size: 1.5rem !important;
  }

  /* 메뉴 그리드 반응형 */
  .v-col {
    padding: 8px;
  }

  /* SNS 입력 반응형 */
  .sns-input-row {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 12px !important;
  }

  .sns-check-btn {
    margin-left: 0 !important;
    width: 100% !important;
  }
}

/* 다크 모드 지원 */
.v-theme--dark .v-avatar {
  border-color: #424242;
}

.v-theme--dark .v-card {
  background-color: #1e1e1e;
}

/* 메뉴 카드 호버 효과 */
.v-card:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease-in-out;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 이미지 스타일 */
.v-img {
  border-radius: 8px;
}

/* 메뉴 통계 카드 스타일 */
.v-card .text-h4 {
  line-height: 1.2;
}

.v-card .text-caption {
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 검색 및 필터 영역 */
.v-text-field .v-field__input {
  padding: 12px 16px;
}

/* SNS 연동 버튼 스타일 */
.v-btn--variant-tonal {
  border-radius: 8px;
}

/* 폼 레이아웃 개선 */
.v-form .v-row {
  margin: 0;
}

.v-form .v-col {
  padding: 8px;
}

/* 알림 스타일 */
.v-alert {
  border-radius: 8px;
  font-weight: 500;
}

/* 메뉴 상태 칩 스타일 */
.v-chip--variant-elevated {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 스낵바 스타일 커스터마이징 */
.v-snackbar {
  font-weight: 500;
}

/* 빈 상태 스타일 */
.grey-lighten-5 {
  background-color: #fafafa !important;
}

/* 로딩 오버레이 스타일 */
.v-overlay .v-progress-circular {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

/* 탭 윈도우 애니메이션 */
.v-tabs-window {
  transition: all 0.3s ease-in-out;
}

/* 다이얼로그 액션 버튼 스타일 */
.v-card-actions .v-btn {
  min-width: 80px;
}

/* 메뉴 설명 텍스트 제한 */
.text-body-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 가격 표시 스타일 */
.text-primary {
  font-family: 'Roboto Mono', monospace;
}

/* 카테고리 칩 스타일 */
.v-chip--variant-tonal {
  font-size: 0.75rem;
  font-weight: 600;
}

/* 매장 정보 섹션 구분 */
.my-6 {
  margin-top: 24px !important;
  margin-bottom: 24px !important;
}

/* 폼 그룹 스타일 */
.v-col h4 {
  color: #666;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 입력 필드 포커스 스타일 */
.v-text-field .v-field--focused {
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.12);
}

/* 드롭다운 스타일 */
.v-select .v-field {
  border-radius: 8px;
}

/* 스위치 라벨 스타일 */
.v-switch .v-label {
  font-weight: 500;
  color: #424242;
}

/* 이미지 업로드 영역 스타일 */
.v-avatar .v-img {
  border-radius: 50%;
  object-fit: cover;
}

/* 메뉴 액션 버튼 스타일 */
.v-btn--icon {
  border-radius: 50%;
}

.v-btn--icon:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

/* 검색 필드 스타일 */
.v-text-field--prepend-inner .v-field__prepend-inner {
  padding-top: 12px;
}

/* 필터 선택 스타일 */
.v-select .v-field__input {
  align-items: center;
  min-height: 56px;
}

/* 추가 스타일 개선 */
.v-card-subtitle {
  opacity: 0.7;
}

/* 메뉴 상태 배지 스타일 */
.position-absolute.top-0.right-0 {
  z-index: 1;
}

.position-absolute.top-0.left-0 {
  z-index: 1;
}

/* 메뉴 정보 레이아웃 */
.v-card-text .d-flex {
  align-items: flex-start;
}

/* 텍스트 트렁케이션 */
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 그리드 레이아웃 개선 */
.v-row .v-col {
  display: flex;
  align-items: stretch;
}

/* 통계 카드 스타일 개선 */
.text-center.pa-4 {
  border-left: 4px solid transparent;
  transition: border-color 0.3s ease;
}

.text-center.pa-4:hover {
  border-left-color: #1976d2;
}

/* 폼 섹션 구분선 */
.form-section {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 24px;
  margin-bottom: 24px;
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

/* 액션 버튼 그룹 */
.action-buttons {
  display: flex;
  gap: 8px;
}

/* 상태 표시자 */
.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
}

.status-indicator.active {
  background-color: #4caf50;
}

.status-indicator.inactive {
  background-color: #f44336;
}

/* 메뉴 카드 그림자 효과 */
.menu-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
}

.menu-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transform: translateY(-4px);
}

/* 빈 상태 일러스트레이션 */
.empty-state {
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
}

.empty-state .v-img {
  opacity: 0.6;
  filter: grayscale(20%);
}

/* 로딩 스피너 커스터마이징 */
.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 성공/에러 상태 색상 */
.success-state {
  color: #4caf50;
}

.error-state {
  color: #f44336;
}

.warning-state {
  color: #ff9800;
}

.info-state {
  color: #2196f3;
}

/* 모바일 최적화 추가 */
@media (max-width: 960px) {
  .v-card-title {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 16px;
  }
  
  .v-card-title .v-btn {
    align-self: stretch;
  }
}

@media (max-width: 480px) {
  .v-container {
    padding: 8px !important;
  }
  
  .v-card {
    margin: 0 !important;
  }
  
  .v-dialog {
    margin: 8px !important;
  }
  
  .v-card-text {
    padding: 12px !important;
  }
}

/* 접근성 개선 */
.v-btn:focus {
  outline: 2px solid #2196f3;
  outline-offset: 2px;
}

.v-text-field:focus-within {
  transform: scale(1.01);
  transition: transform 0.2s ease;
}

/* 다크테마 추가 지원 */
.v-theme--dark .form-section {
  border-bottom-color: #424242;
}

.v-theme--dark .status-indicator.active {
  background-color: #66bb6a;
}

.v-theme--dark .status-indicator.inactive {
  background-color: #ef5350;
}

/* 인쇄 스타일 */
@media print {
  .v-btn, .v-dialog, .v-overlay {
    display: none !important;
  }
  
  .v-card {
    box-shadow: none !important;
    border: 1px solid #ccc;
  }
}

/* 메뉴 상세 다이얼로그 스타일 */
.menu-detail-card {
  border-radius: 16px;
}

.menu-detail-info {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  padding: 16px;
}

/* 스위치 그룹 레이아웃 */
.d-flex.gap-4 {
  gap: 24px;
}

/* 메뉴 정보 카드 호버 효과 */
.v-card[variant="tonal"]:hover {
  transform: scale(1.02);
  transition: transform 0.2s ease;
}
</style>