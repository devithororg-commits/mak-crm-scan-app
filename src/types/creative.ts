export type ContentCategory =
  | 'company'
  | 'person'
  | 'location'
  | 'marketing'
  | 'growth'
  | 'news'

export type TemplateId =
  | 'feature-card'
  | 'analytics'
  | 'progress'
  | 'stats-dashboard'
  | 'report-story'
  | 'job-card'
  | 'kanban-task'
  | 'profile-card'
  | 'pastel-job'
  | 'community-post'
  | 'just-listed'
  | 'just-sold'
  | 'open-house'
  | 'profile-glass'
  | 'buyer-match'
  | 'luxury-frame'
  | 'testimonial'
  | 'market-update'
  | 'photo-gallery'
  | 'price-drop'
  | 'emi-calculator'
  | 'agent-spotlight'
  | 'festival-wishes'
  | 'site-visit'
  | 'before-after'
  | 'neighbourhood-guide'
  | 'investment-roi'
  | 'project-launch'
  | 'quote-card'

export type CaptionTone = 'professional' | 'casual' | 'sales' | 'educational'
export type EditorTab = 'content' | 'analytics' | 'brand' | 'carousel' | 'export'

export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'none'
export type AspectRatio = '1:1' | '4:5' | '9:16' | '16:9'
export type FooterStyle = 'minimal' | 'branded' | 'full'
export type FontFamily = 'Poppins' | 'Inter' | 'DM Sans' | 'Playfair Display'
export type Platform = 'instagram' | 'linkedin' | 'twitter' | 'whatsapp' | 'facebook' | 'custom'
export type ImagePosition = 'top' | 'bottom' | 'left' | 'right' | 'background' | 'cover'
export type ImageFit = 'cover' | 'contain'
export type ImageAlign = 'left' | 'center' | 'right' | 'stretch'
export type ImageHeaderOrder = 'image-first' | 'logo-first'
export type ImageSizePreset = 'small' | 'medium' | 'large' | 'full' | 'custom'
export type ImageObjectPosition = 'center' | 'top' | 'bottom' | 'left' | 'right'
export type ImageFilter = 'none' | 'luxury' | 'modern' | 'natural' | 'dramatic' | 'vintage' | 'bw'
export type UploadQuality = 'standard' | 'high' | 'ultra'
export type LogoFit = 'contain' | 'cover'
export type FooterAlign = 'left' | 'center' | 'right' | 'split'

export interface ChartDataPoint {
  label: string
  value: number
}

export interface CarouselSlide {
  id: string
  title: string
  subtitle: string
  body: string
  badge: string
}

export interface GeneratedCaption {
  caption: string
  hashtags: string
  hook: string
  charCount: number
  engagementScore: number
}

export interface CaptionVariant {
  id: string
  hook: string
  caption: string
  hashtags: string
  engagementScore: number
}

export interface LibraryItem {
  id: string
  name: string
  templateId: TemplateId
  aspectRatio: AspectRatio
  thumbnail?: string
  savedAt: string
  data: CreativeData
}

export interface ListingData {
  propertyTitle: string
  propertyPrice: string
  propertyBeds: string
  propertyBaths: string
  propertySqft: string
  propertyAddress: string
  propertyType: string
  reraNumber: string
  listingStatus: 'just-listed' | 'just-sold' | 'open-house' | 'price-drop'
}

export interface CreativeData {
  category: ContentCategory
  templateId: TemplateId
  chartType: ChartType
  aspectRatio: AspectRatio
  platform: Platform

  title: string
  subtitle: string
  description: string
  eyebrow: string
  badge: string
  highlights: string[]
  ctaText: string
  authorName: string
  publishedDate: string
  status: string

  companyName: string
  personName: string
  personRole: string
  location: string
  country: string
  state: string
  newsSource: string
  industry: string
  website: string
  email: string
  phone: string
  founded: string
  employeeCount: string
  socialHandle: string

  metric1Label: string
  metric1Value: string
  metric2Label: string
  metric2Value: string
  metric3Label: string
  metric3Value: string
  metric4Label: string
  metric4Value: string
  metric5Label: string
  metric5Value: string
  changePercent: string
  previousValue: string
  comparisonLabel: string

  chartData: ChartDataPoint[]
  progressPercent: number
  targetValue: string
  currentValue: string

  accentColor: string
  secondaryColor: string
  fontFamily: FontFamily
  imageUrl: string
  logoUrl: string
  tags: string

  headerShowLogo: boolean
  headerLogoSize: number
  headerLogoRadius: number
  headerLogoFit: LogoFit
  headerLogoContainerSize: number

