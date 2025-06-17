//* src/services/menu.js - 백엔드 수정 없이 프론트엔드만 수정
import { menuApi, apiWithImage, handleApiError, formatSuccessResponse } from './api.js'

/**
 * 메뉴 관련 API 서비스
 * 백엔드 Menu Controller와 연동 (포트 8082)
 */
class MenuService {
  /**
   * 메뉴 목록 조회
   * @param {number} storeId - 매장 ID
   * @returns {Promise<Object>} 메뉴 목록
   */
  async getMenus(storeId) {
    try {
      console.log('=== 메뉴 목록 조회 API 호출 ===')
      console.log('매장 ID:', storeId)
      
      if (!storeId) {
        throw new Error('매장 ID가 필요합니다')
      }
      
      // GET /api/menu?storeId={storeId}
      const response = await menuApi.get('', {
        params: { storeId }
      })
      
      console.log('메뉴 목록 조회 API 응답:', response.data)
      
      if (response.data && response.data.status === 200) {
        return formatSuccessResponse(response.data.data, '메뉴 목록을 조회했습니다.')
      } else {
        throw new Error(response.data.message || '메뉴 목록을 찾을 수 없습니다.')
      }
    } catch (error) {
      console.error('메뉴 목록 조회 실패:', error)
      
      // 404 오류 또는 네트워크 오류 시 빈 배열 반환 (개발 중)
      if (error.response?.status === 404 || 
          error.code === 'ECONNREFUSED' || 
          error.message.includes('Network Error')) {
        console.warn('백엔드 미구현 또는 네트워크 오류 - 빈 메뉴 목록 반환')
        return formatSuccessResponse([], '메뉴 목록이 비어있습니다.')
      }
      
      return handleApiError(error)
    }
  }

  /**
   * 메뉴 등록 (createMenu)
   * @param {Object} menuData - 메뉴 정보
   * @returns {Promise<Object>} 등록 결과
   */
  async createMenu(menuData) {
    try {
      console.log('=== 메뉴 등록 API 호출 ===')
      console.log('요청 데이터:', menuData)
      
      const requestData = {
        storeId: menuData.storeId,
        menuName: menuData.menuName || menuData.name,
        category: menuData.category,
        price: parseInt(menuData.price) || 0,
        description: menuData.description || ''
      }
      
      console.log('백엔드 전송 데이터:', requestData)
      
      // POST /api/menu/register
      const response = await menuApi.post('/register', requestData)
      
      console.log('메뉴 등록 API 응답:', response.data)
      
      if (response.data && response.data.status === 200) {
        return formatSuccessResponse(response.data.data, '메뉴가 성공적으로 등록되었습니다.')
      } else {
        throw new Error(response.data.message || '메뉴 등록에 실패했습니다.')
      }
    } catch (error) {
      console.error('메뉴 등록 실패:', error)
      return handleApiError(error)
    }
  }

  /**
   * 메뉴 등록 (registerMenu 별칭)
   * @param {Object} menuData - 메뉴 정보
   * @returns {Promise<Object>} 등록 결과
   */
  async registerMenu(menuData) {
    return await this.createMenu(menuData)
  }

