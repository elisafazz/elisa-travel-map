import { Client } from '@notionhq/client'
import type { Trip, TripItem, ItemType, ItemPriority, ItemStatus, TripStatus } from './types'

const notion = new Client({ auth: process.env.NOTION_TOKEN })

const TRAVEL_PLANNING_DB = '72792a7e-eb9e-468a-a376-fd1e7284401c'
const TRIP_ITEMS_DB = '9947ef07-3483-472b-b452-f2ebc23edabe'
const TRIP_LEGS_DB = 'fee283c0-9ee7-46ff-8758-fbc58fba496d'

function getText(prop: any): string {
  if (!prop) return ''
  if (prop.type === 'title') return prop.title?.map((t: any) => t.plain_text).join('') ?? ''
  if (prop.type === 'rich_text') return prop.rich_text?.map((t: any) => t.plain_text).join('') ?? ''
  if (prop.type === 'select') return prop.select?.name ?? ''
  if (prop.type === 'date') return prop.date?.start ?? ''
  return ''
}

export async function fetchAllTrips(): Promise<Trip[]> {
  const response = await notion.databases.query({
    database_id: TRAVEL_PLANNING_DB,
    sorts: [{ property: 'Departure Date', direction: 'descending' }],
  })

  return response.results.map((page: any) => ({
    id: page.id,
    url: page.url,
    name: getText(page.properties['Trip Name']),
    location: getText(page.properties['Location']),
    departureDate: page.properties['Departure Date']?.date?.start ?? null,
    returnDate: page.properties['Return Date']?.date?.start ?? null,
    status: (getText(page.properties['Trip Status']) as TripStatus) || null,
  }))
}

export async function fetchTripItems(tripUrl: string): Promise<TripItem[]> {
  const allItems: TripItem[] = []
  let cursor: string | undefined

  do {
    const response: any = await notion.databases.query({
      database_id: TRIP_ITEMS_DB,
      start_cursor: cursor,
      page_size: 100,
    })

    for (const page of response.results as any[]) {
      const tripRelation: any[] = page.properties['Trip']?.relation ?? []
      const linkedTripId = tripRelation[0]?.id

      if (!linkedTripId) continue

      // Match by trip page ID (last part of URL)
      const tripPageId = tripUrl.split('/').pop()?.replace(/-/g, '')
      if (linkedTripId.replace(/-/g, '') !== tripPageId) continue

      allItems.push({
        id: page.id,
        url: page.url,
        name: getText(page.properties['Name']),
        type: (getText(page.properties['Type']) as ItemType) || null,
        priority: (getText(page.properties['Priority']) as ItemPriority) || null,
        status: (getText(page.properties['Status']) as ItemStatus) || null,
        legCity: getText(page.properties['Leg / City']),
        venue: getText(page.properties['Provider / Venue']),
        notes: getText(page.properties['Notes']),
        tripUrl,
        date: page.properties['Date']?.date?.start ?? null,
      })
    }

    cursor = response.next_cursor ?? undefined
  } while (cursor)

  return allItems
}

export async function fetchAllTripItems(): Promise<TripItem[]> {
  const allItems: TripItem[] = []
  let cursor: string | undefined

  do {
    const response: any = await notion.databases.query({
      database_id: TRIP_ITEMS_DB,
      start_cursor: cursor,
      page_size: 100,
    })

    for (const page of response.results as any[]) {
      const tripRelation: any[] = page.properties['Trip']?.relation ?? []
      if (tripRelation.length === 0) continue

      allItems.push({
        id: page.id,
        url: page.url,
        name: getText(page.properties['Name']),
        type: (getText(page.properties['Type']) as ItemType) || null,
        priority: (getText(page.properties['Priority']) as ItemPriority) || null,
        status: (getText(page.properties['Status']) as ItemStatus) || null,
        legCity: getText(page.properties['Leg / City']),
        venue: getText(page.properties['Provider / Venue']),
        notes: getText(page.properties['Notes']),
        tripUrl: `https://www.notion.so/${tripRelation[0].id.replace(/-/g, '')}`,
        date: page.properties['Date']?.date?.start ?? null,
      })
    }

    cursor = response.next_cursor ?? undefined
  } while (cursor)

  return allItems
}
