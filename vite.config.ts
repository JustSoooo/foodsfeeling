import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 允许通过 hosts 映射的本地域名（如 dev.sung.homes）访问，配合高德地图 key 白名单本地开发
    allowedHosts: ['dev.sung.homes'],
  },
})
