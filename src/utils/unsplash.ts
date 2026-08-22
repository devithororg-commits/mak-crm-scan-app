export interface UnsplashPhoto {
  id: string
  url: string
  thumb: string
  alt: string
  photographer: string
  downloadUrl: string
}

const CURATED: Record<string, string[]> = {
  home: [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=90',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=90',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&q=90',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=90',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=90',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1600&q=90',
  ],
  luxury: [
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=90',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=90',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1600&q=90',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1600&q=90',
  ],
  office: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=90',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1600&q=90',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=90',
  ],
  nature: [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=90',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=90',
    'https://images.unsplash.com/photo-1441974231530-c316f5e71d5d?w=1600&q=90',
  ],
  apartment: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1600&q=90',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2cd9361?w=1600&q=90',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600&q=90',
  ],
  villa: [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&q=90',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&q=90',
  ],
}

function getCuratedStockPhotos(query: string, limit: number): UnsplashPhoto[] {
  const q = query.toLowerCase()
  const key =
    Object.keys(CURATED).find((k) => q.includes(k)) ??
    (q.includes('villa') ? 'villa' : q.includes('apartment') || q.includes('flat') ? 'apartment' : 'home')
  const urls = CURATED[key] ?? CURATED.home
  return urls.slice(0, limit).map((url, i) => ({
    id: `curated-${key}-${i}`,
    url,
    thumb: url.replace('w=1600', 'w=400'),
    alt: query,
    photographer: 'Unsplash',
    downloadUrl: url,
  }))
}

export async function searchUnsplash(query: string, perPage = 12): Promise<UnsplashPhoto[]> {
  const q = query.trim()
  if (!q) return getCuratedStockPhotos('home', perPage)
  return getCuratedStockPhotos(q, perPage)
}

import type { IconName } from '../components/icons/iconNames'

export function getStockCategories(): { id: string; label: string; icon: IconName }[] {
  return [
    { id: 'home', label: 'Modern Home', icon: 'home' },
    { id: 'luxury', label: 'Luxury Villa', icon: 'castle' },
    { id: 'apartment', label: 'Apartment', icon: 'apartment' },
    { id: 'office', label: 'Office / Corporate', icon: 'briefcase' },
    { id: 'nature', label: 'Nature / Landscape', icon: 'mountain' },
  ]
}

export function getSampleGalleryUrls(): string[] {
  return CURATED.home.slice(0, 4)
}