  /**
 * 메뉴 수정
 * @param {number} menuId - 메뉴 ID
 * @param {Object} menuData - 수정할 메뉴 정보
 * @returns {Promise<Object>} 수정 결과
 */
async updateMenu(menuId, menuData) {
  try {
    console.log('=== 메뉴 수정 API 호출 ===')
    console.log('메뉴 ID:', menuId, '타입:', typeof menuId)
    console.log('원본 수정 데이터:', menuData)
    
    if (!menuId || menuId === 'undefined') {
      throw new Error('올바른 메뉴 ID가 필요합니다')
    }
    
    const numericMenuId = parseInt(menuId)
    if (isNaN(numericMenuId)) {
      throw new Error('메뉴 ID는 숫자여야 합니다')
    }
    
    // 데이터 검증 및 정리
    const menuName = menuData.menuName || menuData.name
    const category = menuData.category
    const price = menuData.price
    const description = menuData.description || ''
    
    // 필수 필드 검증
    if (!menuName || !category || price === undefined || price === null) {
      console.error('필수 필드 누락:', { menuName, category, price, description })
      throw new Error('메뉴명, 카테고리, 가격은 필수 입력 사항입니다')
    }
    
    // 가격 검증 (숫자이고 0 이상)
    const numericPrice = parseInt(price)
    if (isNaN(numericPrice) || numericPrice < 0) {
      throw new Error('올바른 가격을 입력해주세요')
    }
    
    // 백엔드 MenuUpdateRequest DTO에 맞는 데이터 구조
    const requestData = {
      menuName: menuName.trim(),
      category: category.trim(),
      price: numericPrice,
      description: description.trim()
    }
    
    console.log('검증된 백엔드 전송 데이터:', requestData)
    console.log('✅ 검증된 메뉴 ID:', numericMenuId)
    
    // PUT /api/menu/{menuId}
    const response = await menuApi.put(`/${numericMenuId}`, requestData)
    
    console.log('메뉴 수정 API 응답:', response.data)
    
    if (response.data && response.data.status === 200) {
      return formatSuccessResponse(response.data.data, '메뉴가 성공적으로 수정되었습니다.')
    } else {
      throw new Error(response.data.message || '메뉴 수정에 실패했습니다.')
    }
  } catch (error) {
    console.error('메뉴 수정 실패:', error)
    
    // HTTP 응답 에러 상세 디버깅
    if (error.response) {
      console.error('=== HTTP 응답 에러 상세 ===')
      console.error('상태 코드:', error.response.status)
      console.error('상태 텍스트:', error.response.statusText)
      console.error('응답 데이터:', error.response.data)
      console.error('요청 URL:', error.config?.url)
      console.error('요청 메서드:', error.config?.method)
      console.error('요청 데이터:', error.config?.data)
      
      // 400 에러 (잘못된 요청) 처리
      if (error.response.status === 400) {
        const errorMessage = error.response.data?.message || '입력 데이터가 올바르지 않습니다.'
        console.error('백엔드 validation 에러:', errorMessage)
        
        return {
          success: false,
          message: errorMessage,
          error: error.response.data
        }
      }
      
      // 500 오류 처리
      if (error.response.status === 500) {
        const errorMessage = error.response.data?.message || '서버 내부 오류가 발생했습니다.'
        console.error('백엔드 에러 메시지:', errorMessage)
        
        return {
          success: false,
          message: errorMessage,
          error: error.response.data
        }
      }
    }
    
    return handleApiError(error)
  }
}


