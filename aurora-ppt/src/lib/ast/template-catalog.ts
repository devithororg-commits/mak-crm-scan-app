import { IMAGE_KEYS, STOCK_IMAGES } from "./template-assets";
import {
  buildPremiumDeck,
  layoutAgenda,
  layoutComparison,
  layoutGlassCard,
  layoutMoodBoard,
  layoutQuote,
  layoutSection,
  layoutSplitImage,
  layoutStats,
  layoutTeam,
  layoutThankYou,
  layoutTimeline,
  layoutTitleHero,
  layoutTwoColumn,
  type DeckCopy,
} from "./template-builders";
import { PREMIUM_THEMES, themeById } from "./template-themes";
import type { DeckTemplate, SlideTemplate, TemplateCategory, TemplateStyle } from "./template-types";
import type { Theme } from "./schema";

type NamedDeck = {
  name: string;
  description: string;
  category: TemplateCategory;
  tags: string[];
  themeId: string;
  style: TemplateStyle;
  imageKey: string;
  kicker: string;
  headline: string;
  subtitle: string;
  tagline: string;
};

const STYLES: TemplateStyle[] = ["split", "gradient", "minimal", "bold", "glass", "fullbleed", "editorial"];

/** Curated premium decks — names inspired by Gamma, Canva, Pitch libraries. */
const NAMED_DECKS: NamedDeck[] = [
  { name: "Monthly Newsletter", description: "Editorial digest with bold cover and metrics", category: "marketing", tags: ["newsletter", "email"], themeId: "noir", style: "editorial", imageKey: "botanical", kicker: "Issue 12 — March 2026", headline: "Monthly\nnewsletter.", subtitle: "Stories, stats, and strategy", tagline: "Curated updates for your audience" },
  { name: "Case Study", description: "Client success story with proof points", category: "business", tags: ["client", "proof"], themeId: "corporate-navy", style: "split", imageKey: "workspace", kicker: "Client spotlight", headline: "Results that\nspeak.", subtitle: "How we delivered 3.8× ROI", tagline: "Confidential case study" },
  { name: "Marketing Plan", description: "Campaign strategy with timeline and KPIs", category: "marketing", tags: ["campaign", "strategy"], themeId: "magenta-pulse", style: "gradient", imageKey: "abstract", kicker: "FY2026", headline: "Marketing\nplan.", subtitle: "Channels, budget, and milestones", tagline: "Growth playbook" },
  { name: "Brand Guidelines", description: "Dark luxury brand system overview", category: "creative", tags: ["brand", "identity"], themeId: "midnight-violet", style: "bold", imageKey: "luxury", kicker: "Brand system", headline: "Brand\nguidelines.", subtitle: "Logo, color, type, and voice", tagline: "Version 2.0" },
  { name: "Rebrand Proposal", description: "Agency pitch for visual identity refresh", category: "creative", tags: ["rebrand", "agency"], themeId: "forest-luxe", style: "editorial", imageKey: "botanical", kicker: "Proposal", headline: "Rebrand\nproposal.", subtitle: "Positioning through design", tagline: "Prepared for leadership review" },
  { name: "Budget Review", description: "Finance deck with bold metrics layout", category: "report", tags: ["finance", "budget"], themeId: "carbon-lime", style: "bold", imageKey: "workspace", kicker: "Q1 2026", headline: "Budget\nreview.", subtitle: "Allocation and variance analysis", tagline: "Internal finance" },
  { name: "Campaign Strategy", description: "Metallic editorial campaign overview", category: "marketing", tags: ["campaign"], themeId: "copper-industrial", style: "fullbleed", imageKey: "abstract", kicker: "Campaign", headline: "Strategy\nthat scales.", subtitle: "Audience, message, and media mix", tagline: "Launch-ready framework" },
  { name: "Event Recap", description: "Post-event highlights and photos", category: "marketing", tags: ["event"], themeId: "ice-minimal", style: "minimal", imageKey: "team", kicker: "Recap", headline: "Event\nhighlights.", subtitle: "Key moments and attendee feedback", tagline: "Thank you for joining us" },
  { name: "Mood Board", description: "Visual direction with texture and tone", category: "creative", tags: ["mood", "visual"], themeId: "rose-gold", style: "split", imageKey: "marble", kicker: "Creative direction", headline: "Mood\nboard.", subtitle: "Palette, texture, and typography", tagline: "Seasonal collection" },
  { name: "Social Media Strategy", description: "Content pillars and channel plan", category: "marketing", tags: ["social", "content"], themeId: "neon-tokyo", style: "gradient", imageKey: "city", kicker: "Social", headline: "Content\nstrategy.", subtitle: "Pillars, cadence, and creative hooks", tagline: "90-day rollout" },
  { name: "Pitch Deck", description: "Investor-ready startup narrative", category: "startup", tags: ["investor", "pitch"], themeId: "noir", style: "editorial", imageKey: "tech", kicker: "Seed round", headline: "Build faster.\nShip smarter.", subtitle: "Problem, solution, traction, ask", tagline: "Confidential" },
  { name: "Investor Update", description: "Monthly investor communication", category: "startup", tags: ["investor"], themeId: "slate-pro", style: "minimal", imageKey: "workspace", kicker: "March 2026", headline: "Investor\nupdate.", subtitle: "Metrics, milestones, and outlook", tagline: "Board-ready summary" },
  { name: "Product Roadmap", description: "Feature timeline and priorities", category: "business", tags: ["product", "roadmap"], themeId: "ocean-teal", style: "gradient", imageKey: "product", kicker: "Product", headline: "Roadmap\n2026.", subtitle: "Now, next, and later", tagline: "Engineering & design aligned" },
  { name: "Sales Proposal", description: "Client-facing proposal deck", category: "business", tags: ["sales", "proposal"], themeId: "corporate-navy", style: "split", imageKey: "workspace", kicker: "Proposal", headline: "Partnership\nproposal.", subtitle: "Scope, timeline, and investment", tagline: "Prepared exclusively for you" },
  { name: "QBR Review", description: "Quarterly business review for executives", category: "report", tags: ["qbr", "executive"], themeId: "champagne", style: "editorial", imageKey: "architecture", kicker: "Q4", headline: "Quarterly\nreview.", subtitle: "Performance and priorities", tagline: "Leadership session" },
  { name: "Team Onboarding", description: "Welcome deck for new hires", category: "education", tags: ["hr", "onboarding"], themeId: "warm-sand", style: "minimal", imageKey: "team", kicker: "Welcome", headline: "Join the\nteam.", subtitle: "Culture, tools, and first 30 days", tagline: "People & operations" },
  { name: "Webinar Deck", description: "Educational presentation with agenda", category: "education", tags: ["webinar", "training"], themeId: "lavender-dream", style: "glass", imageKey: "tech", kicker: "Live session", headline: "Masterclass\nsession.", subtitle: "Learn, apply, and ask questions", tagline: "60-minute deep dive" },
  { name: "Agency Portfolio", description: "Creative agency credentials deck", category: "creative", tags: ["portfolio", "agency"], themeId: "gallery-white", style: "editorial", imageKey: "fashion", kicker: "Portfolio", headline: "Selected\nwork.", subtitle: "Case studies across industries", tagline: "2024 — 2026" },
  { name: "Fashion Lookbook", description: "Editorial fashion presentation", category: "luxury", tags: ["fashion", "lookbook"], themeId: "rose-gold", style: "fullbleed", imageKey: "fashion", kicker: "Collection", headline: "Autumn\nlookbook.", subtitle: "Silhouette, texture, and craft", tagline: "Runway-inspired layouts" },
  { name: "Architecture Portfolio", description: "Spatial design showcase", category: "creative", tags: ["architecture"], themeId: "ice-minimal", style: "split", imageKey: "architecture", kicker: "Studio", headline: "Built\nenvironments.", subtitle: "Residential and commercial work", tagline: "Award-winning practice" },
  { name: "How to Get Started", description: "Bold onboarding guide for new users", category: "education", tags: ["guide", "onboarding"], themeId: "scarlet-bold", style: "bold", imageKey: "gradient", kicker: "Guide", headline: "Get\nstarted.", subtitle: "Four steps to your first deck", tagline: "Quick-start playbook" },
  { name: "Structure & Best Practices", description: "Framework deck for teams", category: "education", tags: ["framework"], themeId: "forest-luxe", style: "minimal", imageKey: "workspace", kicker: "Playbook", headline: "Best\npractices.", subtitle: "Structure, narrative, and design rules", tagline: "Team standards" },
  { name: "Product Launch", description: "Go-to-market reveal deck", category: "marketing", tags: ["launch", "gtm"], themeId: "editorial-green", style: "fullbleed", imageKey: "product", kicker: "Launch", headline: "Introducing\nthe future.", subtitle: "Features, pricing, and rollout", tagline: "Available now" },
  { name: "Annual Report", description: "Year-in-review for stakeholders", category: "report", tags: ["annual"], themeId: "noir", style: "editorial", imageKey: "city", kicker: "2025", headline: "Annual\nreport.", subtitle: "Highlights, financials, and outlook", tagline: "Shareholder edition" },
  { name: "UX Research", description: "Findings and recommendations deck", category: "business", tags: ["ux", "research"], themeId: "slate-pro", style: "split", imageKey: "workspace", kicker: "Research", headline: "User\ninsights.", subtitle: "Interviews, tests, and patterns", tagline: "Design research team" },
  { name: "SaaS Demo", description: "Product walkthrough for prospects", category: "startup", tags: ["saas", "demo"], themeId: "ocean-teal", style: "gradient", imageKey: "tech", kicker: "Product demo", headline: "See it\nin action.", subtitle: "Workflow, integrations, and ROI", tagline: "Book a live session" },
  { name: "Nonprofit Impact", description: "Mission and impact storytelling", category: "education", tags: ["nonprofit"], themeId: "warm-sand", style: "editorial", imageKey: "nature", kicker: "Impact report", headline: "Changing\nlives.", subtitle: "Programs, outcomes, and stories", tagline: "Community first" },
  { name: "Real Estate Listing", description: "Premium property showcase", category: "luxury", tags: ["real-estate"], themeId: "champagne", style: "fullbleed", imageKey: "architecture", kicker: "Listing", headline: "Luxury\nresidence.", subtitle: "Location, amenities, and gallery", tagline: "Exclusive offering" },
  { name: "Restaurant Menu", description: "Hospitality brand presentation", category: "luxury", tags: ["hospitality"], themeId: "copper-industrial", style: "editorial", imageKey: "luxury", kicker: "Seasonal", headline: "Chef's\nselection.", subtitle: "Ingredients, pairings, and story", tagline: "Farm-to-table" },
  { name: "Podcast Media Kit", description: "Show overview for sponsors", category: "marketing", tags: ["podcast", "media"], themeId: "neon-tokyo", style: "bold", imageKey: "abstract", kicker: "Media kit", headline: "Audience\nthat listens.", subtitle: "Reach, demographics, and packages", tagline: "Sponsorship opportunities" },
  { name: "Workshop Facilitation", description: "Facilitator deck for live sessions", category: "education", tags: ["workshop"], themeId: "lavender-dream", style: "glass", imageKey: "team", kicker: "Workshop", headline: "Let's\nbuild.", subtitle: "Exercises, timers, and breakout flows", tagline: "Interactive session" },
  { name: "Crisis Communication", description: "Executive briefing template", category: "business", tags: ["crisis", "comms"], themeId: "corporate-navy", style: "minimal", imageKey: "workspace", kicker: "Briefing", headline: "Situation\nupdate.", subtitle: "Facts, actions, and next steps", tagline: "Leadership only" },
  { name: "Competitive Analysis", description: "Market landscape overview", category: "report", tags: ["competitive"], themeId: "midnight-violet", style: "split", imageKey: "tech", kicker: "Market", headline: "Competitive\nlandscape.", subtitle: "Players, positioning, and gaps", tagline: "Strategy team" },
  { name: "Customer Journey", description: "Experience mapping presentation", category: "marketing", tags: ["journey", "cx"], themeId: "magenta-pulse", style: "gradient", imageKey: "abstract", kicker: "CX", headline: "Customer\njourney.", subtitle: "Touchpoints, pain, and opportunities", tagline: "Experience design" },
  { name: "AI Strategy", description: "Enterprise AI adoption roadmap", category: "startup", tags: ["ai", "strategy"], themeId: "carbon-lime", style: "bold", imageKey: "tech", kicker: "AI initiative", headline: "AI\nstrategy.", subtitle: "Use cases, governance, and rollout", tagline: "Executive steering" },
  { name: "Sustainability Report", description: "ESG metrics and commitments", category: "report", tags: ["esg", "sustainability"], themeId: "forest-luxe", style: "editorial", imageKey: "nature", kicker: "ESG 2026", headline: "Sustainability\nreport.", subtitle: "Goals, progress, and transparency", tagline: "Planet and people" },
  { name: "Wedding Portfolio", description: "Photography studio showcase", category: "luxury", tags: ["wedding", "photo"], themeId: "rose-gold", style: "fullbleed", imageKey: "botanical", kicker: "Portfolio", headline: "Love\nstories.", subtitle: "Ceremony, reception, and details", tagline: "Fine art photography" },
  { name: "Music Release", description: "Artist EP launch deck", category: "creative", tags: ["music"], themeId: "neon-tokyo", style: "gradient", imageKey: "abstract", kicker: "New release", headline: "Sound\nunlocked.", subtitle: "Tracks, visuals, and tour dates", tagline: "Out now on all platforms" },
  { name: "Healthcare Overview", description: "Clinical program introduction", category: "education", tags: ["healthcare"], themeId: "ice-minimal", style: "minimal", imageKey: "workspace", kicker: "Program", headline: "Care\nreimagined.", subtitle: "Services, outcomes, and access", tagline: "Patient-centered" },
  { name: "Legal Brief", description: "Professional legal presentation", category: "business", tags: ["legal"], themeId: "corporate-navy", style: "minimal", imageKey: "architecture", kicker: "Brief", headline: "Case\noverview.", subtitle: "Facts, analysis, and recommendation", tagline: "Attorney work product" },
  { name: "Interior Design", description: "Residential project proposal", category: "luxury", tags: ["interior"], themeId: "warm-sand", style: "split", imageKey: "luxury", kicker: "Project", headline: "Space\nredefined.", subtitle: "Concept, materials, and timeline", tagline: "Bespoke interiors" },
  { name: "Startup Accelerator", description: "Cohort demo day template", category: "startup", tags: ["accelerator", "demo"], themeId: "carbon-lime", style: "bold", imageKey: "team", kicker: "Demo Day", headline: "Meet the\ncohort.", subtitle: "Founders, traction, and vision", tagline: "Batch 2026" },
  { name: "Franchise Pitch", description: "Expansion opportunity deck", category: "business", tags: ["franchise"], themeId: "copper-industrial", style: "editorial", imageKey: "city", kicker: "Franchise", headline: "Grow with\nus.", subtitle: "Model, support, and economics", tagline: "Partner opportunity" },
  { name: "Grant Proposal", description: "Funding request presentation", category: "education", tags: ["grant"], themeId: "warm-sand", style: "minimal", imageKey: "nature", kicker: "Grant", headline: "Funding\nrequest.", subtitle: "Need, plan, and measurable impact", tagline: "Nonprofit submission" },
  { name: "Board Meeting", description: "Governance session template", category: "report", tags: ["board"], themeId: "champagne", style: "editorial", imageKey: "workspace", kicker: "Board", headline: "Board\nmeeting.", subtitle: "Agenda, decisions, and actions", tagline: "Confidential" },
  { name: "Training Manual", description: "Corporate L&D slide deck", category: "education", tags: ["training", "l&d"], themeId: "slate-pro", style: "split", imageKey: "team", kicker: "Training", headline: "Skill\nbuilder.", subtitle: "Modules, exercises, and certification", tagline: "Learning & development" },
  { name: "Press Kit", description: "Media launch package", category: "marketing", tags: ["press", "pr"], themeId: "noir", style: "bold", imageKey: "city", kicker: "Press kit", headline: "Press\nlaunch.", subtitle: "Story, assets, and spokesperson", tagline: "Media inquiries welcome" },
  { name: "App Store Preview", description: "Mobile app marketing slides", category: "marketing", tags: ["app", "mobile"], themeId: "magenta-pulse", style: "gradient", imageKey: "product", kicker: "App", headline: "Download\nnow.", subtitle: "Features, screenshots, and reviews", tagline: "iOS & Android" },
  { name: "Data Dashboard", description: "Analytics review for teams", category: "report", tags: ["data", "analytics"], themeId: "ocean-teal", style: "minimal", imageKey: "tech", kicker: "Analytics", headline: "Data\nstory.", subtitle: "KPIs, trends, and recommendations", tagline: "Weekly review" },
  { name: "Partnership Deck", description: "Strategic alliance proposal", category: "business", tags: ["partnership"], themeId: "midnight-violet", style: "glass", imageKey: "team", kicker: "Partnership", headline: "Better\ntogether.", subtitle: "Synergy, terms, and joint GTM", tagline: "Strategic alliance" },
];

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function toDeckTemplate(n: NamedDeck, premium = true): DeckTemplate {
  const theme = themeById(n.themeId);
  const copy: DeckCopy = { name: n.name, kicker: n.kicker, headline: n.headline, subtitle: n.subtitle, tagline: n.tagline };
  return {
    id: slug(n.name),
    name: n.name,
    description: n.description,
    category: n.category,
    tags: n.tags,
    theme: structuredClone(theme),
    title: n.name,
    premium,
    build: () => buildPremiumDeck(theme, n.style, copy, n.imageKey),
  };
}

