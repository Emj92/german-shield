'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Mail, AlertCircle, CheckCircle2, Trash2, Ban, X } from 'lucide-react'
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
  emailVerified: boolean
  suspended?: boolean
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

interface DeleteModal {
  show: boolean
  userId: string
  email: string
}

interface Notification {
  type: 'success' | 'error'
  message: string
}

export default function AdminUsersContent() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState<DeleteModal>({ show: false, userId: '', email: '' })
  const [notification, setNotification] = useState<Notification | null>(null)

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

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const openDeleteModal = (userId: string, email: string) => {
    setDeleteModal({ show: true, userId, email })
  }

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, userId: '', email: '' })
  }

  const handleDeleteUser = async () => {
    const { userId, email } = deleteModal
    closeDeleteModal()
    
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
      if (res.ok) {
        showNotification('success', `Benutzer "${email}" gelöscht!`)
        fetchUsers()
      } else {
        showNotification('error', 'Fehler beim Löschen')
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      showNotification('error', 'Fehler beim Löschen')
    }
  }

  const handleSuspendUser = async (userId: string, currentlySuspended: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspended: !currentlySuspended })
      })
      if (res.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Failed to suspend user:', error)
    }
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.name?.toLowerCase().includes(search.toLowerCase())
  )

  const getPackageColor = (packageType: string) => {
    switch (packageType) {
      case 'FREE': return 'bg-slate-100 text-slate-700'
      case 'SINGLE': return 'bg-[#22D6DD]/10 text-[#22D6DD]'
      case 'FREELANCER': return 'bg-[#22D6DD]/20 text-[#22D6DD]'
      case 'AGENCY': return 'bg-[#EC4899]/10 text-[#EC4899]'
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

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeDeleteModal} />
          <div className="relative bg-white rounded-xl p-6 shadow-2xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Benutzer löschen?</h3>
            <p className="text-slate-600 mb-4">
              Möchtest du den Benutzer <strong>{deleteModal.email}</strong> wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={closeDeleteModal}>
                Abbrechen
              </Button>
              <Button onClick={handleDeleteUser} className="bg-[#D81B60] hover:bg-[#D81B60]/90 text-white">
                Löschen
              </Button>
            </div>
          </div>
        </div>
      )}

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
                <TableRow className="bg-white border-b border-[#d9dde1]">
                  <TableHead className="font-semibold">E-Mail / Name</TableHead>
                  <TableHead className="font-semibold">Rolle</TableHead>
                  <TableHead className="font-semibold">Lizenzen</TableHead>
                  <TableHead className="font-semibold">Domains</TableHead>
                  <TableHead className="font-semibold">Tickets</TableHead>
                  <TableHead className="font-semibold">Registriert</TableHead>
                  <TableHead className="font-semibold text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      Keine Benutzer gefunden
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-[#F2F5F8]">
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

                      {/* Aktionen */}
                      <TableCell className="text-right">
                        {user.role !== 'ADMIN' && (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleSuspendUser(user.id, user.suspended || false)}
                              className="p-2 text-slate-500"
                              title={user.suspended ? 'Entsperren' : 'Sperren'}
                            >
                              <Ban className={`h-4 w-4 ${user.suspended ? 'text-orange-500' : ''}`} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(user.id, user.email)}
                              className="p-2 text-slate-500"
                              title="Löschen"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
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

