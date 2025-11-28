<script setup>
import { computed, ref, onMounted } from 'vue'
import { bookingService } from '@/api/bookingService'
import { useAuthStore } from '@/stores/AuthStore'

const props = defineProps({
  vehicleId: { type: Number, required: false },
  vehicle: { type: Object, required: false },
})

const auth = useAuthStore()
const currentUser = computed(() => auth.user || auth.currentUser || null)

const isAdmin = computed(() => {
  const role = currentUser.value?.role
  return role === 'ADMIN' || role === 'ROLE_ADMIN'
})

// === STATE ===
const today = new Date()
today.setHours(0, 0, 0, 0)

const currentMonth = ref(startOfMonth(today))
const startDate = ref(null) // Date | null
const endDate = ref(null) // Date | null

const pickupTime = ref('10:00')
const returnTime = ref('10:00')

const bookingLoading = ref(false)
const bookingError = ref('')
const bookingSuccess = ref('')

// Buchungen für dieses Fahrzeug -> belegte Tage
const bookedRanges = ref([])

// === HELPERS (Dates) ===
function startOfMonth(d) {
  const tmp = new Date(d)
  tmp.setDate(1)
  tmp.setHours(0, 0, 0, 0)
  return tmp
}

function endOfMonth(d) {
  const tmp = new Date(d)
  tmp.setMonth(tmp.getMonth() + 1)
  tmp.setDate(0)
  tmp.setHours(0, 0, 0, 0)
  return tmp
}

function sameDate(a, b) {
  return (
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function cloneDate(d) {
  return d ? new Date(d.getTime()) : null
}

function parseTimeStr(str) {
  const [h, m] = (str || '10:00').split(':')
  return {
    h: Number.parseInt(h ?? '0', 10) || 0,
    m: Number.parseInt(m ?? '0', 10) || 0,
  }
}

function toIsoLocal(d) {
  const pad = (n) => String(n).padStart(2, '0')
  return (
    d.getFullYear() +
    '-' +
    pad(d.getMonth() + 1) +
    '-' +
    pad(d.getDate()) +
    'T' +
    pad(d.getHours()) +
    ':' +
    pad(d.getMinutes()) +
    ':00'
  )
}

function dateKey(d) {
  if (!d) return ''
  const y = d.getFullYear()
  const m = d.getMonth()
  const day = d.getDate()
  return `${y}-${m}-${day}`
}

// === BLOCKIERTE TAGE (aus Buchungen) ===
const blockedDateSet = computed(() => {
  const set = new Set()
  const now = new Date()
  const aktiveStatus = ['RESERVIERT', 'BEZAHLT']

  for (const b of bookedRanges.value) {
    if (!b.startDatum || !b.endDatum) continue
    if (!aktiveStatus.includes(b.status)) continue

    // Abgelaufene Reservierung ignorieren
    if (
      b.status === 'RESERVIERT' &&
      b.reserviertBis &&
      new Date(b.reserviertBis).getTime() < now.getTime()
    ) {
      continue
    }

    const start = new Date(b.startDatum)
    const end = new Date(b.endDatum)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) continue

    // Alle Tage im Bereich markieren
    for (let d = new Date(start.getTime()); d <= end; d.setDate(d.getDate() + 1)) {
      set.add(dateKey(d))
    }
  }
  return set
})

function isBlockedDate(d) {
  return blockedDateSet.value.has(dateKey(d))
}

// === MONTH NAVIGATION ===
const canGoPrevMonth = computed(() => {
  const firstDayOfCurrent = startOfMonth(currentMonth.value)
  const firstDayOfToday = startOfMonth(today)
  return firstDayOfCurrent > firstDayOfToday
})

function prevMonth() {
  if (!canGoPrevMonth.value) return
  const m = cloneDate(currentMonth.value)
  m.setMonth(m.getMonth() - 1)
  currentMonth.value = startOfMonth(m)
}

function nextMonth() {
  const m = cloneDate(currentMonth.value)
  m.setMonth(m.getMonth() + 1)
  currentMonth.value = startOfMonth(m)
}

const monthLabel = computed(() =>
  currentMonth.value.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }),
)

