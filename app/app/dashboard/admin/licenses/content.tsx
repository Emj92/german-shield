'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Key, Plus, Copy, Check, Mail } from 'lucide-react'

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
  }
}

export default function AdminLicensesContent() {
  const [email, setEmail] = useState('')
  const [packageType, setPackageType] = useState<PackageType>('SINGLE')
  const [loading, setLoading] = useState(false)
  const [generatedLicense, setGeneratedLicense] = useState<GeneratedLicense | null>(null)
  const [copied, setCopied] = useState(false)

  const packages = [
    { type: 'FREE', name: 'FREE', price: '0€', domains: 1, color: 'bg-slate-100 text-slate-700' },
    { type: 'SINGLE', name: 'Single', price: '29€/Jahr', domains: 1, color: 'bg-cyan-100 text-cyan-700' },
    { type: 'FREELANCER', name: 'Freelancer', price: '79€/Jahr', domains: 5, color: 'bg-cyan-500 text-white' },
    { type: 'AGENCY', name: 'Agency', price: '199€/Jahr', domains: 25, color: 'bg-pink-500 text-white' },
  ]

  const handleGenerate = async () => {
    if (!email) {
      alert('Bitte E-Mail-Adresse eingeben')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/licenses/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, packageType }),
      })

      const data = await res.json()

      if (data.success) {
        setGeneratedLicense(data.license)
        setEmail('')
      } else {
        alert(data.error || 'Fehler beim Generieren')
      }
    } catch (error) {
      console.error('Failed to generate license:', error)
      alert('Fehler beim Generieren')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-8 space-y-6">
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
            <Label htmlFor="email">E-Mail-Adresse des Kunden</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                id="email"
                type="email"
                placeholder="kunde@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-slate-500">
              Falls der Kunde noch nicht existiert, wird automatisch ein Account erstellt
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
            disabled={loading || !email}
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

      {/* Generated License */}
      {generatedLicense && (
        <Card className="border bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Check className="h-5 w-5" />
              Lizenzschlüssel erfolgreich erstellt!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg space-y-3">
              <div>
                <Label className="text-xs text-slate-500">Lizenzschlüssel</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 bg-slate-100 px-4 py-3 rounded font-mono text-lg font-bold text-slate-900">
                    {generatedLicense.licenseKey}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedLicense.licenseKey)}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <Label className="text-xs text-slate-500">Kunde</Label>
                  <p className="font-medium">{generatedLicense.user.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Paket</Label>
                  <Badge className="mt-1">
                    {generatedLicense.packageType}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Max. Domains</Label>
                  <p className="font-medium">{generatedLicense.maxDomains}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Gültig bis</Label>
                  <p className="font-medium">
                    {new Date(generatedLicense.expiresAt).toLocaleDateString('de-DE')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                💡 <strong>Wichtig:</strong> Sende diesen Lizenzschlüssel per E-Mail an den Kunden. 
                Er kann ihn im WordPress-Plugin unter &quot;Lizenz&quot; eingeben.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

