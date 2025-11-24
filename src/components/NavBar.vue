<script setup>
import { useAuthStore } from '@/stores/AuthStore'
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import mazariLogo from '@/assets/mazari-logo-nav-premium.svg'

const auth = useAuthStore()
const mobileOpen = ref(false)

const closeMobile = () => (mobileOpen.value = false)
const toggleMobile = () => (mobileOpen.value = !mobileOpen.value)
</script>

<template>
  <header class="nav-shell">
    <nav class="nav-bar">
      <!-- LEFT: Logo -->
      <RouterLink to="/" class="nav-logo" @click="closeMobile">
        <img :src="mazariLogo" alt="Mazari Autovermietung Logo" />
      </RouterLink>

      <!-- CENTER: Desktop Links -->
      <ul class="nav-links">
        <li><RouterLink to="/" class="nav-link">Home</RouterLink></li>
        <li><RouterLink to="/faq" class="nav-link">FAQ</RouterLink></li>
        <li><RouterLink to="/contact" class="nav-link">Kontakt</RouterLink></li>
        <li v-if="auth.isLoggedIn">
          <RouterLink to="/meinprofil" class="nav-link nav-link-pill">Profil</RouterLink>
        </li>
      </ul>

      <!-- RIGHT: Actions -->
      <div class="nav-actions" v-if="!auth.isLoggedIn">
        <RouterLink to="/login" class="btn btn-ghost">Login</RouterLink>
        <RouterLink to="/register" class="btn btn-primary">Registrieren</RouterLink>
      </div>

      <!-- Mobile Burger -->
      <button class="nav-burger" @click="toggleMobile" aria-label="Menü öffnen">
        <span :class="['b-line', mobileOpen && 'open-1']"></span>
        <span :class="['b-line', mobileOpen && 'open-2']"></span>
        <span :class="['b-line', mobileOpen && 'open-3']"></span>
      </button>
    </nav>

    <!-- MOBILE MENU -->
    <transition name="mobile-drop">
      <div v-if="mobileOpen" class="mobile-menu">
        <RouterLink to="/" class="mobile-link" @click="closeMobile">Home</RouterLink>
        <RouterLink to="/faq" class="mobile-link" @click="closeMobile">FAQ</RouterLink>
        <RouterLink to="/contact" class="mobile-link" @click="closeMobile">Kontakt</RouterLink>

        <RouterLink
          v-if="auth.isLoggedIn"
          to="/meinprofil"
          class="mobile-link mobile-link-pill"
          @click="closeMobile"
        >
          Profil
        </RouterLink>

        <div class="mobile-divider"></div>

        <template v-if="!auth.isLoggedIn">
          <RouterLink to="/login" class="mobile-link" @click="closeMobile">Login</RouterLink>
          <RouterLink to="/register" class="mobile-link mobile-link-pill" @click="closeMobile">
            Registrieren
          </RouterLink>
        </template>

        <button v-else class="mobile-logout" @click="(auth.logout(), closeMobile())">Logout</button>
      </div>
    </transition>
  </header>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* Shell sticky */
.nav-shell {
  position: sticky;
  top: 0;
  z-index: 999;
  padding: 10px 14px;
  backdrop-filter: blur(8px);
  font-family: 'Inter', sans-serif;
}

/* Bar */
.nav-bar {
  max-width: 1300px;
  margin: 0 auto;

  height: 74px;
  padding: 0 18px;

  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 16px;

  border-radius: 16px;

  background: linear-gradient(135deg, #032b4f 0%, #06457f 60%, #0a4d86 100%);
  box-shadow:
    0 14px 40px rgba(3, 43, 79, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

/* Logo */
.nav-logo img {
  height: 44px;
  filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.35));
}

/* Desktop links center */
.nav-links {
  list-style: none;
  display: flex;
  justify-content: center;
  gap: 34px;
  margin: 0;
  padding: 0;
}

.nav-link {
  position: relative;
  font-size: 15px;
  font-weight: 600;
  color: #f8fbff;
  opacity: 0.92;
  padding: 6px 10px;
  border-radius: 999px;
  transition: 0.2s ease;
}

/* Hover glow underline */
.nav-link::after {
  content: '';
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: -6px;
  height: 2px;
  border-radius: 999px;
  background: #f5b544; /* gold accent */
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.2s ease;
}

.nav-link:hover {
  opacity: 1;
  transform: translateY(-1px);
  text-shadow: 0 0 10px rgba(245, 181, 68, 0.45);
}

.nav-link:hover::after {
  transform: scaleX(1);
}

/* Active */
.nav-link.router-link-active {
  opacity: 1;
}
.nav-link.router-link-active::after {
  transform: scaleX(1);
}

/* Profil pill */
.nav-link-pill {
  background: rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
}
.nav-link-pill.router-link-active {
  background: #f5b544;
  color: #032b4f;
}

/* Actions right */
.nav-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 38px;
  padding: 0 14px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 14px;
  transition: 0.2s ease;
}

.btn-ghost {
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.05);
}
.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-1px);
}

.btn-primary {
  background: #f5b544;
  color: #032b4f;
  box-shadow: 0 8px 18px rgba(245, 181, 68, 0.35);
}
.btn-primary:hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
}

/* Burger */
.nav-burger {
  display: none;
  width: 40px;
  height: 36px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 10px;
  background: rgba(3, 43, 79, 0.7);
  cursor: pointer;

  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
}

.b-line {
  width: 20px;
  height: 2px;
  background: white;
  border-radius: 999px;
  transition: 0.18s ease;
}
.open-1 {
  transform: translateY(5px) rotate(45deg);
}
.open-2 {
  opacity: 0;
}
.open-3 {
  transform: translateY(-5px) rotate(-45deg);
}

/* Mobile menu */
.mobile-menu {
  max-width: 1300px;
  margin: 8px auto 0;
  background: rgba(3, 43, 79, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 18px 45px rgba(3, 43, 79, 0.55);

  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mobile-link {
  padding: 12px 12px;
  border-radius: 12px;
  color: #f8fbff;
  font-weight: 600;
  font-size: 16px;
  transition: 0.18s ease;
}

.mobile-link:hover {
  background: rgba(255, 255, 255, 0.08);
}

.mobile-link-pill {
  background: rgba(255, 255, 255, 0.12);
}

.mobile-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.18);
  margin: 6px 2px;
}

.mobile-logout {
  margin-top: 2px;
  padding: 12px;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  background: #f5b544;
  color: #032b4f;
  cursor: pointer;
}

/* Drop animation */
.mobile-drop-enter-active,
.mobile-drop-leave-active {
  transition: all 0.2s ease;
}
.mobile-drop-enter-from,
.mobile-drop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* Responsive */
@media (max-width: 960px) {
  .nav-links,
  .nav-actions {
    display: none;
  }
  .nav-burger {
    display: flex;
    justify-self: end;
  }
  .nav-bar {
    grid-template-columns: auto 1fr auto;
  }
}
</style>
