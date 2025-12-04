<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { preisBerechnungService } from '@/api/preisBerechnungService'

const props = defineProps({
  buchungId: {
    type: Number,
    required: true,
  },
  initialKmPaket: {
    type: Number,
    default: 150,
  },
  canPay: {
    type: Boolean,
    default: true, // kommt von außen (Reservation noch aktiv?)
  },
})

const emit = defineEmits(['price-loaded', 'pay', 'close'])

// Auswahl im Panel
const freieKmPaket = ref(props.initialKmPaket)
const bringService = ref(false)

// Daten vom Backend
const preis = ref(null)
const loading = ref(false)
const error = ref(null)

const errorMessage = computed(
  () => error.value?.response?.data?.message || error.value?.message || 'Unbekannter Fehler',
)

const onCancel = () => {
  emit('close')
}

// 🔥 Preis IMMER vom Backend holen – hier wird NICHT gerechnet
const loadPreis = async () => {
  if (!props.buchungId) return

  loading.value = true
  error.value = null

  try {
    const data = await preisBerechnungService.getPreisByBooking(
      props.buchungId,
      freieKmPaket.value,
      bringService.value,
    )
    preis.value = data
    console.log('[PreisBox] Preis vom Backend:', data)
    emit('price-loaded', data)
  } catch (e) {
    console.error('[Preis] Fehler bei Preisberechnung:', e)
    error.value = e
    preis.value = null
  } finally {
    loading.value = false
  }
}

// Km-Paket geändert
watch(
  () => freieKmPaket.value,
  () => {
    loadPreis()
  },
)

// Bringservice geändert
watch(
  () => bringService.value,
  () => {
    loadPreis()
  },
)

// falls sich initialKmPaket ändert (theoretisch)
watch(
  () => props.initialKmPaket,
  (val) => {
    if (val != null) {
      freieKmPaket.value = val
      loadPreis()
    }
  },
)

// Beim Mounten direkt Preis holen
onMounted(() => {
  freieKmPaket.value = props.initialKmPaket ?? 150
  bringService.value = false

  if (props.buchungId) {
    loadPreis()
  }
})

const formatCurrency = (val) => {
  if (val == null) return '–'
  const num = Number(val)
  if (Number.isNaN(num)) return String(val)
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(num)
}

const mwstProzent = computed(() =>
  preis.value?.mwstSatz != null ? Math.round(Number(preis.value.mwstSatz) * 100) : 19,
)

const onPay = () =>
  emit('pay', {
    kmPaket: freieKmPaket.value,
    bringService: bringService.value,
  })
</script>

