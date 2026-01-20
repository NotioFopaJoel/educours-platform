<template>
  <BaseLayout>
    <template #header>
      <div class="admin-dashboard-header">
        <div class="header-content">
          <h1>Tableau de bord Administrateur</h1>
          <p>Supervisez et gérez toute la plateforme</p>
        </div>
        <div class="header-actions">
          <div class="quick-stats-header">
            <div class="stat">
              <span class="label">Serveurs</span>
              <span class="value online">100%</span>
            </div>
            <div class="stat">
              <span class="label">Utilisateurs en ligne</span>
              <span class="value">{{ onlineUsers }}</span>
            </div>
            <div class="stat">
              <span class="label">Performance</span>
              <span class="value">{{ performance }}%</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div class="admin-dashboard-view">
      <div class="container">
        <!-- Statistiques principales -->
        <div class="main-stats-section">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-header">
                <h3>Revenu total</h3>
                <div class="stat-trend positive">
                  <i class="icon-trending-up"></i>
                  <span>24%</span>
                </div>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ formatPrice(totalRevenue) }}</div>
                <div class="stat-change">+{{ formatPrice(revenueChange) }} ce mois</div>
              </div>
              <div class="stat-chart">
                <canvas ref="revenueChart"></canvas>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-header">
                <h3>Nouveaux utilisateurs</h3>
                <div class="stat-trend positive">
                  <i class="icon-trending-up"></i>
                  <span>18%</span>
                </div>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ totalUsers.toLocaleString() }}</div>
                <div class="stat-change">+{{ newUsers }} ce mois</div>
              </div>
              <div class="stat-chart">
                <canvas ref="usersChart"></canvas>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-header">
                <h3>Cours vendus</h3>
                <div class="stat-trend positive">
                  <i class="icon-trending-up"></i>
                  <span>12%</span>
                </div>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ coursesSold.toLocaleString() }}</div>
                <div class="stat-change">+{{ coursesChange }} ce mois</div>
              </div>
              <div class="stat-chart">
                <canvas ref="coursesChart"></canvas>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-header">
                <h3>Taux de conversion</h3>
                <div class="stat-trend negative">
                  <i class="icon-trending-down"></i>
                  <span>3%</span>
                </div>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ conversionRate }}%</div>
                <div class="stat-change">-1.2% ce mois</div>
              </div>
              <div class="stat-chart">
                <canvas ref="conversionChart"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Contenu principal -->
        <div class="main-content">
          <!-- Colonne gauche -->
          <div class="content-left">
            <!-- Graphiques principaux -->
            <div class="main-charts">
              <div class="chart-section">
                <div class="chart-header">
                  <h3>Performance des revenus</h3>
                  <div class="chart-controls">
                    <select v-model="revenuePeriod" class="chart-select">
                      <option value="7d">7 derniers jours</option>
                      <option value="30d">30 derniers jours</option>
                      <option value="90d">90 derniers jours</option>
                      <option value="1y">Cette année</option>
                    </select>
                  </div>
                </div>
                <div class="chart-container">
                  <canvas ref="performanceChart"></canvas>
                </div>
              </div>

              <div class="chart-section">
                <div class="chart-header">
                  <h3>Répartition des utilisateurs</h3>
                </div>
                <div class="chart-container">
                  <canvas ref="usersDistributionChart"></canvas>
                </div>
              </div>
            </div>

            <!-- Activité récente -->
            <div class="recent-activity-section">
              <div class="section-header">
                <h3>Activité récente</h3>
                <button class="btn-refresh" @click="refreshActivity">
                  <i class="icon-refresh-cw"></i>
                  Actualiser
                </button>
              </div>
              <div class="activity-list">
                <div
                    v-for="activity in recentActivities"
                    :key="activity.id"
                    class="activity-item"
                    :class="activity.type"
                >
                  <div class="activity-icon">
                    <i :class="activity.icon"></i>
                  </div>
                  <div class="activity-content">
                    <div class="activity-text">{{ activity.text }}</div>
                    <div class="activity-meta">
                      <span class="activity-time">{{ activity.time }}</span>
                      <span class="activity-user">{{ activity.user }}</span>
                    </div>
                  </div>
                  <div class="activity-actions">
                    <button
                        v-if="activity.needsAction"
                        class="btn-action"
                        @click="handleActivityAction(activity)"
                    >
                      Traiter
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Demandes en attente -->
            <div class="pending-requests">
              <div class="section-header">
                <h3>Demandes en attente</h3>
                <span class="badge">{{ pendingRequests.length }}</span>
              </div>
              <div class="requests-list">
                <div
                    v-for="request in pendingRequests"
                    :key="request.id"
                    class="request-card"
                >
                  <div class="request-header">
                    <div class="request-type" :class="request.type">
                      <i :class="request.icon"></i>
                      <span>{{ request.typeLabel }}</span>
                    </div>
                    <div class="request-priority" :class="request.priority">
                      {{ request.priorityLabel }}
                    </div>
                  </div>
                  <div class="request-content">
                    <h4>{{ request.title }}</h4>
                    <p>{{ request.description }}</p>
                    <div class="request-meta">
                      <span class="meta-item">
                        <i class="icon-user"></i>
                        {{ request.user }}
                      </span>
                      <span class="meta-item">
                        <i class="icon-clock"></i>
                        {{ request.time }}
                      </span>
                    </div>
                  </div>
                  <div class="request-actions">
                    <button
                        class="btn-approve"
                        @click="approveRequest(request)"
                    >
                      <i class="icon-check"></i>
                      Approuver
                    </button>
                    <button
                        class="btn-reject"
                        @click="rejectRequest(request)"
                    >
                      <i class="icon-x"></i>
                      Rejeter
                    </button>
                    <button
                        class="btn-view"
                        @click="viewRequestDetails(request)"
                    >
                      <i class="icon-eye"></i>
                      Détails
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Colonne droite -->
          <div class="content-right">
            <!-- Vue d'ensemble système -->
            <div class="system-overview">
              <div class="section-header">
                <h3>État du système</h3>
                <div class="system-status" :class="systemStatus">
                  <i class="icon-circle"></i>
                  {{ systemStatus === 'healthy' ? 'Tout fonctionne' : 'Problèmes détectés' }}
                </div>
              </div>
              <div class="system-metrics">
                <div class="metric-item">
                  <div class="metric-header">
                    <span class="metric-label">CPU</span>
                    <span class="metric-value">{{ cpuUsage }}%</span>
                  </div>
                  <div class="progress-bar">
                    <div
                        class="progress-fill"
                        :style="{ width: cpuUsage + '%', backgroundColor: getCpuColor(cpuUsage) }"
                    ></div>
                  </div>
                </div>
                <div class="metric-item">
                  <div class="metric-header">
                    <span class="metric-label">Mémoire</span>
                    <span class="metric-value">{{ memoryUsage }}%</span>
                  </div>
                  <div class="progress-bar">
                    <div
                        class="progress-fill"
                        :style="{ width: memoryUsage + '%', backgroundColor: getMemoryColor(memoryUsage) }"
                    ></div>
                  </div>
                </div>
                <div class="metric-item">
                  <div class="metric-header">
                    <span class="metric-label">Stockage</span>
                    <span class="metric-value">{{ storageUsage }}%</span>
                  </div>
                  <div class="progress-bar">
                    <div
                        class="progress-fill"
                        :style="{ width: storageUsage + '%', backgroundColor: getStorageColor(storageUsage) }"
                    ></div>
                  </div>
                </div>
                <div class="metric-item">
                  <div class="metric-header">
                    <span class="metric-label">Bande passante</span>
                    <span class="metric-value">{{ bandwidth }} Mbps</span>
                  </div>
                  <div class="progress-bar">
                    <div
                        class="progress-fill"
                        :style="{ width: bandwidthPercent + '%', backgroundColor: getBandwidthColor(bandwidthPercent) }"
                    ></div>
                  </div>
                </div>
              </div>
              <div class="system-logs">
                <div class="logs-header">
                  <h4>Logs système récents</h4>
                  <button class="btn-view-logs" @click="viewSystemLogs">
                    Voir tout
                  </button>
                </div>
                <div class="logs-list">
                  <div
                      v-for="log in systemLogs"
                      :key="log.id"
                      class="log-item"
                      :class="log.level"
                  >
                    <div class="log-content">
                      <span class="log-message">{{ log.message }}</span>
                      <span class="log-time">{{ log.time }}</span>
                    </div>
                    <div class="log-level">{{ log.level.toUpperCase() }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Top enseignants -->
            <div class="top-teachers">
              <div class="section-header">
                <h3>Top enseignants</h3>
                <router-link to="/admin/teachers" class="btn-link">
                  Voir tous
                </router-link>
              </div>
              <div class="teachers-list">
                <div
                    v-for="teacher in topTeachers"
                    :key="teacher.id"
                    class="teacher-card"
                >
                  <div class="teacher-rank">
                    <div class="rank-number">#{{ teacher.rank }}</div>
                    <div
                        class="rank-change"
                        :class="{ up: teacher.change > 0, down: teacher.change < 0 }"
                    >
                      <i :class="teacher.change > 0 ? 'icon-trending-up' : 'icon-trending-down'"></i>
                      {{ Math.abs(teacher.change) }}
                    </div>
                  </div>
                  <div class="teacher-avatar">
                    <img :src="teacher.avatar" :alt="teacher.name">
                  </div>
                  <div class="teacher-info">
                    <h4>{{ teacher.name }}</h4>
                    <p class="teacher-email">{{ teacher.email }}</p>
                    <div class="teacher-stats">
                      <div class="stat">
                        <span class="value">{{ teacher.courses }}</span>
                        <span class="label">Cours</span>
                      </div>
                      <div class="stat">
                        <span class="value">{{ teacher.students }}</span>
                        <span class="label">Étudiants</span>
                      </div>
                      <div class="stat">
                        <span class="value">{{ formatPrice(teacher.revenue) }}</span>
                        <span class="label">Revenu</span>
                      </div>
                    </div>
                  </div>
                  <div class="teacher-rating">
                    <div class="rating-stars">
                      <i
                          v-for="n in 5"
                          :key="n"
                          :class="['icon-star', { filled: n <= Math.floor(teacher.rating) }]"
                      ></i>
                    </div>
                    <div class="rating-value">{{ teacher.rating }}/5</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Top cours -->
            <div class="top-courses">
              <div class="section-header">
                <h3>Cours populaires</h3>
                <router-link to="/admin/courses" class="btn-link">
                  Voir tous
                </router-link>
              </div>
              <div class="courses-list">
                <div
                    v-for="course in topCourses"
                    :key="course.id"
                    class="course-item"
                >
                  <div class="course-rank">#{{ course.rank }}</div>
                  <div class="course-thumbnail">
                    <img :src="course.thumbnail" :alt="course.title">
                  </div>
                  <div class="course-info">
                    <h4>{{ course.title }}</h4>
                    <p class="course-instructor">{{ course.instructor }}</p>
                    <div class="course-stats">
                      <div class="stat">
                        <i class="icon-users"></i>
                        {{ course.students }}
                      </div>
                      <div class="stat">
                        <i class="icon-star"></i>
                        {{ course.rating }}
                      </div>
                      <div class="stat">
                        <i class="icon-dollar-sign"></i>
                        {{ formatPrice(course.revenue) }}
                      </div>
                    </div>
                  </div>
                  <div class="course-trend" :class="{ up: course.growth > 0, down: course.growth < 0 }">
                    <i :class="course.growth > 0 ? 'icon-trending-up' : 'icon-trending-down'"></i>
                    {{ Math.abs(course.growth) }}%
                  </div>
                </div>
              </div>
            </div>

            <!-- Alertes de sécurité -->
            <div class="security-alerts">
              <div class="section-header">
                <h3>Alertes de sécurité</h3>
                <span class="badge danger">{{ securityAlerts.length }}</span>
              </div>
              <div class="alerts-list">
                <div
                    v-for="alert in securityAlerts"
                    :key="alert.id"
                    class="alert-item"
                    :class="alert.severity"
                >
                  <div class="alert-icon">
                    <i :class="alert.icon"></i>
                  </div>
                  <div class="alert-content">
                    <h4>{{ alert.title }}</h4>
                    <p>{{ alert.description }}</p>
                    <div class="alert-meta">
                      <span class="meta-item">
                        <i class="icon-clock"></i>
                        {{ alert.time }}
                      </span>
                      <span class="meta-item">
                        <i class="icon-user"></i>
                        {{ alert.user }}
                      </span>
                    </div>
                  </div>
                  <div class="alert-actions">
                    <button class="btn-resolve" @click="resolveAlert(alert)">
                      <i class="icon-check"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <BaseModal
        v-if="selectedRequest"
        @close="selectedRequest = null"
        :title="`Détails de la demande`"
        size="large"
    >
      <RequestDetails
          :request="selectedRequest"
          @approve="handleRequestApproval"
          @reject="handleRequestRejection"
      />
    </BaseModal>

    <!-- Panneau d'administration rapide -->
    <div class="admin-quick-panel" :class="{ open: quickPanelOpen }">
      <button class="panel-toggle" @click="quickPanelOpen = !quickPanelOpen">
        <i class="icon-settings"></i>
      </button>
      <div class="panel-content">
        <h4>Actions rapides</h4>
        <div class="quick-actions">
          <button class="action-item" @click="clearCache">
            <i class="icon-refresh-cw"></i>
            <span>Vider le cache</span>
          </button>
          <button class="action-item" @click="backupDatabase">
            <i class="icon-database"></i>
            <span>Sauvegarder BDD</span>
          </button>
          <button class="action-item" @click="sendGlobalNotification">
            <i class="icon-bell"></i>
            <span>Notification globale</span>
          </button>
          <button class="action-item" @click="viewAuditLogs">
            <i class="icon-file-text"></i>
            <span>Logs d'audit</span>
          </button>
          <button class="action-item" @click="restartServices">
            <i class="icon-power"></i>
            <span>Redémarrer services</span>
          </button>
          <button class="action-item" @click="systemMaintenance">
            <i class="icon-tool"></i>
            <span>Maintenance</span>
          </button>
        </div>
      </div>
    </div>
  </BaseLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Chart, registerables } from 'chart.js'
