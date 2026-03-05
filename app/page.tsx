import { fetchAllTrips } from '@/lib/notion'
import Link from 'next/link'
import type { Trip } from '@/lib/types'

const STATUS_COLORS: Record<string, string> = {
  Planning:    'bg-yellow-100 text-yellow-800',
  Booked:      'bg-blue-100 text-blue-800',
  'In Progress': 'bg-green-100 text-green-800',
  Completed:   'bg-gray-100 text-gray-600',
}

function formatDate(d: string | null) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default async function Home() {
  const trips = await fetchAllTrips()

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Trip Map</h1>
      <p className="text-gray-500 mb-8 text-sm">Click a trip to open its map</p>

      <div className="flex flex-col gap-4">
        {trips.map((trip: Trip) => (
          <Link
            key={trip.id}
            href={`/${trip.id.replace(/-/g, '')}`}
            className="block bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold text-lg">{trip.name}</div>
                <div className="text-gray-500 text-sm mt-0.5">{trip.location}</div>
                {(trip.departureDate || trip.returnDate) && (
                  <div className="text-gray-400 text-xs mt-1">
                    {formatDate(trip.departureDate)}
                    {trip.returnDate && trip.returnDate !== trip.departureDate
                      ? ` – ${formatDate(trip.returnDate)}`
                      : ''}
                  </div>
                )}
              </div>
              {trip.status && (
                <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${STATUS_COLORS[trip.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {trip.status}
                </span>
              )}
            </div>
          </Link>
        ))}

        {trips.length === 0 && (
          <p className="text-gray-400 text-sm">No trips found in Notion.</p>
        )}
      </div>
    </main>
  )
}
