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
  Planning:     'bg-white/20 text-white border border-white/30',
  Booked:       'bg-blue-400/30 text-blue-100 border border-blue-300/30',
  'In Progress': 'bg-green-400/30 text-green-100 border border-green-300/30',
  Completed:    'bg-white/10 text-white/60 border border-white/20',
}

function formatDateRange(dep: string | null, ret: string | null) {
  const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  if (dep && ret && dep !== ret) return `${fmt(dep)} – ${fmt(ret)}`
  if (dep) return fmt(dep)
  return null
}

export default async function Home() {
  const trips = await fetchAllTrips()

  // Sort: in-progress and planning first, then booked, then completed
  const ORDER: Record<string, number> = { 'In Progress': 0, Planning: 1, Booked: 2, Completed: 3 }
  const sorted = [...trips].sort((a, b) => (ORDER[a.status ?? ''] ?? 9) - (ORDER[b.status ?? ''] ?? 9))

  return (
    <main className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="px-8 pt-12 pb-6">
        <h1 className="text-4xl font-bold text-white tracking-tight">Trip Map</h1>
        <p className="text-gray-400 mt-1 text-sm">All trips · Click to open the map</p>
      </div>

      {/* Trip grid */}
      <div className="px-8 pb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sorted.map((trip: Trip, i: number) => {
          const gradient = GRADIENTS[i % GRADIENTS.length]
          const dateRange = formatDateRange(trip.departureDate, trip.returnDate)
          const isCompleted = trip.status === 'Completed'

          return (
            <Link
              key={trip.id}
              href={`/${trip.id.replace(/-/g, '')}`}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} aspect-[4/3] flex flex-col justify-between p-6 transition-transform duration-200 hover:scale-[1.02] hover:shadow-2xl ${isCompleted ? 'opacity-60' : ''}`}
            >
              {/* Noise/texture overlay */}
              <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]" />

              {/* Status badge */}
              <div className="flex justify-end relative z-10">
                {trip.status && (
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm ${STATUS_BADGE[trip.status] ?? STATUS_BADGE.Planning}`}>
                    {trip.status}
                  </span>
                )}
              </div>

              {/* Bottom content */}
              <div className="relative z-10">
                <p className="text-white/70 text-sm font-medium mb-1 uppercase tracking-widest">{trip.location}</p>
                <h2 className="text-white text-2xl font-bold leading-tight">{trip.name}</h2>
                {dateRange && (
                  <p className="text-white/60 text-xs mt-2">{dateRange}</p>
                )}
                <div className="mt-4 flex items-center gap-1 text-white/50 text-xs font-medium group-hover:text-white/80 transition-colors">
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
