<template>
  <div class="live-class-room-view">
    <!-- En-tête du cours -->
    <div class="class-header">
      <div class="container">
        <div class="header-content">
          <div class="header-left">
            <nav class="breadcrumb">
              <router-link to="/courses" class="breadcrumb-item">
                <i class="icon-book"></i>
                Cours
              </router-link>
              <router-link :to="`/courses/${course.id}`" class="breadcrumb-item">
                {{ course.title }}
              </router-link>
              <span class="breadcrumb-item active">
                <i class="icon-video"></i>
                Cours en direct
              </span>
            </nav>
            <h1 class="class-title">{{ currentSession.title }}</h1>
            <div class="class-meta">
              <span class="meta-item">
                <i class="icon-clock"></i>
                {{ formatDuration(currentSession.elapsedTime) }} / {{ currentSession.duration }} min
              </span>
              <span class="meta-item">
                <i class="icon-users"></i>
                {{ participants.length }} participants
              </span>
              <span class="meta-item">
                <i class="icon-calendar"></i>
                {{ formatDate(currentSession.date) }}
              </span>
              <span class="meta-item recording" v-if="isRecording">
                <i class="icon-circle"></i>
                Enregistrement en cours
              </span>
            </div>
          </div>
          <div class="header-right">
            <div class="header-actions">
              <button
                  class="btn-action"
                  :class="{ active: showChat }"
                  @click="toggleChat"
                  title="Chat"
              >
                <i class="icon-message-square"></i>
                <span class="badge" v-if="unreadMessages > 0">{{ unreadMessages }}</span>
              </button>
              <button
                  class="btn-action"
                  :class="{ active: showParticipants }"
                  @click="toggleParticipants"
                  title="Participants"
              >
                <i class="icon-users"></i>
                <span class="badge">{{ participants.length }}</span>
              </button>
              <button
                  class="btn-action"
                  :class="{ active: showWhiteboard }"
                  @click="toggleWhiteboard"
                  title="Tableau blanc"
              >
                <i class="icon-edit-3"></i>
              </button>
              <button
                  class="btn-action"
                  @click="toggleRecording"
                  :class="{ recording: isRecording }"
                  title="Enregistrement"
              >
                <i class="icon-circle"></i>
              </button>
              <button
                  class="btn-action"
                  @click="toggleScreenShare"
                  :class="{ active: isScreenSharing }"
                  title="Partage d'écran"
              >
                <i class="icon-monitor"></i>
              </button>
              <div class="dropdown">
                <button class="btn-action" title="Plus d'options">
                  <i class="icon-more-vertical"></i>
                </button>
                <div class="dropdown-menu">
                  <button @click="toggleFullscreen">
                    <i class="icon-maximize"></i>
                    {{ isFullscreen ? 'Quitter le plein écran' : 'Plein écran' }}
                  </button>
                  <button @click="toggleCaptions">
                    <i class="icon-type"></i>
                    {{ showCaptions ? 'Désactiver les sous-titres' : 'Activer les sous-titres' }}
                  </button>
                  <button @click="downloadMaterials">
                    <i class="icon-download"></i>
                    Télécharger les supports
                  </button>
                  <button @click="reportIssue">
                    <i class="icon-alert-triangle"></i>
                    Signaler un problème
                  </button>
                </div>
              </div>
            </div>
            <div class="timer">
              <div class="timer-display">{{ formattedTime }}</div>
              <div class="timer-label">Temps écoulé</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="class-main">
      <div class="container">
        <div class="class-layout" :class="layoutClass">
          <!-- Zone vidéo principale -->
          <div class="video-section">
            <div class="video-container">
              <!-- Présentateur/Enseignant -->
              <div class="main-video">
                <div class="video-wrapper">
                  <div class="video-placeholder" v-if="!isTeacherConnected">
                    <div class="placeholder-content">
                      <i class="icon-user"></i>
                      <p>L'enseignant rejoindra bientôt...</p>
                    </div>
                  </div>
                  <video
                      v-else
                      ref="teacherVideo"
                      autoplay
                      playsinline
                      class="video-element"
                  ></video>
                  <div class="video-overlay">
                    <div class="video-info">
                      <div class="user-info">
                        <div class="user-avatar">
                          <img :src="teacher.avatar" :alt="teacher.name">
                        </div>
                        <div class="user-details">
                          <h3>{{ teacher.name }}</h3>
                          <p>Enseignant</p>
                        </div>
                      </div>
                      <div class="video-stats">
                        <span class="stat">
                          <i class="icon-wifi"></i>
                          {{ networkQuality }}%
                        </span>
                        <span class="stat">
                          <i class="icon-volume-2"></i>
                          {{ audioLevel }}%
                        </span>
                      </div>
                    </div>
                    <div class="video-controls">
                      <button
                          class="btn-control"
                          @click="toggleAudio"
                          :class="{ muted: !isAudioEnabled }"
                      >
                        <i :class="isAudioEnabled ? 'icon-volume-2' : 'icon-volume-x'"></i>
                      </button>
                      <button
                          class="btn-control"
                          @click="toggleVideo"
                          :class="{ muted: !isVideoEnabled }"
                      >
                        <i :class="isVideoEnabled ? 'icon-video' : 'icon-video-off'"></i>
                      </button>
                      <button
                          class="btn-control"
                          @click="toggleRaiseHand"
                          :class="{ active: isHandRaised }"
                      >
                        <i class="icon-hand"></i>
                      </button>
                      <button
                          class="btn-control danger"
                          @click="leaveClass"
                      >
                        <i class="icon-phone-off"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Partage d'écran -->
              <div class="screen-share" v-if="isScreenSharing">
                <div class="screen-header">
                  <i class="icon-monitor"></i>
                  <span>Partage d'écran - {{ screenSharer.name }}</span>
                </div>
                <div class="screen-wrapper">
                  <video
                      ref="screenVideo"
                      autoplay
                      playsinline
                      class="screen-element"
                  ></video>
                </div>
              </div>

              <!-- Vidéos des participants -->
              <div class="participants-videos" v-if="showParticipantsVideos">
                <div
                    v-for="participant in activeSpeakers"
                    :key="participant.id"
                    class="participant-video"
                    :class="{ speaking: participant.isSpeaking }"
                >
                  <div class="video-wrapper">
                    <div class="video-placeholder" v-if="!participant.hasVideo">
                      <div class="placeholder-avatar">
                        <img :src="participant.avatar" :alt="participant.name">
                      </div>
                    </div>
                    <video
                        v-else
                        :ref="`participantVideo_${participant.id}`"
                        autoplay
                        playsinline
                        class="video-element"
                    ></video>
                    <div class="video-overlay">
                      <div class="participant-info">
                        <span class="participant-name">{{ participant.name }}</span>
                        <div class="participant-status">
                          <i
                              v-if="participant.isMuted"
                              class="icon-mic-off"
                              title="Microphone désactivé"
                          ></i>
                          <i
                              v-if="participant.isHandRaised"
                              class="icon-hand"
                              title="Main levée"
                          ></i>
                        </div>
                      </div>
                      <div class="audio-indicator" v-if="participant.isSpeaking">
                        <div class="audio-wave"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Contrôles principaux -->
            <div class="main-controls">
              <div class="controls-left">
                <button
                    class="btn-control-large"
                    @click="toggleAudio"
                    :class="{ muted: !isAudioEnabled }"
                >
                  <i :class="isAudioEnabled ? 'icon-mic' : 'icon-mic-off'"></i>
                  <span>{{ isAudioEnabled ? 'Muet' : 'Activer le micro' }}</span>
                </button>
                <button
                    class="btn-control-large"
                    @click="toggleVideo"
                    :class="{ muted: !isVideoEnabled }"
                >
                  <i :class="isVideoEnabled ? 'icon-video' : 'icon-video-off'"></i>
                  <span>{{ isVideoEnabled ? 'Désactiver la caméra' : 'Activer la caméra' }}</span>
                </button>
                <button
                    class="btn-control-large"
                    @click="toggleRaiseHand"
                    :class="{ active: isHandRaised }"
                >
                  <i class="icon-hand"></i>
                  <span>{{ isHandRaised ? 'Baisser la main' : 'Lever la main' }}</span>
                </button>
              </div>
              <div class="controls-center">
                <button
                    class="btn-control-large"
                    @click="toggleScreenShare"
                    :class="{ active: isScreenSharing }"
                >
                  <i class="icon-monitor"></i>
                  <span>{{ isScreenSharing ? 'Arrêter le partage' : 'Partager l\'écran' }}</span>
                </button>
                <button
                    class="btn-control-large danger"
                    @click="leaveClass"
                >
                  <i class="icon-phone-off"></i>
                  <span>Quitter le cours</span>
                </button>
              </div>
              <div class="controls-right">
                <div class="connection-status" :class="connectionStatus">
                  <i class="icon-wifi"></i>
                  <span>{{ connectionStatusLabel }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Panneaux latéraux -->
          <div class="side-panels">
            <!-- Chat -->
            <div class="panel chat-panel" :class="{ active: showChat }">
              <div class="panel-header">
                <h3>Chat</h3>
                <div class="panel-actions">
                  <button class="btn-panel-action" @click="clearChat">
                    <i class="icon-trash-2"></i>
                  </button>
                  <button class="btn-panel-action" @click="toggleChat">
                    <i class="icon-x"></i>
                  </button>
                </div>
              </div>
              <div class="panel-content">
                <div class="chat-messages" ref="chatMessages">
                  <div
                      v-for="message in chatMessages"
                      :key="message.id"
                      class="chat-message"
                      :class="{
                      'system': message.type === 'system',
                      'teacher': message.sender === 'teacher',
                      'own': message.sender === user.id
                    }"
                  >
                    <div class="message-avatar" v-if="message.type !== 'system'">
                      <img
                          :src="getAvatar(message.sender)"
                          :alt="getSenderName(message.sender)"
                      >
                    </div>
                    <div class="message-content">
                      <div class="message-header" v-if="message.type !== 'system'">
                        <span class="sender-name">{{ getSenderName(message.sender) }}</span>
                        <span class="message-time">{{ formatMessageTime(message.timestamp) }}</span>
                      </div>
                      <div class="message-body">
                        <p>{{ message.text }}</p>
                        <div class="message-actions" v-if="message.type === 'regular'">
                          <button
                              class="btn-message-action"
                              @click="replyToMessage(message)"
                          >
                            <i class="icon-corner-up-left"></i>
                          </button>
                          <button
                              class="btn-message-action"
                              @click="reactToMessage(message)"
                          >
                            <i class="icon-heart"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="chat-input">
                  <div class="input-wrapper">
                    <input
                        type="text"
                        v-model="chatInput"
                        placeholder="Écrire un message..."
                        @keyup.enter="sendMessage"
                        :disabled="isMuted"
                        class="chat-input-field"
                    >
                    <div class="input-actions">
                      <button
                          class="btn-input-action"
                          @click="sendEmoji"
                          title="Émojis"
                      >
                        <i class="icon-smile"></i>
                      </button>
                      <button
                          class="btn-input-action"
                          @click="attachFile"
                          title="Joindre un fichier"
                      >
                        <i class="icon-paperclip"></i>
                      </button>
                      <button
                          class="btn-input-action"
                          @click="sendMessage"
                          :disabled="!chatInput.trim() || isMuted"
                          title="Envoyer"
                      >
                        <i class="icon-send"></i>
                      </button>
                    </div>
                  </div>
                  <div class="chat-notice" v-if="isMuted">
                    <i class="icon-mic-off"></i>
                    Vous êtes en mode muet. Vous ne pouvez pas envoyer de messages.
                  </div>
                </div>
              </div>
            </div>

            <!-- Participants -->
            <div class="panel participants-panel" :class="{ active: showParticipants }">
              <div class="panel-header">
                <h3>Participants ({{ participants.length }})</h3>
                <div class="panel-actions">
                  <button class="btn-panel-action" @click="toggleParticipants">
                    <i class="icon-x"></i>
                  </button>
                </div>
              </div>
              <div class="panel-content">
                <div class="participants-list">
                  <div
                      v-for="participant in participants"
                      :key="participant.id"
                      class="participant-item"
                      :class="{
                      'teacher': participant.role === 'teacher',
                      'speaking': participant.isSpeaking,
                      'hand-raised': participant.isHandRaised
                    }"
                  >
                    <div class="participant-avatar">
                      <img :src="participant.avatar" :alt="participant.name">
                      <div class="participant-status-indicator" :class="getStatusClass(participant)"></div>
                    </div>
                    <div class="participant-info">
                      <div class="participant-name">
                        {{ participant.name }}
                        <span class="participant-role" v-if="participant.role === 'teacher'">
                          <i class="icon-crown"></i>
                          Enseignant
                        </span>
                      </div>
                      <div class="participant-status">
                        <span v-if="participant.isHandRaised" class="hand-raised">
                          <i class="icon-hand"></i>
                          Main levée
                        </span>
                        <span v-if="participant.isSpeaking" class="speaking">
                          <i class="icon-mic"></i>
                          En train de parler
                        </span>
                      </div>
                    </div>
                    <div class="participant-actions">
                      <button
                          v-if="user.role === 'teacher' && participant.role !== 'teacher'"
                          class="btn-participant-action"
                          @click="toggleParticipantMute(participant)"
                          :title="participant.isMuted ? 'Activer le micro' : 'Rendre muet'"
                      >
                        <i :class="participant.isMuted ? 'icon-mic-off' : 'icon-mic'"></i>
                      </button>
                      <button
                          v-if="user.role === 'teacher' && participant.role !== 'teacher'"
                          class="btn-participant-action"
                          @click="removeParticipant(participant)"
                          title="Retirer"
                      >
                        <i class="icon-user-x"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="participants-actions" v-if="user.role === 'teacher'">
                  <button class="btn-action" @click="muteAll">
                    <i class="icon-mic-off"></i>
                    Rendre tout le monde muet
                  </button>
                  <button class="btn-action" @click="lowerAllHands">
                    <i class="icon-hand"></i>
                    Baisser toutes les mains
                  </button>
                </div>
              </div>
            </div>

            <!-- Tableau blanc -->
            <div class="panel whiteboard-panel" :class="{ active: showWhiteboard }">
              <div class="panel-header">
                <h3>Tableau blanc</h3>
                <div class="panel-actions">
                  <button class="btn-panel-action" @click="clearWhiteboard">
                    <i class="icon-trash-2"></i>
                  </button>
                  <button class="btn-panel-action" @click="saveWhiteboard">
                    <i class="icon-download"></i>
                  </button>
                  <button class="btn-panel-action" @click="toggleWhiteboard">
                    <i class="icon-x"></i>
                  </button>
                </div>
              </div>
              <div class="panel-content">
                <div class="whiteboard-tools">
                  <div class="tool-group">
                    <button
                        v-for="tool in drawingTools"
                        :key="tool.id"
                        class="btn-tool"
                        :class="{ active: activeTool === tool.id }"
                        @click="selectTool(tool.id)"
                        :title="tool.name"
                    >
                      <i :class="tool.icon"></i>
                    </button>
                  </div>
                  <div class="tool-group">
                    <input
                        type="color"
                        v-model="drawingColor"
                        class="color-picker"
                        title="Couleur"
                    >
                    <input
                        type="range"
                        v-model="brushSize"
                        min="1"
                        max="20"
                        class="brush-slider"
                        title="Taille du pinceau"
                    >
                  </div>
                  <div class="tool-group">
                    <button class="btn-tool" @click="undo" title="Annuler">
                      <i class="icon-corner-up-left"></i>
                    </button>
                    <button class="btn-tool" @click="redo" title="Rétablir">
                      <i class="icon-corner-up-right"></i>
                    </button>
                  </div>
                </div>
                <div class="whiteboard-container">
                  <canvas
                      ref="whiteboardCanvas"
                      @mousedown="startDrawing"
                      @mousemove="draw"
                      @mouseup="stopDrawing"
                      @mouseleave="stopDrawing"
                      @touchstart="startDrawing"
                      @touchmove="draw"
                      @touchend="stopDrawing"
                      class="whiteboard-canvas"
                  ></canvas>
                </div>
              </div>
            </div>

            <!-- Supports de cours -->
            <div class="panel materials-panel">
              <div class="panel-header">
                <h3>Supports de cours</h3>
              </div>
              <div class="panel-content">
                <div class="materials-list">
                  <div
                      v-for="material in courseMaterials"
                      :key="material.id"
                      class="material-item"
                  >
                    <div class="material-icon">
                      <i :class="material.icon"></i>
                    </div>
                    <div class="material-info">
                      <h4>{{ material.name }}</h4>
                      <p>{{ material.description }}</p>
                      <div class="material-meta">
                        <span class="meta-item">
                          <i class="icon-file"></i>
                          {{ material.format }}
                        </span>
                        <span class="meta-item">
                          <i class="icon-download"></i>
                          {{ material.downloads }}
                        </span>
                      </div>
                    </div>
                    <div class="material-actions">
                      <button
                          class="btn-material-action"
                          @click="previewMaterial(material)"
                          title="Aperçu"
                      >
                        <i class="icon-eye"></i>
                      </button>
                      <button
                          class="btn-material-action"
                          @click="downloadMaterial(material)"
                          title="Télécharger"
                      >
                        <i class="icon-download"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <div class="notifications">
      <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification"
          :class="notification.type"
          @click="dismissNotification(notification.id)"
      >
        <i :class="notification.icon"></i>
        <div class="notification-content">
          <h4>{{ notification.title }}</h4>
          <p>{{ notification.message }}</p>
        </div>
        <button class="btn-dismiss">
          <i class="icon-x"></i>
        </button>
      </div>
    </div>

    <!-- Modal de confirmation de sortie -->
    <BaseModal
        v-if="showLeaveModal"
        @close="showLeaveModal = false"
        title="Quitter le cours"
        danger
    >
      <div class="leave-confirmation">
        <p>Êtes-vous sûr de vouloir quitter le cours ?</p>
        <div class="confirmation-actions">
          <button class="btn-secondary" @click="showLeaveModal = false">
            Annuler
          </button>
          <button class="btn-danger" @click="confirmLeave">
            Quitter
          </button>
        </div>
      </div>
    </BaseModal>

    <!-- Modal d'enregistrement -->
    <BaseModal
        v-if="showRecordingModal"
        @close="showRecordingModal = false"
        title="Enregistrement du cours"
    >
      <div class="recording-modal">
        <div class="recording-status">
          <div class="recording-indicator">
            <i class="icon-circle"></i>
            Enregistrement en cours
          </div>
          <div class="recording-timer">{{ recordingTime }}</div>
        </div>
        <p class="recording-notice">
          Ce cours est en cours d'enregistrement. En restant connecté, vous acceptez que votre voix et votre vidéo soient enregistrées.
        </p>
        <div class="recording-actions">
          <button class="btn-secondary" @click="stopRecording">
            Arrêter l'enregistrement
          </button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseModal from '@/components/common/BaseModal.vue'

