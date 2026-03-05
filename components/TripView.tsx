'use client'

import { useState } from 'react'
import TripMap from './TripMap'
import Sidebar from './Sidebar'
import Legend from './Legend'
import type { TripItem } from '@/lib/types'

interface Props {
  items: TripItem[]
  apiKey: string
}

export default function TripView({ items, apiKey }: Props) {
  const [selected, setSelected] = useState<TripItem | null>(null)

  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar items={items} selected={selected} onSelect={setSelected} />
      <div className="relative flex-1">
        <TripMap items={items} apiKey={apiKey} selected={selected} onSelect={setSelected} />
        <Legend />
      </div>
    </div>
  )
}
