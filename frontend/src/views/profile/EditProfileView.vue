<template>
  <BaseLayout>
    <template #header>
      <div class="profile-header">
        <div class="header-content">
          <h1>Modifier mon profil</h1>
          <p>Mettez à jour vos informations personnelles</p>
        </div>
        <div class="header-actions">
          <router-link to="/profile" class="btn-secondary">
            <i class="icon-arrow-left"></i>
            Retour au profil
          </router-link>
        </div>
      </div>
    </template>

    <div class="edit-profile-view">
      <div class="container">
        <div class="profile-content">
          <!-- Colonne gauche : Formulaire -->
          <div class="profile-form-section">
            <div class="form-card">
              <!-- Photo de profil -->
              <div class="avatar-section">
                <div class="avatar-preview">
                  <img
                      :src="userAvatar || '/default-avatar.png'"
                      :alt="userData.fullName"
                      class="avatar-image"
                  >
                  <div class="avatar-overlay" @click="openAvatarUpload">
                    <i class="icon-camera"></i>
                    <span>Changer la photo</span>
                  </div>
                </div>
                <div class="avatar-info">
                  <h3>Photo de profil</h3>
                  <p>JPEG, PNG ou GIF • Max 5MB</p>
                  <button
                      class="btn-remove-avatar"
                      @click="removeAvatar"
                      v-if="userAvatar"
                  >
                    <i class="icon-trash"></i>
                    Supprimer
                  </button>
                </div>
              </div>

              <!-- Informations personnelles -->
              <div class="section-card">
                <div class="section-header">
                  <h2>Informations personnelles</h2>
                  <div class="section-actions">
                    <button
                        v-if="!isEditing"
                        class="btn-edit"
                        @click="startEditing"
                    >
                      <i class="icon-edit"></i>
                      Modifier
                    </button>
                    <div v-else class="edit-actions">
                      <button class="btn-cancel" @click="cancelEditing">
                        Annuler
                      </button>
                      <button class="btn-save" @click="saveProfile">
                        <i class="icon-save"></i>
                        Enregistrer
                      </button>
                    </div>
                  </div>
                </div>

                <div class="form-grid">
                  <div class="form-group">
                    <label>Nom complet *</label>
                    <input
                        type="text"
                        v-model="formData.fullName"
                        :disabled="!isEditing"
                        :class="{ 'form-input': true, 'disabled': !isEditing }"
                        placeholder="Jean Dupont"
                    >
                    <span v-if="errors.fullName" class="error-message">
                      {{ errors.fullName }}
                    </span>
                  </div>

                  <div class="form-group">
                    <label>Email *</label>
                    <input
                        type="email"
                        v-model="formData.email"
                        :disabled="!isEditing"
                        :class="{ 'form-input': true, 'disabled': !isEditing }"
                        placeholder="jean@exemple.com"
                    >
                    <span v-if="errors.email" class="error-message">
                      {{ errors.email }}
                    </span>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label>Téléphone</label>
                      <input
                          type="tel"
                          v-model="formData.phone"
                          :disabled="!isEditing"
                          :class="{ 'form-input': true, 'disabled': !isEditing }"
                          placeholder="+33 6 12 34 56 78"
                      >
                      <span v-if="errors.phone" class="error-message">
                        {{ errors.phone }}
                      </span>
                    </div>
                    <div class="form-group">
                      <label>Date de naissance</label>
                      <input
                          type="date"
                          v-model="formData.birthDate"
                          :disabled="!isEditing"
                          :class="{ 'form-input': true, 'disabled': !isEditing }"
                      >
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Bio</label>
                    <textarea
                        v-model="formData.bio"
                        :disabled="!isEditing"
                        :class="{ 'form-textarea': true, 'disabled': !isEditing }"
                        placeholder="Parlez-nous un peu de vous..."
                        rows="4"
                    ></textarea>
                    <div class="char-counter">
                      {{ formData.bio?.length || 0 }}/500 caractères
                    </div>
                  </div>
                </div>
              </div>

              <!-- Adresse -->
              <div class="section-card">
                <div class="section-header">
                  <h2>Adresse</h2>
                </div>

                <div class="form-grid">
                  <div class="form-group">
                    <label>Adresse</label>
                    <input
                        type="text"
                        v-model="formData.address"
                        :disabled="!isEditing"
                        :class="{ 'form-input': true, 'disabled': !isEditing }"
                        placeholder="123 Rue de l'Exemple"
                    >
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label>Ville</label>
                      <input
                          type="text"
                          v-model="formData.city"
                          :disabled="!isEditing"
                          :class="{ 'form-input': true, 'disabled': !isEditing }"
                          placeholder="Paris"
                      >
                    </div>
                    <div class="form-group">
                      <label>Code postal</label>
                      <input
                          type="text"
                          v-model="formData.postalCode"
                          :disabled="!isEditing"
                          :class="{ 'form-input': true, 'disabled': !isEditing }"
                          placeholder="75001"
                      >
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Pays</label>
                    <select
                        v-model="formData.country"
                        :disabled="!isEditing"
                        :class="{ 'form-select': true, 'disabled': !isEditing }"
                    >
                      <option value="">Sélectionnez un pays</option>
                      <option value="FR">France</option>
                      <option value="BE">Belgique</option>
                      <option value="CH">Suisse</option>
                      <option value="CA">Canada</option>
                      <option value="SN">Sénégal</option>
                      <option value="CI">Côte d'Ivoire</option>
                      <option value="MA">Maroc</option>
                      <option value="TN">Tunisie</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Formation et profession -->
              <div class="section-card">
                <div class="section-header">
                  <h2>Formation et profession</h2>
                </div>

                <div class="form-grid">
                  <div class="form-group">
                    <label>Niveau d'études</label>
                    <select
                        v-model="formData.educationLevel"
                        :disabled="!isEditing"
                        :class="{ 'form-select': true, 'disabled': !isEditing }"
                    >
                      <option value="">Sélectionnez</option>
                      <option value="bac">Baccalauréat</option>
                      <option value="bac+2">Bac+2</option>
                      <option value="bac+3">Bac+3 (Licence)</option>
                      <option value="bac+5">Bac+5 (Master)</option>
                      <option value="doctorat">Doctorat</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label>Profession</label>
                    <input
                        type="text"
                        v-model="formData.profession"
                        :disabled="!isEditing"
                        :class="{ 'form-input': true, 'disabled': !isEditing }"
                        placeholder="Développeur Web"
                    >
                  </div>

                  <div class="form-group">
                    <label>Entreprise</label>
                    <input
                        type="text"
                        v-model="formData.company"
                        :disabled="!isEditing"
                        :class="{ 'form-input': true, 'disabled': !isEditing }"
                        placeholder="Nom de votre entreprise"
                    >
                  </div>

                  <div class="form-group">
                    <label>Site web</label>
                    <input
                        type="url"
                        v-model="formData.website"
                        :disabled="!isEditing"
                        :class="{ 'form-input': true, 'disabled': !isEditing }"
                        placeholder="https://votre-site.com"
                    >
                  </div>
                </div>
              </div>

              <!-- Réseaux sociaux -->
              <div class="section-card">
                <div class="section-header">
                  <h2>Réseaux sociaux</h2>
                </div>

                <div class="social-links">
                  <div class="social-input">
                    <div class="social-icon">
                      <i class="icon-linkedin"></i>
                    </div>
                    <input
                        type="text"
                        v-model="formData.linkedin"
                        :disabled="!isEditing"
                        :class="{ 'form-input': true, 'disabled': !isEditing }"
                        placeholder="https://linkedin.com/in/votre-profil"
                    >
                  </div>

                  <div class="social-input">
                    <div class="social-icon">
                      <i class="icon-twitter"></i>
                    </div>
                    <input
                        type="text"
                        v-model="formData.twitter"
                        :disabled="!isEditing"
                        :class="{ 'form-input': true, 'disabled': !isEditing }"
                        placeholder="https://twitter.com/votre-compte"
                    >
                  </div>

                  <div class="social-input">
                    <div class="social-icon">
                      <i class="icon-github"></i>
                    </div>
                    <input
                        type="text"
                        v-model="formData.github"
                        :disabled="!isEditing"
                        :class="{ 'form-input': true, 'disabled': !isEditing }"
                        placeholder="https://github.com/votre-compte"
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Colonne droite : Aperçu -->
          <div class="profile-preview-section">
            <div class="preview-card">
              <div class="preview-header">
                <h3>Aperçu du profil</h3>
                <p>Comment apparaîtra votre profil public</p>
              </div>

              <div class="preview-content">
                <!-- Avatar preview -->
                <div class="preview-avatar">
                  <img
                      :src="userAvatar || '/default-avatar.png'"
                      :alt="formData.fullName"
                      class="preview-avatar-img"
                  >
                  <div class="preview-avatar-badge">
                    <i class="icon-check"></i>
                  </div>
                </div>

                <!-- Info preview -->
                <div class="preview-info">
                  <h4 class="preview-name">{{ formData.fullName || 'Nom complet' }}</h4>
                  <p class="preview-profession">{{ formData.profession || 'Profession' }}</p>
                  <p class="preview-company">{{ formData.company || 'Entreprise' }}</p>

                  <div class="preview-location">
                    <i class="icon-map-pin"></i>
                    <span v-if="formData.city">
                      {{ formData.city }}, {{ formData.country }}
                    </span>
                    <span v-else>Localisation non spécifiée</span>
                  </div>

                  <div class="preview-bio" v-if="formData.bio">
                    <p>{{ formData.bio }}</p>
                  </div>
                </div>

                <!-- Stats preview -->
                <div class="preview-stats">
                  <div class="stat-item">
                    <div class="stat-value">{{ enrolledCourses }}</div>
                    <div class="stat-label">Cours suivis</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ completedCourses }}</div>
                    <div class="stat-label">Cours terminés</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ avgGrade }}%</div>
                    <div class="stat-label">Moyenne</div>
                  </div>
                </div>

                <!-- Social preview -->
                <div class="preview-social" v-if="hasSocialLinks">
                  <h5>Réseaux sociaux</h5>
                  <div class="social-icons">
                    <a
                        v-if="formData.linkedin"
                        :href="formData.linkedin"
                        target="_blank"
                        class="social-icon-link"
                    >
                      <i class="icon-linkedin"></i>
                    </a>
                    <a
                        v-if="formData.twitter"
                        :href="formData.twitter"
                        target="_blank"
                        class="social-icon-link"
                    >
                      <i class="icon-twitter"></i>
                    </a>
                    <a
                        v-if="formData.github"
                        :href="formData.github"
                        target="_blank"
                        class="social-icon-link"
                    >
                      <i class="icon-github"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Conseils de profil -->
            <div class="tips-card">
              <div class="tips-header">
                <i class="icon-lightbulb"></i>
                <h4>Conseils pour un profil attractif</h4>
              </div>
              <ul class="tips-list">
                <li>
                  <i class="icon-check"></i>
                  Ajoutez une photo professionnelle
                </li>
                <li>
                  <i class="icon-check"></i>
                  Rédigez une bio concise et pertinente
                </li>
                <li>
                  <i class="icon-check"></i>
                  Liez vos réseaux sociaux pertinents
                </li>
                <li>
                  <i class="icon-check"></i>
                  Mettez à jour votre profession et entreprise
                </li>
                <li>
                  <i class="icon-check"></i>
                  Complétez toutes les sections
                </li>
              </ul>
              <div class="progress-info">
                <div class="progress-header">
                  <span>Complétude du profil</span>
                  <span>{{ profileCompletion }}%</span>
                </div>
                <div class="progress-bar">
                  <div
                      class="progress-fill"
                      :style="{ width: profileCompletion + '%' }"
                  ></div>
                </div>
                <p class="progress-note">
                  Un profil complet augmente votre crédibilité
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'upload d'avatar -->
    <BaseModal
        v-if="showAvatarModal"
        @close="closeAvatarUpload"
        title="Changer la photo de profil"
    >
      <AvatarUpload
          @upload-success="handleAvatarUpload"
          @upload-error="handleUploadError"
      />
    </BaseModal>
  </BaseLayout>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseLayout from '@/views/dashboard/BaseLayout.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import AvatarUpload from '@/components/profile/AvatarUpload.vue'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()

