import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Shield, Globe, Filter, Badge as BadgeIcon, Settings, CheckCircle2, Zap, Lock, LogIn } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header/Nav */}
      <header className="fixed top-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-50 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image 
              src="/screenshots/logo_klein.png" 
              alt="German Shield" 
              width={40} 
              height={40}
              className="drop-shadow-md"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-[#22D6DD] to-[#F06292] bg-clip-text text-transparent">
              German Shield
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-[#22D6DD] transition">Features</a>
            <a href="#screenshots" className="text-slate-600 dark:text-slate-300 hover:text-[#22D6DD] transition">Screenshots</a>
            <a href="#pricing" className="text-slate-600 dark:text-slate-300 hover:text-[#22D6DD] transition">Preise</a>
            <Link href="/login">
              <Button variant="outline" className="border-[#22D6DD] text-[#22D6DD] hover:bg-[#22D6DD] hover:text-white">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            </Link>
            <Button className="bg-gradient-to-r from-[#22D6DD] to-[#F06292] hover:opacity-90 text-white">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center max-w-5xl">
          <Badge className="mb-6 bg-[#22D6DD]/10 text-[#22D6DD] border-[#22D6DD]/20 hover:bg-[#22D6DD]/20">
            🇩🇪 Made in Germany
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#22D6DD] via-[#F06292] to-[#F06292] bg-clip-text text-transparent leading-tight">
            German Shield
          </h1>
          <p className="text-2xl md:text-3xl text-slate-700 dark:text-slate-300 mb-4 font-semibold">
            Bestes WordPress Anti-Spam Plugin
          </p>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
            Schützt alle WordPress-Formulare vor Spam mit modernsten Techniken: Honeypot, Zeitstempel, GEO-Blocking, intelligente Phrasen-Erkennung und mehr.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" className="bg-gradient-to-r from-[#22D6DD] to-[#F06292] hover:opacity-90 text-white px-8 py-6 text-lg">
              <Download className="mr-2 h-5 w-5" />
              Plugin herunterladen
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-[#22D6DD] text-[#22D6DD] hover:bg-[#22D6DD]/10 px-8 py-6 text-lg">
              <Shield className="mr-2 h-5 w-5" />
              Live Demo
            </Button>
          </div>

          {/* Hero Image */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
            <Image 
              src="/screenshots/dashboard.png" 
              alt="German Shield Dashboard" 
              width={1200} 
              height={700}
              className="w-full"
              priority
            />
          </div>
        </div>
      </section>

      {/* Stats/Trust Section */}
      <section className="py-16 px-6 bg-white dark:bg-slate-900">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-[#22D6DD] mb-2">99.9%</div>
              <div className="text-slate-600 dark:text-slate-400">Spam-Block-Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#22D6DD] mb-2">0ms</div>
              <div className="text-slate-600 dark:text-slate-400">Performance-Impact</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#22D6DD] mb-2">100%</div>
              <div className="text-slate-600 dark:text-slate-400">DSGVO-konform</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#22D6DD] mb-2">24/7</div>
              <div className="text-slate-600 dark:text-slate-400">Schutz</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
              Leistungsstarke Features
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Alles was du brauchst, um deine WordPress-Site vor Spam zu schützen
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-[#22D6DD] transition-all hover:shadow-lg">
              <CardHeader>
                <Zap className="h-10 w-10 text-[#22D6DD] mb-2" />
                <CardTitle>Intelligenter Honeypot</CardTitle>
                <CardDescription>
                  Unsichtbare Spam-Falle die Bots automatisch erkennt und blockiert
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-[#22D6DD] transition-all hover:shadow-lg">
              <CardHeader>
                <CheckCircle2 className="h-10 w-10 text-[#22D6DD] mb-2" />
                <CardTitle>Zeitstempel-Validierung</CardTitle>
                <CardDescription>
                  Erkennt unnatürlich schnelle Bot-Submissions automatisch
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-[#22D6DD] transition-all hover:shadow-lg">
              <CardHeader>
                <Globe className="h-10 w-10 text-[#22D6DD] mb-2" />
                <CardTitle>GEO-Blocking</CardTitle>
                <CardDescription>
                  Blockiere gezielt Spam aus bestimmten Ländern mit einem Klick
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-[#22D6DD] transition-all hover:shadow-lg">
              <CardHeader>
                <Filter className="h-10 w-10 text-[#22D6DD] mb-2" />
                <CardTitle>Phrasen-Blocking</CardTitle>
                <CardDescription>
                  Filtere Spam-Keywords mit intelligenter Regex-Unterstützung
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-[#22D6DD] transition-all hover:shadow-lg">
              <CardHeader>
                <BadgeIcon className="h-10 w-10 text-[#22D6DD] mb-2" />
                <CardTitle>Badge-System</CardTitle>
                <CardDescription>
                  Zeige Besuchern dass deine Seite professionell geschützt ist
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-[#22D6DD] transition-all hover:shadow-lg">
              <CardHeader>
                <Settings className="h-10 w-10 text-[#22D6DD] mb-2" />
                <CardTitle>Live-Statistiken</CardTitle>
                <CardDescription>
                  Echtzeitüberwachung aller Anfragen mit detaillierten Analytics
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section id="screenshots" className="py-20 px-6 bg-white dark:bg-slate-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
              Screenshots
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Modernes Dashboard & intuitive Bedienung
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { src: "/screenshots/anti-spam.png", title: "Anti-Spam Einstellungen" },
              { src: "/screenshots/geo-blocking.png", title: "GEO-Blocking" },
              { src: "/screenshots/phrasen-blocking.png", title: "Phrasen-Blocking" },
              { src: "/screenshots/einstellungen-settings.png", title: "Einstellungen" },
              { src: "/screenshots/wordpress-spam.png", title: "WordPress Spam Blocker" },
              { src: "/screenshots/dashboard.png", title: "Dashboard" },
            ].map((screenshot, index) => (
              <div key={index} className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border-2 border-slate-200 dark:border-slate-700 hover:border-[#22D6DD]">
                <Image 
                  src={screenshot.src} 
                  alt={screenshot.title} 
                  width={600} 
                  height={400}
                  className="w-full group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <p className="text-white font-semibold text-lg">{screenshot.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
              Lifetime Lizenzen
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Einmalig zahlen, für immer nutzen 🎉
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Single */}
            <Card className="border-2 flex flex-col h-full">
              <CardHeader>
                <Badge className="w-fit mb-4 bg-slate-100 text-slate-700">Single</Badge>
                <CardTitle className="text-4xl">19€</CardTitle>
                <CardDescription className="text-lg mt-2">
                  <span className="font-semibold text-[#22D6DD]">Lifetime</span> · 1 Website
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 mb-6 flex-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD]" />
                    <span>Honeypot Protection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD]" />
                    <span>Zeitstempel-Check</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD]" />
                    <span>JavaScript-Check</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD]" />
                    <span>GEO-Blocking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD]" />
                    <span>Phrasen-Blocking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD]" />
                    <span>Live-Statistiken</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD]" />
                    <span>Lifetime Updates</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full border-[#22D6DD] text-[#22D6DD] hover:bg-[#22D6DD] hover:text-white">
                  <Download className="mr-2 h-4 w-4" />
                  Jetzt kaufen
                </Button>
              </CardContent>
            </Card>

            {/* Freelancer - Popular */}
            <Card className="border-4 border-[#22D6DD] relative shadow-xl scale-105 flex flex-col h-full">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-[#22D6DD] to-[#F06292] text-white px-4 py-1">
                  Beliebt
                </Badge>
              </div>
              <CardHeader>
                <Badge className="w-fit mb-4 bg-[#22D6DD]/10 text-[#22D6DD]">Freelancer</Badge>
                <CardTitle className="text-4xl">39€</CardTitle>
                <CardDescription className="text-lg mt-2">
                  <span className="font-semibold text-[#22D6DD]">Lifetime</span> · 5 Websites
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 mb-6 flex-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD]" />
                    <span className="font-semibold">Alles aus Single</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD]" />
                    <span className="font-semibold">Bis zu 5 Websites</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD]" />
                    <span>Priority Support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD]" />
                    <span>Client-Projekte erlaubt</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD]" />
                    <span>Lifetime Updates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD]" />
                    <span>Zugang zum Dashboard</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD]" />
                    <span>Rechnungen & Downloads</span>
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-[#22D6DD] to-[#F06292] hover:opacity-90 text-white">
                  Jetzt kaufen
                </Button>
              </CardContent>
            </Card>

            {/* Unlimited */}
            <Card className="border-2 border-[#F06292] flex flex-col h-full">
              <CardHeader>
                <Badge className="w-fit mb-4 bg-[#F06292]/10 text-[#F06292]">Unlimited</Badge>
                <CardTitle className="text-4xl">99€</CardTitle>
                <CardDescription className="text-lg mt-2">
                  <span className="font-semibold text-[#F06292]">Lifetime</span> · ∞ Websites
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 mb-6 flex-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#F06292]" />
                    <span className="font-semibold">Alles aus Freelancer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#F06292]" />
                    <span className="font-semibold">Unlimited Websites</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#F06292]" />
                    <span>White-Label Rechte</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#F06292]" />
                    <span>Reselling erlaubt</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#F06292]" />
                    <span>Dedicated Support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#F06292]" />
                    <span>Lifetime Updates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#F06292]" />
                    <span>ThemeForest-kompatibel</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full border-2 border-[#F06292] text-[#F06292] hover:bg-[#F06292] hover:text-white">
                  Jetzt kaufen
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-[#22D6DD] to-[#F06292]">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Bereit deine Website zu schützen?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Lifetime-Lizenz sichern und Spam für immer blockieren!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-[#22D6DD] hover:bg-slate-100 px-8 py-6 text-lg font-semibold">
              <Download className="mr-2 h-5 w-5" />
              Jetzt kaufen
            </Button>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg">
                <LogIn className="mr-2 h-5 w-5" />
                Zum Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-900 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image src="/screenshots/logo_klein.png" alt="German Shield" width={32} height={32} />
                <span className="font-bold text-lg">German Shield</span>
              </div>
              <p className="text-slate-400 text-sm">
                Das beste WordPress Anti-Spam Plugin aus Deutschland.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Produkt</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#features" className="hover:text-[#22D6DD]">Features</a></li>
                <li><a href="#screenshots" className="hover:text-[#22D6DD]">Screenshots</a></li>
                <li><a href="#pricing" className="hover:text-[#22D6DD]">Preise</a></li>
                <li><a href="#" className="hover:text-[#22D6DD]">Dokumentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Lizenz</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#pricing" className="hover:text-[#22D6DD]">Single (19€)</a></li>
                <li><a href="#pricing" className="hover:text-[#22D6DD]">Freelancer (39€)</a></li>
                <li><a href="#pricing" className="hover:text-[#22D6DD]">Unlimited (99€)</a></li>
                <li><a href="#" className="hover:text-[#22D6DD]">ThemeForest</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-[#22D6DD]">Impressum</a></li>
                <li><a href="#" className="hover:text-[#22D6DD]">Datenschutz</a></li>
                <li><a href="#" className="hover:text-[#22D6DD]">AGB</a></li>
                <li><a href="#" className="hover:text-[#22D6DD]">Lizenz</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>© 2024-2025 German Shield. Made with ❤️ in Germany 🇩🇪</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
