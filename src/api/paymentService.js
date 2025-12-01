// src/api/paymentService.js
import api from '@/api/axios'

export const paymentService = {
  async createCheckoutSession(buchungId, freieKmPaket) {
    const payload = { buchungId, freieKmPaket }
    const { data } = await api.post('/api/payments/create-checkout-session', payload)
    return data // { sessionId, checkoutUrl optional }
  },
}

export default paymentService
