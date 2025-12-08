<script setup>
import NavBar from '@/components/NavBar.vue'
import { useRoute } from 'vue-router'
import { bookingService } from '@/api/bookingService'
import { useAuthStore } from '@/stores/AuthStore'
import { vehicleService } from '@/api/vehicleService'
import { computed, onMounted, ref, onBeforeUnmount } from 'vue'
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
    return `Fahrzeug #${b.fahrzeugId}`
  }

  const serie = v.serie ? ` ${v.serie}` : ''
  const marke = v.marke ?? ''
  const modell = v.modell ?? ''

  const base = `${marke} ${modell}${serie}`.trim()
  return base || `Fahrzeug #${b.fahrzeugId}`
}

const rentalDays = (b) => {
  if (!b.startDatum || !b.endDatum) return null

  const start = new Date(b.startDatum)
  const end = new Date(b.endDatum)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null

  // Differenz in Millisekunden
  const diffMs = end.getTime() - start.getTime()

  // Auf volle Tage runden; mindestens 1 Tag
  const days = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)))

  return days
}
// ===============================
// Buchungen sortieren + nach Monat gruppieren
// ===============================
const sortedBookings = computed(() => {
  return [...bookings.value].sort((a, b) => {
    const da = new Date(a.startDatum).getTime()
    const db = new Date(b.startDatum).getTime()
    return db - da // neu zu alt
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

// ===============================
// Admin-Storno (hattest du schon)
// ===============================
async function onAdminCancel(buchung) {
  const confirmed = window.confirm(
    `Möchtest du die Buchung ${buchung.buchungsNummer || '#' + buchung.id} wirklich freigeben (stornieren)?`,
  )
  if (!confirmed) return

  try {
    cancelLoadingId.value = buchung.id
    const updated = await bookingService.cancelBooking(buchung.id)

    bookings.value = bookings.value.map((b) => (b.id === updated.id ? updated : b))
  } catch (e) {
    console.error('[Buchungsübersicht] Fehler beim Stornieren (Admin):', e)
    window.alert(
      e?.response?.data?.message ||
        'Die Buchung konnte nicht storniert werden. Bitte versuche es später erneut.',
    )
  } finally {
    cancelLoadingId.value = null
  }
}

// ===============================
// Kunden-Storno (neu)
// ===============================
async function onCustomerCancel(buchung) {
  if (buchung.status === 'STORNIERT') {
    window.alert('Diese Buchung wurde bereits storniert.')
    return
  }

  const confirmed = window.confirm(
    `Möchtest du die Buchung ${buchung.buchungsNummer || '#' + buchung.id} wirklich stornieren?`,
  )
  if (!confirmed) return

  try {
    cancelLoadingId.value = buchung.id
    const updated = await bookingService.cancelMyBooking(buchung.id)

    // Aktualisierte Buchung in Liste einsetzen
    bookings.value = bookings.value.map((b) => (b.id === updated.id ? updated : b))

    window.alert(
      'Deine Buchung wurde storniert. Eine eventuelle Rückerstattung wird automatisch über Stripe abgewickelt.',
    )
  } catch (e) {
    console.error('[Buchungsübersicht] Fehler beim Stornieren (Kunde):', e)
    window.alert(
      e?.response?.data?.message ||
        'Die Buchung konnte nicht storniert werden. Bitte versuche es später erneut.',
    )
  } finally {
    cancelLoadingId.value = null
  }
}

const openInvoiceWindow = async (buchung) => {
  try {
    const fileName = buchung.buchungsNummer
      ? `Rechnung_${buchung.buchungsNummer}.pdf`
      : `Rechnung_${buchung.id}.pdf`

    await bookingService.downloadInvoice(buchung.id, fileName)
  } catch (e) {
    console.error('[Rechnung] Fehler beim Herunterladen:', e)
    window.alert('Die Rechnung konnte nicht heruntergeladen werden.')
  }
}

const openStornoInvoice = async (buchung) => {
  try {
    await bookingService.downloadStornoInvoice(buchung.id)
  } catch (e) {
    console.error('[Stornorechnung] Fehler beim Öffnen:', e)
    window.alert(
      e?.response?.data?.message ||
        'Die Stornorechnung konnte nicht geöffnet werden. Bitte versuche es später erneut.',
    )
  }
}

// ===============================
// Load
// ===============================
async function loadAll() {
  try {
    loading.value = true
    if (isAdminView.value) {
      const userId = userIdParam.value
      console.log('[Buchungsübersicht] Admin-View für User-ID:', userId)
      bookings.value = await bookingService.getBookingsByUserAdmin(userId)
    } else {
      console.log('[Buchungsübersicht] Kunden-View – Auth-Store:', auth)

      if (!auth.user && !auth.currentUser) {
        bookings.value = []
        error.value = 'Bitte melde dich an, um deine Buchungen zu sehen.'
        return
      }

      bookings.value = await bookingService.getMyBookings()
    }

    console.log('[Buchungsübersicht] Buchungen geladen:', bookings.value)

    await loadVehiclesForBookings(bookings.value)
    console.log('[Buchungsübersicht] VehiclesMap:', vehiclesMap.value)
  } catch (e) {
    console.error('[Buchungsübersicht] Fehler beim Laden:', e)
    error.value =
      e?.response?.data?.message || e?.message || 'Buchungen konnten nicht geladen werden.'
  } finally {
    loading.value = false
  }
}

// Event-Handler fürs Zurückkommen aus Stripe / Browser-Back
function handlePageShow() {
  // einfach immer neu laden – reicht in deinem Fall völlig
  loadAll()
}

onMounted(() => {
  loadAll()
  window.addEventListener('pageshow', handlePageShow)
})

onBeforeUnmount(() => {
  window.removeEventListener('pageshow', handlePageShow)
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

                  <!-- Neue Zeile: Mietdauer -->
                  <div class="section-line">
                    <span class="tag">Mietdauer</span>
                    <span class="value">
                      {{ rentalDays(b) }} Tag{{ rentalDays(b) === 1 ? '' : 'e' }}
                    </span>
                  </div>

                  <div class="section-line" v-if="b.gesamtPreis != null">
                    <span class="tag">Gesamtpreis</span>
                    <span class="value">{{ formatCurrency(b.gesamtPreis) }}</span>
                  </div>
                </div>

                <!-- Aktionen -->
                <!-- Aktionen -->
                <div class="booking-actions">
                  <!-- Kunde: Rechnung für BEZAHLT -->
                  <button
                    v-if="b.status === 'BEZAHLT' && !isAdminUser"
                    class="action-btn invoice"
                    type="button"
                    @click="openInvoiceWindow(b)"
                  >
                    📄 Rechnung herunterladen
                  </button>

                  <!-- Kunde: Stornorechnung für STORNIERT -->
                  <button
                    v-if="b.status === 'STORNIERT' && !isAdminUser"
                    class="action-btn invoice"
                    type="button"
                    @click="openStornoInvoice(b)"
                  >
                    📄 Stornorechnung öffnen
                  </button>

                  <!-- Admin: Buchung wieder freigeben (nur sinnvoll, wenn nicht storniert) -->
                  <button
                    v-if="isAdminUser && b.status !== 'STORNIERT'"
                    class="action-btn danger"
                    type="button"
                    :disabled="cancelLoadingId === b.id"
                    @click="onAdminCancel(b)"
                  >
                    {{
                      cancelLoadingId === b.id ? 'Gibt Buchung frei…' : 'Buchung wieder freigeben'
                    }}
                  </button>

                  <!-- Kunde: Stornieren nur, solange nicht storniert -->
                  <button
                    v-else-if="!isAdminUser && b.status !== 'STORNIERT'"
                    class="action-btn ghost"
                    type="button"
                    :disabled="cancelLoadingId === b.id"
                    @click="onCustomerCancel(b)"
                  >
                    {{ cancelLoadingId === b.id ? 'Storniere Buchung…' : 'Buchung stornieren' }}
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <router-link to="/meinprofil" class="btn-back-to-profile">
        ← Zurück zu meinem Profil
      </router-link>
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
  display: inline-flex;
  align-items: center;
  gap: 6px;

  border-radius: 999px;
  padding: 7px 14px;
  font-size: 12px;
  font-weight: 700;

  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #0f172a;

  cursor: pointer;
  transition:
    background 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.1s ease;
}

.action-btn:hover:enabled {
  background: #e2e8f0;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.15);
  transform: translateY(-1px);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

/* 💙 Primär – z.B. "Rechnung öffnen" */
.action-btn.invoice {
  background: #06457f;
  color: #ffffff;
  border-color: #06457f;
}

.action-btn.invoice:hover:enabled {
  background: #0460b0;
}

/* 🔴 Gefahr – Admin "Buchung freigeben / stornieren" */
.action-btn.danger {
  background: #fee2e2;
  border-color: #fecaca;
  color: #b91c1c;
}

.action-btn.danger:hover:enabled {
  background: #fecaca;
}

/* 🕊 Ghost – dezenter Kunden-Storno-Button */
.action-btn.ghost {
  background: transparent;
  border-color: transparent;
  color: #0f172a;
}

.action-btn.ghost:hover:enabled {
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

.btn-back-to-profile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
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
</style>
