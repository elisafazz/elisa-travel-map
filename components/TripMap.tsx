'use client'

import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps'
import { useState } from 'react'
import type { TripItem, ItemType } from '@/lib/types'

const TYPE_COLORS: Record<string, { bg: string; border: string; glyph: string }> = {
  Hotel:      { bg: '#3B82F6', border: '#1D4ED8', glyph: '🏨' },
  Restaurant: { bg: '#EF4444', border: '#B91C1C', glyph: '🍽️' },
  Activity:   { bg: '#10B981', border: '#047857', glyph: '⚡' },
  Flight:     { bg: '#8B5CF6', border: '#6D28D9', glyph: '✈️' },
  Train:      { bg: '#F59E0B', border: '#B45309', glyph: '🚅' },
  default:    { bg: '#6B7280', border: '#374151', glyph: '📍' },
}

function markerStyle(type: ItemType | null) {
  return TYPE_COLORS[type ?? 'default'] ?? TYPE_COLORS.default
}

interface Props {
  items: TripItem[]
  apiKey: string
}

export default function TripMap({ items, apiKey }: Props) {
  const [selected, setSelected] = useState<TripItem | null>(null)

  const mapped = items.filter(i => i.coordinates)

  // Compute center from items
  const center = mapped.length > 0
    ? {
        lat: mapped.reduce((s, i) => s + i.coordinates!.lat, 0) / mapped.length,
        lng: mapped.reduce((s, i) => s + i.coordinates!.lng, 0) / mapped.length,
      }
    : { lat: 35.6762, lng: 139.6503 } // fallback: Tokyo

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={center}
        defaultZoom={mapped.length === 1 ? 14 : 10}
        mapId="travel-map"
        style={{ width: '100%', height: '100%' }}
        gestureHandling="greedy"
      >
        {mapped.map(item => {
          const style = markerStyle(item.type)
          return (
            <AdvancedMarker
              key={item.id}
              position={item.coordinates!}
              onClick={() => setSelected(item)}
              title={item.name}
            >
              <div
                style={{
                  background: style.bg,
                  border: `2px solid ${style.border}`,
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
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
            onCloseClick={() => setSelected(null)}
          >
            <div style={{ maxWidth: 260, fontFamily: 'system-ui, sans-serif' }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                {selected.name}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
                {[selected.type, selected.legCity].filter(Boolean).join(' · ')}
              </div>
              {selected.priority && (
                <div style={{ fontSize: 12, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>Priority:</span> {selected.priority}
                </div>
              )}
              {selected.status && (
                <div style={{ fontSize: 12, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>Status:</span> {selected.status}
                </div>
              )}
              {selected.notes && (
                <div style={{ fontSize: 12, color: '#374151', marginTop: 6, lineHeight: 1.5 }}>
                  {selected.notes.length > 200
                    ? selected.notes.slice(0, 200) + '…'
                    : selected.notes}
                </div>
              )}
              <a
                href={selected.url}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'inline-block', marginTop: 8, fontSize: 12, color: '#3B82F6' }}
              >
                Open in Notion →
              </a>
            </div>
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  )
}
