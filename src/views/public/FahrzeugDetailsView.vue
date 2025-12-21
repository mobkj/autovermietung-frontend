<script setup>
import NavBar from '@/components/NavBar.vue'
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { vehicleService } from '@/api/vehicleService'
import VehicleBookingOverview from '@/components/booking/VehicleBookingOverview.vue'
import VehicleDetailsCard from '@/components/vehicles/VehicleDetailsCard.vue'

const route = useRoute()
const id = computed(() => route.params.id)

const vehicle = ref(null)
const loading = ref(true)
const error = ref('')

const currentIndex = ref(0)

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
      <div v-else>
        <VehicleDetailsCard :vehicle="vehicle" />
        <VehicleBookingOverview v-if="vehicle" :vehicle="vehicle" :vehicle-id="vehicle.id" />
      </div>
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
