'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Building, MapPin, Phone, Globe, CheckCircle2, X, Save } from 'lucide-react'

interface SettingsContentProps {
  user: {
    id?: string
    email: string
    name?: string | null
    role: string
  }
}

interface Notification {
  type: 'success' | 'error'
  message: string
}

export default function SettingsContent({ user }: SettingsContentProps) {
  const [loading, setSaving] = useState(false)
  const [notification, setNotification] = useState<Notification | null>(null)
  
  // Form State
  const [formData, setFormData] = useState({
    name: user.name || '',
    company: '',
    street: '',
    zip: '',
    city: '',
    country: 'Deutschland',
    phone: '',
    website: '',
    vatId: '',
  })

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 4000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (data.success) {
        showNotification('success', 'Einstellungen gespeichert!')
      } else {
        showNotification('error', data.error || 'Fehler beim Speichern')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      showNotification('error', 'Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-12 space-y-6">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-right ${
          notification.type === 'success' 
            ? 'bg-[#22D6DD] text-white' 
            : 'bg-[#EC4899] text-white'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <X className="h-5 w-5" />
          )}
          <span className="font-medium">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-70">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-slate-900">Einstellungen</h1>
        <p className="text-slate-600 mt-2">Verwalte deine persönlichen Daten und Rechnungsadresse</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-[#22D6DD]" />
              Account-Informationen
            </CardTitle>
            <CardDescription>
              Deine grundlegenden Account-Daten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail-Adresse</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                    className="pl-10 bg-slate-50"
                  />
                </div>
                <p className="text-xs text-slate-500">E-Mail kann nicht geändert werden</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Vollständiger Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="name"
                    name="name"
                    placeholder="Max Mustermann"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <span className="text-sm text-slate-600">Rolle:</span>
              <Badge className={user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'}>
                {user.role === 'ADMIN' ? 'Administrator' : 'Benutzer'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Rechnungsadresse */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-[#22D6DD]" />
              Rechnungsadresse
            </CardTitle>
            <CardDescription>
              Wird für Rechnungen und Bestellungen verwendet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Firma und Straße nebeneinander (50/50) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Firma / Unternehmen (optional)</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="company"
                    name="company"
                    placeholder="Meine Firma GmbH"
                    value={formData.company}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">Straße + Hausnummer</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="street"
                    name="street"
                    placeholder="Musterstraße 123"
                    value={formData.street}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* PLZ und Stadt nebeneinander (50/50) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zip">PLZ</Label>
                <Input
                  id="zip"
                  name="zip"
                  placeholder="12345"
                  value={formData.zip}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Stadt</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="Berlin"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Land</Label>
              <Input
                id="country"
                name="country"
                placeholder="Deutschland"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Kontaktdaten */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-[#22D6DD]" />
              Weitere Kontaktdaten
            </CardTitle>
            <CardDescription>
              Optionale Kontaktinformationen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon (optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+49 123 456789"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website (optional)</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="website"
                    name="website"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vatId">USt-IdNr. (optional)</Label>
              <Input
                id="vatId"
                name="vatId"
                placeholder="DE123456789"
                value={formData.vatId}
                onChange={handleChange}
              />
              <p className="text-xs text-slate-500">Für Rechnungen innerhalb der EU</p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#22D6DD] hover:bg-[#1EBEC5] text-white px-8"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Speichern...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Einstellungen speichern
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

