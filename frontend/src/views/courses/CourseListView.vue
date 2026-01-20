<template>
  <div class="course-list-view">
    <!-- Hero Section avec recherche -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Découvrez votre prochaine compétence</h1>
        <p class="hero-subtitle">Apprenez avec les meilleurs experts d'Afrique francophone</p>

        <!-- Barre de recherche principale -->
        <div class="search-container">
          <div class="search-bar">
            <i class="icon-search"></i>
            <input
                type="text"
                v-model="searchQuery"
                placeholder="Rechercher un cours, une compétence, un professeur..."
                class="search-input"
                @keyup.enter="performSearch"
            >
            <button class="search-btn" @click="performSearch">
              Rechercher
            </button>
          </div>
          <div class="search-suggestions" v-if="showSuggestions && searchQuery">
            <div
                v-for="suggestion in searchSuggestions"
                :key="suggestion"
                class="suggestion-item"
                @click="selectSuggestion(suggestion)"
            >
              <i class="icon-search"></i>
              <span>{{ suggestion }}</span>
            </div>
          </div>
        </div>

        <!-- Filtres rapides -->
        <div class="quick-filters">
          <span class="filter-label">Populaire :</span>
          <button
              v-for="filter in quickFilters"
              :key="filter.id"
              class="quick-filter"
              :class="{ active: activeQuickFilter === filter.id }"
              @click="toggleQuickFilter(filter.id)"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>
    </section>

    <!-- Contenu principal -->
    <div class="main-container">
      <!-- Sidebar des filtres -->
      <aside class="filters-sidebar">
        <div class="filters-section">
          <h3 class="filters-title">
            <i class="icon-filter"></i>
            Filtres
          </h3>

          <!-- Filtre par catégorie -->
          <div class="filter-group">
            <h4 class="filter-group-title">Catégories</h4>
            <div class="category-list">
              <label
                  v-for="category in categories"
                  :key="category.id"
                  class="category-item"
              >
                <input
                    type="checkbox"
                    :value="category.id"
                    v-model="selectedCategories"
                    @change="applyFilters"
                >
                <span class="category-name">{{ category.name }}</span>
                <span class="category-count">({{ category.count }})</span>
              </label>
            </div>
          </div>

          <!-- Filtre par niveau -->
          <div class="filter-group">
            <h4 class="filter-group-title">Niveau</h4>
            <div class="level-list">
              <label
                  v-for="level in levels"
                  :key="level.id"
                  class="level-item"
              >
                <input
                    type="radio"
                    name="level"
                    :value="level.id"
                    v-model="selectedLevel"
                    @change="applyFilters"
                >
                <span class="level-name">{{ level.name }}</span>
              </label>
            </div>
          </div>

          <!-- Filtre par durée -->
          <div class="filter-group">
            <h4 class="filter-group-title">Durée</h4>
            <div class="duration-list">
              <label
                  v-for="duration in durations"
                  :key="duration.id"
                  class="duration-item"
              >
                <input
                    type="radio"
                    name="duration"
                    :value="duration.id"
                    v-model="selectedDuration"
                    @change="applyFilters"
                >
                <span class="duration-name">{{ duration.name }}</span>
              </label>
            </div>
          </div>

          <!-- Filtre par prix -->
          <div class="filter-group">
            <h4 class="filter-group-title">Prix</h4>
            <div class="price-filters">
              <div class="price-range">
                <span>0 FCFA</span>
                <span>{{ maxPrice.toLocaleString() }} FCFA</span>
              </div>
              <input
                  type="range"
                  v-model="selectedPrice"
                  :min="0"
                  :max="maxPrice"
                  step="5000"
                  class="price-slider"
                  @input="updatePrice"
              >
              <div class="selected-price">
                Jusqu'à : <strong>{{ selectedPrice.toLocaleString() }} FCFA</strong>
              </div>
            </div>
          </div>

          <!-- Filtre par format -->
          <div class="filter-group">
            <h4 class="filter-group-title">Format</h4>
            <div class="format-list">
              <label
                  v-for="format in formats"
                  :key="format.id"
                  class="format-item"
              >
                <input
                    type="checkbox"
                    :value="format.id"
                    v-model="selectedFormats"
                    @change="applyFilters"
                >
                <span class="format-name">{{ format.name }}</span>
              </label>
            </div>
          </div>

          <button class="btn-reset" @click="resetFilters">
            <i class="icon-reset"></i>
            Réinitialiser les filtres
          </button>
        </div>

        <!-- Cours en promotion -->
        <div class="promo-sidebar" v-if="featuredCourses.length > 0">
          <h3 class="promo-title">
            <i class="icon-flame"></i>
            Cours en vedette
          </h3>
          <div class="promo-courses">
            <div
                v-for="course in featuredCourses"
                :key="course.id"
                class="promo-course"
                @click="viewCourse(course.id)"
            >
              <img
                  :src="course.thumbnail"
                  :alt="course.title"
                  class="promo-thumbnail"
              >
              <div class="promo-info">
                <h4 class="promo-course-title">{{ course.title }}</h4>
                <div class="promo-price">
                  <span class="original-price" v-if="course.originalPrice">
                    {{ course.originalPrice.toLocaleString() }} FCFA
                  </span>
                  <span class="current-price">
                    {{ course.price.toLocaleString() }} FCFA
                  </span>
                </div>
                <div class="promo-rating">
                  <span class="stars">
                    <i
                        v-for="n in 5"
                        :key="n"
                        :class="n <= course.rating ? 'icon-star-filled' : 'icon-star-empty'"
                    ></i>
                  </span>
                  <span class="rating-value">{{ course.rating.toFixed(1) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Contenu des cours -->
      <main class="courses-content">
        <!-- En-tête avec tri et affichage -->
        <div class="courses-header">
          <div class="results-info">
            <h2 class="results-title">Cours disponibles</h2>
            <p class="results-count">
              {{ filteredCourses.length }} cours trouvés
              <span v-if="searchQuery"> pour "{{ searchQuery }}"</span>
            </p>
          </div>

          <div class="sort-options">
            <select v-model="sortBy" class="sort-select" @change="applySorting">
              <option value="popularity">Plus populaires</option>
              <option value="newest">Plus récents</option>
              <option value="rating">Meilleures notes</option>
              <option value="price-low">Prix croissant</option>
              <option value="price-high">Prix décroissant</option>
            </select>

            <div class="view-toggle">
              <button
                  class="view-btn"
                  :class="{ active: viewMode === 'grid' }"
                  @click="viewMode = 'grid'"
                  title="Vue grille"
              >
                <i class="icon-grid"></i>
              </button>
              <button
                  class="view-btn"
                  :class="{ active: viewMode === 'list' }"
                  @click="viewMode = 'list'"
                  title="Vue liste"
              >
                <i class="icon-list"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Liste des cours -->
        <div v-if="filteredCourses.length > 0" class="courses-container">
          <!-- Vue grille -->
          <div
              v-if="viewMode === 'grid'"
              class="courses-grid"
          >
            <div
                v-for="course in paginatedCourses"
                :key="course.id"
                class="course-card"
                @click="viewCourse(course.id)"
            >
              <!-- Badge promotion -->
              <div v-if="course.discount" class="course-badge discount">
                -{{ course.discount }}%
              </div>
              <div v-if="course.isNew" class="course-badge new">
                Nouveau
              </div>

              <!-- Image du cours -->
              <div class="course-image">
                <img
                    :src="course.thumbnail"
                    :alt="course.title"
                    class="course-thumbnail"
                >
                <div class="course-overlay">
                  <button class="btn-preview" @click.stop="previewCourse(course)">
                    <i class="icon-play"></i>
                    Aperçu
                  </button>
                </div>
              </div>

              <!-- Informations du cours -->
              <div class="course-info">
                <div class="course-category">
                  <span class="category-tag" :class="course.category">
                    {{ getCategoryName(course.category) }}
                  </span>
                  <span class="course-level">{{ course.level }}</span>
                </div>

                <h3 class="course-title">{{ course.title }}</h3>

                <div class="course-description">
                  {{ course.description }}
                </div>

                <div class="course-meta">
                  <div class="meta-item">
                    <i class="icon-video"></i>
                    <span>{{ course.videoCount }} vidéos</span>
                  </div>
                  <div class="meta-item">
                    <i class="icon-clock"></i>
                    <span>{{ course.duration }}</span>
                  </div>
                  <div class="meta-item">
                    <i class="icon-students"></i>
                    <span>{{ course.enrolled.toLocaleString() }}</span>
                  </div>
                </div>

                <div class="course-footer">
                  <div class="course-rating">
                    <span class="stars">
                      <i
                          v-for="n in 5"
                          :key="n"
                          :class="n <= Math.round(course.rating) ? 'icon-star-filled' : 'icon-star-empty'"
                      ></i>
                    </span>
                    <span class="rating-value">{{ course.rating.toFixed(1) }}</span>
                    <span class="rating-count">({{ course.reviewCount }})</span>
                  </div>

                  <div class="course-pricing">
                    <div v-if="course.originalPrice" class="original-price">
                      {{ course.originalPrice.toLocaleString() }} FCFA
                    </div>
                    <div class="current-price">
                      {{ course.price.toLocaleString() }} FCFA
                    </div>
                  </div>
                </div>
              </div>

              <!-- Actions rapides -->
              <div class="course-actions">
                <button
                    v-if="isEnrolled(course.id)"
                    class="btn-continue"
                    @click.stop="continueCourse(course.id)"
                >
                  <i class="icon-play"></i>
                  Continuer
                </button>
                <button
                    v-else-if="course.isFree"
                    class="btn-enroll-free"
                    @click.stop="enrollCourse(course.id)"
                >
                  S'inscrire gratuitement
                </button>
                <button
                    v-else
                    class="btn-enroll"
                    @click.stop="enrollCourse(course.id)"
                >
                  <i class="icon-cart"></i>
                  S'inscrire
                </button>

                <button
                    class="btn-wishlist"
                    :class="{ active: isInWishlist(course.id) }"
                    @click.stop="toggleWishlist(course.id)"
                    :title="isInWishlist(course.id) ? 'Retirer de la liste de souhaits' : 'Ajouter à la liste de souhaits'"
                >
                  <i :class="isInWishlist(course.id) ? 'icon-heart-filled' : 'icon-heart'"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Vue liste -->
          <div
              v-else
              class="courses-list"
          >
            <div
                v-for="course in paginatedCourses"
                :key="course.id"
                class="course-list-item"
                @click="viewCourse(course.id)"
            >
              <div class="list-item-left">
                <img
                    :src="course.thumbnail"
                    :alt="course.title"
                    class="list-thumbnail"
                >
                <div class="list-badges">
                  <div v-if="course.discount" class="list-badge discount">
                    -{{ course.discount }}%
                  </div>
                  <div v-if="course.isNew" class="list-badge new">
                    Nouveau
                  </div>
                </div>
              </div>

              <div class="list-item-center">
                <div class="list-category">
                  <span class="category-tag" :class="course.category">
                    {{ getCategoryName(course.category) }}
                  </span>
                  <span class="course-level">{{ course.level }}</span>
                </div>

                <h3 class="list-title">{{ course.title }}</h3>

                <div class="list-description">
                  {{ course.description }}
                </div>

                <div class="list-instructor">
                  <img
                      :src="course.instructor.avatar"
                      :alt="course.instructor.name"
                      class="instructor-avatar"
                  >
                  <span class="instructor-name">{{ course.instructor.name }}</span>
                  <span class="instructor-title">{{ course.instructor.title }}</span>
                </div>

                <div class="list-meta">
                  <div class="meta-item">
                    <i class="icon-video"></i>
                    <span>{{ course.videoCount }} vidéos</span>
                  </div>
                  <div class="meta-item">
                    <i class="icon-clock"></i>
                    <span>{{ course.duration }}</span>
                  </div>
                  <div class="meta-item">
                    <i class="icon-students"></i>
                    <span>{{ course.enrolled.toLocaleString() }} étudiants</span>
                  </div>
                  <div class="meta-item">
                    <i class="icon-check"></i>
                    <span>{{ course.completionRate }}% complété</span>
                  </div>
                </div>

                <div class="list-rating">
                  <span class="stars">
                    <i
                        v-for="n in 5"
                        :key="n"
                        :class="n <= Math.round(course.rating) ? 'icon-star-filled' : 'icon-star-empty'"
                    ></i>
                  </span>
                  <span class="rating-value">{{ course.rating.toFixed(1) }}</span>
                  <span class="rating-count">({{ course.reviewCount }} avis)</span>
                </div>
              </div>

              <div class="list-item-right">
                <div class="list-pricing">
                  <div v-if="course.originalPrice" class="original-price">
                    {{ course.originalPrice.toLocaleString() }} FCFA
                  </div>
                  <div class="current-price">
                    {{ course.price.toLocaleString() }} FCFA
                  </div>
                  <div v-if="course.isFree" class="free-badge">
                    Gratuit
                  </div>
                </div>

                <div class="list-actions">
                  <button
                      v-if="isEnrolled(course.id)"
                      class="btn-continue"
                      @click.stop="continueCourse(course.id)"
                  >
                    <i class="icon-play"></i>
                    Continuer
                  </button>
                  <button
                      v-else-if="course.isFree"
                      class="btn-enroll-free"
                      @click.stop="enrollCourse(course.id)"
                  >
                    S'inscrire gratuitement
                  </button>
                  <button
                      v-else
                      class="btn-enroll"
                      @click.stop="enrollCourse(course.id)"
                  >
                    <i class="icon-cart"></i>
                    S'inscrire
                  </button>

                  <button
                      class="btn-wishlist"
                      :class="{ active: isInWishlist(course.id) }"
                      @click.stop="toggleWishlist(course.id)"
                  >
                    <i :class="isInWishlist(course.id) ? 'icon-heart-filled' : 'icon-heart'"></i>
                  </button>

                  <button
                      class="btn-compare"
                      @click.stop="addToCompare(course.id)"
                      :title="isInCompare(course.id) ? 'Retirer de la comparaison' : 'Ajouter à la comparaison'"
                  >
                    <i :class="isInCompare(course.id) ? 'icon-compare-active' : 'icon-compare'"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div class="pagination" v-if="totalPages > 1">
            <button
                class="pagination-btn"
                :disabled="currentPage === 1"
                @click="currentPage--"
            >
              <i class="icon-chevron-left"></i>
              Précédent
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
              <span v-if="showEllipsis" class="page-ellipsis">...</span>
            </div>

            <button
                class="pagination-btn"
                :disabled="currentPage === totalPages"
                @click="currentPage++"
            >
              Suivant
              <i class="icon-chevron-right"></i>
            </button>
          </div>
        </div>

        <!-- Aucun résultat -->
        <div v-else class="empty-state">
          <div class="empty-icon">
            <i class="icon-search-empty"></i>
          </div>
          <h3 class="empty-title">Aucun cours trouvé</h3>
          <p class="empty-message">
            Aucun cours ne correspond à vos critères de recherche. Essayez de :
          </p>
          <div class="empty-suggestions">
            <button class="btn-suggestion" @click="resetFilters">
              Réinitialiser tous les filtres
            </button>
            <button class="btn-suggestion" @click="clearSearch">
              Effacer la recherche
            </button>
            <button class="btn-suggestion" @click="viewAllCourses">
              Voir tous les cours
            </button>
          </div>
        </div>
      </main>
    </div>

    <!-- Modal d'aperçu du cours -->
    <div class="modal-overlay" v-if="showPreviewModal">
      <div class="modal modal-preview">
        <div class="modal-header">
          <h2>Aperçu du cours</h2>
          <button class="btn-close" @click="showPreviewModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="previewCourseData" class="preview-content">
            <div class="preview-video">
              <!-- Intégrer lecteur vidéo ici -->
              <div class="video-placeholder">
                <i class="icon-play-large"></i>
                <p>Aperçu vidéo du cours</p>
              </div>
            </div>
            <div class="preview-info">
              <h3>{{ previewCourseData.title }}</h3>
              <div class="preview-description">
                {{ previewCourseData.description }}
              </div>
              <div class="preview-instructor">
                <img
                    :src="previewCourseData.instructor.avatar"
                    :alt="previewCourseData.instructor.name"
                    class="instructor-avatar"
                >
                <div class="instructor-info">
                  <h4>{{ previewCourseData.instructor.name }}</h4>
                  <p>{{ previewCourseData.instructor.title }}</p>
                </div>
              </div>
              <div class="preview-features">
                <div class="feature-item">
                  <i class="icon-video"></i>
                  <span>{{ previewCourseData.videoCount }} vidéos</span>
                </div>
                <div class="feature-item">
                  <i class="icon-clock"></i>
                  <span>{{ previewCourseData.duration }}</span>
                </div>
                <div class="feature-item">
                  <i class="icon-certificate"></i>
                  <span>Certificat inclus</span>
                </div>
                <div class="feature-item">
                  <i class="icon-mobile"></i>
                  <span>Accès mobile</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showPreviewModal = false">
            Fermer
          </button>
          <button class="btn-primary" @click="enrollCourse(previewCourseData.id)">
            S'inscrire maintenant
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// États de recherche et filtres
const searchQuery = ref('')
const showSuggestions = ref(false)
const activeQuickFilter = ref(null)
const viewMode = ref('grid')
const sortBy = ref('popularity')
const currentPage = ref(1)
const itemsPerPage = 12

// Filtres
const selectedCategories = ref([])
const selectedLevel = ref('all')
const selectedDuration = ref('all')
const selectedPrice = ref(50000)
const selectedFormats = ref([])
const maxPrice = 100000

// Modal
const showPreviewModal = ref(false)
const previewCourseData = ref(null)

// Données simulées
const quickFilters = ref([
  { id: 'popular', label: 'Populaire' },
  { id: 'new', label: 'Nouveautés' },
  { id: 'free', label: 'Gratuits' },
  { id: 'discount', label: 'Promotions' },
  { id: 'certificate', label: 'Avec certificat' }
])

const categories = ref([
  { id: 'programming', name: 'Programmation', count: 48 },
  { id: 'math', name: 'Mathématiques', count: 32 },
  { id: 'science', name: 'Sciences', count: 25 },
  { id: 'business', name: 'Business', count: 41 },
  { id: 'language', name: 'Langues', count: 28 },
  { id: 'art', name: 'Arts & Design', count: 19 },
  { id: 'personal', name: 'Développement personnel', count: 22 }
])

const levels = ref([
  { id: 'all', name: 'Tous les niveaux' },
  { id: 'beginner', name: 'Débutant' },
  { id: 'intermediate', name: 'Intermédiaire' },
  { id: 'advanced', name: 'Avancé' }
])

const durations = ref([
  { id: 'all', name: 'Toutes les durées' },
  { id: 'short', name: '< 5 heures' },
  { id: 'medium', name: '5-10 heures' },
  { id: 'long', name: '10+ heures' }
])

const formats = ref([
  { id: 'video', name: 'Vidéo' },
  { id: 'live', name: 'En direct' },
  { id: 'text', name: 'Texte' },
  { id: 'interactive', name: 'Interactif' }
])

const searchSuggestions = computed(() => {
  const query = searchQuery.value.toLowerCase()
  if (query.length < 2) return []

  const suggestions = [
    'JavaScript pour débutants',
    'Python avancé',
    'Mathématiques financières',
    'Développement web',
    'Marketing digital',
    'Anglais des affaires'
  ]

  return suggestions.filter(s => s.toLowerCase().includes(query))
})

const courses = ref([
  {
    id: 1,
    title: 'Introduction à JavaScript - De Zéro à Héros',
    description: 'Maîtrisez les bases de JavaScript avec des projets pratiques pour le web moderne.',
    category: 'programming',
    level: 'Débutant',
    price: 25000,
    originalPrice: 35000,
    discount: 29,
    rating: 4.8,
    reviewCount: 1245,
    enrolled: 5421,
    videoCount: 45,
    duration: '15h 30min',
    completionRate: 78,
    thumbnail: '/images/cs-course.jpg',
    isNew: true,
    isFree: false,
    instructor: {
      id: 1,
      name: 'Dr. Jean Dupont',
      title: 'Expert en développement web',
      avatar: '/images/avatar1.jpg'
    }
  },
  {
    id: 2,
    title: 'Algèbre Avancée pour l\'Ingénierie',
    description: 'Concepts avancés d\'algèbre linéaire appliqués aux sciences de l\'ingénieur.',
    category: 'math',
    level: 'Avancé',
    price: 15000,
    originalPrice: null,
    discount: 0,
    rating: 4.9,
    reviewCount: 842,
    enrolled: 3125,
    videoCount: 32,
    duration: '12h 45min',
    completionRate: 82,
    thumbnail: '/images/math-course.jpg',
    isNew: false,
    isFree: false,
    instructor: {
      id: 2,
      name: 'Prof. Marie Curie',
      title: 'Docteur en Mathématiques',
      avatar: '/images/avatar2.jpg'
    }
  },
  {
    id: 3,
    title: 'Python pour la Data Science',
    description: 'Apprenez Python, NumPy, Pandas et Matplotlib pour l\'analyse de données.',
    category: 'programming',
    level: 'Intermédiaire',
    price: 30000,
    originalPrice: 40000,
    discount: 25,
    rating: 4.7,
    reviewCount: 956,
    enrolled: 4123,
    videoCount: 52,
    duration: '18h 20min',
    completionRate: 71,
    thumbnail: '/images/cs-course.jpg',
    isNew: false,
    isFree: false,
    instructor: {
      id: 3,
      name: 'Dr. Albert Einstein',
      title: 'Data Scientist senior',
      avatar: '/images/avatar3.jpg'
    }
  },
  {
    id: 4,
    title: 'Anglais des Affaires Gratuit',
    description: 'Communiquez efficacement en anglais dans un contexte professionnel.',
    category: 'language',
    level: 'Tous niveaux',
    price: 0,
    originalPrice: null,
    discount: 0,
    rating: 4.6,
    reviewCount: 2104,
    enrolled: 12542,
    videoCount: 28,
    duration: '8h 15min',
    completionRate: 65,
    thumbnail: '/images/language-course.jpg',
    isNew: false,
    isFree: true,
    instructor: {
      id: 4,
      name: 'Prof. Sarah Johnson',
      title: 'Formatrice en anglais professionnel',
      avatar: '/images/avatar4.jpg'
    }
  },
  {
    id: 5,
    title: 'Marketing Digital - Les Fondamentaux',
    description: 'Maîtrisez les bases du marketing digital et des réseaux sociaux.',
    category: 'business',
    level: 'Débutant',
    price: 20000,
    originalPrice: 25000,
    discount: 20,
    rating: 4.5,
    reviewCount: 743,
    enrolled: 2847,
    videoCount: 36,
    duration: '10h 10min',
    completionRate: 74,
    thumbnail: '/images/business-course.jpg',
    isNew: true,
    isFree: false,
    instructor: {
      id: 5,
      name: 'Kofi Mensah',
      title: 'Expert en marketing digital',
      avatar: '/images/avatar5.jpg'
    }
  },
  // Plus de cours...
])

const featuredCourses = computed(() => {
  return courses.value
      .filter(course => course.rating >= 4.7)
      .slice(0, 3)
})

// Wishlist et comparaison (simulé)
const wishlist = ref([1, 3])
const compareList = ref([2])

// Computed properties
const filteredCourses = computed(() => {
  let filtered = courses.value

  // Filtre par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.instructor.name.toLowerCase().includes(query)
    )
  }

  // Filtre rapide
  if (activeQuickFilter.value) {
    switch (activeQuickFilter.value) {
      case 'popular':
        filtered = filtered.filter(c => c.enrolled > 3000)
        break
      case 'new':
        filtered = filtered.filter(c => c.isNew)
        break
      case 'free':
        filtered = filtered.filter(c => c.isFree)
        break
      case 'discount':
        filtered = filtered.filter(c => c.discount > 0)
        break
      case 'certificate':
        filtered = filtered.filter(c => c.completionRate > 70)
        break
    }
  }

  // Filtre par catégories
  if (selectedCategories.value.length > 0) {
    filtered = filtered.filter(course =>
        selectedCategories.value.includes(course.category)
    )
  }

  // Filtre par niveau
  if (selectedLevel.value !== 'all') {
    filtered = filtered.filter(course =>
        course.level.toLowerCase().includes(selectedLevel.value)
    )
  }

  // Filtre par durée
  if (selectedDuration.value !== 'all') {
    const durationMap = {
      'short': 5,
      'medium': 10,
      'long': Infinity
    }
    const maxHours = durationMap[selectedDuration.value]
    filtered = filtered.filter(course => {
      const hours = parseFloat(course.duration)
      return hours < maxHours
    })
  }

  // Filtre par prix
  filtered = filtered.filter(course => course.price <= selectedPrice.value)

  // Filtre par format (simulé)
  if (selectedFormats.value.length > 0) {
    filtered = filtered // À adapter selon les formats réels
  }

  // Tri
  return applySortingTo(filtered)
})

