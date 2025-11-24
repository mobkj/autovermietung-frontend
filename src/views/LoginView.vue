<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/AuthStore'
import ProfileNavbar from '@/components/ProfileNavbar.vue'

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

const auth = useAuthStore()

const submit = async () => {
  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'Bitte E-Mail und Passwort eingeben.'
    return
  }

  isSubmitting.value = true

  const success = await auth.login(email.value, password.value)

  if (!success) {
    errorMessage.value = 'Benutzername oder Passwort falsch. Bitte versuche es erneut.'
  }

  isSubmitting.value = false
}
</script>

<template>
  <div class="auth-page">
    <profile-navbar />
    <div class="auth-wrapper">
      <div class="auth-card">
        <h2 class="title">Login</h2>
        <p class="subtitle">Melde dich an, um fortzufahren</p>

        <form @submit.prevent="submit">
          <div class="input-group">
            <label>Email</label>
            <input
              v-model="email"
              type="email"
              :class="{ 'input-error': email && !email.includes('@') }"
              required
            />
          </div>

          <div class="input-group">
            <label>Passwort</label>
            <input v-model="password" type="password" required />
          </div>

          <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>

          <button class="btn-login" :disabled="isSubmitting">
            {{ isSubmitting ? 'Wird geladen...' : 'Einloggen' }}
          </button>
        </form>

        <p class="switch-text">
          Noch kein Account?
          <router-link to="/register">Jetzt registrieren</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* ganze Seite als Spalte: Navbar oben, Rest zentriert */
.auth-page {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: transparent;
  font-family: 'Inter', sans-serif;
}

/* Wrapper nimmt restliche Höhe und zentriert */
.auth-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;

  padding-inline: clamp(14px, 4vw, 24px);
  padding-bottom: clamp(20px, 6vh, 60px);
}

/* Card */
.auth-card {
  width: 100%;
  max-width: min(92vw, 480px);
  background: white;
  padding: clamp(22px, 4vw, 38px);
  border-radius: 18px;
  border: 1px solid rgba(6, 69, 127, 0.1);

  box-shadow:
    0 10px 28px rgba(15, 23, 42, 0.1),
    0 2px 8px rgba(15, 23, 42, 0.06);

  animation: fadeIn 0.3s ease-out;
}

/* Titles */
.title {
  font-size: clamp(22px, 4vw, 28px);
  text-align: center;
  margin-bottom: 6px;
  font-weight: 800;
  color: var(--mazari-text-dark);
}

.subtitle {
  text-align: center;
  margin-bottom: clamp(16px, 3vw, 26px);
  color: #667085;
  font-size: 14px;
  font-weight: 600;
}

/* Inputs */
.input-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 18px;
}

label {
  font-size: 13.5px;
  font-weight: 700;
  margin-bottom: 6px;
  color: #0f172a;
}

input {
  padding: 10px 12px;
  border: 1.6px solid #cbd5e1;
  border-radius: 10px;
  font-size: 16px; /* iOS zoom OFF */
  background: #f8fafc;
  transition: 0.2s;
}

input:focus {
  border-color: var(--mazari-primary);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(4, 116, 196, 0.16);
  outline: none;
}

/* Error */
.input-error {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.15);
  background: #fffafa;
}

.error-msg {
  color: #ef4444;
  font-weight: 700;
  margin-bottom: 10px;
  text-align: center;
}

/* Button */
.btn-login {
  width: 100%;
  padding: 12px;
  background: var(--mazari-primary);
  color: white;
  font-size: 16px;
  border-radius: 10px;
  font-weight: 800;
  border: none;
  cursor: pointer;
  transition: 0.25s;
}

.btn-login:hover:enabled {
  background: var(--mazari-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.18);
}

.btn-login:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

/* Switch text */
.switch-text {
  margin-top: 18px;
  text-align: center;
  color: #475569;
  font-weight: 600;
}

.switch-text a {
  color: var(--mazari-primary);
  font-weight: 800;
}

/* Fade animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
