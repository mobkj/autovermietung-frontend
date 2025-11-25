<script setup>
import NavBar from '@/components/NavBar.vue'
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { vehicleService } from '@/api/vehicleService'

const route = useRoute()
const id = computed(() => route.params.id)

const vehicle = ref(null)
const loading = ref(true)
const error = ref('')

const currentIndex = ref(0)
const placeholderImg = 'https://placehold.co/1200x700?text=Mazari'
const API_BASE_URL = import.meta.env.VITE_API_URL || ''

const priceFormatted = computed(() => {
  if (!vehicle.value?.nettoPreisProTag) return ''
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(vehicle.value.nettoPreisProTag)
})

const hasImages = computed(() => !!vehicle.value?.bilder?.length)

const currentImageUrl = computed(() => {
  const bilder = vehicle.value?.bilder || []
  if (!bilder.length) return placeholderImg

  const path = bilder[currentIndex.value]?.url
  if (!path) return placeholderImg
  if (path.startsWith('http')) return path

  return API_BASE_URL + path
})

const currentImageAlt = computed(() => {
  if (!vehicle.value) return 'Fahrzeugbild'
  return `${vehicle.value.marke} ${vehicle.value.modell}`
})

const nextImage = () => {
  if (!hasImages.value) return
  const bilder = vehicle.value.bilder
  currentIndex.value = (currentIndex.value + 1) % bilder.length
}

const prevImage = () => {
  if (!hasImages.value) return
  const bilder = vehicle.value.bilder
  currentIndex.value = (currentIndex.value - 1 + bilder.length) % bilder.length
}

