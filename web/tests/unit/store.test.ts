import { describe, expect, it } from "vitest";
import { createChicagoState } from "@/lib/demo/chicago";
import { DEMO_TRIPS, createDemoTrip } from "@/lib/demo";
import { rootReducer, type RootState } from "@/lib/store";
import { STORE_VERSION } from "@/lib/constants";
import { buildTripState } from "@/lib/createTrip";
import { canEditActivity, conflictsFor, costLines, groupCost, members, pendingFor, responseOf, tally, tripDays } from "@/lib/selectors";
import { findCoordinatedFlights, importStateOf, pickupGroups } from "@/lib/flights";
import { scoreRecommendations } from "@/lib/recommendations";
import { differenceInCalendarDays, parseISO } from "date-fns";

const root = (): RootState => {
  const c = createChicagoState();
  return { version: STORE_VERSION, activeId: c.trip.id, trips: { [c.trip.id]: c } };
};

describe("multi-trip store", () => {
  it("opens a demo trip lazily and keeps each trip's changes separate", () => {
    let r = root();
    r = rootReducer(r, { type: "respond", activityId: "a-picnic", userId: "maya", response: "yes" });
    r = rootReducer(r, { type: "switchTrip", id: "trip-aspen" });
    expect(r.activeId).toBe("trip-aspen");
    expect(Object.keys(r.trips)).toEqual(["trip-chicago", "trip-aspen"]);
    r = rootReducer(r, { type: "respond", activityId: "ap-snowshoe", userId: "dev", response: "yes" });
    r = rootReducer(r, { type: "switchTrip", id: "trip-chicago" });
    expect(responseOf(r.trips["trip-chicago"], "a-picnic", "maya")).toBe("yes");
    expect(responseOf(r.trips["trip-aspen"], "ap-snowshoe", "dev")).toBe("yes");
  });
  it("ignores unknown trip ids", () => {
    const r = root();
    expect(rootReducer(r, { type: "switchTrip", id: "nope" })).toBe(r);
  });
  it("adds a created trip without removing the demos", () => {
    const created = buildTripState({ title: "Mine", destination: "Rome", startDate: "2027-06-01", endDate: "2027-06-03", description: "", vibeTags: [], themeId: "garden-brunch", visibility: "anyone_with_link", allowGuestsToPropose: true, starters: [] }, (p) => `${p}-1`);
    const r = rootReducer(root(), { type: "addTrip", state: created });
    expect(r.activeId).toBe(created.trip.id);
    expect(r.trips["trip-chicago"]).toBeDefined();
  });
  it("deleting the open trip falls back to a remaining one; deleting the last restores the default", () => {
    let r = rootReducer(root(), { type: "switchTrip", id: "trip-austin" });
    r = rootReducer(r, { type: "deleteTrip", id: "trip-austin" });
    expect(r.activeId).toBe("trip-chicago");
    r = rootReducer(r, { type: "deleteTrip", id: "trip-chicago" });
    expect(Object.keys(r.trips)).toEqual(["trip-chicago"]);
  });
  it("reset restores everything", () => {
    let r = rootReducer(root(), { type: "switchTrip", id: "trip-lisbon" });
    r = rootReducer(r, { type: "reset" });
    expect(Object.keys(r.trips)).toEqual(["trip-chicago"]);
    expect(r.trips["trip-chicago"]).toEqual(createChicagoState());
  });
});

describe.each(DEMO_TRIPS.map((d) => [d.preview.title, d.id] as const))("demo trip: %s", (_name, id) => {
  const s = createDemoTrip(id)!;
  it("is internally consistent", () => {
    const ids = new Set(s.users.map((u) => u.id));
    expect(s.users.length).toBeGreaterThanOrEqual(5);
    expect(ids.has(s.trip.hostId)).toBe(true);
    expect(s.currentUserId).toBe(s.trip.hostId);
    expect(s.memberships).toHaveLength(s.users.length);
    expect(s.memberships.find((m) => m.userId === s.trip.hostId)?.role).toBe("host");
    expect(new Set(s.activities.map((a) => a.id)).size).toBe(s.activities.length);
    for (const a of s.activities) {
      expect(a.tripId).toBe(s.trip.id);
      expect(ids.has(a.createdBy)).toBe(true);
      expect(a.timeStatus === "scheduled").toBe(!!a.startTime);
      if (a.date) expect(tripDays(s)).toContain(a.date);
      if (a.status === "confirmed") expect(a.timeStatus === "scheduled" || a.id.includes("pancakes")).toBeTruthy();
    }
    for (const r of s.responses) {
      expect(ids.has(r.userId)).toBe(true);
      expect(s.activities.some((a) => a.id === r.activityId)).toBe(true);
    }
    // No duplicate answers from the same person.
    const keys = s.responses.map((r) => `${r.activityId}:${r.userId}`);
    expect(new Set(keys).size).toBe(keys.length);
    for (const f of s.flights) expect(ids.has(f.userId)).toBe(true);
  });
  it("has every status and response kind and open decisions for the host", () => {
    expect(new Set(s.activities.map((a) => a.status))).toEqual(new Set(["confirmed", "proposed", "idea"]));
    expect(new Set(s.responses.map((r) => r.response))).toEqual(new Set(["yes", "maybe", "no"]));
    expect(pendingFor(s).length).toBeGreaterThan(0);
  });
  it("only has flights whose times make sense", () => {
    for (const f of s.flights) {
      expect(f.arrivalTime > f.departureTime || f.direction === "departure").toBe(true);
      if (f.direction === "arrival") expect(differenceInCalendarDays(parseISO(f.arrivalTime), parseISO(s.trip.startDate))).toBe(0);
    }
    expect(s.flights.some((f) => f.direction === "arrival")).toBe(true);
  });
  it("produces costs, a pickup or import state, and recommendations", () => {
    expect(groupCost(s).total).toBeGreaterThan(0);
    expect(costLines(s).length).toBeGreaterThan(3);
    expect(scoreRecommendations(s).length).toBeGreaterThanOrEqual(5);
    expect(members(s).some((u) => importStateOf(s, u.id) === "needs_import")).toBe(true);
    const guest = s.users.find((u) => importStateOf(s, u.id) === "needs_import")!;
    expect(findCoordinatedFlights(s, guest).options).toHaveLength(3);
    void pickupGroups(s);
  });
  it("dates fall on the trip's own days", () => {
    for (const r of s.recommendations) if (r.suggestedDate) expect(tripDays(s)).toContain(r.suggestedDate);
  });
});

