<script setup>
import { useAuthStore } from '@/stores/AuthStore'
import { ref, computed, watch } from 'vue'

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

// Lokale editierbare Kopien
const editableAccount = ref({})
const editableAddress = ref({})

// Edit-Status
const isEditingAccount = ref(false)
const isEditingAddress = ref(false)

// Passwort-Dialog
const showPasswordDialog = ref(false)
const passwordInput = ref('')
const passwordError = ref('')
const verifying = ref(false)

// für welches Tab wurde Edit angefragt? ('account' | 'address' | null)
const verifyTarget = ref(null)

// globales Feedback
const globalMessage = ref('')
const globalError = ref('')
const saving = ref(false)

// Re-Auth Fenster (z.B. 5 Minuten)
const lastVerifiedAt = ref(null)
const REAUTH_WINDOW_MS = 5 * 60 * 1000

const recentlyVerified = computed(() => {
  if (!lastVerifiedAt.value) return false
  return Date.now() - lastVerifiedAt.value < REAUTH_WINDOW_MS
})

// === Helper: User -> lokale Kopien ===
const syncFromUser = () => {
  const u = auth.user || {}
  editableAccount.value = {
    firstName: u.firstName || '',
    lastName: u.lastName || '',
    email: u.email || '',
    phone: u.phone || '',
    birthDate: u.birthDate || '',
    companyName: u.companyName || '',
    driverLicenseNumber: u.driverLicenseNumber || '',
  }

  editableAddress.value = {
    street: u.street || '',
    houseNumber: u.houseNumber || '',
    postalCode: u.postalCode || '',
    city: u.city || '',
    country: u.country || '',
  }
}

// initial & bei User-Änderung synchronisieren
syncFromUser()
watch(
  () => auth.user,
  () => {
    syncFromUser()
  },
  { deep: true },
)

// === Edit starten (Account / Adresse) ===
const requestEditAccount = () => {
  verifyTarget.value = 'account'
  startPasswordFlow()
}

const requestEditAddress = () => {
  verifyTarget.value = 'address'
  startPasswordFlow()
}

const startPasswordFlow = () => {
  globalMessage.value = ''
  globalError.value = ''
  passwordInput.value = ''
  passwordError.value = ''

  // Wenn kürzlich schon verifiziert → direkt editieren
  if (recentlyVerified.value) {
    activateEditMode()
  } else {
    showPasswordDialog.value = true
  }
}

const activateEditMode = () => {
  if (verifyTarget.value === 'account') {
    isEditingAccount.value = true
    isEditingAddress.value = false
  } else if (verifyTarget.value === 'address') {
    isEditingAddress.value = true
    isEditingAccount.value = false
  }

  globalMessage.value = 'Passwort erfolgreich bestätigt. Du kannst deine Daten jetzt bearbeiten.'
}

// === Passwort-Dialog Aktionen ===
const confirmPassword = async () => {
  if (!passwordInput.value) {
    passwordError.value = 'Bitte Passwort eingeben.'
    return
  }

  verifying.value = true
  passwordError.value = ''

  const ok = await auth.verifyPassword(passwordInput.value)

  verifying.value = false

  if (!ok) {
    passwordError.value = 'Passwort ist falsch.'
    return
  }

  lastVerifiedAt.value = Date.now()
  showPasswordDialog.value = false
  activateEditMode()
}

const cancelPasswordDialog = () => {
  showPasswordDialog.value = false
  passwordInput.value = ''
  passwordError.value = ''
  verifyTarget.value = null
}

// === Edit abbrechen ===
const cancelAccountEdit = () => {
  isEditingAccount.value = false
  syncFromUser()
}

const cancelAddressEdit = () => {
  isEditingAddress.value = false
  syncFromUser()
}

// === Speichern ===
const saveAccountEdit = async () => {
  saving.value = true
  globalError.value = ''
  globalMessage.value = ''

  const payload = {
    ...editableAccount.value,
  }

  const res = await auth.updateProfile(payload)

  saving.value = false

  if (!res.success) {
    globalError.value = res.error
    return
  }

  globalMessage.value = 'Account-Daten wurden erfolgreich aktualisiert.'
  isEditingAccount.value = false
}