const applySortingTo = (coursesList) => {
  const sorted = [...coursesList]

  switch (sortBy.value) {
    case 'popularity':
      return sorted.sort((a, b) => b.enrolled - a.enrolled)
    case 'newest':
      return sorted.sort((a, b) => b.id - a.id)
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating)
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price)
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price)
    default:
      return sorted
  }
}

const paginatedCourses = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredCourses.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredCourses.value.length / itemsPerPage)
})

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

const showEllipsis = computed(() => {
  return totalPages.value > 5 && currentPage.value < totalPages.value - 2
})

// Méthodes utilitaires
const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.name : categoryId
}

const isEnrolled = (courseId) => {
  // Simulé - à remplacer par la logique réelle
  return courseId % 3 === 0
}

const isInWishlist = (courseId) => {
  return wishlist.value.includes(courseId)
}

const isInCompare = (courseId) => {
  return compareList.value.includes(courseId)
}

// Actions
const performSearch = () => {
  showSuggestions.value = false
  currentPage.value = 1
  console.log('Recherche:', searchQuery.value)
}

const selectSuggestion = (suggestion) => {
  searchQuery.value = suggestion
  performSearch()
}

const toggleQuickFilter = (filterId) => {
  activeQuickFilter.value = activeQuickFilter.value === filterId ? null : filterId
  currentPage.value = 1
}