import BaseLayout from './BaseLayout.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import RequestDetails from '@/components/admin/RequestDetails.vue'

Chart.register(...registerables)

const router = useRouter()

// Données principales
const totalRevenue = ref(1856420)
const revenueChange = ref(35800)
const totalUsers = ref(15420)
const newUsers = ref(1248)
const coursesSold = ref(8924)
const coursesChange = ref(956)
const conversionRate = ref(3.2)

// Statistiques système
const onlineUsers = ref(842)
const performance = ref(98)
const systemStatus = ref('healthy')
const cpuUsage = ref(42)
const memoryUsage = ref(68)
const storageUsage = ref(45)
const bandwidth = ref(125)
const bandwidthPercent = computed(() => (bandwidth.value / 200) * 100)

// Périodes des graphiques
const revenuePeriod = ref('30d')

// Données d'activité
const recentActivities = ref([
  {
    id: 1,
    type: 'user',
    icon: 'icon-user-plus',
    text: 'Nouvel utilisateur enregistré',
    user: 'Marie Dubois',
    time: 'Il y a 5 min',
    needsAction: false
  },
  {
    id: 2,
    type: 'payment',
    icon: 'icon-dollar-sign',
    text: 'Paiement de 299€ effectué',
    user: 'Thomas Martin',
    time: 'Il y a 15 min',
    needsAction: false
  },
  {
    id: 3,
    type: 'course',
    icon: 'icon-book',
    text: 'Nouveau cours soumis pour approbation',
    user: 'Dr. Jean Dupont',
    time: 'Il y a 30 min',
    needsAction: true
  },
  {
    id: 4,
    type: 'support',
    icon: 'icon-help-circle',
    text: 'Nouveau ticket de support ouvert',
    user: 'Sophie Bernard',
    time: 'Il y a 1h',
    needsAction: true
  },
  {
    id: 5,
    type: 'refund',
    icon: 'icon-refresh-ccw',
    text: 'Demande de remboursement soumise',
    user: 'Ahmed Benali',
    time: 'Il y a 2h',
    needsAction: true
  }
])

