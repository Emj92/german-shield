'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Mail, AlertCircle, CheckCircle2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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
    maxDomains: number
    activeDomains: { domain: string }[]
  }[]
  supportTickets: {
    id: string
    status: string
  }[]
}

export default function AdminUsersContent() {
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#22D6DD] mx-auto mb-4"></div>
          <p className="text-slate-600">Lade Benutzer...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-12 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Benutzerverwaltung</h1>
        <p className="text-slate-600 mt-2">Übersicht aller Benutzer und ihrer Lizenzen</p>
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

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">E-Mail / Name</TableHead>
                  <TableHead className="font-semibold">Rolle</TableHead>
                  <TableHead className="font-semibold">Lizenzen</TableHead>
                  <TableHead className="font-semibold">Domains</TableHead>
                  <TableHead className="font-semibold">Tickets</TableHead>
                  <TableHead className="font-semibold">Registriert</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      Keine Benutzer gefunden
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-slate-50">
                      {/* E-Mail / Name */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-[#22D6DD] flex-shrink-0" />
                          <div>
                            <p className="font-medium">{user.email}</p>
                            {user.name && (
                              <p className="text-xs text-slate-500">{user.name}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Rolle */}
                      <TableCell>
                        {user.role === 'ADMIN' ? (
                          <Badge className="bg-purple-100 text-purple-800">Admin</Badge>
                        ) : (
                          <Badge variant="outline">User</Badge>
                        )}
                      </TableCell>

                      {/* Lizenzen */}
                      <TableCell>
                        {user.licenses.length > 0 ? (
                          <div className="space-y-1">
                            {user.licenses.map((license) => (
                              <div key={license.id}>
                                <Badge className={`${getPackageColor(license.packageType)} text-xs`}>
                                  {license.packageType}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Keine</span>
                        )}
                      </TableCell>

                      {/* Domains */}
                      <TableCell>
                        {user.licenses.length > 0 ? (
                          <div className="space-y-1">
                            {user.licenses.map((license) => (
                              <div key={license.id} className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                                <span className="text-sm">
                                  {license.activeDomains.length} / {license.maxDomains || 0}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </TableCell>

                      {/* Support Tickets */}
                      <TableCell>
                        {user.supportTickets.filter(t => t.status === 'OPEN').length > 0 ? (
                          <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                            <AlertCircle className="h-3 w-3" />
                            {user.supportTickets.filter(t => t.status === 'OPEN').length}
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-400">Keine</span>
                        )}
                      </TableCell>

                      {/* Registriert */}
                      <TableCell>
                        <span className="text-sm text-slate-600">
                          {new Date(user.createdAt).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-[#22D6DD]">{users.length}</p>
              <p className="text-sm text-slate-600 mt-1">Gesamt Benutzer</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {users.filter(u => u.licenses.some(l => l.status === 'ACTIVE')).length}
              </p>
              <p className="text-sm text-slate-600 mt-1">Aktive Lizenzen</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                {users.reduce((sum, u) => sum + u.licenses.reduce((s, l) => s + l.activeDomains.length, 0), 0)}
              </p>
              <p className="text-sm text-slate-600 mt-1">Aktivierte Domains</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">
                {users.reduce((sum, u) => sum + u.supportTickets.filter(t => t.status === 'OPEN').length, 0)}
              </p>
              <p className="text-sm text-slate-600 mt-1">Offene Tickets</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

