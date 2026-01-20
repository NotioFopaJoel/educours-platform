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