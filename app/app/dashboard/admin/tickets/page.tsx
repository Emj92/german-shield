import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { MessageSquare } from 'lucide-react'

async function getAllTickets() {
  return await prisma.supportTicket.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
      _count: {
        select: {
          responses: true,
        },
      },
    },
  })
}

export default async function TicketsAdminPage() {
  const user = await getUser()
  
  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const tickets = await getAllTickets()

  const statusColors = {
    OPEN: 'destructive',
    IN_PROGRESS: 'default',
    WAITING: 'secondary',
    CLOSED: 'outline',
  } as const

  const categoryEmoji = {
    FEHLER: '🐛',
    VORSCHLAG: '💡',
    HILFE: '🤝',
  }

  return (
    <DashboardLayout user={{ email: user.email, role: user.role }}>
      <div className="p-12 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support-Tickets</h1>
          <p className="text-muted-foreground">
            Verwalte alle Support-Anfragen
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Alle Tickets ({tickets.length})
            </CardTitle>
            <CardDescription>
              Übersicht aller Support-Anfragen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tickets.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Noch keine Tickets vorhanden
                </p>
              ) : (
                tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="border border-[#d9dde1] rounded-[9px] p-4 hover:bg-[#F2F5F8] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">
                            {categoryEmoji[ticket.category]}
                          </span>
                          <h3 className="font-semibold">{ticket.subject}</h3>
                          <Badge variant={statusColors[ticket.status]}>
                            {ticket.status}
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
                    </div>
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

