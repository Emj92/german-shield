'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setVisible(true)
    }
  }, [])

  const acceptAll = () => {
    localStorage.setItem('cookie-consent', 'all')
    setVisible(false)
  }

  const acceptEssential = () => {
    localStorage.setItem('cookie-consent', 'essential')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-4 z-[9999] max-w-sm bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">🍪 Cookie-Einstellungen</h3>
        <button
          onClick={acceptEssential}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
        Wir verwenden Cookies, um die Funktionalität unserer Website zu gewährleisten. 
        Einige Cookies sind für den Betrieb erforderlich.
      </p>
      
      <div className="flex gap-2">
        <button
          onClick={acceptEssential}
          className="flex-1 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
        >
          Nur notwendige
        </button>
        <button
          onClick={acceptAll}
          className="flex-1 px-3 py-2 text-xs font-medium text-white bg-[#22D6DD] hover:bg-[#1BA8B0] rounded-lg transition-colors"
        >
          Alle akzeptieren
        </button>
      </div>
      
      <a 
        href="/datenschutz" 
        className="block text-center text-xs text-[#22D6DD] hover:underline mt-3"
      >
        Datenschutzerklärung
      </a>
    </div>
  )
}

