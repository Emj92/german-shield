import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: id,
        userId: user.userId
      },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // TODO: PDF-Generation mit pdfkit oder puppeteer
    // Für jetzt: HTML-Response die als PDF gedruckt werden kann
    
    const html = generateInvoiceHTML(invoice)

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="Rechnung-${invoice.invoiceNumber}.html"`
      }
    })

  } catch (error) {
    console.error('PDF generation failed:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}

interface InvoiceData {
  invoiceNumber: string
  issuedAt: Date
  paidAt?: Date | null
  isBusiness: boolean
  companyName?: string | null
  street?: string | null
  zipCode?: string | null
  city?: string | null
  country: string
  vatId?: string | null
  netAmount: number
  taxAmount: number
  taxRate: number
  grossAmount: number
  taxLabel?: string | null
  taxExempt: boolean
  description?: string | null
  molliePaymentId?: string | null
  user: {
    email: string
    name?: string | null
  }
}

function generateInvoiceHTML(invoice: InvoiceData): string {
  const taxExemptText = invoice.taxExempt 
    ? '<div style="color: #059669; font-size: 15px; margin-top: 10px;">✓ Reverse Charge - Steuerbefreit nach §13b UStG</div>'
    : ''

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Rechnung ${invoice.invoiceNumber}</title>
  <style>
    @page { 
      size: A4;
      margin: 2cm;
    }
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      line-height: 1.6;
      color: #1d2327;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 60px;
      border-bottom: 3px solid #22D6DD;
      padding-bottom: 20px;
    }
    .company-info {
      flex: 1;
    }
    .company-logo {
      font-size: 32px;
      font-weight: bold;
      color: #22D6DD;
      margin-bottom: 10px;
    }
    .invoice-info {
      text-align: right;
    }
    .invoice-number {
      font-size: 24px;
      font-weight: bold;
      color: #22D6DD;
    }
    .customer-address {
      margin: 40px 0;
      padding: 20px;
      background: #f8f9fa;
      border-left: 4px solid #22D6DD;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
    }
    th {
      background: #22D6DD;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .totals {
      margin-top: 30px;
      text-align: right;
    }
    .totals table {
      width: 300px;
      margin-left: auto;
    }
    .totals .grand-total {
      font-size: 20px;
      font-weight: bold;
      background: #f0f9ff;
      border-top: 2px solid #22D6DD;
    }
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
      text-align: center;
    }
    .payment-info {
      background: #f0f9ff;
      padding: 20px;
      border-radius: 8px;
      margin: 30px 0;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-info">
      <div class="company-logo">🛡️ GermanFence</div>
      <div>
        Erwin Meindl<br>
        Oberensingerstraße 70<br>
        72622 Nürtingen<br>
        Deutschland
      </div>
      <div style="margin-top: 10px; font-size: 15px;">
        <strong>USt-IdNr.:</strong> DE323799140<br>
        <strong>Steuernr.:</strong> 74307/17133
      </div>
    </div>
    <div class="invoice-info">
      <div class="invoice-number">RECHNUNG</div>
      <div style="font-size: 18px; margin-top: 10px;">#${invoice.invoiceNumber}</div>
      <div style="margin-top: 20px; font-size: 15px;">
        <strong>Datum:</strong> ${new Date(invoice.issuedAt).toLocaleDateString('de-DE')}<br>
        ${invoice.paidAt ? `<strong>Bezahlt am:</strong> ${new Date(invoice.paidAt).toLocaleDateString('de-DE')}<br>` : ''}
      </div>
    </div>
  </div>

  <div class="customer-address">
    <strong>Rechnungsempfänger:</strong><br>
    ${invoice.isBusiness && invoice.companyName ? `<strong>${invoice.companyName}</strong><br>` : ''}
    ${invoice.user.name || invoice.user.email}<br>
    ${invoice.isBusiness && invoice.street ? `${invoice.street}<br>${invoice.zipCode} ${invoice.city}<br>${invoice.country}<br>` : ''}
    ${invoice.isBusiness && invoice.vatId ? `<strong>USt-IdNr.:</strong> ${invoice.vatId}` : ''}
  </div>

  <h2>Leistungsbeschreibung</h2>
  <table>
    <thead>
      <tr>
        <th>Bezeichnung</th>
        <th style="text-align: right;">Anzahl</th>
        <th style="text-align: right;">Einzelpreis</th>
        <th style="text-align: right;">Gesamt</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${invoice.description || 'GermanFence License'}</td>
        <td style="text-align: right;">1</td>
        <td style="text-align: right;">${invoice.netAmount.toFixed(2)}€</td>
        <td style="text-align: right;">${invoice.netAmount.toFixed(2)}€</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <table>
      <tr>
        <td><strong>Nettobetrag:</strong></td>
        <td style="text-align: right;">${invoice.netAmount.toFixed(2)}€</td>
      </tr>
      ${invoice.taxAmount > 0 ? `
      <tr>
        <td>${invoice.taxLabel || 'MwSt.'} (${invoice.taxRate}%):</td>
        <td style="text-align: right;">${invoice.taxAmount.toFixed(2)}€</td>
      </tr>
      ` : ''}
      <tr class="grand-total">
        <td><strong>Gesamtbetrag:</strong></td>
        <td style="text-align: right;"><strong>${invoice.grossAmount.toFixed(2)}€</strong></td>
      </tr>
    </table>
    ${taxExemptText}
  </div>

  <div class="payment-info">
    <strong>Zahlungsinformationen</strong><br>
    Status: <strong style="color: #059669;">Bezahlt</strong><br>
    Zahlungsmethode: Mollie (Kreditkarte/Lastschrift)<br>
    ${invoice.molliePaymentId ? `Transaktions-ID: ${invoice.molliePaymentId}<br>` : ''}
  </div>

  <div style="margin-top: 40px; font-size: 15px; color: #6b7280;">
    <p><strong>Hinweis:</strong> Dies ist eine rechtsgültige Rechnung für digitale Dienstleistungen. 
    Bitte bewahren Sie diese Rechnung für Ihre Unterlagen auf.</p>
  </div>

  <div class="footer">
    <p>
      <strong>GermanFence by GermanCore</strong><br>
      Erwin Meindl · Oberensingerstraße 70 · 72622 Nürtingen<br>
      E-Mail: support@germanfence.de · Web: https://germanfence.de<br>
      USt-IdNr.: DE323799140 · Steuernr.: 74307/17133
    </p>
  </div>

  <div class="no-print" style="position: fixed; top: 20px; right: 20px;">
    <button onclick="window.print()" style="background: #22D6DD; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600;">
      📄 Als PDF drucken
    </button>
  </div>
</body>
</html>
  `
}

