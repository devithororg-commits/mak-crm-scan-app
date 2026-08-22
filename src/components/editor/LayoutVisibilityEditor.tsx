import { Eye, EyeOff, Image, PanelBottom, QrCode, Stamp, Phone, Mail, Globe, MapPin } from 'lucide-react'
import { useCreative } from '../../store/CreativeContext'
import type { CreativeData } from '../../types/creative'

type ToggleKey = keyof Pick<
  CreativeData,
  | 'showFooter'
  | 'showCreativeImage'
  | 'showWatermark'
  | 'showQrCode'
  | 'headerShowLogo'
  | 'heroShowLogo'
  | 'avatarShowLogo'
  | 'footerShowLogo'
  | 'footerShowPhone'
  | 'footerShowEmail'
  | 'footerShowWebsite'
  | 'footerShowLocation'
>

interface ToggleItem {
  key: ToggleKey
  label: string
  icon: typeof Eye
  group: 'main' | 'logo' | 'footer'
}

const TOGGLES: ToggleItem[] = [
  { key: 'showFooter', label: 'Footer', icon: PanelBottom, group: 'main' },
  { key: 'showCreativeImage', label: 'Image', icon: Image, group: 'main' },
  { key: 'showWatermark', label: 'Watermark', icon: Stamp, group: 'main' },
  { key: 'showQrCode', label: 'QR Code', icon: QrCode, group: 'main' },
  { key: 'headerShowLogo', label: 'Header Logo', icon: Image, group: 'logo' },
  { key: 'heroShowLogo', label: 'Hero Logo', icon: Image, group: 'logo' },
  { key: 'avatarShowLogo', label: 'Avatar Logo', icon: Image, group: 'logo' },
  { key: 'footerShowLogo', label: 'Footer Logo', icon: Image, group: 'logo' },
  { key: 'footerShowPhone', label: 'Phone', icon: Phone, group: 'footer' },
  { key: 'footerShowEmail', label: 'Email', icon: Mail, group: 'footer' },
  { key: 'footerShowWebsite', label: 'Website', icon: Globe, group: 'footer' },
  { key: 'footerShowLocation', label: 'Location', icon: MapPin, group: 'footer' },
]

function ToggleButton({ item, active, onClick }: { item: ToggleItem; active: boolean; onClick: () => void }) {
  const Icon = item.icon
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition ${
        active
          ? 'border-indigo-400 bg-indigo-50 text-indigo-800'
          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
      }`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="flex-1 text-[10px] font-semibold">{item.label}</span>
      {active ? <Eye className="h-3 w-3 text-indigo-500" /> : <EyeOff className="h-3 w-3 text-slate-300" />}
    </button>
  )
}

function ToggleGroup({ title, items, data, update }: {
  title: string
  items: ToggleItem[]
  data: CreativeData
  update: (key: ToggleKey, value: boolean) => void
}) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <div className="grid grid-cols-2 gap-1.5">
        {items.map((item) => (
          <ToggleButton
            key={item.key}
            item={item}
            active={!!data[item.key]}
            onClick={() => update(item.key, !data[item.key])}
          />
        ))}
      </div>
    </div>
  )
}

export default function LayoutVisibilityEditor() {
  const { data, update } = useCreative()

  const showAll = () => {
    TOGGLES.forEach((t) => update(t.key, true))
  }
  const hideExtras = () => {
    update('showWatermark', false)
    update('showQrCode', false)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={showAll}
          className="flex-1 rounded-lg border border-slate-200 py-2 text-[10px] font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-700"
        >
          Show All
        </button>
        <button
          type="button"
          onClick={hideExtras}
          className="flex-1 rounded-lg border border-slate-200 py-2 text-[10px] font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-700"
        >
          Hide Extras
        </button>
      </div>

      <ToggleGroup title="Main Elements" items={TOGGLES.filter((t) => t.group === 'main')} data={data} update={update} />
      <ToggleGroup title="Logo Zones" items={TOGGLES.filter((t) => t.group === 'logo')} data={data} update={update} />
      <ToggleGroup title="Footer Details" items={TOGGLES.filter((t) => t.group === 'footer')} data={data} update={update} />
    </div>
  )
}
