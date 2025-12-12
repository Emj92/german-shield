import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, AlertTriangle, CheckCircle, Activity, Users, Globe } from 'lucide-react'
import { prisma } from '@/lib/db'
import { AdminDashboardClient } from '@/components/AdminDashboardClient'

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
  todayBlocks: number
  yesterdayBlocks: number
  packageStats: PackageStats
  totalLicenses: number
  blockMethods: { method: string; count: number }[]
  topCountries: { country: string; count: number }[]
}

type UserDashboardData = {
  installations: number
  invoices: number
  tickets: number
  licenses: number
}

async function getDashboardData(userId: string, isAdmin: boolean): Promise<AdminDashboardData | UserDashboardData> {
  if (isAdmin) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Admin: Globale Statistiken
    const [totalUsers, totalInstallations, totalDomains, recentTickets, totalBlocks, todayBlocks, yesterdayBlocks, licenses, blockMethodsRaw, countriesRaw] = await Promise.all([
      prisma.user.count(),
      prisma.installation.count(),
      prisma.licenseDomain.count(),
      prisma.supportTicket.count({ where: { status: 'OPEN' } }),
      prisma.telemetryEvent.count(),
      prisma.telemetryEvent.count({ where: { timestamp: { gte: today } } }),
      prisma.telemetryEvent.count({ where: { timestamp: { gte: yesterday, lt: today } } }),
      prisma.license.findMany({ select: { packageType: true } }),
      // Top Blockgründe
      prisma.telemetryEvent.groupBy({
        by: ['blockMethod'],
        _count: { blockMethod: true },
        orderBy: { _count: { blockMethod: 'desc' } },
        take: 5,
      }),
      // Top Länder
      prisma.telemetryEvent.groupBy({
        by: ['countryCode'],
        _count: { countryCode: true },
        orderBy: { _count: { countryCode: 'desc' } },
        take: 5,
        where: { countryCode: { not: null } },
      }),
    ])

    const packageStats: PackageStats = {
      FREE: licenses.filter(l => l.packageType === 'FREE').length,
      SINGLE: licenses.filter(l => l.packageType === 'SINGLE').length,
      FREELANCER: licenses.filter(l => l.packageType === 'FREELANCER').length,
      AGENCY: licenses.filter(l => l.packageType === 'AGENCY').length,
    }

    const blockMethods = blockMethodsRaw.map(b => ({
      method: b.blockMethod,
      count: b._count.blockMethod,
    }))

    const topCountries = countriesRaw.map(c => ({
      country: c.countryCode || 'Unbekannt',
      count: c._count.countryCode,
    }))

    return {
      totalUsers,
      totalInstallations,
      totalDomains,
      recentTickets,
      totalBlocks,
      todayBlocks,
      yesterdayBlocks,
      packageStats,
      totalLicenses: licenses.length,
      blockMethods,
      topCountries,
    }
  } else {
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
            {/* Übersichts-Karten */}
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

            {/* Interaktive Telemetrie-Komponente */}
            <AdminDashboardClient 
              initialData={{
                totalBlocks: 'totalBlocks' in data ? data.totalBlocks : 0,
                todayBlocks: 'todayBlocks' in data ? data.todayBlocks : 0,
                yesterdayBlocks: 'yesterdayBlocks' in data ? data.yesterdayBlocks : 0,
                blockMethods: 'blockMethods' in data ? data.blockMethods : [],
                topCountries: 'topCountries' in data ? data.topCountries : [],
                packageStats: 'packageStats' in data ? data.packageStats : { FREE: 0, SINGLE: 0, FREELANCER: 0, AGENCY: 0 },
                totalLicenses: 'totalLicenses' in data ? data.totalLicenses : 0,
              }}
            />
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

      </div>
    </DashboardLayout>
  )
}
