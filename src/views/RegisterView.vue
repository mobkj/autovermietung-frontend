<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/AuthStore.js'

const currentStep = ref(1)

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const companyName = ref('')

// neue Felder passend zum Backend
const phone = ref('')
const street = ref('')
const houseNumber = ref('')
const postalCode = ref('')
const city = ref('')
const country = ref('')
const birthDate = ref('')
const driverLicenseNumber = ref('')

const birthError = ref('')

function formatBirthDate() {
  let v = birthDate.value.replace(/\D/g, '') // nur Zahlen behalten

  if (v.length >= 2) v = v.slice(0, 2) + '.' + v.slice(2)
  if (v.length >= 5) v = v.slice(0, 5) + '.' + v.slice(5, 9)

  birthDate.value = v.slice(0, 10)
  validateBirthDate()
}

function validateBirthDate() {
  if (birthDate.value.length < 10) {
    birthError.value = 'Bitte vollständiges Datum eingeben'
    return
  }

  const [day, month, year] = birthDate.value.split('.').map(Number)

  if (!day || !month || !year || month > 12 || day > 31) {
    birthError.value = 'Ungültiges Datum'
    return
  }

  const dob = new Date(year, month - 1, day)
  const today = new Date()
  const age =
    today.getFullYear() -
    dob.getFullYear() -
    (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0)

  if (age < 18) {
    birthError.value = 'Du musst mindestens 18 Jahre alt sein'
  } else {
    birthError.value = ''
  }
}

const isBirthValid = computed(() => birthError.value === '')

const errorMessage = ref('')
const isSubmitting = ref(false)

const auth = useAuthStore()

// --- VALIDIERUNG ---

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isEmailValid = computed(() => emailRegex.test(email.value))
const emailError = computed(() => {
  if (!email.value) return 'E-Mail ist erforderlich'
  if (!isEmailValid.value) return 'Bitte eine gültige E-Mail-Adresse eingeben'
  return ''
})

// Passwort-Regeln (Standard: min. 8, Zahl, Groß-, Kleinbuchstabe)
const pwLengthOk = computed(() => password.value.length >= 8)
const pwUpperOk = computed(() => /[A-Z]/.test(password.value))
const pwLowerOk = computed(() => /[a-z]/.test(password.value))
const pwNumberOk = computed(() => /\d/.test(password.value))

const allPwRulesOk = computed(
  () => pwLengthOk.value && pwUpperOk.value && pwLowerOk.value && pwNumberOk.value,
)

// Passwort-Wiederholung
const passwordsMatch = computed(
  () => confirmPassword.value.length > 0 && confirmPassword.value === password.value,
)

// Step-Validierungen
const step1Valid = computed(
  () =>
    firstName.value &&
    lastName.value &&
    isEmailValid.value &&
    allPwRulesOk.value &&
    passwordsMatch.value &&
    isBirthValid.value &&
    driverLicenseNumber.value,
)

const step2Valid = computed(() => !!phone.value)

const step3Valid = computed(
  () => street.value && houseNumber.value && postalCode.value && city.value && country.value,
)

const currentStepValid = computed(() => {
  if (currentStep.value === 1) return step1Valid.value
  if (currentStep.value === 2) return step2Valid.value
  if (currentStep.value === 3) return step3Valid.value
  return false
})

// Gesamt-Form-Validität (für finalen Submit)
const isFormValid = computed(
  () =>
    step1Valid.value &&
    step2Valid.value &&
    step3Valid.value &&
    isEmailValid.value &&
    allPwRulesOk.value &&
    passwordsMatch.value,
)

// Navigation
const goNext = () => {
  if (currentStep.value < 3 && currentStepValid.value) {
    currentStep.value += 1
    errorMessage.value = ''
  } else if (!currentStepValid.value) {
    errorMessage.value = 'Bitte alle Felder in diesem Schritt korrekt ausfüllen.'
  }
}

const goBack = () => {
  if (currentStep.value > 1) {
    currentStep.value -= 1
    errorMessage.value = ''
  }
}

