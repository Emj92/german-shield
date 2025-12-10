'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface InfoBannerData {
  id: string
  text: string
  backgroundColor: string
  textColor: string
  closeButtonColor: string
}

export function InfoBanner() {
  const [banner, setBanner] = useState<InfoBannerData | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const dismissedBanners = JSON.parse(localStorage.getItem('dismissedBanners') || '[]')
    
    // API vom Portal aufrufen (mit voller URL)
    fetch('https://app.germanfence.de/api/infobanner?target=website')
      .then(res => res.json())
      .then(data => {
        if (data.banner && !dismissedBanners.includes(data.banner.id)) {
          setBanner(data.banner)
        }
      })
      .catch(console.error)
  }, [])

  const handleDismiss = () => {
    if (!banner) return
    
    const dismissedBanners = JSON.parse(localStorage.getItem('dismissedBanners') || '[]')
    dismissedBanners.push(banner.id)
    localStorage.setItem('dismissedBanners', JSON.stringify(dismissedBanners))
    
    setDismissed(true)
  }

  if (!banner || dismissed) return null

  return (
    <div 
      className="w-full h-[50px] flex items-center justify-center px-4 relative z-50"
      style={{ 
        backgroundColor: banner.backgroundColor, 
        color: banner.textColor 
      }}
    >
      <p className="text-center font-medium text-[15px]">{banner.text}</p>
      <button 
        onClick={handleDismiss}
        className="absolute right-4 p-1 hover:opacity-80 transition-opacity"
        style={{ color: banner.closeButtonColor }}
        aria-label="Schliessen"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}

