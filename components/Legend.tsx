'use client'

const LEGEND = [
  { label: 'Hotel',      color: '#3B82F6', glyph: '🏨' },
  { label: 'Restaurant', color: '#EF4444', glyph: '🍽️' },
  { label: 'Activity',   color: '#10B981', glyph: '⚡' },
  { label: 'Flight',     color: '#8B5CF6', glyph: '✈️' },
  { label: 'Train',      color: '#F59E0B', glyph: '🚅' },
]

export default function Legend() {
  return (
    <div className="absolute bottom-8 left-4 bg-white rounded-xl shadow-lg px-4 py-3 flex flex-col gap-2 z-10">
      {LEGEND.map(({ label, color, glyph }) => (
        <div key={label} className="flex items-center gap-2 text-sm">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
            style={{ background: color }}
          >
            {glyph}
          </div>
          <span className="text-gray-700 font-medium">{label}</span>
        </div>
      ))}
    </div>
  )
}
