{
  "name": "educours-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@vueform/multiselect": "^2.6.1",
    "@vueuse/core": "^10.1.2",
    "agora-rtc-sdk-ng": "^4.18.1",
    "apexcharts": "^4.0.0",
    "axios": "^1.4.0",
    "chart.js": "^4.3.0",
    "dayjs": "^1.11.9",
    "dropzone": "^5.9.3",
    "js-cookie": "^3.0.1",
    "lodash": "^4.17.21",
    "ngrok": "^5.0.0-beta.2",
    "pinia": "^2.3.1",
    "quill": "^1.3.7",
    "socket.io-client": "^4.6.1",
    "v-calendar": "^3.0.3",
    "validator": "^13.9.0",
    "video.js": "^7.21.4",
    "vue": "^3.4.4",
    "vue-chartjs": "^5.1.1",
    "vue-i18n": "^9.3.0",
    "vue-loading-overlay": "^6.0.0",
    "vue-quill-editor": "^3.0.6",
    "vue-router": "^4.6.4",
    "vue-toastification": "^2.0.0-beta.7",
    "vue-video-player": "^5.0.2",
    "vue3-apexcharts": "^1.10.0",
    "vue3-dropzone": "^2.2.1",
    "vue3-google-map": "^0.3.1"
  },
  "devDependencies": {
    "@tailwindcss/forms": "^0.5.3",
    "@tailwindcss/typography": "^0.5.9",
    "@vitejs/plugin-vue": "^4.2.3",
    "@vue/tsconfig": "^0.4.0",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24",
    "sass": "^1.63.6",
    "tailwindcss": "^3.3.2",
    "typescript": "^5.1.3",
    "vite": "^4.3.9"
  }
}


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

.env.example

# Vue Application
VITE_APP_TITLE=EduCours
VITE_APP_DESCRIPTION=Complete Learning Platform

# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000

# Payment Configuration
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Agora Configuration
VITE_AGORA_APP_ID=your-agora-app-id

# Feature Flags
VITE_ENABLE_PAYMENTS=true
VITE_ENABLE_LIVE_CLASSES=true
VITE_ENABLE_VIDEOS=true

# Analytics
VITE_GOOGLE_ANALYTICS_ID=your-ga-id

.env.local

# frontend/.env.local
VITE_API_URL=http://localhost:5000/api
VITE_BASE_URL=http://localhost:3000
VITE_APP_NAME=EduCours Platform
VITE_APP_VERSION=1.0.0

# URLs des services
VITE_UPLOADS_URL=http://localhost:5001/uploads

# Features flags (activer/désactiver des fonctionnalités)
VITE_ENABLE_STRIPE=true
VITE_ENABLE_VIDEO_CHAT=true
VITE_ENABLE_LIVE_CLASSES=true

// src/App.vue 

<template>
  <div id="app">
    <!-- Router View Principal -->
    <router-view v-slot="{ Component, route }">
      <transition name="fade" mode="out-in">
        <component :is="Component" :key="route.fullPath" />
      </transition>
    </router-view>

    <!-- Global Loading Overlay -->
    <loading-overlay
      v-if="globalLoading"
      :active="globalLoading"
      :can-cancel="false"
      :is-full-page="true"
      color="#4361ee"
      loader="dots"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import LoadingOverlay from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/css/index.css'

// Stores - SEULEMENT auth si vous l'avez
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const authStore = useAuthStore ? useAuthStore() : null

// États
const globalLoading = ref(false)

// Gestion d'erreur SÉCURISÉE
const handleGlobalError = (error) => {
  console.error('Erreur globale:', error)
  
  // Vérification SÉCURISÉE
  const status = error?.response?.status
  
  if (status === 401 && authStore) {
    authStore.logout()
    router.push('/login')
    return
  }
  
  // Message d'erreur sécurisé
  let errorMessage = 'Une erreur est survenue'
  
  if (typeof error === 'string') {
    errorMessage = error
  } else if (error?.message) {
    errorMessage = error.message
  }
  
  toast.error(errorMessage, { timeout: 4000 })
}

// Initialisation SIMPLIFIÉE
const initializeApp = async () => {
  globalLoading.value = true
  
  try {
    // Initialiser l'authentification si le store existe
    if (authStore && authStore.initialize) {
      await authStore.initialize()
    }
  } catch (error) {
    handleGlobalError(error)
  } finally {
    setTimeout(() => {
      globalLoading.value = false
    }, 500)
  }
}

// Lifecycle Hooks
onMounted(() => {
  // Initialiser l'app
  initializeApp()
  
  // Gestion des erreurs globales
  window.addEventListener('unhandledrejection', (event) => {
    handleGlobalError(event.reason)
  })
  
  console.log('✅ Application Vue montée avec succès!')
})
</script>

<style>
/* Transitions simples */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Styles globaux de base */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f7fa;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #4361ee;
  border-radius: 4px;
}
</style>

// src/mian.js

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Plugins
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

// Styles globaux
import '@/assets/css/main.css'
import '@/assets/css/variables.css'

// Configuration Pinia (avec persistence si besoin)
const pinia = createPinia()

// Configuration Toast
const toastOptions = {
  position: 'top-right',
  timeout: 4000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,
  transition: 'Vue-Toastification__bounce',
  maxToasts: 5,
  newestOnTop: true,
  filterBeforeCreate: (toast, toasts) => {
    // Éviter les doublons
    if (toasts.filter(t => t.content === toast.content).length) {
      return false
    }
    return toast
  }
}

// Création de l'application
const app = createApp(App)

// Utilisation des plugins
app.use(pinia)
app.use(router)
app.use(Toast, toastOptions)

// Directive globale pour le focus (accessibilité)
app.directive('focus', {
  mounted(el) {
    el.focus()
  }
})

// Montage de l'application
app.mount('#app')

// Gestion des erreurs globales non capturées
app.config.errorHandler = (err, instance, info) => {
  console.error('Erreur Vue globale:', err)
  console.error('Composant:', instance)
  console.error('Info:', info)
  
  // Ici vous pourriez envoyer à un service de logging
  // Sentry.captureException(err)
}

// Mode développement - warnings
if (import.meta.env.DEV) {
  app.config.warnHandler = (msg, instance, trace) => {
    console.warn(`[Vue Warning]: ${msg}`)
    console.warn(trace)
  }
}

// src/assets/ icons.css

.icon-search::before { content: "🔍"; }
.icon-filter::before { content: "⚙️"; }
.icon-play::before { content: "▶️"; }
.icon-heart::before { content: "❤️"; }
.icon-cart::before { content: "🛒"; }
.icon-star-filled::before { content: "★"; color: gold; }
.icon-star-empty::before { content: "☆"; }
/* ... ajoute les autres icônes */

// src/assets/ main.css

