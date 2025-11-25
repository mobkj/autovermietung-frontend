// src/api/vehicleService.js
import api from '@/api/axios'

export const vehicleService = {
  // =========================
  // PUBLIC (Frontend / Kunden)
  // =========================

  // Nur aktive Fahrzeuge holen
  async getAllActiveVehicles() {
    const { data } = await api.get('/api/fahrzeuge')
    return data
  },

  async getVehicleById(id) {
    const { data } = await api.get(`/api/fahrzeuge/${id}`)
    return data
  },

  // =========================
  // ADMIN
  // =========================

  // Alle Fahrzeuge holen (egal Status)
  async getAllVehiclesAdmin() {
    const { data } = await api.get('/api/admin/fahrzeuge')
    return data
  },

  // Einzelnes Fahrzeug (Admin)
  async getVehicleByIdAdmin(id) {
    const { data } = await api.get(`/api/admin/fahrzeuge/${id}`)
    return data
  },

  // Fahrzeug anlegen (Admin)
  async createVehicle(dto) {
    const { data } = await api.post('/api/admin/fahrzeuge', dto)
    return data
  },

  // Mehrere Bilder hochladen (Admin)
  // Endpoint im Backend: POST /api/admin/fahrzeuge/{id}/bilder
  // @RequestParam("files") List<MultipartFile> files
  async uploadVehicleImages(id, files) {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))

    const { data } = await api.post(`/api/admin/fahrzeuge/${id}/bilder`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return data
  },

  async replaceVehicleImage(vehicleId, bildId, file) {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await api.put(`/api/admin/fahrzeuge/${vehicleId}/bilder/${bildId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return data
  },

  // Fahrzeug updaten (Admin)
  async updateVehicle(id, dto) {
    const { data } = await api.put(`/api/admin/fahrzeuge/${id}`, dto)
    return data
  },
}

export default vehicleService
