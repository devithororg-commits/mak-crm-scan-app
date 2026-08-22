import {
  AreaChart,
  Ban,
  BarChart3,
  Briefcase,
  Building,
  Building2,
  Castle,
  Globe,
  Home,
  LayoutGrid,
  LineChart,
  Megaphone,
  Mountain,
  Newspaper,
  PieChart,
  Settings,
  Smartphone,
  TrendingUp,
  User,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  TwitterIcon,
  WhatsAppIcon,
} from './BrandIcons'
import type { IconName } from './iconNames'

export type { IconName } from './iconNames'

const LUCIDE: Partial<Record<IconName, LucideIcon>> = {
  building: Building2,
  user: User,
  globe: Globe,
  megaphone: Megaphone,
  'trending-up': TrendingUp,
  newspaper: Newspaper,
  'line-chart': LineChart,
  'bar-chart': BarChart3,
  'pie-chart': PieChart,
  'area-chart': AreaChart,
  'chart-none': Ban,
  settings: Settings,
  home: Home,
  castle: Castle,
  apartment: Building,
  briefcase: Briefcase,
  mountain: Mountain,
  'layout-grid': LayoutGrid,
  'home-modern': Home,
  users: Users,
  smartphone: Smartphone,
}

const BRANDS: Partial<Record<IconName, typeof InstagramIcon>> = {
  instagram: InstagramIcon,
  linkedin: LinkedInIcon,
  twitter: TwitterIcon,
  whatsapp: WhatsAppIcon,
  facebook: FacebookIcon,
}

interface AppIconProps {
  name: IconName
  size?: number
  className?: string
  strokeWidth?: number
}

export function AppIcon({ name, size = 16, className = '', strokeWidth = 2 }: AppIconProps) {
  const Brand = BRANDS[name]
  if (Brand) {
    return <Brand size={size} className={className} />
  }

  const Lucide = LUCIDE[name]
  if (Lucide) {
    return <Lucide size={size} className={className} strokeWidth={strokeWidth} />
  }

  return null
}

/** Platform brand colors for icon badges */
export const PLATFORM_COLORS: Partial<Record<IconName, string>> = {
  instagram: 'text-[#E4405F]',
  linkedin: 'text-[#0A66C2]',
  twitter: 'text-slate-900',
  whatsapp: 'text-[#25D366]',
  facebook: 'text-[#1877F2]',
}
