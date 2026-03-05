'use client'

import { useEffect, useState } from 'react'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps'
import { mapsUrl, haversineKm, formatDistance } from '@/lib/geo'
import type { TripItem, ItemType } from '@/lib/types'
import type { UserLocation } from '@/lib/geo'

const TYPE_STYLES: Record<string, { bg: string; border: string; glyph: string }> = {
  Hotel:        { bg: '#3B82F6', border: '#1D4ED8', glyph: '🏨' },
  Restaurant:   { bg: '#EF4444', border: '#B91C1C', glyph: '🍽️' },
  Activity:     { bg: '#10B981', border: '#047857', glyph: '⚡' },
  Flight:       { bg: '#8B5CF6', border: '#6D28D9', glyph: '✈️' },
  Train:        { bg: '#F59E0B', border: '#B45309', glyph: '🚅' },
  Ferry:        { bg: '#06B6D4', border: '#0E7490', glyph: '⛴️' },
  'Car Rental': { bg: '#F97316', border: '#C2410C', glyph: '🚗' },
  default:      { bg: '#6B7280', border: '#374151', glyph: '📍' },
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

function markerStyle(type: ItemType | null) {
  return TYPE_STYLES[type ?? 'default'] ?? TYPE_STYLES.default
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      style={{
        fontSize: 11, color: copied ? '#22c55e' : '#9ca3af',
        cursor: 'pointer', background: 'none',
        border: '1px solid #e5e7eb', borderRadius: 4,
        padding: '2px 8px', flexShrink: 0, fontWeight: 500,
      }}
    >
      {copied ? '✓' : 'Copy'}
    </button>
  )
}

