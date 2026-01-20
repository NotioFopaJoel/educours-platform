
// vite.config.js doit avoir
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

const isMockMode = process.env.VITE_USE_MOCK_API === 'true';
const apiTarget = isMockMode
    'http://localhost:5002';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: [
        'kenda-irascible-corruptedly.ngrok-free.dev'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV !== 'production',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          charts: ['chart.js', 'apexcharts'],
          video: ['video.js', 'agora-rtc-sdk-ng']
        }
      }
    }
  }
})