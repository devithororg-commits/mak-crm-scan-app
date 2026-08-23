import type { CompanyDna } from '../types/studio'

export const DEFAULT_COMPANY_DNA: CompanyDna = {
  companyName: '',
  industry: 'Real Estate',
  website: '',
  phone: '',
  socialHandle: '',
  email: '',
  tone: 'professional',
  languages: ['english'],
  accentColor: '#4F46E5',
  secondaryColor: '#818CF8',
  disclaimer: 'Prices subject to change. Verify RERA details before publishing.',
  forbiddenPhrases: ['guaranteed returns', '100% appreciation', 'AI generated'],
  defaultPlatform: 'instagram',
}

const STORAGE_KEY = 'company-dna-v1'

export function loadCompanyDna(): CompanyDna {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_COMPANY_DNA }
    return { ...DEFAULT_COMPANY_DNA, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_COMPANY_DNA }
  }
}

export function saveCompanyDna(dna: CompanyDna) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dna))
}

export function syncDnaToCreative(dna: CompanyDna) {
  return {
    companyName: dna.companyName,
    industry: dna.industry,
    website: dna.website,
    phone: dna.phone,
    socialHandle: dna.socialHandle,
    email: dna.email,
    accentColor: dna.accentColor,
    secondaryColor: dna.secondaryColor,
    platform: dna.defaultPlatform,
  }
}
