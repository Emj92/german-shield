import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings } from 'lucide-react'

export default async function SettingsAdminPage() {
  const user = await getUser()
  
  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <DashboardLayout user={{ email: user.email, role: user.role }}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System-Einstellungen</h1>
          <p className="text-muted-foreground">
            Konfiguriere globale System-Einstellungen
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Einstellungen
            </CardTitle>
            <CardDescription>
              Diese Funktion ist in Entwicklung
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              System-Einstellungen werden bald verfügbar sein
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