onMounted(async () => {
  try {
    loading.value = true
    const data = await vehicleService.getVehicleById(id.value)
    vehicle.value = data

    // Startbild: Vorschaubild, sonst erstes
    if (vehicle.value?.bilder?.length) {
      const idx = vehicle.value.bilder.findIndex((b) => b.vorschau)
      currentIndex.value = idx >= 0 ? idx : 0
    } else {
      currentIndex.value = 0
    }
  } catch (e) {
    error.value =
      e?.response?.data?.message || e?.message || 'Fahrzeug konnte nicht geladen werden.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <nav-bar />

    <main class="details-wrapper">
      <!-- Loading -->
      <div v-if="loading" class="details-loading">Lade Fahrzeug...</div>

      <!-- Error -->
      <div v-else-if="error" class="details-error">
        {{ error }}
      </div>

      <!-- Details -->
      <section v-else class="details-card">
        <!-- Bild + Slider -->
        <div class="details-image">
          <img :src="currentImageUrl" :alt="currentImageAlt" />

          <!-- Slider-Controls nur, wenn mehrere Bilder -->
          <button
            v-if="hasImages && vehicle.bilder.length > 1"
            class="slider-btn slider-btn-left"
            type="button"
            @click="prevImage"
          >
            ‹
          </button>
          <button
            v-if="hasImages && vehicle.bilder.length > 1"
            class="slider-btn slider-btn-right"
            type="button"
            @click="nextImage"
          >
            ›
          </button>

          <div class="details-status">
            {{ vehicle.status }}
          </div>
        </div>

        <!-- Content -->
        <div class="details-content">
          <!-- Head -->
          <div class="details-head">
            <h1 class="details-title">{{ vehicle.marke }} {{ vehicle.modell }}</h1>
            <p class="details-sub">
              {{ vehicle.serie }} · {{ vehicle.baujahr }} · {{ vehicle.ps }} PS
            </p>
          </div>

          <!-- Price / Highlights -->
          <div class="details-highlights">
            <div class="highlight">
              <div class="highlight-label">Preis / Tag netto</div>
              <div class="highlight-value">{{ priceFormatted }}</div>
            </div>
            <div class="highlight">
              <div class="highlight-label">Freikilometer</div>
              <div class="highlight-value">{{ vehicle.freiKmProTag }} km/Tag</div>
            </div>
            <div class="highlight" v-if="vehicle.kaution">
              <div class="highlight-label">Kaution</div>
              <div class="highlight-value">{{ vehicle.kaution }} €</div>
            </div>
          </div>

          <!-- Specs -->
          <div class="details-specs">
            <div class="spec">
              <span>Getriebe</span>
              <strong>{{ vehicle.getriebe }}</strong>
            </div>
            <div class="spec">
              <span>Kraftstoff</span>
              <strong>{{ vehicle.kraftstoff }}</strong>
            </div>
            <div class="spec">
              <span>Sitze</span>
              <strong>{{ vehicle.sitze }}</strong>
            </div>
            <div class="spec">
              <span>Türen</span>
              <strong>{{ vehicle.tueren }}</strong>
            </div>
            <div class="spec">
              <span>Farbe</span>
              <strong>{{ vehicle.farbe }}</strong>
            </div>
          </div>

          <!-- CTA (Booking später) -->
          <div class="details-actions">
            <button class="cta primary" disabled>Buchen bald verfügbar</button>
            <button class="cta ghost" disabled>In Favoriten</button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.details-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: clamp(18px, 4vw, 40px);
}

.details-loading,
.details-error {
  text-align: center;
  font-weight: 800;
  color: var(--mazari-text-dark);
  padding: 30px;
}

.details-error {
  color: #ef4444;
}

/* Card Layout */
.details-card {
  background: white;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(6, 69, 127, 0.1);
  box-shadow:
    0 10px 28px rgba(15, 23, 42, 0.1),
    0 2px 8px rgba(15, 23, 42, 0.06);

  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
}

/* Image */
.details-image {
  position: relative;
  background: #f5f7fb;
}

.details-image img {
  width: 100%;
  height: 100%;
  min-height: 320px;
  object-fit: cover;
  display: block;
}

.details-status {
  position: absolute;
  top: 14px;
  left: 14px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 900;
  background: rgba(255, 255, 255, 0.95);
  color: var(--mazari-primary-dark);
  border: 1px solid rgba(6, 69, 127, 0.18);
}

/* Content */
.details-content {
  padding: clamp(16px, 3vw, 26px);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.details-title {
  margin: 0;
  font-size: clamp(22px, 3vw, 30px);
  font-weight: 900;
  color: var(--mazari-text-dark);
}

.details-sub {
  margin: 4px 0 0;
  color: #667085;
  font-weight: 700;
  font-size: 14px;
}

.slider-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: var(--mazari-primary);
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.slider-btn-left {
  left: 12px;
}

.slider-btn-right {
  right: 12px;
}

.slider-btn:hover {
  background: rgba(15, 23, 42, 0.9);
}

/* Highlights */
.details-highlights {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.highlight {
  background: #f8fafc;
  border: 1px solid #e6eaf0;
  border-radius: 12px;
  padding: 10px;
  text-align: center;
}

.highlight-label {
  font-size: 12px;
  font-weight: 800;
  color: #667085;
}

.highlight-value {
  margin-top: 2px;
  font-size: 18px;
  font-weight: 900;
  color: var(--mazari-primary-dark);
}

/* Specs Grid */
.details-specs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.spec {
  background: white;
  border: 1px solid #e6eaf0;
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.spec span {
  color: #667085;
  font-weight: 700;
}

.spec strong {
  color: var(--mazari-text-dark);
  font-weight: 900;
}

/* Actions */
.details-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 6px;
}

.cta {
  height: 44px;
  border-radius: 12px;
  font-weight: 900;
  font-size: 14px;
  border: none;
  cursor: not-allowed;
  transition: 0.2s ease;
}

.cta.primary {
  background: var(--mazari-primary);
  color: white;
  opacity: 0.7;
}

.cta.ghost {
  background: rgba(6, 69, 127, 0.08);
  color: var(--mazari-primary-dark);
  border: 1px solid rgba(6, 69, 127, 0.2);
  opacity: 0.7;
}

/* Responsive */
@media (max-width: 900px) {
  .details-card {
    grid-template-columns: 1fr;
  }
  .details-highlights {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 520px) {
  .details-highlights {
    grid-template-columns: 1fr;
  }
  .details-specs {
    grid-template-columns: 1fr;
  }
  .details-actions {
    grid-template-columns: 1fr;
  }
}
</style>
