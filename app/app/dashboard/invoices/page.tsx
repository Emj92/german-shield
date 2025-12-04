import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileText } from 'lucide-react'
import { prisma } from '@/lib/db'

async function getInvoices(userId: string) {
  return await prisma.invoice.findMany({
    where: { userId },
    orderBy: { issuedAt: 'desc' },
  })
}

export default async function InvoicesPage() {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  const invoices = await getInvoices(user.userId)

  return (
    <DashboardLayout user={{ email: user.email, role: user.role }}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rechnungen</h1>
          <p className="text-muted-foreground">
            Alle Ihre Rechnungen auf einen Blick
          </p>
        </div>

        {invoices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Keine Rechnungen vorhanden</p>
              <p className="text-sm text-muted-foreground">
                Ihre Rechnungen werden hier angezeigt
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
                        {invoice.amount.toFixed(2)} {invoice.currency}
                      </div>
                      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        invoice.status === 'PAID' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : invoice.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {invoice.status === 'PAID' ? 'Bezahlt' : 
                         invoice.status === 'PENDING' ? 'Ausstehend' : 
                         invoice.status === 'OVERDUE' ? 'Überfällig' : 'Storniert'}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      {invoice.description && (
                        <p className="text-sm text-muted-foreground">{invoice.description}</p>
                      )}
                    </div>
                    {invoice.pdfUrl && (
                      <Button variant="outline" size="sm" asChild className="border-[#22D6DD] text-[#22D6DD] hover:bg-[#22D6DD]/10">
                        <a href={invoice.pdfUrl} download>
                          <Download className="mr-2 h-4 w-4" />
                          PDF herunterladen
                        </a>
                      </Button>
                    )}
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