const route = useRoute()
const router = useRouter()

// Données du cours
const course = ref({
  id: route.params.courseId || 1,
  title: 'JavaScript Avancé - Formation Complète',
  instructor: 'Dr. Jean Dupont'
})

// Session en cours
const currentSession = ref({
  id: route.params.sessionId || 1,
  title: 'Les Promises et Async/Await',
  date: new Date(),
  duration: 90,
  elapsedTime: 45
})

// Utilisateur
const user = ref({
  id: 'user_001',
  name: 'Koffi Kouamé',
  role: 'student', // 'teacher' ou 'student'
  avatar: '/avatars/user1.jpg'
})

// Enseignant
const teacher = ref({
  id: 'teacher_001',
  name: 'Dr. Jean Dupont',
  avatar: '/avatars/teacher1.jpg'
})

// Participants
const participants = ref([
  {
    id: 'teacher_001',
    name: 'Dr. Jean Dupont',
    role: 'teacher',
    avatar: '/avatars/teacher1.jpg',
    isSpeaking: true,
    isMuted: false,
    isHandRaised: false,
    hasVideo: true,
    connectionQuality: 95
  },
  {
    id: 'user_001',
    name: 'Koffi Kouamé',
    role: 'student',
    avatar: '/avatars/user1.jpg',
    isSpeaking: false,
    isMuted: false,
    isHandRaised: false,
    hasVideo: true,
    connectionQuality: 85
  },
  {
    id: 'user_002',
    name: 'Marie Dubois',
    role: 'student',
    avatar: '/avatars/student1.jpg',
    isSpeaking: true,
    isMuted: false,
    isHandRaised: true,
    hasVideo: false,
    connectionQuality: 78
  },
  {
    id: 'user_003',
    name: 'Thomas Martin',
    role: 'student',
    avatar: '/avatars/student2.jpg',
    isSpeaking: false,
    isMuted: true,
    isHandRaised: false,
    hasVideo: true,
    connectionQuality: 92
  }
])

