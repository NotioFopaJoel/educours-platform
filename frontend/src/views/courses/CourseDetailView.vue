<template>
  <div class="course-detail-view">
    <!-- Navigation breadcrumb -->
    <nav class="breadcrumb-nav">
      <div class="container">
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <router-link to="/courses">Cours</router-link>
          </li>
          <li class="breadcrumb-item">
            <a href="#">{{ course.category }}</a>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            {{ course.title }}
          </li>
        </ol>
      </div>
    </nav>

    <!-- Hero Section du cours -->
    <section class="course-hero">
      <div class="container">
        <div class="hero-content">
          <!-- Colonne gauche : Infos du cours -->
          <div class="hero-left">
            <!-- Badges -->
            <div class="course-badges">
              <span class="badge bestseller" v-if="course.isBestseller">
                <i class="icon-trophy"></i> Best-seller
              </span>
              <span class="badge new" v-if="course.isNew">
                <i class="icon-new"></i> Nouveau
              </span>
              <span class="badge updated" v-if="course.recentlyUpdated">
                <i class="icon-update"></i> Mis à jour récemment
              </span>
              <span class="badge level" :class="course.level">
                <i class="icon-level"></i> {{ getLevelLabel(course.level) }}
              </span>
            </div>

            <!-- Titre -->
            <h1 class="course-title">{{ course.title }}</h1>

            <!-- Description -->
            <p class="course-description">{{ course.description }}</p>

            <!-- Métriques -->
            <div class="course-metrics">
              <div class="metric-item">
                <div class="metric-value">{{ course.rating.toFixed(1) }}</div>
                <div class="metric-label">
                  <div class="stars">
                    <i
                        v-for="n in 5"
                        :key="n"
                        :class="n <= Math.round(course.rating) ? 'icon-star-filled' : 'icon-star-empty'"
                    ></i>
                  </div>
                  <span class="rating-count">({{ course.reviewCount }} avis)</span>
                </div>
              </div>

              <div class="metric-item">
                <div class="metric-value">{{ course.enrolled.toLocaleString() }}</div>
                <div class="metric-label">Étudiants</div>
              </div>

              <div class="metric-item">
                <div class="metric-value">{{ course.videoCount }}</div>
                <div class="metric-label">Vidéos</div>
              </div>

              <div class="metric-item">
                <div class="metric-value">{{ course.duration }}</div>
                <div class="metric-label">Durée totale</div>
              </div>
            </div>

            <!-- Instructeur -->
            <div class="instructor-section">
              <div class="instructor-header">
                <img
                    :src="course.instructor.avatar"
                    :alt="course.instructor.name"
                    class="instructor-avatar"
                >
                <div class="instructor-info">
                  <h3 class="instructor-name">{{ course.instructor.name }}</h3>
                  <p class="instructor-title">{{ course.instructor.title }}</p>
                </div>
              </div>
              <div class="instructor-stats">
                <div class="stat-item">
                  <i class="icon-rating"></i>
                  <span>{{ course.instructor.rating }} Note d'enseignant</span>
                </div>
                <div class="stat-item">
                  <i class="icon-students"></i>
                  <span>{{ course.instructor.students.toLocaleString() }} Élèves</span>
                </div>
                <div class="stat-item">
                  <i class="icon-courses"></i>
                  <span>{{ course.instructor.courses }} Cours</span>
                </div>
              </div>
            </div>

            <!-- Dernière mise à jour -->
            <div class="update-info">
              <i class="icon-calendar"></i>
              <span>Dernière mise à jour : {{ formatDate(course.lastUpdated) }}</span>
            </div>
          </div>

          <!-- Colonne droite : Carte d'inscription -->
          <div class="hero-right">
            <div class="enrollment-card">
              <!-- Video preview -->
              <div class="video-preview" @click="playPreview">
                <img
                    :src="course.previewImage || course.thumbnail"
                    :alt="course.title"
                    class="preview-image"
                >
                <div class="preview-overlay">
                  <i class="icon-play-large"></i>
                  <span>Voir l'aperçu</span>
                </div>
                <div class="preview-duration">{{ course.previewDuration }}</div>
              </div>

              <!-- Pricing -->
              <div class="pricing-section">
                <div class="price-display">
                  <div class="current-price">{{ course.price.toLocaleString() }} FCFA</div>
                  <div class="original-price" v-if="course.originalPrice">
                    {{ course.originalPrice.toLocaleString() }} FCFA
                  </div>
                  <div class="discount" v-if="course.discount">
                    -{{ course.discount }}%
                  </div>
                </div>

                <div class="time-left" v-if="course.discount">
                  <i class="icon-clock"></i>
                  <span>Offre se termine dans {{ course.timeLeft }}</span>
                </div>
              </div>

              <!-- Actions -->
              <div class="action-buttons">
                <button
                    v-if="isEnrolled"
                    class="btn-continue"
                    @click="continueLearning"
                >
                  <i class="icon-play"></i>
                  Continuer l'apprentissage
                </button>

                <button
                    v-else-if="course.isFree"
                    class="btn-enroll-free"
                    @click="enrollCourse"
                >
                  <i class="icon-unlock"></i>
                  S'inscrire gratuitement
                </button>

                <button
                    v-else
                    class="btn-enroll"
                    @click="enrollCourse"
                >
                  <i class="icon-cart"></i>
                  Ajouter au panier
                </button>

                <button
                    class="btn-wishlist"
                    :class="{ active: isInWishlist }"
                    @click="toggleWishlist"
                >
                  <i :class="isInWishlist ? 'icon-heart-filled' : 'icon-heart'"></i>
                  {{ isInWishlist ? 'Dans la liste' : 'Liste de souhaits' }}
                </button>

                <button class="btn-gift" @click="showGiftModal">
                  <i class="icon-gift"></i>
                  Offrir ce cours
                </button>
              </div>

              <!-- Garanties -->
              <div class="guarantees">
                <div class="guarantee-item">
                  <i class="icon-check-circle"></i>
                  <span>Garantie satisfait ou remboursé sous 30 jours</span>
                </div>
                <div class="guarantee-item">
                  <i class="icon-certificate"></i>
                  <span>Certificat de réussite inclus</span>
                </div>
                <div class="guarantee-item">
                  <i class="icon-devices"></i>
                  <span>Accès à vie sur mobile et ordinateur</span>
                </div>
                <div class="guarantee-item">
                  <i class="icon-support"></i>
                  <span>Support inclus</span>
                </div>
              </div>

              <!-- Partage -->
              <div class="share-section">
                <span class="share-label">Partager :</span>
                <div class="share-buttons">
                  <button class="share-btn facebook">
                    <i class="icon-facebook"></i>
                  </button>
                  <button class="share-btn twitter">
                    <i class="icon-twitter"></i>
                  </button>
                  <button class="share-btn whatsapp">
                    <i class="icon-whatsapp"></i>
                  </button>
                  <button class="share-btn linkedin">
                    <i class="icon-linkedin"></i>
                  </button>
                  <button class="share-btn copy" @click="copyLink">
                    <i class="icon-copy"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Comparer avec d'autres cours -->
            <div class="compare-section" v-if="similarCourses.length > 0">
              <h4>Comparer avec des cours similaires</h4>
              <div class="compare-courses">
                <div
                    v-for="similarCourse in similarCourses.slice(0, 2)"
                    :key="similarCourse.id"
                    class="compare-course"
                    @click="viewCourse(similarCourse.id)"
                >
                  <img
                      :src="similarCourse.thumbnail"
                      :alt="similarCourse.title"
                      class="compare-thumbnail"
                  >
                  <div class="compare-info">
                    <h5>{{ similarCourse.title }}</h5>
                    <div class="compare-price">
                      {{ similarCourse.price.toLocaleString() }} FCFA
                    </div>
                  </div>
                  <button
                      class="btn-compare"
                      @click.stop="addToComparison(similarCourse.id)"
                  >
                    <i class="icon-compare"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Navigation sticky -->
    <nav class="course-nav sticky-nav" :class="{ sticky: isSticky }">
      <div class="container">
        <ul class="nav-tabs">
          <li
              v-for="tab in tabs"
              :key="tab.id"
              class="nav-tab"
              :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id"
          >
            <i :class="tab.icon"></i>
            {{ tab.label }}
          </li>
        </ul>
      </div>
    </nav>

    <!-- Contenu principal -->
    <main class="course-main">
      <div class="container">
        <div class="main-content">
          <!-- Colonne gauche : Contenu détaillé -->
          <div class="main-left">
            <!-- Overview Tab -->
            <div v-if="activeTab === 'overview'" class="tab-content">
              <!-- Objectifs d'apprentissage -->
              <section class="learning-objectives">
                <h2>Ce que vous apprendrez</h2>
                <div class="objectives-grid">
                  <div
                      v-for="objective in course.objectives"
                      :key="objective.id"
                      class="objective-item"
                  >
                    <i class="icon-check"></i>
                    <span>{{ objective.text }}</span>
                  </div>
                </div>
              </section>

              <!-- Contenu du cours -->
              <section class="course-content-section">
                <div class="section-header">
                  <h2>Contenu du cours</h2>
                  <div class="section-stats">
                    <span>{{ course.content.sections }} sections</span>
                    <span>•</span>
                    <span>{{ course.content.lectures }} leçons</span>
                    <span>•</span>
                    <span>{{ course.content.duration }} de contenu vidéo</span>
                  </div>
                </div>

                <!-- Curriculum accordéon -->
                <div class="curriculum-accordion">
                  <div
                      v-for="section in curriculum"
                      :key="section.id"
                      class="accordion-section"
                      :class="{ open: openSection === section.id }"
                  >
                    <div
                        class="accordion-header"
                        @click="toggleSection(section.id)"
                    >
                      <div class="section-title">
                        <h3>{{ section.title }}</h3>
                        <span class="section-info">
                          {{ section.lectures }} leçons • {{ section.duration }}
                        </span>
                      </div>
                      <div class="section-toggle">
                        <i class="icon-chevron-down"></i>
                      </div>
                    </div>

                    <div class="accordion-content" v-if="openSection === section.id">
                      <div
                          v-for="lecture in section.lectures"
                          :key="lecture.id"
                          class="lecture-item"
                          :class="{ completed: lecture.completed, preview: lecture.isPreview }"
                      >
                        <div class="lecture-info">
                          <div class="lecture-icon">
                            <i :class="getLectureIcon(lecture.type)"></i>
                          </div>
                          <div class="lecture-details">
                            <h4>{{ lecture.title }}</h4>
                            <div class="lecture-meta">
                              <span class="lecture-duration">{{ lecture.duration }}</span>
                              <span class="lecture-type">{{ getLectureType(lecture.type) }}</span>
                              <span v-if="lecture.isPreview" class="preview-badge">Aperçu gratuit</span>
                            </div>
                          </div>
                        </div>
                        <div class="lecture-actions">
                          <button
                              v-if="lecture.isPreview"
                              class="btn-preview"
                              @click="playLecturePreview(lecture)"
                          >
                            <i class="icon-play"></i>
                            Regarder
                          </button>
                          <button
                              v-else-if="isEnrolled"
                              class="btn-play"
                              @click="playLecture(lecture)"
                          >
                            <i class="icon-play"></i>
                            Commencer
                          </button>
                          <button
                              v-else
                              class="btn-locked"
                              disabled
                          >
                            <i class="icon-lock"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <!-- Prérequis -->
              <section class="requirements-section" v-if="course.requirements.length > 0">
                <h2>Prérequis</h2>
                <ul class="requirements-list">
                  <li
                      v-for="requirement in course.requirements"
                      :key="requirement"
                      class="requirement-item"
                  >
                    <i class="icon-bullet"></i>
                    <span>{{ requirement }}</span>
                  </li>
                </ul>
              </section>

              <!-- Public cible -->
              <section class="audience-section" v-if="course.audience.length > 0">
                <h2>Public cible</h2>
                <ul class="audience-list">
                  <li
                      v-for="target in course.audience"
                      :key="target"
                      class="audience-item"
                  >
                    <i class="icon-bullet"></i>
                    <span>{{ target }}</span>
                  </li>
                </ul>
              </section>
            </div>

            <!-- Instructeur Tab -->
            <div v-if="activeTab === 'instructor'" class="tab-content">
              <section class="instructor-details">
                <div class="instructor-profile">
                  <img
                      :src="course.instructor.avatar"
                      :alt="course.instructor.name"
                      class="instructor-avatar-large"
                  >
                  <div class="instructor-profile-info">
                    <h2>{{ course.instructor.name }}</h2>
                    <p class="instructor-title">{{ course.instructor.title }}</p>
                    <div class="instructor-rating">
                      <div class="rating-overall">
                        <div class="rating-value">{{ course.instructor.rating.toFixed(1) }}</div>
                        <div class="rating-stars">
                          <i
                              v-for="n in 5"
                              :key="n"
                              :class="n <= Math.round(course.instructor.rating) ? 'icon-star-filled' : 'icon-star-empty'"
                          ></i>
                        </div>
                        <div class="rating-label">Note d'enseignant</div>
                      </div>
                      <div class="rating-details">
                        <div class="detail-item">
                          <div class="detail-value">{{ course.instructor.reviews.toLocaleString() }}</div>
                          <div class="detail-label">Avis</div>
                        </div>
                        <div class="detail-item">
                          <div class="detail-value">{{ course.instructor.students.toLocaleString() }}</div>
                          <div class="detail-label">Étudiants</div>
                        </div>
                        <div class="detail-item">
                          <div class="detail-value">{{ course.instructor.courses }}</div>
                          <div class="detail-label">Cours</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Bio de l'instructeur -->
                <div class="instructor-bio">
                  <h3>À propos de l'instructeur</h3>
                  <div class="bio-content">
                    <p>{{ course.instructor.bio }}</p>
                  </div>
                </div>

                <!-- Expérience -->
                <div class="instructor-experience" v-if="course.instructor.experience">
                  <h3>Expérience professionnelle</h3>
                  <div class="experience-list">
                    <div
                        v-for="exp in course.instructor.experience"
                        :key="exp.id"
                        class="experience-item"
                    >
                      <div class="exp-period">{{ exp.period }}</div>
                      <div class="exp-details">
                        <h4>{{ exp.position }}</h4>
                        <p class="exp-company">{{ exp.company }}</p>
                        <p class="exp-description">{{ exp.description }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Autres cours -->
                <div class="instructor-other-courses" v-if="instructorCourses.length > 0">
                  <h3>Autres cours par cet instructeur</h3>
                  <div class="other-courses-grid">
                    <div
                        v-for="otherCourse in instructorCourses"
                        :key="otherCourse.id"
                        class="other-course-card"
                        @click="viewCourse(otherCourse.id)"
                    >
                      <img
                          :src="otherCourse.thumbnail"
                          :alt="otherCourse.title"
                          class="other-course-thumbnail"
                      >
                      <div class="other-course-info">
                        <h4>{{ otherCourse.title }}</h4>
                        <div class="other-course-rating">
                          <span class="stars">
                            <i
                                v-for="n in 5"
                                :key="n"
                                :class="n <= Math.round(otherCourse.rating) ? 'icon-star-filled' : 'icon-star-empty'"
                            ></i>
                          </span>
                          <span class="rating-value">{{ otherCourse.rating.toFixed(1) }}</span>
                        </div>
                        <div class="other-course-price">
                          {{ otherCourse.price.toLocaleString() }} FCFA
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <!-- Avis Tab -->
            <div v-if="activeTab === 'reviews'" class="tab-content">
              <section class="reviews-section">
                <!-- Résumé des notes -->
                <div class="reviews-summary">
                  <div class="summary-left">
                    <div class="average-rating">
                      <div class="rating-number">{{ course.rating.toFixed(1) }}</div>
                      <div class="rating-stars-large">
                        <i
                            v-for="n in 5"
                            :key="n"
                            :class="n <= Math.round(course.rating) ? 'icon-star-filled' : 'icon-star-empty'"
                        ></i>
                      </div>
                      <div class="rating-count">Note du cours</div>
                    </div>
                  </div>

                  <div class="summary-right">
                    <div
                        v-for="star in [5,4,3,2,1]"
                        :key="star"
                        class="rating-bar"
                    >
                      <div class="star-label">
                        <span>{{ star }} étoiles</span>
                      </div>
                      <div class="bar-container">
                        <div
                            class="bar-fill"
                            :style="{ width: getStarPercentage(star) + '%' }"
                        ></div>
                      </div>
                      <div class="percentage">{{ getStarPercentage(star) }}%</div>
                    </div>
                  </div>
                </div>

                <!-- Filtres d'avis -->
                <div class="reviews-filters">
                  <div class="filter-group">
                    <button
                        v-for="filter in reviewFilters"
                        :key="filter.value"
                        class="filter-btn"
                        :class="{ active: selectedReviewFilter === filter.value }"
                        @click="selectedReviewFilter = filter.value"
                    >
                      {{ filter.label }}
                    </button>
                  </div>

                  <div class="sort-reviews">
                    <select v-model="reviewSortBy" class="sort-select">
                      <option value="recent">Plus récents</option>
                      <option value="helpful">Plus utiles</option>
                      <option value="high">Note élevée</option>
                      <option value="low">Note basse</option>
                    </select>
                  </div>
                </div>

                <!-- Liste des avis -->
                <div class="reviews-list">
                  <div
                      v-for="review in filteredReviews"
                      :key="review.id"
                      class="review-item"
                  >
                    <div class="reviewer-info">
                      <img
                          :src="review.avatar"
                          :alt="review.name"
                          class="reviewer-avatar"
                      >
                      <div class="reviewer-details">
                        <h4 class="reviewer-name">{{ review.name }}</h4>
                        <div class="reviewer-meta">
                          <span class="review-date">{{ formatDate(review.date) }}</span>
                          <span class="review-verified" v-if="review.verified">
                            <i class="icon-verified"></i> Achat vérifié
                          </span>
                        </div>
                      </div>
                    </div>

                    <div class="review-content">
                      <div class="review-rating">
                        <div class="stars">
                          <i
                              v-for="n in 5"
                              :key="n"
                              :class="n <= review.rating ? 'icon-star-filled' : 'icon-star-empty'"
                          ></i>
                        </div>
                        <span class="review-title">{{ review.title }}</span>
                      </div>
                      <p class="review-text">{{ review.content }}</p>

                      <div class="review-helpful" v-if="review.helpfulCount > 0">
                        <i class="icon-thumbs-up"></i>
                        <span>{{ review.helpfulCount }} personnes ont trouvé cela utile</span>
                      </div>
                    </div>

                    <div class="review-actions">
                      <button
                          class="btn-helpful"
                          :class="{ active: review.isHelpful }"
                          @click="toggleHelpful(review.id)"
                      >
                        <i class="icon-thumbs-up"></i>
                        Utile
                      </button>
                      <button class="btn-report" @click="reportReview(review.id)">
                        Signaler
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Pagination des avis -->
                <div class="reviews-pagination">
                  <button
                      class="pagination-btn"
                      :disabled="reviewPage === 1"
                      @click="reviewPage--"
                  >
                    <i class="icon-chevron-left"></i>
                    Précédent
                  </button>

                  <div class="page-info">
                    Page {{ reviewPage }} sur {{ totalReviewPages }}
                  </div>

                  <button
                      class="pagination-btn"
                      :disabled="reviewPage === totalReviewPages"
                      @click="reviewPage++"
                  >
                    Suivant
                    <i class="icon-chevron-right"></i>
                  </button>
                </div>

                <!-- Formulaire d'avis -->
                <div class="add-review" v-if="isEnrolled && !hasReviewed">
                  <h3>Donnez votre avis sur ce cours</h3>
                  <form @submit.prevent="submitReview">
                    <div class="review-rating-input">
                      <span class="rating-label">Votre note :</span>
                      <div class="rating-stars-input">
                        <i
                            v-for="n in 5"
                            :key="n"
                            :class="n <= newReview.rating ? 'icon-star-filled' : 'icon-star-empty'"
                            @click="newReview.rating = n"
                        ></i>
                      </div>
                    </div>

                    <div class="form-group">
                      <label for="reviewTitle">Titre de votre avis</label>
                      <input
                          type="text"
                          id="reviewTitle"
                          v-model="newReview.title"
                          placeholder="Résumez votre expérience"
                          required
                      >
                    </div>

                    <div class="form-group">
                      <label for="reviewContent">Votre avis détaillé</label>
                      <textarea
                          id="reviewContent"
                          v-model="newReview.content"
                          rows="5"
                          placeholder="Partagez votre expérience d'apprentissage..."
                          required
                      ></textarea>
                    </div>

                    <div class="form-actions">
                      <button type="submit" class="btn-submit-review">
                        Publier votre avis
                      </button>
                    </div>
                  </form>
                </div>
              </section>
            </div>

            <!-- FAQ Tab -->
            <div v-if="activeTab === 'faq'" class="tab-content">
              <section class="faq-section">
                <h2>Questions fréquemment posées</h2>
                <div class="faq-list">
                  <div
                      v-for="faq in course.faq"
                      :key="faq.id"
                      class="faq-item"
                      :class="{ open: openFaq === faq.id }"
                  >
                    <div
                        class="faq-question"
                        @click="toggleFaq(faq.id)"
                    >
                      <h3>{{ faq.question }}</h3>
                      <i class="icon-chevron-down"></i>
                    </div>
                    <div class="faq-answer" v-if="openFaq === faq.id">
                      <p>{{ faq.answer }}</p>
                    </div>
                  </div>
                </div>

                <!-- Poser une question -->
                <div class="ask-question">
                  <h3>Vous avez une question ?</h3>
                  <p>Si vous ne trouvez pas de réponse à votre question, n'hésitez pas à nous contacter.</p>
                  <button class="btn-contact" @click="contactSupport">
                    <i class="icon-support"></i>
                    Contacter le support
                  </button>
                </div>
              </section>
            </div>
          </div>

          <!-- Colonne droite : Sidebar -->
          <div class="main-right">
            <!-- Progression du cours -->
            <div class="progress-card" v-if="isEnrolled">
              <h3>Votre progression</h3>
              <div class="progress-circle">
                <div class="circle-chart">
                  <svg width="120" height="120">
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
                        stroke="#2ecc71"
                        stroke-width="12"
                        :stroke-dasharray="`${progressCircumference} ${progressCircumference}`"
                        :stroke-dashoffset="progressCircumference - (courseProgress / 100) * progressCircumference"
                        transform="rotate(-90 60 60)"
                    />
                  </svg>
                  <div class="progress-text">
                    <span class="progress-percent">{{ courseProgress }}%</span>
                    <span class="progress-label">Complété</span>
                  </div>
                </div>
              </div>
              <div class="progress-stats">
                <div class="stat-item">
                  <i class="icon-clock"></i>
                  <span>{{ completedTime }} / {{ course.duration }}</span>
                </div>
                <div class="stat-item">
                  <i class="icon-video"></i>
                  <span>{{ completedLectures }} / {{ course.videoCount }} leçons</span>
                </div>
              </div>
              <button class="btn-resume" @click="continueLearning">
                <i class="icon-play"></i>
                Reprendre l'apprentissage
              </button>
            </div>

            <!-- Ressources -->
            <div class="resources-card">
              <h3>Ressources incluses</h3>
              <ul class="resources-list">
                <li class="resource-item">
                  <i class="icon-download"></i>
                  <span>{{ course.resources.downloads }} fichiers téléchargeables</span>
                </li>
                <li class="resource-item">
                  <i class="icon-text"></i>
                  <span>Articles et lectures complémentaires</span>
                </li>
                <li class="resource-item">
                  <i class="icon-code"></i>
                  <span>Code source des projets</span>
                </li>
                <li class="resource-item">
                  <i class="icon-assignment"></i>
                  <span>Exercices pratiques</span>
                </li>
                <li class="resource-item">
                  <i class="icon-certificate"></i>
                  <span>Certificat de réussite</span>
                </li>
              </ul>
            </div>

            <!-- Cours similaires -->
            <div class="similar-courses-card">
              <h3>Cours similaires</h3>
              <div class="similar-courses-list">
                <div
                    v-for="similar in similarCourses"
                    :key="similar.id"
                    class="similar-course"
                    @click="viewCourse(similar.id)"
                >
                  <img
                      :src="similar.thumbnail"
                      :alt="similar.title"
                      class="similar-thumbnail"
                  >
                  <div class="similar-info">
                    <h4>{{ similar.title }}</h4>
                    <div class="similar-instructor">{{ similar.instructor.name }}</div>
                    <div class="similar-rating">
                      <span class="stars">
                        <i
                            v-for="n in 5"
                            :key="n"
                            :class="n <= Math.round(similar.rating) ? 'icon-star-filled' : 'icon-star-empty'"
                        ></i>
                      </span>
                      <span class="rating-value">{{ similar.rating.toFixed(1) }}</span>
                    </div>
                    <div class="similar-price">{{ similar.price.toLocaleString() }} FCFA</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal d'aperçu vidéo -->
    <div class="modal-overlay" v-if="showVideoModal">
      <div class="modal modal-video">
        <div class="modal-header">
          <h2>{{ previewLecture?.title || 'Aperçu du cours' }}</h2>
          <button class="btn-close" @click="showVideoModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <!-- Lecteur vidéo -->
          <div class="video-player">
            <div class="player-placeholder">
              <i class="icon-play-large"></i>
              <p>Lecteur vidéo intégré ici</p>
              <p>Intégrez Vimeo, YouTube ou votre propre player</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// États
const isSticky = ref(false)
const activeTab = ref('overview')
const openSection = ref(1)
const openFaq = ref(null)
const showVideoModal = ref(false)
const selectedReviewFilter = ref('all')
const reviewSortBy = ref('recent')
const reviewPage = ref(1)
const isInWishlist = ref(false)
const previewLecture = ref(null)

// Données du cours (simulées - à remplacer par API)
const course = ref({
  id: 1,
  title: 'Introduction à JavaScript - De Zéro à Héros',
  description: 'Maîtrisez les bases de JavaScript avec des projets pratiques pour le web moderne. Ce cours vous guidera de débutant à intermédiaire avec des exercices concrets.',
  category: 'programming',
  level: 'beginner',
  price: 25000,
  originalPrice: 35000,
  discount: 29,
  rating: 4.8,
  reviewCount: 1245,
  enrolled: 5421,
  videoCount: 45,
  duration: '15h 30min',
  previewDuration: '2 min',
  isBestseller: true,
  isNew: true,
  recentlyUpdated: true,
  lastUpdated: '2024-02-15',
  isFree: false,

  instructor: {
    id: 1,
    name: 'Dr. Jean Dupont',
    title: 'Expert en développement web',
    avatar: '/images/avatar1.jpg',
    rating: 4.9,
    reviews: 2850,
    students: 15420,
    courses: 8,
    bio: 'Développeur full-stack avec 10 ans d\'expérience. Spécialiste en JavaScript, React et Node.js. Passionné par l\'enseignement et le partage de connaissances.',
    experience: [
      {
        id: 1,
        period: '2018 - Présent',
        position: 'Lead Developer',
        company: 'Tech Solutions Inc.',
        description: 'Responsable de l\'architecture frontend et formation des développeurs juniors.'
      },
      {
        id: 2,
        period: '2015 - 2018',
        position: 'Senior Frontend Developer',
        company: 'Digital Agency',
        description: 'Développement d\'applications web complexes pour des clients internationaux.'
      }
    ]
  },

  objectives: [
    { id: 1, text: 'Comprendre les fondamentaux de JavaScript ES6+' },
    { id: 2, text: 'Manipuler le DOM efficacement' },
    { id: 3, text: 'Créer des applications web interactives' },
    { id: 4, text: 'Utiliser les APIs modernes du navigateur' },
    { id: 5, text: 'Gérer les erreurs et déboguer le code' },
    { id: 6, text: 'Comprendre les concepts de programmation asynchrone' }
  ],

  content: {
    sections: 12,
    lectures: 45,
    duration: '15h 30min'
  },

  requirements: [
    'Connaissances de base en HTML et CSS',
    'Ordinateur avec connexion internet',
    'Éditeur de code (VS Code recommandé)',
    'Navigateur web moderne'
  ],

  audience: [
    'Débutants en programmation',
    'Développeurs frontend souhaitant renforcer leurs bases',
    'Étudiants en informatique',
    'Professionnels en reconversion'
  ],

  faq: [
    {
      id: 1,
      question: 'Ai-je besoin d\'expérience préalable en programmation ?',
      answer: 'Non, ce cours est conçu pour les débutants complets. Nous partons de zéro.'
    },
    {
      id: 2,
      question: 'Combien de temps dure l\'accès au cours ?',
      answer: 'L\'accès est à vie. Vous pouvez suivre le cours à votre rythme.'
    },
    {
      id: 3,
      question: 'Puis-je obtenir un remboursement ?',
      answer: 'Oui, nous offrons une garantie satisfait ou remboursé sous 30 jours.'
    },
    {
      id: 4,
      question: 'Le certificat est-il reconnu ?',
      answer: 'Oui, notre certificat est reconnu par l\'industrie.'
    }
  ],

  resources: {
    downloads: 15,
    articles: 8,
    exercises: 25
  },

  timeLeft: '2 jours 5 heures',
  thumbnail: '/images/cs-course.jpg',
  previewImage: '/images/cs-course-preview.jpg'
})

// Curriculum (simulé)
const curriculum = ref([
  {
    id: 1,
    title: 'Introduction et installation',
    lectures: 4,
    duration: '45min',
    lectures: [
      { id: 1, title: 'Bienvenue dans le cours', type: 'video', duration: '5min', isPreview: true },
      { id: 2, title: 'Installation des outils', type: 'video', duration: '15min' },
      { id: 3, title: 'Configuration de l\'environnement', type: 'video', duration: '15min' },
      { id: 4, title: 'Votre premier programme', type: 'video', duration: '10min' }
    ]
  },
  {
    id: 2,
    title: 'Les bases de JavaScript',
    lectures: 8,
    duration: '2h 30min',
    lectures: [
      { id: 5, title: 'Variables et types de données', type: 'video', duration: '20min' },
      { id: 6, title: 'Opérateurs', type: 'video', duration: '15min' },
      { id: 7, title: 'Structures de contrôle', type: 'video', duration: '25min' },
      { id: 8, title: 'Exercice pratique: Calculatrice', type: 'exercise', duration: '30min' }
    ]
  }
])

// Avis (simulés)
const reviews = ref([
  {
    id: 1,
    name: 'Koffi Kouamé',
    avatar: '/images/avatar3.jpg',
    rating: 5,
    title: 'Excellent pour débuter',
    content: 'Ce cours est parfait pour les débutants. Les explications sont claires et les projets pratiques aident vraiment à comprendre les concepts.',
    date: '2024-02-10',
    helpfulCount: 42,
    verified: true,
    isHelpful: false
  },
  {
    id: 2,
    name: 'Amina Diallo',
    avatar: '/images/avatar2.jpg',
    rating: 4,
    title: 'Très bon contenu',
    content: 'J\'ai beaucoup appris grâce à ce cours. L\'instructeur est compétent et répond aux questions rapidement.',
    date: '2024-02-05',
    helpfulCount: 18,
    verified: true,
    isHelpful: false
  }
])

// Cours similaires (simulés)
const similarCourses = ref([
  {
    id: 2,
    title: 'JavaScript Avancé : Patterns et Bonnes Pratiques',
    instructor: { name: 'Dr. Jean Dupont' },
    rating: 4.9,
    price: 35000,
    thumbnail: '/images/cs-course-advanced.jpg'
  },
  {
    id: 3,
    title: 'React.js : Le Guide Complet',
    instructor: { name: 'Sarah Johnson' },
    rating: 4.7,
    price: 30000,
    thumbnail: '/images/react-course.jpg'
  }
])

// Cours de l'instructeur (simulés)
const instructorCourses = ref([
  {
    id: 4,
    title: 'Node.js pour les Débutants',
    rating: 4.8,
    price: 28000,
    thumbnail: '/images/node-course.jpg'
  },
  {
    id: 5,
    title: 'TypeScript Professionnel',
    rating: 4.9,
    price: 32000,
    thumbnail: '/images/typescript-course.jpg'
  }
])

// Navigation tabs
const tabs = ref([
  { id: 'overview', label: 'Aperçu', icon: 'icon-overview' },
  { id: 'instructor', label: 'Instructeur', icon: 'icon-instructor' },
  { id: 'reviews', label: 'Avis', icon: 'icon-reviews' },
  { id: 'faq', label: 'FAQ', icon: 'icon-faq' }
])

// Filtres d'avis
const reviewFilters = ref([
  { value: 'all', label: 'Tous' },
  { value: '5', label: '5 étoiles' },
  { value: '4', label: '4 étoiles' },
  { value: '3', label: '3 étoiles' },
  { value: '2', label: '2 étoiles' },
  { value: '1', label: '1 étoile' }
])

// Nouvel avis
const newReview = reactive({
  rating: 5,
  title: '',
  content: ''
})

// États utilisateur (simulés)
const isEnrolled = ref(false)
const hasReviewed = ref(false)
const courseProgress = ref(35)
const completedLectures = ref(16)
const completedTime = ref('5h 20min')

// Computed properties
const progressCircumference = computed(() => 2 * Math.PI * 54)

const filteredReviews = computed(() => {
  let filtered = reviews.value

  // Filtre par note
  if (selectedReviewFilter.value !== 'all') {
    filtered = filtered.filter(review => review.rating === parseInt(selectedReviewFilter.value))
  }

  // Tri
  switch (reviewSortBy.value) {
    case 'recent':
      return filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
    case 'high':
      return filtered.sort((a, b) => b.rating - a.rating)
    case 'low':
      return filtered.sort((a, b) => a.rating - b.rating)
    case 'helpful':
      return filtered.sort((a, b) => b.helpfulCount - a.helpfulCount)
    default:
      return filtered
  }
})

const totalReviewPages = computed(() => {
  return Math.ceil(filteredReviews.value.length / 5)
})

const getStarPercentage = (star) => {
  const total = reviews.value.length
  const count = reviews.value.filter(r => r.rating === star).length
  return total > 0 ? Math.round((count / total) * 100) : 0
}

// Méthodes utilitaires
const getLevelLabel = (level) => {
  const levels = {
    beginner: 'Débutant',
    intermediate: 'Intermédiaire',
    advanced: 'Avancé'
  }
  return levels[level] || level
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getLectureIcon = (type) => {
  const icons = {
    video: 'icon-video',
    exercise: 'icon-exercise',
    quiz: 'icon-quiz',
    article: 'icon-article'
  }
  return icons[type] || 'icon-video'
}

const getLectureType = (type) => {
  const types = {
    video: 'Vidéo',
    exercise: 'Exercice',
    quiz: 'Quiz',
    article: 'Article'
  }
  return types[type] || 'Vidéo'
}

// Actions
const toggleSection = (sectionId) => {
  openSection.value = openSection.value === sectionId ? null : sectionId
}

const toggleFaq = (faqId) => {
  openFaq.value = openFaq.value === faqId ? null : faqId
}

const playPreview = () => {
  previewLecture.value = {
    title: 'Aperçu du cours',
    type: 'video'
  }
  showVideoModal.value = true
}

const playLecturePreview = (lecture) => {
  previewLecture.value = lecture
  showVideoModal.value = true
}

const playLecture = (lecture) => {
  router.push(`/courses/${course.value.id}/learn/${lecture.id}`)
}

const continueLearning = () => {
  if (isEnrolled.value) {
    router.push(`/courses/${course.value.id}/learn`)
  } else {
    enrollCourse()
  }
}

const enrollCourse = () => {
  if (course.value.isFree) {
    isEnrolled.value = true
    // Logique d'inscription gratuite
  } else {
    router.push(`/payment/checkout?course=${course.value.id}`)
  }
}

const toggleWishlist = () => {
  isInWishlist.value = !isInWishlist.value
  // Appel API ici
}

const showGiftModal = () => {
  console.log('Afficher modal cadeau')
}

const copyLink = async () => {
  const url = window.location.href
  try {
    await navigator.clipboard.writeText(url)
    alert('Lien copié dans le presse-papier !')
  } catch (err) {
    console.error('Erreur de copie:', err)
  }
}

const addToComparison = (courseId) => {
  console.log('Ajouter à la comparaison:', courseId)
}

const viewCourse = (courseId) => {
  router.push(`/courses/${courseId}`)
}

const toggleHelpful = (reviewId) => {
  const review = reviews.value.find(r => r.id === reviewId)
  if (review) {
    review.isHelpful = !review.isHelpful
    review.helpfulCount += review.isHelpful ? 1 : -1
  }
}

const reportReview = (reviewId) => {
  if (confirm('Signaler cet avis ?')) {
    console.log('Avis signalé:', reviewId)
  }
}

const submitReview = () => {
  console.log('Soumettre avis:', newReview)
  // Appel API ici
  hasReviewed.value = true
  newReview.rating = 5
  newReview.title = ''
  newReview.content = ''
}

const contactSupport = () => {
  router.push('/support')
}

// Gestion du scroll sticky
const handleScroll = () => {
  isSticky.value = window.scrollY > 300
}

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('scroll', handleScroll)

  // Simuler le chargement des données
  console.log('CourseDetailView monté, cours ID:', route.params.id)

  // Vérifier si l'utilisateur est inscrit
  // isEnrolled.value = checkIfEnrolled(route.params.id)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.course-detail-view {
  background-color: #f8f9fa;
}

/* Breadcrumb */
.breadcrumb-nav {
  background: white;
  padding: 15px 0;
  border-bottom: 1px solid #eef0f2;
}

.container {
  max-width: 1200px;
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

/* Hero Section */
.course-hero {
  background: white;
  padding: 40px 0;
  border-bottom: 1px solid #eef0f2;
}

.hero-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
}

/* Hero Left */
.hero-left {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.course-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
}

.badge.bestseller {
  background-color: #ffeaa7;
  color: #e17055;
}

.badge.new {
  background-color: #a29bfe;
  color: white;
}

.badge.updated {
  background-color: #74b9ff;
  color: white;
}

.badge.level {
  background-color: #f8f9fa;
  color: #2c3e50;
  border: 1px solid #e0e0e0;
}

.course-title {
  font-size: 36px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  line-height: 1.2;
}

.course-description {
  font-size: 18px;
  color: #5d6d7e;
  line-height: 1.6;
  margin: 0;
}

.course-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
  padding: 20px 0;
  border-top: 1px solid #eef0f2;
  border-bottom: 1px solid #eef0f2;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
}