/** Theme × style matrix for additional premium variants. */
function buildMatrixDecks(): DeckTemplate[] {
  const out: DeckTemplate[] = [];
  const archetypeNames = ["Studio", "Brief", "Review", "Deck", "Report", "Plan", "Story", "Vision"];
  let i = 0;
  for (const theme of PREMIUM_THEMES) {
    for (const style of STYLES) {
      const label = archetypeNames[i % archetypeNames.length];
      const name = `${theme.name} ${label}`;
      const imageKey = IMAGE_KEYS[i % IMAGE_KEYS.length];
      i += 1;
      const copy: DeckCopy = {
        name,
        kicker: `${theme.name} Collection`,
        headline: `${label}\ndeck.`,
        subtitle: `Premium ${style} layout system`,
        tagline: "Aurora Studio template library",
      };
      out.push({
        id: `${theme.id}-${style}`,
        name,
        description: `${theme.name} theme with ${style} cover architecture`,
        category: theme.id.includes("sand") || theme.id.includes("ice") || theme.id.includes("gallery") ? "minimal" : "business",
        tags: [theme.id, style, "collection"],
        theme: structuredClone(theme),
        title: name,
        premium: false,
        build: () => buildPremiumDeck(theme, style, copy, imageKey),
      });
    }
  }
  return out;
}

