<script setup>
import { ref, watch, computed } from 'vue'
import { preisBerechnungService } from '@/api/preisBerechnungService'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
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
    default: true,
  },
})

const emit = defineEmits(['close', 'price-loaded', 'pay'])

// Auswahl im Modal
const freieKmPaket = ref(props.initialKmPaket)
const bringService = ref(false)

// Daten vom Backend
const preis = ref(null)
const loading = ref(false)
const error = ref(null)

const errorMessage = computed(
  () => error.value?.response?.data?.message || error.value?.message || 'Unbekannter Fehler',
)

// Preis vom Backend laden
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
    emit('price-loaded', data)
  } catch (e) {
    console.error('[Preis] Fehler bei Preisberechnung:', e)
    error.value = e
    preis.value = null
  } finally {
    loading.value = false
  }
}

watch(
  () => freieKmPaket.value,
  () => {
    if (!props.visible) return
    loadPreis()
  },
)

watch(
  () => bringService.value,
  () => {
    if (!props.visible) return
    loadPreis()
  },
)

watch(
  () => props.visible,
  (val) => {
    if (val) {
      freieKmPaket.value = props.initialKmPaket ?? 150
      bringService.value = false
      loadPreis()
    }
  },
)

watch(
  () => props.initialKmPaket,
  (val) => {
    if (val != null) {
      freieKmPaket.value = val
      if (props.visible) loadPreis()
    }
  },
)

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

const onCancel = () => emit('close')
const onPay = () =>
  emit('pay', {
    kmPaket: freieKmPaket.value,
    bringService: bringService.value,
  })
</script>

<template>
  <teleport to="body">
    <div v-if="visible" class="modal-backdrop">
      <div class="modal">
        <h3 class="modal-title">Preisübersicht &amp; Zahlung</h3>

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

        <p v-if="visible && !canPay" class="msg error">
          Die Reservierung ist abgelaufen. Bitte schließe dieses Fenster und wähle den Zeitraum neu.
        </p>

        <div class="modal-actions">
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
    </div>
  </teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 40;
}

.modal {
  width: 100%;
  max-width: 480px;
  background: #ffffff;
  border-radius: 18px;
  padding: 20px 22px;
  box-shadow:
    0 18px 45px rgba(15, 23, 42, 0.18),
    0 0 0 1px rgba(148, 163, 184, 0.15);
}

.modal-title {
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 14px;
  color: #0f172a;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.field label {
  font-size: 13px;
  font-weight: 700;
  color: #475569;
}

.field select {
  border-radius: 999px;
  border: 1px solid #cbd5e1;
  padding: 8px 14px;
  font-size: 14px;
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
  margin-bottom: 10px;
}
.msg.info {
  color: #0f172a;
}
.msg.error {
  color: #b91c1c;
  font-weight: 600;
}

.price-result {
  margin-top: 6px;
  margin-bottom: 12px;
}

.price-result h4 {
  margin-top: 10px;
  margin-bottom: 4px;
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 3px 0;
}
.summary-row span:first-child {
  color: #64748b;
}
.summary-row.total {
  border-top: 1px dashed #e2e8f0;
  margin-top: 4px;
  padding-top: 6px;
}
.summary-row.total.big strong {
  font-size: 15px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.btn {
  border-radius: 999px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid transparent;
  cursor: pointer;
}
.btn.ghost {
  border-color: #cbd5e1;
  background: #ffffff;
  color: #0f172a;
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
