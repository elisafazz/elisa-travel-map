import type { Coordinates } from './types'

const GEOCODING_API_KEY = process.env.GOOGLE_MAPS_API_KEY!

// Cache stored in Vercel KV — imported lazily so it doesn't break local dev
async function getKV() {
  const { kv } = await import('@vercel/kv')
  return kv
}

function cacheKey(venue: string, city: string): string {
  return `geocode:${venue.toLowerCase().trim()}:${city.toLowerCase().trim()}`
}

export async function geocodeVenue(
  venue: string,
  city: string
): Promise<Coordinates | null> {
  if (!venue && !city) return null

  const query = [venue, city].filter(Boolean).join(', ')
  const key = cacheKey(venue, city)

  // Try cache first
  try {
    const kv = await getKV()
    const cached = await kv.get<Coordinates>(key)
    if (cached) return cached
  } catch {
    // KV not available locally — skip cache
  }

  // Call Geocoding API
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${GEOCODING_API_KEY}`
  const res = await fetch(url)
  const data = await res.json()

  if (data.status !== 'OK' || !data.results[0]) return null

  const location = data.results[0].geometry.location as Coordinates

  // Store in cache
  try {
    const kv = await getKV()
    await kv.set(key, location, { ex: 60 * 60 * 24 * 30 }) // 30 days
  } catch {
    // KV not available locally — skip
  }

  return location
}
