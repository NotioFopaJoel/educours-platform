<template>
  <div class="video-player-view">
    <!-- Navigation breadcrumb -->
    <nav class="breadcrumb-nav">
      <div class="container">
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <router-link to="/courses">Cours</router-link>
          </li>
          <li class="breadcrumb-item">
            <router-link :to="`/courses/${course.id}`">{{ course.title }}</router-link>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            Apprentissage
          </li>
        </ol>
      </div>
    </nav>

    <div class="learning-container">
      <!-- Sidebar gauche : Curriculum -->
      <aside class="curriculum-sidebar" :class="{ collapsed: isSidebarCollapsed }">
        <div class="sidebar-header">
          <h3 class="sidebar-title">
            <i class="icon-menu"></i>
            Curriculum
          </h3>
          <button
              class="btn-collapse"
              @click="toggleSidebar"
              :title="isSidebarCollapsed ? 'Développer' : 'Réduire'"
          >
            <i :class="isSidebarCollapsed ? 'icon-chevron-right' : 'icon-chevron-left'"></i>
          </button>
        </div>

        <!-- Progression -->
        <div class="progress-summary">
          <div class="progress-info">
            <div class="progress-text">Votre progression</div>
            <div class="progress-percent">{{ courseProgress }}%</div>
          </div>
          <div class="progress-bar">
            <div
                class="progress-fill"
                :style="{ width: courseProgress + '%' }"
            ></div>
          </div>
          <div class="progress-stats">
            <span>{{ completedLectures }} / {{ totalLectures }} leçons</span>
            <span>{{ completedTime }} / {{ course.duration }}</span>
          </div>
        </div>

        <!-- Sections du cours -->
        <div class="sections-container">
          <div
              v-for="section in curriculum"
              :key="section.id"
              class="section-item"
              :class="{
              'active': activeSection === section.id,
              'completed': isSectionCompleted(section.id)
            }"
          >
            <div
                class="section-header"
                @click="toggleSection(section.id)"
            >
              <div class="section-info">
                <div class="section-title">
                  <i
                      :class="activeSection === section.id ? 'icon-folder-open' : 'icon-folder'"
                  ></i>
                  <span>{{ section.title }}</span>
                </div>
                <div class="section-meta">
                  <span class="lecture-count">{{ section.lectures.length }} leçons</span>
                  <span class="section-duration">{{ section.duration }}</span>
                </div>
              </div>
              <div class="section-toggle">
                <i class="icon-chevron-down"></i>
              </div>
            </div>

            <!-- Liste des leçons -->
            <div
                class="lectures-list"
                v-if="activeSection === section.id"
            >
              <div
                  v-for="lecture in section.lectures"
                  :key="lecture.id"
                  class="lecture-item"
                  :class="{
                  'active': activeLecture?.id === lecture.id,
                  'completed': lecture.completed,
                  'playing': isLecturePlaying(lecture.id)
                }"
                  @click="selectLecture(lecture)"
              >
                <div class="lecture-status">
                  <i
                      v-if="lecture.completed"
                      class="icon-check-circle"
                  ></i>
                  <i
                      v-else-if="activeLecture?.id === lecture.id"
                      class="icon-play-circle"
                  ></i>
                  <i
                      v-else
                      class="icon-circle"
                  ></i>
                </div>
                <div class="lecture-info">
                  <div class="lecture-title">
                    {{ lecture.title }}
                    <span v-if="lecture.isPreview" class="preview-badge">Aperçu</span>
                  </div>
                  <div class="lecture-meta">
                    <span class="lecture-type">{{ getLectureType(lecture.type) }}</span>
                    <span class="lecture-duration">{{ lecture.duration }}</span>
                  </div>
                </div>
                <div class="lecture-actions">
                  <button
                      v-if="lecture.type === 'quiz'"
                      class="btn-quiz"
                      @click.stop="takeQuiz(lecture)"
                      title="Passer le quiz"
                  >
                    <i class="icon-quiz"></i>
                  </button>
                  <button
                      v-if="lecture.resources.length > 0"
                      class="btn-resources"
                      @click.stop="showResources(lecture)"
                      title="Ressources"
                  >
                    <i class="icon-download"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Téléchargements -->
        <div class="downloads-section">
          <h4 class="downloads-title">
            <i class="icon-download"></i>
            Ressources
          </h4>
          <div class="downloads-list">
            <button
                v-for="resource in course.resources"
                :key="resource.id"
                class="download-item"
                @click="downloadResource(resource)"
            >
              <i :class="getResourceIcon(resource.type)"></i>
              <span class="resource-name">{{ resource.name }}</span>
              <span class="resource-size">{{ resource.size }}</span>
            </button>
          </div>
        </div>
      </aside>

      <!-- Contenu principal : Player et interface -->
      <main class="learning-main">
        <!-- Player vidéo -->
        <div class="video-player-container">
          <div class="video-wrapper">
            <!-- Player principal -->
            <div class="video-player" ref="videoPlayer">
              <div class="player-placeholder" v-if="!currentVideoUrl">
                <i class="icon-play-large"></i>
                <p>Sélectionnez une leçon pour commencer</p>
              </div>

              <!-- Intégration du player vidéo -->
              <div v-else class="player-integration">
                <!-- Remplacez ceci par votre player vidéo (Vimeo, YouTube, custom) -->
                <div class="custom-player">
                  <div class="player-controls">
                    <button class="control-btn" @click="togglePlay">
                      <i :class="isPlaying ? 'icon-pause' : 'icon-play'"></i>
                    </button>
                    <div class="progress-container">
                      <input
                          type="range"
                          v-model="playbackProgress"
                          min="0"
                          max="100"
                          class="progress-slider"
                          @input="seekVideo"
                      >
                      <div class="progress-time">
                        <span class="current-time">{{ formatTime(currentTime) }}</span>
                        <span class="total-time">{{ formatTime(totalDuration) }}</span>
                      </div>
                    </div>
                    <button class="control-btn" @click="toggleFullscreen">
                      <i :class="isFullscreen ? 'icon-fullscreen-exit' : 'icon-fullscreen'"></i>
                    </button>
                    <div class="volume-control">
                      <button class="control-btn" @click="toggleMute">
                        <i :class="isMuted ? 'icon-volume-off' : 'icon-volume-up'"></i>
                      </button>
                      <input
                          type="range"
                          v-model="volume"
                          min="0"
                          max="100"
                          class="volume-slider"
                          @input="updateVolume"
                      >
                    </div>
                    <select v-model="playbackSpeed" class="speed-select" @change="updatePlaybackSpeed">
                      <option value="0.5">0.5x</option>
                      <option value="0.75">0.75x</option>
                      <option value="1" selected>1x</option>
                      <option value="1.25">1.25x</option>
                      <option value="1.5">1.5x</option>
                      <option value="2">2x</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Contrôles supplémentaires -->
            <div class="player-extra-controls">
              <div class="left-controls">
                <button
                    class="btn-transcript"
                    @click="toggleTranscript"
                    :class="{ active: showTranscript }"
                >
                  <i class="icon-text"></i>
                  Transcription
                </button>
                <button class="btn-notes" @click="toggleNotes">
                  <i class="icon-notes"></i>
                  Notes
                </button>
                <button class="btn-bookmark" @click="toggleBookmark">
                  <i :class="isBookmarked ? 'icon-bookmark-filled' : 'icon-bookmark'"></i>
                  Marquer
                </button>
              </div>
              <div class="right-controls">
                <button
                    class="btn-prev"
                    @click="goToPrevious"
                    :disabled="!hasPreviousLecture"
                >
                  <i class="icon-chevron-left"></i>
                  Précédent
                </button>
                <button
                    class="btn-next"
                    @click="goToNext"
                    :disabled="!hasNextLecture"
                >
                  Suivant
                  <i class="icon-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Barre d'info du cours -->
          <div class="course-info-bar">
            <div class="course-title-section">
              <h1 class="course-title">{{ course.title }}</h1>
              <div class="lecture-info">
                <span class="section-title">{{ activeSectionTitle }}</span>
                <span class="lecture-title">{{ activeLecture?.title }}</span>
              </div>
            </div>
            <div class="course-actions">
              <button class="btn-complete" @click="markAsComplete">
                <i class="icon-check"></i>
                Marquer comme terminé
              </button>
              <button class="btn-discuss" @click="openDiscussion">
                <i class="icon-discuss"></i>
                Discussion
              </button>
            </div>
          </div>
        </div>

        <!-- Contenu complémentaire -->
        <div class="learning-content">
          <!-- Onglets -->
          <div class="content-tabs">
            <button
                v-for="tab in contentTabs"
                :key="tab.id"
                class="tab-btn"
                :class="{ active: activeContentTab === tab.id }"
                @click="activeContentTab = tab.id"
            >
              <i :class="tab.icon"></i>
              {{ tab.label }}
            </button>
          </div>

          <!-- Contenu des onglets -->
          <div class="tab-content-container">
            <!-- Onglet Description -->
            <div v-if="activeContentTab === 'description'" class="tab-content">
              <div class="lecture-description">
                <h3>{{ activeLecture?.title }}</h3>
                <div class="description-content" v-html="activeLecture?.description"></div>

                <!-- Points clés -->
                <div class="key-points" v-if="activeLecture?.keyPoints?.length">
                  <h4>Points clés</h4>
                  <ul class="points-list">
                    <li
                        v-for="point in activeLecture.keyPoints"
                        :key="point"
                        class="point-item"
                    >
                      <i class="icon-bullet"></i>
                      <span>{{ point }}</span>
                    </li>
                  </ul>
                </div>

                <!-- Ressources de la leçon -->
                <div class="lecture-resources" v-if="activeLecture?.resources?.length">
                  <h4>Ressources de la leçon</h4>
                  <div class="resources-grid">
                    <div
                        v-for="resource in activeLecture.resources"
                        :key="resource.id"
                        class="resource-card"
                        @click="downloadResource(resource)"
                    >
                      <div class="resource-icon">
                        <i :class="getResourceIcon(resource.type)"></i>
                      </div>
                      <div class="resource-info">
                        <h5>{{ resource.name }}</h5>
                        <p>{{ resource.description }}</p>
                        <div class="resource-meta">
                          <span class="resource-type">{{ resource.type }}</span>
                          <span class="resource-size">{{ resource.size }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Onglet Transcription -->
            <div v-if="activeContentTab === 'transcript'" class="tab-content">
              <div class="transcript-container">
                <div class="transcript-header">
                  <h3>Transcription</h3>
                  <button class="btn-download-transcript" @click="downloadTranscript">
                    <i class="icon-download"></i>
                    Télécharger
                  </button>
                </div>
                <div class="transcript-content">
                  <div
                      v-for="segment in transcript"
                      :key="segment.id"
                      class="transcript-segment"
                      :class="{ active: isSegmentActive(segment) }"
                      @click="seekToSegment(segment)"
                  >
                    <div class="segment-time">{{ formatTime(segment.startTime) }}</div>
                    <div class="segment-text">{{ segment.text }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Onglet Notes -->
            <div v-if="activeContentTab === 'notes'" class="tab-content">
              <div class="notes-container">
                <div class="notes-header">
                  <h3>Vos notes</h3>
                  <div class="notes-actions">
                    <button class="btn-add-note" @click="showAddNoteModal = true">
                      <i class="icon-add"></i>
                      Nouvelle note
                    </button>
                  </div>
                </div>

                <!-- Liste des notes -->
                <div class="notes-list" v-if="notes.length > 0">
                  <div
                      v-for="note in notes"
                      :key="note.id"
                      class="note-item"
                  >
                    <div class="note-header">
                      <div class="note-time">{{ formatTime(note.timestamp) }}</div>
                      <div class="note-actions">
                        <button class="btn-edit-note" @click="editNote(note)">
                          <i class="icon-edit"></i>
                        </button>
                        <button class="btn-delete-note" @click="deleteNote(note.id)">
                          <i class="icon-delete"></i>
                        </button>
                      </div>
                    </div>
                    <div class="note-content">{{ note.content }}</div>
                  </div>
                </div>

                <!-- Aucune note -->
                <div v-else class="empty-notes">
                  <i class="icon-notes-empty"></i>
                  <p>Aucune note pour cette leçon</p>
                  <button class="btn-add-first-note" @click="showAddNoteModal = true">
                    Ajouter votre première note
                  </button>
                </div>
              </div>
            </div>

            <!-- Onglet Discussion -->
            <div v-if="activeContentTab === 'discussion'" class="tab-content">
              <div class="discussion-container">
                <div class="discussion-header">
                  <h3>Discussion sur cette leçon</h3>
                  <div class="discussion-stats">
                    <span>{{ discussionPosts.length }} messages</span>
                    <span>{{ activeParticipants }} participants</span>
                  </div>
                </div>

                <!-- Nouveau message -->
                <div class="new-post">
                  <textarea
                      v-model="newPostContent"
                      placeholder="Posez une question ou partagez vos pensées..."
                      rows="3"
                      class="post-input"
                  ></textarea>
                  <div class="post-actions">
                    <button class="btn-post" @click="createPost">
                      <i class="icon-send"></i>
                      Publier
                    </button>
                  </div>
                </div>

                <!-- Filtres de discussion -->
                <div class="discussion-filters">
                  <button
                      v-for="filter in discussionFilters"
                      :key="filter.value"
                      class="filter-btn"
                      :class="{ active: activeDiscussionFilter === filter.value }"
                      @click="activeDiscussionFilter = filter.value"
                  >
                    {{ filter.label }}
                  </button>
                </div>

                <!-- Liste des messages -->
                <div class="posts-list">
                  <div
                      v-for="post in filteredPosts"
                      :key="post.id"
                      class="post-item"
                  >
                    <div class="post-author">
                      <img
                          :src="post.author.avatar"
                          :alt="post.author.name"
                          class="author-avatar"
                      >
                      <div class="author-info">
                        <h4 class="author-name">{{ post.author.name }}</h4>
                        <div class="post-meta">
                          <span class="post-time">{{ formatRelativeTime(post.createdAt) }}</span>
                          <span v-if="post.isInstructor" class="instructor-badge">Instructeur</span>
                        </div>
                      </div>
                    </div>
                    <div class="post-content">
                      <p>{{ post.content }}</p>
                    </div>
                    <div class="post-actions">
                      <button
                          class="btn-like"
                          :class="{ active: post.isLiked }"
                          @click="toggleLike(post.id)"
                      >
                        <i class="icon-thumbs-up"></i>
                        {{ post.likes }}
                      </button>
                      <button class="btn-reply" @click="showReplyBox(post.id)">
                        <i class="icon-reply"></i>
                        Répondre
                      </button>
                    </div>

                    <!-- Réponses -->
                    <div class="replies-list" v-if="post.replies?.length">
                      <div
                          v-for="reply in post.replies"
                          :key="reply.id"
                          class="reply-item"
                      >
                        <div class="reply-author">
                          <img
                              :src="reply.author.avatar"
                              :alt="reply.author.name"
                              class="author-avatar-sm"
                          >
                          <div class="author-info">
                            <h5 class="author-name">{{ reply.author.name }}</h5>
                            <span class="reply-time">{{ formatRelativeTime(reply.createdAt) }}</span>
                          </div>
                        </div>
                        <div class="reply-content">
                          <p>{{ reply.content }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Onglet Quiz -->
            <div v-if="activeContentTab === 'quiz' && activeLecture?.type === 'quiz'" class="tab-content">
              <div class="quiz-container">
                <div class="quiz-header">
                  <h3>Quiz: {{ activeLecture.title }}</h3>
                  <div class="quiz-info">
                    <span>{{ quizQuestions.length }} questions</span>
                    <span>Temps estimé: {{ quizEstimatedTime }}</span>
                  </div>
                </div>

                <!-- Instructions -->
                <div class="quiz-instructions">
                  <h4>Instructions</h4>
                  <ul class="instructions-list">
                    <li>Ce quiz contient {{ quizQuestions.length }} questions</li>
                    <li>Vous devez obtenir au moins {{ quizPassingScore }}% pour réussir</li>
                    <li>Vous avez {{ quizTimeLimit }} minutes pour terminer</li>
                    <li>Les réponses sont enregistrées automatiquement</li>
                  </ul>
                  <button class="btn-start-quiz" @click="startQuiz">
                    <i class="icon-play"></i>
                    Commencer le quiz
                  </button>
                </div>

                <!-- Résultats précédents -->
                <div class="previous-results" v-if="previousAttempts.length > 0">
                  <h4>Vos précédents résultats</h4>
                  <div class="results-list">
                    <div
                        v-for="attempt in previousAttempts"
                        :key="attempt.id"
                        class="attempt-item"
                        :class="{ passed: attempt.passed }"
                    >
                      <div class="attempt-date">{{ formatDate(attempt.date) }}</div>
                      <div class="attempt-score">{{ attempt.score }}%</div>
                      <div class="attempt-status">
                        {{ attempt.passed ? 'Réussi' : 'Échoué' }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Sidebar droite : Aide et navigation -->
      <aside class="help-sidebar">
        <!-- Prochaine leçon -->
        <div class="next-lesson-card">
          <h4 class="card-title">Prochaine leçon</h4>
          <div class="next-lesson" v-if="nextLecture">
            <div class="lesson-info">
              <h5>{{ nextLecture.title }}</h5>
              <p>{{ getLectureType(nextLecture.type) }} • {{ nextLecture.duration }}</p>
            </div>
            <button class="btn-start-next" @click="goToNext">
              <i class="icon-play"></i>
              Commencer
            </button>
          </div>
          <div v-else class="no-next-lesson">
            <i class="icon-trophy"></i>
            <p>Toutes les leçons sont terminées !</p>
            <button class="btn-certificate" @click="viewCertificate">
              Voir votre certificat
            </button>
          </div>
        </div>

        <!-- Aide rapide -->
        <div class="quick-help-card">
          <h4 class="card-title">Aide rapide</h4>
          <div class="help-actions">
            <button class="help-btn" @click="openHelp('keyboard')">
              <i class="icon-keyboard"></i>
              Raccourcis clavier
            </button>
            <button class="help-btn" @click="openHelp('technical')">
              <i class="icon-support"></i>
              Support technique
            </button>
            <button class="help-btn" @click="openHelp('content')">
              <i class="icon-question"></i>
              Question sur le contenu
            </button>
            <button class="help-btn" @click="reportIssue">
              <i class="icon-flag"></i>
              Signaler un problème
            </button>
          </div>
        </div>

        <!-- Objectifs de la leçon -->
        <div class="lesson-objectives-card" v-if="activeLecture?.objectives">
          <h4 class="card-title">Objectifs de cette leçon</h4>
          <ul class="objectives-list">
            <li
                v-for="objective in activeLecture.objectives"
                :key="objective"
                class="objective-item"
            >
              <i class="icon-check"></i>
              <span>{{ objective }}</span>
            </li>
          </ul>
        </div>

        <!-- Statistiques d'apprentissage -->
        <div class="learning-stats-card">
          <h4 class="card-title">Vos statistiques</h4>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ totalStudyTime }}</div>
              <div class="stat-label">Temps total</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ notes.length }}</div>
              <div class="stat-label">Notes prises</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ completedLectures }}</div>
              <div class="stat-label">Leçons terminées</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ streakDays }}</div>
              <div class="stat-label">Jours consécutifs</div>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <!-- Modal d'ajout de note -->
    <div class="modal-overlay" v-if="showAddNoteModal">
      <div class="modal modal-note">
        <div class="modal-header">
          <h2>{{ editingNote ? 'Modifier la note' : 'Nouvelle note' }}</h2>
          <button class="btn-close" @click="closeNoteModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="note-timestamp">
            <i class="icon-clock"></i>
            <span>À {{ formatTime(currentTime) }} dans la vidéo</span>
          </div>
          <textarea
              v-model="newNoteContent"
              placeholder="Écrivez votre note ici..."
              rows="6"
              class="note-input"
          ></textarea>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeNoteModal">
            Annuler
          </button>
          <button class="btn-primary" @click="saveNote">
            {{ editingNote ? 'Mettre à jour' : 'Enregistrer' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de lecture du quiz -->
    <div class="modal-overlay" v-if="showQuizModal">
      <div class="modal modal-quiz">
        <div class="modal-header">
          <h2>Quiz: {{ activeQuiz?.title }}</h2>
          <div class="quiz-progress">
            Question {{ currentQuestionIndex + 1 }} / {{ quizQuestions.length }}
            <div class="progress-bar">
              <div
                  class="progress-fill"
                  :style="{ width: ((currentQuestionIndex + 1) / quizQuestions.length) * 100 + '%' }"
              ></div>
            </div>
          </div>
        </div>
        <div class="modal-body">
          <div class="quiz-question" v-if="currentQuestion">
            <h3 class="question-text">{{ currentQuestion.text }}</h3>

            <!-- Question à choix multiples -->
            <div v-if="currentQuestion.type === 'multiple'" class="multiple-choice">
              <div
                  v-for="(option, index) in currentQuestion.options"
                  :key="index"
                  class="choice-option"
                  :class="{
                  selected: selectedAnswers.includes(index),
                  correct: showResults && option.correct,
                  incorrect: showResults && selectedAnswers.includes(index) && !option.correct
                }"
                  @click="selectAnswer(index)"
              >
                <div class="option-letter">{{ String.fromCharCode(65 + index) }}</div>
                <div class="option-text">{{ option.text }}</div>
                <div class="option-feedback" v-if="showResults">
                  <i
                      v-if="option.correct"
                      class="icon-check"
                  ></i>
                  <i
                      v-else-if="selectedAnswers.includes(index) && !option.correct"
                      class="icon-close"
                  ></i>
                </div>
              </div>
            </div>

            <!-- Question vrai/faux -->
            <div v-if="currentQuestion.type === 'truefalse'" class="true-false">
              <button
                  class="tf-btn true"
                  :class="{ selected: selectedAnswers[0] === true }"
                  @click="selectTrueFalse(true)"
              >
                Vrai
              </button>
              <button
                  class="tf-btn false"
                  :class="{ selected: selectedAnswers[0] === false }"
                  @click="selectTrueFalse(false)"
              >
                Faux
              </button>
            </div>

            <!-- Explication (après réponse) -->
            <div v-if="showResults && currentQuestion.explanation" class="question-explanation">
              <h4>Explication :</h4>
              <p>{{ currentQuestion.explanation }}</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <div class="quiz-timer" v-if="quizTimeLeft > 0">
            <i class="icon-clock"></i>
            Temps restant: {{ formatTime(quizTimeLeft * 1000) }}
          </div>
          <div class="quiz-actions">
            <button
                class="btn-secondary"
                @click="previousQuestion"
                :disabled="currentQuestionIndex === 0"
            >
              Précédent
            </button>
            <button
                class="btn-primary"
                v-if="!showResults"
                @click="checkAnswer"
                :disabled="selectedAnswers.length === 0"
            >
              Vérifier la réponse
            </button>
            <button
                class="btn-primary"
                v-else
                @click="nextQuestion"
            >
              {{ isLastQuestion ? 'Terminer le quiz' : 'Question suivante' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Raccourcis clavier -->
    <div class="keyboard-shortcuts" v-if="showShortcutsHelp">
      <div class="shortcuts-overlay" @click="showShortcutsHelp = false"></div>
      <div class="shortcuts-modal">
        <div class="shortcuts-header">
          <h3>Raccourcis clavier</h3>
          <button class="btn-close" @click="showShortcutsHelp = false">&times;</button>
        </div>
        <div class="shortcuts-list">
          <div class="shortcut-item">
            <kbd>Espace</kbd>
            <span>Lecture/Pause</span>
          </div>
          <div class="shortcut-item">
            <kbd>→</kbd>
            <span>Avancer 5 secondes</span>
          </div>
          <div class="shortcut-item">
            <kbd>←</kbd>
            <span>Reculer 5 secondes</span>
          </div>
          <div class="shortcut-item">
            <kbd>F</kbd>
            <span>Plein écran</span>
          </div>
          <div class="shortcut-item">
            <kbd>M</kbd>
            <span>Activer/désactiver le son</span>
          </div>
          <div class="shortcut-item">
            <kbd>N</kbd>
            <span>Note rapide</span>
          </div>
          <div class="shortcut-item">
            <kbd>J</kbd>
            <span>Leçon précédente</span>
          </div>
          <div class="shortcut-item">
            <kbd>K</kbd>
            <span>Leçon suivante</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// États de l'interface
const isSidebarCollapsed = ref(false)
const activeSection = ref(1)
const activeLecture = ref(null)
const activeContentTab = ref('description')
const showTranscript = ref(false)
const showAddNoteModal = ref(false)
const showQuizModal = ref(false)
const showShortcutsHelp = ref(false)
const isFullscreen = ref(false)
const isPlaying = ref(false)
const isMuted = ref(false)
const volume = ref(100)
const playbackSpeed = ref(1)
const playbackProgress = ref(0)
const currentTime = ref(0)
const totalDuration = ref(0)

// États de quiz
const currentQuestionIndex = ref(0)
const selectedAnswers = ref([])
const showResults = ref(false)
const quizTimeLeft = ref(0)

// Données du cours (simulées)
const course = ref({
  id: 1,
  title: 'Introduction à JavaScript - De Zéro à Héros',
  duration: '15h 30min',
  resources: [
    { id: 1, name: 'Support de cours PDF', type: 'pdf', size: '2.5 MB' },
    { id: 2, name: 'Code source des exemples', type: 'zip', size: '15 MB' },
    { id: 3, name: 'Exercices pratiques', type: 'doc', size: '1.8 MB' }
  ]
})

// Curriculum (simulé)
const curriculum = ref([
  {
    id: 1,
    title: 'Introduction et installation',
    duration: '45min',
    lectures: [
      {
        id: 1,
        title: 'Bienvenue dans le cours',
        type: 'video',
        duration: '5min',
        completed: true,
        isPreview: true,
        description: '<p>Introduction au cours JavaScript. Nous verrons ce que vous allez apprendre et comment tirer le meilleur parti de cette formation.</p>',
        objectives: [
          'Comprendre les objectifs du cours',
          'Savoir naviguer dans l\'interface d\'apprentissage',
          'Configurer son environnement de travail'
        ],
        resources: [
          { id: 1, name: 'Plan du cours', type: 'pdf', size: '500 KB', description: 'Structure détaillée du cours' }
        ]
      },
      {
        id: 2,
        title: 'Installation des outils',
        type: 'video',
        duration: '15min',
        completed: true,
        description: 'Guide d\'installation de Node.js, VS Code et autres outils essentiels.',
        objectives: [
          'Installer Node.js et npm',
          'Configurer VS Code',
          'Créer son premier projet'
        ]
      }
    ]
  },
  {
    id: 2,
    title: 'Les bases de JavaScript',
    duration: '2h 30min',
    lectures: [
      {
        id: 3,
        title: 'Variables et types de données',
        type: 'video',
        duration: '20min',
        completed: true,
        description: 'Découverte des variables, constantes et différents types de données en JavaScript.'
      },
      {
        id: 4,
        title: 'Quiz: Les bases',
        type: 'quiz',
        duration: '10min',
        completed: false,
        description: 'Testez vos connaissances sur les fondamentaux de JavaScript.'
      }
    ]
  }
])

// Transcription (simulée)
const transcript = ref([
  { id: 1, startTime: 0, text: 'Bienvenue dans cette leçon sur les variables en JavaScript.' },
  { id: 2, startTime: 30, text: 'Les variables sont des conteneurs pour stocker des valeurs de données.' },
  { id: 3, startTime: 60, text: 'En JavaScript, nous avons trois mots-clés pour déclarer des variables...' }
])

// Notes (simulées)
const notes = ref([
  { id: 1, timestamp: 45, content: 'Les variables let peuvent être réassignées' },
  { id: 2, timestamp: 120, content: 'Penser à utiliser const par défaut' }
])

// Discussion (simulée)
const discussionPosts = ref([
  {
    id: 1,
    author: {
      id: 1,
      name: 'Koffi Kouamé',
      avatar: '/images/avatar3.jpg'
    },
    content: 'Je ne comprends pas la différence entre let et var, quelqu\'un peut m\'expliquer ?',
    createdAt: '2024-02-15T10:30:00',
    likes: 12,
    isLiked: false,
    isInstructor: false,
    replies: [
      {
        id: 1,
        author: {
          id: 2,
          name: 'Prof. Jean Dupont',
          avatar: '/images/avatar1.jpg'
        },
        content: 'var a une portée fonctionnelle tandis que let a une portée bloc. Je recommande d\'utiliser let.',
        createdAt: '2024-02-15T11:15:00'
      }
    ]
  }
])

// Quiz (simulé)
const quizQuestions = ref([
  {
    id: 1,
    text: 'Quel mot-clé utilise-t-on pour déclarer une variable qui ne peut pas être réassignée ?',
    type: 'multiple',
    options: [
      { text: 'var', correct: false },
      { text: 'let', correct: false },
      { text: 'const', correct: true },
      { text: 'static', correct: false }
    ],
    explanation: 'const est utilisé pour déclarer des variables constantes qui ne peuvent pas être réassignées.'
  },
  {
    id: 2,
    text: 'JavaScript est un langage typé statiquement.',
    type: 'truefalse',
    options: [
      { text: 'Vrai', correct: false },
      { text: 'Faux', correct: true }
    ],
    explanation: 'JavaScript est un langage typé dynamiquement, le type des variables est déterminé à l\'exécution.'
  }
])

// Données utilisateur (simulées)
const courseProgress = ref(35)
const completedLectures = ref(3)
const totalLectures = ref(8)
const completedTime = ref('2h 15min')
const totalStudyTime = ref('15h 30min')
const streakDays = ref(7)
const previousAttempts = ref([
  { id: 1, date: '2024-02-10', score: 85, passed: true },
  { id: 2, date: '2024-02-08', score: 60, passed: false }
])

// Onglets de contenu
const contentTabs = ref([
  { id: 'description', label: 'Description', icon: 'icon-info' },
  { id: 'transcript', label: 'Transcription', icon: 'icon-text' },
  { id: 'notes', label: 'Notes', icon: 'icon-notes' },
  { id: 'discussion', label: 'Discussion', icon: 'icon-discuss' },
  { id: 'quiz', label: 'Quiz', icon: 'icon-quiz' }
])

// Filtres de discussion
const discussionFilters = ref([
  { value: 'all', label: 'Tous' },
  { value: 'unanswered', label: 'Sans réponse' },
  { value: 'instructor', label: 'Réponses instructeur' },
  { value: 'popular', label: 'Populaires' }
])

const activeDiscussionFilter = ref('all')
const newPostContent = ref('')

// Note en cours d'édition
const editingNote = ref(null)
const newNoteContent = ref('')

// Quiz en cours
const activeQuiz = ref(null)

// Computed properties
const activeSectionTitle = computed(() => {
  const section = curriculum.value.find(s => s.id === activeSection.value)
  return section?.title || ''
})

const nextLecture = computed(() => {
  if (!activeLecture.value) return null

  const currentSection = curriculum.value.find(s => s.id === activeSection.value)
  if (!currentSection) return null

  const currentIndex = currentSection.lectures.findIndex(l => l.id === activeLecture.value.id)
  if (currentIndex < currentSection.lectures.length - 1) {
    return currentSection.lectures[currentIndex + 1]
  }

  // Chercher dans la section suivante
  const currentSectionIndex = curriculum.value.findIndex(s => s.id === activeSection.value)
  if (currentSectionIndex < curriculum.value.length - 1) {
    const nextSection = curriculum.value[currentSectionIndex + 1]
    return nextSection.lectures[0]
  }

  return null
})

const hasNextLecture = computed(() => !!nextLecture.value)

const previousLecture = computed(() => {
  if (!activeLecture.value) return null

  const currentSection = curriculum.value.find(s => s.id === activeSection.value)
  if (!currentSection) return null

  const currentIndex = currentSection.lectures.findIndex(l => l.id === activeLecture.value.id)
  if (currentIndex > 0) {
    return currentSection.lectures[currentIndex - 1]
  }

  // Chercher dans la section précédente
  const currentSectionIndex = curriculum.value.findIndex(s => s.id === activeSection.value)
  if (currentSectionIndex > 0) {
    const prevSection = curriculum.value[currentSectionIndex - 1]
    return prevSection.lectures[prevSection.lectures.length - 1]
  }

  return null
})

const hasPreviousLecture = computed(() => !!previousLecture.value)

const filteredPosts = computed(() => {
  let posts = discussionPosts.value

  switch (activeDiscussionFilter.value) {
    case 'unanswered':
      return posts.filter(post => post.replies.length === 0)
    case 'instructor':
      return posts.filter(post => post.replies.some(reply => reply.author.name.includes('Prof.')))
    case 'popular':
      return posts.sort((a, b) => b.likes - a.likes)
    default:
      return posts
  }
})

const activeParticipants = computed(() => {
  const participants = new Set()
  discussionPosts.value.forEach(post => {
    participants.add(post.author.id)
    post.replies?.forEach(reply => participants.add(reply.author.id))
  })
  return participants.size
})

const quizEstimatedTime = computed(() => {
  return Math.ceil(quizQuestions.value.length * 1.5) + ' min'
})

const quizPassingScore = 70
const quizTimeLimit = 30
const currentQuestion = computed(() => quizQuestions.value[currentQuestionIndex.value])
const isLastQuestion = computed(() => currentQuestionIndex.value === quizQuestions.value.length - 1)

// Méthodes utilitaires
const getLectureType = (type) => {
  const types = {
    video: 'Vidéo',
    quiz: 'Quiz',
    exercise: 'Exercice',
    article: 'Article'
  }
  return types[type] || type
}

const getResourceIcon = (type) => {
  const icons = {
    pdf: 'icon-pdf',
    zip: 'icon-zip',
    doc: 'icon-doc',
    video: 'icon-video',
    code: 'icon-code'
  }
  return icons[type] || 'icon-file'
}

const formatTime = (milliseconds) => {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

const formatRelativeTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'À l\'instant'
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffHours < 24) return `Il y a ${diffHours} h`
  if (diffDays < 7) return `Il y a ${diffDays} j`

  return date.toLocaleDateString('fr-FR')
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

// Actions de l'interface
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const toggleSection = (sectionId) => {
  activeSection.value = activeSection.value === sectionId ? null : sectionId
}

const isSectionCompleted = (sectionId) => {
  const section = curriculum.value.find(s => s.id === sectionId)
  return section?.lectures.every(l => l.completed) || false
}

const isLecturePlaying = (lectureId) => {
  return activeLecture.value?.id === lectureId && isPlaying.value
}

const selectLecture = (lecture) => {
  activeLecture.value = lecture
  activeContentTab.value = 'description'

  // Simuler le chargement de la vidéo
  if (lecture.type === 'video') {
    isPlaying.value = true
    totalDuration.value = 300000 // 5 minutes en millisecondes
    currentTime.value = 0
    playbackProgress.value = 0

    // Simuler la progression de la vidéo
    if (videoInterval) clearInterval(videoInterval)
    videoInterval = setInterval(() => {
      if (isPlaying.value && currentTime.value < totalDuration.value) {
        currentTime.value += 1000
        playbackProgress.value = (currentTime.value / totalDuration.value) * 100
      }
    }, 1000)
  }
}

let videoInterval = null

const togglePlay = () => {
  isPlaying.value = !isPlaying.value
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  // Implémenter la logique de plein écran réelle ici
}

const toggleMute = () => {
  isMuted.value = !isMuted.value
}

const updateVolume = () => {
  // Implémenter la logique de volume
}

const updatePlaybackSpeed = () => {
  // Implémenter la logique de vitesse de lecture
}

const seekVideo = () => {
  currentTime.value = (playbackProgress.value / 100) * totalDuration.value
}

const toggleTranscript = () => {
  showTranscript.value = !showTranscript.value
  if (showTranscript.value) {
    activeContentTab.value = 'transcript'
  }
}

const toggleNotes = () => {
  activeContentTab.value = 'notes'
}

const toggleBookmark = () => {
  // Implémenter la logique de bookmark
}

const goToPrevious = () => {
  if (previousLecture.value) {
    selectLecture(previousLecture.value)
  }
}

const goToNext = () => {
  if (nextLecture.value) {
    selectLecture(nextLecture.value)
  }
}

const markAsComplete = () => {
  if (activeLecture.value) {
    activeLecture.value.completed = true
    // Mettre à jour la progression
    const completed = curriculum.value
        .flatMap(s => s.lectures)
        .filter(l => l.completed).length
    const total = curriculum.value.flatMap(s => s.lectures).length
    courseProgress.value = Math.round((completed / total) * 100)
    completedLectures.value = completed

    // Passer automatiquement à la leçon suivante si activé
    if (hasNextLecture.value) {
      setTimeout(() => goToNext(), 1000)
    }
  }
}

const openDiscussion = () => {
  activeContentTab.value = 'discussion'
}

const downloadTranscript = () => {
  console.log('Téléchargement de la transcription')
}

const isSegmentActive = (segment) => {
  return currentTime.value >= segment.startTime &&
      currentTime.value < (segment.startTime + 30000) // 30 secondes par segment
}

const seekToSegment = (segment) => {
  currentTime.value = segment.startTime
  playbackProgress.value = (currentTime.value / totalDuration.value) * 100
}

const editNote = (note) => {
  editingNote.value = note
  newNoteContent.value = note.content
  showAddNoteModal.value = true
}

const deleteNote = (noteId) => {
  if (confirm('Supprimer cette note ?')) {
    const index = notes.value.findIndex(n => n.id === noteId)
    if (index !== -1) {
      notes.value.splice(index, 1)
    }
  }
}

const closeNoteModal = () => {
  showAddNoteModal.value = false
  editingNote.value = null
  newNoteContent.value = ''
}

const saveNote = () => {
  if (newNoteContent.value.trim()) {
    if (editingNote.value) {
      editingNote.value.content = newNoteContent.value
    } else {
      notes.value.push({
        id: Date.now(),
        timestamp: currentTime.value,
        content: newNoteContent.value
      })
    }
    closeNoteModal()
  }
}

const createPost = () => {
  if (newPostContent.value.trim()) {
    discussionPosts.value.unshift({
      id: Date.now(),
      author: {
        id: 100,
        name: 'Vous',
        avatar: '/images/avatar-default.png'
      },
      content: newPostContent.value,
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      isInstructor: false,
      replies: []
    })
    newPostContent.value = ''
  }
}

const toggleLike = (postId) => {
  const post = discussionPosts.value.find(p => p.id === postId)
  if (post) {
    post.isLiked = !post.isLiked
    post.likes += post.isLiked ? 1 : -1
  }
}

const showReplyBox = (postId) => {
  // Implémenter la logique de réponse
  console.log('Répondre au post:', postId)
}

const startQuiz = () => {
  showQuizModal.value = true
  currentQuestionIndex.value = 0
  selectedAnswers.value = []
  showResults.value = false

  // Démarrer le minuteur
  if (quizTimeLimit > 0) {
    quizTimeLeft.value = quizTimeLimit * 60
    const timer = setInterval(() => {
      if (quizTimeLeft.value > 0) {
        quizTimeLeft.value--
      } else {
        clearInterval(timer)
        finishQuiz()
      }
    }, 1000)
  }
}

const selectAnswer = (index) => {
  if (currentQuestion.value.type === 'multiple') {
    if (currentQuestion.value.multiple) {
      const answerIndex = selectedAnswers.value.indexOf(index)
      if (answerIndex > -1) {
        selectedAnswers.value.splice(answerIndex, 1)
      } else {
        selectedAnswers.value.push(index)
      }
    } else {
      selectedAnswers.value = [index]
    }
  }
}

const selectTrueFalse = (value) => {
  selectedAnswers.value = [value]
}

const checkAnswer = () => {
  showResults.value = true
}

const nextQuestion = () => {
  if (isLastQuestion.value) {
    finishQuiz()
  } else {
    currentQuestionIndex.value++
    selectedAnswers.value = []
    showResults.value = false
  }
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    selectedAnswers.value = []
    showResults.value = false
  }
}

const finishQuiz = () => {
  showQuizModal.value = false
  // Calculer le score et enregistrer l'essai
  console.log('Quiz terminé')
}

const downloadResource = (resource) => {
  console.log('Téléchargement:', resource.name)
}

const openHelp = (type) => {
  if (type === 'keyboard') {
    showShortcutsHelp.value = true
  } else {
    // Ouvrir l'aide correspondante
    console.log('Ouvrir aide:', type)
  }
}

const reportIssue = () => {
  console.log('Signaler un problème')
}

const viewCertificate = () => {
  router.push(`/courses/${course.value.id}/certificate`)
}

// Raccourcis clavier
const handleKeydown = (event) => {
  switch (event.key) {
    case ' ':
      event.preventDefault()
      togglePlay()
      break
    case 'ArrowRight':
      event.preventDefault()
      currentTime.value = Math.min(currentTime.value + 5000, totalDuration.value)
      playbackProgress.value = (currentTime.value / totalDuration.value) * 100
      break
    case 'ArrowLeft':
      event.preventDefault()
      currentTime.value = Math.max(currentTime.value - 5000, 0)
      playbackProgress.value = (currentTime.value / totalDuration.value) * 100
      break
    case 'f':
    case 'F':
      toggleFullscreen()
      break
    case 'm':
    case 'M':
      toggleMute()
      break
    case 'n':
    case 'N':
      showAddNoteModal.value = true
      break
    case 'j':
    case 'J':
      goToPrevious()
      break
    case 'k':
    case 'K':
      goToNext()
      break
  }
}

// Lifecycle hooks
onMounted(() => {
  // Initialiser avec la première leçon non terminée
  const firstUncompleted = curriculum.value
      .flatMap(s => s.lectures)
      .find(l => !l.completed)

  if (firstUncompleted) {
    selectLecture(firstUncompleted)
    const section = curriculum.value.find(s =>
        s.lectures.some(l => l.id === firstUncompleted.id)
    )
    if (section) {
      activeSection.value = section.id
    }
  } else if (curriculum.value.length > 0 && curriculum.value[0].lectures.length > 0) {
    selectLecture(curriculum.value[0].lectures[0])
  }

  // Ajouter les écouteurs d'événements
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  if (videoInterval) clearInterval(videoInterval)
  window.removeEventListener('keydown', handleKeydown)
})

// Watch pour la progression automatique
watch(activeLecture, (newLecture) => {
  if (newLecture && newLecture.type === 'quiz') {
    activeContentTab.value = 'quiz'
  }
})
</script>

<style scoped>
.video-player-view {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.breadcrumb-nav {
  background: white;
  padding: 15px 0;
  border-bottom: 1px solid #eef0f2;
}

.container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 20px;
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
  color: #3498db;
  text-decoration: none;
}

.breadcrumb-item.active {
  color: #7f8c8d;
}

.breadcrumb-item:not(:last-child)::after {
  content: '/';
  margin: 0 10px;
  color: #bdc3c7;
}

/* Layout principal */
.learning-container {
  display: grid;
  grid-template-columns: 320px 1fr 280px;
  gap: 0;
  height: calc(100vh - 70px);
  background: white;
}

/* Sidebar gauche - Curriculum */
.curriculum-sidebar {
  border-right: 1px solid #eef0f2;
  background: white;
  overflow-y: auto;
  transition: all 0.3s;
}

.curriculum-sidebar.collapsed {
  width: 60px;
  min-width: 60px;
  grid-column: span 1;
}

.curriculum-sidebar.collapsed .sidebar-title,
.curriculum-sidebar.collapsed .progress-summary,
.curriculum-sidebar.collapsed .sections-container,
.curriculum-sidebar.collapsed .downloads-section {
  display: none;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eef0f2;
}

.sidebar-title {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-collapse {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 2px solid #e0e0e0;
  background: white;
  color: #7f8c8d;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-collapse:hover {
  border-color: #3498db;
  color: #3498db;
}

.progress-summary {
  padding: 20px;
  border-bottom: 1px solid #eef0f2;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.progress-text {
  font-size: 14px;
  color: #7f8c8d;
}

.progress-percent {
  font-size: 24px;
  font-weight: 700;
  color: #2ecc71;
}

.progress-bar {
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background-color: #2ecc71;
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #7f8c8d;
}

.sections-container {
  padding: 10px 0;
}

.section-item {
  border-bottom: 1px solid #eef0f2;
}

.section-item.active {
  background-color: #f8f9fa;
}

.section-item.completed .section-title i {
  color: #2ecc71;
}

.section-header {
  padding: 15px 20px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.3s;
}

.section-header:hover {
  background-color: #f8f9fa;
}

.section-info {
  flex: 1;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.section-title i {
  color: #3498db;
}

.section-title span {
  font-weight: 600;
  color: #2c3e50;
}

.section-meta {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #7f8c8d;
}

.section-toggle i {
  color: #7f8c8d;
  transition: transform 0.3s;
}

.section-item.active .section-toggle i {
  transform: rotate(180deg);
}

.lectures-list {
  padding: 10px 0;
  background-color: #f8f9fa;
}

.lecture-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s;
  border-left: 3px solid transparent;
}

.lecture-item:hover {
  background-color: #e9ecef;
}

.lecture-item.active {
  background-color: #e3f2fd;
  border-left-color: #3498db;
}

.lecture-item.completed .lecture-status i {
  color: #2ecc71;
}

.lecture-item.playing .lecture-status i {
  color: #3498db;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.lecture-status {
  margin-right: 12px;
}

.lecture-status i {
  color: #bdc3c7;
}

.lecture-info {
  flex: 1;
}

.lecture-title {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 4px;
  font-size: 14px;
}

.preview-badge {
  background-color: #3498db;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  margin-left: 8px;
}

.lecture-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #7f8c8d;
}

.lecture-actions {
  display: flex;
  gap: 8px;
}

.btn-quiz,
.btn-resources {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  background: white;
  color: #7f8c8d;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-quiz:hover {
  border-color: #9b59b6;
  color: #9b59b6;
}

.btn-resources:hover {
  border-color: #3498db;
  color: #3498db;
}

.downloads-section {
  padding: 20px;
  border-top: 1px solid #eef0f2;
}

.downloads-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 16px;
}

.downloads-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.download-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #eef0f2;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
  width: 100%;
}

