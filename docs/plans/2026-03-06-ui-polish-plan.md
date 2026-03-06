# UI Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade the home page and trip map view to a rich/immersive dark-glass aesthetic with destination cover photos.

**Architecture:** Pure CSS/Tailwind changes across existing components. One data layer change (coverImage field). No new dependencies. The map view chrome switches from white to dark glass-morphism (`bg-gray-900/80 backdrop-blur-xl`). The bottom sheet stays white for mobile readability.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, Notion API.

---

### Task 1: Add coverImage to Trip type and Notion fetch

**Files:**
- Modify: `lib/types.ts`
- Modify: `lib/notion.ts`

**Step 1: Add coverImage to Trip interface**

In `lib/types.ts`, add `coverImage` to the `Trip` interface:

```ts
export interface Trip {
  id: string
  url: string
  name: string
  location: string
  departureDate: string | null
  returnDate: string | null
  status: TripStatus | null
  coverImage: string | null
}
```

**Step 2: Read coverImage from Notion in fetchAllTrips**

In `lib/notion.ts`, update the `fetchAllTrips` return mapping. Add after `status`:

```ts
coverImage: page.properties['Cover Image']?.url ?? page.cover?.external?.url ?? page.cover?.file?.url ?? null,
```

This tries a dedicated "Cover Image" URL property first, then falls back to the page's built-in cover image.

**Step 3: Add itemCount to the trip page data**

In `app/[tripSlug]/page.tsx`, pass `itemCount` to TripPageClient. This is needed later for the home page cards to show item counts. Actually - the home page doesn't have item counts per trip without an extra fetch. Skip this for now; we can add it later if needed.

**Step 4: Commit**

```bash
git add lib/types.ts lib/notion.ts
git commit -m "Add coverImage field to Trip type and Notion fetch"
```

---

### Task 2: Redesign home page trip cards

**Files:**
- Modify: `app/page.tsx`

**Step 1: Replace the entire Home component with the new design**

Replace `app/page.tsx` with the following. Key changes:
- Cover image background with gradient overlay (fallback to abstract gradient)
- 3:2 aspect ratio
- Frosted glass status badge top-left
- Photo zoom on hover
- Stagger fade-in animation
- Gap increased to `gap-6`

```tsx
import { fetchAllTrips } from '@/lib/notion'
import Link from 'next/link'
import type { Trip } from '@/lib/types'

const GRADIENTS = [
  'from-blue-900 via-blue-700 to-cyan-500',
  'from-violet-900 via-purple-700 to-pink-500',
  'from-emerald-900 via-teal-700 to-green-400',
  'from-orange-900 via-rose-700 to-orange-400',
  'from-slate-900 via-indigo-800 to-blue-500',
  'from-amber-900 via-orange-700 to-yellow-400',
]

const STATUS_BADGE: Record<string, string> = {
  Planning:      'bg-white/15 text-white border border-white/20',
  Booked:        'bg-blue-400/20 text-blue-100 border border-blue-300/20',
  'In Progress': 'bg-green-400/20 text-green-100 border border-green-300/20',
  Completed:     'bg-white/10 text-white/50 border border-white/15',
}

function formatDateRange(dep: string | null, ret: string | null) {
  const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  if (dep && ret && dep !== ret) return `${fmt(dep)} - ${fmt(ret)}`
  if (dep) return fmt(dep)
  return null
}

export default async function Home() {
  const trips = await fetchAllTrips()

  const ORDER: Record<string, number> = { 'In Progress': 0, Planning: 1, Booked: 2, Completed: 3 }
  const sorted = [...trips].sort((a, b) => (ORDER[a.status ?? ''] ?? 9) - (ORDER[b.status ?? ''] ?? 9))

  return (
    <main className="min-h-screen bg-gray-950">
      <div className="px-8 pt-12 pb-8">
        <h1 className="text-4xl font-bold text-white tracking-tight">Trip Maps</h1>
        <p className="text-white/40 mt-1 text-sm">{trips.length} trip{trips.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="px-8 pb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sorted.map((trip: Trip, i: number) => {
          const gradient = GRADIENTS[i % GRADIENTS.length]
          const dateRange = formatDateRange(trip.departureDate, trip.returnDate)
          const isCompleted = trip.status === 'Completed'
          const hasCover = !!trip.coverImage

          return (
            <Link
              key={trip.id}
              href={`/${trip.id.replace(/-/g, '')}`}
              className={`group relative overflow-hidden rounded-2xl aspect-[3/2] flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] ${isCompleted ? 'opacity-60' : ''}`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Background: cover image or gradient */}
              {hasCover ? (
                <img
                  src={trip.coverImage!}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
              )}

              {/* Dark gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

              {/* Status badge - top left */}
              <div className="flex justify-start p-5 relative z-10">
                {trip.status && (
                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full backdrop-blur-md ${STATUS_BADGE[trip.status] ?? STATUS_BADGE.Planning}`}>
                    {trip.status}
                  </span>
                )}
              </div>

              {/* Bottom content */}
              <div className="relative z-10 p-5 pt-0">
                <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1">{trip.location}</p>
                <h2 className="text-white text-2xl font-bold leading-tight">{trip.name}</h2>
                {dateRange && (
                  <p className="text-white/50 text-xs mt-2 flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-60">
                      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {dateRange}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-1 text-white/40 text-xs font-medium group-hover:text-white/70 transition-colors">
                  <span>Open map</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </div>
            </Link>
          )
        })}

        {trips.length === 0 && (
          <p className="text-gray-500 text-sm col-span-full">No trips found in Notion.</p>
        )}
      </div>
    </main>
  )
}
```

**Step 2: Verify**

Run: `npm run dev`

Open the home page. Cards should show cover images (if set in Notion) with gradient overlay, or fall back to abstract gradients. Status badge should be frosted glass, top-left. Hover should zoom the photo.

**Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "Redesign home page cards with cover images and glass badges"
```

