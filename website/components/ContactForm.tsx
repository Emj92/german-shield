'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'
import { Loader2 } from 'lucide-react'

export function ContactForm() {
  const { t } = useLanguage()
  const [captchaA, setCaptchaA] = useState(0)
  const [captchaB, setCaptchaB] = useState(0)
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [captchaError, setCaptchaError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Generiere neue Captcha-Aufgabe
  useEffect(() => {
    generateCaptcha()
  }, [])

  function generateCaptcha() {
    setCaptchaA(Math.floor(Math.random() * 10) + 1)
    setCaptchaB(Math.floor(Math.random() * 10) + 1)
    setCaptchaAnswer('')
    setCaptchaError(false)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setCaptchaError(false)
    
    // Captcha validieren
    const correctAnswer = captchaA + captchaB
    if (parseInt(captchaAnswer) !== correctAnswer) {
      setCaptchaError(true)
      generateCaptcha()
      return
    }

    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      company: formData.get('company'),
      subject: formData.get('subject'),
      email: formData.get('email'),
      message: formData.get('message'),
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        setSuccess(true)
        // Reset form
        e.currentTarget.reset()
        generateCaptcha()
      } else {
        const result = await res.json()
        setError(result.error || 'Ein Fehler ist aufgetreten')
      }
    } catch (err) {
      setError('Verbindungsfehler. Bitte versuche es erneut.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-12 px-6 bg-[#22D6DD]/10 rounded-[9px] border-2 border-[#22D6DD]">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {t.contact.title === 'Kontakt' ? 'Nachricht gesendet!' : 'Message sent!'}
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          {t.contact.title === 'Kontakt' 
            ? 'Wir melden uns schnellstmöglich bei dir.' 
            : 'We will get back to you as soon as possible.'}
        </p>
        <Button 
          onClick={() => setSuccess(false)}
          className="mt-6 bg-[#22D6DD] hover:bg-[#22D6DD]/90"
        >
          {t.contact.title === 'Kontakt' ? 'Weitere Nachricht' : 'Send another'}
        </Button>
      </div>
    )
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Name + Nachname */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.contact.firstName}</label>
          <input 
            type="text" 
            name="firstName" 
            required
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-[#22D6DD] focus:outline-none transition bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            placeholder="Max"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.contact.lastName}</label>
          <input 
            type="text" 
            name="lastName" 
            required
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-[#22D6DD] focus:outline-none transition bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            placeholder="Mustermann"
          />
        </div>
      </div>

      {/* Firma + Anliegen */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.contact.company}</label>
          <input 
            type="text" 
            name="company"
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-[#22D6DD] focus:outline-none transition bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            placeholder="My Company GmbH"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.contact.subject}</label>
          <select 
            name="subject" 
            required
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-[#22D6DD] focus:outline-none transition bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="">{t.contact.selectPlaceholder}</option>
            <option value="support">{t.contact.support}</option>
            <option value="sales">{t.contact.sales}</option>
            <option value="partnership">{t.contact.partnership}</option>
            <option value="feedback">{t.contact.feedback}</option>
            <option value="other">{t.contact.other}</option>
          </select>
        </div>
      </div>

      {/* E-Mail */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.contact.email}</label>
        <input 
          type="email" 
          name="email" 
          required
          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-[#22D6DD] focus:outline-none transition bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          placeholder="max@example.com"
        />
      </div>

      {/* Nachricht */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.contact.message}</label>
        <textarea 
          name="message" 
          required
          rows={6}
          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-[#22D6DD] focus:outline-none transition bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
          placeholder={t.contact.messagePlaceholder}
        />
      </div>

      {/* Mathe-Captcha */}
      <div className="p-4 bg-[#FAFAFA] dark:bg-slate-800 rounded-[9px] border border-[#d9dde1] dark:border-slate-700">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          🔒 {t.captcha.label}
        </label>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-lg font-medium text-slate-900 dark:text-white">
            <span>{t.captcha.question}</span>
            <span className="px-3 py-1 bg-[#22D6DD]/20 rounded-lg font-bold text-[#22D6DD]">
              {captchaA} + {captchaB}
            </span>
            <span>=</span>
          </div>
          <input 
            type="number"
            value={captchaAnswer}
            onChange={(e) => setCaptchaAnswer(e.target.value)}
            required
            className={`w-24 px-4 py-2 border rounded-lg focus:outline-none transition bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-center font-bold ${
              captchaError 
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                : 'border-slate-300 dark:border-slate-600 focus:border-[#22D6DD]'
            }`}
            placeholder="?"
          />
        </div>
        {captchaError && (
          <p className="text-red-500 text-sm mt-2">
            {t.contact.title === 'Kontakt' ? 'Falsche Antwort. Bitte versuche es erneut.' : 'Wrong answer. Please try again.'}
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <Button 
        type="submit" 
        disabled={loading}
        className="w-full bg-[#22D6DD] text-white hover:bg-[#22D6DD] py-6 text-lg font-semibold transition-transform hover:-translate-y-1 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {t.contact.title === 'Kontakt' ? 'Wird gesendet...' : 'Sending...'}
          </>
        ) : (
          <>📧 {t.contact.send}</>
        )}
      </Button>
    </form>
  )
}

