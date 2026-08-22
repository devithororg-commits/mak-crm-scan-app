import type { TemplateId } from '../types/creative'

export interface QuickEditField {
  key: string
  label: string
  placeholder?: string
  multiline?: boolean
  type?: 'number'
  highlight?: boolean
}

export interface QuickEditZone {
  id: string
  title: string
  subtitle: string
  defaultOpen?: boolean
  fields: QuickEditField[]
}

const hl = true

const HEADLINE: QuickEditField[] = [
  { key: 'eyebrow', label: 'Label / Category', placeholder: 'MAK Projects', highlight: hl },
  { key: 'title', label: 'Headline', placeholder: 'Your main headline', highlight: hl },
  { key: 'subtitle', label: 'Subheadline', placeholder: 'Supporting line', highlight: hl },
  { key: 'badge', label: 'Badge / Tag', placeholder: 'Q4 2025' },
]

const BODY: QuickEditField[] = [
  { key: 'description', label: 'Description', placeholder: 'Main body text...', multiline: true, highlight: hl },
]

const PROPERTY: QuickEditField[] = [
  { key: 'propertyTitle', label: 'Property Name', placeholder: 'Luxury 3BHK Apartment', highlight: hl },
  { key: 'propertyPrice', label: 'Price', placeholder: '₹1.25 Cr', highlight: hl },
  { key: 'propertyAddress', label: 'Address', placeholder: 'Gachibowli, Hyderabad' },
  { key: 'propertyBeds', label: 'Bedrooms', placeholder: '3' },
  { key: 'propertyBaths', label: 'Bathrooms', placeholder: '3' },
  { key: 'propertySqft', label: 'Area (sqft)', placeholder: '1,850' },
  { key: 'propertyType', label: 'Property Type', placeholder: 'Apartment' },
  { key: 'reraNumber', label: 'RERA Number', placeholder: 'P02400001288' },
]

const PERSON: QuickEditField[] = [
  { key: 'personName', label: 'Name', placeholder: 'Rahul Sharma', highlight: hl },
  { key: 'personRole', label: 'Role / Title', placeholder: 'Senior Consultant' },
  { key: 'companyName', label: 'Company', placeholder: 'MAK Projects' },
]

const METRICS: QuickEditField[] = [
  { key: 'metric1Label', label: 'Metric 1 Label', placeholder: 'Revenue' },
  { key: 'metric1Value', label: 'Metric 1 Value', placeholder: '₹48 Cr', highlight: hl },
  { key: 'metric2Label', label: 'Metric 2 Label', placeholder: 'Growth' },
  { key: 'metric2Value', label: 'Metric 2 Value', placeholder: '+34%', highlight: hl },
  { key: 'metric3Label', label: 'Metric 3 Label', placeholder: 'Units' },
  { key: 'metric3Value', label: 'Metric 3 Value', placeholder: '1,240' },
]

const CONTACT: QuickEditField[] = [
  { key: 'ctaText', label: 'Button Text', placeholder: 'Learn More', highlight: hl },
  { key: 'phone', label: 'Phone', placeholder: '+91 99999 99999' },
  { key: 'website', label: 'Website', placeholder: 'www.example.com' },
  { key: 'socialHandle', label: 'Social Handle', placeholder: '@company' },
]

