'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Mail, Key, AlertCircle, CheckCircle2 } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'USER'
  createdAt: string
  licenses: {
    id: string
    licenseKey: string
    packageType: string
    status: string
    expiresAt: string
    activeDomains: { domain: string }[]
  }[]
  supportTickets: {
    id: string
    status: string
  }[]
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.name?.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'EXPIRED': return 'bg-red-100 text-red-800'
      case 'SUSPENDED': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPackageColor = (packageType: string) => {
    switch (packageType) {
      case 'FREE': return 'bg-slate-100 text-slate-700'
      case 'SINGLE': return 'bg-cyan-100 text-cyan-700'
      case 'FREELANCER': return 'bg-cyan-500 text-white'
      case 'AGENCY': return 'bg-pink-500 text-white'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#22D6DD] mx-auto mb-4"></div>
          <p className="text-slate-600">Lade Benutzer...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Benutzerverwaltung</h1>
        <p className="text-slate-600 mt-2">Verwalte alle Benutzer und ihre Lizenzen</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Benutzer suchen (E-Mail, Name)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-[#22D6DD]" />
                    {user.email}
                    {user.role === 'ADMIN' && (
                      <Badge className="bg-purple-100 text-purple-800">Admin</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {user.name || 'Kein Name'} • Registriert: {new Date(user.createdAt).toLocaleDateString('de-DE')}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {user.supportTickets.filter(t => t.status === 'OPEN').length > 0 && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {user.supportTickets.filter(t => t.status === 'OPEN').length} offene Tickets
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Lizenzen */}
              {user.licenses.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-slate-700 flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Lizenzen ({user.licenses.length})
                  </h4>
                  {user.licenses.map((license) => (
                    <div key={license.id} className="bg-slate-50 p-4 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <code className="bg-white px-3 py-1 rounded border text-sm font-mono">
                            {license.licenseKey}
                          </code>
                          <Badge className={getPackageColor(license.packageType)}>
                            {license.packageType}
                          </Badge>
                          <Badge className={getStatusColor(license.status)}>
                            {license.status}
                          </Badge>
                        </div>
                        <span className="text-sm text-slate-600">
                          Läuft ab: {new Date(license.expiresAt).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                      
                      {/* Domains */}
                      {license.activeDomains.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs text-slate-500">Aktivierte Domains:</span>
                          {license.activeDomains.map((domain, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
                              {domain.domain}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-slate-500">
                  Keine Lizenzen vorhanden
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-500">Keine Benutzer gefunden</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
