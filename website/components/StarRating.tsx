'use client'

import { useState, useEffect } from 'react'
import { Star, StarHalf } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

interface RatingData {
  average: number
  total: number
  distribution: Record<number, number>
}

export function StarRating() {
  const { t } = useLanguage()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // Fallback-Werte falls API nicht erreichbar
  const [stats, setStats] = useState<RatingData>({ average: 5.0, total: 2, distribution: {} })
  const [showThankYou, setShowThankYou] = useState(false)
  const [apiAvailable, setApiAvailable] = useState(true)

  useEffect(() => {
    fetchStats()
    // Prüfe ob bereits bewertet (localStorage)
    if (typeof window !== 'undefined' && localStorage.getItem('gf_rated')) {
      setSubmitted(true)
      setRating(parseFloat(localStorage.getItem('gf_rating') || '5'))
    }
  }, [])

  async function fetchStats() {
    try {
      const res = await fetch('https://portal.germanfence.de/api/ratings', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.ok) {
        const data = await res.json()
        if (data.total > 0) {
          setStats(data)
        }
        setApiAvailable(true)
      } else {
        setApiAvailable(false)
      }
    } catch (err) {
      console.log('Rating API nicht erreichbar, nutze Fallback')
      setApiAvailable(false)
    }
  }

  async function submitRating(stars: number) {
    if (submitted || loading) return
    
    // Wenn API nicht verfügbar, speichere lokal und zeige Danke
    if (!apiAvailable) {
      setRating(stars)
      setSubmitted(true)
      setShowThankYou(true)
      if (typeof window !== 'undefined') {
        localStorage.setItem('gf_rated', 'true')
        localStorage.setItem('gf_rating', stars.toString())
      }
      setTimeout(() => setShowThankYou(false), 3000)
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('https://portal.germanfence.de/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stars }),
      })
      
      if (res.ok) {
        const data = await res.json()
        setRating(stars)
        setSubmitted(true)
        setShowThankYou(true)
        if (typeof window !== 'undefined') {
          localStorage.setItem('gf_rated', 'true')
          localStorage.setItem('gf_rating', stars.toString())
        }
        
        // Stats aktualisieren
        if (data.newAverage && data.newTotal) {
          setStats(prev => ({
            ...prev,
            average: data.newAverage,
            total: data.newTotal,
          }))
        }
        
        setTimeout(() => setShowThankYou(false), 3000)
      } else {
        setRating(stars)
        setSubmitted(true)
        setShowThankYou(true)
        if (typeof window !== 'undefined') {
          localStorage.setItem('gf_rated', 'true')
          localStorage.setItem('gf_rating', stars.toString())
        }
        setTimeout(() => setShowThankYou(false), 3000)
      }
    } catch (err) {
      setRating(stars)
      setSubmitted(true)
      setShowThankYou(true)
      if (typeof window !== 'undefined') {
        localStorage.setItem('gf_rated', 'true')
        localStorage.setItem('gf_rating', stars.toString())
      }
      setTimeout(() => setShowThankYou(false), 3000)
    } finally {
      setLoading(false)
    }
  }

  // Halbe Sterne unterstützen
  function handleStarClick(starIndex: number, isHalf: boolean) {
    const value = isHalf ? starIndex - 0.5 : starIndex
    submitRating(value)
  }

  function handleStarHover(starIndex: number, e: React.MouseEvent<HTMLButtonElement>) {
    if (submitted) return
    const rect = e.currentTarget.getBoundingClientRect()
    const isLeftHalf = e.clientX - rect.left < rect.width / 2
    const value = isLeftHalf ? starIndex - 0.5 : starIndex
    setHoverRating(value)
  }

  // Zeige: Hover > eigene Bewertung > Durchschnitt (immer sichtbar für neue Besucher)
  const displayRating = hoverRating || (submitted ? rating : stats.average) || stats.average

  // Render Sterne mit halben Sternen
  function renderStar(index: number, size: string, forDisplay: boolean, value: number) {
    const filled = value >= index
    const halfFilled = value >= index - 0.5 && value < index
    
    if (halfFilled) {
      return (
        <div className="relative" key={index}>
          <Star className={`${size} fill-white/20 text-white/20`} />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className={`${size} fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]`} />
          </div>
        </div>
      )
    }
    
    return (
      <Star
        key={index}
        className={`${size} ${
          filled
            ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]'
            : 'fill-white/20 text-white/20'
        }`}
      />
    )
  }

  // Formatierung mit Komma
  const formattedAverage = stats.average.toFixed(1).replace('.', ',')
  const reviewText = stats.total === 1 ? t.rating.review : t.rating.reviews

  return (
    <>
      {/* Toast oben rechts */}
      {showThankYou && (
        <div className="fixed top-20 right-4 z-[100] flex items-center gap-3 px-5 py-4 rounded-[9px] shadow-lg bg-[#22D6DD] text-white animate-in slide-in-from-right-5">
          <span className="text-xl">🎉</span>
          <span className="font-medium">{t.rating.thankYou}</span>
        </div>
      )}
      
      <div className="flex flex-col items-center gap-3">
        {/* Interaktive Sterne - nur einmal */}
        <div className="relative">
          <div className="flex flex-col items-center gap-2">
            {!submitted && <p className="text-white/80 text-sm">{t.rating.question}</p>}
            <div 
              className="flex gap-1"
              onMouseLeave={() => setHoverRating(0)}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={(e) => {
                    if (submitted) return
                    const rect = e.currentTarget.getBoundingClientRect()
                    const isLeftHalf = e.clientX - rect.left < rect.width / 2
                    handleStarClick(star, isLeftHalf)
                  }}
                  onMouseMove={(e) => handleStarHover(star, e)}
                  disabled={loading || submitted}
                  className={`p-1 transition-transform ${!submitted ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
                >
                  {renderStar(star, 'h-10 w-10', false, submitted ? rating : displayRating)}
                </button>
              ))}
            </div>
            {loading && <span className="text-white/70 text-sm">{t.rating.sending}</span>}
            {error && <span className="text-red-300 text-sm">{error}</span>}
          </div>
        </div>

        {/* Statistiken darunter */}
        <div className="flex items-center gap-2 text-white/80 text-sm">
          <span className="font-semibold text-white">{formattedAverage}</span>
          <span>({stats.total} {reviewText})</span>
        </div>
      </div>
    </>
  )
}
