<script setup>
import { adminService } from '@/api/adminService'
import { onMounted, ref, computed } from 'vue'

const users = ref([])
const search = ref('')
const loading = ref(true)

onMounted(async () => {
  try {
    users.value = await adminService.getAllUsers()
  } finally {
    loading.value = false
  }
})

const filteredUsers = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return users.value

  return users.value.filter((u) => {
    const fullName = `${u.firstName ?? ''} ${u.lastName ?? ''}`.toLowerCase()
    const birthday = String(u.birthday ?? '').toLowerCase()
    const license = String(u.driverLicenseNumber ?? '').toLowerCase()

    return (
      String(u.id).toLowerCase().includes(q) ||
      fullName.includes(q) ||
      (u.email ?? '').toLowerCase().includes(q) ||
      (u.role ?? '').toLowerCase().includes(q) ||
      birthday.includes(q) ||
      license.includes(q)
    )
  })
})

const clearSearch = () => (search.value = '')

const formatBirthday = (val) => {
  if (!val) return '-'
  const d = new Date(val)
  if (Number.isNaN(d.getTime())) return val
  return d.toLocaleDateString('de-DE')
}
</script>

<template>
  <div class="admin-wrapper">
    <div class="admin-container">
      <!-- HEAD -->
      <div class="head-row">
        <div>
          <h2 class="title">Meine Kunden</h2>
          <p class="subtitle">Übersicht aller registrierten Nutzer.</p>
        </div>

        <!-- SEARCH -->
        <div class="search-box">
          <input
            v-model="search"
            type="text"
            placeholder="Suchen nach Name, Email, ID, Rolle, Geburtstag oder Führerschein…"
            aria-label="Kunden suchen"
          />
          <button v-if="search" class="clear-btn" @click="clearSearch" aria-label="Suche löschen">
            ×
          </button>
        </div>
      </div>

      <!-- META -->
      <div class="meta-row">
        <span class="count"> {{ filteredUsers.length }} / {{ users.length }} Kunden </span>
        <span v-if="loading" class="loading">Lade Daten…</span>
      </div>

      <!-- TABLE -->
      <div class="table-scroll">
        <table class="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Rolle</th>
              <th>Geburtsdatum</th>
              <th>Führerschein-Nr.</th>
              <th>Aktionen</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="!loading && filteredUsers.length === 0">
              <td class="empty" colspan="7">Kein Kunde gefunden.</td>
            </tr>

            <tr v-for="u in filteredUsers" :key="u.id" :class="{ 'row-admin': u.role === 'ADMIN' }">
              <td class="id-cell">{{ u.id }}</td>
              <td>{{ u.firstName }} {{ u.lastName }}</td>
              <td>{{ u.email }}</td>

              <td>
                <span class="role-pill" :class="{ 'role-admin': u.role === 'ADMIN' }">
                  {{ u.role }}
                </span>
              </td>

              <td>{{ formatBirthday(u.birthday) }}</td>
              <td class="license-cell">{{ u.driverLicenseNumber || '-' }}</td>

              <td>
                <div class="actions">
                  <button class="btn disabled">Buchungen</button>
                  <button class="btn disabled">Rechnungen</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.admin-wrapper {
  padding: 50px 16px;
  display: flex;
  justify-content: center;
  background: transparent;
  font-family: 'Inter', sans-serif;
}

.admin-container {
  width: 100%;
  max-width: 1150px;
  background: #ffffff;
  padding: 30px 28px;
  border-radius: 18px;
  border: 1px solid rgba(6, 69, 127, 0.1);
  box-shadow:
    0 10px 28px rgba(15, 23, 42, 0.1),
    0 2px 8px rgba(15, 23, 42, 0.06);
}

/* Head */
.head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.title {
  font-size: 28px;
  font-weight: 800;
  margin: 0;
  color: var(--mazari-text-dark);
  letter-spacing: -0.3px;
}

