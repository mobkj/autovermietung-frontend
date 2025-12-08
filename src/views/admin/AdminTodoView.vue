<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'
import { bookingService } from '@/api/bookingService'
import NavBar from '@/components/NavBar.vue'

const auth = useAuthStore()
const router = useRouter()

// Simple Guard – falls jemand die URL direkt eintippt
if (!auth.user || auth.user.role !== 'ADMIN') {
  router.replace('/')
}

const todos = ref([])
const loading = ref(false)
const error = ref(null)
const range = ref('week') // 'today' | 'week' | 'month'

const rangeLabel = computed(() => {
  if (range.value === 'today') return 'Heute'
  if (range.value === 'month') return 'Diesen Monat'
  return 'Diese Woche'
})

async function loadTodos() {
  loading.value = true
  error.value = null
  try {
    todos.value = await bookingService.getAdminTodos(range.value)
  } catch (err) {
    console.error(err)
    error.value = 'Aufgaben konnten nicht geladen werden.'
  } finally {
    loading.value = false
  }
}

function changeRange(newRange) {
  if (range.value === newRange) return
  range.value = newRange
  loadTodos()
}

function formatDateTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDays(tageBis) {
  if (tageBis === null || tageBis === undefined) return ''
  if (tageBis < 0) return 'Termin liegt in der Vergangenheit'
  if (tageBis === 0) return 'Heute'
  if (tageBis === 1) return 'In 1 Tag'
  return `In ${tageBis} Tagen`
}

onMounted(loadTodos)
</script>

<template>
  <main class="admin-todo-page">
    <nav-bar />
    <section class="admin-todo-header">
      <div>
        <h1 class="admin-todo-title">Anstehende Aufgaben</h1>
        <p class="admin-todo-sub">
          Übersicht über alle bezahlten Buchungen – sortiert nach Abholung und Bringservice.
        </p>
      </div>

      <div class="admin-todo-range-switch">
        <button
          class="range-chip"
          :class="{ active: range === 'today' }"
          @click="changeRange('today')"
        >
          Heute
        </button>
        <button
          class="range-chip"
          :class="{ active: range === 'week' }"
          @click="changeRange('week')"
        >
          Diese Woche
        </button>
        <button
          class="range-chip"
          :class="{ active: range === 'month' }"
          @click="changeRange('month')"
        >
          Dieser Monat
        </button>
      </div>
    </section>

    <section class="admin-todo-content">
      <!-- Loading -->
      <div v-if="loading" class="admin-todo-info">Lade Aufgaben...</div>

      <!-- Fehler -->
      <div v-else-if="error" class="admin-todo-info admin-todo-error">
        {{ error }}
      </div>

      <!-- Keine Aufgaben -->
      <div v-else-if="!todos.length" class="admin-todo-info">
        Keine anstehenden Aufgaben für {{ rangeLabel }}.
      </div>

      <!-- Liste -->
      <div v-else class="todo-list">
        <article v-for="item in todos" :key="item.buchungId" class="todo-card">
          <header class="todo-card-header">
            <div class="todo-card-main">
              <h2 class="todo-card-title">
                {{ item.fahrzeugName || 'Fahrzeug' }}
              </h2>
              <p class="todo-card-sub">
                Buchungsnummer:
                <strong>{{ item.buchungsNummer }}</strong>
              </p>
            </div>

            <div class="todo-row">
              <span class="todo-label">
                <span v-if="item.bringService">Zu liefern zu</span>
                <span v-else>Abholort</span>
              </span>
              <span class="todo-value">
                {{ item.ort }}
              </span>
            </div>
          </header>

          <div class="todo-card-body">
            <div class="todo-row">
              <span class="todo-label">Kunde</span>
              <span class="todo-value">
                {{ item.kundeName || 'Unbekannt' }}
              </span>
            </div>

            <div class="todo-row">
              <span class="todo-label">Termin</span>
              <span class="todo-value">
                {{ formatDateTime(item.startDatum) }}
              </span>
            </div>

            <div class="todo-row">
              <span class="todo-label">Ort</span>
              <span class="todo-value">
                {{ item.ort }}
              </span>
            </div>

            <div class="todo-row">
              <span class="todo-label">In</span>
              <span class="todo-value">
                {{ formatDays(item.tageBis) }}
              </span>
            </div>
          </div>

          <footer class="todo-card-footer">
            <p class="todo-checklist-title">ToDo bei Übergabe:</p>
            <ul class="todo-checklist">
              <li>Führerschein prüfen</li>
              <li>Mietvertrag vorbereiten / unterschreiben lassen</li>
              <li>Kaution entgegennehmen / dokumentieren</li>
              <li>Fahrzeugzustand prüfen und Schlüssel übergeben</li>
            </ul>

            <div class="todo-contact">
              <p class="todo-contact-title">Kundenkontakt</p>

              <p v-if="item.kundePhone" class="todo-contact-line">
                Telefon:
                <a :href="`tel:${item.kundePhone}`">
                  {{ item.kundePhone }}
                </a>
              </p>

              <p v-if="item.kundeEmail" class="todo-contact-line">
                E-Mail:
                <a :href="`mailto:${item.kundeEmail}`">
                  {{ item.kundeEmail }}
                </a>
              </p>

              <div class="service-label">
                <span
                  class="service-pill"
                  :class="item.bringService ? 'service-pill-bring' : 'service-pill-pickup'"
                >
                  <span v-if="item.bringService">Bringservice aktiviert</span>
                  <span v-else>Kein Bringservice (Abholung)</span>
                </span>
              </div>
            </div>
          </footer>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.admin-todo-page {
  max-width: 1040px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 3rem;
}

