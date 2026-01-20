<template>
  <div class="assignment-view">
    <!-- En-tête -->
    <div class="assignment-header">
      <div class="container">
        <nav class="breadcrumb-nav">
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <router-link to="/courses">Cours</router-link>
            </li>
            <li class="breadcrumb-item">
              <router-link :to="`/courses/${course.id}`">{{ course.title }}</router-link>
            </li>
            <li class="breadcrumb-item active">Devoirs</li>
          </ol>
        </nav>

        <div class="header-content">
          <div class="header-left">
            <h1 class="page-title">Devoirs</h1>
            <p class="page-subtitle">Soumettez vos travaux et suivez vos progrès</p>
          </div>

          <div class="header-right">
            <div class="stats-summary">
              <div class="stat-item">
                <div class="stat-value">{{ completedAssignments }}/{{ totalAssignments }}</div>
                <div class="stat-label">Complétés</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ averageGrade }}%</div>
                <div class="stat-label">Moyenne</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ nextDeadline ? formatDate(nextDeadline) : 'Aucun' }}</div>
                <div class="stat-label">Prochaine échéance</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="assignment-container">
      <!-- Barre latérale -->
      <div class="assignment-sidebar">
        <div class="sidebar-section">
          <h3 class="section-title">Filtres</h3>
          <div class="filters">
            <button
                v-for="filter in assignmentFilters"
                :key="filter.value"
                class="filter-btn"
                :class="{ active: activeFilter === filter.value }"
                @click="activeFilter = filter.value"
            >
              <i :class="filter.icon"></i>
              {{ filter.label }}
              <span v-if="filter.count" class="filter-count">{{ filter.count }}</span>
            </button>
          </div>
        </div>

        <div class="sidebar-section">
          <h3 class="section-title">Statistiques</h3>
          <div class="stats-widget">
            <div class="progress-ring">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="#e0e0e0"
                    stroke-width="12"
                />
                <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    :stroke="completionColor"
                    stroke-width="12"
                    :stroke-dasharray="completionCircumference"
                    :stroke-dashoffset="completionOffset"
                    stroke-linecap="round"
                    transform="rotate(-90 60 60)"
                />
              </svg>
              <div class="progress-text">
                <span class="progress-percent">{{ completionRate }}%</span>
                <span class="progress-label">Complété</span>
              </div>
            </div>

            <div class="stats-details">
              <div class="stat-detail">
                <span class="stat-label">En retard</span>
                <span class="stat-value overdue">{{ overdueAssignments }}</span>
              </div>
              <div class="stat-detail">
                <span class="stat-label">À soumettre</span>
                <span class="stat-value pending">{{ pendingAssignments }}</span>
              </div>
              <div class="stat-detail">
                <span class="stat-label">Corrigés</span>
                <span class="stat-value graded">{{ gradedAssignments }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="sidebar-section">
          <h3 class="section-title">Dernières notes</h3>
          <div class="recent-grades">
            <div
                v-for="grade in recentGrades"
                :key="grade.id"
                class="grade-item"
            >
              <div class="grade-info">
                <h4>{{ grade.title }}</h4>
                <span class="grade-date">{{ grade.date }}</span>
              </div>
              <div class="grade-score" :class="getGradeClass(grade.score)">
                {{ grade.score }}%
              </div>
            </div>
          </div>
        </div>

        <div class="sidebar-section">
          <h3 class="section-title">Ressources utiles</h3>
          <div class="resources">
            <button class="resource-btn" @click="downloadTemplate">
              <i class="icon-download"></i>
              Modèle de devoir
            </button>
            <button class="resource-btn" @click="showGuidelines">
              <i class="icon-document"></i>
              Guide de rédaction
            </button>
            <button class="resource-btn" @click="showPlagiarismInfo">
              <i class="icon-warning"></i>
              Politique anti-plagiat
            </button>
          </div>
        </div>
      </div>

      <!-- Contenu principal -->
      <div class="assignment-main">
        <!-- En-tête des devoirs -->
        <div class="assignments-header">
          <div class="header-left">
            <h2 class="section-title">Tous les devoirs</h2>
            <div class="search-box">
              <i class="icon-search"></i>
              <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Rechercher un devoir..."
                  class="search-input"
              >
            </div>
          </div>
          <div class="header-right">
            <button class="btn-sort" @click="toggleSortMenu">
              <i class="icon-sort"></i>
              Trier par: {{ currentSort.label }}
              <i class="icon-chevron-down"></i>
            </button>
            <div v-if="showSortMenu" class="sort-menu">
              <button
                  v-for="option in sortOptions"
                  :key="option.value"
                  class="sort-option"
                  :class="{ active: currentSort.value === option.value }"
                  @click="changeSort(option)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Liste des devoirs -->
        <div class="assignments-list">
          <div
              v-for="assignment in filteredAssignments"
              :key="assignment.id"
              class="assignment-card"
              :class="getAssignmentClass(assignment)"
          >
            <div class="assignment-header">
              <div class="assignment-title-section">
                <div class="assignment-meta">
                  <span class="assignment-number">Devoir #{{ assignment.id }}</span>
                  <span class="assignment-type">{{ assignment.type }}</span>
                  <span
                      v-if="assignment.isGroup"
                      class="group-badge"
                  >
                    <i class="icon-group"></i>
                    Groupe
                  </span>
                </div>
                <h3 class="assignment-title">{{ assignment.title }}</h3>
                <div class="assignment-details">
                  <span class="detail-item">
                    <i class="icon-calendar"></i>
                    Date limite: {{ formatDate(assignment.deadline) }}
                  </span>
                  <span class="detail-item">
                    <i class="icon-points"></i>
                    Points: {{ assignment.points }}
                  </span>
                  <span class="detail-item">
                    <i class="icon-time"></i>
                    Temps estimé: {{ assignment.estimatedTime }}
                  </span>
                </div>
              </div>

              <div class="assignment-status">
                <div class="status-badge" :class="getStatusClass(assignment.status)">
                  {{ getStatusText(assignment.status) }}
                </div>
                <div
                    v-if="assignment.grade"
                    class="grade-badge"
                    :class="getGradeClass(assignment.grade)"
                >
                  {{ assignment.grade }}%
                </div>
              </div>
            </div>

            <div class="assignment-body">
              <div class="assignment-description">
                <p>{{ assignment.description }}</p>
                <div class="assignment-tags">
                  <span
                      v-for="tag in assignment.tags"
                      :key="tag"
                      class="tag"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>

              <div class="assignment-progress">
                <div class="progress-info">
                  <span class="progress-label">Progression</span>
                  <span class="progress-percent">{{ assignment.progress }}%</span>
                </div>
                <div class="progress-bar">
                  <div
                      class="progress-fill"
                      :style="{ width: assignment.progress + '%' }"
                  ></div>
                </div>
              </div>

              <div class="assignment-actions">
                <template v-if="assignment.status === 'not_started'">
                  <button class="btn-start" @click="startAssignment(assignment)">
                    <i class="icon-play"></i>
                    Commencer
                  </button>
                  <button class="btn-outline" @click="viewDetails(assignment)">
                    <i class="icon-info"></i>
                    Détails
                  </button>
                </template>

                <template v-else-if="assignment.status === 'in_progress'">
                  <button class="btn-continue" @click="continueAssignment(assignment)">
                    <i class="icon-edit"></i>
                    Continuer
                  </button>
                  <button class="btn-outline" @click="submitAssignment(assignment)">
                    <i class="icon-send"></i>
                    Soumettre
                  </button>
                  <button class="btn-outline" @click="requestExtension(assignment)">
                    <i class="icon-clock"></i>
                    Demander une extension
                  </button>
                </template>

                <template v-else-if="assignment.status === 'submitted'">
                  <button class="btn-outline" @click="viewSubmission(assignment)">
                    <i class="icon-eye"></i>
                    Voir soumission
                  </button>
                  <button
                      v-if="assignment.canResubmit"
                      class="btn-outline"
                      @click="resubmitAssignment(assignment)"
                  >
                    <i class="icon-refresh"></i>
                    Ressoumettre
                  </button>
                  <button
                      v-if="assignment.feedback"
                      class="btn-feedback"
                      @click="viewFeedback(assignment)"
                  >
                    <i class="icon-message"></i>
                    Voir feedback
                  </button>
                </template>

                <template v-else-if="assignment.status === 'graded'">
                  <button class="btn-feedback" @click="viewFeedback(assignment)">
                    <i class="icon-message"></i>
                    Feedback ({{ assignment.comments }} commentaires)
                  </button>
                  <button class="btn-outline" @click="viewSolution(assignment)">
                    <i class="icon-solution"></i>
                    Voir solution
                  </button>
                </template>

                <template v-else-if="assignment.status === 'overdue'">
                  <button class="btn-warning" @click="submitLate(assignment)">
                    <i class="icon-warning"></i>
                    Soumettre en retard
                  </button>
                  <button class="btn-outline" @click="requestExtension(assignment)">
                    <i class="icon-clock"></i>
                    Demander une extension
                  </button>
                </template>
              </div>

              <div class="assignment-timeline">
                <div class="timeline-item" :class="{ active: true }">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <span class="timeline-date">Publié le {{ formatDate(assignment.publishedDate) }}</span>
                    <span class="timeline-text">Devoir publié</span>
                  </div>
                </div>
                <div class="timeline-item" :class="{ active: assignment.status !== 'not_started' }">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <span class="timeline-date">
                      {{ assignment.startedDate ? formatDate(assignment.startedDate) : 'Non commencé' }}
                    </span>
                    <span class="timeline-text">Début du travail</span>
                  </div>
                </div>
                <div class="timeline-item" :class="{ active: assignment.status === 'submitted' || assignment.status === 'graded' }">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <span class="timeline-date">
                      {{ assignment.submittedDate ? formatDate(assignment.submittedDate) : 'Non soumis' }}
                    </span>
                    <span class="timeline-text">Soumission</span>
                  </div>
                </div>
                <div class="timeline-item" :class="{ active: assignment.status === 'graded' }">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <span class="timeline-date">
                      {{ assignment.gradedDate ? formatDate(assignment.gradedDate) : 'Non corrigé' }}
                    </span>
                    <span class="timeline-text">Correction</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Aucun résultat -->
          <div v-if="filteredAssignments.length === 0" class="no-results">
            <i class="icon-search-large"></i>
            <h3>Aucun devoir trouvé</h3>
            <p>Aucun devoir ne correspond à vos critères de recherche ou de filtre.</p>
            <button class="btn-primary" @click="resetFilters">
              <i class="icon-refresh"></i>
              Réinitialiser les filtres
            </button>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="filteredAssignments.length > 0" class="pagination">
          <button
              class="pagination-btn"
              :disabled="currentPage === 1"
              @click="changePage(currentPage - 1)"
          >
            <i class="icon-chevron-left"></i>
            Précédent
          </button>

          <div class="pagination-pages">
            <button
                v-for="page in visiblePages"
                :key="page"
                class="page-btn"
                :class="{ active: page === currentPage }"
                @click="changePage(page)"
            >
              {{ page }}
            </button>
            <span v-if="showEllipsis" class="ellipsis">...</span>
          </div>

          <button
              class="pagination-btn"
              :disabled="currentPage === totalPages"
              @click="changePage(currentPage + 1)"
          >
            Suivant
            <i class="icon-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de soumission -->
    <div class="modal-overlay" v-if="showSubmissionModal">
      <div class="modal modal-submission">
        <div class="modal-header">
          <h2>Soumettre le devoir</h2>
          <button class="btn-close" @click="showSubmissionModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="submission-form">
            <div class="form-group">
              <label for="submissionTitle">Titre de la soumission</label>
              <input
                  type="text"
                  id="submissionTitle"
                  v-model="submission.title"
                  placeholder="Ex: Devoir #1 - Koffi Kouamé"
                  class="form-input"
              >
            </div>

            <div class="form-group">
              <label for="submissionFile">Fichier principal</label>
              <div class="file-upload-area" @click="triggerFileUpload" @dragover.prevent @drop.prevent="handleDrop">
                <input
                    type="file"
                    id="submissionFile"
                    ref="fileInput"
                    @change="handleFileUpload"
                    class="file-input"
                    multiple
                >
                <div class="upload-content">
                  <i class="icon-upload"></i>
                  <h4>Glissez-déposez vos fichiers ici</h4>
                  <p>ou cliquez pour parcourir</p>
                  <p class="file-types">PDF, DOC, DOCX, ZIP (max. 50MB)</p>
                </div>
              </div>

              <div v-if="submission.files.length > 0" class="uploaded-files">
                <div
                    v-for="(file, index) in submission.files"
                    :key="index"
                    class="file-item"
                >
                  <div class="file-info">
                    <i :class="getFileIcon(file.type)"></i>
                    <div class="file-details">
                      <span class="file-name">{{ file.name }}</span>
                      <span class="file-size">{{ formatFileSize(file.size) }}</span>
                    </div>
                  </div>
                  <button class="btn-remove-file" @click="removeFile(index)">
                    <i class="icon-close"></i>
                  </button>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="submissionComment">Commentaires (optionnel)</label>
              <textarea
                  id="submissionComment"
                  v-model="submission.comments"
                  placeholder="Ajoutez des commentaires pour l'instructeur..."
                  class="form-textarea"
                  rows="4"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input
                    type="checkbox"
                    v-model="submission.confirmOriginal"
                    class="checkbox-input"
                >
                <span class="checkbox-custom"></span>
                Je certifie que ce travail est original et que j'ai cité toutes les sources utilisées
              </label>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input
                    type="checkbox"
                    v-model="submission.confirmLate"
                    class="checkbox-input"
                >
                <span class="checkbox-custom"></span>
                Je comprends que cette soumission est en retard et que cela peut affecter ma note
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showSubmissionModal = false">
            Annuler
          </button>
          <button
              class="btn-primary"
              @click="submitCurrentAssignment"
              :disabled="!canSubmit"
          >
            <i class="icon-send"></i>
            Soumettre le devoir
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de feedback -->
    <div class="modal-overlay" v-if="showFeedbackModal">
      <div class="modal modal-feedback">
        <div class="modal-header">
          <h2>Feedback - {{ selectedAssignment?.title }}</h2>
          <button class="btn-close" @click="showFeedbackModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="feedback-content">
            <div class="grade-summary">
              <div class="grade-display">
                <div class="grade-score" :class="getGradeClass(selectedAssignment?.grade)">
                  {{ selectedAssignment?.grade }}%
                </div>
                <div class="grade-details">
                  <h3>{{ getGradeText(selectedAssignment?.grade) }}</h3>
                  <p>Points obtenus: {{ selectedAssignment?.pointsEarned }}/{{ selectedAssignment?.points }}</p>
                </div>
              </div>

              <div class="rubric-results">
                <h4>Détails de l'évaluation</h4>
                <div
                    v-for="criteria in selectedAssignment?.rubric"
                    :key="criteria.id"
                    class="rubric-item"
                >
                  <div class="criteria-info">
                    <span class="criteria-name">{{ criteria.name }}</span>
                    <span class="criteria-weight">{{ criteria.weight }}%</span>
                  </div>
                  <div class="criteria-score">
                    <div class="score-bar">
                      <div
                          class="score-fill"
                          :style="{ width: criteria.score + '%' }"
                      ></div>
                    </div>
                    <span class="score-value">{{ criteria.score }}/{{ criteria.maxScore }}</span>
                  </div>
                  <div class="criteria-feedback">
                    <p>{{ criteria.feedback }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="instructor-feedback">
              <div class="feedback-header">
                <img
                    :src="selectedAssignment?.instructor?.avatar"
                    :alt="selectedAssignment?.instructor?.name"
                    class="instructor-avatar"
                >
                <div class="instructor-info">
                  <h4>{{ selectedAssignment?.instructor?.name }}</h4>
                  <p>{{ selectedAssignment?.instructor?.title }}</p>
                  <span class="feedback-date">{{ selectedAssignment?.feedbackDate }}</span>
                </div>
              </div>

              <div class="feedback-message">
                <p>{{ selectedAssignment?.feedback }}</p>
              </div>

              <div class="feedback-attachments" v-if="selectedAssignment?.attachments?.length > 0">
                <h4>Pièces jointes</h4>
                <div class="attachments-list">
                  <div
                      v-for="attachment in selectedAssignment?.attachments"
                      :key="attachment.id"
                      class="attachment-item"
                      @click="downloadAttachment(attachment)"
                  >
                    <i :class="getFileIcon(attachment.type)"></i>
                    <span class="attachment-name">{{ attachment.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showFeedbackModal = false">
            Fermer
          </button>
          <button
              v-if="selectedAssignment?.canAppeal"
              class="btn-primary"
              @click="appealGrade"
          >
            <i class="icon-appeal"></i>
            Faire appel de la note
          </button>
        </div>
      </div>
    </div>

    <!-- Notification de succès -->
    <div class="notification" v-if="showSuccessNotification">
      <div class="notification-content success">
        <i class="icon-check-circle"></i>
        <div class="notification-text">
          <h4>Devoir soumis avec succès !</h4>
          <p>Votre devoir a été envoyé. Vous recevrez une notification lorsque l'instructeur l'aura corrigé.</p>
        </div>
        <button class="btn-dismiss" @click="showSuccessNotification = false">
          <i class="icon-close"></i>
        </button>
      </div>
    </div>

    <!-- Éditeur de devoir -->
    <div class="assignment-editor" v-if="showEditor">
      <div class="editor-header">
        <div class="header-left">
          <h2>{{ editingAssignment?.title }}</h2>
          <div class="editor-status">
            <span class="status-badge auto-save" v-if="isAutoSaving">
              <i class="icon-save"></i>
              Enregistrement automatique...
            </span>
            <span class="status-badge last-saved" v-else>
              <i class="icon-check"></i>
              Dernière sauvegarde: {{ lastSavedTime }}
            </span>
          </div>
        </div>
        <div class="header-right">
          <button class="btn-outline" @click="saveDraft">
            <i class="icon-save"></i>
            Sauvegarder le brouillon
          </button>
          <button class="btn-outline" @click="previewAssignment">
            <i class="icon-eye"></i>
            Aperçu
          </button>
          <button class="btn-primary" @click="submitFromEditor">
            <i class="icon-send"></i>
            Soumettre
          </button>
          <button class="btn-close-editor" @click="closeEditor">
            <i class="icon-close"></i>
          </button>
        </div>
      </div>

      <div class="editor-container">
        <div class="editor-toolbar">
          <div class="toolbar-group">
            <button class="tool-btn" @click="formatText('bold')" title="Gras">
              <i class="icon-bold"></i>
            </button>
            <button class="tool-btn" @click="formatText('italic')" title="Italique">
              <i class="icon-italic"></i>
            </button>
            <button class="tool-btn" @click="formatText('underline')" title="Souligné">
              <i class="icon-underline"></i>
            </button>
          </div>

          <div class="toolbar-group">
            <button class="tool-btn" @click="insertHeading(1)" title="Titre 1">
              H1
            </button>
            <button class="tool-btn" @click="insertHeading(2)" title="Titre 2">
              H2
            </button>
            <button class="tool-btn" @click="insertHeading(3)" title="Titre 3">
              H3
            </button>
          </div>

          <div class="toolbar-group">
            <button class="tool-btn" @click="insertList('bullet')" title="Liste à puces">
              <i class="icon-list-bullet"></i>
            </button>
            <button class="tool-btn" @click="insertList('number')" title="Liste numérotée">
              <i class="icon-list-number"></i>
            </button>
          </div>

          <div class="toolbar-group">
            <button class="tool-btn" @click="insertCode" title="Code">
              <i class="icon-code"></i>
            </button>
            <button class="tool-btn" @click="insertLink" title="Lien">
              <i class="icon-link"></i>
            </button>
            <button class="tool-btn" @click="insertImage" title="Image">
              <i class="icon-image"></i>
            </button>
          </div>

          <div class="toolbar-group">
            <button class="tool-btn" @click="undo" title="Annuler">
              <i class="icon-undo"></i>
            </button>
            <button class="tool-btn" @click="redo" title="Rétablir">
              <i class="icon-redo"></i>
            </button>
          </div>
        </div>

        <div class="editor-content">
          <textarea
              ref="editorTextarea"
              v-model="editorContent"
              placeholder="Commencez à rédiger votre devoir ici..."
              class="editor-textarea"
              @input="handleEditorInput"
          ></textarea>

          <div class="word-count">
            <span>Mots: {{ wordCount }}</span>
            <span>Caractères: {{ characterCount }}</span>
          </div>
        </div>

        <div class="editor-sidebar">
          <div class="sidebar-section">
            <h4>Instructions</h4>
            <div class="instructions" v-html="editingAssignment?.instructions"></div>
          </div>

          <div class="sidebar-section">
            <h4>Critères d'évaluation</h4>
            <div class="rubric-preview">
              <div
                  v-for="criteria in editingAssignment?.rubric"
                  :key="criteria.id"
                  class="criteria-item"
              >
                <span class="criteria-name">{{ criteria.name }}</span>
                <span class="criteria-weight">{{ criteria.weight }}%</span>
              </div>
            </div>
          </div>

          <div class="sidebar-section">
            <h4>Ressources</h4>
            <div class="resources-list">
              <button
                  v-for="resource in editingAssignment?.resources"
                  :key="resource.id"
                  class="resource-item"
                  @click="openResource(resource)"
              >
                <i :class="getFileIcon(resource.type)"></i>
                <span>{{ resource.name }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// États
const activeFilter = ref('all')
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 5
const currentSort = ref({ value: 'deadline', label: 'Date limite' })
const showSortMenu = ref(false)
const showSubmissionModal = ref(false)
const showFeedbackModal = ref(false)
const showSuccessNotification = ref(false)
const showEditor = ref(false)
const isAutoSaving = ref(false)
const lastSavedTime = ref('')
const editorContent = ref('')
const wordCount = ref(0)
const characterCount = ref(0)

// Données
const course = ref({
  id: 1,
  title: 'JavaScript Avancé'
})

const selectedAssignment = ref(null)
const editingAssignment = ref(null)

const submission = ref({
  title: '',
  files: [],
  comments: '',
  confirmOriginal: false,
  confirmLate: false
})

// Filtres
const assignmentFilters = [
  { value: 'all', label: 'Tous', icon: 'icon-all', count: 12 },
  { value: 'not_started', label: 'Non commencés', icon: 'icon-clock', count: 3 },
  { value: 'in_progress', label: 'En cours', icon: 'icon-edit', count: 2 },
  { value: 'submitted', label: 'Soumis', icon: 'icon-send', count: 4 },
  { value: 'graded', label: 'Corrigés', icon: 'icon-check', count: 5 },
  { value: 'overdue', label: 'En retard', icon: 'icon-warning', count: 1 },
  { value: 'favorites', label: 'Favoris', icon: 'icon-star', count: 2 }
]

// Options de tri
const sortOptions = [
  { value: 'deadline', label: 'Date limite' },
  { value: 'date_added', label: 'Date d\'ajout' },
  { value: 'title', label: 'Titre' },
  { value: 'points', label: 'Points' },
  { value: 'status', label: 'Statut' },
  { value: 'grade', label: 'Note' }
]

// Données des devoirs
const assignments = ref([
  {
    id: 1,
    title: 'Implémentation d\'une API REST avec Node.js',
    description: 'Créez une API REST complète avec Node.js, Express et MongoDB. Implémentez l\'authentification JWT, la validation des données et les tests unitaires.',
    type: 'Projet',
    points: 100,
    estimatedTime: '10-12 heures',
    deadline: '2024-03-15',
    publishedDate: '2024-02-01',
    startedDate: '2024-02-10',
    submittedDate: '2024-03-14',
    gradedDate: '2024-03-16',
    status: 'graded',
    progress: 100,
    grade: 92,
    pointsEarned: 92,
    isGroup: false,
    tags: ['Node.js', 'Express', 'MongoDB', 'API', 'JWT'],
    canResubmit: false,
    comments: 5,
    feedback: 'Excellent travail ! Votre implémentation est robuste et bien structurée. Les tests couvrent bien les cas critiques.',
    feedbackDate: '16 mars 2024',
    instructor: {
      name: 'Dr. Jean Dupont',
      title: 'Expert en développement web',
      avatar: '/images/avatar1.jpg'
    },
    rubric: [
      { id: 1, name: 'Fonctionnalités', weight: 40, score: 38, maxScore: 40, feedback: 'Toutes les fonctionnalités requises sont implémentées correctement.' },
      { id: 2, name: 'Qualité du code', weight: 30, score: 27, maxScore: 30, feedback: 'Code bien structuré et commenté. Bonnes pratiques respectées.' },
      { id: 3, name: 'Tests', weight: 20, score: 18, maxScore: 20, feedback: 'Tests complets couvrant les cas critiques.' },
      { id: 4, name: 'Documentation', weight: 10, score: 9, maxScore: 10, feedback: 'Documentation claire et complète.' }
    ],
    attachments: [
      { id: 1, name: 'Commentaires détaillés.pdf', type: 'pdf' },
      { id: 2, name: 'Exemple de code corrigé.js', type: 'js' }
    ],
    canAppeal: true
  },
  {
    id: 2,
    title: 'Optimisation des performances React',
    description: 'Analysez et optimisez les performances d\'une application React existante. Identifiez les bottlenecks et implémentez des solutions d\'optimisation.',
    type: 'Exercice',
    points: 50,
    estimatedTime: '4-6 heures',
    deadline: '2024-03-20',
    publishedDate: '2024-02-15',
    startedDate: '2024-03-10',
    submittedDate: null,
    gradedDate: null,
    status: 'in_progress',
    progress: 60,
    grade: null,
    pointsEarned: null,
    isGroup: false,
    tags: ['React', 'Performance', 'Optimisation'],
    canResubmit: true
  },
  {
    id: 3,
    title: 'Application de gestion de tâches en temps réel',
    description: 'Développez une application de gestion de tâches collaborative avec Vue.js et Socket.io. Implémentez les fonctionnalités de temps réel.',
    type: 'Projet de groupe',
    points: 150,
    estimatedTime: '15-20 heures',
    deadline: '2024-03-10',
    publishedDate: '2024-02-05',
    startedDate: null,
    submittedDate: null,
    gradedDate: null,
    status: 'not_started',
    progress: 0,
    grade: null,
    pointsEarned: null,
    isGroup: true,
    tags: ['Vue.js', 'Socket.io', 'Temps réel', 'Collaboration'],
    canResubmit: false
  },
  {
    id: 4,
    title: 'Analyse de sécurité d\'une application web',
    description: 'Effectuez une analyse de sécurité complète d\'une application web. Identifiez les vulnérabilités et proposez des correctifs.',
    type: 'Rapport',
    points: 80,
    estimatedTime: '8-10 heures',
    deadline: '2024-02-28',
    publishedDate: '2024-02-01',
    startedDate: '2024-02-10',
    submittedDate: '2024-02-28',
    gradedDate: null,
    status: 'submitted',
    progress: 100,
    grade: null,
    pointsEarned: null,
    isGroup: false,
    tags: ['Sécurité', 'Analyse', 'OWASP'],
    canResubmit: false
  },
  {
    id: 5,
    title: 'Refactoring de code legacy',
    description: 'Refactorez un code JavaScript legacy en appliquant les principes SOLID et les design patterns appropriés.',
    type: 'Exercice',
    points: 60,
    estimatedTime: '6-8 heures',
    deadline: '2024-02-20',
    publishedDate: '2024-01-15',
    startedDate: '2024-02-15',
    submittedDate: null,
    gradedDate: null,
    status: 'overdue',
    progress: 40,
    grade: null,
    pointsEarned: null,
    isGroup: false,
    tags: ['Refactoring', 'SOLID', 'Design Patterns'],
    canResubmit: true
  }
])

// Notes récentes
const recentGrades = ref([
  { id: 1, title: 'API REST Node.js', score: 92, date: '16 mars 2024' },
  { id: 2, title: 'Tests unitaires avancés', score: 88, date: '28 fév 2024' },
  { id: 3, title: 'Architecture microservices', score: 95, date: '15 fév 2024' },
  { id: 4, title: 'Design patterns', score: 85, date: '5 fév 2024' }
])

// Computed properties
const filteredAssignments = computed(() => {
  let filtered = assignments.value

  // Filtre par statut
  if (activeFilter.value !== 'all') {
    filtered = filtered.filter(a => a.status === activeFilter.value)
  }

  // Recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query) ||
        a.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // Tri
  filtered = [...filtered].sort((a, b) => {
    switch (currentSort.value.value) {
      case 'deadline':
        return new Date(a.deadline) - new Date(b.deadline)
      case 'date_added':
        return new Date(b.publishedDate) - new Date(a.publishedDate)
      case 'title':
        return a.title.localeCompare(b.title)
      case 'points':
        return b.points - a.points
      case 'status':
        return a.status.localeCompare(b.status)
      case 'grade':
        return (b.grade || 0) - (a.grade || 0)
      default:
        return 0
    }
  })

  // Pagination
  const startIndex = (currentPage.value - 1) * itemsPerPage
  return filtered.slice(startIndex, startIndex + itemsPerPage)
})

const totalAssignments = computed(() => assignments.value.length)
const completedAssignments = computed(() =>
    assignments.value.filter(a => a.status === 'graded').length
)
const overdueAssignments = computed(() =>
    assignments.value.filter(a => a.status === 'overdue').length
)
const pendingAssignments = computed(() =>
    assignments.value.filter(a => a.status === 'not_started' || a.status === 'in_progress').length
)
const gradedAssignments = computed(() =>
    assignments.value.filter(a => a.status === 'graded').length
)

const averageGrade = computed(() => {
  const graded = assignments.value.filter(a => a.grade)
  if (graded.length === 0) return 0
  const sum = graded.reduce((acc, a) => acc + a.grade, 0)
  return Math.round(sum / graded.length)
})

const nextDeadline = computed(() => {
  const upcoming = assignments.value
      .filter(a => a.status !== 'graded' && a.status !== 'submitted')
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))

  return upcoming.length > 0 ? upcoming[0].deadline : null
})

const completionRate = computed(() => {
  const total = assignments.value.length
  const completed = assignments.value.filter(a =>
      a.status === 'graded' || a.status === 'submitted'
  ).length
  return Math.round((completed / total) * 100)
})

const completionColor = computed(() => {
  if (completionRate.value >= 80) return '#2ecc71'
  if (completionRate.value >= 50) return '#f39c12'
  return '#e74c3c'
})

const completionCircumference = computed(() => 2 * Math.PI * 54)
const completionOffset = computed(() =>
    completionCircumference.value - (completionRate.value / 100) * completionCircumference.value
)

const totalPages = computed(() =>
    Math.ceil(assignments.value.length / itemsPerPage)
)

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5

  if (totalPages.value <= maxVisible) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    let start = Math.max(1, currentPage.value - 2)
    let end = Math.min(totalPages.value, start + maxVisible - 1)

    if (end - start + 1 < maxVisible) {
      start = end - maxVisible + 1
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
  }

  return pages
})

const showEllipsis = computed(() => {
  return totalPages.value > 5 && currentPage.value < totalPages.value - 2
})

const canSubmit = computed(() => {
  return submission.value.files.length > 0 &&
      submission.value.confirmOriginal
})

// Méthodes
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const getAssignmentClass = (assignment) => {
  return {
    'assignment-overdue': assignment.status === 'overdue',
    'assignment-graded': assignment.status === 'graded',
    'assignment-in-progress': assignment.status === 'in_progress',
    'assignment-group': assignment.isGroup
  }
}

const getStatusClass = (status) => {
  const classes = {
    'not_started': 'status-default',
    'in_progress': 'status-warning',
    'submitted': 'status-info',
    'graded': 'status-success',
    'overdue': 'status-danger'
  }
  return classes[status] || 'status-default'
}

const getStatusText = (status) => {
  const texts = {
    'not_started': 'Non commencé',
    'in_progress': 'En cours',
    'submitted': 'Soumis',
    'graded': 'Corrigé',
    'overdue': 'En retard'
  }
  return texts[status] || status
}

const getGradeClass = (grade) => {
  if (!grade) return 'grade-default'
  if (grade >= 90) return 'grade-excellent'
  if (grade >= 80) return 'grade-good'
  if (grade >= 70) return 'grade-average'
  if (grade >= 60) return 'grade-poor'
  return 'grade-fail'
}

const getGradeText = (grade) => {
  if (!grade) return 'Non noté'
  if (grade >= 90) return 'Excellent'
  if (grade >= 80) return 'Très bien'
  if (grade >= 70) return 'Bien'
  if (grade >= 60) return 'Satisfaisant'
  return 'Insuffisant'
}

const getFileIcon = (fileType) => {
  const icons = {
    'pdf': 'icon-pdf',
    'doc': 'icon-doc',
    'docx': 'icon-doc',
    'js': 'icon-code',
    'zip': 'icon-zip',
    'image': 'icon-image'
  }
  return icons[fileType] || 'icon-file'
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Actions sur les devoirs
const startAssignment = (assignment) => {
  selectedAssignment.value = assignment
  editingAssignment.value = assignment
  editorContent.value = assignment.draft || ''
  showEditor.value = true
  updateWordCount()
}

const continueAssignment = (assignment) => {
  startAssignment(assignment)
}

const submitAssignment = (assignment) => {
  selectedAssignment.value = assignment
  submission.value.title = `${assignment.title} - Soumission`
  showSubmissionModal.value = true
}

const viewDetails = (assignment) => {
  router.push(`/courses/${course.value.id}/assignments/${assignment.id}`)
}

const viewSubmission = (assignment) => {
  // Ouvrir la soumission
  console.log('Voir soumission:', assignment.id)
}

const viewFeedback = (assignment) => {
  selectedAssignment.value = assignment
  showFeedbackModal.value = true
}

const viewSolution = (assignment) => {
  console.log('Voir solution:', assignment.id)
}

const requestExtension = (assignment) => {
  const reason = prompt('Raison de la demande d\'extension:')
  if (reason) {
    console.log('Extension demandée pour:', assignment.id, 'Raison:', reason)
    alert('Demande d\'extension envoyée à l\'instructeur.')
  }
}

const submitLate = (assignment) => {
  if (confirm('Soumettre en retard ? Cela peut affecter votre note.')) {
    submitAssignment(assignment)
  }
}

const resubmitAssignment = (assignment) => {
  if (confirm('Êtes-vous sûr de vouloir resoumettre ce devoir ?')) {
    submitAssignment(assignment)
  }
}

// Gestion de la soumission
const triggerFileUpload = () => {
  document.getElementById('submissionFile').click()
}

const handleDrop = (event) => {
  event.preventDefault()
  const files = Array.from(event.dataTransfer.files)
  handleFiles(files)
}

const handleFileUpload = (event) => {
  const files = Array.from(event.target.files)
  handleFiles(files)
}

const handleFiles = (files) => {
  const validFiles = files.filter(file => {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
      'text/plain',
      'application/javascript',
      'image/jpeg',
      'image/png',
      'image/gif'
    ]
    const maxSize = 50 * 1024 * 1024 // 50MB
    return validTypes.includes(file.type) && file.size <= maxSize
  })

  validFiles.forEach(file => {
    submission.value.files.push({
      name: file.name,
      size: file.size,
      type: file.name.split('.').pop().toLowerCase()
    })
  })

  if (validFiles.length < files.length) {
    alert('Certains fichiers ont été ignorés (type ou taille non supportés).')
  }
}

const removeFile = (index) => {
  submission.value.files.splice(index, 1)
}

const submitCurrentAssignment = () => {
  if (!canSubmit.value) {
    alert('Veuillez ajouter au moins un fichier et confirmer l\'originalité du travail.')
    return
  }

  // Mettre à jour le statut du devoir
  selectedAssignment.value.status = 'submitted'
  selectedAssignment.value.submittedDate = new Date().toISOString().split('T')[0]
  selectedAssignment.value.progress = 100

  // Réinitialiser le formulaire
  submission.value = {
    title: '',
    files: [],
    comments: '',
    confirmOriginal: false,
    confirmLate: false
  }

  showSubmissionModal.value = false
  showSuccessNotification.value = true

  // Cacher la notification après 5 secondes
  setTimeout(() => {
    showSuccessNotification.value = false
  }, 5000)
}

// Éditeur
const handleEditorInput = () => {
  updateWordCount()

  // Auto-save
  if (!isAutoSaving.value) {
    isAutoSaving.value = true
    setTimeout(() => {
      saveDraft()
      isAutoSaving.value = false
      lastSavedTime.value = new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }, 1000)
  }
}

const updateWordCount = () => {
  const text = editorContent.value.trim()
  wordCount.value = text ? text.split(/\s+/).length : 0
  characterCount.value = text.length
}

const saveDraft = () => {
  if (editingAssignment.value) {
    editingAssignment.value.draft = editorContent.value
    console.log('Brouillon sauvegardé:', editingAssignment.value.id)
  }
}

const previewAssignment = () => {
  console.log('Aperçu du devoir:', editorContent.value)
}

const submitFromEditor = () => {
  if (editorContent.value.trim().length < 100) {
    alert('Le devoir doit contenir au moins 100 caractères.')
    return
  }

  editingAssignment.value.content = editorContent.value
  submitAssignment(editingAssignment.value)
  closeEditor()
}

const closeEditor = () => {
  if (editorContent.value.trim() && !confirm('Vous avez des modifications non sauvegardées. Quitter ?')) {
    return
  }
  showEditor.value = false
  editingAssignment.value = null
  editorContent.value = ''
}

// Formatage du texte
const formatText = (type) => {
  const textarea = document.querySelector('.editor-textarea')
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = editorContent.value.substring(start, end)

  let formattedText = selectedText

  switch (type) {
    case 'bold':
      formattedText = `**${selectedText}**`
      break
    case 'italic':
      formattedText = `*${selectedText}*`
      break
    case 'underline':
      formattedText = `<u>${selectedText}</u>`
      break
  }

  editorContent.value =
      editorContent.value.substring(0, start) +
      formattedText +
      editorContent.value.substring(end)

  updateWordCount()
}

const insertHeading = (level) => {
  const textarea = document.querySelector('.editor-textarea')
  const start = textarea.selectionStart

  const heading = '#'.repeat(level) + ' '

  editorContent.value =
      editorContent.value.substring(0, start) +
      heading +
      editorContent.value.substring(start)

  updateWordCount()
}

const insertList = (type) => {
  const textarea = document.querySelector('.editor-textarea')
  const start = textarea.selectionStart

  const bullet = type === 'bullet' ? '- ' : '1. '

  editorContent.value =
      editorContent.value.substring(0, start) +
      bullet +
      editorContent.value.substring(start)

  updateWordCount()
}

const insertCode = () => {
  const textarea = document.querySelector('.editor-textarea')
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = editorContent.value.substring(start, end)

  const codeBlock = selectedText ?
      `\`\`\`\n${selectedText}\n\`\`\`` :
      '```\n\n```'

  editorContent.value =
      editorContent.value.substring(0, start) +
      codeBlock +
      editorContent.value.substring(end)

  updateWordCount()
}

const insertLink = () => {
  const url = prompt('URL du lien:')
  const text = prompt('Texte du lien:') || url

  if (url) {
    const textarea = document.querySelector('.editor-textarea')
    const start = textarea.selectionStart

    const link = `[${text}](${url})`

    editorContent.value =
        editorContent.value.substring(0, start) +
        link +
        editorContent.value.substring(start)

    updateWordCount()
  }
}

const insertImage = () => {
  const url = prompt('URL de l\'image:')
  const alt = prompt('Texte alternatif:') || 'Image'

  if (url) {
    const textarea = document.querySelector('.editor-textarea')
    const start = textarea.selectionStart

    const image = `![${alt}](${url})`

    editorContent.value =
        editorContent.value.substring(0, start) +
        image +
        editorContent.value.substring(start)

    updateWordCount()
  }
}

const undo = () => {
  // Implémentation basique d'annulation
  console.log('Annuler')
}

const redo = () => {
  // Implémentation basique de rétablissement
  console.log('Rétablir')
}

// Autres méthodes
const toggleSortMenu = () => {
  showSortMenu.value = !showSortMenu.value
}

const changeSort = (option) => {
  currentSort.value = option
  showSortMenu.value = false
}

const changePage = (page) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const resetFilters = () => {
  activeFilter.value = 'all'
  searchQuery.value = ''
  currentPage.value = 1
}

const downloadTemplate = () => {
  console.log('Télécharger le modèle')
}

const showGuidelines = () => {
  console.log('Afficher les guidelines')
}

const showPlagiarismInfo = () => {
  console.log('Afficher info plagiat')
}

const downloadAttachment = (attachment) => {
  console.log('Télécharger pièce jointe:', attachment.name)
}

const appealGrade = () => {
  const reason = prompt('Raison de l\'appel:')
  if (reason) {
    console.log('Appel de note pour:', selectedAssignment.value.id, 'Raison:', reason)
    alert('Votre appel a été envoyé à l\'instructeur.')
  }
}

const openResource = (resource) => {
  console.log('Ouvrir ressource:', resource.name)
}

// Lifecycle
onMounted(() => {
  // Fermer le menu de tri en cliquant ailleurs
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.header-right')) {
      showSortMenu.value = false
    }
  })

  // Sauvegarder automatiquement quand on quitte la page
  window.addEventListener('beforeunload', (event) => {
    if (editorContent.value.trim() && showEditor.value) {
      event.preventDefault()
      event.returnValue = 'Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter ?'
    }
  })
})