  /**
   * 메뉴 이미지 업로드
   * @param {number} menuId - 메뉴 ID
   * @param {File} file - 이미지 파일
   * @returns {Promise<Object>} 업로드 결과
   */
  async uploadMenuImage(menuId, file) {
    try {
      console.log('=== 메뉴 이미지 업로드 API 호출 ===')
      console.log('메뉴 ID:', menuId, '파일:', file?.name)
      
      if (!menuId || menuId === 'undefined') {
        throw new Error('올바른 메뉴 ID가 필요합니다')
      }
      
      if (!file) {
        throw new Error('업로드할 파일이 필요합니다')
      }
      
      const numericMenuId = parseInt(menuId)
      if (isNaN(numericMenuId)) {
        throw new Error('메뉴 ID는 숫자여야 합니다')
      }
      
      // FormData 생성
      const formData = new FormData()
      formData.append('file', file)
      
      console.log('이미지 업로드 요청 - 메뉴 ID:', numericMenuId)
      
      // POST /api/images/menu/{menuId}
      const response = await apiWithImage.post(`/images/menu/${numericMenuId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      console.log('메뉴 이미지 업로드 API 응답:', response.data)
      
      if (response.data && (response.data.status === 200 || response.data.success !== false)) {
        return formatSuccessResponse(response.data.data || response.data, '메뉴 이미지가 업로드되었습니다.')
      } else {
        throw new Error(response.data.message || '이미지 업로드에 실패했습니다.')
      }
    } catch (error) {
      console.error('메뉴 이미지 업로드 실패:', error)
      return handleApiError(error)
    }
  }

  /**
   * 메뉴 삭제
   * @param {number} menuId - 메뉴 ID
   * @returns {Promise<Object>} 삭제 결과
   */
  async deleteMenu(menuId) {
    try {
      console.log('=== 메뉴 삭제 API 호출 ===')
      console.log('메뉴 ID:', menuId)
      
      if (!menuId || menuId === 'undefined') {
        throw new Error('올바른 메뉴 ID가 필요합니다')
      }
      
      const numericMenuId = parseInt(menuId)
      if (isNaN(numericMenuId)) {
        throw new Error('메뉴 ID는 숫자여야 합니다')
      }
      
      // DELETE /api/menu/{menuId}
      const response = await menuApi.delete(`/${numericMenuId}`)
      
      console.log('메뉴 삭제 API 응답:', response.data)
      
      if (response.data && response.data.status === 200) {
        return formatSuccessResponse(response.data.data, '메뉴가 성공적으로 삭제되었습니다.')
      } else {
        throw new Error(response.data.message || '메뉴 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('메뉴 삭제 실패:', error)
      return handleApiError(error)
    }
  }
}

// 싱글톤 인스턴스 생성 및 export
export const menuService = new MenuService()
export default menuService

// 디버깅을 위한 전역 노출 (개발 환경에서만)
if (process.env.NODE_ENV === 'development') {
  window.menuService = menuService
}

//* src/views/StoreManagementView.vue의 수정된 스크립트 부분
// <script setup> 내부의 메뉴 관련 함수들만 수정

// 메뉴 상세 보기 함수 - 메뉴 목록 데이터 활용
const viewMenuDetail = (menu) => {
  console.log('=== 메뉴 상세 보기 호출 ===')
  console.log('전달받은 메뉴 객체:', menu)
  
  // 메뉴 ID 추출 (여러 형태 지원)
  const menuId = menu.menuId || menu.id
  
  if (!menuId) {
    console.error('❌ 메뉴 ID를 찾을 수 없음:', menu)
    showSnackbar('메뉴 정보가 올바르지 않습니다', 'error')
    return
  }
  
  console.log('✅ 사용할 메뉴 ID:', menuId)
  
  // API 호출 없이 바로 메뉴 목록의 데이터 사용
  selectedMenu.value = {
    ...menu,
    // 호환성을 위해 여러 형태 지원
    id: menuId,
    menuId: menuId,
    name: menu.menuName || menu.name,
    menuName: menu.menuName || menu.name
  }
  
  console.log('✅ 메뉴 상세 정보 설정 완료:', selectedMenu.value)
  showMenuDetailDialog.value = true
}

// 메뉴 수정 함수
const editMenu = (menu) => {
  console.log('=== 메뉴 수정 호출 ===')
  console.log('전달받은 메뉴 객체:', menu)
  
  // 메뉴 ID 추출 및 검증
  const menuId = menu.menuId || menu.id
  
  console.log('추출된 메뉴 ID:', menuId, '타입:', typeof menuId)
  
  if (!menuId) {
    console.error('❌ 메뉴 ID를 찾을 수 없음')
    showSnackbar('메뉴 정보가 올바르지 않습니다', 'error')
    return
  }
  
  console.log('✅ 사용할 메뉴 ID:', menuId)
  
  // 수정 모드로 설정
  menuEditMode.value = true
  
  // 폼 데이터 설정 (여러 필드명 지원)
  menuFormData.value = {
    menuId: menuId,
    id: menuId, // 호환성
    menuName: menu.menuName || menu.name,
    name: menu.menuName || menu.name, // 호환성
    category: menu.category,
    price: menu.price,
    description: menu.description || '',
    imageUrl: menu.imageUrl
  }
  
  console.log('✅ 수정 폼 데이터 설정 완료:', menuFormData.value)
  
  // 다이얼로그 표시
  showMenuDialog.value = true
}

// 메뉴 상세에서 수정 버튼 클릭
const editFromDetail = () => {
  console.log('=== 메뉴 상세에서 수정 버튼 클릭 ===')
  console.log('selectedMenu.value:', selectedMenu.value)
  
  if (!selectedMenu.value) {
    showSnackbar('선택된 메뉴가 없습니다', 'error')
    return
  }
  
  // 메뉴 ID 검증
  const menuId = selectedMenu.value.menuId || selectedMenu.value.id
  if (!menuId) {
    showSnackbar('메뉴 ID를 찾을 수 없습니다', 'error')
    return
  }
  
  console.log('✅ 수정할 메뉴 정보:', {
    id: menuId,
    name: selectedMenu.value.menuName || selectedMenu.value.name,
    category: selectedMenu.value.category
  })
  
  // 상세 다이얼로그 닫기
  closeMenuDetail()
  
  // 수정 모드로 전환
  editMenu(selectedMenu.value)
}

// 상세 다이얼로그 닫기
const closeMenuDetail = () => {
  console.log('=== 메뉴 상세 다이얼로그 닫기 ===')
  showMenuDetailDialog.value = false
  selectedMenu.value = null
}

// 메뉴 저장 함수 - 이미지 업로드 분리
const saveMenuWithImage = async () => {
  if (saving.value) return
  
  console.log('=== 메뉴 저장 + 이미지 업로드 시작 ===')
  saving.value = true
  
  try {
    // 메뉴 서비스 임포트
    const { menuService } = await import('@/services/menu')
    
    let menuResult
    
    if (menuEditMode.value) {
      // 메뉴 수정 - PUT /api/menu/{menuId}
      const menuId = menuFormData.value.id || menuFormData.value.menuId
      if (!menuId) {
        showSnackbar('메뉴 ID가 없습니다', 'error')
        return
      }
      
      console.log('메뉴 수정 API 호출, 메뉴 ID:', menuId)
      
      // 메뉴 데이터 준비
      const menuData = {
        menuName: menuFormData.value.menuName || menuFormData.value.name,
        category: menuFormData.value.category,
        price: menuFormData.value.price,
        description: menuFormData.value.description || ''
      }
      
      menuResult = await menuService.updateMenu(menuId, menuData)
    } else {
      // 새 메뉴 등록 - POST /api/menu/register
      const storeId = storeInfo.value?.storeId
      if (!storeId) {
        showSnackbar('매장 정보를 찾을 수 없습니다', 'error')
        return
      }
      
      // 메뉴 데이터 준비 (매장 ID 포함)
      const menuData = {
        storeId: storeId,
        menuName: menuFormData.value.menuName || menuFormData.value.name,
        category: menuFormData.value.category,
        price: menuFormData.value.price,
        description: menuFormData.value.description || ''
      }
      
      console.log('메뉴 등록 API 호출, 매장 ID:', storeId)
      menuResult = await menuService.createMenu(menuData)
    }
    
    console.log('✅ 메뉴 저장 완료:', menuResult)
    
    if (!menuResult.success) {
      showSnackbar(menuResult.message || '메뉴 저장에 실패했습니다', 'error')
      return
    }
    
    // 메뉴 저장 성공 후 이미지 업로드
    let imageResult = { success: true }
    
    if (selectedImageFile.value) {
      console.log('=== 이미지 업로드 시작 ===')
      
      // 등록된 메뉴의 ID 가져오기
      const menuId = menuEditMode.value 
        ? (menuFormData.value.id || menuFormData.value.menuId)
        : menuResult.data?.menuId
      
      if (menuId) {
        console.log('이미지 업로드 - 메뉴 ID:', menuId)
        imageResult = await menuService.uploadMenuImage(menuId, selectedImageFile.value)
        console.log('이미지 업로드 결과:', imageResult)
        
        if (!imageResult.success) {
          console.warn('이미지 업로드는 실패했지만 메뉴는 저장됨')
          showSnackbar('메뉴는 저장되었지만 이미지 업로드에 실패했습니다', 'warning')
        }
      } else {
        console.warn('메뉴 ID를 찾을 수 없어 이미지 업로드 생략')
      }
    }
    
    // 성공 메시지
    if (menuResult.success && imageResult.success) {
      showSnackbar(
        menuEditMode.value ? '메뉴가 수정되었습니다' : '메뉴가 등록되었습니다',
        'success'
      )
    }
    
    // 다이얼로그 닫기 및 초기화
    showMenuDialog.value = false
    menuEditMode.value = false
    resetMenuForm()
    
    // 메뉴 목록 새로고침
    await loadMenus()
    
  } catch (error) {
    console.error('메뉴 저장 중 오류:', error)
    showSnackbar('저장 중 오류가 발생했습니다', 'error')
  } finally {
    saving.value = false
  }
}