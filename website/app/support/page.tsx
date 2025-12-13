'use client'

import { useState } from 'react'
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ThemeToggle } from "@/components/ThemeToggle"
import { 
  ArrowLeft, 
  Send, 
  Book, 
  HelpCircle, 
  MessageSquare, 
  Download,
  Settings,
  Shield,
  Globe,
  Zap,
  LogIn,
  ChevronRight,
  Mail,
  Phone,
  Clock
} from "lucide-react"

const sidebarItems = [
  {
    title: 'Erste Schritte',
    icon: Download,
    items: [
      { title: 'Installation', href: '#installation' },
      { title: 'Aktivierung', href: '#aktivierung' },
      { title: 'Grundkonfiguration', href: '#grundkonfiguration' },
    ]
  },
  {
    title: 'Features',
    icon: Zap,
    items: [
      { title: 'Honeypot', href: '#honeypot' },
      { title: 'GEO-Blocking', href: '#geo-blocking' },
      { title: 'Phrasen-Blocking', href: '#phrasen-blocking' },
      { title: 'E-Mail-Schutz', href: '#email-schutz' },
      { title: 'WordPress-Firewall', href: '#firewall' },
    ]
  },
  {
    title: 'Einstellungen',
    icon: Settings,
    items: [
      { title: 'Badge anpassen', href: '#badge' },
      { title: 'Performance', href: '#performance' },
      { title: 'API-Key Verwaltung', href: '#apikey' },
    ]
  },
  {
    title: 'FAQ',
    icon: HelpCircle,
    items: [
      { title: 'Häufige Fragen', href: '#faq' },
      { title: 'Fehlerbehebung', href: '#fehlerbehebung' },
    ]
  },
]

