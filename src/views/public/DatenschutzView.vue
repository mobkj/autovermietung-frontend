<script setup>
import NavBar from '@/components/NavBar.vue'
</script>

<template>
  <div>
    <nav-bar />

    <main class="datenschutz-wrapper">
      <header class="ds-head">
        <h1>Datenschutzerklärung</h1>
        <p class="subtitle">
          Informationen zur Verarbeitung personenbezogener Daten gemäß Art. 13, 14 DSGVO.
        </p>
      </header>

      <!-- 1. Verantwortlicher -->
      <section class="card">
        <h2>1. Verantwortlicher</h2>
        <p>Verantwortlich für die Datenverarbeitung auf dieser Website ist:</p>
        <p>
          <!-- TODO: Firmendaten anpassen -->
          <strong>Mazari Autovermietung</strong><br />
          Am Königsfloß 6<br />
          55252 Mainz-Kastel<br />
          Deutschland
        </p>
        <p>
          Telefon:
          <a href="tel:+49 152 02148802">+49 152 02148802</a><br />
          E-Mail:
          <a href="mailto:info@mazariautovermietung.com">info@mazariautovermietung.com</a>
        </p>
        <!-- Optional: Datenschutzbeauftragter -->
        <!-- TODO: Nur verwenden, wenn vorhanden -->
        <p>Datenschutzanfragen können Sie an die oben genannten Kontaktdaten richten.</p>
      </section>

      <!-- 2. Allgemeine Hinweise -->
      <section class="card">
        <h2>2. Allgemeine Hinweise zur Datenverarbeitung</h2>
        <p>
          Wir verarbeiten personenbezogene Daten nur, soweit dies zur Bereitstellung einer
          funktionsfähigen Website, zur Durchführung von Buchungen und zur Erfüllung unserer
          vertraglichen und gesetzlichen Pflichten erforderlich ist.
        </p>
        <p>
          Personenbezogene Daten sind alle Informationen, die sich auf eine identifizierte oder
          identifizierbare natürliche Person beziehen (z.&nbsp;B. Name, Kontaktdaten,
          Buchungsdaten).
        </p>
        <p>Rechtsgrundlagen der Verarbeitung ergeben sich insbesondere aus Art. 6 Abs. 1 DSGVO:</p>
        <ul>
          <li>
            <strong>Art. 6 Abs. 1 lit. b DSGVO</strong> – zur Vertragserfüllung (z.&nbsp;B.
            Anbahnung und Durchführung von Mietverträgen)
          </li>
          <li>
            <strong>Art. 6 Abs. 1 lit. c DSGVO</strong> – zur Erfüllung rechtlicher Pflichten
            (z.&nbsp;B. steuerliche Aufbewahrungspflichten)
          </li>
          <li>
            <strong>Art. 6 Abs. 1 lit. f DSGVO</strong> – auf Basis unseres berechtigten Interesses
            (z.&nbsp;B. technische Sicherheit, Missbrauchsverhinderung)
          </li>
          <li>
            <strong>Art. 6 Abs. 1 lit. a DSGVO</strong> – auf Basis Ihrer Einwilligung (z.&nbsp;B.
            Newsletter oder bestimmte Tracking-Cookies, sofern eingesetzt)
          </li>
        </ul>
      </section>

      <!-- 3. Hosting & Logfiles -->
      <section class="card">
        <h2>3. Hosting und Server-Logfiles</h2>
        <p>
          Unsere Website wird bei einem externen Dienstleister gehostet (Hosting-Provider). Die
          Nutzung des Hosting-Providers erfolgt zur sicheren und effizienten Bereitstellung unseres
          Online-Angebots (berechtigtes Interesse nach Art. 6 Abs. 1 lit. f DSGVO).
        </p>
        <p>
          Der Hosting-Provider verarbeitet dabei u.&nbsp;a. folgende Daten in sogenannten Logfiles:
        </p>
        <ul>
          <li>IP-Adresse</li>
          <li>Datum und Uhrzeit des Zugriffs</li>
          <li>aufgerufene Seite/Datei</li>
          <li>übertragene Datenmenge</li>
          <li>verwendeter Browser und Betriebssystem</li>
          <li>Referrer-URL (zuvor besuchte Seite)</li>
        </ul>
        <p>
          Diese Daten werden verwendet, um die Sicherheit und Stabilität der Website zu
          gewährleisten und ggf. technische Probleme zu analysieren. Eine Zusammenführung mit
          anderen Datenquellen findet nicht statt. Die Logfiles werden in der Regel nach kurzer Zeit
          automatisch gelöscht, sofern keine weitere Aufbewahrung zu Beweiszwecken erforderlich ist.
        </p>
      </section>

      <!-- 4. Kontaktaufnahme -->
      <section class="card">
        <h2>4. Kontaktaufnahme (Kontaktformular, E-Mail, Telefon)</h2>
        <p>
          Wenn Sie uns per Kontaktformular, E-Mail oder Telefon kontaktieren, werden Ihre Angaben
          (z.&nbsp;B. Name, E-Mail-Adresse, Telefonnummer, Inhalt der Nachricht) zur Bearbeitung
          Ihrer Anfrage und für den Fall von Anschlussfragen verarbeitet.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen bzw.
          Vertragserfüllung), wenn Ihre Anfrage auf einen Vertrag abzielt, oder Art. 6 Abs. 1 lit. f
          DSGVO (berechtigtes Interesse), da wir ein Interesse an der Bearbeitung Ihrer Anfrage
          haben.
        </p>
        <p>
          Die Daten werden gelöscht, sobald sie für die Erreichung des Zweckes ihrer Verarbeitung
          nicht mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
        </p>
      </section>

      <!-- 5. Nutzerkonto & Buchungen -->
      <section class="card">
        <h2>5. Nutzerkonto und Buchungen</h2>
        <p>
          Wenn Sie ein Nutzerkonto anlegen oder eine Buchung vornehmen, verarbeiten wir die von
          Ihnen angegebenen Daten, z.&nbsp;B.:
        </p>
        <ul>
          <li>Stammdaten (Name, Adresse, Kontaktdaten)</li>
          <li>Zugangsdaten (E-Mail, Passwort – Passwort nur in gehashter Form)</li>
          <li>Führerscheindaten, soweit für die Vermietung erforderlich</li>
          <li>Buchungsdaten (ausgewähltes Fahrzeug, Mietzeitraum, Optionen wie Bringservice)</li>
          <li>
            Rechnungs- und Zahlungsinformationen (z.&nbsp;B. Rechnungsadresse, Zahlungsstatus)
          </li>
        </ul>
        <p>
          Die Verarbeitung erfolgt, um Buchungen durchzuführen, Nutzungsverträge zu erfüllen und
          ggf. gesetzliche Vorgaben einzuhalten (z.&nbsp;B. Aufbewahrungsfristen nach Handels- und
          Steuerrecht). Rechtsgrundlage ist Art. 6 Abs. 1 lit. b und lit. c DSGVO.
        </p>
        <p>
          Ohne Bereitstellung dieser Daten ist eine Nutzung unserer Buchungsfunktionen in der Regel
          nicht oder nur eingeschränkt möglich.
        </p>
      </section>

      <!-- 6. Zahlungsdienstleister (Stripe, vorbereitet) -->
      <section class="card">
        <h2>6. Zahlungsabwicklung (Stripe) – vorbereitet</h2>
        <p>
          Für die Zahlungsabwicklung können wir einen externen Zahlungsdienstleister einsetzen
          (z.&nbsp;B. Stripe). In diesem Fall werden Zahlungsdaten (z.&nbsp;B. Zahlungsart,
          Transaktionskennungen, Teile der Kartendaten) von Ihnen direkt an den
          Zahlungsdienstleister übermittelt.
        </p>
        <p>
          Wir selbst speichern in der Regel keine vollständigen Zahlungsdaten, sondern erhalten vom
          Zahlungsdienstleister nur Informationen über den Zahlungsstatus (erfolgreich,
          fehlgeschlagen, erstattet usw.), um die Buchung zuordnen und Verträge erfüllen zu können.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) und ggf. Art. 6 Abs. 1
          lit. f DSGVO (berechtigtes Interesse an einer sicheren Zahlungsabwicklung).
        </p>
        <!-- TODO: Konkreten Zahlungsdienstleister + Link zur Datenschutzerklärung ergänzen, sobald festgelegt -->
      </section>

      <!-- 7. E-Mail-Versand (Mailgun, vorbereitet) -->
      <section class="card">
        <h2>7. E-Mail-Versand (z. B. Buchungsbestätigungen)</h2>
        <p>
          Für den Versand von systembezogenen E-Mails (z.&nbsp;B. Buchungsbestätigungen, Hinweise zu
          Ihrer Reservierung) können wir einen externen E-Mail-Dienst nutzen (z.&nbsp;B. Mailgun).
        </p>
        <p>
          Dabei werden E-Mail-Adresse und ggf. weitere Kommunikationsdaten an diesen Dienstleister
          übermittelt. Der Einsatz erfolgt auf Basis unseres berechtigten Interesses an einem
          zuverlässigen E-Mail-Versand (Art. 6 Abs. 1 lit. f DSGVO) und zur Vertragserfüllung (Art.
          6 Abs. 1 lit. b DSGVO).
        </p>
        <!-- TODO: Konkreten Dienstleister + Datenschutzhinweis ergänzen -->
      </section>

      <!-- 8. Cookies & Tracking -->
      <section class="card">
        <h2>8. Cookies und Tracking</h2>
        <p>
          Unsere Website verwendet ggf. Cookies. Cookies sind kleine Textdateien, die auf Ihrem
          Gerät gespeichert werden und Informationen enthalten können, z.&nbsp;B. Session-IDs.
        </p>
        <p>
          Derzeit setzen wir vorrangig technisch notwendige Cookies ein (z.&nbsp;B. für
          Login/Session und Sicherheitsfunktionen), die für den Betrieb der Seite erforderlich sind.
          Rechtsgrundlage hierfür ist Art. 6 Abs. 1 lit. f DSGVO bzw. § 25 TTDSG.
        </p>
        <p>
          Sofern wir in Zukunft Analyse- oder Marketing-Cookies verwenden, werden wir Sie hierüber
          gesondert informieren und, sofern erforderlich, Ihre Einwilligung einholen (Art. 6 Abs. 1
          lit. a DSGVO / § 25 TTDSG).
        </p>
      </section>

      <!-- 9. Speicherdauer -->
      <section class="card">
        <h2>9. Speicherdauer</h2>
        <p>
          Wir speichern personenbezogene Daten nur so lange, wie es für die jeweiligen Zwecke
          erforderlich ist oder wie es gesetzliche Aufbewahrungspflichten vorsehen.
        </p>
        <ul>
          <li>
            Vertrags- und Buchungsdaten: in der Regel bis zum Ablauf gesetzlicher
            Aufbewahrungsfristen (z.&nbsp;B. 6–10 Jahre nach Handels- und Steuerrecht).
          </li>
          <li>
            Nutzungs- und Protokolldaten: in der Regel deutlich kürzer, sofern keine Sicherheits-
            oder Beweisgründe eine längere Aufbewahrung erfordern.
          </li>
        </ul>
      </section>

      <!-- 10. Rechte der betroffenen Personen -->
      <section class="card">
        <h2>10. Ihre Rechte als betroffene Person</h2>
        <p>
          Sie haben nach der DSGVO verschiedene Rechte im Zusammenhang mit der Verarbeitung Ihrer
          personenbezogenen Daten. Hierzu gehören insbesondere:
        </p>

        <ul>
          <li>
            <strong>Recht auf Auskunft</strong> (Art. 15 DSGVO) – Sie können Auskunft darüber
            verlangen, welche Daten wir über Sie verarbeiten.
          </li>
          <li>
            <strong>Recht auf Berichtigung</strong> (Art. 16 DSGVO) – Sie können die Berichtigung
            unrichtiger oder unvollständiger Daten verlangen.
          </li>
          <li>
            <strong>Recht auf Löschung</strong> (Art. 17 DSGVO) – Sie können unter bestimmten
            Voraussetzungen die Löschung Ihrer Daten verlangen.
          </li>
          <li><strong>Recht auf Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO).</li>
          <li>
            <strong>Recht auf Datenübertragbarkeit</strong> (Art. 20 DSGVO) – Sie können die
            Bereitstellung der Daten in einem strukturierten, gängigen und maschinenlesbaren Format
            verlangen.
          </li>
          <li>
            <strong>Recht auf Widerspruch</strong> (Art. 21 DSGVO) – Sie können aus Gründen, die
            sich aus Ihrer besonderen Situation ergeben, der Verarbeitung Ihrer Daten widersprechen,
            soweit diese auf Art. 6 Abs. 1 lit. e oder f DSGVO beruht.
          </li>
          <li>
            <strong>Recht auf Widerruf einer Einwilligung</strong> (Art. 7 Abs. 3 DSGVO) – Wenn wir
            Daten auf Basis Ihrer Einwilligung verarbeiten, können Sie diese Einwilligung jederzeit
            mit Wirkung für die Zukunft widerrufen.
          </li>
          <li>
            <strong>Beschwerderecht bei einer Aufsichtsbehörde</strong> (Art. 77 DSGVO) – Sie haben
            das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren, wenn Sie der
            Ansicht sind, dass die Verarbeitung Ihrer personenbezogenen Daten gegen die DSGVO
            verstößt.
          </li>
        </ul>

        <p>
          Zur Ausübung Ihrer Rechte können Sie sich jederzeit über die in Abschnitt 1 genannten
          Kontaktdaten an uns wenden.
        </p>
      </section>

      <!-- 11. Änderungen -->
      <section class="card">
        <h2>11. Änderungen dieser Datenschutzerklärung</h2>
        <p>
          Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen
          rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in der
          Datenschutzerklärung umzusetzen (z.&nbsp;B. Einführung neuer Funktionen).
        </p>
        <p>
          Für Ihren erneuten Besuch gilt dann die jeweils aktuelle Fassung dieser
          Datenschutzerklärung.
        </p>
        <p class="stand">
          <!-- TODO: Datum anpassen -->
          Stand: {{ new Date().getFullYear() }}
          <!-- einfache Anzeige des Jahres -->
        </p>
      </section>

      <section class="card note">
        <p>
          Hinweis: Diese Muster-Datenschutzerklärung stellt keine Rechtsberatung dar und sollte ggf.
          durch eine rechtsanwaltliche Prüfung an Ihr konkretes Geschäftsmodell angepasst werden.
        </p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.datenschutz-wrapper {
  max-width: 900px;
  margin: 0 auto;
  padding: 4rem 1.5rem 5rem;
  color: var(--mazari-text-dark);
}

.ds-head {
  text-align: left;
  margin-bottom: 2rem;
}

.ds-head h1 {
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

.card ul {
  padding-left: 1.3rem;
  margin: 0.4rem 0 0.4rem;
}

.card li {
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 0.3rem;
}

.card a {
  color: var(--mazari-primary);
  text-decoration: none;
  font-weight: 600;
}

.card a:hover {
  text-decoration: underline;
}

.stand {
  font-size: 0.85rem;
  color: #94a3b8;
}

.card.note {
  background: #f8fafc;
  border-style: dashed;
}

@media (max-width: 600px) {
  .datenschutz-wrapper {
    padding: 3rem 1rem 4rem;
  }

  .ds-head h1 {
    font-size: 1.6rem;
  }
}
</style>