// États
const isEditing = ref(false)
const showAvatarModal = ref(false)
const loading = ref(false)
const originalData = ref({})

// Données
const userData = ref({
  fullName: 'Koffi Kouamé',
  email: 'koffi@educours.com',
  phone: '+33 6 12 34 56 78',
  birthDate: '1990-01-15',
  bio: 'Développeur web passionné par les nouvelles technologies et l\'éducation en ligne.',
  address: '123 Avenue des Champs-Élysées',
  city: 'Paris',
  postalCode: '75008',
  country: 'FR',
  educationLevel: 'bac+5',
  profession: 'Développeur Full Stack',
  company: 'Tech Solutions SARL',
  website: 'https://koffi-kouame.dev',
  linkedin: 'https://linkedin.com/in/koffi-kouame',
  twitter: 'https://twitter.com/koffikouame',
  github: 'https://github.com/koffikouame'
})

const formData = reactive({ ...userData.value })
const errors = ref({})

// Statistiques
const enrolledCourses = ref(12)
const completedCourses = ref(8)
const avgGrade = ref(85)

// Calculs
const userAvatar = computed(() => authStore.user?.avatar)
const hasSocialLinks = computed(() => {
  return formData.linkedin || formData.twitter || formData.github
})

const profileCompletion = computed(() => {
  const fields = [
    formData.fullName,
    formData.email,
    formData.profession,
    formData.bio,
    formData.city,
    formData.educationLevel,
    userAvatar.value
  ]

  const filledFields = fields.filter(field => field && field.trim()).length
  return Math.round((filledFields / fields.length) * 100)
})

