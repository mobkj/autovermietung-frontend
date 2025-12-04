// src/api/stripeService.js
import api from '@/api/axios'

// src/api/stripeService.js
export const stripeService = {
  async createCheckoutSession({ buchungId, freieKmPaket, bringService }) {
    if (!buchungId || !freieKmPaket) {
      throw new Error('buchungId und freieKmPaket werden benötigt')
    }

    const response = await api.post('/api/payments/create-checkout-session', {
      buchungId,
      freieKmPaket,
      bringService, // ✅ NEU
    })

    return response.data
  },
}
