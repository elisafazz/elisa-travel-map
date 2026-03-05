import { NextResponse } from 'next/server'
import { fetchAllTrips } from '@/lib/notion'

export async function GET() {
  const trips = await fetchAllTrips()
  return NextResponse.json(trips)
}
