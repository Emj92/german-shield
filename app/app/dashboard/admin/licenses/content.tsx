'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Key, Plus, Copy, Check, Mail, X, CheckCircle2, Search, Trash2, Lock, Unlock } from 'lucide-react'

type PackageType = 'FREE' | 'SINGLE' | 'FREELANCER' | 'AGENCY'

interface GeneratedLicense {
  id: string
  licenseKey: string
  packageType: string
  expiresAt: string
  maxDomains: number
  status: string
  isActive: boolean
  user: {
    id: string
    email: string
  } | null
}

interface Notification {
  type: 'success' | 'error'
  message: string
}

export default function AdminLicensesContent() {
  const [email, setEmail] = useState('')
  const [packageType, setPackageType] = useState<PackageType>('SINGLE')
  const [sendEmail, setSendEmail] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingAll, setLoadingAll] = useState(true)
  const [allLicenses, setAllLicenses] = useState<GeneratedLicense[]>([])
  const [filteredLicenses, setFilteredLicenses] = useState<GeneratedLicense[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [notification, setNotification] = useState<Notification | null>(null)

  // Load all licenses on mount
  useEffect(() => {
    loadAllLicenses()
  }, [])

  // Filter licenses when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLicenses(allLicenses)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredLicenses(allLicenses.filter(license => 
        license.licenseKey.toLowerCase().includes(query) ||
        license.user?.email.toLowerCase().includes(query) ||
        license.packageType.toLowerCase().includes(query)
      ))
    }
  }, [searchQuery, allLicenses])

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const loadAllLicenses = async () => {
    try {
      const res = await fetch('/api/admin/licenses/list')
      const data = await res.json()
      if (data.licenses) {
        setAllLicenses(data.licenses)
        setFilteredLicenses(data.licenses)
      }
    } catch (error) {
      console.error('Failed to load licenses:', error)
    } finally {
      setLoadingAll(false)
    }
  }

  const packages = [
    { type: 'FREE', name: 'FREE', price: '0€', domains: 1, color: 'bg-gray-100 text-gray-700' },
    { type: 'SINGLE', name: 'Single', price: '29€/Jahr', domains: 1, color: 'bg-[#22D6DD]/10 text-[#22D6DD]' },
    { type: 'FREELANCER', name: 'Freelancer', price: '79€/Jahr', domains: 5, color: 'bg-[#22D6DD]/20 text-[#22D6DD]' },
    { type: 'AGENCY', name: 'Agency', price: '199€/Jahr', domains: 25, color: 'bg-[#EC4899]/10 text-[#EC4899]' },
  ]

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/licenses/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, packageType, sendEmail }),
      })

      const data = await res.json()

      if (data.success) {
        setEmail('')
        setSendEmail(false)
        showNotification('success', 'Lizenz erfolgreich erstellt!')
        loadAllLicenses() // Reload all licenses
      } else {
        showNotification('error', data.error || 'Fehler beim Generieren')
      }
    } catch (error) {
      console.error('Failed to generate license:', error)
      showNotification('error', 'Fehler beim Generieren')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleLicense = async (licenseId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/licenses/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseId, isActive: !currentStatus }),
      })

      const data = await res.json()
      if (data.success) {
        showNotification('success', currentStatus ? 'Lizenz gesperrt!' : 'Lizenz entsperrt!')
        loadAllLicenses()
      } else {
        showNotification('error', data.error || 'Fehler')
      }
    } catch (error) {
      console.error('Toggle failed:', error)
      showNotification('error', 'Fehler beim Aktualisieren')
    }
  }

  const handleDeleteLicense = async (licenseId: string, licenseKey: string) => {
    if (!confirm(`Lizenz ${licenseKey} wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden!`)) {
      return
    }

    try {
      const res = await fetch('/api/admin/licenses/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseId }),
      })

      const data = await res.json()
      if (data.success) {
        showNotification('success', 'Lizenz gelöscht!')
        loadAllLicenses()
      } else {
        showNotification('error', data.error || 'Fehler beim Löschen')
      }
    } catch (error) {
      console.error('Delete failed:', error)
      showNotification('error', 'Fehler beim Löschen')
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="p-12 space-y-6">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
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
        <h1 className="text-3xl font-bold text-slate-900">Lizenzverwaltung</h1>
        <p className="text-slate-600 mt-2">Erstelle neue Lizenzschlüssel für Kunden</p>
      </div>

      {/* Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-[#22D6DD]" />
            Lizenzschlüssel generieren
          </CardTitle>
          <CardDescription>
            Erstelle einen neuen Lizenzschlüssel für einen Kunden
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail-Adresse des Kunden (optional)</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                id="email"
                type="email"
                placeholder="kunde@example.com (leer lassen für ungebundene Lizenz)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-slate-500">
              Leer lassen um eine ungebundene Lizenz zu erstellen. Der Kunde kann sie später selbst aktivieren.
            </p>
          </div>

          {/* Send Email Checkbox */}
          {email && email.trim() && (
            <div className="flex items-center space-x-2 p-3 bg-white border border-[#d9dde1] rounded-[9px]">
              <Checkbox
                id="sendEmail"
                checked={sendEmail}
                onCheckedChange={(checked) => setSendEmail(checked === true)}
              />
              <label
                htmlFor="sendEmail"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Bestätigungsmail an Kunden senden
              </label>
            </div>
          )}

          {/* Package Selection */}
          <div className="space-y-2">
            <Label>Paket auswählen</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {packages.map((pkg) => (
                <button
                  key={pkg.type}
                  onClick={() => setPackageType(pkg.type as PackageType)}
                  className={`p-4 rounded-[9px] border-2 transition-all ${
                    packageType === pkg.type
                      ? 'border-[#22D6DD] bg-[#22D6DD]/5'
                      : 'border-[#d9dde1] hover:border-[#22D6DD]'
                  }`}
                >
                  <Badge className={`${pkg.color} mb-2`}>{pkg.name}</Badge>
                  <div className="text-sm font-semibold">{pkg.price}</div>
                  <div className="text-xs text-slate-500">{pkg.domains} Domain{pkg.domains > 1 ? 's' : ''}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-[#22D6DD] hover:bg-[#22D6DD] text-white transition-transform hover:-translate-y-0.5"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generiere...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Lizenzschlüssel generieren
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* All Licenses Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-[#22D6DD]" />
              Alle Lizenzschlüssel ({allLicenses.length})
            </CardTitle>
            {/* Search */}
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Suche nach Key, E-Mail oder Paket..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingAll ? (
            <div className="text-center py-8 text-slate-500">
              Lade Lizenzen...
            </div>
          ) : filteredLicenses.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              {searchQuery ? 'Keine Lizenzen gefunden' : 'Noch keine Lizenzen erstellt'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#d9dde1]">
                    <th className="text-left py-2 px-3 font-medium text-slate-600">Lizenzschlüssel</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-600">E-Mail</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-600">Paket</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-600">Status</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-600">Gültig bis</th>
                    <th className="text-right py-2 px-3 font-medium text-slate-600">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLicenses.map((license) => (
                    <tr key={license.id} className="border-b border-[#d9dde1] last:border-0 hover:bg-[#F2F5F8]">
                      <td className="py-2 px-3">
                        <code className="font-mono text-xs bg-white border border-[#d9dde1] px-2 py-1 rounded-[9px]">
                          {license.licenseKey}
                        </code>
                      </td>
                      <td className="py-2 px-3 text-slate-700 text-xs">
                        {license.user?.email || <span className="text-slate-400 italic">Ungebunden</span>}
                      </td>
                      <td className="py-2 px-3">
                        <Badge className={
                          license.packageType === 'AGENCY' ? 'bg-[#EC4899]/10 text-[#EC4899]' :
                          license.packageType === 'FREELANCER' ? 'bg-[#22D6DD]/20 text-[#22D6DD]' :
                          license.packageType === 'SINGLE' ? 'bg-[#22D6DD]/10 text-[#22D6DD]' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {license.packageType}
                        </Badge>
                      </td>
                      <td className="py-2 px-3">
                        <Badge className={license.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {license.isActive ? 'Aktiv' : 'Gesperrt'}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-slate-700 text-xs">
                        {new Date(license.expiresAt).toLocaleDateString('de-DE')}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(license.licenseKey, license.id)}
                            className="h-8 w-8 p-0"
                            title="Kopieren"
                          >
                            {copiedId === license.id ? <Check className="h-4 w-4 text-[#22D6DD]" /> : <Copy className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleLicense(license.id, license.isActive)}
                            className="h-8 w-8 p-0"
                            title={license.isActive ? 'Sperren' : 'Entsperren'}
                          >
                            {license.isActive ? <Lock className="h-4 w-4 text-orange-600" /> : <Unlock className="h-4 w-4 text-green-600" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLicense(license.id, license.licenseKey)}
                            className="h-8 w-8 p-0"
                            title="Löschen"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