.download-item:hover {
  border-color: #3498db;
  background-color: #f8f9fa;
}

.download-item i {
  color: #3498db;
  font-size: 18px;
}

.resource-name {
  flex: 1;
  font-size: 14px;
  color: #2c3e50;
}

.resource-size {
  font-size: 12px;
  color: #7f8c8d;
}

/* Contenu principal */
.learning-main {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.video-player-container {
  border-bottom: 1px solid #eef0f2;
}

.video-wrapper {
  position: relative;
  background: #000;
}

.video-player {
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-placeholder {
  text-align: center;
  color: white;
}

.player-placeholder i {
  font-size: 60px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.player-placeholder p {
  font-size: 18px;
  opacity: 0.7;
}

.player-integration {
  width: 100%;
  height: 100%;
  position: relative;
}

.custom-player {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: linear-gradient(transparent 50%, rgba(0,0,0,0.7) 100%);
}

.player-controls {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background: rgba(0,0,0,0.8);
  gap: 15px;
}

.control-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.1);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.control-btn:hover {
  background: rgba(255,255,255,0.2);
  transform: scale(1.1);
}

.progress-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.progress-slider {
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  background: rgba(255,255,255,0.3);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.progress-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3498db;
  cursor: pointer;
}

.progress-time {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255,255,255,0.7);
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.volume-slider {
  width: 80px;
  height: 4px;
  -webkit-appearance: none;
  background: rgba(255,255,255,0.3);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
}

.speed-select {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.3);
  background: rgba(0,0,0,0.7);
  color: white;
  cursor: pointer;
  font-size: 14px;
}

.speed-select option {
  background: #2c3e50;
  color: white;
}

.player-extra-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: white;
  border-bottom: 1px solid #eef0f2;
}