---

### Task 3: Dark glass trip header

**Files:**
- Modify: `components/TripPageClient.tsx`

**Step 1: Update header styling**

Replace the `<header>` element's className and children:

```tsx
<header className="flex items-center gap-4 px-6 py-3 bg-gray-900/90 backdrop-blur-xl border-b border-white/10 z-20">
  <Link href="/" className="text-white/50 hover:text-white text-sm transition-colors">← All trips</Link>
  <div className="flex-1">
    <h1 className="font-bold text-lg leading-tight text-white">{trip.name}</h1>
    <p className="text-white/40 text-xs">{trip.location}</p>
  </div>
  {unmappedCount > 0 && (
    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" title={`${unmappedCount} items not geocoded`} />
  )}
</header>
```

**Step 2: Commit**

```bash
git add components/TripPageClient.tsx
git commit -m "Dark glass header bar for trip view"
```

---

### Task 4: Unified dark toolbar (merge search + filter bars)

**Files:**
- Modify: `components/TripView.tsx`

**Step 1: Update STATUSES array colors for dark theme**

Replace the STATUSES array:

```tsx
const STATUSES: { value: ItemStatus; label: string; color: string; active: string }[] = [
  { value: 'Confirmed',   label: 'Confirmed',   color: 'border-green-500/30 text-green-400',   active: 'bg-green-500 border-green-500 text-white shadow-[0_0_8px_rgba(34,197,94,0.4)]' },
  { value: 'Shortlisted', label: 'Shortlisted', color: 'border-yellow-500/30 text-yellow-400', active: 'bg-yellow-500 border-yellow-500 text-white shadow-[0_0_8px_rgba(234,179,8,0.4)]' },
  { value: 'Researching', label: 'Researching', color: 'border-white/15 text-white/50',        active: 'bg-white/20 border-white/30 text-white' },
  { value: 'Cancelled',   label: 'Cancelled',   color: 'border-red-500/30 text-red-400',       active: 'bg-red-500 border-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.4)]' },
]
```

**Step 2: Merge search bar and filter bar into one unified toolbar**

Replace BOTH the search bar `<div>` and the filter bar `<div>` with a single unified toolbar. The new toolbar has two rows: top row is search + sort, bottom row is filter chips. Both wrapped in one dark glass container:

