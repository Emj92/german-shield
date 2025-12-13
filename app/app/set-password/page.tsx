'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import Image from 'next/image'

function SetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const emailParam = searchParams.get('email')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState(emailParam || '')
  const [tokenValid, setTokenValid] = useState(false)

  // Token validieren und Email holen
  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setValidating(false)
        return
      }

      try {
        const res = await fetch('/api/auth/validate-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data = await res.json()
        
        if (data.valid && data.email) {
          setEmail(data.email)
          setTokenValid(true)
        } else {
          setTokenValid(false)
        }
      } catch (err) {
        console.error('Token validation error:', err)
        setTokenValid(false)
      } finally {
        setValidating(false)
      }
    }

    validateToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!token || !email) {
      setError('Ungültiger Link. Bitte fordere einen neuen an.')
      return
    }

    if (password.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen lang sein.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/login?message=password-set')
        }, 2000)
      } else {
        setError(data.error || 'Fehler beim Setzen des Passworts.')
      }
    } catch (err) {
      console.error(err)
      setError('Verbindungsfehler. Bitte versuche es erneut.')
    } finally {
      setLoading(false)
    }
  }

  // Loading State
  if (validating) {
    return (
      <div className="min-h-screen bg-[#F2F5F8] dark:bg-[#1A1F23] flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-[#d9dde1] dark:border-slate-700 bg-white dark:bg-[#1F2428]">
          <CardContent className="pt-10 pb-8 text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-[#22D6DD] animate-spin" />
            <p className="text-slate-600 dark:text-slate-400">Link wird überprüft...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Erfolg
  if (success) {
    return (
      <div className="min-h-screen bg-[#F2F5F8] dark:bg-[#1A1F23] flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-[#22D6DD] bg-white dark:bg-[#1F2428]">
          <CardContent className="pt-10 pb-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Passwort gesetzt!</h2>
            <p className="text-slate-600 dark:text-slate-400">Du wirst zum Login weitergeleitet...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Ungültiger Link
  if (!token || !tokenValid) {
    return (
      <div className="min-h-screen bg-[#F2F5F8] dark:bg-[#1A1F23] flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-[#d9dde1] dark:border-slate-700 bg-white dark:bg-[#1F2428]">
          <CardContent className="pt-10 pb-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#EC4899]/10 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-[#EC4899]" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Ungültiger Link</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Dieser Link ist ungültig oder abgelaufen. Bitte kontaktiere den Support.
            </p>
            <Button onClick={() => router.push('/login')} className="bg-[#22D6DD] hover:bg-[#22D6DD]/90 text-white">
              Zum Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Passwort-Formular
  return (
    <div className="min-h-screen bg-[#F2F5F8] dark:bg-[#1A1F23] flex items-center justify-center p-6">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#22D6DD]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#EC4899]/5 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 border-[#d9dde1] dark:border-slate-700 bg-white dark:bg-[#1F2428]">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image src="/germanfence_logo.png" alt="GermanFence" width={73} height={73} />
          </div>
          <CardTitle className="text-2xl text-slate-900 dark:text-white">Passwort festlegen</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Setze dein Passwort für <span className="text-[#22D6DD] font-medium">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Neues Passwort</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mindestens 8 Zeichen"
                  className="pl-10 pr-10 bg-white dark:bg-[#1A1F23] border-[#d9dde1] dark:border-slate-700 text-slate-900 dark:text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-slate-300">Passwort bestätigen</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Passwort wiederholen"
                  className="pl-10 bg-white dark:bg-[#1A1F23] border-[#d9dde1] dark:border-slate-700 text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-[9px] bg-[#EC4899]/10 border border-[#EC4899]/30">
                <p className="text-sm text-[#EC4899] flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#22D6DD] hover:bg-[#22D6DD]/90 text-white font-semibold transition-transform hover:-translate-y-0.5"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird gespeichert...
                </>
              ) : (
                'Passwort speichern'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F2F5F8] dark:bg-[#1A1F23] flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-[#22D6DD] animate-spin" />
      </div>
    }>
      <SetPasswordContent />
    </Suspense>
  )
}