const pendingRequests = ref([
  {
    id: 1,
    type: 'teacher',
    icon: 'icon-user-check',
    typeLabel: 'Demande enseignant',
    priority: 'high',
    priorityLabel: 'Haute',
    title: 'Validation de compte enseignant',
    description: 'Nouvelle demande de création de compte enseignant',
    user: 'Prof. Robert Durand',
    time: 'Il y a 2 jours'
  },
  {
    id: 2,
    type: 'course',
    icon: 'icon-book',
    typeLabel: 'Nouveau cours',
    priority: 'medium',
    priorityLabel: 'Moyenne',
    title: 'Révision de contenu',
    description: 'Cours soumis pour publication',
    user: 'Sarah Martin',
    time: 'Il y a 1 jour'
  },
  {
    id: 3,
    type: 'withdrawal',
    icon: 'icon-dollar-sign',
    typeLabel: 'Retrait',
    priority: 'low',
    priorityLabel: 'Basse',
    title: 'Demande de retrait',
    description: 'Enseignant demande un retrait de fonds',
    user: 'Dr. Jean Dupont',
    time: 'Il y a 3 jours'
  }
])

const topTeachers = ref([
  {
    id: 1,
    rank: 1,
    change: 0,
    name: 'Dr. Jean Dupont',
    email: 'jean.dupont@educours.com',
    avatar: '/avatars/teacher1.jpg',
    courses: 8,
    students: 1542,
    revenue: 125800,
    rating: 4.9
  },
  {
    id: 2,
    rank: 2,
    change: 1,
    name: 'Sarah Martin',
    email: 'sarah.martin@educours.com',
    avatar: '/avatars/teacher2.jpg',
    courses: 6,
    students: 986,
    revenue: 87400,
    rating: 4.8
  },
  {
    id: 3,
    rank: 3,
    change: -1,
    name: 'Prof. Robert Durand',
    email: 'robert.durand@educours.com',
    avatar: '/avatars/teacher3.jpg',
    courses: 5,
    students: 754,
    revenue: 65200,
    rating: 4.7
  }
])