```tsx
{/* Unified toolbar */}
<div className={`bg-gray-900/80 backdrop-blur-xl border-b border-white/10 ${fullscreen ? 'hidden' : ''}`}>
  {/* Top row: search + sort */}
  <div className="flex items-center gap-2 px-4 py-2">
    <div className="relative flex-1">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm pointer-events-none">🔍</span>
      <input
        type="search"
        placeholder="Search items..."
        value={searchQuery}
        onChange={e => { setSearchQuery(e.target.value); setSelected(null) }}
        className="w-full text-sm pl-8 pr-3 py-1.5 rounded-full border border-white/15 bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 focus:bg-white/15 transition-colors"
      />
    </div>
    {searchQuery && (
      <button onClick={() => setSearchQuery('')} className="text-xs text-white/40 hover:text-white/70">
        Clear
      </button>
    )}
    {nearMeState !== 'active' && (
      <div className="flex items-center gap-0.5 bg-white/10 rounded-full p-0.5 flex-shrink-0">
        {([['type', 'Type'], ['date', 'Date'], ['priority', 'Priority']] as [SortMode, string][]).map(([mode, label]) => (
          <button
            key={mode}
            onClick={() => setSortMode(mode)}
            className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
              sortMode === mode
                ? 'bg-white/20 text-white font-medium'
                : 'text-white/50 hover:text-white/70'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    )}
  </div>

  {/* Bottom row: filter chips */}
  <div
    className="flex items-center gap-2 px-4 py-2 overflow-x-auto flex-nowrap border-t border-white/5"
    style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
  >
    <button
      onClick={requestNearMe}
      disabled={nearMeState === 'loading'}
      className={`flex-shrink-0 text-xs font-medium px-3 py-1 rounded-full border transition-all ${
        nearMeState === 'active'
          ? 'bg-blue-500 border-blue-500 text-white shadow-[0_0_8px_rgba(59,130,246,0.4)]'
          : nearMeState === 'error'
          ? 'border-red-500/30 text-red-400 bg-transparent'
          : 'border-white/15 text-white/50 bg-transparent hover:bg-white/5 disabled:opacity-50'
      }`}
    >
      {nearMeLabel}
    </button>

    <span className="flex-shrink-0 text-xs text-white/30 font-medium">Status:</span>
    {STATUSES.map(s => {
      const isActive = activeFilters.has(s.value)
      return (
        <button
          key={s.value}
          onClick={() => toggleFilter(s.value)}
          className={`flex-shrink-0 text-xs font-medium px-3 py-1 rounded-full border transition-all ${
            isActive ? s.active : s.color + ' bg-transparent hover:bg-white/5'
          }`}
        >
          {s.label}
        </button>
      )
    })}
    {activeFilters.size > 0 && (
      <button
        onClick={() => { setActiveFilters(new Set()); setSelected(null) }}
        className="flex-shrink-0 text-xs text-white/40 hover:text-white/70 underline"
      >
        Clear
      </button>
    )}

    {legs.length > 1 && (
      <>
        <span className="flex-shrink-0 text-white/10 mx-1">|</span>
        <span className="flex-shrink-0 text-xs text-white/30 font-medium">{legLabel}:</span>
        {legs.map(city => {
          const isActive = activeLegs.has(city)
          return (
            <button
              key={city}
              onClick={() => toggleLeg(city)}
              className={`flex-shrink-0 text-xs font-medium px-3 py-1 rounded-full border transition-all ${
                isActive
                  ? 'bg-indigo-500 border-indigo-500 text-white shadow-[0_0_8px_rgba(99,102,241,0.4)]'
                  : 'border-indigo-400/30 text-indigo-300 bg-transparent hover:bg-white/5'
              }`}
            >
              {city}
            </button>
          )
        })}
        {activeLegs.size > 0 && (
          <button
            onClick={() => { setActiveLegs(new Set()); setSelected(null) }}
            className="flex-shrink-0 text-xs text-white/40 hover:text-white/70 underline"
          >
            Clear
          </button>
        )}
      </>
    )}

    <span className="flex-shrink-0 text-xs text-white/30 pl-3">{displayItems.length} items</span>
  </div>
</div>
```

**Step 3: Update DayTimeline wrapper for dark theme**

Update the DayTimeline className:

```tsx
{allDates.length > 0 && (
  <DayTimeline
    dates={allDates}
    selectedDate={selectedDate}
    onSelectDate={setSelectedDate}
    className={`border-b border-white/10 bg-gray-900/80 backdrop-blur-xl ${fullscreen ? 'hidden' : 'hidden md:flex'}`}
  />
)}
```

**Step 4: Update map buttons to dark glass**

Replace both button classNames:

Recenter button:
```
className="absolute top-4 right-16 z-10 bg-gray-900/80 backdrop-blur-md rounded-lg shadow-lg w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors border border-white/10"
```

Fullscreen button:
```
className="absolute top-4 right-4 z-10 bg-gray-900/80 backdrop-blur-md rounded-lg shadow-lg w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors border border-white/10"
```

**Step 5: Commit**

