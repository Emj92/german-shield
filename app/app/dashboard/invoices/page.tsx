import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, FileText, CreditCard, Calendar, CheckCircle2, XCircle, AlertCircle, Sparkles, Eye } from 'lucide-react'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { SubscriptionActions } from '@/components/SubscriptionActions'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

async function getInvoices(userId: string) {
  return await prisma.invoice.findMany({
    where: { userId },
    orderBy: { issuedAt: 'desc' },
  })
}

async function getSubscriptions(userId: string) {
  return await prisma.subscription.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

async function getCurrentLicense(userId: string) {
  return await prisma.license.findFirst({
    where: { userId, status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  })
}

const PACKAGE_ORDER = ['FREE', 'SINGLE', 'FREELANCER', 'AGENCY'] as const
type PackageType = typeof PACKAGE_ORDER[number]

function isUpgrade(currentPackage: PackageType | null, targetPackage: PackageType): boolean {
  if (!currentPackage) return false
  const currentIndex = PACKAGE_ORDER.indexOf(currentPackage)
  const targetIndex = PACKAGE_ORDER.indexOf(targetPackage)
  return targetIndex > currentIndex
}

const PACKAGE_NAMES = {
  SINGLE: 'Single',
  FREELANCER: 'Freelancer',
  AGENCY: 'Agency',
  FREE: 'Free'
}

const STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  EXPIRED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  SUSPENDED: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
}

const STATUS_LABELS = {
  ACTIVE: 'Aktiv',
  PENDING: 'Ausstehend',
  CANCELLED: 'Gekündigt',
  EXPIRED: 'Abgelaufen',
  SUSPENDED: 'Pausiert'
}

export default async function InvoicesPage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  const [invoices, subscriptions, currentLicense] = await Promise.all([
    getInvoices(user.userId),
    getSubscriptions(user.userId),
    getCurrentLicense(user.userId)
  ])

  const activeSubscription = subscriptions.find(s => s.status === 'ACTIVE')
  const cancelledSubscription = subscriptions.find(s => s.status === 'CANCELLED')
  const currentPackage = currentLicense?.packageType as PackageType | null

  return (
    <DashboardLayout user={{ email: user.email, role: user.role }}>
      <div className="p-12 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rechnungen & Abos</h1>
          <p className="text-muted-foreground">
            Verwalte deine Abonnements und lade Rechnungen herunter
          </p>
        </div>

        {/* Abos */}
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-[#22D6DD]" />
          Abos
        </h2>
        
        {/* Gekündigtes Abo */}
        {cancelledSubscription && (
          <Card className="border-[#d9dde1]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    GermanFence {PACKAGE_NAMES[cancelledSubscription.packageType]}
                  </CardTitle>
                  <CardDescription>
                    Gekündigt zum {cancelledSubscription.endDate ? new Date(cancelledSubscription.endDate).toLocaleDateString('de-DE') : 'unbekannt'}
                  </CardDescription>
                </div>
                <Badge className={STATUS_COLORS.CANCELLED}>
                  {STATUS_LABELS.CANCELLED}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-[9px] p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-yellow-900 dark:text-yellow-200">Abo läuft aus</div>
                  <div className="text-sm text-yellow-800 dark:text-yellow-300">
                    Dein Abo ist noch aktiv bis zum {cancelledSubscription.endDate ? new Date(cancelledSubscription.endDate).toLocaleDateString('de-DE') : 'unbekannt'}. 
                    Danach verlierst du den Zugriff auf Premium-Features.
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Preis:</span>
                  <span className="ml-2 font-semibold">{cancelledSubscription.grossAmount.toFixed(2)} {cancelledSubscription.currency} / Jahr</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Startdatum:</span>
                  <span className="ml-2">{new Date(cancelledSubscription.startDate).toLocaleDateString('de-DE')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Aktives Abo */}
        {activeSubscription ? (
          <Card className="border-[#d9dde1]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Aktives Abonnement
                  </CardTitle>
                  <CardDescription>
                    Dein Abo verlängert sich automatisch jährlich
                  </CardDescription>
                </div>
                <Badge className={STATUS_COLORS[activeSubscription.status]}>
                  {STATUS_LABELS[activeSubscription.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Abo-Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Paket</div>
                    <div className="text-2xl font-bold">
                      GermanFence {PACKAGE_NAMES[activeSubscription.packageType]}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Preis</div>
                    <div className="text-lg font-semibold">
                      {activeSubscription.grossAmount.toFixed(2)} {activeSubscription.currency} / Jahr
                    </div>
                    {activeSubscription.taxAmount > 0 && (
                      <div className="text-xs text-muted-foreground">
                        (Netto: {activeSubscription.netAmount.toFixed(2)}€ + {activeSubscription.taxAmount.toFixed(2)}€ MwSt.)
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Startdatum</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(activeSubscription.startDate).toLocaleDateString('de-DE')}</span>
                    </div>
                  </div>
                  {activeSubscription.nextPaymentDate && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Nächste Zahlung</div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#22D6DD]" />
                        <span className="font-semibold">{new Date(activeSubscription.nextPaymentDate).toLocaleDateString('de-DE')}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Aktionen */}
              <SubscriptionActions
                subscriptionId={activeSubscription.id}
                currentPackage={activeSubscription.packageType as 'SINGLE' | 'FREELANCER' | 'AGENCY'}
                currentPrice={activeSubscription.netAmount}
              />

              {activeSubscription.status === 'CANCELLED' && activeSubscription.endDate && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-[9px] p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-yellow-900 dark:text-yellow-200">Abo gekündigt</div>
                    <div className="text-sm text-yellow-800 dark:text-yellow-300">
                      Dein Abo läuft noch bis zum {new Date(activeSubscription.endDate).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Kein aktives Abonnement</p>
              <p className="text-sm text-muted-foreground mb-4">
                Kaufe einen API-Key, um automatische Verlängerungen zu aktivieren
              </p>
              <Button asChild className="bg-[#22D6DD] hover:bg-[#1EBEC5] text-white">
                <a href="https://germanfence.de#pricing">
                  Jetzt kaufen
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Alle Abos (Verlauf) */}
        {subscriptions.length > 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Abo-Verlauf</h2>
            <div className="grid gap-4">
              {subscriptions.filter(s => s.id !== activeSubscription?.id).map((sub) => (
                <Card key={sub.id} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        GermanFence {PACKAGE_NAMES[sub.packageType]}
                      </CardTitle>
                      <Badge className={STATUS_COLORS[sub.status]}>
                        {STATUS_LABELS[sub.status]}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {new Date(sub.startDate).toLocaleDateString('de-DE')} - 
                        {sub.endDate ? new Date(sub.endDate).toLocaleDateString('de-DE') : 'laufend'}
                      </span>
                      <span className="font-semibold">
                        {sub.grossAmount.toFixed(2)} {sub.currency} / Jahr
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Unsere Pakete - Preistabellen */}
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#22D6DD]" />
            Unsere Pakete
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* FREE */}
            <Card className={`border-2 flex flex-col h-full ${currentPackage === 'FREE' ? 'border-[#22D6DD] bg-[#22D6DD]/5' : ''}`}>
              <CardHeader className="text-center pb-2">
                <Badge className="w-fit mb-2 bg-slate-100 text-slate-700 mx-auto">Freemium</Badge>
                <CardTitle className="text-2xl">0€/Jahr</CardTitle>
                <CardDescription className="text-sm">
                  Kostenlos · 1 Website
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-2 mb-4 flex-1 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-slate-500 flex-shrink-0" />
                    <span>Basis Honeypot</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-slate-500 flex-shrink-0" />
                    <span>Zeitstempel-Check</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-slate-500 flex-shrink-0" />
                    <span>JavaScript Bot-Scan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-slate-500 flex-shrink-0" />
                    <span>Community Support</span>
                  </li>
                </ul>
                {currentPackage === 'FREE' ? (
                  <Button disabled className="w-full bg-[#22D6DD]/10 text-[#22D6DD] border-[#22D6DD] hover:bg-[#22D6DD]/10 cursor-default">
                    Dein aktuelles Paket
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="w-full border-slate-300 text-slate-700">
                    <a href="https://germanfence.de/downloads/germanfence-plugin.zip" download>
                      <Download className="mr-2 h-4 w-4" />
                      Kostenlos
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* SINGLE */}
            <Card className={`border-2 flex flex-col h-full ${currentPackage === 'SINGLE' ? 'border-[#22D6DD] bg-[#22D6DD]/5' : ''}`}>
              <CardHeader className="text-center pb-2">
                <Badge className="w-fit mb-2 bg-[#22D6DD]/10 text-[#22D6DD] mx-auto">Single</Badge>
                <CardTitle className="text-2xl">29€/Jahr</CardTitle>
                <CardDescription className="text-sm">
                  1 Website
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-2 mb-4 flex-1 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#22D6DD] flex-shrink-0" />
                    <span className="font-medium">Alles aus Free</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#22D6DD] flex-shrink-0" />
                    <span>White Label</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#22D6DD] flex-shrink-0" />
                    <span>GEO-Blocking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#22D6DD] flex-shrink-0" />
                    <span>Priority Support</span>
                  </li>
                </ul>
                {currentPackage === 'SINGLE' ? (
                  <Button disabled className="w-full bg-[#22D6DD]/10 text-[#22D6DD] border-[#22D6DD] hover:bg-[#22D6DD]/10 cursor-default">
                    Dein aktuelles Paket
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="w-full border-[#22D6DD] text-[#22D6DD] hover:bg-[#22D6DD]/10">
                    <Link href="https://germanfence.de#pricing">
                      {isUpgrade(currentPackage, 'SINGLE') ? 'Jetzt upgraden' : 'Jetzt kaufen'}
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* FREELANCER - Popular */}
            <Card className={`border-2 flex flex-col h-full relative ${currentPackage === 'FREELANCER' ? 'border-[#22D6DD] bg-[#22D6DD]/5' : 'border-[#22D6DD]'}`}>
              {currentPackage !== 'FREELANCER' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-[#22D6DD] text-white px-3 py-0.5 text-xs">
                    ⭐ Beliebt
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <Badge className="w-fit mb-2 bg-[#22D6DD]/20 text-[#22D6DD] mx-auto">Freelancer</Badge>
                <CardTitle className="text-2xl">99€/Jahr</CardTitle>
                <CardDescription className="text-sm">
                  5 Websites
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-2 mb-4 flex-1 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#22D6DD] flex-shrink-0" />
                    <span className="font-medium">Alles aus Single</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#22D6DD] flex-shrink-0" />
                    <span>Bis zu 5 Websites</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#22D6DD] flex-shrink-0" />
                    <span>Client-Projekte erlaubt</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#22D6DD] flex-shrink-0" />
                    <span>Priority Support</span>
                  </li>
                </ul>
                {currentPackage === 'FREELANCER' ? (
                  <Button disabled className="w-full bg-[#22D6DD]/10 text-[#22D6DD] border-[#22D6DD] hover:bg-[#22D6DD]/10 cursor-default">
                    Dein aktuelles Paket
                  </Button>
                ) : (
                  <Button asChild className="w-full bg-[#22D6DD] text-white hover:bg-[#22D6DD]/90">
                    <Link href="https://germanfence.de#pricing">
                      {isUpgrade(currentPackage, 'FREELANCER') ? 'Jetzt upgraden' : 'Jetzt kaufen'}
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* AGENCY */}
            <Card className={`border-2 flex flex-col h-full ${currentPackage === 'AGENCY' ? 'border-[#F06292] bg-[#F06292]/5' : 'border-[#F06292]'}`}>
              <CardHeader className="text-center pb-2">
                <Badge className="w-fit mb-2 bg-[#F06292]/10 text-[#F06292] mx-auto">Agency</Badge>
                <CardTitle className="text-2xl">199€/Jahr</CardTitle>
                <CardDescription className="text-sm">
                  25 Websites
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-2 mb-4 flex-1 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#F06292] flex-shrink-0" />
                    <span className="font-medium">Alles aus Freelancer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#F06292] flex-shrink-0" />
                    <span>Bis zu 25 Websites</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#F06292] flex-shrink-0" />
                    <span>White-Label Option</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#F06292] flex-shrink-0" />
                    <span>Dedicated Support</span>
                  </li>
                </ul>
                {currentPackage === 'AGENCY' ? (
                  <Button disabled className="w-full bg-[#F06292]/10 text-[#F06292] border-[#F06292] hover:bg-[#F06292]/10 cursor-default">
                    Dein aktuelles Paket
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="w-full border-[#F06292] text-[#F06292] hover:bg-[#F06292]/10">
                    <Link href="https://germanfence.de#pricing">
                      {isUpgrade(currentPackage, 'AGENCY') ? 'Jetzt upgraden' : 'Jetzt kaufen'}
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            * Alle Preise verstehen sich zzgl. MwSt. Die Abrechnung erfolgt jährlich.
          </p>
        </div>

        {/* Rechnungen */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#22D6DD]" />
            Rechnungen
          </h2>
          {invoices.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Keine Rechnungen vorhanden</p>
                <p className="text-sm text-muted-foreground">
                  Deine Rechnungen werden hier angezeigt
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-white border-b border-[#d9dde1]">
                        <TableHead className="font-semibold">Datum</TableHead>
                        <TableHead className="font-semibold">Rechnungsnummer</TableHead>
                        <TableHead className="font-semibold">Betrag</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold text-right">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id} className="hover:bg-[#F2F5F8]">
                          {/* Datum */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-[#22D6DD] flex-shrink-0" />
                              <span className="font-medium">
                                {new Date(invoice.issuedAt).toLocaleDateString('de-DE')}
                              </span>
                            </div>
                          </TableCell>

                          {/* Rechnungsnummer */}
                          <TableCell>
                            <div className="font-mono text-sm">
                              {invoice.invoiceNumber}
                            </div>
                            {invoice.description && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {invoice.description}
                              </div>
                            )}
                          </TableCell>

                          {/* Betrag */}
                          <TableCell>
                            <div className="font-semibold">
                              {invoice.grossAmount.toFixed(2)} {invoice.currency}
                            </div>
                            {invoice.taxAmount > 0 && (
                              <div className="text-xs text-muted-foreground">
                                Netto: {invoice.netAmount.toFixed(2)}€
                              </div>
                            )}
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            <Badge className={
                              invoice.status === 'PAID' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : invoice.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            }>
                              {invoice.status === 'PAID' ? (
                                <><CheckCircle2 className="mr-1 h-3 w-3 inline" /> Bezahlt</>
                              ) : invoice.status === 'PENDING' ? (
                                <><AlertCircle className="mr-1 h-3 w-3 inline" /> Ausstehend</>
                              ) : invoice.status === 'OVERDUE' ? (
                                <><XCircle className="mr-1 h-3 w-3 inline" /> Überfällig</>
                              ) : (
                                <><XCircle className="mr-1 h-3 w-3 inline" /> Storniert</>
                              )}
                            </Badge>
                          </TableCell>

                          {/* Aktionen */}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                asChild
                                className="h-8 w-8 p-0 hover:bg-[#22D6DD]/10 hover:text-[#22D6DD]"
                              >
                                <a href={`/api/invoices/${invoice.id}/pdf`} target="_blank" rel="noopener noreferrer">
                                  <Eye className="h-4 w-4" />
                                </a>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                asChild
                                className="h-8 w-8 p-0 hover:bg-[#22D6DD]/10 hover:text-[#22D6DD]"
                              >
                                <a href={`/api/invoices/${invoice.id}/pdf?download=true`} download>
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