/* ========== VARIABLES ========== */
:root {
    /* Couleurs principales */
    --primary-color: #4f46e5;
    --primary-dark: #4338ca;
    --primary-light: #818cf8;
    --secondary-color: #10b981;
    --secondary-dark: #0da271;
    --accent-color: #f59e0b;
    --danger-color: #ef4444;
    --warning-color: #f59e0b;
    --success-color: #10b981;
    
    /* Couleurs neutres */
    --dark-color: #111827;
    --dark-gray: #374151;
    --gray-color: #6b7280;
    --light-gray: #9ca3af;
    --lighter-gray: #e5e7eb;
    --lightest-gray: #f3f4f6;
    --white-color: #ffffff;
    
    /* Arrière-plans */
    --bg-primary: #ffffff;
    --bg-secondary: #f9fafb;
    --bg-dark: #111827;
    
    /* Bordures */
    --border-color: #e5e7eb;
    --border-radius: 8px;
    --border-radius-lg: 12px;
    --border-radius-xl: 16px;
    
    /* Ombres */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    
    /* Typographie */
    --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --font-secondary: 'Poppins', sans-serif;
    
    /* Espacement */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    --spacing-2xl: 3rem;
    
    /* Transitions */
    --transition-fast: 150ms ease;
    --transition-base: 300ms ease;
    --transition-slow: 500ms ease;
}

/* ========== RESET & BASE ========== */
*,
*::before,
*::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html {
    font-size: 16px;
    scroll-behavior: smooth;
}

body {
    font-family: var(--font-primary);
    line-height: 1.6;
    color: var(--dark-color);
    background-color: var(--bg-secondary);
    overflow-x: hidden;
}

h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-secondary);
    font-weight: 600;
    line-height: 1.3;
    margin-bottom: var(--spacing-md);
}

h1 { font-size: 2.5rem; }
h2 { font-size: 2rem; }
h3 { font-size: 1.5rem; }
h4 { font-size: 1.25rem; }
h5 { font-size: 1.125rem; }
h6 { font-size: 1rem; }

p {
    margin-bottom: var(--spacing-md);
}

a {
    color: var(--primary-color);
    text-decoration: none;
    transition: color var(--transition-fast);
}

a:hover {
    color: var(--primary-dark);
    text-decoration: underline;
}

img {
    max-width: 100%;
    height: auto;
    display: block;
}

ul, ol {
    margin-left: var(--spacing-lg);
    margin-bottom: var(--spacing-md);
}

button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    background: none;
}

/* ========== UTILITY CLASSES ========== */
.container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-lg);
}

.container-fluid {
    width: 100%;
    padding: 0 var(--spacing-lg);
}

.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.text-primary { color: var(--primary-color); }
.text-secondary { color: var(--secondary-color); }
.text-success { color: var(--success-color); }
.text-danger { color: var(--danger-color); }
.text-warning { color: var(--warning-color); }
.text-dark { color: var(--dark-color); }
.text-gray { color: var(--gray-color); }
.text-light { color: var(--light-gray); }
.text-white { color: var(--white-color); }

.bg-primary { background-color: var(--primary-color); }
.bg-secondary { background-color: var(--secondary-color); }
.bg-dark { background-color: var(--dark-color); }
.bg-light { background-color: var(--lightest-gray); }
.bg-white { background-color: var(--white-color); }

.rounded { border-radius: var(--border-radius); }
.rounded-lg { border-radius: var(--border-radius-lg); }
.rounded-xl { border-radius: var(--border-radius-xl); }
.rounded-full { border-radius: 9999px; }

.shadow-sm { box-shadow: var(--shadow-sm); }
.shadow-md { box-shadow: var(--shadow-md); }
.shadow-lg { box-shadow: var(--shadow-lg); }
.shadow-xl { box-shadow: var(--shadow-xl); }

.d-flex { display: flex; }
.d-inline-flex { display: inline-flex; }
.d-block { display: block; }
.d-inline-block { display: inline-block; }
.d-none { display: none; }

.flex-column { flex-direction: column; }
.flex-row { flex-direction: row; }
.flex-wrap { flex-wrap: wrap; }
.flex-nowrap { flex-wrap: nowrap; }

.justify-start { justify-content: flex-start; }
.justify-end { justify-content: flex-end; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-around { justify-content: space-around; }

.align-start { align-items: flex-start; }
.align-end { align-items: flex-end; }
.align-center { align-items: center; }
.align-baseline { align-items: baseline; }
.align-stretch { align-items: stretch; }

.gap-xs { gap: var(--spacing-xs); }
.gap-sm { gap: var(--spacing-sm); }
.gap-md { gap: var(--spacing-md); }
.gap-lg { gap: var(--spacing-lg); }
.gap-xl { gap: var(--spacing-xl); }

.w-100 { width: 100%; }
.h-100 { height: 100%; }
.vh-100 { height: 100vh; }

.m-0 { margin: 0; }
.mt-1 { margin-top: var(--spacing-sm); }
.mt-2 { margin-top: var(--spacing-md); }
.mt-3 { margin-top: var(--spacing-lg); }
.mt-4 { margin-top: var(--spacing-xl); }
.mb-1 { margin-bottom: var(--spacing-sm); }
.mb-2 { margin-bottom: var(--spacing-md); }
.mb-3 { margin-bottom: var(--spacing-lg); }
.mb-4 { margin-bottom: var(--spacing-xl); }

.p-0 { padding: 0; }
.p-1 { padding: var(--spacing-sm); }
.p-2 { padding: var(--spacing-md); }
.p-3 { padding: var(--spacing-lg); }
.p-4 { padding: var(--spacing-xl); }

.position-relative { position: relative; }
.position-absolute { position: absolute; }
.position-fixed { position: fixed; }
.position-sticky { position: sticky; }

.overflow-hidden { overflow: hidden; }
.overflow-auto { overflow: auto; }

/* ========== BUTTONS ========== */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    padding: 0.625rem 1.25rem;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.5;
    border-radius: var(--border-radius);
    transition: all var(--transition-base);
    text-decoration: none;
    cursor: pointer;
    border: 1px solid transparent;
}

.btn:hover {
    text-decoration: none;
}

.btn-primary {
    background-color: var(--primary-color);
    color: var(--white-color);
    border-color: var(--primary-color);
}

.btn-primary:hover {
    background-color: var(--primary-dark);
    border-color: var(--primary-dark);
    transform: translateY(-1px);
    box-shadow: var(--shadow-lg);
}

.btn-secondary {
    background-color: var(--secondary-color);
    color: var(--white-color);
    border-color: var(--secondary-color);
}

.btn-secondary:hover {
    background-color: var(--secondary-dark);
    border-color: var(--secondary-dark);
}

.btn-outline-primary {
    background-color: transparent;
    color: var(--primary-color);
    border-color: var(--primary-color);
}

.btn-outline-primary:hover {
    background-color: var(--primary-color);
    color: var(--white-color);
}

.btn-outline-secondary {
    background-color: transparent;
    color: var(--secondary-color);
    border-color: var(--secondary-color);
}

.btn-outline-secondary:hover {
    background-color: var(--secondary-color);
    color: var(--white-color);
}

.btn-danger {
    background-color: var(--danger-color);
    color: var(--white-color);
    border-color: var(--danger-color);
}

.btn-danger:hover {
    background-color: #dc2626;
    border-color: #dc2626;
}

.btn-warning {
    background-color: var(--warning-color);
    color: var(--dark-color);
    border-color: var(--warning-color);
}

.btn-warning:hover {
    background-color: #d97706;
    border-color: #d97706;
}

.btn-success {
    background-color: var(--success-color);
    color: var(--white-color);
    border-color: var(--success-color);
}

