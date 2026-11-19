import { describe, expect, it } from "vitest";
import { createChicagoState } from "@/lib/demo/chicago";
import { reducer } from "@/lib/store";
import { recommendationToActivity, scoreRecommendations } from "@/lib/recommendations";
import { findCoordinatedFlights, importStateOf, pickupGroups, sampleFlightsFor } from "@/lib/flights";
import { buildTripState } from "@/lib/createTrip";

describe("recommendations", () => {
  it("is deterministic", () => {
    const a = scoreRecommendations(createChicagoState()).map((r) => r.rec.id);
    const b = scoreRecommendations(createChicagoState()).map((r) => r.rec.id);
    expect(a).toEqual(b);
  });
  it("explains each pick with real signals and never claims an AI model", () => {
    const list = scoreRecommendations(createChicagoState());
    expect(list.length).toBeGreaterThan(0);
    for (const r of list) {
      expect(r.explanation.length).toBeGreaterThan(20);
      expect(r.explanation).not.toMatch(/\bAI\b|model|GPT/i);
    }
  });
  it("matches the trip vibe and interests", () => {
    const top = scoreRecommendations(createChicagoState()).slice(0, 3).map((r) => r.rec.id);
    expect(top).toContain("r-sunset-cruise");
    expect(scoreRecommendations(createChicagoState()).find((r) => r.rec.id === "r-sunset-cruise")!.explanation).toMatch(/outdoors/i);
  });
  it("penalizes busy windows", () => {
    const s = createChicagoState();
    const open = scoreRecommendations(s).find((r) => r.rec.id === "r-comedy")!;
    expect(open.fits.window).toBe(true);
    // Comedy is 22:00 to midnight on the 14th. Dinner at Aba ends at 21:30, so the slot is open until something overlaps it.
    const busy = reducer(s, { type: "addActivity", activity: { id: "x", tripId: s.trip.id, createdBy: "maya", title: "Late", category: "Other", timeStatus: "scheduled", date: "2027-03-14", startTime: "21:30", status: "proposed" } });
    const after = scoreRecommendations(busy).find((r) => r.rec.id === "r-comedy")!;
    expect(after.fits.window).toBe(false);
    expect(after.score).toBeLessThan(open.score);
  });
  it("treats back-to-back plans as open and overlapping plans as busy", () => {
    const s = createChicagoState();
    // Sunset cruise 17:30 to 19:30 on the 14th touches Aba at 19:30 but does not overlap it.
    expect(scoreRecommendations(s).find((r) => r.rec.id === "r-sunset-cruise")!.fits.window).toBe(true);
    // Rooftop cocktails 21:30 overlaps Aba (19:30 to 21:30)? It starts as Aba ends, so still open.
    expect(scoreRecommendations(s).find((r) => r.rec.id === "r-rooftop")!.fits.window).toBe(true);
    // The 15th 11:00 boat tour blocks a morning-to-noon suggestion on that day.
    const clash = { ...s, recommendations: s.recommendations.map((r) => (r.id === "r-jazz" ? { ...r, suggestedDate: "2027-03-15", suggestedTime: "11:30" } : r)) };
    expect(scoreRecommendations(clash).find((r) => r.rec.id === "r-jazz")!.fits.window).toBe(false);
  });
  it("respects budget", () => {
    const s = createChicagoState();
    const tight = { ...s, trip: { ...s.trip, estimatedBudget: 30 } };
    const spa = scoreRecommendations(tight).find((r) => r.rec.id === "r-spa")!;
    expect(spa.fits.budget).toBe(false);
  });
  it("removes dismissed items and converts to activities", () => {
    let s = createChicagoState();
    const rec = s.recommendations[0];
    s = reducer(s, { type: "recAction", id: rec.id, action: "dismiss" });
    expect(scoreRecommendations(s).some((r) => r.rec.id === rec.id)).toBe(false);
    const idea = recommendationToActivity(rec, s.trip.id, "maya", true, "a-x");
    expect(idea).toMatchObject({ status: "idea", timeStatus: "tbd", date: undefined });
    const proposed = recommendationToActivity(rec, s.trip.id, "maya", false, "a-y");
    expect(proposed.status).toBe("proposed");
  });
  it("add to ideas adds an activity and marks the suggestion", () => {
    let s = createChicagoState();
    const rec = s.recommendations[1];
    s = reducer(s, { type: "recAction", id: rec.id, action: "idea", activity: recommendationToActivity(rec, s.trip.id, "maya", true, "a-z") });
    expect(s.activities.some((a) => a.id === "a-z" && a.status === "idea")).toBe(true);
    expect(s.recommendations.find((r) => r.id === rec.id)!.status).toBe("idea");
  });
});

