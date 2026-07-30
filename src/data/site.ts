/**
 * Single source of truth for the business details, so a phone number or a social handle
 * is never duplicated across components (or drifts between page and structured data).
 * Every value here is real, taken from the live ready2cars.com site.
 */
export const site = {
  name: 'Ready2Cars',
  legalName: 'Ready2Cars di Danilo Gentile',
  owner: 'Danilo Gentile',
  url: 'https://ready2cars.com',
  email: 'info@ready2cars.com',
  pec: 'pec@pec.danilogentile.it',
  vat: 'IT-01849820475',
  vatSchema: 'IT01849820475',
  rea: 'PT-196856',
  founded: '2012',
  phones: {
    mobile: { label: '+39 345 24 00 000', href: 'tel:+393452400000', schema: '+39-345-2400000' },
    office: { label: '+39 055 010 8687', href: 'tel:+390550108687', schema: '+39-055-0108687' },
  },
  whatsapp: 'https://wa.me/393452400000',
  socials: [
    { id: 'ig', name: 'Instagram', href: 'https://www.instagram.com/ready2cars/' },
    { id: 'fb', name: 'Facebook', href: 'https://www.facebook.com/Ready2cars' },
    { id: 'yt', name: 'YouTube', href: 'https://www.youtube.com/@ready2cars/' },
    { id: 'tt', name: 'TikTok', href: 'https://www.tiktok.com/@ready2cars/' },
  ],
  apps: {
    ios: 'https://apps.apple.com',
    android: 'https://play.google.com',
  },
  nav: [
    { label: 'Servizi', href: '/#servizi' },
    { label: 'Perché noi', href: '/#perche' },
    { label: 'Contatti', href: '/#contatti' },
  ],
} as const;

export type Site = typeof site;
