import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Key } from 'lucide-react'

export default async function LicensesPage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <DashboardLayout user={{ email: user.email, role: user.role }}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meine Lizenzen</h1>
          <p className="text-muted-foreground">
            Übersicht deiner German Fence Lizenzen
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Lizenzen
            </CardTitle>
            <CardDescription>
              Diese Funktion ist in Entwicklung
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              Lizenz-Verwaltung wird bald verfügbar sein
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

