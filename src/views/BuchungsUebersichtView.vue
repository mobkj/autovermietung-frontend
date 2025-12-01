<script setup>
import NavBar from '@/components/NavBar.vue'
import { useRoute } from 'vue-router'
import { bookingService } from '@/api/bookingService'
import { useAuthStore } from '@/stores/AuthStore'
import { vehicleService } from '@/api/vehicleService'
import { computed, onMounted, ref } from 'vue'
import VehicleDetailsCard from '@/components/vehicles/VehicleDetailsCard.vue'

const route = useRoute()
const auth = useAuthStore()

const userIdParam = computed(() => (route.params.userId ? Number(route.params.userId) : null))
const isAdminView = computed(() => !!userIdParam.value)
const isAdminUser = computed(() => auth.user?.role === 'ADMIN' || auth.user?.role === 'ROLE_ADMIN')
const bookings = ref([])
const loading = ref(true)
const error = ref('')
const cancelLoadingId = ref(null)

// Map: fahrzeugId -> Fahrzeug-Objekt
const vehiclesMap = ref({})

// ===============================
// Format Helpers
// ===============================
const statusLabel = (status) => {
  if (!status) return '-'
  switch (status) {
    case 'RESERVIERT':
      return 'Reserviert'
    case 'BEZAHLT':
      return 'Bezahlt'
    case 'STORNIERT':
      return 'Storniert'
    default:
      return status
  }
}

