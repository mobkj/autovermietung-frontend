<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <!-- Klick führt immer zur Startseite -->
  <RouterLink to="/" class="mazari-logo" aria-label="Mazari Autovermietung">
    <div class="logo-mark">
      <i class="fa-solid fa-car-side"></i>
    </div>

    <div class="logo-text">
      <span class="logo-main">MAZARI</span>
      <span class="logo-sub">AUTOVERMIETUNG</span>
    </div>
  </RouterLink>
</template>

<style scoped>
.mazari-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  color: #ffffff;
}

/* runder Icon-Kreis */
.logo-mark {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: radial-gradient(
    circle at 30% 30%,
    #ffffff 0,
    #ffffff 10%,
    var(--mazari-primary) 55%,
    var(--mazari-primary-dark) 100%
  );
  display: grid;
  place-items: center;
  box-shadow:
    0 0 0 2px rgba(255, 255, 255, 0.08),
    0 10px 20px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.logo-mark i {
  color: #ffffff;
  font-size: 18px;
}

/* Textblock */
.logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1.05;
}

/* MAZARI */
.logo-main {
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: clamp(1.2rem, 1.8vw, 1.4rem);
  color: #ffffff;
  text-shadow: 0 0 12px rgba(3, 43, 79, 0.9);
}

/* AUTOVERMIETUNG */
.logo-sub {
  font-weight: 600;
  font-size: clamp(0.7rem, 1.1vw, 0.8rem);
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: rgba(226, 232, 240, 0.9); /* helles Blau-Grau */
}

/* Mobile etwas kompakter */
@media (max-width: 600px) {
  .logo-mark {
    width: 34px;
    height: 34px;
  }

  .logo-mark i {
    font-size: 16px;
  }

  .logo-main {
    font-size: 1.1rem;
  }

  .logo-sub {
    font-size: 0.7rem;
  }
}

/* ganz kleine Screens: Subtitel ausblenden, damit nichts bricht */
@media (max-width: 380px) {
  .logo-sub {
    display: none;
  }
}
</style>