<template>
  <div class="price-box">
    <h3 class="price-title">Preisübersicht &amp; Zahlung</h3>
    <p class="price-sub">
      Hier siehst du den berechneten Mietpreis für deine Reservierung. Abschließend kannst du die
      Zahlung über Stripe durchführen.
    </p>

    <!-- Km-Paket Auswahl -->
    <div class="field">
      <label for="kmPaket">Kilometerpaket für den Mietzeitraum</label>
      <select id="kmPaket" v-model.number="freieKmPaket">
        <option :value="150">150 km (inklusive)</option>
        <option :value="300">300 km</option>
        <option :value="500">500 km</option>
      </select>
    </div>

    <!-- Bringservice Checkbox -->
    <div class="field field-checkbox">
      <label class="checkbox-label">
        <input type="checkbox" v-model="bringService" />
        <span>Bringservice gewünscht (Fahrzeug wird geliefert)</span>
      </label>
      <small class="hint">
        Der Aufpreis für den Bringservice ist in der Berechnung unten bereits berücksichtigt.
      </small>
    </div>

    <div v-if="loading" class="msg info">Preis wird berechnet…</div>
    <div v-else-if="error" class="msg error">
      Fehler bei der Preisberechnung: {{ errorMessage }}
    </div>

    <div v-else-if="preis" class="price-result">
      <div class="summary-row">
        <span>Miettage</span>
        <strong>{{ preis.tage }} Tag(e)</strong>
      </div>

      <div class="summary-row">
        <span>Km-Paket (für den Zeitraum)</span>
        <strong>{{ freieKmPaket }} km</strong>
      </div>

      <h4>Netto</h4>
      <div class="summary-row">
        <span>Fahrzeugmiete</span>
        <span>{{ formatCurrency(preis.mietpreisNetto) }}</span>
      </div>
      <div class="summary-row">
        <span>Kilometerpaket</span>
        <span>{{ formatCurrency(preis.kmPaketAufpreisNetto) }}</span>
      </div>
      <div class="summary-row">
        <span>Bringservice</span>
        <span>{{ formatCurrency(preis.bringServiceNetto) }}</span>
      </div>
      <div class="summary-row total">
        <span>Gesamt Netto</span>
        <strong>{{ formatCurrency(preis.gesamtNetto) }}</strong>
      </div>

      <h4>Brutto</h4>
      <div class="summary-row">
        <span>MwSt ({{ mwstProzent }} %)</span>
        <span>{{ formatCurrency(preis.mwstBetrag) }}</span>
      </div>
      <div class="summary-row total big">
        <span>Gesamt (Brutto)</span>
        <strong>{{ formatCurrency(preis.gesamtBrutto) }}</strong>
      </div>
    </div>

    <p v-if="!canPay" class="msg error">
      Die Reservierung ist abgelaufen. Bitte wähle den Zeitraum neu, um eine neue Buchung zu
      starten.
    </p>

    <div class="price-actions">
      <button type="button" class="btn ghost" @click="onCancel">Abbrechen</button>

      <button
        type="button"
        class="btn primary"
        :disabled="!preis || loading || !canPay"
        @click="onPay"
      >
        Jetzt bezahlen
      </button>
    </div>
  </div>
</template>

<style scoped>
.price-box {
  margin-top: 16px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  padding: 16px 16px 14px;
  box-shadow: var(--mazari-shadow-subtle);
}

.price-title {
  font-size: 16px;
  font-weight: 800;
  margin: 0 0 4px;
  color: #0f172a;
}
.price-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 6px;
}

.btn.ghost {
  border-color: #cbd5e1;
  background: #ffffff;
  color: #0f172a;
}

.price-sub {
  margin: 0 0 10px;
  font-size: 13px;
  color: #64748b;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}

.field label {
  font-size: 12px;
  font-weight: 700;
  color: #475569;
}

.field select {
  border-radius: 999px;
  border: 1px solid #cbd5e1;
  padding: 7px 12px;
  font-size: 14px;
  background: #f8fafc;
}

.field-checkbox .checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #0f172a;
}

.field-checkbox input[type='checkbox'] {
  width: 16px;
  height: 16px;
}

.field .hint {
  font-size: 11px;
  color: #94a3b8;
}

.msg {
  font-size: 13px;
  margin-bottom: 8px;
}
.msg.info {
  color: #0f172a;
}
.msg.error {
  color: #b91c1c;
  font-weight: 600;
}

.price-result {
  margin-top: 4px;
  margin-bottom: 10px;
}

.price-result h4 {
  margin-top: 8px;
  margin-bottom: 4px;
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 2px 0;
}
.summary-row span:first-child {
  color: #64748b;
}
.summary-row.total {
  border-top: 1px dashed #e2e8f0;
  margin-top: 4px;
  padding-top: 5px;
}
.summary-row.total.big strong {
  font-size: 15px;
}

.price-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 6px;
}

.btn {
  border-radius: 999px;
  padding: 7px 16px;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid transparent;
  cursor: pointer;
}

.btn.primary {
  border-color: #0f63ff;
  background: #0f63ff;
  color: #ffffff;
}

.btn:disabled {
  opacity: 0.6;
  cursor: default;
}
</style>