const saveAddressEdit = async () => {
  saving.value = true
  globalError.value = ''
  globalMessage.value = ''

  const payload = {
    ...editableAddress.value,
  }

  const res = await auth.updateProfile(payload)

  saving.value = false

  if (!res.success) {
    globalError.value = res.error
    return
  }

  globalMessage.value = 'Adressdaten wurden erfolgreich aktualisiert.'
  isEditingAddress.value = false
}
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

      <!-- Feedback -->
      <p v-if="globalError" class="global-msg error">{{ globalError }}</p>
      <p v-if="globalMessage" class="global-msg success">{{ globalMessage }}</p>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Account -->
        <div v-if="activeTab === 'account'" class="fade">
          <div v-for="f in accountFields" :key="f.key" class="field-item">
            <label>{{ f.label }}</label>
            <div class="input-wrapper">
              <!-- Wenn im Edit-Modus: editierbar -->
              <input v-if="isEditingAccount" v-model="editableAccount[f.key]" />
              <!-- sonst readonly aus auth.user -->
              <input v-else :value="auth.user?.[f.key] ?? ''" readonly />
              <button
                v-if="!isEditingAccount"
                class="edit-btn"
                type="button"
                @click="requestEditAccount"
              >
                ✏️
              </button>
            </div>
          </div>

          <!-- Buttons für Account speichern/abbrechen -->
          <div v-if="isEditingAccount" class="edit-actions">
            <button type="button" class="btn-secondary" @click="cancelAccountEdit">
              Abbrechen
            </button>
            <button type="button" class="btn-primary" :disabled="saving" @click="saveAccountEdit">
              {{ saving ? 'Speichere…' : 'Änderungen speichern' }}
            </button>
          </div>
        </div>

        <!-- Adresse -->
        <div v-if="activeTab === 'address'" class="fade">
          <div v-for="f in addressFields" :key="f.key" class="field-item">
            <label>{{ f.label }}</label>
            <div class="input-wrapper">
              <input v-if="isEditingAddress" v-model="editableAddress[f.key]" />
              <input v-else :value="auth.user?.[f.key] ?? ''" readonly />
              <button class="edit-btn" type="button" @click="requestEditAddress">
                {{ isEditingAddress ? 'Bearbeiten' : '✏️' }}
              </button>
            </div>
          </div>

          <!-- Buttons für Adresse speichern/abbrechen -->
          <div v-if="isEditingAddress" class="edit-actions">
            <button type="button" class="btn-secondary" @click="cancelAddressEdit">
              Abbrechen
            </button>
            <button type="button" class="btn-primary" :disabled="saving" @click="saveAddressEdit">
              {{ saving ? 'Speichere…' : 'Änderungen speichern' }}
            </button>
          </div>
        </div>
      </div>
      <router-link to="/meinprofil" class="btn-back-to-profile">
        ← Zurück zu meinem Profil
      </router-link>
    </div>
  </div>

  <!-- Passwort-Dialog -->
  <div v-if="showPasswordDialog" class="pw-dialog-backdrop">
    <div class="pw-dialog">
      <h3>Passwort bestätigen</h3>
      <p class="pw-text">Bitte gib dein aktuelles Passwort ein, um diese Daten zu bearbeiten.</p>

      <input
        v-model="passwordInput"
        type="password"
        placeholder="Aktuelles Passwort"
        :class="{ 'input-error': passwordError }"
      />
      <p v-if="passwordError" class="pw-error">{{ passwordError }}</p>

      <div class="pw-actions">
        <button type="button" class="btn-secondary" @click="cancelPasswordDialog">Abbrechen</button>
        <button type="button" class="btn-primary" :disabled="verifying" @click="confirmPassword">
          {{ verifying ? 'Prüfe…' : 'Bestätigen' }}
        </button>
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

.global-msg {
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 600;
}
.global-msg.error {
  color: #b91c1c;
}
.global-msg.success {
  color: #16a34a;
}

/* Buttons unten beim Edit */
.edit-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-primary,
.btn-secondary {
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: 0.18s;
}

.btn-secondary {
  background: #e5e7eb;
  color: #111827;
}
.btn-secondary:hover {
  background: #d1d5db;
}

.btn-primary {
  background: #0474c4;
  color: #ffffff;
}
.btn-primary:hover:enabled {
  background: #06457f;
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: default;
}

/* Passwort-Dialog */
.pw-dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

.pw-dialog {
  background: #ffffff;
  padding: 20px 22px 18px;
  border-radius: 14px;
  width: 100%;
  max-width: 380px;
  box-shadow:
    0 10px 25px rgba(15, 23, 42, 0.35),
    0 2px 8px rgba(15, 23, 42, 0.18);
}

.pw-dialog h3 {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.pw-text {
  margin: 0 0 12px;
  font-size: 14px;
  color: #64748b;
}

.pw-dialog input {
  width: 100%;
  margin-top: 4px;
}

.pw-error {
  margin-top: 4px;
  font-size: 12px;
  color: #ef4444;
  font-weight: 600;
}

.pw-actions {
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
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

.btn-back-to-profile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 24px;
  margin-bottom: 20px;
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
