import { fetchAllTrips } from '@/lib/notion'
import Link from 'next/link'
import type { Trip } from '@/lib/types'

const GRADIENTS = [
  'from-blue-900 via-blue-700 to-cyan-500',
  'from-violet-900 via-purple-700 to-pink-500',
  'from-emerald-900 via-teal-700 to-green-400',
  'from-orange-900 via-rose-700 to-orange-400',
  'from-slate-900 via-indigo-800 to-blue-500',
  'from-amber-900 via-orange-700 to-yellow-400',
]

const STATUS_BADGE: Record<string, string> = {
  Planning:      'bg-white/15 text-white border border-white/20',
  Booked:        'bg-blue-400/20 text-blue-100 border border-blue-300/20',
  'In Progress': 'bg-green-400/20 text-green-100 border border-green-300/20',
  Completed:     'bg-white/10 text-white/50 border border-white/15',
}

function formatDateRange(dep: string | null, ret: string | null) {
  const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  if (dep && ret && dep !== ret) return `${fmt(dep)} - ${fmt(ret)}`
  if (dep) return fmt(dep)
  return null
}

export default async function Home() {
  const trips = await fetchAllTrips()

  const ORDER: Record<string, number> = { 'In Progress': 0, Planning: 1, Booked: 2, Completed: 3 }
  const sorted = [...trips].sort((a, b) => (ORDER[a.status ?? ''] ?? 9) - (ORDER[b.status ?? ''] ?? 9))

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="px-8 pt-12 pb-8">
        <h1 className="text-4xl font-bold text-white tracking-tight">Trip Maps</h1>
        <p className="text-white/40 mt-1 text-sm">{trips.length} trip{trips.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="px-8 pb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sorted.map((trip: Trip, i: number) => {
          const gradient = GRADIENTS[i % GRADIENTS.length]
          const dateRange = formatDateRange(trip.departureDate, trip.returnDate)
          const isCompleted = trip.status === 'Completed'
          const hasCover = !!trip.coverImage

          return (
            <Link
              key={trip.id}
              href={`/${trip.id.replace(/-/g, '')}`}
              className={`group relative overflow-hidden rounded-2xl aspect-[3/2] flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] ${isCompleted ? 'opacity-60' : ''}`}
            >
              {hasCover ? (
                <img
                  src={trip.coverImage!}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

              <div className="flex justify-start p-5 relative z-10">
                {trip.status && (
                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full backdrop-blur-md ${STATUS_BADGE[trip.status] ?? STATUS_BADGE.Planning}`}>
                    {trip.status}
                  </span>
                )}
              </div>

              <div className="relative z-10 p-5 pt-0">
                <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1">{trip.location}</p>
                <h2 className="text-white text-2xl font-bold leading-tight">{trip.name}</h2>
                {dateRange && (
                  <p className="text-white/50 text-xs mt-2 flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60">
                      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {dateRange}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-1 text-white/40 text-xs font-medium group-hover:text-white/70 transition-colors">
                  <span>Open map</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </div>
            </Link>
          )
        })}

        {trips.length === 0 && (
          <p className="text-gray-500 text-sm col-span-full">No trips found in Notion.</p>
        )}
      </div>
    </main>
  )
}
