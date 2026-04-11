<template>
  <div class="profile-view">
    <!-- En-tête de profil -->
    <div class="profile-header">
      <div class="container">
        <div class="header-content">
          <div class="profile-cover">
            <div class="cover-image" :style="{ backgroundImage: `url(${user.coverPhoto})` }">
              <div class="cover-overlay">
                <button class="btn-change-cover" @click="changeCoverPhoto">
                  <i class="icon-camera"></i>
                  Changer la photo de couverture
                </button>
              </div>
            </div>

            <div class="profile-avatar-section">
              <div class="avatar-container">
                <img
                    :src="user.avatar"
                    :alt="user.name"
                    class="profile-avatar"
                    @click="changeAvatar"
                >
                <div class="avatar-status" :class="user.status">
                  <div class="status-dot"></div>
                </div>
                <button class="btn-change-avatar" @click="changeAvatar">
                  <i class="icon-camera"></i>
                </button>
              </div>

              <div class="profile-basic-info">
                <div class="name-verification">
                  <h1 class="profile-name">{{ user.name }}</h1>
                  <div class="verification-badge" v-if="user.isVerified">
                    <i class="icon-verified"></i>
                    Compte vérifié
                  </div>
                  <div class="user-badges">
                    <span class="badge" :class="user.role">{{ getRoleText(user.role) }}</span>
                    <span class="badge premium" v-if="user.isPremium">Premium</span>
                    <span class="badge instructor" v-if="user.isInstructor">Instructeur</span>
                  </div>
                </div>

                <p class="profile-bio">{{ user.bio }}</p>

                <div class="profile-stats">
                  <div class="stat-item" @click="showFollowers">
                    <span class="stat-value">{{ user.followers }}</span>
                    <span class="stat-label">Abonnés</span>
                  </div>
                  <div class="stat-item" @click="showFollowing">
                    <span class="stat-value">{{ user.following }}</span>
                    <span class="stat-label">Abonnements</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ user.courses }}</span>
                    <span class="stat-label">Cours</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value">{{ user.completedCourses }}</span>
                    <span class="stat-label">Terminés</span>
                  </div>
                </div>
              </div>

              <div class="profile-actions">
                <button
                    v-if="!isOwnProfile"
                    class="btn-follow"
                    :class="{ active: user.isFollowing }"
                    @click="toggleFollow"
                >
                  <i :class="user.isFollowing ? 'icon-user-check' : 'icon-user-plus'"></i>
                  {{ user.isFollowing ? 'Abonné' : 'S\'abonner' }}
                </button>
                <button class="btn-secondary" @click="sendMessage">
                  <i class="icon-message"></i>
                  Message
                </button>
                <button class="btn-outline" @click="shareProfile">
                  <i class="icon-share"></i>
                  Partager
                </button>
                <div class="more-actions">
                  <button class="btn-more" @click="toggleMoreActions">
                    <i class="icon-more"></i>
                  </button>
                  <div v-if="showMoreActions" class="more-actions-menu">
                    <button class="action-item" @click="reportProfile">
                      <i class="icon-flag"></i>
                      Signaler
                    </button>
                    <button class="action-item" @click="blockUser" v-if="!isOwnProfile">
                      <i class="icon-block"></i>
                      Bloquer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation du profil -->
    <div class="profile-navigation">
      <div class="container">
        <nav class="nav-tabs">
          <button
              v-for="tab in tabs"
              :key="tab.id"
              class="nav-tab"
              :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id"
          >
            <i :class="tab.icon"></i>
            {{ tab.label }}
            <span v-if="tab.count" class="tab-count">{{ tab.count }}</span>
          </button>
        </nav>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="profile-main">
      <div class="container">
        <div class="profile-content">
          <!-- Sidebar -->
          <div class="profile-sidebar">
            <!-- Info personnelle -->
            <div class="sidebar-section personal-info">
              <h3 class="section-title">Informations personnelles</h3>
              <div class="info-list">
                <div class="info-item">
                  <i class="icon-mail"></i>
                  <div class="info-content">
                    <span class="info-label">Email</span>
                    <span class="info-value">{{ user.email }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <i class="icon-phone"></i>
                  <div class="info-content">
                    <span class="info-label">Téléphone</span>
                    <span class="info-value">{{ user.phone || 'Non renseigné' }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <i class="icon-location"></i>
                  <div class="info-content">
                    <span class="info-label">Localisation</span>
                    <span class="info-value">{{ user.location || 'Non renseigné' }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <i class="icon-calendar"></i>
                  <div class="info-content">
                    <span class="info-label">Membre depuis</span>
                    <span class="info-value">{{ formatDate(user.joinDate) }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <i class="icon-language"></i>
                  <div class="info-content">
                    <span class="info-label">Langues</span>
                    <div class="languages-list">
                      <span
                          v-for="lang in user.languages"
                          :key="lang"
                          class="language-tag"
                      >
                        {{ lang }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Compétences -->
            <div class="sidebar-section skills-section">
              <h3 class="section-title">Compétences</h3>
              <div class="skills-list">
                <div
                    v-for="skill in user.skills"
                    :key="skill.name"
                    class="skill-item"
                >
                  <div class="skill-info">
                    <span class="skill-name">{{ skill.name }}</span>
                    <span class="skill-level">{{ skill.level }}</span>
                  </div>
                  <div class="skill-progress">
                    <div
                        class="progress-bar"
                        :style="{ width: skill.progress + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
              <button class="btn-add-skill" @click="showAddSkillModal">
                <i class="icon-plus"></i>
                Ajouter une compétence
              </button>
            </div>

            <!-- Statistiques d'apprentissage -->
            <div class="sidebar-section learning-stats">
              <h3 class="section-title">Statistiques d'apprentissage</h3>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-icon">
                    <i class="icon-clock"></i>
                  </div>
                  <div class="stat-details">
                    <div class="stat-value">{{ user.studyHours }}h</div>
                    <div class="stat-label">Temps d'étude</div>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">
                    <i class="icon-certificate"></i>
                  </div>
                  <div class="stat-details">
                    <div class="stat-value">{{ user.certificates }}</div>
                    <div class="stat-label">Certificats</div>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">
                    <i class="icon-target"></i>
                  </div>
                  <div class="stat-details">
                    <div class="stat-value">{{ user.achievements }}</div>
                    <div class="stat-label">Réussites</div>
                  </div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">
                    <i class="icon-streak"></i>
                  </div>
                  <div class="stat-details">
                    <div class="stat-value">{{ user.streak }} jours</div>
                    <div class="stat-label">Série</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Badges -->
            <div class="sidebar-section badges-section">
              <h3 class="section-title">Badges</h3>
              <div class="badges-grid">
                <div
                    v-for="badge in user.badges"
                    :key="badge.id"
                    class="badge-item"
                    :class="badge.rarity"
                    :title="badge.description"
                >
                  <div class="badge-icon">
                    <i :class="badge.icon"></i>
                  </div>
                  <span class="badge-name">{{ badge.name }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Contenu principal -->
          <div class="profile-main-content">
            <!-- Tab: Activité -->
            <div v-if="activeTab === 'activity'" class="tab-content">
              <div class="activity-feed">
                <div class="feed-header">
                  <h3>Activitiés récentes</h3>
                  <div class="feed-filters">
                    <button
                        v-for="filter in activityFilters"
                        :key="filter.value"
                        class="filter-btn"
                        :class="{ active: activityFilter === filter.value }"
                        @click="activityFilter = filter.value"
                    >
                      {{ filter.label }}
                    </button>
                  </div>
                </div>

                <div class="activities-list">
                  <div
                      v-for="activity in filteredActivities"
                      :key="activity.id"
                      class="activity-item"
                  >
                    <div class="activity-avatar">
                      <img
                          :src="activity.user.avatar"
                          :alt="activity.user.name"
                          class="avatar-image"
                      >
                    </div>
                    <div class="activity-content">
                      <div class="activity-header">
                        <h4 class="activity-user">{{ activity.user.name }}</h4>
                        <span class="activity-time">{{ activity.time }}</span>
                      </div>
                      <p class="activity-text">{{ activity.text }}</p>

                      <div v-if="activity.course" class="activity-course">
                        <div class="course-thumbnail">
                          <img
                              :src="activity.course.thumbnail"
                              :alt="activity.course.title"
                          >
                        </div>
                        <div class="course-info">
                          <h5>{{ activity.course.title }}</h5>
                          <p>{{ activity.course.description }}</p>
                          <div class="course-progress">
                            <div class="progress-bar">
                              <div
                                  class="progress-fill"
                                  :style="{ width: activity.course.progress + '%' }"
                              ></div>
                            </div>
                            <span class="progress-text">{{ activity.course.progress }}%</span>
                          </div>
                        </div>
                      </div>

                      <div class="activity-actions">
                        <button class="action-btn" @click="likeActivity(activity.id)">
                          <i :class="activity.isLiked ? 'icon-heart-filled' : 'icon-heart'"></i>
                          <span>{{ activity.likes }}</span>
                        </button>
                        <button class="action-btn" @click="commentActivity(activity.id)">
                          <i class="icon-message"></i>
                          <span>{{ activity.comments }}</span>
                        </button>
                        <button class="action-btn" @click="shareActivity(activity.id)">
                          <i class="icon-share"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab: Cours -->
            <div v-if="activeTab === 'courses'" class="tab-content">
              <div class="courses-section">
                <div class="section-header">
                  <h3>Mes Cours</h3>
                  <div class="course-filters">
                    <button
                        v-for="filter in courseFilters"
                        :key="filter.value"
                        class="filter-btn"
                        :class="{ active: courseFilter === filter.value }"
                        @click="courseFilter = filter.value"
                    >
                      {{ filter.label }}
                      <span v-if="filter.count" class="filter-count">{{ filter.count }}</span>
                    </button>
                  </div>
                </div>

                <div class="courses-grid">
                  <div
                      v-for="course in filteredCourses"
                      :key="course.id"
                      class="course-card"
                  >
                    <div class="course-thumbnail">
                      <img
                          :src="course.thumbnail"
                          :alt="course.title"
                      >
                      <div class="course-badge" :class="course.status">
                        {{ course.status === 'completed' ? 'Terminé' :
                          course.status === 'in-progress' ? 'En cours' :
                              'À commencer' }}
                      </div>
                      <div class="course-actions">
                        <button
                            class="action-btn favorite"
                            :class="{ active: course.isFavorite }"
                            @click="toggleCourseFavorite(course.id)"
                        >
                          <i :class="course.isFavorite ? 'icon-heart-filled' : 'icon-heart'"></i>
                        </button>
                      </div>
                    </div>

                    <div class="course-info">
                      <div class="course-header">
                        <h4>{{ course.title }}</h4>
                        <span class="course-category">{{ course.category }}</span>
                      </div>
                      <p class="course-description">{{ course.description }}</p>

                      <div class="course-progress">
                        <div class="progress-info">
                          <span>Progression</span>
                          <span>{{ course.progress }}%</span>
                        </div>
                        <div class="progress-bar">
                          <div
                              class="progress-fill"
                              :style="{ width: course.progress + '%' }"
                          ></div>
                        </div>
                      </div>

                      <div class="course-footer">
                        <div class="instructor-info">
                          <img
                              :src="course.instructor.avatar"
                              :alt="course.instructor.name"
                              class="instructor-avatar"
                          >
                          <span class="instructor-name">{{ course.instructor.name }}</span>
                        </div>
                        <div class="course-actions">
                          <button class="btn-primary" @click="continueCourse(course.id)">
                            <i class="icon-play"></i>
                            Continuer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab: Certificats -->
            <div v-if="activeTab === 'certificates'" class="tab-content">
              <div class="certificates-section">
                <div class="section-header">
                  <h3>Mes Certificats</h3>
                  <button class="btn-outline" @click="downloadAllCertificates">
                    <i class="icon-download"></i>
                    Télécharger tout
                  </button>
                </div>

                <div class="certificates-grid">
                  <div
                      v-for="certificate in user.certificates"
                      :key="certificate.id"
                      class="certificate-card"
                  >
                    <div class="certificate-header">
                      <div class="certificate-icon">
                        <i class="icon-certificate"></i>
                      </div>
                      <div class="certificate-info">
                        <h4>{{ certificate.title }}</h4>
                        <span class="certificate-date">Obtenu le {{ certificate.date }}</span>
                      </div>
                      <button class="btn-more" @click="showCertificateOptions(certificate.id)">
                        <i class="icon-more"></i>
                      </button>
                    </div>

                    <div class="certificate-body">
                      <div class="certificate-preview">
                        <div class="preview-content">
                          <div class="certificate-logo">
                            <i class="icon-educours"></i>
                          </div>
                          <h3 class="certificate-title">{{ certificate.title }}</h3>
                          <p class="certificate-text">
                            Ce certificat est décerné à
                            <strong>{{ user.name }}</strong>
                            pour avoir complété avec succès le cours
                            <strong>"{{ certificate.courseTitle }}"</strong>
                          </p>
                          <div class="certificate-details">
                            <div class="detail-item">
                              <span class="detail-label">Score</span>
                              <span class="detail-value">{{ certificate.score }}%</span>
                            </div>
                            <div class="detail-item">
                              <span class="detail-label">Date</span>
                              <span class="detail-value">{{ certificate.date }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="certificate-footer">
                      <button class="btn-primary" @click="viewCertificate(certificate.id)">
                        <i class="icon-eye"></i>
                        Voir
                      </button>
                      <button class="btn-outline" @click="downloadCertificate(certificate.id)">
                        <i class="icon-download"></i>
                        Télécharger
                      </button>
                      <button class="btn-outline" @click="shareCertificate(certificate.id)">
                        <i class="icon-share"></i>
                        Partager
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab: Projets -->
            <div v-if="activeTab === 'projects'" class="tab-content">
              <div class="projects-section">
                <div class="section-header">
                  <h3>Mes Projets</h3>
                  <button class="btn-primary" @click="showCreateProjectModal">
                    <i class="icon-plus"></i>
                    Nouveau projet
                  </button>
                </div>

                <div class="projects-grid">
                  <div
                      v-for="project in user.projects"
                      :key="project.id"
                      class="project-card"
                  >
                    <div class="project-header">
                      <h4>{{ project.title }}</h4>
                      <div class="project-status" :class="project.status">
                        {{ getProjectStatusText(project.status) }}
                      </div>
                    </div>

                    <p class="project-description">{{ project.description }}</p>

                    <div class="project-tech">
                      <span
                          v-for="tech in project.technologies"
                          :key="tech"
                          class="tech-tag"
                      >
                        {{ tech }}
                      </span>
                    </div>

                    <div class="project-progress">
                      <div class="progress-info">
                        <span>Progression</span>
                        <span>{{ project.progress }}%</span>
                      </div>
                      <div class="progress-bar">
                        <div
                            class="progress-fill"
                            :style="{ width: project.progress + '%' }"
                        ></div>
                      </div>
                    </div>

                    <div class="project-footer">
                      <div class="project-meta">
                        <span class="meta-item">
                          <i class="icon-calendar"></i>
                          {{ project.startDate }}
                        </span>
                        <span class="meta-item">
                          <i class="icon-users"></i>
                          {{ project.teamSize }}
                        </span>
                      </div>
                      <div class="project-actions">
                        <button class="btn-outline" @click="viewProject(project.id)">
                          <i class="icon-eye"></i>
                        </button>
                        <button class="btn-outline" @click="editProject(project.id)">
                          <i class="icon-edit"></i>
                        </button>
                        <button class="btn-outline" @click="deleteProject(project.id)">
                          <i class="icon-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab: Paramètres -->
            <div v-if="activeTab === 'settings'" class="tab-content">
              <div class="settings-section">
                <div class="settings-header">
                  <h3>Paramètres du compte</h3>
                  <p>Gérez vos préférences et paramètres de sécurité</p>
                </div>

                <div class="settings-tabs">
                  <button
                      v-for="setting in settingsTabs"
                      :key="setting.id"
                      class="settings-tab"
                      :class="{ active: activeSetting === setting.id }"
                      @click="activeSetting = setting.id"
                  >
                    <i :class="setting.icon"></i>
                    {{ setting.label }}
                  </button>
                </div>

                <!-- Paramètres de profil -->
                <div v-if="activeSetting === 'profile'" class="settings-content">
                  <div class="form-group">
                    <label for="profileName">Nom complet</label>
                    <input
                        type="text"
                        id="profileName"
                        v-model="editProfile.name"
                        class="form-input"
                    >
                  </div>

                  <div class="form-group">
                    <label for="profileBio">Bio</label>
                    <textarea
                        id="profileBio"
                        v-model="editProfile.bio"
                        class="form-textarea"
                        rows="4"
                        placeholder="Décrivez-vous..."
                    ></textarea>
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label for="profileEmail">Email</label>
                      <input
                          type="email"
                          id="profileEmail"
                          v-model="editProfile.email"
                          class="form-input"
                      >
                    </div>
                    <div class="form-group">
                      <label for="profilePhone">Téléphone</label>
                      <input
                          type="tel"
                          id="profilePhone"
                          v-model="editProfile.phone"
                          class="form-input"
                      >
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="profileLocation">Localisation</label>
                    <input
                        type="text"
                        id="profileLocation"
                        v-model="editProfile.location"
                        class="form-input"
                    >
                  </div>

                  <button class="btn-primary" @click="saveProfile">
                    <i class="icon-save"></i>
                    Sauvegarder les modifications
                  </button>
                </div>

                <!-- Sécurité -->
                <div v-if="activeSetting === 'security'" class="settings-content">
                  <div class="security-item">
                    <div class="security-info">
                      <h4>Mot de passe</h4>
                      <p>Modifiez votre mot de passe régulièrement pour plus de sécurité</p>
                    </div>
                    <button class="btn-outline" @click="showChangePasswordModal">
                      Modifier
                    </button>
                  </div>

                  <div class="security-item">
                    <div class="security-info">
                      <h4>Authentification à deux facteurs</h4>
                      <p>Ajoutez une couche supplémentaire de sécurité à votre compte</p>
                    </div>
                    <label class="toggle-switch">
                      <input
                          type="checkbox"
                          v-model="security.twoFactorEnabled"
                          @change="toggleTwoFactor"
                      >
                      <span class="toggle-slider"></span>
                    </label>
                  </div>

                  <div class="security-item">
                    <div class="security-info">
                      <h4>Sessions actives</h4>
                      <p>Gérez vos sessions de connexion actives</p>
                    </div>
                    <button class="btn-outline" @click="manageSessions">
                      Gérer
                    </button>
                  </div>
                </div>

                <!-- Notifications -->
                <div v-if="activeSetting === 'notifications'" class="settings-content">
                  <div class="notification-category">
                    <h4>Notifications par email</h4>
                    <div class="notification-options">
                      <label class="checkbox-label">
                        <input
                            type="checkbox"
                            v-model="notifications.email.courses"
                        >
                        <span class="checkbox-custom"></span>
                        Nouvelles leçons et mises à jour de cours
                      </label>
                      <label class="checkbox-label">
                        <input
                            type="checkbox"
                            v-model="notifications.email.assignments"
                        >
                        <span class="checkbox-custom"></span>
                        Rappels de devoirs et échéances
                      </label>
                      <label class="checkbox-label">
                        <input
                            type="checkbox"
                            v-model="notifications.email.liveClasses"
                        >
                        <span class="checkbox-custom"></span>
                        Sessions live à venir
                      </label>
                    </div>
                  </div>

                  <div class="notification-category">
                    <h4>Notifications push</h4>
                    <div class="notification-options">
                      <label class="checkbox-label">
                        <input
                            type="checkbox"
                            v-model="notifications.push.messages"
                        >
                        <span class="checkbox-custom"></span>
                        Nouveaux messages
                      </label>
                      <label class="checkbox-label">
                        <input
                            type="checkbox"
                            v-model="notifications.push.comments"
                        >
                        <span class="checkbox-custom"></span>
                        Commentaires et réponses
                      </label>
                    </div>
                  </div>

                  <button class="btn-primary" @click="saveNotificationSettings">
                    <i class="icon-save"></i>
                    Sauvegarder les préférences
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal changement d'avatar -->
    <div class="modal-overlay" v-if="showAvatarModal">
      <div class="modal modal-avatar">
        <div class="modal-header">
          <h2>Changer la photo de profil</h2>
          <button class="btn-close" @click="showAvatarModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="avatar-options">
            <div class="option-upload">
              <div class="upload-area" @click="triggerAvatarUpload" @dragover.prevent @drop.prevent="handleAvatarDrop">
                <input
                    type="file"
                    ref="avatarInput"
                    @change="handleAvatarUpload"
                    accept="image/*"
                    class="file-input"
                >
                <div class="upload-content">
                  <i class="icon-upload"></i>
                  <h4>Glissez-déposez une image</h4>
                  <p>ou cliquez pour parcourir</p>
                  <p class="file-info">JPG, PNG (max. 5MB)</p>
                </div>
              </div>
            </div>

            <div class="option-gallery">
              <h4>Avatars par défaut</h4>
              <div class="gallery-grid">
                <div
                    v-for="avatar in defaultAvatars"
                    :key="avatar.id"
                    class="gallery-item"
                    :class="{ selected: selectedAvatar === avatar.id }"
                    @click="selectDefaultAvatar(avatar.id)"
                >
                  <img :src="avatar.url" :alt="`Avatar ${avatar.id}`">
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showAvatarModal = false">
            Annuler
          </button>
          <button class="btn-primary" @click="saveAvatar" :disabled="!selectedAvatar && !uploadedAvatar">
            <i class="icon-save"></i>
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRouter()
const router = useRouter()

// États
const activeTab = ref('activity')
const activeSetting = ref('profile')
const activityFilter = ref('all')
const courseFilter = ref('all')
const showAvatarModal = ref(false)
const showMoreActions = ref(false)
const selectedAvatar = ref(null)
const uploadedAvatar = ref(null)

// Données utilisateur
const user = ref({
  name: 'Koffi Kouamé',
  email: 'koffi@educours.com',
  phone: '+33 6 12 34 56 78',
  location: 'Paris, France',
  bio: 'Passionné de développement web et de nouvelles technologies. J\'aime apprendre et partager mes connaissances.',
  avatar: '/images/avatar3.jpg',
  coverPhoto: '/images/cover-bg.jpg',
  status: 'online',
  isVerified: true,
  role: 'student',
  isPremium: true,
  isInstructor: true,
  joinDate: '2023-09-15',
  followers: 245,
  following: 156,
  courses: 12,
  completedCourses: 8,
  studyHours: 156,
  certificates: 5,
  achievements: 18,
  streak: 42,
  languages: ['Français', 'Anglais', 'Dioula'],
  skills: [
    { name: 'JavaScript', level: 'Avancé', progress: 85 },
    { name: 'Vue.js', level: 'Intermédiaire', progress: 70 },
    { name: 'Node.js', level: 'Intermédiaire', progress: 65 },
    { name: 'UI/UX Design', level: 'Débutant', progress: 40 }
  ],
  badges: [
    { id: 1, name: 'Pionnier', icon: 'icon-rocket', rarity: 'legendary', description: 'Membre depuis le lancement' },
    { id: 2, name: 'Maître', icon: 'icon-crown', rarity: 'epic', description: '10 cours terminés' },
    { id: 3, name: 'Perfect Score', icon: 'icon-star', rarity: 'rare', description: '100% sur tous les quiz' }
  ],
  certificates: [
    { id: 1, title: 'JavaScript Avancé', date: '15 Mars 2024', score: 92, courseTitle: 'JavaScript Avancé' },
    { id: 2, title: 'Vue.js Fundamentals', date: '28 Fév 2024', score: 88, courseTitle: 'Vue.js pour débutants' }
  ],
  projects: [
    {
      id: 1,
      title: 'Application de gestion de tâches',
      description: 'Une application web complète de gestion de tâches avec Vue.js et Firebase',
      status: 'completed',
      progress: 100,
      technologies: ['Vue.js', 'Firebase', 'Tailwind CSS'],
      startDate: 'Jan 2024',
      teamSize: 3
    }
  ]
})

const editProfile = ref({ ...user.value })

// Tabs
const tabs = [
  { id: 'activity', label: 'Activité', icon: 'icon-activity', count: 24 },
  { id: 'courses', label: 'Cours', icon: 'icon-courses', count: 12 },
  { id: 'certificates', label: 'Certificats', icon: 'icon-certificate', count: 5 },
  { id: 'projects', label: 'Projets', icon: 'icon-projects', count: 3 },
  { id: 'settings', label: 'Paramètres', icon: 'icon-settings' }
]

const settingsTabs = [
  { id: 'profile', label: 'Profil', icon: 'icon-user' },
  { id: 'security', label: 'Sécurité', icon: 'icon-lock' },
  { id: 'notifications', label: 'Notifications', icon: 'icon-bell' },
  { id: 'privacy', label: 'Confidentialité', icon: 'icon-shield' },
  { id: 'billing', label: 'Facturation', icon: 'icon-credit-card' }
]

// Filtres
const activityFilters = [
  { value: 'all', label: 'Toutes' },
  { value: 'courses', label: 'Cours' },
  { value: 'projects', label: 'Projets' },
  { value: 'achievements', label: 'Réussites' }
]

const courseFilters = [
  { value: 'all', label: 'Tous', count: 12 },
  { value: 'in-progress', label: 'En cours', count: 4 },
  { value: 'completed', label: 'Terminés', count: 8 },
  { value: 'favorites', label: 'Favoris', count: 3 }
]

// Activités
const activities = ref([
  {
    id: 1,
    user: { name: 'Koffi Kouamé', avatar: '/images/avatar3.jpg' },
    time: 'Il y a 2 heures',
    text: 'A terminé le cours "JavaScript Avancé" avec un score de 92%',
    course: {
      title: 'JavaScript Avancé',
      description: 'Mastering advanced JavaScript concepts',
      thumbnail: '/images/course1.jpg',
      progress: 100
    },
    likes: 12,
    comments: 3,
    isLiked: true
  },
  {
    id: 2,
    user: { name: 'Koffi Kouamé', avatar: '/images/avatar3.jpg' },
    time: 'Il y a 5 heures',
    text: 'A obtenu le badge "Perfect Score"',
    likes: 8,
    comments: 1,
    isLiked: false
  }
])

// Cours
const courses = ref([
  {
    id: 1,
    title: 'JavaScript Avancé',
    description: 'Apprenez les concepts avancés de JavaScript',
    thumbnail: '/images/course1.jpg',
    category: 'Développement',
    status: 'completed',
    progress: 100,
    instructor: { name: 'Dr. Jean Dupont', avatar: '/images/avatar1.jpg' },
    isFavorite: true
  },
  {
    id: 2,
    title: 'Vue.js Fundamentals',
    description: 'Les bases de Vue.js pour débutants',
    thumbnail: '/images/course2.jpg',
    category: 'Développement',
    status: 'in-progress',
    progress: 65,
    instructor: { name: 'Amina Diallo', avatar: '/images/avatar2.jpg' },
    isFavorite: true
  }
])

// Avatars par défaut
const defaultAvatars = ref([
  { id: 1, url: '/images/avatar-default1.jpg' },
  { id: 2, url: '/images/avatar-default2.jpg' },
  { id: 3, url: '/images/avatar-default3.jpg' },
  { id: 4, url: '/images/avatar-default4.jpg' },
  { id: 5, url: '/images/avatar-default5.jpg' },
  { id: 6, url: '/images/avatar-default6.jpg' }
])

// Paramètres
const security = ref({
  twoFactorEnabled: false
})

const notifications = ref({
  email: {
    courses: true,
    assignments: true,
    liveClasses: true
  },
  push: {
    messages: true,
    comments: true
  }
})

// Computed
const isOwnProfile = computed(() => {
  return true // Pour cet exemple, supposons que c'est le profil de l'utilisateur connecté
})

const filteredActivities = computed(() => {
  if (activityFilter.value === 'all') return activities.value
  return activities.value.filter(a => a.type === activityFilter.value)
})

const filteredCourses = computed(() => {
  if (courseFilter.value === 'all') return courses.value
  return courses.value.filter(c => c.status === courseFilter.value)
})

// Méthodes
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getRoleText = (role) => {
  const roles = {
    'student': 'Étudiant',
    'teacher': 'Enseignant',
    'admin': 'Administrateur'
  }
  return roles[role] || role
}

const getProjectStatusText = (status) => {
  const statuses = {
    'completed': 'Terminé',
    'in-progress': 'En cours',
    'planned': 'Planifié'
  }
  return statuses[status] || status
}

const changeAvatar = () => {
  showAvatarModal.value = true
}

const changeCoverPhoto = () => {
  // Implémenter le changement de photo de couverture
  console.log('Changer photo de couverture')
}

const toggleFollow = () => {
  user.value.isFollowing = !user.value.isFollowing
  if (user.value.isFollowing) {
    user.value.followers++
  } else {
    user.value.followers--
  }
}

const sendMessage = () => {
  router.push('/messages')
}

const shareProfile = () => {
  const shareUrl = window.location.href
  if (navigator.share) {
    navigator.share({
      title: `Profil de ${user.value.name}`,
      text: `Découvrez le profil de ${user.value.name} sur Educours`,
      url: shareUrl
    })
  } else {
    navigator.clipboard.writeText(shareUrl)
    alert('Lien du profil copié dans le presse-papier !')
  }
}

const showFollowers = () => {
  // Afficher la liste des abonnés
  console.log('Afficher abonnés')
}

const showFollowing = () => {
  // Afficher la liste des abonnements
  console.log('Afficher abonnements')
}

const toggleMoreActions = () => {
  showMoreActions.value = !showMoreActions.value
}

const reportProfile = () => {
  console.log('Signaler le profil')
}

const blockUser = () => {
  console.log('Bloquer l\'utilisateur')
}

const likeActivity = (activityId) => {
  const activity = activities.value.find(a => a.id === activityId)
  if (activity) {
    activity.isLiked = !activity.isLiked
    activity.likes += activity.isLiked ? 1 : -1
  }
}

const commentActivity = (activityId) => {
  console.log('Commenter activité:', activityId)
}

const shareActivity = (activityId) => {
  console.log('Partager activité:', activityId)
}

const toggleCourseFavorite = (courseId) => {
  const course = courses.value.find(c => c.id === courseId)
  if (course) {
    course.isFavorite = !course.isFavorite
  }
}

const continueCourse = (courseId) => {
  router.push(`/courses/${courseId}`)
}

const downloadAllCertificates = () => {
  console.log('Télécharger tous les certificats')
}

const viewCertificate = (certificateId) => {
  console.log('Voir certificat:', certificateId)
}

const downloadCertificate = (certificateId) => {
  console.log('Télécharger certificat:', certificateId)
}

const shareCertificate = (certificateId) => {
  console.log('Partager certificat:', certificateId)
}

const showCreateProjectModal = () => {
  console.log('Créer nouveau projet')
}

const viewProject = (projectId) => {
  console.log('Voir projet:', projectId)
}

const editProject = (projectId) => {
  console.log('Éditer projet:', projectId)
}

const deleteProject = (projectId) => {
  if (confirm('Supprimer ce projet ?')) {
    console.log('Supprimer projet:', projectId)
  }
}

const saveProfile = () => {
  // Sauvegarder les modifications du profil
  Object.assign(user.value, editProfile.value)
  console.log('Profil sauvegardé')
}

const showChangePasswordModal = () => {
  console.log('Changer mot de passe')
}

const toggleTwoFactor = () => {
  console.log('2FA:', security.value.twoFactorEnabled ? 'activé' : 'désactivé')
}

const manageSessions = () => {
  console.log('Gérer sessions')
}

const saveNotificationSettings = () => {
  console.log('Paramètres de notification sauvegardés')
}

// Gestion d'avatar
const triggerAvatarUpload = () => {
  document.querySelector('.file-input').click()
}

const handleAvatarDrop = (event) => {
  event.preventDefault()
  const file = event.dataTransfer.files[0]
  processAvatarFile(file)
}

const handleAvatarUpload = (event) => {
  const file = event.target.files[0]
  processAvatarFile(file)
}

const processAvatarFile = (file) => {
  if (!file) return

  if (!file.type.startsWith('image/')) {
    alert('Veuillez sélectionner une image valide')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('L\'image doit faire moins de 5MB')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    uploadedAvatar.value = e.target.result
    selectedAvatar.value = null
  }
  reader.readAsDataURL(file)
}

const selectDefaultAvatar = (avatarId) => {
  selectedAvatar.value = avatarId
  uploadedAvatar.value = null
}

const saveAvatar = () => {
  if (uploadedAvatar.value) {
    user.value.avatar = uploadedAvatar.value
  } else if (selectedAvatar.value) {
    const avatar = defaultAvatars.value.find(a => a.id === selectedAvatar.value)
    if (avatar) {
      user.value.avatar = avatar.url
    }
  }
  showAvatarModal.value = false
}

onMounted(() => {
  // Initialiser les données
  console.log('Profil chargé')
})
</script>

<style scoped>
.profile-view {
  min-height: 100vh;
  background: #f5f7fa;
}

/* En-tête de profil */
.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 60px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header-content {
  position: relative;
}

.cover-image {
  height: 300px;
  background-size: cover;
  background-position: center;
  border-radius: 0 0 24px 24px;
  position: relative;
  overflow: hidden;
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.cover-image:hover .cover-overlay {
  opacity: 1;
}

.btn-change-cover {
  padding: 12px 24px;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-change-cover:hover {
  background: rgba(255,255,255,0.3);
  border-color: rgba(255,255,255,0.5);
}

.profile-avatar-section {
  display: flex;
  align-items: flex-end;
  gap: 40px;
  margin-top: -80px;
  padding: 0 40px;
}

.avatar-container {
  position: relative;
  width: 160px;
  height: 160px;
  flex-shrink: 0;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 6px solid white;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s;
}

.profile-avatar:hover {
  transform: scale(1.05);
}

.avatar-status {
  position: absolute;
  bottom: 20px;
  right: 10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 3px solid white;
}

.avatar-status.online {
  background: #2ecc71;
}

.avatar-status.offline {
  background: #95a5a6;
}

.avatar-status.away {
  background: #f39c12;
}

.btn-change-avatar {
  position: absolute;
  bottom: 10px;
  right: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #3498db;
  color: white;
  border: 3px solid white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.3s;
}

.btn-change-avatar:hover {
  background: #2980b9;
  transform: scale(1.1);
}

.profile-basic-info {
  flex: 1;
  margin-bottom: 30px;
}

.name-verification {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.profile-name {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: white;
}

.verification-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.user-badges {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge.student {
  background: rgba(52, 152, 219, 0.2);
  color: #3498db;
}

.badge.teacher {
  background: rgba(243, 156, 18, 0.2);
  color: #f39c12;
}

.badge.admin {
  background: rgba(231, 76, 60, 0.2);
  color: #e74c3c;
}

.badge.premium {
  background: rgba(155, 89, 182, 0.2);
  color: #9b59b6;
}

.badge.instructor {
  background: rgba(46, 204, 113, 0.2);
  color: #2ecc71;
}

.profile-bio {
  margin: 0 0 25px 0;
  color: rgba(255,255,255,0.9);
  font-size: 16px;
  line-height: 1.6;
  max-width: 600px;
}

.profile-stats {
  display: flex;
  gap: 40px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.3s;
}

.stat-item:hover {
  transform: translateY(-3px);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: white;
}

.stat-label {
  font-size: 14px;
  color: rgba(255,255,255,0.7);
}

.profile-actions {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 30px;
}

.btn-follow,
.btn-secondary,
.btn-outline,
.btn-more {
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-follow {
  background: #3498db;
  color: white;
  border: 2px solid #3498db;
}

.btn-follow:hover {
  background: #2980b9;
  border-color: #2980b9;
}

.btn-follow.active {
  background: #2ecc71;
  border-color: #2ecc71;
}

.btn-secondary {
  background: rgba(255,255,255,0.1);
  color: white;
  border: 2px solid rgba(255,255,255,0.3);
}

.btn-secondary:hover {
  background: rgba(255,255,255,0.2);
  border-color: rgba(255,255,255,0.5);
}

.btn-outline {
  background: transparent;
  color: white;
  border: 2px solid rgba(255,255,255,0.3);
}

.btn-outline:hover {
  background: rgba(255,255,255,0.1);
  border-color: rgba(255,255,255,0.5);
}

.more-actions {
  position: relative;
}

.btn-more {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255,255,255,0.1);
  color: white;
  border: 2px solid rgba(255,255,255,0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.btn-more:hover {
  background: rgba(255,255,255,0.2);
  border-color: rgba(255,255,255,0.5);
}

.more-actions-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 10px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  min-width: 200px;
  z-index: 100;
  overflow: hidden;
}

.action-item {
  width: 100%;
  padding: 15px 20px;
  background: none;
  border: none;
  text-align: left;
  color: #2c3e50;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background 0.3s;
}

.action-item:hover {
  background: #f8f9fa;
}

.action-item i {
  color: #e74c3c;
}

/* Navigation */
.profile-navigation {
  background: white;
  border-bottom: 1px solid #e9ecef;
}

.nav-tabs {
  display: flex;
  gap: 10px;
  padding: 0;
  overflow-x: auto;
}

.nav-tab {
  padding: 20px 25px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  color: #6c757d;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-tab:hover {
  color: #3498db;
}

.nav-tab.active {
  color: #3498db;
  border-bottom-color: #3498db;
}

.tab-count {
  background: #e9ecef;
  color: #6c757d;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.nav-tab.active .tab-count {
  background: #3498db;
  color: white;
}

/* Contenu principal */
.profile-main {
  padding: 40px 0;
}

.profile-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 30px;
}

/* Sidebar */
.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.sidebar-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

/* Info personnelle */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-item {
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.info-item i {
  font-size: 18px;
  color: #3498db;
  margin-top: 2px;
}

.info-content {
  flex: 1;
}

.info-label {
  display: block;
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 4px;
}

.info-value {
  display: block;
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
}

.languages-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.language-tag {
  padding: 4px 10px;
  background: #e9ecef;
  color: #495057;
  font-size: 12px;
  border-radius: 15px;
}

/* Compétences */
.skills-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.skill-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skill-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skill-name {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
}

.skill-level {
  font-size: 12px;
  color: #6c757d;
}

.skill-progress {
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.skill-progress .progress-bar {
  height: 100%;
  background: #3498db;
  border-radius: 3px;
}

.btn-add-skill {
  width: 100%;
  padding: 12px;
  background: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  color: #6c757d;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-add-skill:hover {
  border-color: #3498db;
  color: #3498db;
}

/* Statistiques */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(52, 152, 219, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3498db;
  font-size: 20px;
}

.stat-details {
  display: flex;
  flex-direction: column;
}

.stat-details .stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
}

.stat-details .stat-label {
  font-size: 12px;
  color: #6c757d;
}

/* Badges */
.badges-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 15px;
  border-radius: 8px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s;
}

.badge-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.badge-item.legendary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.badge-item.epic {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.badge-item.rare {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.badge-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.badge-item.legendary .badge-icon {
  color: #f5576c;
}

.badge-item.epic .badge-icon {
  color: #764ba2;
}

.badge-item.rare .badge-icon {
  color: #4facfe;
}

.badge-name {
  font-size: 11px;
  font-weight: 600;
  color: white;
  text-align: center;
  line-height: 1.2;
}

/* Contenu principal */
.profile-main-content {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.tab-content {
  padding: 30px;
}

/* Activités */
.feed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.feed-header h3 {
  margin: 0;
  font-size: 20px;
  color: #2c3e50;
}

.feed-filters {
  display: flex;
  gap: 10px;
}

.feed-filters .filter-btn {
  padding: 8px 16px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  color: #6c757d;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.feed-filters .filter-btn:hover {
  border-color: #dee2e6;
}

.feed-filters .filter-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.activity-item {
  display: flex;
  gap: 20px;
  padding: 25px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #3498db;
}

.activity-avatar {
  flex-shrink: 0;
}

.avatar-image {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
}

.activity-content {
  flex: 1;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.activity-user {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.activity-time {
  font-size: 12px;
  color: #6c757d;
}

.activity-text {
  margin: 0 0 20px 0;
  color: #495057;
  line-height: 1.6;
}

.activity-course {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  margin-bottom: 20px;
}

.course-thumbnail {
  width: 100px;
  height: 70px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.course-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-info {
  flex: 1;
}

.course-info h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #2c3e50;
}

.course-info p {
  margin: 0 0 15px 0;
  font-size: 12px;
  color: #6c757d;
  line-height: 1.4;
}

.course-progress {
  display: flex;
  align-items: center;
  gap: 15px;
}

.course-progress .progress-bar {
  flex: 1;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.course-progress .progress-fill {
  height: 100%;
  background: #2ecc71;
  border-radius: 3px;
}

.progress-text {
  font-size: 12px;
  color: #6c757d;
  font-weight: 600;
  min-width: 40px;
}

.activity-actions {
  display: flex;
  gap: 20px;
}

.activity-actions .action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  color: #6c757d;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.activity-actions .action-btn:hover {
  border-color: #3498db;
  color: #3498db;
}

.activity-actions .action-btn i {
  font-size: 16px;
}

/* Cours */
.courses-section .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.courses-section h3 {
  margin: 0;
  font-size: 20px;
  color: #2c3e50;
}

.course-filters {
  display: flex;
  gap: 10px;
}

.course-filters .filter-btn {
  padding: 8px 16px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  color: #6c757d;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.course-filters .filter-btn:hover {
  border-color: #dee2e6;
}

.course-filters .filter-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.filter-count {
  background: rgba(0,0,0,0.1);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
}

.course-filters .filter-btn.active .filter-count {
  background: rgba(255,255,255,0.2);
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.course-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  transition: all 0.3s;
  border: 1px solid #e9ecef;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.course-thumbnail {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.course-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.course-card:hover .course-thumbnail img {
  transform: scale(1.05);
}

.course-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.course-badge.completed {
  background: #2ecc71;
  color: white;
}

.course-badge.in-progress {
  background: #3498db;
  color: white;
}

.course-badge.not-started {
  background: #95a5a6;
  color: white;
}

.course-actions {
  position: absolute;
  top: 15px;
  left: 15px;
}

.course-actions .action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0,0,0,0.7);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.course-actions .action-btn:hover {
  background: #e74c3c;
  transform: scale(1.1);
}

.course-actions .action-btn.active {
  background: #e74c3c;
}

.course-info {
  padding: 25px;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.course-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.4;
}

.course-category {
  padding: 4px 10px;
  background: #e9ecef;
  color: #6c757d;
  font-size: 10px;
  border-radius: 15px;
  font-weight: 600;
}

.course-description {
  margin: 0 0 20px 0;
  color: #6c757d;
  font-size: 14px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-progress {
  margin-bottom: 25px;
}

.course-progress .progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.course-progress .progress-info span:first-child {
  font-size: 12px;
  color: #6c757d;
}

.course-progress .progress-info span:last-child {
  font-weight: 600;
  color: #3498db;
}

.course-progress .progress-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.course-progress .progress-fill {
  height: 100%;
  background: #3498db;
  border-radius: 4px;
  transition: width 1s ease-in-out;
}

.course-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.instructor-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.instructor-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.instructor-name {
  font-size: 12px;
  color: #6c757d;
  font-weight: 600;
}

.course-actions .btn-primary {
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: 2px solid #3498db;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.course-actions .btn-primary:hover {
  background: #2980b9;
  border-color: #2980b9;
}

/* Certificats */
.certificates-section .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.certificates-section h3 {
  margin: 0;
  font-size: 20px;
  color: #2c3e50;
}

.certificates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

.certificate-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  border: 1px solid #e9ecef;
}

.certificate-header {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 25px;
  border-bottom: 1px solid #e9ecef;
}

.certificate-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.certificate-info {
  flex: 1;
}

.certificate-info h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #2c3e50;
}

.certificate-date {
  font-size: 12px;
  color: #6c757d;
}

.btn-more {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  color: #6c757d;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-more:hover {
  border-color: #3498db;
  color: #3498db;
}

.certificate-body {
  padding: 30px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.certificate-preview {
  background: white;
  border-radius: 8px;
  padding: 30px;
  border: 2px dashed #dee2e6;
}

.preview-content {
  text-align: center;
}

.certificate-logo {
  margin-bottom: 20px;
}

.certificate-logo i {
  font-size: 48px;
  color: #3498db;
}

.certificate-title {
  margin: 0 0 15px 0;
  font-size: 24px;
  color: #2c3e50;
  font-weight: 700;
}

.certificate-text {
  margin: 0 0 25px 0;
  color: #495057;
  line-height: 1.6;
}

.certificate-details {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 30px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.detail-label {
  font-size: 12px;
  color: #6c757d;
}

.detail-value {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
}

.certificate-footer {
  display: flex;
  gap: 15px;
  padding: 25px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.certificate-footer .btn-primary,
.certificate-footer .btn-outline {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.certificate-footer .btn-primary {
  background: #3498db;
  color: white;
  border: 2px solid #3498db;
}

.certificate-footer .btn-primary:hover {
  background: #2980b9;
  border-color: #2980b9;
}

.certificate-footer .btn-outline {
  background: white;
  color: #3498db;
  border: 2px solid #3498db;
}

.certificate-footer .btn-outline:hover {
  background: #3498db;
  color: white;
}

/* Projets */
.projects-section .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.projects-section h3 {
  margin: 0;
  font-size: 20px;
  color: #2c3e50;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.project-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  border: 1px solid #e9ecef;
  transition: all 0.3s;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.project-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.project-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.project-status.completed {
  background: #d4edda;
  color: #155724;
}

.project-status.in-progress {
  background: #fff3cd;
  color: #856404;
}

.project-status.planned {
  background: #e2e3e5;
  color: #383d41;
}

.project-description {
  margin: 0 0 20px 0;
  color: #6c757d;
  font-size: 14px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.tech-tag {
  padding: 4px 10px;
  background: #e9ecef;
  color: #495057;
  font-size: 11px;
  border-radius: 15px;
}

.project-progress {
  margin-bottom: 25px;
}

.project-progress .progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.project-progress .progress-info span:first-child {
  font-size: 12px;
  color: #6c757d;
}

.project-progress .progress-info span:last-child {
  font-weight: 600;
  color: #3498db;
}

.project-progress .progress-bar {
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.project-progress .progress-fill {
  height: 100%;
  background: #3498db;
  border-radius: 3px;
}

.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-meta {
  display: flex;
  gap: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6c757d;
}

.project-actions {
  display: flex;
  gap: 10px;
}

.project-actions .btn-outline {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: white;
  border: 2px solid #e9ecef;
  color: #6c757d;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.project-actions .btn-outline:hover {
  border-color: #3498db;
  color: #3498db;
}

.project-actions .btn-outline:last-child:hover {
  border-color: #e74c3c;
  color: #e74c3c;
}

/* Paramètres */
.settings-section {
  max-width: 800px;
}

.settings-header {
  margin-bottom: 40px;
}

.settings-header h3 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #2c3e50;
}

.settings-header p {
  margin: 0;
  color: #6c757d;
  font-size: 16px;
}

.settings-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e9ecef;
  overflow-x: auto;
}

.settings-tab {
  padding: 15px 25px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  color: #6c757d;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 10px;
}

.settings-tab:hover {
  color: #3498db;
}

.settings-tab.active {
  color: #3498db;
  border-bottom-color: #3498db;
}

.settings-content {
  padding: 30px;
  background: #f8f9fa;
  border-radius: 12px;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 14px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  color: #2c3e50;
  transition: all 0.3s;
  background: white;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  margin-bottom: 15px;
  border: 1px solid #e9ecef;
}

.security-info h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #2c3e50;
}

.security-info p {
  margin: 0;
  font-size: 14px;
  color: #6c757d;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #2ecc71;
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.notification-category {
  margin-bottom: 30px;
  padding: 25px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.notification-category h4 {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #2c3e50;
}

.notification-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  color: #495057;
  font-size: 14px;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #dee2e6;
  border-radius: 4px;
  position: relative;
  transition: all 0.3s;
  flex-shrink: 0;
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

/* Modal avatar */
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
  max-width: 500px;
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

.avatar-options {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.option-upload {
  margin-bottom: 20px;
}

.upload-area {
  border: 2px dashed #dee2e6;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #f8f9fa;
}

.upload-area:hover {
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

.file-info {
  font-size: 12px;
  color: #adb5bd;
}

.option-gallery h4 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 16px;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.gallery-item {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 4px solid transparent;
  transition: all 0.3s;
}

.gallery-item:hover {
  transform: scale(1.05);
}

.gallery-item.selected {
  border-color: #3498db;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Responsive */
@media (max-width: 992px) {
  .profile-content {
    grid-template-columns: 1fr;
  }

  .profile-avatar-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    margin-top: -60px;
    padding: 0 20px;
  }

  .avatar-container {
    align-self: center;
  }

  .profile-basic-info {
    margin-bottom: 20px;
  }

  .profile-actions {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .cover-image {
    height: 200px;
  }

  .avatar-container {
    width: 120px;
    height: 120px;
  }

  .profile-name {
    font-size: 24px;
  }

  .profile-stats {
    flex-wrap: wrap;
    gap: 20px;
  }

  .nav-tab {
    padding: 15px 20px;
  }

  .courses-grid,
  .certificates-grid,
  .projects-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .feed-header,
  .courses-section .section-header,
  .certificates-section .section-header,
  .projects-section .section-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .feed-filters,
  .course-filters {
    flex-wrap: wrap;
  }

  .profile-actions {
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .activity-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .activity-course {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .course-thumbnail {
    width: 100%;
    height: 150px;
  }

  .certificate-details {
    flex-direction: column;
    gap: 20px;
  }

  .certificate-footer {
    flex-direction: column;
  }
}
</style>