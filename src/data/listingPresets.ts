import type { CreativeData, ListingData } from '../types/creative'

export function applyListingPreset(status: ListingData['listingStatus'], data: CreativeData): Partial<CreativeData> {
  const base = {
    propertyTitle: data.propertyTitle,
    propertyPrice: data.propertyPrice,
    propertyBeds: data.propertyBeds,
    propertyBaths: data.propertyBaths,
    propertySqft: data.propertySqft,
    propertyAddress: data.propertyAddress,
    propertyType: data.propertyType,
    reraNumber: data.reraNumber,
    listingStatus: status,
    title: data.propertyTitle,
    subtitle: `${data.propertyBeds} BHK · ${data.propertySqft} sqft · ${data.propertyAddress}`,
    description: `${data.propertyType} available at ${data.propertyPrice}. ${data.propertyBeds} bedrooms, ${data.propertyBaths} bathrooms, ${data.propertySqft} sqft. Located at ${data.propertyAddress}.`,
    metric1Label: 'Price',
    metric1Value: data.propertyPrice,
    metric2Label: 'Bedrooms',
    metric2Value: data.propertyBeds,
    metric3Label: 'Area',
    metric3Value: `${data.propertySqft} sqft`,
    metric4Label: 'Type',
    metric4Value: data.propertyType,
    footerLine4: data.reraNumber ? `RERA: ${data.reraNumber}` : '',
    tags: `RealEstate, ${data.propertyAddress.split(',')[0]}, ${data.propertyType}`,
  }

  switch (status) {
    case 'just-listed':
      return {
        ...base,
        templateId: 'just-listed',
        badge: 'Just Listed',
        eyebrow: 'New Listing',
        ctaText: 'Schedule Visit',
      }
    case 'just-sold':
      return {
        ...base,
        templateId: 'just-sold',
        badge: 'Just Sold',
        eyebrow: 'Sold',
        ctaText: 'Contact Agent',
        subtitle: `SOLD · ${data.propertyAddress}`,
      }
    case 'open-house':
      return {
        ...base,
        templateId: 'open-house',
        badge: 'Open House',
        eyebrow: 'Visit Us',
        ctaText: 'RSVP Now',
        subtitle: `Open House · ${data.propertyAddress}`,
      }
    case 'price-drop':
      return {
        ...base,
        templateId: 'price-drop',
        badge: 'Price Drop',
        eyebrow: 'Reduced Price',
        ctaText: 'Grab This Deal',
        previousValue: data.previousValue || '₹1.50 Cr',
        changePercent: data.changePercent || '₹25 Lakh OFF',
        comparisonLabel: 'Limited time offer',
      }
    default:
      return base
  }
}
