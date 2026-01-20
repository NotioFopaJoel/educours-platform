<template>
  <BaseLayout>
    <template #header>
      <div class="teacher-dashboard-header">
        <div class="header-content">
          <h1>Tableau de bord Enseignant</h1>
          <p>Gérez vos cours, étudiants et sessions en direct</p>
        </div>
        <div class="header-actions">
          <button class="btn-primary" @click="createNewCourse">
            <i class="icon-plus"></i>
            Nouveau cours
          </button>
          <button class="btn-secondary" @click="scheduleLiveClass">
            <i class="icon-video"></i>
            Planifier un cours en direct
          </button>
        </div>
      </div>
    </template>

    <div class="teacher-dashboard-view">
      <div class="container">
        <!-- Statistiques principales -->
        <div class="main-stats-section">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-header">
                <h3>Étudiants actifs</h3>
                <div class="stat-trend positive">
                  <i class="icon-trending-up"></i>
                  <span>12%</span>
                </div>
              </div>
              <div class="stat-content">
                <div class="stat-number">1,247</div>
                <div class="stat-change">+134 ce mois</div>
              </div>
              <div class="stat-icon">
                <i class="icon-users"></i>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-header">
                <h3>Total des revenus</h3>
                <div class="stat-trend positive">
                  <i class="icon-trending-up"></i>
                  <span>8%</span>
                </div>
              </div>
              <div class="stat-content">
                <div class="stat-number">€42,580</div>
                <div class="stat-change">+€3,200 ce mois</div>
              </div>
              <div class="stat-icon">
                <i class="icon-dollar-sign"></i>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-header">
                <h3>Cours publiés</h3>
                <div class="stat-trend neutral">
                  <i class="icon-minus"></i>
                  <span>0%</span>
                </div>
              </div>
              <div class="stat-content">
                <div class="stat-number">18</div>
                <div class="stat-change">Aucun nouveau ce mois</div>
              </div>
              <div class="stat-icon">
                <i class="icon-book"></i>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-header">
                <h3>Note moyenne</h3>
                <div class="stat-trend positive">
                  <i class="icon-trending-up"></i>
                  <span>5%</span>
                </div>
              </div>
              <div class="stat-content">
                <div class="stat-number">4.8</div>
                <div class="stat-change">+0.2 ce mois</div>
              </div>
              <div class="stat-icon">
                <i class="icon-star"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Contenu principal -->
        <div class="main-content">
          <!-- Colonne gauche -->
          <div class="content-left">
            <!-- Cours en vedette -->
            <div class="featured-courses">
              <div class="section-header">
                <h2>Cours en vedette</h2>
                <router-link to="/teacher/courses" class="btn-link">
                  Voir tous
                  <i class="icon-arrow-right"></i>
                </router-link>
              </div>
              <div class="courses-grid">
                <div
                    v-for="course in featuredCourses"
                    :key="course.id"
                    class="course-card"
                >
                  <div class="course-header">
                    <div class="course-image">
                      <img :src="course.thumbnail" :alt="course.title">
                      <div class="course-badge" :class="course.status">
                        {{ course.status === 'published' ? 'Publié' : 'Brouillon' }}
                      </div>
                    </div>
                    <div class="course-actions">
                      <button class="btn-icon" @click="editCourse(course)">
                        <i class="icon-edit"></i>
                      </button>
                      <button class="btn-icon" @click="viewAnalytics(course)">
                        <i class="icon-bar-chart"></i>
                      </button>
                    </div>
                  </div>
                  <div class="course-content">
                    <h3>{{ course.title }}</h3>
                    <p class="course-description">{{ course.description }}</p>
                    <div class="course-stats">
                      <div class="stat-item">
                        <i class="icon-users"></i>
                        <span>{{ course.students }} étudiants</span>
                      </div>
                      <div class="stat-item">
                        <i class="icon-star"></i>
                        <span>{{ course.rating }}/5</span>
                      </div>
                      <div class="stat-item">
                        <i class="icon-dollar-sign"></i>
                        <span>{{ formatPrice(course.revenue) }}</span>
                      </div>
                    </div>
                    <div class="progress-section">
                      <div class="progress-header">
                        <span>Progression moyenne</span>
                        <span>{{ course.avgProgress }}%</span>
                      </div>
                      <div class="progress-bar">
                        <div
                            class="progress-fill"
                            :style="{ width: course.avgProgress + '%' }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sessions en direct à venir -->
            <div class="upcoming-sessions">
              <div class="section-header">
                <h2>Sessions en direct à venir</h2>
                <router-link to="/teacher/live-sessions" class="btn-link">
                  Voir calendrier
                  <i class="icon-calendar"></i>
                </router-link>
              </div>
              <div class="sessions-list">
                <div
                    v-for="session in upcomingSessions"
                    :key="session.id"
                    class="session-card"
                >
                  <div class="session-time">
                    <div class="session-date">
                      {{ formatDay(session.date) }}
                      <small>{{ formatMonth(session.date) }}</small>
                    </div>
                    <div class="session-hour">
                      {{ formatTime(session.startTime) }}
                      <small>{{ session.duration }} min</small>
                    </div>
                  </div>
                  <div class="session-info">
                    <h4>{{ session.title }}</h4>
                    <p class="session-course">{{ session.course }}</p>
                    <div class="session-stats">
                      <span class="stat">
                        <i class="icon-users"></i>
                        {{ session.registered }}/{{ session.capacity }}
                      </span>
                      <span class="stat">
                        <i class="icon-video"></i>
                        {{ session.platform }}
                      </span>
                    </div>
                  </div>
                  <div class="session-actions">
                    <button
                        class="btn-start"
                        @click="startLiveSession(session)"
                        :disabled="!session.canStart"
                    >
                      <i class="icon-play"></i>
                      Démarrer
                    </button>
                    <div class="action-buttons">
                      <button class="btn-icon" @click="editSession(session)">
                        <i class="icon-edit"></i>
                      </button>
                      <button class="btn-icon" @click="shareSession(session)">
                        <i class="icon-share"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Devoirs à corriger -->
            <div class="pending-assignments">
              <div class="section-header">
                <h2>Devoirs à corriger</h2>
                <span class="badge">{{ pendingAssignments.length }}</span>
              </div>
              <div class="assignments-list">
                <div
                    v-for="assignment in pendingAssignments"
                    :key="assignment.id"
                    class="assignment-card"
                >
                  <div class="assignment-header">
                    <div class="assignment-title">
                      <h4>{{ assignment.title }}</h4>
                      <span class="course-name">{{ assignment.course }}</span>
                    </div>
                    <div class="assignment-deadline">
                      <i class="icon-clock"></i>
                      {{ formatRelativeTime(assignment.deadline) }}
                    </div>
                  </div>
                  <div class="assignment-content">
                    <div class="assignment-stats">
                      <div class="stat">
                        <span class="label">Soumis</span>
                        <span class="value">{{ assignment.submitted }}/{{ assignment.total }}</span>
                      </div>
                      <div class="stat">
                        <span class="label">Notés</span>
                        <span class="value">{{ assignment.graded }}</span>
                      </div>
                      <div class="stat">
                        <span class="label">Moyenne</span>
                        <span class="value">{{ assignment.averageGrade }}/20</span>
                      </div>
                    </div>
                    <div class="assignment-actions">
                      <button
                          class="btn-grade"
                          @click="gradeAssignment(assignment)"
                      >
                        <i class="icon-check-square"></i>
                        Corriger
                      </button>
                      <button
                          class="btn-outline"
                          @click="viewSubmissions(assignment)"
                      >
                        Voir les soumissions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Colonne droite -->
          <div class="content-right">
            <!-- Calendrier -->
            <div class="calendar-widget">
              <div class="calendar-header">
                <h3>Calendrier</h3>
                <div class="calendar-nav">
                  <button @click="prevMonth">
                    <i class="icon-chevron-left"></i>
                  </button>
                  <span class="current-month">{{ currentMonth }}</span>
                  <button @click="nextMonth">
                    <i class="icon-chevron-right"></i>
                  </button>
                </div>
              </div>
              <div class="calendar-grid">
                <div
                    v-for="day in calendarDays"
                    :key="day.date"
                    class="calendar-day"
                    :class="{
                    today: day.isToday,
                    'has-events': day.hasEvents,
                    'other-month': !day.isCurrentMonth
                  }"
                    @click="viewDayEvents(day)"
                >
                  <div class="day-number">{{ day.day }}</div>
                  <div v-if="day.eventsCount" class="day-events">
                    <span
                        v-for="event in day.eventTypes"
                        :key="event"
                        class="event-dot"
                        :class="event"
                    ></span>
                  </div>
                </div>
              </div>
              <div class="calendar-legend">
                <div class="legend-item">
                  <span class="legend-dot live"></span>
                  <span>Cours en direct</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot deadline"></span>
                  <span>Échéance</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot meeting"></span>
                  <span>Réunion</span>
                </div>
              </div>
            </div>

            <!-- Étudiants récents -->
            <div class="recent-students">
              <div class="section-header">
                <h3>Étudiants récents</h3>
                <router-link to="/teacher/students" class="btn-link">
                  Voir tous
                </router-link>
              </div>
              <div class="students-list">
                <div
                    v-for="student in recentStudents"
                    :key="student.id"
                    class="student-card"
                >
                  <div class="student-avatar">
                    <img :src="student.avatar" :alt="student.name">
                  </div>
                  <div class="student-info">
                    <h4>{{ student.name }}</h4>
                    <p class="student-email">{{ student.email }}</p>
                    <div class="student-meta">
                      <span class="meta-item">
                        <i class="icon-book"></i>
                        {{ student.enrolledCourses }} cours
                      </span>
                      <span class="meta-item">
                        <i class="icon-clock"></i>
                        {{ student.lastActive }}
                      </span>
                    </div>
                  </div>
                  <div class="student-actions">
                    <button class="btn-icon" @click="messageStudent(student)">
                      <i class="icon-message-square"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notifications -->
            <div class="notifications-widget">
              <div class="section-header">
                <h3>Notifications</h3>
                <button class="btn-mark-all" @click="markAllAsRead">
                  Tout marquer comme lu
                </button>
              </div>
              <div class="notifications-list">
                <div
                    v-for="notification in notifications"
                    :key="notification.id"
                    class="notification-item"
                    :class="{ unread: !notification.read }"
                >
                  <div class="notification-icon" :class="notification.type">
                    <i :class="notification.icon"></i>
                  </div>
                  <div class="notification-content">
                    <p class="notification-text">{{ notification.text }}</p>
                    <span class="notification-time">{{ notification.time }}</span>
                  </div>
                  <div class="notification-actions">
                    <button
                        v-if="!notification.read"
                        class="btn-mark-read"
                        @click="markAsRead(notification)"
                    >
                      <i class="icon-check"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Statistiques rapides -->
            <div class="quick-stats">
              <div class="section-header">
                <h3>Statistiques rapides</h3>
              </div>
              <div class="stats-grid-small">
                <div class="stat-item-small">
                  <div class="stat-number">{{ engagementRate }}%</div>
                  <div class="stat-label">Taux d'engagement</div>
                  <div class="stat-trend positive">
                    <i class="icon-trending-up"></i>
                    <span>+2.5%</span>
                  </div>
                </div>
                <div class="stat-item-small">
                  <div class="stat-number">{{ completionRate }}%</div>
                  <div class="stat-label">Taux de complétion</div>
                  <div class="stat-trend positive">
                    <i class="icon-trending-up"></i>
                    <span>+3.1%</span>
                  </div>
                </div>
                <div class="stat-item-small">
                  <div class="stat-number">{{ avgResponseTime }}h</div>
                  <div class="stat-label">Temps de réponse moyen</div>
                  <div class="stat-trend negative">
                    <i class="icon-trending-down"></i>
                    <span>-0.5h</span>
                  </div>
                </div>
                <div class="stat-item-small">
                  <div class="stat-number">{{ studentSatisfaction }}%</div>
                  <div class="stat-label">Satisfaction</div>
                  <div class="stat-trend neutral">
                    <i class="icon-minus"></i>
                    <span>0%</span>
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
        v-if="showCreateCourseModal"
        @close="showCreateCourseModal = false"
        title="Créer un nouveau cours"
        size="large"
    >
      <CourseCreationForm @success="handleCourseCreated" />
    </BaseModal>

    <BaseModal
        v-if="showScheduleSessionModal"
        @close="showScheduleSessionModal = false"
        title="Planifier un cours en direct"
    >
      <LiveSessionSchedule @success="handleSessionScheduled" />
    </BaseModal>
  </BaseLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseLayout from './BaseLayout.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import CourseCreationForm from '@/components/courses/CourseCreationForm.vue'
