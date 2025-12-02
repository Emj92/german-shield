import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function ImpressumPage() {
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
            <CardTitle className="text-4xl">Impressum</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none">
            <h2>Angaben gemäß § 5 TMG</h2>
            <p>
              Erwin Meindl<br />
              German Fence<br />
              Oberensingerstraße 70<br />
              72622 Nürtingen
            </p>

            <h2>Kontakt</h2>
            <p>
              E-Mail: support@germanfence.de<br />
              Mobil: +49 (0) 151 222 62 199<br />
              Tel: +49 (0) 7022 263 57 55
            </p>

            <h2>Steuernummer</h2>
            <p>74307/17133</p>

            <h2>Umsatzsteuer-ID</h2>
            <p>
              Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
              DE323799140
            </p>

            <h2>Verbraucherstreitbeilegung</h2>
            <p>
              Unsere Leistungen richten sich an Unternehmer (§ 14 BGB). Wir sind nicht verpflichtet und – 
              sofern ausnahmsweise Verträge mit Verbrauchern geschlossen werden – auch nicht bereit, an 
              Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