.btn-success:hover {
    background-color: var(--secondary-dark);
    border-color: var(--secondary-dark);
}

.btn-lg {
    padding: 0.875rem 1.75rem;
    font-size: 1rem;
}

.btn-sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
}

.btn-block {
    display: block;
    width: 100%;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
}

/* ========== FORMS ========== */
.form-group {
    margin-bottom: var(--spacing-lg);
}

.form-label {
    display: block;
    margin-bottom: var(--spacing-sm);
    font-weight: 500;
    color: var(--dark-color);
}

.form-control {
    display: block;
    width: 100%;
    padding: 0.625rem 0.875rem;
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--dark-color);
    background-color: var(--white-color);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    transition: border-color var(--transition-base), box-shadow var(--transition-base);
}

.form-control:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-control::placeholder {
    color: var(--light-gray);
}

.form-text {
    display: block;
    margin-top: var(--spacing-xs);
    font-size: 0.75rem;
    color: var(--gray-color);
}

.form-check {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
}

.form-check-input {
    width: 1rem;
    height: 1rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
}

.form-check-label {
    font-size: 0.875rem;
    color: var(--dark-color);
}

/* ========== CARDS ========== */
.card {
    background-color: var(--white-color);
    border-radius: var(--border-radius);
    border: 1px solid var(--border-color);
    overflow: hidden;
    transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.card-header {
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);
    background-color: var(--lightest-gray);
}

.card-body {
    padding: var(--spacing-lg);
}

.card-footer {
    padding: var(--spacing-lg);
    border-top: 1px solid var(--border-color);
    background-color: var(--lightest-gray);
}

.card-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: var(--spacing-sm);
}

.card-subtitle {
    font-size: 0.875rem;
    color: var(--gray-color);
    margin-bottom: var(--spacing-md);
}

/* ========== NAVIGATION ========== */
.navbar {
    position: sticky;
    top: 0;
    z-index: 1000;
    background-color: var(--white-color);
    border-bottom: 1px solid var(--border-color);
    padding: 0 var(--spacing-lg);
    height: 64px;
}

.navbar-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    max-width: 1200px;
    margin: 0 auto;
}

.navbar-brand {
    font-family: var(--font-secondary);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-color);
    text-decoration: none;
}

.navbar-nav {
    display: flex;
    align-items: center;
    gap: var(--spacing-lg);
    list-style: none;
    margin: 0;
    padding: 0;
}

.nav-item {
    position: relative;
}

.nav-link {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--dark-color);
    text-decoration: none;
    padding: var(--spacing-sm) 0;
    transition: color var(--transition-fast);
}

.nav-link:hover {
    color: var(--primary-color);
    text-decoration: none;
}

.nav-link.active {
    color: var(--primary-color);
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    display: none;
    min-width: 200px;
    padding: var(--spacing-sm) 0;
    background-color: var(--white-color);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-lg);
}

.dropdown:hover .dropdown-menu {
    display: block;
}

.dropdown-item {
    display: block;
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-lg);
    font-size: 0.875rem;
    color: var(--dark-color);
    text-decoration: none;
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;
    transition: background-color var(--transition-fast);
}

.dropdown-item:hover {
    background-color: var(--lightest-gray);
}

/* ========== ALERTS ========== */
.alert {
    position: relative;
    padding: var(--spacing-md) var(--spacing-lg);
    margin-bottom: var(--spacing-md);
    border: 1px solid transparent;
    border-radius: var(--border-radius);
}

.alert-primary {
    color: #1e40af;
    background-color: #dbeafe;
    border-color: #93c5fd;
}

.alert-secondary {
    color: #065f46;
    background-color: #d1fae5;
    border-color: #a7f3d0;
}

.alert-success {
    color: #166534;
    background-color: #dcfce7;
    border-color: #bbf7d0;
}

.alert-danger {
    color: #991b1b;
    background-color: #fee2e2;
    border-color: #fecaca;
}

.alert-warning {
    color: #92400e;
    background-color: #fef3c7;
    border-color: #fde68a;
}

.alert-info {
    color: #1e40af;
    background-color: #dbeafe;
    border-color: #93c5fd;
}

/* ========== BADGES ========== */
.badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1;
    border-radius: 9999px;
}

.badge-primary {
    background-color: var(--primary-color);
    color: var(--white-color);
}

.badge-secondary {
    background-color: var(--secondary-color);
    color: var(--white-color);
}

.badge-success {
    background-color: var(--success-color);
    color: var(--white-color);
}

.badge-danger {
    background-color: var(--danger-color);
    color: var(--white-color);
}

.badge-warning {
    background-color: var(--warning-color);
    color: var(--dark-color);
}

/* ========== MODALS ========== */
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1050;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-lg);
}

.modal {
    background-color: var(--white-color);
    border-radius: var(--border-radius-lg);
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow: hidden;
    animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);
}

.modal-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
}

.modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: var(--gray-color);
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--border-radius);
    transition: background-color var(--transition-fast);
}

.modal-close:hover {
    background-color: var(--lightest-gray);
}

.modal-body {
    padding: var(--spacing-lg);
    overflow-y: auto;
}

.modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--spacing-sm);
    padding: var(--spacing-lg);
    border-top: 1px solid var(--border-color);
}

/* ========== TABLES ========== */
.table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: var(--spacing-lg);
}

.table th,
.table td {
    padding: var(--spacing-md) var(--spacing-lg);
    text-align: left;
    border-bottom: 1px solid var(--border-color);
}

.table thead th {
    font-weight: 600;
    color: var(--dark-color);
    background-color: var(--lightest-gray);
    border-bottom: 2px solid var(--border-color);
}

.table tbody tr:hover {
    background-color: var(--lightest-gray);
}

.table-striped tbody tr:nth-of-type(odd) {
    background-color: var(--lightest-gray);
}

/* ========== PROGRESS BARS ========== */
.progress {
    height: 0.5rem;
    background-color: var(--lighter-gray);
    border-radius: 9999px;
    overflow: hidden;
    margin-bottom: var(--spacing-md);
}

.progress-bar {
    height: 100%;
    background-color: var(--primary-color);
    border-radius: 9999px;
    transition: width var(--transition-base);
}

.progress-bar-success {
    background-color: var(--success-color);
}

.progress-bar-warning {
    background-color: var(--warning-color);
}

.progress-bar-danger {
    background-color: var(--danger-color);
}

/* ========== AVATARS ========== */
.avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    overflow: hidden;
    background-color: var(--primary-color);
    color: var(--white-color);
    font-weight: 500;
}

.avatar-sm {
    width: 32px;
    height: 32px;
    font-size: 0.75rem;
}

.avatar-md {
    width: 48px;
    height: 48px;
    font-size: 1rem;
}

.avatar-lg {
    width: 64px;
    height: 64px;
    font-size: 1.25rem;
}

.avatar-xl {
    width: 96px;
    height: 96px;
    font-size: 2rem;
}

/* ========== ICONS ========== */
.icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
}

.icon-sm {
    width: 1rem;
    height: 1rem;
}

.icon-lg {
    width: 2rem;
    height: 2rem;
}

.icon-xl {
    width: 3rem;
    height: 3rem;
}

