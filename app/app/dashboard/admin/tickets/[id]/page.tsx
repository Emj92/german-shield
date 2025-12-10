'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Send, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

interface Response {
  id: string
  message: string
  isAdmin: boolean
  createdAt: string
  user: {
    email: string
    name: string | null
  }
}

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
  responses: Response[]
}

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [updating, setUpdating] = useState(false)

  const fetchTicket = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/tickets/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setTicket(data)
      }
    } catch (error) {
      console.error('Fehler beim Laden:', error)
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchTicket()
  }, [fetchTicket])

  async function handleStatusChange(newStatus: string) {
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/tickets/${params.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        fetchTicket()
      }
    } catch (error) {
      console.error('Fehler beim Status-Update:', error)
    } finally {
      setUpdating(false)
    }
  }

  async function handleReply() {
    if (!reply.trim()) return
    setSending(true)
    try {
      const res = await fetch(`/api/admin/tickets/${params.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: reply }),
      })
      if (res.ok) {
        setReply('')
        fetchTicket()
      }
    } catch (error) {
      console.error('Fehler beim Senden:', error)
    } finally {
      setSending(false)
    }
  }

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

  const categoryEmoji = {
    FEHLER: '🐛',
    VORSCHLAG: '💡',
    HILFE: '🤝',
  }

  if (loading) {
    return (
      <DashboardLayout user={{ email: '', role: 'ADMIN' }}>
        <div className="p-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#22D6DD]" />
        </div>
      </DashboardLayout>
    )
  }

  if (!ticket) {
    return (
      <DashboardLayout user={{ email: '', role: 'ADMIN' }}>
        <div className="p-12">
          <p>Ticket nicht gefunden</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={{ email: '', role: 'ADMIN' }}>
      <div className="p-12 space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
        </div>

        {/* Ticket Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">
                    {categoryEmoji[ticket.category as keyof typeof categoryEmoji]}
                  </span>
                  <CardTitle>{ticket.subject}</CardTitle>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Von: {ticket.user.email}</span>
                  <span>•</span>
                  <span>{new Date(ticket.createdAt).toLocaleString('de-DE')}</span>
                </div>
              </div>
              <Badge variant={statusColors[ticket.status as keyof typeof statusColors]}>
                {statusLabels[ticket.status as keyof typeof statusLabels]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-[#F2F5F8] rounded-lg p-4 mb-6 whitespace-pre-wrap">
              {ticket.message}
            </div>

            {/* Status-Buttons */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-sm font-semibold mr-2">Status ändern:</span>
              <Button
                size="sm"
                variant={ticket.status === 'OPEN' ? 'default' : 'outline'}
                onClick={() => handleStatusChange('OPEN')}
                disabled={updating}
                className="gap-1"
              >
                <AlertCircle className="h-4 w-4" />
                Offen
              </Button>
              <Button
                size="sm"
                variant={ticket.status === 'IN_PROGRESS' ? 'default' : 'outline'}
                onClick={() => handleStatusChange('IN_PROGRESS')}
                disabled={updating}
                className="gap-1"
              >
                <Clock className="h-4 w-4" />
                In Bearbeitung
              </Button>
              <Button
                size="sm"
                variant={ticket.status === 'WAITING' ? 'default' : 'outline'}
                onClick={() => handleStatusChange('WAITING')}
                disabled={updating}
                className="gap-1"
              >
                <Clock className="h-4 w-4" />
                Wartend
              </Button>
              <Button
                size="sm"
                variant={ticket.status === 'CLOSED' ? 'default' : 'outline'}
                onClick={() => handleStatusChange('CLOSED')}
                disabled={updating}
                className="gap-1"
              >
                <CheckCircle2 className="h-4 w-4" />
                Geschlossen
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Antworten */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Verlauf ({ticket.responses.length} Antworten)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              {ticket.responses.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Noch keine Antworten
                </p>
              ) : (
                ticket.responses.map((response) => (
                  <div
                    key={response.id}
                    className={`p-4 rounded-lg ${
                      response.isAdmin
                        ? 'bg-[#22D6DD]/10 border-l-4 border-[#22D6DD]'
                        : 'bg-[#F2F5F8] border-l-4 border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">
                        {response.isAdmin ? '🛡️ Support' : '👤 Kunde'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(response.createdAt).toLocaleString('de-DE')}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{response.message}</p>
                  </div>
                ))
              )}
            </div>

            {/* Antwort-Formular */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Als Admin antworten:</h4>
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Deine Antwort..."
                rows={4}
                className="mb-4"
              />
              <Button
                onClick={handleReply}
                disabled={sending || !reply.trim()}
                className="bg-[#22D6DD] hover:bg-[#1BA8B0]"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Antwort senden
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

