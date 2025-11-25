<script setup>
import NavBar from '@/components/NavBar.vue'
import { useRouter } from 'vue-router'

import { ref, computed } from 'vue'
import { vehicleService } from '@/api/vehicleService'

const router = useRouter()
const form = ref({
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
  nettoPreisProTag: '',
  freiKmProTag: '',
  kaution: '',
})

// NEU: mehrere Bilder, einzeln ausgewählt
const imageFiles = ref([]) // Array<File>
const imagePreviews = ref([]) // Array<string>
const fileInputRef = ref(null) // verstecktes Input-Element

const loading = ref(false)
const error = ref('')
const success = ref('')

const requiredOk = computed(
  () =>
    form.value.marke &&
    form.value.modell &&
    form.value.nettoPreisProTag !== '' &&
    form.value.freiKmProTag !== '',
)

const triggerFileSelect = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

const onAddImage = (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  imageFiles.value.push(file)
  imagePreviews.value.push(URL.createObjectURL(file))

  // wichtig, sonst kann man dasselbe File direkt nochmal nicht wählen
  e.target.value = ''
}

const resetForm = () => {
  form.value = {
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
    nettoPreisProTag: '',
    freiKmProTag: '',
    kaution: '',
  }
  imageFiles.value = []
  imagePreviews.value = []
}

