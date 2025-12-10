import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, AlertTriangle, CheckCircle, Activity, Key, Users, Globe, MapPin, Ban, TrendingUp } from 'lucide-react'
import { prisma } from '@/lib/db'

type PackageStats = {
  FREE: number
  SINGLE: number
  FREELANCER: number
  AGENCY: number
}

type BlockMethodStats = {
  method: string
  count: number
}

type CountryStats = {
  country: string
  count: number
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
  blockMethods: BlockMethodStats[]
  topCountries: CountryStats[]
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

    const blockMethods: BlockMethodStats[] = blockMethodsRaw.map(b => ({
      method: b.blockMethod,
      count: b._count.blockMethod,
    }))

    const topCountries: CountryStats[] = countriesRaw.map(c => ({
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

// Hilfsfunktion für Ländernamen
function getCountryName(code: string): string {
  const countries: Record<string, string> = {
    'DE': '🇩🇪 Deutschland',
    'US': '🇺🇸 USA',
    'CN': '🇨🇳 China',
    'RU': '🇷🇺 Russland',
    'IN': '🇮🇳 Indien',
    'BR': '🇧🇷 Brasilien',
    'FR': '🇫🇷 Frankreich',
    'GB': '🇬🇧 UK',
    'NL': '🇳🇱 Niederlande',
    'PL': '🇵🇱 Polen',
    'UA': '🇺🇦 Ukraine',
    'VN': '🇻🇳 Vietnam',
    'ID': '🇮🇩 Indonesien',
    'TR': '🇹🇷 Türkei',
    'PK': '🇵🇰 Pakistan',
  }
  return countries[code] || `🌍 ${code}`
}

// Hilfsfunktion für Blockgrund-Namen
function getBlockMethodName(method: string): string {
  const methods: Record<string, string> = {
    'honeypot': '🍯 Honeypot',
    'timestamp': '⏱️ Zeitstempel',
    'geo': '🌍 GEO-Blocking',
    'phrase': '🔤 Phrasen',
    'user_agent': '🤖 User-Agent',
    'url': '🔗 URL-Filter',
    'javascript': '📜 JavaScript',
    'rate_limit': '⚡ Rate-Limit',
  }
  return methods[method] || method
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

            {/* Telemetrie-Analyse */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Top Blockgründe */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ban className="h-5 w-5 text-[#EC4899]" />
                    Top Blockgründe
                  </CardTitle>
                  <CardDescription>
                    Häufigste Spam-Erkennungsmethoden
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {'blockMethods' in data && data.blockMethods.length > 0 ? (
                      data.blockMethods.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white border border-[#d9dde1] rounded-[9px]">
                          <span className="font-medium">{getBlockMethodName(item.method)}</span>
                          <Badge variant="secondary" className="bg-[#EC4899]/10 text-[#EC4899]">
                            {item.count.toLocaleString()}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">Noch keine Daten</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Top Ursprungsländer */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#22D6DD]" />
                    Top Ursprungsländer
                  </CardTitle>
                  <CardDescription>
                    Spam-Herkunft nach Land
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {'topCountries' in data && data.topCountries.length > 0 ? (
                      data.topCountries.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white border border-[#d9dde1] rounded-[9px]">
                          <span className="font-medium">{getCountryName(item.country)}</span>
                          <Badge variant="secondary" className="bg-[#22D6DD]/10 text-[#22D6DD]">
                            {item.count.toLocaleString()}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">Noch keine Daten</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trend & Lizenz-Statistiken */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Heute vs. Gestern */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Trend
                  </CardTitle>
                  <CardDescription>
                    Spam-Aktivität im Vergleich
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-white border border-[#d9dde1] rounded-[9px]">
                      <p className="text-sm text-muted-foreground mb-1">Heute</p>
                      <div className="text-3xl font-bold text-[#22D6DD]">
                        {'todayBlocks' in data ? data.todayBlocks.toLocaleString() : 0}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-white border border-[#d9dde1] rounded-[9px]">
                      <p className="text-sm text-muted-foreground mb-1">Gestern</p>
                      <div className="text-3xl font-bold text-slate-500">
                        {'yesterdayBlocks' in data ? data.yesterdayBlocks.toLocaleString() : 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lizenz-Übersicht */}
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-white border border-[#d9dde1] rounded-[9px]">
                      <Badge className="bg-slate-100 text-slate-700 mb-1 text-xs">FREE</Badge>
                      <div className="text-xl font-bold">{'packageStats' in data ? data.packageStats.FREE : 0}</div>
                    </div>
                    <div className="text-center p-3 bg-white border border-[#d9dde1] rounded-[9px]">
                      <Badge className="bg-[#22D6DD]/10 text-[#22D6DD] mb-1 text-xs">SINGLE</Badge>
                      <div className="text-xl font-bold text-[#22D6DD]">{'packageStats' in data ? data.packageStats.SINGLE : 0}</div>
                    </div>
                    <div className="text-center p-3 bg-white border border-[#d9dde1] rounded-[9px]">
                      <Badge className="bg-[#22D6DD]/20 text-[#22D6DD] mb-1 text-xs">FREELANCER</Badge>
                      <div className="text-xl font-bold text-[#22D6DD]">{'packageStats' in data ? data.packageStats.FREELANCER : 0}</div>
                    </div>
                    <div className="text-center p-3 bg-white border border-[#d9dde1] rounded-[9px]">
                      <Badge className="bg-[#EC4899]/10 text-[#EC4899] mb-1 text-xs">AGENCY</Badge>
                      <div className="text-xl font-bold text-[#EC4899]">{'packageStats' in data ? data.packageStats.AGENCY : 0}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
