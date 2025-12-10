'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Megaphone, Plus, Trash2, Eye, EyeOff, Calendar, 
  Globe, Layout, X, Check 
} from 'lucide-react'

interface InfoBanner {
  id: string
  text: string
  backgroundColor: string
  textColor: string
  closeButtonColor: string
  showOnWebsite: boolean
  showOnPortal: boolean
  isActive: boolean
  expiresAt: string | null
  createdAt: string
}

export default function InfoBannerPage() {
  const [banners, setBanners] = useState<InfoBanner[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  
  // Form State
  const [text, setText] = useState('')
  const [backgroundColor, setBackgroundColor] = useState('#22D6DD')
  const [textColor, setTextColor] = useState('#ffffff')
  const [closeButtonColor, setCloseButtonColor] = useState('#ffffff')
  const [showOnWebsite, setShowOnWebsite] = useState(true)
  const [showOnPortal, setShowOnPortal] = useState(true)
  const [expiresAt, setExpiresAt] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/admin/infobanner')
      const data = await res.json()
      setBanners(data.banners || [])
    } catch (error) {
      console.error('Error fetching banners:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    
    setSaving(true)
    try {
      const res = await fetch('/api/admin/infobanner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          backgroundColor,
          textColor,
          closeButtonColor,
          showOnWebsite,
          showOnPortal,
          expiresAt: expiresAt || null,
        }),
      })
      
      if (res.ok) {
        resetForm()
        fetchBanners()
      }
    } catch (error) {
      console.error('Error creating banner:', error)
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setText('')
    setBackgroundColor('#22D6DD')
    setTextColor('#ffffff')
    setCloseButtonColor('#ffffff')
    setShowOnWebsite(true)
    setShowOnPortal(true)
    setExpiresAt('')
    setShowForm(false)
  }

  const toggleActive = async (banner: InfoBanner) => {
    try {
      await fetch(`/api/admin/infobanner/${banner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...banner, isActive: !banner.isActive }),
      })
      fetchBanners()
    } catch (error) {
      console.error('Error toggling banner:', error)
    }
  }

  const deleteBanner = async (id: string) => {
    if (!confirm('Infoleiste wirklich löschen?')) return
    
    try {
      await fetch(`/api/admin/infobanner/${id}`, { method: 'DELETE' })
      fetchBanners()
    } catch (error) {
      console.error('Error deleting banner:', error)
    }
  }

  if (loading) {
    return (
      <DashboardLayout user={{ email: '', role: 'ADMIN' }}>
        <div className="p-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#22D6DD]"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={{ email: '', role: 'ADMIN' }}>
      <div className="p-12 space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Megaphone className="h-8 w-8 text-[#22D6DD]" />
              Infoleisten-Verwaltung
            </h1>
            <p className="text-muted-foreground mt-1">
              Erstelle Ankündigungen für Website und Portal
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-[#22D6DD] hover:bg-[#22D6DD]/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Neue Infoleiste
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Neue Infoleiste erstellen</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Text */}
                <div>
                  <label className="block text-sm font-medium mb-2">Text *</label>
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="🎉 Noch 2 Wochen: 20% Rabatt auf alle Lizenzen!"
                    rows={2}
                    required
                  />
                </div>

                {/* Farben */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Hintergrundfarbe</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="h-10 w-14 rounded border cursor-pointer"
                      />
                      <Input
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Textfarbe</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="h-10 w-14 rounded border cursor-pointer"
                      />
                      <Input
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Schließen-Button</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={closeButtonColor}
                        onChange={(e) => setCloseButtonColor(e.target.value)}
                        className="h-10 w-14 rounded border cursor-pointer"
                      />
                      <Input
                        value={closeButtonColor}
                        onChange={(e) => setCloseButtonColor(e.target.value)}
                        className="font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Anzeigen auf */}
                <div>
                  <label className="block text-sm font-medium mb-2">Anzeigen auf</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showOnWebsite}
                        onChange={(e) => setShowOnWebsite(e.target.checked)}
                        className="rounded"
                      />
                      <Globe className="h-4 w-4" />
                      Website
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showOnPortal}
                        onChange={(e) => setShowOnPortal(e.target.checked)}
                        className="rounded"
                      />
                      <Layout className="h-4 w-4" />
                      Portal
                    </label>
                  </div>
                </div>

                {/* Ablaufdatum */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Ablaufdatum (optional)
                  </label>
                  <Input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>

                {/* Preview */}
                <div>
                  <label className="block text-sm font-medium mb-2">Vorschau</label>
                  <div 
                    className="h-[50px] flex items-center justify-center px-4 relative"
                    style={{ backgroundColor, color: textColor }}
                  >
                    <p className="text-center font-medium">{text || 'Vorschau-Text...'}</p>
                    <button 
                      type="button"
                      className="absolute right-4"
                      style={{ color: closeButtonColor }}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Abbrechen
                  </Button>
                  <Button type="submit" disabled={saving} className="bg-[#22D6DD] hover:bg-[#22D6DD]/90">
                    {saving ? 'Wird erstellt...' : 'Erstellen'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Banners List */}
        <Card>
          <CardHeader>
            <CardTitle>Leisten-Verlauf ({banners.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {banners.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Noch keine Infoleisten erstellt
              </p>
            ) : (
              <div className="space-y-4">
                {banners.map((banner) => (
                  <div 
                    key={banner.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    {/* Preview */}
                    <div 
                      className="h-[50px] flex items-center justify-center px-4 relative rounded"
                      style={{ 
                        backgroundColor: banner.backgroundColor, 
                        color: banner.textColor,
                        opacity: banner.isActive ? 1 : 0.5
                      }}
                    >
                      <p className="text-center font-medium">{banner.text}</p>
                      <span 
                        className="absolute right-4"
                        style={{ color: banner.closeButtonColor }}
                      >
                        <X className="h-5 w-5" />
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={banner.isActive ? 'default' : 'secondary'}>
                          {banner.isActive ? 'Aktiv' : 'Inaktiv'}
                        </Badge>
                        {banner.showOnWebsite && (
                          <Badge variant="outline" className="gap-1">
                            <Globe className="h-3 w-3" /> Website
                          </Badge>
                        )}
                        {banner.showOnPortal && (
                          <Badge variant="outline" className="gap-1">
                            <Layout className="h-3 w-3" /> Portal
                          </Badge>
                        )}
                        {banner.expiresAt && (
                          <Badge variant="outline" className="gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(banner.expiresAt).toLocaleDateString('de-DE')}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground mr-2">
                          {new Date(banner.createdAt).toLocaleDateString('de-DE')}
                        </span>
                        <button
                          onClick={() => toggleActive(banner)}
                          className="p-2 text-slate-500"
                          title={banner.isActive ? 'Deaktivieren' : 'Aktivieren'}
                        >
                          {banner.isActive ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteBanner(banner.id)}
                          className="p-2 text-slate-500"
                          title="Löschen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

