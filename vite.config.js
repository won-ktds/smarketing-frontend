import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({
      autoImport: true,
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  },
  server: {
    port: 3000,
    host: true
  },
  define: {
    'process.env.VUE_APP_AUTH_URL': JSON.stringify(process.env.VUE_APP_AUTH_URL),
    'process.env.VUE_APP_MEMBER_URL': JSON.stringify(process.env.VUE_APP_MEMBER_URL),
    'process.env.VUE_APP_STORE_URL': JSON.stringify(process.env.VUE_APP_STORE_URL),
    'process.env.VUE_APP_MENU_URL': JSON.stringify(process.env.VUE_APP_MENU_URL),
    'process.env.VUE_APP_SALES_URL': JSON.stringify(process.env.VUE_APP_SALES_URL),
    'process.env.VUE_APP_CONTENT_URL': JSON.stringify(process.env.VUE_APP_CONTENT_URL),
    'process.env.VUE_APP_RECOMMEND_URL': JSON.stringify(process.env.VUE_APP_RECOMMEND_URL)
  }
})