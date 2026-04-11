<template>
  <div class="quiz-interface">
    <div class="quiz-header">
      <h3>{{ quiz.title || 'Quiz du cours' }}</h3>
      <div class="quiz-progress">Question {{ currentIndex + 1 }}/{{ questions.length }}</div>
    </div>

    <div class="quiz-question">
      <h4>{{ currentQuestion.text }}</h4>
      
      <div class="quiz-options">
        <div 
          v-for="(option, idx) in currentQuestion.options" 
          :key="idx"
          class="quiz-option"
          :class="{ selected: selectedOption === idx, correct: showResult && idx === currentQuestion.correct, wrong: showResult && selectedOption === idx && idx !== currentQuestion.correct }"
          @click="!showResult && selectOption(idx)"
        >
          <span class="option-letter">{{ String.fromCharCode(65 + idx) }}</span>
          <span class="option-text">{{ option }}</span>
          <i v-if="showResult && idx === currentQuestion.correct" class="fas fa-check-circle"></i>
          <i v-if="showResult && selectedOption === idx && idx !== currentQuestion.correct" class="fas fa-times-circle"></i>
        </div>
      </div>
    </div>

    <div class="quiz-actions">
      <button class="btn-prev" :disabled="currentIndex === 0" @click="previousQuestion">
        <i class="fas fa-arrow-left"></i> Précédent
      </button>
      
      <button v-if="!showResult" class="btn-next" :disabled="selectedOption === null" @click="nextOrCheck">
        {{ isLastQuestion ? 'Valider' : 'Suivant' }}
        <i class="fas fa-arrow-right"></i>
      </button>
      
      <button v-else class="btn-next" @click="nextQuestion">
        Suivant <i class="fas fa-arrow-right"></i>
      </button>
    </div>

    <div class="quiz-results" v-if="quizCompleted">
      <h4>Résultats du quiz</h4>
      <div class="score">Score : {{ score }}/{{ questions.length }}</div>
      <div class="percentage">{{ percentage }}%</div>
      <button class="btn-finish" @click="finishQuiz">Terminer</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  quiz: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['completed', 'cancel'])

const questions = ref([
  {
    text: 'Qu\'est-ce que Vue.js ?',
    options: ['Un framework backend', 'Un framework JavaScript progressif', 'Une base de données', 'Un langage de programmation'],
    correct: 1
  },
  {
    text: 'Quel est l\'avantage principal des composants Vue ?',
    options: ['La réutilisabilité', 'La vitesse d\'exécution', 'La sécurité', 'La taille du fichier'],
    correct: 0
  },
  {
    text: 'Que signifie "réactivité" dans Vue.js ?',
    options: ['Les données se mettent à jour automatiquement', 'Le site est plus rapide', 'Le code est plus sécurisé', 'Les composants sont plus petits'],
    correct: 0
  }
])

const currentIndex = ref(0)
const selectedOption = ref(null)
const showResult = ref(false)
const userAnswers = ref([])
const quizCompleted = ref(false)

const currentQuestion = computed(() => questions.value[currentIndex.value])
const isLastQuestion = computed(() => currentIndex.value === questions.value.length - 1)
const score = computed(() => userAnswers.value.filter(a => a.isCorrect).length)
const percentage = computed(() => Math.round((score.value / questions.value.length) * 100))

const selectOption = (index) => {
  selectedOption.value = index
}

const nextOrCheck = () => {
  if (isLastQuestion.value) {
    checkAnswer()
  } else {
    saveAndNext()
  }
}

const checkAnswer = () => {
  const isCorrect = selectedOption.value === currentQuestion.value.correct
  userAnswers.value.push({
    questionIndex: currentIndex.value,
    selected: selectedOption.value,
    isCorrect
  })
  showResult.value = true
}

const saveAndNext = () => {
  const isCorrect = selectedOption.value === currentQuestion.value.correct
  userAnswers.value.push({
    questionIndex: currentIndex.value,
    selected: selectedOption.value,
    isCorrect
  })
  
  currentIndex.value++
  selectedOption.value = null
}

const nextQuestion = () => {
  if (isLastQuestion.value) {
    quizCompleted.value = true
  } else {
    currentIndex.value++
    selectedOption.value = null
    showResult.value = false
  }
}

const previousQuestion = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    const savedAnswer = userAnswers.value.find(a => a.questionIndex === currentIndex.value)
    if (savedAnswer) {
      selectedOption.value = savedAnswer.selected
      showResult.value = true
    } else {
      selectedOption.value = null
      showResult.value = false
    }
  }
}

const finishQuiz = () => {
  emit('completed', {
    score: score.value,
    total: questions.value.length,
    percentage: percentage.value
  })
}
</script>

<style scoped>
.quiz-interface {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
}

.quiz-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.quiz-progress {
  color: #6b7280;
  font-size: 0.875rem;
}

.quiz-question h4 {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.quiz-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.quiz-option:hover {
  border-color: #4f46e5;
  background: #f5f3ff;
}

.quiz-option.selected {
  border-color: #4f46e5;
  background: #f5f3ff;
}

.quiz-option.correct {
  border-color: #10b981;
  background: #f0fdf4;
}

.quiz-option.wrong {
  border-color: #ef4444;
  background: #fef2f2;
}

.option-letter {
  width: 32px;
  height: 32px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.quiz-option.selected .option-letter {
  background: #4f46e5;
  color: white;
}

.quiz-option.correct .option-letter {
  background: #10b981;
  color: white;
}

.quiz-option.wrong .option-letter {
  background: #ef4444;
  color: white;
}

.option-text {
  flex: 1;
}

.quiz-actions {
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

.quiz-results {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.score {
  font-size: 1.5rem;
  font-weight: 700;
  color: #4f46e5;
}

.btn-finish {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>