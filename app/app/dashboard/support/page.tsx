import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/auth'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, Plus } from 'lucide-react'
import { prisma } from '@/lib/db'

async function getUserTickets(userId: string) {
  return await prisma.supportTicket.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { responses: true }
      }
    }
  })
}

export default async function SupportPage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  const tickets = await getUserTickets(user.userId)

  const getStatusBadge = (status: string) => {
    const styles = {
      OPEN: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      WAITING: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      CLOSED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    }
    const labels = {
      OPEN: 'Offen',
      IN_PROGRESS: 'In Bearbeitung',
      WAITING: 'Wartet',
      CLOSED: 'Geschlossen',
    }
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const getCategoryLabel = (category: string) => {
    const labels = {
      FEHLER: '🐛 Fehler',
      VORSCHLAG: '💡 Vorschlag',
      HILFE: '🤝 Hilfe',
    }
    return labels[category as keyof typeof labels]
  }

  return (
    <DashboardLayout user={{ email: user.email, role: user.role }}>
      <div className="p-12 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Support</h1>
            <p className="text-muted-foreground">
              Ihre Support-Anfragen und Tickets
            </p>
          </div>
          <Button asChild className="bg-[#22D6DD] hover:bg-[#22D6DD]/90 text-white">
            <Link href="/dashboard/support/new">
              <Plus className="mr-2 h-4 w-4" />
              Neues Ticket
            </Link>
          </Button>
        </div>

        {tickets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Keine Support-Tickets</p>
              <p className="text-sm text-muted-foreground mb-4">
                Erstellen Sie ein Ticket, wenn Sie Hilfe benötigen
              </p>
              <Button asChild className="bg-[#22D6DD] hover:bg-[#22D6DD]/90 text-white">
                <Link href="/dashboard/support/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Ticket erstellen
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="hover:border-[#22D6DD] transition-colors cursor-pointer">
                <a href={`/dashboard/support/${ticket.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle>{ticket.subject}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <span>{getCategoryLabel(ticket.category)}</span>
                          <span>•</span>
                          <span>{new Date(ticket.createdAt).toLocaleDateString('de-DE')}</span>
                          {ticket._count.responses > 0 && (
                            <>
                              <span>•</span>
                              <span>{ticket._count.responses} Antworten</span>
                            </>
                          )}
                        </CardDescription>
                      </div>
                      {getStatusBadge(ticket.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {ticket.message}
                    </p>
                  </CardContent>
                </a>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

