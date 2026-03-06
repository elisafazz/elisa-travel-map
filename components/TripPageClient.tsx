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
    <div className="flex h-screen flex-col">
      <OfflineIndicator />
      {!fullscreen && (
        <header className="flex items-center gap-4 px-6 py-3 bg-white border-b border-gray-100 shadow-sm z-20">
          <Link href="/" className="text-gray-400 hover:text-gray-700 text-sm">← All trips</Link>
          <div className="flex-1">
            <h1 className="font-bold text-lg leading-tight">{trip.name}</h1>
            <p className="text-gray-400 text-xs">{trip.location}</p>
          </div>
          {unmappedCount > 0 && (
            <span className="text-xs text-orange-500">{unmappedCount} items not geocoded</span>
          )}
        </header>
      )}

      <TripView items={items} apiKey={apiKey} legLabel={legLabel} onFullscreenChange={setFullscreen} />
    </div>
  )
}