const applyFilters = () => {
  currentPage.value = 1
}

const applySorting = () => {
  currentPage.value = 1
}

const updatePrice = () => {
  // Délai pour éviter trop de recalculs
  clearTimeout(priceTimeout)
  priceTimeout = setTimeout(applyFilters, 300)
}

let priceTimeout = null

const resetFilters = () => {
  searchQuery.value = ''
  activeQuickFilter.value = null
  selectedCategories.value = []
  selectedLevel.value = 'all'
  selectedDuration.value = 'all'
  selectedPrice.value = maxPrice
  selectedFormats.value = []
  currentPage.value = 1
}

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
}

const viewAllCourses = () => {
  resetFilters()
}

const viewCourse = (courseId) => {
  router.push(`/courses/${courseId}`)
}

const previewCourse = (course) => {
  previewCourseData.value = course
  showPreviewModal.value = true
}

const continueCourse = (courseId) => {
  router.push(`/courses/${courseId}/learn`)
}

const enrollCourse = (courseId) => {
  console.log('Inscription au cours:', courseId)
  // Logique d'inscription
  if (courseId === 4) { // Cours gratuit
    router.push(`/courses/${courseId}/learn`)
  } else {
    router.push(`/payment/checkout?course=${courseId}`)
  }
}

const toggleWishlist = (courseId) => {
  const index = wishlist.value.indexOf(courseId)
  if (index > -1) {
    wishlist.value.splice(index, 1)
  } else {
    wishlist.value.push(courseId)
  }
}