  heroShowLogo: boolean
  heroLogoSize: number
  heroLogoRadius: number
  heroLogoFit: LogoFit

  avatarShowLogo: boolean
  avatarLogoSize: number
  avatarLogoRadius: number
  avatarLogoFit: LogoFit
  avatarLogoBorder: number

  badgeShowLogo: boolean
  badgeLogoSize: number
  badgeLogoRadius: number
  badgeLogoFit: LogoFit

  titleFontSize: number
  subtitleFontSize: number
  bodyFontSize: number
  metricFontSize: number
  labelFontSize: number
  textScale: number

  showCreativeImage: boolean
  imagePosition: ImagePosition
  imageFit: ImageFit
  imageAlign: ImageAlign
  imageHeaderOrder: ImageHeaderOrder
  imageHeight: number
  imageWidth: number
  imageCoverHeight: number
  imageOpacity: number
  imageBorderRadius: number
  imageObjectPosition: ImageObjectPosition
  imageSizePreset: ImageSizePreset
  imageMargin: number
  imageBorder: boolean
  imageShadow: boolean

  imageFilter: ImageFilter
  imageBrightness: number
  imageContrast: number
  imageSaturation: number
  imageSharpness: number
  imageAutoEnhance: boolean
  imageGradientOverlay: boolean
  imageGradientStrength: number
  imageGallery: string[]
  uploadQuality: UploadQuality

  footerLine1: string
  footerLine2: string
  footerLine3: string
  footerLine4: string
  footerWebsite: string
  footerPhone: string
  footerEmail: string
  footerStyle: FooterStyle
  footerAlign: FooterAlign
  footerFontSize: number
  footerLogoSize: number
  footerLogoRadius: number
  footerLogoFit: LogoFit
  footerBgOpacity: number
  footerTextColor: string
  footerPadding: number
  footerShowLogo: boolean
  footerShowPhone: boolean
  footerShowEmail: boolean
  footerShowWebsite: boolean
  footerShowLocation: boolean
  footerBorderTop: boolean
  showFooter: boolean
  showWatermark: boolean
  watermarkText: string

  exportQuality: 2 | 3 | 4 | 5 | 6

  carouselEnabled: boolean
  carouselSlides: CarouselSlide[]
  activeCarouselSlide: number

  propertyTitle: string
  propertyPrice: string
  propertyBeds: string
  propertyBaths: string
  propertySqft: string
  propertyAddress: string
  propertyType: string
  reraNumber: string
  listingStatus: ListingData['listingStatus']

  reviewRating: string
  reviewText: string
  reviewerName: string
  reviewerRole: string

  showQrCode: boolean
  qrCodeUrl: string
  themeId: string
  listingUrl: string
}

