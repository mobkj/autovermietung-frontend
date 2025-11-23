<script setup>
import { adminService } from '@/api/adminService'
import { onMounted, ref } from 'vue'

const users = ref([])

onMounted(async () => {
  users.value = await adminService.getAllUsers()
})
</script>

<template>
  <div class="admin-wrapper">
    <div class="admin-container">
      <h2 class="title">Meine Kunden</h2>

      <!-- HEADER -->
      <div class="table-head">
        <span>ID</span>
        <span>Name</span>
        <span>Email</span>
        <span>Rolle</span>
        <span>Aktionen</span>
      </div>

      <!-- ROWS -->
      <div
        class="user-row"
        v-for="u in users"
        :key="u.id"
        :class="{ 'row-admin': u.role === 'ADMIN' }"
      >
        <span class="id">{{ u.id }}</span>
        <span>{{ u.firstName }} {{ u.lastName }}</span>
        <span>{{ u.email }}</span>

        <span class="role" :class="{ 'role-admin': u.role === 'ADMIN' }">
          {{ u.role }}
        </span>

        <div class="actions">
          <button class="btn small disabled">Buchungen</button>
          <button class="btn small disabled">Rechnungen</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.admin-wrapper {
  padding: 50px 20px;
  display: flex;
  justify-content: center;
  background: #eef4fb;
  font-family: 'Inter', sans-serif;
}

.admin-container {
  width: 100%;
  max-width: 1100px;
  background: white;
  padding: 35px 40px;
  border-radius: 20px;
  border: 2px solid #d8e0ea;
  box-shadow:
    0 8px 18px rgba(15, 23, 42, 0.06),
    0 18px 45px rgba(15, 23, 42, 0.08);
}

.title {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 30px;
  color: #06457f;
}

/* HEADER */
.table-head {
  display: grid;
  grid-template-columns: 60px 1.2fr 1.5fr 0.8fr 1.3fr; /* exakt gleiche Werte */
  font-weight: 700;
  color: #1e293b;
  padding: 14px 10px;
  border-bottom: 3px solid #a8c4ec;
  font-size: 14px;
}

/* ROWS */
.user-row {
  display: grid;
  grid-template-columns: 60px 1.2fr 1.5fr 0.8fr 1.3fr; /* identisch! */
  padding: 14px 10px;
  border-bottom: 1px solid #385da6;
  align-items: center;
  transition: 0.2s ease;
}

.user-row:hover {
  background: #f1f5f9;
}

/* ADMIN ROW */
.row-admin {
  background: #e4dabc !important;
}

/* ROLE COLORS */
.role {
  font-weight: 700;
  color: #0474c4;
}

.role-admin {
  color: #d97706 !important;
}

/* ID */
.id {
  color: #475569;
  font-weight: 600;
}

/* ACTIONS */
.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
  align-items: center;
}

.btn {
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  transition: 0.2s;
}

.btn.small {
  padding: 6px 10px;
}

/* Disabled actions */
.btn.disabled {
  background: #d7dfe9;
  color: #64748b;
  cursor: not-allowed;
}

/* MOBILE OPTIMIERUNG */
@media (max-width: 820px) {
  .table-head {
    grid-template-columns: 50px 1fr 1fr 90px 180px;
  }

  .user-row {
    grid-template-columns: 50px 1fr 1fr 90px 180px;
  }

  .actions {
    overflow-x: auto;
    padding-bottom: 4px;
  }
}

@media (max-width: 600px) {
  .admin-container {
    padding: 25px 15px;
  }

  .table-head,
  .user-row {
    grid-template-columns: 40px 1fr 1fr;
    grid-auto-rows: auto;
    row-gap: 8px;
  }

  .actions {
    grid-column: span 3;
    overflow-x: auto;
    padding: 6px 0;
  }

  .role {
    grid-column: auto;
  }
}
</style>