const submit = async () => {
  errorMessage.value = ''

  if (!isFormValid.value) {
    errorMessage.value = 'Bitte alle Felder korrekt ausfüllen.'
    return
  }

  try {
    isSubmitting.value = true

    const res = await auth.register({
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      password: password.value,

      phone: phone.value,
      street: street.value,
      houseNumber: houseNumber.value,
      postalCode: postalCode.value,
      city: city.value,
      country: country.value,
      birthDate: birthDate.value,
      driverLicenseNumber: driverLicenseNumber.value,
      companyName: companyName.value,
    })

    if (res?.error) {
      errorMessage.value = res.error
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <h2 class="title">Registrieren</h2>
      <p class="subtitle">Erstelle dein Konto bei Mazari Autovermietung</p>

      <!-- STEP INDICATOR -->
      <div class="stepper">
        <div class="step" :class="{ active: currentStep === 1, done: currentStep > 1 }">
          <div class="step-circle">1</div>
          <div class="step-label">Persönliche Daten</div>
        </div>
        <div class="step-line" :class="{ filled: currentStep > 1 }"></div>
        <div class="step" :class="{ active: currentStep === 2, done: currentStep > 2 }">
          <div class="step-circle">2</div>
          <div class="step-label">Kontakt</div>
        </div>
        <div class="step-line" :class="{ filled: currentStep > 2 }"></div>
        <div class="step" :class="{ active: currentStep === 3 }">
          <div class="step-circle">3</div>
          <div class="step-label">Adresse</div>
        </div>
      </div>

      <form @submit.prevent="submit" novalidate>
        <!-- STEP 1 -->
        <div v-if="currentStep === 1" class="step-content">
          <!-- Name -->
          <div class="input-row">
            <div class="input-group">
              <label>Vorname</label>
              <input v-model="firstName" :class="{ 'input-error': !firstName }" required />
            </div>

            <div class="input-group">
              <label>Nachname</label>
              <input v-model="lastName" :class="{ 'input-error': !lastName }" required />
            </div>
          </div>

          <!-- Email + Passwort -->
          <div class="input-group">
            <label>Email</label>
            <input
              v-model="email"
              type="email"
              :class="{
                'input-error': email && emailError,
                'input-valid': email && !emailError,
              }"
              required
            />
            <small v-if="email" class="hint" :class="{ error: emailError, ok: !emailError }">
              {{ emailError || 'E-Mail sieht gut aus ✔' }}
            </small>
          </div>

          <div class="input-group">
            <label>Passwort</label>
            <input
              v-model="password"
              type="password"
              :class="{
                'input-error': password && !allPwRulesOk,
                'input-valid': password && allPwRulesOk,
              }"
              required
            />

            <!-- Passwort-Regeln -->
            <ul class="pw-rules">
              <li
                :class="{
                  ok: pwLengthOk,
                  error: !pwLengthOk && password.length > 0,
                }"
              >
                Mindestens 8 Zeichen
              </li>
              <li
                :class="{
                  ok: pwUpperOk,
                  error: !pwUpperOk && password.length > 0,
                }"
              >
                Mindestens ein Großbuchstabe (A–Z)
              </li>
              <li
                :class="{
                  ok: pwLowerOk,
                  error: !pwLowerOk && password.length > 0,
                }"
              >
                Mindestens ein Kleinbuchstabe (a–z)
              </li>
              <li
                :class="{
                  ok: pwNumberOk,
                  error: !pwNumberOk && password.length > 0,
                }"
              >
                Mindestens eine Zahl (0–9)
              </li>
            </ul>
          </div>

          <div class="input-group">
            <label>Passwort wiederholen</label>
            <input
              v-model="confirmPassword"
              type="password"
              :class="{
                'input-error': confirmPassword && !passwordsMatch,
                'input-valid': confirmPassword && passwordsMatch,
              }"
              required
            />
            <small
              v-if="confirmPassword"
              class="hint"
              :class="{ error: !passwordsMatch, ok: passwordsMatch }"
            >
              {{
                passwordsMatch
                  ? 'Passwörter stimmen überein ✔'
                  : 'Passwörter stimmen nicht überein'
              }}
            </small>
          </div>

          <div class="input-group">
            <label>Firmenname (optional)</label>
            <input v-model="companyName" type="input" />
            <small
              v-if="confirmPassword"
              class="hint"
              :class="{ error: !passwordsMatch, ok: passwordsMatch }"
            >
              {{
                passwordsMatch
                  ? 'Passwörter stimmen überein ✔'
                  : 'Passwörter stimmen nicht überein'
              }}
            </small>
          </div>

          <div class="input-row">
            <div class="input-group">
              <label>Geburtsdatum</label>
              <input
                v-model="birthDate"
                @input="formatBirthDate"
                placeholder="TT.MM.JJJJ"
                :class="{
                  'input-error': birthError,
                  'input-valid': !birthError && birthDate.length === 10,
                }"
                required
              />

              <small v-if="birthError" class="hint error">{{ birthError }}</small>
              <small v-else-if="birthDate.length === 10" class="hint ok">✔ Gültiges Datum</small>
            </div>

            <div class="input-group">
              <label>Führerschein-Nummer</label>
              <input
                v-model="driverLicenseNumber"
                :class="{ 'input-error': !driverLicenseNumber }"
                required
              />
            </div>
          </div>
        </div>

        <!-- STEP 2 -->
        <div v-if="currentStep === 2" class="step-content">
          <div class="input-group">
            <label>Telefonnummer</label>
            <input v-model="phone" :class="{ 'input-error': !phone }" required />
          </div>
        </div>

        <!-- STEP 3 -->
        <div v-if="currentStep === 3" class="step-content">
          <div class="input-row">
            <div class="input-group">
              <label>Straße</label>
              <input v-model="street" :class="{ 'input-error': !street }" required />
            </div>

            <div class="input-group">
              <label>Hausnummer</label>
              <input v-model="houseNumber" :class="{ 'input-error': !houseNumber }" required />
            </div>
          </div>

          <div class="input-row">
            <div class="input-group">
              <label>PLZ</label>
              <input v-model="postalCode" :class="{ 'input-error': !postalCode }" required />
            </div>

            <div class="input-group">
              <label>Stadt</label>
              <input v-model="city" :class="{ 'input-error': !city }" required />
            </div>
          </div>

          <div class="input-group">
            <label>Land</label>
            <input v-model="country" :class="{ 'input-error': !country }" required />
          </div>
        </div>

        <p v-if="errorMessage" class="error-msg">
          {{ errorMessage }}
        </p>
        <p v-else class="error-msg" style="text-align: center; margin-top: 20px">
          <strong> !!! Daten werden bei der Schlüsselübergabe geprüft !!! </strong>
        </p>

        <!-- BUTTON LEISTE -->
        <div class="form-footer">
          <button v-if="currentStep > 1" type="button" class="btn-secondary" @click="goBack">
            Zurück
          </button>

          <button
            v-if="currentStep < 3"
            type="button"
            class="btn-primary"
            :disabled="!currentStepValid"
            @click="goNext"
          >
            Weiter
          </button>

          <button v-else type="submit" class="btn-submit" :disabled="!isFormValid || isSubmitting">
            {{ isSubmitting ? 'Wird gesendet...' : 'Registrieren' }}
          </button>
        </div>
      </form>

      <p class="switch-text">
        Konto vorhanden?
        <router-link to="/login">Login</router-link>
      </p>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.auth-wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #e8f0fb; /* helles Blau (Mazari-Style) */
  font-family: 'Inter', sans-serif;
}

