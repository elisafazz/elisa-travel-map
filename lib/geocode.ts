import type { Coordinates } from './types'

const GEOCODING_API_KEY = process.env.GOOGLE_MAPS_API_KEY!

async function getRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null
  const { Redis } = await import('@upstash/redis')
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
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
    const redis = await getRedis()
    if (redis) {
      const cached = await redis.get<Coordinates>(key)
      if (cached) return cached
    }
  } catch {
    // Cache unavailable — proceed without it
  }

  // Call Geocoding API
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${GEOCODING_API_KEY}`
  const res = await fetch(url)
  const data = await res.json()

  if (data.status !== 'OK' || !data.results[0]) return null

  const location = data.results[0].geometry.location as Coordinates

  // Store in cache (30 days)
  try {
    const redis = await getRedis()
    if (redis) await redis.set(key, location, { ex: 60 * 60 * 24 * 30 })
  } catch {
    // Cache unavailable — skip
  }

  return location
}