import LiveSessionSchedule from '@/components/live/LiveSessionSchedule.vue'

const router = useRouter()

// Modals
const showCreateCourseModal = ref(false)
const showScheduleSessionModal = ref(false)

// Données
const featuredCourses = ref([
  {
    id: 1,
    title: 'JavaScript Avancé',
    description: 'Maîtrisez JavaScript moderne avec ES6+',
    thumbnail: '/images/course1.jpg',
    status: 'published',
    students: 524,
    rating: 4.8,
    revenue: 12580,
    avgProgress: 68
  },
  {
    id: 2,
    title: 'React Native Mobile',
    description: 'Créez des applications mobiles avec React Native',
    thumbnail: '/images/course2.jpg',
    status: 'published',
    students: 312,
    rating: 4.9,
    revenue: 9340,
    avgProgress: 72
  },
  {
    id: 3,
    title: 'Machine Learning Basics',
    description: 'Introduction au machine learning avec Python',
    thumbnail: '/images/course3.jpg',
    status: 'draft',
    students: 0,
    rating: 0,
    revenue: 0,
    avgProgress: 0
  }
])

const upcomingSessions = ref([
  {
    id: 1,
    title: 'Les Promises en JavaScript',
    course: 'JavaScript Avancé',
    date: new Date('2024-02-15'),
    startTime: '14:00',
    duration: 90,
    registered: 45,
    capacity: 50,
    platform: 'Zoom',
    canStart: true
  },
  {
    id: 2,
    title: 'Navigation dans React Native',
    course: 'React Native Mobile',
    date: new Date('2024-02-16'),
    startTime: '10:00',
    duration: 60,
    registered: 28,
    capacity: 40,
    platform: 'Google Meet',
    canStart: false
  },
  {
    id: 3,
    title: 'Les Hooks React Avancés',
    course: 'React Masterclass',
    date: new Date('2024-02-18'),
    startTime: '16:30',
    duration: 120,
    registered: 38,
    capacity: 50,
    platform: 'Microsoft Teams',
    canStart: true
  }
])

