'use client'

import { useState } from 'react'
import Link from 'next/link'
import TripView from './TripView'
import OfflineIndicator from './OfflineIndicator'
import type { Trip, TripItem } from '@/lib/types'

interface Props {
  trip: Trip
  items: TripItem[]
  apiKey: string
  mappedCount: number
  unmappedCount: number
  legLabel: string
}

export default function TripPageClient({ trip, items, apiKey, mappedCount, unmappedCount, legLabel }: Props) {
  const [fullscreen, setFullscreen] = useState(false)

  return (
    <div className="flex h-screen flex-col bg-gray-900">
      <OfflineIndicator />
      {!fullscreen && (
        <header className="flex items-center gap-4 px-6 py-3 bg-gray-900/90 backdrop-blur-xl border-b border-white/10 z-20" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))' }}>
          <Link href="/" className="text-white/50 hover:text-white text-sm transition-colors">← All trips</Link>
          <div className="flex-1">
            <h1 className="font-bold text-lg leading-tight text-white">{trip.name}</h1>
            <p className="text-white/40 text-xs">{trip.location}</p>
          </div>
          {unmappedCount > 0 && (
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" title={`${unmappedCount} items not geocoded`} />
          )}
        </header>
      )}

      <TripView items={items} apiKey={apiKey} legLabel={legLabel} onFullscreenChange={setFullscreen} />
    </div>
  )
}
