# Travel Map

An interactive trip planner that pulls trips from Notion and displays them on a Google Map. Built with Next.js, Tailwind CSS, and deployed on Vercel.

**Live site:** [elisa-travel-map.vercel.app](https://elisa-travel-map.vercel.app)

## Stack

- **Next.js 16** (App Router, server components)
- **Google Maps** via `@vis.gl/react-google-maps`
- **Notion** as the backend database
- **Redis** for caching
- **Tailwind CSS** for styling
- **Vercel** for hosting + auto-deploys

## Contributors

- **Elisa Fazzari** ([@elisafazz](https://github.com/elisafazz)) - creator
- **Cathy Sun** ([@nutellafan](https://github.com/nutellafan)) - contributor

## Changelog

### 2026-03-06

- **Marker clustering** - Cathy
  - Dense pin areas now group into blue cluster circles showing counts
  - Zoom in to break clusters apart into individual pins
  - Uses imperative markers with `@googlemaps/markerclusterer` to avoid conflicts with React-managed markers

- **Sort options** - Cathy
  - Segmented picker in the search bar: Type, Date, Priority
  - Hidden when near-me is active (distance sort takes priority)
  - Sidebar renders a flat list when sorting by date or priority

- **Day-by-day timeline** - Cathy
  - Scrollable date chip bar replaces the old Today button
  - Tap a date to filter map + list to that day, tap again to clear
  - Today's date gets a blue accent dot
  - Shows on desktop above sidebar and inside mobile bottom sheet

- **Leg-based auto-bounds** - Cathy
  - Map automatically zooms to fit pins when you toggle a leg/city filter
  - Clears back to all pins when filter is removed

- **Offline support upgrade** - Cathy
  - Service worker now uses stale-while-revalidate for API routes
  - App shell (home, manifest, icons) pre-cached on install
  - Amber "You're offline" banner appears when connection is lost

- **UI redesign - rich/immersive dark theme** - Cathy
  - Home page: trip cards now show Notion cover images with gradient overlay, 3:2 aspect ratio, frosted glass status badges, photo zoom on hover
  - Home page: header pinned at top, trip cards scroll independently
  - Removed sort picker (Type/Date/Priority) from map view toolbar
  - Trip view: dark glass-morphism toolbar, header, sidebar, legend, and map buttons - the map is the hero, chrome floats over it
  - Sidebar: dark background with colored accent bars per type group
  - Day timeline: dark chips with pulsing blue today dot
  - Bottom sheet: card-style list items with rounded corners, colored type header strip on detail view
  - Filter chips glow when active

### 2025-03-05

- **Clean up map controls** - Cathy
  - Removed street view, satellite toggle, and Google's fullscreen button
  - Moved zoom controls to top-left so they're not blocked by the bottom sheet

- **True fullscreen map mode** - Cathy
  - Fullscreen button now hides the trip header bar too (not just filters/sidebar)
  - Removed map/satellite toggle for cleaner UI

- **Fix legend overlapping bottom sheet** - Cathy
  - Legend now sits above the collapsed bottom sheet on mobile

- **Fix bottom sheet swipe gestures on mobile** - Cathy
  - Added touch drag handling with velocity-based snap detection
  - Swipe up/down now properly controls the sheet instead of moving the map

- **Add dino app icons for PWA install support** - Cathy
  - Added 192px, 512px, and Apple touch icon
  - App is now installable on iOS and Android home screens

### Earlier (by Elisa)

- **Search auto-opens sheet, map fitBounds on load, bottom bar tappable**
- **Near me sort, walking directions, and PWA offline support**
- **Search, Today filter, mobile bottom sheet, and enhanced InfoWindow**
- **Neighborhood labels for single-leg trips**
- **Clickable legend type filters and redesigned landing page with gradient cards**
- **Leg filter for trip view**
- **Sidebar with Google Maps links**
- **Status filter toggles**
- **Initial commit - travel map app with Notion integration and Google Maps**