export const defaultCreativeData = (): CreativeData => ({
  category: 'company',
  templateId: 'analytics',
  chartType: 'line',
  aspectRatio: '1:1',
  platform: 'instagram',

  title: 'Q4 Growth Report',
  subtitle: 'Revenue up 34% year over year',
  description:
    'Our company achieved record-breaking performance this quarter with strong expansion across residential and commercial segments in key markets.',
  eyebrow: 'MAK Projects',
  badge: 'Q4 2025',
  highlights: [
    'Record quarterly revenue of ₹48 Cr',
    '1,240 units sold across 3 projects',
    '34% YoY growth in Hyderabad market',
    '98% customer satisfaction score',
  ],
  ctaText: 'Learn More',
  authorName: 'Strategy Team',
  publishedDate: 'Dec 2025',
  status: 'Published',

  companyName: 'MAK Projects Pvt Ltd',
  personName: 'Rahul Sharma',
  personRole: 'CEO & Founder',
  location: 'Hyderabad',
  country: 'India',
  state: 'Telangana',
  newsSource: 'Business Today',
  industry: 'Real Estate',
  website: 'www.makprojects.com',
  email: 'info@makprojects.com',
  phone: '+91 99127 97979',
  founded: '2010',
  employeeCount: '250+',
  socialHandle: '@makprojects',

  metric1Label: 'Revenue',
  metric1Value: '₹48 Cr',
  metric2Label: 'Growth',
  metric2Value: '+34%',
  metric3Label: 'Units Sold',
  metric3Value: '1,240',
  metric4Label: 'Projects',
  metric4Value: '12',
  metric5Label: 'Satisfaction',
  metric5Value: '98%',
  changePercent: '+34%',
  previousValue: '₹35.8 Cr',
  comparisonLabel: 'vs last year',

  chartData: [
    { label: 'Jan', value: 420 },
    { label: 'Feb', value: 380 },
    { label: 'Mar', value: 510 },
    { label: 'Apr', value: 470 },
    { label: 'May', value: 620 },
    { label: 'Jun', value: 580 },
    { label: 'Jul', value: 710 },
  ],
  progressPercent: 73,
  targetValue: '₹50 Cr',
  currentValue: '₹36.5 Cr',

  accentColor: '#4F46E5',
  secondaryColor: '#818CF8',
  fontFamily: 'Poppins',
  imageUrl: '',
  logoUrl: '',
  tags: 'Real Estate, Growth, Hyderabad',

  headerShowLogo: true,
  headerLogoSize: 32,
  headerLogoRadius: 8,
  headerLogoFit: 'contain',
  headerLogoContainerSize: 56,

  heroShowLogo: true,
  heroLogoSize: 64,
  heroLogoRadius: 16,
  heroLogoFit: 'contain',

  avatarShowLogo: true,
  avatarLogoSize: 80,
  avatarLogoRadius: 999,
  avatarLogoFit: 'cover',
  avatarLogoBorder: 4,

  badgeShowLogo: true,
  badgeLogoSize: 40,
  badgeLogoRadius: 999,
  badgeLogoFit: 'cover',

  titleFontSize: 32,
  subtitleFontSize: 16,
  bodyFontSize: 14,
  metricFontSize: 20,
  labelFontSize: 11,
  textScale: 100,

  showCreativeImage: false,
  imagePosition: 'top',
  imageFit: 'cover',
  imageAlign: 'stretch',
  imageHeaderOrder: 'image-first',
  imageHeight: 200,
  imageWidth: 100,
  imageCoverHeight: 144,
  imageOpacity: 30,
  imageBorderRadius: 16,
  imageObjectPosition: 'center',
  imageSizePreset: 'medium',
  imageMargin: 0,
  imageBorder: false,
  imageShadow: true,

  imageFilter: 'none',
  imageBrightness: 100,
  imageContrast: 100,
  imageSaturation: 100,
  imageSharpness: 0,
  imageAutoEnhance: true,
  imageGradientOverlay: false,
  imageGradientStrength: 50,
  imageGallery: [],
  uploadQuality: 'high',

  footerLine1: 'MAK Projects Pvt Ltd',
  footerLine2: 'www.makprojects.com',
  footerLine3: 'Hyderabad · Telangana · India',
  footerLine4: '',
  footerWebsite: 'www.makprojects.com',
  footerPhone: '+91 99127 97979',
  footerEmail: 'info@makprojects.com',
  footerStyle: 'branded',
  footerAlign: 'split',
  footerFontSize: 11,
  footerLogoSize: 32,
  footerLogoRadius: 8,
  footerLogoFit: 'contain',
  footerBgOpacity: 5,
  footerTextColor: '',
  footerPadding: 20,
  footerShowLogo: true,
  footerShowPhone: true,
  footerShowEmail: true,
  footerShowWebsite: true,
  footerShowLocation: true,
  footerBorderTop: true,
  showFooter: true,
  showWatermark: false,
  watermarkText: 'MAK Projects',

  exportQuality: 3,

  carouselEnabled: false,
  carouselSlides: [
    { id: '1', title: 'Hook Slide', subtitle: 'Grab attention', body: 'Your opening statement goes here', badge: '01' },
    { id: '2', title: 'Data Slide', subtitle: 'Key metrics', body: 'Share your most important numbers', badge: '02' },
    { id: '3', title: 'Proof Slide', subtitle: 'Social proof', body: 'Testimonials, results, highlights', badge: '03' },
    { id: '4', title: 'CTA Slide', subtitle: 'Take action', body: 'Contact us today to learn more', badge: '04' },
  ],
  activeCarouselSlide: 0,

  propertyTitle: 'Luxury 3BHK Apartment',
  propertyPrice: '₹1.25 Cr',
  propertyBeds: '3',
  propertyBaths: '3',
  propertySqft: '1,850',
  propertyAddress: 'Gachibowli, Hyderabad',
  propertyType: 'Apartment',
  reraNumber: 'P02400001288',
  listingStatus: 'just-listed',

  reviewRating: '5.0',
  reviewText: 'Outstanding service! They helped us find our dream home in record time.',
  reviewerName: 'Priya Reddy',
  reviewerRole: 'Home Buyer',

  showQrCode: false,
  qrCodeUrl: '',
  themeId: 'indigo-pro',
  listingUrl: '',
})