/* ========== RESPONSIVE ========== */
@media (max-width: 768px) {
    html {
        font-size: 14px;
    }
    
    .container {
        padding: 0 var(--spacing-md);
    }
    
    .navbar-nav {
        display: none;
    }
    
    .mobile-menu-btn {
        display: block;
    }
    
    .card {
        margin-bottom: var(--spacing-md);
    }
    
    .btn-block-mobile {
        width: 100%;
        margin-bottom: var(--spacing-sm);
    }
}

@media (min-width: 769px) and (max-width: 1024px) {
    .container {
        max-width: 960px;
    }
}

@media (min-width: 1025px) {
    .container {
        max-width: 1200px;
    }
}

/* ========== ANIMATIONS ========== */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.fade-in {
    animation: fadeIn 0.5s ease forwards;
}

@keyframes slideInLeft {
    from {
        opacity: 0;
        transform: translateX(-20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.slide-in-left {
    animation: slideInLeft 0.5s ease forwards;
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.slide-in-right {
    animation: slideInRight 0.5s ease forwards;
}

/* ========== PRINT STYLES ========== */
@media print {
    .no-print {
        display: none !important;
    }
    
    body {
        font-size: 12pt;
        line-height: 1.5;
    }
    
    .container {
        width: 100%;
        max-width: none;
    }
    
    a {
        text-decoration: underline;
        color: #000;
    }
    
    .btn {
        display: none;
    }
}

// src/assets/ variables.css

:root {
  /* Couleurs principales */
  --primary-color: #4361ee;
  --primary-dark: #3a56d4;
  --primary-light: #6c8aff;
  --secondary-color: #7209b7;
  --secondary-dark: #5a52cc;
  --accent-color: #f72585;
  --success-color: #4cc9f0;
  --warning-color: #f8961e;
  --danger-color: #f94144;
  --info-color: #4895ef;

  /* Couleurs neutres */
  --white: #ffffff;
  --light-gray: #f8f9fa;
  --gray: #e9ecef;
  --medium-gray: #adb5bd;
  --dark-gray: #495057;
  --black: #212529;

  /* Couleurs de fond */
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-dark: #121826;
  --bg-card: #ffffff;
  --bg-hover: rgba(67, 97, 238, 0.1);

  /* Couleurs de texte */
  --text-primary: #212529;
  --text-secondary: #495057;
  --text-light: #6c757d;
  --text-inverse: #ffffff;

  /* Bordures */
  --border-color: #dee2e6;
  --border-radius-sm: 4px;
  --border-radius: 8px;
  --border-radius-lg: 12px;
  --border-radius-xl: 16px;

  /* Ombres */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

  /* Typographie */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */

  /* Espacements */
  --spacing-xs: 0.25rem;  /* 4px */
  --spacing-sm: 0.5rem;   /* 8px */
  --spacing-md: 1rem;     /* 16px */
  --spacing-lg: 1.5rem;   /* 24px */
  --spacing-xl: 2rem;     /* 32px */
  --spacing-2xl: 3rem;    /* 48px */

  /* Z-index */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
  --z-toast: 1080;

  /* Animations */
  --transition-fast: 150ms;
  --transition-normal: 300ms;
  --transition-slow: 500ms;
  --easing: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Mode sombre */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #121826;
    --bg-secondary: #1e293b;
    --bg-card: #1e293b;
    --text-primary: #f1f5f9;
    --text-secondary: #cbd5e1;
    --text-light: #94a3b8;
    --border-color: #334155;
  }
}

/* Classes utilitaires */
.color-primary { color: var(--primary-color); }
.bg-primary { background-color: var(--primary-color); }
.color-success { color: var(--success-color); }
.bg-success { background-color: var(--success-color); }
.color-danger { color: var(--danger-color); }
.bg-danger { background-color: var(--danger-color); }

// src/composables/useAuth.js

ces vide

// src/composables/useErroHadle

import { useAuthStore } from '@/stores/auth'

export function useErrorHandler(toast, router) {
  const authStore = useAuthStore()
  
  const handleApiError = (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || error.message
    
    switch (status) {
      case 401:
        // Non authentifié
        toast.error('Session expirée. Veuillez vous reconnecter.', {
          timeout: 3000
        })
        authStore.logout()
        router.push('/login')
        break
        
      case 403:
        // Non autorisé
        toast.warning('Accès non autorisé', {
          timeout: 4000
        })
        router.push('/dashboard')
        break
        
      case 404:
        // Ressource non trouvée
        toast.error('Ressource non trouvée', {
          timeout: 3000
        })
        break
        
      case 422:
        // Erreur de validation
        const validationErrors = error.response?.data?.errors
        if (validationErrors) {
          Object.values(validationErrors).forEach(err => {
            toast.error(err[0], { timeout: 4000 })
          })
        } else {
          toast.error(message || 'Données invalides')
        }
        break
        
      case 429:
        // Trop de requêtes
        toast.warning('Trop de requêtes. Veuillez patienter.', {
          timeout: 5000
        })
        break
        
      case 500:
        // Erreur serveur
        toast.error('Erreur serveur. Veuillez réessayer plus tard.', {
          timeout: 5000
        })
        break
        
      default:
        toast.error(message || 'Erreur de connexion', {
          timeout: 4000
        })
    }
  }
  
  const handleNetworkError = () => {
    toast.error('Problème de connexion internet. Vérifiez votre réseau.', {
      timeout: 5000,
      closeButton: true
    })
  }
  
  return {
    handleApiError,
    handleNetworkError
  }
}

// src/composables/usePayment.js

vide  

// src/composables/useVideo.js

vide

// src/composables/useWebsocket.js

vide

// src/router/guards.js

// frontend/src/router/guards.js
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notifications';
import { useRouter } from 'vue-router';

/**
 * @description Guard d'authentification globale
 * Vérifie si l'utilisateur est connecté et a les permissions nécessaires
 */
export const setupAuthGuards = (router) => {
    const authStore = useAuthStore();
    const notificationStore = useNotificationStore();

    // Middleware global avant chaque route
    router.beforeEach(async (to, from, next) => {
        console.log(`[Router] Navigation: ${from.fullPath} -> ${to.fullPath}`);

        // Initialiser l'authentification si nécessaire
        if (!authStore.isInitialized) {
            console.log('[Auth] Initialisation de l\'authentification...');
            await authStore.initialize();
        }

        // Vérifier si la route nécessite une authentification
        const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
        const requiresGuest = to.matched.some(record => record.meta.requiresGuest);
        const requiredRole = to.meta.role;
        const requiredPermissions = to.meta.permissions || [];

        // Récupérer l'état d'authentification
        const isAuthenticated = authStore.isAuthenticated;
        const userRole = authStore.user?.role;
        const userPermissions = authStore.user?.permissions || [];

        console.log(`[Auth] Statut: ${isAuthenticated ? 'Connecté' : 'Non connecté'}`);
        console.log(`[Auth] Rôle: ${userRole || 'Aucun'}`);

        // === CAS 1: Route pour invités seulement ===
        if (requiresGuest && isAuthenticated) {
            console.log('[Guard] Redirection: Connecté vers dashboard');

            // Rediriger selon le rôle
            switch (userRole) {
                case 'admin':
                    return next({ name: 'admin-dashboard' });
                case 'teacher':
                    return next({ name: 'teacher-dashboard' });
                case 'student':
                    return next({ name: 'student-dashboard' });
                default:
                    return next({ name: 'dashboard' });
            }
        }

        // === CAS 2: Route protégée nécessitant authentification ===
        if (requiresAuth) {
            // Si non authentifié, rediriger vers login
            if (!isAuthenticated) {
                console.log('[Guard] Accès refusé: Non authentifié');

                // Sauvegarder la route demandée pour redirection après login
                const redirectPath = to.fullPath !== '/' ? to.fullPath : undefined;

                notificationStore.showWarning({
                    title: 'Accès restreint',
                    message: 'Vous devez être connecté pour accéder à cette page',
                    duration: 3000
                });

                return next({
                    name: 'login',
                    query: { redirect: redirectPath }
                });
            }

            // Vérifier les permissions de rôle
            if (requiredRole && userRole !== requiredRole) {
                console.log(`[Guard] Permission refusée: Rôle ${userRole} ≠ ${requiredRole}`);

                notificationStore.showError({
                    title: 'Accès interdit',
                    message: 'Vous n\'avez pas les permissions nécessaires',
                    duration: 4000
                });

                // Rediriger vers le dashboard approprié
                switch (userRole) {
                    case 'admin':
                        return next({ name: 'admin-dashboard' });
                    case 'teacher':
                        return next({ name: 'teacher-dashboard' });
                    case 'student':
                        return next({ name: 'student-dashboard' });
                    default:
                        return next({ name: 'dashboard' });
                }
            }

            // Vérifier les permissions spécifiques
            if (requiredPermissions.length > 0) {
                const hasAllPermissions = requiredPermissions.every(permission =>
                    userPermissions.includes(permission)
                );

                if (!hasAllPermissions) {
                    console.log('[Guard] Permissions insuffisantes');

                    notificationStore.showError({
                        title: 'Permissions insuffisantes',
                        message: 'Vous ne disposez pas des droits nécessaires',
                        duration: 4000
                    });

                    return next({ name: 'unauthorized' });
                }
            }

            // Vérifier si le compte est vérifié (pour certaines routes)
            if (to.meta.requiresVerified && !authStore.user?.isVerified) {
                console.log('[Guard] Compte non vérifié');

                notificationStore.showWarning({
                    title: 'Vérification requise',
                    message: 'Veuillez vérifier votre email avant de continuer',
                    duration: 5000
                });

                return next({ name: 'verify-email' });
            }

            // Vérifier si le compte est actif
            if (!authStore.user?.isActive) {
                console.log('[Guard] Compte désactivé');

                notificationStore.showError({
                    title: 'Compte désactivé',
                    message: 'Votre compte a été désactivé. Contactez l\'administration.',
                    duration: 6000
                });

                return next({ name: 'account-suspended' });
            }
        }

        // === CAS 3: Vérifier la session expire bientôt ===
        if (isAuthenticated && authStore.isTokenExpiringSoon()) {
            console.log('[Guard] Token expirant bientôt, tentative de rafraîchissement');

            try {
                await authStore.refreshToken();
                console.log('[Guard] Token rafraîchi avec succès');
            } catch (error) {
                console.warn('[Guard] Échec rafraîchissement token:', error.message);
                // Continuer quand même, l'utilisateur sera déconnecté à l'expiration
            }
        }

        // === CAS 4: Vérifier les paramètres de query spéciaux ===
        if (to.query.logout === 'true') {
            console.log('[Guard] Logout via query param');
            await authStore.logout();
            return next({ name: 'login' });
        }

        if (to.query.session_expired === 'true') {
            notificationStore.showWarning({
                title: 'Session expirée',
                message: 'Votre session a expiré. Veuillez vous reconnecter.',
                duration: 5000
            });

            // Nettoyer l'URL
            const { session_expired, ...queryWithoutParam } = to.query;
            return next({ ...to, query: queryWithoutParam });
        }

        // === CAS 5: Toutes les vérifications passées ===
        console.log('[Guard] Navigation autorisée');
        next();
    });

    // Middleware après navigation (pour analytics/tracking)
    router.afterEach((to, from) => {
        // Enregistrer la visite pour analytics
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('config', 'G-XXXXXXXXXX', {
                page_path: to.path,
                page_title: to.meta.title || 'EDUCOURS'
            });
        }

        // Scroll vers le haut
        window.scrollTo(0, 0);

        // Mettre à jour le titre de la page
        const appName = 'EDUCOURS';
        const pageTitle = to.meta.title || 'Plateforme d\'éducation en ligne';
        document.title = pageTitle ? `${pageTitle} | ${appName}` : appName;
    });

    // Gestion des erreurs de navigation
    router.onError((error) => {
        console.error('[Router] Erreur de navigation:', error);

        notificationStore.showError({
            title: 'Erreur de navigation',
            message: 'Impossible de charger la page demandée',
            duration: 4000
        });
    });
};

/**
 * @description Guard pour vérifier si l'utilisateur peut accéder à une route admin
 */
export const adminGuard = (to, from, next) => {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
        return next({ name: 'login', query: { redirect: to.fullPath } });
    }

    if (authStore.user?.role !== 'admin') {
        const notificationStore = useNotificationStore();
        notificationStore.showError({
            title: 'Accès refusé',
            message: 'Cette zone est réservée aux administrateurs',
            duration: 4000
        });

        return next({ name: 'dashboard' });
    }

    next();
};

/**
 * @description Guard pour vérifier si l'utilisateur peut accéder à une route teacher
 */
export const teacherGuard = (to, from, next) => {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
        return next({ name: 'login', query: { redirect: to.fullPath } });
    }

    if (!['teacher', 'admin'].includes(authStore.user?.role)) {
        const notificationStore = useNotificationStore();
        notificationStore.showError({
            title: 'Accès refusé',
            message: 'Cette zone est réservée aux enseignants',
            duration: 4000
        });

        return next({ name: 'dashboard' });
    }

    next();
};

