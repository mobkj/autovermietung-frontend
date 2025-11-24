<script setup>
import NavBar from '@/components/NavBar.vue'
import mazariFleetImg from '@/assets/mazariFleetImg.png'

import { onMounted, ref } from 'vue'
import { vehicleService } from '@/api/vehicleService'

const vehicles = ref([])
const loadingVehicles = ref(true)
const vehicleError = ref('')

onMounted(async () => {
  try {
    loadingVehicles.value = true
    vehicles.value = await vehicleService.getAllActiveVehicles()
  } catch (e) {
    vehicleError.value =
      e?.response?.data?.message || e?.message || 'Fahrzeuge konnten nicht geladen werden.'
  } finally {
    loadingVehicles.value = false
  }
})
</script>

<template>
  <nav-bar />

  <main class="home-wrapper">
    <!-- HERO / INTRO -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-badge">Premium Autovermietung in deiner Nähe</div>

        <h1 class="hero-title">3… 2… 1… <span class="hero-go">GO!</span></h1>

        <p class="hero-sub">
          Steig ein, fahr los – Mazari bringt dich schnell, sicher und stilvoll ans Ziel. Modern.
          Transparent. Ohne Stress.
        </p>

        <div class="hero-stats">
          <div class="stat">
            <div class="stat-number">24/7</div>
            <div class="stat-label">Support</div>
          </div>

          <div class="stat">
            <div class="stat-number">Auf Wunsch</div>
            <div class="stat-label">Fahrzeuglieferung</div>
          </div>

          <div class="stat">
            <div class="stat-number">Transparent</div>
            <div class="stat-label">Nettopreise</div>
          </div>

          <div class="stat">
            <div class="stat-number">Top gepflegt</div>
            <div class="stat-label">Premium-Fahrzeuge</div>
          </div>
        </div>
      </div>

      <div class="hero-visual">
        <div class="visual-card">
          <div class="visual-glow"></div>
          <img :src="mazariFleetImg" alt="Mazari Fahrzeuge" />
          <div class="visual-caption">Deine Fahrt beginnt hier.</div>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section class="features">
      <h2 class="section-headline">Warum Mazari?</h2>
      <p class="section-sub">Drei Dinge, die wir kompromisslos liefern – jedes Mal.</p>

      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <i class="fa-solid fa-bolt"></i>
          </div>
          <h3>Schnell</h3>
          <p>In wenigen Minuten reserviert – bereit zur Abfahrt ohne Papierkram.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <i class="fa-solid fa-shield-halved"></i>
          </div>
          <h3>Zuverlässig</h3>
          <p>Top gewartete Fahrzeuge, klare Prozesse, volle Kontrolle für dich.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <i class="fa-solid fa-crown"></i>
          </div>
          <h3>Premium</h3>
          <p>Sauber, modern, komfortabel – weil Fahren sich gut anfühlen soll.</p>
        </div>
      </div>
    </section>

    <!-- VEHICLES PREVIEW -->
    <section class="vehicles">
      <div class="vehicles-head">
        <h2 class="section-headline">Unsere Fahrzeuge</h2>
        <p class="section-sub">
          Aktuell verfügbar: {{ vehicles.length }} <span v-if="vehicles.length < 2">Fahrzeug</span>
          <span v-else>Fahrzeuge</span> – weitere Modelle folgen.
        </p>
      </div>

      <div class="vehicle-grid">
        <!-- Loading Skeleton (optisch neutral) -->
        <template v-if="loadingVehicles">
          <div class="vehicle-card" v-for="i in 3" :key="i">
            <img src="https://placehold.co/520x320?text=Lade..." alt="Loading" />
            <div class="vehicle-body">
              <h3>Lade Fahrzeug...</h3>
              <p>Bitte einen Moment.</p>
              <button class="vehicle-btn">Details & Buchen</button>
            </div>
          </div>
        </template>

        <!-- Error -->
        <p v-else-if="vehicleError" class="vehicles-error">
          {{ vehicleError }}
        </p>

        <!-- Fahrzeuge vorhanden -->
        <template v-else-if="vehicles.length">
          <RouterLink
            v-for="v in vehicles"
            :key="v.id"
            :to="`/fahrzeuge/${v.id}`"
            class="vehicle-link"
          >
            <div class="vehicle-card">
              <img
                :src="v.bildUrl || 'https://placehold.co/520x320?text=Mazari'"
                :alt="`${v.marke} ${v.modell}`"
              />

              <div class="vehicle-body">
                <h3>{{ v.marke }} {{ v.modell }}</h3>
                <p>{{ v.serie }} · {{ v.ps }} PS · {{ v.getriebe }} · {{ v.kraftstoff }}</p>

                <button class="vehicle-btn">Details & Buchen</button>
              </div>
            </div>
          </RouterLink>
        </template>

        <!-- Keine Fahrzeuge -->
        <div v-else class="vehicles-empty">
          Noch keine Fahrzeuge online – Flotte wird gerade befüllt.
        </div>
      </div>

      <!-- Platzhalter für spätere Fahrzeugliste -->
      <!-- <div class="vehicles-list">...</div> -->
    </section>
  </main>
