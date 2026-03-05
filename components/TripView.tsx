'use client'

import { useState } from 'react'
import TripMap from './TripMap'
import Sidebar from './Sidebar'
import Legend from './Legend'
import BottomSheet from './BottomSheet'
import { haversineKm } from '@/lib/geo'
import type { TripItem, ItemStatus, ItemType } from '@/lib/types'
import type { UserLocation } from '@/lib/geo'

const STATUSES: { value: ItemStatus; label: string; color: string; active: string }[] = [
  { value: 'Confirmed',   label: 'Confirmed',   color: 'border-green-300 text-green-700',   active: 'bg-green-500 border-green-500 text-white' },
  { value: 'Shortlisted', label: 'Shortlisted', color: 'border-yellow-300 text-yellow-700', active: 'bg-yellow-400 border-yellow-400 text-white' },
  { value: 'Researching', label: 'Researching', color: 'border-gray-300 text-gray-600',     active: 'bg-gray-500 border-gray-500 text-white' },
  { value: 'Cancelled',   label: 'Cancelled',   color: 'border-red-300 text-red-500',       active: 'bg-red-500 border-red-500 text-white' },
]

type NearMeState = 'idle' | 'loading' | 'active' | 'error'

function getTodayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface Props {
  items: TripItem[]
  apiKey: string
  legLabel?: string
}

export default function TripView({ items, apiKey, legLabel = 'Leg' }: Props) {
  const [selected, setSelected] = useState<TripItem | null>(null)
  const [activeFilters, setActiveFilters] = useState<Set<ItemStatus>>(new Set())
  const [activeLegs, setActiveLegs] = useState<Set<string>>(new Set())
  const [activeTypes, setActiveTypes] = useState<Set<ItemType>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [todayOnly, setTodayOnly] = useState(false)
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [nearMeState, setNearMeState] = useState<NearMeState>('idle')

  const legs = Array.from(new Set(items.map(i => i.legCity).filter(Boolean))).sort()
  const today = getTodayStr()

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

  function requestNearMe() {
    if (nearMeState === 'active') {
      setUserLocation(null)
      setNearMeState('idle')
      return
    }
    setNearMeState('loading')
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setNearMeState('active')
      },
      () => setNearMeState('error'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const q = searchQuery.trim().toLowerCase()

  const filtered = items
    .filter(i => activeFilters.size === 0 || (i.status && activeFilters.has(i.status)))
    .filter(i => activeLegs.size === 0 || activeLegs.has(i.legCity))
    .filter(i => activeTypes.size === 0 || (i.type && activeTypes.has(i.type)))
    .filter(i => !todayOnly || i.date === today)
    .filter(i => !q || i.name.toLowerCase().includes(q) || i.venue.toLowerCase().includes(q))

  // Sort by distance when Near me is active; push unmapped items to bottom
  const displayItems = nearMeState === 'active' && userLocation
    ? [...filtered].sort((a, b) => {
        const da = a.coordinates ? haversineKm(userLocation.lat, userLocation.lng, a.coordinates.lat, a.coordinates.lng) : Infinity
        const db = b.coordinates ? haversineKm(userLocation.lat, userLocation.lng, b.coordinates.lat, b.coordinates.lng) : Infinity
        return da - db
      })
    : filtered

  const nearMeLabel =
    nearMeState === 'loading' ? '…' :
    nearMeState === 'active'  ? '📍 Near me' :
    nearMeState === 'error'   ? 'Location off' :
    '📍 Near me'

  return (
    <div className="flex flex-1 overflow-hidden flex-col">

      {/* Search bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-50">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span>
          <input
            type="search"
            placeholder="Search items…"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setSelected(null) }}
            className="w-full text-sm pl-8 pr-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 focus:outline-none focus:border-gray-400 focus:bg-white transition-colors"
          />
        </div>
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-xs text-gray-400 hover:text-gray-600">
            Clear
          </button>
        )}
      </div>

      {/* Filter bar — single scrollable row */}
      <div
        className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-100 overflow-x-auto flex-nowrap"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {/* Near me */}
        <button
          onClick={requestNearMe}
          disabled={nearMeState === 'loading'}
          className={`flex-shrink-0 text-xs font-medium px-3 py-1 rounded-full border transition-colors ${
            nearMeState === 'active'
              ? 'bg-blue-500 border-blue-500 text-white'
              : nearMeState === 'error'
              ? 'border-red-300 text-red-400 bg-white'
              : 'border-gray-300 text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50'
          }`}
        >
          {nearMeLabel}
        </button>

        {/* Today */}
        <button
          onClick={() => { setTodayOnly(t => !t); setSelected(null) }}
          className={`flex-shrink-0 text-xs font-medium px-3 py-1 rounded-full border transition-colors ${
            todayOnly
              ? 'bg-violet-500 border-violet-500 text-white'
              : 'border-gray-300 text-gray-500 bg-white hover:bg-gray-50'
          }`}
        >
          Today
        </button>

        <span className="flex-shrink-0 text-gray-200">|</span>

        <span className="flex-shrink-0 text-xs text-gray-400 font-medium">Status:</span>
        {STATUSES.map(s => {
          const isActive = activeFilters.has(s.value)
          return (
            <button
              key={s.value}
              onClick={() => toggleFilter(s.value)}
              className={`flex-shrink-0 text-xs font-medium px-3 py-1 rounded-full border transition-colors ${
                isActive ? s.active : s.color + ' bg-white hover:bg-gray-50'
              }`}
            >
              {s.label}
            </button>
          )
        })}
        {activeFilters.size > 0 && (
          <button
            onClick={() => { setActiveFilters(new Set()); setSelected(null) }}
            className="flex-shrink-0 text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Clear
          </button>
        )}

        {legs.length > 1 && (
          <>
            <span className="flex-shrink-0 text-gray-200 mx-1">|</span>
            <span className="flex-shrink-0 text-xs text-gray-400 font-medium">{legLabel}:</span>
            {legs.map(city => {
              const isActive = activeLegs.has(city)
              return (
                <button
                  key={city}
                  onClick={() => toggleLeg(city)}
                  className={`flex-shrink-0 text-xs font-medium px-3 py-1 rounded-full border transition-colors ${
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
                className="flex-shrink-0 text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Clear
              </button>
            )}
          </>
        )}

        <span className="flex-shrink-0 text-xs text-gray-300 pl-3">{displayItems.length} items</span>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          items={displayItems}
          selected={selected}
          onSelect={setSelected}
          userLocation={userLocation}
          className="hidden md:flex"
        />
        <div className="relative flex-1">
          <TripMap
            items={displayItems}
            apiKey={apiKey}
            selected={selected}
            onSelect={setSelected}
            userLocation={userLocation}
          />
          <Legend activeTypes={activeTypes} onToggle={toggleType} onClear={clearTypes} />
        </div>
      </div>

      <BottomSheet
        items={displayItems}
        selected={selected}
        onSelect={setSelected}
        userLocation={userLocation}
      />
    </div>
  )
}
