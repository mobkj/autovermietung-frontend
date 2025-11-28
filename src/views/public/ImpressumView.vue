<script setup>
import Navbar from '@/components/NavBar.vue'
</script>

<template>
  <div>
    <Navbar />

    <main class="impressum-wrapper">
      <header class="impressum-head">
        <h1>Impressum</h1>
        <p class="subtitle">Angaben gemäß § 5 TMG und § 18 MStV.</p>
      </header>

      <!-- Anbieter -->
      <section class="card">
        <h2>Angaben zum Anbieter</h2>

        <!-- TODO: Firmennamen & Rechtsform anpassen -->
        <p>
          <strong>Unternehmen:</strong> Mazari Autovermietung
          <!-- TODO: Rechtsform ergänzen, z. B. Einzelunternehmen / GmbH -->
        </p>

        <!-- TODO: Adresse prüfen/anpassen -->
        <p>
          <strong>Adresse:</strong><br />
          Egerstraße 2<br />
          65205 Wiesbaden – Erbenheim
        </p>

        <!-- TODO: Kontaktdaten prüfen/anpassen -->
        <p>
          <strong>Kontakt:</strong><br />
          Telefon: <a href="tel:+49 162 7499403">+49 162 7499403</a><br />
          E-Mail: <a href="mailto:mkgv.wiesbaden@gmail.com">mkgv.wiesbaden@gmail.com</a>
        </p>

        <!-- TODO: Verantwortliche Person(en) eintragen -->
        <p>
          <strong>Vertretungsberechtigte Person:</strong><br />
          Max Mustermann
          <!-- TODO: richtigen Namen eintragen -->
        </p>

        <!-- Optional, falls Handelsregister-Eintrag -->
        <!-- TODO: Nur verwenden, wenn vorhanden -->
        <p>
          <strong>Registereintrag:</strong><br />
          Eingetragen im Handelsregister.<br />
          Registergericht: Amtsgericht Musterstadt
          <!-- TODO --><br />
          Registernummer: HRB 123456
          <!-- TODO -->
        </p>

        <!-- Optional: USt-IdNr. -->
        <!-- TODO: Nur verwenden, wenn vorhanden -->
        <p>
          <strong>Umsatzsteuer-ID:</strong><br />
          DE123456789
          <!-- TODO: USt-IdNr. eintragen oder Abschnitt löschen -->
        </p>
      </section>

      <!-- Aufsichtsbehörde / Berufsspezifisches -->
      <section class="card">
        <h2>Aufsichtsbehörde</h2>
        <!-- TODO: Nur verwenden, wenn relevant (z. B. bei erlaubnispflichtigen Tätigkeiten) -->
        <p>
          Zuständige Aufsichtsbehörde:<br />
          [Hier zuständige Behörde eintragen, falls erforderlich]
          <!-- TODO ggf. anpassen oder löschen -->
        </p>
      </section>

      <!-- Haftungsausschluss -->
      <section class="card">
        <h2>Haftung für Inhalte</h2>
        <p>
          Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
          Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als
          Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach
          den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter
          jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu
          überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit
          hinweisen.
        </p>
        <p>
          Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den
          allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch
          erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei
          Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend
          entfernen.
        </p>
      </section>

      <section class="card">
        <h2>Haftung für Links</h2>
        <p>
          Unser Angebot enthält ggf. Links zu externen Webseiten Dritter, auf deren Inhalte wir
          keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr
          übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder
          Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der
          Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum
          Zeitpunkt der Verlinkung nicht erkennbar.
        </p>
        <p>
          Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete
          Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von
          Rechtsverletzungen werden wir derartige Links umgehend entfernen.
        </p>
      </section>

      <section class="card">
        <h2>Urheberrecht</h2>
        <p>
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
          dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
          der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
          Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind
          nur für den privaten, nicht kommerziellen Gebrauch gestattet, sofern nicht ausdrücklich
          anders angegeben.
        </p>
        <p>
          Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die
          Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche
          gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden,
          bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen
          werden wir derartige Inhalte umgehend entfernen.
        </p>
      </section>

      <section class="card">
        <h2>Online-Streitbeilegung und Verbraucherschlichtung</h2>
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
          <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
            https://ec.europa.eu/consumers/odr </a
          >.
        </p>
        <!-- TODO: Entscheiden, ob ihr an Verbraucherschlichtung teilnehmt -->
        <p>
          Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.impressum-wrapper {
  max-width: 900px;
  margin: 0 auto;
  padding: 4rem 1.5rem 5rem;
  color: var(--mazari-text-dark);
}

.impressum-head {
  text-align: left;
  margin-bottom: 2rem;
}

.impressum-head h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 0.95rem;
  color: #64748b;
}

/* Cards */
.card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 1.5rem 1.4rem;
  margin-bottom: 1.2rem;
  box-shadow: var(--mazari-shadow-subtle);
}

.card h2 {
  font-size: 1.1rem;
  margin-bottom: 0.8rem;
  color: var(--mazari-primary-dark);
}

.card p {
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0 0 0.6rem;
}

.card a {
  color: var(--mazari-primary);
  text-decoration: none;
  font-weight: 600;
}

.card a:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .impressum-wrapper {
    padding: 3rem 1rem 4rem;
  }

  .impressum-head h1 {
    font-size: 1.6rem;
  }
}
</style>
