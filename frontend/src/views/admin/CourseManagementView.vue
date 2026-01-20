<template>
  <div class="course-management">
    <!-- En-tête avec titre et bouton d'ajout -->
    <div class="management-header">
      <h1>Gestion des Cours</h1>
      <button class="btn-primary" @click="showCreateModal = true">
        <i class="icon-add"></i> Nouveau Cours
      </button>
    </div>

    <!-- Barre de recherche et filtres -->
    <div class="filters-section">
      <div class="search-bar">
        <input
            type="text"
            v-model="searchQuery"
            placeholder="Rechercher un cours par titre, catégorie..."
            class="search-input"
        >
        <i class="icon-search"></i>
      </div>

      <div class="filter-options">
        <select v-model="statusFilter" class="filter-select">
          <option value="all">Tous les statuts</option>
          <option value="published">Publié</option>
          <option value="draft">Brouillon</option>
          <option value="archived">Archivé</option>
        </select>

        <select v-model="categoryFilter" class="filter-select">
          <option value="all">Toutes catégories</option>
          <option value="math">Mathématiques</option>
          <option value="science">Sciences</option>
          <option value="programming">Programmation</option>
          <option value="business">Business</option>
        </select>
      </div>
    </div>

    <!-- Tableau des cours -->
    <div class="table-container">
      <table class="courses-table">
        <thead>
        <tr>
          <th>Titre</th>
          <th>Catégorie</th>
          <th>Professeur</th>
          <th>Prix (FCFA)</th>
          <th>Étudiants</th>
          <th>Statut</th>
          <th>Créé le</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="course in filteredCourses" :key="course.id">
          <td class="course-title">
            <div class="course-info">
              <img
                  :src="course.thumbnail || '/images/course-default.jpg'"
                  :alt="course.title"
                  class="course-thumbnail"
              >
              <span>{{ course.title }}</span>
            </div>
          </td>
          <td>
              <span class="category-badge" :class="course.category">
                {{ getCategoryLabel(course.category) }}
              </span>
          </td>
          <td>{{ course.teacherName }}</td>
          <td>{{ course.price.toLocaleString() }} FCFA</td>
          <td>{{ course.enrolledStudents }}</td>
          <td>
              <span class="status-badge" :class="course.status">
                {{ getStatusLabel(course.status) }}
              </span>
          </td>
          <td>{{ formatDate(course.createdAt) }}</td>
          <td class="actions-cell">
            <button class="btn-icon btn-view" @click="viewCourse(course.id)">
              <i class="icon-eye"></i>
            </button>
            <button class="btn-icon btn-edit" @click="editCourse(course.id)">
              <i class="icon-edit"></i>
            </button>
            <button
                class="btn-icon btn-delete"
                @click="confirmDelete(course)"
                :disabled="course.enrolledStudents > 0"
            >
              <i class="icon-delete"></i>
            </button>
            <button
                class="btn-icon btn-status"
                @click="toggleCourseStatus(course)"
                :title="course.status === 'published' ? 'Mettre en brouillon' : 'Publier'"
            >
              <i :class="course.status === 'published' ? 'icon-unpublish' : 'icon-publish'"></i>
            </button>
          </td>
        </tr>
        <tr v-if="filteredCourses.length === 0">
          <td colspan="8" class="empty-state">
            <i class="icon-empty"></i>
            <p>Aucun cours trouvé</p>
            <button class="btn-secondary" @click="showCreateModal = true">
              Créer votre premier cours
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="totalPages > 1">
      <button
          class="pagination-btn"
          :disabled="currentPage === 1"
          @click="currentPage--"
      >
        Précédent
      </button>

      <span class="page-numbers">
        Page {{ currentPage }} sur {{ totalPages }}
      </span>

      <button
          class="pagination-btn"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
      >
        Suivant
      </button>
    </div>

    <!-- Modal de création/édition -->
    <div class="modal-overlay" v-if="showCreateModal">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingCourse ? 'Modifier le cours' : 'Créer un nouveau cours' }}</h2>
          <button class="btn-close" @click="closeModal">&times;</button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="saveCourse">
            <div class="form-group">
              <label for="courseTitle">Titre du cours *</label>
              <input
                  type="text"
                  id="courseTitle"
                  v-model="courseForm.title"
                  placeholder="Ex: Introduction à JavaScript"
                  required
              >
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="courseCategory">Catégorie *</label>
                <select id="courseCategory" v-model="courseForm.category" required>
                  <option value="">Sélectionner une catégorie</option>
                  <option value="math">Mathématiques</option>
                  <option value="science">Sciences</option>
                  <option value="programming">Programmation</option>
                  <option value="business">Business</option>
                  <option value="language">Langues</option>
                </select>
              </div>

              <div class="form-group">
                <label for="coursePrice">Prix (FCFA) *</label>
                <input
                    type="number"
                    id="coursePrice"
                    v-model="courseForm.price"
                    min="0"
                    step="1000"
                    required
                >
              </div>
            </div>

            <div class="form-group">
              <label for="courseDescription">Description *</label>
              <textarea
                  id="courseDescription"
                  v-model="courseForm.description"
                  rows="4"
                  placeholder="Décrivez le contenu du cours, les objectifs d'apprentissage..."
                  required
              ></textarea>
            </div>

            <div class="form-group">
              <label for="courseTeacher">Professeur assigné *</label>
              <select id="courseTeacher" v-model="courseForm.teacherId" required>
                <option value="">Sélectionner un professeur</option>
                <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                  {{ teacher.name }} - {{ teacher.specialty }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Statut</label>
              <div class="status-options">
                <label class="radio-label">
                  <input
                      type="radio"
                      v-model="courseForm.status"
                      value="draft"
                  >
                  <span class="radio-custom"></span>
                  Brouillon
                </label>
                <label class="radio-label">
                  <input
                      type="radio"
                      v-model="courseForm.status"
                      value="published"
                  >
                  <span class="radio-custom"></span>
                  Publié
                </label>
              </div>
            </div>

            <div class="form-group">
              <label for="courseThumbnail">Miniature</label>
              <div class="thumbnail-upload">
                <img
                    v-if="courseForm.thumbnailPreview"
                    :src="courseForm.thumbnailPreview"
                    class="thumbnail-preview"
                >
                <input
                    type="file"
                    id="courseThumbnail"
                    accept="image/*"
                    @change="handleThumbnailUpload"
                >
                <label for="courseThumbnail" class="upload-label">
                  <i class="icon-upload"></i>
                  {{ courseForm.thumbnail ? 'Changer l\'image' : 'Télécharger une image' }}
                </label>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-secondary" @click="closeModal">
                Annuler
              </button>
              <button type="submit" class="btn-primary">
                {{ editingCourse ? 'Mettre à jour' : 'Créer le cours' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div class="modal-overlay" v-if="showDeleteModal">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2>Confirmer la suppression</h2>
        </div>
        <div class="modal-body">
          <p>Êtes-vous sûr de vouloir supprimer le cours <strong>{{ courseToDelete?.title }}</strong> ?</p>
          <p v-if="courseToDelete?.enrolledStudents > 0" class="warning-text">
            ⚠️ Ce cours a {{ courseToDelete.enrolledStudents }} étudiant(s) inscrit(s).
            La suppression affectera leur accès.
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showDeleteModal = false">
            Annuler
          </button>
          <button class="btn-danger" @click="deleteCourse">
            Supprimer définitivement
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'

// Hook pour la navigation
const router = useRouter()

// Données des cours (simulées - à remplacer par appel API)
const courses = ref([
  {
    id: 1,
    title: 'Introduction à JavaScript',
    category: 'programming',
    teacherName: 'Dr. Jean Dupont',
    price: 25000,
    enrolledStudents: 42,
    status: 'published',
    createdAt: '2024-01-15',
    thumbnail: '/images/cs-course.jpg'
  },
  {
    id: 2,
    title: 'Algèbre Avancée',
    category: 'math',
    teacherName: 'Prof. Marie Curie',
    price: 15000,
    enrolledStudents: 28,
    status: 'published',
    createdAt: '2024-02-10',
    thumbnail: '/images/math-course.jpg'
  },
  {
    id: 3,
    title: 'Physique Quantique',
    category: 'science',
    teacherName: 'Dr. Albert Einstein',
    price: 30000,
    enrolledStudents: 15,
    status: 'draft',
    createdAt: '2024-02-20'
  }
])

// Liste des professeurs (simulée)
const teachers = ref([
  { id: 1, name: 'Dr. Jean Dupont', specialty: 'Programmation' },
  { id: 2, name: 'Prof. Marie Curie', specialty: 'Mathématiques' },
  { id: 3, name: 'Dr. Albert Einstein', specialty: 'Physique' }
])

// États pour la recherche/filtrage
const searchQuery = ref('')
const statusFilter = ref('all')
const categoryFilter = ref('all')
const currentPage = ref(1)
const itemsPerPage = 10

// États pour les modals
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const editingCourse = ref(null)
const courseToDelete = ref(null)

// Formulaire de cours
const courseForm = reactive({
  title: '',
  category: '',
  price: 0,
  description: '',
  teacherId: '',
  status: 'draft',
  thumbnail: null,
  thumbnailPreview: null
})

// Computed pour les cours filtrés
const filteredCourses = computed(() => {
  let filtered = courses.value

  // Filtre par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query) ||
        course.teacherName.toLowerCase().includes(query)
    )
  }

  // Filtre par statut
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(course => course.status === statusFilter.value)
  }

  // Filtre par catégorie
  if (categoryFilter.value !== 'all') {
    filtered = filtered.filter(course => course.category === categoryFilter.value)
  }

  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(filteredCourses.value.length / itemsPerPage)
})

