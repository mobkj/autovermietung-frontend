const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export function imgUrl(path) {
  if (!path) return 'https://placehold.co/520x320?text=Mazari'
  if (path.startsWith('http')) return path
  return API_BASE_URL + path
}
