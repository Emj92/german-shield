'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login fehlgeschlagen')
        setLoading(false)
        return
      }

      router.push('/dashboard')
    } catch (err) {
      setError('Ein Fehler ist aufgetreten')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-[#22D6DD] shadow-lg shadow-[#22D6DD]/20">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">GermanFence</h1>
          <p className="text-muted-foreground">Admin Portal</p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-700">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Willkommen zurück</CardTitle>
            <CardDescription>
              Melde dich mit deinen Zugangsdaten an
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="kontakt@meindl-webdesign.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-slate-900/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-slate-900/50"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#22D6DD] hover:bg-[#1EBEC5]"
                disabled={loading}
              >
                {loading ? 'Wird geladen...' : 'Anmelden'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Noch kein Account? </span>
              <Link href="/register" className="text-[#22D6DD] hover:text-[#1EBEC5] font-medium">
                Jetzt registrieren
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2024 GermanFence. Alle Rechte vorbehalten.</p>
          <p className="mt-1">
            Made with ♥ by{' '}
            <a
              href="https://www.meindl-webdesign.de"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#22D6DD] hover:text-[#1EBEC5]"
            >
              Meindl Webdesign
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

