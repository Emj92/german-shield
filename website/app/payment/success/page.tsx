'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Download, Mail } from 'lucide-react'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const packageType = searchParams.get('package')

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full border-2 border-[#22D6DD]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-[#22D6DD]/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-[#22D6DD]" />
          </div>
          <CardTitle className="text-3xl text-[#22D6DD]">
            Zahlung erfolgreich!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-lg text-slate-700 dark:text-slate-300">
              Vielen Dank für deinen Kauf von <strong>GermanFence {packageType}</strong>!
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Dein Lizenzschlüssel wurde an deine E-Mail-Adresse gesendet.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#22D6DD]" />
              Nächste Schritte:
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li>Prüfe dein E-Mail-Postfach (auch Spam-Ordner)</li>
              <li>Lade das Plugin herunter</li>
              <li>Installiere es in WordPress</li>
              <li>Aktiviere es mit deinem Lizenzschlüssel</li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <a href="https://germanfence.de/downloads/germanfence-plugin.zip" download className="flex-1">
              <Button className="w-full bg-[#22D6DD] text-white transition-transform hover:-translate-y-1">
                <Download className="mr-2 h-4 w-4" />
                Plugin herunterladen
              </Button>
            </a>
            <Link href="/login" className="flex-1">
              <Button variant="outline" className="w-full border-[#22D6DD] text-[#22D6DD] transition-transform hover:-translate-y-1">
                Zum Dashboard
              </Button>
            </Link>
          </div>

          <p className="text-sm text-center text-slate-500">
            Bei Fragen erreichst du uns unter: <a href="mailto:support@germanfence.de" className="text-[#22D6DD] hover:underline">support@germanfence.de</a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

