'use client'

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BuyButton } from "@/components/BuyButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Download, Shield, Globe, Filter, Badge as BadgeIcon, Settings, CheckCircle2, Zap, Lock, LogIn } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function Home() {
  const { t } = useLanguage()
  
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header/Nav */}
      <header className="fixed top-0 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-50 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Image 
              src="/germanfence_header_logo.png" 
              alt="GermanFence" 
              width={180} 
              height={40}
              className="drop-shadow-md"
            />
          </div>
          <nav className="hidden md:flex items-center gap-4">
            <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-[#22D6DD] transition">{t.features.title}</a>
            <a href="#screenshots" className="text-slate-600 dark:text-slate-300 hover:text-[#22D6DD] transition">Screenshots</a>
            <a href="#pricing" className="text-slate-600 dark:text-slate-300 hover:text-[#22D6DD] transition">{t.pricing.title}</a>
            <a href="https://portal.germanfence.de/login" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-2 border-[#22D6DD] text-[#22D6DD] hover:bg-transparent hover:border-[#22D6DD] hover:text-[#22D6DD]">
                <LogIn className="mr-2 h-4 w-4" />
                Portal Login
              </Button>
            </a>
            <a href="https://germanfence.de/downloads/germanfence-plugin.zip" download>
              <Button className="bg-[#22D6DD] text-white hover:bg-[#22D6DD] hover:text-white">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </a>
            <div className="flex items-center gap-1 ml-2 border-l border-slate-200 dark:border-slate-700 pl-4">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center max-w-5xl">
          <Badge className="mb-6 bg-[#22D6DD]/10 text-[#22D6DD] border-[#22D6DD]/20 flex items-center gap-2 w-fit mx-auto px-4 py-2">
            <Image src="/flags/de.svg" alt="DE" width={24} height={16} className="rounded-sm" />
            <span className="font-semibold">Made in Germany</span>
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-slate-900 dark:text-white leading-tight">
            GermanFence
          </h1>
          <p className="text-2xl md:text-3xl text-slate-700 dark:text-slate-300 mb-4 font-semibold">
            {t.hero.title}
          </p>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
            {t.hero.subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a href="https://germanfence.de/downloads/germanfence-plugin.zip" download>
              <Button size="lg" className="bg-[#22D6DD] text-white hover:bg-[#22D6DD] hover:text-white px-8 py-6 text-lg transition-transform hover:-translate-y-1">
                <Download className="mr-2 h-5 w-5" />
                {t.hero.cta}
              </Button>
            </a>
            <Button size="lg" variant="outline" className="border-2 border-[#22D6DD] text-[#22D6DD] hover:border-[#22D6DD] hover:text-[#22D6DD] px-8 py-6 text-lg transition-transform hover:-translate-y-1">
              <Shield className="mr-2 h-5 w-5" />
              {t.hero.learnMore}
            </Button>
          </div>

          {/* Hero Image */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-200 dark:border-slate-800">
            <Image 
              src="/screenshots/dashboard.png" 
              alt="GermanFence Dashboard" 
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
          <div className="space-y-8">
            {/* Erste Reihe: 4 Kennzahlen */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-[#22D6DD] mb-2">🛡️ 99.9%</div>
                <div className="text-slate-600 dark:text-slate-400">{t.stats.spamBlockRate}</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#22D6DD] mb-2">⚡ &lt; 3ms</div>
                <div className="text-slate-600 dark:text-slate-400">{t.stats.performance}</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#22D6DD] mb-2">✅ 100%</div>
                <div className="text-slate-600 dark:text-slate-400">{t.stats.gdpr}</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#22D6DD] mb-2">🇩🇪 100%</div>
                <div className="text-slate-600 dark:text-slate-400">{t.stats.hosted}</div>
              </div>
            </div>
            
            {/* Zweite Reihe: 4 Kennzahlen (gleichmäßig wie oben) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-[#22D6DD] mb-2">📧 300k+</div>
                <div className="text-slate-600 dark:text-slate-400">{t.stats.spamBlocked}</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#22D6DD] mb-2">😊 200+</div>
                <div className="text-slate-600 dark:text-slate-400">{t.stats.customers}</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#22D6DD] mb-2">🔒 24/7</div>
                <div className="text-slate-600 dark:text-slate-400">{t.stats.protection}</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#22D6DD] mb-2">🚀 100%</div>
                <div className="text-slate-600 dark:text-slate-400">Made in Germany</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
              {t.features.title}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              {t.features.subtitle}
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

            <Card className="border-2 hover:border-[#22D6DD] transition-all hover:shadow-lg">
              <CardHeader>
                <Zap className="h-10 w-10 text-[#22D6DD] mb-2" />
                <CardTitle>Bestes Preis-Leistungs-Verhältnis</CardTitle>
                <CardDescription>
                  Premium-Schutz ab 29€/Jahr - günstiger als die Konkurrenz
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-[#22D6DD] transition-all hover:shadow-lg">
              <CardHeader>
                <Shield className="h-10 w-10 text-[#22D6DD] mb-2" />
                <CardTitle>100% Made in Germany</CardTitle>
                <CardDescription>
                  Alle Daten werden ausschließlich in Deutschland verarbeitet & gespeichert
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-[#22D6DD] transition-all hover:shadow-lg">
              <CardHeader>
                <Lock className="h-10 w-10 text-[#22D6DD] mb-2" />
                <CardTitle>Ohne Captchas</CardTitle>
                <CardDescription>
                  Kein nerviges Captcha - deine User merken nichts vom Spam-Schutz
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
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <p className="text-white font-semibold text-lg">{screenshot.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 mb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
              Flexible Jahreslizenzen
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Faire Preise für professionellen Spam-Schutz 🛡️
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {/* FREE */}
            <Card className="border-2 border-slate-200 flex flex-col h-full">
              <CardHeader>
                <Badge className="w-fit mb-4 bg-slate-100 text-slate-700">FREE</Badge>
                <CardTitle className="text-4xl">0€</CardTitle>
                <CardDescription className="text-lg mt-2">
                  <span className="font-semibold text-slate-600">Freemium</span> · 1 Website
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 mb-6 flex-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-slate-500 flex-shrink-0" />
                    <span>Basis Honeypot (1 Feld)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-slate-500 flex-shrink-0" />
                    <span>Zeitstempel-Check</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-slate-500 flex-shrink-0" />
                    <span>JavaScript Bot-Scan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-slate-500 flex-shrink-0" />
                    <span>WP-Mail Blocker (An/Aus)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-slate-500 flex-shrink-0" />
                    <span>Kommentar-Blocker (An/Aus)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-slate-500 flex-shrink-0" />
                    <span>WP-Dashboard Clean-up</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-slate-500 flex-shrink-0" />
                    <span>Community Support</span>
                  </li>
                </ul>
                <a href="https://germanfence.de/downloads/germanfence-plugin.zip" download className="block">
                  <Button variant="outline" className="w-full border-slate-300 text-slate-700 hover:border-slate-300 hover:text-slate-700 transition-transform hover:-translate-y-1">
                    <Download className="mr-2 h-4 w-4" />
                    Kostenlos testen
                  </Button>
                </a>
              </CardContent>
            </Card>

            {/* SINGLE */}
            <Card className="border-2 flex flex-col h-full">
              <CardHeader className="text-center">
                <Badge className="w-fit mb-4 bg-[#22D6DD]/10 text-[#22D6DD] mx-auto">Single</Badge>
                <CardTitle className="text-4xl">29€</CardTitle>
                <CardDescription className="text-lg mt-2">
                  <span className="font-semibold text-[#22D6DD]">zzgl. Steuer</span> · 1 Website
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 mb-6 flex-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD] flex-shrink-0" />
                    <span className="font-semibold">Alles aus FREE</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD] flex-shrink-0" />
                    <span className="font-semibold">🏷️ White Label (Badge ausblenden)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD] flex-shrink-0" />
                    <span>Erweiterte Honeypot-Kontrolle</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD] flex-shrink-0" />
                    <span>User Agent Scan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD] flex-shrink-0" />
                    <span>GEO-Blocking (Premium)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD] flex-shrink-0" />
                    <span>Phrasen-Blocking (Regex)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD] flex-shrink-0" />
                    <span>URL-Limit (SEO-Spam)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD] flex-shrink-0" />
                    <span>Domain-Blocking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD] flex-shrink-0" />
                    <span>Tippgeschwindigkeit-Analyse</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD] flex-shrink-0" />
                    <span>Dashboard mit Statistiken</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD] flex-shrink-0" />
                    <span>Updates während Abo-Laufzeit</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD] flex-shrink-0" />
                    <span>Priority Support</span>
                  </li>
                </ul>
                <BuyButton 
                  packageType="single" 
                  price={29} 
                  variant="outline"
                  className="w-full border-[#22D6DD] text-[#22D6DD] hover:border-[#22D6DD] hover:text-[#22D6DD] transition-transform hover:-translate-y-1"
                />
              </CardContent>
            </Card>

            {/* FREELANCER - Popular */}
            <Card className="border-4 border-[#22D6DD] relative shadow-xl scale-105 flex flex-col h-full">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-[#22D6DD] text-white px-4 py-1">
                  ⭐ Beliebt
                </Badge>
              </div>
              <CardHeader className="text-center">
                <Badge className="w-fit mb-4 bg-[#22D6DD]/10 text-[#22D6DD] mx-auto">Freelancer</Badge>
                <CardTitle className="text-4xl">99€</CardTitle>
                <CardDescription className="text-lg mt-2">
                  <span className="font-semibold text-[#22D6DD]">zzgl. Steuer</span> · 5 Websites
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 mb-6 flex-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD] flex-shrink-0" />
                    <span className="font-semibold">Alles aus Single</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD] flex-shrink-0" />
                    <span className="font-semibold">Bis zu 5 Websites</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD] flex-shrink-0" />
                    <span>Erweiterte Honeypot-Kontrolle</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD] flex-shrink-0" />
                    <span>User Agent Scan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD] flex-shrink-0" />
                    <span>GEO-Blocking (Premium)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD] flex-shrink-0" />
                    <span>Phrasen-Blocking (Regex)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD] flex-shrink-0" />
                    <span>URL-Limit (SEO-Spam)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD] flex-shrink-0" />
                    <span>Domain-Blocking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD] flex-shrink-0" />
                    <span>Tippgeschwindigkeit-Analyse</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD] flex-shrink-0" />
                    <span>Erweiterte Dashboard-Statistiken</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD] flex-shrink-0" />
                    <span>Client-Projekte erlaubt</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#22D6DD] flex-shrink-0" />
                    <span>Priority Support</span>
                  </li>
                </ul>
                <BuyButton 
                  packageType="freelancer" 
                  price={99}
                  className="w-full bg-[#22D6DD] text-white hover:bg-[#22D6DD] hover:text-white transition-transform hover:-translate-y-1"
                />
              </CardContent>
            </Card>

            {/* AGENCY */}
            <Card className="border-2 border-[#F06292] flex flex-col h-full">
              <CardHeader className="text-center">
                <Badge className="w-fit mb-4 bg-[#F06292]/10 text-[#F06292] mx-auto">Agency</Badge>
                <CardTitle className="text-4xl">0.50€</CardTitle>
                <CardDescription className="text-lg mt-2">
                  <span className="font-semibold text-[#F06292]">zzgl. Steuer</span> · 25 Websites <span className="text-xs bg-red-500 text-white px-2 py-1 rounded ml-2">TEST</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 mb-6 flex-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#F06292] flex-shrink-0" />
                    <span className="font-semibold">Alles aus Freelancer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#F06292] flex-shrink-0" />
                    <span className="font-semibold">Bis zu 25 Websites</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#F06292] flex-shrink-0" />
                    <span>Erweiterte Honeypot-Kontrolle</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#F06292] flex-shrink-0" />
                    <span>User Agent Scan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#F06292] flex-shrink-0" />
                    <span>GEO-Blocking (Premium)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#F06292] flex-shrink-0" />
                    <span>Phrasen-Blocking (Regex)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#F06292] flex-shrink-0" />
                    <span>URL-Limit (SEO-Spam)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#F06292] flex-shrink-0" />
                    <span>Domain-Blocking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#F06292] flex-shrink-0" />
                    <span>Tippgeschwindigkeit-Analyse</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#F06292] flex-shrink-0" />
                    <span>Erweiterte Dashboard-Statistiken</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#F06292] flex-shrink-0" />
                    <span>White-Label Option</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#F06292] flex-shrink-0" />
                    <span>Bulk-Lizenz-Verwaltung</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#F06292] flex-shrink-0" />
                    <span>Dedicated Support</span>
                  </li>
                </ul>
                <BuyButton 
                  packageType="agency" 
                  price={0.50}
                  variant="outline"
                  className="w-full border-2 border-[#F06292] text-[#F06292] hover:border-[#F06292] hover:text-[#F06292] transition-transform hover:-translate-y-1"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-[#22D6DD]">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Bereit deine Website zu schützen?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Lifetime-Lizenz sichern und Spam für immer blockieren!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://germanfence.de/downloads/germanfence-plugin.zip" download>
              <Button size="lg" className="bg-white text-[#22D6DD] hover:bg-white hover:text-[#22D6DD] px-8 py-6 text-lg font-semibold transition-transform hover:-translate-y-1">
                <Download className="mr-2 h-5 w-5" />
                Jetzt kaufen
              </Button>
            </a>
            <a href="https://portal.germanfence.de/login" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-[#F06292] text-white hover:bg-[#F06292] hover:text-white px-8 py-6 text-lg shadow-lg transition-transform hover:-translate-y-1">
                <LogIn className="mr-2 h-5 w-5" />
                Zum Portal
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 bg-slate-900 text-white">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <Image src="/germanfence_icon.png" alt="GermanFence" width={64} height={64} />
              </div>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Das beste WordPress Anti-Spam Plugin aus Deutschland. Schützt deine Website mit modernsten Techniken vor Spam und bösartigen Anfragen.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-[#22D6DD] flex items-center justify-center transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-[#22D6DD] flex items-center justify-center transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-[#22D6DD] flex items-center justify-center transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-6 text-white">Produkt</h3>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#features" className="hover:text-[#22D6DD] transition">Features</a></li>
                <li><a href="#screenshots" className="hover:text-[#22D6DD] transition">Screenshots</a></li>
                <li><a href="#pricing" className="hover:text-[#22D6DD] transition">Preise</a></li>
                <li><a href="#" className="hover:text-[#22D6DD] transition">Dokumentation</a></li>
                <li><a href="#" className="hover:text-[#22D6DD] transition">Changelog</a></li>
                <li><a href="#" className="hover:text-[#22D6DD] transition">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-6 text-white">Lizenzen</h3>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#pricing" className="hover:text-[#22D6DD] transition">Single (29€ zzgl. Steuer)</a></li>
                <li><a href="#pricing" className="hover:text-[#22D6DD] transition">Freelancer (99€ zzgl. Steuer)</a></li>
                <li><a href="#pricing" className="hover:text-[#22D6DD] transition">Agency (299€ zzgl. Steuer)</a></li>
                <li><a href="#" className="hover:text-[#22D6DD] transition">ThemeForest</a></li>
                <li><a href="#" className="hover:text-[#22D6DD] transition">WordPress.org</a></li>
                <li><Link href="/login" className="hover:text-[#22D6DD] transition">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-6 text-white">Support & Legal</h3>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-[#22D6DD] transition">Support Center</a></li>
                <li><a href="#" className="hover:text-[#22D6DD] transition">FAQ</a></li>
                <li><a href="#" className="hover:text-[#22D6DD] transition">Kontakt</a></li>
                <li><Link href="/impressum" className="hover:text-[#22D6DD] transition">Impressum</Link></li>
                <li><Link href="/datenschutz" className="hover:text-[#22D6DD] transition">Datenschutz</Link></li>
                <li><Link href="/agb" className="hover:text-[#22D6DD] transition">AGB</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-400">© 2024-2025 GermanFence. Alle Rechte vorbehalten.</p>
              <div className="flex items-center gap-2 text-slate-400">
                <span>Made with</span>
                <a href="https://meindl-webdesign.de" target="_blank" rel="noopener noreferrer" className="text-[#F06292] hover:text-[#F06292]/80 transition">
                  ❤️
                </a>
                <span className="flex items-center gap-1">in Germany <Image src="/flags/de.svg" alt="DE" width={16} height={11} className="inline rounded-sm" /> by</span>
                <a href="https://meindl-webdesign.de" target="_blank" rel="noopener noreferrer" className="text-[#22D6DD] hover:text-[#22D6DD]/80 transition font-semibold">
                  Meindl Webdesign
                </a>
              </div>
            </div>
            <div className="text-center text-sm text-slate-500">
              💶 Alle Preise verstehen sich zzgl. der gesetzlichen Mehrwertsteuer | All prices plus VAT
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
