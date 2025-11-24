<script setup>
import { useAuthStore } from '@/stores/AuthStore'
import NavBar from '@/components/NavBar.vue'
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()
const auth = useAuthStore()
const logout = () => {
  auth.logout()
  router.push('/')
}
</script>

<template>
  <div>
    <nav-bar />
    <div class="profile-wrapper">
      <div class="profile-container">
        <h2 class="section-title">Mein Bereich</h2>

        <div class="profile-menu">
          <!-- ACCOUNT -->
          <RouterLink to="/account-details" class="menu-item link-wrapper">
            <span class="menu-title">Account</span>
            <p class="menu-sub">Persönliche Daten verwalten</p>
          </RouterLink>

          <div class="trennlinie"></div>

          <!-- LISTE nur für ADMIN -->
          <RouterLink
            v-if="auth.user?.role === 'ADMIN'"
            to="/account-user-view"
            class="menu-item link-wrapper"
          >
            <span class="menu-title">Liste</span>
            <p class="menu-sub">Alle Kunden im Überblick</p>
          </RouterLink>

          <div class="trennlinie" v-if="auth.user?.role === 'ADMIN'"></div>

          <!-- FAHRZEUG ANLEGEN nur für ADMIN -->
          <RouterLink
            v-if="auth.user?.role === 'ADMIN'"
            to="/admin/fahrzeuge/neu"
            class="menu-item link-wrapper"
          >
            <span class="menu-title">Fahrzeug anlegen</span>
            <p class="menu-sub">Neues Fahrzeug zur Flotte hinzufügen</p>
          </RouterLink>

          <div class="trennlinie" v-if="auth.user?.role === 'ADMIN'"></div>

          <!-- LOGOUT -->
          <div class="menu-item link-wrapper logout-item" @click="logout">
            <span class="menu-title">Abmelden</span>
            <p class="menu-sub">Sicher ausloggen</p>
          </div>

          <div class="trennlinie"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.profile-wrapper {
  display: flex;
  justify-content: center;
  background: transparent;
  font-family: 'Inter', sans-serif;

  /* ✅ dynamische Abstände */
  padding: clamp(32px, 6vw, 60px) clamp(12px, 3vw, 20px);
}

.profile-container {
  width: 100%;
  max-width: min(92vw, 720px); /* ✅ nie breiter als Screen */
  background: #ffffff;

  padding: clamp(22px, 4vw, 38px) clamp(18px, 3.5vw, 34px);
  border-radius: clamp(14px, 2.5vw, 18px);
  border: 1px solid rgba(6, 69, 127, 0.1);

  box-shadow:
    0 10px 28px rgba(15, 23, 42, 0.1),
    0 2px 8px rgba(15, 23, 42, 0.06);
}

/* Titel */
.section-title {
  font-size: clamp(20px, 4vw, 26px);
  font-weight: 800;
  color: var(--mazari-text-dark);
  margin-bottom: clamp(18px, 3.5vw, 28px);
  letter-spacing: -0.3px;
  text-align: center;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(6, 69, 127, 0.75);
}

/* Menü Liste */
.profile-menu {
  display: flex;
  flex-direction: column;
  gap: clamp(12px, 3vw, 18px);
}

/* Trennlinie */
.trennlinie {
  width: 94%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(6, 69, 127, 0.35) 35%,
    rgba(6, 69, 127, 0.35) 65%,
    transparent 100%
  );
  margin: clamp(6px, 2vw, 8px) auto;
}

/* Menü Elemente */
.menu-item {
  background: #ffffff;
  padding: clamp(14px, 3vw, 18px) clamp(14px, 3vw, 20px);
  border-radius: clamp(12px, 2.5vw, 14px);
  border: 1px solid #e6eaf0;
  transition: 0.22s ease;
  cursor: pointer;

  box-shadow:
    0 2px 5px rgba(15, 23, 42, 0.05),
    0 10px 20px rgba(15, 23, 42, 0.06);
}

.menu-item:hover {
  transform: translateY(-2px);
  border-color: rgba(6, 69, 127, 0.35);
  background: #f7faff;
  box-shadow:
    0 6px 14px rgba(15, 23, 42, 0.08),
    0 16px 30px rgba(15, 23, 42, 0.08);
}

.menu-item:hover .menu-title {
  color: var(--mazari-primary);
}

.menu-item:focus-visible {
  outline: 2px solid rgba(6, 69, 127, 0.55);
  outline-offset: 2px;
}

.link-wrapper {
  display: block;
}

/* Titel / Sub */
.menu-title {
  display: block;
  font-size: clamp(17px, 3.6vw, 19px);
  font-weight: 800;
  color: var(--mazari-text-dark);
  margin-bottom: 4px;
  letter-spacing: -0.2px;
}

.menu-sub {
  margin: 0;
  font-size: clamp(12.5px, 2.8vw, 14px);
  color: #667085;
  font-weight: 600;
}

/* Logout */
.logout-item:hover {
  border-color: rgba(220, 38, 38, 0.35);
  background: #fff7f7;
}
.logout-item:hover .menu-title {
  color: #dc2626;
}
</style>