const topCourses = ref([
  {
    id: 1,
    rank: 1,
    title: 'JavaScript Avancé',
    instructor: 'Dr. Jean Dupont',
    thumbnail: '/images/course1.jpg',
    students: 1542,
    rating: 4.9,
    revenue: 125800,
    growth: 12
  },
  {
    id: 2,
    rank: 2,
    title: 'React Native Mobile',
    instructor: 'Sarah Martin',
    thumbnail: '/images/course2.jpg',
    students: 986,
    rating: 4.8,
    revenue: 87400,
    growth: 8
  },
  {
    id: 3,
    rank: 3,
    title: 'Machine Learning Basics',
    instructor: 'Prof. Robert Durand',
    thumbnail: '/images/course3.jpg',
    students: 754,
    rating: 4.7,
    revenue: 65200,
    growth: -2
  }
])

const systemLogs = ref([
  {
    id: 1,
    level: 'info',
    message: 'Sauvegarde de base de données terminée',
    time: '10:30'
  },
  {
    id: 2,
    level: 'warning',
    message: 'Utilisation CPU élevée détectée',
    time: '10:15'
  },
  {
    id: 3,
    level: 'info',
    message: 'Mise à jour des certificats SSL',
    time: '09:45'
  },
  {
    id: 4,
    level: 'error',
    message: 'Échec de connexion à l\'API de paiement',
    time: '09:30'
  }
])

