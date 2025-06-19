//* src/main.js
/**
 * AI 마케팅 서비스 - 메인 앱 진입점
 * Vue 3 + Vuetify 3 기반 애플리케이션 초기화
*/
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'

// 전역 스타일
import './styles/main.scss'

// Vuetify 테마 설정
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1976D2',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
          background: '#FFFFFF',
          surface: '#FFFFFF',
          'surface-variant': '#F5F5F5',
        },
      },
    },
  },
  icons: {
    defaultSet: 'mdi',
    sets: {
      mdi,
    },
  },
  display: {
    mobileBreakpoint: 'sm',
    thresholds: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
})

// Pinia 스토어 생성
const pinia = createPinia()

// Vue 앱 생성
const app = createApp(App)

// 전역 속성 설정
app.config.globalProperties.$config = window.__runtime_config__ || {}

// 에러 핸들링
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue 앱 에러:', err, info)
}

// 플러그인 등록
app.use(pinia)
app.use(router)
app.use(vuetify)

// 개발 모드 설정
if (import.meta.env.DEV) {
  app.config.performance = true
}

// 앱 마운트
app.mount('#app')
