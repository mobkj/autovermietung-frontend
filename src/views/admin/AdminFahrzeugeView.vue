<script setup>
import NavBar from '@/components/NavBar.vue'
import VehicleCard from '@/components/vehicles/VehicleCard.vue'
import { onMounted, ref, computed, watch, onBeforeUnmount } from 'vue'
import vehicleService from '@/api/vehicleService'

// =====================
// STATE
// =====================
const vehicles = ref([])
const loading = ref(true)
const error = ref('')

const modalOpen = ref(false)
const saving = ref(false)
const modalError = ref('')

// Edit-Form (defaults)
const emptyForm = () => ({
  id: null,
  marke: '',
  modell: '',
  serie: '',
  baujahr: null,
  ps: null,
  getriebe: '',
  kraftstoff: '',
  sitze: null,
  tueren: null,
  farbe: '',
  nettoPreisProTag: null,
  freiKmProTag: null,
  kaution: null,
  status: 'AKTIV',
  bildUrl: '',
})

const editForm = ref(emptyForm())

// Bild state
const newImageFile = ref(null)

// Backend Base (prod-ready via .env)
const BACKEND = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// =====================
// IMAGE PREVIEW (mit Cleanup)
// =====================
const previewUrl = ref(null)

watch(newImageFile, (file) => {
  // alte Preview aufräumen -> kein Memory Leak
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
  if (file) previewUrl.value = URL.createObjectURL(file)
})

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})

// finaler Preview-Src fürs Modal
const imagePreview = computed(() => {
  if (previewUrl.value) return previewUrl.value

  const url = editForm.value.bildUrl
  if (!url) return 'https://placehold.co/520x320?text=Mazari'
  return url.startsWith('http') ? url : `${BACKEND}${url}`
})

// =====================
// LOAD VEHICLES (ADMIN)
// Race-safe (falls Komponente schnell wechselt)
// =====================
let loadSeq = 0

async function loadVehicles() {
  const seq = ++loadSeq
  try {
    loading.value = true
    error.value = ''
    const data = await vehicleService.getAllVehiclesAdmin()
    if (seq !== loadSeq) return // ignore old response

    vehicles.value = Array.isArray(data) ? data : []
  } catch (e) {
    if (seq !== loadSeq) return
    error.value =
      e?.response?.data?.message || e?.message || 'Fahrzeuge konnten nicht geladen werden.'
  } finally {
    if (seq === loadSeq) loading.value = false
  }
}

onMounted(loadVehicles)

// =====================
// MODAL HANDLING
// =====================
function openEdit(vehicle) {
  modalError.value = ''
  modalOpen.value = true
  newImageFile.value = null

  // nur bekannte Felder übernehmen -> stabiler
  editForm.value = {
    ...emptyForm(),
    id: vehicle.id ?? null,
    marke: vehicle.marke ?? '',
    modell: vehicle.modell ?? '',
    serie: vehicle.serie ?? '',
    baujahr: vehicle.baujahr ?? null,
    ps: vehicle.ps ?? null,
    getriebe: vehicle.getriebe ?? '',
    kraftstoff: vehicle.kraftstoff ?? '',
    sitze: vehicle.sitze ?? null,
    tueren: vehicle.tueren ?? null,
    farbe: vehicle.farbe ?? '',
    nettoPreisProTag: vehicle.nettoPreisProTag ?? null,
    freiKmProTag: vehicle.freiKmProTag ?? null,
    kaution: vehicle.kaution ?? null,
    status: vehicle.status ?? 'AKTIV',
    bildUrl: vehicle.bildUrl ?? '',
  }
}

function closeEdit() {
  modalOpen.value = false
  modalError.value = ''
  newImageFile.value = null
  editForm.value = emptyForm()
}

// File Input Change
function onFileChange(e) {
  newImageFile.value = e.target.files?.[0] || null
}

// =====================
// Payload normalisieren (Nummern sauber)
// =====================
function normalizePayload(form) {
  const payload = { ...form }

  // id nicht mitsenden (Backend braucht es nicht im Body)
  delete payload.id

  const intFields = ['baujahr', 'ps', 'sitze', 'tueren', 'freiKmProTag']
  const floatFields = ['nettoPreisProTag', 'kaution']

  intFields.forEach((k) => {
    if (payload[k] === '' || payload[k] === undefined) payload[k] = null
    if (payload[k] !== null) payload[k] = Number.parseInt(payload[k], 10)
  })

  floatFields.forEach((k) => {
    if (payload[k] === '' || payload[k] === undefined) payload[k] = null
    if (payload[k] !== null) payload[k] = Number(payload[k])
  })

  return payload
}

// =====================
// SAVE EDIT
// =====================
async function saveEdit() {
  if (saving.value) return // doppelklick-sicher
  modalError.value = ''

  try {
    saving.value = true

    const id = editForm.value.id
    if (!id) {
      modalError.value = 'Ungültige Fahrzeug-ID.'
      return
    }

    // 1) Daten updaten
    const updatedVehicle = await vehicleService.updateVehicle(id, normalizePayload(editForm.value))

    // Fallback falls Backend nix zurückgibt
    let finalVehicle = updatedVehicle || { ...editForm.value }

    // 2) Optional Bild hochladen
    if (newImageFile.value) {
      const withImage = await vehicleService.uploadVehicleImage(id, newImageFile.value)
      finalVehicle = withImage || finalVehicle
    }

    // 3) Liste lokal patchen (performant)
    const idx = vehicles.value.findIndex((v) => v.id === finalVehicle.id)
    if (idx !== -1) {
      vehicles.value.splice(idx, 1, finalVehicle)
    } else {
      vehicles.value.unshift(finalVehicle)
    }

    closeEdit()
  } catch (e) {
    console.error('Update fehlgeschlagen:', e)
    modalError.value =
      e?.response?.data?.message || e?.message || 'Update fehlgeschlagen. Bitte erneut versuchen.'
  } finally {
    saving.value = false
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
            <!-- BILD -->
            <div class="field field-full">
              <label>Bild</label>

              <div class="image-row">
                <img class="preview" :src="imagePreview" alt="Vorschau" />

                <div class="image-actions">
                  <input type="file" accept="image/*" @change="onFileChange" />

                  <small class="hint"> Wenn du nichts auswählst, bleibt das aktuelle Bild. </small>
                </div>
              </div>
            </div>

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

.field-full {
  grid-column: 1 / -1;
}

.image-row {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid #e6eaf0;
  background: #f8fafc;
}

.preview {
  width: 220px;
  height: 140px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #e6eaf0;
  background: white;
}

.image-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-weight: 700;
  font-size: 13px;
  color: #0f172a;
}

.hint {
  color: #667085;
  font-size: 12px;
  font-weight: 600;
}

@media (max-width: 520px) {
  .image-row {
    flex-direction: column;
    align-items: stretch;
  }
  .preview {
    width: 100%;
    height: 180px;
  }
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
