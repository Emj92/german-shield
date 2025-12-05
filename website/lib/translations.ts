// Übersetzungen für die Website

export type Language = 'de' | 'en'

export const translations = {
  de: {
    // Hero Section
    hero: {
      title: 'Schütze deine WordPress-Website vor Spam',
      subtitle: 'Leistungsstarker Anti-Spam-Schutz ohne nervige Captchas. Made in Germany. DSGVO-konform.',
      cta: 'Jetzt starten',
      learnMore: 'Mehr erfahren',
    },
    // Stats
    stats: {
      spamBlockRate: 'Spam-Block-Rate',
      performance: 'Performance-Impact',
      gdpr: 'DSGVO-konform',
      hosted: 'In Deutschland gehostet',
      spamBlocked: 'Spammails geblockt',
      customers: 'Zufriedene Kunden',
      protection: 'Schutz',
    },
    // Features
    features: {
      title: 'Leistungsstarke Features',
      subtitle: 'Alles was du brauchst, um deine WordPress-Site vor Spam zu schützen',
    },
    // Pricing
    pricing: {
      title: 'Einfache, faire Preise',
      subtitle: 'Wähle das Paket, das zu dir passt. Alle Pakete mit 14 Tage Geld-zurück-Garantie.',
      single: 'Single',
      singleDesc: 'Jährlich · 1 Website',
      freelancer: 'Freelancer',
      freelancerDesc: 'Jährlich · 5 Websites',
      agency: 'Agency',
      agencyDesc: 'Jährlich · 25 Websites',
      plusTax: 'zzgl. MwSt.',
      buyNow: 'Jetzt kaufen',
      popular: 'Beliebt',
      features: 'Alle Features',
    },
    // Buy Modal
    modal: {
      license: 'Lizenz',
      net: 'Netto',
      plus: 'plus',
      perYear: '/ Jahr',
      reverseCharge: 'Reverse Charge (Steuerbefreit)',
      netNotice: 'Nettobetrag - Keine Umsatzsteuer bei gültiger USt-IdNr.',
      taxFree: 'Steuerfrei in',
      email: 'E-Mail-Adresse',
      emailPlaceholder: 'deine@email.de',
      companyPurchase: 'Ich kaufe als Firma ein',
      companyName: 'Firmenname',
      companyPlaceholder: 'Meine Firma GmbH',
      country: 'Land',
      vatId: 'USt-IdNr.',
      vatIdValid: 'Gültige USt-IdNr. - Reverse Charge',
      street: 'Straße & Hausnummer',
      streetPlaceholder: 'Musterstraße 123',
      zipCode: 'PLZ',
      zipCodePlaceholder: '12345',
      city: 'Stadt',
      cityPlaceholder: 'München',
      securePayment: '💳 Sichere Zahlung über Mollie · 14 Tage Geld-zurück-Garantie · Automatische Verlängerung jährlich',
      cancel: 'Abbrechen',
      toPay: 'Zur Zahlung',
      loading: 'Wird geladen...',
    },
    // Footer
    footer: {
      copyright: '© 2024-2025 GermanFence. Alle Rechte vorbehalten.',
      madeWith: 'Made with',
      inGermany: 'in Germany',
      by: 'by',
      priceNotice: '💶 Alle Preise verstehen sich zzgl. der gesetzlichen Mehrwertsteuer',
    },
  },
  en: {
    // Hero Section
    hero: {
      title: 'Protect Your WordPress Website from Spam',
      subtitle: 'Powerful anti-spam protection without annoying captchas. Made in Germany. GDPR compliant.',
      cta: 'Get Started',
      learnMore: 'Learn More',
    },
    // Stats
    stats: {
      spamBlockRate: 'Spam Block Rate',
      performance: 'Performance Impact',
      gdpr: 'GDPR Compliant',
      hosted: 'Hosted in Germany',
      spamBlocked: 'Spam Emails Blocked',
      customers: 'Happy Customers',
      protection: 'Protection',
    },
    // Features
    features: {
      title: 'Powerful Features',
      subtitle: 'Everything you need to protect your WordPress site from spam',
    },
    // Pricing
    pricing: {
      title: 'Simple, Fair Pricing',
      subtitle: 'Choose the package that suits you. All packages with 14-day money-back guarantee.',
      single: 'Single',
      singleDesc: 'Yearly · 1 Website',
      freelancer: 'Freelancer',
      freelancerDesc: 'Yearly · 5 Websites',
      agency: 'Agency',
      agencyDesc: 'Yearly · 25 Websites',
      plusTax: 'plus VAT',
      buyNow: 'Buy Now',
      popular: 'Popular',
      features: 'All Features',
    },
    // Buy Modal
    modal: {
      license: 'License',
      net: 'Net',
      plus: 'plus',
      perYear: '/ Year',
      reverseCharge: 'Reverse Charge (Tax Exempt)',
      netNotice: 'Net amount - No VAT with valid VAT ID',
      taxFree: 'Tax-free in',
      email: 'Email Address',
      emailPlaceholder: 'your@email.com',
      companyPurchase: 'I am buying as a company',
      companyName: 'Company Name',
      companyPlaceholder: 'My Company Ltd',
      country: 'Country',
      vatId: 'VAT ID',
      vatIdValid: 'Valid VAT ID - Reverse Charge',
      street: 'Street & House Number',
      streetPlaceholder: 'Main Street 123',
      zipCode: 'ZIP Code',
      zipCodePlaceholder: '12345',
      city: 'City',
      cityPlaceholder: 'Munich',
      securePayment: '💳 Secure payment via Mollie · 14-day money-back guarantee · Annual automatic renewal',
      cancel: 'Cancel',
      toPay: 'To Payment',
      loading: 'Loading...',
    },
    // Footer
    footer: {
      copyright: '© 2024-2025 GermanFence. All rights reserved.',
      madeWith: 'Made with',
      inGermany: 'in Germany',
      by: 'by',
      priceNotice: '💶 All prices plus VAT',
    },
  },
}

export function useTranslation(lang: Language = 'de') {
  return translations[lang]
}