/**
 * @description Guard pour vérifier si l'utilisateur peut accéder à une route student
 */
export const studentGuard = (to, from, next) => {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
        return next({ name: 'login', query: { redirect: to.fullPath } });
    }

    if (!['student', 'admin'].includes(authStore.user?.role)) {
        const notificationStore = useNotificationStore();
        notificationStore.showError({
            title: 'Accès refusé',
            message: 'Cette zone est réservée aux étudiants',
            duration: 4000
        });

        return next({ name: 'dashboard' });
    }

    next();
};

/**
 * @description Guard pour vérifier si l'utilisateur a vérifié son email
 */
export const verifiedEmailGuard = (to, from, next) => {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
        return next({ name: 'login', query: { redirect: to.fullPath } });
    }

    if (!authStore.user?.isVerified) {
        const notificationStore = useNotificationStore();
        notificationStore.showWarning({
            title: 'Vérification requise',
            message: 'Veuillez vérifier votre adresse email avant de continuer',
            duration: 5000
        });

        return next({ name: 'verify-email' });
    }

    next();
};

/**
 * @description Guard pour les routes de maintenance
 */
export const maintenanceGuard = (to, from, next) => {
    const maintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';
    const authStore = useAuthStore();

    if (maintenanceMode && authStore.user?.role !== 'admin') {
        return next({ name: 'maintenance' });
    }

    next();
};

