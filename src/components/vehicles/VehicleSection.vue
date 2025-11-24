<script setup>
import { onMounted, ref } from 'vue'
import VehicleCard from './VehicleCard.vue'

const vehicles = ref([])
const loading = ref(true)
const error = ref('')

import { vehicleService } from '@/api/vehicleService'

onMounted(async () => {
  try {
    loading.value = true
    vehicles.value = await vehicleService.getAllActiveVehicles()
  } catch (e) {
    error.value = e.message || 'Fahrzeuge konnten nicht geladen werden'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="vehicles">
    <div class="vehicles-head">
      <h2 class="section-headline">Unsere Fahrzeuge</h2>
      <p class="section-sub">Aktuell verfügbar: drei Bestseller – weitere Modelle folgen.</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="vehicle-grid">
      <div v-for="i in 3" :key="i" class="skeleton-card"></div>
    </div>

    <!-- Error State -->
    <p v-else-if="error" class="error-text">
      {{ error }}
    </p>

    <!-- Vehicles -->
    <div v-else class="vehicle-grid">
      <VehicleCard v-for="v in vehicles" :key="v.id" :vehicle="v" />
    </div>
  </section>
</template>

<style scoped>
.vehicles {
  margin-top: clamp(28px, 6vw, 60px);
  padding: 0 clamp(12px, 3vw, 24px);
}

.vehicles-head {
  text-align: center;
  margin-bottom: clamp(18px, 4vw, 30px);
}

.section-headline {
  font-size: clamp(22px, 4vw, 28px);
  font-weight: 900;
  color: var(--mazari-text-dark);
  margin-bottom: 6px;
}

.section-sub {
  font-size: clamp(13px, 3vw, 15px);
  font-weight: 600;
  color: #667085;
  margin: 0;
}

/* Grid */
.vehicle-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(14px, 3vw, 20px);
}

/* Skeleton */
.skeleton-card {
  height: 320px;
  border-radius: 16px;
  background: linear-gradient(90deg, #eef2f7 0%, #f6f8fb 50%, #eef2f7 100%);
  background-size: 200% 100%;
  animation: shimmer 1.3s infinite;
  border: 1px solid #e6eaf0;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.error-text {
  text-align: center;
  font-weight: 700;
  color: #ef4444;
}

/* Responsive */
@media (max-width: 960px) {
  .vehicle-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 600px) {
  .vehicle-grid {
    grid-template-columns: 1fr;
  }
}
</style>
