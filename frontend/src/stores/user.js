import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useUserStore = defineStore('user', () => {
  const profile = ref(null)
  const loading = ref(false)

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

  const fetchProfile = async () => {
    loading.value = true
    try {
      const response = await axiosInstance.get('/user/profile')
      profile.value = response.data.data
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (data) => {
    loading.value = true
    try {
      const response = await axiosInstance.put('/user/profile', data)
      profile.value = response.data.data
    } catch (error) {
      console.error('Failed to update profile:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    profile,
    loading,
    fetchProfile,
    updateProfile
  }
})