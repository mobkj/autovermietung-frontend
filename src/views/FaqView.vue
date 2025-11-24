<script setup>
import NavBar from '@/components/NavBar.vue'
import { ref } from 'vue'

const openIndex = ref(0)

const faqs = [
  {
    q: 'Wie buche ich ein Fahrzeug bei Mazari?',
    a: `Ganz einfach online über unsere Webseite.
        Du wählst Zeitraum & Fahrzeug, schließt die Buchung ab und bekommst sofort eine Bestätigung mit Buchungsnummer per Mail.`,
  },
  {
    q: 'Welche Zahlungsmöglichkeiten gibt es?',
    a: `Du kannst online bezahlen oder vor Ort.
        Barzahlung ist möglich – die Kaution wird jedoch online oder per Karte hinterlegt.`,
  },
  {
    q: 'Wie funktioniert die Kaution?',
    a: `Die Kaution dient als Sicherheit für die Mietdauer.
        Sie wird bei Buchung bzw. Abholung online/kartengestützt hinterlegt und nach Rückgabe – sofern alles passt – automatisch freigegeben.`,
  },
  {
    q: 'Kann ich auch bar bezahlen?',
    a: `Ja, der Mietpreis kann bar vor Ort gezahlt werden.
        Die Kaution läuft separat online/per Karte, damit alles schnell und sicher abgewickelt ist.`,
  },
  {
    q: 'Welche Stornierungs- und Änderungsregeln gelten?',
    a: `Bei Tarifen mit Zahlung vor Ort kannst du deine Reservierung bis zur Abholzeit kostenlos stornieren oder ändern.
        Bei rabattierten Prepaid-/Deal-Tarifen ist eine kostenfreie Stornierung nur innerhalb eines kurzen Zeitfensters nach der Buchung möglich;
        danach kann – je nach Tarif – eine Stornogebühr anfallen.
        Bei Nichterscheinen ohne Stornierung kann eine No-Show-Gebühr berechnet werden.`,
  },
  {
    q: 'Was muss ich zur Abholung mitbringen?',
    a: `Bitte bring deine Buchungsnummer und einen gültigen Personalausweis/Pass und deinen Führerschein mit.
        Deine Angaben werden vor Ort kurz mit deinem Nutzerkonto abgeglichen – danach bekommst du die Schlüssel und kannst losfahren.`,
  },
  {
    q: 'Wie läuft die Fahrzeugübergabe ab?',
    a: `Wir prüfen gemeinsam Fahrzeugzustand und Tankstand, du unterschreibst kurz digital/analog – fertig.
        Danach heißt es: einsteigen & losfahren.`,
  },
  {
    q: 'Was kostet der Bring-Service?',
    a: `Auf Wunsch liefern wir dir das Fahrzeug deutschlandweit gegen Aufpreis.
        Der Preis richtet sich nach Entfernung und Aufwand – du siehst ihn transparent vor Abschluss der Buchung.`,
  },
  {
    q: 'Kann ich meine Miete verlängern?',
    a: `Ja, solange das Fahrzeug nicht direkt weitervermietet ist.
        Schreib uns kurz oder ruf an – wir bestätigen dir die Verlängerung sofort.`,
  },
  {
    q: 'Gibt es ein Kilometerlimit oder eine Tankregelung?',
    a: `Je nach Tarif kann ein Kilometerpaket enthalten sein.
        Die Tankregelung ist fair: Rückgabe mit dem gleichen Tankstand wie bei Übergabe.`,
  },
  {
    q: 'Wer darf das Auto fahren?',
    a: `Fahren dürfen alle im Mietvertrag eingetragenen Fahrer.
        Zusatzfahrer kannst du bei der Buchung oder vor Ort hinzufügen.`,
  },
  {
    q: 'Was passiert bei einem Schaden oder Unfall?',
    a: `Bleib ruhig, sichere die Stelle und melde dich sofort bei uns.
        Wir erklären dir den nächsten Schritt – inklusive Versicherung/Abwicklung.`,
  },
]

const toggle = (i) => {
  openIndex.value = openIndex.value === i ? -1 : i
}
</script>

<template>
  <nav-bar />

  <main class="faq-wrapper">
    <header class="faq-head">
      <h1>FAQ</h1>
      <p>Alles Wichtige zur Miete, Zahlung und Abholung – kurz erklärt.</p>
    </header>

    <section class="faq-list">
      <article
        v-for="(item, i) in faqs"
        :key="i"
        class="faq-card"
        :class="{ open: openIndex === i }"
      >
        <button class="faq-question" @click="toggle(i)" :aria-expanded="openIndex === i">
          <h2>{{ item.q }}</h2>

          <span class="chev" :class="{ rotate: openIndex === i }">
            <!-- simple chevron ohne extra libs -->
            ▼
          </span>
        </button>

        <div class="faq-answer">
          <p>{{ item.a }}</p>
        </div>
      </article>
    </section>
  </main>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

h1 {
  border-bottom: 2px solid var(--mazari-primary);
  padding: 15px;
}
.faq-wrapper {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px 16px 70px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Head */
.faq-head {
  background: #fff;
  border: 1px solid rgba(6, 69, 127, 0.08);
  border-radius: 16px;
  padding: 18px 18px;
  box-shadow: var(--mazari-shadow-subtle);
}

.faq-head h1 {
  margin: 0 0 6px;
  font-size: 28px;
  font-weight: 800;
  color: var(--mazari-text-dark);
}

.faq-head p {
  margin: 0;
  color: #667085;
  font-weight: 600;
}

/* Accordion List */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.faq-card {
  background: #ffffff;
  border: 1px solid #e6eaf0;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: var(--mazari-shadow-subtle);
  transition: 0.2s ease;
}

.faq-card.open {
  border-color: rgba(6, 69, 127, 0.28);
  box-shadow: var(--mazari-shadow-soft);
}

.faq-question {
  width: 100%;
  background: transparent;
  border: none;
  text-align: left;

  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  font-family: 'Inter', sans-serif; /* NEU: Button erbt sonst oft nicht */
  font-size: 15px; /* wie Subtitle */
  font-weight: 900; /* wie Subtitle */
  color: black; /* wie Subtitle */
  cursor: pointer;
}

.faq-question:hover {
  background: rgba(6, 69, 127, 0.04);
}

/* Chevron */
.chev {
  font-size: 12px;
  transition: transform 0.2s ease;
  opacity: 0.7;
}
.chev.rotate {
  transform: rotate(180deg);
}

/* Answer animation (smooth) */
.faq-answer {
  display: grid; /* NEU */
  grid-template-rows: 0fr; /* NEU */
  overflow: hidden;
  transition:
    grid-template-rows 0.35s ease,
    padding 0.35s ease; /* NEU */
  padding: 0 18px;
}

.faq-answer p {
  /* NEU */
  overflow: hidden;
  opacity: 0;
  transform: translateY(-4px);
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.faq-card.open .faq-answer {
  grid-template-rows: 1fr; /* NEU */
  padding-bottom: 16px;
}

.faq-card.open .faq-answer p {
  /* NEU */
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.05s;
}

/* MOBILE */
@media (max-width: 768px) {
  .faq-head h1 {
    font-size: 22px;
  }

  .faq-question {
    font-size: 15px;
    padding: 14px 14px;
  }

  .faq-answer p {
    font-size: 14px;
  }
}
</style>
