<script setup>
import { computed } from 'vue'

const props = defineProps({
  vehicle: { type: Object, required: true },
  isAdmin: { type: Boolean, default: false },
})

const emit = defineEmits(['edit', 'details'])

const title = computed(() => {
  const s = props.vehicle.serie ? ` ${props.vehicle.serie}` : ''
  return `${props.vehicle.marke} ${props.vehicle.modell}${s}`
})

const price = computed(() => {
  const n = Number(props.vehicle.nettoPreisProTag ?? 0)
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n)
})

const placeholderImg = 'https://placehold.co/520x320?text=Mazari'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

const previewImgSrc = computed(() => {
  const bilder = props.vehicle.bilder || []
  if (!bilder.length) return placeholderImg

  const cover = bilder.find((b) => b.vorschau)
  const path = cover?.url || bilder[0]?.url

  if (!path) return placeholderImg
  if (path.startsWith('http')) return path

  // Hier wird aus "/fahrzeug1/bild1_1.png"
  // -> "https://dein-ngrok.../fahrzeug1/bild1_1.png"
  return API_BASE_URL + path
})
</script>

<template>
  <article class="vehicle-card">
    <div class="vehicle-img-wrap">
      <img :src="previewImgSrc" :alt="title" class="vehicle-img" />
      <div class="price-badge">{{ price }} / Tag</div>
    </div>

    <div class="vehicle-body">
      <h3 class="vehicle-title">{{ title }}</h3>

      <p class="vehicle-meta" v-if="vehicle.freiKmProTag != null">
        inkl. {{ vehicle.freiKmProTag }} km/Tag
      </p>

      <p class="vehicle-desc">Premium-Fahrzeug – gepflegt, zuverlässig und sofort startklar.</p>

      <div class="vehicle-actions">
        <!-- Kunde -->
        <button
          v-if="!isAdmin"
          class="vehicle-btn vehicle-btn-underline"
          @click.stop="emit('details', vehicle)"
        >
          Details &amp; Buchen
        </button>

        <!-- Admin -->
        <button v-else class="vehicle-btn admin" @click.stop="emit('edit', vehicle)">
          Bearbeiten
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.vehicle-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid rgba(6, 69, 127, 0.12);
  overflow: hidden;
  transition: 0.25s ease;

  box-shadow:
    0 8px 20px rgba(15, 23, 42, 0.08),
    0 2px 8px rgba(15, 23, 42, 0.05);
}

.vehicle-card:hover {
  transform: translateY(-4px);
  border-color: rgba(6, 69, 127, 0.28);
  box-shadow:
    0 14px 28px rgba(15, 23, 42, 0.12),
    0 0 26px rgba(6, 69, 127, 0.12);
}

/* Bild */
.vehicle-img-wrap {
  position: relative;
}

.vehicle-img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  display: block;
}

/* Preis Badge */
.price-badge {
  position: absolute;
  right: 12px;
  bottom: 12px;
  background: rgba(3, 43, 79, 0.92);
  color: white;
  font-size: 13px;
  font-weight: 800;
  padding: 7px 10px;
  border-radius: 999px;
  letter-spacing: 0.2px;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.25);
}

.vehicle-body {
  padding: 16px 16px 18px;
}

.vehicle-title {
  font-size: 18px;
  font-weight: 800;
  color: var(--mazari-text-dark);
  margin: 0 0 6px;
}

.vehicle-meta {
  font-size: 13px;
  font-weight: 700;
  color: var(--mazari-primary);
  margin: 0 0 8px;
}

.vehicle-desc {
  color: #667085;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 14px;
}

/* Button */
.vehicle-actions {
  display: flex;
  justify-content: center; /* schön mittig */
}

/* Button */
.vehicle-btn {
  margin-top: 6px;
  height: 40px;
  padding: 0 18px;
  border-radius: 10px;
  border: none;
  font-weight: 800;
  background: #eef2f7;
  color: var(--mazari-primary);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.vehicle-btn:hover {
  background: #dfe5f2;
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
}

/* Underline nur für Public-Button */
.vehicle-btn-underline::after {
  content: '';
  position: absolute;
  left: 18px;
  right: 18px;
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

.vehicle-actions {
  margin-top: 12px;
}

.vehicle-btn.admin {
  background: var(--mazari-primary);
  color: white;
  cursor: pointer;
}

.vehicle-btn.admin:hover {
  background: var(--mazari-primary-dark);
}
</style>
