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
      <div className="p-12 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plugin-Downloads</h1>
          <p className="text-muted-foreground">
            Laden Sie die neueste Version des German Fence Plugins herunter
          </p>
        </div>

        {latestRelease && (
          <Card className="border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-[#22D6DD]" />
                    German Fence v{latestRelease.version}
                  </CardTitle>
                  <CardDescription>
                    Veröffentlicht am {new Date(latestRelease.releaseDate).toLocaleDateString('de-DE')}
                  </CardDescription>
                </div>
                <Button asChild size="lg" className="bg-[#22D6DD] hover:bg-[#22D6DD]/90 text-white">
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
                      <Button variant="outline" asChild className="border-[#22D6DD] text-[#22D6DD] hover:bg-[#22D6DD]/10">
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
          <Card className="border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-[#22D6DD]" />
                    German Fence Plugin v1.4.1
                  </CardTitle>
                  <CardDescription>
                    Aktuelle Version herunterladen
                  </CardDescription>
                </div>
                <Button asChild size="lg" className="bg-[#22D6DD] hover:bg-[#22D6DD]/90 text-white">
                  <a href="https://germanfence.de/downloads/germanfence-plugin.zip" download>
                    <Download className="mr-2 h-5 w-5" />
                    Jetzt herunterladen
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert">
                <h3 className="font-semibold">Installationsanleitung:</h3>
                <ol className="text-sm space-y-2">
                  <li>Plugin-ZIP-Datei herunterladen</li>
                  <li>In WordPress: Plugins → Installieren → Plugin hochladen</li>
                  <li>ZIP-Datei auswählen und hochladen</li>
                  <li>Plugin aktivieren und konfigurieren</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

