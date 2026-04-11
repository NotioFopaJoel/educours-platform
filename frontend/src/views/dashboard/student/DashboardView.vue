<template>
  <div class="student-dashboard">
    <!-- Welcome Section -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1>Welcome back, {{ user.firstName }}!</h1>
        <p>Continue your learning journey with EduCours</p>
      </div>
      <div class="welcome-actions">
        <button class="btn btn-primary" @click="browseCourses">
          <i class="fas fa-search"></i> Browse Courses
        </button>
        <button class="btn btn-outline" @click="viewLiveClasses">
          <i class="fas fa-video"></i> Join Live Class
        </button>
      </div>
    </div>
    
    <!-- Stats Overview -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon primary">
          <i class="fas fa-book-open"></i>
        </div>
        <div class="stat-info">
          <h3>{{ enrolledCourses.length }}</h3>
          <p>Active Courses</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon success">
          <i class="fas fa-tasks"></i>
        </div>
        <div class="stat-info">
          <h3>{{ pendingAssignments }}</h3>
          <p>Assignments Due</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon warning">
          <i class="fas fa-chart-line"></i>
        </div>
        <div class="stat-info">
          <h3>{{ averageProgress }}%</h3>
          <p>Average Progress</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon info">
          <i class="fas fa-calendar"></i>
        </div>
        <div class="stat-info">
          <h3>{{ upcomingClasses }}</h3>
          <p>Upcoming Classes</p>
        </div>
      </div>
    </div>
    
    <!-- Progress Overview -->
    <div class="progress-section">
      <div class="section-header">
        <h2>Course Progress</h2>
        <router-link to="/courses" class="btn btn-link">View All</router-link>
      </div>
      
      <div v-if="enrolledCourses.length > 0" class="progress-cards">
        <div v-for="course in enrolledCourses.slice(0, 3)" :key="course._id" class="course-progress-card">
          <div class="course-header">
            <div class="course-thumbnail">
              <img :src="course.thumbnail || '/images/course-default.jpg'" :alt="course.title">
            </div>
            <div class="course-info">
              <h4>{{ course.title }}</h4>
              <p class="course-subject">{{ course.subject }} • {{ course.level }}</p>
              <p class="course-teacher">
                <i class="fas fa-chalkboard-teacher"></i> {{ course.teacher?.firstName }} {{ course.teacher?.lastName }}
              </p>
            </div>
            <div class="course-progress-badge">
              {{ course.progress || 0 }}%
            </div>
          </div>
          
          <div class="progress-bar-container">
            <div class="progress-info">
              <span>Progress</span>
              <span>{{ course.progress || 0 }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: (course.progress || 0) + '%' }"></div>
            </div>
          </div>
          
          <div class="course-actions">
            <button class="btn btn-primary btn-sm" @click="enterCourse(course._id)">
              <i class="fas fa-door-open"></i> Continue
            </button>
            <button class="btn btn-outline btn-sm" @click="viewCourseMaterials(course._id)">
              <i class="fas fa-file-download"></i> Materials
            </button>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-book-open"></i>
        </div>
        <h3>No Courses Enrolled</h3>
        <p>You haven't enrolled in any courses yet. Start learning today!</p>
        <button class="btn btn-primary" @click="browseCourses">
          <i class="fas fa-search"></i> Browse Courses
        </button>
      </div>
    </div>
    
    <!-- Upcoming Classes -->
    <div class="live-classes-section">
      <div class="section-header">
        <h2>Upcoming Live Classes</h2>
        <router-link to="/live-classes" class="btn btn-link">View Schedule</router-link>
      </div>
      
      <div v-if="upcomingLiveClasses.length > 0" class="live-classes-grid">
        <div v-for="classItem in upcomingLiveClasses.slice(0, 2)" :key="classItem._id" class="live-class-card">
          <div class="class-header">
            <div class="class-subject">
              <i class="fas fa-video"></i> Live Class
            </div>
            <div class="class-time">
              <i class="fas fa-clock"></i> {{ formatTimeUntil(classItem.startTime) }}
            </div>
          </div>
          
          <h4>{{ classItem.title }}</h4>
          <p class="class-description">{{ classItem.description }}</p>
          
          <div class="class-details">
            <div class="detail-item">
              <i class="fas fa-calendar"></i>
              <span>{{ formatDate(classItem.startTime) }}</span>
            </div>
            <div class="detail-item">
              <i class="fas fa-clock"></i>
              <span>{{ formatTime(classItem.startTime) }} - {{ formatTime(classItem.endTime) }}</span>
            </div>
            <div class="detail-item">
              <i class="fas fa-chalkboard-teacher"></i>
              <span>{{ classItem.teacher?.firstName }} {{ classItem.teacher?.lastName }}</span>
            </div>
          </div>
          
          <button class="btn btn-primary" @click="joinLiveClass(classItem.meetingId)" :disabled="!canJoinClass(classItem)">
            <i class="fas fa-video"></i> 
            {{ canJoinClass(classItem) ? 'Join Class' : 'Starts ' + formatTimeUntil(classItem.startTime) }}
          </button>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-video"></i>
        </div>
        <h3>No Upcoming Classes</h3>
        <p>Check back later for scheduled live classes</p>
      </div>
    </div>
    
    <!-- Recent Assignments -->
    <div class="assignments-section">
      <div class="section-header">
        <h2>Recent Assignments</h2>
        <router-link to="/assignments" class="btn btn-link">View All</router-link>
      </div>
      
      <div v-if="recentAssignments.length > 0" class="assignments-list">
        <div v-for="assignment in recentAssignments" :key="assignment._id" class="assignment-card">
          <div class="assignment-header">
            <div class="assignment-title">
              <h4>{{ assignment.title }}</h4>
              <p class="course-name">{{ assignment.course?.title }}</p>
            </div>
            <div class="assignment-status" :class="getAssignmentStatus(assignment)">
              {{ getAssignmentStatusText(assignment) }}
            </div>
          </div>
          
          <p class="assignment-description">{{ assignment.description }}</p>
          
          <div class="assignment-details">
            <div class="detail-item">
              <i class="fas fa-calendar"></i>
              <span>Due: {{ formatDate(assignment.dueDate) }}</span>
            </div>
            <div class="detail-item">
              <i class="fas fa-star"></i>
              <span>Points: {{ assignment.totalPoints }}</span>
            </div>
            <div v-if="assignment.submission" class="detail-item">
              <i class="fas fa-check-circle"></i>
              <span>Submitted: {{ formatDate(assignment.submission.submittedAt) }}</span>
            </div>
          </div>
          
          <div class="assignment-actions">
            <button v-if="!assignment.submission" class="btn btn-primary btn-sm" @click="submitAssignment(assignment._id)">
              <i class="fas fa-upload"></i> Submit
            </button>
            <button v-else class="btn btn-outline btn-sm" @click="viewSubmission(assignment._id)">
              <i class="fas fa-eye"></i> View Submission
            </button>
            <button class="btn btn-link btn-sm" @click="downloadAssignment(assignment)">
              <i class="fas fa-download"></i> Download
            </button>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-tasks"></i>
        </div>
        <h3>No Assignments</h3>
        <p>You're all caught up with assignments!</p>
      </div>
    </div>
    
    <!-- Recommended Courses -->
    <div class="recommended-section">
      <div class="section-header">
        <h2>Recommended Courses</h2>
        <button class="btn btn-link" @click="refreshRecommendations">
          <i class="fas fa-sync-alt"></i> Refresh
        </button>
      </div>
      
      <div v-if="recommendedCourses.length > 0" class="courses-grid">
        <div v-for="course in recommendedCourses.slice(0, 3)" :key="course._id" class="course-card">
          <div class="course-thumbnail">
            <img :src="course.thumbnail || '/images/course-default.jpg'" :alt="course.title">
            <div class="course-badge">
              <i class="fas fa-fire"></i> Popular
            </div>
          </div>
          
          <div class="course-content">
            <div class="course-header">
              <span class="course-subject">{{ course.subject }}</span>
              <div class="course-rating">
                <i class="fas fa-star"></i> {{ course.averageRating?.toFixed(1) || '4.5' }}
              </div>
            </div>
            
            <h4>{{ course.title }}</h4>
            <p class="course-description">{{ course.shortDescription || course.description?.substring(0, 100) + '...' }}</p>
            
            <div class="course-meta">
              <span class="meta-item">
                <i class="fas fa-clock"></i> {{ course.duration?.value }} {{ course.duration?.unit }}
              </span>
              <span class="meta-item">
                <i class="fas fa-users"></i> {{ course.currentStudents }} students
              </span>
            </div>
            
            <div class="course-footer">
              <div class="course-price">
                <span v-if="course.discount > 0" class="original-price">{{ formatCurrency(course.price) }}</span>
                <span class="current-price">{{ formatCurrency(calculateDiscountedPrice(course)) }}</span>
              </div>
              <button class="btn btn-primary btn-sm" @click="viewCourseDetails(course._id)">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-book"></i>
        </div>
        <h3>No Recommendations</h3>
        <p>Complete more courses to get personalized recommendations</p>
      </div>
    </div>
    
    <!-- Activity Timeline -->
    <div class="activity-section">
      <div class="section-header">
        <h2>Recent Activity</h2>
      </div>
      
      <div v-if="recentActivity.length > 0" class="activity-timeline">
        <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
          <div class="activity-icon" :class="activity.type">
            <i :class="getActivityIcon(activity.type)"></i>
          </div>
          <div class="activity-content">
            <p class="activity-text">{{ activity.text }}</p>
            <span class="activity-time">{{ formatTimeAgo(activity.timestamp) }}</span>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <div class="empty-icon">
          <i class="fas fa-history"></i>
        </div>
        <h3>No Recent Activity</h3>
        <p>Your learning activity will appear here</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCourseStore } from '@/stores/courses'
