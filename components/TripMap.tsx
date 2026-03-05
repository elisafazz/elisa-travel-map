'use client'

import { useEffect } from 'react'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps'
import type { TripItem, ItemType } from '@/lib/types'

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

function markerStyle(type: ItemType | null) {
  return TYPE_STYLES[type ?? 'default'] ?? TYPE_STYLES.default
}

function googleMapsUrl(item: TripItem): string {
  if (item.coordinates) {
    const query = encodeURIComponent(`${item.venue || item.name}, ${item.legCity}`)
    return `https://www.google.com/maps/search/?api=1&query=${query}&query_location=${item.coordinates.lat},${item.coordinates.lng}`
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.name} ${item.legCity}`)}`
}

// Inner component — has access to the map via useMap
function MapContent({
  items,
  selected,
  onSelect,
}: {
  items: TripItem[]
  selected: TripItem | null
  onSelect: (item: TripItem | null) => void
}) {
  const map = useMap()
  const mapped = items.filter(i => i.coordinates)

  // Pan to selected item when it changes (e.g. clicked from sidebar)
  useEffect(() => {
    if (selected?.coordinates && map) {
      map.panTo(selected.coordinates)
      map.setZoom(15)
    }
  }, [selected, map])

  return (
    <>
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

      {selected && selected.coordinates && (
        <InfoWindow
          position={selected.coordinates}
          onCloseClick={() => onSelect(null)}
          pixelOffset={[0, -20]}
        >
          <div style={{ maxWidth: 280, fontFamily: 'system-ui, sans-serif', padding: '2px 0' }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: '#111' }}>
              {selected.name}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
              {[selected.type, selected.legCity].filter(Boolean).join(' · ')}
            </div>

            {selected.priority && (
              <div style={{ fontSize: 12, marginBottom: 3 }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>Priority:</span>{' '}
                <span style={{ color: selected.priority === 'Must' ? '#ef4444' : selected.priority === 'High' ? '#f97316' : '#6b7280' }}>
                  {selected.priority}
                </span>
              </div>
            )}
            {selected.status && (
              <div style={{ fontSize: 12, marginBottom: 8 }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>Status:</span>{' '}
                {selected.status}
              </div>
            )}

            {selected.notes && (
              <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.5, marginBottom: 10, borderTop: '1px solid #f3f4f6', paddingTop: 8 }}>
                {selected.notes.length > 200 ? selected.notes.slice(0, 200) + '…' : selected.notes}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <a
                href={googleMapsUrl(selected)}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: 12,
                  color: '#fff',
                  background: '#4285F4',
                  padding: '4px 10px',
                  borderRadius: 6,
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Open in Maps
              </a>
              <a
                href={selected.url}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 12, color: '#6b7280', alignSelf: 'center' }}
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
}

export default function TripMap({ items, apiKey, selected, onSelect }: Props) {
  const mapped = items.filter(i => i.coordinates)

  const center = mapped.length > 0
    ? {
        lat: mapped.reduce((s, i) => s + i.coordinates!.lat, 0) / mapped.length,
        lng: mapped.reduce((s, i) => s + i.coordinates!.lng, 0) / mapped.length,
      }
    : { lat: 35.6762, lng: 139.6503 }

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
        <MapContent items={items} selected={selected} onSelect={onSelect} />
      </Map>
    </APIProvider>
  )
}
