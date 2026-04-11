<template>
  <div class="course-interface">
    <div class="course-sidebar">
      <div class="course-progress">
        <div class="progress-circle">
          <svg viewBox="0 0 36 36">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" stroke-width="3"/>
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#4f46e5" stroke-width="3" :stroke-dasharray="`${courseProgress}, 100`"/>
            <text x="18" y="20.5" text-anchor="middle" fill="#1f2937" font-size="6" font-weight="bold">{{ courseProgress }}%</text>
          </svg>
        </div>
        <span>Progression</span>
      </div>
      
      <div class="course-modules">
        <h4>Modules</h4>
        <div class="modules-list">
          <div 
            v-for="(module, index) in modules" 
            :key="index"
            class="module-item"
            :class="{ active: currentModule === index, completed: module.completed }"
            @click="currentModule = index"
          >
            <div class="module-status">
              <i v-if="module.completed" class="fas fa-check-circle"></i>
              <span v-else class="module-number">{{ index + 1 }}</span>
            </div>
            <div class="module-info">
              <h5>{{ module.title }}</h5>
              <span class="module-duration">{{ module.duration }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="course-content">
      <div class="video-container">
        <div class="video-placeholder">
          <i class="fas fa-play-circle"></i>
          <p>{{ currentModuleContent?.title || 'Sélectionnez un module' }}</p>
        </div>
      </div>
      
      <div class="module-content">
        <h3>{{ currentModuleContent?.title }}</h3>
        <p>{{ currentModuleContent?.description }}</p>
        
        <div class="module-actions">
          <button class="btn-prev" :disabled="currentModule === 0" @click="currentModule--">
            <i class="fas fa-arrow-left"></i> Précédent
          </button>
          <button class="btn-next" @click="markCurrentComplete">
            {{ isLastModule ? 'Terminer' : 'Suivant' }}
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  course: {
    type: Object,
    required: true
  },
  user: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

const currentModule = ref(0)
const courseProgress = ref(0)

const modules = ref([
  {
    title: 'Introduction',
    duration: '15 min',
    description: 'Bienvenue dans ce cours. Découvrez ce que vous allez apprendre.',
    completed: false
  },
  {
    title: 'Les bases',
    duration: '45 min',
    description: 'Apprenez les concepts fondamentaux.',
    completed: false
  },
  {
    title: 'Mise en pratique',
    duration: '60 min',
    description: 'Appliquez vos connaissances avec des exercices.',
    completed: false
  },
  {
    title: 'Projet final',
    duration: '120 min',
    description: 'Réalisez un projet complet pour valider vos acquis.',
    completed: false
  }
])

const currentModuleContent = computed(() => modules.value[currentModule.value])

const isLastModule = computed(() => currentModule.value === modules.value.length - 1)

const markCurrentComplete = () => {
  if (!modules.value[currentModule.value].completed) {
    modules.value[currentModule.value].completed = true
    const completedCount = modules.value.filter(m => m.completed).length
    courseProgress.value = Math.round((completedCount / modules.value.length) * 100)
  }
  
  if (!isLastModule.value) {
    currentModule.value++
  } else {
    emit('close')
  }
}
</script>

<style scoped>
.course-interface {
  display: flex;
  gap: 1.5rem;
  min-height: 500px;
}

.course-sidebar {
  width: 280px;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1rem;
}

.course-progress {
  text-align: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1rem;
}

.progress-circle {
  width: 80px;
  height: 80px;
  margin: 0 auto 0.5rem;
}

.course-modules h4 {
  margin-bottom: 1rem;
  font-size: 1rem;
}

.modules-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.module-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.module-item:hover {
  background: #e5e7eb;
}

.module-item.active {
  background: #f5f3ff;
  border-left: 3px solid #4f46e5;
}

.module-item.completed .module-status {
  color: #10b981;
}

.module-status {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.module-number {
  width: 24px;
  height: 24px;
  background: #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.module-info h5 {
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.module-duration {
  font-size: 0.75rem;
  color: #6b7280;
}

.course-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.video-container {
  background: #1f2937;
  border-radius: 12px;
  aspect-ratio: 16 / 9;
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

.module-content {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.module-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn-prev, .btn-next {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-prev {
  background: white;
  border: 1px solid #e5e7eb;
}

.btn-next {
  background: #4f46e5;
  color: white;
  border: none;
}

.btn-prev:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>