const pendingAssignments = ref([
  {
    id: 1,
    title: 'Projet Final - Site E-commerce',
    course: 'JavaScript Avancé',
    deadline: new Date('2024-02-20'),
    submitted: 42,
    total: 524,
    graded: 15,
    averageGrade: 16.5
  },
  {
    id: 2,
    title: 'Application Todo List',
    course: 'React Native Mobile',
    deadline: new Date('2024-02-18'),
    submitted: 28,
    total: 312,
    graded: 8,
    averageGrade: 15.8
  },
  {
    id: 3,
    title: 'Quiz sur les Algorithmes',
    course: 'Algorithmes et Structures de Données',
    deadline: new Date('2024-02-17'),
    submitted: 65,
    total: 89,
    graded: 0,
    averageGrade: 0
  }
])

const recentStudents = ref([
  {
    id: 1,
    name: 'Marie Dubois',
    email: 'marie.dubois@email.com',
    avatar: '/avatars/student1.jpg',
    enrolledCourses: 3,
    lastActive: 'Il y a 2h'
  },
  {
    id: 2,
    name: 'Thomas Martin',
    email: 'thomas.martin@email.com',
    avatar: '/avatars/student2.jpg',
    enrolledCourses: 2,
    lastActive: 'Il y a 5h'
  },
  {
    id: 3,
    name: 'Sophie Bernard',
    email: 'sophie.bernard@email.com',
    avatar: '/avatars/student3.jpg',
    enrolledCourses: 4,
    lastActive: 'Aujourd\'hui'
  },
  {
    id: 4,
    name: 'Ahmed Benali',
    email: 'ahmed.benali@email.com',
    avatar: '/avatars/student4.jpg',
    enrolledCourses: 1,
    lastActive: 'Hier'
  }
])