const securityAlerts = ref([
  {
    id: 1,
    severity: 'high',
    icon: 'icon-shield',
    title: 'Tentative de connexion suspecte',
    description: 'Multiple tentatives de connexion depuis IP inconnue',
    user: 'IP: 192.168.1.100',
    time: 'Il y a 10 min'
  },
  {
    id: 2,
    severity: 'medium',
    icon: 'icon-alert-triangle',
    title: 'Violation de politique',
    description: 'Contenu inapproprié détecté dans un cours',
    user: 'Cours: Python Basics',
    time: 'Il y a 2h'
  },
  {
    id: 3,
    severity: 'low',
    icon: 'icon-info',
    title: 'Certificat SSL expirant',
    description: 'Le certificat SSL expire dans 7 jours',
    user: 'Système',
    time: 'Il y a 1 jour'
  }
])

// Références aux graphiques
const revenueChart = ref(null)
const usersChart = ref(null)
const coursesChart = ref(null)
const conversionChart = ref(null)
const performanceChart = ref(null)
const usersDistributionChart = ref(null)

// Modals
const selectedRequest = ref(null)
const quickPanelOpen = ref(false)

// Méthodes utilitaires
const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

const getCpuColor = (usage) => {
  if (usage < 50) return '#48bb78'
  if (usage < 75) return '#ed8936'
  return '#f56565'
}

const getMemoryColor = (usage) => {
  if (usage < 60) return '#48bb78'
  if (usage < 80) return '#ed8936'
  return '#f56565'
}

const getStorageColor = (usage) => {
  if (usage < 50) return '#48bb78'
  if (usage < 75) return '#ed8936'
  return '#f56565'
}

const getBandwidthColor = (usage) => {
  if (usage < 50) return '#48bb78'
  if (usage < 75) return '#ed8936'
  return '#f56565'
}

// Actions
const refreshActivity = () => {
  // Simuler le rafraîchissement
  console.log('Refreshing activity data...')
}

const handleActivityAction = (activity) => {
  console.log('Handle activity:', activity)
  // Rediriger vers la page appropriée
  switch (activity.type) {
    case 'course':
      router.push('/admin/courses/pending')
      break
    case 'support':
      router.push('/admin/support')
      break
    case 'refund':
      router.push('/admin/refunds')
      break
  }
}

const approveRequest = (request) => {
  console.log('Approve request:', request)
  pendingRequests.value = pendingRequests.value.filter(r => r.id !== request.id)
}

const rejectRequest = (request) => {
  console.log('Reject request:', request)
  pendingRequests.value = pendingRequests.value.filter(r => r.id !== request.id)
}

const viewRequestDetails = (request) => {
  selectedRequest.value = request
}

const handleRequestApproval = (request) => {
  approveRequest(request)
  selectedRequest.value = null
}

const handleRequestRejection = (request) => {
  rejectRequest(request)
  selectedRequest.value = null
}

const viewSystemLogs = () => {
  router.push('/admin/system/logs')
}

const resolveAlert = (alert) => {
  console.log('Resolve alert:', alert)
  securityAlerts.value = securityAlerts.value.filter(a => a.id !== alert.id)
}

// Actions du panneau rapide
const clearCache = () => {
  console.log('Clearing cache...')
}

const backupDatabase = () => {
  console.log('Backing up database...')
}

const sendGlobalNotification = () => {
  router.push('/admin/notifications/create')
}

const viewAuditLogs = () => {
  router.push('/admin/audit-logs')
}

const restartServices = () => {
  console.log('Restarting services...')
}

const systemMaintenance = () => {
  router.push('/admin/system/maintenance')
}