onUnmounted(() => {
  if (editorContent.value.trim() && showEditor.value) {
    saveDraft()
  }
})
</script>

<style scoped>
.assignment-view {
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* En-tête */
.assignment-header {
  background: linear-gradient(135deg, #2c3e50 0%, #1a252f 100%);
  color: white;
  padding: 30px 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.breadcrumb-nav {
  margin-bottom: 20px;
}

.breadcrumb {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 14px;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-item a {
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  transition: color 0.3s;
}

.breadcrumb-item a:hover {
  color: white;
}

.breadcrumb-item.active {
  color: white;
}

.breadcrumb-item:not(:last-child)::after {
  content: '/';
  margin: 0 10px;
  color: rgba(255,255,255,0.3);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  margin: 0 0 10px 0;
  font-size: 32px;
  font-weight: 700;
}

.page-subtitle {
  margin: 0;
  color: rgba(255,255,255,0.8);
  font-size: 16px;
}

.stats-summary {
  display: flex;
  gap: 30px;
  background: rgba(255,255,255,0.1);
  padding: 20px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  color: rgba(255,255,255,0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Conteneur principal */
.assignment-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 30px;
  max-width: 1400px;
  margin: 30px auto;
  padding: 0 20px;
}

/* Barre latérale */
.assignment-sidebar {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.sidebar-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.filters {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 15px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  color: #495057;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
}

.filter-btn:hover {
  background: #e9ecef;
  border-color: #dee2e6;
}

.filter-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.filter-btn i {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.filter-count {
  margin-left: auto;
  background: rgba(0,0,0,0.1);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.filter-btn.active .filter-count {
  background: rgba(255,255,255,0.2);
}

/* Widget de progression */
.stats-widget {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.progress-ring {
  position: relative;
  width: 120px;
  height: 120px;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.progress-percent {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
}

.progress-label {
  font-size: 12px;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stats-details {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.stat-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #e9ecef;
}

.stat-detail:last-child {
  border-bottom: none;
}

.stat-label {
  color: #6c757d;
  font-size: 14px;
}

.stat-value {
  font-weight: 600;
  font-size: 16px;
}

.stat-value.overdue {
  color: #e74c3c;
}

.stat-value.pending {
  color: #f39c12;
}

.stat-value.graded {
  color: #2ecc71;
}

/* Notes récentes */
.recent-grades {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.grade-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s;
}

.grade-item:hover {
  background: #e9ecef;
  transform: translateX(5px);
}

.grade-info h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.grade-date {
  font-size: 12px;
  color: #6c757d;
}

.grade-score {
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 14px;
}

.grade-score.grade-excellent {
  background: #d4edda;
  color: #155724;
}

.grade-score.grade-good {
  background: #d1ecf1;
  color: #0c5460;
}

.grade-score.grade-average {
  background: #fff3cd;
  color: #856404;
}

.grade-score.grade-poor {
  background: #f8d7da;
  color: #721c24;
}

.grade-score.grade-fail {
  background: #f8d7da;
  color: #721c24;
}

.grade-score.grade-default {
  background: #e9ecef;
  color: #6c757d;
}

/* Ressources */
.resources {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.resource-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 15px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  color: #495057;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
}

.resource-btn:hover {
  background: #e9ecef;
  border-color: #3498db;
  color: #3498db;
}

.resource-btn i {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

/* Contenu principal */
.assignment-main {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.assignments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-left .section-title {
  margin: 0;
}

.search-box {
  position: relative;
  width: 300px;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.search-input {
  width: 100%;
  padding: 10px 10px 10px 40px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.header-right {
  position: relative;
}

.btn-sort {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  color: #495057;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-sort:hover {
  border-color: #3498db;
  color: #3498db;
}

.sort-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 10px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  min-width: 150px;
  z-index: 100;
}

.sort-option {
  display: block;
  width: 100%;
  padding: 12px 20px;
  background: none;
  border: none;
  text-align: left;
  color: #495057;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.sort-option:hover {
  background: #f8f9fa;
}

.sort-option.active {
  background: #3498db;
  color: white;
}

/* Liste des devoirs */
.assignments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.assignment-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  transition: all 0.3s;
  border-left: 4px solid transparent;
}

.assignment-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.assignment-card.assignment-overdue {
  border-left-color: #e74c3c;
}

.assignment-card.assignment-graded {
  border-left-color: #2ecc71;
}

.assignment-card.assignment-in-progress {
  border-left-color: #f39c12;
}

.assignment-card.assignment-group {
  border-left-color: #9b59b6;
}

.assignment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 25px;
  border-bottom: 1px solid #e9ecef;
}

.assignment-title-section {
  flex: 1;
}

.assignment-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.assignment-number {
  font-size: 12px;
  color: #6c757d;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
}

.assignment-type {
  font-size: 12px;
  color: #3498db;
  background: rgba(52, 152, 219, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
}

.group-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #9b59b6;
  background: rgba(155, 89, 182, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
}

.assignment-title {
  margin: 0 0 15px 0;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.assignment-details {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #6c757d;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-item i {
  font-size: 16px;
}

.assignment-status {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.status-default {
  background: #e9ecef;
  color: #6c757d;
}

.status-badge.status-warning {
  background: #fff3cd;
  color: #856404;
}

.status-badge.status-info {
  background: #d1ecf1;
  color: #0c5460;
}

.status-badge.status-success {
  background: #d4edda;
  color: #155724;
}

.status-badge.status-danger {
  background: #f8d7da;
  color: #721c24;
}

.assignment-body {
  padding: 25px;
}

.assignment-description {
  margin-bottom: 25px;
}

.assignment-description p {
  margin: 0 0 15px 0;
  color: #495057;
  line-height: 1.6;
}

.assignment-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 4px 10px;
  background: #e9ecef;
  color: #495057;
  font-size: 12px;
  border-radius: 15px;
}

.tag:hover {
  background: #dee2e6;
}

.assignment-progress {
  margin-bottom: 25px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.progress-label {
  font-size: 14px;
  color: #6c757d;
}

.progress-percent {
  font-weight: 600;
  color: #3498db;
}

.progress-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3498db;
  border-radius: 4px;
  transition: width 1s ease-in-out;
}

.assignment-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.btn-start,
.btn-continue,
.btn-outline,
.btn-warning,
.btn-feedback,
.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-start {
  background: #2ecc71;
  color: white;
  border: 2px solid #2ecc71;
}

.btn-start:hover {
  background: #27ae60;
  border-color: #27ae60;
}

.btn-continue {
  background: #3498db;
  color: white;
  border: 2px solid #3498db;
}

.btn-continue:hover {
  background: #2980b9;
  border-color: #2980b9;
}

.btn-outline {
  background: white;
  color: #3498db;
  border: 2px solid #3498db;
}

.btn-outline:hover {
  background: #3498db;
  color: white;
}

.btn-warning {
  background: #e74c3c;
  color: white;
  border: 2px solid #e74c3c;
}

.btn-warning:hover {
  background: #c0392b;
  border-color: #c0392b;
}

.btn-feedback {
  background: #9b59b6;
  color: white;
  border: 2px solid #9b59b6;
}

.btn-feedback:hover {
  background: #8e44ad;
  border-color: #8e44ad;
}

.assignment-timeline {
  position: relative;
  padding-left: 30px;
}

.assignment-timeline::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e9ecef;
}

.timeline-item {
  position: relative;
  margin-bottom: 20px;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: -22px;
  top: 5px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e9ecef;
  border: 2px solid white;
}

.timeline-item.active .timeline-dot {
  background: #3498db;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.timeline-date {
  font-size: 12px;
  color: #6c757d;
  font-weight: 600;
}

.timeline-text {
  font-size: 14px;
  color: #495057;
}

/* Aucun résultat */
.no-results {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.no-results i {
  font-size: 60px;
  color: #dee2e6;
  margin-bottom: 20px;
}

.no-results h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 24px;
}

.no-results p {
  margin: 0 0 20px 0;
  color: #6c757d;
  font-size: 16px;
  max-width: 500px;
  margin: 0 auto 20px;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.pagination-btn {
  padding: 10px 20px;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  color: #495057;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #3498db;
  color: #3498db;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  gap: 5px;
  align-items: center;
}

.page-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  color: #495057;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover {
  border-color: #3498db;
  color: #3498db;
}

.page-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.ellipsis {
  padding: 0 10px;
  color: #6c757d;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
}

.modal-header {
  padding: 25px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #6c757d;
  line-height: 1;
  transition: color 0.3s;
}

.btn-close:hover {
  color: #e74c3c;
}

.modal-body {
  padding: 25px;
}

.modal-footer {
  padding: 20px 25px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

/* Formulaire de soumission */
.submission-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.form-input,
.form-textarea {
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.file-upload-area {
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #f8f9fa;
}

.file-upload-area:hover {
  border-color: #3498db;
  background: #f0f7ff;
}

.upload-content i {
  font-size: 48px;
  color: #6c757d;
  margin-bottom: 15px;
}

.upload-content h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 18px;
}

.upload-content p {
  margin: 0 0 5px 0;
  color: #6c757d;
}

.file-types {
  font-size: 12px;
  color: #adb5bd;
}

.uploaded-files {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 15px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-info i {
  font-size: 24px;
  color: #6c757d;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.file-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.file-size {
  font-size: 12px;
  color: #6c757d;
}

.btn-remove-file {
  background: none;
  border: none;
  color: #adb5bd;
  cursor: pointer;
  font-size: 18px;
  transition: color 0.3s;
  padding: 5px;
}

.btn-remove-file:hover {
  color: #e74c3c;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  color: #495057;
  font-size: 14px;
  line-height: 1.5;
}

.checkbox-input {
  margin-top: 4px;
}

.checkbox-custom {
  display: inline-block;
  width: 20px;
  height: 20px;
  min-width: 20px;
  border: 2px solid #dee2e6;
  border-radius: 4px;
  position: relative;
  transition: all 0.3s;
}

.checkbox-input:checked + .checkbox-custom {
  background: #3498db;
  border-color: #3498db;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

/* Modal de feedback */
.feedback-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.grade-summary {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.grade-display {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.grade-display .grade-score {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  border-radius: 50%;
}

.grade-details h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 18px;
}

.grade-details p {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

.rubric-results {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.rubric-results h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 16px;
}

.rubric-item {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.criteria-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.criteria-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.criteria-weight {
  color: #6c757d;
  font-size: 12px;
  background: white;
  padding: 2px 8px;
  border-radius: 10px;
}

.criteria-score {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.score-bar {
  flex: 1;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  background: #2ecc71;
  border-radius: 4px;
}

.score-value {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
  min-width: 60px;
}

.criteria-feedback p {
  margin: 0;
  color: #495057;
  font-size: 14px;
  line-height: 1.5;
}

.instructor-feedback {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.feedback-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e9ecef;
}

.instructor-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #3498db;
}

.instructor-info h4 {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-size: 16px;
}

.instructor-info p {
  margin: 0 0 5px 0;
  color: #6c757d;
  font-size: 14px;
}

.feedback-date {
  font-size: 12px;
  color: #adb5bd;
}

.feedback-message {
  margin-bottom: 20px;
}

.feedback-message p {
  margin: 0;
  color: #495057;
  line-height: 1.6;
  font-size: 15px;
}

.feedback-attachments h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 16px;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  cursor: pointer;
  transition: all 0.3s;
}

.attachment-item:hover {
  border-color: #3498db;
  background: #f0f7ff;
}

.attachment-item i {
  font-size: 20px;
  color: #6c757d;
}

.attachment-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

/* Notification */
.notification {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  border-left: 4px solid #2ecc71;
  max-width: 400px;
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-content.success {
  border-left-color: #2ecc71;
}

.notification-content.success i {
  color: #2ecc71;
}

.notification-content i {
  font-size: 24px;
}

.notification-text h4 {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-size: 16px;
}

.notification-text p {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
  line-height: 1.4;
}

.btn-dismiss {
  background: none;
  border: none;
  color: #adb5bd;
  cursor: pointer;
  font-size: 18px;
  transition: color 0.3s;
  padding: 5px;
}

.btn-dismiss:hover {
  color: #6c757d;
}

/* Éditeur */
.assignment-editor {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 2000;
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #2c3e50;
  color: white;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.editor-header h2 {
  margin: 0;
  font-size: 20px;
}

.editor-status {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
}

.status-badge.auto-save {
  background: rgba(243, 156, 18, 0.2);
  color: #f39c12;
}

.status-badge.last-saved {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-close-editor {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.3s;
}

.btn-close-editor:hover {
  background: rgba(255,255,255,0.2);
  transform: rotate(90deg);
}

.editor-container {
  display: grid;
  grid-template-columns: 1fr 300px;
  grid-template-rows: auto 1fr;
  flex: 1;
  overflow: hidden;
}

.editor-toolbar {
  grid-column: 1 / -1;
  padding: 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  gap: 5px;
  align-items: center;
}

.tool-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  color: #495057;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  font-weight: 600;
}

.tool-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.tool-btn i {
  font-size: 16px;
}

.editor-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.editor-textarea {
  flex: 1;
  padding: 20px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  line-height: 1.6;
  resize: none;
  transition: all 0.3s;
}

.editor-textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.word-count {
  display: flex;
  justify-content: space-between;
  padding: 10px 5px;
  font-size: 12px;
  color: #6c757d;
}

.editor-sidebar {
  padding: 20px;
  background: #f8f9fa;
  border-left: 1px solid #e9ecef;
  overflow-y: auto;
}

.editor-sidebar .sidebar-section {
  margin-bottom: 30px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.editor-sidebar h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 16px;
}

.instructions {
  color: #495057;
  font-size: 14px;
  line-height: 1.6;
}

.instructions :deep(*) {
  margin: 0 0 10px 0;
}

.instructions :deep(*:last-child) {
  margin-bottom: 0;
}

.rubric-preview {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.criteria-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.criteria-name {
  font-size: 14px;
  color: #2c3e50;
}

.criteria-weight {
  font-size: 12px;
  color: #6c757d;
  background: white;
  padding: 2px 8px;
  border-radius: 10px;
}

.resources-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  color: #495057;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
}

.resource-item:hover {
  border-color: #3498db;
  color: #3498db;
  background: #f0f7ff;
}

.resource-item i {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

/* Responsive */
@media (max-width: 1200px) {
  .assignment-container {
    grid-template-columns: 1fr;
  }

  .assignment-sidebar {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .stats-widget {
    grid-column: 1 / -1;
  }
}

@media (max-width: 768px) {
  .assignment-container {
    grid-template-columns: 1fr;
  }

  .assignment-sidebar {
    grid-template-columns: 1fr;
  }

  .header-content {
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
  }

  .stats-summary {
    width: 100%;
    justify-content: space-between;
  }

  .assignments-header {
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
  }

  .header-left {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .search-box {
    width: 100%;
  }

  .assignment-header {
    flex-direction: column;
    gap: 20px;
  }

  .assignment-status {
    align-items: flex-start;
  }

  .assignment-details {
    flex-direction: column;
    gap: 10px;
  }

  .assignment-actions {
    flex-direction: column;
  }

  .assignment-actions button {
    width: 100%;
    justify-content: center;
  }

  .editor-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr;
  }

  .editor-sidebar {
    grid-row: 2;
    grid-column: 1;
    border-left: none;
    border-top: 1px solid #e9ecef;
  }

  .editor-content {
    grid-row: 3;
  }
}

@media (max-width: 480px) {
  .stats-summary {
    flex-direction: column;
    gap: 15px;
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .modal {
    max-width: 95%;
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-footer button {
    width: 100%;
    justify-content: center;
  }
}

/* Scrollbar personnalisée */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* Animation de chargement */
.loading {
  position: relative;
  overflow: hidden;
}

.loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
      90deg,
      transparent,
      rgba(255,255,255,0.1),
      transparent
  );
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* États d'erreur */
.error {
  border-color: #e74c3c !important;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* Tooltips */
[title] {
  position: relative;
}

[title]:hover::after {
  content: attr(title);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 100;
  margin-bottom: 10px;
  pointer-events: none;
}

[title]:hover::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: rgba(0,0,0,0.8);
  z-index: 100;
  margin-bottom: -2px;
  pointer-events: none;
}

/* Focus states pour l'accessibilité */
button:focus,
input:focus,
textarea:focus,
select:focus {
  outline: 2px solid #3498db;
  outline-offset: 2px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .assignment-view {
    background-color: #000;
    color: #fff;
  }

  .assignment-header {
    background: #000;
    border-bottom: 3px solid #fff;
  }

  .assignment-card {
    border: 2px solid #fff;
  }

  .modal {
    border: 3px solid #fff;
  }
}

/* Réduction de mouvement */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .assignment-card:hover {
    transform: none;
  }

  .notification-content {
    animation: none;
  }
}
</style>