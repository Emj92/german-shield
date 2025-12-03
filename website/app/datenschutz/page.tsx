import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zur Startseite
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-4xl">Datenschutzerklärung</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none">
            <h2>1. Datenschutz auf einen Blick</h2>
            
            <h3>Allgemeine Hinweise</h3>
            <p>
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen 
              Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen 
              Sie persönlich identifiziert werden können. Ausführliche Informationen zum Thema Datenschutz 
              entnehmen Sie unserer unter diesem Text aufgeführten Datenschutzerklärung.
            </p>

            <h3>Hinweis zur verantwortlichen Stelle</h3>
            <p>
              Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:<br /><br />
              Erwin Meindl<br />
              German Fence<br />
              Oberensingerstr 70<br />
              72622 Nürtingen<br /><br />
              Telefon: 0151 222 62 199<br />
              E-Mail: support@germanfence.de
            </p>

            <h2>2. Hosting und Content Delivery Networks (CDN)</h2>
            <p>Wir hosten die Inhalte unserer Website bei folgendem Anbieter:</p>

            <h3>Externes Hosting</h3>
            <p>
              Diese Website wird extern gehostet. Die personenbezogenen Daten, die auf dieser Website erfasst 
              werden, werden auf den Servern des Hosters gespeichert. Hierbei kann es sich v. a. um IP-Adressen, 
              Kontaktanfragen, Meta- und Kommunikationsdaten, Vertragsdaten, Kontaktdaten, Namen, Websitezugriffe 
              und sonstige Daten, die über eine Website generiert werden, handeln.
            </p>
            <p>
              Das externe Hosting erfolgt zum Zwecke der Vertragserfüllung gegenüber unseren potenziellen und 
              bestehenden Kunden (Art. 6 Abs. 1 lit. b DSGVO) und im Interesse einer sicheren, schnellen und 
              effizienten Bereitstellung unseres Online-Angebots durch einen professionellen Anbieter 
              (Art. 6 Abs. 1 lit. f DSGVO).
            </p>
            <p>
              Wir setzen folgenden Hoster ein:<br /><br />
              Webgo GmbH<br />
              Wandsbeker Zollstr. 95<br />
              22041 Hamburg<br />
              Deutschland
            </p>

            <h4>Auftragsverarbeitung</h4>
            <p>
              Wir haben einen Vertrag über Auftragsverarbeitung (AVV) zur Nutzung des oben genannten Dienstes 
              geschlossen. Hierbei handelt es sich um einen datenschutzrechtlich vorgeschriebenen Vertrag, der 
              gewährleistet, dass dieser die personenbezogenen Daten unserer Websitebesucher nur nach unseren 
              Weisungen und unter Einhaltung der DSGVO verarbeitet.
            </p>

            <h3>Cloudflare</h3>
            <p>
              Wir nutzen den Service „Cloudflare". Anbieter ist die Cloudflare Inc., 101 Townsend St., 
              San Francisco, CA 94107, USA.
            </p>
            <p>
              Cloudflare bietet ein weltweit verteiltes Content Delivery Network mit DNS an. Der Einsatz von 
              Cloudflare beruht auf unserem berechtigten Interesse an einer möglichst fehlerfreien und sicheren 
              Bereitstellung unseres Webangebotes (Art. 6 Abs. 1 lit. f DSGVO).
            </p>
            <p>
              Details finden Sie hier: <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener">
              cloudflare.com/privacypolicy/</a>
            </p>

            <h2>3. Allgemeine Hinweise und Pflichtinformationen</h2>
            
            <h3>Datenschutz</h3>
            <p>
              Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln 
              Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften 
              sowie dieser Datenschutzerklärung.
            </p>
            <p>
              Wenn Sie diese Website benutzen, werden verschiedene personenbezogene Daten erhoben. Personenbezogene 
              Daten sind Daten, mit denen Sie persönlich identifiziert werden können. Die vorliegende 
              Datenschutzerklärung erläutert, welche Daten wir erheben und wofür wir sie nutzen.
            </p>
            <p>
              Wir weisen darauf hin, dass die Datenübertragung im Internet (z. B. bei der Kommunikation per E-Mail) 
              Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem Zugriff durch Dritte ist 
              nicht möglich.
            </p>

            <h3>Hinweis zur verantwortlichen Stelle</h3>
            <p>
              Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:<br /><br />
              Erwin Meindl<br />
              German Fence<br />
              Oberensingerstr 70<br />
              72622 Nürtingen<br /><br />
              Telefon: 0151 222 62 199<br />
              E-Mail: support@germanfence.de
            </p>

            <p>
              Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit 
              anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten (z. B. Namen, 
              E-Mail-Adressen o. Ä.) entscheidet.
            </p>

            <h3>Speicherdauer</h3>
            <p>
              Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde, verbleiben 
              Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt. Wenn Sie ein 
              berechtigtes Löschersuchen geltend machen oder eine Einwilligung zur Datenverarbeitung widerrufen, 
              werden Ihre Daten gelöscht, sofern wir keine anderen rechtlich zulässigen Gründe für die Speicherung 
              Ihrer personenbezogenen Daten haben.
            </p>

            <h3>Widerruf Ihrer Einwilligung zur Datenverarbeitung</h3>
            <p>
              Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Sie können 
              eine bereits erteilte Einwilligung jederzeit widerrufen. Die Rechtmäßigkeit der bis zum Widerruf 
              erfolgten Datenverarbeitung bleibt vom Widerruf unberührt.
            </p>

            <h3>SSL- bzw. TLS-Verschlüsselung</h3>
            <p>
              Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine 
              SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die 
              Adresszeile des Browsers von „http://" auf „https://" wechselt und an dem Schloss-Symbol in Ihrer 
              Browserzeile.
            </p>

            <h2>4. Datenerfassung auf dieser Website</h2>
            
            <h3>Server-Log-Dateien</h3>
            <p>
              Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten 
              Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:
            </p>
            <ul>
              <li>Browsertyp und Browserversion</li>
              <li>verwendetes Betriebssystem</li>
              <li>Referrer URL</li>
              <li>Hostname des zugreifenden Rechners</li>
              <li>Uhrzeit der Serveranfrage</li>
              <li>IP-Adresse</li>
            </ul>
            <p>
              Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. Die Erfassung 
              dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
            </p>

            <h3>Kontaktformular</h3>
            <p>
              Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular 
              inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall 
              von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
            </p>
            <p>
              Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre 
              Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder zur Durchführung vorvertraglicher 
              Maßnahmen erforderlich ist. In allen übrigen Fällen beruht die Verarbeitung auf unserem berechtigten 
              Interesse an der effektiven Bearbeitung der an uns gerichteten Anfragen (Art. 6 Abs. 1 lit. f DSGVO).
            </p>

            <h2>5. Analyse-Tools und Werbung</h2>
            <p>
              Wir verwenden keine Tracking- oder Analyse-Tools auf dieser Website. Ihre Privatsphäre ist uns wichtig.
            </p>

            <h2>6. Plugins und Tools</h2>
            <p>
              Diese Website verwendet keine Social-Media-Plugins oder externe Tracking-Tools.
            </p>

            <h2>7. Datenverarbeitung durch GermanFence WordPress Plugin</h2>
            
            <h3>Art und Umfang der Datenverarbeitung</h3>
            <p>
              Das GermanFence WordPress Plugin verarbeitet folgende Daten zum Schutz vor Spam und missbräuchlichen 
              Formulareinreichungen:
            </p>
            <ul>
              <li><strong>IP-Adressen:</strong> Zur Identifizierung und Blockierung von Spam-Quellen sowie für GEO-Blocking</li>
              <li><strong>Zeitstempel:</strong> Zur Erkennung automatisierter Bot-Submissions</li>
              <li><strong>User-Agent-Strings:</strong> Zur Identifizierung verdächtiger Browser/Bots</li>
              <li><strong>Formularinhalte:</strong> Temporäre Analyse auf Spam-Phrasen und Honeypot-Felder</li>
              <li><strong>GEO-Daten:</strong> Länderzuordnung basierend auf IP-Adresse (falls GEO-Blocking aktiviert)</li>
            </ul>

            <h3>Rechtsgrundlage</h3>
            <p>
              Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse). 
              Unser berechtigtes Interesse liegt im Schutz unserer Website vor Spam, Missbrauch und automatisierten 
              Angriffen sowie in der Gewährleistung der Funktionsfähigkeit unserer Kontaktformulare.
            </p>

            <h3>Speicherdauer</h3>
            <p>
              <strong>Blockierte Anfragen:</strong> IP-Adressen und Metadaten blockierter Spam-Versuche werden für 
              maximal 90 Tage in der WordPress-Datenbank gespeichert und danach automatisch gelöscht.
            </p>
            <p>
              <strong>Legitime Anfragen:</strong> Erfolgreich übermittelte Formulardaten werden gemäß der jeweiligen 
              Zweckbestimmung (z.B. Kontaktanfrage, Newsletter-Anmeldung) verarbeitet und gespeichert.
            </p>

            <h3>Datenweitergabe</h3>
            <p>
              Alle durch GermanFence verarbeiteten Daten verbleiben ausschließlich auf Ihrem WordPress-Server. 
              Es erfolgt <strong>keine Übermittlung</strong> an Dritte oder externe Server. Das Plugin arbeitet 
              vollständig lokal und DSGVO-konform.
            </p>

            <h3>Ihre Rechte</h3>
            <p>
              Sie haben jederzeit das Recht auf:
            </p>
            <ul>
              <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
              <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
              <li>Löschung Ihrer Daten (Art. 17 DSGVO)</li>
              <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
            </ul>
            <p>
              Zur Ausübung Ihrer Rechte wenden Sie sich bitte an: support@germanfence.de
            </p>

            <h2>8. Zahlungsabwicklung</h2>
            
            <h3>Mollie Payment Services</h3>
            <p>
              Für die Abwicklung von Zahlungen nutzen wir den Zahlungsdienstleister Mollie B.V., 
              Keizersgracht 313, 1016 EE Amsterdam, Niederlande.
            </p>
            <p>
              Bei Zahlungen über Mollie werden folgende Daten an Mollie übermittelt:
            </p>
            <ul>
              <li>Name und E-Mail-Adresse</li>
              <li>Rechnungsadresse</li>
              <li>Zahlungsinformationen (abhängig von der gewählten Zahlungsmethode)</li>
              <li>Bestelldetails und Betrag</li>
            </ul>
            <p>
              Die Datenverarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) 
              und Art. 6 Abs. 1 lit. c DSGVO (rechtliche Verpflichtung).
            </p>
            <p>
              Weitere Informationen zum Datenschutz bei Mollie finden Sie hier: 
              <a href="https://www.mollie.com/de/privacy" target="_blank" rel="noopener">
                mollie.com/de/privacy
              </a>
            </p>

            <h3>Speicherung von Zahlungsdaten</h3>
            <p>
              Wir speichern Ihre Zahlungsdaten (Transaktions-ID, Zahlungsstatus, Datum) für die gesetzlich 
              vorgeschriebene Aufbewahrungsfrist von 10 Jahren gemäß § 147 AO und § 257 HGB.
            </p>

            <h2>9. Widerrufsrecht und Rückgaberecht</h2>
            
            <h3>14-Tage-Widerrufsrecht</h3>
            <p>
              Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. 
              Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.
            </p>
            <p>
              Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (Erwin Meindl, German Fence, Oberensingerstr 70, 
              72622 Nürtingen, E-Mail: support@germanfence.de) mittels einer eindeutigen Erklärung 
              (z. B. ein mit der Post versandter Brief oder E-Mail) über Ihren Entschluss, diesen Vertrag zu 
              widerrufen, informieren.
            </p>
            <p>
              <strong>Wichtiger Hinweis:</strong> Das Widerrufsrecht erlischt vorzeitig, wenn Sie ausdrücklich 
              zugestimmt haben, dass wir mit der Ausführung des Vertrages vor Ablauf der Widerrufsfrist beginnen, 
              und Sie Ihre Kenntnis davon bestätigt haben, dass Sie durch Ihre Zustimmung mit Beginn der Ausführung 
              des Vertrages Ihr Widerrufsrecht verlieren. Dies gilt insbesondere für digitale Inhalte, die nicht 
              auf einem körperlichen Datenträger geliefert werden (Software-Downloads).
            </p>

            <h3>Folgen des Widerrufs</h3>
            <p>
              Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, 
              unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung 
              über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir 
              dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben.
            </p>
            <p>
              <strong>Nach Ablauf der 14-Tage-Frist:</strong> Nach Ablauf der Widerrufsfrist ist ein Widerruf 
              nicht mehr möglich. Gewährleistungsansprüche bleiben hiervon unberührt.
            </p>

            <h2>10. Hosting-Infrastruktur</h2>
            
            <h3>Hetzner Online GmbH</h3>
            <p>
              Unsere Server-Infrastruktur wird von Hetzner Online GmbH bereitgestellt:
            </p>
            <p>
              Hetzner Online GmbH<br />
              Industriestr. 25<br />
              91710 Gunzenhausen<br />
              Deutschland
            </p>
            <p>
              Die Server befinden sich ausschließlich in Deutschland. Es erfolgt keine Datenübermittlung in 
              Drittländer außerhalb der EU.
            </p>
            <p>
              Datenschutzerklärung von Hetzner: 
              <a href="https://www.hetzner.com/de/rechtliches/datenschutz" target="_blank" rel="noopener">
                hetzner.com/de/rechtliches/datenschutz
              </a>
            </p>

            <h3>Domain und E-Mail: Webgo GmbH</h3>
            <p>
              Unsere Domain und E-Mail-Dienste werden von Webgo GmbH bereitgestellt:
            </p>
            <p>
              Webgo GmbH<br />
              Wandsbeker Zollstr. 95<br />
              22041 Hamburg<br />
              Deutschland
            </p>
            <p>
              Datenschutzerklärung von Webgo: 
              <a href="https://www.webgo.de/datenschutz/" target="_blank" rel="noopener">
                webgo.de/datenschutz/
              </a>
            </p>

            <p className="mt-8 text-sm text-slate-500">
              Stand: Dezember 2024
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

