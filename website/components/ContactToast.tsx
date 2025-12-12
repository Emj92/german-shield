'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, XCircle, X } from 'lucide-react'

function ToastContent() {
  const searchParams = useSearchParams()
  const [show, setShow] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(true)

  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (success === 'message-sent') {
      setMessage('Nachricht erfolgreich gesendet! Wir melden uns bei dir.')
      setIsSuccess(true)
      setShow(true)
    } else if (error) {
      const errorMessages: Record<string, string> = {
        'missing-fields': 'Bitte fülle alle Pflichtfelder aus.',
        'config': 'Konfigurationsfehler. Bitte später versuchen.',
        'send-failed': 'Senden fehlgeschlagen. Bitte später versuchen.',
        'server': 'Serverfehler. Bitte später versuchen.',
      }
      setMessage(errorMessages[error] || 'Ein Fehler ist aufgetreten.')
      setIsSuccess(false)
      setShow(true)
    }

    // Nach 5 Sekunden ausblenden
    if (success || error) {
      const timer = setTimeout(() => setShow(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  if (!show) return null

  return (
    <div className={`fixed top-20 right-4 z-[100] flex items-center gap-3 px-5 py-4 rounded-[9px] shadow-lg animate-in slide-in-from-right-5 ${
      isSuccess 
        ? 'bg-[#22D6DD] text-white' 
        : 'bg-[#EC4899] text-white'
    }`}>
      {isSuccess ? (
        <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
      ) : (
        <XCircle className="h-5 w-5 flex-shrink-0" />
      )}
      <span className="font-medium">{message}</span>
      <button 
        onClick={() => setShow(false)} 
        className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function ContactToast() {
  return (
    <Suspense fallback={null}>
      <ToastContent />
    </Suspense>
  )
}

