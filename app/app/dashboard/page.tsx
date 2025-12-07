import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, AlertTriangle, CheckCircle, Activity, Key, Users, Globe } from 'lucide-react'
import { prisma } from '@/lib/db'

type PackageStats = {
  FREE: number
  SINGLE: number
  FREELANCER: number
  AGENCY: number
}

type AdminDashboardData = {
  totalUsers: number
  totalInstallations: number
  totalDomains: number
  recentTickets: number
  totalBlocks: number
  packageStats: PackageStats
  totalLicenses: number
}

type UserDashboardData = {
  installations: number
  invoices: number
  tickets: number
  licenses: number
}

async function getDashboardData(userId: string, isAdmin: boolean): Promise<AdminDashboardData | UserDashboardData> {
  if (isAdmin) {
    // Admin: Globale Statistiken
    const [totalUsers, totalInstallations, totalDomains, recentTickets, totalBlocks, licenses] = await Promise.all([
      prisma.user.count(),
      prisma.installation.count(),
      prisma.licenseDomain.count(), // Aktivierte Domains = Installationen
      prisma.supportTicket.count({ where: { status: 'OPEN' } }),
      prisma.telemetryEvent.count(),
      prisma.license.findMany({ select: { packageType: true } }),
    ])

    // Paket-Statistiken berechnen
    const packageStats: PackageStats = {
      FREE: licenses.filter(l => l.packageType === 'FREE').length,
      SINGLE: licenses.filter(l => l.packageType === 'SINGLE').length,
      FREELANCER: licenses.filter(l => l.packageType === 'FREELANCER').length,
      AGENCY: licenses.filter(l => l.packageType === 'AGENCY').length,
    }

    return {
      totalUsers,
      totalInstallations,
      totalDomains,
      recentTickets,
      totalBlocks,
      packageStats,
      totalLicenses: licenses.length,
    }
  } else {
    // User: Persönliche Statistiken
    const [installations, invoices, tickets, licenses] = await Promise.all([
      prisma.installation.count({ where: { userId } }),
      prisma.invoice.count({ where: { userId } }),
      prisma.supportTicket.count({ where: { userId } }),
      prisma.license.count({ where: { userId } }),
    ])

    return {
      installations,
      invoices,
      tickets,
      licenses,
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
      <div className="p-12 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Willkommen zurück, {user.email}
          </p>
        </div>

        {isAdmin ? (
          // Admin Dashboard
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Benutzer</CardTitle>
                  <Users className="h-4 w-4 text-[#22D6DD]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#22D6DD]">{'totalUsers' in data ? data.totalUsers : 0}</div>
                  <p className="text-xs text-muted-foreground">Registrierte Benutzer</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aktive Domains</CardTitle>
                  <Globe className="h-4 w-4 text-[#22D6DD]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#22D6DD]">{'totalDomains' in data ? data.totalDomains : 0}</div>
                  <p className="text-xs text-muted-foreground">Aktivierte Installationen</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Support-Tickets</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-500">{'recentTickets' in data ? data.recentTickets : 0}</div>
                  <p className="text-xs text-muted-foreground">Offene Tickets</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Spam blockiert</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    {('totalBlocks' in data ? data.totalBlocks : 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Gesamt blockiert</p>
                </CardContent>
              </Card>
            </div>

            {/* Lizenz-Statistiken */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-[#22D6DD]" />
                  Lizenz-Übersicht
                </CardTitle>
                <CardDescription>
                  {'totalLicenses' in data ? data.totalLicenses : 0} Lizenzen insgesamt
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white border border-[#d9dde1] rounded-[9px]">
                    <Badge className="bg-slate-100 text-slate-700 mb-2">FREE</Badge>
                    <div className="text-2xl font-bold">{'packageStats' in data ? data.packageStats.FREE : 0}</div>
                  </div>
                  <div className="text-center p-4 bg-white border border-[#d9dde1] rounded-[9px]">
                    <Badge className="bg-[#22D6DD]/10 text-[#22D6DD] mb-2">SINGLE</Badge>
                    <div className="text-2xl font-bold text-[#22D6DD]">{'packageStats' in data ? data.packageStats.SINGLE : 0}</div>
                  </div>
                  <div className="text-center p-4 bg-white border border-[#d9dde1] rounded-[9px]">
                    <Badge className="bg-[#22D6DD]/20 text-[#22D6DD] mb-2">FREELANCER</Badge>
                    <div className="text-2xl font-bold text-[#22D6DD]">{'packageStats' in data ? data.packageStats.FREELANCER : 0}</div>
                  </div>
                  <div className="text-center p-4 bg-white border border-[#d9dde1] rounded-[9px]">
                    <Badge className="bg-[#EC4899]/10 text-[#EC4899] mb-2">AGENCY</Badge>
                    <div className="text-2xl font-bold text-[#EC4899]">{'packageStats' in data ? data.packageStats.AGENCY : 0}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
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
