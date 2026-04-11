<template>
  <div class="notification-list">
    <div v-if="notifications.length === 0" class="empty-state">
      <i class="fas fa-bell-slash"></i>
      <p>Aucune notification</p>
    </div>
    
    <div v-else class="notifications-container">
      <div 
        v-for="notif in notifications" 
        :key="notif.id"
        class="notification-item"
        :class="{ unread: !notif.read }"
      >
        <div class="notification-icon" :class="notif.type">
          <i :class="getIcon(notif.type)"></i>
        </div>
        <div class="notification-content">
          <p class="notification-title">{{ notif.title }}</p>
          <p class="notification-message">{{ notif.message }}</p>
          <span class="notification-time">{{ formatTime(notif.createdAt) }}</span>
        </div>
        <div class="notification-actions">
          <button 
            v-if="!notif.read" 
            class="mark-read-btn"
            @click="$emit('mark-as-read', notif.id)"
          >
            <i class="fas fa-check"></i>
          </button>
        </div>
      </div>
    </div>
    
    <div class="notification-footer" v-if="notifications.length > 0">
      <button class="clear-all-btn" @click="$emit('clear-all')">
        Tout effacer
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  notifications: {
    type: Array,
    default: () => []
  }
})

defineEmits(['mark-as-read', 'clear-all'])

const getIcon = (type) => {
  const icons = {
    assignment: 'fas fa-tasks',
    payment: 'fas fa-credit-card',
    course: 'fas fa-book',
    live_class: 'fas fa-video',
    message: 'fas fa-comment',
    system: 'fas fa-cog'
  }
  return icons[type] || 'fas fa-bell'
}

const formatTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'À l\'instant'
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffMins < 1440) return `Il y a ${Math.floor(diffMins / 60)} h`
  return `Il y a ${Math.floor(diffMins / 1440)} j`
}
</script>

<style scoped>
.notification-list {
  max-height: 500px;
  display: flex;
  flex-direction: column;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #9ca3af;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.notifications-container {
  flex: 1;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s;
}

.notification-item.unread {
  background: #f5f3ff;
}

.notification-item:hover {
  background: #f9fafb;
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-icon.assignment { background: #e0e7ff; color: #4f46e5; }
.notification-icon.payment { background: #d1fae5; color: #10b981; }
.notification-icon.course { background: #fed7aa; color: #f59e0b; }
.notification-icon.live_class { background: #fee2e2; color: #ef4444; }
.notification-icon.message { background: #cffafe; color: #06b6d4; }

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.notification-message {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.notification-time {
  font-size: 0.75rem;
  color: #9ca3af;
}

.mark-read-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.mark-read-btn:hover {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.notification-footer {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  text-align: center;
}

.clear-all-btn {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 0.875rem;
}
</style>