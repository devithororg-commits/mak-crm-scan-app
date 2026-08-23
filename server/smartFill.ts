import { TEMPLATE_IDS } from './templateIds'
import { humanizeHashtags, humanizeText } from './humanize'

export interface ServerEnv {
  OPENAI_API_KEY: string
  TAVILY_API_KEY: string
  UNSPLASH_ACCESS_KEY?: string
}

interface CompanyDna {
  companyName?: string
  industry?: string
  website?: string
  phone?: string
  socialHandle?: string
  tone?: string
  languages?: string[]
  accentColor?: string
  secondaryColor?: string
  disclaimer?: string
  forbiddenPhrases?: string[]
}

export interface SmartFillRequest {
  topic: string
  platform?: string
  language?: string
  companyDna?: CompanyDna
  excludeTemplates?: string[]
}

async function tavilySearch(query: string, apiKey: string) {
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: 'basic',
      max_results: 5,
      include_answer: true,
    }),
  })
  if (!res.ok) throw new Error(`Research failed (${res.status})`)
  return res.json() as Promise<{
    answer?: string
    results?: { title: string; url: string; content: string }[]
  }>
}

async function unsplashPhoto(keywords: string, accessKey: string) {
  const q = encodeURIComponent(keywords.slice(0, 80))
  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${q}&per_page=1&orientation=squarish&content_filter=high`,
    { headers: { Authorization: `Client-ID ${accessKey}` } },
  )
  if (!res.ok) return null
  const data = await res.json() as { results?: { urls?: { regular?: string }; user?: { name?: string } }[] }
  const hit = data.results?.[0]
  if (!hit?.urls?.regular) return null
  return { url: `${hit.urls.regular}&w=1600&q=90`, photographer: hit.user?.name || 'Unsplash' }
}

function buildSystemPrompt(dna: CompanyDna, exclude: string[], language: string) {
  const forbidden = [...(dna.forbiddenPhrases || []), 'unlock', 'elevate', 'revolutionize', 'game-changer', 'seamless experience']
  return `You are a senior brand designer and copywriter for "${dna.companyName || 'the company'}" (${dna.industry || 'real estate/marketing'}).
Write like a human agency professional — factual, concise, local, never robotic.
Rules:
- NO generic AI marketing clichés (${forbidden.join(', ')}).
- Use **word** syntax for highlight emphasis in titles only where natural.
- Short headlines (3-8 words ideal). Body max 2 sentences.
- Real estate: use realistic Indian context if topic implies India (₹ prices ok as estimates, mark with * if uncertain).
- Pick templateId from allowed list — prefer variety; NEVER pick: ${exclude.slice(0, 20).join(', ') || 'none'}.
- Colors as hex. highlights: 3-4 bullet facts, no fluff.
- Captions: platform-native, human tone, local hashtags for ${language}.
- Instagram hashtags: 6-8 at end. LinkedIn: 2-3 max. WhatsApp: no hashtags in caption.
Company: ${JSON.stringify(dna)}`
}

async function openAiFill(
  env: ServerEnv,
  topic: string,
  research: string,
  sources: string[],
  dna: CompanyDna,
  exclude: string[],
  language: string,
  platform: string,
) {
  const templateEnum = TEMPLATE_IDS.filter((id) => !exclude.includes(id))
  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      templateId: { type: 'string', enum: templateEnum.length ? templateEnum : [...TEMPLATE_IDS] },
      title: { type: 'string' },
      subtitle: { type: 'string' },
      description: { type: 'string' },
      eyebrow: { type: 'string' },
      badge: { type: 'string' },
      ctaText: { type: 'string' },
      propertyTitle: { type: 'string' },
      propertyPrice: { type: 'string' },
      propertyAddress: { type: 'string' },
      propertyBeds: { type: 'string' },
      propertyBaths: { type: 'string' },
      propertySqft: { type: 'string' },
      highlights: { type: 'array', items: { type: 'string' } },
      accentColor: { type: 'string' },
      secondaryColor: { type: 'string' },
      imageKeywords: { type: 'string' },
      captions: {
        type: 'object',
        additionalProperties: false,
        properties: {
          instagram: { type: 'object', properties: { caption: { type: 'string' }, hashtags: { type: 'string' } }, required: ['caption', 'hashtags'], additionalProperties: false },
          linkedin: { type: 'object', properties: { caption: { type: 'string' }, hashtags: { type: 'string' } }, required: ['caption', 'hashtags'], additionalProperties: false },
          whatsapp: { type: 'object', properties: { caption: { type: 'string' }, hashtags: { type: 'string' } }, required: ['caption', 'hashtags'], additionalProperties: false },
          facebook: { type: 'object', properties: { caption: { type: 'string' }, hashtags: { type: 'string' } }, required: ['caption', 'hashtags'], additionalProperties: false },
          twitter: { type: 'object', properties: { caption: { type: 'string' }, hashtags: { type: 'string' } }, required: ['caption', 'hashtags'], additionalProperties: false },
        },
        required: ['instagram', 'linkedin', 'whatsapp', 'facebook', 'twitter'],
      },
    },
    required: [
      'templateId', 'title', 'subtitle', 'description', 'eyebrow', 'badge', 'ctaText',
      'propertyTitle', 'propertyPrice', 'propertyAddress', 'propertyBeds', 'propertyBaths', 'propertySqft',
      'highlights', 'accentColor', 'secondaryColor', 'imageKeywords', 'captions',
    ],
  }

  const userContent = `Topic: ${topic}
Primary platform: ${platform}
Language style: ${language}
Research summary:
${research}

Sources: ${sources.join(' | ')}

Return JSON matching schema. Pick the best template for this topic.`

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: buildSystemPrompt(dna, exclude, language) },
        { role: 'user', content: userContent },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'poster_brief', strict: true, schema },
      },
      temperature: 0.85,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Content generation failed: ${err.slice(0, 200)}`)
  }

  const data = await res.json() as { choices?: { message?: { content?: string } }[] }
  const raw = data.choices?.[0]?.message?.content
  if (!raw) throw new Error('Empty AI response')
  return JSON.parse(raw) as Record<string, unknown>
}

