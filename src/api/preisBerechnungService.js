// src/api/preisBerechnungService.js
import api from '@/api/axios'

export const preisBerechnungService = {
  /**
   * Preis-Berechnung für eine bestehende Buchung.
   *
   * Backend:
   *   GET /api/preise/buchung/{id}?freieKmPaket=300
   *
   * @param {number} buchungId      - ID der Buchung
   * @param {number} freieKmPaket   - Km-Paket (z.B. 150, 300, 500)
   * @returns {Promise<Object>}     - BuchungPreisAntwortDTO vom Backend
   */
  async getPreisByBooking(buchungId, freieKmPaket, bringService) {
    if (!buchungId) {
      throw new Error('buchungId ist erforderlich')
    }
    if (freieKmPaket == null) {
      throw new Error('freieKmPaket ist erforderlich')
    }

    // läuft auf: GET /api/preise/buchung/{id}?freieKmPaket=XYZ
    const { data } = await api.get(`/api/preise/buchung/${buchungId}`, {
      params: { freieKmPaket, bringService },
    })
    return data
  },

  /**
   * Optionale „safe“-Variante mit { data, error } Rückgabe,
   * falls du im Frontend keinen try/catch überall haben willst.
   */
  async safeGetPreisByBooking(buchungId, freieKmPaket) {
    try {
      const data = await this.getPreisByBooking(buchungId, freieKmPaket)
      return { data, error: null }
    } catch (error) {
      console.error('Fehler bei getPreisByBooking:', error)
      return { data: null, error }
    }
  },
}

export default preisBerechnungService