/**
 * @description Guard pour vérifier les permissions spécifiques
 * @param {string[]} requiredPermissions - Liste des permissions requises
 */
export const createPermissionGuard = (requiredPermissions) => {
    return (to, from, next) => {
        const authStore = useAuthStore();

        if (!authStore.isAuthenticated) {
            return next({ name: 'login', query: { redirect: to.fullPath } });
        }

        const userPermissions = authStore.user?.permissions || [];
        const hasAllPermissions = requiredPermissions.every(permission =>
            userPermissions.includes(permission)
        );

        if (!hasAllPermissions) {
            const notificationStore = useNotificationStore();
            notificationStore.showError({
                title: 'Permissions insuffisantes',
                message: 'Vous ne disposez pas des droits nécessaires',
                duration: 4000
            });

            return next({ name: 'unauthorized' });
        }

        next();
    };
};

/**
 * @description Guard pour les routes qui nécessitent un abonnement actif
 */
export const subscriptionGuard = (to, from, next) => {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
        return next({ name: 'login', query: { redirect: to.fullPath } });
    }

    // Vérifier si l'utilisateur a un abonnement actif
    const hasActiveSubscription = authStore.user?.subscription?.isActive;

    if (!hasActiveSubscription) {
        const notificationStore = useNotificationStore();
        notificationStore.showWarning({
            title: 'Abonnement requis',
            message: 'Cette fonctionnalité nécessite un abonnement actif',
            duration: 5000
        });

        return next({ name: 'subscription-plans' });
    }

    next();
};

/**
 * @description Guard pour les routes de paiement
 */
export const paymentGuard = (to, from, next) => {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
        return next({ name: 'login', query: { redirect: to.fullPath } });
    }

    // Vérifier si l'utilisateur a une méthode de paiement enregistrée
    const hasPaymentMethod = authStore.user?.paymentMethods?.length > 0;

    if (!hasPaymentMethod && to.name !== 'add-payment-method') {
        const notificationStore = useNotificationStore();
        notificationStore.showInfo({
            title: 'Méthode de paiement requise',
            message: 'Veuillez ajouter une méthode de paiement pour continuer',
            duration: 5000
        });

        return next({ name: 'add-payment-method', query: { redirect: to.fullPath } });
    }

    next();
};

/**
 * @description Utilitaire pour ajouter des métadonnées aux routes
 */
export const withMeta = (meta) => ({
    meta: {
        requiresAuth: true,
        ...meta
    }
});

/**
 * @description Exporter tous les guards
 */
export default {
    setupAuthGuards,
    adminGuard,
    teacherGuard,
    studentGuard,
    verifiedEmailGuard,
    maintenanceGuard,
    createPermissionGuard,
    subscriptionGuard,
    paymentGuard,
    withMeta
};


// src/router/index.js



/* frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { setupAuthGuards, adminGuard, teacherGuard, studentGuard } from './guards';
import { useAuthStore } from '@/stores/auth';

// Import des vues
const LoginView = () => import('@/views/auth/LoginView.vue');
const RegisterView = () => import('@/views/auth/RegisterView.vue');
const VerifyEmailView = () => import('@/views/auth/VerifyEmailView.vue');
const ForgotPasswordView = () => import('@/views/auth/ForgotPasswordView.vue');
const ResetPasswordView = () => import('@/views/auth/ResetPasswordView.vue');

// Layouts
const BaseLayout = () => import('@/views/dashboard/BaseLayout.vue');

// Dashboard views
const StudentDashboard = () => import('@/views/dashboard/student/DashboardView.vue');
const TeacherDashboard = () => import('@/views/dashboard/teacher/DashboardView.vue');
const AdminDashboard = () => import('@/views/dashboard/admin/DashboardView.vue');

// Pages publiques
const WelcomeView = () => import('@/views/WelcomeView.vue');
const CoursesView = () => import('@/views/courses/CourseListView.vue');
const CourseDetailView = () => import('@/views/courses/CourseDetailView.vue');

// Pages d'erreur
const NotFoundView = () => import('@/views/errors/NotFoundView.vue');
const UnauthorizedView = () => import('@/views/errors/UnauthorizedView.vue');
const MaintenanceView = () => import('@/views/errors/MaintenanceView.vue');

const routes = [
  // === Routes publiques ===
  {
    path: '/',
    name: 'welcome',
    component: WelcomeView,
    meta: {
      title: 'Bienvenue',
      requiresGuest: true
    }
  },
  {
    path: '/courses',
    name: 'courses',
    component: CoursesView,
    meta: {
      title: 'Nos Cours'
    }
  },
  {
    path: '/courses/:id',
    name: 'course-detail',
    component: CourseDetailView,
    meta: {
      title: 'Détail du cours'
    }
  },

  // === Authentification ===
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      title: 'Connexion',
      requiresGuest: true
    }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: {
      title: 'Inscription',
      requiresGuest: true
    }
  },
  {
    path: '/verify-email',
    name: 'verify-email',
    component: VerifyEmailView,
    meta: {
      title: 'Vérification Email',
      requiresAuth: true,
      requiresVerified: false
    }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPasswordView,
    meta: {
      title: 'Mot de passe oublié',
      requiresGuest: true
    }
  },
  {
    path: '/reset-password/:token',
    name: 'reset-password',
    component: ResetPasswordView,
    meta: {
      title: 'Réinitialisation mot de passe',
      requiresGuest: true
    }
  },

  // === Dashboard (Layout principal) ===
  {
    path: '/dashboard',
    component: BaseLayout,
    meta: { requiresAuth: true },
    children: [
      // Dashboard par rôle
      {
        path: '',
        name: 'dashboard',
        redirect: (to) => {
          const authStore = useAuthStore();
          switch (authStore.user?.role) {
            case 'admin': return { name: 'admin-dashboard' };
            case 'teacher': return { name: 'teacher-dashboard' };
            case 'student': return { name: 'student-dashboard' };
            default: return { name: 'student-dashboard' };
          }
        }
      },
      {
        path: 'student',
        name: 'student-dashboard',
        component: StudentDashboard,
        meta: {
          title: 'Tableau de bord étudiant',
          role: 'student'
        },
        beforeEnter: studentGuard
      },
      {
        path: 'teacher',
        name: 'teacher-dashboard',
        component: TeacherDashboard,
        meta: {
          title: 'Tableau de bord enseignant',
          role: 'teacher'
        },
        beforeEnter: teacherGuard
      },
      {
        path: 'admin',
        name: 'admin-dashboard',
        component: AdminDashboard,
        meta: {
          title: 'Tableau de bord administrateur',
          role: 'admin'
        },
        beforeEnter: adminGuard
      },

      // Sous-routes communes
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/profile/ProfileView.vue'),
        meta: {
          title: 'Mon Profil',
          requiresAuth: true
        }
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/views/profile/SettingsView.vue'),
        meta: {
          title: 'Paramètres',
          requiresAuth: true
        }
      }
    ]
  },

  // === Routes admin ===
  {
    path: '/admin',
    component: BaseLayout,
    meta: { requiresAuth: true, role: 'admin' },
    beforeEnter: adminGuard,
    children: [
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('@/views/admin/UserManagementView.vue'),
        meta: {
          title: 'Gestion des utilisateurs',
          permissions: ['users:read', 'users:write']
        }
      },
      {
        path: 'courses',
        name: 'admin-courses',
        component: () => import('@/views/admin/CourseManagementView.vue'),
        meta: {
          title: 'Gestion des cours',
          permissions: ['courses:read', 'courses:write']
        }
      },
      {
        path: 'payments',
        name: 'admin-payments',
        component: () => import('@/views/admin/PaymentManagementView.vue'),
        meta: {
          title: 'Gestion des paiements',
          permissions: ['payments:read', 'payments:write']
        }
      }
    ]
  },

  // === Routes teacher ===
  {
    path: '/teacher',
    component: BaseLayout,
    meta: { requiresAuth: true, role: 'teacher' },
    beforeEnter: teacherGuard,
    children: [
      {
        path: 'my-courses',
        name: 'teacher-courses',
        component: () => import('@/views/teacher/MyCoursesView.vue'),
        meta: {
          title: 'Mes Cours'
        }
      },
      {
        path: 'create-course',
        name: 'create-course',
        component: () => import('@/views/teacher/CreateCourseView.vue'),
        meta: {
          title: 'Créer un cours',
          permissions: ['courses:write']
        }
      }
    ]
  },

  // === Routes student ===
  {
    path: '/student',
    component: BaseLayout,
    meta: { requiresAuth: true, role: 'student' },
    beforeEnter: studentGuard,
    children: [
      {
        path: 'my-learning',
        name: 'my-learning',
        component: () => import('@/views/student/MyLearningView.vue'),
        meta: {
          title: 'Mes Apprentissages'
        }
      },
      {
        path: 'enrolled-courses',
        name: 'enrolled-courses',
        component: () => import('@/views/student/EnrolledCoursesView.vue'),
        meta: {
          title: 'Mes Cours Inscrits'
        }
      }
    ]
  },

  // === Routes d'erreur ===
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: UnauthorizedView,
    meta: {
      title: 'Accès non autorisé'
    }
  },
  {
    path: '/maintenance',
    name: 'maintenance',
    component: MaintenanceView,
    meta: {
      title: 'Maintenance en cours'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: {
      title: 'Page non trouvée'
    }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Retourner à la position sauvegardée ou en haut
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0, behavior: 'smooth' };
    }
  }
});

// Configurer les guards d'authentification
setupAuthGuards(router);

// Intercepteur pour les erreurs d'authentification
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Vérifier si le token a expiré
  if (authStore.isAuthenticated && authStore.isTokenExpired) {
    console.warn('[Router] Token expiré, déconnexion...');
    authStore.logout();

    const notificationStore = useNotificationStore();
    notificationStore.showWarning({
      title: 'Session expirée',
      message: 'Votre session a expiré. Veuillez vous reconnecter.',
      duration: 5000
    });

    return next({
      name: 'login',
      query: {
        redirect: to.fullPath,
        session_expired: 'true'
      }
    });
  }

  next();
});

export default router;*/





