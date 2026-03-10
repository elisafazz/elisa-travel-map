# Warm Wanderer Design Refresh

## Direction
Elevate the existing dark theme with warmer personality: DM Serif Display + DM Sans typography, amber accents, film grain texture, subtle ambient glow. Photo-forward cards on home page. No layout changes - purely visual polish.

## Typography
- **Display font:** DM Serif Display (Google Fonts) - used for page titles, trip names, card titles, info window place names
- **Body font:** DM Sans (Google Fonts) - weights 300/400/500/600 - used for all body text, labels, metadata
- Load via `next/font/google` for optimal performance

## Home Page Changes
1. **Font swap:** System fonts -> DM Serif Display (h1, card titles) + DM Sans (body)
2. **Header:** Add amber accent bar (40px wide, 2.5px, gradient #fbbf24 -> #f59e0b) below "Trip Maps"
3. **Film grain overlay:** Fixed pseudo-element on body, opacity 0.035, fractal noise SVG
4. **Ambient glow:** Radial gradient from bottom-left corner, warm amber, very subtle (0.04 opacity)
5. **Card hover:** Change from scale(1.02) to translateY(-4px) with enhanced shadow
6. **Badge colors:** Planning status uses amber tint instead of white
7. **Card arrow:** Circular arrow button, hovers to amber tint
8. **Staggered entrance animation:** Cards fade up with 0.1s delays
9. **Keep existing:** Cover photo backgrounds from Notion, grid layout, responsive breakpoints

## Trip View Changes
1. **Font swap:** System fonts -> DM Serif Display (trip name in header, info window titles) + DM Sans (everything else)
2. **Film grain overlay:** Same as home page but slightly less opacity (0.025)
3. **Selected sidebar item:** Left border accent changes from blue to amber (#fbbf24)
4. **Search input focus:** Border glow shifts from white to amber (rgba(251,191,36,0.3))
5. **Map control hover:** Amber tint on hover instead of just brighter
6. **Keep existing:** All chip glow shadows, glass-morphism, bottom sheet behavior, marker colors, clustering, layout structure

## Files to Modify
- `app/layout.tsx` - Add Google Fonts via next/font, film grain + ambient glow global styles
- `app/globals.css` - Film grain pseudo-element, ambient gradient
- `app/page.tsx` - Home page typography, card styles, animations, badge colors
- `components/TripView.tsx` - Trip name font, search focus color, sidebar selected accent
- `components/Sidebar.tsx` - Selected item border color
- `components/BottomSheet.tsx` - Typography updates
- `components/TripMap.tsx` - Info window title font (if applicable via CSS)

## What NOT to Change
- Layout structure (grid, sidebar width, bottom sheet behavior)
- Marker colors/sizes
- Filter chip glow colors
- Clustering behavior
- Any API/data layer
- Responsive breakpoints
