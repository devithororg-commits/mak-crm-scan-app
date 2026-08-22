import type { ContentCategory, TemplateId, FontFamily, Platform, AspectRatio } from '../types/creative'
import type { IconName } from '../components/icons/iconNames'

export const CATEGORIES: { id: ContentCategory; label: string; desc: string; icon: IconName }[] = [
  { id: 'company', label: 'Company', desc: 'Corporate reports & profiles', icon: 'building' },
  { id: 'person', label: 'Person', desc: 'Leadership & team highlights', icon: 'user' },
  { id: 'location', label: 'Location', desc: 'State, country & market data', icon: 'globe' },
  { id: 'marketing', label: 'Marketing', desc: 'Research & campaign insights', icon: 'megaphone' },
  { id: 'growth', label: 'Growth', desc: 'Revenue & milestone tracking', icon: 'trending-up' },
  { id: 'news', label: 'News', desc: 'Press releases & announcements', icon: 'newspaper' },
]

export const TEMPLATES: {
  id: TemplateId
  name: string
  desc: string
  preview: string
  bestFor: string
}[] = [
  { id: 'analytics', name: 'Analytics Pro', desc: 'Charts + KPI dashboard', preview: 'bg-white border', bestFor: 'Data reports' },
  { id: 'feature-card', name: 'Feature Highlight', desc: 'Bold gradient feature', preview: 'bg-gradient-to-br from-blue-600 to-blue-800', bestFor: 'Product launch' },
  { id: 'progress', name: 'Goal Tracker', desc: 'Progress & milestones', preview: 'bg-gradient-to-br from-rose-500 to-rose-900', bestFor: 'Targets' },
  { id: 'stats-dashboard', name: 'Stats Grid', desc: 'Multi-metric overview', preview: 'bg-slate-50 border', bestFor: 'KPIs' },
  { id: 'report-story', name: 'Impact Story', desc: 'Narrative report card', preview: 'bg-stone-100 border', bestFor: 'Annual reports' },
  { id: 'profile-card', name: 'Freelancer Pro', desc: 'Dribbble-style profile card', preview: 'bg-white border shadow', bestFor: 'People & Teams' },
  { id: 'job-card', name: 'Listing Pro', desc: 'Professional listing', preview: 'bg-white border shadow', bestFor: 'Offers' },
  { id: 'kanban-task', name: 'Task Card', desc: 'Project task style', preview: 'bg-white border', bestFor: 'Updates' },
  { id: 'pastel-job', name: 'Pastel Block', desc: 'Colorful social block', preview: 'bg-purple-100', bestFor: 'Social feed' },
  { id: 'community-post', name: 'Content Post', desc: 'Article + attachment', preview: 'bg-orange-50 border', bestFor: 'Newsletters' },
  { id: 'just-listed', name: 'Just Listed', desc: 'New property listing', preview: 'bg-emerald-50 border', bestFor: 'Real Estate' },
  { id: 'just-sold', name: 'Just Sold', desc: 'Sold property celebration', preview: 'bg-slate-800', bestFor: 'Real Estate' },
  { id: 'open-house', name: 'Open House', desc: 'Property open house invite', preview: 'bg-violet-50 border', bestFor: 'Real Estate' },
  { id: 'profile-glass', name: 'Profile Glass', desc: 'Full-bleed photo + gradient overlay', preview: 'bg-gradient-to-br from-slate-200 to-white border', bestFor: 'Freelancers' },
  { id: 'buyer-match', name: 'Buyer Match', desc: 'Lead capture with feature list', preview: 'bg-white border shadow', bestFor: 'Real Estate' },
  { id: 'luxury-frame', name: 'Luxury Frame', desc: 'Framed brand collab carousel', preview: 'bg-[#f4f1ea] border', bestFor: 'Luxury / Brands' },
  { id: 'testimonial', name: 'Testimonial', desc: 'Client review & star rating', preview: 'bg-white border shadow', bestFor: 'Social Proof' },
  { id: 'market-update', name: 'Market Update', desc: 'Local market data card', preview: 'bg-gradient-to-br from-indigo-600 to-violet-500', bestFor: 'Real Estate' },
  { id: 'photo-gallery', name: 'Photo Gallery', desc: 'Multi-photo property showcase', preview: 'bg-white border shadow', bestFor: 'Real Estate' },
  { id: 'price-drop', name: 'Price Drop', desc: 'Reduced price alert with savings', preview: 'bg-gradient-to-br from-rose-500 to-red-600', bestFor: 'Real Estate' },
  { id: 'emi-calculator', name: 'EMI Calculator', desc: 'Loan EMI breakdown card', preview: 'bg-gradient-to-br from-slate-900 to-indigo-950', bestFor: 'Real Estate' },
  { id: 'agent-spotlight', name: 'Agent Spotlight', desc: 'Agent profile with stats', preview: 'bg-white border shadow', bestFor: 'Real Estate' },
  { id: 'festival-wishes', name: 'Festival Wishes', desc: 'Diwali, Ugadi & festive greetings', preview: 'bg-gradient-to-br from-amber-500 to-orange-600', bestFor: 'Engagement' },
  { id: 'site-visit', name: 'Site Visit Invite', desc: 'Property visit date & time', preview: 'bg-gradient-to-r from-teal-500 to-cyan-500', bestFor: 'Real Estate' },
  { id: 'before-after', name: 'Before / After', desc: 'Split renovation comparison', preview: 'bg-slate-900', bestFor: 'Real Estate' },
  { id: 'neighbourhood-guide', name: 'Neighbourhood Guide', desc: 'Schools, metro & amenities', preview: 'bg-gradient-to-r from-emerald-500 to-teal-500', bestFor: 'Real Estate' },
  { id: 'investment-roi', name: 'Investment ROI', desc: 'Rental yield & returns card', preview: 'bg-gradient-to-br from-violet-950 to-indigo-950', bestFor: 'NRI / Investors' },
  { id: 'project-launch', name: 'Project Launch', desc: 'Countdown + construction progress', preview: 'bg-gradient-to-br from-orange-500 to-red-500', bestFor: 'Real Estate' },
  { id: 'quote-card', name: 'Quote Card', desc: 'Inspirational quote with author', preview: 'bg-gradient-to-br from-slate-800 to-indigo-950', bestFor: 'Social / Brand' },
]

