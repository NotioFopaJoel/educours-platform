<template>
  <div class="dashboard-layout">
    <!-- Header -->
    <header class="main-header">
      <div class="header-left">
        <button class="menu-toggle" @click="toggleSidebar">
          <i class="fas fa-bars"></i>
        </button>
        <router-link to="/dashboard" class="logo">
          <i class="fas fa-graduation-cap"></i>
          <span>EduCours</span>
        </router-link>
      </div>
      
      <div class="header-right">
        <!-- Notification Bell -->
        <div class="notification-bell" @click="toggleNotifications">
          <i class="fas fa-bell"></i>
          <span v-if="unreadCount > 0" class="notification-count">{{ unreadCount }}</span>
          
          <!-- Notification Dropdown -->
          <div v-if="showNotificationDropdown" class="notification-dropdown">
            <div class="notification-header">
              <h3>Notifications</h3>
              <button @click="markAllAsRead" class="mark-all-read">Mark all as read</button>
            </div>
            <div class="notification-list">
              <div v-for="notification in notifications" 
                   :key="notification.id" 
                   class="notification-item"
                   :class="{ unread: !notification.read }"
                   @click="handleNotificationClick(notification)">
                <div class="notification-icon">
                  <i :class="getNotificationIcon(notification.type)"></i>
                </div>
                <div class="notification-content">
                  <p class="notification-title">{{ notification.title }}</p>
                  <p class="notification-message">{{ notification.message }}</p>
                  <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
                </div>
              </div>
            </div>
            <div class="notification-footer">
              <router-link to="/notifications" class="view-all">View All Notifications</router-link>
            </div>
          </div>
        </div>
        
        <!-- WhatsApp Button -->
        <div class="whatsapp-float" @click="openWhatsApp">
          <i class="fab fa-whatsapp"></i>
        </div>
        
        <!-- User Profile Dropdown -->
        <div class="user-profile" @click="toggleUserDropdown">
          <div class="user-avatar">
            {{ getUserAvatar }}
          </div>
          <div class="user-info">
            <div class="user-name">{{ getUserFullName }}</div>
            <div class="user-role">{{ user.role | capitalize }}</div>
          </div>
          <i class="fas fa-chevron-down"></i>
          
          <!-- User Dropdown Menu -->
          <div v-if="showUserDropdown" class="user-dropdown">
            <div class="user-dropdown-header">
              <div class="user-avatar-large">
                {{ getUserAvatar }}
              </div>
              <div class="user-info-large">
                <div class="user-name">{{ getUserFullName }}</div>
                <div class="user-email">{{ user.email }}</div>
              </div>
            </div>
            <div class="user-dropdown-menu">
              <router-link to="/profile" class="dropdown-item" @click="showUserDropdown = false">
                <i class="fas fa-user"></i>
                <span>My Profile</span>
              </router-link>
              <router-link to="/profile/settings" class="dropdown-item" @click="showUserDropdown = false">
                <i class="fas fa-cog"></i>
                <span>Settings</span>
              </router-link>
              <div class="dropdown-divider"></div>
              <a href="#" class="dropdown-item" @click.prevent="logout">
                <i class="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
    
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ active: sidebarActive }">
      <div class="sidebar-header">
        <div class="user-info-sidebar">
          <div class="user-avatar-sidebar">
            {{ getUserAvatar }}
          </div>
          <div class="user-details-sidebar">
            <div class="user-name">{{ getUserFullName }}</div>
            <div class="user-role">{{ user.role | capitalize }}</div>
          </div>
        </div>
      </div>
      
      <nav class="sidebar-nav">
        <ul class="sidebar-menu">
          <!-- Student Menu -->
          <template v-if="user.role === 'student'">
            <li class="sidebar-item">
              <router-link to="/dashboard" class="sidebar-link" @click="closeSidebar">
                <i class="fas fa-home"></i>
                <span>Dashboard</span>
              </router-link>
            </li>
            <li class="sidebar-item">
              <router-link to="/courses" class="sidebar-link" @click="closeSidebar">
                <i class="fas fa-book"></i>
                <span>My Courses</span>
              </router-link>
            <li class="sidebar-item">
              <router-link to="/courses/browse" class="sidebar-link" @click="closeSidebar">
                <i class="fas fa-shopping-cart"></i>
                <span>Browse Courses</span>
              </router-link>
            </li>
            <li class="sidebar-item">
              <router-link to="/assignments" class="sidebar-link" @click="closeSidebar">
                <i class="fas fa-tasks"></i>
                <span>Assignments</span>
              </router-link>
            </li>
            <li class="sidebar-item">
              <router-link to="/materials" class="sidebar-link" @click="closeSidebar">
                <i class="fas fa-file-download"></i>
                <span>Materials</span>
              </router-link>
            </li>
            <li class="sidebar-item">
              <router-link to="/live-classes" class="sidebar-link" @click="closeSidebar">
                <i class="fas fa-video"></i>
                <span>Live Classes</span>
              </router-link>
            </li>
            <li class="sidebar-item">
              <router-link to="/payments" class="sidebar-link" @click="closeSidebar">
                <i class="fas fa-file-invoice-dollar"></i>
                <span>My Payments</span>
              </router-link>
            </li>
          </template>
          
          <!-- Teacher Menu -->
          <template v-else-if="user.role === 'teacher'">
            <li class="sidebar-item">
              <router-link to="/dashboard/teacher" class="sidebar-link" @click="closeSidebar">
                <i class="fas fa-chalkboard-teacher"></i>
                <span>Dashboard</span>
              </router-link>
            </li>
            <li class="sidebar-item">
              <router-link to="/teacher/courses" class="sidebar-link" @click="closeSidebar">
                <i class="fas fa-book"></i>
                <span>My Courses</span>
              </router-link>
            </li>
            <li class="sidebar-item">
              <router-link to="/teacher/students" class="sidebar-link" @click="closeSidebar">
                <i class="fas fa-users"></i>
                <span>My Students</span>
              </router-link>
            </li>
            <li class="sidebar-item">
              <router-link to="/teacher/assignments" class="sidebar-link" @click="closeSidebar">
                <i class="fas fa-tasks"></i>
                <span>Assignments</span>
              </router-link>
            </li>
            <li class="sidebar-item">
              <router-link to="/teacher/materials" class="sidebar-link" @click="closeSidebar">
                <i class="fas fa-file-upload"></i>
                <span>Materials</span>
              </router-link>
            </li>
            <li class="sidebar-item">
              <router-link to="/teacher/live-classes" class="sidebar-link" @click="closeSidebar">
                <i class="fas fa-video"></i>
                <span>Live Classes</span>
              </router-link>
            </li>
            <li class="sidebar-item">
              <router-link to="/teacher/quizzes" class="sidebar-link" @click="closeSidebar">
                <i class="fas fa-question-circle"></i>
                <span>Quizzes</span>
              </router-link>
            </li>
            <li class="sidebar-item">
              <router-link to="/teacher/earnings" class="sidebar-link" @click="closeSidebar">
                <i class="fas fa-money-bill"></i>
                <span>Earnings</span>
              </router-link>
            </li>
          </template>
          
          <!-- Admin Menu -->
          <template v-else-if="user.role === 'admin'">
            <li class="sidebar-item">
              <router-link to="/dashboard/admin" class="sidebar-link" @click="closeSidebar">
                <i class="fas fa-cogs"></i>
                <span>Dashboard</span>
              </router-link>
            </li>
            <li class="sidebar-item">
              <router-link to="/admin/courses" class="sidebar-link" @click="closeSidebar">
                <i class="fas fa-book"></i>
                <span>Manage Courses</span>
              </router-link>
            </li>
            <li class="sidebar-item">
              <router-link to="/admin/teachers" class="sidebar-link" @click="closeSidebar">
                <i class="fas fa-chalkboard-teacher"></i>
                <span>Control Teachers</span>
              </router-link>
            </li>
            <li class="sidebar-item">
              <router-link to="/admin/students" class="sidebar-link" @click="closeSidebar">
                <i class="fas fa-user-graduate"></i>
                <span>Control Students</span>
              </router-link>
            </li>
            <li class="sidebar-item">
              <router-link to="/admin/payments" class="sidebar-link" @click="closeSidebar">
                <i class="fas fa-money-check"></i>
                <span>Financial Reports</span>
              </router-link>
            </li>
            <li class="sidebar-item">
              <router-link to="/admin/messaging" class="sidebar-link" @click="closeSidebar">
                <i class="fas fa-comments"></i>
                <span>Messaging</span>
              </router-link>
            </li>
            <li class="sidebar-item">
              <router-link to="/admin/settings" class="sidebar-link" @click="closeSidebar">
                <i class="fas fa-cog"></i>
                <span>Settings</span>
              </router-link>
            </li>
          </template>
          
          <!-- Common Menu Items -->
          <li class="sidebar-divider"></li>
          <li class="sidebar-item">
            <router-link to="/profile" class="sidebar-link" @click="closeSidebar">
              <i class="fas fa-user"></i>
              <span>Profile</span>
            </router-link>
          </li>
          <li class="sidebar-item">
            <a href="#" class="sidebar-link" @click.prevent="logout">
              <i class="fas fa-sign-out-alt"></i>
              <span>Logout</span>
            </a>
          </li>
        </ul>
      </nav>
      
      <!-- Sidebar Footer -->
      <div class="sidebar-footer">
        <div class="sidebar-stats">
          <div class="stat-item" v-if="user.role === 'student'">
            <i class="fas fa-book-open"></i>
            <span>{{ enrolledCoursesCount }} Courses</span>
          </div>
          <div class="stat-item" v-else-if="user.role === 'teacher'">
            <i class="fas fa-users"></i>
            <span>{{ teacherStudentsCount }} Students</span>
          </div>
          <div class="stat-item" v-else-if="user.role === 'admin'">
            <i class="fas fa-chart-line"></i>
            <span>{{ totalRevenue | currency }} Revenue</span>
          </div>
        </div>
      </div>
    </aside>
    
    <!-- Main Content -->
    <main class="main-content" :class="{ 'sidebar-collapsed': !sidebarActive }">
      <div class="content-wrapper">
        <!-- Page Header -->
        <div class="page-header">
          <h1 class="page-title">{{ $route.meta.title || getPageTitle }}</h1>
          <div class="page-actions">
            <slot name="header-actions"></slot>
          </div>
        </div>
        
        <!-- Breadcrumb -->
        <nav class="breadcrumb" v-if="breadcrumbs.length > 0">
          <ol>
            <li v-for="(crumb, index) in breadcrumbs" :key="crumb.path">
              <router-link 
                :to="crumb.path" 
                :class="{ active: index === breadcrumbs.length - 1 }"
              >
                {{ crumb.title }}
              </router-link>
              <span v-if="index < breadcrumbs.length - 1" class="separator">/</span>
            </li>
          </ol>
        </nav>
        
        <!-- Page Content -->
        <div class="page-content">
          <slot></slot>
        </div>
      </div>
      
      <!-- Footer -->
      <footer class="main-footer">
        <div class="footer-content">
          <p>&copy; {{ currentYear }} EduCours - Created by Joël Notio Fopa</p>
          <div class="footer-links">
            <router-link to="/terms">Terms & Conditions</router-link>
            <router-link to="/privacy">Privacy Policy</router-link>
            <router-link to="/help">Help Center</router-link>
            <a href="tel:+237678095581">Contact: +237 678 09 55 81</a>
          </div>
        </div>
      </footer>
    </main>
    
    <!-- Modals -->
    <!-- Payment Modal -->
    <div v-if="showPaymentModal" class="modal-overlay" @click.self="closePaymentModal">
      <div class="modal-content payment-modal">
        <div class="modal-header">
          <h2>Course Payment</h2>
          <button class="close-modal" @click="closePaymentModal">&times;</button>
        </div>
        <div class="modal-body">
          <PaymentCheckout 
            v-if="selectedCourse" 
            :course="selectedCourse" 
            @payment-completed="handlePaymentCompleted"
            @cancel="closePaymentModal"
          />
        </div>
      </div>
    </div>
    
    <!-- Course Interface Modal -->
    <div v-if="showCourseModal" class="modal-overlay" @click.self="closeCourseModal">
      <div class="modal-content course-modal">
        <div class="modal-header">
          <h2>{{ currentCourse?.title }}</h2>
          <button class="close-modal" @click="closeCourseModal">&times;</button>
        </div>
        <div class="modal-body">
          <CourseInterface 
            v-if="currentCourse" 
            :course="currentCourse" 
            :user="user"
            @close="closeCourseModal"
          />
        </div>
      </div>
    </div>
    
    <!-- Assignment Modal -->
    <div v-if="showAssignmentModal" class="modal-overlay" @click.self="closeAssignmentModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Submit Assignment</h2>
          <button class="close-modal" @click="closeAssignmentModal">&times;</button>
        </div>
        <div class="modal-body">
          <AssignmentSubmission 
            v-if="selectedAssignment" 
            :assignment="selectedAssignment"
            @submitted="handleAssignmentSubmitted"
            @cancel="closeAssignmentModal"
          />
        </div>
      </div>
    </div>
    
    <!-- Quiz Modal -->
    <div v-if="showQuizModal" class="modal-overlay" @click.self="closeQuizModal">
      <div class="modal-content quiz-modal">
        <div class="modal-header">
          <h2>Course Quiz</h2>
          <button class="close-modal" @click="closeQuizModal">&times;</button>
        </div>
        <div class="modal-body">
          <QuizInterface 
            v-if="selectedQuiz" 
            :quiz="selectedQuiz"
            @completed="handleQuizCompleted"
            @cancel="closeQuizModal"
          />
        </div>
      </div>
    </div>
    
    <!-- Video Call Modal -->
    <div v-if="showVideoCallModal" class="modal-overlay video-call-overlay" @click.self="closeVideoCallModal">
      <div class="modal-content video-call-modal">
        <div class="modal-header">
          <h2>Live Class Session</h2>
          <button class="close-modal" @click="closeVideoCallModal">&times;</button>
        </div>
        <div class="modal-body">
          <LiveClassRoom 
            v-if="currentLiveClass" 
            :class="currentLiveClass"
            :user="user"
            @end-class="handleClassEnded"
          />
        </div>
      </div>
    </div>
    
    <!-- Notification Modal -->
    <div v-if="showNotificationModal" class="modal-overlay" @click.self="closeNotificationModal">
      <div class="modal-content notification-modal">
        <div class="modal-header">
          <h2>Notifications</h2>
          <button class="close-modal" @click="closeNotificationModal">&times;</button>
        </div>
        <div class="modal-body">
          <NotificationList 
            :notifications="notifications"
            @mark-as-read="markNotificationAsRead"
            @clear-all="clearAllNotifications"
          />
        </div>
      </div>
    </div>
    
    <!-- Profile Modal -->
    <div v-if="showProfileModal" class="modal-overlay" @click.self="closeProfileModal">
      <div class="modal-content profile-modal">
        <div class="modal-header">
          <h2>My Profile</h2>
          <button class="close-modal" @click="closeProfileModal">&times;</button>
        </div>
        <div class="modal-body">
          <ProfileEditor 
            :user="user"
            @updated="handleProfileUpdated"
            @cancel="closeProfileModal"
          />
        </div>
      </div>
    </div>
    
    <!-- Settings Modal -->
    <div v-if="showSettingsModal" class="modal-overlay" @click.self="closeSettingsModal">
      <div class="modal-content settings-modal">
        <div class="modal-header">
          <h2>Account Settings</h2>
          <button class="close-modal" @click="closeSettingsModal">&times;</button>
        </div>
        <div class="modal-body">
          <SettingsPanel 
            :user="user"
            @saved="handleSettingsSaved"
            @cancel="closeSettingsModal"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCourseStore } from '@/stores/courses'
