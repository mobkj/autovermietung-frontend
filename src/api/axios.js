import axios from 'axios'
import { useAuthStore } from '@/stores/AuthStore'

const api = axios.create({
  baseURL: 'http://localhost:8080', // dein Spring Boot Backend
})

// sendet automatisch Token
api.interceptors.request.use((config) => {
  const auth = useAuthStore()

  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }

  return config
})

export default api