</template>

<style scoped>
.home-wrapper {
  max-width: 1300px;
  margin: 0 auto;
  padding: 10px 16px 60px;
  display: flex;
  flex-direction: column;
  gap: 70px;
}

/* HERO */
.hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 28px;
  align-items: center;
  padding: 22px;
  border-radius: 20px;

  background:
    radial-gradient(circle at 10% 0%, rgba(6, 69, 127, 0.08), transparent 55%),
    radial-gradient(circle at 90% 0%, rgba(245, 181, 68, 0.1), transparent 60%), #ffffff;

  box-shadow: var(--mazari-shadow-soft);
  border: 1px solid rgba(6, 69, 127, 0.08);
}

.hero-content {
  padding: 10px 8px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;

  color: var(--mazari-primary-dark);
  background: rgba(6, 69, 127, 0.08);
  border: 1px solid rgba(6, 69, 127, 0.12);
}

.hero-title {
  margin: 14px 0 8px;
  font-size: 44px;
  line-height: 1.05;
  letter-spacing: -0.5px;
  color: var(--mazari-text-dark);
  font-weight: 800;
}

.hero-go {
  color: var(--mazari-primary);
  text-shadow: 0 8px 30px rgba(6, 69, 127, 0.25);
}

.hero-sub {
  font-size: 16px;
  color: #4a5568;
  font-weight: 500;
  max-width: 560px;
}

