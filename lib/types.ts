export type TripStatus = 'Planning' | 'Booked' | 'In Progress' | 'Completed'

export type ItemType =
  | 'Hotel'
  | 'Restaurant'
  | 'Activity'
  | 'Flight'
  | 'Train'
  | 'Ferry'
  | 'Car Rental'
  | 'Other'

export type ItemPriority = 'Must' | 'High' | 'Optional'
export type ItemStatus = 'Researching' | 'Shortlisted' | 'Confirmed' | 'Cancelled'

export interface Coordinates {
  lat: number
  lng: number
}

export interface Trip {
  id: string
  url: string
  name: string
  location: string
  departureDate: string | null
  returnDate: string | null
  status: TripStatus | null
}

export interface TripItem {
  id: string
  url: string
  name: string
  type: ItemType | null
  priority: ItemPriority | null
  status: ItemStatus | null
  legCity: string
  venue: string
  notes: string
  tripUrl: string
  date: string | null
  coordinates?: Coordinates
}

export interface TripWithItems extends Trip {
  items: TripItem[]
}
