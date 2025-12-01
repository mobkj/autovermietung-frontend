// src/api/stripeService.js
import api from '@/api/axios'

export const stripeService = {
  /**
   * Startet im Backend die Erstellung einer Checkout-Session.
   * Response: { sessionId, checkoutUrl }
   */
  async createCheckoutSession({ buchungId, freieKmPaket }) {
    if (!buchungId || !freieKmPaket) {
      throw new Error('buchungId und freieKmPaket werden benötigt')
    }

    const response = await api.post('/api/payments/create-checkout-session', {
      buchungId,
      freieKmPaket,
    })

    // axios -> echte Daten in data
    return response.data // { sessionId, checkoutUrl }
  },
}
