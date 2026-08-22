import { useCreative } from '../../store/CreativeContext'
import type { TemplateId } from '../../types/creative'
import { Field, Section, inputClass, textareaClass } from './FormUI'

const TEMPLATE_FIELD_MAP: Partial<Record<TemplateId, { key: string; label: string; placeholder?: string; multiline?: boolean; type?: 'number' }[]>> = {
  'price-drop': [
    { key: 'previousValue', label: 'Old Price (strikethrough)', placeholder: '₹1.50 Cr' },
    { key: 'propertyPrice', label: 'New Price', placeholder: '₹1.25 Cr' },
    { key: 'changePercent', label: 'Savings Badge', placeholder: '₹25 Lakh OFF' },
    { key: 'comparisonLabel', label: 'Offer Text', placeholder: 'Limited time offer' },
  ],
  'emi-calculator': [
    { key: 'propertyPrice', label: 'Loan Amount', placeholder: '₹75 Lakh' },
    { key: 'metric1Value', label: 'Monthly EMI', placeholder: '₹45,200' },
    { key: 'metric2Value', label: 'Loan Tenure', placeholder: '20 Years' },
    { key: 'metric3Value', label: 'Interest Rate', placeholder: '8.5%' },
  ],
  'agent-spotlight': [
    { key: 'personName', label: 'Agent Name', placeholder: 'Rahul Sharma' },
    { key: 'personRole', label: 'Designation', placeholder: 'Senior Property Consultant' },
    { key: 'metric1Value', label: 'Deals Closed', placeholder: '120+' },
    { key: 'metric2Value', label: 'Experience', placeholder: '12 Yrs' },
    { key: 'metric3Value', label: 'Rating', placeholder: '4.9★' },
    { key: 'description', label: 'Bio', placeholder: 'Agent bio...', multiline: true },
  ],
  'festival-wishes': [
    { key: 'badge', label: 'Festival Name', placeholder: 'Diwali 2025' },
    { key: 'title', label: 'Wish Message', placeholder: 'Wishing you joy and prosperity!', multiline: true },
    { key: 'description', label: 'Secondary Message', placeholder: 'Festive greeting...', multiline: true },
  ],
  'site-visit': [
    { key: 'publishedDate', label: 'Visit Date', placeholder: 'Saturday, 28 Dec 2025' },
    { key: 'status', label: 'Visit Time', placeholder: '10:00 AM – 6:00 PM' },
    { key: 'propertyAddress', label: 'Location', placeholder: 'Gachibowli, Hyderabad' },
    { key: 'description', label: 'Visit Notes', placeholder: 'Parking, refreshments...', multiline: true },
  ],
  'before-after': [
    { key: 'comparisonLabel', label: 'Before Label', placeholder: 'Before' },
    { key: 'subtitle', label: 'After Label', placeholder: 'After' },
    { key: 'propertyTitle', label: 'Project Title', placeholder: '3BHK Renovation' },
    { key: 'description', label: 'Description', placeholder: 'Transformation details...', multiline: true },
  ],
  'neighbourhood-guide': [
    { key: 'title', label: 'Area Name', placeholder: 'Gachibowli' },
    { key: 'metric1Value', label: 'Schools', placeholder: '5 within 2km' },
    { key: 'metric2Value', label: 'Hospitals', placeholder: '3 nearby' },
    { key: 'metric3Value', label: 'Metro', placeholder: '800m away' },
    { key: 'metric4Value', label: 'Malls', placeholder: '2 nearby' },
  ],
  'investment-roi': [
    { key: 'propertyPrice', label: 'Property Price', placeholder: '₹1.25 Cr' },
    { key: 'metric1Value', label: 'Rental Yield', placeholder: '4.2%' },
    { key: 'metric2Value', label: 'Appreciation', placeholder: '+22% YoY' },
    { key: 'metric3Value', label: '5Y ROI', placeholder: '68%' },
    { key: 'changePercent', label: 'Expected Returns', placeholder: '+68% in 5Y' },
  ],
  'project-launch': [
    { key: 'badge', label: 'Days to Launch', placeholder: '7' },
    { key: 'publishedDate', label: 'Launch Date', placeholder: 'January 15, 2026' },
    { key: 'propertyTitle', label: 'Project Name', placeholder: 'MAK Heights' },
    { key: 'propertyPrice', label: 'Starting Price', placeholder: '₹65 Lakh*' },
    { key: 'progressPercent', label: 'Construction %', placeholder: '75', type: 'number' },
  ],
  'quote-card': [
    { key: 'title', label: 'Quote Text', placeholder: 'Your inspirational quote...', multiline: true },
    { key: 'personName', label: 'Author Name', placeholder: 'Rahul Sharma' },
    { key: 'personRole', label: 'Author Title', placeholder: 'CEO, MAK Projects' },
    { key: 'eyebrow', label: 'Category Label', placeholder: 'Monday Motivation' },
    { key: 'badge', label: 'Hashtag', placeholder: '#RealEstate' },
  ],
}

export default function TemplateFields() {
  const { data, update } = useCreative()
  const fields = TEMPLATE_FIELD_MAP[data.templateId]
  if (!fields) return null

  const titles: Partial<Record<TemplateId, string>> = {
    'price-drop': 'Price Drop Details',
    'emi-calculator': 'EMI Calculator',
    'agent-spotlight': 'Agent Profile',
    'festival-wishes': 'Festival Wishes',
    'site-visit': 'Site Visit Details',
    'before-after': 'Before / After',
    'neighbourhood-guide': 'Neighbourhood Guide',
    'investment-roi': 'Investment ROI',
    'project-launch': 'Project Launch',
    'quote-card': 'Quote Details',
  }

  return (
    <Section title={titles[data.templateId] ?? 'Template Fields'} desc="Fields specific to this template layout">
      <div className="space-y-3">
        {fields.map((field) => (
          <Field key={field.key} label={field.label}>
            {field.multiline ? (
              <textarea
                rows={3}
                value={data[field.key as keyof typeof data] as string}
                onChange={(e) => update(field.key as keyof typeof data, e.target.value)}
                placeholder={field.placeholder}
                className={textareaClass}
              />
            ) : field.type === 'number' ? (
              <input
                type="number"
                min={0}
                max={100}
                value={data[field.key as keyof typeof data] as number}
                onChange={(e) => update(field.key as keyof typeof data, Number(e.target.value) as never)}
                placeholder={field.placeholder}
                className={inputClass}
              />
            ) : (
              <input
                type="text"
                value={data[field.key as keyof typeof data] as string}
                onChange={(e) => update(field.key as keyof typeof data, e.target.value)}
                placeholder={field.placeholder}
                className={inputClass}
              />
            )}
          </Field>
        ))}
      </div>
    </Section>
  )
}