const addToCompare = (courseId) => {
  const index = compareList.value.indexOf(courseId)
  if (index > -1) {
    compareList.value.splice(index, 1)
  } else {
    compareList.value.push(courseId)
  }
}

onMounted(() => {
  console.log('CourseListView monté')
})
</script>

<style scoped>
.course-list-view {
  min-height: 100vh;
  background-color: #f8f9fa;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #3498db 0%, #2c3e50 100%);
  color: white;
  padding: 60px 20px;
  text-align: center;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
}

.hero-title {
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 16px;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 18px;
  opacity: 0.9;
  margin-bottom: 40px;
}

.search-container {
  max-width: 700px;
  margin: 0 auto 30px;
  position: relative;
}

.search-bar {
  display: flex;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.search-bar i {
  padding: 0 20px;
  color: #7f8c8d;
  display: flex;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 20px 0;
  border: none;
  font-size: 16px;
  outline: none;
}

.search-btn {
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 0 30px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-btn:hover {
  background-color: #27ae60;
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  z-index: 100;
  overflow: hidden;
}

.suggestion-item {
  padding: 15px 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  transition: background-color 0.3s;
  color: #2c3e50;
}

.suggestion-item:hover {
  background-color: #f8f9fa;
}

.suggestion-item i {
  color: #3498db;
}

.quick-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
  align-items: center;
}

.filter-label {
  font-weight: 600;
  font-size: 14px;
  opacity: 0.8;
}

.quick-filter {
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.quick-filter:hover {
  background: rgba(255, 255, 255, 0.2);
}

.quick-filter.active {
  background: white;
  color: #3498db;
  border-color: white;
}

/* Layout principal */
.main-container {
  max-width: 1400px;
  margin: 40px auto;
  padding: 0 20px;
  display: flex;
  gap: 30px;
}

/* Sidebar des filtres */
.filters-sidebar {
  width: 280px;
  flex-shrink: 0;
}

.filters-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.filters-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 25px 0;
  color: #2c3e50;
  font-size: 18px;
}

.filter-group {
  margin-bottom: 25px;
}

.filter-group-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 15px;
  display: block;
}

