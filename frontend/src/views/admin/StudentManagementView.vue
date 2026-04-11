<template>
  <div class="student-management">
    <!-- En-tête -->
    <div class="management-header">
      <h1>Gestion des Étudiants</h1>
      <div class="header-actions">
        <button class="btn-secondary" @click="exportStudents">
          <i class="icon-export"></i> Exporter
        </button>
        <button class="btn-primary" @click="showCreateModal = true">
          <i class="icon-add"></i> Ajouter un Étudiant
        </button>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background-color: #e3f2fd;">
          <i class="icon-student"></i>
        </div>
        <div class="stat-info">
          <h3>{{ students.length }}</h3>
          <p>Étudiants total</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background-color: #e8f5e9;">
          <i class="icon-active"></i>
        </div>
        <div class="stat-info">
          <h3>{{ activeStudents }}</h3>
          <p>Actifs ce mois</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background-color: #fff3e0;">
          <i class="icon-payment"></i>
        </div>
        <div class="stat-info">
          <h3>{{ totalRevenue.toLocaleString() }} FCFA</h3>
          <p>Revenus totaux</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background-color: #f3e5f5;">
          <i class="icon-course"></i>
        </div>
        <div class="stat-info">
          <h3>{{ averageCourses.toFixed(1) }}</h3>
          <p>Cours/étudiant</p>
        </div>
      </div>
    </div>

    <!-- Filtres et recherche -->
    <div class="filters-section">
      <div class="search-bar">
        <input
            type="text"
            v-model="searchQuery"
            placeholder="Rechercher un étudiant..."
            class="search-input"
        >
        <i class="icon-search"></i>
      </div>
      <div class="filter-options">
        <select v-model="statusFilter" class="filter-select">
          <option value="all">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
          <option value="blocked">Bloqué</option>
        </select>
        <select v-model="subscriptionFilter" class="filter-select">
          <option value="all">Tous les abonnements</option>
          <option value="free">Gratuit</option>
          <option value="premium">Premium</option>
          <option value="enterprise">Entreprise</option>
        </select>
        <input
            type="date"
            v-model="dateFilter"
            class="filter-date"
            placeholder="Date d'inscription"
        >
      </div>
    </div>

    <!-- Tableau des étudiants -->
    <div class="table-container">
      <table class="students-table">
        <thead>
        <tr>
          <th>
            <input type="checkbox" v-model="selectAll" @change="toggleSelectAll">
          </th>
          <th>Étudiant</th>
          <th>Email</th>
          <th>Téléphone</th>
          <th>Abonnement</th>
          <th>Cours inscrits</th>
          <th>Dépenses totales</th>
          <th>Dernière activité</th>
          <th>Statut</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="student in paginatedStudents" :key="student.id">
          <td>
            <input type="checkbox" v-model="selectedStudents" :value="student.id">
          </td>
          <td class="student-info">
            <img
                :src="student.avatar || '/images/avatar-default.png'"
                :alt="student.name"
                class="student-avatar"
            >
            <div>
              <div class="student-name">{{ student.name }}</div>
              <div class="student-id">ID: {{ student.studentId }}</div>
            </div>
          </td>
          <td>{{ student.email }}</td>
          <td>{{ student.phone || '-' }}</td>
          <td>
              <span class="subscription-badge" :class="student.subscription">
                {{ getSubscriptionLabel(student.subscription) }}
              </span>
          </td>
          <td>
            <div class="course-count">
              {{ student.coursesEnrolled }}
              <button
                  class="btn-view-courses"
                  @click="viewStudentCourses(student.id)"
                  v-if="student.coursesEnrolled > 0"
              >
                <i class="icon-eye"></i>
              </button>
            </div>
          </td>
          <td>{{ student.totalSpent.toLocaleString() }} FCFA</td>
          <td>{{ formatDate(student.lastActive) }}</td>
          <td>
              <span class="status-badge" :class="student.status">
                {{ getStatusLabel(student.status) }}
              </span>
          </td>
          <td class="actions-cell">
            <button class="btn-icon btn-view" @click="viewStudent(student.id)">
              <i class="icon-eye"></i>
            </button>
            <button class="btn-icon btn-edit" @click="editStudent(student)">
              <i class="icon-edit"></i>
            </button>
            <button
                class="btn-icon btn-status"
                @click="toggleStudentStatus(student)"
                :title="student.status === 'active' ? 'Désactiver' : 'Activer'"
            >
              <i :class="student.status === 'active' ? 'icon-block' : 'icon-activate'"></i>
            </button>
            <button class="btn-icon btn-message" @click="messageStudent(student)">
              <i class="icon-message"></i>
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination et actions groupées -->
    <div class="bottom-bar">
      <div class="selected-count" v-if="selectedStudents.length > 0">
        {{ selectedStudents.length }} étudiant(s) sélectionné(s)
        <button class="btn-secondary btn-sm" @click="sendBulkMessage">
          <i class="icon-message"></i> Envoyer message
        </button>
        <button class="btn-danger btn-sm" @click="bulkDelete">
          <i class="icon-delete"></i> Supprimer
        </button>
      </div>

      <div class="pagination">
        <div class="pagination-info">
          Affichage {{ startIndex + 1 }}-{{ endIndex }} sur {{ filteredStudents.length }}
        </div>
        <div class="pagination-controls">
          <button
              class="pagination-btn"
              :disabled="currentPage === 1"
              @click="currentPage--"
          >
            <i class="icon-chevron-left"></i>
          </button>

          <div class="page-numbers">
            <button
                v-for="page in visiblePages"
                :key="page"
                class="page-btn"
                :class="{ active: page === currentPage }"
                @click="currentPage = page"
            >
              {{ page }}
            </button>
          </div>

          <button
              class="pagination-btn"
              :disabled="currentPage === totalPages"
              @click="currentPage++"
          >
            <i class="icon-chevron-right"></i>
          </button>
        </div>

        <select v-model="itemsPerPage" class="page-size-select">
          <option value="10">10 par page</option>
          <option value="25">25 par page</option>
          <option value="50">50 par page</option>
          <option value="100">100 par page</option>
        </select>
      </div>
    </div>

    <!-- Modal d'ajout/édition -->
    <div class="modal-overlay" v-if="showCreateModal">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h2>{{ editingStudent ? 'Modifier l\'étudiant' : 'Ajouter un étudiant' }}</h2>
          <button class="btn-close" @click="closeModal">&times;</button>
        </div>

        <div class="modal-body">
          <div class="form-tabs">
            <button
                class="tab-btn"
                :class="{ active: activeTab === 'info' }"
                @click="activeTab = 'info'"
            >
              Informations
            </button>
            <button
                class="tab-btn"
                :class="{ active: activeTab === 'courses' }"
                @click="activeTab = 'courses'"
            >
              Cours
            </button>
            <button
                class="tab-btn"
                :class="{ active: activeTab === 'notes' }"
                @click="activeTab = 'notes'"
            >
              Notes
            </button>
          </div>

          <form @submit.prevent="saveStudent" v-if="activeTab === 'info'">
            <div class="form-row">
              <div class="form-group">
                <label for="studentName">Nom complet *</label>
                <input
                    type="text"
                    id="studentName"
                    v-model="studentForm.name"
                    placeholder="Ex: Koffi Kouamé"
                    required
                >
              </div>

              <div class="form-group">
                <label for="studentEmail">Email *</label>
                <input
                    type="email"
                    id="studentEmail"
                    v-model="studentForm.email"
                    placeholder="exemple@email.com"
                    required
                >
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="studentPhone">Téléphone</label>
                <input
                    type="tel"
                    id="studentPhone"
                    v-model="studentForm.phone"
                    placeholder="+225 00 00 00 00"
                >
              </div>

              <div class="form-group">
                <label for="studentBirthdate">Date de naissance</label>
                <input
                    type="date"
                    id="studentBirthdate"
                    v-model="studentForm.birthdate"
                >
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="studentCountry">Pays</label>
                <select id="studentCountry" v-model="studentForm.country">
                  <option value="">Sélectionner un pays</option>
                  <option value="ci">Côte d'Ivoire</option>
                  <option value="sn">Sénégal</option>
                  <option value="cm">Cameroun</option>
                  <option value="fr">France</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div class="form-group">
                <label for="studentSubscription">Abonnement *</label>
                <select id="studentSubscription" v-model="studentForm.subscription" required>
                  <option value="">Sélectionner un abonnement</option>
                  <option value="free">Gratuit</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Entreprise</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="studentNotes">Notes internes</label>
              <textarea
                  id="studentNotes"
                  v-model="studentForm.notes"
                  rows="3"
                  placeholder="Notes sur l'étudiant..."
              ></textarea>
            </div>

            <div class="form-group">
              <label>Statut *</label>
              <div class="status-options">
                <label class="radio-label">
                  <input
                      type="radio"
                      v-model="studentForm.status"
                      value="active"
                      required
                  >
                  <span class="radio-custom"></span>
                  Actif
                </label>
                <label class="radio-label">
                  <input
                      type="radio"
                      v-model="studentForm.status"
                      value="inactive"
                  >
                  <span class="radio-custom"></span>
                  Inactif
                </label>
                <label class="radio-label">
                  <input
                      type="radio"
                      v-model="studentForm.status"
                      value="blocked"
                  >
                  <span class="radio-custom"></span>
                  Bloqué
                </label>
              </div>
            </div>
          </form>

          <!-- Tab Cours -->
          <div v-if="activeTab === 'courses' && editingStudent" class="courses-tab">
            <h3>Cours de l'étudiant</h3>
            <div class="student-courses-list">
              <div v-for="course in studentCourses" :key="course.id" class="course-item">
                <div class="course-info">
                  <h4>{{ course.title }}</h4>
                  <p>Progression: {{ course.progress }}%</p>
                  <p>Inscrit le: {{ formatDate(course.enrolledDate) }}</p>
                </div>
                <div class="course-actions">
                  <button class="btn-secondary btn-sm" @click="viewCourseProgress(course.id)">
                    Voir progression
                  </button>
                  <button class="btn-danger btn-sm" @click="unenrollStudent(course.id)">
                    Désinscrire
                  </button>
                </div>
              </div>
            </div>
            <button class="btn-primary" @click="showEnrollModal = true">
              <i class="icon-add"></i> Inscrire à un cours
            </button>
          </div>

          <!-- Tab Notes -->
          <div v-if="activeTab === 'notes' && editingStudent" class="notes-tab">
            <h3>Notes et historique</h3>
            <div class="notes-list">
              <div v-for="note in studentNotes" :key="note.id" class="note-item">
                <div class="note-header">
                  <span class="note-date">{{ formatDate(note.date) }}</span>
                  <span class="note-author">{{ note.author }}</span>
                </div>
                <div class="note-content">
                  {{ note.content }}
                </div>
              </div>
            </div>
            <div class="add-note">
              <textarea v-model="newNote" placeholder="Ajouter une note..."></textarea>
              <button class="btn-primary" @click="addNote">
                Ajouter la note
              </button>
            </div>
          </div>

          <div class="modal-footer" v-if="activeTab === 'info'">
            <button type="button" class="btn-secondary" @click="closeModal">
              Annuler
            </button>
            <button type="submit" class="btn-primary" @click="saveStudent">
              {{ editingStudent ? 'Mettre à jour' : 'Ajouter l\'étudiant' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'inscription à un cours -->
    <div class="modal-overlay" v-if="showEnrollModal">
      <div class="modal">
        <div class="modal-header">
          <h2>Inscrire l'étudiant à un cours</h2>
          <button class="btn-close" @click="showEnrollModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Sélectionner un cours</label>
            <select v-model="selectedCourse" class="full-select">
              <option value="">Choisir un cours</option>
              <option v-for="course in availableCourses" :key="course.id" :value="course.id">
                {{ course.title }} ({{ course.price.toLocaleString() }} FCFA)
              </option>
            </select>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="showEnrollModal = false">
              Annuler
            </button>
            <button class="btn-primary" @click="enrollStudentToCourse">
              Inscrire
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue'

// Données des étudiants
const students = ref([
  {
    id: 1,
    studentId: 'STU2024001',
    name: 'Koffi Kouamé',
    email: 'koffi.kouame@email.com',
    phone: '+225 07 12 34 56 78',
    subscription: 'premium',
    coursesEnrolled: 3,
    totalSpent: 75000,
    lastActive: '2024-02-15',
    status: 'active',
    country: 'ci',
    birthdate: '1995-05-15',
    notes: 'Étudiant très motivé',
    avatar: '/images/avatar3.jpg'
  },
  {
    id: 2,
    studentId: 'STU2024002',
    name: 'Amina Diallo',
    email: 'amina.diallo@email.com',
    phone: '+221 77 123 45 67',
    subscription: 'enterprise',
    coursesEnrolled: 5,
    totalSpent: 150000,
    lastActive: '2024-02-14',
    status: 'active',
    country: 'sn',
    birthdate: '1998-08-22'
  },
  {
    id: 3,
    studentId: 'STU2024003',
    name: 'Pierre Martin',
    email: 'pierre.martin@email.com',
    subscription: 'free',
    coursesEnrolled: 1,
    totalSpent: 0,
    lastActive: '2024-01-30',
    status: 'inactive',
    country: 'fr',
    notes: 'N\'a pas terminé le cours gratuit'
  }
])

// États
const searchQuery = ref('')
const statusFilter = ref('all')
const subscriptionFilter = ref('all')
const dateFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const selectedStudents = ref([])
const selectAll = ref(false)
const showCreateModal = ref(false)
const showEnrollModal = ref(false)
const editingStudent = ref(null)
const activeTab = ref('info')
const newNote = ref('')

// Formulaire
const studentForm = reactive({
  name: '',
  email: '',
  phone: '',
  birthdate: '',
  country: '',
  subscription: 'free',
  status: 'active',
  notes: ''
})

// Computed properties
const filteredStudents = computed(() => {
  return students.value.filter(student => {
    const matchesSearch = !searchQuery.value ||
        student.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesStatus = statusFilter.value === 'all' || student.status === statusFilter.value
    const matchesSubscription = subscriptionFilter.value === 'all' || student.subscription === subscriptionFilter.value
    const matchesDate = !dateFilter.value || student.lastActive === dateFilter.value

    return matchesSearch && matchesStatus && matchesSubscription && matchesDate
  })
})

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredStudents.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredStudents.value.length / itemsPerPage.value)
})

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => Math.min(currentPage.value * itemsPerPage.value, filteredStudents.value.length))

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  let start = Math.max(1, currentPage.value - 2)
  let end = Math.min(total, start + 4)

  if (end - start < 4) {
    start = Math.max(1, end - 4)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const activeStudents = computed(() => {
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  return students.value.filter(s => new Date(s.lastActive) > oneMonthAgo).length
})

const totalRevenue = computed(() => {
  return students.value.reduce((sum, student) => sum + student.totalSpent, 0)
})

const averageCourses = computed(() => {
  if (students.value.length === 0) return 0
  return students.value.reduce((sum, student) => sum + student.coursesEnrolled, 0) / students.value.length
})

// Cours disponibles (simulés)
const availableCourses = ref([
  { id: 1, title: 'Introduction à JavaScript', price: 25000 },
  { id: 2, title: 'Algèbre Avancée', price: 15000 },
  { id: 3, title: 'Physique Quantique', price: 30000 }
])

// Cours de l'étudiant (simulés)
const studentCourses = computed(() => {
  if (!editingStudent.value) return []
  return [
    { id: 1, title: 'Introduction à JavaScript', progress: 75, enrolledDate: '2024-01-20' },
    { id: 2, title: 'Mathématiques Financières', progress: 30, enrolledDate: '2024-02-05' }
  ]
})

// Notes de l'étudiant (simulées)
const studentNotes = computed(() => {
  return [
    { id: 1, date: '2024-02-10', author: 'Admin', content: 'Étudiant très assidu dans ses cours.' },
    { id: 2, date: '2024-01-25', author: 'Support', content: 'A demandé une extension pour son devoir.' }
  ]
})

// Méthodes utilitaires
const getSubscriptionLabel = (subscription) => {
  const subscriptions = {
    free: 'Gratuit',
    premium: 'Premium',
    enterprise: 'Entreprise'
  }
  return subscriptions[subscription] || subscription
}

const getStatusLabel = (status) => {
  const statuses = {
    active: 'Actif',
    inactive: 'Inactif',
    blocked: 'Bloqué'
  }
  return statuses[status] || status
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

// Actions
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedStudents.value = paginatedStudents.value.map(student => student.id)
  } else {
    selectedStudents.value = []
  }
}

