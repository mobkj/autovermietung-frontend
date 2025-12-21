import axios from 'axios'
import { useAuthStore } from '@/stores/AuthStore'

const baseURL = import.meta.env.VITE_API_URL || 'https://autovermietung-backend.onrender.com'

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

console.log('API Base URL:', baseURL)

api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth?.token) config.headers.Authorization = `Bearer ${auth.token}`
  return config
})

export default api
