'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { mapsUrl, haversineKm, formatDistance } from '@/lib/geo'
import DayTimeline from './DayTimeline'
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

const TYPE_COLORS: Record<string, string> = {
  Hotel:        '#3B82F6',
  Restaurant:   '#EF4444',
  Activity:     '#10B981',
  Flight:       '#8B5CF6',
  Train:        '#F59E0B',
  Ferry:        '#06B6D4',
  'Car Rental': '#F97316',
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
  searchActive?: boolean
  dates?: string[]
  selectedDate?: string | null
  onSelectDate?: (date: string | null) => void
}

export default function BottomSheet({ items, selected, onSelect, userLocation, searchActive, dates, selectedDate, onSelectDate }: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [dragOffset, setDragOffset] = useState<number | null>(null)
  const dragRef = useRef<{ startY: number; startTime: number; wasOpen: boolean } | null>(null)
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selected) setOpen(true)
  }, [selected])

  useEffect(() => {
    if (searchActive) setOpen(true)
  }, [searchActive])

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

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Only allow drag from the handle area (first 52px) or when scrolled to top
    const touch = e.touches[0]
    dragRef.current = { startY: touch.clientY, startTime: Date.now(), wasOpen: open }
    setDragOffset(0)
  }, [open])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragRef.current) return
    const touch = e.touches[0]
    const dy = touch.clientY - dragRef.current.startY

    // If sheet is open and user is scrolling content up, don't drag
    const contentEl = sheetRef.current?.querySelector('[data-content]') as HTMLElement | null
    if (dragRef.current.wasOpen && contentEl && contentEl.scrollTop > 0 && dy < 0) {
      dragRef.current = null
      setDragOffset(null)
      return
    }

    // Only allow dragging down when open, or up when closed
    if (dragRef.current.wasOpen && dy < 0) {
      setDragOffset(0)
      return
    }
    if (!dragRef.current.wasOpen && dy > 0) {
      setDragOffset(0)
      return
    }

    e.preventDefault()
    setDragOffset(dy)
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!dragRef.current || dragOffset === null) {
      dragRef.current = null
      return
    }

    const elapsed = Date.now() - dragRef.current.startTime
    const velocity = Math.abs(dragOffset) / elapsed // px/ms

    // Fast swipe (velocity) or dragged far enough (> 80px)
    const shouldToggle = velocity > 0.3 || Math.abs(dragOffset) > 80

    if (shouldToggle) {
      if (dragRef.current.wasOpen) {
        // Was open, swiped down -> close
        if (showDetail) {
          onSelect(null)
        } else {
          setOpen(false)
        }
      } else {
        // Was closed, swiped up -> open
        setOpen(true)
      }
    }
    // else snap back to current state

    dragRef.current = null
    setDragOffset(null)
  }, [dragOffset, showDetail, onSelect])

  const distance = selected && userLocation && selected.coordinates
    ? formatDistance(haversineKm(userLocation.lat, userLocation.lng, selected.coordinates.lat, selected.coordinates.lng))
    : null

  // Calculate transform: base position + drag offset
  const baseTranslate = open ? 0 : 'calc(100% - 52px)'
  const isDragging = dragOffset !== null && dragOffset !== 0
  let transform: string
  if (isDragging) {
    if (open) {
      // Clamp: only allow dragging down (positive offset)
      const clamped = Math.max(0, dragOffset!)
      transform = `translateY(${clamped}px)`
    } else {
      // Clamp: only allow dragging up (negative offset)
      const clamped = Math.min(0, dragOffset!)
      transform = `translateY(calc(100% - 52px + ${clamped}px))`
    }
  } else {
    transform = `translateY(${baseTranslate})`
  }

  return (
    <div
      ref={sheetRef}
      className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-30 md:hidden"
      style={{
        maxHeight: '72vh',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
        transform,
        transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        touchAction: 'none',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Handle + header */}
      <button
        type="button"
        className="w-full flex items-center px-4 select-none bg-transparent border-0 outline-none"
        style={{ height: 52, touchAction: 'manipulation' }}
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
      </button>

      {/* Content */}
      <div data-content className="overflow-y-auto" style={{ maxHeight: 'calc(72vh - 52px)', touchAction: 'pan-y' }}>
        {!showDetail && dates && dates.length > 0 && onSelectDate && (
          <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
            <DayTimeline dates={dates} selectedDate={selectedDate ?? null} onSelectDate={onSelectDate} variant="light" />
          </div>
        )}
        {showDetail ? (
          <div className="pb-8">
            <div
              className="h-3 rounded-b-sm mb-4"
              style={{ background: TYPE_COLORS[selected!.type ?? ''] ?? '#6B7280' }}
            />
            <div className="px-4">
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
          </div>  {/* closes px-4 wrapper */}
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
                    className="w-full text-left px-3 mb-1.5"
                  >
                    <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 active:bg-gray-100 transition-colors">
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
