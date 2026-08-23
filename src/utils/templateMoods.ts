import type { TemplateId } from '../types/creative'

export type TemplateMood = 'luxury' | 'trust' | 'urgent' | 'festival' | 'education' | 'social'

export const MOOD_FILTERS: { id: TemplateMood | 'all'; label: string; emoji: string }[] = [
  { id: 'all', label: 'All Moods', emoji: '✨' },
  { id: 'luxury', label: 'Luxury', emoji: '🏛️' },
  { id: 'trust', label: 'Trust', emoji: '🤝' },
  { id: 'urgent', label: 'Urgent', emoji: '⚡' },
  { id: 'festival', label: 'Festival', emoji: '🎉' },
  { id: 'education', label: 'Education', emoji: '📚' },
  { id: 'social', label: 'Social', emoji: '📱' },
]

export const TEMPLATE_MOOD_MAP: Record<TemplateId, TemplateMood[]> = {
  analytics: ['trust', 'education'],
  'feature-card': ['urgent', 'social'],
  progress: ['trust', 'education'],
  'stats-dashboard': ['trust', 'education'],
  'report-story': ['trust', 'education'],
  'profile-card': ['social', 'trust'],
  'job-card': ['urgent', 'trust'],
  'kanban-task': ['social', 'education'],
  'pastel-job': ['social'],
  'community-post': ['social', 'education'],
  'just-listed': ['urgent', 'trust'],
  'just-sold': ['trust', 'social'],
  'open-house': ['urgent', 'trust'],
  'profile-glass': ['luxury', 'social'],
  'buyer-match': ['trust', 'urgent'],
  'luxury-frame': ['luxury'],
  testimonial: ['trust', 'social'],
  'market-update': ['trust', 'education'],
  'photo-gallery': ['luxury', 'social'],
  'price-drop': ['urgent'],
  'emi-calculator': ['trust', 'education'],
  'agent-spotlight': ['trust', 'social'],
  'festival-wishes': ['festival'],
  'site-visit': ['urgent', 'trust'],
  'before-after': ['luxury', 'education'],
  'neighbourhood-guide': ['education', 'trust'],
  'investment-roi': ['trust', 'luxury'],
  'project-launch': ['urgent', 'luxury'],
  'quote-card': ['social', 'luxury'],
  'rera-trust': ['trust'],
  'rental-yield': ['trust', 'education'],
  'property-compare': ['education', 'trust'],
  'home-tips': ['education', 'social'],
  'team-showcase': ['trust', 'social'],
  'grid-cheatsheet': ['education', 'social'],
  'glass-card': ['luxury', 'social'],
  'gradient-radar': ['social', 'urgent'],
  'serif-authority': ['luxury', 'trust'],
  'growth-curve': ['trust', 'education'],
  'minimal-pill': ['social', 'luxury'],
  'carousel-tip': ['education', 'social'],
  'design-pills': ['social', 'luxury'],
  'hook-post': ['urgent', 'social'],
  'studio-statement': ['luxury', 'social'],
  'editorial-magazine': ['luxury', 'social'],
  'neon-cyber': ['urgent', 'social'],
  'blueprint-estate': ['trust', 'education'],
  'golden-estate': ['luxury', 'trust'],
  'split-diagonal': ['social', 'urgent'],
  'cinematic-frame': ['luxury', 'social'],
  'brutalist-type': ['urgent', 'social'],
  'aurora-mesh': ['social', 'education'],
}

export function templateMatchesMood(templateId: TemplateId, mood: TemplateMood | 'all'): boolean {
  if (mood === 'all') return true
  return TEMPLATE_MOOD_MAP[templateId]?.includes(mood) ?? false
}