function sanitizeBrief(brief: Record<string, unknown>, dna: CompanyDna) {
  const textFields = ['title', 'subtitle', 'description', 'eyebrow', 'badge', 'ctaText', 'propertyTitle', 'propertyAddress']
  for (const k of textFields) {
    if (typeof brief[k] === 'string') brief[k] = humanizeText(brief[k] as string)
  }
  if (Array.isArray(brief.highlights)) {
    brief.highlights = (brief.highlights as string[]).map(humanizeText).slice(0, 4)
  }
  if (dna.accentColor) brief.accentColor = dna.accentColor
  if (dna.secondaryColor) brief.secondaryColor = dna.secondaryColor
  if (brief.captions && typeof brief.captions === 'object') {
    for (const p of Object.values(brief.captions as Record<string, { caption?: string; hashtags?: string }>)) {
      if (p.caption) p.caption = humanizeText(p.caption)
      if (p.hashtags) p.hashtags = humanizeHashtags(p.hashtags)
    }
  }
  return brief
}

export async function runSmartFill(env: ServerEnv, body: SmartFillRequest) {
  if (!env.OPENAI_API_KEY || !env.TAVILY_API_KEY) {
    throw new Error('Server missing API keys. Add OPENAI_API_KEY and TAVILY_API_KEY to server/.env')
  }

  const topic = body.topic?.trim()
  if (!topic || topic.length < 3) throw new Error('Enter a topic (min 3 characters)')

  const dna: CompanyDna = body.companyDna || {}
  const exclude = body.excludeTemplates || []
  const language = body.language || 'english'
  const platform = body.platform || 'instagram'

  const search = await tavilySearch(`${topic} ${dna.industry || ''} facts`, env.TAVILY_API_KEY)
  const research = search.answer || search.results?.map((r) => r.content).join('\n').slice(0, 1500) || topic
  const sources = (search.results || []).slice(0, 4).map((r) => r.url)

  const brief = sanitizeBrief(
    await openAiFill(env, topic, research, sources, dna, exclude, language, platform),
    dna,
  )

  let imageUrl: string | undefined
  let imageCredit: string | undefined
  const keywords = String(brief.imageKeywords || topic)
  if (env.UNSPLASH_ACCESS_KEY) {
    const photo = await unsplashPhoto(keywords, env.UNSPLASH_ACCESS_KEY)
    if (photo) {
      imageUrl = photo.url
      imageCredit = photo.photographer
    }
  }

  return {
    brief,
    researchSummary: research.slice(0, 400),
    sources,
    imageUrl,
    imageCredit,
  }
}
