<template>
  <div class="video-list-view">
    <!-- En-tête -->
    <div class="video-header">
      <div class="container">
        <nav class="breadcrumb-nav">
          <ol class="breadcrumb">
            <li class="breadcrumb-item">
              <router-link to="/courses">Cours</router-link>
            </li>
            <li class="breadcrumb-item">
              <router-link :to="`/courses/${course.id}`">{{ course.title }}</router-link>
            </li>
            <li class="breadcrumb-item active">Vidéos</li>
          </ol>
        </nav>

        <div class="header-content">
          <div class="header-left">
            <h1 class="page-title">Vidéos du cours</h1>
            <p class="page-subtitle">{{ totalVideos }} vidéos disponibles • {{ totalDuration }} de contenu</p>
          </div>

          <div class="header-right">
            <div class="progress-summary">
              <div class="progress-ring">
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle
                      cx="40"
                      cy="40"
                      r="36"
                      fill="none"
                      stroke="rgba(255,255,255,0.2)"
                      stroke-width="8"
                  />
                  <circle
                      cx="40"
                      cy="40"
                      r="36"
                      fill="none"
                      stroke="#2ecc71"
                      stroke-width="8"
                      :stroke-dasharray="watchProgressCircumference"
                      :stroke-dashoffset="watchProgressOffset"
                      stroke-linecap="round"
                      transform="rotate(-90 40 40)"
                  />
                </svg>
                <div class="progress-text">
                  <span class="progress-percent">{{ watchProgress }}%</span>
                </div>
              </div>
              <div class="progress-details">
                <div class="progress-stat">
                  <span class="stat-value">{{ watchedVideos }}</span>
                  <span class="stat-label">Regardées</span>
                </div>
                <div class="progress-stat">
                  <span class="stat-value">{{ totalVideos - watchedVideos }}</span>
                  <span class="stat-label">À regarder</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="video-container">
      <!-- Barre latérale de filtres -->
      <div class="video-sidebar">
        <div class="sidebar-section">
          <h3 class="section-title">Filtres</h3>
          <div class="filters">
            <button
                v-for="filter in videoFilters"
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
          <h3 class="section-title">Playlists</h3>
          <div class="playlists">
            <div
                v-for="playlist in playlists"
                :key="playlist.id"
                class="playlist-item"
                :class="{ active: activePlaylist === playlist.id }"
                @click="selectPlaylist(playlist.id)"
            >
              <div class="playlist-cover">
                <img
                    :src="playlist.thumbnail"
                    :alt="playlist.title"
                    class="cover-image"
                >
                <div class="playlist-count">
                  <i class="icon-play"></i>
                  {{ playlist.videoCount }}
                </div>
              </div>
              <div class="playlist-info">
                <h4>{{ playlist.title }}</h4>
                <p>{{ playlist.description }}</p>
                <div class="playlist-progress">
                  <div class="progress-bar">
                    <div
                        class="progress-fill"
                        :style="{ width: playlist.progress + '%' }"
                    ></div>
                  </div>
                  <span class="progress-text">{{ playlist.progress }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="sidebar-section">
          <h3 class="section-title">Téléchargements</h3>
          <div class="downloads-info">
            <div class="download-stats">
              <i class="icon-download"></i>
              <div class="stats-text">
                <span class="stat-value">{{ downloadedVideos }}</span>
                <span class="stat-label">Vidéos téléchargées</span>
              </div>
            </div>
            <button class="btn-download-all" @click="downloadAllVideos" :disabled="isDownloading">
              <i class="icon-download"></i>
              {{ isDownloading ? 'Téléchargement...' : 'Tout télécharger' }}
            </button>
            <div class="storage-info">
              <div class="storage-progress">
                <div class="progress-bar">
                  <div
                      class="progress-fill"
                      :style="{ width: storageUsage + '%' }"
                  ></div>
                </div>
                <div class="storage-text">
                  <span>{{ usedStorage }}/{{ totalStorage }}</span>
                  <span>{{ storageUsage }}% utilisé</span>
                </div>
              </div>
              <button class="btn-clear-storage" @click="clearDownloads">
                <i class="icon-trash"></i>
                Effacer
              </button>
            </div>
          </div>
        </div>

        <div class="sidebar-section">
          <h3 class="section-title">Historique récent</h3>
          <div class="recent-history">
            <div
                v-for="item in recentHistory"
                :key="item.id"
                class="history-item"
                @click="playVideo(item.videoId)"
            >
              <div class="history-thumbnail">
                <img
                    :src="item.thumbnail"
                    :alt="item.title"
                    class="thumbnail-image"
                >
                <div class="history-progress">
                  <div
                      class="progress-indicator"
                      :style="{ width: item.progress + '%' }"
                  ></div>
                </div>
                <div class="play-overlay">
                  <i class="icon-play"></i>
                </div>
              </div>
              <div class="history-info">
                <h4>{{ item.title }}</h4>
                <div class="history-meta">
                  <span class="meta-item">
                    <i class="icon-clock"></i>
                    {{ formatDuration(item.watchTime) }}
                  </span>
                  <span class="meta-item">
                    <i class="icon-calendar"></i>
                    {{ formatDate(item.watchDate) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenu principal -->
      <div class="video-main">
        <!-- En-tête des vidéos -->
        <div class="videos-header">
          <div class="header-left">
            <h2 class="section-title">
              {{ activePlaylist ? playlists.find(p => p.id === activePlaylist)?.title : 'Toutes les vidéos' }}
            </h2>
            <div class="search-box">
              <i class="icon-search"></i>
              <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Rechercher une vidéo..."
                  class="search-input"
              >
            </div>
          </div>
          <div class="header-right">
            <div class="view-options">
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

        <!-- Liste/Grille des vidéos -->
        <div
            class="videos-container"
            :class="[viewMode, { 'has-playlist': activePlaylist }]"
        >
          <!-- Vue grille -->
          <div v-if="viewMode === 'grid'" class="videos-grid">
            <div
                v-for="video in filteredVideos"
                :key="video.id"
                class="video-card"
                @click="playVideo(video.id)"
            >
              <div class="video-thumbnail">
                <img
                    :src="video.thumbnail"
                    :alt="video.title"
                    class="thumbnail-image"
                >
                <div class="video-duration">
                  {{ formatVideoDuration(video.duration) }}
                </div>
                <div class="video-progress" v-if="video.progress > 0">
                  <div
                      class="progress-bar"
                      :style="{ width: video.progress + '%' }"
                  ></div>
                </div>
                <div class="video-actions">
                  <button
                      class="action-btn"
                      @click.stop="toggleFavorite(video.id)"
                      :class="{ active: video.isFavorite }"
                      title="Ajouter aux favoris"
                  >
                    <i :class="video.isFavorite ? 'icon-heart-filled' : 'icon-heart'"></i>
                  </button>
                  <button
                      class="action-btn"
                      @click.stop="toggleDownload(video.id)"
                      :class="{ active: video.isDownloaded }"
                      title="Télécharger"
                  >
                    <i :class="video.isDownloaded ? 'icon-downloaded' : 'icon-download'"></i>
                  </button>
                  <button
                      class="action-btn"
                      @click.stop="toggleWatched(video.id)"
                      :class="{ active: video.isWatched }"
                      title="Marquer comme regardé"
                  >
                    <i :class="video.isWatched ? 'icon-eye-filled' : 'icon-eye'"></i>
                  </button>
                </div>
                <div class="play-overlay">
                  <i class="icon-play"></i>
                </div>
              </div>

              <div class="video-info">
                <div class="video-header">
                  <h3 class="video-title">{{ video.title }}</h3>
                  <span class="video-badge" :class="video.difficulty">
                    {{ getDifficultyText(video.difficulty) }}
                  </span>
                </div>

                <div class="video-meta">
                  <span class="meta-item">
                    <i class="icon-clock"></i>
                    {{ formatVideoDuration(video.duration) }}
                  </span>
                  <span class="meta-item">
                    <i class="icon-calendar"></i>
                    {{ formatDate(video.publishedDate) }}
                  </span>
                  <span class="meta-item">
                    <i class="icon-eye"></i>
                    {{ video.views }} vues
                  </span>
                </div>

                <p class="video-description">{{ video.description }}</p>

                <div class="video-tags">
                  <span
                      v-for="tag in video.tags"
                      :key="tag"
                      class="tag"
                  >
                    {{ tag }}
                  </span>
                </div>

                <div class="video-footer">
                  <div class="instructor-info">
                    <img
                        :src="video.instructor.avatar"
                        :alt="video.instructor.name"
                        class="instructor-avatar"
                    >
                    <span class="instructor-name">{{ video.instructor.name }}</span>
                  </div>
                  <div class="video-stats">
                    <span class="stat-item">
                      <i class="icon-thumbs-up"></i>
                      {{ video.likes }}
                    </span>
                    <span class="stat-item">
                      <i class="icon-message"></i>
                      {{ video.comments }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Vue liste -->
          <div v-if="viewMode === 'list'" class="videos-list">
            <div
                v-for="video in filteredVideos"
                :key="video.id"
                class="video-list-item"
                @click="playVideo(video.id)"
            >
              <div class="list-thumbnail">
                <img
                    :src="video.thumbnail"
                    :alt="video.title"
                    class="thumbnail-image"
                >
                <div class="video-duration">
                  {{ formatVideoDuration(video.duration) }}
                </div>
                <div class="video-progress" v-if="video.progress > 0">
                  <div
                      class="progress-bar"
                      :style="{ width: video.progress + '%' }"
                  ></div>
                </div>
                <div class="play-overlay">
                  <i class="icon-play"></i>
                </div>
              </div>

              <div class="list-content">
                <div class="content-header">
                  <div class="header-left">
                    <h3 class="video-title">{{ video.title }}</h3>
                    <div class="video-meta">
                      <span class="meta-item">
                        <i class="icon-clock"></i>
                        {{ formatVideoDuration(video.duration) }}
                      </span>
                      <span class="meta-item">
                        <i class="icon-calendar"></i>
                        {{ formatDate(video.publishedDate) }}
                      </span>
                      <span class="meta-item">
                        <i class="icon-eye"></i>
                        {{ video.views }} vues
                      </span>
                      <span class="meta-item">
                        <i class="icon-thumbs-up"></i>
                        {{ video.likes }}
                      </span>
                    </div>
                  </div>
                  <div class="header-right">
                    <button
                        class="action-btn"
                        @click.stop="toggleFavorite(video.id)"
                        :class="{ active: video.isFavorite }"
                        title="Ajouter aux favoris"
                    >
                      <i :class="video.isFavorite ? 'icon-heart-filled' : 'icon-heart'"></i>
                    </button>
                    <button
                        class="action-btn"
                        @click.stop="toggleDownload(video.id)"
                        :class="{ active: video.isDownloaded }"
                        title="Télécharger"
                    >
                      <i :class="video.isDownloaded ? 'icon-downloaded' : 'icon-download'"></i>
                    </button>
                    <button
                        class="action-btn"
                        @click.stop="toggleWatched(video.id)"
                        :class="{ active: video.isWatched }"
                        title="Marquer comme regardé"
                    >
                      <i :class="video.isWatched ? 'icon-eye-filled' : 'icon-eye'"></i>
                    </button>
                  </div>
                </div>

                <p class="video-description">{{ video.description }}</p>

                <div class="content-footer">
                  <div class="instructor-info">
                    <img
                        :src="video.instructor.avatar"
                        :alt="video.instructor.name"
                        class="instructor-avatar"
                    >
                    <span class="instructor-name">{{ video.instructor.name }}</span>
                  </div>

                  <div class="video-tags">
                    <span
                        v-for="tag in video.tags"
                        :key="tag"
                        class="tag"
                    >
                      {{ tag }}
                    </span>
                  </div>

                  <div class="video-badge" :class="video.difficulty">
                    {{ getDifficultyText(video.difficulty) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Aucun résultat -->
          <div v-if="filteredVideos.length === 0" class="no-results">
            <i class="icon-search-large"></i>
            <h3>Aucune vidéo trouvée</h3>
            <p>Aucune vidéo ne correspond à vos critères de recherche ou de filtre.</p>
            <button class="btn-primary" @click="resetFilters">
              <i class="icon-refresh"></i>
              Réinitialiser les filtres
            </button>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="filteredVideos.length > 0" class="pagination">
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

    <!-- Lecteur vidéo -->
    <div class="video-player" v-if="showPlayer">
      <div class="player-header">
        <div class="header-left">
          <h3 class="player-title">{{ currentVideo?.title }}</h3>
          <button class="btn-close-player" @click="closePlayer">
            <i class="icon-close"></i>
            Fermer
          </button>
        </div>
        <div class="header-right">
          <button
              class="player-btn"
              @click="toggleFavorite(currentVideo?.id)"
              :class="{ active: currentVideo?.isFavorite }"
              title="Ajouter aux favoris"
          >
            <i :class="currentVideo?.isFavorite ? 'icon-heart-filled' : 'icon-heart'"></i>
          </button>
          <button
              class="player-btn"
              @click="toggleDownload(currentVideo?.id)"
              :class="{ active: currentVideo?.isDownloaded }"
              title="Télécharger"
          >
            <i :class="currentVideo?.isDownloaded ? 'icon-downloaded' : 'icon-download'"></i>
          </button>
          <button class="player-btn" @click="toggleFullscreen" title="Plein écran">
            <i :class="isFullscreen ? 'icon-fullscreen-exit' : 'icon-fullscreen'"></i>
          </button>
        </div>
      </div>

      <div class="player-container" ref="playerContainer">
        <div class="player-wrapper">
          <!-- Lecteur vidéo simulé -->
          <div class="video-placeholder" v-if="!isVideoLoaded">
            <div class="placeholder-content">
              <i class="icon-play"></i>
              <p>Chargement de la vidéo...</p>
            </div>
          </div>

          <!-- Contrôles du lecteur -->
          <div class="player-controls">
            <div class="controls-top">
              <div class="playback-info">
                <span class="current-time">{{ currentTime }}</span>
                <span class="duration">{{ formatVideoDuration(currentVideo?.duration || 0) }}</span>
              </div>
              <div class="playback-speed">
                <button class="speed-btn" @click="changePlaybackSpeed">
                  {{ playbackSpeed }}x
                </button>
              </div>
            </div>

            <div class="progress-bar">
              <div
                  class="progress-fill"
                  :style="{ width: progressPercentage + '%' }"
                  @click="seekTo"
              ></div>
              <div
                  class="progress-handle"
                  :style="{ left: progressPercentage + '%' }"
                  @mousedown="startSeeking"
              ></div>
            </div>

            <div class="controls-bottom">
              <div class="controls-left">
                <button class="control-btn" @click="togglePlay">
                  <i :class="isPlaying ? 'icon-pause' : 'icon-play'"></i>
                </button>
                <button class="control-btn" @click="skipBackward">
                  <i class="icon-rewind"></i>
                  10s
                </button>
                <button class="control-btn" @click="skipForward">
                  <i class="icon-forward"></i>
                  10s
                </button>
                <div class="volume-control">
                  <button class="volume-btn" @click="toggleMute">
                    <i :class="volumeIcon"></i>
                  </button>
                  <input
                      type="range"
                      v-model="volume"
                      min="0"
                      max="100"
                      class="volume-slider"
                      @input="changeVolume"
                  >
                </div>
              </div>

              <div class="controls-center">
                <button
                    class="control-btn"
                    @click="toggleSubtitles"
                    :class="{ active: showSubtitles }"
                    title="Sous-titres"
                >
                  <i class="icon-subtitles"></i>
                </button>
                <button
                    class="control-btn"
                    @click="toggleQuality"
                    title="Qualité"
                >
                  <i class="icon-quality"></i>
                  {{ currentQuality }}
                </button>
                <button
                    class="control-btn"
                    @click="togglePlaylist"
                    title="Playlist"
                >
                  <i class="icon-playlist"></i>
                </button>
              </div>

              <div class="controls-right">
                <button
                    class="control-btn"
                    @click="previousVideo"
                    :disabled="!hasPreviousVideo"
                    title="Vidéo précédente"
                >
                  <i class="icon-chevron-left"></i>
                </button>
                <button
                    class="control-btn"
                    @click="nextVideo"
                    :disabled="!hasNextVideo"
                    title="Vidéo suivante"
                >
                  <i class="icon-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Informations vidéo -->
        <div class="video-details">
          <div class="details-header">
            <div class="video-info">
              <h4>{{ currentVideo?.title }}</h4>
              <div class="video-stats">
                <span class="stat-item">
                  <i class="icon-eye"></i>
                  {{ currentVideo?.views }} vues
                </span>
                <span class="stat-item">
                  <i class="icon-calendar"></i>
                  {{ formatDate(currentVideo?.publishedDate) }}
                </span>
                <span class="stat-item">
                  <i class="icon-thumbs-up"></i>
                  {{ currentVideo?.likes }} j'aime
                </span>
              </div>
            </div>
            <button
                class="btn-mark-watched"
                @click="toggleWatched(currentVideo?.id)"
                :class="{ active: currentVideo?.isWatched }"
            >
              <i :class="currentVideo?.isWatched ? 'icon-check-circle' : 'icon-circle'"></i>
              {{ currentVideo?.isWatched ? 'Regardée' : 'Marquer comme regardée' }}
            </button>
          </div>

          <div class="video-description">
            <p>{{ currentVideo?.description }}</p>
          </div>

          <div class="video-tags">
            <span
                v-for="tag in currentVideo?.tags"
                :key="tag"
                class="tag"
            >
              {{ tag }}
            </span>
          </div>

          <div class="instructor-card">
            <img
                :src="currentVideo?.instructor.avatar"
                :alt="currentVideo?.instructor.name"
                class="instructor-avatar"
            >
            <div class="instructor-info">
              <h5>{{ currentVideo?.instructor.name }}</h5>
              <p>{{ currentVideo?.instructor.title }}</p>
              <p class="instructor-bio">{{ currentVideo?.instructor.bio }}</p>
            </div>
            <button class="btn-follow" @click="toggleFollow">
              <i :class="isFollowing ? 'icon-user-check' : 'icon-user-plus'"></i>
              {{ isFollowing ? 'Suivi' : 'Suivre' }}
            </button>
          </div>
        </div>

        <!-- Sous-titres -->
        <div v-if="showSubtitles" class="subtitles-container">
          <div class="subtitles-text" v-if="currentSubtitle">
            {{ currentSubtitle.text }}
          </div>
        </div>

        <!-- Playlist dans le lecteur -->
        <div v-if="showPlaylistInPlayer" class="player-playlist">
          <div class="playlist-header">
            <h4>Playlist</h4>
            <button class="btn-close-playlist" @click="togglePlaylist">
              <i class="icon-close"></i>
            </button>
          </div>
          <div class="playlist-items">
            <div
                v-for="video in playlistVideos"
                :key="video.id"
                class="playlist-item"
                :class="{ active: video.id === currentVideo?.id }"
                @click="playVideo(video.id)"
            >
              <div class="item-thumbnail">
                <img
                    :src="video.thumbnail"
                    :alt="video.title"
                    class="thumbnail-image"
                >
                <div class="video-duration">
                  {{ formatVideoDuration(video.duration) }}
                </div>
              </div>
              <div class="item-info">
                <h5>{{ video.title }}</h5>
                <div class="item-meta">
                  <span>{{ formatVideoDuration(video.duration) }}</span>
                  <span v-if="video.progress > 0">{{ video.progress }}% regardé</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Menu qualité -->
    <div v-if="showQualityMenu" class="quality-menu">
      <div class="menu-header">
        <h4>Qualité vidéo</h4>
        <button class="btn-close-menu" @click="showQualityMenu = false">
          <i class="icon-close"></i>
        </button>
      </div>
      <div class="menu-options">
        <button
            v-for="quality in qualityOptions"
            :key="quality"
            class="quality-option"
            :class="{ active: currentQuality === quality }"
            @click="changeQuality(quality)"
        >
          {{ quality }}
          <i v-if="currentQuality === quality" class="icon-check"></i>
        </button>
      </div>
    </div>

    <!-- Menu de vitesse -->
    <div v-if="showSpeedMenu" class="speed-menu">
      <div class="menu-header">
        <h4>Vitesse de lecture</h4>
        <button class="btn-close-menu" @click="showSpeedMenu = false">
          <i class="icon-close"></i>
        </button>
      </div>
      <div class="menu-options">
        <button
            v-for="speed in speedOptions"
            :key="speed"
            class="speed-option"
            :class="{ active: playbackSpeed === speed }"
            @click="changePlaybackSpeed(speed)"
        >
          {{ speed }}x
          <i v-if="playbackSpeed === speed" class="icon-check"></i>
        </button>
      </div>
    </div>

    <!-- Notification de téléchargement -->
    <div class="notification" v-if="showDownloadNotification">
      <div class="notification-content info">
        <i class="icon-download"></i>
        <div class="notification-text">
          <h4>Téléchargement en cours</h4>
          <p>Téléchargement de {{ downloadingVideo?.title }}... {{ downloadProgress }}%</p>
        </div>
        <button class="btn-dismiss" @click="cancelDownload">
          <i class="icon-close"></i>
        </button>
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
const activePlaylist = ref(null)
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 12
const currentSort = ref({ value: 'date', label: 'Date d\'ajout' })
const showSortMenu = ref(false)
const viewMode = ref('grid')
const showPlayer = ref(false)
const showPlaylistInPlayer = ref(false)
const showQualityMenu = ref(false)
const showSpeedMenu = ref(false)
const showDownloadNotification = ref(false)

// États du lecteur
const currentVideo = ref(null)
const isVideoLoaded = ref(false)
const isPlaying = ref(false)
const isFullscreen = ref(false)
const currentTime = ref(0)
const progressPercentage = ref(0)
const volume = ref(80)
const isMuted = ref(false)
const playbackSpeed = ref(1)
const showSubtitles = ref(false)
const currentQuality = ref('1080p')
const isFollowing = ref(false)
const currentSubtitle = ref(null)

// États de téléchargement
const isDownloading = ref(false)
const downloadProgress = ref(0)
const downloadingVideo = ref(null)

// Données
const course = ref({
  id: 1,
  title: 'JavaScript Avancé'
})

// Filtres
const videoFilters = [
  { value: 'all', label: 'Toutes', icon: 'icon-all', count: 24 },
  { value: 'unwatched', label: 'Non regardées', icon: 'icon-eye', count: 8 },
  { value: 'watched', label: 'Regardées', icon: 'icon-eye-filled', count: 16 },
  { value: 'favorites', label: 'Favoris', icon: 'icon-heart', count: 5 },
  { value: 'downloaded', label: 'Téléchargées', icon: 'icon-download', count: 3 },
  { value: 'recent', label: 'Récentes', icon: 'icon-clock', count: 10 }
]

// Options de tri
const sortOptions = [
  { value: 'date', label: 'Date d\'ajout' },
  { value: 'title', label: 'Titre' },
  { value: 'duration', label: 'Durée' },
  { value: 'popularity', label: 'Popularité' },
  { value: 'difficulty', label: 'Difficulté' }
]

// Playlists
const playlists = ref([
  {
    id: 1,
    title: 'Introduction à JavaScript',
    description: 'Les bases de JavaScript pour débutants',
    thumbnail: '/images/playlist1.jpg',
    videoCount: 8,
    progress: 75
  },
  {
    id: 2,
    title: 'ES6+ Modern JavaScript',
    description: 'Les nouvelles fonctionnalités de JavaScript moderne',
    thumbnail: '/images/playlist2.jpg',
    videoCount: 12,
    progress: 50
  },
  {
    id: 3,
    title: 'Framework JavaScript',
    description: 'Apprendre React, Vue.js et Angular',
    thumbnail: '/images/playlist3.jpg',
    videoCount: 15,
    progress: 30
  },
  {
    id: 4,
    title: 'Projets pratiques',
    description: 'Projets complets pour mettre en pratique',
    thumbnail: '/images/playlist4.jpg',
    videoCount: 10,
    progress: 10
  }
])

// Historique récent
const recentHistory = ref([
  {
    id: 1,
    videoId: 1,
    title: 'Les Promises en JavaScript',
    thumbnail: '/images/video1.jpg',
    watchTime: 1800,
    watchDate: '2024-03-15',
    progress: 85
  },
  {
    id: 2,
    videoId: 2,
    title: 'Async/Await pour débutants',
    thumbnail: '/images/video2.jpg',
    watchTime: 1500,
    watchDate: '2024-03-14',
    progress: 100
  },
  {
    id: 3,
    videoId: 3,
    title: 'Les Design Patterns JavaScript',
    thumbnail: '/images/video3.jpg',
    watchTime: 2400,
    watchDate: '2024-03-13',
    progress: 60
  }
])

// Données des vidéos
const videos = ref([
  {
    id: 1,
    title: 'Les Promises en JavaScript - Guide Complet',
    description: 'Apprenez tout sur les Promises en JavaScript, de la théorie à la pratique. Cette vidéo couvre les concepts fondamentaux et les cas d\'utilisation avancés.',
    duration: 1860, // 31 minutes en secondes
    publishedDate: '2024-02-15',
    views: 15432,
    likes: 1254,
    comments: 89,
    difficulty: 'intermediate',
    tags: ['JavaScript', 'Promises', 'Asynchrone', 'API'],
    thumbnail: '/images/video1.jpg',
    instructor: {
      name: 'Dr. Jean Dupont',
      title: 'Expert en développement web',
      avatar: '/images/avatar1.jpg',
      bio: '15 ans d\'expérience en développement web. Spécialiste en JavaScript et architecture frontend.'
    },
    isFavorite: true,
    isDownloaded: false,
    isWatched: true,
    progress: 85,
    playlistIds: [1, 2]
  },
  {
    id: 2,
    title: 'Async/Await pour débutants',
    description: 'Découvrez la syntaxe async/await pour écrire du code asynchrone plus lisible et maintenable.',
    duration: 1500, // 25 minutes
    publishedDate: '2024-02-10',
    views: 23456,
    likes: 1876,
    comments: 124,
    difficulty: 'beginner',
    tags: ['JavaScript', 'Async/Await', 'Asynchrone', 'ES8'],
    thumbnail: '/images/video2.jpg',
    instructor: {
      name: 'Dr. Jean Dupont',
      title: 'Expert en développement web',
      avatar: '/images/avatar1.jpg',
      bio: '15 ans d\'expérience en développement web. Spécialiste en JavaScript et architecture frontend.'
    },
    isFavorite: false,
    isDownloaded: true,
    isWatched: true,
    progress: 100,
    playlistIds: [1, 2]
  },
  {
    id: 3,
    title: 'Les Design Patterns JavaScript',
    description: 'Explorez les design patterns les plus utiles en JavaScript avec des exemples concrets.',
    duration: 2400, // 40 minutes
    publishedDate: '2024-02-05',
    views: 9876,
    likes: 876,
    comments: 45,
    difficulty: 'advanced',
    tags: ['JavaScript', 'Design Patterns', 'Architecture', 'Best Practices'],
    thumbnail: '/images/video3.jpg',
    instructor: {
      name: 'Amina Diallo',
      title: 'Architecte logiciel senior',
      avatar: '/images/avatar2.jpg',
      bio: 'Spécialiste en architecture logicielle et design patterns avec 10 ans d\'expérience.'
    },
    isFavorite: true,
    isDownloaded: false,
    isWatched: false,
    progress: 60,
    playlistIds: [2, 3]
  },
  {
    id: 4,
    title: 'Manipulation du DOM avec JavaScript',
    description: 'Apprenez à manipuler efficacement le DOM pour créer des interfaces interactives.',
    duration: 1800, // 30 minutes
    publishedDate: '2024-02-01',
    views: 18765,
    likes: 1456,
    comments: 67,
    difficulty: 'beginner',
    tags: ['JavaScript', 'DOM', 'Frontend', 'Web'],
    thumbnail: '/images/video4.jpg',
    instructor: {
      name: 'Dr. Jean Dupont',
      title: 'Expert en développement web',
      avatar: '/images/avatar1.jpg',
      bio: '15 ans d\'expérience en développement web. Spécialiste en JavaScript et architecture frontend.'
    },
    isFavorite: false,
    isDownloaded: false,
    isWatched: false,
    progress: 0,
    playlistIds: [1]
  },
  {
    id: 5,
    title: 'Web Workers et Multithreading',
    description: 'Découvrez comment utiliser les Web Workers pour exécuter du JavaScript en parallèle.',
    duration: 2100, // 35 minutes
    publishedDate: '2024-01-28',
    views: 8765,
    likes: 654,
    comments: 32,
    difficulty: 'advanced',
    tags: ['JavaScript', 'Web Workers', 'Performance', 'Multithreading'],
    thumbnail: '/images/video5.jpg',
    instructor: {
      name: 'Koffi Kouamé',
      title: 'Ingénieur performance web',
      avatar: '/images/avatar3.jpg',
      bio: 'Expert en optimisation des performances web et applications haute charge.'
    },
    isFavorite: false,
    isDownloaded: true,
    isWatched: true,
    progress: 100,
    playlistIds: [2, 4]
  }
])

// Options qualité
const qualityOptions = ['360p', '480p', '720p', '1080p', '4K']
const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

// Storage info
const downloadedVideos = ref(3)
const usedStorage = ref('1.2 GB')
const totalStorage = ref('5 GB')
const storageUsage = ref(24)

// Computed properties
const filteredVideos = computed(() => {
  let filtered = videos.value

  // Filtrer par playlist
  if (activePlaylist.value) {
    filtered = filtered.filter(video =>
        video.playlistIds?.includes(activePlaylist.value)
    )
  }

  // Filtre par statut
  switch (activeFilter.value) {
    case 'unwatched':
      filtered = filtered.filter(v => !v.isWatched)
      break
    case 'watched':
      filtered = filtered.filter(v => v.isWatched)
      break
    case 'favorites':
      filtered = filtered.filter(v => v.isFavorite)
      break
    case 'downloaded':
      filtered = filtered.filter(v => v.isDownloaded)
      break
    case 'recent':
      // Vidéos des 7 derniers jours
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      filtered = filtered.filter(v => new Date(v.publishedDate) > weekAgo)
      break
  }

  // Recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(query) ||
        video.description.toLowerCase().includes(query) ||
        video.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // Tri
  filtered = [...filtered].sort((a, b) => {
    switch (currentSort.value.value) {
      case 'date':
        return new Date(b.publishedDate) - new Date(a.publishedDate)
      case 'title':
        return a.title.localeCompare(b.title)
      case 'duration':
        return b.duration - a.duration
      case 'popularity':
        return b.views - a.views
      case 'difficulty':
        const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 }
        return difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty]
      default:
        return 0
    }
  })

  // Pagination
  const startIndex = (currentPage.value - 1) * itemsPerPage
  return filtered.slice(startIndex, startIndex + itemsPerPage)
})

const totalVideos = computed(() => videos.value.length)
const watchedVideos = computed(() =>
    videos.value.filter(v => v.isWatched).length
)

const watchProgress = computed(() => {
  const totalDuration = videos.value.reduce((sum, v) => sum + v.duration, 0)
  const watchedDuration = videos.value.reduce((sum, v) =>
      sum + (v.duration * (v.progress || 0) / 100), 0
  )
  return Math.round((watchedDuration / totalDuration) * 100)
})

const totalDuration = computed(() => {
  const totalSeconds = videos.value.reduce((sum, v) => sum + v.duration, 0)
  return formatTotalDuration(totalSeconds)
})

const watchProgressCircumference = computed(() => 2 * Math.PI * 36)
const watchProgressOffset = computed(() =>
    watchProgressCircumference.value - (watchProgress.value / 100) * watchProgressCircumference.value
)

const volumeIcon = computed(() => {
  if (isMuted.value || volume.value === 0) return 'icon-volume-off'
  if (volume.value < 30) return 'icon-volume-low'
  if (volume.value < 70) return 'icon-volume-medium'
  return 'icon-volume-high'
})

const playlistVideos = computed(() => {
  if (activePlaylist.value) {
    return videos.value.filter(v => v.playlistIds?.includes(activePlaylist.value))
  }
  return filteredVideos.value
})

const hasPreviousVideo = computed(() => {
  if (!currentVideo.value || !activePlaylist.value) return false
  const currentIndex = playlistVideos.value.findIndex(v => v.id === currentVideo.value.id)
  return currentIndex > 0
})

const hasNextVideo = computed(() => {
  if (!currentVideo.value || !activePlaylist.value) return false
  const currentIndex = playlistVideos.value.findIndex(v => v.id === currentVideo.value.id)
  return currentIndex < playlistVideos.value.length - 1
})

const totalPages = computed(() =>
    Math.ceil(videos.value.length / itemsPerPage)
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

// Méthodes utilitaires
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

const formatTotalDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes} minutes`
}

const formatVideoDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

const getDifficultyText = (difficulty) => {
  const texts = {
    'beginner': 'Débutant',
    'intermediate': 'Intermédiaire',
    'advanced': 'Avancé'
  }
  return texts[difficulty] || difficulty
}

// Actions sur les vidéos
const playVideo = (videoId) => {
  currentVideo.value = videos.value.find(v => v.id === videoId)
  showPlayer.value = true
  isVideoLoaded.value = true
  isPlaying.value = true

  // Simuler la lecture
  simulatePlayback()
}

const closePlayer = () => {
  showPlayer.value = false
  isPlaying.value = false
  currentVideo.value = null
  isVideoLoaded.value = false
  currentTime.value = 0
  progressPercentage.value = 0
}

const toggleFavorite = (videoId) => {
  const video = videos.value.find(v => v.id === videoId)
  if (video) {
    video.isFavorite = !video.isFavorite
  }
}

const toggleDownload = (videoId) => {
  const video = videos.value.find(v => v.id === videoId)
  if (!video) return

  if (video.isDownloaded) {
    // Supprimer le téléchargement
    video.isDownloaded = false
    downloadedVideos.value--
  } else {
    // Simuler le téléchargement
    downloadingVideo.value = video
    showDownloadNotification.value = true
    downloadProgress.value = 0

    isDownloading.value = true
    const interval = setInterval(() => {
      downloadProgress.value += 10
      if (downloadProgress.value >= 100) {
        clearInterval(interval)
        video.isDownloaded = true
        downloadedVideos.value++
        showDownloadNotification.value = false
        isDownloading.value = false
        downloadingVideo.value = null
      }
    }, 300)
  }
}

const cancelDownload = () => {
  showDownloadNotification.value = false
  isDownloading.value = false
  downloadingVideo.value = null
  downloadProgress.value = 0
}

const toggleWatched = (videoId) => {
  const video = videos.value.find(v => v.id === videoId)
  if (video) {
    video.isWatched = !video.isWatched
    if (video.isWatched && video.progress < 100) {
      video.progress = 100
    }
  }
}

const downloadAllVideos = () => {
  if (isDownloading.value) return

  const unwatchedVideos = videos.value.filter(v => !v.isDownloaded)
  if (unwatchedVideos.length === 0) {
    alert('Toutes les vidéos sont déjà téléchargées.')
    return
  }

  isDownloading.value = true
  showDownloadNotification.value = true
  downloadProgress.value = 0

  let completed = 0
  const total = unwatchedVideos.length

  const interval = setInterval(() => {
    downloadProgress.value = Math.min(100, Math.round((completed / total) * 100))

    if (completed < total) {
      const video = unwatchedVideos[completed]
      video.isDownloaded = true
      downloadedVideos.value++
      completed++
    } else {
      clearInterval(interval)
      showDownloadNotification.value = false
      isDownloading.value = false
    }
  }, 500)
}

const clearDownloads = () => {
  if (confirm('Supprimer tous les téléchargements ? Cette action est irréversible.')) {
    videos.value.forEach(v => {
      v.isDownloaded = false
    })
    downloadedVideos.value = 0
  }
}

const selectPlaylist = (playlistId) => {
  activePlaylist.value = activePlaylist.value === playlistId ? null : playlistId
  currentPage.value = 1
}

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
  activePlaylist.value = null
  searchQuery.value = ''
  currentPage.value = 1
}

// Méthodes du lecteur vidéo
let playbackInterval = null

const simulatePlayback = () => {
  if (playbackInterval) {
    clearInterval(playbackInterval)
  }

  playbackInterval = setInterval(() => {
    if (isPlaying.value && currentVideo.value) {
      currentTime.value = Math.min(currentTime.value + 1, currentVideo.value.duration)
      progressPercentage.value = (currentTime.value / currentVideo.value.duration) * 100

      // Mettre à jour la progression dans la liste
      const video = videos.value.find(v => v.id === currentVideo.value.id)
      if (video) {
        video.progress = Math.max(video.progress, progressPercentage.value)
        if (progressPercentage.value >= 95) {
          video.isWatched = true
        }
      }

      // Simuler les sous-titres
      if (showSubtitles.value && Math.random() > 0.7) {
        const subtitles = [
          "Les Promises sont un objet qui représente l'achèvement ou l'échec d'une opération asynchrone.",
          "Async/await est une syntaxe plus lisible pour travailler avec des Promises.",
          "Le pattern Observer est utilisé pour créer des systèmes de notification d'événements.",
          "Les Web Workers permettent d'exécuter du JavaScript en arrière-plan sans bloquer l'interface utilisateur."
        ]
        currentSubtitle.value = { text: subtitles[Math.floor(Math.random() * subtitles.length)] }

        setTimeout(() => {
          currentSubtitle.value = null
        }, 3000)
      }

      if (currentTime.value >= currentVideo.value.duration) {
        clearInterval(playbackInterval)
        isPlaying.value = false
      }
    }
  }, 1000 / playbackSpeed.value)
}

const togglePlay = () => {
  isPlaying.value = !isPlaying.value
  simulatePlayback()
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

const toggleMute = () => {
  isMuted.value = !isMuted.value
}

const changeVolume = () => {
  isMuted.value = volume.value === 0
}

const changePlaybackSpeed = (speed) => {
  if (speed) {
    playbackSpeed.value = speed
    showSpeedMenu.value = false
  } else {
    showSpeedMenu.value = !showSpeedMenu.value
  }

  if (playbackInterval) {
    clearInterval(playbackInterval)
    simulatePlayback()
  }
}

const changeQuality = (quality) => {
  currentQuality.value = quality
  showQualityMenu.value = false
}

const toggleSubtitles = () => {
  showSubtitles.value = !showSubtitles.value
}

const togglePlaylist = () => {
  showPlaylistInPlayer.value = !showPlaylistInPlayer.value
}

const toggleQuality = () => {
  showQualityMenu.value = !showQualityMenu.value
}

const seekTo = (event) => {
  const progressBar = event.target.closest('.progress-bar')
  if (progressBar) {
    const rect = progressBar.getBoundingClientRect()
    const percentage = (event.clientX - rect.left) / rect.width
    currentTime.value = Math.round(currentVideo.value.duration * percentage)
    progressPercentage.value = (currentTime.value / currentVideo.value.duration) * 100
  }
}

let isSeeking = false

const startSeeking = () => {
  isSeeking = true
  document.addEventListener('mousemove', handleSeeking)
  document.addEventListener('mouseup', stopSeeking)
}

const handleSeeking = (event) => {
  if (!isSeeking || !currentVideo.value) return

  const progressBar = document.querySelector('.progress-bar')
  if (progressBar) {
    const rect = progressBar.getBoundingClientRect()
    let percentage = (event.clientX - rect.left) / rect.width
    percentage = Math.max(0, Math.min(1, percentage))

    progressPercentage.value = percentage * 100
    currentTime.value = Math.round(currentVideo.value.duration * percentage)
  }
}

const stopSeeking = () => {
  isSeeking = false
  document.removeEventListener('mousemove', handleSeeking)
  document.removeEventListener('mouseup', stopSeeking)
}

const skipBackward = () => {
  currentTime.value = Math.max(0, currentTime.value - 10)
  progressPercentage.value = (currentTime.value / currentVideo.value.duration) * 100
}

const skipForward = () => {
  currentTime.value = Math.min(currentVideo.value.duration, currentTime.value + 10)
  progressPercentage.value = (currentTime.value / currentVideo.value.duration) * 100
}

const previousVideo = () => {
  if (!hasPreviousVideo.value) return

  const currentIndex = playlistVideos.value.findIndex(v => v.id === currentVideo.value.id)
  const previousVideo = playlistVideos.value[currentIndex - 1]
  playVideo(previousVideo.id)
}

const nextVideo = () => {
  if (!hasNextVideo.value) return

  const currentIndex = playlistVideos.value.findIndex(v => v.id === currentVideo.value.id)
  const nextVideo = playlistVideos.value[currentIndex + 1]
  playVideo(nextVideo.id)
}

const toggleFollow = () => {
  isFollowing.value = !isFollowing.value
}

// Lifecycle
onMounted(() => {
  // Fermer les menus en cliquant ailleurs
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.header-right')) {
      showSortMenu.value = false
    }
    if (!event.target.closest('.quality-menu')) {
      showQualityMenu.value = false
    }
    if (!event.target.closest('.speed-menu')) {
      showSpeedMenu.value = false
    }
  })

  // Gestionnaire plein écran
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })

  // Gestionnaire touche Échap
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (showPlayer.value) {
        closePlayer()
      }
      if (showQualityMenu.value) showQualityMenu.value = false
      if (showSpeedMenu.value) showSpeedMenu.value = false
      if (showPlaylistInPlayer.value) showPlaylistInPlayer.value = false
    }
  })
})

onUnmounted(() => {
  if (playbackInterval) {
    clearInterval(playbackInterval)
  }
  closePlayer()
})

// Watchers
watch(playbackSpeed, () => {
  if (playbackInterval) {
    clearInterval(playbackInterval)
    simulatePlayback()
  }
})

watch(isPlaying, (playing) => {
  if (playing) {
    simulatePlayback()
  } else if (playbackInterval) {
    clearInterval(playbackInterval)
  }
})
</script>

<style scoped>
.video-list-view {
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* En-tête */
.video-header {
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

.progress-summary {
  display: flex;
  align-items: center;
  gap: 20px;
  background: rgba(255,255,255,0.1);
  padding: 20px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.progress-ring {
  position: relative;
  width: 80px;
  height: 80px;
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
  font-size: 18px;
  font-weight: 700;
  color: white;
}

.progress-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.progress-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #2ecc71;
}

.stat-label {
  font-size: 12px;
  color: rgba(255,255,255,0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Conteneur principal */
.video-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 30px;
  max-width: 1400px;
  margin: 30px auto;
  padding: 0 20px;
}

/* Barre latérale */
.video-sidebar {
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

/* Playlists */
.playlists {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.playlist-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.playlist-item:hover {
  background: #e9ecef;
  transform: translateX(5px);
}

.playlist-item.active {
  border-color: #3498db;
  background: rgba(52, 152, 219, 0.1);
}

.playlist-cover {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-count {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.7);
  color: white;
  font-size: 10px;
  padding: 2px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.playlist-info {
  flex: 1;
  min-width: 0;
}

.playlist-info h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-info p {
  margin: 0 0 10px 0;
  font-size: 12px;
  color: #6c757d;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.playlist-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.playlist-progress .progress-bar {
  flex: 1;
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
}

.playlist-progress .progress-fill {
  height: 100%;
  background: #3498db;
  border-radius: 2px;
  transition: width 0.3s;
}

.playlist-progress .progress-text {
  font-size: 11px;
  color: #6c757d;
  font-weight: 600;
  min-width: 35px;
}

/* Téléchargements */
.downloads-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.download-stats {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.download-stats i {
  font-size: 24px;
  color: #3498db;
}

.stats-text {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
}

.stat-label {
  font-size: 12px;
  color: #6c757d;
}

.btn-download-all {
  width: 100%;
  padding: 12px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s;
}

.btn-download-all:hover:not(:disabled) {
  background: #2980b9;
}

.btn-download-all:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.storage-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.storage-progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.storage-progress .progress-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.storage-progress .progress-fill {
  height: 100%;
  background: #2ecc71;
  border-radius: 4px;
}

.storage-text {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6c757d;
}

.btn-clear-storage {
  align-self: flex-end;
  padding: 6px 12px;
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border: 2px solid #e74c3c;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.3s;
}

.btn-clear-storage:hover {
  background: #e74c3c;
  color: white;
}

/* Historique récent */
.recent-history {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.history-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.history-item:hover {
  background: #e9ecef;
  transform: translateX(5px);
}

.history-thumbnail {
  position: relative;
  width: 80px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.history-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0,0,0,0.3);
}

.progress-indicator {
  height: 100%;
  background: #2ecc71;
  transition: width 0.3s;
}

.play-overlay {
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

.history-item:hover .play-overlay {
  opacity: 1;
}

.play-overlay i {
  color: white;
  font-size: 24px;
}

.history-info {
  flex: 1;
  min-width: 0;
}

.history-info h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-meta {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #6c757d;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Contenu principal */
.video-main {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.videos-header {
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
  display: flex;
  align-items: center;
  gap: 15px;
  position: relative;
}

.view-options {
  display: flex;
  gap: 5px;
  background: #f8f9fa;
  padding: 5px;
  border-radius: 8px;
}

.view-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 6px;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.3s;
}

.view-btn:hover {
  background: #e9ecef;
}

.view-btn.active {
  background: white;
  color: #3498db;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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

/* Conteneur des vidéos */
.videos-container {
  flex: 1;
}

/* Vue grille */
.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.video-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  transition: all 0.3s;
  cursor: pointer;
}

.video-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.video-card:hover .video-actions {
  opacity: 1;
  transform: translateY(0);
}

.video-thumbnail {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.video-card:hover .thumbnail-image {
  transform: scale(1.05);
}

.video-duration {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.video-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(0,0,0,0.3);
}

.video-progress .progress-bar {
  height: 100%;
  background: #2ecc71;
}

.video-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s;
}

.action-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.7);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn:hover {
  background: #3498db;
  transform: scale(1.1);
}

.action-btn.active {
  background: #e74c3c;
}

.video-card .play-overlay {
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

.video-card:hover .play-overlay {
  opacity: 1;
}

.video-card .play-overlay i {
  color: white;
  font-size: 48px;
}

.video-info {
  padding: 20px;
}

.video-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.video-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.4;
  flex: 1;
}

.video-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-left: 10px;
}

.video-badge.beginner {
  background: #d4edda;
  color: #155724;
}

.video-badge.intermediate {
  background: #d1ecf1;
  color: #0c5460;
}

.video-badge.advanced {
  background: #f8d7da;
  color: #721c24;
}

.video-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  font-size: 12px;
  color: #6c757d;
}

.video-description {
  margin: 0 0 15px 0;
  color: #495057;
  font-size: 14px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}

.tag {
  padding: 4px 10px;
  background: #e9ecef;
  color: #495057;
  font-size: 11px;
  border-radius: 15px;
}

.video-footer {
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
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
}

.instructor-name {
  font-size: 12px;
  color: #6c757d;
  font-weight: 600;
}

.video-stats {
  display: flex;
  gap: 15px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6c757d;
}

/* Vue liste */
.videos-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.video-list-item {
  display: flex;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  transition: all 0.3s;
  cursor: pointer;
}

.video-list-item:hover {
  transform: translateX(5px);
  box-shadow: 0 5px 20px rgba(0,0,0,0.1);
}

.list-thumbnail {
  position: relative;
  width: 240px;
  height: 160px;
  flex-shrink: 0;
  overflow: hidden;
}

.list-thumbnail .thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.video-list-item:hover .list-thumbnail .thumbnail-image {
  transform: scale(1.05);
}

.list-thumbnail .video-duration {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.list-thumbnail .video-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(0,0,0,0.3);
}

.list-thumbnail .video-progress .progress-bar {
  height: 100%;
  background: #2ecc71;
}

.list-thumbnail .play-overlay {
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

.video-list-item:hover .list-thumbnail .play-overlay {
  opacity: 1;
}

.list-thumbnail .play-overlay i {
  color: white;
  font-size: 36px;
}

.list-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-left {
  flex: 1;
}

.video-list-item .video-title {
  font-size: 18px;
  margin-bottom: 10px;
}

.video-list-item .video-meta {
  display: flex;
  gap: 20px;
  font-size: 13px;
  margin-bottom: 0;
}

.header-right {
  display: flex;
  gap: 5px;
}

.video-list-item .action-btn {
  width: 40px;
  height: 40px;
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #e9ecef;
}

.video-list-item .action-btn:hover {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.video-list-item .action-btn.active {
  background: #e74c3c;
  color: white;
  border-color: #e74c3c;
}

.video-list-item .video-description {
  -webkit-line-clamp: 3;
  margin-bottom: 0;
}

.content-footer {
  display: flex;
  align-items: center;
  gap: 20px;
}

.video-list-item .video-tags {
  flex: 1;
  margin-bottom: 0;
}

.video-list-item .video-badge {
  padding: 6px 12px;
  font-size: 11px;
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

/* Lecteur vidéo */
.video-player {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.9);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  color: white;
}

.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(0,0,0,0.8);
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.player-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  max-width: 600px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-close-player {
  padding: 8px 16px;
  background: rgba(255,255,255,0.1);
  color: white;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-close-player:hover {
  background: rgba(255,255,255,0.2);
  border-color: rgba(255,255,255,0.5);
}

.header-right {
  display: flex;
  gap: 10px;
}

.player-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.1);
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.player-btn:hover {
  background: rgba(255,255,255,0.2);
  border-color: rgba(255,255,255,0.5);
}

.player-btn.active {
  background: #e74c3c;
  border-color: #e74c3c;
}

.player-container {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
}

.player-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%);
}

.placeholder-content {
  text-align: center;
}

.placeholder-content i {
  font-size: 80px;
  color: rgba(255,255,255,0.3);
  margin-bottom: 20px;
}

.placeholder-content p {
  color: rgba(255,255,255,0.5);
  font-size: 18px;
}

.player-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.controls-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.playback-info {
  display: flex;
  gap: 10px;
  font-size: 14px;
  color: rgba(255,255,255,0.8);
}

.playback-speed {
  position: relative;
}

.speed-btn {
  padding: 8px 16px;
  background: rgba(255,255,255,0.1);
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.speed-btn:hover {
  background: rgba(255,255,255,0.2);
}

.player-controls .progress-bar {
  position: relative;
  height: 6px;
  background: rgba(255,255,255,0.2);
  border-radius: 3px;
  cursor: pointer;
}

.player-controls .progress-fill {
  height: 100%;
  background: #3498db;
  border-radius: 3px;
  position: relative;
}

.player-controls .progress-handle {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  background: #3498db;
  border-radius: 50%;
  border: 2px solid white;
  cursor: grab;
  opacity: 0;
  transition: opacity 0.3s;
}

.player-controls .progress-bar:hover .progress-handle {
  opacity: 1;
}

.controls-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.controls-left,
.controls-center,
.controls-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.control-btn {
  padding: 10px;
  background: rgba(255,255,255,0.1);
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.control-btn:hover {
  background: rgba(255,255,255,0.2);
  border-color: rgba(255,255,255,0.5);
}

.control-btn.active {
  background: #3498db;
  border-color: #3498db;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.volume-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.1);
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.volume-btn:hover {
  background: rgba(255,255,255,0.2);
}

.volume-slider {
  width: 100px;
  height: 6px;
  -webkit-appearance: none;
  background: rgba(255,255,255,0.2);
  border-radius: 3px;
  outline: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: #3498db;
  border-radius: 50%;
  border: 2px solid white;
  cursor: pointer;
}

.video-details {
  width: 400px;
  background: rgba(0,0,0,0.8);
  border-left: 1px solid rgba(255,255,255,0.1);
  padding: 20px;
  overflow-y: auto;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.video-info h4 {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: 600;
}

.video-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  font-size: 12px;
  color: rgba(255,255,255,0.6);
}

.btn-mark-watched {
  padding: 8px 16px;
  background: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
  border: 2px solid #2ecc71;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-mark-watched:hover {
  background: #2ecc71;
  color: white;
}

.btn-mark-watched.active {
  background: #2ecc71;
  color: white;
}

.video-description {
  margin-bottom: 20px;
}

.video-description p {
  margin: 0;
  color: rgba(255,255,255,0.8);
  line-height: 1.6;
  font-size: 14px;
}

.video-player .video-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.video-player .tag {
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.8);
  border: 1px solid rgba(255,255,255,0.2);
}

.instructor-card {
  display: flex;
  gap: 15px;
  padding: 20px;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
}

.video-player .instructor-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #3498db;
}

.instructor-info {
  flex: 1;
}

.instructor-info h5 {
  margin: 0 0 5px 0;
  font-size: 16px;
  font-weight: 600;
}

.instructor-info p {
  margin: 0 0 5px 0;
  color: rgba(255,255,255,0.7);
  font-size: 14px;
}

.instructor-bio {
  font-size: 12px !important;
  color: rgba(255,255,255,0.6) !important;
  line-height: 1.4;
}

.btn-follow {
  align-self: flex-start;
  padding: 8px 16px;
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
  border: 2px solid #3498db;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-follow:hover {
  background: #3498db;
  color: white;
}

/* Sous-titres */
.subtitles-container {
  position: absolute;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  max-width: 800px;
  width: 100%;
  padding: 0 20px;
}

.subtitles-text {
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 15px 20px;
  border-radius: 8px;
  font-size: 18px;
  line-height: 1.4;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1);
}

/* Playlist dans le lecteur */
.player-playlist {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 300px;
  background: rgba(0,0,0,0.9);
  border-left: 1px solid rgba(255,255,255,0.1);
  transform: translateX(100%);
  transition: transform 0.3s;
}

.player-playlist.show {
  transform: translateX(0);
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.playlist-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.btn-close-playlist {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.1);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-close-playlist:hover {
  background: rgba(255,255,255,0.2);
  transform: rotate(90deg);
}

.playlist-items {
  overflow-y: auto;
  height: calc(100% - 70px);
}

.player-playlist .playlist-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.player-playlist .playlist-item:hover {
  background: rgba(255,255,255,0.05);
}

.player-playlist .playlist-item.active {
  background: rgba(52, 152, 219, 0.1);
  border-left: 3px solid #3498db;
}

.item-thumbnail {
  position: relative;
  width: 80px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.player-playlist .thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.player-playlist .video-duration {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-info h5 {
  margin: 0 0 5px 0;
  font-size: 14px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-meta {
  display: flex;
  gap: 15px;
  font-size: 11px;
  color: rgba(255,255,255,0.6);
}

/* Menus qualité/vitesse */
.quality-menu,
.speed-menu {
  position: absolute;
  bottom: 80px;
  right: 20px;
  background: rgba(0,0,0,0.9);
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
  min-width: 150px;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.menu-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.btn-close-menu {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  font-size: 18px;
  transition: color 0.3s;
}

.btn-close-menu:hover {
  color: white;
}

.menu-options {
  display: flex;
  flex-direction: column;
}

.quality-option,
.speed-option {
  padding: 12px 15px;
  background: none;
  border: none;
  color: rgba(255,255,255,0.8);
  text-align: left;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.quality-option:hover,
.speed-option:hover {
  background: rgba(255,255,255,0.05);
  color: white;
}

.quality-option.active,
.speed-option.active {
  background: rgba(52, 152, 219, 0.2);
  color: #3498db;
}

.quality-option i,
.speed-option i {
  font-size: 12px;
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
  border-left: 4px solid #3498db;
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

.notification-content.info {
  border-left-color: #3498db;
}

.notification-content.info i {
  color: #3498db;
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

/* Responsive */
@media (max-width: 1200px) {
  .video-container {
    grid-template-columns: 1fr;
  }

  .video-sidebar {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .videos-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .video-container {
    grid-template-columns: 1fr;
  }

  .video-sidebar {
    grid-template-columns: 1fr;
  }

  .header-content {
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
  }

  .progress-summary {
    width: 100%;
    justify-content: center;
  }

  .videos-header {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }

  .header-left {
    flex-direction: column;
    gap: 15px;
  }

  .search-box {
    width: 100%;
  }

  .videos-grid {
    grid-template-columns: 1fr;
  }

  .video-list-item {
    flex-direction: column;
  }

  .list-thumbnail {
    width: 100%;
    height: 200px;
  }

  .video-details {
    display: none;
  }

  .player-playlist {
    width: 100%;
    transform: translateX(100%);
  }

  .player-playlist.show {
    transform: translateX(0);
  }
}

@media (max-width: 480px) {
  .progress-summary {
    flex-direction: column;
    text-align: center;
  }

  .video-sidebar .sidebar-section {
    padding: 15px;
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
  }

  .btn-sort span {
    display: none;
  }

  .player-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .header-left {
    flex-direction: column;
    gap: 10px;
  }

  .player-title {
    font-size: 16px;
    text-align: center;
  }

  .controls-bottom {
    flex-direction: column;
    gap: 15px;
  }

  .controls-left,
  .controls-center,
  .controls-right {
    width: 100%;
    justify-content: center;
  }

  .notification {
    left: 20px;
    right: 20px;
    bottom: 20px;
  }

  .notification-content {
    max-width: none;
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
input:focus {
  outline: 2px solid #3498db;
  outline-offset: 2px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .video-list-view {
    background-color: #000;
    color: #fff;
  }

  .video-header {
    background: #000;
    border-bottom: 3px solid #fff;
  }

  .video-card {
    border: 2px solid #fff;
  }

  .notification-content {
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

  .video-card:hover,
  .video-list-item:hover,
  .playlist-item:hover,
  .history-item:hover {
    transform: none;
  }

  .notification-content {
    animation: none;
  }
}
</style>