.admin-todo-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1.5rem;
  align-items: center;
  margin-bottom: 1.5rem;
}

.admin-todo-title {
  font-size: 1.7rem;
  font-weight: 700;
  color: var(--mazari-text-dark);
  margin: 0 0 0.25rem;
}

.admin-todo-sub {
  margin: 0;
  font-size: 0.95rem;
  color: rgba(15, 23, 42, 0.7);
}

.admin-todo-range-switch {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.35rem;
  border-radius: 999px;
  box-shadow: var(--mazari-shadow-subtle);
}

.range-chip {
  border: none;
  outline: none;
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  font-size: 0.85rem;
  background: transparent;
  cursor: pointer;
  transition:
    background 0.15s ease,
    transform 0.05s ease;
  color: rgba(15, 23, 42, 0.7);
}

.range-chip.active {
  background: var(--mazari-primary);
  color: #ffffff;
}

.range-chip:not(.active):hover {
  background: rgba(15, 23, 42, 0.06);
}

.admin-todo-content {
  margin-top: 1rem;
}

.admin-todo-info {
  padding: 1.25rem 1rem;
  border-radius: var(--mazari-radius-lg);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: var(--mazari-shadow-subtle);
  font-size: 0.95rem;
  color: rgba(15, 23, 42, 0.8);
}

.admin-todo-error {
  border-left: 4px solid #dc2626;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.todo-card {
  background: #ffffff;
  border-radius: var(--mazari-radius-lg);
  box-shadow: var(--mazari-shadow-soft);
  padding: 1.1rem 1.2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.todo-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.todo-card-title {
  margin: 0 0 0.1rem;
  font-size: 1.1rem;
  color: var(--mazari-text-dark);
}

.todo-card-sub {
  margin: 0;
  font-size: 0.82rem;
  color: rgba(15, 23, 42, 0.7);
}

.todo-card-badge {
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  background: rgba(15, 23, 42, 0.06);
  color: rgba(15, 23, 42, 0.8);
}

/* Bringservice: rot/orange */
.todo-card-badge.bring {
  background: rgba(248, 113, 113, 0.18); /* hellrot */
  color: #b91c1c; /* dunkelrot */
}

/* Abholung: grün */
.todo-card-badge.pickup {
  background: rgba(34, 197, 94, 0.16); /* hellgrün */
  color: #166534; /* dunkelgrün */
}

/* Kontaktbereich */
.todo-contact {
  margin-top: 0.6rem;
  padding-top: 0.5rem;
  border-top: 1px dashed rgba(15, 23, 42, 0.12);
}

.todo-contact-title {
  margin: 0 0 0.25rem;
  font-size: 0.86rem;
  font-weight: 600;
  color: rgba(15, 23, 42, 0.85);
}

.todo-contact-line {
  margin: 0.05rem 0;
  font-size: 0.83rem;
  color: rgba(15, 23, 42, 0.85);
}

.todo-contact-line a {
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
}

/* unten die Markierung für Bringservice / kein Bringservice */
.service-label {
  margin-top: 0.5rem;
}

.service-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
}

/* orange/rot für Bringservice */
.service-pill-bring {
  background: rgba(248, 113, 113, 0.18);
  color: #b91c1c;
}

/* grün für Abholung */
.service-pill-pickup {
  background: rgba(34, 197, 94, 0.16);
  color: #166534;
}

.todo-card-body {
  border-radius: 14px;
  background: var(--mazari-bg-light);
  padding: 0.7rem 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.todo-row {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.88rem;
}

.todo-label {
  font-weight: 600;
  color: rgba(15, 23, 42, 0.8);
}

.todo-value {
  text-align: right;
  color: rgba(15, 23, 42, 0.9);
}

.todo-card-footer {
  padding-top: 0.25rem;
}

.todo-checklist-title {
  margin: 0 0 0.25rem;
  font-size: 0.86rem;
  font-weight: 600;
  color: rgba(15, 23, 42, 0.85);
}

.todo-checklist {
  margin: 0;
  padding-left: 1.1rem;
  font-size: 0.83rem;
  color: rgba(15, 23, 42, 0.8);
}

.todo-checklist li + li {
  margin-top: 0.15rem;
}

@media (max-width: 640px) {
  .admin-todo-page {
    padding-inline: 1rem;
  }

  .admin-todo-header {
    align-items: flex-start;
  }

  .todo-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .todo-value {
    text-align: left;
  }
}
</style>
