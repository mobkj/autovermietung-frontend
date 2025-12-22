<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
import { ref } from 'vue'
import api from '@/api/axios' // <- nutzt dein Axios-Instance mit baseURL/env

const success = ref(false)
const loading = ref(false)
const error = ref('')

// Form State
const name = ref('')
const email = ref('')
const subject = ref('')
const message = ref('')

// simple spam honeypot (muss leer bleiben)
const gotcha = ref('')

async function submitForm() {
  success.value = false
  error.value = ''

  // Honeypot gefüllt => Bot => still "erfolgreich" tun
  if (gotcha.value) {
    success.value = true
    return
  }

  if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
    error.value = 'Bitte Name, E-Mail und Nachricht ausfüllen.'
    return
  }

  try {
    loading.value = true

    await api.post('/api/contact', {
      name: name.value.trim(),
      email: email.value.trim(),
      subject: subject.value.trim(),
      message: message.value.trim(),
      gotcha: gotcha.value.trim(),
    })

    success.value = true

    // reset
    name.value = ''
    email.value = ''
    subject.value = ''
    message.value = ''
    gotcha.value = ''
  } catch (e) {
    error.value =
      e?.response?.data?.message ||
      e?.message ||
      'Nachricht konnte nicht gesendet werden. Bitte später erneut versuchen.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <nav-bar />

    <section class="contact-section">
      <h1>Kontakt – Dein direkter Draht zu Mazari</h1>
      <p class="subtitle">
        Du hast Fragen zu einem Fahrzeug, zur Kaution oder zu deiner Buchung? Schreib uns einfach –
        wir melden uns schnellstmöglich bei dir.
      </p>

      <!-- Kontaktinformationen -->
      <div class="contact-info">
        <h2>Unsere Kontaktdaten</h2>

        <div class="info-item">
          <i class="fa-solid fa-location-dot"></i>
          <a
            href="https://www.google.com/maps?q=Egerstraße+2+65205+Wiesbaden"
            target="_blank"
            rel="noopener"
          >
            Am Königsfloß 6, 55252 in Mainz Kastel
          </a>
        </div>

        <div class="info-item">
          <i class="fa-solid fa-phone"></i>
          <a href="tel:+4915202148802">+49 15 20 21 48 80 2</a>
        </div>

        <div class="info-item">
          <i class="fa-solid fa-envelope"></i>
          <a href="mailto:info@mazari-cars.de">info@mazariautovermietung.com</a>
        </div>

        <div class="info-item">
          <i class="fa-solid fa-clock"></i>
          <p>Erreichbarkeit: Mo–So, 08:00 – 20:00 Uhr</p>
        </div>

        <div class="info-item">
          <i class="fa-solid fa-car-burst"></i>
          <p>Notfall / Panne während der Miete: Details in deinem Mietvertrag</p>
        </div>
      </div>

      <!-- Kontaktformular -->
      <form @submit.prevent="submitForm" class="contact-form">
        <div class="form-group">
          <label for="name">Name</label>
          <input id="name" v-model="name" type="text" required />
        </div>

        <div class="form-group">
          <label for="email">E-Mail</label>
          <input id="email" v-model="email" type="email" required />
        </div>

        <div class="form-group">
          <label for="subject">Betreff</label>
          <input
            id="subject"
            v-model="subject"
            type="text"
            placeholder="z. B. Anfrage zu BMW M8, Kaution, Abholung..."
          />
        </div>

        <div class="form-group">
          <label for="message">Nachricht</label>
          <textarea
            id="message"
            v-model="message"
            rows="5"
            placeholder="Wie können wir dir weiterhelfen?"
            required
          ></textarea>
        </div>

        <!-- Erfolg / Fehler -->
        <p v-if="error" class="success-msg" style="color: #dc2626">❌ {{ error }}</p>
        <p v-if="success" class="success-msg">✅ Nachricht erfolgreich gesendet!</p>

        <!-- Anti-Spam -->
        <input v-model="gotcha" type="text" name="_gotcha" style="display: none" />

        <button type="submit" class="send-btn" :disabled="loading">
          {{ loading ? 'Sende…' : 'Nachricht senden' }}
        </button>
      </form>

      <p class="privacy-hint">
        Mit dem Absenden des Formulars erklärst du dich damit einverstanden, dass wir deine Angaben
        zur Beantwortung deiner Anfrage verwenden. Details findest du in unserer
        <RouterLink to="/datenschutz">Datenschutzerklärung</RouterLink>.
      </p>
    </section>
  </div>
</template>

<style scoped>
/* dein CSS bleibt 1:1 wie du es hast */
.contact-section {
  padding: 6rem 2rem 8rem;
  text-align: center;
  background: var(--mazari-bg-light);
  color: var(--mazari-text-dark);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rem;
}

h1 {
  font-size: 2.4rem;
  margin-bottom: 0.75rem;
  color: var(--mazari-primary-dark);
}
.subtitle {
  font-size: 1.1rem;
  color: #4b5563;
  max-width: 700px;
  margin: 0 auto 3rem;
  line-height: 1.6;
}

.contact-info {
  position: relative;
  background: linear-gradient(
    135deg,
    rgba(6, 69, 127, 0.06) 0%,
    #ffffff 50%,
    rgba(245, 181, 68, 0.08) 100%
  );
  width: 750px;
  max-width: 100%;
  margin: 0 auto;
  padding: 3rem 2rem;
  border-radius: var(--mazari-radius-lg);
  box-shadow:
    0 8px 25px rgba(15, 23, 42, 0.16),
    inset 0 0 25px rgba(245, 181, 68, 0.16);
  text-align: center;
  border: 1px solid rgba(6, 69, 127, 0.12);
  overflow: hidden;
}

.contact-info::before {
  content: '';
  position: absolute;
  top: -30%;
  left: -30%;
  width: 160%;
  height: 160%;
  background: radial-gradient(circle at top left, rgba(245, 181, 68, 0.22), transparent 70%);
  pointer-events: none;
  animation: subtleGlow 8s ease-in-out infinite alternate;
}
@keyframes subtleGlow {
  from {
    transform: translate(0, 0);
  }
  to {
    transform: translate(10px, 10px);
  }
}

.contact-info h2 {
  color: var(--mazari-primary-dark);
  font-size: 1.6rem;
  font-weight: 800;
  margin-bottom: 2.2rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 1rem 0;
  color: var(--mazari-text-dark);
  transition:
    transform 0.3s ease,
    color 0.3s ease;
}

.info-item i {
  font-size: 1.4rem;
  color: var(--mazari-primary);
  transition:
    transform 0.3s ease,
    color 0.3s ease;
}

.info-item a,
.info-item p {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 500;
  color: var(--mazari-text-dark);
  text-decoration: none;
  transition: color 0.3s ease;
}

.info-item:hover {
  transform: translateY(-2px);
  color: var(--mazari-accent);
}
.info-item:hover i {
  color: var(--mazari-accent);
  transform: scale(1.15);
}
.info-item:hover a {
  color: var(--mazari-accent);
}

.contact-form {
  background: #ffffff;
  width: 750px;
  max-width: 100%;
  margin: 0 auto;
  padding: 3rem 2.5rem;
  border-radius: var(--mazari-radius-lg);
  box-shadow: var(--mazari-shadow-subtle);
  text-align: left;
}

.form-group {
  margin-bottom: 1.8rem;
}
label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 600;
  color: var(--mazari-primary-dark);
}
input,
textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.7rem;
  font-size: 1rem;
  outline: none;
  transition:
    border 0.3s ease,
    box-shadow 0.3s ease,
    background 0.3s ease;
}
input:focus,
textarea:focus {
  border-color: var(--mazari-primary);
  box-shadow: 0 0 0 3px rgba(6, 69, 127, 0.16);
  background: #f8fafc;
}