.metric-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stars {
  display: flex;
  gap: 2px;
}

.stars i {
  color: #f39c12;
  font-size: 14px;
}

.rating-count {
  font-size: 12px;
  color: #7f8c8d;
}

.instructor-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
}

.instructor-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.instructor-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.instructor-info h3 {
  margin: 0 0 5px 0;
  color: #2c3e50;
}

.instructor-info p {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

.instructor-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #5d6d7e;
}

.stat-item i {
  color: #3498db;
}

.update-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #7f8c8d;
}

/* Hero Right */
.enrollment-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  overflow: hidden;
}

.video-preview {
  position: relative;
  height: 200px;
  cursor: pointer;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  gap: 10px;
  opacity: 0;
  transition: opacity 0.3s;
}

.video-preview:hover .preview-overlay {
  opacity: 1;
}

.preview-overlay i {
  font-size: 40px;
}

.preview-duration {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.pricing-section {
  padding: 20px;
  border-bottom: 1px solid #eef0f2;
}

.price-display {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.current-price {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
}

.original-price {
  font-size: 18px;
  color: #e74c3c;
  text-decoration: line-through;
}

.discount {
  background-color: #e74c3c;
  color: white;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 14px;
  font-weight: 600;
}

.time-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #e74c3c;
  font-weight: 600;
}

.action-buttons {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-bottom: 1px solid #eef0f2;
}

.btn-continue,
.btn-enroll-free,
.btn-enroll,
.btn-wishlist,
.btn-gift {
  width: 100%;
  padding: 15px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s;
}

.btn-continue {
  background-color: #2ecc71;
  color: white;
  border: none;
}

.btn-continue:hover {
  background-color: #27ae60;
}

.btn-enroll-free {
  background-color: #3498db;
  color: white;
  border: none;
}

.btn-enroll-free:hover {
  background-color: #2980b9;
}

.btn-enroll {
  background-color: #2c3e50;
  color: white;
  border: none;
}

.btn-enroll:hover {
  background-color: #1a252f;
}

.btn-wishlist {
  background-color: #f8f9fa;
  color: #2c3e50;
  border: 2px solid #e0e0e0;
}

.btn-wishlist:hover,
.btn-wishlist.active {
  background-color: #e74c3c;
  color: white;
  border-color: #e74c3c;
}

.btn-gift {
  background-color: white;
  color: #3498db;
  border: 2px solid #3498db;
}

.btn-gift:hover {
  background-color: #3498db;
  color: white;
}

.guarantees {
  padding: 20px;
  border-bottom: 1px solid #eef0f2;
}

.guarantee-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.guarantee-item:last-child {
  margin-bottom: 0;
}

.guarantee-item i {
  color: #2ecc71;
  margin-top: 2px;
}

.guarantee-item span {
  font-size: 14px;
  color: #5d6d7e;
  line-height: 1.4;
}

.share-section {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.share-label {
  font-weight: 600;
  color: #2c3e50;
}

.share-buttons {
  display: flex;
  gap: 10px;
}

.share-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
}

.share-btn.facebook { background-color: #3b5998; }
.share-btn.twitter { background-color: #1da1f2; }
.share-btn.whatsapp { background-color: #25d366; }
.share-btn.linkedin { background-color: #0077b5; }
.share-btn.copy {
  background-color: #f8f9fa;
  color: #2c3e50;
  border: 1px solid #e0e0e0;
}

.compare-section {
  margin-top: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  padding: 20px;
}

.compare-section h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.compare-courses {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.compare-course {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #eef0f2;
  cursor: pointer;
  transition: all 0.3s;
}

.compare-course:hover {
  background-color: #f8f9fa;
  border-color: #3498db;
}

.compare-thumbnail {
  width: 60px;
  height: 45px;
  border-radius: 6px;
  object-fit: cover;
}

.compare-info {
  flex: 1;
}

.compare-info h5 {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #2c3e50;
}

.compare-price {
  font-weight: 600;
  color: #2ecc71;
  font-size: 14px;
}

.btn-compare {
  width: 36px;
  height: 36px;
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

/* Navigation sticky */
.course-nav {
  background: white;
  border-bottom: 1px solid #eef0f2;
  transition: all 0.3s;
}

.course-nav.sticky-nav {
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.nav-tabs {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-x: auto;
}

.nav-tab {
  padding: 20px 25px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #7f8c8d;
  border-bottom: 3px solid transparent;
  white-space: nowrap;
  transition: all 0.3s;
}

.nav-tab:hover {
  color: #3498db;
}

.nav-tab.active {
  color: #3498db;
  border-bottom-color: #3498db;
  background-color: #f8f9fa;
}

/* Contenu principal */
.course-main {
  padding: 40px 0;
}

.main-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
}

/* Tab Content */
.tab-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* Learning Objectives */
.learning-objectives h2 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 24px;
}

.objectives-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.objective-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #eef0f2;
}

.objective-item i {
  color: #2ecc71;
  margin-top: 2px;
}

.objective-item span {
  color: #5d6d7e;
  line-height: 1.5;
}

/* Course Content */
.course-content-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 15px;
}

.section-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 24px;
}

.section-stats {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #7f8c8d;
}

/* Curriculum Accordion */
.curriculum-accordion {
  border: 1px solid #eef0f2;
  border-radius: 8px;
  overflow: hidden;
}

.accordion-section {
  border-bottom: 1px solid #eef0f2;
}

.accordion-section:last-child {
  border-bottom: none;
}

.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8f9fa;
  cursor: pointer;
  transition: background-color 0.3s;
}

.accordion-section.open .accordion-header {
  background: #e3f2fd;
}

.accordion-header:hover {
  background: #e9ecef;
}

.section-title h3 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 18px;
}

.section-info {
  font-size: 14px;
  color: #7f8c8d;
}

.section-toggle i {
  transition: transform 0.3s;
}

.accordion-section.open .section-toggle i {
  transform: rotate(180deg);
}

.accordion-content {
  background: white;
}

.lecture-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eef0f2;
}

