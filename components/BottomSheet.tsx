'use client'

import { useState, useEffect } from 'react'
import { mapsUrl, haversineKm, formatDistance } from '@/lib/geo'
import type { TripItem } from '@/lib/types'
import type { UserLocation } from '@/lib/geo'

const TYPE_EMOJIS: Record<string, string> = {
  Hotel:        '🏨',
  Restaurant:   '🍽️',
  Activity:     '⚡',
  Flight:       '✈️',
  Train:        '🚅',
  Ferry:        '⛴️',
  'Car Rental': '🚗',
}

const PRIORITY_COLORS: Record<string, string> = {
  Must:     '#ef4444',
  High:     '#f97316',
  Optional: '#d1d5db',
}

const STATUS_COLORS: Record<string, string> = {
  Confirmed:   '#22c55e',
  Shortlisted: '#eab308',
  Researching: '#9ca3af',
  Cancelled:   '#ef4444',
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface Props {
  items: TripItem[]
  selected: TripItem | null
  onSelect: (item: TripItem | null) => void
  userLocation?: UserLocation | null
}

export default function BottomSheet({ items, selected, onSelect, userLocation }: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (selected) setOpen(true)
  }, [selected])

  useEffect(() => {
    setCopied(false)
  }, [selected?.id])

  const showDetail = open && !!selected

  async function handleCopy() {
    if (!selected) return
    const text = [selected.venue || selected.name, selected.legCity].filter(Boolean).join(', ')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleHeaderTap() {
    if (showDetail) {
      onSelect(null)
    } else {
      setOpen(o => !o)
    }
  }

  const distance = selected && userLocation && selected.coordinates
    ? formatDistance(haversineKm(userLocation.lat, userLocation.lng, selected.coordinates.lat, selected.coordinates.lng))
    : null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-30 md:hidden"
      style={{
        maxHeight: '72vh',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
        transform: open ? 'translateY(0)' : 'translateY(calc(100% - 52px))',
        transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
      }}
    >
      {/* Handle + header */}
      <div
        className="flex items-center px-4 cursor-pointer select-none"
        style={{ height: 52 }}
        onClick={handleHeaderTap}
      >
        <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-10 h-1 bg-gray-300 rounded-full" />
        <div className="flex-1 flex items-center gap-2 mt-1">
          {showDetail ? (
            <>
              <span className="text-base">{TYPE_EMOJIS[selected!.type ?? ''] ?? '📍'}</span>
              <span className="font-semibold text-sm text-gray-900 truncate">{selected!.name}</span>
              {distance && <span className="text-xs text-blue-400 flex-shrink-0">{distance}</span>}
            </>
          ) : (
            <span className="text-sm font-medium text-gray-500">
              {items.length} item{items.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <span className="text-gray-400 text-xs mt-1 ml-2">{open ? '↓' : '↑'}</span>
      </div>

      {/* Content */}
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(72vh - 52px)' }}>
        {showDetail ? (
          <div className="px-4 pb-8">
            {selected!.priority && (
              <div style={{
                height: 3, borderRadius: 2, width: 32, marginBottom: 12,
                background: PRIORITY_COLORS[selected!.priority] ?? '#d1d5db',
              }} />
            )}

            <div className="flex items-start gap-3 mb-1">
              <h2 className="flex-1 font-bold text-base text-gray-900 leading-tight">{selected!.name}</h2>
              <button
                onClick={handleCopy}
                className="flex-shrink-0 text-xs px-3 py-1 rounded-full border border-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <p className="text-xs text-gray-400">
                {[selected!.type, selected!.legCity].filter(Boolean).join(' · ')}
              </p>
              {distance && (
                <span className="text-xs font-semibold text-blue-500">{distance}</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {selected!.status && (
                <span
                  className="text-xs font-semibold px-2.5 py-0.5 rounded-full text-white"
                  style={{ background: STATUS_COLORS[selected!.status] ?? '#9ca3af' }}
                >
                  {selected!.status}
                </span>
              )}
              {selected!.priority && (
                <span
                  className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                  style={{
                    background: PRIORITY_COLORS[selected!.priority] ?? '#d1d5db',
                    color: selected!.priority === 'Optional' ? '#6b7280' : '#fff',
                  }}
                >
                  {selected!.priority}
                </span>
              )}
              {selected!.reservationRequired && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  Reservation required
                </span>
              )}
            </div>

            {selected!.date && (
              <p className="text-xs text-gray-400 mb-3">📅 {formatDate(selected!.date)}</p>
            )}

            {selected!.notes && (
              <p className="text-xs text-gray-600 leading-relaxed mb-5 border-t border-gray-100 pt-3">
                {selected!.notes}
              </p>
            )}

            <div className="flex gap-3">
              <a
                href={mapsUrl(selected!, userLocation)}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center text-sm font-semibold text-white bg-blue-500 rounded-xl py-3"
              >
                {userLocation ? 'Directions' : 'Open in Maps'}
              </a>
              <a
                href={selected!.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-gray-500 border border-gray-200 rounded-xl px-5 py-3"
              >
                Notion
              </a>
            </div>
          </div>
        ) : (
          <div className="pb-4">
            {items.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-10">No items match filters</p>
            ) : (
              items.map(item => {
                const dist = userLocation && item.coordinates
                  ? formatDistance(haversineKm(userLocation.lat, userLocation.lng, item.coordinates.lat, item.coordinates.lng))
                  : null
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className="w-full text-left px-4 py-3 border-b border-gray-50 flex items-center gap-3 active:bg-gray-50"
                  >
                    <span className="text-base flex-shrink-0">{TYPE_EMOJIS[item.type ?? ''] ?? '📍'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {item.legCity && <span className="text-xs text-gray-400 truncate">{item.legCity}</span>}
                        {item.date && <span className="text-xs text-gray-300 flex-shrink-0">{formatDate(item.date)}</span>}
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-1">
                      {dist && <span className="text-xs font-medium text-blue-400">{dist}</span>}
                      {item.status && (
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: STATUS_COLORS[item.status] ?? '#9ca3af' }}
                        />
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
