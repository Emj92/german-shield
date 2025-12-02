import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Shield, FileArchive } from 'lucide-react'
import { prisma } from '@/lib/db'

async function getPluginReleases() {
  return await prisma.pluginRelease.findMany({
    where: { isStable: true },
    orderBy: { releaseDate: 'desc' },
    take: 5,
  })
}

export default async function DownloadsPage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  const releases = await getPluginReleases()
  const latestRelease = releases[0]

  return (
    <DashboardLayout user={{ email: user.email, role: user.role }}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plugin-Downloads</h1>
          <p className="text-muted-foreground">
            Laden Sie die neueste Version des German Fence Plugins herunter
          </p>
        </div>

        {latestRelease && (
          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    German Fence v{latestRelease.version}
                  </CardTitle>
                  <CardDescription>
                    Veröffentlicht am {new Date(latestRelease.releaseDate).toLocaleDateString('de-DE')}
                  </CardDescription>
                </div>
                <Button asChild size="lg">
                  <a href={latestRelease.downloadUrl} download>
                    <Download className="mr-2 h-5 w-5" />
                    Herunterladen
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileArchive className="h-4 w-4" />
                  <span>Größe: {(latestRelease.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                {latestRelease.changelog && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Änderungen:</h3>
                    <div className="prose prose-sm dark:prose-invert">
                      <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                        {latestRelease.changelog}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {releases.length > 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Frühere Versionen</h2>
            <div className="grid gap-4">
              {releases.slice(1).map((release) => (
                <Card key={release.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Version {release.version}</CardTitle>
                        <CardDescription>
                          {new Date(release.releaseDate).toLocaleDateString('de-DE')}
                        </CardDescription>
                      </div>
                      <Button variant="outline" asChild>
                        <a href={release.downloadUrl} download>
                          <Download className="mr-2 h-4 w-4" />
                          Herunterladen
                        </a>
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {releases.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Download className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Keine Downloads verfügbar</p>
              <p className="text-sm text-muted-foreground">
                Plugin-Versionen werden hier angezeigt
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