// === KALENDERBERECHNUNG ===
const daysGrid = computed(() => {
  const start = startOfMonth(currentMonth.value)
  const end = endOfMonth(currentMonth.value)

  const days = []

  let weekday = start.getDay() // 0-6
  if (weekday === 0) weekday = 7 // Sonntag -> 7

  for (let i = 1; i < weekday; i++) {
    days.push({ date: null, isPast: false })
  }

  for (let day = 1; day <= end.getDate(); day++) {
    const d = new Date(start)
    d.setDate(day)
    const isPast = d < today
    days.push({ date: d, isPast })
  }

  return days
})

// === SELECTION ===
function onDayClick(dayObj) {
  const d = dayObj.date
  if (!d || dayObj.isPast || isBlockedDate(d)) return

  if (!startDate.value || (startDate.value && endDate.value)) {
    startDate.value = d
    endDate.value = null
    return
  }

  if (startDate.value && !endDate.value) {
    if (d < startDate.value) {
      startDate.value = d
      endDate.value = null
    } else {
      endDate.value = d
    }
  }
}

function isInRange(d) {
  if (!startDate.value || !endDate.value) return false
  return d > startDate.value && d < endDate.value
}

// === FORMATIERTE DATEN FÜR INPUTS ===
const formattedStartDate = computed(() =>
  startDate.value
    ? startDate.value.toLocaleDateString('de-DE', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '',
)

const formattedEndDate = computed(() =>
  endDate.value
    ? endDate.value.toLocaleDateString('de-DE', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '',
)

// === BUCHUNGEN FÜR KALENDER LADEN ===
async function loadBlockedDates() {
  const vehId = props.vehicleId ?? props.vehicle?.id
  if (!vehId) return

  try {
    const list = await bookingService.getBookingsByVehicle(vehId)
    console.log('[Booking] Belegte Buchungen für Fahrzeug', vehId, list)
    bookedRanges.value = Array.isArray(list) ? list : []
  } catch (e) {
    console.error('[Booking] Fehler beim Laden der belegten Tage:', e)
  }
}

// === BUCHUNG ABSCHICKEN ===
// === BUCHUNG ABSCHICKEN ===
async function submitBooking() {
  if (!startDate.value || !endDate.value) return

  bookingError.value = ''
  bookingSuccess.value = ''

  const user = currentUser.value

  // Nicht eingeloggt
  if (!user) {
    bookingError.value = 'Bitte melde dich an, um eine Buchung vorzunehmen.'
    return
  }

  // CUSTOMER: noch keine echte Buchung, erst nach Zahlung
  if (!isAdmin.value) {
    bookingError.value =
      'Du musst zuerst bezahlen, bevor du dieses Fahrzeug verbindlich reservieren kannst. ' +
      'Die Zahlungsfunktion wird in Kürze freigeschaltet.'
    return
  }

  // ADMIN: normale Reservierung wie bisher
  try {
    bookingLoading.value = true

    // DateTimes mit Zeiten zusammenbauen
    const s = new Date(startDate.value)
    const e = new Date(endDate.value)

    const { h: sh, m: sm } = parseTimeStr(pickupTime.value)
    const { h: eh, m: em } = parseTimeStr(returnTime.value)

    s.setHours(sh, sm, 0, 0)
    e.setHours(eh, em, 0, 0)

    if (e <= s) {
      bookingError.value = 'Rückgabedatum/Zeit muss nach Abholdatum/Zeit liegen.'
      return
    }

    const vehId = props.vehicleId ?? props.vehicle?.id
    if (!vehId) {
      bookingError.value = 'Fahrzeug-ID fehlt.'
      return
    }

    console.log('[Booking] Current user aus Store:', user)

    const payload = {
      fahrzeugId: vehId,
      userId: user.id ?? null,
      kundeName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email,
      kundeEmail: user.email ?? '',
      kundePhone: user.phone ?? '',
      startDatum: toIsoLocal(s),
      endDatum: toIsoLocal(e),
      bringService: false, // später Checkbox o.Ä.
    }

    console.log('[Booking] Sende Payload an Backend:', payload)

    const response = await bookingService.createBooking(payload)

    console.log('[Booking] Antwort vom Backend:', response)

    // ✅ Admin-Text
    bookingSuccess.value =
      'Du hast dieses Fahrzeug erfolgreich als Besitzer für dich reserviert. Die Buchung ist im System hinterlegt.'

    // Kalender-Blockierungen neu laden + Auswahl zurücksetzen
    await loadBlockedDates()
    startDate.value = null
    endDate.value = null
  } catch (e) {
    console.error('[Booking] Fehler beim Buchen:', e)
    bookingError.value =
      'Der gewählte Buchungszeitraum enthält belegte Tage, bitte wähle einen anderen Zeitraum.'
  } finally {
    bookingLoading.value = false
  }
}

onMounted(() => {
  loadBlockedDates()
})
</script>

<template>
  <section class="booking-card">
    <header class="booking-head">
      <div class="booking-title-block">
        <h2>Buchungsübersicht</h2>
        <p>
          Wähle deinen Mietzeitraum für dieses Fahrzeug aus. Beginnend ab
          <strong>heute</strong>.
        </p>
      </div>
      <div class="booking-vehicle" v-if="vehicle">
        <span class="vh-name">
          {{ vehicle.marke }} {{ vehicle.modell }}
          <span v-if="vehicle.serie"> · {{ vehicle.serie }}</span>
          <span v-if="vehicle.ps"> · {{ vehicle.ps }} PS</span>
        </span>
      </div>
    </header>

    <div class="booking-layout">
      <!-- Kalender -->
      <div class="calendar">
        <div class="calendar-header">
          <button class="month-btn" type="button" :disabled="!canGoPrevMonth" @click="prevMonth">
            ‹
          </button>
          <div class="month-label">{{ monthLabel }}</div>
          <button class="month-btn" type="button" @click="nextMonth">›</button>
        </div>

        <div class="calendar-weekdays">
          <span>Mo</span>
          <span>Di</span>
          <span>Mi</span>
          <span>Do</span>
          <span>Fr</span>
          <span>Sa</span>
          <span>So</span>
        </div>

        <div class="calendar-grid">
          <div
            v-for="(day, idx) in daysGrid"
            :key="idx"
            class="calendar-cell"
            :class="{
              'is-empty': !day.date,
              'is-past': day.isPast,
              'is-blocked': day.date && isBlockedDate(day.date),
              'is-start': day.date && startDate && sameDate(day.date, startDate),
              'is-end': day.date && endDate && sameDate(day.date, endDate),
              'is-in-range': day.date && isInRange(day.date),
            }"
            @click="onDayClick(day)"
          >
            <span v-if="day.date">{{ day.date.getDate() }}</span>
          </div>
        </div>

        <p class="legend">
          <span class="legend-box start"></span> Start · <span class="legend-box end"></span> Ende ·
          <span class="legend-box range"></span> Zeitraum ·
          <span class="legend-box blocked"></span> Belegt
        </p>
      </div>

      <!-- Formular rechts -->
      <div class="booking-form">
        <div class="form-row">
          <div class="field">
            <label>Abholzeit</label>
            <input v-model="pickupTime" type="time" />
          </div>

          <div class="field">
            <label>Abholdatum</label>
            <input
              :value="formattedStartDate"
              type="text"
              readonly
              placeholder="Bitte Datum wählen"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="field">
            <label>Rückgabezeit</label>
            <input v-model="returnTime" type="time" />
          </div>

          <div class="field">
            <label>Rückgabedatum</label>
            <input
              :value="formattedEndDate"
              type="text"
              readonly
              placeholder="Bitte Datum wählen"
            />
          </div>
        </div>

        <p class="hint">
          Hinweis: Dies ist aktuell die Buchungsanfrage. Der Zeitraum wird reserviert, weitere
          Schritte folgen.
        </p>

        <p v-if="bookingError" class="msg error">{{ bookingError }}</p>
        <p v-if="bookingSuccess" class="msg success">{{ bookingSuccess }}</p>

        <button
          class="cta"
          type="button"
          :disabled="!startDate || !endDate || bookingLoading"
          @click="submitBooking"
        >
          {{ bookingLoading ? 'Sende Buchung…' : 'Weiter zur Buchungsanfrage' }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.booking-card {
  margin-top: 32px;
  padding: 22px 18px 20px;
  border-radius: var(--mazari-radius-lg);
  background: #ffffff;
  box-shadow: var(--mazari-shadow-soft);
  border: 1px solid rgba(6, 69, 127, 0.12);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.booking-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.booking-title-block h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: var(--mazari-text-dark);
}

.booking-title-block p {
  margin: 4px 0 0;
  font-size: 14px;
  color: #64748b;
}

.booking-vehicle {
  text-align: right;
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
}

.vh-name {
  font-weight: 800;
  font-size: 14px;
  color: var(--mazari-primary-dark);
}

.msg {
  font-size: 13px;
  font-weight: 700;
  margin: 4px 0;
}

.msg.error {
  color: #dc2626;
}

.msg.success {
  color: #16a34a;
}

.vh-meta {
  font-size: 12px;
  color: #94a3b8;
}

/* Layout: Kalender + Formular nebeneinander */
.booking-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: 20px;
}

/* Kalender */
.calendar {
  background: var(--mazari-bg-light);
  border-radius: 14px;
  padding: 14px 14px 10px;
  border: 1px solid rgba(148, 163, 184, 0.5);
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.month-label {
  font-weight: 700;
  color: var(--mazari-primary-dark);
  text-transform: capitalize;
}

.month-btn {
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: #e2e8f0;
  color: #0f172a;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  display: grid;
  place-items: center;
}
.month-btn[disabled] {
  opacity: 0.4;
  cursor: default;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 4px;
}

.calendar-weekdays span {
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #94a3b8;
}

/* Tage */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-cell {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 10px;
  font-size: 13px;
  display: grid;
  place-items: center;
  cursor: pointer;
  user-select: none;
  transition:
    background 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.1s ease;
  color: #0f172a;
}

.calendar-cell span {
  pointer-events: none;
}

.calendar-cell.is-empty {
  cursor: default;
}

.calendar-cell.is-past {
  color: #cbd5e1;
  cursor: default;
}

/* NEU: geblockte Tage */
.calendar-cell.is-blocked {
  background: #fee2e2;
  color: #b91c1c;
  opacity: 0.7;
  cursor: not-allowed;
}

.calendar-cell:not(.is-empty):not(.is-past):not(.is-blocked):hover {
  background: rgba(6, 69, 127, 0.08);
}

/* Status-Farben */
.calendar-cell.is-start,
.calendar-cell.is-end {
  background: #22c55e;
  color: #ffffff;
  font-weight: 800;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.3);
}

.calendar-cell.is-in-range {
  background: rgba(34, 197, 94, 0.18);
  color: #064e3b;
}

.legend {
  margin-top: 10px;
  font-size: 11px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.legend-box {
  width: 12px;
  height: 12px;
  border-radius: 4px;
  display: inline-block;
}
.legend-box.start {
  background: #22c55e;
}
.legend-box.end {
  background: #22c55e;
}
.legend-box.range {
  background: rgba(34, 197, 94, 0.18);
}
.legend-box.blocked {
  background: #fecaca;
}

/* Formular rechts */
.booking-form {
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  padding: 14px 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field label {
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
}

.field input {
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  font-size: 14px;
  outline: none;
  transition:
    border 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}

.field input:focus {
  border-color: var(--mazari-primary);
  background: #ffffff;
  box-shadow: 0 0 0 2px rgba(6, 69, 127, 0.22);
}

.field input[readonly] {
  color: #64748b;
}

/* Hinweis & Button */
.hint {
  font-size: 12px;
  color: #64748b;
}

.cta {
  margin-top: 4px;
  width: 100%;
  padding: 10px 14px;
  border-radius: 999px;
  border: none;
  background: var(--mazari-primary);
  color: #ffffff;
  font-weight: 800;
  font-size: 14px;
  cursor: pointer;
  transition:
    background 0.18s ease,
    transform 0.1s ease,
    box-shadow 0.18s ease;
}
.cta:hover:enabled {
  background: var(--mazari-primary-dark);
  box-shadow: 0 10px 20px rgba(6, 69, 127, 0.35);
  transform: translateY(-1px);
}
.cta:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 900px) {
  .booking-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .booking-card {
    padding: 18px 12px 16px;
  }

  .booking-form {
    padding: 12px 10px 14px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