.left-controls,
.right-controls {
  display: flex;
  gap: 15px;
}

.btn-transcript,
.btn-notes,
.btn-bookmark,
.btn-prev,
.btn-next {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-transcript,
.btn-notes,
.btn-bookmark {
  background: #f8f9fa;
  color: #2c3e50;
  border: 2px solid #e0e0e0;
}

.btn-transcript:hover,
.btn-notes:hover,
.btn-bookmark:hover {
  background: #e9ecef;
}

.btn-transcript.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.btn-bookmark i[class*="filled"] {
  color: #f39c12;
}

.btn-prev,
.btn-next {
  background: #3498db;
  color: white;
  border: none;
}

.btn-prev:hover:not(:disabled),
.btn-next:hover:not(:disabled) {
  background: #2980b9;
}

.btn-prev:disabled,
.btn-next:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.course-info-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
}

.course-title-section {
  flex: 1;
}

.course-title {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 20px;
}

.lecture-info {
  display: flex;
  gap: 15px;
  font-size: 14px;
  color: #7f8c8d;
}

.course-actions {
  display: flex;
  gap: 15px;
}

.btn-complete,
.btn-discuss {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-complete {
  background: #2ecc71;
  color: white;
  border: none;
}

.btn-complete:hover {
  background: #27ae60;
}

.btn-discuss {
  background: #f8f9fa;
  color: #2c3e50;
  border: 2px solid #e0e0e0;
}

.btn-discuss:hover {
  background: #e9ecef;
}

/* Contenu d'apprentissage */
.learning-content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

.content-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  border-bottom: 1px solid #eef0f2;
  padding-bottom: 15px;
}