import { useNotificationStore } from '@/stores/notifications'
import PaymentCheckout from '@/components/payment/PaymentCheckout.vue'
import CourseInterface from '@/components/courses/CourseInterface.vue'
import AssignmentSubmission from '@/components/assignments/AssignmentSubmission.vue'
import QuizInterface from '@/components/quizzes/QuizInterface.vue'
import LiveClassRoom from '@/components/live/LiveClassRoom.vue'
import NotificationList from '@/components/notifications/NotificationList.vue'
import ProfileEditor from '@/components/profile/ProfileEditor.vue'
import SettingsPanel from '@/components/settings/SettingsPanel.vue'
import { useToast } from 'vue-toastification'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const courseStore = useCourseStore()
const notificationStore = useNotificationStore()
const toast = useToast()
const globalLoading = inject('globalLoading')

// State
const sidebarActive = ref(window.innerWidth > 1200)
const showNotificationDropdown = ref(false)
const showUserDropdown = ref(false)
const showPaymentModal = ref(false)
const showCourseModal = ref(false)
const showAssignmentModal = ref(false)
const showQuizModal = ref(false)
const showVideoCallModal = ref(false)
const showNotificationModal = ref(false)
const showProfileModal = ref(false)
const showSettingsModal = ref(false)
const selectedCourse = ref(null)
const currentCourse = ref(null)
const selectedAssignment = ref(null)
const selectedQuiz = ref(null)
const currentLiveClass = ref(null)

