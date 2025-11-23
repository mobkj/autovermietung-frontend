<script setup>
import { useAuthStore } from '@/stores/AuthStore'
import NavBar from '@/components/NavBar.vue'
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()
const auth = useAuthStore()
const logout = () => {
  auth.logout()
  router.push('/') // Redirect zur Startseite
}
</script>

<template>
  <div>
    <nav-bar />
    <div class="profile-wrapper">
      <div class="profile-container">
        <h2 class="section-title">Mein Bereich</h2>

        <!-- Menü-Liste -->
        <div class="profile-menu">
          <!-- ACCOUNT (klickbar) -->
          <div class="menu-item clickable">
            <RouterLink to="/account-details" class="menu-link">
              <span class="menu-title">Account</span>
              <p class="menu-sub">Persönliche Daten verwalten</p>
            </RouterLink>
          </div>

          <div class="trennlinie"></div>

          <div v-if="auth.user?.role === 'ADMIN'">
            <div class="menu-item disabled">
              <span class="menu-title"><RouterLink to="/account-user-view">Liste</RouterLink></span>
              <p class="menu-sub">Alle Kunden im Überblick</p>
            </div>

            <div class="trennlinie"></div>
          </div>
          <!-- RECHNUNGEN (noch ohne Funktion)
          <div class="menu-item disabled">
            <span class="menu-title">Rechnungen</span>
            <p class="menu-sub">Rechnungen & Zahlungsbelege</p>
          </div>

          <div class="trennlinie"></div>-->

          <div class="menu-item disabled" @click="logout">
            <span class="menu-title">Abmelden</span>
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
  padding: 60px 20px;
  font-family: 'Inter', sans-serif;

  /* Neuer, smoother Hintergrund */
  background: linear-gradient(to bottom, #ffffff 0%, #ffffff 40%, #e6eef7 65%, #a8c4ec 100%);
}

.profile-container {
  width: 100%;
  max-width: 680px;
  background: white;
  padding: 40px 35px;
  border-radius: 18px;
  box-shadow:
    10px 5px 6px 12px rgba(0, 0, 0, 0.04),
    10px 5px 20px 40px rgba(0, 0, 0, 0.08);
}

/* Titel */
.section-title {
  font-size: 32px;
  font-weight: 700;
  color: #06457f; /* Dunkles Mazari-Blau */
  margin-bottom: 30px;
  letter-spacing: -0.5px;
  width: 100%;
  text-align: center;
  border-left: 5px solid #06457f;
  border-bottom: 5px solid #06457f;
  border-radius: 50px;
  text-align: center;
}

/* Menü Liste */
.profile-menu {
  display: flex;
  flex-direction: column;
  gap: 26px;
}

/* Trennlinie aktualisiert mit Palette */
.trennlinie {
  width: 90%;
  height: 2px;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0) 0%,
    #0474c4 40%,
    #06457f 60%,
    rgba(0, 0, 0, 0) 100%
  );
  margin: 20px auto;
  border-radius: 10px;
}

/* Menü Elemente */
.menu-item {
  background: #ffffff;
  padding: 22px 24px;
  border-radius: 16px;
  border: 2px solid #b1b4b8;
  transition: 0.25s ease;
  cursor: default;
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.04),
    0 12px 28px rgba(0, 0, 0, 0.12),
    0 24px 40px rgba(0, 0, 0, 0.08);
}

.menu-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.menu-item:hover {
  transform: translateY(-4px);
  border-color: #a8c4ec;
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.08),
    0 0 25px rgba(148, 163, 184, 0.15);
  background: #f1f7ff; /* zarter Light-Blue Hover */
}

.menu-title {
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 6px;
  letter-spacing: -0.3px;
}

.menu-sub {
  margin: 0;
  font-size: 15px;
  color: #475569;
  font-weight: 500;
}
</style>
