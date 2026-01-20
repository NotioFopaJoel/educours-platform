<template>
  <div class="teacher-management">
    <!-- En-tête -->
    <div class="management-header">
      <h1>Gestion des Professeurs</h1>
      <button class="btn-primary" @click="showCreateModal = true">
        <i class="icon-add"></i> Ajouter un Professeur
      </button>
    </div>

    <!-- Statistiques -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background-color: #e3f2fd;">
          <i class="icon-teacher"></i>
        </div>
        <div class="stat-info">
          <h3>{{ teachers.length }}</h3>
          <p>Professeurs</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background-color: #e8f5e9;">
          <i class="icon-active"></i>
        </div>
        <div class="stat-info">
          <h3>{{ activeTeachers }}</h3>
          <p>Actifs</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background-color: #fff3e0;">
          <i class="icon-course"></i>
        </div>
        <div class="stat-info">
          <h3>{{ totalCourses }}</h3>
          <p>Cours assignés</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background-color: #f3e5f5;">
          <i class="icon-rating"></i>
        </div>
        <div class="stat-info">
          <h3>{{ averageRating.toFixed(1) }}</h3>
          <p>Note moyenne</p>
        </div>
      </div>
    </div>

    <!-- Barre de recherche -->
    <div class="filters-section">
      <div class="search-bar">
        <input
            type="text"
            v-model="searchQuery"
            placeholder="Rechercher un professeur..."
            class="search-input"
        >
        <i class="icon-search"></i>
      </div>
      <div class="filter-options">
        <select v-model="statusFilter" class="filter-select">
          <option value="all">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
          <option value="pending">En attente</option>
        </select>
        <select v-model="specialtyFilter" class="filter-select">
          <option value="all">Toutes spécialités</option>
          <option value="math">Mathématiques</option>
          <option value="science">Sciences</option>
          <option value="programming">Programmation</option>
          <option value="business">Business</option>
        </select>
      </div>
    </div>

    <!-- Liste des professeurs -->
    <div class="teachers-grid">
      <div
          v-for="teacher in filteredTeachers"
          :key="teacher.id"
          class="teacher-card"
      >
        <div class="teacher-header">
          <img
              :src="teacher.avatar || '/images/avatar-default.png'"
              :alt="teacher.name"
              class="teacher-avatar"
          >
          <div class="teacher-info">
            <h3>{{ teacher.name }}</h3>
            <p class="teacher-title">{{ teacher.title }}</p>
            <div class="teacher-rating">
              <span class="stars">
                <i
                    v-for="n in 5"
                    :key="n"
                    :class="n <= teacher.rating ? 'icon-star-filled' : 'icon-star-empty'"
                ></i>
              </span>
              <span class="rating-value">{{ teacher.rating.toFixed(1) }}</span>
            </div>
          </div>
          <div class="teacher-status" :class="teacher.status">
            {{ getStatusLabel(teacher.status) }}
          </div>
        </div>

        <div class="teacher-details">
          <div class="detail-item">
            <i class="icon-specialty"></i>
            <span><strong>Spécialité:</strong> {{ teacher.specialty }}</span>
          </div>
          <div class="detail-item">
            <i class="icon-email"></i>
            <span>{{ teacher.email }}</span>
          </div>
          <div class="detail-item">
            <i class="icon-phone"></i>
            <span>{{ teacher.phone || 'Non renseigné' }}</span>
          </div>
          <div class="detail-item">
            <i class="icon-course"></i>
            <span><strong>Cours:</strong> {{ teacher.courseCount }} cours</span>
          </div>
          <div class="detail-item">
            <i class="icon-date"></i>
            <span>Membre depuis {{ formatDate(teacher.joinDate) }}</span>
          </div>
        </div>

        <div class="teacher-actions">
          <button class="btn-view" @click="viewTeacher(teacher.id)">
            <i class="icon-eye"></i> Voir profil
          </button>
          <button class="btn-edit" @click="editTeacher(teacher)">
            <i class="icon-edit"></i> Modifier
          </button>
          <button
              class="btn-toggle"
              @click="toggleTeacherStatus(teacher)"
              :class="{ 'btn-deactivate': teacher.status === 'active', 'btn-activate': teacher.status !== 'active' }"
          >
            <i :class="teacher.status === 'active' ? 'icon-deactivate' : 'icon-activate'"></i>
            {{ teacher.status === 'active' ? 'Désactiver' : 'Activer' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal d'ajout/édition -->
    <div class="modal-overlay" v-if="showCreateModal">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingTeacher ? 'Modifier le professeur' : 'Ajouter un professeur' }}</h2>
          <button class="btn-close" @click="closeModal">&times;</button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="saveTeacher">
            <div class="form-row">
              <div class="form-group">
                <label for="teacherName">Nom complet *</label>
                <input
                    type="text"
                    id="teacherName"
                    v-model="teacherForm.name"
                    placeholder="Ex: Dr. Jean Dupont"
                    required
                >
              </div>

              <div class="form-group">
                <label for="teacherTitle">Titre professionnel</label>
                <input
                    type="text"
                    id="teacherTitle"
                    v-model="teacherForm.title"
                    placeholder="Ex: Docteur en Mathématiques"
                >
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="teacherEmail">Email *</label>
                <input
                    type="email"
                    id="teacherEmail"
                    v-model="teacherForm.email"
                    placeholder="exemple@educours.com"
                    required
                >
              </div>

              <div class="form-group">
                <label for="teacherPhone">Téléphone</label>
                <input
                    type="tel"
                    id="teacherPhone"
                    v-model="teacherForm.phone"
                    placeholder="+225 00 00 00 00"
                >
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="teacherSpecialty">Spécialité *</label>
                <select id="teacherSpecialty" v-model="teacherForm.specialty" required>
                  <option value="">Sélectionner une spécialité</option>
                  <option value="math">Mathématiques</option>
                  <option value="science">Sciences</option>
                  <option value="programming">Programmation</option>
                  <option value="business">Business</option>
                  <option value="language">Langues</option>
                  <option value="arts">Arts</option>
                </select>
              </div>

              <div class="form-group">
                <label for="teacherRate">Taux horaire (FCFA)</label>
                <input
                    type="number"
                    id="teacherRate"
                    v-model="teacherForm.hourlyRate"
                    min="0"
                    step="1000"
                >
              </div>
            </div>

            <div class="form-group">
              <label for="teacherBio">Biographie</label>
              <textarea
                  id="teacherBio"
                  v-model="teacherForm.bio"
                  rows="4"
                  placeholder="Présentation du professeur, expérience, qualifications..."
              ></textarea>
            </div>

            <div class="form-group">
              <label>Statut *</label>
              <div class="status-options">
                <label class="radio-label">
                  <input
                      type="radio"
                      v-model="teacherForm.status"
                      value="active"
                      required
                  >
                  <span class="radio-custom"></span>
                  Actif
                </label>
                <label class="radio-label">
                  <input
                      type="radio"
                      v-model="teacherForm.status"
                      value="inactive"
                  >
                  <span class="radio-custom"></span>
                  Inactif
                </label>
                <label class="radio-label">
                  <input
                      type="radio"
                      v-model="teacherForm.status"
                      value="pending"
                  >
                  <span class="radio-custom"></span>
                  En attente
                </label>
              </div>
            </div>

            <div class="form-group">
              <label>Avatar</label>
              <div class="avatar-upload">
                <img
                    v-if="teacherForm.avatarPreview"
                    :src="teacherForm.avatarPreview"
                    class="avatar-preview"
                >
                <input
                    type="file"
                    id="teacherAvatar"
                    accept="image/*"
                    @change="handleAvatarUpload"
                >
                <label for="teacherAvatar" class="upload-label">
                  <i class="icon-upload"></i>
                  {{ teacherForm.avatar ? 'Changer la photo' : 'Télécharger une photo' }}
                </label>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-secondary" @click="closeModal">
                Annuler
              </button>
              <button type="submit" class="btn-primary">
                {{ editingTeacher ? 'Mettre à jour' : 'Ajouter le professeur' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'

// Données des professeurs
const teachers = ref([
  {
    id: 1,
    name: 'Dr. Jean Dupont',
    title: 'Docteur en Informatique',
    email: 'jean.dupont@educours.com',
    phone: '+225 07 12 34 56 78',
    specialty: 'programming',
    rating: 4.8,
    status: 'active',
    courseCount: 8,
    joinDate: '2023-06-15',
    bio: 'Spécialiste en développement web avec 10 ans d\'expérience.',
    hourlyRate: 15000,
    avatar: '/images/avatar1.jpg'
  },
  {
    id: 2,
    name: 'Prof. Marie Curie',
    title: 'Professeur de Mathématiques',
    email: 'marie.curie@educours.com',
    phone: '+225 05 98 76 54 32',
    specialty: 'math',
    rating: 4.9,
    status: 'active',
    courseCount: 6,
    joinDate: '2023-08-22',
    bio: 'Enseignante passionnée par les mathématiques avancées.',
    hourlyRate: 12000,
    avatar: '/images/avatar2.jpg'
  },
  {
    id: 3,
    name: 'Dr. Albert Einstein',
    title: 'Physicien Théoricien',
    email: 'albert.einstein@educours.com',
    specialty: 'science',
    rating: 4.7,
    status: 'pending',
    courseCount: 3,
    joinDate: '2024-01-10',
    bio: 'Expert en physique théorique et relativité.',
    hourlyRate: 20000
  }
])

// Recherche et filtres
const searchQuery = ref('')
const statusFilter = ref('all')
const specialtyFilter = ref('all')
const showCreateModal = ref(false)
const editingTeacher = ref(null)

// Formulaire
const teacherForm = reactive({
  name: '',
  title: '',
  email: '',
  phone: '',
  specialty: '',
  bio: '',
  status: 'active',
  hourlyRate: 0,
  avatar: null,
  avatarPreview: null
})

// Computed properties
const filteredTeachers = computed(() => {
  return teachers.value.filter(teacher => {
    // Filtre par recherche
    const matchesSearch = !searchQuery.value ||
        teacher.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        teacher.specialty.toLowerCase().includes(searchQuery.value.toLowerCase())

    // Filtre par statut
    const matchesStatus = statusFilter.value === 'all' || teacher.status === statusFilter.value

    // Filtre par spécialité
    const matchesSpecialty = specialtyFilter.value === 'all' || teacher.specialty === specialtyFilter.value

    return matchesSearch && matchesStatus && matchesSpecialty
  })
})

const activeTeachers = computed(() => {
  return teachers.value.filter(t => t.status === 'active').length
})

const totalCourses = computed(() => {
  return teachers.value.reduce((sum, teacher) => sum + teacher.courseCount, 0)
})

const averageRating = computed(() => {
  if (teachers.value.length === 0) return 0
  const sum = teachers.value.reduce((acc, teacher) => acc + teacher.rating, 0)
  return sum / teachers.value.length
})

// Méthodes utilitaires
const getStatusLabel = (status) => {
  const statuses = {
    active: 'Actif',
    inactive: 'Inactif',
    pending: 'En attente'
  }
  return statuses[status] || status
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short'
  })
}

