<script setup>
import NavBar from '@/components/NavBar.vue'
import VehicleCard from '@/components/vehicles/VehicleCard.vue'
import { onMounted, ref } from 'vue'
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

const API_BASE_URL =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// Edit-Form (nur Stammdaten)
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
})

const editForm = ref(emptyForm())

// Bilder für das aktuell bearbeitete Fahrzeug
const editImages = ref([]) // [{id,url,vorschau,sortierung}, ...]

// Files zum Ersetzen einzelner Bilder (key = bildId)
const replaceFiles = ref({}) // { [bildId]: File }
const replacePreviews = ref({}) // { [bildId]: objectUrl }

const newImages = ref([]) // Array<File>
const newImagePreviews = ref([]) // Array<objectUrl>

const onNewImagesChange = (e) => {
  const files = Array.from(e.target.files || [])
  if (!files.length) return

  // an vorhandene anhängen (falls mehrfach gewählt wird)
  newImages.value = [...newImages.value, ...files]

  const urls = files.map((f) => URL.createObjectURL(f))
  newImagePreviews.value = [...newImagePreviews.value, ...urls]

  // Input resetten
  e.target.value = ''
}

const resolveImageUrl = (url) => {
  if (!url) return 'https://placehold.co/520x320?text=Mazari'
  if (url.startsWith('http')) return url
  return API_BASE_URL + url
}

// =====================
// LOAD VEHICLES (ADMIN)
// =====================
const loadVehicles = async () => {
  try {
    loading.value = true
    error.value = ''
    const data = await vehicleService.getAllVehiclesAdmin()
    vehicles.value = Array.isArray(data) ? data : []
  } catch (e) {
    error.value =
      e?.response?.data?.message || e?.message || 'Fahrzeuge konnten nicht geladen werden.'
  } finally {
    loading.value = false
  }
}

onMounted(loadVehicles)

// =====================
// MODAL HANDLING
// =====================
function openEdit(vehicle) {
  modalError.value = ''
  editImages.value = vehicle.bilder || []
  newImages.value = []
  newImagePreviews.value = []
  modalOpen.value = true

  replaceFiles.value = {}
  // alte Previews aufräumen
  Object.values(replacePreviews.value).forEach((url) => URL.revokeObjectURL(url))
  replacePreviews.value = {}

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
  }

  editImages.value = vehicle.bilder || []
}

function closeEdit() {
  modalOpen.value = false
  modalError.value = ''
  editForm.value = emptyForm()
  editImages.value = []

  Object.values(replacePreviews.value).forEach((url) => URL.revokeObjectURL(url))
  replacePreviews.value = {}
  replaceFiles.value = {}

  newImages.value.forEach((_f, i) => {
    const url = newImagePreviews.value[i]
    if (url) URL.revokeObjectURL(url)
  })
  newImages.value = []
  newImagePreviews.value = []
}

// File auswählen für ein bestimmtes Bild
function onReplaceFileChange(bildId, e) {
  const file = e.target.files?.[0] || null
  if (!file) {
    if (replaceFiles.value[bildId]) delete replaceFiles.value[bildId]
    if (replacePreviews.value[bildId]) {
      URL.revokeObjectURL(replacePreviews.value[bildId])
      delete replacePreviews.value[bildId]
    }
    return
  }

  replaceFiles.value = { ...replaceFiles.value, [bildId]: file }

  if (replacePreviews.value[bildId]) {
    URL.revokeObjectURL(replacePreviews.value[bildId])
  }
  const url = URL.createObjectURL(file)
  replacePreviews.value = { ...replacePreviews.value, [bildId]: url }
}