.tab-btn {
  padding: 12px 24px;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  color: #7f8c8d;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
}

.tab-btn:hover {
  color: #3498db;
}

.tab-btn.active {
  color: #3498db;
  border-bottom-color: #3498db;
}

.tab-content-container {
  min-height: 400px;
}

/* Onglet Description */
.lecture-description h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 24px;
}

.description-content {
  color: #5d6d7e;
  line-height: 1.8;
  margin-bottom: 40px;
}

.key-points {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 40px;
}

.key-points h4 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 18px;
}

.points-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.point-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: #5d6d7e;
  line-height: 1.6;
}

.point-item i {
  color: #3498db;
  margin-top: 4px;
}

.lecture-resources h4 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 18px;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.resource-card {
  border: 1px solid #eef0f2;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  gap: 15px;
}

.resource-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  border-color: #3498db;
}

.resource-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background: #e3f2fd;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3498db;
  font-size: 24px;
}

.resource-info {
  flex: 1;
}

.resource-info h5 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.resource-info p {
  margin: 0 0 10px 0;
  color: #7f8c8d;
  font-size: 14px;
  line-height: 1.4;
}

.resource-meta {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #7f8c8d;
}

/* Onglet Transcription */
.transcript-container {
  background: white;
  border-radius: 12px;
  border: 1px solid #eef0f2;
  overflow: hidden;
}