.category-list,
.level-list,
.duration-list,
.format-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-item,
.level-item,
.duration-item,
.format-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 0;
  color: #5d6d7e;
  transition: color 0.3s;
}

.category-item:hover,
.level-item:hover,
.duration-item:hover,
.format-item:hover {
  color: #3498db;
}

.category-item input[type="checkbox"],
.format-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.level-item input[type="radio"],
.duration-item input[type="radio"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.category-name,
.level-name,
.duration-name,
.format-name {
  flex: 1;
}

.category-count {
  color: #95a5a6;
  font-size: 14px;
}

.price-filters {
  padding: 10px 0;
}

.price-range {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 10px;
}

.price-slider {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  background: #e0e0e0;
  border-radius: 3px;
  outline: none;
  margin: 15px 0;
}

.price-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  background: #3498db;
  border-radius: 50%;
  cursor: pointer;
}

.selected-price {
  text-align: center;
  font-size: 14px;
  color: #2c3e50;
  margin-top: 10px;
}

.selected-price strong {
  color: #2ecc71;
  font-size: 16px;
}

.btn-reset {
  width: 100%;
  padding: 12px;
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  color: #2c3e50;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s;
  margin-top: 10px;
}

.btn-reset:hover {
  background: #e9ecef;
}

/* Promo sidebar */
.promo-sidebar {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.promo-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 18px;
}

