import api from '@/api/axios'

export const adminService = {
  async getAllUsers() {
    const res = await api.get('/api/admin/users')
    return res.data
  },

  async getUserById(id) {
    const res = await api.get(`/api/admin/users/${id}`)
    return res.data
  },

  async deleteUser(id) {
    const res = await api.delete(`/api/admin/users/${id}`)
    return res.data
  },

  async updateUser(id, payload) {
    const res = await api.put(`/api/admin/users/${id}`, payload)
    return res.data
  },
}
