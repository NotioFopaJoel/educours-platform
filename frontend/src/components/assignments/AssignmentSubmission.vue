<template>
  <div class="assignment-submission">
    <div class="assignment-header">
      <h3>{{ assignment.title }}</h3>
      <p class="due-date">À rendre avant le {{ formatDate(assignment.dueDate) }}</p>
    </div>

    <div class="assignment-description">
      <h4>Description</h4>
      <p>{{ assignment.description }}</p>
    </div>

    <div class="submission-form">
      <div class="form-group">
        <label>Fichier à déposer</label>
        <div class="file-upload" @click="triggerFileInput">
          <input type="file" ref="fileInput" @change="handleFileChange" style="display: none">
          <div class="upload-area" :class="{ 'has-file': fileName }">
            <i class="fas fa-cloud-upload-alt"></i>
            <span v-if="!fileName">Cliquez ou glissez votre fichier ici</span>
            <span v-else>{{ fileName }}</span>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>Commentaire (optionnel)</label>
        <textarea v-model="comment" rows="4" placeholder="Ajoutez un commentaire à votre soumission..."></textarea>
      </div>

      <div class="form-actions">
        <button class="btn-cancel" @click="$emit('cancel')">Annuler</button>
        <button class="btn-submit" @click="submitAssignment" :disabled="!file">
          <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
          {{ isSubmitting ? 'Soumission...' : 'Soumettre' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  assignment: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['submitted', 'cancel'])

const file = ref(null)
const fileName = ref('')
const comment = ref('')
const isSubmitting = ref(false)

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const triggerFileInput = () => {
  const fileInput = document.querySelector('input[type="file"]')
  fileInput?.click()
}

const handleFileChange = (event) => {
  file.value = event.target.files[0]
  fileName.value = file.value?.name || ''
}

const submitAssignment = async () => {
  if (!file.value) return
  
  isSubmitting.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    emit('submitted', {
      assignmentId: props.assignment._id,
      file: file.value,
      comment: comment.value
    })
  } catch (error) {
    console.error('Submission error:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.assignment-submission {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.assignment-header h3 {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
}

.due-date {
  color: #ef4444;
  font-size: 0.875rem;
}

.assignment-description {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

.assignment-description h4 {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.assignment-description p {
  color: #4b5563;
  font-size: 0.875rem;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
}

.upload-area {
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-area:hover {
  border-color: #4f46e5;
  background: #f5f3ff;
}

.upload-area.has-file {
  border-color: #10b981;
  background: #f0fdf4;
}

.upload-area i {
  font-size: 2rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
  display: block;
}

.upload-area span {
  color: #6b7280;
  font-size: 0.875rem;
}

textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-family: inherit;
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
}

.btn-submit {
  padding: 0.5rem 1.5rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>