const notifications = ref([
  {
    id: 1,
    type: 'assignment',
    icon: 'icon-file-text',
    text: 'Nouvelle soumission pour "Projet Final"',
    time: 'Il y a 15 min',
    read: false
  },
  {
    id: 2,
    type: 'review',
    icon: 'icon-star',
    text: 'Nouvel avis 5 étoiles sur votre cours',
    time: 'Il y a 2h',
    read: true
  },
  {
    id: 3,
    type: 'message',
    icon: 'icon-message-square',
    text: 'Nouveau message de Marie Dubois',
    time: 'Il y a 4h',
    read: false
  },
  {
    id: 4,
    type: 'live',
    icon: 'icon-video',
    text: 'Rappel : Cours en direct dans 1 heure',
    time: 'Il y a 5h',
    read: true
  }
])

// Calendrier
const currentDate = ref(new Date())
const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const today = new Date()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const days = []

  // Ajouter les jours du mois précédent
  const firstDayOfWeek = firstDay.getDay()
  const lastMonthLastDay = new Date(year, month, 0).getDate()

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, lastMonthLastDay - i)
    days.push({
      date: date.toISOString().split('T')[0],
      day: date.getDate(),
      isCurrentMonth: false,
      isToday: false,
      hasEvents: Math.random() > 0.7,
      eventsCount: Math.floor(Math.random() * 3),
      eventTypes: ['live', 'deadline', 'meeting'].slice(0, Math.floor(Math.random() * 3))
    })
  }

  // Ajouter les jours du mois courant
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day)
    const isToday = date.toDateString() === today.toDateString()

    days.push({
      date: date.toISOString().split('T')[0],
      day,
      isCurrentMonth: true,
      isToday,
      hasEvents: Math.random() > 0.5,
      eventsCount: Math.floor(Math.random() * 3),
      eventTypes: ['live', 'deadline', 'meeting'].slice(0, Math.floor(Math.random() * 3))
    })
  }

  // Ajouter les jours du mois suivant
  const totalCells = 42 // 6 semaines
  const nextMonthDays = totalCells - days.length

  for (let day = 1; day <= nextMonthDays; day++) {
    const date = new Date(year, month + 1, day)
    days.push({
      date: date.toISOString().split('T')[0],
      day,
      isCurrentMonth: false,
      isToday: false,
      hasEvents: false,
      eventsCount: 0,
      eventTypes: []
    })
  }

  return days
})

