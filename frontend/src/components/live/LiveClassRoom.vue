<template>
  <div class="live-class-room">
    <div class="video-grid">
      <div class="main-video">
        <div class="video-placeholder">
          <i class="fas fa-chalkboard-teacher"></i>
          <p>Présentation du professeur</p>
        </div>
      </div>
      
      <div class="participants-sidebar">
        <h4>Participants ({{ participants.length }})</h4>
        <div class="participants-list">
          <div v-for="p in participants" :key="p.id" class="participant">
            <div class="participant-avatar">{{ p.name.charAt(0) }}</div>
            <span>{{ p.name }}</span>
            <i v-if="p.isTeacher" class="fas fa-crown" style="color: #f59e0b"></i>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-section">
      <div class="chat-messages">
        <div v-for="msg in messages" :key="msg.id" class="chat-message" :class="{ own: msg.isOwn }">
          <strong>{{ msg.sender }}:</strong>
          <span>{{ msg.text }}</span>
          <small>{{ msg.time }}</small>
        </div>
      </div>
      
      <div class="chat-input">
        <input 
          type="text" 
          v-model="newMessage" 
          @keyup.enter="sendMessage"
          placeholder="Écrivez un message..."
        >
        <button @click="sendMessage"><i class="fas fa-paper-plane"></i></button>
      </div>
    </div>

    <div class="controls-bar">
      <button class="control-btn" @click="toggleMic">
        <i :class="micEnabled ? 'fas fa-microphone' : 'fas fa-microphone-slash'"></i>
      </button>
      <button class="control-btn" @click="toggleCam">
        <i :class="camEnabled ? 'fas fa-video' : 'fas fa-video-slash'"></i>
      </button>
      <button class="control-btn" @click="shareScreen">
        <i class="fas fa-desktop"></i>
      </button>
      <button class="control-btn leave" @click="leaveClass">
        <i class="fas fa-phone-slash"></i> Quitter
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  class: {
    type: Object,
    required: true
  },
  user: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['end-class'])

const micEnabled = ref(true)
const camEnabled = ref(true)
const newMessage = ref('')

const participants = ref([
  { id: 1, name: 'Jean Dupont', isTeacher: true },
  { id: 2, name: 'Marie Dubois', isTeacher: false },
  { id: 3, name: 'Thomas Martin', isTeacher: false }
])

const messages = ref([
  { id: 1, sender: 'Jean Dupont', text: 'Bienvenue à tous !', time: '10:00', isOwn: false },
  { id: 2, sender: 'Moi', text: 'Bonjour professeur !', time: '10:01', isOwn: true }
])

const toggleMic = () => {
  micEnabled.value = !micEnabled.value
}

const toggleCam = () => {
  camEnabled.value = !camEnabled.value
}

const shareScreen = () => {
  alert('Partage d\'écran (démonstration)')
}

const sendMessage = () => {
  if (!newMessage.value.trim()) return
  
  messages.value.push({
    id: messages.value.length + 1,
    sender: 'Moi',
    text: newMessage.value,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isOwn: true
  })
  newMessage.value = ''
}

const leaveClass = () => {
  if (confirm('Voulez-vous vraiment quitter le cours ?')) {
    emit('end-class')
  }
}
</script>

<style scoped>
.live-class-room {
  display: flex;
  flex-direction: column;
  height: 70vh;
  gap: 1rem;
}

.video-grid {
  display: flex;
  gap: 1rem;
  flex: 2;
  min-height: 0;
}

.main-video {
  flex: 3;
  background: #1f2937;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-placeholder {
  text-align: center;
  color: white;
}

.video-placeholder i {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.participants-sidebar {
  flex: 1;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1rem;
  overflow-y: auto;
}

.participants-sidebar h4 {
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.participants-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.participant {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 8px;
  background: white;
}

.participant-avatar {
  width: 32px;
  height: 32px;
  background: #4f46e5;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.chat-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chat-message {
  padding: 0.5rem;
  border-radius: 8px;
  background: #f8f9fa;
  max-width: 80%;
}

.chat-message.own {
  align-self: flex-end;
  background: #4f46e5;
  color: white;
}

.chat-message strong {
  font-size: 0.75rem;
}

.chat-message small {
  font-size: 0.7rem;
  opacity: 0.7;
  margin-left: 0.5rem;
}

.chat-input {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}

.chat-input input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.chat-input button {
  padding: 0.5rem 1rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.controls-bar {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.control-btn {
  width: 48px;
  height: 48px;
  border: none;
  background: #f3f4f6;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.25rem;
}

.control-btn.leave {
  background: #ef4444;
  color: white;
  width: auto;
  padding: 0 1.5rem;
  border-radius: 24px;
}
</style>