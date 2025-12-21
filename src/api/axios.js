import axios from 'axios'
import { useAuthStore } from '@/stores/AuthStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Debug (kannst du später löschen)
console.log('API Base URL:', api.defaults.baseURL)

// JWT automatisch mitsenden
api.interceptors.request.use((config) => {
  const auth = useAuthStore()

  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }

  return config
})

export default api