const currentMonth = computed(() => {
  return currentDate.value.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric'
  })
})

// Statistiques
const engagementRate = ref(78)
const completionRate = ref(65)
const avgResponseTime = ref(2.5)
const studentSatisfaction = ref(94)

// Méthodes utilitaires
const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0
  }).format(price)
}

const formatDay = (date) => {
  return date.getDate().toString().padStart(2, '0')
}

const formatMonth = (date) => {
  return date.toLocaleDateString('fr-FR', { month: 'short' })
}

const formatTime = (time) => {
  return time
}

const formatRelativeTime = (date) => {
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return "Aujourd'hui"
  if (days === 1) return 'Demain'
  if (days < 7) return `Dans ${days} jours`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

// Actions
const createNewCourse = () => {
  showCreateCourseModal.value = true
}

const scheduleLiveClass = () => {
  showScheduleSessionModal.value = true
}

const editCourse = (course) => {
  router.push(`/teacher/courses/${course.id}/edit`)
}

const viewAnalytics = (course) => {
  router.push(`/teacher/analytics/${course.id}`)
}

const startLiveSession = (session) => {
  router.push(`/live/${session.id}`)
}

const editSession = (session) => {
  console.log('Edit session:', session)
}

const shareSession = (session) => {
  console.log('Share session:', session)
}

const gradeAssignment = (assignment) => {
  router.push(`/teacher/assignments/${assignment.id}/grade`)
}

const viewSubmissions = (assignment) => {
  router.push(`/teacher/assignments/${assignment.id}/submissions`)
}

const viewDayEvents = (day) => {
  console.log('View events for:', day)
}

const prevMonth = () => {
  currentDate.value = new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth() - 1,
      1
  )
}

const nextMonth = () => {
  currentDate.value = new Date(
      currentDate.value.getFullYear(),
      currentDate.value.getMonth() + 1,
      1
  )
}

