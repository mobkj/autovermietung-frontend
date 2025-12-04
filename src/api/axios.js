import axios from 'axios'
import { useAuthStore } from '@/stores/AuthStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080', // dein Spring Boot Backend
})
console.log('API Base URL:', import.meta.env.VITE_API_URL)

// sendet automatisch Token
api.interceptors.request.use((config) => {
  const auth = useAuthStore()

  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }

  return config
})

export default api