watch(selectedStudents, (newVal) => {
  selectAll.value = newVal.length === paginatedStudents.value.length && paginatedStudents.value.length > 0
})

const viewStudent = (studentId) => {
  console.log('Voir étudiant:', studentId)
  // Naviguer vers la page de profil de l'étudiant
}

const editStudent = (student) => {
  editingStudent.value = student.id
  Object.assign(studentForm, {
    name: student.name,
    email: student.email,
    phone: student.phone,
    birthdate: student.birthdate,
    country: student.country,
    subscription: student.subscription,
    status: student.status,
    notes: student.notes
  })
  activeTab.value = 'info'
  showCreateModal.value = true
}

const toggleStudentStatus = (student) => {
  if (student.status === 'active') {
    student.status = 'blocked'
  } else {
    student.status = 'active'
  }
}

const viewStudentCourses = (studentId) => {
  console.log('Voir cours de l\'étudiant:', studentId)
}

const messageStudent = (student) => {
  console.log('Message à:', student.name)
}

const saveStudent = () => {
  if (editingStudent.value) {
    const index = students.value.findIndex(s => s.id === editingStudent.value)
    if (index !== -1) {
      students.value[index] = {
        ...students.value[index],
        ...studentForm
      }
    }
  } else {
    const newId = Math.max(...students.value.map(s => s.id)) + 1
    students.value.push({
      id: newId,
      studentId: `STU${new Date().getFullYear()}${String(newId).padStart(3, '0')}`,
      ...studentForm,
      coursesEnrolled: 0,
      totalSpent: 0,
      lastActive: new Date().toISOString().split('T')[0],
      avatar: null
    })
  }
  closeModal()
}