// Initialisation des graphiques
const initCharts = () => {
  // Graphique des revenus
  if (revenueChart.value) {
    new Chart(revenueChart.value, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
        datasets: [{
          data: [12000, 19000, 15000, 25000, 22000, 30000],
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { display: false },
          y: { display: false }
        },
        elements: {
          point: { radius: 0 }
        }
      }
    })
  }

  // Graphique des utilisateurs
  if (usersChart.value) {
    new Chart(usersChart.value, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
        datasets: [{
          data: [800, 1200, 1000, 1500, 1300, 1800],
          backgroundColor: '#48bb78',
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { display: false },
          y: { display: false }
        }
      }
    })
  }

  // Graphique des cours
  if (coursesChart.value) {
    new Chart(coursesChart.value, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
        datasets: [{
          data: [600, 900, 750, 1100, 950, 1300],
          borderColor: '#ed8936',
          backgroundColor: 'rgba(237, 137, 54, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { display: false },
          y: { display: false }
        },
        elements: {
          point: { radius: 0 }
        }
      }
    })
  }

  // Graphique de conversion
  if (conversionChart.value) {
    new Chart(conversionChart.value, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
        datasets: [{
          data: [2.8, 3.2, 3.0, 3.5, 3.3, 3.2],
          borderColor: '#f56565',
          backgroundColor: 'rgba(245, 101, 101, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { display: false },
          y: { display: false }
        },
        elements: {
          point: { radius: 0 }
        }
      }
    })
  }

  // Graphique de performance
  if (performanceChart.value) {
    new Chart(performanceChart.value, {
      type: 'line',
      data: {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        datasets: [
          {
            label: 'Revenus',
            data: [42000, 48000, 45000, 52000, 49000, 55000, 51000],
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
          },
          {
            label: 'Utilisateurs',
            data: [1200, 1400, 1300, 1600, 1500, 1800, 1700],
            borderColor: '#48bb78',
            backgroundColor: 'rgba(72, 187, 120, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(0, 0, 0, 0.05)' }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0, 0, 0, 0.05)' },
            ticks: {
              callback: value => {
                if (value >= 1000) return (value / 1000) + 'k'
                return value
              }
            }
          }
        }
      }
    })
  }

  // Graphique de distribution des utilisateurs
  if (usersDistributionChart.value) {
    new Chart(usersDistributionChart.value, {
      type: 'doughnut',
      data: {
        labels: ['Étudiants', 'Enseignants', 'Administrateurs'],
        datasets: [{
          data: [85, 12, 3],
          backgroundColor: ['#667eea', '#48bb78', '#f56565'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        }
      }
    })
  }
}

// Watchers
watch(revenuePeriod, () => {
  // Mettre à jour les données du graphique
  console.log('Updating chart data for period:', revenuePeriod.value)
})

// Initialisation
onMounted(() => {
  nextTick(() => {
    initCharts()
  })

  // Simuler la mise à jour en temps réel
  setInterval(() => {
    onlineUsers.value = Math.floor(Math.random() * 100) + 800
    cpuUsage.value = Math.floor(Math.random() * 30) + 30
    memoryUsage.value = Math.floor(Math.random() * 20) + 60
  }, 10000)
})
</script>

<style scoped>
.admin-dashboard-view {
  padding: 2rem 0;
}

.admin-dashboard-header {
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

.quick-stats-header {
  display: flex;
  gap: 2rem;
}

.quick-stats-header .stat {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.quick-stats-header .label {
  font-size: 0.75rem;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.quick-stats-header .value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
}

.quick-stats-header .value.online {
  color: #48bb78;
}

.main-stats-section {
  margin-bottom: 2rem;
}

.main-stats-section .stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

@media (max-width: 1200px) {
  .main-stats-section .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .main-stats-section .stats-grid {
    grid-template-columns: 1fr;
  }
}

.main-stats-section .stat-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  position: relative;
}

.main-stats-section .stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.main-stats-section .stat-header h3 {
  font-size: 0.875rem;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
  font-weight: 600;
}

.main-stats-section .stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.main-stats-section .stat-trend.positive {
  background: #d4edda;
  color: #155724;
}

.main-stats-section .stat-trend.negative {
  background: #f8d7da;
  color: #721c24;
}

.main-stats-section .stat-content {
  margin-bottom: 1rem;
}

.main-stats-section .stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.main-stats-section .stat-change {
  font-size: 0.875rem;
  color: #718096;
}

.main-stats-section .stat-chart {
  height: 60px;
  margin-top: 1rem;
}

.main-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}

.content-left {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.content-right {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Graphiques principaux */
.main-charts {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
}

@media (max-width: 992px) {
  .main-charts {
    grid-template-columns: 1fr;
  }
}

.chart-section {
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chart-header h3 {
  font-size: 1.1rem;
  color: #212529;
  margin: 0;
}

.chart-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.75rem;
  background: white;
  color: #495057;
}

.chart-container {
  height: 250px;
  position: relative;
  flex: 1;
}

/* Activité récente */
.recent-activity-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
}

.recent-activity-section .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.recent-activity-section h3 {
  font-size: 1.25rem;
  color: #212529;
  margin: 0;
}

.btn-refresh {
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  color: #495057;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh:hover {
  background: #e9ecef;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.activity-item:hover {
  border-color: #667eea;
}

.activity-item.user {
  border-left: 4px solid #667eea;
}

.activity-item.payment {
  border-left: 4px solid #48bb78;
}

.activity-item.course {
  border-left: 4px solid #ed8936;
}

.activity-item.support {
  border-left: 4px solid #f56565;
}

.activity-item.refund {
  border-left: 4px solid #9f7aea;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: white;
  color: #667eea;
  font-size: 1.25rem;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-text {
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 0.25rem;
  line-height: 1.4;
}

.activity-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #718096;
}

.activity-actions {
  flex-shrink: 0;
}

.btn-action {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action:hover {
  background: #5a67d8;
}

/* Demandes en attente */
.pending-requests {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
}

.pending-requests .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.pending-requests h3 {
  font-size: 1.25rem;
  color: #212529;
  margin: 0;
}

.pending-requests .badge {
  background: #f56565;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.request-card {
  border: 1px solid #e9ecef;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
}

.request-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.request-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
}

.request-type.teacher {
  color: #667eea;
}

.request-type.course {
  color: #ed8936;
}

.request-type.withdrawal {
  color: #48bb78;
}

.request-priority {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.request-priority.high {
  background: #f8d7da;
  color: #721c24;
}

.request-priority.medium {
  background: #fff3cd;
  color: #856404;
}

.request-priority.low {
  background: #d4edda;
  color: #155724;
}

.request-content {
  padding: 1.5rem;
}

.request-content h4 {
  font-size: 1.1rem;
  color: #212529;
  margin: 0 0 0.75rem 0;
}

.request-content p {
  color: #718096;
  margin: 0 0 1rem 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

.request-meta {
  display: flex;
  gap: 1.5rem;
  font-size: 0.875rem;
  color: #718096;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.request-actions {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.btn-approve,
.btn-reject,
.btn-view {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-approve {
  background: #48bb78;
  color: white;
}

.btn-approve:hover {
  background: #38a169;
}

.btn-reject {
  background: #f56565;
  color: white;
}

.btn-reject:hover {
  background: #e53e3e;
}

.btn-view {
  background: #e9ecef;
  color: #495057;
}

.btn-view:hover {
  background: #dee2e6;
}

/* Vue d'ensemble système */
.system-overview {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
}

.system-overview .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.system-overview h3 {
  font-size: 1.25rem;
  color: #212529;
  margin: 0;
}

.system-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.system-status.healthy {
  background: #d4edda;
  color: #155724;
}

.system-status.warning {
  background: #fff3cd;
  color: #856404;
}

.system-status.critical {
  background: #f8d7da;
  color: #721c24;
}

.system-status i {
  font-size: 0.75rem;
}

.system-metrics {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-label {
  font-size: 0.875rem;
  color: #718096;
}

.metric-value {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.875rem;
}

.progress-bar {
  height: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}

.system-logs {
  border-top: 1px solid #e9ecef;
  padding-top: 1.5rem;
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.logs-header h4 {
  font-size: 1rem;
  color: #212529;
  margin: 0;
}

.btn-view-logs {
  background: none;
  border: none;
  color: #667eea;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.25rem 0;
  transition: color 0.2s;
}

.btn-view-logs:hover {
  color: #5a67d8;
}

.logs-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.log-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 0.875rem;
}

.log-item.info {
  border-left: 3px solid #667eea;
}

.log-item.warning {
  border-left: 3px solid #ed8936;
}

.log-item.error {
  border-left: 3px solid #f56565;
}

.log-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.log-message {
  color: #2d3748;
}

.log-time {
  font-size: 0.75rem;
  color: #718096;
}

.log-level {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.log-item.info .log-level {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.log-item.warning .log-level {
  background: rgba(237, 137, 54, 0.1);
  color: #ed8936;
}

.log-item.error .log-level {
  background: rgba(245, 101, 101, 0.1);
  color: #f56565;
}

/* Top enseignants */
.top-teachers {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
}

.top-teachers .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.top-teachers h3 {
  font-size: 1.25rem;
  color: #212529;
  margin: 0;
}

.teachers-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.teacher-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  transition: all 0.2s;
}

.teacher-card:hover {
  border-color: #667eea;
}

.teacher-rank {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 40px;
}

.rank-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  line-height: 1;
}

.rank-change {
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.125rem;
}

.rank-change.up {
  color: #48bb78;
}

.rank-change.down {
  color: #f56565;
}

.teacher-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.teacher-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.teacher-info {
  flex: 1;
  min-width: 0;
}

.teacher-info h4 {
  font-size: 1rem;
  color: #212529;
  margin: 0 0 0.125rem 0;
  line-height: 1.2;
}

.teacher-email {
  font-size: 0.75rem;
  color: #718096;
  margin: 0 0 0.75rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.teacher-stats {
  display: flex;
  gap: 1rem;
}

.teacher-stats .stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.teacher-stats .value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #2d3748;
  line-height: 1;
  margin-bottom: 0.125rem;
}

.teacher-stats .label {
  font-size: 0.75rem;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.teacher-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.rating-stars {
  display: flex;
  gap: 0.125rem;
  margin-bottom: 0.25rem;
}

.rating-stars i {
  font-size: 0.75rem;
  color: #e2e8f0;
}

.rating-stars i.filled {
  color: #f6ad55;
}

.rating-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #2d3748;
}

/* Top cours */
.top-courses {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
}

.top-courses .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.top-courses h3 {
  font-size: 1.25rem;
  color: #212529;
  margin: 0;
}

.courses-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.course-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  transition: all 0.2s;
}

.course-item:hover {
  border-color: #667eea;
}

.course-rank {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  min-width: 36px;
}

.course-thumbnail {
  width: 60px;
  height: 40px;
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
  min-width: 0;
}

.course-info h4 {
  font-size: 1rem;
  color: #212529;
  margin: 0 0 0.25rem 0;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.course-instructor {
  font-size: 0.75rem;
  color: #718096;
  margin: 0 0 0.75rem 0;
}

.course-stats {
  display: flex;
  gap: 1rem;
}

.course-stats .stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #718096;
}

.course-stats .stat i {
  color: #667eea;
  font-size: 0.875rem;
}

.course-trend {
  font-size: 0.875rem;
  font-weight: 600;
  min-width: 60px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  justify-content: flex-end;
}

.course-trend.up {
  color: #48bb78;
}

.course-trend.down {
  color: #f56565;
}

/* Alertes de sécurité */
.security-alerts {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
}

.security-alerts .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.security-alerts h3 {
  font-size: 1.25rem;
  color: #212529;
  margin: 0;
}

.security-alerts .badge.danger {
  background: #f56565;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alert-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.alert-item:hover {
  border-color: #667eea;
}

.alert-item.high {
  border-left: 4px solid #f56565;
}

.alert-item.medium {
  border-left: 4px solid #ed8936;
}

.alert-item.low {
  border-left: 4px solid #48bb78;
}

.alert-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1.25rem;
}

.alert-item.high .alert-icon {
  background: rgba(245, 101, 101, 0.1);
  color: #f56565;
}

.alert-item.medium .alert-icon {
  background: rgba(237, 137, 54, 0.1);
  color: #ed8936;
}

.alert-item.low .alert-icon {
  background: rgba(72, 187, 120, 0.1);
  color: #48bb78;
}

.alert-content {
  flex: 1;
  min-width: 0;
}

.alert-content h4 {
  font-size: 1rem;
  color: #212529;
  margin: 0 0 0.5rem 0;
}

.alert-content p {
  color: #718096;
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

.alert-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #718096;
}

.alert-actions {
  display: flex;
  align-items: center;
}

.btn-resolve {
  width: 32px;
  height: 32px;
  border: 1px solid #e9ecef;
  background: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #718096;
}

.btn-resolve:hover {
  background: #f8f9fa;
  border-color: #dee2e6;
  color: #48bb78;
}

/* Panneau d'administration rapide */
.admin-quick-panel {
  position: fixed;
  right: -300px;
  top: 50%;
  transform: translateY(-50%);
  width: 300px;
  background: white;
  border-radius: 16px 0 0 16px;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  transition: right 0.3s ease;
  z-index: 1000;
}

.admin-quick-panel.open {
  right: 0;
}

.panel-toggle {
  position: absolute;
  left: -48px;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px 0 0 12px;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.panel-toggle:hover {
  width: 52px;
}

.panel-content {
  padding: 1.5rem;
}

.panel-content h4 {
  font-size: 1.1rem;
  color: #212529;
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  color: #495057;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  text-align: left;
}

.action-item:hover {
  background: white;
  border-color: #667eea;
  color: #667eea;
  transform: translateX(-4px);
}

.action-item i {
  font-size: 1.25rem;
  width: 24px;
}
</style>