import { useAssignmentStore } from '@/stores/assignments'
import { useLiveClassStore } from '@/stores/liveClasses'
import { useToast } from 'vue-toastification'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const router = useRouter()
const authStore = useAuthStore()
const courseStore = useCourseStore()
const assignmentStore = useAssignmentStore()
const liveClassStore = useLiveClassStore()
const toast = useToast()

// State
const loading = ref(false)
const recommendedCourses = ref([])
const recentActivity = ref([])

// Computed
const user = computed(() => authStore.user)
const enrolledCourses = computed(() => courseStore.enrolledCourses || [])
const averageProgress = computed(() => {
  if (enrolledCourses.value.length === 0) return 0
  const total = enrolledCourses.value.reduce((sum, course) => sum + (course.progress || 0), 0)
  return Math.round(total / enrolledCourses.value.length)
})

const pendingAssignments = computed(() => {
  return assignmentStore.assignments?.filter(assignment => {
    const dueDate = new Date(assignment.dueDate)
    const now = new Date()
    return dueDate > now && !assignment.submission
  }).length || 0
})

const upcomingClasses = computed(() => {
  return liveClassStore.upcomingClasses?.length || 0
})

const upcomingLiveClasses = computed(() => {
  return liveClassStore.upcomingClasses || []
})