describe("demo trips specifically built to exercise features", () => {
  it("Chicago, Aspen and Austin each have a capacity-limited activity close to full", () => {
    const near = (id: string) => createDemoTrip(id)!.activities.filter((a) => a.capacity).some((a) => {
      const t = tally(createDemoTrip(id)!, a);
      return t.nearFull || t.full;
    });
    expect(near("trip-chicago")).toBe(true);
    expect(near("trip-aspen")).toBe(true);
    expect(near("trip-austin")).toBe(true);
  });
  it("Lisbon has overlapping Saturday plans", () => {
    const s = createDemoTrip("trip-lisbon")!;
    const sintra = s.activities.find((a) => a.id === "lx-sintra")!;
    const tiles = s.activities.find((a) => a.id === "lx-tiles")!;
    expect(sintra.date).toBe(tiles.date);
    expect(tiles.startTime! < sintra.endTime! && sintra.startTime! < tiles.endTime!).toBe(true);
  });
  it("Austin has a free activity and Aspen has a $0 one", () => {
    expect(createDemoTrip("trip-austin")!.activities.some((a) => a.estimatedCostPerPerson === 0)).toBe(true);
    expect(createDemoTrip("trip-aspen")!.activities.some((a) => a.estimatedCostPerPerson === 0)).toBe(true);
  });
  it("Lisbon arrivals include overnight flights that depart the day before", () => {
    const s = createDemoTrip("trip-lisbon")!;
    const f = s.flights.find((x) => x.id === "f-zoe-in")!;
    expect(f.departureTime.startsWith("2027-05-20")).toBe(true);
    expect(f.arrivalTime.startsWith("2027-05-21")).toBe(true);
  });
});

describe("conflicts and permissions", () => {
  it("flags overlapping plans on the same day, and not back-to-back ones", () => {
    const lisbon = createDemoTrip("trip-lisbon")!;
    const sintra = lisbon.activities.find((a) => a.id === "lx-sintra")!;
    expect(conflictsFor(lisbon, sintra).map((a) => a.id)).toEqual(["lx-tiles"]);
    const chicago = createChicagoState();
    // Aba ends 21:30 on the 14th and nothing else overlaps it.
    expect(conflictsFor(chicago, chicago.activities.find((a) => a.id === "a-aba")!)).toEqual([]);
    // Boat 11:00 to 12:30 and Drinks 17:30 on the 15th do not overlap.
    expect(conflictsFor(chicago, chicago.activities.find((a) => a.id === "a-boat")!)).toEqual([]);
  });
  it("ignores ideas, cancelled plans, and plans without times", () => {
    const lisbon = createDemoTrip("trip-lisbon")!;
    const cancelled = { ...lisbon, activities: lisbon.activities.map((a) => (a.id === "lx-tiles" ? { ...a, status: "cancelled" as const } : a)) };
    expect(conflictsFor(cancelled, cancelled.activities.find((a) => a.id === "lx-sintra")!)).toEqual([]);
  });
  it("lets only the organizer or the creator edit", () => {
    const s = createChicagoState();
    const drinks = s.activities.find((a) => a.id === "a-drinks")!; // created by Jordan
    expect(canEditActivity(s, drinks, "maya")).toBe(true); // organizer
    expect(canEditActivity(s, drinks, "jordan")).toBe(true); // creator
    expect(canEditActivity(s, drinks, "eli")).toBe(false);
  });
});
