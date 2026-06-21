/**
 * Single-source-of-truth site identity for oriz-pdf-tools. Imported by the
 * shared scaffolding (account, contact, legal pages) so every site exposes
 * the same OrizSiteConfig shape.
 */
type OrizSiteConfig = {
  slug: string
  name: string
  origin: string
  tagline: string
  description: string
}

export const SITE_CONFIG: OrizSiteConfig = {
  slug: 'pdf',
  name: 'PDF Tools',
  origin: 'https://pdf.oriz.in',
  tagline: 'Merge, split, compress, sign — never uploaded.',
  description:
    '30+ browser-based PDF tools. Merge, split, compress, convert, sign, redact, OCR — all 100% client-side. Files never leave your device.',
}