export default function SupportPage() {
  const [activeSection, setActiveSection] = useState('installation')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    // Hier würde die Ticket-Erstellung implementiert
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('Ticket erfolgreich erstellt! Wir melden uns innerhalb von 24 Stunden.')
    setFormData({ name: '', email: '', subject: '', message: '' })
    setSending(false)
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image 
              src="/germanfence_header_logo.png" 
              alt="GermanFence" 
              width={150} 
              height={35}
            />
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Startseite
              </Button>
            </Link>
            <a href="https://portal.germanfence.de/login" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="border-[#22D6DD] text-[#22D6DD]">
                <LogIn className="mr-2 h-4 w-4" />
                Portal
              </Button>
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
          <div className="p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Book className="h-5 w-5 text-[#22D6DD]" />
              Dokumentation
            </h2>
            <nav className="space-y-4">
              {sidebarItems.map((section) => (
                <div key={section.title}>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    <section.icon className="h-4 w-4" />
                    {section.title}
                  </div>
                  <ul className="space-y-1 ml-6">
                    {section.items.map((item) => (
                      <li key={item.title}>
                        <a 
                          href={item.href}
                          onClick={() => setActiveSection(item.href.replace('#', ''))}
                          className={`flex items-center gap-2 text-sm py-1.5 px-2 rounded-md transition-colors ${
                            activeSection === item.href.replace('#', '')
                              ? 'bg-[#22D6DD]/10 text-[#22D6DD] font-medium'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <ChevronRight className="h-3 w-3" />
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 max-w-4xl">
          {/* Hero */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
              Support & Dokumentation
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Alles was du brauchst, um GermanFence optimal zu nutzen
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            <Card className="hover:border-[#22D6DD] transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <Download className="h-8 w-8 text-[#22D6DD] mb-2" />
                <CardTitle className="text-lg">Schnellstart</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Plugin herunterladen und in 2 Minuten loslegen</CardDescription>
              </CardContent>
            </Card>
            <Card className="hover:border-[#22D6DD] transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <HelpCircle className="h-8 w-8 text-[#22D6DD] mb-2" />
                <CardTitle className="text-lg">FAQ</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Antworten auf die häufigsten Fragen</CardDescription>
              </CardContent>
            </Card>
            <Card className="hover:border-[#22D6DD] transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <MessageSquare className="h-8 w-8 text-[#22D6DD] mb-2" />
                <CardTitle className="text-lg">Ticket öffnen</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Persönliche Hilfe von unserem Team</CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Dokumentation Sections */}
          <div className="space-y-12">
            <section id="installation">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-[#22D6DD]" />
                    Installation
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                  <ol>
                    <li>Lade das Plugin von <a href="https://germanfence.de/downloads/germanfence-plugin.zip" className="text-[#22D6DD]">germanfence.de</a> herunter</li>
                    <li>Gehe in WordPress zu <strong>Plugins → Installieren → Plugin hochladen</strong></li>
                    <li>Wähle die ZIP-Datei aus und klicke auf <strong>Jetzt installieren</strong></li>
                    <li>Aktiviere das Plugin nach der Installation</li>
                  </ol>
                </CardContent>
              </Card>
            </section>

            <section id="aktivierung">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-[#22D6DD]" />
                    Aktivierung
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                  <p>Nach der Installation hast du zwei Optionen:</p>
                  <ul>
                    <li><strong>Kostenlose Version:</strong> Gib deine E-Mail-Adresse ein und erhalte einen kostenlosen API-Key</li>
                    <li><strong>PRO Version:</strong> Kaufe einen API-Key und gib ihn ein</li>
                  </ul>
                  <p>Dein API-Key wird automatisch mit deiner Domain verknüpft.</p>
                </CardContent>
              </Card>
            </section>

            <section id="honeypot">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-[#22D6DD]" />
                    Honeypot
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                  <p>Der Honeypot ist eine unsichtbare Spam-Falle:</p>
                  <ul>
                    <li>Unsichtbare Felder werden zu deinen Formularen hinzugefügt</li>
                    <li>Menschen sehen diese Felder nicht und füllen sie nicht aus</li>
                    <li>Bots füllen automatisch alle Felder aus und werden erkannt</li>
                  </ul>
                  <p>Du kannst die Anzahl der Honeypot-Felder (1-10) und deren Namen anpassen.</p>
                </CardContent>
              </Card>
            </section>

            <section id="geo-blocking">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-[#22D6DD]" />
                    GEO-Blocking
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-slate dark:prose-invert max-w-none">
                  <p>Blockiere Spam aus bestimmten Ländern:</p>
                  <ul>
                    <li><strong>Blacklist-Modus:</strong> Ausgewählte Länder werden blockiert</li>
                    <li><strong>Whitelist-Modus:</strong> Nur ausgewählte Länder sind erlaubt</li>
                  </ul>
                  <p>Klicke einfach auf die Länder in der interaktiven Karte, um sie auszuwählen.</p>
                </CardContent>
              </Card>
            </section>

            {/* Kontakt-Formular */}
            <section id="ticket">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-[#22D6DD]" />
                    Support-Ticket erstellen
                  </CardTitle>
                  <CardDescription>
                    Hast du eine Frage oder ein Problem? Wir helfen dir gerne!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Name</label>
                        <Input 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Dein Name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">E-Mail</label>
                        <Input 
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="deine@email.de"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Betreff</label>
                      <Input 
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        placeholder="Worum geht es?"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Nachricht</label>
                      <Textarea 
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        placeholder="Beschreibe dein Anliegen..."
                        rows={5}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-[#22D6DD] hover:bg-[#1BA8B0]"
                      disabled={sending}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {sending ? 'Wird gesendet...' : 'Ticket absenden'}
                    </Button>
                  </form>

                  <div className="mt-8 pt-6 border-t grid md:grid-cols-3 gap-4 text-center">
                    <div>
                      <Mail className="h-6 w-6 text-[#22D6DD] mx-auto mb-2" />
                      <p className="text-sm font-medium">E-Mail</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">support@germanfence.de</p>
                    </div>
                    <div>
                      <Phone className="h-6 w-6 text-[#22D6DD] mx-auto mb-2" />
                      <p className="text-sm font-medium">Telefon</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">+49 151 222 62 199</p>
                    </div>
                    <div>
                      <Clock className="h-6 w-6 text-[#22D6DD] mx-auto mb-2" />
                      <p className="text-sm font-medium">Antwortzeit</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Innerhalb 24h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

