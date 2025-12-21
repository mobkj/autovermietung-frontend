<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { bookingService } from '@/api/bookingService'
import { useAuthStore } from '@/stores/AuthStore'
import BookingPriceBox from '@/components/booking/BookingPriceBox.vue'
import { stripeService } from '@/api/stripeService'
import { useRoute } from 'vue-router'

const props = defineProps({
  vehicleId: { type: Number, required: false },
  vehicle: { type: Object, required: false },
})

const route = useRoute()
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
const startDate = ref(null)
const endDate = ref(null)

const pickupTime = ref('10:00')
const returnTime = ref('10:00')

const bookingLoading = ref(false)
const bookingError = ref('')
const bookingSuccess = ref('')

const createdBooking = ref(null)
const lastLoadedPrice = ref(null)
const showPriceModal = ref(false)

// Buchungen für dieses Fahrzeug -> belegte Tage
const bookedRanges = ref([])

// === Reservierungs-Timer (10 Minuten Hold vom Backend) ===
const reservationExpiresAt = ref(null) // Date | null
const reservationRemaining = ref('') // z.B. "09:58"
let reservationIntervalId = null

const reservationActive = computed(() => {
  if (!reservationExpiresAt.value) return false
  return reservationExpiresAt.value.getTime() > Date.now()
})

function parseBackendIso(iso) {
  if (!iso) return null

  // Wenn bereits Zeitzone vorhanden (Z oder +01:00), normal parsen
  const hasTz = /Z$|[+-]\d\d:\d\d$/.test(iso)
  const d = new Date(hasTz ? iso : `${iso}Z`) // <- wichtig: ohne TZ behandeln wir es als UTC

  return Number.isNaN(d.getTime()) ? null : d
}

// === Preis-Box Events ===
const onPriceLoaded = (preisDto) => {
  console.log('[Preis] Preis geladen:', preisDto)
  lastLoadedPrice.value = preisDto
}

function syncCreatedBookingFromBackend() {
  if (!createdBooking.value) return

  // gleiche Buchung im frisch geladenen Backend-Array suchen
  const updated = bookedRanges.value.find((b) => b.id === createdBooking.value.id)

  // 1) Wenn es die Buchung gar nicht mehr gibt ODER
  // 2) sie ist nicht mehr RESERVIERT (also z.B. BEZAHLT oder STORNIERT)
  if (!updated || updated.status !== 'RESERVIERT') {
    createdBooking.value = null
    showPriceModal.value = false

    clearReservationTimer()
    reservationExpiresAt.value = null
    reservationRemaining.value = ''
    bookingSuccess.value = ''
    bookingError.value = '' // ✅ HINZUFÜGEN

    return
  }

  // 3) Es ist weiterhin eine Reservierung → ggf. Timer aktualisieren
  createdBooking.value = updated
  if (updated.reserviertBis) {
    startReservationTimer(parseBackendIso(updated.reserviertBis)) // ✅ Date
  }
}

