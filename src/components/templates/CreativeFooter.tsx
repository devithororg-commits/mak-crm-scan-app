import type { CreativeData } from '../../types/creative'
import { FooterLogo } from './CreativeLogo'

function FooterText({ data, children, muted }: { data: CreativeData; children: React.ReactNode; muted?: boolean }) {
  const color = data.footerTextColor || undefined
  return (
    <span style={{ color, opacity: muted ? 0.55 : 1 }}>
      {children}
    </span>
  )
}

export default function CreativeFooter({ data }: { data: CreativeData }) {
  if (!data.showFooter) return null

  const fs = data.footerFontSize
  const pad = data.footerPadding
  const bgStyle = { backgroundColor: `rgba(0,0,0,${data.footerBgOpacity / 100})` }
  const borderStyle = data.footerBorderTop ? { borderTop: '1px solid rgba(128,128,128,0.15)' } : {}

  const Logo = () => <FooterLogo data={data} />

  const alignClass =
    data.footerAlign === 'center' ? 'justify-center text-center' :
    data.footerAlign === 'right' ? 'justify-end text-right' :
    data.footerAlign === 'left' ? 'justify-start text-left' :
    'justify-between'

  if (data.footerStyle === 'minimal') {
    return (
      <div className="mt-auto" style={{ ...bgStyle, ...borderStyle, padding: pad, fontSize: fs }}>
        <div className={`flex items-center gap-3 ${alignClass}`}>
          <FooterText data={data}>
            {data.footerLine1 && <span className="font-semibold">{data.footerLine1}</span>}
          </FooterText>
          {data.footerShowWebsite && data.footerLine2 && (
            <FooterText data={data} muted>
              <span>{data.footerLine2}</span>
            </FooterText>
          )}
        </div>
      </div>
    )
  }

  if (data.footerStyle === 'full') {
    return (
      <div className="mt-auto" style={{ ...bgStyle, ...borderStyle, padding: pad, fontSize: fs }}>
        <div className={`flex items-center gap-4 ${alignClass}`}>
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              {data.footerLine1 && <FooterText data={data}><p className="font-semibold">{data.footerLine1}</p></FooterText>}
              {data.footerShowLocation && data.footerLine3 && <FooterText data={data} muted><p>{data.footerLine3}</p></FooterText>}
              {data.footerLine4 && <FooterText data={data} muted><p className="mt-0.5">{data.footerLine4}</p></FooterText>}
            </div>
          </div>
          {data.footerAlign === 'split' && (
            <div className="text-right">
              {data.footerShowPhone && data.footerPhone && <FooterText data={data} muted><p>{data.footerPhone}</p></FooterText>}
              {data.footerShowEmail && data.footerEmail && <FooterText data={data} muted><p>{data.footerEmail}</p></FooterText>}
              {data.footerShowWebsite && data.footerWebsite && <FooterText data={data} muted><p>{data.footerWebsite}</p></FooterText>}
            </div>
          )}
        </div>
      </div>
    )
  }

  // branded (default)
  return (
    <div className="mt-auto backdrop-blur-sm" style={{ ...bgStyle, ...borderStyle, padding: pad, fontSize: fs }}>
      <div className={`flex items-center gap-3 ${alignClass}`}>
        <div className="flex items-center gap-2.5">
          <Logo />
          <div>
            {data.footerLine1 && <FooterText data={data}><p className="font-semibold">{data.footerLine1}</p></FooterText>}
            {data.footerShowLocation && data.footerLine3 && <FooterText data={data} muted><p>{data.footerLine3}</p></FooterText>}
          </div>
        </div>
        {data.footerAlign === 'split' && (
          <div className="text-right">
            {data.footerShowWebsite && data.footerWebsite && <FooterText data={data} muted><p>{data.footerWebsite}</p></FooterText>}
            {data.footerShowPhone && data.footerPhone && <FooterText data={data} muted><p>{data.footerPhone}</p></FooterText>}
            {data.footerShowEmail && data.footerEmail && <FooterText data={data} muted><p>{data.footerEmail}</p></FooterText>}
          </div>
        )}
      </div>
    </div>
  )
}

export function Watermark({ data }: { data: CreativeData }) {
  if (!data.showWatermark) return null
  return (
    <div
      className="pointer-events-none absolute right-6 font-medium uppercase tracking-widest opacity-20"
      style={{ bottom: data.showFooter ? data.footerPadding + 60 : 24, fontSize: data.labelFontSize }}
    >
      {data.watermarkText}
    </div>
  )
}
