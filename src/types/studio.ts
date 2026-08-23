export interface CompanyDna {
  companyName: string
  industry: string
  website: string
  phone: string
  socialHandle: string
  email: string
  tone: 'professional' | 'casual' | 'sales' | 'local'
  languages: ('english' | 'telugu' | 'hinglish')[]
  accentColor: string
  secondaryColor: string
  disclaimer: string
  forbiddenPhrases: string[]
  defaultPlatform: 'instagram' | 'linkedin' | 'whatsapp' | 'facebook'
}

export interface StudioCaptionPack {
  instagram: { caption: string; hashtags: string }
  linkedin: { caption: string; hashtags: string }
  whatsapp: { caption: string; hashtags: string }
  facebook: { caption: string; hashtags: string }
  twitter: { caption: string; hashtags: string }
}

export interface SmartFillBrief {
  templateId: string
  title?: string
  subtitle?: string
  description?: string
  eyebrow?: string
  badge?: string
  ctaText?: string
  propertyTitle?: string
  propertyPrice?: string
  propertyAddress?: string
  propertyBeds?: string
  propertyBaths?: string
  propertySqft?: string
  highlights?: string[]
  accentColor?: string
  secondaryColor?: string
  imageKeywords?: string
  captions?: StudioCaptionPack
}

export interface SmartFillResponse {
  brief: SmartFillBrief
  researchSummary?: string
  sources?: string[]
  imageUrl?: string
  imageCredit?: string
}
