'use client'

import type { ItemType } from '@/lib/types'

const LEGEND: { label: ItemType; color: string; glyph: string }[] = [
  { label: 'Hotel',      color: '#3B82F6', glyph: '🏨' },
  { label: 'Restaurant', color: '#EF4444', glyph: '🍽️' },
  { label: 'Activity',   color: '#10B981', glyph: '⚡' },
  { label: 'Flight',     color: '#8B5CF6', glyph: '✈️' },
  { label: 'Train',      color: '#F59E0B', glyph: '🚅' },
  { label: 'Ferry',      color: '#06B6D4', glyph: '⛴️' },
  { label: 'Car Rental', color: '#F97316', glyph: '🚗' },
]

interface Props {
  activeTypes: Set<ItemType>
  onToggle: (type: ItemType) => void
  onClear: () => void
}

export default function Legend({ activeTypes, onToggle, onClear }: Props) {
  const anyActive = activeTypes.size > 0
  return (
    <div className="absolute bottom-20 md:bottom-8 left-4 bg-white rounded-xl shadow-lg px-4 py-3 flex flex-col gap-1.5 z-10">
      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Filter type</p>
      {LEGEND.map(({ label, color, glyph }) => {
        const isActive = activeTypes.has(label)
        const dimmed = anyActive && !isActive
        return (
          <button
            key={label}
            onClick={() => onToggle(label)}
            className={`flex items-center gap-2 text-sm rounded-lg px-1 py-0.5 transition-opacity ${dimmed ? 'opacity-30' : 'opacity-100'}`}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0"
              style={{
                background: color,
                outline: isActive ? `2px solid ${color}` : 'none',
                outlineOffset: 2,
              }}
            >
              {glyph}
            </div>
            <span className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>{label}</span>
          </button>
        )
      })}
      {anyActive && (
        <button
          onClick={onClear}
          className="text-[10px] text-gray-400 hover:text-gray-600 underline mt-1 text-left"
        >
          Clear
        </button>
      )}
    </div>
  )
}
