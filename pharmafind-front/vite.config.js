import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    proxy: {
      // Proxy all API requests to Laravel backend
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
      // Proxy Sanctum CSRF cookie requests
      '/sanctum': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      }
    },
  },
  preview: {
    host: true,         // Allow mobile testing on local network after build
    port: 4173,
  },

  build: {
    outDir: 'dist',     // Folder for production build
    sourcemap: false,   // You can set true for debugging
  },
})
