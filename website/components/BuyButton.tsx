'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'

interface BuyButtonProps {
  packageType: 'single' | 'freelancer' | 'agency'
  price: number
  className?: string
  variant?: 'default' | 'outline'
}

export function BuyButton({ packageType, price, className, variant = 'default' }: BuyButtonProps) {
  const [loading, setLoading] = useState(false)

  const handlePurchase = async () => {
    // E-Mail abfragen
    const email = prompt('Bitte gib deine E-Mail-Adresse ein:')
    if (!email || !email.includes('@')) {
      alert('Bitte gib eine gültige E-Mail-Adresse ein')
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
          description: `GermanFence ${packageType.charAt(0).toUpperCase() + packageType.slice(1)} License`,
          package_type: packageType,
          email: email,
        }),
      })

      const data = await response.json()

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        alert('Fehler beim Erstellen der Zahlung. Bitte versuche es erneut.')
        setLoading(false)
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Fehler beim Erstellen der Zahlung. Bitte versuche es erneut.')
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handlePurchase}
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
          <Download className="mr-2 h-4 w-4" />
          Jetzt kaufen
        </>
      )}
    </Button>
  )
}

