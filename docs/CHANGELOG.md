# Changelog

## v2 (current)

Everything in v1 still works exactly as before. Added on top:

- **Four demo trips** with their own friends, votes, costs, flights, and suggestions: Chicago Birthday Weekend (default), Aspen Ski Weekend, Lisbon Bachelorette Weekend, Austin Live Music Weekend.
- **Trip switcher** (trip name in the header, "Switch trip" in More, and a gallery on the landing page). Each trip keeps its own saved changes. Created trips are added next to the demos and can be removed.
- **Overlap hints** when two plans on the same day run at the same time.
- **Edit permissions**: only the organizer or whoever suggested an activity can edit it. The organizer can turn off guest proposals when creating a trip.
- **Add flights for a friend** from their card on Travel (import or manual).
- **Day jump chips** on the phone itinerary.
- **Friendly 404 page** and a favicon.
- **Suggestions now check real time overlap** instead of "something is already in that part of the day".
- **Fixes**: typing in any popup field kept losing focus after the first character; the page no longer flashes the starter trip before saved data loads; long names and links wrap instead of widening the page; several accessibility fixes (list markup, heading order, duplicate avatar descriptions, sidebar labels).
- **Tests**: 71 unit tests, and browser suites for core flows, multi-trip behavior, robustness (corrupt or blocked storage, long text, keyboard focus), and an accessibility audit of every screen. Run `npm run check` in `web/`.
- Data saved by v1 is migrated automatically.

## v1 (baseline)

The first approved prototype: landing, create flow, invitation and join, trip home, itinerary, activity detail and editing, guests, costs, travel and flights, recommendations, profile, share modal, and the Chicago demo trip.

### Going back to v1

Two ways, both safe:

1. **Git tag.** From the repository root: `git checkout v1-baseline` to look at it (return with `git checkout main`), or `git checkout -b v1-copy v1-baseline` to branch from it.
2. **Archive.** `archive/web-v1-baseline.zip` holds the v1 source of `web/`. Unzip it somewhere else, run `npm install`, then `npm run dev`.