```bash
git add components/TripView.tsx
git commit -m "Dark glass unified toolbar and map buttons"
```

---

### Task 5: Dark theme DayTimeline

**Files:**
- Modify: `components/DayTimeline.tsx`

**Step 1: Update chip styles for dark theme**

Replace the button className in DayTimeline:

```tsx
className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors relative ${
  isSelected
    ? 'bg-white text-gray-900 border-white'
    : isToday
    ? 'bg-blue-500/20 border-blue-400/40 text-blue-300'
    : 'bg-white/10 border-white/15 text-white/60 hover:bg-white/15'
}`}
```

Update the today dot:
```tsx
{isToday && !isSelected && (
  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
)}
```

**Step 2: Commit**

```bash
git add components/DayTimeline.tsx
git commit -m "Dark theme date timeline chips"
```

---

### Task 6: Dark theme Sidebar

**Files:**
- Modify: `components/Sidebar.tsx`

**Step 1: Add TYPE_COLORS constant for accent bars**

Add after the existing constants at the top of the file:

```tsx
const TYPE_COLORS: Record<string, string> = {
  Hotel:        '#3B82F6',
  Restaurant:   '#EF4444',
  Activity:     '#10B981',
  Flight:       '#8B5CF6',
  Train:        '#F59E0B',
  Ferry:        '#06B6D4',
  'Car Rental': '#F97316',
  Other:        '#6B7280',
}
```

**Step 2: Update the aside and all child elements**

Replace the `<aside>` className:
```tsx
<aside className={`w-72 flex-shrink-0 bg-gray-900/95 backdrop-blur-xl border-r border-white/10 overflow-y-auto flex-col ${className}`}>
```

Replace the header div:
```tsx
<div className="px-4 py-3 border-b border-white/10">
  <p className="text-xs text-white/40 font-medium uppercase tracking-wide">
    {items.length} items · {items.filter(i => i.coordinates).length} mapped
    {userLocation && <span className="text-blue-400 ml-1">· sorted by distance</span>}
  </p>
</div>
```

Replace the type group header:
```tsx
{meta && (
  <div
    className="flex items-center gap-2 px-4 py-2 bg-white/5 sticky top-0 z-10 border-l-4"
    style={{ borderLeftColor: TYPE_COLORS[type ?? ''] ?? '#6B7280' }}
  >
    <span className="text-sm">{meta.emoji}</span>
    <span className="text-xs font-semibold text-white/60 uppercase tracking-wide">{type}s</span>
    <span className="ml-auto text-xs text-white/30">{groupItems.length}</span>
  </div>
)}
```

Replace the item button:
```tsx
<button
  key={item.id}
  onClick={() => onSelect(item)}
  className={`w-full text-left px-4 py-3 border-b border-white/5 border-l-2 transition-colors flex items-start gap-3 ${
    isSelected
      ? 'bg-white/10 border-l-blue-400'
      : hasCords
      ? 'border-l-transparent hover:bg-white/5'
      : 'border-l-transparent opacity-50 hover:bg-white/5'
  }`}
>
  <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[item.priority ?? ''] ?? 'bg-gray-500'}`} />
  <div className="flex-1 min-w-0">
    <div className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-white/80'}`}>
      {item.name}
    </div>
    <div className="flex items-center gap-2 mt-0.5">
      {item.legCity && <span className="text-xs text-white/40 truncate">{item.legCity}</span>}
      {item.date && <span className="text-xs text-white/25 flex-shrink-0">{formatDate(item.date)}</span>}
    </div>
    {!hasCords && <div className="text-xs text-amber-400/70 mt-0.5">Not geocoded</div>}
  </div>
  {distance && (
    <span className="flex-shrink-0 text-xs font-medium text-blue-400 mt-0.5">{distance}</span>
  )}
</button>
```

**Step 3: Commit**

```bash
git add components/Sidebar.tsx
git commit -m "Dark theme sidebar with colored accent bars"
```

---

### Task 7: Dark glass Legend

**Files:**
- Modify: `components/Legend.tsx`

**Step 1: Update Legend container and text colors**

Replace the outer `<div>` className:
```tsx
<div className="absolute bottom-20 md:bottom-8 left-4 bg-gray-900/80 backdrop-blur-xl rounded-xl shadow-lg px-3 py-2.5 flex flex-col gap-1 z-10 border border-white/10">
```

Replace the header `<p>`:
```tsx
<p className="text-[10px] text-white/40 font-semibold uppercase tracking-wide mb-0.5">Filter type</p>
```

Replace the label `<span>` in each button:
```tsx
<span className={`font-medium ${isActive ? 'text-white' : 'text-white/70'}`}>{label}</span>
```

Replace the Clear button:
```tsx
<button
  onClick={onClear}
  className="text-[10px] text-white/40 hover:text-white/70 underline mt-1 text-left"