// Actions
const viewTeacher = (teacherId) => {
  // Naviguer vers la page de profil du professeur
  console.log('Voir professeur:', teacherId)
}

const editTeacher = (teacher) => {
  editingTeacher.value = teacher.id
  Object.assign(teacherForm, {
    name: teacher.name,
    title: teacher.title,
    email: teacher.email,
    phone: teacher.phone,
    specialty: teacher.specialty,
    bio: teacher.bio,
    status: teacher.status,
    hourlyRate: teacher.hourlyRate,
    avatarPreview: teacher.avatar
  })
  showCreateModal.value = true
}

const toggleTeacherStatus = (teacher) => {
  teacher.status = teacher.status === 'active' ? 'inactive' : 'active'
  // Appel API ici
}

const handleAvatarUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    teacherForm.avatar = file
    teacherForm.avatarPreview = URL.createObjectURL(file)
  }
}

const saveTeacher = () => {
  if (editingTeacher.value) {
    // Mettre à jour
    const index = teachers.value.findIndex(t => t.id === editingTeacher.value)
    if (index !== -1) {
      teachers.value[index] = {
        ...teachers.value[index],
        ...teacherForm,
        rating: teachers.value[index].rating // Garder l'ancienne note
      }
    }
  } else {
    // Créer nouveau
    const newId = Math.max(...teachers.value.map(t => t.id)) + 1
    teachers.value.push({
      id: newId,
      ...teacherForm,
      rating: 0,
      courseCount: 0,
      joinDate: new Date().toISOString().split('T')[0]
    })
  }
  closeModal()
}