.lecture-item:last-child {
  border-bottom: none;
}

.lecture-item.completed {
  background-color: #f8fff9;
}

.lecture-item.preview {
  background-color: #f0f7ff;
}

.lecture-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.lecture-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3498db;
}

.lecture-details h4 {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-size: 16px;
}

.lecture-meta {
  display: flex;
  gap: 15px;
  font-size: 14px;
  color: #7f8c8d;
}

.preview-badge {
  background-color: #3498db;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.lecture-actions button {
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

.btn-preview {
  background-color: #3498db;
  color: white;
  border: none;
}

.btn-preview:hover {
  background-color: #2980b9;
}

.btn-play {
  background-color: #2ecc71;
  color: white;
  border: none;
}

.btn-play:hover {
  background-color: #27ae60;
}

.btn-locked {
  background-color: #f8f9fa;
  color: #bdc3c7;
  border: 2px solid #e0e0e0;
  cursor: not-allowed;
}

/* Requirements & Audience */
.requirements-section,
.audience-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.requirements-section h2,
.audience-section h2 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 24px;
}

.requirements-list,
.audience-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.requirement-item,
.audience-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: #5d6d7e;
  line-height: 1.6;
}

.requirement-item i,
.audience-item i {
  color: #3498db;
  margin-top: 4px;
}

