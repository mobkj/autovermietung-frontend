import axios from 'axios'
import { useAuthStore } from '@/stores/AuthStore'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

// Alles, was öffentlich sein soll:
const PUBLIC_PATHS = [
  '/api/fahrzeuge', // inkl. /api/fahrzeuge/123 via startsWith
  '/api/contact',
  '/auth/login',
  '/auth/register',
  '/api/stripe/webhook',
  '/uploads',
]

api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  const url = config.url || ''

  const isPublic = PUBLIC_PATHS.some((p) => url.startsWith(p))

  // ✅ Public Requests immer ohne Authorization
  if (isPublic) {
    if (config.headers) delete config.headers.Authorization
    return config
  }

  // ✅ Nur protected Requests bekommen Token
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }

  return config
})

export default api
