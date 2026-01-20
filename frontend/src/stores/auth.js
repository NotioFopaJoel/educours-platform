import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import axios from 'axios'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const loading = ref(false)
  const toast = useToast()

  // Create axios instance with auth header
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  // Add token to requests if available
  axiosInstance.interceptors.request.use(
    config => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    error => Promise.reject(error)
  )

  // Check if user is authenticated
  const isAuthenticated = computed(() => {
    return !!user.value && !!token.value
  })

  // Initialize auth state
  const initialize = async () => {
    if (token.value) {
      try {
        const response = await axiosInstance.get('/auth/me')
        user.value = response.data.data
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        logout()
      }
    }
  }

  // Login function
  const login = async (credentials) => {
    try {
      loading.value = true
      const response = await axiosInstance.post('/auth/login', credentials)
      
      const { token: authToken, user: userData } = response.data.data
      
      // Store token and user
      token.value = authToken
      user.value = userData
      localStorage.setItem('token', authToken)
      
      toast.success('Login successful!')
      
      // Redirect based on role
      redirectBasedOnRole(userData.role)
      
      return { success: true, user: userData }
    } /*catch (error) {
      console.error('Login error details:', error)

      let message = 'Echec de la connexion'

      if (error.response){
        switch (error.response.status) {
          case 401:
            message = 'Email ou mot the passe incorrect'
                break
          case 422:
            message = 'Donnees de connection invalides'
            break
          case 429:
            message = 'Trop de tentatives. vueillez reessayer plus tard'
            break
          default:
            message = error.response?.data?.error || `Login failed. Erreur ${error.response.status}`
        }
      } else if (error.request) {
        message = 'Erreur reseau. Verifiez votre connection internet. '
      }
      //const message = error.response?.data?.error || 'Login failed'
      toast.error(message)
      return { success: false, error: message }
    }*/ finally {
      loading.value = false
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      loading.value = true
      const response = await axiosInstance.post('/auth/register', userData)
      
      const { token: authToken, user: newUser } = response.data.data
      
      // Store token and user
      token.value = authToken
      user.value = newUser
      localStorage.setItem('token', authToken)
      
      toast.success('Registration successful!')
      
      // Redirect based on role
      redirectBasedOnRole(newUser.role)
      
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  // Logout function
  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    router.push('/login')
    toast.info('Logged out successfully')
  }

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      loading.value = true
      const response = await axiosInstance.put('/users/profile', profileData)
      
      user.value = response.data.data
      toast.success('Profile updated successfully')
      
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Profile update failed'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  // Change password
  const changePassword = async (passwordData) => {
    try {
      loading.value = true
      await axiosInstance.put('/users/change-password', passwordData)
      
      toast.success('Password changed successfully')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Password change failed'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      loading.value = false
    }
  }

  // Redirect based on user role
  const redirectBasedOnRole = (role) => {
    switch (role) {
      case 'student':
        router.push('/dashboard')
        break
      case 'teacher':
        router.push('/dashboard/teacher')
        break
      case 'admin':
        router.push('/dashboard/admin')
        break
      default:
        router.push('/dashboard')
    }
  }

  // Get user avatar
  const getUserAvatar = computed(() => {
    if (user.value?.avatar) {
      return user.value.avatar
    }
    
    // Generate avatar from initials
    if (user.value?.firstName && user.value?.lastName) {
      return user.value.firstName.charAt(0) + user.value.lastName.charAt(0)
    }
    
    if (user.value?.email) {
      return user.value.email.charAt(0).toUpperCase()
    }
    
    return 'U'
  })

  // Get user full name
  const getUserFullName = computed(() => {
    if (user.value?.firstName && user.value?.lastName) {
      return `${user.value.firstName} ${user.value.lastName}`
    }
    
    if (user.value?.email) {
      return user.value.email
    }
    
    return 'User'
  })

  return {
    user,
    token,
    loading,
    axiosInstance,
    isAuthenticated,
    getUserAvatar,
    getUserFullName,
    initialize,
    login,
    register,
    logout,
    updateProfile,
    changePassword
  }
})