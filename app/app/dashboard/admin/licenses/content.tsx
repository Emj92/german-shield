'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Key, Plus, Copy, Check, Mail, X, CheckCircle2 } from 'lucide-react'

type PackageType = 'FREE' | 'SINGLE' | 'FREELANCER' | 'AGENCY'

interface GeneratedLicense {
  id: string
  licenseKey: string
  packageType: string
  expiresAt: string
  maxDomains: number
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
  const [loading, setLoading] = useState(false)
  const [generatedLicenses, setGeneratedLicenses] = useState<GeneratedLicense[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [notification, setNotification] = useState<Notification | null>(null)

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
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
        body: JSON.stringify({ email, packageType }),
      })

      const data = await res.json()

      if (data.success) {
        setGeneratedLicenses(prev => [data.license, ...prev])
        setEmail('')
        showNotification('success', 'Lizenz erfolgreich erstellt!')
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
      <Card className="border">
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

          {/* Package Selection */}
          <div className="space-y-2">
            <Label>Paket auswählen</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {packages.map((pkg) => (
                <button
                  key={pkg.type}
                  onClick={() => setPackageType(pkg.type as PackageType)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    packageType === pkg.type
                      ? 'border-[#22D6DD] bg-[#22D6DD]/5'
                      : 'border-slate-200 hover:border-slate-300'
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
            className="w-full bg-[#22D6DD] hover:bg-[#1EBEC5] text-white"
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

      {/* Generated Licenses Table */}
      {generatedLicenses.length > 0 && (
        <Card className="border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-[#22D6DD]">
              <Check className="h-5 w-5" />
              Generierte Lizenzen ({generatedLicenses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium text-slate-600">Lizenzschlüssel</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-600">E-Mail</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-600">Paket</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-600">Gültig bis</th>
                    <th className="text-left py-2 px-3 font-medium text-slate-600"></th>
                  </tr>
                </thead>
                <tbody>
                  {generatedLicenses.map((license) => (
                    <tr key={license.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="py-2 px-3">
                        <code className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">
                          {license.licenseKey}
                        </code>
                      </td>
                      <td className="py-2 px-3 text-slate-700">
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
                      <td className="py-2 px-3 text-slate-700">
                        {new Date(license.expiresAt).toLocaleDateString('de-DE')}
                      </td>
                      <td className="py-2 px-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(license.licenseKey, license.id)}
                          className="h-8 w-8 p-0"
                        >
                          {copiedId === license.id ? <Check className="h-4 w-4 text-[#22D6DD]" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