import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'



const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: () => import('@/views/WelcomeView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/terms',
    name: 'Terms',
    component: () => import('@/views/TermsView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/BaseLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'StudentDashboard',
        component: () => import('@/views/dashboard/student/DashboardView.vue'),
        meta: { requiresAuth: true, role: 'student' }
      },
      {
        path: 'teacher',
        name: 'TeacherDashboard',
        component: () => import('@/views/dashboard/teacher/DashboardView.vue'),
        meta: { requiresAuth: true, role: 'teacher' }
      },
      {
        path: 'admin',
        name: 'AdminDashboard',
        component: () => import('@/views/dashboard/admin/DashboardView.vue'),
        meta: { requiresAuth: true, role: 'admin' }
      }
    ]
  },
  {
    path: '/courses',
    component: () => import('@/views/dashboard/BaseLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Courses',
        component: () => import('@/views/courses/CourseListView.vue')
      },
      {
        path: ':id',
        name: 'CourseDetail',
        component: () => import('@/views/courses/CourseDetailView.vue')
      },
      {
        path: ':id/videos',
        name: 'CourseVideos',
        component: () => import('@/views/courses/VideoListView.vue')
      },
      {
        path: ':id/videos/:videoId',
        name: 'VideoPlayer',
        component: () => import('@/views/courses/VideoPlayerView.vue')
      },
      {
        path: ':id/live',
        name: 'LiveClasses',
        component: () => import('@/views/courses/LiveClassView.vue')
      },
      {
        path: ':id/assignments',
        name: 'Assignments',
        component: () => import('@/views/courses/AssignmentView.vue')
      }
    ]
  },
  {
    path: '/payment',
    component: () => import('@/views/dashboard/BaseLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'checkout/:courseId',
        name: 'PaymentCheckout',
        component: () => import('@/views/payment/PaymentCheckoutView.vue')
      },
      {
        path: 'success',
        name: 'PaymentSuccess',
        component: () => import('@/views/payment/PaymentSuccessView.vue')
      },
      {
        path: 'history',
        name: 'PaymentHistory',
        component: () => import('@/views/payment/PaymentHistoryView.vue')
      }
    ]
  },
  {
    path: '/profile',
    component: () => import('@/views/dashboard/BaseLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Profile',
        component: () => import('@/views/profile/ProfileView.vue')
      },
      {
        path: 'edit',
        name: 'EditProfile',
        component: () => import('@/views/profile/EditProfileView.vue')
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/profile/SettingsView.vue')
      }
    ]
  },
  {
    path: '/admin',
    component: () => import('@/views/dashboard/BaseLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      {
        path: 'courses',
        name: 'AdminCourses',
        component: () => import('@/views/admin/CourseManagementView.vue')
      },
      {
        path: 'courses/create',
        name: 'CreateCourse',
        component: () => import('@/views/admin/CreateCourseView.vue')
      },
      {
        path: 'courses/:id',
        name: 'EditCourse',
        component: () => import('@/views/admin/EditCourseView.vue')
      },
      {
        path: 'teachers',
        name: 'TeacherManagement',
        component: () => import('@/views/admin/TeacherManagementView.vue')
      },
      {
        path: 'students',
        name: 'StudentManagement',
        component: () => import('@/views/admin/StudentManagementView.vue')
      },
      {
        path: 'payments',
        name: 'PaymentManagement',
        component: () => import('@/views/admin/PaymentManagementView.vue')
      },
      {
        path: 'payouts',
        name: 'PayoutManagement',
        component: () => import('@/views/admin/PayoutManagementView.vue')
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: () => import('@/views/admin/AnalyticsView.vue')
      }
    ]
  },
  {
    path: '/live/:sessionId',
    name: 'LiveClassRoom',
    component: () => import('@/views/live/LiveClassRoomView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/errors/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.user?.role

  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }

  // Check if route requires guest (logged out users only)
  if (to.meta.requiresGuest && isAuthenticated) {
    next('/dashboard')
    return
  }

  // Check role-based access
  if (to.meta.role && userRole !== to.meta.role) {
    // Redirect to appropriate dashboard based on role
    switch (userRole) {
      case 'student':
        next('/dashboard')
        break
      case 'teacher':
        next('/dashboard/teacher')
        break
      case 'admin':
        next('/dashboard/admin')
        break
      default:
        next('/login')
    }
    return
  }

  next()
})

