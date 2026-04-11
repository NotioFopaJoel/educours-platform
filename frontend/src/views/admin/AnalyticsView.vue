<template>
  <div class="analytics-view">
    <!-- En-tête avec sélecteur de période -->
    <div class="analytics-header">
      <h1>Tableau de Bord Analytique</h1>
      <div class="period-selector">
        <button
            v-for="period in periods"
            :key="period.value"
            class="period-btn"
            :class="{ active: selectedPeriod === period.value }"
            @click="selectedPeriod = period.value"
        >
          {{ period.label }}
        </button>
        <input type="date" v-model="customStartDate" class="date-input">
        <span>à</span>
        <input type="date" v-model="customEndDate" class="date-input">
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card revenue">
        <div class="kpi-icon">
          <i class="icon-revenue"></i>
        </div>
        <div class="kpi-content">
          <div class="kpi-label">Revenu Total</div>
          <div class="kpi-value">{{ totalRevenue.toLocaleString() }} FCFA</div>
          <div class="kpi-change positive">+12.5% vs période précédente</div>
        </div>
      </div>

      <div class="kpi-card students">
        <div class="kpi-icon">
          <i class="icon-students"></i>
        </div>
        <div class="kpi-content">
          <div class="kpi-label">Nouveaux Étudiants</div>
          <div class="kpi-value">{{ newStudents }}</div>
          <div class="kpi-change positive">+8.2%</div>
        </div>
      </div>

      <div class="kpi-card courses">
        <div class="kpi-icon">
          <i class="icon-courses"></i>
        </div>
        <div class="kpi-content">
          <div class="kpi-label">Cours Vendu</div>
          <div class="kpi-value">{{ coursesSold }}</div>
          <div class="kpi-change positive">+15.3%</div>
        </div>
      </div>

      <div class="kpi-card completion">
        <div class="kpi-icon">
          <i class="icon-completion"></i>
        </div>
        <div class="kpi-content">
          <div class="kpi-label">Taux de Complétion</div>
          <div class="kpi-value">{{ completionRate }}%</div>
          <div class="kpi-change negative">-2.1%</div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-grid">
      <!-- Revenu Chart -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>Revenus Mensuels</h3>
          <select v-model="revenueChartType" class="chart-type-select">
            <option value="line">Ligne</option>
            <option value="bar">Barres</option>
          </select>
        </div>
        <div class="chart-container">
          <div class="chart-placeholder">
            <p>Graphique des revenus mensuels</p>
            <p>Intégrez Chart.js ici</p>
          </div>
        </div>
      </div>

      <!-- Top Courses Chart -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>Top 5 Cours</h3>
          <select v-model="topCoursesMetric" class="chart-type-select">
            <option value="revenue">Par revenu</option>
            <option value="students">Par étudiants</option>
          </select>
        </div>
        <div class="chart-container">
          <div class="top-courses-list">
            <div v-for="course in topCourses" :key="course.id" class="course-item">
              <div class="course-info">
                <div class="course-name">{{ course.name }}</div>
                <div class="course-metric">
                  {{ topCoursesMetric === 'revenue' ? course.revenue.toLocaleString() + ' FCFA' : course.students + ' étudiants' }}
                </div>
              </div>
              <div class="course-progress">
                <div class="progress-bar">
                  <div
                      class="progress-fill"
                      :style="{ width: course.percentage + '%' }"
                  ></div>
                </div>
                <div class="percentage">{{ course.percentage }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Additional Stats Grid -->
    <div class="stats-grid">
      <!-- Geographic Distribution -->
      <div class="stats-card">
        <div class="stats-header">
          <h3>Distribution Géographique</h3>
          <button class="btn-icon" @click="exportGeoData">
            <i class="icon-export"></i>
          </button>
        </div>
        <div class="stats-content">
          <div class="countries-list">
            <div v-for="country in topCountries" :key="country.code" class="country-item">
              <div class="country-info">
                <span class="flag">🇨🇮</span>
                <span class="country-name">{{ country.name }}</span>
              </div>
              <div class="country-stats">
                <span class="country-students">{{ country.students }} étudiants</span>
                <span class="country-percentage">{{ country.percentage }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Platform Stats -->
      <div class="stats-card">
        <div class="stats-header">
          <h3>Statistiques Plateforme</h3>
        </div>
        <div class="stats-content">
          <div class="platform-stats">
            <div class="stat-item">
              <div class="stat-label">App Mobile</div>
              <div class="stat-value">{{ mobileUsers }} utilisateurs</div>
              <div class="stat-percentage">45%</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Web Desktop</div>
              <div class="stat-value">{{ desktopUsers }} utilisateurs</div>
              <div class="stat-percentage">35%</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Tablette</div>
              <div class="stat-value">{{ tabletUsers }} utilisateurs</div>
              <div class="stat-percentage">20%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Teacher Performance -->
      <div class="stats-card">
        <div class="stats-header">
          <h3>Performance des Professeurs</h3>
        </div>
        <div class="stats-content">
          <div class="teachers-performance">
            <div v-for="teacher in topTeachers" :key="teacher.id" class="teacher-item">
              <img
                  :src="teacher.avatar || '/images/avatar-default.png'"
                  :alt="teacher.name"
                  class="teacher-avatar"
              >
              <div class="teacher-info">
                <div class="teacher-name">{{ teacher.name }}</div>
                <div class="teacher-rating">
                  <span class="stars">
                    <i
                        v-for="n in 5"
                        :key="n"
                        :class="n <= teacher.rating ? 'icon-star-filled' : 'icon-star-empty'"
                    ></i>
                  </span>
                  <span class="rating">{{ teacher.rating.toFixed(1) }}</span>
                </div>
              </div>
              <div class="teacher-metric">
                {{ teacher.courses }} cours
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="activity-section">
      <div class="section-header">
        <h2>Activité Récente</h2>
        <button class="btn-secondary" @click="viewAllActivity">
          Voir tout
        </button>
      </div>
      <div class="activity-list">
        <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
          <div class="activity-icon" :class="activity.type">
            <i :class="getActivityIcon(activity.type)"></i>
          </div>
          <div class="activity-content">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-details">{{ activity.details }}</div>
            <div class="activity-time">{{ activity.time }}</div>
          </div>
          <div class="activity-meta">
            <span class="activity-user">{{ activity.user }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Download Reports -->
    <div class="reports-section">
      <div class="section-header">
        <h2>Rapports Disponibles</h2>
      </div>
      <div class="reports-grid">
        <div class="report-card" @click="generateReport('monthly')">
          <div class="report-icon">
            <i class="icon-report"></i>
          </div>
          <div class="report-info">
            <h4>Rapport Mensuel</h4>
            <p>Revenus, étudiants, cours pour le mois</p>
            <div class="report-size">PDF, 15 pages</div>
          </div>
          <button class="btn-download">
            <i class="icon-download"></i>
          </button>
        </div>

        <div class="report-card" @click="generateReport('financial')">
          <div class="report-icon">
            <i class="icon-finance"></i>
          </div>
          <div class="report-info">
            <h4>Rapport Financier</h4>
            <p>Analyse complète des revenus et dépenses</p>
            <div class="report-size">Excel, 5 feuilles</div>
          </div>
          <button class="btn-download">
            <i class="icon-download"></i>
          </button>
        </div>

        <div class="report-card" @click="generateReport('students')">
          <div class="report-icon">
            <i class="icon-students-report"></i>
          </div>
          <div class="report-info">
            <h4>Rapport Étudiants</h4>
            <p>Démographie, progression, rétention</p>
            <div class="report-size">PDF, 20 pages</div>
          </div>
          <button class="btn-download">
            <i class="icon-download"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// États
const selectedPeriod = ref('month')
const customStartDate = ref('')
const customEndDate = ref('')
const revenueChartType = ref('line')
const topCoursesMetric = ref('revenue')

const periods = [
  { value: 'day', label: 'Aujourd\'hui' },
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
  { value: 'quarter', label: 'Ce trimestre' },
  { value: 'year', label: 'Cette année' }
]

// Données simulées
const totalRevenue = ref(1250000)
const newStudents = ref(342)
const coursesSold = ref(567)
const completionRate = ref(68.5)

const topCourses = ref([
  { id: 1, name: 'Introduction à JavaScript', revenue: 450000, students: 180, percentage: 85 },
  { id: 2, name: 'Algèbre Avancée', revenue: 320000, students: 150, percentage: 72 },
  { id: 3, name: 'Physique Quantique', revenue: 280000, students: 95, percentage: 65 },
  { id: 4, name: 'Programmation Python', revenue: 240000, students: 120, percentage: 58 },
  { id: 5, name: 'Maths Financières', revenue: 210000, students: 105, percentage: 50 }
])

const topCountries = ref([
  { code: 'ci', name: 'Côte d\'Ivoire', students: 1250, percentage: 42 },
  { code: 'sn', name: 'Sénégal', students: 850, percentage: 28 },
  { code: 'cm', name: 'Cameroun', students: 450, percentage: 15 },
  { code: 'fr', name: 'France', students: 250, percentage: 8 },
  { code: 'other', name: 'Autres', students: 200, percentage: 7 }
])

const mobileUsers = ref(1350)
const desktopUsers = ref(1050)
const tabletUsers = ref(600)

const topTeachers = ref([
  { id: 1, name: 'Dr. Jean Dupont', rating: 4.8, courses: 8, avatar: '/images/avatar1.jpg' },
  { id: 2, name: 'Prof. Marie Curie', rating: 4.9, courses: 6, avatar: '/images/avatar2.jpg' },
  { id: 3, name: 'Dr. Albert Einstein', rating: 4.7, courses: 5, avatar: null },
  { id: 4, name: 'Prof. Alioune Diop', rating: 4.6, courses: 4, avatar: null }
])

const recentActivities = ref([
  {
    id: 1,
    type: 'payment',
    title: 'Nouveau paiement reçu',
    details: 'Koffi Kouamé a payé 25,000 FCFA pour "Introduction à JavaScript"',
    time: 'Il y a 15 minutes',
    user: 'STU2024001'
  },
  {
    id: 2,
    type: 'enrollment',
    title: 'Nouvelle inscription',
    details: 'Amina Diallo s\'est inscrite au cours "Algèbre Avancée"',
    time: 'Il y a 1 heure',
    user: 'STU2024002'
  },
  {
    id: 3,
    type: 'course',
    title: 'Nouveau cours publié',
    details: '"Programmation Python" a été publié par Dr. Jean Dupont',
    time: 'Il y a 3 heures',
    user: 'PROF001'
  },
  {
    id: 4,
    type: 'completion',
    title: 'Cours complété',
    details: 'Pierre Martin a complété "Introduction à JavaScript" avec succès',
    time: 'Il y a 5 heures',
    user: 'STU2024003'
  },
  {
    id: 5,
    type: 'support',
    title: 'Ticket support résolu',
    details: 'Problème de connexion résolu pour Fatou Diop',
    time: 'Hier',
    user: 'SUPPORT001'
  }
])

// Méthodes utilitaires
const getActivityIcon = (type) => {
  const icons = {
    payment: 'icon-payment',
    enrollment: 'icon-user-add',
    course: 'icon-course',
    completion: 'icon-check-circle',
    support: 'icon-support'
  }
  return icons[type] || 'icon-activity'
}

const exportGeoData = () => {
  console.log('Export des données géographiques')
}

const viewAllActivity = () => {
  console.log('Voir toute l\'activité')
}

const generateReport = (type) => {
  console.log('Génération du rapport:', type)
  // Logique de génération de rapport
}

onMounted(() => {
  console.log('AnalyticsView monté')
})
</script>

<style scoped>
.analytics-view {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.analytics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.analytics-header h1 {
  color: #2c3e50;
  font-size: 28px;
  margin: 0;
}

.period-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.period-btn {
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.period-btn.active {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.date-input {
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.kpi-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  transition: transform 0.3s;
}

.kpi-card:hover {
  transform: translateY(-5px);
}

.kpi-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.kpi-card.revenue .kpi-icon {
  background-color: rgba(52, 152, 219, 0.1);
  color: #3498db;
}

.kpi-card.students .kpi-icon {
  background-color: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
}

.kpi-card.courses .kpi-icon {
  background-color: rgba(155, 89, 182, 0.1);
  color: #9b59b6;
}

.kpi-card.completion .kpi-icon {
  background-color: rgba(241, 196, 15, 0.1);
  color: #f1c40f;
}

.kpi-label {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 8px;
}

.kpi-value {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
}

.kpi-change {
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.kpi-change.positive {
  background-color: #d4edda;
  color: #155724;
}

.kpi-change.negative {
  background-color: #f8d7da;
  color: #721c24;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  margin: 0;
  color: #2c3e50;
}

.chart-type-select {
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  font-size: 14px;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 8px;
}

.chart-placeholder {
  text-align: center;
  color: #7f8c8d;
}

.top-courses-list {
  width: 100%;
}

.course-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eef0f2;
}

.course-item:last-child {
  border-bottom: none;
}

.course-info {
  flex: 1;
}

.course-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.course-metric {
  font-size: 14px;
  color: #7f8c8d;
}

.course-progress {
  display: flex;
  align-items: center;
  gap: 15px;
  width: 200px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #3498db;
  border-radius: 4px;
  transition: width 0.3s;
}

.percentage {
  font-weight: 600;
  color: #2c3e50;
  min-width: 40px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stats-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.stats-header {
  padding: 20px;
  border-bottom: 1px solid #eef0f2;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-header h3 {
  margin: 0;
  color: #2c3e50;
}

.stats-content {
  padding: 20px;
}

.countries-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.country-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.country-item:hover {
  background-color: #f8f9fa;
}

.country-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.flag {
  font-size: 20px;
}

.country-name {
  font-weight: 600;
  color: #2c3e50;
}

.country-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.country-students {
  font-size: 14px;
  color: #7f8c8d;
}

.country-percentage {
  font-weight: 600;
  color: #3498db;
}

.platform-stats {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-label {
  font-weight: 600;
  color: #2c3e50;
}

.stat-value {
  color: #7f8c8d;
}

.stat-percentage {
  font-weight: 700;
  color: #3498db;
}

.teachers-performance {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.teacher-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.teacher-item:hover {
  background-color: #f8f9fa;
}

.teacher-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.teacher-info {
  flex: 1;
}

.teacher-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.teacher-rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stars i {
  color: #f39c12;
  font-size: 12px;
  margin-right: 2px;
}

.rating {
  font-size: 12px;
  color: #7f8c8d;
}

.teacher-metric {
  font-weight: 600;
  color: #3498db;
}

.activity-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  color: #2c3e50;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.activity-item:hover {
  background-color: #f8f9fa;
}

.activity-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.activity-icon.payment {
  background-color: rgba(52, 152, 219, 0.1);
  color: #3498db;
}

.activity-icon.enrollment {
  background-color: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
}

.activity-icon.course {
  background-color: rgba(155, 89, 182, 0.1);
  color: #9b59b6;
}

.activity-icon.completion {
  background-color: rgba(241, 196, 15, 0.1);
  color: #f1c40f;
}

.activity-icon.support {
  background-color: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.activity-details {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 12px;
  color: #95a5a6;
}

.activity-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.activity-user {
  font-size: 12px;
  color: #7f8c8d;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
}

.reports-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.report-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.report-card:hover {
  border-color: #3498db;
  transform: translateY(-3px);
}

.report-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background-color: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.report-info {
  flex: 1;
}

.report-info h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.report-info p {
  margin: 0 0 8px 0;
  color: #7f8c8d;
  font-size: 14px;
}

.report-size {
  font-size: 12px;
  color: #95a5a6;
}

.btn-download {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: white;
  border: 2px solid #e0e0e0;
  color: #3498db;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-download:hover {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

/* Responsive */
@media (max-width: 768px) {
  .analytics-header {
    flex-direction: column;
    align-items: stretch;
  }

  .period-selector {
    justify-content: center;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .reports-grid {
    grid-template-columns: 1fr;
  }

  .activity-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .activity-meta {
    align-self: flex-end;
  }
}
</style>