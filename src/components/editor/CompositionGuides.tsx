import type { AspectRatio } from '../../types/creative'

interface Props {
  aspectRatio: AspectRatio
  showSafeZone: boolean
  showThirds: boolean
  showGolden: boolean
}

export default function CompositionGuides({ aspectRatio, showSafeZone, showThirds, showGolden }: Props) {
  if (!showSafeZone && !showThirds && !showGolden) return null

  const isStory = aspectRatio === '9:16'

  return (
    <>
      {showThirds && (
        <div className="pointer-events-none absolute inset-0 z-20">
          {[33.33, 66.66].map((pct) => (
            <div key={`v-${pct}`}>
              <div
                className="absolute top-0 bottom-0 w-px bg-cyan-400/50"
                style={{ left: `${pct}%` }}
              />
              <div
                className="absolute left-0 right-0 h-px bg-cyan-400/50"
                style={{ top: `${pct}%` }}
              />
            </div>
          ))}
          <div className="absolute left-2 top-2 rounded bg-cyan-600/80 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
            Rule of 3rds
          </div>
        </div>
      )}

      {showGolden && (
        <div className="pointer-events-none absolute inset-0 z-20">
          {[38.2, 61.8].map((pct) => (
            <div key={`g-${pct}`}>
              <div
                className="absolute top-0 bottom-0 w-px bg-rose-400/55"
                style={{ left: `${pct}%` }}
              />
              <div
                className="absolute left-0 right-0 h-px bg-rose-400/55"
                style={{ top: `${pct}%` }}
              />
            </div>
          ))}
          <div className="absolute right-2 top-2 rounded bg-rose-600/80 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
            Golden φ
          </div>
        </div>
      )}

      {showSafeZone && (
        <>
          <div
            className="pointer-events-none absolute inset-0 z-20 rounded-[20px] border-2 border-dashed border-amber-400/70"
            style={{ margin: '10%' }}
          />
          <div className="pointer-events-none absolute left-[12%] top-[11%] z-20 rounded bg-amber-500/85 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
            Safe zone 10%
          </div>
          {isStory && (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-20 border-t-2 border-dashed border-red-400/60 bg-red-500/5"
              style={{ height: '20%' }}
            >
              <div className="absolute left-1/2 top-2 -translate-x-1/2 rounded bg-red-500/85 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
                Story UI zone — avoid text here
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}