// Stripe-Checkout starten
const onPricePay = async ({ kmPaket, bringService, agbAccepted }) => {
  if (!createdBooking.value) return

  if (!reservationActive.value) {
    bookingError.value =
      'Deine Reservierung ist abgelaufen. Bitte wähle den Zeitraum erneut und starte die Buchung neu.'
    return
  }

  try {
    bookingError.value = ''

    const res = await stripeService.createCheckoutSession({
      buchungId: createdBooking.value.id,
      freieKmPaket: kmPaket,
      bringService,
      agbAccepted, // ✅ NEU
    })

    if (res.checkoutUrl) {
      localStorage.setItem('checkoutReturnPath', route.fullPath)
      window.location.href = res.checkoutUrl
    } else {
      bookingError.value = 'Konnte die Zahlung nicht starten. Bitte versuche es erneut.'
    }
  } catch (e) {
    console.error('[Stripe] Fehler beim Starten der Zahlung:', e)
    bookingError.value =
      'Es ist ein Fehler beim Starten der Zahlung aufgetreten. Bitte versuche es erneut.'
  }
}

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
// === BLOCKIERTE TAGE (aus Buchungen) ===
// === BLOCKIERTE TAGE (aus Buchungen) mit Status (RESERVIERT / BEZAHLT) ===
// === BLOCKIERTE TAGE (aus Buchungen) mit Status (RESERVIERT / BEZAHLT) ===
const blockedDateStatusMap = computed(() => {
  const map = new Map()
  const now = new Date()

  for (const b of bookedRanges.value) {
    if (!b.startDatum || !b.endDatum) continue

    let status = b.status
    if (status !== 'RESERVIERT' && status !== 'BEZAHLT') continue

    // 👉 Admin-Block (userId null) soll direkt "hard" blocken = wie BEZAHLT (rot)
    if (status === 'RESERVIERT' && (b.userId == null || b.userId === undefined)) {
      status = 'BEZAHLT'
    }

    // Abgelaufene Reservierungen ignorieren
    if (
      status === 'RESERVIERT' &&
      b.reserviertBis &&
      new Date(b.reserviertBis).getTime() < now.getTime()
    ) {
      continue
    }

    const start = new Date(b.startDatum)
    const end = new Date(b.endDatum)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) continue

    for (let d = new Date(start.getTime()); d <= end; d.setDate(d.getDate() + 1)) {
      const key = dateKey(d)
      const existing = map.get(key)

      // Wenn schon BEZAHLT da ist, bleibt es BEZAHLT
      if (existing === 'BEZAHLT') continue

      if (status === 'BEZAHLT') {
        map.set(key, 'BEZAHLT')
      } else if (status === 'RESERVIERT' && !existing) {
        map.set(key, 'RESERVIERT')
      }
    }
  }

  return map
})

function getBlockedStatus(d) {
  if (!d) return null
  return blockedDateStatusMap.value.get(dateKey(d)) || null
}

