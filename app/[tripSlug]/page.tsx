import { fetchAllTrips, fetchTripItems, fetchTripLegCount } from '@/lib/notion'
import { geocodeVenue } from '@/lib/geocode'
import TripView from '@/components/TripView'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 60

export async function generateStaticParams() {
  const trips = await fetchAllTrips()
  return trips.map(t => ({ tripSlug: t.id.replace(/-/g, '') }))
}

export default async function TripPage({ params }: { params: Promise<{ tripSlug: string }> }) {
  const { tripSlug } = await params
  const trips = await fetchAllTrips()
  const trip = trips.find(t => t.id.replace(/-/g, '') === tripSlug)

  if (!trip) notFound()

  const [rawItems, legCount] = await Promise.all([
    fetchTripItems(trip.id),
    fetchTripLegCount(trip.id),
  ])

  const items = await Promise.all(
    rawItems.map(async item => {
      const coords = await geocodeVenue(item.venue, item.legCity)
      return { ...item, coordinates: coords ?? undefined }
    })
  )

  const mapped = items.filter(i => i.coordinates)
  const unmapped = items.filter(i => !i.coordinates)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center gap-4 px-6 py-3 bg-white border-b border-gray-100 shadow-sm z-20">
        <Link href="/" className="text-gray-400 hover:text-gray-700 text-sm">← All trips</Link>
        <div className="flex-1">
          <h1 className="font-bold text-lg leading-tight">{trip.name}</h1>
          <p className="text-gray-400 text-xs">{trip.location} · {mapped.length} locations mapped</p>
        </div>
        {unmapped.length > 0 && (
          <span className="text-xs text-orange-500">{unmapped.length} items not geocoded</span>
        )}
      </header>

      <TripView items={items} apiKey={apiKey} legLabel={legCount === 1 ? 'Neighborhood' : 'Leg'} />
    </div>
  )
}
