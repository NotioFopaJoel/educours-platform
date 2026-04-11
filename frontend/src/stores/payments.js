import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const usePaymentStore = defineStore('payments', () => {
  const payments = ref([])
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

  const fetchPayments = async () => {
    loading.value = true
    try {
      const response = await axiosInstance.get('/payments')
      payments.value = response.data.data
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    } finally {
      loading.value = false
    }
  }

  return {
    payments,
    loading,
    fetchPayments
  }
})