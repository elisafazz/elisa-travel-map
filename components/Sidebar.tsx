'use client'

import type { TripItem, ItemType } from '@/lib/types'

const TYPE_ORDER: ItemType[] = ['Hotel', 'Restaurant', 'Activity', 'Flight', 'Train', 'Ferry', 'Car Rental', 'Other']

const TYPE_META: Record<string, { emoji: string; color: string }> = {
  Hotel:      { emoji: '🏨', color: '#3B82F6' },
  Restaurant: { emoji: '🍽️', color: '#EF4444' },
  Activity:   { emoji: '⚡', color: '#10B981' },
  Flight:     { emoji: '✈️', color: '#8B5CF6' },
  Train:      { emoji: '🚅', color: '#F59E0B' },
  Ferry:      { emoji: '⛴️', color: '#06B6D4' },
  'Car Rental': { emoji: '🚗', color: '#F97316' },
  Other:      { emoji: '📍', color: '#6B7280' },
}

const PRIORITY_DOT: Record<string, string> = {
  Must:     'bg-red-500',
  High:     'bg-orange-400',
  Optional: 'bg-gray-300',
}

const STATUS_BORDER: Record<string, string> = {
  Confirmed:   'border-l-green-400',
  Shortlisted: 'border-l-yellow-400',
  Researching: 'border-l-gray-200',
  Cancelled:   'border-l-red-400',
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface Props {
  items: TripItem[]
  selected: TripItem | null
  onSelect: (item: TripItem) => void
  className?: string
}

export default function Sidebar({ items, selected, onSelect, className = '' }: Props) {
  const grouped = TYPE_ORDER.map(type => ({
    type,
    items: items.filter(i => i.type === type),
  })).filter(g => g.items.length > 0)

  const typeless = items.filter(i => !i.type)
  if (typeless.length > 0) grouped.push({ type: 'Other' as ItemType, items: typeless })

  return (
    <aside className={`w-72 flex-shrink-0 bg-white border-r border-gray-100 overflow-y-auto flex-col ${className}`}>
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
          {items.length} items · {items.filter(i => i.coordinates).length} mapped
        </p>
      </div>

      <div className="flex-1">
        {grouped.map(({ type, items: groupItems }) => {
          const meta = TYPE_META[type] ?? TYPE_META.Other
          return (
            <div key={type}>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 sticky top-0 z-10">
                <span className="text-sm">{meta.emoji}</span>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{type}s</span>
                <span className="ml-auto text-xs text-gray-400">{groupItems.length}</span>
              </div>

              {groupItems.map(item => {
                const isSelected = selected?.id === item.id
                const hasCords = !!item.coordinates
                const borderClass = STATUS_BORDER[item.status ?? ''] ?? 'border-l-gray-100'
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 border-l-2 transition-colors flex items-start gap-3 ${borderClass} ${
                      isSelected ? 'bg-blue-50' : hasCords ? 'hover:bg-gray-50' : 'opacity-50 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[item.priority ?? ''] ?? 'bg-gray-300'}`} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                        {item.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {item.legCity && (
                          <span className="text-xs text-gray-400 truncate">{item.legCity}</span>
                        )}
                        {item.date && (
                          <span className="text-xs text-gray-300 flex-shrink-0">{formatDate(item.date)}</span>
                        )}
                      </div>
                      {!hasCords && (
                        <div className="text-xs text-orange-400 mt-0.5">Not geocoded</div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
