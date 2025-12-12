'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Ban, MapPin, Clock, Calendar, Trash2, Archive, TrendingUp, Key, UserPlus, ShoppingCart, Users, Globe, AlertTriangle, CheckCircle } from 'lucide-react'

type BlockMethodStats = {
  method: string
  count: number
}

type CountryStats = {
  country: string
  count: number
}

type HourlyStats = {
  hour: number
  count: number
}

type WeekdayStats = {
  weekday: number
  count: number
}

type RegistrationStats = {
  date: string
  count: number
}

type PurchaseStats = {
  registrations: number
  purchases: number
}

type TelemetryPeriod = 'today' | '3days' | 'week' | 'month' | 'quarter' | 'year' | 'all'

interface AdminDashboardClientProps {
  initialData: {
    totalUsers: number
    totalDomains: number
    recentTickets: number
    totalBlocks: number
    todayBlocks: number
    yesterdayBlocks: number
    blockMethods: BlockMethodStats[]
    topCountries: CountryStats[]
    packageStats: { FREE: number; SINGLE: number; FREELANCER: number; AGENCY: number }
    totalLicenses: number
  }
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

// Wochentag-Namen
const weekdayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

export function AdminDashboardClient({ initialData }: AdminDashboardClientProps) {
  const [period, setPeriod] = useState<TelemetryPeriod>('all')
  const [data, setData] = useState(initialData)
  const [hourlyStats, setHourlyStats] = useState<HourlyStats[]>([])
  const [weekdayStats, setWeekdayStats] = useState<WeekdayStats[]>([])
  const [registrationStats, setRegistrationStats] = useState<RegistrationStats[]>([])
  const [purchaseStats, setPurchaseStats] = useState<PurchaseStats>({ registrations: 0, purchases: 0 })
  const [loading, setLoading] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // Zeitraum-Labels
  const periodLabels: Record<TelemetryPeriod, string> = {
    today: 'Heute',
    '3days': 'Letzte 3 Tage',
    week: 'Letzte Woche',
    month: 'Letzter Monat',
    quarter: 'Letztes Quartal',
    year: 'Letztes Jahr',
    all: 'Gesamte Zeit'
  }

  // Daten beim Zeitraum-Wechsel laden
  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period])

  async function loadData() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/telemetry?period=${period}`)
      if (res.ok) {
        const newData = await res.json()
        setData(prev => ({
          ...prev,
          totalBlocks: newData.totalBlocks,
          todayBlocks: newData.todayBlocks,
          yesterdayBlocks: newData.yesterdayBlocks,
          blockMethods: newData.blockMethods,
          topCountries: newData.topCountries,
        }))
        setHourlyStats(newData.hourlyStats || [])
        setWeekdayStats(newData.weekdayStats || [])
        setRegistrationStats(newData.registrationStats || [])
        setPurchaseStats(newData.purchaseStats || { registrations: 0, purchases: 0 })
      }
    } catch (error) {
      console.error('Error loading telemetry:', error)
    }
    setLoading(false)
  }

  async function resetTelemetry() {
    try {
      const res = await fetch('/api/admin/telemetry/reset', { method: 'POST' })
      if (res.ok) {
        setShowResetConfirm(false)
        loadData()
      }
    } catch (error) {
      console.error('Error resetting telemetry:', error)
    }
  }

  // Max-Wert für Balkendiagramme
  const maxHourly = Math.max(...hourlyStats.map(h => h.count), 1)
  const maxWeekday = Math.max(...weekdayStats.map(w => w.count), 1)

  return (
    <div className="space-y-6">
      {/* Zeitraum-Filter & Reset - OBEN */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(v) => setPeriod(v as TelemetryPeriod)}>
            <SelectTrigger className="w-[200px] border-[#d9dde1] dark:border-slate-700">
              <Calendar className="h-4 w-4 mr-2 text-[#22D6DD]" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(periodLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {loading && <span className="text-sm text-muted-foreground">Laden...</span>}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-[#d9dde1] dark:border-slate-700"
            onClick={() => setShowResetConfirm(true)}
          >
            <Trash2 className="h-4 w-4 mr-2 text-[#EC4899]" />
            Archivieren
          </Button>
        </div>
      </div>

      {/* Reset Bestätigung */}
      {showResetConfirm && (
        <Card className="border-[#EC4899]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Archive className="h-5 w-5 text-[#EC4899]" />
                <span>Telemetrie archivieren? Die Daten werden gespeichert und ein neuer Zeitraum beginnt.</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowResetConfirm(false)}>
                  Abbrechen
                </Button>
                <Button size="sm" className="bg-[#EC4899] hover:bg-[#EC4899]/90 text-white" onClick={resetTelemetry}>
                  Bestätigen
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Übersichts-Karten */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Benutzer</CardTitle>
            <Users className="h-4 w-4 text-[#22D6DD]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#22D6DD]">{data.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registrierte Benutzer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Domains</CardTitle>
            <Globe className="h-4 w-4 text-[#22D6DD]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#22D6DD]">{data.totalDomains}</div>
            <p className="text-xs text-muted-foreground">Aktivierte Installationen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Support-Tickets</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{data.recentTickets}</div>
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
              {data.totalBlocks.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Gesamt blockiert</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Blockgründe & Ursprungsländer */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Blockgründe */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-[#EC4899]" />
              Top Blockgründe
            </CardTitle>
            <CardDescription>Häufigste Spam-Erkennungsmethoden</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`space-y-3 ${data.blockMethods.length > 3 ? 'max-h-[180px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#22D6DD]/50 scrollbar-track-transparent hover:scrollbar-thumb-[#22D6DD]' : ''}`}>
              {data.blockMethods.length > 0 ? (
                data.blockMethods.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-[#d9dde1] dark:border-slate-700 rounded-[9px]">
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
            <CardDescription>Spam-Herkunft nach Land</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`space-y-3 ${data.topCountries.length > 3 ? 'max-h-[180px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#22D6DD]/50 scrollbar-track-transparent hover:scrollbar-thumb-[#22D6DD]' : ''}`}>
              {data.topCountries.length > 0 ? (
                data.topCountries.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-[#d9dde1] dark:border-slate-700 rounded-[9px]">
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

      {/* Spam nach Uhrzeit & Wochentag - Zwei separate Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Stundenverteilung */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-[#22D6DD]" />
              Spam nach Uhrzeit
            </CardTitle>
            <CardDescription>Wann wird am meisten Spam blockiert?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-32">
              {Array.from({ length: 24 }, (_, i) => {
                const stat = hourlyStats.find(h => h.hour === i)
                const count = stat?.count || 0
                const height = maxHourly > 0 ? (count / maxHourly) * 100 : 0
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group relative">
                    <div 
                      className="w-full bg-[#22D6DD]/80 hover:bg-[#22D6DD] rounded-t transition-all cursor-pointer"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-900 dark:bg-slate-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                      {i}:00 - {count.toLocaleString()}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0h</span>
              <span>6h</span>
              <span>12h</span>
              <span>18h</span>
              <span>23h</span>
            </div>
          </CardContent>
        </Card>

        {/* Wochentagsverteilung */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-5 w-5 text-[#EC4899]" />
              Spam nach Wochentag
            </CardTitle>
            <CardDescription>An welchen Tagen ist Spam am höchsten?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-32">
              {weekdayNames.map((name, i) => {
                const stat = weekdayStats.find(w => w.weekday === i)
                const count = stat?.count || 0
                const height = maxWeekday > 0 ? (count / maxWeekday) * 100 : 0
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group relative">
                    <div 
                      className="w-full bg-[#EC4899]/80 hover:bg-[#EC4899] rounded-t transition-all cursor-pointer"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-900 dark:bg-slate-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                      {name} - {count.toLocaleString()}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">{name}</span>
                  </div>
                )
              })}
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
            <CardDescription>Spam-Aktivität im Vergleich</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white dark:bg-slate-800 border border-[#d9dde1] dark:border-slate-700 rounded-[9px]">
                <p className="text-sm text-muted-foreground mb-1">Heute</p>
                <div className="text-3xl font-bold text-[#22D6DD]">
                  {data.todayBlocks.toLocaleString()}
                </div>
              </div>
              <div className="text-center p-4 bg-white dark:bg-slate-800 border border-[#d9dde1] dark:border-slate-700 rounded-[9px]">
                <p className="text-sm text-muted-foreground mb-1">Gestern</p>
                <div className="text-3xl font-bold text-slate-500 dark:text-slate-400">
                  {data.yesterdayBlocks.toLocaleString()}
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
            <CardDescription>{data.totalLicenses} Lizenzen insgesamt</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-white dark:bg-slate-800 border border-[#d9dde1] dark:border-slate-700 rounded-[9px]">
                <Badge className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 mb-1 text-xs">FREE</Badge>
                <div className="text-xl font-bold">{data.packageStats.FREE}</div>
              </div>
              <div className="text-center p-3 bg-white dark:bg-slate-800 border border-[#d9dde1] dark:border-slate-700 rounded-[9px]">
                <Badge className="bg-[#22D6DD]/10 text-[#22D6DD] mb-1 text-xs">SINGLE</Badge>
                <div className="text-xl font-bold text-[#22D6DD]">{data.packageStats.SINGLE}</div>
              </div>
              <div className="text-center p-3 bg-white dark:bg-slate-800 border border-[#d9dde1] dark:border-slate-700 rounded-[9px]">
                <Badge className="bg-[#22D6DD]/20 text-[#22D6DD] mb-1 text-xs">FREELANCER</Badge>
                <div className="text-xl font-bold text-[#22D6DD]">{data.packageStats.FREELANCER}</div>
              </div>
              <div className="text-center p-3 bg-white dark:bg-slate-800 border border-[#d9dde1] dark:border-slate-700 rounded-[9px]">
                <Badge className="bg-[#EC4899]/10 text-[#EC4899] mb-1 text-xs">AGENCY</Badge>
                <div className="text-xl font-bold text-[#EC4899]">{data.packageStats.AGENCY}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Nutzerregistrierungen & Konversionen */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Registrierungen über Zeit */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-[#22D6DD]" />
              Nutzerregistrierungen
            </CardTitle>
            <CardDescription>Neue Benutzer im Zeitraum</CardDescription>
          </CardHeader>
          <CardContent>
            {registrationStats.length > 0 ? (
              <div className="space-y-2">
                {registrationStats.slice(0, 7).map((stat, idx) => {
                  const maxCount = Math.max(...registrationStats.map(s => s.count), 1)
                  const width = (stat.count / maxCount) * 100
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-20">{stat.date}</span>
                      <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-5 overflow-hidden">
                        <div 
                          className="bg-[#22D6DD] h-full rounded-full flex items-center justify-end pr-2"
                          style={{ width: `${Math.max(width, 10)}%` }}
                        >
                          <span className="text-xs text-white font-medium">{stat.count}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Noch keine Daten</p>
            )}
          </CardContent>
        </Card>

        {/* Konversionsrate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-[#EC4899]" />
              Registrierungen vs. Käufe
            </CardTitle>
            <CardDescription>Konversionsrate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-6">
              {/* Donut-Chart Visualisierung - größer */}
              <div className="relative w-44 h-44">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {/* Hintergrund */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="10"
                    className="dark:stroke-slate-700"
                  />
                  {/* Registrierungen (Gesamt) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#22D6DD"
                    strokeWidth="10"
                    strokeDasharray={`${251.2} 251.2`}
                    strokeLinecap="round"
                  />
                  {/* Käufe */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#EC4899"
                    strokeWidth="10"
                    strokeDasharray={`${(purchaseStats.purchases / Math.max(purchaseStats.registrations, 1)) * 251.2} 251.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-bold">
                    {purchaseStats.registrations > 0 
                      ? Math.round((purchaseStats.purchases / purchaseStats.registrations) * 100)
                      : 0}%
                  </span>
                  <span className="text-sm text-muted-foreground">Konversion</span>
                </div>
              </div>
              
              {/* Legende */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#22D6DD]" />
                  <div>
                    <span className="text-sm text-muted-foreground">Registrierungen</span>
                    <p className="text-xl font-bold">{purchaseStats.registrations}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#EC4899]" />
                  <div>
                    <span className="text-sm text-muted-foreground">Käufe</span>
                    <p className="text-xl font-bold">{purchaseStats.purchases}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
