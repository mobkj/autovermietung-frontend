<script setup>
import { useAuthStore } from '../store/authStore'
const auth = useAuthStore()

const logout = () => {
  auth.logout()
}
</script>

<template>
  <div>
    <header class="navbar">
      <router-link to="/app/profile">Profil</router-link>
      <router-link to="/app/bookings">Buchungen</router-link>
      <router-link to="/app/invoices">Rechnungen</router-link>

      <button @click="logout">Logout</button>
    </header>

    <main>
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.navbar {
  display: flex;
  gap: 20px;
  padding: 20px;
  border-bottom: 1px solid #eee;
}
</style>
