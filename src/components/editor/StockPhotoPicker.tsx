import { useEffect, useState } from 'react'

import { Search, Loader2 } from 'lucide-react'

import { urlToDataUrl } from '../../utils/imageEmbed'
import { getStockCategories, searchUnsplash } from '../../utils/unsplash'
import { AppIcon } from '../icons'

import { inputClass } from './FormUI'



export default function StockPhotoPicker({ onSelect }: { onSelect: (url: string) => void }) {

  const [query, setQuery] = useState('')

  const [loading, setLoading] = useState(false)

  const [selecting, setSelecting] = useState('')

  const [photos, setPhotos] = useState<Awaited<ReturnType<typeof searchUnsplash>>>([])



  const search = async (q: string) => {

    setLoading(true)

    try {

      const results = await searchUnsplash(q || 'modern home interior')

      setPhotos(results)

    } finally {

      setLoading(false)

    }

  }



  useEffect(() => {

    search('home')

  }, [])



  const handleSelect = async (url: string, id: string) => {

    setSelecting(id)

    try {

      const dataUrl = await urlToDataUrl(url)

      onSelect(dataUrl)

    } catch {

      onSelect(url)

    } finally {

      setSelecting('')

    }

  }



  return (

    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

      <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">

        Stock Photos (Free HD)

      </p>



      <div className="mb-3 flex flex-wrap gap-1.5">

        {getStockCategories().map((cat) => (

          <button

            key={cat.id}

            type="button"

            onClick={() => { setQuery(cat.id); search(cat.id) }}

            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"

          >

            <AppIcon name={cat.icon} size={12} />

            {cat.label}

          </button>

        ))}

      </div>



      <div className="mb-3 flex gap-2">

        <input

          type="text"

          value={query}

          onChange={(e) => setQuery(e.target.value)}

          onKeyDown={(e) => e.key === 'Enter' && search(query)}

          placeholder="Search: luxury home, villa, skyline..."

          className={inputClass}

        />

        <button

          type="button"

          onClick={() => search(query)}

          disabled={loading}

          className="flex shrink-0 items-center gap-1 rounded-lg bg-indigo-600 px-3 text-[10px] text-white disabled:opacity-50"

        >

          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}

        </button>

      </div>



      {photos.length > 0 && (

        <div className="grid grid-cols-3 gap-1.5">

          {photos.map((p) => (

            <button

              key={p.id}

              type="button"

              onClick={() => handleSelect(p.url, p.id)}

              disabled={!!selecting}

              className="group relative aspect-video overflow-hidden rounded-lg border border-slate-200 hover:border-indigo-500 disabled:opacity-60"

            >

              <img src={p.thumb} alt={p.alt} className="h-full w-full object-cover transition group-hover:scale-105" crossOrigin="anonymous" />

              {selecting === p.id && (

                <div className="absolute inset-0 flex items-center justify-center bg-white/70">

                  <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />

                </div>

              )}

              <div className="absolute inset-0 bg-indigo-600/0 transition group-hover:bg-indigo-600/20" />

            </button>

          ))}

        </div>

      )}



      <p className="mt-2 text-[9px] text-slate-500">High-quality photos · Click to use as main image</p>

    </div>

  )

}

