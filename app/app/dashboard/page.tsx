import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, AlertTriangle, CheckCircle, Activity } from 'lucide-react'
import { prisma } from '@/lib/db'

type AdminDashboardData = {
  totalUsers: number
  totalInstallations: number
  recentTickets: number
  totalBlocks: number
}

type UserDashboardData = {
  installations: number
  invoices: number
  tickets: number
}

async function getDashboardData(userId: string, isAdmin: boolean): Promise<AdminDashboardData | UserDashboardData> {
  if (isAdmin) {
    // Admin: Globale Statistiken
    const [totalUsers, totalInstallations, recentTickets, totalBlocks] = await Promise.all([
      prisma.user.count(),
      prisma.installation.count(),
      prisma.supportTicket.count({ where: { status: 'OPEN' } }),
      prisma.telemetryEvent.count(),
    ])

    return {
      totalUsers,
      totalInstallations,
      recentTickets,
      totalBlocks,
    }
  } else {
    // User: Persönliche Statistiken
    const [installations, invoices, tickets] = await Promise.all([
      prisma.installation.count({ where: { userId } }),
      prisma.invoice.count({ where: { userId } }),
      prisma.supportTicket.count({ where: { userId } }),
    ])

    return {
      installations,
      invoices,
      tickets,
    }
  }
}

export default async function DashboardPage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  const data = await getDashboardData(user.userId, user.role === 'ADMIN')
  const isAdmin = user.role === 'ADMIN'

  return (
    <DashboardLayout user={{ email: user.email, role: user.role }}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Willkommen zurück, {user.email}
          </p>
        </div>

        {isAdmin ? (
          // Admin Dashboard
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Benutzer</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{'totalUsers' in data ? data.totalUsers : 0}</div>
                <p className="text-xs text-muted-foreground">Registrierte Benutzer</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Installationen</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{'totalInstallations' in data ? data.totalInstallations : 0}</div>
                <p className="text-xs text-muted-foreground">Aktive Installationen</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Support-Tickets</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{'recentTickets' in data ? data.recentTickets : 0}</div>
                <p className="text-xs text-muted-foreground">Offene Tickets</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Spam blockiert</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {('totalBlocks' in data ? data.totalBlocks : 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Gesamt blockiert</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          // User Dashboard
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Installationen</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{'installations' in data ? data.installations : 0}</div>
                <p className="text-xs text-muted-foreground">Aktive Seiten</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rechnungen</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{'invoices' in data ? data.invoices : 0}</div>
                <p className="text-xs text-muted-foreground">Rechnungen</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Support-Tickets</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{'tickets' in data ? data.tickets : 0}</div>
                <p className="text-xs text-muted-foreground">Ihre Tickets</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Schnellzugriff</CardTitle>
            <CardDescription>
              Die wichtigsten Funktionen für Sie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <a
                href="/dashboard/downloads"
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-card-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Shield className="h-5 w-5" />
                <span>Plugin herunterladen</span>
              </a>
              <a
                href="/dashboard/support"
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-card-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <AlertTriangle className="h-5 w-5" />
                <span>Support kontaktieren</span>
              </a>
              <a
                href="/dashboard/invoices"
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-card-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <CheckCircle className="h-5 w-5" />
                <span>Rechnungen ansehen</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
