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
  Globe, Layout, X, Bell, Search, Users, Check
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

interface Notification {
  id: string
  userId: string | null
  message: string
  type: 'MESSAGE' | 'UPDATE' | 'NEWS' | 'WARNING'
  backgroundColor: string
  link: string | null
  read: boolean
  createdAt: string
  user?: { email: string } | null
}

interface UserOption {
  id: string
  email: string
}

export default function InfoBannerPage() {
  const [banners, setBanners] = useState<InfoBanner[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [users, setUsers] = useState<UserOption[]>([])
  const [loading, setLoading] = useState(true)
  const [showBannerForm, setShowBannerForm] = useState(false)
  const [showNotificationForm, setShowNotificationForm] = useState(false)
  
  // Banner Form State
  const [text, setText] = useState('')
  const [backgroundColor, setBackgroundColor] = useState('#22D6DD')
  const [textColor, setTextColor] = useState('#ffffff')
  const [closeButtonColor, setCloseButtonColor] = useState('#ffffff')
  const [showOnWebsite, setShowOnWebsite] = useState(true)
  const [showOnPortal, setShowOnPortal] = useState(true)
  const [expiresAt, setExpiresAt] = useState('')
  const [savingBanner, setSavingBanner] = useState(false)

  // Notification Form State
  const [notifMessage, setNotifMessage] = useState('')
  const [notifType, setNotifType] = useState<'MESSAGE' | 'UPDATE' | 'NEWS' | 'WARNING'>('MESSAGE')
  const [notifLink, setNotifLink] = useState('')
  const [notifUserId, setNotifUserId] = useState<string>('all')
  const [userSearch, setUserSearch] = useState('')
  const [savingNotification, setSavingNotification] = useState(false)

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({ show: false, title: '', message: '', onConfirm: () => {} })

  // Notification Typ-Farben
  const typeColors = {
    MESSAGE: '#22D6DD',   // Türkis
    UPDATE: '#22D6DD',    // Türkis
    NEWS: '#22D6DD',      // Türkis
    WARNING: '#EC4899',   // Pink
  }

  useEffect(() => {
    fetchBanners()
    fetchNotifications()
    fetchUsers()
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

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/admin/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users?.map((u: { id: string; email: string }) => ({ id: u.id, email: u.email })) || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    
    setSavingBanner(true)
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
        resetBannerForm()
        fetchBanners()
      }
    } catch (error) {
      console.error('Error creating banner:', error)
    } finally {
      setSavingBanner(false)
    }
  }

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!notifMessage.trim()) return
    
    setSavingNotification(true)
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: notifMessage,
          type: notifType,
          backgroundColor: typeColors[notifType],
          link: notifLink || null,
          userId: notifUserId === 'all' ? null : notifUserId,
        }),
      })
      
      if (res.ok) {
        resetNotificationForm()
        fetchNotifications()
      }
    } catch (error) {
      console.error('Error creating notification:', error)
    } finally {
      setSavingNotification(false)
    }
  }

  const resetBannerForm = () => {
    setText('')
    setBackgroundColor('#22D6DD')
    setTextColor('#ffffff')
    setCloseButtonColor('#ffffff')
    setShowOnWebsite(true)
    setShowOnPortal(true)
    setExpiresAt('')
    setShowBannerForm(false)
  }

  const resetNotificationForm = () => {
    setNotifMessage('')
    setNotifType('MESSAGE')
    setNotifLink('')
    setNotifUserId('all')
    setUserSearch('')
    setShowNotificationForm(false)
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

  const showDeleteBannerConfirm = (id: string) => {
    setConfirmDialog({
      show: true,
      title: 'Infoleiste löschen?',
      message: 'Möchtest du diese Infoleiste wirklich löschen?',
      onConfirm: async () => {
        try {
          await fetch(`/api/admin/infobanner/${id}`, { method: 'DELETE' })
          fetchBanners()
        } catch (error) {
          console.error('Error deleting banner:', error)
        }
        setConfirmDialog({ show: false, title: '', message: '', onConfirm: () => {} })
      }
    })
  }

  const showDeleteNotificationConfirm = (id: string) => {
    setConfirmDialog({
      show: true,
      title: 'Benachrichtigung löschen?',
      message: 'Möchtest du diese Benachrichtigung wirklich löschen?',
      onConfirm: async () => {
        try {
          await fetch(`/api/admin/notifications/${id}`, { method: 'DELETE' })
          fetchNotifications()
        } catch (error) {
          console.error('Error deleting notification:', error)
        }
        setConfirmDialog({ show: false, title: '', message: '', onConfirm: () => {} })
      }
    })
  }

  // Gefilterte Benutzer für Suche
  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  )

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
              Infoleisten & Nachrichten
            </h1>
            <p className="text-muted-foreground mt-1">
              Erstelle Ankündigungen für Website/Portal und sende Benachrichtigungen
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => { setShowNotificationForm(!showNotificationForm); setShowBannerForm(false) }}
              variant={showNotificationForm ? 'default' : 'outline'}
              className={showNotificationForm ? 'bg-[#EC4899] hover:bg-[#EC4899] hover:-translate-y-0.5 transition-transform' : 'border-[#EC4899] text-[#EC4899] hover:bg-transparent hover:-translate-y-0.5 transition-transform'}
            >
              <Bell className="h-4 w-4 mr-2" />
              Neue Nachricht
            </Button>
            <Button 
              onClick={() => { setShowBannerForm(!showBannerForm); setShowNotificationForm(false) }}
              className="bg-[#22D6DD] hover:bg-[#22D6DD]/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Neue Infoleiste
            </Button>
          </div>
        </div>

        {/* Notification Form */}
        {showNotificationForm && (
          <Card className="border-[#EC4899]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#EC4899]" />
                Neue Benachrichtigung erstellen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNotificationSubmit} className="space-y-6">
                {/* Empfänger */}
                <div>
                  <label className="block text-sm font-medium mb-2">Empfänger</label>
                  <div className="space-y-3">
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="recipient"
                          checked={notifUserId === 'all'}
                          onChange={() => setNotifUserId('all')}
                          className="w-4 h-4 accent-[#22D6DD] border-0 outline-none focus:ring-0"
                          style={{ accentColor: '#22D6DD' }}
                        />
                        <Users className="h-4 w-4" />
                        Alle Benutzer
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="recipient"
                          checked={notifUserId !== 'all'}
                          onChange={() => setNotifUserId('')}
                          className="w-4 h-4 accent-[#22D6DD] border-0 outline-none focus:ring-0"
                          style={{ accentColor: '#22D6DD' }}
                        />
                        Einzelner Benutzer
                      </label>
                    </div>
                    
                    {notifUserId !== 'all' && (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          placeholder="E-Mail suchen..."
                          className="pl-10"
                        />
                        {userSearch && (
                          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-[#d9dde1] dark:border-slate-700 rounded-[9px] shadow-lg max-h-40 overflow-y-auto">
                            {filteredUsers.length > 0 ? (
                              filteredUsers.slice(0, 5).map(user => (
                                <button
                                  key={user.id}
                                  type="button"
                                  onClick={() => {
                                    setNotifUserId(user.id)
                                    setUserSearch(user.email)
                                  }}
                                  className="w-full px-4 py-2 text-left hover:bg-[#22D6DD]/10 flex items-center gap-2"
                                >
                                  {notifUserId === user.id && <Check className="h-4 w-4 text-[#22D6DD]" />}
                                  {user.email}
                                </button>
                              ))
                            ) : (
                              <p className="px-4 py-2 text-muted-foreground text-sm">Kein Benutzer gefunden</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Typ */}
                <div>
                  <label className="block text-sm font-medium mb-2">Nachrichtentyp</label>
                  <div className="flex gap-4">
                    {[
                      { value: 'MESSAGE', label: 'Nachricht', color: '#22D6DD' },
                      { value: 'UPDATE', label: 'Update', color: '#22D6DD' },
                      { value: 'NEWS', label: 'Neuigkeit', color: '#22D6DD' },
                      { value: 'WARNING', label: 'Warnung', color: '#EC4899' },
                    ].map(({ value, label, color }) => (
                      <label 
                        key={value}
                        className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-[9px] border-2 transition-all ${
                          notifType === value 
                            ? `border-[${color}] bg-[${color}]/10` 
                            : 'border-[#d9dde1] dark:border-slate-700'
                        }`}
                        style={{
                          borderColor: notifType === value ? color : undefined,
                          backgroundColor: notifType === value ? `${color}15` : undefined,
                        }}
                      >
                        <input
                          type="radio"
                          name="type"
                          value={value}
                          checked={notifType === value}
                          onChange={(e) => setNotifType(e.target.value as typeof notifType)}
                          className="sr-only"
                        />
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Text */}
                <div>
                  <label className="block text-sm font-medium mb-2">Nachricht *</label>
                  <Textarea
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    placeholder="Ihre Nachricht hier eingeben..."
                    rows={2}
                    required
                  />
                </div>

                {/* Link (optional) */}
                <div>
                  <label className="block text-sm font-medium mb-2">Link (optional)</label>
                  <Input
                    value={notifLink}
                    onChange={(e) => setNotifLink(e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                {/* Vorschau */}
                <div>
                  <label className="block text-sm font-medium mb-2">Vorschau</label>
                  <div 
                    className="p-4 rounded-[9px] border-l-4"
                    style={{ 
                      borderLeftColor: typeColors[notifType],
                      backgroundColor: `${typeColors[notifType]}10`
                    }}
                  >
                    <p className="font-medium">{notifMessage || 'Ihre Nachricht...'}</p>
                    {notifLink && (
                      <p className="text-sm text-muted-foreground mt-1">{notifLink}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={resetNotificationForm}>
                    Abbrechen
                  </Button>
                  <Button type="submit" disabled={savingNotification} className="bg-[#EC4899] hover:bg-[#EC4899]/90">
                    {savingNotification ? 'Wird gesendet...' : 'Senden'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Banner Form */}
        {showBannerForm && (
          <Card>
            <CardHeader>
              <CardTitle>Neue Infoleiste erstellen</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBannerSubmit} className="space-y-6">
                {/* Text */}
                <div>
                  <label className="block text-sm font-medium mb-2">Text *</label>
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="🎉 Noch 2 Wochen: 20% Rabatt auf alle API-Keys!"
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

                {/* Anzeigen auf - Custom Checkboxen */}
                <div>
                  <label className="block text-sm font-medium mb-2">Anzeigen auf</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div 
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          showOnWebsite 
                            ? 'bg-white border-[#22D6DD]' 
                            : 'bg-white border-[#d9dde1]'
                        }`}
                        onClick={() => setShowOnWebsite(!showOnWebsite)}
                      >
                        {showOnWebsite && <Check className="h-4 w-4 text-[#22D6DD]" strokeWidth={3} />}
                      </div>
                      <Globe className="h-4 w-4" />
                      Website
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div 
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          showOnPortal 
                            ? 'bg-white border-[#22D6DD]' 
                            : 'bg-white border-[#d9dde1]'
                        }`}
                        onClick={() => setShowOnPortal(!showOnPortal)}
                      >
                        {showOnPortal && <Check className="h-4 w-4 text-[#22D6DD]" strokeWidth={3} />}
                      </div>
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
                  <Button type="button" variant="outline" onClick={resetBannerForm}>
                    Abbrechen
                  </Button>
                  <Button type="submit" disabled={savingBanner} className="bg-[#22D6DD] hover:bg-[#22D6DD]/90">
                    {savingBanner ? 'Wird erstellt...' : 'Erstellen'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-[#EC4899]" />
              Nachrichten-Verlauf ({notifications.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Noch keine Benachrichtigungen gesendet
              </p>
            ) : (
              <div className={`space-y-3 ${notifications.length > 4 ? 'max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#22D6DD]/50 scrollbar-track-transparent hover:scrollbar-thumb-[#22D6DD]' : ''}`}>
                {notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className="p-4 rounded-[9px] border-l-4 border border-[#d9dde1] dark:border-slate-700 flex items-start justify-between"
                    style={{ borderLeftColor: notif.backgroundColor }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          style={{ backgroundColor: `${notif.backgroundColor}20`, color: notif.backgroundColor }}
                        >
                          {notif.type === 'MESSAGE' && 'Nachricht'}
                          {notif.type === 'UPDATE' && 'Update'}
                          {notif.type === 'NEWS' && 'Neuigkeit'}
                          {notif.type === 'WARNING' && 'Warnung'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {notif.userId ? notif.user?.email : 'Alle Benutzer'}
                        </span>
                      </div>
                      <p className="font-medium">{notif.message}</p>
                      {notif.link && (
                        <p className="text-sm text-muted-foreground mt-1">{notif.link}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notif.createdAt).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => showDeleteNotificationConfirm(notif.id)}
                      className="p-2 text-slate-500 hover:text-[#EC4899]"
                      title="Löschen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
              <div className={`space-y-4 ${banners.length > 4 ? 'max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#22D6DD]/50 scrollbar-track-transparent hover:scrollbar-thumb-[#22D6DD]' : ''}`}>
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
                          onClick={() => showDeleteBannerConfirm(banner.id)}
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

      {/* Eigener Confirm-Dialog */}
      {confirmDialog.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-[#1A1F23] rounded-[9px] w-full max-w-sm mx-4 shadow-2xl border border-[#d9dde1] dark:border-slate-700 overflow-hidden">
            <div className="px-5 py-4 border-b border-[#d9dde1] dark:border-slate-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">{confirmDialog.title}</h3>
            </div>
            <div className="px-5 py-4">
              <p className="text-gray-600 dark:text-gray-300">{confirmDialog.message}</p>
            </div>
            <div className="px-5 py-3 bg-[#FAFAFA] dark:bg-slate-800 border-t border-[#d9dde1] dark:border-slate-700 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDialog({ show: false, title: '', message: '', onConfirm: () => {} })}
              >
                Nein
              </Button>
              <Button
                size="sm"
                onClick={confirmDialog.onConfirm}
                className="bg-[#EC4899] hover:bg-[#EC4899]/90"
              >
                Ja
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