.transcript-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eef0f2;
  background: #f8f9fa;
}

.transcript-header h3 {
  margin: 0;
  color: #2c3e50;
}

.btn-download-transcript {
  padding: 8px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-download-transcript:hover {
  background: #2980b9;
}

.transcript-content {
  max-height: 500px;
  overflow-y: auto;
}

.transcript-segment {
  display: flex;
  gap: 20px;
  padding: 15px 20px;
  border-bottom: 1px solid #eef0f2;
  cursor: pointer;
  transition: background-color 0.3s;
}

.transcript-segment:hover {
  background-color: #f8f9fa;
}

.transcript-segment.active {
  background-color: #e3f2fd;
  border-left: 4px solid #3498db;
}

.segment-time {
  min-width: 60px;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #3498db;
}

.segment-text {
  flex: 1;
  color: #5d6d7e;
  line-height: 1.6;
}

/* Onglet Notes */
.notes-container {
  background: white;
  border-radius: 12px;
  border: 1px solid #eef0f2;
  overflow: hidden;
}

.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eef0f2;
  background: #f8f9fa;
}

.notes-header h3 {
  margin: 0;
  color: #2c3e50;
}

.btn-add-note {
  padding: 8px 16px;
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-add-note:hover {
  background: #27ae60;
}

.notes-list {
  padding: 20px;
}

.note-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid #eef0f2;
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.note-time {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #3498db;
  font-size: 14px;
}

.note-actions {
  display: flex;
  gap: 10px;
}

.btn-edit-note,
.btn-delete-note {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 2px solid #e0e0e0;
  background: white;
  color: #7f8c8d;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-edit-note:hover {
  border-color: #3498db;
  color: #3498db;
}

.btn-delete-note:hover {
  border-color: #e74c3c;
  color: #e74c3c;
}

.note-content {
  color: #5d6d7e;
  line-height: 1.6;
}

.empty-notes {
  padding: 60px 20px;
  text-align: center;
}

.empty-notes i {
  font-size: 48px;
  color: #bdc3c7;
  margin-bottom: 20px;
}

.empty-notes p {
  color: #7f8c8d;
  margin-bottom: 20px;
}

.btn-add-first-note {
  padding: 12px 24px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-add-first-note:hover {
  background: #2980b9;
}

/* Onglet Discussion */
.discussion-container {
  background: white;
  border-radius: 12px;
  border: 1px solid #eef0f2;
  overflow: hidden;
}

.discussion-header {
  padding: 20px;
  border-bottom: 1px solid #eef0f2;
  background: #f8f9fa;
}

.discussion-header h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.discussion-stats {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #7f8c8d;
}

.new-post {
  padding: 20px;
  border-bottom: 1px solid #eef0f2;
}

.post-input {
  width: 100%;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  resize: vertical;
  margin-bottom: 15px;
}

.post-input:focus {
  outline: none;
  border-color: #3498db;
}

.post-actions {
  text-align: right;
}

.btn-post {
  padding: 10px 24px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-post:hover {
  background: #2980b9;
}

.discussion-filters {
  padding: 15px 20px;
  border-bottom: 1px solid #eef0f2;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-btn:hover {
  border-color: #3498db;
  color: #3498db;
}

.filter-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.posts-list {
  padding: 20px;
}

.post-item {
  padding: 20px;
  border-bottom: 1px solid #eef0f2;
}

.post-item:last-child {
  border-bottom: none;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.author-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.author-info {
  flex: 1;
}

.author-name {
  margin: 0 0 5px 0;
  color: #2c3e50;
}

.post-meta {
  display: flex;
  gap: 15px;
  font-size: 14px;
  color: #7f8c8d;
}

.instructor-badge {
  background: #f39c12;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.post-content {
  color: #5d6d7e;
  line-height: 1.6;
  margin-bottom: 15px;
}

.post-actions {
  display: flex;
  gap: 15px;
}

.btn-like,
.btn-reply {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-like {
  background: #f8f9fa;
  color: #2c3e50;
  border: 2px solid #e0e0e0;
}

.btn-like:hover,
.btn-like.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.btn-reply {
  background: none;
  color: #3498db;
  border: 2px solid #3498db;
}

.btn-reply:hover {
  background: #3498db;
  color: white;
}

.replies-list {
  margin-left: 65px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eef0f2;
}

.reply-item {
  margin-bottom: 15px;
}

.reply-item:last-child {
  margin-bottom: 0;
}

.reply-author {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.author-avatar-sm {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
}

.reply-author .author-name {
  font-size: 14px;
  margin: 0;
}

.reply-time {
  font-size: 12px;
  color: #7f8c8d;
}

.reply-content {
  color: #5d6d7e;
  font-size: 14px;
  line-height: 1.5;
  padding-left: 40px;
}

/* Onglet Quiz */
.quiz-container {
  background: white;
  border-radius: 12px;
  border: 1px solid #eef0f2;
  padding: 30px;
}

.quiz-header {
  text-align: center;
  margin-bottom: 40px;
}

.quiz-header h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
  font-size: 24px;
}

.quiz-info {
  display: flex;
  justify-content: center;
  gap: 30px;
  color: #7f8c8d;
  font-size: 14px;
}

.quiz-instructions {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
}

.quiz-instructions h4 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 18px;
}

.instructions-list {
  list-style: none;
  margin: 0 0 25px 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.instructions-list li {
  color: #5d6d7e;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.instructions-list li::before {
  content: '✓';
  color: #2ecc71;
  font-weight: bold;
}

.btn-start-quiz {
  width: 100%;
  padding: 15px;
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-start-quiz:hover {
  background: #27ae60;
}

.previous-results {
  border-top: 1px solid #eef0f2;
  padding-top: 30px;
}

.previous-results h4 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 18px;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.attempt-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  border: 2px solid #eef0f2;
  background: white;
  transition: all 0.3s;
}

.attempt-item.passed {
  border-color: #2ecc71;
  background: #f8fff9;
}

.attempt-item:not(.passed) {
  border-color: #e74c3c;
  background: #fff9f9;
}

.attempt-date {
  color: #2c3e50;
  font-weight: 600;
}

.attempt-score {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
}

.attempt-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.attempt-item.passed .attempt-status {
  background: #2ecc71;
  color: white;
}

.attempt-item:not(.passed) .attempt-status {
  background: #e74c3c;
  color: white;
}

/* Sidebar droite - Aide */
.help-sidebar {
  border-left: 1px solid #eef0f2;
  background: white;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.next-lesson-card,
.quick-help-card,
.lesson-objectives-card,
.learning-stats-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #eef0f2;
}

.card-title {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 16px;
}

.next-lesson {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.lesson-info h5 {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-size: 14px;
  line-height: 1.3;
}

.lesson-info p {
  margin: 0;
  color: #7f8c8d;
  font-size: 12px;
}

.btn-start-next {
  width: 100%;
  padding: 12px;
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-start-next:hover {
  background: #27ae60;
}

.no-next-lesson {
  text-align: center;
  padding: 20px 0;
}

.no-next-lesson i {
  font-size: 40px;
  color: #f39c12;
  margin-bottom: 15px;
}

.no-next-lesson p {
  color: #7f8c8d;
  margin-bottom: 20px;
}

.btn-certificate {
  padding: 12px 24px;
  background: #f39c12;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-certificate:hover {
  background: #e67e22;
}

.help-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.help-btn {
  padding: 12px;
  background: white;
  color: #2c3e50;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s;
  text-align: left;
}

.help-btn:hover {
  border-color: #3498db;
  color: #3498db;
}

.help-btn i {
  font-size: 18px;
}

.objectives-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.objective-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: #5d6d7e;
  font-size: 14px;
  line-height: 1.4;
}

.objective-item i {
  color: #2ecc71;
  margin-top: 2px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: white;
  border-radius: 8px;
  border: 1px solid #eef0f2;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #3498db;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  color: #7f8c8d;
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
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal.modal-quiz {
  max-width: 800px;
}

.modal-header {
  padding: 25px;
  border-bottom: 1px solid #eef0f2;
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
  color: #95a5a6;
  line-height: 1;
}

.modal-body {
  padding: 25px;
}

.modal-footer {
  padding: 20px 25px;
  border-top: 1px solid #eef0f2;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Modal Note */
.modal-note .modal-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.note-timestamp {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #7f8c8d;
  font-size: 14px;
}

.note-input {
  width: 100%;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  resize: vertical;
  min-height: 150px;
}

.note-input:focus {
  outline: none;
  border-color: #3498db;
}

.btn-secondary,
.btn-primary {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary {
  background: #f8f9fa;
  color: #2c3e50;
  border: 2px solid #e0e0e0;
}

.btn-secondary:hover {
  background: #e9ecef;
}

.btn-primary {
  background: #3498db;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #2980b9;
}

/* Modal Quiz */
.quiz-progress {
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: #7f8c8d;
  font-size: 14px;
}

.quiz-progress .progress-bar {
  height: 6px;
  width: 200px;
}

.quiz-question {
  margin-bottom: 30px;
}

.question-text {
  margin: 0 0 25px 0;
  color: #2c3e50;
  font-size: 18px;
  line-height: 1.4;
}

.multiple-choice {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.choice-option {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.choice-option:hover {
  border-color: #3498db;
  background: #f8f9fa;
}

.choice-option.selected {
  border-color: #3498db;
  background: #e3f2fd;
}

.choice-option.correct {
  border-color: #2ecc71;
  background: #f8fff9;
}

.choice-option.incorrect {
  border-color: #e74c3c;
  background: #fff9f9;
}

.option-letter {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #2c3e50;
  flex-shrink: 0;
}

.choice-option.selected .option-letter {
  background: #3498db;
  color: white;
}

.choice-option.correct .option-letter {
  background: #2ecc71;
  color: white;
}

.choice-option.incorrect .option-letter {
  background: #e74c3c;
  color: white;
}

.option-text {
  flex: 1;
  color: #2c3e50;
}

.option-feedback i {
  font-size: 20px;
}

.option-feedback .icon-check {
  color: #2ecc71;
}

.option-feedback .icon-close {
  color: #e74c3c;
}

.true-false {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.tf-btn {
  padding: 20px 40px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 150px;
}

.tf-btn.true:hover,
.tf-btn.true.selected {
  border-color: #2ecc71;
  background: #f8fff9;
  color: #2ecc71;
}

.tf-btn.false:hover,
.tf-btn.false.selected {
  border-color: #e74c3c;
  background: #fff9f9;
  color: #e74c3c;
}

.question-explanation {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.question-explanation h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.question-explanation p {
  margin: 0;
  color: #5d6d7e;
  line-height: 1.6;
}

.quiz-timer {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e74c3c;
  font-weight: 600;
}

.quiz-actions {
  display: flex;
  gap: 15px;
}

/* Raccourcis clavier */
.keyboard-shortcuts {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shortcuts-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
}

.shortcuts-modal {
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  z-index: 1002;
}

.shortcuts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.shortcuts-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 24px;
}

.shortcuts-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px;
  border-radius: 8px;
  background: #f8f9fa;
  border: 1px solid #eef0f2;
}

shortcut-item kbd {
  padding: 6px 12px;
  background: #2c3e50;
  color: white;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  min-width: 60px;
  text-align: center;
}

.shortcut-item span {
  color: #5d6d7e;
  flex: 1;
}

/* Responsive */
@media (max-width: 1200px) {
  .learning-container {
    grid-template-columns: 300px 1fr;
  }

  .help-sidebar {
    display: none;
  }
}

@media (max-width: 992px) {
  .learning-container {
    grid-template-columns: 1fr;
    height: auto;
  }

  .curriculum-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s;
    width: 320px;
    box-shadow: 5px 0 25px rgba(0,0,0,0.1);
  }

  .curriculum-sidebar.open {
    transform: translateX(0);
  }

  .learning-main {
    min-height: 100vh;
  }
}

@media (max-width: 768px) {
  .course-info-bar {
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
  }

  .course-actions {
    width: 100%;
    flex-direction: column;
  }

  .player-extra-controls {
    flex-direction: column;
    gap: 15px;
  }

  .left-controls,
  .right-controls {
    width: 100%;
    justify-content: center;
  }

  .content-tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
  }

  .tab-btn {
    white-space: nowrap;
  }
}

@media (max-width: 576px) {
  .container {
    padding: 0 15px;
  }

  .learning-content {
    padding: 20px;
  }

  .player-controls {
    flex-wrap: wrap;
    gap: 10px;
  }

  .progress-container {
    order: 3;
    width: 100%;
    margin-top: 10px;
  }

  .modal {
    margin: 10px;
    width: calc(100% - 20px);
  }
}
</style>