const messageStudent = (student) => {
  router.push(`/teacher/messages?student=${student.id}`)
}

const markAsRead = (notification) => {
  notification.read = true
}

const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true)
}

const handleCourseCreated = (course) => {
  showCreateCourseModal.value = false
  featuredCourses.value.unshift({
    ...course,
    id: featuredCourses.value.length + 1,
    status: 'draft',
    students: 0,
    rating: 0,
    revenue: 0,
    avgProgress: 0
  })
}

const handleSessionScheduled = (session) => {
  showScheduleSessionModal.value = false
  upcomingSessions.value.push({
    ...session,
    id: upcomingSessions.value.length + 1,
    registered: 0,
    canStart: false
  })
}

// Initialisation
onMounted(() => {
  // Charger les données du professeur
  // fetchTeacherData()
})
</script>

<style scoped>
.teacher-dashboard-view {
  padding: 2rem 0;
}

.teacher-dashboard-header {
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

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: white;
  color: #495057;
  border: 2px solid #e9ecef;
}

.btn-secondary:hover {
  background: #f8f9fa;
  border-color: #dee2e6;
}

.main-stats-section {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px 4px 0 0;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.stat-header h3 {
  font-size: 0.875rem;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
  font-weight: 600;
}

.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.stat-trend.positive {
  background: #d4edda;
  color: #155724;
}

.stat-trend.neutral {
  background: #e2e3e5;
  color: #383d41;
}

.stat-trend.negative {
  background: #f8d7da;
  color: #721c24;
}

.stat-content {
  margin-bottom: 1rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.stat-change {
  font-size: 0.875rem;
  color: #718096;
}

.stat-icon {
  position: absolute;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  font-size: 1.5rem;
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.5rem;
  color: #212529;
  margin: 0;
}

.section-header h3 {
  font-size: 1.25rem;
  color: #212529;
  margin: 0;
}

.btn-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-link:hover {
  color: #5a67d8;
  gap: 0.75rem;
}

.badge {
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

.featured-courses .courses-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .featured-courses .courses-grid {
    grid-template-columns: 1fr;
  }
}

.course-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
}

.course-header {
  position: relative;
}

.course-image {
  height: 160px;
  overflow: hidden;
}

.course-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.course-card:hover .course-image img {
  transform: scale(1.05);
}

.course-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.course-badge.published {
  background: #d4edda;
  color: #155724;
}

.course-badge.draft {
  background: #fff3cd;
  color: #856404;
}

.course-actions {
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.course-card:hover .course-actions {
  opacity: 1;
}

.btn-icon {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #495057;
}

.btn-icon:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.course-content {
  padding: 1.5rem;
}

.course-content h3 {
  font-size: 1.25rem;
  color: #212529;
  margin: 0 0 0.75rem 0;
  line-height: 1.3;
}

.course-description {
  color: #718096;
  margin: 0 0 1rem 0;
  font-size: 0.95rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #718096;
  font-size: 0.875rem;
}

.stat-item i {
  color: #667eea;
}

.progress-section {
  margin-top: 1rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #718096;
}

.progress-header span:last-child {
  font-weight: 600;
  color: #2d3748;
}

.progress-bar {
  height: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.6s ease;
}

.upcoming-sessions .sessions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.session-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  border: 1px solid #e9ecef;
  transition: all 0.2s;
}

.session-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.session-time {
  text-align: center;
  min-width: 80px;
}

.session-date {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.session-date small {
  display: block;
  font-size: 0.75rem;
  font-weight: 400;
  color: #718096;
  text-transform: uppercase;
  margin-top: 0.25rem;
}

.session-hour {
  font-size: 0.875rem;
  color: #718096;
}

.session-hour small {
  display: block;
  font-size: 0.75rem;
  color: #a0aec0;
  margin-top: 0.125rem;
}

.session-info {
  flex: 1;
}

.session-info h4 {
  font-size: 1.1rem;
  color: #212529;
  margin: 0 0 0.25rem 0;
}

.session-course {
  color: #718096;
  font-size: 0.875rem;
  margin: 0 0 0.75rem 0;
}

.session-stats {
  display: flex;
  gap: 1rem;
}

.session-stats .stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #718096;
}

.session-stats .stat i {
  color: #667eea;
}

.session-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.btn-start {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-start:hover:not(:disabled) {
  background: #5a67d8;
  transform: translateY(-2px);
}

.btn-start:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
}

.pending-assignments .assignments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.assignment-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  transition: all 0.2s;
}

