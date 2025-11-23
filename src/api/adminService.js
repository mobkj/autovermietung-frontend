import api from '@/api/axios'

export const adminService = {
  async getAllUsers() {
    const res = await api.get('/admin/users')
    return res.data
  },

  async getUserById(id) {
    const res = await api.get(`/admin/users/${id}`)
    return res.data
  },

  async deleteUser(id) {
    const res = await api.delete(`/admin/users/${id}`)
    return res.data
  },

  async updateUser(id, payload) {
    const res = await api.put(`/admin/users/${id}`, payload)
    return res.data
  },
}
