'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Key, Plus, Trash2, Copy, Check, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react'

interface License {
  id: string
  licenseKey: string
  packageType: string
  status: string
  expiresAt: string
  maxDomains: number
  isActive: boolean
  activeDomains: {
    id: string
    domain: string
    registeredAt: string
    lastSeenAt: string
  }[]
}

export default function UserLicensesContent() {
  const [licenses, setLicenses] = useState<License[]>([])
  const [loading, setLoading] = useState(true)
  const [newDomains, setNewDomains] = useState<Record<string, string>>({})
  const [addingDomain, setAddingDomain] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    fetchLicenses()
  }, [])

  const fetchLicenses = async () => {
    try {
      const res = await fetch('/api/licenses/my-licenses')
      const data = await res.json()
      setLicenses(data.licenses || [])
    } catch (error) {
      console.error('Failed to fetch licenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const addDomain = async (licenseId: string, licenseKey: string) => {
    const domain = newDomains[licenseId]?.trim()
    if (!domain) {
      alert('Bitte Domain eingeben')
      return
    }

    setAddingDomain(licenseId)
    try {
      const res = await fetch('/api/licenses/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey, domain }),
      })

      const data = await res.json()

      if (data.success) {
        setNewDomains(prev => ({ ...prev, [licenseId]: '' }))
        fetchLicenses()
        alert('Domain erfolgreich hinzugefügt!')
      } else {
        alert(data.error || 'Fehler beim Hinzufügen')
      }
    } catch (error) {
      console.error('Failed to add domain:', error)
      alert('Fehler beim Hinzufügen')
    } finally {
      setAddingDomain(null)
    }
  }

  const removeDomain = async (domainId: string) => {
    if (!confirm('Domain wirklich entfernen?')) return

    try {
      const res = await fetch(`/api/licenses/domains?domainId=${domainId}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (data.success) {
        fetchLicenses()
        alert('Domain erfolgreich entfernt!')
      } else {
        alert(data.error || 'Fehler beim Entfernen')
      }
    } catch (error) {
      console.error('Failed to remove domain:', error)
      alert('Fehler beim Entfernen')
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const getPackageColor = (packageType: string) => {
    switch (packageType) {
      case 'FREE': return 'bg-gray-100 text-gray-700'
      case 'SINGLE': return 'bg-[#22D6DD]/10 text-[#22D6DD]'
      case 'FREELANCER': return 'bg-[#22D6DD]/20 text-[#22D6DD]'
      case 'AGENCY': return 'bg-[#EC4899]/10 text-[#EC4899]'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-[#22D6DD]/10 text-[#22D6DD]'
      case 'EXPIRED': return 'bg-[#EC4899]/10 text-[#EC4899]'
      case 'SUSPENDED': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const activeLicensesCount = licenses.filter(l => l.status === 'ACTIVE').length
  const totalDomains = licenses.reduce((sum, l) => sum + l.activeDomains.length, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#22D6DD] mx-auto mb-4"></div>
          <p className="text-slate-600">Lade Lizenzen...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Meine Lizenzen</h1>
        <p className="text-slate-600 mt-2">Verwalte deine GermanFence Lizenzen und aktivierte Domains</p>
      </div>

      {/* Übersicht */}
      {licenses.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-slate-500 mb-1">Lizenzen gesamt</p>
                <p className="text-3xl font-bold text-slate-900">{licenses.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-slate-500 mb-1">Aktive Lizenzen</p>
                <p className="text-3xl font-bold text-[#22D6DD]">{activeLicensesCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-slate-500 mb-1">Aktivierte Domains</p>
                <p className="text-3xl font-bold text-slate-900">{totalDomains}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {licenses.length === 0 ? (
        <Card className="border">
          <CardContent className="py-12 text-center">
            <Key className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine Lizenzen vorhanden</h3>
            <p className="text-slate-600 mb-4">
              Du hast noch keine Lizenz erworben. Besuche unsere Website, um eine Lizenz zu kaufen.
            </p>
            <Button asChild className="bg-[#22D6DD] hover:bg-[#1EBEC5]">
              <a href="https://germanfence.de" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Zur Website
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {licenses.map((license) => (
            <Card key={license.id} className="border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5 text-[#22D6DD]" />
                      Lizenzschlüssel
                    </CardTitle>
                    <CardDescription className="mt-2">
                      <div className="flex items-center gap-2 mt-1">
                        <code className="bg-slate-100 px-3 py-1.5 rounded font-mono text-sm font-bold text-slate-900">
                          {license.licenseKey}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(license.licenseKey, license.id)}
                        >
                          {copied === license.id ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPackageColor(license.packageType)}>
                      {license.packageType}
                    </Badge>
                    <Badge className={getStatusBadgeColor(license.status)}>
                      {license.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Lizenz-Info */}
                <div className="grid grid-cols-3 gap-4 p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-xs text-slate-500">Gültig bis</p>
                    <p className="font-semibold">
                      {new Date(license.expiresAt).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Max. Domains</p>
                    <p className="font-semibold">{license.maxDomains}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Aktiviert</p>
                    <p className="font-semibold">
                      {license.activeDomains.length} / {license.maxDomains}
                    </p>
                  </div>
                </div>

                {/* Aktivierte Domains */}
                <div>
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Aktivierte Domains ({license.activeDomains.length})
                  </h4>
                  
                  {license.activeDomains.length > 0 ? (
                    <div className="space-y-2">
                      {license.activeDomains.map((domain) => (
                        <div
                          key={domain.id}
                          className="flex items-center justify-between p-2 bg-white border rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">{domain.domain}</p>
                            <p className="text-xs text-slate-500">
                              Registriert: {new Date(domain.registeredAt).toLocaleDateString('de-DE')}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDomain(domain.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-slate-50 rounded-lg">
                      <AlertCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">Noch keine Domains aktiviert</p>
                    </div>
                  )}
                </div>

                {/* Domain hinzufügen */}
                {license.activeDomains.length < license.maxDomains && license.status === 'ACTIVE' && (
                  <div className="border-t pt-3">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Plus className="h-4 w-4 text-[#22D6DD]" />
                      Domain hinzufügen
                    </h4>
                    <div className="flex gap-2">
                      <Input
                        placeholder="beispiel.de"
                        value={newDomains[license.id] || ''}
                        onChange={(e) => setNewDomains(prev => ({ ...prev, [license.id]: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && addDomain(license.id, license.licenseKey)}
                      />
                      <Button
                        onClick={() => addDomain(license.id, license.licenseKey)}
                        disabled={addingDomain === license.id}
                        className="bg-[#22D6DD] hover:bg-[#1EBEC5]"
                      >
                        {addingDomain === license.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Hinzufügen...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Hinzufügen
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      💡 Gib die Domain ohne http:// oder www. ein (z.B. beispiel.de)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