export default router


// src/stores/auth.js

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import axios from 'axios'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const loading = ref(false)
  const toast = useToast()

  // Create axios instance with auth header
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  // Add token to requests if available
  axiosInstance.interceptors.request.use(
    config => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    error => Promise.reject(error)
  )

  // Check if user is authenticated
  const isAuthenticated = computed(() => {
    return !!user.value && !!token.value
  })

  // Initialize auth state
  const initialize = async () => {
    if (token.value) {
      try {
        const response = await axiosInstance.get('/auth/me')
        user.value = response.data.data
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        logout()
      }
    }
  }

  // Login function
  const login = async (credentials) => {
    try {
      loading.value = true
      const response = await axiosInstance.post('/auth/login', credentials)
      
      const { token: authToken, user: userData } = response.data.data
      
      // Store token and user
      token.value = authToken
      user.value = userData
      localStorage.setItem('token', authToken)
      
      toast.success('Login successful!')
      
      // Redirect based on role
      redirectBasedOnRole(userData.role)
      
      return { success: true, user: userData }
    } /*catch (error) {
      console.error('Login error details:', error)

      let message = 'Echec de la connexion'

      if (error.response){
        switch (error.response.status) {
          case 401:
            message = 'Email ou mot the passe incorrect'
                break
          case 422:
            message = 'Donnees de connection invalides'
            break
          case 429:
            message = 'Trop de tentatives. vueillez reessayer plus tard'
            break
          default:
            message = error.response?.data?.error || `Login failed. Erreur ${error.response.status}`
        }
      } else if (error.request) {
        message = 'Erreur reseau. Verifiez votre connection internet. '
      }
      //const message = error.response?.data?.error || 'Login failed'
      toast.error(message)
      return { success: false, error: message }
    }*/ finally {
      loading.value = false
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      loading.value = true
      const response = await axiosInstance.post('/auth/register', userData)
      
      const { token: authToken, user: newUser } = response.data.data
      
      // Store token and user
      token.value = authToken
      user.value = newUser
      localStorage.setItem('token', authToken)
      
      toast.success('Registration successful!')
      
      // Redirect based on role
      redirectBasedOnRole(newUser.role)
      
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  // Logout function
  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    router.push('/login')
    toast.info('Logged out successfully')
  }

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      loading.value = true
      const response = await axiosInstance.put('/users/profile', profileData)
      
      user.value = response.data.data
      toast.success('Profile updated successfully')
      
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Profile update failed'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  // Change password
  const changePassword = async (passwordData) => {
    try {
      loading.value = true
      await axiosInstance.put('/users/change-password', passwordData)
      
      toast.success('Password changed successfully')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Password change failed'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  // Redirect based on user role
  const redirectBasedOnRole = (role) => {
    switch (role) {
      case 'student':
        router.push('/dashboard')
        break
      case 'teacher':
        router.push('/dashboard/teacher')
        break
      case 'admin':
        router.push('/dashboard/admin')
        break
      default:
        router.push('/dashboard')
    }
  }

  // Get user avatar
  const getUserAvatar = computed(() => {
    if (user.value?.avatar) {
      return user.value.avatar
    }
    
    // Generate avatar from initials
    if (user.value?.firstName && user.value?.lastName) {
      return user.value.firstName.charAt(0) + user.value.lastName.charAt(0)
    }
    
    if (user.value?.email) {
      return user.value.email.charAt(0).toUpperCase()
    }
    
    return 'U'
  })

  // Get user full name
  const getUserFullName = computed(() => {
    if (user.value?.firstName && user.value?.lastName) {
      return `${user.value.firstName} ${user.value.lastName}`
    }
    
    if (user.value?.email) {
      return user.value.email
    }
    
    return 'User'
  })

  return {
    user,
    token,
    loading,
    axiosInstance,
    isAuthenticated,
    getUserAvatar,
    getUserFullName,
    initialize,
    login,
    register,
    logout,
    updateProfile,
    changePassword
  }
})


// src/stores/courses.js

vide 


// src/stores/notifications.js

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

export const useNotificationStore = defineStore('notifications', () => {
  const authStore = useAuthStore()
  
  // État
  const notifications = ref([])
  const unreadCount = ref(0)
  const isLoading = ref(false)
  
  // Getters
  const hasUnread = computed(() => unreadCount.value > 0)
  const recentNotifications = computed(() => 
    notifications.value.slice(0, 5)
  )
  
  // Actions
  const initialize = async () => {
    if (!authStore.isAuthenticated) return
    
    try {
      isLoading.value = true
      // Simuler un chargement ou appeler votre API
      // const response = await axios.get('/api/notifications')
      // notifications.value = response.data
      
      // Pour le moment, données mockées
      notifications.value = []
      unreadCount.value = 0
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      isLoading.value = false
    }
  }
  
  const markAsRead = (id) => {
    const notification = notifications.value.find(n => n.id === id)
    if (notification && !notification.read) {
      notification.read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }
  
  const markAllAsRead = () => {
    notifications.value.forEach(n => n.read = true)
    unreadCount.value = 0
  }
  
  const addNotification = (notification) => {
    notifications.value.unshift({
      id: Date.now(),
      read: false,
      createdAt: new Date().toISOString(),
      ...notification
    })
    unreadCount.value += 1
  }
  
  const clearAll = () => {
    notifications.value = []
    unreadCount.value = 0
  }
  
  return {
    // État
    notifications,
    unreadCount,
    isLoading,
    
    // Getters
    hasUnread,
    recentNotifications,
    
    // Actions
    initialize,
    markAsRead,
    markAllAsRead,
    addNotification,
    clearAll
  }
})

// src/views/WelcomeView.vue
// src/views/Termsview.vue
// src/views/auth/LoginView.vue
// src/views/auth/RegisterView.vue
// src/views/dashboard/BaseLayout.vue
// src/views/dashboard/student/DashboardView.vue
// src/views/dashboard/teacher/DashboardView.vue
// src/views/dashboard/admin/DashboardView.vue
// src/views/courses/CourseListView.vue
// src/views/courses/CourseDetailView.vue
// src/views/courses/VideoListView.vue
// src/views/courses/VideoPlayerView.vue
// src/views/courses/LiveClassView.vue
// src/views/courses/AssignmentView.vue
// src/views/payment/PaymentCheckoutView.vue
// src/views/payment/PaymentSuccessView.vue
// src/views/payment/PaymentHistoryView.vue
// src/views/profile/ProfileView.vue
// src/views/profile/EditProfileView.vue
// src/views/profile/SettingsView.vue
// src/views/admin/CourseManagementView.vue
// src/views/admin/CreateCourseView.vue
// src/views/admin/EditCourseView.vue
// src/views/admin/TeacherManagementView.vue
// src/views/admin/StudentManagementView.vue
// src/views/admin/PaymentManagementView.vue
// src/views/admin/PayoutManagementView.vue
// src/views/admin/AnalyticsView.vue
// src/views/live/LiveClassRoomView.vue
// src/views/errors/NotFoundView.vue
// src/views/errors/ErrorView.vue
// src/
// src/
// src/
// src/


