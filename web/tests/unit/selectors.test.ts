import { describe, expect, it } from "vitest";
import { createChicagoState } from "@/lib/demo/chicago";
import { reducer } from "@/lib/store";
import { costLines, groupCost, paymentState, pendingFor, personalCost, responseOf, tally, tripDays } from "@/lib/selectors";

const seed = () => createChicagoState();
const act = (s: ReturnType<typeof seed>, id: string) => s.activities.find((a) => a.id === id)!;

describe("seed data", () => {
  it("matches the protocol", () => {
    const s = seed();
    expect(s.trip.title).toBe("Chicago Birthday Weekend");
    expect(s.trip.startDate).toBe("2027-03-14");
    expect(s.trip.endDate).toBe("2027-03-16");
    expect(s.users.map((u) => u.name)).toEqual(["Maya", "Jordan", "Priya", "Eli", "Sofia", "Noah"]);
    expect(s.activities).toHaveLength(7);
    expect(act(s, "a-aba").estimatedCostPerPerson).toBe(65);
    expect(act(s, "a-bday").estimatedCostPerPerson).toBe(95);
    expect(act(s, "a-drinks").status).toBe("proposed");
    expect(act(s, "a-picnic").status).toBe("idea");
    expect(act(s, "a-brunch").timeStatus).toBe("tbd");
  });
  it("has varied responses so the feature is obvious", () => {
    const kinds = new Set(seed().responses.map((r) => r.response));
    expect(kinds).toEqual(new Set(["yes", "maybe", "no"]));
  });
  it("only references real users and activities", () => {
    const s = seed();
    for (const r of s.responses) {
      expect(s.users.some((u) => u.id === r.userId)).toBe(true);
      expect(s.activities.some((a) => a.id === r.activityId)).toBe(true);
    }
    for (const f of s.flights) expect(s.users.some((u) => u.id === f.userId)).toBe(true);
  });
});

describe("tally and RSVP behavior", () => {
  it("counts a response change immediately", () => {
    let s = seed();
    expect(tally(s, act(s, "a-picnic")).yes).toHaveLength(2);
    s = reducer(s, { type: "respond", activityId: "a-picnic", userId: "maya", response: "yes" });
    expect(tally(s, act(s, "a-picnic")).yes).toHaveLength(3);
    s = reducer(s, { type: "respond", activityId: "a-picnic", userId: "maya", response: "no" });
    expect(tally(s, act(s, "a-picnic")).yes).toHaveLength(2);
    expect(tally(s, act(s, "a-picnic")).no.map((u) => u.id)).toContain("maya");
    // One response per person per activity.
    expect(s.responses.filter((r) => r.activityId === "a-picnic" && r.userId === "maya")).toHaveLength(1);
  });
  it("flags everyone-in only when all eligible members say yes", () => {
    let s = seed();
    expect(tally(s, act(s, "a-drinks")).everyoneIn).toBe(false);
    s = reducer(s, { type: "respond", activityId: "a-drinks", userId: "maya", response: "yes" });
    expect(tally(s, act(s, "a-drinks")).everyoneIn).toBe(true);
  });
  it("ignores members who are not going", () => {
    let s = seed();
    s = reducer(s, { type: "setTripResponse", userId: "noah", response: "not_going" });
    expect(tally(s, act(s, "a-picnic")).no.map((u) => u.id)).not.toContain("noah");
    expect(tally(s, act(s, "a-picnic")).pending.map((u) => u.id)).not.toContain("noah");
  });
  it("reports capacity warnings", () => {
    let s = seed();
    const boat = () => tally(s, act(s, "a-boat"));
    expect(boat().capacity).toBe(5);
    expect(boat().yes).toHaveLength(3);
    s = reducer(s, { type: "respond", activityId: "a-boat", userId: "maya", response: "yes" });
    expect(boat().nearFull).toBe(true);
    s = reducer(s, { type: "respond", activityId: "a-boat", userId: "jordan", response: "yes" });
    expect(boat().full).toBe(true);
    expect(boat().nearFull).toBe(false);
  });
  it("decides when there is enough interest to book", () => {
    const s = seed();
    expect(tally(s, act(s, "a-drinks")).enoughInterest).toBe(true);
    expect(tally(s, act(s, "a-brunch")).enoughInterest).toBe(false); // 2 yes of 6 is not enough yet
    expect(tally(s, act(s, "a-picnic")).enoughInterest).toBe(false);
  });
  it("lists decisions waiting on the viewer", () => {
    const s = seed();
    expect(pendingFor(s).map((a) => a.id).sort()).toEqual(["a-boat", "a-brunch", "a-drinks", "a-picnic"]);
    expect(pendingFor(s, "jordan")).toHaveLength(0);
  });
});

