import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// Styles für das PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#22D6DD',
  },
  companySection: {
    fontSize: 9,
    color: '#6b7280',
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#22D6DD',
    marginBottom: 10,
  },
  invoiceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22D6DD',
    textAlign: 'right',
  },
  invoiceNumber: {
    fontSize: 11,
    textAlign: 'right',
    marginTop: 5,
  },
  invoiceDate: {
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 5,
  },
  addresses: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
  },
  addressBox: {
    width: '45%',
  },
  addressLabel: {
    fontSize: 8,
    textTransform: 'uppercase',
    color: '#6b7280',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  addressContent: {
    fontSize: 10,
    lineHeight: 1.5,
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#22D6DD',
    color: '#ffffff',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 10,
    fontSize: 10,
  },
  tableCol1: { width: '50%' },
  tableCol2: { width: '15%', textAlign: 'right' },
  tableCol3: { width: '15%', textAlign: 'right' },
  tableCol4: { width: '20%', textAlign: 'right' },
  totalsSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalsTable: {
    width: 250,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
    fontSize: 10,
  },
  totalsFinalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    fontSize: 12,
    fontWeight: 'bold',
    borderTopWidth: 2,
    borderTopColor: '#22D6DD',
    marginTop: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#6b7280',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  gobdNotice: {
    marginTop: 30,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d9dde1',
    fontSize: 8,
    color: '#6b7280',
  },
})

interface InvoiceData {
  invoiceNumber: string
  sequentialNumber: number
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
  user: {
    email: string
    name?: string | null
    company?: string | null
    street?: string | null
    zipCode?: string | null
    city?: string | null
    country?: string | null
    vatId?: string | null
  }
}

function formatGermanNumber(num: number): string {
  return num.toFixed(2).replace('.', ',')
}

function formatGermanDate(date: Date): string {
  return new Date(date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function InvoicePDF({ invoice }: { invoice: InvoiceData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>GermanFence</Text>
            <View style={styles.companySection}>
              <Text>Erwin Maximilian John Meindl</Text>
              <Text>Oberensingerstraße 70</Text>
              <Text>72622 Nürtingen, Deutschland</Text>
              <Text> </Text>
              <Text>USt-IdNr.: DE323799140</Text>
              <Text>Steuernr.: 74307/17133</Text>
            </View>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>RECHNUNG</Text>
            <Text style={styles.invoiceNumber}>Nr. {invoice.invoiceNumber}</Text>
            <Text style={styles.invoiceDate}>
              Datum: {formatGermanDate(invoice.issuedAt)}
            </Text>
            {invoice.paidAt && (
              <Text style={styles.invoiceDate}>
                Bezahlt: {formatGermanDate(invoice.paidAt)}
              </Text>
            )}
          </View>
        </View>

        {/* Addresses */}
        <View style={styles.addresses}>
          <View style={styles.addressBox}>
            <Text style={styles.addressLabel}>Rechnungsempfänger</Text>
            <View style={styles.addressContent}>
              {/* Priorisiere User-Account-Daten, dann Invoice-Daten */}
              {(invoice.user.company || invoice.companyName) && (
                <Text>{invoice.user.company || invoice.companyName}</Text>
              )}
              {invoice.user.name && <Text>{invoice.user.name}</Text>}
              {!invoice.user.name && !invoice.user.company && (
                <Text>{invoice.user.email}</Text>
              )}
              <Text> </Text>
              {(invoice.user.street || invoice.street) && (
                <Text>{invoice.user.street || invoice.street}</Text>
              )}
              {((invoice.user.zipCode || invoice.zipCode) && (invoice.user.city || invoice.city)) && (
                <Text>{invoice.user.zipCode || invoice.zipCode} {invoice.user.city || invoice.city}</Text>
              )}
              {(invoice.user.country || invoice.country) && (invoice.user.country || invoice.country) !== 'DE' && (
                <Text>{invoice.user.country || invoice.country}</Text>
              )}
              <Text> </Text>
              <Text>{invoice.user.email}</Text>
              {(invoice.user.vatId || invoice.vatId) && (
                <Text>USt-IdNr.: {invoice.user.vatId || invoice.vatId}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCol1}>Beschreibung</Text>
            <Text style={styles.tableCol2}>Menge</Text>
            <Text style={styles.tableCol3}>Einzelpreis</Text>
            <Text style={styles.tableCol4}>Gesamtpreis</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCol1}>{invoice.description || 'GermanFence Lizenz'}</Text>
            <Text style={styles.tableCol2}>1</Text>
            <Text style={styles.tableCol3}>{formatGermanNumber(invoice.netAmount)} €</Text>
            <Text style={styles.tableCol4}>{formatGermanNumber(invoice.netAmount)} €</Text>
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsTable}>
            <View style={styles.totalsRow}>
              <Text>Nettobetrag:</Text>
              <Text>{formatGermanNumber(invoice.netAmount)} €</Text>
            </View>
            {!invoice.taxExempt && invoice.taxAmount > 0 && (
              <View style={styles.totalsRow}>
                <Text>{invoice.taxLabel || 'MwSt.'} ({invoice.taxRate}%):</Text>
                <Text>{formatGermanNumber(invoice.taxAmount)} €</Text>
              </View>
            )}
            {invoice.taxExempt && (
              <View style={styles.totalsRow}>
                <Text>Steuerbefreit (Reverse Charge §13b UStG)</Text>
                <Text>0,00 €</Text>
              </View>
            )}
            <View style={styles.totalsFinalRow}>
              <Text>Gesamtbetrag:</Text>
              <Text>{formatGermanNumber(invoice.grossAmount)} €</Text>
            </View>
          </View>
        </View>

        {/* Payment Notice */}
        {invoice.paidAt && (
          <View style={{ marginTop: 20, padding: 10, backgroundColor: '#F4FDFD', borderWidth: 1, borderColor: '#22D6DD' }}>
            <Text style={{ fontSize: 10, color: '#22D6DD', fontWeight: 'bold' }}>
              ✓ Rechnung vollständig bezahlt am {formatGermanDate(invoice.paidAt)}
            </Text>
          </View>
        )}

        {/* GoBD Notice */}
        <View style={styles.gobdNotice}>
          <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>
            GoBD-konforme Rechnung
          </Text>
          <Text>
            Diese Rechnung wurde gemäß den Grundsätzen zur ordnungsmäßigen Führung und Aufbewahrung von Büchern, 
            Aufzeichnungen und Unterlagen in elektronischer Form sowie zum Datenzugriff (GoBD) erstellt. 
            Fortlaufende Nummer: {invoice.sequentialNumber}. 
            Diese Rechnung ist unveränderbar und revisionssicher archiviert.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>GermanFence · Erwin Maximilian John Meindl · Oberensingerstraße 70 · 72622 Nürtingen</Text>
          <Text>USt-IdNr.: DE323799140 · Steuernr.: 74307/17133</Text>
          <Text>E-Mail: support@germanfence.de · Web: https://germanfence.de</Text>
        </View>
      </Page>
    </Document>
  )
}

