//* src/store/app.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 앱 전역 상태 관리 스토어
 * UI 상태, 로딩, 에러, 알림 등 관리
 */
export const useAppStore = defineStore('app', () => {
  // State
  const isLoading = ref(false)
  const loadingMessage = ref('')
  const error = ref(null)
  const drawer = ref(false)
  const rail = ref(false)

  // 스낵바 상태
  const snackbar = ref({
    show: false,
    message: '',
    color: 'info',
    timeout: 4000,
    location: 'bottom',
  })

  // 확인 다이얼로그 상태
  const confirmDialog = ref({
    show: false,
    title: '',
    message: '',
    icon: '',
    confirmText: '확인',
    cancelText: '취소',
    loading: false,
    callback: null,
  })

  // 앱 설정
  const settings = ref({
    darkMode: false,
    language: 'ko',
    notifications: true,
  })

  // Getters
  const isDrawerOpen = computed(() => drawer.value)
  const isRailMode = computed(() => rail.value)
  const currentError = computed(() => error.value)

  // Actions
  const setLoading = (loading, message = '') => {
    isLoading.value = loading
    loadingMessage.value = message
  }

  const setError = (errorMessage) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = null
  }

  const toggleDrawer = () => {
    drawer.value = !drawer.value
  }

  const setDrawer = (value) => {
    drawer.value = value
  }

  const toggleRail = () => {
    rail.value = !rail.value
  }

  const setRail = (value) => {
    rail.value = value
  }

  const showSnackbar = (message, color = 'info', timeout = 4000) => {
    snackbar.value = {
      show: true,
      message,
      color,
      timeout,
      location: 'bottom',
    }
  }

  const hideSnackbar = () => {
    snackbar.value.show = false
  }

  const showConfirmDialog = (options) => {
    confirmDialog.value = {
      show: true,
      title: options.title || '확인',
      message: options.message || '',
      icon: options.icon || '',
      confirmText: options.confirmText || '확인',
      cancelText: options.cancelText || '취소',
      loading: false,
      callback: options.callback || null,
    }
  }

  const hideConfirmDialog = () => {
    confirmDialog.value.show = false
    confirmDialog.value.callback = null
  }

  const updateSettings = (newSettings) => {
    settings.value = { ...settings.value, ...newSettings }
    // 로컬 스토리지에 저장
    localStorage.setItem('app_settings', JSON.stringify(settings.value))
  }

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('app_settings')
    if (savedSettings) {
      settings.value = { ...settings.value, ...JSON.parse(savedSettings) }
    }
  }

  return {
    // State
    isLoading,
    loadingMessage,
    error,
    drawer,
    rail,
    snackbar,
    confirmDialog,
    settings,
    // Getters
    isDrawerOpen,
    isRailMode,
    currentError,
    // Actions
    setLoading,
    setError,
    clearError,
    toggleDrawer,
    setDrawer,
    toggleRail,
    setRail,
    showSnackbar,
    hideSnackbar,
    showConfirmDialog,
    hideConfirmDialog,
    updateSettings,
    loadSettings,
  }
})
