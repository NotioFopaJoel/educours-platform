<template>
  <div class="student-dashboard">
    <div class="dashboard-header">
      <h1>Bonjour, {{ user?.fullName || 'Étudiant' }} 👋</h1>
      <p>Voici votre progression et vos cours actifs</p>
    </div>
    
    <div class="dashboard-stats">
      <StatsCard
        title="Cours suivis"
        :value="stats.enrolledCourses"
        icon="courses"
        color="blue"
        :change="'+12%'"
      />
      
      <StatsCard
        title="Heures d'apprentissage"
        :value="`${stats.learningHours}h`"
        icon="clock"
        color="green"
        :change="'+5%'"
      />
      
      <StatsCard
        title="Tâches à faire"
        :value="stats.pendingAssignments"
        icon="assignment"
        color="orange"
        :change="'-2%'"
      />
      
      <StatsCard
        title="Score moyen"
        :value="`${stats.averageScore}%`"
        icon="score"
        color="purple"
        :change="'+3%'"
      />
    </div>
    
    <div class="dashboard-content">
      <div class="main-content">
        <div class="section">
          <div class="section-header">
            <h2>Cours en cours</h2>
            <router-link to="/courses" class="view-all">
              Voir tous
            </router-link>
          </div>
          
          <div v-if="enrolledCourses.length > 0" class="courses-grid">
            <CourseCard
              v-for="course in enrolledCourses.slice(0, 3)"
              :key="course._id"
              :course="course"
            />
          </div>
          
          <div v-else class="empty-state">
            <div class="empty-icon">
              <i class="icon-book"></i>
            </div>
            <h3>Aucun cours suivi</h3>
            <p>Commencez par explorer et vous inscrire à un cours</p>
            <router-link to="/courses" class="btn-primary">
              Explorer les cours
            </router-link>
          </div>
        </div>
        
        <div class="section">
          <div class="section-header">
            <h2>Prochaines sessions en direct</h2>
          </div>
          
          <div v-if="upcomingLiveClasses.length > 0" class="live-classes">
            <div
              v-for="session in upcomingLiveClasses"
              :key="session._id"
              class="live-session"
            >
              <div class="session-info">
                <h3>{{ session.title }}</h3>
                <p class="course-name">{{ session.courseTitle }}</p>
                <div class="session-meta">
                  <span class="time">
                    <i class="icon-calendar"></i>
                    {{ formatDate(session.startTime) }}
                  </span>
                  <span class="duration">
                    <i class="icon-clock"></i>
                    {{ session.duration }} min
                  </span>
                </div>
              </div>
              <button
                v-if="session.isStartingSoon"
                class="btn-join"
                @click="joinLiveClass(session._id)"
              >
                Rejoindre
              </button>
              <div v-else class="btn-upcoming">
                Bientôt
              </div>
            </div>
          </div>
          
          <div v-else class="empty-state">
            <div class="empty-icon">
              <i class="icon-video"></i>
            </div>
            <h3>Aucune session programmée</h3>
            <p>Revenez plus tard pour les prochaines sessions</p>
          </div>
        </div>
      </div>
      
      <div class="sidebar">
        <div class="sidebar-section">
          <h3>Progression globale</h3>
          <ProgressBar
            :progress="stats.overallProgress"
            label="Progression"
            :show-value="true"
          />
        </div>
        
        <div class="sidebar-section">
          <h3>Activité récente</h3>
          <RecentActivity :activities="recentActivities" />
        </div>
        
        <div class="sidebar-section">
          <h3>Tâches à venir</h3>
          <div v-if="upcomingAssignments.length > 0" class="assignments-list">
            <div
              v-for="assignment in upcomingAssignments"
              :key="assignment._id"
              class="assignment-item"
            >
              <div class="assignment-info">
                <h4>{{ assignment.title }}</h4>
                <p class="course-name">{{ assignment.courseTitle }}</p>
                <p class="due-date">
                  <i class="icon-deadline"></i>
                  Échéance: {{ formatDate(assignment.dueDate) }}
                </p>
              </div>
              <router-link
                :to="`/assignments/${assignment._id}`"
                class="btn-submit"
              >
                Soumettre
              </router-link>
            </div>
          </div>
          <div v-else class="empty-state small">
            <p>Aucune tâche à venir</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useCoursesStore } from '@/stores/courses';