describe("costs", () => {
  it("separates confirmed and tentative personal spend", () => {
    const s = seed();
    // Maya: hotel 120 + Aba 65 + birthday 95 confirmed, nothing tentative yet.
    expect(personalCost(s)).toMatchObject({ confirmed: 280, tentative: 0, total: 280 });
  });
  it("updates personal cost as RSVPs change", () => {
    let s = seed();
    s = reducer(s, { type: "respond", activityId: "a-drinks", userId: "maya", response: "yes" });
    expect(personalCost(s)).toMatchObject({ confirmed: 280, tentative: 40, total: 320 });
    s = reducer(s, { type: "respond", activityId: "a-boat", userId: "maya", response: "maybe" });
    expect(personalCost(s)).toMatchObject({ total: 320, ifMaybe: 52 });
  });
  it("computes the group total from yes responses", () => {
    const g = groupCost(seed());
    const lines = costLines(seed());
    const aba = lines.find((l) => l.activity.id === "a-aba")!;
    expect(aba.groupTotal).toBe(65 * 6);
    expect(g.total).toBe(g.confirmed + g.tentative);
    expect(g.confirmed).toBe(lines.filter((l) => l.confirmed).reduce((n, l) => n + l.groupTotal, 0));
  });
  it("excludes cancelled activities", () => {
    let s = seed();
    const before = groupCost(s).total;
    s = reducer(s, { type: "setStatus", id: "a-aba", status: "cancelled" });
    expect(groupCost(s).total).toBe(before - 65 * 6);
  });
  it("derives payment states", () => {
    let s = seed();
    expect(paymentState(s, act(s, "a-hotel"), "maya")).toBe("paid");
    expect(paymentState(s, act(s, "a-hotel"), "priya")).toBe("unpaid");
    expect(paymentState(s, act(s, "a-drinks"), "maya")).toBe("tbd");
    s = reducer(s, { type: "setPayment", activityId: "a-hotel", userId: "priya", state: "paid" });
    expect(paymentState(s, act(s, "a-hotel"), "priya")).toBe("paid");
  });
});

describe("reducer", () => {
  it("adds an activity with the creator's yes", () => {
    let s = seed();
    s = reducer(s, { type: "addActivity", activity: { id: "a-new", tripId: s.trip.id, createdBy: "maya", title: "Karaoke", category: "Nightlife", timeStatus: "tbd", status: "idea" } });
    expect(act(s, "a-new").title).toBe("Karaoke");
    expect(responseOf(s, "a-new", "maya")).toBe("yes");
    expect(s.feed[0].text).toContain("Karaoke");
  });
  it("joins a new member once", () => {
    let s = seed();
    const user = { id: "u-1", name: "Alex", avatarUrl: "/avatars/sunny.svg", interests: [] };
    s = reducer(s, { type: "join", user });
    s = reducer(s, { type: "join", user });
    expect(s.users.filter((u) => u.id === "u-1")).toHaveLength(1);
    expect(s.trip.memberIds).toContain("u-1");
    expect(s.currentUserId).toBe("u-1");
    expect(personalCost(s).total).toBe(0);
    expect(pendingFor(s).length).toBeGreaterThan(0);
  });
  it("confirming moves an activity into the confirmed state", () => {
    const s = reducer(seed(), { type: "setStatus", id: "a-drinks", status: "confirmed" });
    expect(act(s, "a-drinks").status).toBe("confirmed");
  });
  it("reset restores the seed", () => {
    let s = reducer(seed(), { type: "respond", activityId: "a-picnic", userId: "maya", response: "yes" });
    s = reducer(s, { type: "reset" });
    expect(s).toEqual(createChicagoState());
  });
  it("does not mutate the previous state", () => {
    const before = seed();
    const snap = JSON.stringify(before);
    reducer(before, { type: "respond", activityId: "a-picnic", userId: "maya", response: "yes" });
    expect(JSON.stringify(before)).toBe(snap);
  });
});

describe("trip days", () => {
  it("lists every day in range", () => expect(tripDays(seed())).toEqual(["2027-03-14", "2027-03-15", "2027-03-16"]));
});