// Computed properties
const user = computed(() => authStore.user)
const getUserAvatar = computed(() => authStore.getUserAvatar)
const getUserFullName = computed(() => authStore.getUserFullName)
const notifications = computed(() => notificationStore.notifications)
const unreadCount = computed(() => notificationStore.unreadCount)
const enrolledCoursesCount = computed(() => courseStore.enrolledCourses?.length || 0)
const teacherStudentsCount = computed(() => courseStore.teacherStudents || 0)
const totalRevenue = computed(() => courseStore.totalRevenue || 0)

const currentYear = computed(() => new Date().getFullYear())

const breadcrumbs = computed(() => {
  const crumbs = []
  const pathArray = route.path.split('/').filter(x => x)
  
  let currentPath = ''
  pathArray.forEach((segment, index) => {
    currentPath += '/' + segment
    
    const routeRecord = router.resolve(currentPath)
    const title = routeRecord.meta?.title || 
                  segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ')
    
    crumbs.push({
      path: currentPath,
      title: title
    })
  })
  
  return crumbs
})

const getPageTitle = computed(() => {
  return route.meta?.title || 
         route.name?.replace(/([A-Z])/g, ' $1').trim() ||
         'EduCours'
})

// Methods
const toggleSidebar = () => {
  sidebarActive.value = !sidebarActive.value
}

