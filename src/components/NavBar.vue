<script setup>
import { useAuthStore } from '@/stores/AuthStore'
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const auth = useAuthStore()
const mobileOpen = ref(false)
</script>

<template>
  <nav class="navbar">
    <div class="nav-inner">
      <!-- LOGO -->
      <RouterLink to="/" class="logo">
        <img src="https://placehold.co/160x45?text=Mazari" alt="Logo" />
      </RouterLink>

      <!-- DESKTOP LINKS -->
      <ul class="nav-links">
        <li><RouterLink to="/" class="link" active-class="active">Home</RouterLink></li>
        <!-- <li><RouterLink to="/" class="link" active-class="active">NOT USED</RouterLink></li>-->
        <li><RouterLink to="/faq" class="link" active-class="active">FAQ</RouterLink></li>
        <li><RouterLink to="/contact" class="link" active-class="active">Kontakt</RouterLink></li>
        <li v-if="auth.isLoggedIn">
          <RouterLink to="/meinprofil" class="link" active-class="active">Profil</RouterLink>
        </li>
      </ul>

      <!-- ACTION BUTTONS -->
      <div class="nav-actions">
        <template v-if="!auth.isLoggedIn">
          <RouterLink to="/login" class="btn-login">Login</RouterLink>
          <RouterLink to="/register" class="btn-register">Registrieren</RouterLink>
        </template>
      </div>

      <!-- MOBILE TOGGLE -->
      <div class="mobile-toggle" @click="mobileOpen = !mobileOpen">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>

    <!-- MOBILE MENU -->
    <div v-if="mobileOpen" class="mobile-menu">
      <RouterLink @click="mobileOpen = false" to="/">Home</RouterLink>
      <RouterLink @click="mobileOpen = false" to="/">NOT USED (FAHRZUEG)</RouterLink>
      <RouterLink @click="mobileOpen = false" to="/faq">FAQ</RouterLink>
      <RouterLink @click="mobileOpen = false" to="/contact">Kontakt</RouterLink>

      <hr />

      <template v-if="!auth.isLoggedIn">
        <RouterLink to="/login" @click="mobileOpen = false">Login</RouterLink>
        <RouterLink to="/register" @click="mobileOpen = false">Registrieren</RouterLink>
      </template>
      <template v-else>
        <button @click="auth.logout">Logout</button>
      </template>
    </div>
  </nav>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* NAVBAR */
.navbar {
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 200;
  background: #06457f; /* HELL */
  border-bottom: 1px solid #e5e7eb;
  font-family: 'Inter', sans-serif;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.nav-inner {
  max-width: 1400px;
  height: 88px;
  margin: auto;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* LOGO */
.logo img {
  height: 44px;
  filter: brightness(1);
}

/* NAV LINKS */
.nav-links {
  list-style: none;
  display: flex;
  gap: 50px;
}

.link {
  position: relative;
  text-decoration: none;
  color: white; /* dunkles Navy */
  font-size: 16px;
  font-weight: 600;
  padding-bottom: 6px;
  transition: 0.25s ease;
}

/* Hover Line */
.link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 0%;
  height: 2px;
  background: white; /* Primary Blue */
  border-radius: 10px;
  transition: width 0.3s ease;
}

.link:hover::after {
  width: 100%;
}

/* Active */
.active {
  color: white !important; /* Deep Blue */
}
.active::after {
  width: 100%;
  background: white !important;
}

/* ACTION BUTTONS */
.nav-actions {
  display: flex;
  gap: 14px;
}

.btn-login {
  padding: 8px 18px;
  border-radius: 6px;
  border: 2px solid #0474c4;
  background: transparent;
  color: #0474c4;
  font-weight: 600;
  transition: 0.25s;
}
.btn-login:hover {
  background: #0474c4;
  color: white;
}

.btn-register {
  padding: 9px 20px;
  border-radius: 6px;
  background: #0474c4;
  color: white;
  font-weight: 700;
  transition: 0.25s;
}
.btn-register:hover {
  background: #06457f;
}

/* MOBILE */
.mobile-toggle {
  width: 32px;
  display: none;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
}
.mobile-toggle div {
  height: 3px;
  background: #1e293b;
  border-radius: 999px;
}

.mobile-menu {
  background: white;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  border-bottom: 1px solid #e5e7eb;
}

.mobile-menu a {
  font-size: 18px;
  color: #262b40;
  font-weight: 600;
  text-decoration: none;
}

/* Responsive */
@media (max-width: 960px) {
  .nav-links,
  .nav-actions {
    display: none;
  }
  .mobile-toggle {
    display: flex;
  }
}
</style>
