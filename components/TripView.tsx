'use client'

import { useState } from 'react'
import TripMap from './TripMap'
import Sidebar from './Sidebar'
import Legend from './Legend'
import type { TripItem, ItemStatus } from '@/lib/types'

const STATUSES: { value: ItemStatus; label: string; color: string; active: string }[] = [
  { value: 'Confirmed',   label: 'Confirmed',   color: 'border-green-300 text-green-700',  active: 'bg-green-500 border-green-500 text-white' },
  { value: 'Shortlisted', label: 'Shortlisted', color: 'border-yellow-300 text-yellow-700', active: 'bg-yellow-400 border-yellow-400 text-white' },
  { value: 'Researching', label: 'Researching', color: 'border-gray-300 text-gray-600',    active: 'bg-gray-500 border-gray-500 text-white' },
  { value: 'Cancelled',   label: 'Cancelled',   color: 'border-red-300 text-red-500',      active: 'bg-red-500 border-red-500 text-white' },
]

interface Props {
  items: TripItem[]
  apiKey: string
}

export default function TripView({ items, apiKey }: Props) {
  const [selected, setSelected] = useState<TripItem | null>(null)
  const [activeFilters, setActiveFilters] = useState<Set<ItemStatus>>(new Set())

  function toggleFilter(status: ItemStatus) {
    setActiveFilters(prev => {
      const next = new Set(prev)
      if (next.has(status)) next.delete(status)
      else next.add(status)
      return next
    })
    // Deselect if selected item no longer matches filter
    setSelected(null)
  }

  const filtered = activeFilters.size === 0
    ? items
    : items.filter(i => i.status && activeFilters.has(i.status))

  return (
    <div className="flex flex-1 overflow-hidden flex-col">
      {/* Filter bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-100">
        <span className="text-xs text-gray-400 font-medium mr-1">Filter:</span>
        {STATUSES.map(s => {
          const isActive = activeFilters.has(s.value)
          return (
            <button
              key={s.value}
              onClick={() => toggleFilter(s.value)}
              className={`text-xs font-medium px-3 py-1 rounded-full border transition-colors ${isActive ? s.active : s.color + ' bg-white hover:bg-gray-50'}`}
            >
              {s.label}
            </button>
          )
        })}
        {activeFilters.size > 0 && (
          <button
            onClick={() => { setActiveFilters(new Set()); setSelected(null) }}
            className="text-xs text-gray-400 hover:text-gray-600 ml-1 underline"
          >
            Clear
          </button>
        )}
        <span className="ml-auto text-xs text-gray-400">{filtered.length} items</span>
      </div>

      {/* Sidebar + map */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar items={filtered} selected={selected} onSelect={setSelected} />
        <div className="relative flex-1">
          <TripMap items={filtered} apiKey={apiKey} selected={selected} onSelect={setSelected} />
          <Legend />
        </div>
      </div>
    </div>
  )
}
