<template>
  <div class="settings-panel">
    <div class="settings-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <i :class="tab.icon"></i>
        {{ tab.name }}
      </button>
    </div>

    <div class="settings-content">
      <!-- Profil -->
      <div v-show="activeTab === 'profile'" class="settings-section">
        <h4>Informations personnelles</h4>
        <div class="form-group">
          <label>Langue</label>
          <select v-model="settings.language">
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </div>
        <div class="form-group">
          <label>Fuseau horaire</label>
          <select v-model="settings.timezone">
            <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
            <option value="Africa/Douala">Africa/Douala (UTC+1)</option>
          </select>
        </div>
      </div>

      <!-- Notifications -->
      <div v-show="activeTab === 'notifications'" class="settings-section">
        <h4>Préférences de notifications</h4>
        <div class="setting-item">
          <label class="switch-label">
            <span>Notifications par email</span>
            <div class="switch">
              <input type="checkbox" v-model="settings.emailNotifications">
              <span class="slider"></span>
            </div>
          </label>
        </div>
        <div class="setting-item">
          <label class="switch-label">
            <span>Notifications push</span>
            <div class="switch">
              <input type="checkbox" v-model="settings.pushNotifications">
              <span class="slider"></span>
            </div>
          </label>
        </div>
        <div class="setting-item">
          <label class="switch-label">
            <span>Rappels de cours</span>
            <div class="switch">
              <input type="checkbox" v-model="settings.classReminders">
              <span class="slider"></span>
            </div>
          </label>
        </div>
      </div>

      <!-- Sécurité -->
      <div v-show="activeTab === 'security'" class="settings-section">
        <h4>Sécurité</h4>
        <div class="form-group">
          <label>Ancien mot de passe</label>
          <input type="password" v-model="passwordData.oldPassword">
        </div>
        <div class="form-group">
          <label>Nouveau mot de passe</label>
          <input type="password" v-model="passwordData.newPassword">
        </div>
        <div class="form-group">
          <label>Confirmer le mot de passe</label>
          <input type="password" v-model="passwordData.confirmPassword">
        </div>
        <button class="btn-change-password" @click="changePassword">Changer le mot de passe</button>
      </div>

      <!-- Confidentialité -->
      <div v-show="activeTab === 'privacy'" class="settings-section">
        <h4>Confidentialité</h4>
        <div class="setting-item">
          <label class="switch-label">
            <span>Profil public</span>
            <div class="switch">
              <input type="checkbox" v-model="settings.publicProfile">
              <span class="slider"></span>
            </div>
          </label>
        </div>
        <div class="setting-item">
          <label class="switch-label">
            <span>Afficher mon email</span>
            <div class="switch">
              <input type="checkbox" v-model="settings.showEmail">
              <span class="slider"></span>
            </div>
          </label>
        </div>
      </div>
    </div>

    <div class="settings-footer">
      <button class="btn-cancel" @click="$emit('cancel')">Annuler</button>
      <button class="btn-save" @click="saveSettings" :disabled="isSaving">
        {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['saved', 'cancel'])

const isSaving = ref(false)
const activeTab = ref('profile')

const tabs = [
  { id: 'profile', name: 'Profil', icon: 'fas fa-user' },
  { id: 'notifications', name: 'Notifications', icon: 'fas fa-bell' },
  { id: 'security', name: 'Sécurité', icon: 'fas fa-shield-alt' },
  { id: 'privacy', name: 'Confidentialité', icon: 'fas fa-lock' }
]

const settings = ref({
  language: 'fr',
  timezone: 'Europe/Paris',
  emailNotifications: true,
  pushNotifications: true,
  classReminders: true,
  publicProfile: true,
  showEmail: false
})

const passwordData = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const changePassword = () => {
  if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
    alert('Les mots de passe ne correspondent pas')
    return
  }
  alert('Mot de passe changé avec succès')
  passwordData.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
}

const saveSettings = async () => {
  isSaving.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    emit('saved', settings.value)
  } catch (error) {
    console.error('Save error:', error)
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.settings-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.settings-tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s;
}

.tab-btn i {
  margin-right: 0.5rem;
}

.tab-btn.active {
  color: #4f46e5;
  border-bottom: 2px solid #4f46e5;
}

.settings-content {
  min-height: 300px;
}

.settings-section h4 {
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
}

.form-group select,
.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.setting-item {
  padding: 1rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.switch-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #4f46e5;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.btn-change-password {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.settings-footer {
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
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>