'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Download, Mail, Copy, Check, Key, ExternalLink } from 'lucide-react'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const packageType = searchParams.get('package')
  const licenseKey = searchParams.get('key')
  const email = searchParams.get('email')
  
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    if (licenseKey) {
      navigator.clipboard.writeText(licenseKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const packageNames: { [key: string]: string } = {
    'single': 'Single',
    'freelancer': 'Freelancer',
    'agency': 'Agency',
    'SINGLE': 'Single',
    'FREELANCER': 'Freelancer',
    'AGENCY': 'Agency',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
      {/* Background Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#22D6DD]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Card className="max-w-2xl w-full border-2 border-[#22D6DD] bg-slate-900/80 backdrop-blur relative z-10">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <CardTitle className="text-3xl text-white">
            🎉 Zahlung erfolgreich!
          </CardTitle>
          <p className="text-lg text-slate-400 mt-2">
            Vielen Dank für deinen Kauf von <span className="text-[#22D6DD] font-semibold">GermanFence {packageNames[packageType || ''] || packageType}</span>!
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Lizenzschlüssel Box */}
          {licenseKey && (
            <div className="bg-gradient-to-r from-[#22D6DD]/10 to-[#22D6DD]/5 border-2 border-[#22D6DD] rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Key className="w-5 h-5 text-[#22D6DD]" />
                <span className="text-sm font-medium text-slate-400">Dein Lizenzschlüssel:</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <code className="text-xl md:text-2xl font-mono font-bold text-[#22D6DD] tracking-wider break-all">
                  {licenseKey}
                </code>
                <button
                  onClick={copyToClipboard}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                  title="Kopieren"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-slate-400" />
                  )}
                </button>
              </div>
              {copied && (
                <p className="text-sm text-green-500 mt-2">✓ Kopiert!</p>
              )}
            </div>
          )}

          {/* E-Mail Hinweis */}
          <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-[#22D6DD]/10">
                <Mail className="w-6 h-6 text-[#22D6DD]" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">E-Mail gesendet!</h3>
                <p className="text-slate-400 text-sm">
                  Wir haben dir eine E-Mail an{' '}
                  {email ? (
                    <span className="text-[#22D6DD]">{decodeURIComponent(email)}</span>
                  ) : (
                    'deine E-Mail-Adresse'
                  )}{' '}
                  gesendet mit:
                </p>
                <ul className="text-slate-400 text-sm mt-2 space-y-1">
                  <li>✓ Deinem Lizenzschlüssel</li>
                  <li>✓ Link zum Passwort setzen</li>
                  <li>✓ Anleitung zur Installation</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Nächste Schritte */}
          <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              🚀 Nächste Schritte:
            </h3>
            <ol className="space-y-3 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#22D6DD] text-slate-900 flex items-center justify-center text-sm font-bold">1</span>
                <span><strong>E-Mail prüfen:</strong> Klicke auf den Link in der E-Mail, um dein Passwort zu setzen.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#22D6DD] text-slate-900 flex items-center justify-center text-sm font-bold">2</span>
                <span><strong>Plugin downloaden:</strong> Lade das Plugin herunter und installiere es in WordPress.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#22D6DD] text-slate-900 flex items-center justify-center text-sm font-bold">3</span>
                <span><strong>Lizenz aktivieren:</strong> Gehe zu GermanFence → Lizenz und gib deinen Schlüssel ein.</span>
              </li>
            </ol>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="https://germanfence.de/downloads/germanfence-plugin.zip" download className="flex-1">
              <Button className="w-full bg-[#22D6DD] hover:bg-[#1EBEC5] text-slate-900 font-semibold h-12">
                <Download className="mr-2 h-5 w-5" />
                Plugin herunterladen
              </Button>
            </a>
            <Link href="https://portal.germanfence.de/login" className="flex-1">
              <Button variant="outline" className="w-full border-[#22D6DD] text-[#22D6DD] hover:bg-[#22D6DD]/10 h-12">
                <ExternalLink className="mr-2 h-5 w-5" />
                Zum Dashboard
              </Button>
            </Link>
          </div>

          <p className="text-sm text-center text-slate-500">
            Bei Fragen erreichst du uns unter:{' '}
            <a href="mailto:support@germanfence.de" className="text-[#22D6DD] hover:underline">
              support@germanfence.de
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#22D6DD]"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}

