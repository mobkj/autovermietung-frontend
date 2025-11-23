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
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* FULL SCREEN CENTER */
.auth-wrapper {
  height: 100vh;
  background: #e8f0fb; /* Mazari Light Blue */
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  font-family: 'Inter', sans-serif;
}

/* CARD */
.auth-card {
  width: 100%;
  max-width: 460px;
  background: white;
  padding: 40px 35px;
  border-radius: 18px;

  box-shadow:
    0 6px 12px rgba(0, 0, 0, 0.04),
    0 18px 35px rgba(0, 0, 0, 0.08);

  animation: fadeIn 0.3s ease-out;
}

/* Titles */
.title {
  font-size: 28px;
  text-align: center;
  margin-bottom: 6px;
  font-weight: 800;
  color: #06457f;
}

.subtitle {
  text-align: center;
  margin-bottom: 28px;
  color: #475569;
  font-size: 14px;
}

/* Input Groups */
.input-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #0f172a;
}

input {
  padding: 12px 14px;
  border: 1.7px solid #cbd5e1;
  border-radius: 8px;
  font-size: 15px;
  transition: 0.2s;
}

input:focus {
  border-color: #0474c4;
  box-shadow: 0 0 0 3px rgba(4, 116, 196, 0.16);
  outline: none;
}

/* ERROR STATE */
.input-error {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.error-msg {
  color: #ef4444;
  font-weight: 600;
  margin-bottom: 10px;
  text-align: center;
}

/* Button */
.btn-login {
  width: 100%;
  padding: 12px;
  background: #0474c4;
  color: white;
  font-size: 17px;
  border-radius: 10px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: 0.25s;
}

.btn-login:hover:enabled {
  background: #06457f;
  transform: translateY(-1px);
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.18);
}

.btn-login:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

/* Switch Text */
.switch-text {
  margin-top: 22px;
  text-align: center;
  color: #475569;
}

.switch-text a {
  color: #0474c4;
  font-weight: 700;
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
