<script setup>
import { useAuthStore } from '@/stores/AuthStore'
import { ref } from 'vue'

const auth = useAuthStore()

const activeTab = ref('account')

const tabs = [
  { key: 'account', label: 'Account' },
  { key: 'address', label: 'Adresse' },
]

const accountFields = [
  { label: 'Vorname', key: 'firstName' },
  { label: 'Nachname', key: 'lastName' },
  { label: 'Email', key: 'email' },
  { label: 'Telefonnummer', key: 'phone' },
  { label: 'Geburtsdatum', key: 'birthDate' },
  { label: 'Firmenname', key: 'companyName' },
  { label: 'Führerschein-Nummer', key: 'driverLicenseNumber' },
]

const addressFields = [
  { label: 'Straße', key: 'street' },
  { label: 'Hausnummer', key: 'houseNumber' },
  { label: 'PLZ', key: 'postalCode' },
  { label: 'Stadt', key: 'city' },
  { label: 'Land', key: 'country' },
]
</script>

<template>
  <div class="profile-wrapper">
    <div class="profile-container">
      <h2 class="section-title">Account Details</h2>

      <!-- Tabs -->
      <div class="tabs">
        <button
          v-for="t in tabs"
          :key="t.key"
          :class="['tab-btn', { active: activeTab === t.key }]"
          @click="activeTab = t.key"
        >
          {{ t.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Account -->
        <div v-if="activeTab === 'account'" class="fade">
          <div v-for="f in accountFields" :key="f.key" class="field-item">
            <label>{{ f.label }}</label>
            <div class="input-wrapper">
              <input :value="auth.user?.[f.key] ?? ''" readonly />
              <button class="edit-btn">✏️</button>
            </div>
          </div>
        </div>

        <!-- Adresse -->
        <div v-if="activeTab === 'address'" class="fade">
          <div v-for="f in addressFields" :key="f.key" class="field-item">
            <label>{{ f.label }}</label>
            <div class="input-wrapper">
              <input :value="auth.user?.[f.key] ?? ''" readonly />
              <button class="edit-btn">✏️</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.profile-wrapper {
  padding: 60px 20px;
  display: flex;
  justify-content: center;
  background: linear-gradient(to bottom, #ffffff 0%, #ffffff 40%, #e6eef7 65%, #a8c4ec 100%);
  font-family: 'Inter', sans-serif;
}

.profile-container {
  width: 100%;
  max-width: 750px;
  padding: 40px 35px;
  background: white;
  border-radius: 18px;
  border: 2px solid #d8e0ea;
  box-shadow:
    0 6px 12px rgba(0, 0, 0, 0.04),
    0 18px 40px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 30px;
  font-weight: 800;
  margin-bottom: 28px;
  color: #06457f;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 4px;
}

.tab-btn {
  padding: 8px 18px;
  border-radius: 999px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: 0.22s ease;
}

.tab-btn.active {
  background: #e0edfb;
  color: #06457f;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.08);
}

/* Content */
.tab-content {
  margin-top: 10px;
}

.field-item {
  margin-bottom: 18px;
}

.field-item label {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 6px;
  font-size: 15px;
  display: block;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

input {
  flex: 1;
  padding: 12px;
  background: #f8fafc;
  border: 1.6px solid #cbd5e1;
  border-radius: 10px;
  font-size: 15px;
  color: #0f172a;
  font-family: 'Inter', sans-serif;
}

input:focus {
  border-color: #0474c4;
  box-shadow: 0 0 0 3px rgba(4, 116, 196, 0.15);
  outline: none;
}

/* Readonly */
input[readonly] {
  background: #f1f5f9;
  border: 1.6px solid #d4d8df;
  color: #475569;
  cursor: not-allowed;
  box-shadow: none !important;
}

input[readonly]:focus {
  border: 1.6px solid #d4d8df !important;
  box-shadow: none !important;
}

/* Edit Button */
.edit-btn {
  background: #0474c4;
  color: white;
  border: none;
  padding: 9px 10px;
  font-size: 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.2s;
  font-family: 'Inter', sans-serif;
}

.edit-btn:hover {
  background: #06457f;
}

/* kleine Fade-Optik */
.fade {
  animation: fadeIn 0.18s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 600px) {
  .profile-container {
    padding: 28px 20px;
  }
  .tabs {
    flex-wrap: wrap;
  }
}
</style>
