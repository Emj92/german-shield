'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Download, Loader2, X, Mail, ShoppingCart, Building, MapPin, Globe, CheckCircle2, AlertCircle } from 'lucide-react'
import { calculateTax, validateVatIdFormat, PACKAGE_NAMES, TAX_RATES } from '@/lib/tax-config'
import { useLanguage } from '@/lib/language-context'

interface BuyButtonProps {
  packageType: 'single' | 'freelancer' | 'agency'
  price: number
  className?: string
  variant?: 'default' | 'outline'
}

export function BuyButton({ packageType, price, className, variant = 'default' }: BuyButtonProps) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Ensure component is mounted (for portal)
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Firmenfelder
  const [isBusiness, setIsBusiness] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [vatId, setVatId] = useState('')
  const [street, setStreet] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('DE')
  
  // Steuer-Berechnung
  const [taxCalc, setTaxCalc] = useState(calculateTax(price, 'DE', false))

  // Tax Berechnung aktualisieren
  useEffect(() => {
    const hasValidVat = !!(isBusiness && vatId && validateVatIdFormat(vatId, country))
    setTaxCalc(calculateTax(price, country, hasValidVat))
  }, [price, country, vatId, isBusiness])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !email.includes('@') || !email.includes('.')) {
      setError(t.modal.email + ' - Invalid format')
      return
    }

    if (isBusiness) {
      if (!companyName) {
        setError('Bitte gib einen Firmennamen ein')
        return
      }
      if (!vatId) {
        setError('Bitte gib eine USt-IdNr. ein')
        return
      }
      if (!street || !zipCode || !city) {
        setError('Bitte fülle alle Adressfelder aus')
        return
      }
    }

    setLoading(true)
    try {
      const response = await fetch('/api/mollie/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: taxCalc.grossAmount,
          netAmount: taxCalc.netAmount,
          taxAmount: taxCalc.taxAmount,
          taxRate: taxCalc.taxRate,
          description: `GermanFence ${PACKAGE_NAMES[packageType]} License`,
          package_type: packageType,
          email: email,
          isBusiness,
          ...(isBusiness && {
            companyName,
            vatId,
            street,
            zipCode,
            city,
            country
          })
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

  const countries = Object.values(TAX_RATES)
  const vatValid = !!(isBusiness && vatId && validateVatIdFormat(vatId, country))

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
            {t.pricing.buyNow}
          </>
        )}
      </Button>

      {/* Custom Modal - Using Portal */}
      {showModal && mounted && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          
          {/* Modal */}
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="sticky top-4 right-4 float-right p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>

            <div className="p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#22D6DD]/10 flex items-center justify-center">
                  <ShoppingCart className="h-8 w-8 text-[#22D6DD]" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {PACKAGE_NAMES[packageType]} {t.modal.license}
                </h2>
                
                {/* Preis-Anzeige */}
                <div className="mt-4 space-y-1">
                  {!taxCalc.taxExempt && (
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {t.modal.net}: {taxCalc.netAmount.toFixed(2)}€
                    </div>
                  )}
                  {taxCalc.taxAmount > 0 && (
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {t.modal.plus} {taxCalc.taxLabel} ({taxCalc.taxRate}%): {taxCalc.taxAmount.toFixed(2)}€
                    </div>
                  )}
                  {taxCalc.taxExempt && (
                    <div className="flex items-center justify-center gap-2 text-sm text-green-600 mb-2">
                      <CheckCircle2 className="h-4 w-4" />
                      {t.modal.reverseCharge}
                    </div>
                  )}
                  <div className="text-2xl font-bold text-[#22D6DD]">
                    {taxCalc.taxExempt ? taxCalc.netAmount.toFixed(2) : taxCalc.grossAmount.toFixed(2)}€ {t.modal.perYear}
                  </div>
                  {taxCalc.taxExempt && (
                    <div className="text-xs text-slate-500">
                      ({t.modal.netNotice})
                    </div>
                  )}
                  {taxCalc.taxAmount === 0 && !taxCalc.taxExempt && (
                    <div className="text-xs text-slate-500">
                      ({t.modal.taxFree} {TAX_RATES[country]?.country || 'diesem Land'})
                    </div>
                  )}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* E-Mail */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t.modal.email} *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      ref={inputRef}
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.modal.emailPlaceholder}
                      className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#22D6DD] focus:ring-2 focus:ring-[#22D6DD]/20 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Firmen-Checkbox */}
                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <input
                    type="checkbox"
                    id="isBusiness"
                    checked={isBusiness}
                    onChange={(e) => setIsBusiness(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 focus:ring-[#22D6DD] focus:ring-offset-0 checked:bg-[#22D6DD] checked:border-[#22D6DD]"
                    style={{ accentColor: '#22D6DD' }}
                  />
                  <label htmlFor="isBusiness" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    🏢 {t.modal.companyPurchase}
                  </label>
                </div>

                {/* Firmenfelder (conditional) */}
                {isBusiness && (
                  <div className="space-y-4 animate-in slide-in-from-top duration-200">
                    {/* Firmenname */}
                    <div>
                      <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Firmenname *
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                          type="text"
                          id="companyName"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Meine Firma GmbH"
                          className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#22D6DD] focus:ring-2 focus:ring-[#22D6DD]/20 outline-none transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* Land & USt-IdNr. nebeneinander */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="country" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Land *
                        </label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <select
                            id="country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#22D6DD] focus:ring-2 focus:ring-[#22D6DD]/20 outline-none transition-all appearance-none"
                            required
                          >
                            {countries.map(c => (
                              <option key={c.countryCode} value={c.countryCode}>
                                {c.country}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="vatId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                          USt-IdNr. *
                          {vatValid && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        </label>
                        <input
                          type="text"
                          id="vatId"
                          value={vatId}
                          onChange={(e) => setVatId(e.target.value.toUpperCase())}
                          placeholder={`${country}123456789`}
                          className={`w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#22D6DD] focus:ring-2 focus:ring-[#22D6DD]/20 outline-none transition-all ${
                            vatValid ? 'border-green-500' : 'border-slate-200 dark:border-slate-700'
                          }`}
                          required
                        />
                        {vatValid && (
                          <p className="text-xs text-green-600 mt-1">✓ Gültige USt-IdNr. - Reverse Charge</p>
                        )}
                      </div>
                    </div>

                    {/* Straße */}
                    <div>
                      <label htmlFor="street" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Straße & Hausnummer *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                          type="text"
                          id="street"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          placeholder="Musterstraße 123"
                          className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#22D6DD] focus:ring-2 focus:ring-[#22D6DD]/20 outline-none transition-all"
                          required
                        />
                      </div>
                    </div>

                    {/* PLZ & Stadt nebeneinander */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="zipCode" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          PLZ *
                        </label>
                        <input
                          type="text"
                          id="zipCode"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          placeholder="12345"
                          className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#22D6DD] focus:ring-2 focus:ring-[#22D6DD]/20 outline-none transition-all"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <label htmlFor="city" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Stadt *
                        </label>
                        <input
                          type="text"
                          id="city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Berlin"
                          className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#22D6DD] focus:ring-2 focus:ring-[#22D6DD]/20 outline-none transition-all"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                {/* Info */}
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                  {t.modal.securePayment}
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
                    {t.modal.cancel}
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-[#22D6DD] hover:bg-[#1EBEC5] text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t.modal.loading}
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        {t.modal.toPay}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
