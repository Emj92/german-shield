'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'

type Language = 'de' | 'en'

export function LanguageSwitcher() {
  const [language, setLanguage] = useState<Language>('de')
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const savedLang = localStorage.getItem('language') as Language
    if (savedLang && (savedLang === 'de' || savedLang === 'en')) {
      setLanguage(savedLang)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const changeLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
    setIsOpen(false)
    // Here you would typically trigger a translation update
    // For now, we just save the preference
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 h-9">
        <span className="text-lg">🇩🇪</span>
      </Button>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 hover:bg-[#22D6DD]/10"
        title="Sprache wechseln"
      >
        <span className="text-lg">{language === 'de' ? '🇩🇪' : '🇺🇸'}</span>
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
          <button
            onClick={() => changeLanguage('de')}
            className={`w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
              language === 'de' ? 'bg-[#22D6DD]/10 text-[#22D6DD]' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <span className="text-lg">🇩🇪</span>
            <span className="text-sm font-medium">Deutsch</span>
          </button>
          <button
            onClick={() => changeLanguage('en')}
            className={`w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
              language === 'en' ? 'bg-[#22D6DD]/10 text-[#22D6DD]' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <span className="text-lg">🇺🇸</span>
            <span className="text-sm font-medium">English</span>
          </button>
        </div>
      )}
    </div>
  )
}

