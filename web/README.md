# Group trip planner prototype (web)

Static Next.js prototype. Demo data only: no backend, no API keys, no paid services.

## Run it

From the repository root, the portable Node install lives in `../.tools`. If you already have Node 20+, skip the PATH line.

```bash
export PATH="$PWD/../.tools/node-v26.13.1-darwin-arm64/bin:$PATH"
npm install
npm run dev        # http://localhost:3000
npm run check      # type check + lint + static build
```

The static site is written to `out/` by `npm run build` and can be opened from any static file host.

## Renaming the product (Travely or Joliday)

The name lives in one place: `lib/brand.ts`. Change `BRAND_NAME`, or set `NEXT_PUBLIC_BRAND_NAME=Joliday` in `.env.local`, then rebuild. Nothing else in the code is name-specific.

## Folder map

```
app/                 Routes (one folder per screen)
  page.tsx             Landing
  create/              Create-trip flow (3 steps)
  invite/              Public invitation + join flow
  trip/                Trip workspace (shared shell in layout.tsx)
    page.tsx             Overview
    itinerary/           Day-by-day plan + Ideas
    activity/            Activity detail (?id=) and edit/ (new or ?id=)
    guests/ costs/ travel/ recommendations/ more/ profile/
components/
  ui/                  Generic pieces: Button, Modal, Field, Avatar, Sticker
  layout/              TripShell, BottomNavigation, SideNavigation
  trip/                Product pieces: ActivityCard, RSVPControl, CostSummary...
lib/
  types.ts             Data model
  seed.ts              Chicago demo data
  store.ts             State + localStorage persistence + Reset Demo
  selectors.ts         Derived data: tallies, costs, pending decisions
  recommendations.ts   Deterministic "For your group" matching
  flights.ts           Mock flight search + pickup grouping
  schemas.ts           Zod validation
  brand.ts constants.ts format.ts createTrip.ts toast.ts useNow.ts
public/                Bundled SVG covers and avatars (generated)
scripts/               generate-assets.mjs (npm run assets)
```
