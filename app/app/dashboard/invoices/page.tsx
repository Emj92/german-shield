import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, FileText, CreditCard, Calendar, CheckCircle2, XCircle, AlertCircle, TrendingUp, X } from 'lucide-react'
import { prisma } from '@/lib/db'

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

  const [invoices, subscriptions] = await Promise.all([
    getInvoices(user.userId),
    getSubscriptions(user.userId)
  ])

  const activeSubscription = subscriptions.find(s => s.status === 'ACTIVE')

  return (
    <DashboardLayout user={{ email: user.email, role: user.role }}>
      <div className="p-12 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rechnungen & Abos</h1>
          <p className="text-muted-foreground">
            Verwalte deine Abonnements und lade Rechnungen herunter
          </p>
        </div>

        {/* Aktives Abo */}
        {activeSubscription ? (
          <Card className="border-[#22D6DD] border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-[#22D6DD]" />
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
                    <div className="text-2xl font-bold text-[#22D6DD]">
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
              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" className="flex-1 border-[#22D6DD] text-[#22D6DD] hover:bg-[#22D6DD]/10">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Paket upgraden
                </Button>
                <Button variant="outline" className="flex-1 border-red-500 text-red-500 hover:bg-red-50">
                  <X className="mr-2 h-4 w-4" />
                  Abo kündigen
                </Button>
              </div>

              {activeSubscription.status === 'CANCELLED' && activeSubscription.endDate && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
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
                Kaufe eine Lizenz, um automatische Verlängerungen zu aktivieren
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

        {/* Rechnungen */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Rechnungen</h2>
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
            <div className="grid gap-4">
              {invoices.map((invoice) => (
                <Card key={invoice.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Rechnung #{invoice.invoiceNumber}</CardTitle>
                        <CardDescription>
                          Ausgestellt am {new Date(invoice.issuedAt).toLocaleDateString('de-DE')}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {invoice.grossAmount.toFixed(2)} {invoice.currency}
                        </div>
                        <Badge className={
                          invoice.status === 'PAID' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : invoice.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }>
                          {invoice.status === 'PAID' ? (
                            <><CheckCircle2 className="mr-1 h-3 w-3" /> Bezahlt</>
                          ) : invoice.status === 'PENDING' ? (
                            <><AlertCircle className="mr-1 h-3 w-3" /> Ausstehend</>
                          ) : invoice.status === 'OVERDUE' ? (
                            <><XCircle className="mr-1 h-3 w-3" /> Überfällig</>
                          ) : (
                            <><XCircle className="mr-1 h-3 w-3" /> Storniert</>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {invoice.description && (
                        <p className="text-sm text-muted-foreground">{invoice.description}</p>
                      )}
                      
                      {/* Steuer-Details */}
                      {invoice.taxAmount > 0 && (
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Netto:</span>
                            <span>{invoice.netAmount.toFixed(2)}€</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{invoice.taxLabel} ({invoice.taxRate}%):</span>
                            <span>{invoice.taxAmount.toFixed(2)}€</span>
                          </div>
                          <div className="flex justify-between font-semibold pt-1 border-t">
                            <span>Gesamt:</span>
                            <span>{invoice.grossAmount.toFixed(2)}€</span>
                          </div>
                        </div>
                      )}

                      {invoice.taxExempt && (
                        <div className="flex items-center gap-2 text-xs text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          Reverse Charge - Steuerbefreit
                        </div>
                      )}

                      {/* Firmen-Details */}
                      {invoice.isBusiness && (
                        <div className="text-xs text-muted-foreground pt-2 border-t">
                          <div className="font-medium">{invoice.companyName}</div>
                          {invoice.vatId && <div>USt-IdNr.: {invoice.vatId}</div>}
                          <div>{invoice.street}, {invoice.zipCode} {invoice.city}</div>
                        </div>
                      )}

                      {/* Download Button */}
                      <div className="pt-3">
                        {invoice.pdfUrl ? (
                          <Button variant="outline" size="sm" asChild className="w-full border-[#22D6DD] text-[#22D6DD] hover:bg-[#22D6DD]/10">
                            <a href={invoice.pdfUrl} download>
                              <Download className="mr-2 h-4 w-4" />
                              PDF herunterladen
                            </a>
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" disabled className="w-full">
                            <FileText className="mr-2 h-4 w-4" />
                            PDF wird erstellt...
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
