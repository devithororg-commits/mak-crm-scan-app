import type { CreativeData, FontFamily } from '../types/creative'

export interface ThemePreset {
  id: string
  name: string
  desc: string
  accentColor: string
  secondaryColor: string
  fontFamily: FontFamily
  preview: string
}

export const THEME_PRESETS: ThemePreset[] = [
  { id: 'indigo-pro', name: 'Indigo Pro', desc: 'Modern SaaS', accentColor: '#4F46E5', secondaryColor: '#818CF8', fontFamily: 'Poppins', preview: 'from-indigo-600 to-violet-500' },
  { id: 'luxury-gold', name: 'Luxury Gold', desc: 'Premium real estate', accentColor: '#B8860B', secondaryColor: '#D4AF37', fontFamily: 'Playfair Display', preview: 'from-amber-700 to-yellow-500' },
  { id: 'emerald', name: 'Emerald', desc: 'Growth & trust', accentColor: '#059669', secondaryColor: '#34D399', fontFamily: 'Inter', preview: 'from-emerald-600 to-teal-400' },
  { id: 'rose', name: 'Rose', desc: 'Bold & vibrant', accentColor: '#E11D48', secondaryColor: '#FB7185', fontFamily: 'DM Sans', preview: 'from-rose-600 to-pink-400' },
  { id: 'slate-dark', name: 'Slate Dark', desc: 'Corporate executive', accentColor: '#1E293B', secondaryColor: '#475569', fontFamily: 'Inter', preview: 'from-slate-800 to-slate-600' },
  { id: 'ocean', name: 'Ocean', desc: 'Coastal & calm', accentColor: '#0891B2', secondaryColor: '#22D3EE', fontFamily: 'Poppins', preview: 'from-cyan-600 to-sky-400' },
  { id: 'sunset', name: 'Sunset', desc: 'Warm social', accentColor: '#EA580C', secondaryColor: '#FB923C', fontFamily: 'DM Sans', preview: 'from-orange-600 to-amber-400' },
  { id: 'violet', name: 'Violet', desc: 'Creative agency', accentColor: '#7C3AED', secondaryColor: '#A78BFA', fontFamily: 'Poppins', preview: 'from-violet-600 to-purple-400' },
]

export function applyTheme(themeId: string): Partial<CreativeData> {
  const theme = THEME_PRESETS.find((t) => t.id === themeId) ?? THEME_PRESETS[0]
  return {
    themeId: theme.id,
    accentColor: theme.accentColor,
    secondaryColor: theme.secondaryColor,
    fontFamily: theme.fontFamily,
  }
}