const closeSidebar = () => {
  if (window.innerWidth <= 1200) {
    sidebarActive.value = false
  }
}

const toggleNotifications = () => {
  showNotificationDropdown.value = !showNotificationDropdown.value
  showUserDropdown.value = false
}

const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value
  showNotificationDropdown.value = false
}

const openWhatsApp = () => {
  window.open('https://wa.me/237678095581?text=Hello%20EduCours%20Support%2C%20I%20need%20assistance', '_blank')
}

const logout = () => {
  authStore.logout()
  closeSidebar()
}

const markAllAsRead = async () => {
  try {
    await notificationStore.markAllAsRead()
    toast.success('All notifications marked as read')
  } catch (error) {
    toast.error('Failed to mark notifications as read')
  }
}

const markNotificationAsRead = async (notificationId) => {
  try {
    await notificationStore.markAsRead(notificationId)
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
  }
}

const clearAllNotifications = async () => {
  try {
    await notificationStore.clearAll()
    toast.success('All notifications cleared')
  } catch (error) {
    toast.error('Failed to clear notifications')
  }
}

const handleNotificationClick = (notification) => {
  markNotificationAsRead(notification.id)
  
  // Navigate based on notification type
  switch (notification.type) {
    case 'assignment':
      router.push('/assignments')
      break
    case 'payment':
      router.push('/payments')
      break
    case 'course':
      router.push('/courses')
      break
    case 'live_class':
      router.push('/live-classes')
      break
  }
  
  showNotificationDropdown.value = false
}

const formatTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return date.toLocaleDateString()
}

const getNotificationIcon = (type) => {
  switch (type) {
    case 'assignment': return 'fas fa-tasks'
    case 'payment': return 'fas fa-money-check'
    case 'course': return 'fas fa-book'
    case 'live_class': return 'fas fa-video'
    case 'message': return 'fas fa-comment'
    case 'system': return 'fas fa-cog'
    default: return 'fas fa-bell'
  }
}

// Modal methods
const openPaymentModal = (course) => {
  selectedCourse.value = course
  showPaymentModal.value = true
}

const closePaymentModal = () => {
  showPaymentModal.value = false
  selectedCourse.value = null
}

const openCourseModal = (course) => {
  currentCourse.value = course
  showCourseModal.value = true
}

const closeCourseModal = () => {
  showCourseModal.value = false
  currentCourse.value = null
}

const openAssignmentModal = (assignment) => {
  selectedAssignment.value = assignment
  showAssignmentModal.value = true
}

const closeAssignmentModal = () => {
  showAssignmentModal.value = false
  selectedAssignment.value = null
}

const openQuizModal = (quiz) => {
  selectedQuiz.value = quiz
  showQuizModal.value = true
}

const closeQuizModal = () => {
  showQuizModal.value = false
  selectedQuiz.value = null
}

