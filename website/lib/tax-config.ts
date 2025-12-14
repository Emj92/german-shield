/**
 * Tax Configuration für verschiedene Länder
 * Alle Preise sind Nettopreise, Steuern werden on-top berechnet
 */

export interface TaxRate {
  country: string
  countryCode: string
  rate: number // Prozentsatz
  label: string
}

export const TAX_RATES: Record<string, TaxRate> = {
  DE: { country: 'Deutschland', countryCode: 'DE', rate: 19, label: 'MwSt.' },
  AT: { country: 'Österreich', countryCode: 'AT', rate: 20, label: 'MwSt.' },
  CH: { country: 'Schweiz', countryCode: 'CH', rate: 8.1, label: 'MwSt.' },
  US: { country: 'USA', countryCode: 'US', rate: 0, label: 'Tax' }, // Digitale Produkte meist steuerfrei
  CN: { country: 'China', countryCode: 'CN', rate: 13, label: 'VAT' },
  IN: { country: 'Indien', countryCode: 'IN', rate: 18, label: 'GST' },
  IT: { country: 'Italien', countryCode: 'IT', rate: 22, label: 'IVA' },
  FR: { country: 'Frankreich', countryCode: 'FR', rate: 20, label: 'TVA' },
}

export const EU_COUNTRIES = ['DE', 'AT', 'IT', 'FR', 'BE', 'NL', 'LU', 'DK', 'SE', 'FI', 'IE', 'PT', 'ES', 'GR', 'PL', 'CZ', 'HU', 'RO', 'BG', 'HR', 'SI', 'SK', 'EE', 'LV', 'LT', 'CY', 'MT']

/**
 * Berechnet Steuer für einen Betrag
 */
export function calculateTax(netAmount: number, countryCode: string, hasValidVatId: boolean = false): {
  netAmount: number
  taxAmount: number
  taxRate: number
  grossAmount: number
  taxLabel: string
  taxExempt: boolean
  isGermanBusiness: boolean
} {
  const taxConfig = TAX_RATES[countryCode] || { rate: 0, label: 'Tax' }
  
  // Reverse Charge: EU-Firmen mit gültiger USt-IdNr. zahlen keine Steuer (außer DE)
  const isEU = EU_COUNTRIES.includes(countryCode)
  const isReverseCharge = hasValidVatId && isEU && countryCode !== 'DE'
  
  // Deutsche Firmen mit USt-IdNr.: Zahlen MwSt., können aber Vorsteuer abziehen
  // Zeigen trotzdem Netto-Preis an (effektiver Preis für die Firma)
  const isGermanBusiness = hasValidVatId && countryCode === 'DE'
  const taxExempt = isReverseCharge || isGermanBusiness
  
  // Berechnung: Bei Reverse Charge = 0% MwSt., bei DE-Firma trotzdem MwSt. berechnen aber Netto anzeigen
  const taxRate = isReverseCharge ? 0 : taxConfig.rate
  const taxAmount = netAmount * (taxRate / 100)
  const grossAmount = netAmount + taxAmount
  
  return {
    netAmount,
    taxAmount,
    taxRate,
    grossAmount,
    taxLabel: taxConfig.label,
    taxExempt,
    isGermanBusiness
  }
}

/**
 * Validiert USt-IdNr. Format (Basic validation, nicht VIES API)
 */
export function validateVatIdFormat(vatId: string, countryCode: string): boolean {
  if (!vatId) return false
  
  // Entferne Leerzeichen und Bindestriche
  const cleanVatId = vatId.replace(/[\s\-]/g, '').toUpperCase()
  
  // Format-Validierung nach Land
  const patterns: Record<string, RegExp> = {
    DE: /^DE[0-9]{9}$/,
    AT: /^ATU[0-9]{8}$/,
    FR: /^FR[0-9A-Z]{2}[0-9]{9}$/,
    IT: /^IT[0-9]{11}$/,
    ES: /^ES[0-9A-Z][0-9]{7}[0-9A-Z]$/,
    NL: /^NL[0-9]{9}B[0-9]{2}$/,
    BE: /^BE[0-9]{10}$/,
    // Weitere Länder...
  }
  
  const pattern = patterns[countryCode]
  if (!pattern) return false
  
  return pattern.test(cleanVatId)
}

/**
 * Paket-Preise (Netto, jährlich)
 */
export const PACKAGE_PRICES = {
  single: 29,
  freelancer: 99,
  agency: 299
}

export const PACKAGE_NAMES = {
  single: 'Single',
  freelancer: 'Freelancer',  
  agency: 'Agency'
}

