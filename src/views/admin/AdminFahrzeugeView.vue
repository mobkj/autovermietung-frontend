<script setup>
import NavBar from '@/components/NavBar.vue'
import VehicleCard from '@/components/vehicles/VehicleCard.vue'
import { onMounted, ref } from 'vue'
import { vehicleService } from '@/api/vehicleService'

const vehicles = ref([])
const loading = ref(true)
const error = ref('')

// Modal State
const modalOpen = ref(false)
const selected = ref(null)

// Edit Form
const editForm = ref({})

const loadVehicles = async () => {
  try {
    loading.value = true
    vehicles.value = await vehicleService.getAllVehiclesAdmin()
  } catch (e) {
    error.value = e.message || 'Fehler beim Laden'
  } finally {
    loading.value = false
  }
}

onMounted(loadVehicles)

const openEdit = (vehicle) => {
  selected.value = vehicle
  editForm.value = {
    marke: vehicle.marke || '',
    modell: vehicle.modell || '',
    serie: vehicle.serie || '',
    baujahr: vehicle.baujahr || null,
    ps: vehicle.ps || null,
    getriebe: vehicle.getriebe || '',
    kraftstoff: vehicle.kraftstoff || '',
    sitze: vehicle.sitze || null,
    tueren: vehicle.tueren || null,
    farbe: vehicle.farbe || '',
    nettoPreisProTag: vehicle.nettoPreisProTag,
    freiKmProTag: vehicle.freiKmProTag,
    kaution: vehicle.kaution,
    status: vehicle.status || 'AKTIV',
  }
  modalOpen.value = true
}

const closeEdit = () => {
  modalOpen.value = false
  selected.value = null
}

const saveEdit = async () => {
  try {
    loading.value = true
    await vehicleService.updateVehicle(selected.value.id, {
      ...editForm.value,
      nettoPreisProTag: Number(editForm.value.nettoPreisProTag),
      freiKmProTag: Number(editForm.value.freiKmProTag),
      kaution: editForm.value.kaution !== '' ? Number(editForm.value.kaution) : null,
      baujahr: editForm.value.baujahr ? Number(editForm.value.baujahr) : null,
      ps: editForm.value.ps ? Number(editForm.value.ps) : null,
      sitze: editForm.value.sitze ? Number(editForm.value.sitze) : null,
      tueren: editForm.value.tueren ? Number(editForm.value.tueren) : null,
    })

    closeEdit()
    await loadVehicles()
  } catch (e) {
    alert(e?.response?.data?.message || e.message || 'Update fehlgeschlagen')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <nav-bar />

    <main class="admin-wrapper">
      <header class="admin-head">
        <h2 class="title">Fahrzeugübersicht</h2>
        <p class="sub">Alle Fahrzeuge in deiner Flotte – bearbeiten & verwalten.</p>
      </header>

      <div v-if="loading" class="grid">
        <div v-for="i in 3" :key="i" class="skeleton"></div>
      </div>

      <p v-else-if="error" class="error">{{ error }}</p>

      <div v-else class="grid">
        <VehicleCard
          v-for="v in vehicles"
          :key="v.id"
          :vehicle="v"
          :isAdmin="true"
          @edit="openEdit"
        />
      </div>
    </main>

    <!-- MODAL -->
    <teleport to="body">
      <div v-if="modalOpen" class="modal-backdrop" @click.self="closeEdit">
        <div class="modal">
          <h3 class="modal-title">Fahrzeug bearbeiten</h3>

          <div class="modal-grid">
            <div class="field">
              <label>Marke</label>
              <input v-model="editForm.marke" />
            </div>
            <div class="field">
              <label>Modell</label>
              <input v-model="editForm.modell" />
            </div>
            <div class="field">
              <label>Serie</label>
              <input v-model="editForm.serie" />
            </div>

            <div class="field">
              <label>Baujahr</label>
              <input v-model="editForm.baujahr" type="number" />
            </div>
            <div class="field">
              <label>PS</label>
              <input v-model="editForm.ps" type="number" />
            </div>

            <div class="field">
              <label>Getriebe</label>
              <input v-model="editForm.getriebe" />
            </div>
            <div class="field">
              <label>Kraftstoff</label>
              <input v-model="editForm.kraftstoff" />
            </div>

            <div class="field">
              <label>Sitze</label>
              <input v-model="editForm.sitze" type="number" />
            </div>
            <div class="field">
              <label>Türen</label>
              <input v-model="editForm.tueren" type="number" />
            </div>

            <div class="field">
              <label>Farbe</label>
              <input v-model="editForm.farbe" />
            </div>

            <div class="field">
              <label>Preis netto / Tag</label>
              <input v-model="editForm.nettoPreisProTag" type="number" step="0.01" />
            </div>

            <div class="field">
              <label>Freikilometer / Tag</label>
              <input v-model="editForm.freiKmProTag" type="number" />
            </div>

            <div class="field">
              <label>Kaution</label>
              <input v-model="editForm.kaution" type="number" step="0.01" />
            </div>

            <div class="field">
              <label>Status</label>
              <select v-model="editForm.status">
                <option value="AKTIV">AKTIV</option>
                <option value="WARTUNG">WARTUNG</option>
                <option value="VERSTECKT">VERSTECKT</option>
              </select>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn ghost" @click="closeEdit">Abbrechen</button>
            <button class="btn primary" @click="saveEdit">Speichern</button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<style scoped>
.admin-wrapper {
  padding: clamp(22px, 4vw, 48px);
}

.admin-head {
  text-align: center;
  margin-bottom: 18px;
}
.title {
  font-size: clamp(20px, 3vw, 26px);
  font-weight: 900;
  color: var(--mazari-text-dark);
}
.sub {
  color: #667085;
  font-weight: 600;
  font-size: 14px;
}

/* Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(14px, 3vw, 20px);
}
@media (max-width: 960px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 600px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

/* Skeleton */
.skeleton {
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

.error {
  text-align: center;
  font-weight: 800;
  color: #ef4444;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.55);
  display: grid;
  place-items: center;
  z-index: 999;
  padding: 16px;
}

.modal {
  width: min(900px, 100%);
  background: white;
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
}

.modal-title {
  font-size: 18px;
  font-weight: 900;
  margin-bottom: 12px;
  color: var(--mazari-text-dark);
}

.modal-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
@media (max-width: 800px) {
  .modal-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 520px) {
  .modal-grid {
    grid-template-columns: 1fr;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
label {
  font-size: 12px;
  font-weight: 800;
  color: #0f172a;
}
input,
select {
  padding: 9px 11px;
  border-radius: 10px;
  border: 1.6px solid #cbd5e1;
  background: #f8fafc;
  font-size: 16px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

.btn {
  padding: 10px 14px;
  border-radius: 10px;
  font-weight: 900;
  border: none;
  cursor: pointer;
}
.btn.ghost {
  background: #e5e7eb;
}
.btn.primary {
  background: var(--mazari-primary);
  color: white;
}
.btn.primary:hover {
  background: var(--mazari-primary-dark);
}
</style>
