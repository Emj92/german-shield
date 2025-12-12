'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, ShieldAlert, Calendar } from 'lucide-react'

interface SpamStats {
  totalBlocked: number
  blockedToday: number
  blockedThisWeek: number
  topBlockReason: string | null
}

export function UserSpamStats() {
  const [stats, setStats] = useState<SpamStats>({ totalBlocked: 0, blockedToday: 0, blockedThisWeek: 0, topBlockReason: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSpamStats()
  }, [])

  const fetchSpamStats = async () => {
    try {
      const res = await fetch('/api/user/spam-stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch spam stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="border-[#22D6DD]/30 bg-gradient-to-r from-[#22D6DD]/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
            <Shield className="h-5 w-5 text-[#22D6DD]" />
            Dein Spam-Schutz
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#22D6DD]"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-[#22D6DD]/30 bg-gradient-to-r from-[#22D6DD]/5 to-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
          <Shield className="h-5 w-5 text-[#22D6DD]" />
          Dein Spam-Schutz
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-[9px] border border-[#d9dde1] dark:border-slate-700">
            <ShieldAlert className="h-6 w-6 mx-auto mb-2 text-[#22D6DD]" />
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Heute blockiert</p>
            <p className="text-2xl font-bold text-[#22D6DD]">{stats.blockedToday.toLocaleString()}</p>
          </div>
          <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-[9px] border border-[#d9dde1] dark:border-slate-700">
            <Calendar className="h-6 w-6 mx-auto mb-2 text-[#EC4899]" />
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Diese Woche</p>
            <p className="text-2xl font-bold text-[#EC4899]">{stats.blockedThisWeek.toLocaleString()}</p>
          </div>
          <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-[9px] border border-[#d9dde1] dark:border-slate-700">
            <Shield className="h-6 w-6 mx-auto mb-2 text-slate-600 dark:text-slate-400" />
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Gesamt blockiert</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalBlocked.toLocaleString()}</p>
          </div>
        </div>
        {stats.topBlockReason && (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
            Häufigster Blockgrund: <span className="font-medium text-[#22D6DD]">{stats.topBlockReason}</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}