// États UI
const showChat = ref(true)
const showParticipants = ref(false)
const showWhiteboard = ref(false)
const isFullscreen = ref(false)
const showCaptions = ref(false)
const isRecording = ref(false)
const isScreenSharing = ref(false)
const isHandRaised = ref(false)
const isAudioEnabled = ref(true)
const isVideoEnabled = ref(true)
const isMuted = ref(false)

// Chat
const chatMessages = ref([
  {
    id: 1,
    type: 'system',
    text: 'Bienvenue dans le cours en direct !',
    timestamp: new Date(Date.now() - 3600000)
  },
  {
    id: 2,
    sender: 'teacher_001',
    type: 'regular',
    text: 'Bonjour à tous ! Prêts pour la session sur les Promises ?',
    timestamp: new Date(Date.now() - 3500000)
  },
  {
    id: 3,
    sender: 'user_002',
    type: 'regular',
    text: 'Bonjour ! Oui, j\'ai une question sur async/await.',
    timestamp: new Date(Date.now() - 3400000)
  },
  {
    id: 4,
    sender: 'user_001',
    type: 'regular',
    text: 'Je suis prêt également !',
    timestamp: new Date(Date.now() - 3300000)
  }
])

const chatInput = ref('')
const unreadMessages = ref(0)
const chatMessagesRef = ref(null)