// Méthodes
const startEditing = () => {
  isEditing.value = true
  originalData.value = { ...formData }
}

const cancelEditing = () => {
  isEditing.value = false
  Object.assign(formData, originalData.value)
  errors.value = {}
}

const validateForm = () => {
  const newErrors = {}

  if (!formData.fullName?.trim()) {
    newErrors.fullName = 'Le nom complet est requis'
  }

  if (!formData.email?.trim()) {
    newErrors.email = 'L\'email est requis'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    newErrors.email = 'Email invalide'
  }

  if (formData.phone && !/^\+?[\d\s\-]+$/.test(formData.phone)) {
    newErrors.phone = 'Numéro de téléphone invalide'
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const saveProfile = async () => {
  if (!validateForm()) return

  loading.value = true

  try {
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mettre à jour les données
    Object.assign(userData.value, formData)

    // Mettre à jour le store
    authStore.updateUser({ ...formData })

    // Sauvegarder localement
    localStorage.setItem('userProfile', JSON.stringify(formData))

    // Afficher un message de succès
    alert('Profil mis à jour avec succès!')

    isEditing.value = false
    errors.value = {}

  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
    alert('Une erreur est survenue. Veuillez réessayer.')
  } finally {
    loading.value = false
  }
}

const openAvatarUpload = () => {
  showAvatarModal.value = true
}

const closeAvatarUpload = () => {
  showAvatarModal.value = false
}

const handleAvatarUpload = (avatarUrl) => {
  authStore.updateUser({ avatar: avatarUrl })
  closeAvatarUpload()
  alert('Photo de profil mise à jour avec succès!')
}

const handleUploadError = (error) => {
  console.error('Erreur d\'upload:', error)
  alert('Erreur lors du téléchargement de la photo')
}

const removeAvatar = () => {
  if (confirm('Êtes-vous sûr de vouloir supprimer votre photo de profil ?')) {
    authStore.updateUser({ avatar: null })
    alert('Photo de profil supprimée')
  }
}

// Initialisation
onMounted(() => {
  // Charger les données du profil depuis le store ou l'API
  if (authStore.user) {
    Object.assign(userData.value, authStore.user)
    Object.assign(formData, authStore.user)
  }

  // Charger depuis localStorage
  const savedProfile = localStorage.getItem('userProfile')
  if (savedProfile) {
    const parsed = JSON.parse(savedProfile)
    Object.assign(userData.value, parsed)
    Object.assign(formData, parsed)
  }
})
</script>

<style scoped>
.edit-profile-view {
  padding: 2rem 0;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  margin-bottom: 2rem;
}

.header-content h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #212529;
}

.header-content p {
  color: #6c757d;
  margin: 0;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  color: #495057;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f8f9fa;
  border-color: #dee2e6;
}

.profile-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  align-items: start;
}