.auth-card {
  width: 100%;
  max-width: 620px;
  background: white;
  padding: 36px 38px;
  border-radius: 18px;
  box-shadow:
    0 8px 18px rgba(15, 23, 42, 0.06),
    0 18px 45px rgba(15, 23, 42, 0.08);
}

.title {
  font-size: 26px;
  font-weight: 700;
  color: #06457f;
  margin-bottom: 6px;
}

.subtitle {
  margin-bottom: 20px;
  color: #475569;
  font-size: 14px;
}

/* STEPPER */
.stepper {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.step-circle {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  border: 2px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
  background: white;
  transition: 0.2s;
}

.step-label {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-align: center;
}

/* Aktiver Step */
.step.active .step-circle {
  border-color: #0474c4;
  background: #0474c4;
  color: white;
}

.step.active .step-label {
  color: #0474c4;
}

/* Fertiger Step */
.step.done .step-circle {
  border-color: #22c55e;
  background: #22c55e;
  color: white;
}
.step.done .step-label {
  color: #22c55e;
}

/* Linien */
.step-line {
  height: 2px;
  flex: 1;
  background: #cbd5e1;
  border-radius: 999px;
}

.step-line.filled {
  background: #0474c4;
}

/* FORM CONTENT */
.step-content {
  margin-top: 10px;
}

.input-row {
  display: flex;
  gap: 15px;
}

.input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 18px;
}

label {
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 14px;
  color: #0f172a;
}

input {
  padding: 11px 12px;
  border-radius: 8px;
  border: 1.6px solid #cbd5e1;
  transition: 0.18s;
  font-size: 14px;
}

input:focus {
  border-color: #0474c4;
  box-shadow: 0 0 0 3px rgba(4, 116, 196, 0.18);
  outline: none;
}

/* Valid / Error States */
.input-error {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.15);
}

.input-valid {
  border-color: #22c55e !important;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.15);
}

/* Passwort-Regeln */
.pw-rules {
  list-style: none;
  padding-left: 0;
  margin: 8px 0 0;
  font-size: 12px;
}

.pw-rules li {
  margin-bottom: 3px;
  color: #6b7280;
}

.pw-rules li.ok {
  color: #16a34a; /* grün */
}

.pw-rules li.error {
  color: #ef4444;
}

.hint {
  margin-top: 4px;
  font-size: 12px;
}
.hint.error {
  color: #ef4444;
}
.hint.ok {
  color: #16a34a;
}

/* BUTTON LEISTE */
.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

/* Buttons */
.btn-primary,
.btn-secondary,
.btn-submit {
  padding: 11px 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: 0.22s;
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
  color: white;
}
.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
.btn-primary:hover:enabled {
  background: #06457f;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.18);
}

.btn-submit {
  background: #0474c4;
  color: white;
}
.btn-submit:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
.btn-submit:hover:enabled {
  background: #06457f;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.18);
}

/* Error Message */
.error-msg {
  color: #ef4444;
  font-weight: 600;
  margin-top: 8px;
}

/* Switch text */
.switch-text {
  margin-top: 18px;
  font-size: 14px;
  color: #475569;
}
.switch-text a {
  color: #0474c4;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 600px) {
  .auth-card {
    padding: 26px 20px;
  }
  .input-row {
    flex-direction: column;
  }
  .stepper {
    flex-direction: column;
    gap: 6px;
  }
}
</style>