const closeModal = () => {
  showCreateModal.value = false
  editingStudent.value = null
  activeTab.value = 'info'
  newNote.value = ''
  Object.keys(studentForm).forEach(key => {
    if (key === 'subscription') {
      studentForm[key] = 'free'
    } else if (key === 'status') {
      studentForm[key] = 'active'
    } else {
      studentForm[key] = ''
    }
  })
}

const exportStudents = () => {
  console.log('Export des étudiants')
  // Logique d'export CSV/Excel
}

const sendBulkMessage = () => {
  console.log('Message groupé à:', selectedStudents.value)
}

const bulkDelete = () => {
  if (confirm(`Supprimer ${selectedStudents.value.length} étudiant(s) ?`)) {
    students.value = students.value.filter(s => !selectedStudents.value.includes(s.id))
    selectedStudents.value = []
  }
}

const enrollStudentToCourse = () => {
  if (selectedCourse.value && editingStudent.value) {
    console.log('Inscription au cours:', selectedCourse.value)
    // Logique d'inscription
    showEnrollModal.value = false
    selectedCourse.value = null
  }
}

const addNote = () => {
  if (newNote.value.trim()) {
    console.log('Ajout de note:', newNote.value)
    newNote.value = ''
  }
}

onMounted(() => {
  console.log('StudentManagementView monté')
})
</script>