.assignment-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.assignment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.assignment-title h4 {
  font-size: 1.1rem;
  color: #212529;
  margin: 0 0 0.25rem 0;
}

.course-name {
  font-size: 0.875rem;
  color: #718096;
}

.assignment-deadline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #f56565;
  font-weight: 500;
}

.assignment-deadline i {
  font-size: 1rem;
}

.assignment-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.assignment-stats {
  display: flex;
  gap: 1.5rem;
}

.assignment-stats .stat {
  display: flex;
  flex-direction: column;
}

.assignment-stats .label {
  font-size: 0.75rem;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.assignment-stats .value {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3748;
}

.assignment-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-grade {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-grade:hover {
  background: #5a67d8;
  transform: translateY(-2px);
}

.btn-outline {
  padding: 0.5rem 1rem;
  background: white;
  color: #495057;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
}

/* Widgets de la colonne droite */
.calendar-widget {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.calendar-nav button {
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
}

.calendar-nav button:hover {
  background: #f8f9fa;
  border-color: #dee2e6;
}

.current-month {
  font-weight: 600;
  color: #212529;
  min-width: 140px;
  text-align: center;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  padding: 0.25rem;
}

.calendar-day:hover {
  background: #f8f9fa;
}

.calendar-day.today {
  background: #667eea;
  color: white;
}

.calendar-day.has-events::after {
  content: '';
  position: absolute;
  bottom: 2px;
  width: 4px;
  height: 4px;
  background: #667eea;
  border-radius: 50%;
}

.calendar-day.other-month {
  color: #cbd5e0;
}

.day-number {
  font-size: 0.875rem;
  font-weight: 500;
}

.day-events {
  position: absolute;
  bottom: 4px;
  display: flex;
  gap: 2px;
}

.event-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
}

.event-dot.live {
  background: #f56565;
}

.event-dot.deadline {
  background: #ed8936;
}

.event-dot.meeting {
  background: #48bb78;
}

.calendar-legend {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.75rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #718096;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-dot.live {
  background: #f56565;
}

.legend-dot.deadline {
  background: #ed8936;
}

.legend-dot.meeting {
  background: #48bb78;
}

.recent-students .students-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.student-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  transition: all 0.2s;
}

.student-card:hover {
  border-color: #667eea;
}

.student-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.student-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.student-info {
  flex: 1;
  min-width: 0;
}

.student-info h4 {
  font-size: 1rem;
  color: #212529;
  margin: 0 0 0.125rem 0;
  line-height: 1.2;
}

.student-email {
  font-size: 0.75rem;
  color: #718096;
  margin: 0 0 0.5rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.student-meta {
  display: flex;
  gap: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #718096;
}

.notifications-widget {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
}

.btn-mark-all {
  background: none;
  border: none;
  color: #667eea;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.25rem 0;
  transition: color 0.2s;
}

.btn-mark-all:hover {
  color: #5a67d8;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.notification-item.unread {
  background: white;
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1.25rem;
}

.notification-icon.assignment {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.notification-icon.review {
  background: rgba(246, 173, 85, 0.1);
  color: #f6ad55;
}

.notification-icon.message {
  background: rgba(72, 187, 120, 0.1);
  color: #48bb78;
}

.notification-icon.live {
  background: rgba(245, 101, 101, 0.1);
  color: #f56565;
}

.notification-content {
  flex: 1;
}

.notification-text {
  font-size: 0.875rem;
  color: #2d3748;
  margin: 0 0 0.25rem 0;
  line-height: 1.4;
}

.notification-time {
  font-size: 0.75rem;
  color: #718096;
}

.notification-actions {
  display: flex;
  align-items: center;
}

.btn-mark-read {
  width: 28px;
  height: 28px;
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

.btn-mark-read:hover {
  background: #f8f9fa;
  border-color: #dee2e6;
  color: #48bb78;
}

.quick-stats {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
}

.stats-grid-small {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-item-small {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  text-align: center;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #718096;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>