// Méthodes utilitaires
const getCategoryLabel = (category) => {
  const categories = {
    math: 'Mathématiques',
    science: 'Sciences',
    programming: 'Programmation',
    business: 'Business',
    language: 'Langues'
  }
  return categories[category] || category
}

const getStatusLabel = (status) => {
  const statuses = {
    published: 'Publié',
    draft: 'Brouillon',
    archived: 'Archivé'
  }
  return statuses[status] || status
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

// Actions sur les cours
const viewCourse = (courseId) => {
  router.push(`/admin/courses/${courseId}`)
}

const editCourse = (courseId) => {
  const course = courses.value.find(c => c.id === courseId)
  if (course) {
    editingCourse.value = courseId
    // Remplir le formulaire avec les données du cours
    Object.assign(courseForm, {
      title: course.title,
      category: course.category,
      price: course.price,
      description: course.description || '',
      teacherId: teachers.value.find(t => t.name === course.teacherName)?.id || '',
      status: course.status,
      thumbnailPreview: course.thumbnail
    })
    showCreateModal.value = true
  }
}

const confirmDelete = (course) => {
  courseToDelete.value = course
  showDeleteModal.value = true
}

const deleteCourse = () => {
  if (courseToDelete.value) {
    courses.value = courses.value.filter(c => c.id !== courseToDelete.value.id)
    showDeleteModal.value = false
    courseToDelete.value = null
    // Ici, ajouter l'appel API pour supprimer en base de données
  }
}

const toggleCourseStatus = (course) => {
  course.status = course.status === 'published' ? 'draft' : 'published'
  // Ici, ajouter l'appel API pour mettre à jour le statut
}

const handleThumbnailUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    courseForm.thumbnail = file
    courseForm.thumbnailPreview = URL.createObjectURL(file)
  }
}