export const CHART_TYPES: { id: 'line' | 'bar' | 'pie' | 'area' | 'none'; label: string; icon: IconName }[] = [
  { id: 'line', label: 'Line', icon: 'line-chart' },
  { id: 'bar', label: 'Bar', icon: 'bar-chart' },
  { id: 'pie', label: 'Pie', icon: 'pie-chart' },
  { id: 'area', label: 'Area', icon: 'area-chart' },
  { id: 'none', label: 'None', icon: 'chart-none' },
]

export const ASPECT_RATIOS: { id: AspectRatio; label: string; w: number; h: number; platform: string }[] = [
  { id: '1:1', label: 'Square', w: 1080, h: 1080, platform: 'Instagram Feed' },
  { id: '4:5', label: 'Portrait', w: 1080, h: 1350, platform: 'Instagram Portrait' },
  { id: '9:16', label: 'Story', w: 1080, h: 1920, platform: 'Stories / Reels' },
  { id: '16:9', label: 'Landscape', w: 1920, h: 1080, platform: 'LinkedIn / YouTube' },
]

export const PLATFORMS: { id: Platform; label: string; aspect: AspectRatio; icon: IconName }[] = [
  { id: 'instagram', label: 'Instagram', aspect: '1:1', icon: 'instagram' },
  { id: 'linkedin', label: 'LinkedIn', aspect: '16:9', icon: 'linkedin' },
  { id: 'twitter', label: 'X / Twitter', aspect: '16:9', icon: 'twitter' },
  { id: 'whatsapp', label: 'WhatsApp', aspect: '9:16', icon: 'whatsapp' },
  { id: 'facebook', label: 'Facebook', aspect: '1:1', icon: 'facebook' },
  { id: 'custom', label: 'Custom', aspect: '1:1', icon: 'settings' },
]

