import type { CreativeData } from '../types/creative'

export interface ListingRow {
  propertyTitle: string
  propertyPrice: string
  propertyBeds: string
  propertyBaths: string
  propertySqft: string
  propertyAddress: string
  propertyType: string
  reraNumber: string
}

const HEADER_MAP: Record<string, keyof ListingRow> = {
  title: 'propertyTitle',
  propertytitle: 'propertyTitle',
  property_title: 'propertyTitle',
  name: 'propertyTitle',
  price: 'propertyPrice',
  propertyprice: 'propertyPrice',
  property_price: 'propertyPrice',
  beds: 'propertyBeds',
  propertybeds: 'propertyBeds',
  bedrooms: 'propertyBeds',
  baths: 'propertyBaths',
  propertybaths: 'propertyBaths',
  bathrooms: 'propertyBaths',
  sqft: 'propertySqft',
  propertysqft: 'propertySqft',
  area: 'propertySqft',
  address: 'propertyAddress',
  propertyaddress: 'propertyAddress',
  location: 'propertyAddress',
  type: 'propertyType',
  propertytype: 'propertyType',
  rera: 'reraNumber',
  reranumber: 'reraNumber',
  rera_number: 'reraNumber',
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, '').replace(/-/g, '_')
}

function parseCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
      continue
    }
    if (ch === ',' && !inQuotes) {
      out.push(cur.trim())
      cur = ''
      continue
    }
    cur += ch
  }
  out.push(cur.trim())
  return out
}

export function parseListingCsv(text: string): ListingRow[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (lines.length < 2) throw new Error('CSV needs a header row and at least one listing')

  const headers = parseCsvLine(lines[0]).map(normalizeHeader)
  const rows: ListingRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i])
    if (cells.every((c) => !c)) continue

    const row: ListingRow = {
      propertyTitle: '',
      propertyPrice: '',
      propertyBeds: '',
      propertyBaths: '',
      propertySqft: '',
      propertyAddress: '',
      propertyType: 'Apartment',
      reraNumber: '',
    }

    headers.forEach((header, idx) => {
      const key = HEADER_MAP[header.replace(/_/g, '')] ?? HEADER_MAP[header]
      if (key && cells[idx]) row[key] = cells[idx]
    })

    if (!row.propertyTitle && !row.propertyPrice) continue
    rows.push(row)
  }

  if (rows.length === 0) throw new Error('No valid listings found — check column headers')
  return rows
}

export function listingRowToCreativePatch(row: ListingRow): Partial<CreativeData> {
  return {
    propertyTitle: row.propertyTitle,
    propertyPrice: row.propertyPrice,
    propertyBeds: row.propertyBeds || '3',
    propertyBaths: row.propertyBaths || '2',
    propertySqft: row.propertySqft || '—',
    propertyAddress: row.propertyAddress || 'Your City',
    propertyType: row.propertyType || 'Apartment',
    reraNumber: row.reraNumber,
    title: row.propertyTitle,
    subtitle: `${row.propertyBeds || '—'} BHK · ${row.propertySqft || '—'} sqft · ${row.propertyAddress || ''}`,
  }
}