// Tableau blanc
const whiteboardCanvas = ref(null)
const drawingTools = ref([
  { id: 'pencil', name: 'Crayon', icon: 'icon-edit' },
  { id: 'line', name: 'Ligne', icon: 'icon-minus' },
  { id: 'rectangle', name: 'Rectangle', icon: 'icon-square' },
  { id: 'circle', name: 'Cercle', icon: 'icon-circle' },
  { id: 'text', name: 'Texte', icon: 'icon-type' },
  { id: 'eraser', name: 'Gomme', icon: 'icon-x' }
])

const activeTool = ref('pencil')
const drawingColor = ref('#000000')
const brushSize = ref(3)
let isDrawing = false
let lastX = 0
let lastY = 0
const ctx = ref(null)

// Supports de cours
const courseMaterials = ref([
  {
    id: 1,
    name: 'Slides de présentation',
    description: 'Support visuel du cours',
    format: 'PDF',
    downloads: 45,
    icon: 'icon-file-text'
  },
  {
    id: 2,
    name: 'Exercices pratiques',
    description: 'Exercices à réaliser pendant le cours',
    format: 'ZIP',
    downloads: 32,
    icon: 'icon-file-code'
  },
  {
    id: 3,
    name: 'Références JavaScript',
    description: 'Documentation officielle',
    format: 'PDF',
    downloads: 28,
    icon: 'icon-book'
  }
])

// Notifications
const notifications = ref([])
const showLeaveModal = ref(false)
const showRecordingModal = ref(false)

// États de connexion
const isTeacherConnected = ref(true)
const networkQuality = ref(85)
const audioLevel = ref(75)
const connectionStatus = ref('good') // good, poor, disconnected
const formattedTime = ref('00:45:00')
const recordingTime = ref('00:15:30')

// Références vidéo
const teacherVideo = ref(null)
const screenVideo = ref(null)

// Calculs
const activeSpeakers = computed(() => {
  return participants.value.filter(p => p.isSpeaking && p.id !== 'teacher_001')
})

