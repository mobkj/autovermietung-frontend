<script setup>
import { computed, ref } from 'vue'
import { imgUrl } from '@/api/imgUrl'

const props = defineProps({
  vehicle: { type: Object, required: true },
  showActions: { type: Boolean, default: true },
})

const currentIndex = ref(0)

const images = computed(() => props.vehicle.bilder || [])
const hasImages = computed(() => images.value.length > 0)

const currentImage = computed(() => {
  if (!hasImages.value) return null
  return images.value[currentIndex.value] || images.value[0]
})

const currentImageUrl = computed(() => {
  const url = currentImage.value?.url
  if (!url) {
    return 'https://placehold.co/1200x700?text=Mazari'
  }
  return imgUrl(url) // 🔥 DAS ist die einzige wichtige Änderung
})

const currentImageAlt = computed(() => {
  const v = props.vehicle
  return `${v.marke ?? ''} ${v.modell ?? ''}`.trim() || 'Fahrzeug'
})

const priceFormatted = computed(() => {
  if (!props.vehicle?.nettoPreisProTag) return ''
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(props.vehicle.nettoPreisProTag)
})

function prevImage() {
  if (!hasImages.value || images.value.length <= 1) return
  currentIndex.value = (currentIndex.value - 1 + images.value.length) % images.value.length
}

function nextImage() {
  if (!hasImages.value || images.value.length <= 1) return
  currentIndex.value = (currentIndex.value + 1) % images.value.length
}
</script>

<template>
  <section class="details-card">
    <!-- Bild -->
    <div class="details-image">
      <img :src="currentImageUrl" :alt="currentImageAlt" />

      <!-- Slider-Buttons nur wenn mehrere Bilder -->
      <button
        v-if="hasImages && images.length > 1"
        class="slider-btn slider-btn-left"
        type="button"
        @click="prevImage"
      >
        ‹
      </button>
      <button
        v-if="hasImages && images.length > 1"
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
        <p class="details-sub">{{ vehicle.serie }} · {{ vehicle.baujahr }} · {{ vehicle.ps }} PS</p>
      </div>

      <!-- Highlights -->
      <div class="details-highlights">
        <div class="highlight">
          <div class="highlight-label">Preis / Tag netto</div>
          <div class="highlight-value">{{ priceFormatted }}</div>
        </div>
        <div class="highlight" v-if="vehicle.freiKmProTag != null">
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

      <!-- Aktionen (optional ausblendbar) -->
      <div v-if="showActions" class="details-actions">
        <button class="cta primary" disabled>Buchen bald verfügbar</button>
        <button class="cta ghost" disabled>In Favoriten</button>
      </div>
    </div>
  </section>
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

/* Slider Buttons */
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