>
  Clear
</button>
```

**Step 2: Commit**

```bash
git add components/Legend.tsx
git commit -m "Dark glass legend"
```

---

### Task 8: Bottom sheet card-style items and colored header strip

**Files:**
- Modify: `components/BottomSheet.tsx`

**Step 1: Add TYPE_COLORS constant**

Add at top of file after the existing constants:

```tsx
const TYPE_COLORS: Record<string, string> = {
  Hotel:        '#3B82F6',
  Restaurant:   '#EF4444',
  Activity:     '#10B981',
  Flight:       '#8B5CF6',
  Train:        '#F59E0B',
  Ferry:        '#06B6D4',
  'Car Rental': '#F97316',
}
```

**Step 2: Add colored header strip to detail view**

Replace the opening of the detail view content. Change:
```tsx
{showDetail ? (
  <div className="px-4 pb-8">
    {selected!.priority && (
      <div style={{
        height: 3, borderRadius: 2, width: 32, marginBottom: 12,
        background: PRIORITY_COLORS[selected!.priority] ?? '#d1d5db',
      }} />
    )}
```

To:
```tsx
{showDetail ? (
  <div className="pb-8">
    <div
      className="h-3 rounded-b-sm mb-4"
      style={{ background: TYPE_COLORS[selected!.type ?? ''] ?? '#6B7280' }}
    />
    <div className="px-4">
    {selected!.priority && (
      <div style={{
        height: 3, borderRadius: 2, width: 32, marginBottom: 12,
        background: PRIORITY_COLORS[selected!.priority] ?? '#d1d5db',
      }} />
    )}
```

And add a closing `</div>` before the detail view's closing `</div>`:
```tsx
            </div>  {/* close px-4 wrapper */}
          </div>
```

**Step 3: Update list items to card style**

Replace the list item button:
```tsx
<button
  key={item.id}
  onClick={() => onSelect(item)}
  className="w-full text-left px-3 mb-1.5"
>
  <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 active:bg-gray-100 transition-colors">
    <span className="text-base flex-shrink-0">{TYPE_EMOJIS[item.type ?? ''] ?? '📍'}</span>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
      <div className="flex items-center gap-2 mt-0.5">
        {item.legCity && <span className="text-xs text-gray-400 truncate">{item.legCity}</span>}
        {item.date && <span className="text-xs text-gray-300 flex-shrink-0">{formatDate(item.date)}</span>}
      </div>
    </div>
    <div className="flex-shrink-0 flex flex-col items-end gap-1">
      {dist && <span className="text-xs font-medium text-blue-400">{dist}</span>}
      {item.status && (
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: STATUS_COLORS[item.status] ?? '#9ca3af' }}
        />
      )}
    </div>
  </div>
</button>
```

**Step 4: Commit**

```bash
git add components/BottomSheet.tsx
git commit -m "Card-style bottom sheet items with colored type header"
```

---

### Task 9: Final build check and visual verification

**Step 1: Run type check**

Run: `npx tsc --noEmit`

Fix any TypeScript errors.

**Step 2: Visual verification checklist**

- [ ] Home page: cards show cover images with gradient overlay
- [ ] Home page: fallback gradient works for trips without cover images
- [ ] Home page: status badge is frosted glass, top-left
- [ ] Home page: hover zooms photo, scales card
- [ ] Trip header: dark glass with white text
- [ ] Trip header: unmapped warning is amber dot
- [ ] Toolbar: dark glass, search input dark
- [ ] Toolbar: sort picker dark pills
- [ ] Toolbar: active filters have colored glow
- [ ] Timeline: dark chips, selected is white, today pulses
- [ ] Sidebar: dark background, colored accent bars on type headers
- [ ] Sidebar: selected item has blue left border + bg
- [ ] Legend: dark glass
- [ ] Map buttons: dark glass
- [ ] Bottom sheet: card-style items
- [ ] Bottom sheet: colored type header strip on detail view
- [ ] Mobile: bottom sheet still white/readable

**Step 3: Commit if any fixes**

```bash
git add -A
git commit -m "Fix build issues from UI polish"
```