const recentAssignments = computed(() => {
  return assignmentStore.assignments?.slice(0, 3) || []
})

// Methods
const browseCourses = () => {
  router.push('/courses/browse')
}

const viewLiveClasses = () => {
  router.push('/live-classes')
}

const enterCourse = (courseId) => {
  router.push(`/courses/${courseId}`)
}

const viewCourseMaterials = (courseId) => {
  router.push(`/courses/${courseId}/materials`)
}

const formatTimeUntil = (dateString) => {
  const date = dayjs(dateString)
  const now = dayjs()
  const diffMinutes = date.diff(now, 'minute')
  
  if (diffMinutes <= 0) return 'Now'
  if (diffMinutes < 60) return `in ${diffMinutes} min`
  if (diffMinutes < 1440) return `in ${Math.floor(diffMinutes / 60)} hours`
  return `in ${Math.floor(diffMinutes / 1440)} days`
}

const formatDate = (dateString) => {
  return dayjs(dateString).format('MMM D, YYYY')
}

const formatTime = (dateString) => {
  return dayjs(dateString).format('h:mm A')
}

const canJoinClass = (classItem) => {
  const now = new Date()
  const startTime = new Date(classItem.startTime)
  const timeDiff = startTime - now
  return timeDiff <= 15 * 60 * 1000 // 15 minutes before
}

const joinLiveClass = (meetingId) => {
  router.push(`/live/${meetingId}`)
}

const getAssignmentStatus = (assignment) => {
  const now = new Date()
  const dueDate = new Date(assignment.dueDate)
  
  if (assignment.submission) {
    if (assignment.submission.grade) return 'graded'
    return 'submitted'
  }
  
  if (now > dueDate) return 'overdue'
  if (dueDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) return 'due-soon'
  return 'pending'
}

const getAssignmentStatusText = (assignment) => {
  const status = getAssignmentStatus(assignment)
  switch (status) {
    case 'graded': return 'Graded'
    case 'submitted': return 'Submitted'
    case 'overdue': return 'Overdue'
    case 'due-soon': return 'Due Soon'
    default: return 'Pending'
  }
}

const submitAssignment = (assignmentId) => {
  router.push(`/assignments/${assignmentId}/submit`)
}

const viewSubmission = (assignmentId) => {
  router.push(`/assignments/${assignmentId}`)
}

const downloadAssignment = (assignment) => {
  toast.info('Download would start...')
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-CM', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0
  }).format(amount)
}

