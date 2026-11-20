import { describe, expect, it } from "vitest";
import { createChicagoState } from "@/lib/demo/chicago";
import { DEMO_TRIPS } from "@/lib/demo";
import { reducer } from "@/lib/store";
import { buildTripState } from "@/lib/createTrip";
import { costsOn } from "@/lib/selectors";
import { scoreRecommendations } from "@/lib/recommendations";
import { activitySchema } from "@/lib/schemas";

const base = { title: "Mine", destination: "Rome", startDate: "2027-06-01", endDate: "2027-06-03", description: "", vibeTags: [], themeId: "garden-brunch", visibility: "anyone_with_link" as const, allowGuestsToPropose: true, starters: [{ title: "Dinner", category: "Food", cost: 40 }] };

describe("optional costs", () => {
  it("every demo trip tracks costs, so the approved look is unchanged", () => {
    for (const d of DEMO_TRIPS) expect(costsOn(d.create())).toBe(true);
  });
  it("trips saved before the setting existed count as tracking costs", () => {
    const s = createChicagoState();
    const { showCosts: _drop, ...trip } = s.trip;
    void _drop;
    expect(costsOn({ ...s, trip })).toBe(true);
  });
  it("turning costs off keeps every saved price, and turning them on restores the view", () => {
    const s = createChicagoState();
    const priced = s.activities.filter((a) => a.estimatedCostPerPerson !== undefined).length;
    const off = reducer(s, { type: "setShowCosts", value: false });
    expect(costsOn(off)).toBe(false);
    expect(off.activities.filter((a) => a.estimatedCostPerPerson !== undefined)).toHaveLength(priced);
    expect(costsOn(reducer(off, { type: "setShowCosts", value: true }))).toBe(true);
  });
  it("a new trip can start without costs and drops starter prices", () => {
    const off = buildTripState({ ...base, showCosts: false, estimatedBudget: 90 }, (p) => `${p}-1`);
    expect(costsOn(off)).toBe(false);
    expect(off.trip.estimatedBudget).toBeUndefined();
    expect(off.activities.every((a) => a.estimatedCostPerPerson === undefined)).toBe(true);
    const on = buildTripState(base, (p) => `${p}-1`);
    expect(costsOn(on)).toBe(true);
    expect(on.activities[0].estimatedCostPerPerson).toBe(40);
  });
  it("an activity needs no cost", () => {
    const r = activitySchema.safeParse({ title: "Walk the lake", category: "Outdoors", date: "", startTime: "", endTime: "", timeTbd: true, address: "", cost: "", capacity: "", link: "", deadline: "", notes: "", image: "" });
    expect(r.success).toBe(true);
  });
  it("suggestions ignore price when costs are off and explain nothing about budget", () => {
    const s = createChicagoState();
    const off = reducer(s, { type: "setShowCosts", value: false });
    const scored = scoreRecommendations(off);
    expect(scored.some((x) => x.explanation.includes("budget"))).toBe(false);
    expect(scoreRecommendations(s).some((x) => x.explanation.includes("budget"))).toBe(true);
  });
});