function isBlockedDate(d) {
  const status = getBlockedStatus(d)
  return status === 'RESERVIERT' || status === 'BEZAHLT'
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

  let weekday = start.getDay()
  if (weekday === 0) weekday = 7

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

// === Reservierungs-Timer Helper ===
function clearReservationTimer() {
  if (reservationIntervalId) {
    clearInterval(reservationIntervalId)
    reservationIntervalId = null
  }
}

function updateReservationCountdown() {
  if (!reservationExpiresAt.value) {
    reservationRemaining.value = ''
    return
  }
  const diffMs = reservationExpiresAt.value.getTime() - Date.now()
  if (diffMs <= 0) {
    reservationRemaining.value = '00:00'
    clearReservationTimer()
    reservationExpiresAt.value = null
    bookingError.value =
      'Deine Reservierung ist abgelaufen. Bitte wähle den Zeitraum erneut und starte die Buchung neu.'

    showPriceModal.value = false
    createdBooking.value = null
    bookingSuccess.value = ''

    // Kalender aktualisieren, damit orangene Tage verschwinden
    loadBlockedDates()

    return
  }

  const totalSec = Math.floor(diffMs / 1000)
  const mins = Math.floor(totalSec / 60)
  const secs = totalSec % 60
  reservationRemaining.value = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function startReservationTimer(expiryDate) {
  clearReservationTimer()

  if (!expiryDate) {
    reservationExpiresAt.value = null
    reservationRemaining.value = ''
    return false
  }

  if (expiryDate.getTime() <= Date.now()) {
    reservationExpiresAt.value = null
    reservationRemaining.value = ''
    return false
  }

  reservationExpiresAt.value = expiryDate
  updateReservationCountdown()
  reservationIntervalId = setInterval(updateReservationCountdown, 1000)
  return true
}

// === BUCHUNGEN FÜR KALENDER LADEN ===
async function loadBlockedDates() {
  const vehId = props.vehicleId ?? props.vehicle?.id
  if (!vehId) return

  try {
    const list = await bookingService.getBookingsByVehicle(vehId)
    console.log('[Booking] Belegte Buchungen für Fahrzeug', vehId, list)

    // 👇 Debug-Ausgabe
    console.table(
      list.map((b) => ({
        id: b.id,
        status: b.status,
        userId: b.userId,
        reserviertBis: b.reserviertBis,
      })),
    )

    bookedRanges.value = Array.isArray(list) ? list : []
    syncCreatedBookingFromBackend()
  } catch (e) {
    console.error('[Booking] Fehler beim Laden der belegten Tage:', e)
  }
}

function restoreActiveReservation() {
  const user = currentUser.value
  if (!user) return

  // wenn wir schon eine aktive createdBooking im State haben → nichts tun
  if (createdBooking.value) return

  const now = new Date()

  const active = bookedRanges.value.find((b) => {
    if (!b) return false
    if (b.status !== 'RESERVIERT') return false
    if (b.userId !== user.id) return false
    if (!b.reserviertBis) return false

    const expiry = parseBackendIso(b.reserviertBis)
    if (!expiry) return false
    return expiry.getTime() > now.getTime()
  })

  if (!active) return

  createdBooking.value = active
  showPriceModal.value = true
  bookingError.value = ''
  bookingSuccess.value =
    'Du hast noch eine laufende Reservierung. Unten kannst du den Preis einsehen und die Zahlung abschließen, solange der Countdown läuft.'

  startReservationTimer(parseBackendIso(active.reserviertBis)) // ✅ Date
}

// === BUCHUNG ABSCHICKEN ===
async function submitBooking() {
  if (!startDate.value || !endDate.value) return

  bookingError.value = ''
  bookingSuccess.value = ''
  createdBooking.value = null
  lastLoadedPrice.value = null
  clearReservationTimer()
  reservationExpiresAt.value = null
  reservationRemaining.value = ''

  const user = currentUser.value

  if (!user) {
    bookingError.value = 'Bitte melde dich an, um eine Buchung vorzunehmen.'
    return
  }

  try {
    bookingLoading.value = true

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

    // Gemeinsames Payload
    const basePayload = {
      fahrzeugId: vehId,
      kundeName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email,
      kundeEmail: user.email ?? '',
      kundePhone: user.phone ?? '',
      startDatum: toIsoLocal(s),
      endDatum: toIsoLocal(e),
      bringService: false,
    }

    // ✅ ADMIN-FLOW: interner Block, kein Stripe, keine PriceBox
    // ✅ ADMIN-FLOW: interner Block, kein Stripe, keine PriceBox
    if (isAdmin.value) {
      const adminPayload = {
        ...basePayload,
        userId: user.id ?? null,
      }

      await bookingService.adminBlockBooking(adminPayload)

      // ❗ WICHTIG: Admin-Fall soll NICHT wie eine "aktive Reservierung" behandelt werden
      createdBooking.value = null
      showPriceModal.value = false

      bookingSuccess.value =
        'Du hast dieses Fahrzeug für diesen Zeitraum intern blockiert. Kunden können diesen Zeitraum nicht mehr buchen.'

      await loadBlockedDates()
      startDate.value = null
      endDate.value = null
      return
    }

    // ✅ KUNDEN-FLOW: weiche Reservierung + PriceBox + Stripe
    const payload = {
      ...basePayload,
      userId: user.id ?? null,
    }

    const response = await bookingService.createBooking(payload)
    createdBooking.value = response

    // ✅ Erfolgstext erst mal setzen
    bookingError.value = ''
    bookingSuccess.value =
      'Deine Reservierung wurde erstellt und ist für 10 Minuten gültig. Unten kannst du den Preis einsehen und die Zahlung abschließen. Die Buchung gilt erst als bestätigt, wenn die Zahlung erfolgt ist.'
    showPriceModal.value = true

    // ✅ Expiry robust parsen und nur dann Timer starten
    const expiry = parseBackendIso(response.reserviertBis)

    const timerOk = startReservationTimer(expiry)
    if (!timerOk) {
      // Wenn Backend-Zeit schon abgelaufen wirkt: keine Success-Message zeigen
      bookingSuccess.value = ''
      bookingError.value =
        'Deine Reservierung ist abgelaufen. Bitte wähle den Zeitraum erneut und starte die Buchung neu.'
      showPriceModal.value = false
      createdBooking.value = null
    }

    await loadBlockedDates()

    startDate.value = null
    endDate.value = null
  } catch (e) {
    console.error('[Booking] Fehler beim Buchen:', e)
    bookingError.value =
      'Der gewählte Buchungszeitraum enthält belegte Tage oder ist ungültig. Bitte wähle einen anderen Zeitraum.'
  } finally {
    bookingLoading.value = false
  }
}

const onPriceCancel = async () => {
  if (!createdBooking.value) {
    showPriceModal.value = false
    return
  }

  try {
    // 👉 Reservierung im Backend komplett löschen
    await bookingService.cancelReservation(createdBooking.value.id)
  } catch (e) {
    console.error('[Booking] Fehler beim Abbrechen der Reservierung:', e)
  } finally {
    // Frontend-State aufräumen
    createdBooking.value = null
    showPriceModal.value = false

    clearReservationTimer()
    reservationExpiresAt.value = null
    reservationRemaining.value = ''
    bookingSuccess.value = ''

    await loadBlockedDates()
  }
}

onMounted(async () => {
  await loadBlockedDates()
  restoreActiveReservation()
})

onUnmounted(() => {
  clearReservationTimer()
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
              'is-blocked-reserviert': day.date && getBlockedStatus(day.date) === 'RESERVIERT',
              'is-blocked-bezahlt': day.date && getBlockedStatus(day.date) === 'BEZAHLT',
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
          <span class="legend-box blocked reserved"></span> Reserviert ·
          <span class="legend-box blocked paid"></span> Bezahlt
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
          Nach dem Absenden wird der Zeitraum für dich reserviert. Du hast anschließend
          <strong>10 Minuten</strong> Zeit, die Zahlung abzuschließen.
        </p>

        <p v-if="bookingError" class="msg error">{{ bookingError }}</p>
        <p v-if="bookingSuccess" class="msg success">{{ bookingSuccess }}</p>

        <p v-if="createdBooking && reservationActive" class="msg info">
          Deine Reservierung ist noch <strong>{{ reservationRemaining }}</strong> gültig.
        </p>

        <button
          class="cta"
          type="button"
          :disabled="!startDate || !endDate || bookingLoading"
          @click="submitBooking"
        >
          {{ bookingLoading ? 'Sende Buchung…' : 'Buchung jetzt reservieren' }}
        </button>

        <p v-if="createdBooking" class="msg info">
          Buchungs-Nr.: <strong>{{ createdBooking.buchungsNummer }}</strong>
        </p>
      </div>
    </div>

    <!-- 🔥 Preis-Box direkt UNTER der Karte, kein Modal mehr -->
    <BookingPriceBox
      v-if="createdBooking && showPriceModal && !isAdmin"
      :visible="showPriceModal"
      :buchung-id="createdBooking.id"
      :initial-km-paket="150"
      :can-pay="reservationActive"
      @close="onPriceCancel"
      @price-loaded="onPriceLoaded"
      @pay="onPricePay"
    />
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

.msg.info {
  color: #0f172a;
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

/* Reservierte (unbezahlte) Buchung = orange */
.calendar-cell.is-blocked-reserviert {
  background: #fed7aa; /* orange */
  color: #9a3412;
  cursor: not-allowed;
  opacity: 0.9;
}

/* Bezahlte Buchung oder Admin-Block = rot */
.calendar-cell.is-blocked-bezahlt {
  background: #fecaca; /* rot/rosa */
  color: #b91c1c;
  cursor: not-allowed;
  opacity: 0.95;
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
/* Geblockte Tage – verschieden je nach Status */
.calendar-cell.is-blocked-reserviert {
  background: #fed7aa; /* orange-ish */
  color: #9a3412;
  opacity: 0.9;
  cursor: not-allowed;
}

.calendar-cell.is-blocked-bezahlt {
  background: #fecaca; /* rot-ish */
  color: #b91c1c;
  opacity: 0.95;
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
.legend-box.blocked.paid {
  background: #fecaca; /* wie .is-blocked-bezahlt */
}

.legend-box.blocked.reserved {
  background: #fed7aa;
}

.legend-box.blocked.paid {
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
