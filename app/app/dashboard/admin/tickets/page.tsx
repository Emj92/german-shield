'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { MessageSquare, ExternalLink, Search, Trash2 } from 'lucide-react'

interface Ticket {
  id: string
  subject: string
  message: string
  category: string
  status: string
  createdAt: string
  user: {
    email: string
    name: string | null
  }
  _count: {
    responses: number
  }
}

export default function TicketsAdminPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/admin/tickets')
      const data = await res.json()
      setTickets(data.tickets || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteTicket = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Ticket wirklich löschen?')) return
    
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/tickets/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setTickets(tickets.filter(t => t.id !== id))
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setDeleting(null)
    }
  }

  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(search.toLowerCase()) ||
    t.user.email.toLowerCase().includes(search.toLowerCase()) ||
    t.message.toLowerCase().includes(search.toLowerCase())
  )

  const statusColors = {
    OPEN: 'destructive',
    IN_PROGRESS: 'default',
    WAITING: 'secondary',
    CLOSED: 'outline',
  } as const

  const statusLabels = {
    OPEN: 'Offen',
    IN_PROGRESS: 'In Bearbeitung',
    WAITING: 'Wartend',
    CLOSED: 'Geschlossen',
  }

  const categoryEmoji: Record<string, string> = {
    FEHLER: '🐛',
    VORSCHLAG: '💡',
    HILFE: '🤝',
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
      <div className="p-12 space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support-Tickets</h1>
          <p className="text-muted-foreground">
            Verwalte alle Support-Anfragen
          </p>
        </div>

        {/* Suchleiste */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suche nach Betreff, E-Mail oder Nachricht..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-[#d9dde1]"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Alle Tickets ({filteredTickets.length})
            </CardTitle>
            <CardDescription>
              Übersicht aller Support-Anfragen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTickets.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {search ? 'Keine Tickets gefunden' : 'Noch keine Tickets vorhanden'}
                </p>
              ) : (
                filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="border border-[#d9dde1] rounded-[9px] p-4 hover:bg-[#F2F5F8] hover:border-[#22D6DD] transition-all group relative"
                  >
                    <Link href={`/dashboard/admin/tickets/${ticket.id}`} className="block">
                      <div className="flex items-start justify-between pr-10">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">
                              {categoryEmoji[ticket.category] || '📩'}
                            </span>
                            <h3 className="font-semibold group-hover:text-[#22D6DD] transition-colors">{ticket.subject}</h3>
                            <Badge variant={statusColors[ticket.status as keyof typeof statusColors]}>
                              {statusLabels[ticket.status as keyof typeof statusLabels] || ticket.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {ticket.message.substring(0, 150)}
                            {ticket.message.length > 150 ? '...' : ''}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Von: {ticket.user.email}</span>
                            <span>•</span>
                            <span>{new Date(ticket.createdAt).toLocaleString('de-DE')}</span>
                            <span>•</span>
                            <span>{ticket._count.responses} Antworten</span>
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                    
                    {/* Löschen-Button */}
                    <button
                      onClick={(e) => deleteTicket(ticket.id, e)}
                      disabled={deleting === ticket.id}
                      className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors"
                      title="Ticket löschen"
                    >
                      <Trash2 className={`h-4 w-4 ${deleting === ticket.id ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