const closeModal = () => {
  showCreateModal.value = false
  editingTeacher.value = null
  // Réinitialiser le formulaire
  Object.keys(teacherForm).forEach(key => {
    if (key === 'status') {
      teacherForm[key] = 'active'
    } else if (key === 'hourlyRate') {
      teacherForm[key] = 0
    } else {
      teacherForm[key] = ''
    }
  })
  teacherForm.avatar = null
  teacherForm.avatarPreview = null
}

onMounted(() => {
  console.log('TeacherManagementView monté')
})
</script>

<style scoped>
.teacher-management {
  padding: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon i {
  font-size: 24px;
}

.stat-info h3 {
  margin: 0;
  font-size: 28px;
  color: #2c3e50;
}

.stat-info p {
  margin: 5px 0 0;
  color: #7f8c8d;
  font-size: 14px;
}

.teachers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.teacher-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.teacher-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
}

.teacher-header {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  border-bottom: 1px solid #eef0f2;
}

.teacher-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
}

.teacher-info h3 {
  margin: 0 0 5px;
  color: #2c3e50;
}

.teacher-title {
  margin: 0 0 8px;
  color: #3498db;
  font-size: 14px;
}

.teacher-rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stars i {
  color: #f39c12;
  margin-right: 2px;
}

.rating-value {
  color: #7f8c8d;
  font-size: 14px;
}