const openVideoCallModal = (liveClass) => {
  currentLiveClass.value = liveClass
  showVideoCallModal.value = true
}

const closeVideoCallModal = () => {
  showVideoCallModal.value = false
  currentLiveClass.value = null
}

const openNotificationModal = () => {
  showNotificationModal.value = true
}

const closeNotificationModal = () => {
  showNotificationModal.value = false
}

const openProfileModal = () => {
  showProfileModal.value = true
}

const closeProfileModal = () => {
  showProfileModal.value = false
}

const openSettingsModal = () => {
  showSettingsModal.value = true
}

const closeSettingsModal = () => {
  showSettingsModal.value = false
}

// Event handlers
const handlePaymentCompleted = (payment) => {
  toast.success('Payment completed successfully!')
  closePaymentModal()
  // Refresh course data
  courseStore.fetchEnrolledCourses()
}

const handleAssignmentSubmitted = () => {
  toast.success('Assignment submitted successfully!')
  closeAssignmentModal()
}

const handleQuizCompleted = (result) => {
  toast.success(`Quiz completed! Score: ${result.score}/${result.total}`)
  closeQuizModal()
}

const handleClassEnded = () => {
  toast.info('Live class ended')
  closeVideoCallModal()
}

const handleProfileUpdated = (updatedUser) => {
  toast.success('Profile updated successfully!')
  closeProfileModal()
}

const handleSettingsSaved = () => {
  toast.success('Settings saved successfully!')
  closeSettingsModal()
}

// Initialize data
onMounted(async () => {
  globalLoading.value = true
  try {
    await Promise.all([
      courseStore.fetchEnrolledCourses(),
      notificationStore.fetchNotifications()
    ])
  } catch (error) {
    console.error('Failed to initialize dashboard data:', error)
  } finally {
    globalLoading.value = false
  }
  
  // Handle window resize
  const handleResize = () => {
    sidebarActive.value = window.innerWidth > 1200
  }
  
  window.addEventListener('resize', handleResize)
})

// Watch route changes
watch(() => route.path, () => {
  closeSidebar()
  showNotificationDropdown.value = false
  showUserDropdown.value = false
})
</script>

<style scoped>
/* Main Layout Styles */
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f7fb;
}

/* Header Styles - Keeping your original design */
.main-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height, 70px);
  background: white;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  padding: 0 2rem;
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.menu-toggle {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--dark, #343a40);
  cursor: pointer;
  display: none;
}

