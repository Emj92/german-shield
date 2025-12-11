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
    ? '<div style="color: #059669; font-size: 13px; margin-top: 10px;">✓ Reverse Charge - Steuerbefreit nach §13b UStG</div>'
    : ''

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Rechnung ${invoice.invoiceNumber} - GermanFence</title>
  <style>
    @page { 
      size: A4;
      margin: 1.5cm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.5;
      color: #1d2327;
      max-width: 800px;
      margin: 0 auto;
      padding: 30px;
      background: #fff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #22D6DD;
    }
    .logo-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #22D6DD 0%, #1EBEC5 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      font-weight: bold;
    }
    .company-name {
      font-size: 24px;
      font-weight: 700;
      color: #22D6DD;
    }
    .company-details {
      font-size: 12px;
      color: #6b7280;
      margin-top: 15px;
      line-height: 1.6;
    }
    .invoice-header {
      text-align: right;
    }
    .invoice-title {
      font-size: 28px;
      font-weight: 700;
      color: #22D6DD;
      letter-spacing: 2px;
    }
    .invoice-number {
      font-size: 16px;
      color: #1d2327;
      margin-top: 5px;
    }
    .invoice-date {
      font-size: 13px;
      color: #6b7280;
      margin-top: 10px;
    }
    .addresses {
      display: flex;
      justify-content: space-between;
      margin: 30px 0;
      gap: 40px;
    }
    .address-box {
      flex: 1;
    }
    .address-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #6b7280;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .address-content {
      font-size: 13px;
      line-height: 1.7;
    }
    .address-content strong {
      font-size: 14px;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
    }
    .items-table th {
      background: #22D6DD;
      color: white;
      padding: 12px 15px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .items-table th:last-child,
    .items-table td:last-child {
      text-align: right;
    }
    .items-table td {
      padding: 15px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 13px;
    }
    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
    .totals-table {
      width: 280px;
    }
    .totals-table tr td {
      padding: 8px 0;
      font-size: 13px;
    }
    .totals-table tr td:last-child {
      text-align: right;
      font-weight: 500;
    }
    .totals-table .grand-total td {
      padding-top: 12px;
      border-top: 2px solid #22D6DD;
      font-size: 16px;
      font-weight: 700;
    }
    .totals-table .grand-total td:last-child {
      color: #22D6DD;
    }
    .payment-box {
      background: #f0f9ff;
      border-left: 4px solid #22D6DD;
      padding: 20px;
      margin: 30px 0;
      font-size: 13px;
    }
    .payment-box h4 {
      margin-bottom: 10px;
      font-size: 14px;
    }
    .status-paid {
      color: #059669;
      font-weight: 600;
    }
    .bank-info {
      background: #f8f9fa;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
      font-size: 13px;
    }
    .bank-info h4 {
      margin-bottom: 10px;
      font-size: 14px;
      color: #1d2327;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 11px;
      color: #6b7280;
    }
    .footer p {
      margin: 5px 0;
    }
    .legal-note {
      margin-top: 30px;
      padding: 15px;
      background: #fefce8;
      border-radius: 6px;
      font-size: 12px;
      color: #854d0e;
    }
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #22D6DD;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(34, 214, 221, 0.3);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .print-button:hover {
      background: #1EBEC5;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
      .print-button { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo-section">
        <div class="logo">🛡️</div>
        <div class="company-name">GermanFence</div>
      </div>
      <div class="company-details">
        Erwin Meindl<br>
        Oberensingerstraße 70<br>
        72622 Nürtingen, Deutschland<br>
        <br>
        USt-IdNr.: DE323799140<br>
        Steuernr.: 74307/17133
      </div>
    </div>
    <div class="invoice-header">
      <div class="invoice-title">RECHNUNG</div>
      <div class="invoice-number">${invoice.invoiceNumber}</div>
      <div class="invoice-date">
        Datum: ${new Date(invoice.issuedAt).toLocaleDateString('de-DE')}<br>
        ${invoice.paidAt ? `Bezahlt: ${new Date(invoice.paidAt).toLocaleDateString('de-DE')}` : ''}
      </div>
    </div>
  </div>

  <div class="addresses">
    <div class="address-box">
      <div class="address-label">Rechnungsadresse</div>
      <div class="address-content">
        ${invoice.isBusiness && invoice.companyName ? `<strong>${invoice.companyName}</strong><br>` : ''}
        ${invoice.user.name || invoice.user.email}<br>
        ${invoice.isBusiness && invoice.street ? `${invoice.street}<br>${invoice.zipCode} ${invoice.city}<br>${invoice.country}` : invoice.user.email}
        ${invoice.isBusiness && invoice.vatId ? `<br><br>USt-IdNr.: ${invoice.vatId}` : ''}
      </div>
    </div>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th style="width: 50%;">Beschreibung</th>
        <th style="width: 15%;">Menge</th>
        <th style="width: 17%;">Einzelpreis</th>
        <th style="width: 18%;">Betrag</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <strong>${invoice.description || 'GermanFence License'}</strong><br>
          <span style="color: #6b7280; font-size: 12px;">Jahreslizenz für WordPress Anti-Spam Plugin</span>
        </td>
        <td>1</td>
        <td>${invoice.netAmount.toFixed(2)} €</td>
        <td>${invoice.netAmount.toFixed(2)} €</td>
      </tr>
    </tbody>
  </table>

  <div class="totals-section">
    <table class="totals-table">
      <tr>
        <td>Zwischensumme (Netto)</td>
        <td>${invoice.netAmount.toFixed(2)} €</td>
      </tr>
      ${invoice.taxAmount > 0 ? `
      <tr>
        <td>${invoice.taxLabel || 'MwSt.'} (${invoice.taxRate}%)</td>
        <td>${invoice.taxAmount.toFixed(2)} €</td>
      </tr>
      ` : ''}
      <tr class="grand-total">
        <td>Gesamtbetrag</td>
        <td>${invoice.grossAmount.toFixed(2)} €</td>
      </tr>
    </table>
  </div>
  ${taxExemptText}

  <div class="payment-box">
    <h4>💳 Zahlungsinformation</h4>
    <p>
      Status: <span class="status-paid">✓ Bezahlt</span><br>
      Zahlungsmethode: Online-Zahlung (Mollie)<br>
      ${invoice.molliePaymentId ? `Transaktions-ID: ${invoice.molliePaymentId}` : ''}
    </p>
  </div>

  <div class="bank-info">
    <h4>🏦 Bankverbindung</h4>
    <p>
      Kontoinhaber: Erwin Meindl<br>
      IBAN: DE89 6115 0020 0106 5028 41<br>
      BIC: ESSLDE66XXX<br>
      Bank: Kreissparkasse Esslingen-Nürtingen
    </p>
  </div>

  <div class="legal-note">
    <strong>Hinweis:</strong> Dies ist eine rechtsgültige Rechnung für digitale Dienstleistungen. 
    Leistungszeitraum: 12 Monate ab Kaufdatum. Bitte bewahren Sie diese Rechnung für Ihre Unterlagen auf.
  </div>

  <div class="footer">
    <p><strong>GermanFence by GermanCore</strong></p>
    <p>Erwin Meindl · Oberensingerstraße 70 · 72622 Nürtingen · Deutschland</p>
    <p>E-Mail: support@germanfence.de · Web: https://germanfence.de</p>
    <p>USt-IdNr.: DE323799140 · Steuernr.: 74307/17133</p>
  </div>

  <button class="print-button no-print" onclick="window.print()">
    📄 Als PDF speichern
  </button>
</body>
</html>
  `
}

