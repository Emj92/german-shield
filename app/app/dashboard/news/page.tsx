import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Newspaper, Rocket, Info, Wrench } from 'lucide-react'
import { prisma } from '@/lib/db'

async function getPublishedNews() {
  return await prisma.news.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
  })
}

export default async function NewsPage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  const news = await getPublishedNews()

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'UPDATE':
        return <Rocket className="h-5 w-5 text-primary" />
      case 'ROADMAP':
        return <Newspaper className="h-5 w-5 text-blue-500" />
      case 'MAINTENANCE':
        return <Wrench className="h-5 w-5 text-yellow-500" />
      default:
        return <Info className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      INFO: 'Information',
      UPDATE: 'Update',
      ROADMAP: 'Roadmap',
      MAINTENANCE: 'Wartung',
    }
    return labels[type as keyof typeof labels]
  }

  return (
    <DashboardLayout user={{ email: user.email, role: user.role }}>
      <div className="p-12 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">News & Updates</h1>
          <p className="text-muted-foreground">
            Bleiben Sie auf dem Laufenden über neue Features und Updates
          </p>
        </div>

        {news.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Newspaper className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Keine News verfügbar</p>
              <p className="text-sm text-muted-foreground">
                Neue Updates werden hier angezeigt
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {news.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
                          {getTypeLabel(item.type)}
                        </span>
                        {item.publishedAt && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.publishedAt).toLocaleDateString('de-DE')}
                          </span>
                        )}
                      </div>
                      <CardTitle>{item.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{item.content}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

