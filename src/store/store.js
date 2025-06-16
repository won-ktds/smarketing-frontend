//* src/store/store.js 수정 - 기존 구조 유지하고 API 연동만 추가
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import storeService from '@/services/store'

export const useStoreStore = defineStore('store', () => {
  // 기존 상태들 유지
  const storeInfo = ref(null)
  const menus = ref([])
  const salesData = ref(null)
  const isLoading = ref(false)

  // 기존 computed 속성들 유지
  const hasStoreInfo = computed(() => !!storeInfo.value)
  const menuCount = computed(() => menus.value?.length || 0)

  // fetchStoreInfo를 실제 API 호출로 수정
  const fetchStoreInfo = async () => {
    if (import.meta.env.DEV) {
      console.log('개발 모드: 매장 정보 API 호출 건너뛰기')
      return { success: true }
    }
    
    isLoading.value = true
    
    try {
      const result = await storeService.getStore()
      
      if (result.success) {
        storeInfo.value = result.data
        return { success: true }
      } else {
        console.warn('매장 정보 조회 실패:', result.message)
        return { success: false, error: result.message }
      }
    } catch (error) {
      console.warn('매장 정보 조회 실패:', error)
      return { success: false, error: '네트워크 오류가 발생했습니다.' }
    } finally {
      isLoading.value = false
    }
  }

  // saveStoreInfo를 실제 API 호출로 수정
  const saveStoreInfo = async (storeData) => {
    isLoading.value = true
    
    try {
      let result
      if (storeInfo.value) {
        // 기존 매장 정보 수정
        result = await storeService.updateStore(storeData)
      } else {
        // 새 매장 등록
        result = await storeService.registerStore(storeData)
      }
      
      if (result.success) {
        storeInfo.value = result.data
        return { success: true, message: '매장 정보가 저장되었습니다.' }
      } else {
        return { success: false, error: result.message }
      }
    } catch (error) {
      return { success: false, error: '네트워크 오류가 발생했습니다.' }
    } finally {
      isLoading.value = false
    }
  }

  // fetchMenus를 실제 API 호출로 수정
  const fetchMenus = async () => {
    if (!storeInfo.value?.storeId) {
      console.warn('매장 ID가 없어 메뉴를 조회할 수 없습니다.')
      return { success: false, error: '매장 정보가 필요합니다.' }
    }

    isLoading.value = true
    
    try {
      const result = await storeService.getMenus(storeInfo.value.storeId)
      
      if (result.success) {
        menus.value = result.data
        return { success: true }
      } else {
        return { success: false, error: result.message }
      }
    } catch (error) {
      return { success: false, error: '네트워크 오류가 발생했습니다.' }
    } finally {
      isLoading.value = false
    }
  }

  // 메뉴 관련 메서드들 API 연동 추가
  const saveMenu = async (menuData) => {
    isLoading.value = true
    
    try {
      const result = await storeService.registerMenu(menuData)
      
      if (result.success) {
        // 메뉴 목록 새로고침
        await fetchMenus()
        return { success: true, message: '메뉴가 등록되었습니다.' }
      } else {
        return { success: false, error: result.message }
      }
    } catch (error) {
      return { success: false, error: '네트워크 오류가 발생했습니다.' }
    } finally {
      isLoading.value = false
    }
  }

  const updateMenu = async (menuId, menuData) => {
    isLoading.value = true
    
    try {
      const result = await storeService.updateMenu(menuId, menuData)
      
      if (result.success) {
        // 메뉴 목록 새로고침
        await fetchMenus()
        return { success: true, message: '메뉴가 수정되었습니다.' }
      } else {
        return { success: false, error: result.message }
      }
    } catch (error) {
      return { success: false, error: '네트워크 오류가 발생했습니다.' }
    } finally {
      isLoading.value = false
    }
  }

  const deleteMenu = async (menuId) => {
    isLoading.value = true
    
    try {
      const result = await storeService.deleteMenu(menuId)
      
      if (result.success) {
        // 메뉴 목록 새로고침
        await fetchMenus()
        return { success: true, message: '메뉴가 삭제되었습니다.' }
      } else {
        return { success: false, error: result.message }
      }
    } catch (error) {
      return { success: false, error: '네트워크 오류가 발생했습니다.' }
    } finally {
      isLoading.value = false
    }
  }

  // 매출 정보 조회 추가
  const fetchSalesData = async () => {
    if (!storeInfo.value?.storeId) {
      return { success: false, error: '매장 정보가 필요합니다.' }
    }

    isLoading.value = true
    
    try {
      const result = await storeService.getSales(storeInfo.value.storeId)
      
      if (result.success) {
        salesData.value = result.data
        return { success: true }
      } else {
        return { success: false, error: result.message }
      }
    } catch (error) {
      return { success: false, error: '네트워크 오류가 발생했습니다.' }
    } finally {
      isLoading.value = false
    }
  }

  return {
    // 상태
    storeInfo,
    menus,
    salesData,
    isLoading,
    
    // 컴퓨티드
    hasStoreInfo,
    menuCount,
    
    // 메서드
    fetchStoreInfo,
    saveStoreInfo,
    fetchMenus,
    saveMenu,
    updateMenu,
    deleteMenu,
    fetchSalesData
  }
})