const TEMPLATE_SPECIFIC: Partial<Record<TemplateId, QuickEditZone[]>> = {
  'price-drop': [{
    id: 'pricing', title: 'Price Details', subtitle: 'Old vs new price', defaultOpen: true,
    fields: [
      { key: 'propertyTitle', label: 'Property Name', highlight: hl },
      { key: 'previousValue', label: 'Old Price', placeholder: '₹1.50 Cr', highlight: hl },
      { key: 'propertyPrice', label: 'New Price', placeholder: '₹1.25 Cr', highlight: hl },
      { key: 'changePercent', label: 'Savings Badge', placeholder: '₹25 Lakh OFF' },
      { key: 'comparisonLabel', label: 'Offer Text', placeholder: 'Limited time offer' },
      { key: 'propertyAddress', label: 'Address' },
    ],
  }],
  'emi-calculator': [{
    id: 'loan', title: 'Loan Details', subtitle: 'EMI breakdown', defaultOpen: true,
    fields: [
      { key: 'propertyTitle', label: 'Property / Loan Title', highlight: hl },
      { key: 'propertyPrice', label: 'Loan Amount', placeholder: '₹75 Lakh' },
      { key: 'metric1Value', label: 'Monthly EMI', placeholder: '₹45,200', highlight: hl },
      { key: 'metric2Value', label: 'Tenure', placeholder: '20 Years' },
      { key: 'metric3Value', label: 'Interest Rate', placeholder: '8.5%' },
    ],
  }],
  'agent-spotlight': [{
    id: 'agent', title: 'Agent Profile', subtitle: 'Photo + stats', defaultOpen: true,
    fields: [
      { key: 'personName', label: 'Agent Name', highlight: hl },
      { key: 'personRole', label: 'Designation' },
      { key: 'description', label: 'Bio', multiline: true, highlight: hl },
      { key: 'metric1Value', label: 'Deals Closed', placeholder: '120+' },
      { key: 'metric2Value', label: 'Experience', placeholder: '12 Yrs' },
      { key: 'metric3Value', label: 'Rating', placeholder: '4.9★' },
    ],
  }],
  'festival-wishes': [{
    id: 'wish', title: 'Festival Message', subtitle: 'Greeting text', defaultOpen: true,
    fields: [
      { key: 'badge', label: 'Festival Name', placeholder: 'Diwali 2025', highlight: hl },
      { key: 'title', label: 'Wish Message', multiline: true, highlight: hl },
      { key: 'description', label: 'Secondary Message', multiline: true },
      { key: 'eyebrow', label: 'Company Name' },
    ],
  }],
  'site-visit': [{
    id: 'visit', title: 'Visit Details', subtitle: 'Date, time & location', defaultOpen: true,
    fields: [
      { key: 'title', label: 'Invite Title', placeholder: "You're Invited!", highlight: hl },
      { key: 'publishedDate', label: 'Visit Date', placeholder: 'Saturday, 28 Dec 2025' },
      { key: 'status', label: 'Visit Time', placeholder: '10 AM – 6 PM' },
      { key: 'propertyAddress', label: 'Location' },
      { key: 'propertyTitle', label: 'Property Name' },
      { key: 'description', label: 'Notes', multiline: true },
    ],
  }],
  'before-after': [{
    id: 'transform', title: 'Transformation', subtitle: 'Before & after labels', defaultOpen: true,
    fields: [
      { key: 'propertyTitle', label: 'Project Title', highlight: hl },
      { key: 'comparisonLabel', label: 'Before Label', placeholder: 'Before' },
      { key: 'subtitle', label: 'After Label', placeholder: 'After' },
      { key: 'description', label: 'Description', multiline: true },
    ],
  }],
  'neighbourhood-guide': [{
    id: 'area', title: 'Area Highlights', subtitle: 'Schools, metro & more', defaultOpen: true,
    fields: [
      { key: 'title', label: 'Area Name', placeholder: 'Gachibowli', highlight: hl },
      { key: 'subtitle', label: 'Subtitle' },
      { key: 'metric1Value', label: 'Schools', placeholder: '5 within 2km' },
      { key: 'metric2Value', label: 'Hospitals', placeholder: '3 nearby' },
      { key: 'metric3Value', label: 'Metro', placeholder: '800m away' },
      { key: 'metric4Value', label: 'Malls', placeholder: '2 nearby' },
      { key: 'description', label: 'Description', multiline: true },
    ],
  }],
  'investment-roi': [{
    id: 'roi', title: 'Investment Returns', subtitle: 'Yield & appreciation', defaultOpen: true,
    fields: [
      { key: 'propertyTitle', label: 'Investment Title', highlight: hl },
      { key: 'propertyPrice', label: 'Property Price', placeholder: '₹1.25 Cr' },
      { key: 'metric1Value', label: 'Rental Yield', placeholder: '4.2%', highlight: hl },
      { key: 'metric2Value', label: 'Appreciation', placeholder: '+22% YoY' },
      { key: 'metric3Value', label: '5Y ROI', placeholder: '68%' },
      { key: 'changePercent', label: 'Returns Badge', placeholder: '+68% in 5Y' },
    ],
  }],
  'project-launch': [{
    id: 'launch', title: 'Launch Details', subtitle: 'Countdown & progress', defaultOpen: true,
    fields: [
      { key: 'propertyTitle', label: 'Project Name', highlight: hl },
      { key: 'badge', label: 'Days to Launch', placeholder: '7' },
      { key: 'publishedDate', label: 'Launch Date', placeholder: 'Jan 15, 2026' },
      { key: 'propertyPrice', label: 'Starting Price', placeholder: '₹65 Lakh*' },
      { key: 'progressPercent', label: 'Construction %', type: 'number', placeholder: '75' },
    ],
  }],
  'quote-card': [{
    id: 'quote', title: 'Quote', subtitle: 'Message & author', defaultOpen: true,
    fields: [
      { key: 'title', label: 'Quote Text', multiline: true, highlight: hl },
      { key: 'personName', label: 'Author Name' },
      { key: 'personRole', label: 'Author Title' },
      { key: 'eyebrow', label: 'Category Label' },
      { key: 'badge', label: 'Hashtag', placeholder: '#RealEstate' },
    ],
  }],
  'testimonial': [{
    id: 'review', title: 'Client Review', subtitle: 'Rating & quote', defaultOpen: true,
    fields: [
      { key: 'reviewText', label: 'Review Text', multiline: true, highlight: hl },
      { key: 'reviewerName', label: 'Reviewer Name' },
      { key: 'reviewerRole', label: 'Reviewer Role' },
      { key: 'reviewRating', label: 'Star Rating', placeholder: '5.0' },
    ],
  }],
  'rera-trust': [{
    id: 'rera', title: 'RERA & Trust', subtitle: 'Certification details', defaultOpen: true,
    fields: [
      { key: 'title', label: 'Headline', placeholder: 'RERA Approved Project', highlight: hl },
      { key: 'reraNumber', label: 'RERA Number', placeholder: 'P02400001288', highlight: hl },
      { key: 'companyName', label: 'Developer Name' },
      { key: 'description', label: 'Trust Message', multiline: true },
      { key: 'badge', label: 'Certification Badge', placeholder: 'RERA Verified' },
    ],
  }],
  'rental-yield': [{
    id: 'rental', title: 'Rental Income', subtitle: 'Yield & returns', defaultOpen: true,
    fields: [
      { key: 'propertyTitle', label: 'Property Name', highlight: hl },
      { key: 'propertyPrice', label: 'Property Value', placeholder: '₹1.25 Cr' },
      { key: 'metric1Value', label: 'Monthly Rent', placeholder: '₹45,000', highlight: hl },
      { key: 'metric2Value', label: 'Annual Yield', placeholder: '4.3%' },
      { key: 'metric3Value', label: 'Occupancy', placeholder: '98%' },
      { key: 'propertyAddress', label: 'Location' },
    ],
  }],
  'property-compare': [{
    id: 'compare', title: 'Property A', subtitle: 'First option', defaultOpen: true,
    fields: [
      { key: 'propertyTitle', label: 'Property A Name', highlight: hl },
      { key: 'propertyPrice', label: 'Price A', placeholder: '₹85 Lakh' },
      { key: 'propertySqft', label: 'Area A', placeholder: '1,200 sqft' },
    ],
  }, {
    id: 'compare-b', title: 'Property B', subtitle: 'Second option', defaultOpen: true,
    fields: [
      { key: 'subtitle', label: 'Property B Name', highlight: hl },
      { key: 'previousValue', label: 'Price B', placeholder: '₹1.10 Cr' },
      { key: 'metric1Value', label: 'Area B', placeholder: '1,650 sqft' },
      { key: 'comparisonLabel', label: 'Verdict / Winner', placeholder: 'Better Value: Option A' },
    ],
  }],
  'home-tips': [{
    id: 'tips', title: 'Tips Card', subtitle: 'Headline & intro', defaultOpen: true,
    fields: [
      { key: 'title', label: 'Title', placeholder: '5 Tips Before You Buy', highlight: hl },
      { key: 'subtitle', label: 'Subtitle', placeholder: 'Essential checklist for home buyers' },
      { key: 'description', label: 'Intro Text', multiline: true },
    ],
  }],
  'team-showcase': [{
    id: 'team', title: 'Team Info', subtitle: 'Office & team headline', defaultOpen: true,
    fields: [
      { key: 'title', label: 'Team Headline', placeholder: 'Meet Our Expert Team', highlight: hl },
      { key: 'companyName', label: 'Company Name' },
      { key: 'description', label: 'About Team', multiline: true },
      { key: 'metric1Value', label: 'Team Size', placeholder: '50+' },
      { key: 'metric2Value', label: 'Years Experience', placeholder: '15+' },
      { key: 'metric3Value', label: 'Projects Done', placeholder: '200+' },
      { key: 'location', label: 'Office Location' },
    ],
  }],
}

