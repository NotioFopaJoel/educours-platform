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