const calculateDiscountedPrice = (course) => {
  const price = course.price || 0
  const discount = course.discount || 0
  return price - (price * discount / 100)
}

const viewCourseDetails = (courseId) => {
  router.push(`/courses/${courseId}`)
}

const refreshRecommendations = async () => {
  try {
    loading.value = true
    // In production, this would call an API for recommendations
    toast.success('Recommendations refreshed')
  } catch (error) {
    console.error('Refresh recommendations error:', error)
    toast.error('Failed to refresh recommendations')
  } finally {
    loading.value = false
  }
}

const getActivityIcon = (type) => {
  switch (type) {
    case 'course_enrolled': return 'fas fa-book'
    case 'assignment_submitted': return 'fas fa-tasks'
    case 'live_class_attended': return 'fas fa-video'
    case 'quiz_completed': return 'fas fa-question-circle'
    case 'payment_made': return 'fas fa-money-check'
    default: return 'fas fa-bell'
  }
}

const formatTimeAgo = (timestamp) => {
  return dayjs(timestamp).fromNow()
}

const loadDashboardData = async () => {
  try {
    loading.value = true
    
    // Load all data in parallel
    await Promise.all([
      courseStore.fetchEnrolledCourses(),
      assignmentStore.fetchStudentAssignments(),
      liveClassStore.fetchUpcomingClasses()
    ])
    
    // Load sample recommendations
    // In production, this would come from an API
    recommendedCourses.value = [
      {
        _id: '1',
        title: 'Advanced Mathematics',
        subject: 'Mathematics',
        level: 'Advanced Level',
        description: 'Master advanced mathematical concepts and problem-solving techniques.',
        thumbnail: '/images/math-course.jpg',
        price: 15000,
        discount: 20,
        duration: { value: 3, unit: 'months' },
        currentStudents: 245,
        averageRating: 4.7
      },
      {
        _id: '2',
        title: 'Physics Fundamentals',
        subject: 'Physics',
        level: 'Ordinary Level',
        description: 'Learn the fundamental principles of physics with practical examples.',
        thumbnail: '/images/physics-course.jpg',
        price: 12000,
        discount: 10,
        duration: { value: 2, unit: 'months' },
        currentStudents: 189,
        averageRating: 4.5
      },
      {
        _id: '3',
        title: 'Computer Science Basics',
        subject: 'Computer Science',
        level: 'Beginner',
        description: 'Introduction to programming and computer science concepts.',
        thumbnail: '/images/cs-course.jpg',
        price: 18000,
        discount: 15,
        duration: { value: 4, unit: 'months' },
        currentStudents: 312,
        averageRating: 4.8
      }
    ]
    
    // Load sample activity
    recentActivity.value = [
      {
        id: 1,
        type: 'course_enrolled',
        text: 'Enrolled in Advanced Mathematics course',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: 2,
        type: 'assignment_submitted',
        text: 'Submitted Calculus Assignment',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        id: 3,
        type: 'live_class_attended',
        text: 'Attended Physics Live Class',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000)
      },
      {
        id: 4,
        type: 'quiz_completed',
        text: 'Completed Algebra Quiz with 85% score',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
      }
    ]
    
  } catch (error) {
    console.error('Load dashboard data error:', error)
    toast.error('Failed to load dashboard data')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.student-dashboard {
  padding: 1rem;
}

.welcome-section {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  padding: 2rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.welcome-content h1 {
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
}

.welcome-content p {
  opacity: 0.9;
  font-size: 1.1rem;
}

.welcome-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.welcome-actions .btn {
  padding: 0.8rem 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--card-shadow);
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--hover-shadow);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-icon.primary {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
}

.stat-icon.success {
  background: linear-gradient(135deg, var(--success), #27ae60);
  color: white;
}

.stat-icon.warning {
  background: linear-gradient(135deg, var(--warning), #e67e22);
  color: white;
}

.stat-icon.info {
  background: linear-gradient(135deg, var(--info), #2980b9);
  color: white;
}

.stat-info h3 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: var(--dark);
}

.stat-info p {
  color: var(--gray);
  margin: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.5rem;
  color: var(--dark);
}

.progress-section,
.live-classes-section,
.assignments-section,
.recommended-section,
.activity-section {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: var(--card-shadow);
}

.progress-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.course-progress-card {
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s;
}

.course-progress-card:hover {
  border-color: var(--primary);
  box-shadow: 0 5px 20px rgba(0,0,0,0.08);
}

.course-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.course-thumbnail {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.course-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-info h4 {
  margin: 0 0 0.3rem 0;
  font-size: 1.1rem;
}

.course-subject {
  color: var(--primary);
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}

.course-teacher {
  color: var(--gray);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.course-progress-badge {
  margin-left: auto;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  height: fit-content;
}

.progress-bar-container {
  margin-bottom: 1.5rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.progress-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  border-radius: 4px;
  transition: width 0.5s ease;
}

.course-actions {
  display: flex;
  gap: 0.5rem;
}

.live-classes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.live-class-card {
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s;
}

.live-class-card:hover {
  border-color: var(--warning);
  box-shadow: 0 5px 20px rgba(0,0,0,0.08);
}

.class-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.class-subject {
  background: linear-gradient(135deg, var(--warning), #e67e22);
  color: white;
  padding: 0.3rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.class-time {
  color: var(--gray);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.live-class-card h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.class-description {
  color: var(--gray);
  font-size: 0.95rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.class-details {
  display: grid;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray);
  font-size: 0.9rem;
}

.live-class-card .btn {
  width: 100%;
}

.assignments-list {
  display: grid;
  gap: 1rem;
}

.assignment-card {
  border: 1px solid #dee2e6;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s;
}

.assignment-card:hover {
  border-color: var(--primary);
  box-shadow: 0 5px 20px rgba(0,0,0,0.08);
}

.assignment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.assignment-title h4 {
  margin: 0 0 0.3rem 0;
  font-size: 1.1rem;
}

.course-name {
  color: var(--gray);
  font-size: 0.9rem;
}

.assignment-status {
  padding: 0.3rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.assignment-status.graded {
  background: linear-gradient(135deg, #d4edda, #c3e6cb);
  color: #155724;
}

.assignment-status.submitted {
  background: linear-gradient(135deg, #cce5ff, #b8daff);
  color: #004085;
}

.assignment-status.overdue {
  background: linear-gradient(135deg, #f8d7da, #f5c6cb);
  color: #721c24;
}

.assignment-status.due-soon {
  background: linear-gradient(135deg, #fff3cd, #ffeaa7);
  color: #856404;
}

.assignment-status.pending {
  background: linear-gradient(135deg, #e2e3e5, #d6d8db);
  color: #383d41;
}

.assignment-description {
  color: var(--gray);
  font-size: 0.95rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.assignment-details {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.assignment-actions {
  display: flex;
  gap: 0.5rem;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.course-card {
  border: 1px solid #dee2e6;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--hover-shadow);
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
}

.course-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.course-content {
  padding: 1.5rem;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.course-subject {
  background: #f0f7ff;
  color: var(--primary);
  padding: 0.2rem 0.8rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
}

.course-rating {
  color: #ffc107;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.course-content h4 {
  margin: 0 0 0.8rem 0;
  font-size: 1.1rem;
  line-height: 1.3;
}

.course-description {
  color: var(--gray);
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.course-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.course-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-price .original-price {
  text-decoration: line-through;
  color: var(--gray);
  font-size: 0.9rem;
  margin-right: 0.5rem;
}

.course-price .current-price {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--primary);
}

.activity-timeline {
  border-left: 2px solid #e9ecef;
  margin-left: 1rem;
  padding-left: 2rem;
}

.activity-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  position: relative;
}

.activity-item:last-child {
  margin-bottom: 0;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: absolute;
  left: -2.2rem;
}

.activity-icon.course_enrolled {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
}

.activity-icon.assignment_submitted {
  background: linear-gradient(135deg, var(--success), #27ae60);
  color: white;
}

.activity-icon.live_class_attended {
  background: linear-gradient(135deg, var(--warning), #e67e22);
  color: white;
}

.activity-icon.quiz_completed {
  background: linear-gradient(135deg, var(--info), #2980b9);
  color: white;
}

.activity-icon.payment_made {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  color: white;
}

.activity-content {
  flex: 1;
}

.activity-text {
  margin: 0 0 0.3rem 0;
  color: var(--dark);
}

.activity-time {
  color: var(--gray);
  font-size: 0.85rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: #f8f9fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2rem;
  color: var(--gray);
}

.empty-state h3 {
  margin-bottom: 0.5rem;
  color: var(--dark);
}

.empty-state p {
  color: var(--gray);
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .welcome-section {
    flex-direction: column;
    text-align: center;
  }
  
  .progress-cards,
  .live-classes-grid,
  .courses-grid {
    grid-template-columns: 1fr;
  }
  
  .activity-timeline {
    margin-left: 0.5rem;
    padding-left: 1.5rem;
  }
  
  .activity-icon {
    width: 30px;
    height: 30px;
    font-size: 0.8rem;
    left: -1.6rem;
  }
}
</style>