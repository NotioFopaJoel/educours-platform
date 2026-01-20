

/* frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { setupAuthGuards, adminGuard, teacherGuard, studentGuard } from './guards';
import { useAuthStore } from '@/stores/auth';

// Import des vues
const LoginView = () => import('@/views/auth/LoginView.vue');
const RegisterView = () => import('@/views/auth/RegisterView.vue');
const VerifyEmailView = () => import('@/views/auth/VerifyEmailView.vue');
const ForgotPasswordView = () => import('@/views/auth/ForgotPasswordView.vue');
const ResetPasswordView = () => import('@/views/auth/ResetPasswordView.vue');

// Layouts
const BaseLayout = () => import('@/views/dashboard/BaseLayout.vue');

// Dashboard views
const StudentDashboard = () => import('@/views/dashboard/student/DashboardView.vue');
const TeacherDashboard = () => import('@/views/dashboard/teacher/DashboardView.vue');
const AdminDashboard = () => import('@/views/dashboard/admin/DashboardView.vue');

// Pages publiques
const WelcomeView = () => import('@/views/WelcomeView.vue');
const CoursesView = () => import('@/views/courses/CourseListView.vue');
const CourseDetailView = () => import('@/views/courses/CourseDetailView.vue');

// Pages d'erreur
const NotFoundView = () => import('@/views/errors/NotFoundView.vue');
const UnauthorizedView = () => import('@/views/errors/UnauthorizedView.vue');
const MaintenanceView = () => import('@/views/errors/MaintenanceView.vue');

const routes = [
  // === Routes publiques ===
  {
    path: '/',
    name: 'welcome',
    component: WelcomeView,
    meta: {
      title: 'Bienvenue',
      requiresGuest: true
    }
  },
  {
    path: '/courses',
    name: 'courses',
    component: CoursesView,
    meta: {
      title: 'Nos Cours'
    }
  },
  {
    path: '/courses/:id',
    name: 'course-detail',
    component: CourseDetailView,
    meta: {
      title: 'Détail du cours'
    }
  },

  // === Authentification ===
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      title: 'Connexion',
      requiresGuest: true
    }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: {
      title: 'Inscription',
      requiresGuest: true
    }
  },
  {
    path: '/verify-email',
    name: 'verify-email',
    component: VerifyEmailView,
    meta: {
      title: 'Vérification Email',
      requiresAuth: true,
      requiresVerified: false
    }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPasswordView,
    meta: {
      title: 'Mot de passe oublié',
      requiresGuest: true
    }
  },
  {
    path: '/reset-password/:token',
    name: 'reset-password',
    component: ResetPasswordView,
    meta: {
      title: 'Réinitialisation mot de passe',
      requiresGuest: true
    }
  },

  // === Dashboard (Layout principal) ===
  {
    path: '/dashboard',
    component: BaseLayout,
    meta: { requiresAuth: true },
    children: [
      // Dashboard par rôle
      {
        path: '',
        name: 'dashboard',
        redirect: (to) => {
          const authStore = useAuthStore();
          switch (authStore.user?.role) {
            case 'admin': return { name: 'admin-dashboard' };
            case 'teacher': return { name: 'teacher-dashboard' };
            case 'student': return { name: 'student-dashboard' };
            default: return { name: 'student-dashboard' };
          }
        }
      },
      {
        path: 'student',
        name: 'student-dashboard',
        component: StudentDashboard,
        meta: {
          title: 'Tableau de bord étudiant',
          role: 'student'
        },
        beforeEnter: studentGuard
      },
      {
        path: 'teacher',
        name: 'teacher-dashboard',
        component: TeacherDashboard,
        meta: {
          title: 'Tableau de bord enseignant',
          role: 'teacher'
        },
        beforeEnter: teacherGuard
      },
      {
        path: 'admin',
        name: 'admin-dashboard',
        component: AdminDashboard,
        meta: {
          title: 'Tableau de bord administrateur',
          role: 'admin'
        },
        beforeEnter: adminGuard
      },

      // Sous-routes communes
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/profile/ProfileView.vue'),
        meta: {
          title: 'Mon Profil',
          requiresAuth: true
        }
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/views/profile/SettingsView.vue'),
        meta: {
          title: 'Paramètres',
          requiresAuth: true
        }
      }
    ]
  },

  // === Routes admin ===
  {
    path: '/admin',
    component: BaseLayout,
    meta: { requiresAuth: true, role: 'admin' },
    beforeEnter: adminGuard,
    children: [
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('@/views/admin/UserManagementView.vue'),
        meta: {
          title: 'Gestion des utilisateurs',
          permissions: ['users:read', 'users:write']
        }
      },
      {
        path: 'courses',
        name: 'admin-courses',
        component: () => import('@/views/admin/CourseManagementView.vue'),
        meta: {
          title: 'Gestion des cours',
          permissions: ['courses:read', 'courses:write']
        }
      },
      {
        path: 'payments',
        name: 'admin-payments',
        component: () => import('@/views/admin/PaymentManagementView.vue'),
        meta: {
          title: 'Gestion des paiements',
          permissions: ['payments:read', 'payments:write']
        }
      }
    ]
  },

  // === Routes teacher ===
  {
    path: '/teacher',
    component: BaseLayout,
    meta: { requiresAuth: true, role: 'teacher' },
    beforeEnter: teacherGuard,
    children: [
      {
        path: 'my-courses',
        name: 'teacher-courses',
        component: () => import('@/views/teacher/MyCoursesView.vue'),
        meta: {
          title: 'Mes Cours'
        }
      },
      {
        path: 'create-course',
        name: 'create-course',
        component: () => import('@/views/teacher/CreateCourseView.vue'),
        meta: {
          title: 'Créer un cours',
          permissions: ['courses:write']
        }
      }
    ]
  },

  // === Routes student ===
  {
    path: '/student',
    component: BaseLayout,
    meta: { requiresAuth: true, role: 'student' },
    beforeEnter: studentGuard,
    children: [
      {
        path: 'my-learning',
        name: 'my-learning',
        component: () => import('@/views/student/MyLearningView.vue'),
        meta: {
          title: 'Mes Apprentissages'
        }
      },
      {
        path: 'enrolled-courses',
        name: 'enrolled-courses',
        component: () => import('@/views/student/EnrolledCoursesView.vue'),
        meta: {
          title: 'Mes Cours Inscrits'
        }
      }
    ]
  },

  // === Routes d'erreur ===
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: UnauthorizedView,
    meta: {
      title: 'Accès non autorisé'
    }
  },
  {
    path: '/maintenance',
    name: 'maintenance',
    component: MaintenanceView,
    meta: {
      title: 'Maintenance en cours'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: {
      title: 'Page non trouvée'
    }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Retourner à la position sauvegardée ou en haut
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0, behavior: 'smooth' };
    }
  }
});

// Configurer les guards d'authentification
setupAuthGuards(router);

// Intercepteur pour les erreurs d'authentification
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Vérifier si le token a expiré
  if (authStore.isAuthenticated && authStore.isTokenExpired) {
    console.warn('[Router] Token expiré, déconnexion...');
    authStore.logout();

    const notificationStore = useNotificationStore();
    notificationStore.showWarning({
      title: 'Session expirée',
      message: 'Votre session a expiré. Veuillez vous reconnecter.',
      duration: 5000
    });

    return next({
      name: 'login',
      query: {
        redirect: to.fullPath,
        session_expired: 'true'
      }
    });
  }

  next();
});

export default router;*/





