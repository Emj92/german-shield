'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Kein Verifizierungs-Token gefunden')
      return
    }

    // Verifiziere Token
    fetch(`/api/auth/verify-email?token=${token}`)
      .then(async (res) => {
        if (res.redirected) {
          // Erfolgreiche Verifizierung -> Redirect zum Dashboard
          window.location.href = res.url
          return
        }
        
        const data = await res.json()
        
        if (res.ok) {
          setStatus('success')
          setMessage('E-Mail erfolgreich bestätigt! Du wirst weitergeleitet...')
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        } else {
          setStatus('error')
          setMessage(data.error || 'Verifizierung fehlgeschlagen')
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('Ein Fehler ist aufgetreten')
      })
  }, [token, router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-primary shadow-lg shadow-primary/20">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">German Fence</h1>
          <p className="text-muted-foreground">E-Mail-Verifizierung</p>
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              {status === 'loading' && (
                <>
                  <Loader2 className="h-6 w-6 animate-spin text-[#22D6DD]" />
                  <span>Verifiziere E-Mail...</span>
                </>
              )}
              {status === 'success' && (
                <>
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <span className="text-green-600">Erfolgreich!</span>
                </>
              )}
              {status === 'error' && (
                <>
                  <XCircle className="h-6 w-6 text-red-600" />
                  <span className="text-red-600">Fehler</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">{message}</p>

            {status === 'error' && (
              <div className="space-y-2">
                <Button asChild className="w-full" variant="outline">
                  <Link href="/login">Zur Anmeldung</Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/register">Neu registrieren</Link>
                </Button>
              </div>
            )}

            {status === 'success' && (
              <Button asChild className="w-full bg-[#22D6DD] hover:bg-[#1EBEC5]">
                <Link href="/dashboard">Zum Dashboard</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2024 German Fence. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </div>
  )
}