.hero-actions {
  margin-top: 18px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* CTA Buttons */
.cta {
  height: 44px;
  padding: 0 16px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
  transition: 0.2s ease;
}

.cta-primary {
  background: var(--mazari-primary);
  color: white;
  box-shadow: 0 12px 24px rgba(6, 69, 127, 0.25);
}
.cta-primary:hover {
  transform: translateY(-1px);
  filter: brightness(1.05);
}

.cta-ghost {
  background: rgba(6, 69, 127, 0.08);
  color: var(--mazari-primary-dark);
  border: 1px solid rgba(6, 69, 127, 0.16);
}
.cta-ghost:hover {
  transform: translateY(-1px);
  background: rgba(6, 69, 127, 0.12);
}

.hero-stats {
  margin-top: 26px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.stat {
  background: #ffffff;
  border: 1px solid rgba(6, 69, 127, 0.12);
  border-radius: 14px;
  padding: 16px 16px;
  text-align: center;
  transition: 0.22s ease;

  /* Premium-Glow (subtil) */
  box-shadow:
    0 6px 16px rgba(15, 23, 42, 0.08),
    0 0 0 1px rgba(6, 69, 127, 0.04),
    0 0 22px rgba(6, 69, 127, 0.08);
}

.stat:hover {
  transform: translateY(-2px);
  border-color: rgba(6, 69, 127, 0.28);
  box-shadow:
    0 10px 22px rgba(15, 23, 42, 0.12),
    0 0 28px rgba(6, 69, 127, 0.14);
}

.stat-number {
  font-size: clamp(16px, 3.5vw, 20px);
  font-weight: 800;
  color: var(--mazari-primary-dark);
  margin-bottom: 4px;
  letter-spacing: -0.2px;
}

.stat-label {
  font-size: clamp(12px, 2.8vw, 14px);
  font-weight: 700;
  color: #667085;
}

/* Hero Visual */
.hero-visual {
  display: flex;
  justify-content: center;
}

.visual-card {
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  background: #0b2f52;
  box-shadow: var(--mazari-shadow-soft);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.visual-glow {
  position: absolute;
  inset: -40%;
  background:
    radial-gradient(circle at 40% 30%, rgba(245, 181, 68, 0.35), transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(6, 69, 127, 0.45), transparent 55%);
  filter: blur(60px);
  opacity: 0.8;
  pointer-events: none;
}

.visual-card img {
  width: 100%;
  display: block;
  opacity: 0.98;
}

.visual-caption {
  position: absolute;
  bottom: 12px;
  left: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.9);
  color: var(--mazari-primary-dark);
}

/* SECTION TITLES */
.section-headline {
  font-size: 26px;
  font-weight: 800;
  color: var(--mazari-text-dark);
  letter-spacing: -0.3px;
  margin-bottom: 6px;
}

.section-sub {
  font-size: 15px;
  color: #667085;
  font-weight: 600;
  max-width: 700px;
}

/* FEATURES */
.features {
  padding: 0 4px;
}

.feature-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.feature-card {
  background: #fff;
  border-radius: 14px;
  padding: 18px 16px;
  border: 1px solid #e6eaf0;
  box-shadow: var(--mazari-shadow-subtle);
  transition: 0.22s ease;
}

.feature-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--mazari-shadow-soft);
}

.feature-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(6, 69, 127, 0.08);
  color: var(--mazari-primary);
  font-size: 20px;
  margin-bottom: 10px;
}

.feature-card h3 {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 800;
  color: var(--mazari-text-dark);
}

.feature-card p {
  margin: 0;
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
}

/* VEHICLES */
.vehicles {
  padding: 0 4px;
}

.vehicles-head {
  margin-bottom: 16px;
}

.vehicle-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.vehicle-card {
  background: white;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #e6eaf0;
  box-shadow: var(--mazari-shadow-subtle);
  transition: 0.22s ease;
}

.vehicle-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--mazari-shadow-soft);
}

.vehicle-card img {
  width: 100%;
  height: 190px;
  object-fit: cover;
  display: block;
  background: #f5f7fb;
}

.vehicle-body {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.vehicle-body h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  color: var(--mazari-text-dark);
}

.vehicle-body p {
  margin: 0;
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
}

.vehicle-btn {
  margin-top: 6px;
  height: 40px;
  border-radius: 10px;
  border: none;
  font-weight: 800;
  background: #eef2f7;
  color: var(--mazari-primary);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.vehicle-btn-underline::after {
  content: '';
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 6px;
  height: 2px;
  background: var(--mazari-primary);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.25s ease;
}

.vehicle-btn-underline:hover::after {
  transform: scaleX(1);
}

.vehicle-link {
  display: block;
}

.vehicles-error {
  grid-column: 1 / -1;
  text-align: center;
  font-weight: 800;
  color: #ef4444;
}

.vehicles-empty {
  grid-column: 1 / -1;
  text-align: center;
  font-weight: 700;
  color: #475569;
  padding: 12px;
}

/* MOBILE */
@media (max-width: 960px) {
  .hero {
    grid-template-columns: 1fr;
    padding: 16px;
  }

  .hero-title {
    font-size: 34px;
  }

  .feature-grid,
  .vehicle-grid {
    grid-template-columns: 1fr;
  }

  .vehicle-card img {
    height: 200px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 30px;
  }

  .section-headline {
    font-size: 22px;
  }

  .cta {
    width: 100%;
  }
}

.vehicle-link {
  display: block;
  color: inherit;
}

.vehicle-card-link {
  display: block;
  color: inherit;
  text-decoration: none;
}

@media (max-width: 520px) {
  .hero-stats {
    grid-template-columns: 1fr;
  }
}
</style>
