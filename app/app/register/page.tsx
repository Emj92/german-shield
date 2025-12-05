'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Eye, EyeOff, Check, X } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import { AnimatedBackground } from '@/components/AnimatedBackground'

type PasswordStrength = 'weak' | 'medium' | 'strong' | 'very-strong'

export default function RegisterPage() {
  const { addToast } = useToast()
  const searchParams = useSearchParams()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('weak')
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null)

  // Email aus Query-Parameter vorausfüllen
  useEffect(() => {
    const emailParam = searchParams?.get('email')
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
  }, [searchParams])

  // Passwort-Stärke berechnen
  useEffect(() => {
    if (password.length === 0) {
      setPasswordStrength('weak')
      return
    }

    let strength = 0
    
    // Länge
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    
    // Großbuchstaben
    if (/[A-Z]/.test(password)) strength++
    
    // Kleinbuchstaben
    if (/[a-z]/.test(password)) strength++
    
    // Zahlen
    if (/[0-9]/.test(password)) strength++
    
    // Sonderzeichen
    if (/[^A-Za-z0-9]/.test(password)) strength++

    if (strength <= 2) setPasswordStrength('weak')
    else if (strength <= 3) setPasswordStrength('medium')
    else if (strength <= 4) setPasswordStrength('strong')
    else setPasswordStrength('very-strong')
  }, [password])

  // Passwort-Übereinstimmung prüfen
  useEffect(() => {
    if (confirmPassword.length === 0) {
      setPasswordsMatch(null)
      return
    }
    setPasswordsMatch(password === confirmPassword)
  }, [password, confirmPassword])

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'strong': return 'bg-blue-500'
      case 'very-strong': return 'bg-green-500'
    }
  }

  const getStrengthWidth = () => {
    switch (passwordStrength) {
      case 'weak': return 'w-1/4'
      case 'medium': return 'w-2/4'
      case 'strong': return 'w-3/4'
      case 'very-strong': return 'w-full'
    }
  }

  const getStrengthLabel = () => {
    switch (passwordStrength) {
      case 'weak': return 'Schwach'
      case 'medium': return 'Mittel'
      case 'strong': return 'Stark'
      case 'very-strong': return 'Sehr stark'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein')
      return
    }

    if (passwordStrength === 'weak') {
      setError('Bitte wähle ein stärkeres Passwort')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registrierung fehlgeschlagen')
        addToast({
          title: 'Fehler bei der Registrierung',
          description: data.error || 'Bitte versuche es erneut',
          type: 'error',
        })
        setLoading(false)
        return
      }

      // E-Mail wurde versendet
      addToast({
        title: '📧 Bestätigungs-E-Mail versendet!',
        description: 'Bitte prüfe dein Postfach (auch Spam-Ordner) und klicke auf den Bestätigungslink.',
        type: 'success',
        duration: 10000,
      })
      
      // Formular zurücksetzen
      setName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setLoading(false)
    } catch {
      setError('Ein Fehler ist aufgetreten')
      addToast({
        title: 'Fehler',
        description: 'Ein unerwarteter Fehler ist aufgetreten',
        type: 'error',
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <AnimatedBackground />
      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-2">
          <Image 
            src="/germanfence_logo.png" 
            alt="GermanFence" 
            width={80}
            height={80}
            className="h-20 w-20 object-contain"
          />
          <h1 className="text-3xl font-bold">GermanFence</h1>
          <p className="text-muted-foreground">Portal</p>
        </div>


        {/* Register Card */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Account erstellen</CardTitle>
            <CardDescription>
              Erstelle deinen Account um loszulegen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Name (optional)</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Max Mustermann"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-Mail *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="kontakt@beispiel.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Passwort *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                
                {/* Passwort-Stärke-Anzeige */}
                {password.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Passwort-Stärke:</span>
                      <span className={`font-medium ${
                        passwordStrength === 'weak' ? 'text-red-500' :
                        passwordStrength === 'medium' ? 'text-yellow-500' :
                        passwordStrength === 'strong' ? 'text-blue-500' :
                        'text-green-500'
                      }`}>
                        {getStrengthLabel()}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${getStrengthColor()} ${getStrengthWidth()}`}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1">
                        {password.length >= 8 ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <X className="h-3 w-3 text-red-500" />
                        )}
                        <span>Mindestens 8 Zeichen</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {/[A-Z]/.test(password) ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <X className="h-3 w-3 text-red-500" />
                        )}
                        <span>Großbuchstaben</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {/[0-9]/.test(password) ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <X className="h-3 w-3 text-red-500" />
                        )}
                        <span>Zahlen</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {/[^A-Za-z0-9]/.test(password) ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <X className="h-3 w-3 text-red-500" />
                        )}
                        <span>Sonderzeichen</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Passwort bestätigen *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`pr-10 ${
                      passwordsMatch === null ? '' :
                      passwordsMatch ? 'border-green-500' : 'border-red-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                
                {/* Passwort-Übereinstimmung */}
                {passwordsMatch !== null && (
                  <div className={`flex items-center gap-2 text-xs ${
                    passwordsMatch ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {passwordsMatch ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>Passwörter stimmen überein</span>
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3" />
                        <span>Passwörter stimmen nicht überein</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !passwordsMatch || passwordStrength === 'weak'}
              >
                {loading ? 'Wird erstellt...' : 'Account erstellen'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Bereits einen Account? </span>
              <Link href="/login" className="text-primary hover:underline font-medium">
                Jetzt anmelden
              </Link>
            </div>
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