<style scoped>
.student-management {
  padding: 20px;
}

.header-actions {
  display: flex;
  gap: 15px;
  align-items: center;
}

.btn-secondary {
  background-color: #f8f9fa;
  color: #2c3e50;
  border: 2px solid #e0e0e0;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-secondary:hover {
  background-color: #e9ecef;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.filters-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin: 20px 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.filter-options {
  display: flex;
  gap: 15px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.filter-date {
  padding: 10px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  min-width: 180px;
}

.students-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.students-table th {
  background-color: #f8f9fa;
  padding: 16px;
  text-align: left;
  color: #2c3e50;
  font-weight: 600;
  border-bottom: 2px solid #e0e0e0;
}

.students-table td {
  padding: 16px;
  border-bottom: 1px solid #eef0f2;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.student-name {
  font-weight: 600;
  color: #2c3e50;
}

.student-id {
  font-size: 12px;
  color: #7f8c8d;
}

.subscription-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.subscription-badge.free {
  background-color: #f8f9fa;
  color: #6c757d;
}

.subscription-badge.premium {
  background-color: #e3f2fd;
  color: #1976d2;
}

.subscription-badge.enterprise {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.course-count {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-view-courses {
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  padding: 4px;
}

.bottom-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 15px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.selected-count {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #2c3e50;
  font-weight: 600;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 20px;
}

.pagination-info {
  color: #7f8c8d;
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pagination-btn {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 2px solid #e0e0e0;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 5px;
}

.page-btn {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 2px solid #e0e0e0;
  background: white;
  cursor: pointer;
}

.page-btn.active {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.page-size-select {
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
}

.modal-lg {
  max-width: 800px;
}

.form-tabs {
  display: flex;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 20px;
}

.tab-btn {
  padding: 12px 24px;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  color: #7f8c8d;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
}

.tab-btn.active {
  color: #3498db;
  border-bottom-color: #3498db;
}

.courses-tab, .notes-tab {
  padding: 20px 0;
}

.student-courses-list {
  margin-bottom: 20px;
}

.course-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 10px;
}

.note-item {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 10px;
}

.note-header {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 8px;
}

.add-note {
  margin-top: 20px;
}

.add-note textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 15px;
  font-size: 14px;
  resize: vertical;
}

.full-select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .bottom-bar {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .selected-count {
    flex-direction: column;
    align-items: flex-start;
  }

  .pagination {
    flex-direction: column;
    gap: 10px;
  }

  .students-table {
    display: block;
    overflow-x: auto;
  }
}
</style>