export const FONT_OPTIONS: { id: FontFamily; label: string; sample: string }[] = [
  { id: 'Poppins', label: 'Poppins', sample: 'Modern & Clean' },
  { id: 'Inter', label: 'Inter', sample: 'Tech & SaaS' },
  { id: 'DM Sans', label: 'DM Sans', sample: 'Friendly & Bold' },
  { id: 'Playfair Display', label: 'Playfair', sample: 'Luxury & Editorial' },
]

export const COLOR_PALETTES = [
  { name: 'Indigo Pro', primary: '#4F46E5', secondary: '#818CF8' },
  { name: 'Emerald', primary: '#059669', secondary: '#34D399' },
  { name: 'Rose', primary: '#E11D48', secondary: '#FB7185' },
  { name: 'Amber', primary: '#D97706', secondary: '#FBBF24' },
  { name: 'Violet', primary: '#7C3AED', secondary: '#A78BFA' },
  { name: 'Slate', primary: '#334155', secondary: '#64748B' },
  { name: 'Cyan', primary: '#0891B2', secondary: '#22D3EE' },
  { name: 'Orange', primary: '#EA580C', secondary: '#FB923C' },
]

export const FOOTER_STYLES = [
  { id: 'minimal' as const, label: 'Minimal', desc: 'Name + website only' },
  { id: 'branded' as const, label: 'Branded', desc: 'Logo area + contact' },
  { id: 'full' as const, label: 'Full', desc: 'Complete contact block' },
]

