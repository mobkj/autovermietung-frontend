// src/api/bookingService.js
import api from '@/api/axios'
import { useAuthStore } from '@/stores/AuthStore'

export const bookingService = {
  // =========================
  // PUBLIC / USER
  // =========================

  // Buchung anlegen (Kunde / öffentliches Booking-Formular)
  async createBooking(payload) {
    const { data } = await api.post('/api/buchungen', payload)
    return data
  },
  async cancelMyBooking(id) {
    return api.put(`/api/buchungen/${id}/stornieren`).then((r) => r.data)
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

  async cancelBooking(buchungId) {
    const auth = useAuthStore()
    const role = auth.user?.role || auth.currentUser?.role
    const isAdmin = role === 'ADMIN' || role === 'ROLE_ADMIN'

    const url = isAdmin
      ? `/api/admin/buchungen/${buchungId}/stornieren` // Admin: Buchung freigeben
      : `/api/buchungen/${buchungId}/stornieren` // Kunde: eigene Buchung stornieren

    const { data } = await api.put(url)
    return data
  },
}

export default bookingService
