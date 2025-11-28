// src/api/bookingService.js
import api from '@/api/axios'

export const bookingService = {
  // =========================
  // PUBLIC / USER
  // =========================

  // Buchung anlegen (Kunde / öffentliches Booking-Formular)
  async createBooking(payload) {
    const { data } = await api.post('/api/buchungen', payload)
    return data
  },

  // Buchungen für ein Fahrzeug (z.B. für Kalender / belegte Tage)
  async getBookingsByVehicle(fahrzeugId) {
    const { data } = await api.get(`/api/buchungen/fahrzeug/${fahrzeugId}`)
    return data
  },

  // KUNDE: eigene Buchungen sehen
  async getMyBookings() {
    const { data } = await api.get('/api/buchungen/me')
    return data
  },

  // Buchung stornieren (Kunde oder Admin – je nach Backend-Security)
  async cancelBooking(buchungId) {
    const { data } = await api.put(`/api/buchungen/${buchungId}/stornieren`)
    return data
  },

  // =========================
  // ADMIN
  // =========================

  // ADMIN: Buchungen nach Fahrzeug
  async getBookingsByVehicleAdmin(fahrzeugId) {
    const { data } = await api.get(`/api/admin/buchungen/fahrzeug/${fahrzeugId}`)
    return data
  },

  // ADMIN: Buchungen nach User
  async getBookingsByUserAdmin(userId) {
    const { data } = await api.get(`/api/admin/buchungen/user/${userId}`)
    return data
  },

  // ADMIN: Fahrzeug-Block (interne Reservierung, wird als RESERVIERT gespeichert)
  async adminBlockBooking(payload) {
    const { data } = await api.post('/api/admin/buchungen/block', payload)
    return data
  },
}

export default bookingService
