'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'

interface RatingData {
  average: number
  total: number
  distribution: Record<number, number>
}

export function StarRating() {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // Fallback-Werte falls API nicht erreichbar
  const [stats, setStats] = useState<RatingData>({ average: 4.9, total: 259, distribution: {} })
  const [showThankYou, setShowThankYou] = useState(false)
  const [apiAvailable, setApiAvailable] = useState(true)

  useEffect(() => {
    fetchStats()
    // Prüfe ob bereits bewertet (localStorage)
    if (typeof window !== 'undefined' && localStorage.getItem('gf_rated')) {
      setSubmitted(true)
      setRating(parseInt(localStorage.getItem('gf_rating') || '5'))
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
        // API gibt Fehler zurück - nutze Fallback-Werte
        setApiAvailable(false)
      }
    } catch (err) {
      // Netzwerkfehler - nutze Fallback-Werte, verstecke Fehler
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
        
        // Thank you Animation nach 3 Sekunden ausblenden
        setTimeout(() => setShowThankYou(false), 3000)
      } else {
        // Bei Fehler trotzdem als bewertet markieren
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
      // Bei Netzwerkfehler trotzdem als bewertet markieren
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

  const displayRating = hoverRating || rating || 0

  return (
    <>
      {/* Toast oben rechts */}
      {showThankYou && (
        <div className="fixed top-20 right-4 z-[100] flex items-center gap-3 px-5 py-4 rounded-[9px] shadow-lg bg-[#22D6DD] text-white animate-in slide-in-from-right-5">
          <span className="text-xl">🎉</span>
          <span className="font-medium">Danke für die Bewertung!</span>
        </div>
      )}
      
      <div className="flex flex-col items-center gap-4">
        {/* Statistiken */}
        <div className="flex items-center gap-3 text-white/90">
          <span className="text-4xl font-bold">{stats.average}</span>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.round(stats.average)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-white/20 text-white/20'
                }`}
              />
            ))}
          </div>
          <span className="text-white/70">({stats.total.toLocaleString()} Bewertungen)</span>
        </div>

        {/* Interaktive Sterne - auch nach Bewertung anzeigen */}
        <div className="relative">
          <div className="flex flex-col items-center gap-2">
            {!submitted && <p className="text-white/80 text-sm">Wie gefällt dir GermanFence?</p>}
            <div 
              className="flex gap-1 cursor-pointer"
              onMouseLeave={() => setHoverRating(0)}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => !submitted && submitRating(star)}
                  onMouseEnter={() => !submitted && setHoverRating(star)}
                  disabled={loading || submitted}
                  className={`p-1 transition-transform ${!submitted ? 'hover:scale-110' : ''} disabled:opacity-100`}
                >
                  <Star
                    className={`h-10 w-10 transition-all ${
                      star <= (submitted ? rating : displayRating)
                        ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]'
                        : 'fill-white/20 text-white/40'
                    }`}
                  />
                </button>
              ))}
            </div>
            {loading && <span className="text-white/70 text-sm">Wird gesendet...</span>}
            {error && <span className="text-red-300 text-sm">{error}</span>}
          </div>
        </div>
      </div>
    </>
  )
}