const saveCourse = () => {
  // Simulation de sauvegarde
  if (editingCourse.value) {
    // Mise à jour du cours existant
    const index = courses.value.findIndex(c => c.id === editingCourse.value)
    if (index !== -1) {
      const teacher = teachers.value.find(t => t.id === courseForm.teacherId)
      courses.value[index] = {
        ...courses.value[index],
        title: courseForm.title,
        category: courseForm.category,
        price: courseForm.price,
        teacherName: teacher ? teacher.name : courses.value[index].teacherName,
        status: courseForm.status
      }
    }
  } else {
    // Création d'un nouveau cours
    const newId = Math.max(...courses.value.map(c => c.id)) + 1
    const teacher = teachers.value.find(t => t.id === courseForm.teacherId)

    courses.value.push({
      id: newId,
      title: courseForm.title,
      category: courseForm.category,
      teacherName: teacher ? teacher.name : 'Professeur non assigné',
      price: courseForm.price,
      enrolledStudents: 0,
      status: courseForm.status,
      createdAt: new Date().toISOString().split('T')[0],
      thumbnail: courseForm.thumbnailPreview
    })
  }

  closeModal()
}

const closeModal = () => {
  showCreateModal.value = false
  editingCourse.value = null
  // Réinitialiser le formulaire
  Object.keys(courseForm).forEach(key => {
    if (key === 'status') {
      courseForm[key] = 'draft'
    } else if (key === 'price') {
      courseForm[key] = 0
    } else {
      courseForm[key] = ''
    }
  })
  courseForm.thumbnail = null
  courseForm.thumbnailPreview = null
}

