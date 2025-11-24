<template>
  <footer class="footer">
    <div class="footer-inner">
      <!-- BRAND -->
      <div class="footer-brand">
        <img src="https://placehold.co/160x45?text=Mazari" alt="Mazari Logo" class="footer-logo" />
        <p class="brand-sub">Premium Autovermietung · Zuverlässig & Modern</p>
      </div>

      <!-- LINKS -->
      <div class="footer-links">
        <RouterLink to="/" class="f-link">Impressum</RouterLink>
        <RouterLink to="/" class="f-link">Datenschutz</RouterLink>
        <RouterLink to="/" class="f-link">AGB</RouterLink>
        <RouterLink to="/" class="f-link">Kontakt</RouterLink>
      </div>

      <!-- SOCIAL -->
      <div class="footer-social">
        <a class="social-btn" aria-label="Instagram">
          <i class="fa-brands fa-instagram"></i>
        </a>
        <a class="social-btn" aria-label="TikTok">
          <i class="fa-brands fa-tiktok"></i>
        </a>
        <a class="social-btn" aria-label="YouTube">
          <i class="fa-brands fa-youtube"></i>
        </a>
      </div>
    </div>

    <div class="footer-bottom">
      © {{ new Date().getFullYear() }} Mazari Autovermietung – Alle Rechte vorbehalten.
    </div>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.footer {
  background: linear-gradient(145deg, #032b4f 0%, #06457f 55%, #0a4d86 100%);
  color: #f8fbff;
  font-family: 'Inter', sans-serif;

  padding: 36px 18px 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 -14px 40px rgba(3, 43, 79, 0.35);

  /* klebt unten dank flex-layout in App.vue */
  margin-top: auto;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto 14px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 20px;
}

/* Brand */
.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.footer-logo {
  width: 160px;
  filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.35));
}
.brand-sub {
  font-size: 13px;
  opacity: 0.85;
}

/* Links center */
.footer-links {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
  font-weight: 600;
  font-size: 14px;
}

.f-link {
  position: relative;
  opacity: 0.9;
  transition: 0.18s ease;
}
.f-link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -4px;
  width: 0%;
  height: 2px;
  background: #f5b544;
  border-radius: 999px;
  transition: width 0.18s ease;
}
.f-link:hover {
  opacity: 1;
  transform: translateY(-1px);
}
.f-link:hover::after {
  width: 100%;
}

/* Social right */
.footer-social {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.social-btn {
  width: 40px;
  height: 40px;
  border-radius: 999px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: radial-gradient(circle at 30% 20%, #ffffff, #dfe7f2);
  color: #032b4f;
  font-size: 1.2rem;

  box-shadow:
    0 4px 10px rgba(0, 0, 0, 0.25),
    inset 0 2px 4px rgba(255, 255, 255, 0.7);

  transition: 0.18s ease;
  cursor: pointer;
}

.social-btn:hover {
  transform: translateY(-3px) scale(1.04);
  box-shadow:
    0 10px 22px rgba(0, 0, 0, 0.35),
    inset 0 2px 4px rgba(255, 255, 255, 0.6);
}

/* Bottom line */
.footer-bottom {
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 13px;
  opacity: 0.85;
  text-align: center;
}

/* Mobile */
@media (max-width: 900px) {
  .footer-inner {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .footer-social {
    justify-content: center;
  }
}
</style>
