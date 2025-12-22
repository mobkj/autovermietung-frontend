import axios from 'axios'
import { useAuthStore } from '@/stores/AuthStore'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth?.token) config.headers.Authorization = `Bearer ${auth.token}`
  return config
})

export default api