// Chargement initial
onMounted(() => {
  // Ici, ajouter l'appel API pour charger les cours et professeurs
  console.log('CourseManagementView monté')
})
</script>

<style scoped>
.course-management {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.management-header h1 {
  color: #2c3e50;
  font-size: 28px;
  margin: 0;
}

.btn-primary {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.filters-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
}

.search-bar {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
}

.icon-search {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #95a5a6;
}

.filter-options {
  display: flex;
  gap: 15px;
}

.filter-select {
  padding: 10px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  min-width: 180px;
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  margin-bottom: 20px;
}

.courses-table {
  width: 100%;
  border-collapse: collapse;
}

.courses-table th {
  background-color: #f8f9fa;
  padding: 16px;
  text-align: left;
  color: #2c3e50;
  font-weight: 600;
  border-bottom: 2px solid #e0e0e0;
}

.courses-table td {
  padding: 16px;
  border-bottom: 1px solid #eef0f2;
}

.course-title .course-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.course-thumbnail {
  width: 50px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
}

.category-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.category-badge.math {
  background-color: #e3f2fd;
  color: #1976d2;
}

.category-badge.science {
  background-color: #e8f5e9;
  color: #388e3c;
}

.category-badge.programming {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.category-badge.business {
  background-color: #fff3e0;
  color: #f57c00;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.status-badge.published {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.draft {
  background-color: #fff3cd;
  color: #856404;
}

.status-badge.archived {
  background-color: #f8d7da;
  color: #721c24;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
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

.btn-delete {
  background-color: #f8d7da;
  color: #721c24;
}

.btn-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-status {
  background-color: #e8f5e9;
  color: #388e3c;
}

.btn-icon:hover:not(:disabled) {
  transform: translateY(-2px);
}

.empty-state {
  text-align: center;
  padding: 60px 20px !important;
}

.empty-state .icon-empty {
  font-size: 48px;
  color: #bdc3c7;
  margin-bottom: 20px;
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
}

.btn-secondary:hover {
  background-color: #e9ecef;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 20px;
}

.pagination-btn {
  padding: 10px 20px;
  background-color: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f8f9fa;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  font-size: 14px;
  color: #7f8c8d;
}

/* Styles pour les modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-sm {
  max-width: 500px;
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.btn-close {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #95a5a6;
  line-height: 1;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-row .form-group {
  flex: 1;
}

.status-options {
  display: flex;
  gap: 30px;
  margin-top: 10px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.radio-label input[type="radio"] {
  display: none;
}

.radio-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #bdc3c7;
  border-radius: 50%;
  position: relative;
}

.radio-label input[type="radio"]:checked + .radio-custom {
  border-color: #3498db;
}

.radio-label input[type="radio"]:checked + .radio-custom::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  background-color: #3498db;
  border-radius: 50%;
}

.thumbnail-upload {
  margin-top: 10px;
}

.thumbnail-preview {
  width: 100px;
  height: 70px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 15px;
  border: 2px dashed #e0e0e0;
}

.upload-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #f8f9fa;
  border: 2px dashed #bdc3c7;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-label:hover {
  background-color: #e9ecef;
}

.warning-text {
  color: #dc3545;
  background-color: #f8d7da;
  padding: 12px;
  border-radius: 8px;
  margin: 15px 0;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-danger:hover {
  background-color: #c82333;
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .management-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-options {
    flex-direction: column;
  }

  .search-bar {
    min-width: 100%;
  }

  .actions-cell {
    flex-wrap: wrap;
    gap: 5px;
  }

  .courses-table {
    display: block;
    overflow-x: auto;
  }
}
</style>