// =====================
// Payload normalisieren
// =====================
function normalizePayload(form) {
  const payload = { ...form }
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
  if (saving.value) return
  modalError.value = ''

  try {
    saving.value = true

    const id = editForm.value.id
    if (!id) {
      modalError.value = 'Ungültige Fahrzeug-ID.'
      return
    }

    // 1) Stammdaten
    await vehicleService.updateVehicle(id, normalizePayload(editForm.value))

    // 2) Bestehende Bilder ersetzen
    const entries = Object.entries(replaceFiles.value)
    for (const [bildIdStr, file] of entries) {
      const bildId = Number(bildIdStr)
      if (!file || !bildId) continue
      await vehicleService.replaceVehicleImage(id, bildId, file)
    }

    // 3) NEU: zusätzliche Bilder anhängen
    if (newImages.value.length > 0) {
      await vehicleService.uploadVehicleImages(id, newImages.value)
    }

    // 4) Liste neu laden
    await loadVehicles()
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

      <router-link to="/meinprofil" class="btn-back-to-profile">
        ← Zurück zu meinem Profil
      </router-link>

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
      <div v-if="modalOpen" class="modal-backdrop">
        <div class="modal">
          <h3 class="modal-title">Fahrzeug bearbeiten</h3>

          <div class="modal-grid">
            <!-- BILDER -->
            <!-- BILDER -->
            <div class="field field-full">
              <label>Bilder</label>

              <div class="images-grid">
                <div v-for="img in editImages" :key="img.id" class="image-item">
                  <div class="image-thumb-wrap">
                    <img
                      class="image-thumb"
                      :src="replacePreviews[img.id] || resolveImageUrl(img.url)"
                      :alt="`Bild ${img.sortierung}`"
                    />
                    <span v-if="img.vorschau" class="badge">Vorschau</span>
                  </div>

                  <div class="image-edit-controls">
                    <input
                      type="file"
                      accept="image/*"
                      @change="(e) => onReplaceFileChange(img.id, e)"
                    />
                    <small class="hint"> Datei auswählen, um dieses Bild zu ersetzen. </small>
                  </div>
                </div>

                <p v-if="!editImages.length" class="hint">
                  Für dieses Fahrzeug sind aktuell keine Bilder hinterlegt.
                </p>
              </div>

              <!-- NEU: weitere Bilder hinzufügen -->
              <div class="new-images-block">
                <label class="new-images-label">Weitere Bilder hinzufügen</label>

                <!-- kleine Previews der neuen Bilder -->
                <div v-if="newImagePreviews.length" class="new-images-preview-row">
                  <div
                    v-for="(src, idx) in newImagePreviews"
                    :key="idx"
                    class="image-thumb-wrap new-thumb"
                  >
                    <img :src="src" alt="Neues Bild" class="image-thumb" />
                  </div>
                </div>

                <div class="image-edit-controls">
                  <input type="file" accept="image/*" multiple @change="onNewImagesChange" />
                  <small class="hint">
                    Du kannst hier zusätzliche Bilder hochladen. Sie werden an das Fahrzeug
                    angehängt.
                  </small>
                </div>
              </div>
            </div>

            <!-- STAMMDATEN -->
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

          <p v-if="modalError" class="modal-error">{{ modalError }}</p>

          <div class="modal-actions">
            <button class="btn ghost" @click="closeEdit">Abbrechen</button>
            <button class="btn primary" :disabled="saving" @click="saveEdit">
              {{ saving ? 'Speichere…' : 'Speichern' }}
            </button>
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
.images-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr)); /* 3 Bilder je Reihe */
  gap: 12px;
  margin-bottom: 10px;
}

/* Jedes Bild-Item füllt seine Spalte */
.image-item {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.image-thumb-wrap {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
}

.image-thumb {
  width: 100%;
  height: 140px;
  object-fit: cover;
}

.new-images-block {
  margin-top: 12px;
  border-top: 1px solid #e2e8f0;
  padding-top: 10px;
}

.new-images-label {
  display: block;
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 6px;
}

.new-images-preview-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 6px;
}

.new-thumb {
  width: 90px;
}

.new-thumb .image-thumb {
  height: 70px;
}
/* Badge bleibt wie gehabt */
.badge {
  position: absolute;
  left: 6px;
  top: 6px;
  background: rgba(37, 99, 235, 0.9);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 999px;
}

.image-edit-controls {
  display: flex;
  flex-direction: column; /* übereinander statt nebeneinander */
  align-items: stretch;
}
.image-edit-controls input[type='file']::file-selector-button {
  padding: 8px 14px;
  border-radius: 999px;
  border: 1.5px solid #0f63ff;
  background: #ffffff; /* weißer Hintergrund */
  color: #0f63ff; /* blaue Schrift */
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease;
}

.image-edit-controls input[type='file']::file-selector-button:hover {
  background: #0f63ff; /* blau hinterlegt beim Hover */
  color: #ffffff; /* Schrift wird weiß */
  box-shadow: 0 4px 10px rgba(15, 99, 255, 0.35);
}

.image-edit-controls .hint {
  display: block;
  margin-top: 4px;
  text-align: center; /* oder left, wenn du’s links haben willst */
}
.modal-error {
  margin-top: 8px;
  color: #ef4444;
  font-weight: 700;
  text-align: center;
}

.btn-back-to-profile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
  margin-bottom: 20px;
  padding: 10px 16px;
  border-radius: 999px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #0f172a;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
  transition: 0.18s ease;
}

.btn-back-to-profile:hover {
  background: #e2e8f0;
}

@media (max-width: 960px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .images-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 600px) {
  .grid {
    grid-template-columns: 1fr;
  }
  .images-grid {
    grid-template-columns: 1fr;
  }
  .modal {
    max-height: 92vh;
    padding: 16px 14px;
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
  inset: 0; /* top/right/bottom/left: 0 */
  background: rgba(15, 23, 42, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999; /* über allem */
}

.modal {
  background: #fff;
  border-radius: 18px;
  padding: 20px 22px;
  max-width: 960px;
  width: 100%;
  max-height: 90vh; /* nicht höher als Viewport */
  overflow-y: auto; /* Inhalt scrollt */
  box-shadow:
    0 20px 40px rgba(15, 23, 42, 0.25),
    0 4px 12px rgba(15, 23, 42, 0.12);
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