.success-msg {
  text-align: center;
  margin: 1.5rem 0 0.5rem;
  font-weight: 700;
  color: #16a34a;
}

.send-btn {
  display: block;
  margin: 2rem auto 0;
  background: var(--mazari-primary);
  color: white;
  padding: 0.9rem 2.6rem;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.3px;
  transition:
    background 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.send-btn:hover:enabled {
  background: var(--mazari-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.22);
}
.send-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.privacy-hint {
  margin-top: 2rem;
  font-size: 0.9rem;
  color: #555;
  text-align: center;
  max-width: 600px;
  line-height: 1.5;
  margin-left: auto;
  margin-right: auto;
}

.privacy-hint a {
  color: var(--mazari-primary);
  text-decoration: none;
  font-weight: 600;
  border-bottom: 1px solid transparent;
  transition:
    color 0.3s ease,
    border-bottom-color 0.3s ease,
    text-shadow 0.3s ease;
}
.privacy-hint a:hover {
  color: var(--mazari-accent);
  border-bottom-color: var(--mazari-accent);
  text-shadow: 0 0 5px rgba(245, 181, 68, 0.4);
}

@media (max-width: 768px) {
  .contact-section {
    gap: 2.5rem;
    padding: 4rem 1.2rem 5rem;
  }

  .contact-info,
  .contact-form {
    width: 100%;
    max-width: 95%;
    padding: 2rem 1.4rem;
  }

  h1 {
    font-size: 1.9rem;
    line-height: 1.3;
  }

  .subtitle {
    font-size: 1rem;
    margin-bottom: 1.8rem;
  }

  .info-item {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  .contact-form {
    padding: 2rem 1.5rem;
  }

  .send-btn {
    width: 100%;
    max-width: 260px;
    font-size: 1rem;
    padding: 0.9rem 0;
  }

  .privacy-hint {
    font-size: 0.85rem;
    padding: 0 0.5rem;
  }
}
</style>