.subtitle {
  margin: 6px 0 0;
  font-size: 14px;
  color: #667085;
  font-weight: 600;
}

/* Search */
.search-box {
  position: relative;
  min-width: 280px;
  flex: 0 0 auto;
}

.search-box input {
  width: 100%;
  height: 44px;
  padding: 0 40px 0 14px;
  border-radius: 12px;
  border: 1px solid #e6eaf0;
  background: #f8fafc;
  font-weight: 600;
  outline: none;
  transition: 0.2s ease;
}

.search-box input:focus {
  border-color: rgba(6, 69, 127, 0.55);
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(6, 69, 127, 0.1);
}

.clear-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 999px;
  background: #eef2f7;
  color: #0f172a;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
}

/* Meta row */
.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0 12px;
}

.count {
  font-size: 12.5px;
  font-weight: 800;
  color: #475569;
  background: #f1f5f9;
  padding: 6px 10px;
  border-radius: 999px;
}

.loading {
  font-size: 13px;
  color: #64748b;
  font-weight: 700;
}

/* Table scroll */
.table-scroll {
  overflow-x: auto;
  padding-bottom: 2px;
}

/* Table */
.users-table {
  width: 100%;
  min-width: 980px;
  border-collapse: separate;
  border-spacing: 0 8px; /* spacing between rows = card vibe */
}

.users-table thead th {
  text-align: left;
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;

  background: #f8fafc;
  padding: 12px 12px;
  border-top: 1px solid #e6eaf0;
  border-bottom: 1px solid #e6eaf0;
}

.users-table thead th:first-child {
  border-left: 1px solid #e6eaf0;
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
}

.users-table thead th:last-child {
  border-right: 1px solid #e6eaf0;
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
}

/* Body cells */
.users-table tbody td {
  background: #fff;
  padding: 12px 12px;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;

  border-top: 1px solid #eef2f7;
  border-bottom: 1px solid #eef2f7;
}

.users-table tbody td:first-child {
  border-left: 1px solid #eef2f7;
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
}

.users-table tbody td:last-child {
  border-right: 1px solid #eef2f7;
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
}

/* Hover */
.users-table tbody tr:hover td {
  background: #f7faff;
  border-color: rgba(6, 69, 127, 0.25);
}
.users-table tbody tr:hover {
  transform: translateY(-1px);
  filter: drop-shadow(0 6px 14px rgba(15, 23, 42, 0.08));
}

/* Admin highlight */
.row-admin td {
  background: #fffaf1;
}
.row-admin td:first-child {
  border-left: 4px solid #f5b544;
}

/* ID + License */
.id-cell {
  color: #64748b;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.license-cell {
  font-variant-numeric: tabular-nums;
}

/* Role pill */
.role-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
  background: rgba(6, 69, 127, 0.08);
  color: var(--mazari-primary-dark);
}
.role-pill.role-admin {
  background: rgba(245, 181, 68, 0.18);
  color: #b45309;
}

/* Actions */
.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.btn {
  height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 800;
  border: none;
  white-space: nowrap;
}
.btn.disabled {
  background: #e9edf3;
  color: #7a8699;
  cursor: not-allowed;
}

/* Empty row */
.empty {
  padding: 14px;
  background: #f8fafc;
  border: 1px dashed #d0d7e2;
  border-radius: 12px;
  font-weight: 700;
  color: #64748b;
  text-align: center;
}

/* Mobile: Table bleibt, nur kompakter + scroll */
@media (max-width: 720px) {
  .admin-container {
    padding: 22px 16px;
  }
  .title {
    font-size: 22px;
  }
  .users-table {
    min-width: 860px;
  }
  .users-table thead th,
  .users-table tbody td {
    padding: 10px 10px;
    font-size: 13px;
  }
}

@media (max-width: 420px) {
  .search-box {
    min-width: 100%;
  }
}
</style>
