import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, TrendingDown, Globe, AlertTriangle, Activity } from 'lucide-react'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

async function getUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    redirect('/login')
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch {
    redirect('/login')
  }
}

async function getTelemetryData() {
  // Hole alle Telemetrie-Events der letzten 30 Tage
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const events = await prisma.telemetryEvent.findMany({
    where: {
      timestamp: {
        gte: thirtyDaysAgo,
      },
    },
    orderBy: {
      timestamp: 'desc',
    },
    take: 1000, // Limit
  })

  // Aggregationen
  const totalBlocks = events.length
  
  // Nach Ländern gruppieren
  const byCountry = events.reduce((acc: Record<string, number>, event) => {
    const country = event.countryCode || 'Unknown'
    acc[country] = (acc[country] || 0) + 1
    return acc
  }, {})

  // Nach Block-Methode gruppieren
  const byMethod = events.reduce((acc: Record<string, number>, event) => {
    const method = event.blockMethod
    acc[method] = (acc[method] || 0) + 1
    return acc
  }, {})

  // Nach Stunden gruppieren (für Zeitanalyse)
  const byHour = events.reduce((acc: Record<number, number>, event) => {
    const hour = new Date(event.timestamp).getHours()
    acc[hour] = (acc[hour] || 0) + 1
    return acc
  }, {})

  // Heute blockiert
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const blockedToday = events.filter(e => new Date(e.timestamp) >= today).length

  return {
    totalBlocks,
    blockedToday,
    byCountry,
    byMethod,
    byHour,
    recentEvents: events.slice(0, 50), // Letzte 50
  }
}

function getFlag(countryCode: string | null) {
  if (!countryCode || countryCode === 'Unknown') return '🌍'
  const offset = 127397
  return String.fromCodePoint(
    ...countryCode.split('').map(char => offset + char.charCodeAt(0))
  )
}

export default async function DashboardPage() {
  const user = await getUser()
  const data = await getTelemetryData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Willkommen zurück, {user.email as string}
            </p>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition">
              Logout
            </button>
          </form>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-slate-700 bg-gradient-to-br from-[#22D6DD]/10 to-transparent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blocks Gesamt</CardTitle>
              <Shield className="h-4 w-4 text-[#22D6DD]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#22D6DD]">{data.totalBlocks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Letzte 30 Tage</p>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-gradient-to-br from-[#F06292]/10 to-transparent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Heute blockiert</CardTitle>
              <TrendingDown className="h-4 w-4 text-[#F06292]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#F06292]">{data.blockedToday.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Seit Mitternacht</p>
            </CardContent>
          </Card>

          <Card className="border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Länder</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(data.byCountry).length}</div>
              <p className="text-xs text-muted-foreground">Verschiedene Länder</p>
            </CardContent>
          </Card>

          <Card className="border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Block-Methoden</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(data.byMethod).length}</div>
              <p className="text-xs text-muted-foreground">Verschiedene Methoden</p>
            </CardContent>
          </Card>
        </div>

        {/* Länder-Übersicht */}
        <Card className="border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-[#22D6DD]" />
              Blocks nach Land
            </CardTitle>
            <CardDescription>Top Spam-Ursprungsländer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.byCountry)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 10)
                .map(([country, count]) => (
                  <div key={country} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getFlag(country)}</span>
                      <span className="font-medium text-white">{country}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-48 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#F06292]"
                          style={{ width: `${((count as number) / data.totalBlocks) * 100}%` }}
                        />
                      </div>
                      <span className="text-lg font-bold text-[#22D6DD] min-w-[60px] text-right">
                        {(count as number).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Block-Methoden */}
        <Card className="border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#22D6DD]" />
              Block-Methoden
            </CardTitle>
            <CardDescription>Wie werden Spam-Anfragen blockiert?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(data.byMethod)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([method, count]) => (
                  <div key={method} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
                    <div className="text-2xl font-bold text-[#22D6DD]">{(count as number).toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground mt-1 capitalize">{method}</div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Zeitanalyse */}
        <Card className="border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#22D6DD]" />
              Aktivität nach Uhrzeit
            </CardTitle>
            <CardDescription>Wann treten die meisten Spam-Angriffe auf?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-40 gap-1">
              {Array.from({ length: 24 }).map((_, hour) => {
                const count = data.byHour[hour] || 0
                const maxCount = Math.max(...Object.values(data.byHour))
                const height = maxCount > 0 ? (count / maxCount) * 100 : 0
                
                return (
                  <div key={hour} className="flex-1 flex flex-col items-center justify-end gap-1">
                    <div
                      className="w-full bg-[#22D6DD] rounded-t transition-all hover:bg-[#1EBEC5]"
                      style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '0' }}
                      title={`${hour}:00 Uhr - ${count} Blocks`}
                    />
                    <span className="text-xs text-muted-foreground">{hour}</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Uhrzeit (24h Format)
            </div>
          </CardContent>
        </Card>

        {/* Letzte Events */}
        <Card className="border-slate-700">
          <CardHeader>
            <CardTitle>Letzte Spam-Blocks</CardTitle>
            <CardDescription>Die 50 neuesten anonymisierten Events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Zeit</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Land</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Methode</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Grund</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">IP-Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentEvents.map((event) => (
                    <tr key={event.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 text-sm">
                        {new Date(event.timestamp).toLocaleString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getFlag(event.countryCode)}</span>
                          <span className="text-sm font-medium">{event.countryCode || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#22D6DD]/10 text-[#22D6DD] border border-[#22D6DD]/20">
                          {event.blockMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground max-w-xs truncate">
                        {event.blockReason || '-'}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-muted-foreground">
                        {event.ipHash.substring(0, 12)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

