'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

type Language = 'de' | 'en'

export function LanguageSwitcher() {
  const [language, setLanguage] = useState<Language>('de')
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const savedLang = localStorage.getItem('portal_language') as Language
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
    localStorage.setItem('portal_language', lang)
    setIsOpen(false)
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full">
        <Image src="/flags/de.svg" alt="DE" width={20} height={14} className="rounded-sm" />
      </Button>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full hover:bg-[#22D6DD]/10"
        title="Sprache wechseln"
      >
        <Image 
          src={language === 'de' ? '/flags/de.svg' : '/flags/us.svg'} 
          alt={language.toUpperCase()} 
          width={20} 
          height={14} 
          className="rounded-sm"
        />
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
          <button
            onClick={() => changeLanguage('de')}
            className={`w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors ${
              language === 'de' ? 'bg-[#22D6DD]/10 text-[#22D6DD]' : 'text-gray-700'
            }`}
          >
            <Image src="/flags/de.svg" alt="DE" width={20} height={14} className="rounded-sm" />
            <span className="text-sm font-medium">Deutsch</span>
          </button>
          <button
            onClick={() => changeLanguage('en')}
            className={`w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors ${
              language === 'en' ? 'bg-[#22D6DD]/10 text-[#22D6DD]' : 'text-gray-700'
            }`}
          >
            <Image src="/flags/us.svg" alt="EN" width={20} height={14} className="rounded-sm" />
            <span className="text-sm font-medium">English</span>
          </button>
        </div>
      )}
    </div>
  )
}

