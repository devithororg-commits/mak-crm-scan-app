import type { CreativeData } from '../types/creative'
import { urlToDataUrl } from './imageEmbed'

export interface ExtractedListing {
  propertyTitle: string
  propertyPrice: string
  propertyAddress: string
  propertyType: string
  description: string
  imageUrl: string
  beds: string
  baths: string
  sqft: string
}

function normalizeUrl(input: string) {
  const trimmed = input.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('http')) return trimmed
  return `https://${trimmed}`
}

function extractNumber(text: string, patterns: RegExp[]) {
  for (const p of patterns) {
    const m = text.match(p)
    if (m?.[1]) return m[1]
  }
  return ''
}

function parseListingFromText(title: string, description: string): Partial<ExtractedListing> {
  const combined = `${title} ${description}`
  const beds = extractNumber(combined, [/(\d+)\s*(?:bed|bhk|br|bedroom)/i, /(\d+)\s*BHK/i])
  const baths = extractNumber(combined, [/(\d+)\s*(?:bath|ba|bathroom)/i])
  const sqft = extractNumber(combined, [/([\d,]+)\s*(?:sq\.?\s*ft|sqft|sft)/i])
  const price = extractNumber(combined, [
    /(?:₹|Rs\.?|INR)\s*([\d,.]+\s*(?:Cr|L|Lakh|Crore)?)/i,
    /\$\s*([\d,.]+(?:\s*(?:M|K|million))?)/i,
    /([\d,.]+)\s*(?:Cr|Crore|L|Lakh)/i,
  ])

  return { beds, baths, sqft, propertyPrice: price }
}

export async function extractListingFromUrl(input: string): Promise<ExtractedListing> {
  const url = normalizeUrl(input)
  if (!url) throw new Error('Enter a valid property listing URL')

  const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot=false`)
  if (!res.ok) throw new Error('Could not fetch listing. Check the URL and try again.')

  const json = await res.json()
  if (json.status === 'error') {
    throw new Error(json.message || 'Could not fetch listing. Check the URL and try again.')
  }
  const d = json.data
  if (!d) throw new Error('No data found at this URL')

  const title = d.title || ''
  const description = d.description || ''
  const parsed = parseListingFromText(title, description)

  return {
    propertyTitle: title.split('|')[0].split('-')[0].trim() || 'Property Listing',
    propertyPrice: parsed.propertyPrice || '',
    propertyAddress: description.split('.')[0].slice(0, 80) || '',
    propertyType: title.toLowerCase().includes('apartment') ? 'Apartment'
      : title.toLowerCase().includes('villa') ? 'Villa'
      : title.toLowerCase().includes('house') ? 'House'
      : 'Property',
    description: description.slice(0, 300),
    imageUrl: d.image?.url || '',
    beds: parsed.beds || '',
    baths: parsed.baths || '',
    sqft: parsed.sqft || '',
  }
}

export function listingToCreativeData(listing: ExtractedListing): Partial<CreativeData> {
  return {
    listingUrl: '',
    propertyTitle: listing.propertyTitle,
    propertyPrice: listing.propertyPrice,
    propertyAddress: listing.propertyAddress,
    propertyType: listing.propertyType,
    propertyBeds: listing.beds,
    propertyBaths: listing.baths,
    propertySqft: listing.sqft,
    title: listing.propertyTitle,
    subtitle: listing.propertyPrice ? `${listing.propertyPrice} · ${listing.propertyAddress}` : listing.propertyAddress,
    description: listing.description,
    imageUrl: listing.imageUrl,
    showCreativeImage: !!listing.imageUrl,
    imagePosition: 'cover',
    templateId: 'just-listed',
    listingStatus: 'just-listed',
    tags: `RealEstate, ${listing.propertyType}, ${listing.propertyAddress.split(',')[0] || 'Property'}`,
    ctaText: 'Schedule Visit',
    highlights: [
      listing.beds ? `${listing.beds} Bedrooms` : 'Spacious layout',
      listing.baths ? `${listing.baths} Bathrooms` : 'Modern fittings',
      listing.sqft ? `${listing.sqft} sqft` : 'Prime location',
    ].filter(Boolean),
  }
}

/** Embed listing image as data URL so export works */
export async function embedListingImages(patch: Partial<CreativeData>): Promise<Partial<CreativeData>> {
  const next = { ...patch }
  if (next.imageUrl && !next.imageUrl.startsWith('data:')) {
    try {
      next.imageUrl = await urlToDataUrl(next.imageUrl)
    } catch {
      // keep remote URL for preview; export may still fail without upload
    }
  }
  return next
}
