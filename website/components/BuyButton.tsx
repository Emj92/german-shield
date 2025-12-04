'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2, X, Mail, ShoppingCart } from 'lucide-react'

interface BuyButtonProps {
  packageType: 'single' | 'freelancer' | 'agency'
  price: number
  className?: string
  variant?: 'default' | 'outline'
}

export function BuyButton({ packageType, price, className, variant = 'default' }: BuyButtonProps) {
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when modal opens
  useEffect(() => {
    if (showModal && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [showModal])

  // Close modal on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false)
    }
    if (showModal) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [showModal])

  const packageNames = {
    single: 'Single',
    freelancer: 'Freelancer',
    agency: 'Agency'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Bitte gib eine gültige E-Mail-Adresse ein')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/mollie/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: price,
          description: `GermanFence ${packageNames[packageType]} License`,
          package_type: packageType,
          email: email,
        }),
      })

      const data = await response.json()

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        setError(data.error || 'Fehler beim Erstellen der Zahlung. Bitte versuche es erneut.')
        setLoading(false)
      }
    } catch (error) {
      console.error('Payment error:', error)
      setError('Verbindungsfehler. Bitte prüfe deine Internetverbindung und versuche es erneut.')
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        disabled={loading}
        variant={variant}
        className={className}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Wird geladen...
          </>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Jetzt kaufen
          </>
        )}
      </Button>

      {/* Custom Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          
          {/* Modal */}
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#22D6DD]/10 flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-[#22D6DD]" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {packageNames[packageType]} Lizenz
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {price}€ / Jahr
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  E-Mail-Adresse
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    ref={inputRef}
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="deine@email.de"
                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#22D6DD] focus:ring-2 focus:ring-[#22D6DD]/20 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Info */}
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                💳 Sichere Zahlung über Mollie · 14 Tage Geld-zurück-Garantie
              </p>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border-slate-300 dark:border-slate-600"
                  disabled={loading}
                >
                  Abbrechen
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#22D6DD] hover:bg-[#1EBEC5] text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wird geladen...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Zur Zahlung
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