const formatDateShort = (val) => {
  if (!val) return '-'
  const d = new Date(val)
  if (Number.isNaN(d.getTime())) return val
  return d.toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const formatTimeShort = (val) => {
  if (!val) return '-'
  const d = new Date(val)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatCurrency = (val) => {
  if (val == null) return ''
  const num = Number(val)
  if (Number.isNaN(num)) return String(val)
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(num)
}

// ===============================
// Fahrzeuge zu Buchungen laden
// ===============================
async function loadVehiclesForBookings(list) {
  const ids = [...new Set(list.map((b) => b.fahrzeugId).filter(Boolean))]

  if (!ids.length) {
    vehiclesMap.value = {}
    return
  }

  const map = {}

  await Promise.all(
    ids.map(async (id) => {
      try {
        const v = await vehicleService.getVehicleById(id)
        map[id] = v
      } catch (e) {
        console.error('[Buchungsübersicht] Fahrzeug konnte nicht geladen werden:', id, e)
      }
    }),
  )

  vehiclesMap.value = map
}

const getVehicle = (fahrzeugId) => vehiclesMap.value[fahrzeugId] || null

const vehicleTitle = (b) => {
  const v = getVehicle(b.fahrzeugId)
  if (!v) {
    // Fallback, falls Fahrzeug nicht geladen werden konnte
    return `Fahrzeug #${b.fahrzeugId}`
  }

  const serie = v.serie ? ` ${v.serie}` : ''
  const marke = v.marke ?? ''
  const modell = v.modell ?? ''

  const base = `${marke} ${modell}${serie}`.trim()
  return base || `Fahrzeug #${b.fahrzeugId}`
}

// ===============================
// Buchungen sortieren + nach Monat gruppieren
// ===============================
const sortedBookings = computed(() => {
  return [...bookings.value].sort((a, b) => {
    const da = new Date(a.startDatum).getTime()
    const db = new Date(b.startDatum).getTime()
    // neu zu alt
    return db - da
  })
})

const groupedBookings = computed(() => {
  const map = new Map()

  for (const b of sortedBookings.value) {
    const d = new Date(b.startDatum)
    if (Number.isNaN(d.getTime())) continue
    const key = `${d.getFullYear()}-${d.getMonth()}`
    if (!map.has(key)) {
      const label = d.toLocaleDateString('de-DE', {
        month: 'long',
        year: 'numeric',
      })
      map.set(key, { key, label, items: [] })
    }
    map.get(key).items.push(b)
  }

  return Array.from(map.values())
})

async function onAdminCancel(buchung) {
  const confirmed = window.confirm(
    `Möchtest du die Buchung ${buchung.buchungsNummer || '#' + buchung.id} wirklich freigeben (stornieren)?`,
  )
  if (!confirmed) return

  try {
    cancelLoadingId.value = buchung.id
    const updated = await bookingService.cancelBooking(buchung.id)

    // Booking in der Liste ersetzen
    bookings.value = bookings.value.map((b) => (b.id === updated.id ? updated : b))
  } catch (e) {
    console.error('[Buchungsübersicht] Fehler beim Stornieren:', e)
    window.alert(
      e?.response?.data?.message ||
        'Die Buchung konnte nicht storniert werden. Bitte versuche es später erneut.',
    )
  } finally {
    cancelLoadingId.value = null
  }
}

// Für Kunden vorerst nur Info – noch ohne echte Stornologik
function onCustomerCancelInfo() {
  window.alert('Die Stornierungsfunktion für Kunden wird in Kürze freigeschaltet.')
}

// ===============================
// Load
// ===============================
onMounted(async () => {
  try {
    loading.value = true
    if (isAdminView.value) {
      const userId = userIdParam.value
      console.log('[Buchungsübersicht] Admin-View für User-ID HALLO:', userId)
      bookings.value = await bookingService.getBookingsByUserAdmin(userId)
    } else {
      console.log('[Buchungsübersicht] Kunden-View – Auth-Store:', auth)

      // optionaler Check – Route sollte sowieso requiresAuth haben
      if (!auth.user && !auth.currentUser) {
        bookings.value = []
        error.value = 'Bitte melde dich an, um deine Buchungen zu sehen.'
        return
      }

      // 🔥 kein userId mehr übergeben, Backend nimmt User aus JWT
      bookings.value = await bookingService.getMyBookings()
    }

    console.log('[Buchungsübersicht] Buchungen geladen:', bookings.value)

    // Jetzt Fahrzeuge zu den Buchungen laden
    await loadVehiclesForBookings(bookings.value)
    console.log('[Buchungsübersicht] VehiclesMap:', vehiclesMap.value)
  } catch (e) {
    console.error('[Buchungsübersicht] Fehler beim Laden:', e)
    error.value =
      e?.response?.data?.message || e?.message || 'Buchungen konnten nicht geladen werden.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <nav-bar />

    <main class="bookings-wrapper">
      <!-- Header -->
      <header class="head">
        <h2 class="title">
          {{ isAdminView ? 'Buchungen des Kunden' : 'Meine Buchungen' }}
        </h2>
        <p class="sub">
          Übersicht deiner gespeicherten Buchungen
          <span v-if="isAdminView">(Admin-Ansicht)</span>.
        </p>
      </header>

      <!-- States -->
      <div v-if="loading" class="state">Lade Buchungen…</div>
      <div v-else-if="error" class="state state-error">{{ error }}</div>

      <div v-else-if="groupedBookings.length === 0" class="state">
        Noch keine Buchungen vorhanden.
      </div>

      <!-- Grouped Cards -->
      <section v-else class="groups">
        <div v-for="group in groupedBookings" :key="group.key" class="month-group">
          <div class="month-header">
            <div class="month-line"></div>
            <span class="month-label">{{ group.label }}</span>
            <div class="month-line"></div>
          </div>

          <div class="cards-grid">
            <article v-for="b in group.items" :key="b.id" class="booking-card">
              <!-- Fahrzeugkarte oben -->
              <div class="booking-vehicle-card" v-if="getVehicle(b.fahrzeugId)">
                <VehicleDetailsCard :vehicle="getVehicle(b.fahrzeugId)" :show-actions="false" />
              </div>

              <!-- Header (Buchungsinfo) -->
              <header class="booking-header">
                <div>
                  <div class="booking-title">
                    Ihre Buchung für
                    <span class="vehicle-label">
                      {{ vehicleTitle(b) }}
                    </span>
                  </div>
                  <div class="booking-id">Buchungsnummer #{{ b.buchungsNummer }}</div>
                </div>

                <span
                  class="pill pill-status"
                  :class="{
                    'pill-reserviert': b.status === 'RESERVIERT',
                    'pill-bezahlt': b.status === 'BEZAHLT',
                    'pill-storniert': b.status === 'STORNIERT',
                  }"
                >
                  {{ 'Status: ' + statusLabel(b.status) }}
                </span>
              </header>

              <!-- Body: Zeitraum + Details -->
              <div class="booking-body">
                <div class="booking-section">
                  <div class="section-label">Buchungszeitraum</div>

                  <div class="section-line">
                    <span class="tag">Abholung</span>
                    <span class="value">
                      {{ formatDateShort(b.startDatum) }}
                      ·
                      {{ formatTimeShort(b.startDatum) }} Uhr
                    </span>
                  </div>

                  <div class="section-line">
                    <span class="tag">Rückgabe</span>
                    <span class="value">
                      {{ formatDateShort(b.endDatum) }}
                      ·
                      {{ formatTimeShort(b.endDatum) }} Uhr
                    </span>
                  </div>
                </div>

                <div class="booking-section">
                  <div class="section-label">Details</div>

                  <div class="section-line">
                    <span class="tag">Bringservice</span>
                    <span
                      class="value"
                      :class="{
                        'text-positive': b.bringService,
                        'text-muted': !b.bringService,
                      }"
                    >
                      {{ b.bringService ? 'Fahrzeug wird geliefert' : 'Nicht angefordert' }}
                    </span>
                  </div>

                  <div class="section-line" v-if="b.gesamtPreis != null">
                    <span class="tag">Gesamtpreis (netto)</span>
                    <span class="value">{{ formatCurrency(b.gesamtPreis) }}</span>
                  </div>
                </div>

                <!-- Aktionen: immer unter den Sektionen, über gesamte Breite -->
                <div v-if="b.status !== 'STORNIERT'" class="booking-actions">
                  <!-- Admin-Ansicht: Buchung freigeben -->
                  <button
                    v-if="isAdminUser"
                    class="action-btn danger"
                    type="button"
                    :disabled="cancelLoadingId === b.id"
                    @click="onAdminCancel(b)"
                  >
                    {{
                      cancelLoadingId === b.id ? 'Gibt Buchung frei…' : 'Buchung wieder freigeben'
                    }}
                  </button>

                  <!-- Kunden-Ansicht: Button vorbereitet, aktuell nur Hinweis -->
                  <button
                    v-else
                    class="action-btn ghost"
                    type="button"
                    @click="onCustomerCancelInfo"
                  >
                    Buchung stornieren
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.bookings-wrapper {
  max-width: 1200px; /* vorher 1100px */
  margin: 0 auto;
  padding: clamp(18px, 4vw, 40px) 16px 60px;
}

/* HEAD */
.head {
  margin-bottom: 18px;
}

.title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: var(--mazari-text-dark);
}

.sub {
  margin: 4px 0 0;
  font-size: 14px;
  color: #64748b;
}

/* STATES */
.state {
  padding: 16px;
  border-radius: 12px;
  background: #f1f5f9;
  color: #475569;
  font-weight: 600;
  text-align: center;
}

.state-error {
  background: #fef2f2;
  color: #b91c1c;
}

/* MONTH GROUP */
.groups {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.month-group {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.month-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.month-line {
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}

.month-label {
  font-size: 14px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #64748b;
  white-space: nowrap;
}

/* CARDS GRID */
.cards-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr); /* eine Karte pro Zeile */
  gap: 20px; /* etwas mehr Luft zwischen den Buchungen */
}

/* BOOKING CARD */
.booking-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: var(--mazari-shadow-subtle);
  padding: 14px 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Fahrzeugkarte oben */
.booking-vehicle-card {
  margin-bottom: 6px;
}

.vehicle-card-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

/* HEADER */
.booking-header {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: flex-start;
}

.booking-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--mazari-text-dark);
}