.teacher-status {
  margin-left: auto;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.teacher-status.active {
  background-color: #d4edda;
  color: #155724;
}

.teacher-status.inactive {
  background-color: #f8d7da;
  color: #721c24;
}

.teacher-status.pending {
  background-color: #fff3cd;
  color: #856404;
}

.teacher-details {
  padding: 20px;
  border-bottom: 1px solid #eef0f2;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  color: #5d6d7e;
  font-size: 14px;
}

.detail-item i {
  color: #3498db;
  min-width: 20px;
}

.teacher-actions {
  padding: 15px 20px;
  display: flex;
  gap: 10px;
}

.teacher-actions button {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-view {
  background-color: #e3f2fd;
  color: #1976d2;
}

.btn-edit {
  background-color: #fff3cd;
  color: #856404;
}

.btn-toggle {
  background-color: #f8f9fa;
  color: #2c3e50;
  border: 2px solid #e0e0e0;
}

.btn-deactivate {
  background-color: #f8d7da;
  color: #721c24;
  border-color: #dc3545;
}

.btn-activate {
  background-color: #d4edda;
  color: #155724;
  border-color: #28a745;
}

.teacher-actions button:hover {
  transform: translateY(-2px);
}

.avatar-upload {
  margin-top: 10px;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 15px;
  border: 2px dashed #e0e0e0;
}

/* Responsive */
@media (max-width: 768px) {
  .teachers-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .teacher-actions {
    flex-direction: column;
  }

  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>