const REAL_ESTATE_TEMPLATES: TemplateId[] = [
  'just-listed', 'just-sold', 'open-house', 'buyer-match', 'market-update',
  'photo-gallery', 'luxury-frame',
]

const PERSON_TEMPLATES: TemplateId[] = ['profile-card', 'profile-glass', 'agent-spotlight']

export function getQuickEditZones(templateId: TemplateId): QuickEditZone[] {
  if (TEMPLATE_SPECIFIC[templateId]) return TEMPLATE_SPECIFIC[templateId]!

  if (REAL_ESTATE_TEMPLATES.includes(templateId)) {
    return [
      { id: 'headline', title: 'Headline', subtitle: 'Title & badge', defaultOpen: true, fields: HEADLINE },
      { id: 'property', title: 'Property', subtitle: 'Listing details', defaultOpen: true, fields: PROPERTY },
      { id: 'body', title: 'Description', subtitle: 'Extra details', fields: BODY },
      { id: 'contact', title: 'Call to Action', subtitle: 'Button & contact', fields: CONTACT },
    ]
  }

  if (PERSON_TEMPLATES.includes(templateId)) {
    return [
      { id: 'person', title: 'Profile', subtitle: 'Name & role', defaultOpen: true, fields: PERSON },
      { id: 'headline', title: 'Headline', subtitle: 'Title & tagline', defaultOpen: true, fields: HEADLINE },
      { id: 'body', title: 'Bio', subtitle: 'About text', fields: BODY },
      { id: 'contact', title: 'Contact', subtitle: 'CTA & links', fields: CONTACT },
    ]
  }

  return [
    { id: 'headline', title: 'Headline', subtitle: 'Title & labels', defaultOpen: true, fields: HEADLINE },
    { id: 'body', title: 'Content', subtitle: 'Main message', defaultOpen: true, fields: BODY },
    { id: 'metrics', title: 'Numbers', subtitle: 'Key metrics', fields: METRICS },
    { id: 'contact', title: 'Call to Action', subtitle: 'Button & contact', fields: CONTACT },
  ]
}
