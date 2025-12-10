export default function AGBPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-20 px-6">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-slate-900 dark:text-white">
          Allgemeine Geschäftsbedingungen (AGB)
        </h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-8">
            Stand: Dezember 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">§ 1 Geltungsbereich</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge über den Erwerb und die Nutzung 
              der Software "GermanFence" (nachfolgend "Plugin" genannt) zwischen dem Betreiber GermanCore 
              (nachfolgend "Anbieter" genannt) und dem Kunden (nachfolgend "Lizenznehmer" genannt).
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              Mit dem Erwerb einer Lizenz erklärt sich der Lizenznehmer mit diesen AGB einverstanden.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">§ 2 Vertragsgegenstand</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Gegenstand des Vertrages ist die Gewährung einer nicht-exklusiven, zeitlich unbegrenzten Lizenz 
              (Lifetime-Lizenz) zur Nutzung des WordPress-Plugins "GermanFence".
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              Der Umfang der Nutzungsrechte richtet sich nach dem erworbenen Lizenzmodell (Single, Freelancer, Unlimited).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">§ 3 Lizenzmodelle</h2>
            
            <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">3.1 Single-Lizenz (19€)</h3>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Nutzung auf <strong>1 Domain/Website</strong></li>
              <li>Alle Standard-Features</li>
              <li>Lifetime Updates</li>
              <li>Support-Zugang</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">3.2 Freelancer-Lizenz (39€)</h3>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Nutzung auf <strong>bis zu 5 Domains/Websites</strong></li>
              <li>Alle Standard-Features</li>
              <li>Nutzung für Kundenprojekte erlaubt (kein Reselling!)</li>
              <li>Priority Support</li>
              <li>Lifetime Updates</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">3.3 Unlimited-Lizenz (99€)</h3>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Nutzung auf <strong>unbegrenzten Domains/Websites</strong></li>
              <li>Alle Premium-Features</li>
              <li>White-Label Option (Branding anpassbar)</li>
              <li>Nutzung für unbegrenzte Kundenprojekte (kein Reselling!)</li>
              <li>Dedicated Support</li>
              <li>Lifetime Updates</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">§ 4 Nutzungsrechte</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Der Lizenznehmer erhält ein nicht-exklusives, nicht übertragbares Nutzungsrecht am Plugin.
            </p>
            
            <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">4.1 Erlaubte Nutzung</h3>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Installation und Nutzung auf der lizenzierten Anzahl von Websites</li>
              <li>Erstellung von Backup-Kopien für eigene Zwecke</li>
              <li>Anpassung für eigene Projekte (Code-Modifikationen)</li>
              <li>Nutzung für Kundenprojekte (bei Freelancer/Unlimited Lizenz)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">4.2 Untersagte Nutzung</h3>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li><strong>❌ Reselling:</strong> Weiterverkauf des Plugins an Dritte ist VERBOTEN</li>
              <li><strong>❌ Redistribution:</strong> Weitergabe, Veröffentlichung oder Verteilung des Plugins</li>
              <li><strong>❌ Sub-Lizenzierung:</strong> Vergabe von Unterlizenzen</li>
              <li><strong>❌ SaaS-Nutzung:</strong> Anbieten als Cloud-Service ohne separate Lizenz</li>
              <li><strong>❌ Marktplatz-Verkauf:</strong> Verkauf über ThemeForest, CodeCanyon etc. ohne Genehmigung</li>
              <li>Reverse Engineering, Dekompilierung (außer gesetzlich erlaubt)</li>
              <li>Entfernung von Copyright-Hinweisen</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">§ 5 Reselling-Verbot & Rechtsverfolgung</h2>
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-6 mb-4">
              <h3 className="text-xl font-semibold mb-3 text-red-900 dark:text-red-300">⚠️ WICHTIG: Reselling ist VERBOTEN</h3>
              <p className="text-red-800 dark:text-red-200 mb-3">
                Der Weiterverkauf (Reselling) des Plugins "GermanFence" ist <strong>ausdrücklich untersagt</strong> 
                und stellt einen schwerwiegenden Verstoß gegen diese AGB dar.
              </p>
            </div>

            <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">5.1 Was gilt als Reselling?</h3>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Verkauf des Plugins als eigenständiges Produkt</li>
              <li>Bundling mit anderen Produkten ohne Genehmigung</li>
              <li>Anbieten auf Marktplätzen (ThemeForest, CodeCanyon, etc.)</li>
              <li>Vertrieb über eigene oder fremde Plattformen</li>
              <li>Bereitstellung als Download auf eigener Website</li>
              <li>Verkauf von Lizenzen an Dritte</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">5.2 Rechtliche Konsequenzen bei Verstößen</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Bei Verstößen gegen das Reselling-Verbot behält sich der Anbieter folgende Maßnahmen vor:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li><strong>Sofortige Lizenzkündigung</strong> ohne Rückerstattung</li>
              <li><strong>Vertragsstrafe:</strong> Bis zu 5.000€ pro Verstoß</li>
              <li><strong>Schadensersatzforderungen</strong> bei nachweisbarem wirtschaftlichem Schaden</li>
              <li><strong>Einstweilige Verfügung</strong> zur sofortigen Unterlassung</li>
              <li><strong>Strafanzeige</strong> wegen Urheberrechtsverletzung (§ 106 UrhG)</li>
              <li><strong>Anwaltskosten:</strong> Übernahme durch den Verletzer</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">5.3 Überwachung & Durchsetzung</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Der Anbieter überwacht aktiv:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Marktplätze (ThemeForest, CodeCanyon, Envato, etc.)</li>
              <li>WordPress-Plugin-Verzeichnisse</li>
              <li>Download-Portale und Torrent-Sites</li>
              <li>Social Media und Forum-Angebote</li>
              <li>Verdächtige Lizenz-Aktivierungen</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">§ 6 Updates & Support</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Alle Lizenzen beinhalten <strong>kostenlose Lifetime Updates</strong>. Der Anbieter ist jedoch nicht 
              verpflichtet, Updates bereitzustellen.
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              Support wird per E-Mail (<a href="mailto:support@germanfence.de" className="text-[#22D6DD] hover:underline">support@germanfence.de</a>) 
              geleistet. Reaktionszeiten variieren je nach Lizenzmodell.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">§ 7 Haftung & Gewährleistung</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Das Plugin wird "as is" (wie besehen) bereitgestellt. Der Anbieter übernimmt keine Gewährleistung 
              für Fehlerfreiheit, Verfügbarkeit oder Eignung für einen bestimmten Zweck.
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              Die Haftung ist auf Vorsatz und grobe Fahrlässigkeit beschränkt. Eine Haftung für entgangenen 
              Gewinn, Datenverlust oder indirekte Schäden ist ausgeschlossen, soweit gesetzlich zulässig.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">§ 8 Datenschutz</h2>
            <p className="text-slate-700 dark:text-slate-300">
              Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer{" "}
              <a href="/datenschutz" className="text-[#22D6DD] hover:underline">Datenschutzerklärung</a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">§ 9 Kündigung</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Die Lizenz ist zeitlich unbegrenzt (Lifetime). Sie endet nur durch:
            </p>
            <ul className="list-disc pl-6 mb-4 text-slate-700 dark:text-slate-300 space-y-2">
              <li>Verstoß gegen diese AGB (sofortige Kündigung durch Anbieter)</li>
              <li>Verzicht des Lizenznehmers (ohne Rückerstattung)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">§ 10 Schlussbestimmungen</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist der Sitz des Anbieters.
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">§ 11 Kontakt & Meldung von Verstößen</h2>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6">
              <p className="text-slate-700 dark:text-slate-300 mb-3">
                <strong>Meindl Webdesign</strong><br />
                Erwin Meindl<br />
              </p>
              <p className="text-slate-700 dark:text-slate-300 mb-3">
                Support: <a href="mailto:support@germanfence.de" className="text-[#22D6DD] hover:underline">support@germanfence.de</a><br />
                Rechtsverstöße: <a href="mailto:legal@germanfence.de" className="text-[#22D6DD] hover:underline">legal@germanfence.de</a>
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                <strong>Verdacht auf illegales Reselling?</strong><br />
                Melden Sie Verstöße direkt an: <a href="mailto:legal@germanfence.de" className="text-[#22D6DD] hover:underline font-semibold">legal@germanfence.de</a>
              </p>
            </div>
          </section>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-8 pt-8 border-t border-slate-300 dark:border-slate-700">
            © 2024-2025 GermanFence by Meindl Webdesign. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </div>
  );
}

