import { NextResponse } from 'next/server'
import { geocodeVenue } from '@/lib/geocode'

// Client-side map calls this to get coordinates — keeps API key server-side
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const venue = searchParams.get('venue') ?? ''
  const city = searchParams.get('city') ?? ''

  if (!venue && !city) {
    return NextResponse.json({ error: 'venue or city required' }, { status: 400 })
  }

  const coords = await geocodeVenue(venue, city)
  if (!coords) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(coords)
}
