'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Language, translations } from './translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: typeof translations.de
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('de')

  // Lade Sprache aus localStorage
  useEffect(() => {
    const saved = localStorage.getItem('language') as Language | null
    if (saved && (saved === 'de' || saved === 'en')) {
      setLanguage(saved)
    }
  }, [])

  // Speichere Sprache in localStorage
  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  const t = translations[language]

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

