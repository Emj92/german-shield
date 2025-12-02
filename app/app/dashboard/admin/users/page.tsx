import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { Users } from 'lucide-react'

async function getUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          installations: true,
          supportTickets: true,
          invoices: true,
        },
      },
    },
  })
}

export default async function UsersAdminPage() {
  const user = await getUser()
  
  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const users = await getUsers()

  return (
    <DashboardLayout user={{ email: user.email, role: user.role }}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Benutzerverwaltung</h1>
          <p className="text-muted-foreground">
            Übersicht aller registrierten Benutzer
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Alle Benutzer ({users.length})
            </CardTitle>
            <CardDescription>
              Verwalte alle Benutzer-Accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">E-Mail</th>
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Rolle</th>
                    <th className="text-right p-4">Installationen</th>
                    <th className="text-right p-4">Tickets</th>
                    <th className="text-left p-4">Erstellt</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">{u.email}</td>
                      <td className="p-4">{u.name || '-'}</td>
                      <td className="p-4">
                        <Badge variant={u.role === 'ADMIN' ? 'default' : 'secondary'}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="text-right p-4">{u._count.installations}</td>
                      <td className="text-right p-4">{u._count.supportTickets}</td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString('de-DE')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

