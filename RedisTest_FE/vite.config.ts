import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    proxy: {
      // '/api'로 시작하는 요청을 백엔드 서버(Spring Boot: 8080)로 전달
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '') // 필요 시 /api 경로 제거
      }
    }
  },
})