export const NAMED_DECK_TEMPLATES: DeckTemplate[] = NAMED_DECKS.map((n) => toDeckTemplate(n));

export const MATRIX_DECK_TEMPLATES: DeckTemplate[] = buildMatrixDecks();

export const ALL_DECK_TEMPLATES: DeckTemplate[] = [...NAMED_DECK_TEMPLATES, ...MATRIX_DECK_TEMPLATES];

export const SLIDE_LAYOUT_TEMPLATES: SlideTemplate[] = [
  { id: "title-hero", name: "Title Hero", description: "Full-bleed headline with kicker", category: "business", tags: ["title"], build: () => layoutTitleHero() },
  { id: "title-image", name: "Title + Image", description: "Split layout with hero photo", category: "creative", tags: ["image"], build: () => layoutSplitImage(STOCK_IMAGES.botanical, "Design that\nfeels alive.") },
  { id: "two-column", name: "Two Column", description: "Balanced text columns", category: "report", tags: ["columns"], build: () => layoutTwoColumn() },
  { id: "stats-three", name: "Three Stats", description: "Metrics row with captions", category: "business", tags: ["metrics"], build: () => layoutStats() },
  { id: "quote-center", name: "Quote", description: "Centered pull quote", category: "creative", tags: ["quote"], build: () => layoutQuote() },
  { id: "section-break", name: "Section Break", description: "Chapter divider with number", category: "minimal", tags: ["section"], build: () => layoutSection() },
  { id: "bullet-list", name: "Bullet List", description: "Heading with stacked points", category: "report", tags: ["agenda"], build: () => layoutAgenda() },
  { id: "thank-you", name: "Thank You", description: "Closing slide with contact", category: "business", tags: ["close"], build: () => layoutThankYou() },
  { id: "glass-panel", name: "Glass Panel", description: "Glassmorphism gradient card", category: "creative", tags: ["glass"], build: () => layoutGlassCard(themeById("midnight-violet")) },
  { id: "mood-board", name: "Mood Board", description: "Split texture and type", category: "luxury", tags: ["mood"], build: () => layoutMoodBoard(STOCK_IMAGES.marble) },
  { id: "timeline", name: "Timeline", description: "Quarterly roadmap line", category: "business", tags: ["roadmap"], build: () => layoutTimeline() },
  { id: "team", name: "Team", description: "People with portrait", category: "business", tags: ["team"], build: () => layoutTeam(STOCK_IMAGES.team) },
  { id: "comparison", name: "Before / After", description: "Side-by-side comparison", category: "report", tags: ["compare"], build: () => layoutComparison() },
  { id: "marble-hero", name: "Marble Hero", description: "Luxury marble split", category: "luxury", tags: ["marble"], build: () => layoutSplitImage(STOCK_IMAGES.marble, "Texture &\nelegance.") },
  { id: "tech-hero", name: "Tech Hero", description: "Futuristic full visual", category: "startup", tags: ["tech"], build: () => layoutSplitImage(STOCK_IMAGES.tech, "Innovation\nat scale.") },
  { id: "nature-cover", name: "Nature Cover", description: "Organic editorial cover", category: "creative", tags: ["nature"], build: () => layoutSplitImage(STOCK_IMAGES.nature, "Rooted in\npurpose.") },
];

export const TEMPLATE_CATEGORIES: { id: TemplateCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "business", label: "Business" },
  { id: "marketing", label: "Marketing" },
  { id: "startup", label: "Startup" },
  { id: "creative", label: "Creative" },
  { id: "luxury", label: "Luxury" },
  { id: "report", label: "Report" },
  { id: "education", label: "Education" },
  { id: "minimal", label: "Minimal" },
];

export function getDeckTemplateCount(): number {
  return ALL_DECK_TEMPLATES.length;
}