/* Instructor Tab */
.instructor-profile {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.instructor-avatar-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
}

.instructor-profile-info h2 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.instructor-profile-info .instructor-title {
  margin: 0 0 20px 0;
  color: #7f8c8d;
  font-size: 16px;
}

.instructor-rating {
  display: flex;
  gap: 40px;
}

.rating-overall {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rating-value {
  font-size: 36px;
  font-weight: 700;
  color: #2c3e50;
}

.rating-stars {
  display: flex;
  gap: 2px;
  margin: 5px 0;
}

.rating-stars i {
  color: #f39c12;
  font-size: 16px;
}

.rating-label {
  font-size: 14px;
  color: #7f8c8d;
}

.rating-details {
  display: flex;
  gap: 30px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.detail-value {
  font-size: 24px;
  font-weight: 700;
  color: #3498db;
}

.detail-label {
  font-size: 14px;
  color: #7f8c8d;
}

.instructor-bio,
.instructor-experience,
.instructor-other-courses {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.instructor-bio h3,
.instructor-experience h3,
.instructor-other-courses h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.bio-content p {
  color: #5d6d7e;
  line-height: 1.8;
  margin: 0;
}

.experience-list {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.experience-item {
  display: flex;
  gap: 20px;
  padding-bottom: 25px;
  border-bottom: 1px solid #eef0f2;
}

.experience-item:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.exp-period {
  min-width: 120px;
  font-weight: 600;
  color: #3498db;
}

.exp-details h4 {
  margin: 0 0 5px 0;
  color: #2c3e50;
}

.exp-company {
  margin: 0 0 10px 0;
  color: #7f8c8d;
  font-weight: 600;
}

.exp-description {
  margin: 0;
  color: #5d6d7e;
  line-height: 1.6;
}

.other-courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.other-course-card {
  border: 1px solid #eef0f2;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.other-course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
}

.other-course-thumbnail {
  width: 100%;
  height: 140px;
  object-fit: cover;
}

.other-course-info {
  padding: 15px;
}

.other-course-info h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 16px;
  line-height: 1.3;
}

.other-course-rating {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 10px;
}

.other-course-rating .stars i {
  font-size: 12px;
  color: #f39c12;
}

.other-course-rating .rating-value {
  font-size: 14px;
  color: #7f8c8d;
}

.other-course-price {
  font-weight: 700;
  color: #2ecc71;
}

/* Reviews Tab */
.reviews-section {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.reviews-summary {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 40px;
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.summary-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.average-rating {
  text-align: center;
}

.rating-number {
  font-size: 48px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 10px;
}

.rating-stars-large {
  display: flex;
  gap: 4px;
  margin-bottom: 10px;
}

.rating-stars-large i {
  font-size: 24px;
  color: #f39c12;
}

.rating-count {
  font-size: 14px;
  color: #7f8c8d;
}

.summary-right {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: 15px;
}

.star-label {
  width: 80px;
  font-size: 14px;
  color: #5d6d7e;
}

.bar-container {
  flex: 1;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background-color: #f39c12;
  border-radius: 4px;
}

.percentage {
  width: 40px;
  text-align: right;
  font-weight: 600;
  color: #2c3e50;
}

.reviews-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
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
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.sort-reviews .sort-select {
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  min-width: 160px;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.review-item {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.reviewer-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.reviewer-details h4 {
  margin: 0 0 5px 0;
  color: #2c3e50;
}

.reviewer-meta {
  display: flex;
  gap: 15px;
  font-size: 14px;
  color: #7f8c8d;
}

.review-verified {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #2ecc71;
}

.review-content {
  margin-bottom: 20px;
}

.review-rating {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.review-rating .stars i {
  color: #f39c12;
}

.review-title {
  font-weight: 600;
  color: #2c3e50;
  font-size: 18px;
}

.review-text {
  color: #5d6d7e;
  line-height: 1.6;
  margin: 0 0 15px 0;
}

.review-helpful {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #7f8c8d;
}

.review-helpful i {
  color: #3498db;
}

.review-actions {
  display: flex;
  gap: 15px;
}

.btn-helpful,
.btn-report {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-helpful {
  background-color: #f8f9fa;
  color: #2c3e50;
  border: 2px solid #e0e0e0;
}

.btn-helpful:hover,
.btn-helpful.active {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.btn-report {
  background: none;
  color: #e74c3c;
  border: 2px solid #e74c3c;
}

.btn-report:hover {
  background-color: #e74c3c;
  color: white;
}

.reviews-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.add-review {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.add-review h3 {
  margin: 0 0 25px 0;
  color: #2c3e50;
}

.review-rating-input {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 25px;
}

.rating-label {
  font-weight: 600;
  color: #2c3e50;
}

.rating-stars-input {
  display: flex;
  gap: 5px;
}

.rating-stars-input i {
  font-size: 24px;
  color: #bdc3c7;
  cursor: pointer;
  transition: color 0.3s;
}

.rating-stars-input i:hover {
  color: #f39c12;
}

.rating-stars-input i.icon-star-filled {
  color: #f39c12;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.form-group input[type="text"],
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
}

.form-actions {
  text-align: right;
}

.btn-submit-review {
  padding: 15px 30px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-submit-review:hover {
  background-color: #27ae60;
}

/* FAQ Tab */
.faq-section {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.faq-section h2 {
  margin: 0 0 30px 0;
  color: #2c3e50;
  font-size: 24px;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.faq-item {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  transition: all 0.3s;
}

.faq-item.open {
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
}

.faq-question {
  padding: 25px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.faq-question h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
}

.faq-question i {
  color: #3498db;
  transition: transform 0.3s;
}

.faq-item.open .faq-question i {
  transform: rotate(180deg);
}

.faq-answer {
  padding: 0 25px 25px;
  color: #5d6d7e;
  line-height: 1.6;
  border-top: 1px solid #eef0f2;
}

.ask-question {
  background: white;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.ask-question h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.ask-question p {
  margin: 0 0 25px 0;
  color: #7f8c8d;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.btn-contact {
  padding: 15px 30px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: background-color 0.3s;
}

.btn-contact:hover {
  background-color: #2980b9;
}

/* Sidebar droite */
.main-right {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.progress-card,
.resources-card,
.similar-courses-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.progress-card h3,
.resources-card h3,
.similar-courses-card h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 18px;
}

.progress-circle {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.circle-chart {
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
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
}

.progress-label {
  font-size: 14px;
  color: #7f8c8d;
}

.progress-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 20px 0;
}

.progress-stats .stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #5d6d7e;
}

.progress-stats .stat-item i {
  color: #3498db;
}

.btn-resume {
  width: 100%;
  padding: 15px;
  background-color: #2ecc71;
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
  transition: background-color 0.3s;
}

.btn-resume:hover {
  background-color: #27ae60;
}

.resources-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #5d6d7e;
  font-size: 14px;
}

.resource-item i {
  color: #3498db;
}

.similar-courses-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.similar-course {
  display: flex;
  gap: 15px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #eef0f2;
  cursor: pointer;
  transition: all 0.3s;
}

.similar-course:hover {
  background-color: #f8f9fa;
  border-color: #3498db;
}

.similar-thumbnail {
  width: 60px;
  height: 45px;
  border-radius: 6px;
  object-fit: cover;
}

.similar-info {
  flex: 1;
}

.similar-info h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #2c3e50;
  line-height: 1.3;
}

.similar-instructor {
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 5px;
}

.similar-rating {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 5px;
}

.similar-rating .stars i {
  font-size: 10px;
  color: #f39c12;
}

.similar-rating .rating-value {
  font-size: 12px;
  color: #7f8c8d;
}

.similar-price {
  font-weight: 600;
  color: #2ecc71;
  font-size: 14px;
}

/* Modal vidéo */
.modal-video {
  max-width: 900px;
}

.video-player {
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.player-placeholder {
  height: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
}

.player-placeholder i {
  font-size: 80px;
  margin-bottom: 20px;
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .main-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .course-title {
    font-size: 28px;
  }

  .course-description {
    font-size: 16px;
  }

  .instructor-profile {
    flex-direction: column;
    text-align: center;
  }

  .instructor-rating {
    flex-direction: column;
    gap: 20px;
  }

  .rating-details {
    justify-content: center;
  }

  .reviews-summary {
    grid-template-columns: 1fr;
  }

  .nav-tab {
    padding: 15px;
    font-size: 14px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 576px) {
  .container {
    padding: 0 15px;
  }

  .course-metrics {
    grid-template-columns: repeat(2, 1fr);
  }

  .enrollment-card {
    position: static;
    width: 100%;
  }

  .action-buttons {
    flex-direction: column;
  }

  .reviews-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    justify-content: center;
  }
}
</style>