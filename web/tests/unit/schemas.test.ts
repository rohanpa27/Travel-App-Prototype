import { describe, expect, it } from "vitest";
import { activitySchema, flightSchema, joinSchema, toFieldErrors, tripBasicsSchema } from "@/lib/schemas";

const base = { title: "Dinner", category: "Food", timeTbd: false, date: "2027-03-14" };

describe("schemas", () => {
  it("rejects a trip that ends before it starts", () => {
    const r = tripBasicsSchema.safeParse({ title: "Trip", destination: "Rome", startDate: "2027-05-05", endDate: "2027-05-01", description: "" });
    expect(r.success).toBe(false);
    if (!r.success) expect(toFieldErrors(r.error).endDate).toMatch(/can't end before/);
  });
  it("requires a name when joining", () => expect(joinSchema.safeParse({ name: "  " }).success).toBe(false));
  it("validates activity fields", () => {
    expect(activitySchema.safeParse(base).success).toBe(true);
    expect(activitySchema.safeParse({ ...base, title: "" }).success).toBe(false);
    expect(activitySchema.safeParse({ ...base, cost: "abc" }).success).toBe(false);
    expect(activitySchema.safeParse({ ...base, cost: "-5" }).success).toBe(false);
    expect(activitySchema.safeParse({ ...base, link: "example.com" }).success).toBe(false);
    expect(activitySchema.safeParse({ ...base, link: "https://example.com/x" }).success).toBe(true);
    expect(activitySchema.safeParse({ ...base, capacity: "2.5" }).success).toBe(false);
    expect(activitySchema.safeParse({ ...base, startTime: "20:00", endTime: "19:00" }).success).toBe(false);
    expect(activitySchema.safeParse({ ...base, date: "", timeTbd: false }).success).toBe(false);
    expect(activitySchema.safeParse({ ...base, date: "", timeTbd: true }).success).toBe(true);
  });
  it("validates flights", () => {
    expect(flightSchema.safeParse({ airline: "", flightNumber: "UA 1", arrivalTime: "x", departureTime: "y" }).success).toBe(false);
    expect(flightSchema.safeParse({ airline: "United", flightNumber: "UA 1", arrivalTime: "2027-03-14T10:00", departureTime: "2027-03-16T10:00" }).success).toBe(true);
  });
});
