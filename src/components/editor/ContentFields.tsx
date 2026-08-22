import { useCreative } from '../../store/CreativeContext'
import { CATEGORY_FIELDS } from '../../data/config'
import type { CreativeData } from '../../types/creative'
import MediaEditor from './MediaEditor'
import { Field, Section, inputClass, textareaClass } from './FormUI'

export default function ContentFields() {
  const { data, update } = useCreative()
  const fields = CATEGORY_FIELDS[data.category]
  const groups = [...new Set(fields.map((f) => f.group ?? 'General'))]

  return (
    <>
      {groups.map((group) => (
        <Section key={group} title={group}>
          <div className="space-y-3">
            {fields
              .filter((f) => (f.group ?? 'General') === group)
              .map((field) => (
                <Field key={field.key} label={field.label}>
                  {field.multiline ? (
                    <textarea
                      rows={3}
                      value={data[field.key as keyof CreativeData] as string}
                      onChange={(e) => update(field.key as keyof CreativeData, e.target.value)}
                      placeholder={field.placeholder}
                      className={textareaClass}
                    />
                  ) : (
                    <input
                      type="text"
                      value={data[field.key as keyof CreativeData] as string}
                      onChange={(e) => update(field.key as keyof CreativeData, e.target.value)}
                      placeholder={field.placeholder}
                      className={inputClass}
                    />
                  )}
                </Field>
              ))}
          </div>
        </Section>
      ))}

      {data.templateId === 'testimonial' && (
        <Section title="Review Details">
          <div className="space-y-3">
            <Field label="Reviewer Name">
              <input type="text" value={data.reviewerName} onChange={(e) => update('reviewerName', e.target.value)} placeholder="Priya Reddy" className={inputClass} />
            </Field>
            <Field label="Reviewer Role">
              <input type="text" value={data.reviewerRole} onChange={(e) => update('reviewerRole', e.target.value)} placeholder="Home Buyer" className={inputClass} />
            </Field>
            <Field label="Star Rating">
              <input type="text" value={data.reviewRating} onChange={(e) => update('reviewRating', e.target.value)} placeholder="5.0" className={inputClass} />
            </Field>
            <Field label="Review Text">
              <textarea rows={4} value={data.reviewText} onChange={(e) => update('reviewText', e.target.value)} placeholder="Outstanding service..." className={textareaClass} />
            </Field>
          </div>
        </Section>
      )}

      <Section title="Tags & CTA">
        <div className="space-y-3">
          <Field label="Tags" hint="Comma separated">
            <input
              type="text"
              value={data.tags}
              onChange={(e) => update('tags', e.target.value)}
              placeholder="Growth, Hyderabad, Q4"
              className={inputClass}
            />
          </Field>
          <Field label="CTA Button Text">
            <input
              type="text"
              value={data.ctaText}
              onChange={(e) => update('ctaText', e.target.value)}
              placeholder="Learn More"
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      <MediaEditor />
    </>
  )
}
