// src/store/store.js - StoreService 클래스의 getMenus 메서드 올바른 문법으로 수정

/**
 * 메뉴 목록 조회 (수정된 버전 - storeId 파라미터 추가)
 * @param {number} storeId - 매장 ID (옵션, 없으면 목업 데이터 반환)
 * @returns {Promise<Object>} 메뉴 목록
 */
async getMenus(storeId) {
  try {
    console.log('=== 메뉴 목록 조회 API 호출 ===')
    console.log('매장 ID:', storeId)
    
    // storeId가 없으면 목업 데이터 반환 (개발 중)
    if (!storeId) {
      console.warn('매장 ID가 없어서 목업 데이터 반환')
      const mockMenus = [
        {
          menuId: 1, // id 대신 menuId 사용
          id: 1, // 호환성을 위해
          name: '아메리카노',
          menuName: '아메리카노', // 백엔드 형식
          price: 4000,
          category: '커피',
          description: '진한 풍미의 아메리카노',
          imageUrl: '/images/americano.jpg',
          isAvailable: true,
          available: true // 백엔드 형식
        },
        {
          menuId: 2,
          id: 2,
          name: '카페라떼',
          menuName: '카페라떼',
          price: 4500,
          category: '커피',
          description: '부드러운 우유가 들어간 라떼',
          imageUrl: '/images/latte.jpg',
          isAvailable: true,
          available: true
        }
      ]
      
      return formatSuccessResponse(mockMenus, '목업 메뉴 목록을 조회했습니다.')
    }
    
    // 실제 백엔드 API 호출
    try {
      // 메뉴 API import
      const { menuApi } = await import('./api.js')
      
      // GET /api/menu?storeId={storeId}
      const response = await menuApi.get('', {
        params: { storeId }
      })
      
      console.log('메뉴 목록 조회 API 응답:', response.data)
      
      if (response.data && response.data.status === 200) {
        // 백엔드에서 받은 메뉴 데이터를 프론트엔드 형식으로 변환
        const menus = response.data.data.map(menu => ({
          menuId: menu.menuId,
          id: menu.menuId, // 호환성을 위해
          storeId: menu.storeId,
          menuName: menu.menuName,
          name: menu.menuName, // 호환성을 위해
          category: menu.category,
          price: menu.price,
          description: menu.description,
          available: menu.available !== undefined ? menu.available : true,
          isAvailable: menu.available !== undefined ? menu.available : true, // 호환성
          imageUrl: menu.imageUrl || '/images/menu-placeholder.png',
          createdAt: menu.createdAt,
          updatedAt: menu.updatedAt
        }))
        
        return formatSuccessResponse(menus, '메뉴 목록을 조회했습니다.')
      } else {
        throw new Error(response.data.message || '메뉴 목록을 찾을 수 없습니다.')
      }
    } catch (apiError) {
      console.error('백엔드 API 호출 실패:', apiError)
      
      // 백엔드 미구현이나 네트워크 오류 시 목업 데이터 반환
      if (apiError.response?.status === 404 || 
          apiError.code === 'ECONNREFUSED' || 
          apiError.message.includes('Network Error')) {
        console.warn('백엔드 미구현 - 목업 데이터 반환')
        
        const mockMenus = [
          {
            menuId: 1,
            id: 1,
            storeId: storeId,
            name: '아메리카노',
            menuName: '아메리카노',
            price: 4000,
            category: '커피',
            description: '진한 풍미의 아메리카노',
            imageUrl: '/images/americano.jpg',
            isAvailable: true,
            available: true
          },
          {
            menuId: 2,
            id: 2,
            storeId: storeId,
            name: '카페라떼',
            menuName: '카페라떼',
            price: 4500,
            category: '커피',
            description: '부드러운 우유가 들어간 라떼',
            imageUrl: '/images/latte.jpg',
            isAvailable: true,
            available: true
          }
        ]
        
        return formatSuccessResponse(mockMenus, '목업 메뉴 목록을 조회했습니다. (백엔드 미구현)')
      }
      
      throw apiError
    }
  } catch (error) {
    console.error('메뉴 목록 조회 실패:', error)
    return handleApiError(error)
  }
}

// 만약 fetchMenus 메서드가 따로 필요하다면 다음과 같이 추가:
/**
 * 메뉴 목록 조회 (fetchMenus 별칭)
 * @param {number} storeId - 매장 ID
 * @returns {Promise<Object>} 메뉴 목록
 */
async fetchMenus(storeId) {
  return await this.getMenus(storeId)
}

// StoreService 클래스 전체 구조 예시:
class StoreService {
  // ... 기존 메서드들 (registerStore, getStore, updateStore 등) ...

  /**
   * 메뉴 목록 조회 (위의 getMenus 메서드)
   */
  async getMenus(storeId) {
    // 위의 구현 내용
  }

  /**
   * 메뉴 목록 조회 별칭
   */
  async fetchMenus(storeId) {
    return await this.getMenus(storeId)
  }
}

// 올바른 JavaScript 클래스 메서드 문법:
// ❌ 잘못된 문법:
// async function getMenus(storeId) { ... }
// function async getMenus(storeId) { ... }

// ✅ 올바른 문법:
// async getMenus(storeId) { ... }