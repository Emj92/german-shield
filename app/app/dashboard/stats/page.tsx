import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart } from 'lucide-react'

export default async function StatsPage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <DashboardLayout user={{ email: user.email, role: user.role }}>
      <div className="p-12 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statistiken</h1>
          <p className="text-muted-foreground">
            Detaillierte Statistiken zu deinen Installationen
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Statistiken
            </CardTitle>
            <CardDescription>
              Diese Funktion ist in Entwicklung
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              Detaillierte Statistiken werden bald verfügbar sein
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