.form-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.avatar-section {
  padding: 2rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.avatar-preview {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.2s;
}

.avatar-preview:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.avatar-overlay span {
  font-size: 0.875rem;
}

.avatar-info h3 {
  margin: 0 0 0.5rem 0;
  color: #212529;
}

.avatar-info p {
  color: #6c757d;
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
}

.btn-remove-avatar {
  background: none;
  border: 1px solid #dc3545;
  color: #dc3545;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-remove-avatar:hover {
  background: #dc3545;
  color: white;
}

.section-card {
  padding: 2rem;
  border-bottom: 1px solid #e9ecef;
}

.section-card:last-child {
  border-bottom: none;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: #212529;
}

.btn-edit {
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  color: #495057;
  font-size: 0.875rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-edit:hover {
  background: #e9ecef;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-cancel {
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  color: #6c757d;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #e9ecef;
}

.btn-save {
  padding: 0.5rem 1rem;
  background: #28a745;
  border: 1px solid #28a745;
  border-radius: 6px;
  color: white;
  font-size: 0.875rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-save:hover {
  background: #218838;
  border-color: #1e7e34;
}

.form-grid {
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
}

.form-group label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #495057;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem 1rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input.disabled,
.form-select.disabled,
.form-textarea.disabled {
  background: #f8f9fa;
  border-color: #e9ecef;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.char-counter {
  text-align: right;
  font-size: 0.875rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.social-links {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.social-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.social-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 8px;
  color: #495057;
  font-size: 1.25rem;
}

.preview-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 2rem;
}

.preview-header {
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.preview-header h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
}

.preview-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

.preview-content {
  padding: 2rem;
}

.preview-avatar {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 1.5rem;
}

.preview-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.preview-avatar-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  background: #28a745;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  border: 3px solid white;
}

.preview-info {
  text-align: center;
  margin-bottom: 2rem;
}

.preview-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #212529;
}

.preview-profession {
  font-size: 1.1rem;
  color: #667eea;
  margin: 0 0 0.25rem 0;
  font-weight: 500;
}

.preview-company {
  color: #6c757d;
  margin: 0 0 1rem 0;
}

.preview-location {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.9rem;
}

.preview-bio {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: left;
}

.preview-bio p {
  margin: 0;
  color: #495057;
  font-size: 0.95rem;
  line-height: 1.5;
}

.preview-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem 0;
  border-top: 1px solid #e9ecef;
  border-bottom: 1px solid #e9ecef;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #212529;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
}

.preview-social {
  text-align: center;
}

.preview-social h5 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1rem;
}

.social-icons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.social-icon-link {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 8px;
  color: #495057;
  font-size: 1.25rem;
  transition: all 0.2s;
}

.social-icon-link:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.tips-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.tips-header i {
  font-size: 1.5rem;
  color: #ffc107;
}

.tips-header h4 {
  margin: 0;
  color: #212529;
  font-size: 1.1rem;
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
}

.tips-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  color: #495057;
}

.tips-list li i {
  color: #28a745;
}

.progress-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.progress-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-note {
  margin: 0;
  font-size: 0.875rem;
  color: #6c757d;
}

/* Responsive */
@media (max-width: 992px) {
  .profile-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .avatar-section {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .section-actions {
    width: 100%;
  }

  .edit-actions {
    width: 100%;
  }

  .btn-cancel,
  .btn-save {
    flex: 1;
  }
}

@media (max-width: 576px) {
  .preview-stats {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .social-links .form-input {
    font-size: 0.9rem;
  }
}
</style>