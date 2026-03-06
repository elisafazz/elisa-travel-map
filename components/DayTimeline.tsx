'use client'

import { useRef, useEffect } from 'react'

function formatChip(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getTodayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface Props {
  dates: string[]
  selectedDate: string | null
  onSelectDate: (date: string | null) => void
  className?: string
  variant?: 'dark' | 'light'
}

export default function DayTimeline({ dates, selectedDate, onSelectDate, className = '', variant = 'dark' }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const todayRef = useRef<HTMLButtonElement>(null)
  const today = getTodayStr()

  useEffect(() => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
    }
  }, [])

  if (dates.length === 0) return null

  return (
    <div
      ref={scrollRef}
      className={`flex items-center gap-1.5 px-3 py-2 overflow-x-auto ${className}`}
      style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
    >
      {dates.map(date => {
        const isToday = date === today
        const isSelected = date === selectedDate
        return (
          <button
            key={date}
            ref={isToday ? todayRef : undefined}
            onClick={() => onSelectDate(isSelected ? null : date)}
            className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors relative ${
              variant === 'light'
                ? isSelected
                  ? 'bg-gray-900 border-gray-900 text-white'
                  : isToday
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                : isSelected
                ? 'bg-white text-gray-900 border-white'
                : isToday
                ? 'bg-blue-500/20 border-blue-400/40 text-blue-300'
                : 'bg-white/10 border-white/15 text-white/60 hover:bg-white/15'
            }`}
          >
            {formatChip(date)}
            {isToday && !isSelected && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            )}
          </button>
        )
      })}
    </div>
  )
}
