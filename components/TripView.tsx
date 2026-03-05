'use client'

import { useState } from 'react'
import TripMap from './TripMap'
import Sidebar from './Sidebar'
import Legend from './Legend'
import type { TripItem, ItemStatus, ItemType } from '@/lib/types'

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
  const [activeLegs, setActiveLegs] = useState<Set<string>>(new Set())
  const [activeTypes, setActiveTypes] = useState<Set<ItemType>>(new Set())

  const legs = Array.from(new Set(items.map(i => i.legCity).filter(Boolean))).sort()

  function toggleFilter(status: ItemStatus) {
    setActiveFilters(prev => {
      const next = new Set(prev)
      if (next.has(status)) next.delete(status)
      else next.add(status)
      return next
    })
    setSelected(null)
  }

  function toggleLeg(city: string) {
    setActiveLegs(prev => {
      const next = new Set(prev)
      if (next.has(city)) next.delete(city)
      else next.add(city)
      return next
    })
    setSelected(null)
  }

  function toggleType(type: ItemType) {
    setActiveTypes(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
    setSelected(null)
  }

  function clearTypes() {
    setActiveTypes(new Set())
    setSelected(null)
  }

  const filtered = items
    .filter(i => activeFilters.size === 0 || (i.status && activeFilters.has(i.status)))
    .filter(i => activeLegs.size === 0 || activeLegs.has(i.legCity))
    .filter(i => activeTypes.size === 0 || (i.type && activeTypes.has(i.type)))

  return (
    <div className="flex flex-1 overflow-hidden flex-col">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-2 bg-white border-b border-gray-100">
        <span className="text-xs text-gray-400 font-medium mr-1">Status:</span>
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

        {legs.length > 1 && (
          <>
            <span className="text-gray-200 mx-1">|</span>
            <span className="text-xs text-gray-400 font-medium">Leg:</span>
            {legs.map(city => {
              const isActive = activeLegs.has(city)
              return (
                <button
                  key={city}
                  onClick={() => toggleLeg(city)}
                  className={`text-xs font-medium px-3 py-1 rounded-full border transition-colors ${
                    isActive
                      ? 'bg-indigo-500 border-indigo-500 text-white'
                      : 'border-indigo-200 text-indigo-600 bg-white hover:bg-indigo-50'
                  }`}
                >
                  {city}
                </button>
              )
            })}
            {activeLegs.size > 0 && (
              <button
                onClick={() => { setActiveLegs(new Set()); setSelected(null) }}
                className="text-xs text-gray-400 hover:text-gray-600 ml-1 underline"
              >
                Clear
              </button>
            )}
          </>
        )}

        <span className="ml-auto text-xs text-gray-400">{filtered.length} items</span>
      </div>

      {/* Sidebar + map */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar items={filtered} selected={selected} onSelect={setSelected} />
        <div className="relative flex-1">
          <TripMap items={filtered} apiKey={apiKey} selected={selected} onSelect={setSelected} />
          <Legend activeTypes={activeTypes} onToggle={toggleType} onClear={clearTypes} />
        </div>
      </div>
    </div>
  )
}