describe("flights", () => {
  it("finds the Maya and Noah ride-share window from seeded arrivals", () => {
    const groups = pickupGroups(createChicagoState());
    expect(groups.length).toBeGreaterThan(0);
    const names = groups.flatMap((g) => g.users.map((u) => u.name));
    expect(names).toEqual(expect.arrayContaining(["Maya", "Noah"]));
  });
  it("marks members without flights as needing import", () => {
    const s = createChicagoState();
    expect(importStateOf(s, "sofia")).toBe("needs_import");
    expect(importStateOf(s, "maya")).toBe("imported");
  });
  it("search gives exactly one recommended option with a reason that quotes real numbers", () => {
    const s = createChicagoState();
    const sofia = s.users.find((u) => u.id === "sofia")!;
    const { options, anchor } = findCoordinatedFlights(s, sofia);
    expect(options).toHaveLength(3);
    expect(options.filter((o) => o.recommended)).toHaveLength(1);
    expect(options[0].recommended).toBe(true);
    expect(anchor?.name).toBe("Maya");
    expect(options[0].why).toMatch(/^Best match for the group: arrives within \d+ minutes of Maya/);
    // The recommended option is the one closest to the anchor.
    expect(Math.abs(options[0].minutesFromAnchor)).toBe(Math.min(...options.map((o) => Math.abs(o.minutesFromAnchor))));
  });
  it("sample imports produce an arrival and a departure on the trip dates", () => {
    const s = createChicagoState();
    const flights = sampleFlightsFor(s, s.users[4], "calendar", (p) => `${p}-1`);
    expect(flights.map((f) => f.direction)).toEqual(["arrival", "departure"]);
    expect(flights[0].arrivalTime.startsWith(s.trip.startDate)).toBe(true);
    expect(flights[1].departureTime.startsWith(s.trip.endDate)).toBe(true);
  });
  it("replaces a member's existing flights instead of duplicating them", () => {
    let s = createChicagoState();
    s = reducer(s, { type: "addFlights", flights: sampleFlightsFor(s, s.users[0], "email", (p) => `${p}-n`) });
    expect(s.flights.filter((f) => f.userId === "maya")).toHaveLength(2);
  });
});

describe("create trip", () => {
  const input = { title: "Lisbon Long Weekend", destination: "Lisbon, Portugal", startDate: "2027-04-10", endDate: "2027-04-13", description: "", vibeTags: ["Foodie"], estimatedBudget: 60, themeId: "sunset-beach", visibility: "invite_only" as const, allowGuestsToPropose: false, starters: [{ title: "Pasteis tour", category: "Food", cost: 25 }] };
  it("builds a host-only trip with starters as ideas", () => {
    const s = buildTripState(input, (p) => `${p}-t`);
    expect(s.trip.memberIds).toEqual(["maya"]);
    expect(s.activities).toHaveLength(1);
    expect(s.activities[0].status).toBe("idea");
    expect(s.trip.slug).toBe("lisbon-long-weekend");
    expect(s.flights).toHaveLength(0);
  });
  it("shifts suggestion dates into the new trip and drops Chicago wording", () => {
    const s = buildTripState(input, (p) => `${p}-t`);
    for (const r of s.recommendations) {
      if (r.suggestedDate) expect(r.suggestedDate >= "2027-04-10" && r.suggestedDate <= "2027-04-13").toBe(true);
      expect(`${r.title} ${r.description}`).not.toMatch(/Chicago|Art Institute|Old Town|Navy Pier|lakefront/i);
    }
  });
});
