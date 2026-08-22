import type { ComponentType } from 'react'
import type { CreativeData, TemplateId } from '../../types/creative'
import { fontFamilyCss } from '../../utils/exportImage'
import AnalyticsCard from './AnalyticsCard'
import CarouselSlideCard from './CarouselSlideCard'
import CommunityPostCard from './CommunityPostCard'
import FeatureCard from './FeatureCard'
import JobCard from './JobCard'
import JustListedCard from './JustListedCard'
import JustSoldCard from './JustSoldCard'
import KanbanCard from './KanbanCard'
import OpenHouseCard from './OpenHouseCard'
import PastelJobCard from './PastelJobCard'
import ProfileCard from './ProfileCard'
import ProfileGlassCard from './ProfileGlassCard'
import BuyerMatchCard from './BuyerMatchCard'
import LuxuryFrameCard from './LuxuryFrameCard'
import TestimonialCard from './TestimonialCard'
import MarketUpdateCard from './MarketUpdateCard'
import PhotoGalleryCard from './PhotoGalleryCard'
import PriceDropCard from './PriceDropCard'
import EmiCalculatorCard from './EmiCalculatorCard'
import AgentSpotlightCard from './AgentSpotlightCard'
import FestivalWishesCard from './FestivalWishesCard'
import SiteVisitCard from './SiteVisitCard'
import BeforeAfterCard from './BeforeAfterCard'
import NeighbourhoodGuideCard from './NeighbourhoodGuideCard'
import InvestmentRoiCard from './InvestmentRoiCard'
import ProjectLaunchCard from './ProjectLaunchCard'
import QuoteCard from './QuoteCard'
import ReraTrustCard from './ReraTrustCard'
import RentalYieldCard from './RentalYieldCard'
import PropertyCompareCard from './PropertyCompareCard'
import HomeTipsCard from './HomeTipsCard'
import TeamShowcaseCard from './TeamShowcaseCard'
import GridCheatsheetCard from './GridCheatsheetCard'
import GlassCard from './GlassCard'
import GradientRadarCard from './GradientRadarCard'
import SerifAuthorityCard from './SerifAuthorityCard'
import GrowthCurveCard from './GrowthCurveCard'
import MinimalPillCard from './MinimalPillCard'
import CarouselTipCard from './CarouselTipCard'
import DesignPillsCard from './DesignPillsCard'
import HookPostCard from './HookPostCard'
import StudioStatementCard from './StudioStatementCard'
import ProgressCard from './ProgressCard'
import ReportStoryCard from './ReportStoryCard'
import StatsDashboard from './StatsDashboard'

const TEMPLATE_MAP: Record<TemplateId, ComponentType<{ data: CreativeData; slideIndex?: number }>> = {
  'feature-card': FeatureCard,
  analytics: AnalyticsCard,
  progress: ProgressCard,
  'stats-dashboard': StatsDashboard,
  'report-story': ReportStoryCard,
  'job-card': JobCard,
  'kanban-task': KanbanCard,
  'profile-card': ProfileCard,
  'pastel-job': PastelJobCard,
  'community-post': CommunityPostCard,
  'just-listed': JustListedCard,
  'just-sold': JustSoldCard,
  'open-house': OpenHouseCard,
  'profile-glass': ProfileGlassCard,
  'buyer-match': BuyerMatchCard,
  'luxury-frame': LuxuryFrameCard,
  'testimonial': TestimonialCard,
  'market-update': MarketUpdateCard,
  'photo-gallery': PhotoGalleryCard,
  'price-drop': PriceDropCard,
  'emi-calculator': EmiCalculatorCard,
  'agent-spotlight': AgentSpotlightCard,
  'festival-wishes': FestivalWishesCard,
  'site-visit': SiteVisitCard,
  'before-after': BeforeAfterCard,
  'neighbourhood-guide': NeighbourhoodGuideCard,
  'investment-roi': InvestmentRoiCard,
  'project-launch': ProjectLaunchCard,
  'quote-card': QuoteCard,
  'rera-trust': ReraTrustCard,
  'rental-yield': RentalYieldCard,
  'property-compare': PropertyCompareCard,
  'home-tips': HomeTipsCard,
  'team-showcase': TeamShowcaseCard,
  'grid-cheatsheet': GridCheatsheetCard,
  'glass-card': GlassCard,
  'gradient-radar': GradientRadarCard,
  'serif-authority': SerifAuthorityCard,
  'growth-curve': GrowthCurveCard,
  'minimal-pill': MinimalPillCard,
  'carousel-tip': CarouselTipCard,
  'design-pills': DesignPillsCard,
  'hook-post': HookPostCard,
  'studio-statement': StudioStatementCard,
}

interface Props {
  data: CreativeData
  slideIndex?: number
}

export default function TemplateRenderer({ data, slideIndex }: Props) {
  if (data.carouselEnabled) {
    return (
      <div className="h-full w-full" style={{ fontFamily: fontFamilyCss(data.fontFamily), textAlign: data.textAlign }}>
        <CarouselSlideCard data={data} slideIndex={slideIndex} />
      </div>
    )
  }

  const Component = TEMPLATE_MAP[data.templateId] ?? AnalyticsCard
  return (
    <div className="h-full w-full" style={{ fontFamily: fontFamilyCss(data.fontFamily), textAlign: data.textAlign }}>
      <Component data={data} slideIndex={slideIndex} />
    </div>
  )
}