import StatsCard from '@/components/dashboard/StatsCard.vue';
import ProgressBar from '@/components/dashboard/ProgressBar.vue';
import RecentActivity from '@/components/dashboard/RecentActivity.vue';
import CourseCard from '@/components/courses/CourseCard.vue';

const authStore = useAuthStore();
const coursesStore = useCoursesStore();

const user = ref(null);
const stats = ref({
  enrolledCourses: 0,
  learningHours: 42,
  pendingAssignments: 3,
  averageScore: 85,
  overallProgress: 67
});

const enrolledCourses = ref([]);
const upcomingLiveClasses = ref([]);
const upcomingAssignments = ref([]);
const recentActivities = ref([
  { id: 1, type: 'video_watched', title: 'Introduction à React', time: 'Il y a 2 heures' },
  { id: 2, type: 'assignment_submitted', title: 'TP JavaScript', time: 'Hier' },
  { id: 3, type: 'quiz_completed', title: 'Quiz HTML/CSS', score: '95%', time: 'Il y a 2 jours' },
  { id: 4, type: 'course_enrolled', title: 'Node.js Avancé', time: 'Il y a 3 jours' }
]);

onMounted(async () => {
  user.value = authStore.user;
  
  // Récupérer les cours de l'étudiant
  if (authStore.user) {
    await loadStudentData();
  }
});

const loadStudentData = async () => {
  try {
    // Simuler le chargement des données
    enrolledCourses.value = await coursesStore.getEnrolledCourses();
    stats.value.enrolledCourses = enrolledCourses.value.length;
    
    // Données simulées pour les sessions en direct
    upcomingLiveClasses.value = [
      {
        _id: '1',
        title: 'Introduction à Vue.js',
        courseTitle: 'Vue.js Masterclass',
        startTime: new Date(Date.now() + 3600000), // 1 heure plus tard
        duration: 60,
        isStartingSoon: true
      },
      {
        _id: '2',
        title: 'Routage avancé',
        courseTitle: 'Vue.js Masterclass',
        startTime: new Date(Date.now() + 86400000), // 1 jour plus tard
        duration: 45,
        isStartingSoon: false
      }
    ];
    
    // Tâches simulées
    upcomingAssignments.value = [
      {
        _id: '1',
        title: 'Projet final',
        courseTitle: 'Vue.js Masterclass',
        dueDate: new Date(Date.now() + 172800000) // 2 jours plus tard
      },
      {
        _id: '2',
        title: 'Quiz MongoDB',
        courseTitle: 'Base de données NoSQL',
        dueDate: new Date(Date.now() + 259200000) // 3 jours plus tard
      }
    ];
  } catch (error) {
    console.error('Erreur chargement données:', error);
  }
};

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const joinLiveClass = (classId) => {
  // Navigation vers la salle de classe en direct
  window.location.href = `/live/${classId}`;
};
</script>

<style scoped>
.student-dashboard {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.dashboard-header p {
  color: #6b7280;
  font-size: 1.125rem;
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.view-all {
  color: #4f46e5;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
}

.view-all:hover {
  text-decoration: underline;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.empty-state.small {
  padding: 1.5rem 1rem;
}

.empty-icon {
  font-size: 3rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.btn-primary {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: #4f46e5;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-weight: 500;
  transition: background 0.3s;
}

.btn-primary:hover {
  background: #4338ca;
}

.live-classes {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.live-session {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 4px solid #4f46e5;
}

.session-info h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.course-name {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.session-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #9ca3af;
}

.session-meta i {
  margin-right: 0.25rem;
}

.btn-join {
  padding: 0.5rem 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-join:hover {
  background: #0da271;
}

.btn-upcoming {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 5px;
  font-weight: 500;
  font-size: 0.875rem;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.sidebar-section {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.sidebar-section h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.assignments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.assignment-item {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 4px solid #f59e0b;
}

.assignment-info h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.due-date {
  font-size: 0.75rem;
  color: #dc2626;
  margin-top: 0.5rem;
}

.btn-submit {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: #4f46e5;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.btn-submit:hover {
  background: #4338ca;
}

@media (max-width: 1024px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
  
  .courses-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .student-dashboard {
    padding: 1rem;
  }
  
  .dashboard-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>