const submit = async () => {
  error.value = ''
  success.value = ''
  if (!requiredOk.value) {
    error.value = 'Bitte mindestens Marke, Modell, Preis und Freikilometer angeben.'
    return
  }

  try {
    loading.value = true

    // 1) Fahrzeug anlegen
    const dto = {
      ...form.value,
      nettoPreisProTag: Number(form.value.nettoPreisProTag),
      freiKmProTag: Number(form.value.freiKmProTag),
      kaution: form.value.kaution !== '' ? Number(form.value.kaution) : null,
      baujahr: form.value.baujahr ? Number(form.value.baujahr) : null,
      ps: form.value.ps ? Number(form.value.ps) : null,
      sitze: form.value.sitze ? Number(form.value.sitze) : null,
      tueren: form.value.tueren ? Number(form.value.tueren) : null,
    }

    const created = await vehicleService.createVehicle(dto)

    // 2) Optional Bilder hochladen (in Reihenfolge: Bild 1 = Vorschau)
    if (imageFiles.value.length > 0) {
      await vehicleService.uploadVehicleImages(created.id, imageFiles.value)
    }

    success.value = 'Fahrzeug erfolgreich angelegt ✅'
    router.push('/admin/fahrzeuge')

    resetForm()
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || 'Fehler beim Anlegen des Fahrzeugs.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <nav-bar />

    <main class="admin-wrapper">
      <section class="admin-card">
        <header class="head">
          <h2 class="title">Fahrzeug anlegen</h2>
          <p class="sub">Neue Fahrzeuge für deine Flotte hinzufügen.</p>
        </header>

        <form class="form" @submit.prevent="submit">
          <!-- Bild -->
          <!-- Bild -->
          <div class="image-block">
            <!-- Thumbnails -->
            <div v-if="imagePreviews.length" class="thumb-grid">
              <div v-for="(src, idx) in imagePreviews" :key="idx" class="thumb">
                <span class="thumb-label">
                  Bild {{ idx + 1 }}
                  <span v-if="idx === 0"> (Vorschau)</span>
                </span>
                <img :src="src" :alt="`Bild ${idx + 1}`" />
              </div>
            </div>

            <!-- Button: Bild 1 auswählen, danach Bild 2, 3, ... -->
            <button type="button" class="image-btn" @click="triggerFileSelect">
              Bild {{ imageFiles.length + 1 }} auswählen
            </button>
            <input ref="fileInputRef" type="file" accept="image/*" @change="onAddImage" hidden />

            <p class="hint">
              Optional – ohne Bilder wird ein Platzhalter genutzt. Erstes Bild wird als
              Vorschau-Bild verwendet.
            </p>
          </div>

          <!-- Basic -->
          <div class="grid">
            <div class="field">
              <label>Marke *</label>
              <input v-model="form.marke" placeholder="z. B. BMW" />
            </div>
            <div class="field">
              <label>Modell *</label>
              <input v-model="form.modell" placeholder="z. B. M8" />
            </div>
            <div class="field">
              <label>Serie</label>
              <input v-model="form.serie" placeholder="z. B. Competition" />
            </div>

            <div class="field">
              <label>Baujahr</label>
              <input v-model="form.baujahr" type="number" min="1980" max="2100" />
            </div>
            <div class="field">
              <label>PS</label>
              <input v-model="form.ps" type="number" min="1" />
            </div>
            <div class="field">
              <label>Getriebe</label>
              <input v-model="form.getriebe" placeholder="Automatik / Schaltgetriebe" />
            </div>

            <div class="field">
              <label>Kraftstoff</label>
              <input v-model="form.kraftstoff" placeholder="Benzin / Diesel / Elektro" />
            </div>
            <div class="field">
              <label>Sitze</label>
              <input v-model="form.sitze" type="number" min="1" />
            </div>
            <div class="field">
              <label>Türen</label>
              <input v-model="form.tueren" type="number" min="1" />
            </div>

            <div class="field">
              <label>Farbe</label>
              <input v-model="form.farbe" placeholder="Schwarz" />
            </div>

            <div class="field money">
              <label>Netto-Preis pro Tag *</label>
              <div class="money-row">
                <input v-model="form.nettoPreisProTag" type="number" min="0" step="0.01" />
                <span>€</span>
              </div>
            </div>

            <div class="field">
              <label>Freikilometer pro Tag *</label>
              <input v-model="form.freiKmProTag" type="number" min="0" />
            </div>

            <div class="field money">
              <label>Kaution (optional)</label>
              <div class="money-row">
                <input v-model="form.kaution" type="number" min="0" step="0.01" />
                <span>€</span>
              </div>
            </div>
          </div>

          <p v-if="error" class="msg error">{{ error }}</p>
          <p v-if="success" class="msg success">{{ success }}</p>

          <button class="submit" :disabled="loading || !requiredOk">
            {{ loading ? 'Speichere…' : 'Fahrzeug speichern' }}
          </button>
        </form>
      </section>
    </main>
  </div>
</template>

<style scoped>
.admin-wrapper {
  padding: clamp(22px, 4vw, 48px);
  display: flex;
  justify-content: center;
}

.admin-card {
  width: 100%;
  max-width: 980px;
  background: #fff;
  border: 1px solid rgba(6, 69, 127, 0.12);
  border-radius: 18px;
  padding: clamp(18px, 3vw, 28px);
  box-shadow:
    0 10px 28px rgba(15, 23, 42, 0.1),
    0 2px 8px rgba(15, 23, 42, 0.06);
}

.head {
  text-align: center;
  margin-bottom: 18px;
}
.title {
  font-size: clamp(20px, 3.2vw, 26px);
  font-weight: 900;
  color: var(--mazari-text-dark);
  margin: 0;
}

.thumb-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.thumb {
  width: 110px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
}

.thumb-label {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 6px;
  color: #0f172a;
  background: rgba(148, 163, 184, 0.2);
}

.thumb img {
  width: 100%;
  height: 70px;
  object-fit: cover;
}

.sub {
  margin-top: 6px;
  color: #667085;
  font-weight: 600;
  font-size: 14px;
}

/* Bildblock */
.image-block {
  display: grid;
  gap: 8px;
  margin-bottom: 18px;
}
.image-preview {
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 14px;
  overflow: hidden;
  border: 1px dashed #cbd5e1;
  background: #f8fafc;
}
.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.image-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  padding: 10px 14px;
  border-radius: 10px;
  background: var(--mazari-primary);
  color: white;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s;
}
.image-btn:hover {
  background: var(--mazari-primary-dark);
}
.hint {
  font-size: 12px;
  color: #667085;
  font-weight: 600;
}

/* Form Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
label {
  font-weight: 800;
  font-size: 13px;
  color: #0f172a;
}
input {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1.6px solid #cbd5e1;
  background: #f8fafc;
  font-size: 16px; /* iOS zoom off */
  transition: 0.18s;
}
input:focus {
  outline: none;
  background: #fff;
  border-color: var(--mazari-primary);
  box-shadow: 0 0 0 3px rgba(4, 116, 196, 0.16);
}

/* Money Row */
.money-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.money-row span {
  font-weight: 800;
  color: #334155;
}

/* Messages */
.msg {
  margin-top: 12px;
  font-weight: 800;
  text-align: center;
}
.msg.error {
  color: #ef4444;
}
.msg.success {
  color: #16a34a;
}

/* Submit */
.submit {
  margin-top: 14px;
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: none;
  font-weight: 900;
  font-size: 15px;
  background: var(--mazari-primary);
  color: white;
  cursor: pointer;
  transition: 0.2s;
}
.submit:hover:enabled {
  background: var(--mazari-primary-dark);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.18);
}
.submit:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 900px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 600px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
