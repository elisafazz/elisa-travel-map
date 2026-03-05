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

### 2025-03-05

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