const showParticipantsVideos = computed(() => {
  return activeSpeakers.value.length > 0 && !isScreenSharing.value
})

const connectionStatusLabel = computed(() => {
  const labels = {
    good: 'Connexion excellente',
    poor: 'Connexion faible',
    disconnected: 'Déconnecté'
  }
  return labels[connectionStatus.value]
})

const layoutClass = computed(() => {
  const classes = []
  if (showChat.value) classes.push('chat-open')
  if (showParticipants.value) classes.push('participants-open')
  if (showWhiteboard.value) classes.push('whiteboard-open')
  if (isScreenSharing.value) classes.push('screen-sharing')
  return classes.join(' ')
})

// Méthodes utilitaires
const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h${mins}min` : `${mins}min`
}

const formatDate = (date) => {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatMessageTime = (timestamp) => {
  return timestamp.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getAvatar = (userId) => {
  const participant = participants.value.find(p => p.id === userId)
  return participant ? participant.avatar : '/default-avatar.png'
}

const getSenderName = (userId) => {
  const participant = participants.value.find(p => p.id === userId)
  return participant ? participant.name : 'Utilisateur inconnu'
}

const getStatusClass = (participant) => {
  if (participant.isSpeaking) return 'speaking'
  if (participant.isHandRaised) return 'hand-raised'
  return 'connected'
}

// Méthodes UI
const toggleChat = () => {
  showChat.value = !showChat.value
  if (showChat.value) {
    unreadMessages.value = 0
    scrollToBottom()
  }
}

const toggleParticipants = () => {
  showParticipants.value = !showParticipants.value
}

const toggleWhiteboard = () => {
  showWhiteboard.value = !showWhiteboard.value
  if (showWhiteboard.value) {
    initWhiteboard()
  }
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

const toggleCaptions = () => {
  showCaptions.value = !showCaptions.value
}

const toggleRecording = () => {
  if (!isRecording.value) {
    isRecording.value = true
    showRecordingModal.value = true
  } else {
    stopRecording()
  }
}

const stopRecording = () => {
  isRecording.value = false
  showRecordingModal.value = false
  addNotification('success', 'Enregistrement arrêté', 'Le cours a été enregistré avec succès.')
}

const toggleScreenShare = () => {
  isScreenSharing.value = !isScreenSharing.value
  if (isScreenSharing.value) {
    startScreenShare()
  } else {
    stopScreenShare()
  }
}

const startScreenShare = async () => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    })
    if (screenVideo.value) {
      screenVideo.value.srcObject = stream
    }
    addNotification('info', 'Partage d\'écran démarré', 'Votre écran est maintenant partagé avec les participants.')
  } catch (error) {
    console.error('Erreur de partage d\'écran:', error)
    isScreenSharing.value = false
  }
}

const stopScreenShare = () => {
  if (screenVideo.value && screenVideo.value.srcObject) {
    const tracks = screenVideo.value.srcObject.getTracks()
    tracks.forEach(track => track.stop())
    screenVideo.value.srcObject = null
  }
}

const toggleAudio = () => {
  isAudioEnabled.value = !isAudioEnabled.value
  if (isAudioEnabled.value) {
    isMuted.value = false
  }
}

const toggleVideo = () => {
  isVideoEnabled.value = !isVideoEnabled.value
}

const toggleRaiseHand = () => {
  isHandRaised.value = !isHandRaised.value
  const userParticipant = participants.value.find(p => p.id === user.value.id)
  if (userParticipant) {
    userParticipant.isHandRaised = isHandRaised.value
  }

  if (isHandRaised.value) {
    addNotification('info', 'Main levée', 'L\'enseignant a été notifié.')
  }
}

const leaveClass = () => {
  showLeaveModal.value = true
}

const confirmLeave = () => {
  showLeaveModal.value = false
  // En production, ici vous déconnecteriez les streams et notifieriez le serveur
  router.push(`/courses/${course.value.id}`)
}

// Chat
const sendMessage = () => {
  if (!chatInput.value.trim() || isMuted.value) return

  const newMessage = {
    id: Date.now(),
    sender: user.value.id,
    type: 'regular',
    text: chatInput.value,
    timestamp: new Date()
  }

  chatMessages.value.push(newMessage)
  chatInput.value = ''

  scrollToBottom()

  // Simuler une réponse de l'enseignant
  if (Math.random() > 0.5) {
    setTimeout(() => {
      const reply = {
        id: Date.now() + 1,
        sender: 'teacher_001',
        type: 'regular',
        text: 'Merci pour votre message !',
        timestamp: new Date()
      }
      chatMessages.value.push(reply)
      scrollToBottom()

      if (!showChat.value) {
        unreadMessages.value++
      }
    }, 2000)
  }
}

const clearChat = () => {
  if (confirm('Voulez-vous vraiment effacer tout l\'historique du chat ?')) {
    chatMessages.value = chatMessages.value.filter(m => m.type === 'system')
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    }
  })
}

const sendEmoji = () => {
  // Implémenter un sélecteur d'émojis
  chatInput.value += '😊 '
}

const attachFile = () => {
  // Implémenter l'upload de fichier
  const input = document.createElement('input')
  input.type = 'file'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      addNotification('info', 'Fichier joint', `${file.name} prêt à être envoyé.`)
      // Ici, vous uploaderiez le fichier et l'envoyez dans le chat
    }
  }
  input.click()
}

const replyToMessage = (message) => {
  chatInput.value = `@${getSenderName(message.sender)} `
}

const reactToMessage = (message) => {
  // Implémenter les réactions
  addNotification('info', 'Réaction', 'Vous avez réagi à un message.')
}

// Tableau blanc
const initWhiteboard = () => {
  nextTick(() => {
    if (whiteboardCanvas.value) {
      const canvas = whiteboardCanvas.value
      ctx.value = canvas.getContext('2d')

      // Ajuster la taille du canvas
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight

      // Style par défaut
      ctx.value.strokeStyle = drawingColor.value
      ctx.value.lineWidth = brushSize.value
      ctx.value.lineCap = 'round'
      ctx.value.lineJoin = 'round'
    }
  })
}

const selectTool = (toolId) => {
  activeTool.value = toolId
}

const startDrawing = (e) => {
  if (!ctx.value) return

  isDrawing = true
  const rect = whiteboardCanvas.value.getBoundingClientRect()

  if (e.type.includes('touch')) {
    lastX = e.touches[0].clientX - rect.left
    lastY = e.touches[0].clientY - rect.top
  } else {
    lastX = e.clientX - rect.left
    lastY = e.clientY - rect.top
  }
}

const draw = (e) => {
  if (!isDrawing || !ctx.value) return

  e.preventDefault()
  const rect = whiteboardCanvas.value.getBoundingClientRect()
  let x, y

  if (e.type.includes('touch')) {
    x = e.touches[0].clientX - rect.left
    y = e.touches[0].clientY - rect.top
  } else {
    x = e.clientX - rect.left
    y = e.clientY - rect.top
  }

  ctx.value.strokeStyle = drawingColor.value
  ctx.value.lineWidth = brushSize.value

  ctx.value.beginPath()
  ctx.value.moveTo(lastX, lastY)
  ctx.value.lineTo(x, y)
  ctx.value.stroke()

  lastX = x
  lastY = y
}

const stopDrawing = () => {
  isDrawing = false
}

const clearWhiteboard = () => {
  if (ctx.value && whiteboardCanvas.value) {
    ctx.value.clearRect(0, 0, whiteboardCanvas.value.width, whiteboardCanvas.value.height)
  }
}

const saveWhiteboard = () => {
  if (whiteboardCanvas.value) {
    const link = document.createElement('a')
    link.download = `tableau-blanc-${Date.now()}.png`
    link.href = whiteboardCanvas.value.toDataURL('image/png')
    link.click()
  }
}

const undo = () => {
  // Implémenter l'annulation
  addNotification('info', 'Annulation', 'Dernière action annulée.')
}

const redo = () => {
  // Implémenter le rétablissement
  addNotification('info', 'Rétablissement', 'Dernière action rétablie.')
}

// Participants
const toggleParticipantMute = (participant) => {
  participant.isMuted = !participant.isMuted
  addNotification('info',
      participant.isMuted ? 'Microphone désactivé' : 'Microphone activé',
      `${participant.name} a été ${participant.isMuted ? 'rendu muet' : 'démuté'}.`
  )
}

const removeParticipant = (participant) => {
  if (confirm(`Retirer ${participant.name} du cours ?`)) {
    participants.value = participants.value.filter(p => p.id !== participant.id)
    addNotification('warning', 'Participant retiré', `${participant.name} a été retiré du cours.`)
  }
}

const muteAll = () => {
  participants.value.forEach(p => {
    if (p.role !== 'teacher') {
      p.isMuted = true
    }
  })
  addNotification('info', 'Tous muets', 'Tous les participants ont été rendus muets.')
}

const lowerAllHands = () => {
  participants.value.forEach(p => {
    p.isHandRaised = false
  })
  isHandRaised.value = false
  addNotification('info', 'Mains baissées', 'Toutes les mains ont été baissées.')
}

// Supports de cours
const previewMaterial = (material) => {
  addNotification('info', 'Aperçu', `Ouverture de ${material.name} en cours...`)
  // Ici, vous ouvririez un modal ou une nouvelle fenêtre avec l'aperçu
}

const downloadMaterial = (material) => {
  material.downloads++
  addNotification('success', 'Téléchargement', `${material.name} a été téléchargé.`)
  // Ici, vous déclencheriez le téléchargement réel
}

const downloadMaterials = () => {
  addNotification('info', 'Téléchargement', 'Tous les supports seront téléchargés dans un fichier ZIP.')
}

const reportIssue = () => {
  router.push('/help/contact')
}

// Notifications
const addNotification = (type, title, message) => {
  const icons = {
    info: 'icon-info',
    success: 'icon-check-circle',
    warning: 'icon-alert-triangle',
    error: 'icon-x-circle'
  }

  const notification = {
    id: Date.now(),
    type,
    icon: icons[type] || 'icon-info',
    title,
    message
  }

  notifications.value.push(notification)

  // Auto-dismiss après 5 secondes
  setTimeout(() => {
    dismissNotification(notification.id)
  }, 5000)
}

const dismissNotification = (id) => {
  notifications.value = notifications.value.filter(n => n.id !== id)
}

// Simulation
const simulateActivity = () => {
  // Simuler les changements d'état
  setInterval(() => {
    // Changer les speakers
    participants.value.forEach(p => {
      if (p.role !== 'teacher') {
        p.isSpeaking = Math.random() > 0.7
        p.connectionQuality = Math.floor(Math.random() * 30) + 70
      }
    })

    // Mettre à jour les métriques
    networkQuality.value = Math.floor(Math.random() * 20) + 80
    audioLevel.value = Math.floor(Math.random() * 40) + 60

    // Mettre à jour le temps
    currentSession.value.elapsedTime++
    const hours = Math.floor(currentSession.value.elapsedTime / 60)
    const minutes = currentSession.value.elapsedTime % 60
    const seconds = Math.floor(Math.random() * 60)
    formattedTime.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

    // Mettre à jour le temps d'enregistrement
    if (isRecording.value) {
      const recSeconds = Math.floor(Math.random() * 60)
      recordingTime.value = `00:15:${recSeconds.toString().padStart(2, '0')}`
    }

    // Changer le statut de connexion
    const rand = Math.random()
    if (rand < 0.05) {
      connectionStatus.value = 'disconnected'
    } else if (rand < 0.2) {
      connectionStatus.value = 'poor'
    } else {
      connectionStatus.value = 'good'
    }
  }, 3000)
}

// Gestion des événements fullscreen
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

// Initialisation
onMounted(() => {
  // Initialiser le tableau blanc
  initWhiteboard()

  // Simuler l'activité
  simulateActivity()

  // Configurer les écouteurs d'événements
  document.addEventListener('fullscreenchange', handleFullscreenChange)

  // Simuler la connexion vidéo
  setTimeout(() => {
    // En production, vous configureriez les streams vidéo réels ici
    addNotification('success', 'Connexion établie', 'Vous êtes maintenant connecté au cours en direct.')
  }, 1000)
})

// Nettoyage
onUnmounted(() => {
  // Arrêter tous les streams
  stopScreenShare()

  // Retirer les écouteurs d'événements
  document.removeEventListener('fullscreenchange', handleFullscreenChange)

  // Notifier le serveur de la déconnexion
  console.log('User left the live class')
})
</script>

<style scoped>
.live-class-room-view {
  min-height: 100vh;
  background: #0f172a;
  color: white;
  display: flex;
  flex-direction: column;
}

.class-header {
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.container {
  max-width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.header-left {
  flex: 1;
  min-width: 0;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-item:hover {
  color: white;
}

.breadcrumb-item.active {
  color: #667eea;
}

.class-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.class-meta {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #94a3b8;
}

.meta-item i {
  font-size: 1rem;
}

.meta-item.recording {
  color: #f56565;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.btn-action:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.btn-action.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.btn-action.recording {
  color: #f56565;
  animation: pulse 2s infinite;
}

.btn-action .badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #f56565;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  min-width: 200px;
  padding: 0.5rem;
  display: none;
  z-index: 1000;
}

.dropdown:hover .dropdown-menu {
  display: block;
}

.dropdown-menu button {
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  text-align: left;
  color: #2d3748;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.dropdown-menu button:hover {
  background: #f8f9fa;
  color: #667eea;
}

.timer {
  text-align: center;
  min-width: 100px;
}

.timer-display {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.timer-label {
  font-size: 0.75rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.class-main {
  flex: 1;
  padding: 1rem 0;
}

.class-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 1rem;
  height: calc(100vh - 120px);
}

.class-layout.chat-open.participants-open {
  grid-template-columns: 1fr 800px;
}

.class-layout.whiteboard-open {
  grid-template-columns: 1fr 600px;
}

.class-layout.screen-sharing {
  grid-template-columns: 1fr;
}

.video-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.video-container {
  flex: 1;
  background: #1e293b;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.main-video {
  flex: 1;
  position: relative;
}

.video-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  background: #0f172a;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}

.placeholder-content {
  text-align: center;
}

.placeholder-content i {
  font-size: 4rem;
  color: #475569;
  margin-bottom: 1rem;
}

.placeholder-content p {
  color: #94a3b8;
  font-size: 1.1rem;
}

.video-element,
.screen-element {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #667eea;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details h3 {
  font-size: 1.25rem;
  margin: 0 0 0.25rem 0;
  color: white;
}

.user-details p {
  margin: 0;
  color: #94a3b8;
  font-size: 0.875rem;
}

.video-stats {
  display: flex;
  gap: 1rem;
}

.video-stats .stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #94a3b8;
}

.video-controls {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-control {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.25rem;
}

.btn-control:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-control.muted {
  background: #f56565;
  border-color: #f56565;
}

.btn-control.active {
  background: #667eea;
  border-color: #667eea;
}

.btn-control.danger {
  background: #f56565;
  border-color: #f56565;
}

.btn-control.danger:hover {
  background: #e53e3e;
  border-color: #e53e3e;
}

.screen-share {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: #0f172a;
}

.screen-header {
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #94a3b8;
}

.screen-wrapper {
  height: 300px;
  background: #000;
}

.participants-videos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  padding: 1rem;
  background: #1e293b;
}

.participant-video {
  aspect-ratio: 16/9;
  position: relative;
  background: #0f172a;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid transparent;
  transition: border-color 0.2s;
}

.participant-video.speaking {
  border-color: #667eea;
}

.video-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.placeholder-avatar {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-avatar img {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
}

.participant-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.5rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.participant-name {
  font-size: 0.875rem;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.participant-status {
  display: flex;
  gap: 0.25rem;
}

.participant-status i {
  font-size: 0.75rem;
  color: #94a3b8;
}

.audio-indicator {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

.audio-wave {
  width: 20px;
  height: 20px;
  background: #667eea;
  border-radius: 50%;
  animation: wave 1s infinite;
}

@keyframes wave {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.main-controls {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.controls-left,
.controls-center,
.controls-right {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-control-large {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  font-weight: 500;
}

.btn-control-large:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-control-large.muted {
  background: #f56565;
  border-color: #f56565;
}

.btn-control-large.active {
  background: #667eea;
  border-color: #667eea;
}

.btn-control-large.danger {
  background: #f56565;
  border-color: #f56565;
}

.btn-control-large.danger:hover {
  background: #e53e3e;
  border-color: #e53e3e;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
}

.connection-status.good {
  background: rgba(72, 187, 120, 0.1);
  color: #48bb78;
}

.connection-status.poor {
  background: rgba(246, 173, 85, 0.1);
  color: #f6ad55;
}

.connection-status.disconnected {
  background: rgba(245, 101, 101, 0.1);
  color: #f56565;
}

.side-panels {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.panel {
  background: #1e293b;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 0;
  opacity: 0;
  transition: all 0.3s ease;
}

.panel.active {
  max-height: 400px;
  opacity: 1;
  flex: 1;
}

.panel-header {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  font-size: 1.1rem;
  margin: 0;
  color: white;
}

.panel-actions {
  display: flex;
  gap: 0.25rem;
}

.btn-panel-action {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-panel-action:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.panel-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Chat Panel */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chat-message {
  display: flex;
  gap: 0.75rem;
}

.chat-message.system {
  justify-content: center;
}

.chat-message.system .message-content {
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  color: #667eea;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  text-align: center;
  font-size: 0.875rem;
}

.chat-message.teacher {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chat-message.teacher .message-avatar {
  order: 1;
}

.chat-message.own .message-avatar {
  border: 2px solid #667eea;
}

.message-content {
  max-width: 80%;
}

.chat-message.teacher .message-content {
  align-items: flex-end;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
  font-size: 0.75rem;
}

.sender-name {
  font-weight: 600;
  color: white;
}

.message-time {
  color: #94a3b8;
}

.message-body {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 0.75rem;
  position: relative;
}

.chat-message.teacher .message-body {
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.chat-message.own .message-body {
  background: rgba(72, 187, 120, 0.1);
  border: 1px solid rgba(72, 187, 120, 0.2);
}

.message-body p {
  margin: 0;
  color: white;
  font-size: 0.875rem;
  line-height: 1.5;
}

.message-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn-message-action {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.75rem;
}

.btn-message-action:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.chat-input {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.chat-input-field {
  flex: 1;
  padding: 0.75rem 1rem 0.75rem 3rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 0.875rem;
}

.chat-input-field::placeholder {
  color: #94a3b8;
}

.chat-input-field:focus {
  outline: none;
  border-color: #667eea;
}

.chat-input-field:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-wrapper i:first-child {
  position: absolute;
  left: 1rem;
  color: #94a3b8;
}

.input-actions {
  position: absolute;
  right: 0.5rem;
  display: flex;
  gap: 0.25rem;
}

.btn-input-action {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-input-action:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.btn-input-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chat-notice {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(245, 101, 101, 0.1);
  border: 1px solid rgba(245, 101, 101, 0.2);
  border-radius: 6px;
  font-size: 0.75rem;
  color: #f56565;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Participants Panel */
.participants-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.participant-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.participant-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.participant-item.teacher {
  border-color: rgba(102, 126, 234, 0.3);
  background: rgba(102, 126, 234, 0.1);
}

.participant-item.speaking {
  border-color: rgba(102, 126, 234, 0.5);
}

.participant-item.hand-raised {
  border-color: rgba(246, 173, 85, 0.5);
}

.participant-avatar {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.participant-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.participant-status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #1e293b;
}

.participant-status-indicator.connected {
  background: #48bb78;
}

.participant-status-indicator.speaking {
  background: #667eea;
}

.participant-status-indicator.hand-raised {
  background: #f6ad55;
}

.participant-info {
  flex: 1;
  min-width: 0;
}

.participant-name {
  font-weight: 600;
  color: white;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.participant-role {
  font-size: 0.75rem;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.participant-status {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
}

.hand-raised,
.speaking {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.hand-raised {
  color: #f6ad55;
}

.speaking {
  color: #667eea;
}

.participant-actions {
  display: flex;
  gap: 0.25rem;
}

.btn-participant-action {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.btn-participant-action:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.participants-actions {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 0.5rem;
}

.participants-actions .btn-action {
  flex: 1;
  padding: 0.75rem;
  justify-content: center;
  font-size: 0.875rem;
}

/* Whiteboard Panel */
.whiteboard-tools {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.tool-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-tool {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.25rem;
}

.btn-tool:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.btn-tool.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.color-picker {
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
}

.brush-slider {
  width: 100px;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
  -webkit-appearance: none;
}

.brush-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
}

.whiteboard-container {
  flex: 1;
  padding: 1rem;
  background: #0f172a;
}

.whiteboard-canvas {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 8px;
  cursor: crosshair;
  touch-action: none;
}

/* Materials Panel */
.materials-panel {
  max-height: 300px !important;
  opacity: 1 !important;
}

.materials-panel.active {
  flex: 0;
}

.materials-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.material-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s;
}

.material-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(102, 126, 234, 0.3);
}

.material-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.material-info {
  flex: 1;
  min-width: 0;
}

.material-info h4 {
  font-size: 1rem;
  color: white;
  margin: 0 0 0.25rem 0;
}

.material-info p {
  font-size: 0.875rem;
  color: #94a3b8;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.material-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #94a3b8;
}

.material-actions {
  display: flex;
  gap: 0.25rem;
}

.btn-material-action {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.btn-material-action:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

/* Notifications */
.notifications {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 1000;
  max-width: 400px;
}

.notification {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  cursor: pointer;
  transform: translateX(100%);
  animation: slideIn 0.3s ease forwards;
}

@keyframes slideIn {
  to {
    transform: translateX(0);
  }
}

.notification.info {
  border-left: 4px solid #4299e1;
}

.notification.success {
  border-left: 4px solid #48bb78;
}

.notification.warning {
  border-left: 4px solid #ed8936;
}

.notification.error {
  border-left: 4px solid #f56565;
}

.notification i:first-child {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.notification.info i:first-child {
  color: #4299e1;
}

.notification.success i:first-child {
  color: #48bb78;
}

.notification.warning i:first-child {
  color: #ed8936;
}

.notification.error i:first-child {
  color: #f56565;
}

.notification-content {
  flex: 1;
}

.notification-content h4 {
  font-size: 1rem;
  color: #2d3748;
  margin: 0 0 0.25rem 0;
}

.notification-content p {
  font-size: 0.875rem;
  color: #718096;
  margin: 0;
  line-height: 1.4;
}

.btn-dismiss {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.btn-dismiss:hover {
  color: #2d3748;
}

/* Modals */
.leave-confirmation {
  padding: 1rem;
}

.leave-confirmation p {
  margin: 0 0 1.5rem 0;
  color: #2d3748;
  text-align: center;
}

.confirmation-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-secondary,
.btn-danger {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #e9ecef;
}

.btn-secondary:hover {
  background: #e9ecef;
}

.btn-danger {
  background: #f56565;
  color: white;
}

.btn-danger:hover {
  background: #e53e3e;
}

.recording-modal {
  padding: 1rem;
}

.recording-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(245, 101, 101, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(245, 101, 101, 0.2);
}

.recording-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #f56565;
  font-weight: 600;
}

.recording-indicator i {
  animation: pulse 2s infinite;
}

.recording-timer {
  font-family: monospace;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}

.recording-notice {
  color: #718096;
  margin: 0 0 1.5rem 0;
  text-align: center;
  font-size: 0.95rem;
  line-height: 1.5;
}

.recording-actions {
  text-align: center;
}

/* Responsive */
@media (max-width: 1200px) {
  .class-layout {
    grid-template-columns: 1fr;
    height: auto;
  }

  .side-panels {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .header-right {
    justify-content: space-between;
  }

  .class-meta {
    justify-content: center;
  }

  .main-controls {
    flex-direction: column;
    gap: 1rem;
  }

  .controls-left,
  .controls-center,
  .controls-right {
    width: 100%;
    justify-content: center;
  }

  .btn-control-large {
    flex: 1;
    justify-content: center;
  }

  .side-panels {
    grid-template-columns: 1fr;
  }
}
</style>