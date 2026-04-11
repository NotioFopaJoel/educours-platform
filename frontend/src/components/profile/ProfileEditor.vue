<template>
  <div class="profile-editor">
    <div class="profile-avatar-section">
      <div class="avatar-container">
        <div class="avatar-preview">
          <span class="avatar-text">{{ userInitials }}</span>
        </div>
        <button class="change-avatar-btn">
          <i class="fas fa-camera"></i>
          Changer la photo
        </button>
      </div>
    </div>

    <form @submit.prevent="saveProfile" class="profile-form">
      <div class="form-row">
        <div class="form-group">
          <label>Prénom</label>
          <input type="text" v-model="formData.firstName" required>
        </div>
        <div class="form-group">
          <label>Nom</label>
          <input type="text" v-model="formData.lastName" required>
        </div>
      </div>

      <div class="form-group">
        <label>Email</label>
        <input type="email" v-model="formData.email" required>
      </div>

      <div class="form-group">
        <label>Téléphone</label>
        <input type="tel" v-model="formData.phone">
      </div>

      <div class="form-group">
        <label>Bio</label>
        <textarea v-model="formData.bio" rows="4" placeholder="Parlez-nous de vous..."></textarea>
      </div>

      <div class="form-actions">
        <button type="button" class="btn-cancel" @click="$emit('cancel')">Annuler</button>
        <button type="submit" class="btn-save" :disabled="isSaving">
          <i v-if="isSaving" class="fas fa-spinner fa-spin"></i>
          {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['updated', 'cancel'])

const isSaving = ref(false)

const formData = ref({
  firstName: props.user.firstName || '',
  lastName: props.user.lastName || '',
  email: props.user.email || '',
  phone: props.user.phone || '',
  bio: props.user.bio || ''
})

const userInitials = computed(() => {
  const first = formData.value.firstName?.charAt(0) || ''
  const last = formData.value.lastName?.charAt(0) || ''
  return (first + last).toUpperCase() || 'U'
})

const saveProfile = async () => {
  isSaving.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    emit('updated', {
      ...formData.value,
      id: props.user.id
    })
  } catch (error) {
    console.error('Save error:', error)
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.profile-editor {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-avatar-section {
  display: flex;
  justify-content: center;
}

.avatar-container {
  text-align: center;
}

.avatar-preview {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.avatar-text {
  font-size: 3rem;
  font-weight: 600;
  color: white;
}

.change-avatar-btn {
  background: none;
  border: none;
  color: #4f46e5;
  cursor: pointer;
  font-size: 0.875rem;
}

.change-avatar-btn i {
  margin-right: 0.25rem;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  font-size: 0.875rem;
  color: #374151;
}

.form-group input,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
}

.btn-save {
  padding: 0.75rem 1.5rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>