import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'



const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: () => import('@/views/WelcomeView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/terms',
    name: 'Terms',
    component: () => import('@/views/TermsView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/BaseLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'StudentDashboard',
        component: () => import('@/views/dashboard/student/DashboardView.vue'),
        meta: { requiresAuth: true, role: 'student' }
      },
      {
        path: 'teacher',
        name: 'TeacherDashboard',
        component: () => import('@/views/dashboard/teacher/DashboardView.vue'),
        meta: { requiresAuth: true, role: 'teacher' }
      },
      {
        path: 'admin',
        name: 'AdminDashboard',
        component: () => import('@/views/dashboard/admin/DashboardView.vue'),
        meta: { requiresAuth: true, role: 'admin' }
      }
    ]
  },
  {
    path: '/courses',
    component: () => import('@/views/dashboard/BaseLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Courses',
        component: () => import('@/views/courses/CourseListView.vue')
      },
      {
        path: ':id',
        name: 'CourseDetail',
        component: () => import('@/views/courses/CourseDetailView.vue')
      },
      {
        path: ':id/videos',
        name: 'CourseVideos',
        component: () => import('@/views/courses/VideoListView.vue')
      },
      {
        path: ':id/videos/:videoId',
        name: 'VideoPlayer',
        component: () => import('@/views/courses/VideoPlayerView.vue')
      },
      {
        path: ':id/live',
        name: 'LiveClasses',
        component: () => import('@/views/courses/LiveClassView.vue')
      },
      {
        path: ':id/assignments',
        name: 'Assignments',
        component: () => import('@/views/courses/AssignmentView.vue')
      }
    ]
  },
  {
    path: '/payment',
    component: () => import('@/views/dashboard/BaseLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'checkout/:courseId',
        name: 'PaymentCheckout',
        component: () => import('@/views/payment/PaymentCheckoutView.vue')
      },
      {
        path: 'success',
        name: 'PaymentSuccess',
        component: () => import('@/views/payment/PaymentSuccessView.vue')
      },
      {
        path: 'history',
        name: 'PaymentHistory',
        component: () => import('@/views/payment/PaymentHistoryView.vue')
      }
    ]
  },
  {
    path: '/profile',
    component: () => import('@/views/dashboard/BaseLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Profile',
        component: () => import('@/views/profile/ProfileView.vue')
      },
      {
        path: 'edit',
        name: 'EditProfile',
        component: () => import('@/views/profile/EditProfileView.vue')
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/profile/SettingsView.vue')
      }
    ]
  },
  {
    path: '/admin',
    component: () => import('@/views/dashboard/BaseLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      {
        path: 'courses',
        name: 'AdminCourses',
        component: () => import('@/views/admin/CourseManagementView.vue')
      },
      {
        path: 'courses/create',
        name: 'CreateCourse',
        component: () => import('@/views/admin/CreateCourseView.vue')
      },
      {
        path: 'courses/:id',
        name: 'EditCourse',
        component: () => import('@/views/admin/EditCourseView.vue')
      },
      {
        path: 'teachers',
        name: 'TeacherManagement',
        component: () => import('@/views/admin/TeacherManagementView.vue')
      },
      {
        path: 'students',
        name: 'StudentManagement',
        component: () => import('@/views/admin/StudentManagementView.vue')
      },
      {
        path: 'payments',
        name: 'PaymentManagement',
        component: () => import('@/views/admin/PaymentManagementView.vue')
      },
      {
        path: 'payouts',
        name: 'PayoutManagement',
        component: () => import('@/views/admin/PayoutManagementView.vue')
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: () => import('@/views/admin/AnalyticsView.vue')
      }
    ]
  },
  {
    path: '/live/:sessionId',
    name: 'LiveClassRoom',
    component: () => import('@/views/live/LiveClassRoomView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/errors/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.user?.role

  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }

  // Check if route requires guest (logged out users only)
  if (to.meta.requiresGuest && isAuthenticated) {
    next('/dashboard')
    return
  }

  // Check role-based access
  if (to.meta.role && userRole !== to.meta.role) {
    // Redirect to appropriate dashboard based on role
    switch (userRole) {
      case 'student':
        next('/dashboard')
        break
      case 'teacher':
        next('/dashboard/teacher')
        break
      case 'admin':
        next('/dashboard/admin')
        break
      default:
        next('/login')
    }
    return
  }

  next()
})

export default router