function MapContent({
  items,
  selected,
  onSelect,
  userLocation,
}: {
  items: TripItem[]
  selected: TripItem | null
  onSelect: (item: TripItem | null) => void
  userLocation: UserLocation | null
}) {
  const map = useMap()
  const mapped = items.filter(i => i.coordinates)

  // Fit map to all pins on initial load
  useEffect(() => {
    if (!map || mapped.length === 0) return
    if (mapped.length === 1) {
      map.panTo(mapped[0].coordinates!)
      map.setZoom(14)
      return
    }
    const lats = mapped.map(i => i.coordinates!.lat)
    const lngs = mapped.map(i => i.coordinates!.lng)
    map.fitBounds(
      { north: Math.max(...lats), south: Math.min(...lats), east: Math.max(...lngs), west: Math.min(...lngs) },
      60
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])

  // Pan to selected item
  useEffect(() => {
    if (selected?.coordinates && map) {
      map.panTo(selected.coordinates)
      map.setZoom(15)
    }
  }, [selected, map])

  return (
    <>
      {/* Item markers */}
      {mapped.map(item => {
        const style = markerStyle(item.type)
        const isSelected = selected?.id === item.id
        return (
          <AdvancedMarker
            key={item.id}
            position={item.coordinates!}
            onClick={() => onSelect(item)}
            title={item.name}
            zIndex={isSelected ? 100 : 1}
          >
            <div
              style={{
                background: style.bg,
                border: `2px solid ${isSelected ? '#fff' : style.border}`,
                borderRadius: '50%',
                width: isSelected ? 38 : 32,
                height: isSelected ? 38 : 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isSelected ? 17 : 14,
                cursor: 'pointer',
                boxShadow: isSelected
                  ? '0 0 0 3px rgba(59,130,246,0.5), 0 2px 8px rgba(0,0,0,0.4)'
                  : '0 2px 6px rgba(0,0,0,0.3)',
                transition: 'all 0.15s ease',
              }}
            >
              {style.glyph}
            </div>
          </AdvancedMarker>
        )
      })}

      {/* User location dot */}
      {userLocation && (
        <AdvancedMarker position={userLocation} zIndex={200} title="You are here">
          <div style={{
            width: 16, height: 16, borderRadius: '50%',
            background: '#3B82F6', border: '3px solid #fff',
            boxShadow: '0 0 0 4px rgba(59,130,246,0.25), 0 2px 6px rgba(0,0,0,0.3)',
          }} />
        </AdvancedMarker>
      )}

      {/* InfoWindow */}
      {selected && selected.coordinates && (
        <InfoWindow
          position={selected.coordinates}
          onCloseClick={() => onSelect(null)}
          pixelOffset={[0, -20]}
        >
          <div style={{ maxWidth: 290, fontFamily: 'system-ui, sans-serif', padding: '2px 0' }}>
            {selected.priority && (
              <div style={{
                height: 3, borderRadius: 2, width: 36, marginBottom: 10,
                background: PRIORITY_COLORS[selected.priority] ?? '#d1d5db',
              }} />
            )}

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#111', flex: 1, lineHeight: 1.3 }}>
                {selected.name}
              </div>
              <CopyButton text={[selected.venue || selected.name, selected.legCity].filter(Boolean).join(', ')} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>
                {[selected.type, selected.legCity].filter(Boolean).join(' · ')}
              </span>
              {userLocation && selected.coordinates && (
                <span style={{ fontSize: 11, fontWeight: 600, color: '#3b82f6' }}>
                  · {formatDistance(haversineKm(userLocation.lat, userLocation.lng, selected.coordinates.lat, selected.coordinates.lng))}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
              {selected.status && (
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '2px 8px',
                  borderRadius: 12, background: STATUS_COLORS[selected.status] ?? '#9ca3af', color: '#fff',
                }}>
                  {selected.status}
                </span>
              )}
              {selected.priority && (
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 12,
                  background: PRIORITY_COLORS[selected.priority] ?? '#d1d5db',
                  color: selected.priority === 'Optional' ? '#6b7280' : '#fff',
                }}>
                  {selected.priority}
                </span>
              )}
              {selected.reservationRequired && (
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '2px 8px',
                  borderRadius: 12, background: '#fef3c7', color: '#92400e',
                }}>
                  Reservation required
                </span>
              )}
            </div>

            {selected.date && (
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>
                📅 {selected.date}
              </div>
            )}

            {selected.notes && (
              <div style={{
                fontSize: 12, color: '#374151', lineHeight: 1.5,
                marginBottom: 10, borderTop: '1px solid #f3f4f6', paddingTop: 8,
              }}>
                {selected.notes.length > 220 ? selected.notes.slice(0, 220) + '…' : selected.notes}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <a
                href={mapsUrl(selected, userLocation)}
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1, textAlign: 'center', fontSize: 12, color: '#fff',
                  background: '#4285F4', padding: '5px 10px', borderRadius: 6,
                  textDecoration: 'none', fontWeight: 600,
                }}
              >
                {userLocation ? 'Directions' : 'Open in Maps'}
              </a>
              <a
                href={selected.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: 12, color: '#6b7280', alignSelf: 'center',
                  padding: '5px 8px', border: '1px solid #e5e7eb',
                  borderRadius: 6, textDecoration: 'none',
                }}
              >
                Notion →
              </a>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  )
}

interface Props {
  items: TripItem[]
  apiKey: string
  selected: TripItem | null
  onSelect: (item: TripItem | null) => void
  userLocation: UserLocation | null
}

export default function TripMap({ items, apiKey, selected, onSelect, userLocation }: Props) {
  const mapped = items.filter(i => i.coordinates)

  const center = userLocation ?? (mapped.length > 0
    ? {
        lat: mapped.reduce((s, i) => s + i.coordinates!.lat, 0) / mapped.length,
        lng: mapped.reduce((s, i) => s + i.coordinates!.lng, 0) / mapped.length,
      }
    : { lat: 35.6762, lng: 139.6503 })

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={center}
        defaultZoom={mapped.length === 1 ? 14 : 10}
        mapId="travel-map"
        style={{ width: '100%', height: '100%' }}
        gestureHandling="greedy"
        onClick={() => onSelect(null)}
      >
        <MapContent items={items} selected={selected} onSelect={onSelect} userLocation={userLocation} />
      </Map>
    </APIProvider>
  )
}
