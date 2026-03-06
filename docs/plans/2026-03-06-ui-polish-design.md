# UI Polish Design - Rich & Immersive

**Goal:** Upgrade the visual design of the home page and trip map view from utilitarian to rich/immersive. Dark chrome, glass effects, destination photos, the map as hero.

**Style direction:** Apple Maps / Google Earth HUD aesthetic. Dark surfaces with backdrop-blur, vivid accent colors, the map dominates and UI chrome floats over it.

---

## Home Page

### Trip Cards
- **Cover images:** New `coverImage` URL field in Notion. Photo fills card background with `object-cover`. Dark gradient overlay from bottom (`bg-gradient-to-t from-black/70 via-black/30 to-transparent`) so text stays readable. Fallback to current abstract gradients when no image.
- **Aspect ratio:** 3:2 instead of 4:3 for more photo room.
- **Status badge:** Top-left, frosted glass (`bg-white/15 backdrop-blur-md border border-white/20`).
- **Bottom content:** Trip name (bold, white), location (white/70, smaller), date range with subtle calendar icon, item count ("24 places").
- **Hover:** Existing scale + shadow, plus photo `scale-110` with `overflow-hidden` on card and `transition-transform duration-500` on image.
- **Grid:** Keep 1/2/3 column responsive. Gap from `gap-5` to `gap-6`.

### Page Chrome
- Keep `gray-950` background.
- Header: "Trip Maps" title + trip count subtitle.
- Cards stagger fade-in on load with CSS animation.

### Data Changes
- Add `coverImage` (URL) property to Notion trip database schema.
- Update `fetchAllTrips` to read the new field.
- Add `coverImage` to the `Trip` type.
- Add domain to `next.config.ts` `images.remotePatterns` for whatever image host is used (or use plain `<img>` to avoid that).

---

## Trip Map View

### Overall Concept
Map is the hero. All chrome (header, toolbar, sidebar, legend, bottom sheet) uses dark glass-morphism surfaces that float over the map.

### Header Bar
- Background: `bg-gray-900/90 backdrop-blur-xl` instead of plain white.
- Text: white. Back arrow: `text-white/60 hover:text-white`.
- Unmapped warning: small amber dot indicator instead of text.

### Unified Toolbar (replaces separate search bar + filter bar)
- Single bar: `bg-gray-900/80 backdrop-blur-xl` with `border-b border-white/10`.
- Search input: dark input (`bg-white/10 border-white/15 text-white placeholder:text-white/40`).
- Sort picker: dark pills (`bg-white/10`, active: `bg-white/20 text-white`).
- Filter chips: dark-themed. Active chips get a colored glow shadow (`shadow-[0_0_8px_rgba(color,0.4)]`).
- Near-me, status, leg filters all in one scrollable row below the search.
- Item count: `text-white/40`.

### Day Timeline
- Dark chip style: `bg-white/10 border-white/15 text-white/70`.
- Selected: `bg-white text-gray-900` (inverted, bright).
- Today: blue tint `bg-blue-500/20 border-blue-400/40 text-blue-300` with pulsing dot.

### Sidebar (Desktop)
- Background: `bg-gray-900/95 backdrop-blur-xl`.
- Text: `text-white`, secondary: `text-white/50`.
- Type group headers: colored left accent bar (4px, matches type color) + `bg-white/5`.
- Item rows: `border-b border-white/5`. Selected: `bg-white/10` + vivid left border matching type color.
- Priority dots keep existing colors but brighter against dark.
- Scroll fade: gradient mask at top/bottom edges.
- Sorted-by-distance label: `text-blue-400`.

### Bottom Sheet (Mobile)
- Background stays white (dark bottom sheet on mobile feels heavy and hurts readability in bright sunlight).
- Detail view: colored header strip (12px tall, type color) at top of detail content.
- List items: card-style with `rounded-xl bg-gray-50 mx-3 mb-1.5` instead of flat full-width rows with border-bottom.
- Animation: lighter spring curve (`cubic-bezier(0.32, 0.72, 0, 1)` is already decent, keep it).

### Legend
- Frosted glass: `bg-gray-900/80 backdrop-blur-xl` with `border border-white/10`.
- Text: white. Type circles stay as-is (already colored).
- Slightly more compact padding.

### Map Buttons (recenter, fullscreen)
- Dark glass: `bg-gray-900/80 backdrop-blur-md` instead of plain white.
- Icon: `text-white/70 hover:text-white`.

### InfoWindow
- Keep inline styles (Google Maps InfoWindow doesn't support Tailwind classes well).
- Darken background slightly: `#1a1a2e` with light text. Or keep white if contrast is better.
- Decision: keep white InfoWindow for now - it's Google's chrome and fighting it creates jank.