.logo {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--primary, #4361ee);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

/* Notification Bell - Your original design */
.notification-bell {
  position: relative;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background 0.3s;
}

.notification-bell:hover {
  background: #f8f9fa;
}

.notification-count {
  position: absolute;
  top: -5px;
  right: -5px;
  background: var(--danger, #e74c3c);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* WhatsApp Button - Your original design */
.whatsapp-float {
  background: #25d366;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);
  cursor: pointer;
  transition: all 0.3s;
  animation: pulse 2s infinite;
}

.whatsapp-float:hover {
  background: #128C7E;
  transform: scale(1.1);
}

/* User Profile - Your original design */
.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 10px;
  transition: background 0.3s;
  position: relative;
}

.user-profile:hover {
  background: #f8f9fa;
}

.user-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary, #4361ee), var(--secondary, #7209b7));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.2rem;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  font-size: 0.95rem;
}

.user-role {
  font-size: 0.8rem;
  color: var(--gray, #6c757d);
}

/* Sidebar Styles - Your original design */
.sidebar {
  position: fixed;
  top: var(--header-height, 70px);
  left: 0;
  width: var(--sidebar-width, 280px);
  height: calc(100vh - var(--header-height, 70px));
  background: var(--dark, #343a40);
  color: white;
  padding: 2rem 0;
  transition: transform 0.3s ease;
  z-index: 999;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.sidebar-menu {
  list-style: none;
  flex: 1;
}

.sidebar-item {
  margin-bottom: 5px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 1rem 2rem;
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  transition: all 0.3s;
  border-left: 4px solid transparent;
}

.sidebar-link:hover, 
.sidebar-link.router-link-active {
  background: rgba(255,255,255,0.1);
  color: white;
  border-left-color: var(--primary, #4361ee);
}

/* Main Content - Your original design */
.main-content {
  margin-left: var(--sidebar-width, 280px);
  margin-top: var(--header-height, 70px);
  padding: 2rem;
  min-height: calc(100vh - var(--header-height, 70px));
  background: #f5f7fb;
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
}

.main-content.sidebar-collapsed {
  margin-left: 0;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--light-gray, #e9ecef);
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--dark, #343a40);
}

.breadcrumb {
  margin-bottom: 2rem;
  background: white;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: var(--card-shadow, 0 5px 20px rgba(0,0,0,0.05));
}

.breadcrumb ol {
  display: flex;
  list-style: none;
  gap: 0.5rem;
  align-items: center;
}

.breadcrumb a {
  text-decoration: none;
  color: var(--gray, #6c757d);
  transition: color 0.3s;
}

.breadcrumb a:hover {
  color: var(--primary, #4361ee);
}

.breadcrumb a.active {
  color: var(--dark, #343a40);
  font-weight: 600;
}

.breadcrumb .separator {
  color: var(--light-gray, #e9ecef);
  margin: 0 0.5rem;
}

.page-content {
  flex: 1;
}

/* Footer */
.main-footer {
  margin-top: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 15px;
  box-shadow: var(--card-shadow, 0 5px 20px rgba(0,0,0,0.05));
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-links {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.footer-links a {
  text-decoration: none;
  color: var(--gray, #6c757d);
  transition: color 0.3s;
}

.footer-links a:hover {
  color: var(--primary, #4361ee);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: 20px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.4s ease;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.modal-header {
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid var(--light-gray, #e9ecef);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 2rem;
}

.close-modal {
  background: none;
  border: none;
  font-size: 1.8rem;
  color: var(--gray, #6c757d);
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.close-modal:hover {
  background: #f8f9fa;
  color: var(--danger, #e74c3c);
}

/* Specific modal sizes */
.course-modal {
  max-width: 1000px;
}

.quiz-modal {
  max-width: 800px;
}

.video-call-modal {
  max-width: 1000px;
  height: 90vh;
}

/* Dropdowns */
.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 350px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  z-index: 1001;
  margin-top: 10px;
  overflow: hidden;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 280px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  z-index: 1001;
  margin-top: 10px;
  overflow: hidden;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .menu-toggle {
    display: block;
  }
  
  .sidebar {
    transform: translateX(-100%);
  }
  
  .sidebar.active {
    transform: translateX(0);
  }
  
  .main-content {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .main-header {
    padding: 0 1rem;
  }
  
  .header-right {
    gap: 1rem;
  }
  
  .user-info {
    display: none;
  }
  
  .modal-content {
    margin: 1rem;
    padding: 1rem;
  }
  
  .modal-body {
    padding: 1.5rem;
  }
  
  .notification-dropdown {
    width: 300px;
    right: -50px;
  }
  
  .user-dropdown {
    width: 250px;
    right: -50px;
  }
}

@media (max-width: 576px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
  }
  
  .footer-links {
    justify-content: center;
  }
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7); }
  70% { box-shadow: 0 0 0 15px rgba(37, 211, 102, 0); }
  100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
}
</style>