.promo-courses {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.promo-course {
  display: flex;
  gap: 15px;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.promo-course:hover {
  background-color: #f8f9fa;
}

.promo-thumbnail {
  width: 80px;
  height: 60px;
  border-radius: 6px;
  object-fit: cover;
}

.promo-info {
  flex: 1;
}

.promo-course-title {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 5px;
  line-height: 1.3;
}

.promo-price {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.original-price {
  font-size: 12px;
  color: #e74c3c;
  text-decoration: line-through;
}

.current-price {
  font-size: 14px;
  font-weight: 700;
  color: #2ecc71;
}

.promo-rating {
  display: flex;
  align-items: center;
  gap: 5px;
}

.promo-rating .stars i {
  font-size: 12px;
  color: #f39c12;
}

.rating-value {
  font-size: 12px;
  color: #7f8c8d;
}

/* Contenu des cours */
.courses-content {
  flex: 1;
}

.courses-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.results-title {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 24px;
}

.results-count {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 20px;
}

.sort-select {
  padding: 10px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  min-width: 200px;
}

.view-toggle {
  display: flex;
  gap: 5px;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 4px;
}

.view-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7f8c8d;
  font-size: 18px;
  transition: all 0.3s;
}

.view-btn.active {
  background: white;
  color: #3498db;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

/* Vue grille */
.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.course-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 3px 15px rgba(0,0,0,0.08);
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}

.course-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  z-index: 2;
}

.course-badge.discount {
  background-color: #e74c3c;
  color: white;
}

.course-badge.new {
  background-color: #2ecc71;
  color: white;
}

.course-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.course-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.course-card:hover .course-thumbnail {
  transform: scale(1.05);
}

.course-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.course-card:hover .course-overlay {
  opacity: 1;
}

.btn-preview {
  padding: 10px 20px;
  background: white;
  color: #3498db;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-preview:hover {
  background: #3498db;
  color: white;
}

.course-info {
  padding: 20px;
}

.course-category {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.category-tag {
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 600;
}

.category-tag.programming {
  background-color: #e3f2fd;
  color: #1976d2;
}

.category-tag.math {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.category-tag.science {
  background-color: #e8f5e9;
  color: #388e3c;
}

.category-tag.business {
  background-color: #fff3e0;
  color: #f57c00;
}

.category-tag.language {
  background-color: #fce4ec;
  color: #c2185b;
}

.course-level {
  font-size: 12px;
  color: #7f8c8d;
  background: #f8f9fa;
  padding: 4px 10px;
  border-radius: 12px;
}

.course-title {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 12px 0;
  line-height: 1.3;
}

.course-description {
  font-size: 14px;
  color: #5d6d7e;
  margin-bottom: 20px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eef0f2;
}

.meta-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  color: #7f8c8d;
  font-size: 12px;
}

.meta-item i {
  font-size: 16px;
  color: #3498db;
}

.course-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-rating {
  display: flex;
  align-items: center;
  gap: 5px;
}

.course-rating .stars i {
  font-size: 14px;
  color: #f39c12;
}

.rating-value {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.rating-count {
  font-size: 12px;
  color: #7f8c8d;
}

.course-pricing {
  text-align: right;
}

.original-price {
  font-size: 12px;
  color: #e74c3c;
  text-decoration: line-through;
  margin-bottom: 2px;
}

.current-price {
  font-size: 20px;
  font-weight: 700;
  color: #2ecc71;
}

.course-actions {
  padding: 0 20px 20px;
  display: flex;
  gap: 10px;
}

.btn-continue,
.btn-enroll-free,
.btn-enroll {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-continue {
  background-color: #3498db;
  color: white;
  border: none;
}

.btn-continue:hover {
  background-color: #2980b9;
}

.btn-enroll-free {
  background-color: #2ecc71;
  color: white;
  border: none;
}

.btn-enroll-free:hover {
  background-color: #27ae60;
}

.btn-enroll {
  background-color: #f8f9fa;
  color: #2c3e50;
  border: 2px solid #e0e0e0;
}

.btn-enroll:hover {
  background-color: #e9ecef;
}

.btn-wishlist {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  background: white;
  color: #7f8c8d;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-wishlist:hover,
.btn-wishlist.active {
  border-color: #e74c3c;
  color: #e74c3c;
}

/* Vue liste */
.courses-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
}

.course-list-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 20px;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  transition: all 0.3s;
}

.course-list-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
}

.list-item-left {
  position: relative;
  flex-shrink: 0;
}

.list-thumbnail {
  width: 200px;
  height: 120px;
  border-radius: 8px;
  object-fit: cover;
}

.list-badges {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.list-badge {
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 11px;
  font-weight: 700;
  color: white;
}

.list-badge.discount {
  background-color: #e74c3c;
}

.list-badge.new {
  background-color: #2ecc71;
}

.list-item-center {
  flex: 1;
  min-width: 0;
}

.list-category {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.list-title {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 10px 0;
  line-height: 1.3;
}

.list-description {
  font-size: 14px;
  color: #5d6d7e;
  margin-bottom: 15px;
  line-height: 1.5;
}

.list-instructor {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.instructor-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
}

.instructor-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.instructor-title {
  font-size: 12px;
  color: #7f8c8d;
}

.list-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.list-rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.list-rating .stars i {
  font-size: 14px;
  color: #f39c12;
}

.list-item-right {
  width: 200px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
}

.list-pricing {
  text-align: right;
}

.list-pricing .original-price {
  font-size: 14px;
  margin-bottom: 4px;
}

.list-pricing .current-price {
  font-size: 24px;
  margin-bottom: 8px;
}

.free-badge {
  background-color: #2ecc71;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
}

.list-actions {
  display: flex;
  gap: 10px;
}

.btn-compare {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  background: white;
  color: #7f8c8d;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-compare:hover {
  border-color: #3498db;
  color: #3498db;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 30px 0;
}

.pagination-btn {
  padding: 10px 20px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2c3e50;
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
  display: flex;
  gap: 5px;
}

.page-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  background: white;
  cursor: pointer;
  font-weight: 600;
  color: #2c3e50;
  transition: all 0.3s;
}

.page-btn:hover {
  background-color: #f8f9fa;
}

.page-btn.active {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.page-ellipsis {
  display: flex;
  align-items: center;
  padding: 0 10px;
  color: #7f8c8d;
}

/* Empty state */
.empty-state {
  background: white;
  border-radius: 12px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.empty-icon {
  font-size: 60px;
  color: #bdc3c7;
  margin-bottom: 20px;
}

.empty-title {
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 15px;
}

.empty-message {
  color: #7f8c8d;
  margin-bottom: 30px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.empty-suggestions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-suggestion {
  padding: 12px 24px;
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  color: #2c3e50;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-suggestion:hover {
  background: #e9ecef;
}

/* Modal d'aperçu */
.modal-preview {
  max-width: 900px;
}

.preview-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

.preview-video {
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.video-placeholder {
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  background: linear-gradient(135deg, #3498db 0%, #2c3e50 100%);
}

.video-placeholder i {
  font-size: 60px;
  margin-bottom: 20px;
}

.preview-info h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 22px;
}

.preview-description {
  color: #5d6d7e;
  margin-bottom: 20px;
  line-height: 1.6;
}

.preview-instructor {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.instructor-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.instructor-info h4 {
  margin: 0 0 5px 0;
  color: #2c3e50;
}

.instructor-info p {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

.preview-features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  color: #2c3e50;
}

.feature-item i {
  color: #3498db;
}

/* Responsive */
@media (max-width: 1024px) {
  .main-container {
    flex-direction: column;
  }

  .filters-sidebar {
    width: 100%;
  }

  .preview-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 32px;
  }

  .search-bar {
    flex-direction: column;
  }

  .search-input {
    padding: 15px;
  }

  .search-btn {
    padding: 15px;
  }

  .courses-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .sort-options {
    flex-direction: column;
    align-items: stretch;
  }

  .sort-select {
    width: 100%;
  }

  .course-list-item {
    flex-direction: column;
  }

  .list-item-left,
  .list-item-right {
    width: 100%;
  }

  .list-item-right {
    align-items: stretch;
  }

  .list-pricing {
    text-align: left;
    margin-bottom: 20px;
  }
}

@media (max-width: 576px) {
  .courses-grid {
    grid-template-columns: 1fr;
  }

  .quick-filters {
    flex-direction: column;
    align-items: flex-start;
  }

  .list-meta {
    flex-wrap: wrap;
  }
}
</style>