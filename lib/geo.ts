import type { TripItem } from './types'

export interface UserLocation {
  lat: number
  lng: number
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLng = (lng2 - lng1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`
  return `${km.toFixed(1)}km`
}

export function mapsUrl(item: TripItem, origin?: UserLocation | null): string {
  if (origin && item.coordinates) {
    return (
      `https://www.google.com/maps/dir/?api=1` +
      `&origin=${origin.lat},${origin.lng}` +
      `&destination=${item.coordinates.lat},${item.coordinates.lng}` +
      `&travelmode=walking`
    )
  }
  if (item.coordinates) {
    const query = encodeURIComponent(`${item.venue || item.name}, ${item.legCity}`)
    return `https://www.google.com/maps/search/?api=1&query=${query}&query_location=${item.coordinates.lat},${item.coordinates.lng}`
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.name} ${item.legCity}`)}`
}
