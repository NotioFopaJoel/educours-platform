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