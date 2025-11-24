<script setup>
import { computed } from 'vue'

const props = defineProps({
  vehicle: { type: Object, required: true },
  isAdmin: { type: Boolean, default: false },
})

const emit = defineEmits(['edit'])

const title = computed(() => {
  const s = props.vehicle.serie ? ` ${props.vehicle.serie}` : ''
  return `${props.vehicle.marke} ${props.vehicle.modell}${s}`
})

const price = computed(() => {
  const n = Number(props.vehicle.nettoPreisProTag ?? 0)
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n)
})

const BACKEND = 'http://localhost:8080'

const imgSrc = computed(() => {
  const url = props.vehicle.bildUrl
  if (!url) return 'https://placehold.co/520x320?text=Mazari'
  return url.startsWith('http') ? url : `${BACKEND}${url}`
})
</script>

<template>
  <article class="vehicle-card">
    <div class="vehicle-img-wrap">
      <img :src="imgSrc" :alt="title" class="vehicle-img" />
      <div class="price-badge">{{ price }} / Tag</div>
    </div>

    <div class="vehicle-body">
      <h3 class="vehicle-title">{{ title }}</h3>

      <p class="vehicle-meta" v-if="vehicle.freiKmProTag != null">
        inkl. {{ vehicle.freiKmProTag }} km/Tag
      </p>

      <p class="vehicle-desc">Premium-Fahrzeug – gepflegt, zuverlässig und sofort startklar.</p>

      <div class="vehicle-actions">
        <button class="vehicle-btn" disabled v-if="!isAdmin">Details bald verfügbar</button>

        <button class="vehicle-btn admin" v-else @click="emit('edit', vehicle)">Bearbeiten</button>
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
.vehicle-btn {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: none;
  font-weight: 800;
  font-size: 14px;
  background: #e5e7eb;
  color: #64748b;
  cursor: not-allowed;
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
