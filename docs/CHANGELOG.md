# Changelog

## v3 (current)

Everything in v2 still works. The demo trips look the same because costs stay on for them.

- **Costs are optional.** A per-trip "Track costs" switch (Profile > Trip settings, organizer only, and in the create-trip flow). When off, every price, share, total, payment label and budget is hidden, including on the activity form, flight options and suggestions. Saved prices are kept and come back when the switch is turned on.
- **No cost needed to propose an activity.** The cost field is labeled optional and can be left empty, with costs on or off.
- **Hosting on GitHub Pages**: deploy workflow, base-path support, `docs/HOSTING_PLAN.md`, `CONTRIBUTING.md`.
- Tests: 77 unit tests, and a new browser suite for the costs setting. Browser tests can also run against the hosted build.

## v2

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