.vehicle-label {
  font-weight: 900;
  color: var(--mazari-primary-dark);
}

.booking-id {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}

/* PILL STATUS */
.pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.pill-status {
  background: #e2e8f0;
  color: #334155;
}

.pill-reserviert {
  background: #e0f2fe;
  color: #0369a1;
}

.pill-bezahlt {
  background: #dcfce7;
  color: #15803d;
}

.pill-storniert {
  background: #fee2e2;
  color: #b91c1c;
}

/* BODY */
.booking-body {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: 12px;
}

.booking-section {
  border-radius: 12px;
  padding: 8px 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.section-label {
  font-size: 12px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.section-line {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 13px;
  margin-top: 4px;
}

.booking-actions {
  grid-column: 1 / -1; /* über beide Spalten */
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

.action-btn {
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  cursor: pointer;
  transition:
    background 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.1s ease;
}

.action-btn:hover:enabled {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.15);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

/* Roter Admin-Button */
.action-btn.danger {
  background: #fee2e2;
  border-color: #fecaca;
  color: #b91c1c;
}

.action-btn.danger:hover:enabled {
  background: #fecaca;
}

/* „Ghost“-Button für Kunden */
.action-btn.ghost {
  background: transparent;
  border-color: transparent;
  color: #0f172a;
}

.action-btn.ghost:hover {
  background: #e2e8f0;
}

.tag {
  font-weight: 700;
  color: #4b5563;
}

.value {
  font-weight: 500;
  color: #0f172a;
  text-align: right;
}

.text-positive {
  color: #15803d;
}

.text-muted {
  color: #9ca3af;
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }

  .booking-body {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .bookings-wrapper {
    padding-inline: 10px;
  }

  .booking-card {
    padding: 12px 10px;
  }

  .section-line {
    flex-direction: column;
    align-items: flex-start;
  }

  .value {
    text-align: left;
  }
}
</style>
