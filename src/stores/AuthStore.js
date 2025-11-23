/* eslint-disable no-unused-vars */
import { defineStore } from 'pinia'
import axios from '@/api/axios'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
  },

  actions: {
    // ---------- LOGIN ----------
    async login(email, password) {
      try {
        const res = await axios.post('/auth/login', { email, password })

        this.token = res.data.token

        this.user = {
          id: res.data.userId,
          email: res.data.email,
          firstName: res.data.firstName,
          lastName: res.data.lastName,
          role: res.data.role,

          phone: res.data.phone,
          street: res.data.street,
          houseNumber: res.data.houseNumber,
          postalCode: res.data.postalCode,
          city: res.data.city,
          country: res.data.country,
          birthDate: res.data.birthDate,
          driverLicenseNumber: res.data.driverLicenseNumber,
        }

        localStorage.setItem('token', this.token)
        localStorage.setItem('user', JSON.stringify(this.user))

        router.push('/')
        return true
        // oxlint-disable-next-line no-unused-vars
      } catch (error) {
        return false // ← wichtig für die Login-Fehleranzeige
      }
    },

    // ---------- REGISTER ----------
    async register(payload) {
      try {
        const res = await axios.post('/auth/register', payload) // Keys passen 1:1 zum Backend

        this.token = res.data.token
        this.user = res.data

        //localStorage.setItem('token', this.token)
        //localStorage.setItem('user', JSON.stringify(this.user))

        router.push('/login')
      } catch (err) {
        console.error('Register failed', err)
        const msg = err.response?.data?.message || 'Registrierung fehlgeschlagen'
        return { error: msg }
      }
    },

    // ---------- LOGOUT ----------
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/')
    },
  },
})