export const CATEGORY_FIELDS: Record<ContentCategory, { key: string; label: string; placeholder?: string; multiline?: boolean; group?: string }[]> = {
  company: [
    { key: 'companyName', label: 'Company Name', placeholder: 'MAK Projects Pvt Ltd', group: 'Identity' },
    { key: 'industry', label: 'Industry', placeholder: 'Real Estate', group: 'Identity' },
    { key: 'founded', label: 'Founded', placeholder: '2010', group: 'Identity' },
    { key: 'employeeCount', label: 'Team Size', placeholder: '250+', group: 'Identity' },
    { key: 'title', label: 'Headline', placeholder: 'Q4 Growth Report', group: 'Content' },
    { key: 'subtitle', label: 'Tagline', placeholder: 'Revenue up 34% YoY', group: 'Content' },
    { key: 'description', label: 'Description', placeholder: 'Key achievements and highlights...', multiline: true, group: 'Content' },
    { key: 'eyebrow', label: 'Category Label', placeholder: 'Corporate Report', group: 'Content' },
    { key: 'badge', label: 'Period / Badge', placeholder: 'Q4 2025', group: 'Content' },
    { key: 'website', label: 'Website', placeholder: 'www.example.com', group: 'Contact' },
    { key: 'email', label: 'Email', placeholder: 'info@example.com', group: 'Contact' },
    { key: 'phone', label: 'Phone', placeholder: '+91 99999 99999', group: 'Contact' },
    { key: 'socialHandle', label: 'Social Handle', placeholder: '@company', group: 'Contact' },
  ],
  person: [
    { key: 'personName', label: 'Full Name', placeholder: 'Rahul Sharma', group: 'Identity' },
    { key: 'personRole', label: 'Designation', placeholder: 'CEO & Founder', group: 'Identity' },
    { key: 'companyName', label: 'Organization', placeholder: 'MAK Projects', group: 'Identity' },
    { key: 'title', label: 'Headline', placeholder: 'Leading Innovation', group: 'Content' },
    { key: 'description', label: 'Bio / Summary', placeholder: 'Professional background...', multiline: true, group: 'Content' },
    { key: 'subtitle', label: 'Expertise', placeholder: '15+ years in real estate', group: 'Content' },
    { key: 'email', label: 'Email', placeholder: 'name@company.com', group: 'Contact' },
    { key: 'phone', label: 'Phone', placeholder: '+91 99999 99999', group: 'Contact' },
    { key: 'socialHandle', label: 'LinkedIn / Social', placeholder: '@username', group: 'Contact' },
    { key: 'location', label: 'Location', placeholder: 'Hyderabad, India', group: 'Contact' },
  ],
  location: [
    { key: 'state', label: 'State', placeholder: 'Telangana', group: 'Location' },
    { key: 'country', label: 'Country', placeholder: 'India', group: 'Location' },
    { key: 'location', label: 'City / Region', placeholder: 'Hyderabad', group: 'Location' },
    { key: 'title', label: 'Headline', placeholder: 'Market Growth Report', group: 'Content' },
    { key: 'subtitle', label: 'Key Stat', placeholder: '+22% YoY growth', group: 'Content' },
    { key: 'description', label: 'Market Analysis', placeholder: 'Regional insights...', multiline: true, group: 'Content' },
    { key: 'industry', label: 'Sector', placeholder: 'Real Estate', group: 'Content' },
    { key: 'badge', label: 'Year / Period', placeholder: '2025', group: 'Content' },
  ],
  marketing: [
    { key: 'title', label: 'Research Title', placeholder: 'Digital Marketing ROI Study', group: 'Content' },
    { key: 'subtitle', label: 'Key Finding', placeholder: 'Social drives 62% of leads', group: 'Content' },
    { key: 'description', label: 'Summary', placeholder: 'Research findings...', multiline: true, group: 'Content' },
    { key: 'eyebrow', label: 'Source / Brand', placeholder: 'Marketing Insights', group: 'Content' },
    { key: 'badge', label: 'Period', placeholder: 'Q4 2025', group: 'Content' },
    { key: 'authorName', label: 'Analyst', placeholder: 'Research Team', group: 'Meta' },
    { key: 'comparisonLabel', label: 'Comparison', placeholder: 'vs last quarter', group: 'Meta' },
  ],
  growth: [
    { key: 'title', label: 'Growth Headline', placeholder: 'Revenue Milestone', group: 'Content' },
    { key: 'subtitle', label: 'Growth Metric', placeholder: '+34% YoY', group: 'Content' },
    { key: 'description', label: 'Analysis', placeholder: 'Growth narrative...', multiline: true, group: 'Content' },
    { key: 'badge', label: 'Period', placeholder: 'Q4 2025', group: 'Content' },
    { key: 'targetValue', label: 'Target', placeholder: '₹50 Cr', group: 'Targets' },
    { key: 'currentValue', label: 'Current', placeholder: '₹36.5 Cr', group: 'Targets' },
    { key: 'previousValue', label: 'Previous', placeholder: '₹35.8 Cr', group: 'Targets' },
    { key: 'changePercent', label: 'Change %', placeholder: '+34%', group: 'Targets' },
  ],
  news: [
    { key: 'title', label: 'News Headline', placeholder: 'Company Wins Award', group: 'Content' },
    { key: 'newsSource', label: 'Source', placeholder: 'Economic Times', group: 'Content' },
    { key: 'description', label: 'News Summary', placeholder: 'Full story...', multiline: true, group: 'Content' },
    { key: 'badge', label: 'Date', placeholder: 'Dec 2025', group: 'Content' },
    { key: 'authorName', label: 'Author', placeholder: 'Press Desk', group: 'Meta' },
    { key: 'publishedDate', label: 'Published', placeholder: '15 Dec 2025', group: 'Meta' },
    { key: 'subtitle', label: 'Sub-headline', placeholder: 'Industry recognition', group: 'Content' },
  ],
}
