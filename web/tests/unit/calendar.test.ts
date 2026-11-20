import { describe, expect, it } from "vitest";
import { createChicagoState } from "@/lib/demo/chicago";
import { DEMO_TRIPS } from "@/lib/demo";
import { buildIcs, calendarActivities, layoutDay, monthsCovering, monthWeeks, visibleHours } from "@/lib/calendar";
import { tripDays } from "@/lib/selectors";
import type { Activity } from "@/lib/types";

const act = (id: string, startTime?: string, endTime?: string): Activity => ({ id, tripId: "t", createdBy: "u", title: id, category: "Food", date: "2027-03-14", startTime, endTime, timeStatus: startTime ? "scheduled" : "tbd", status: "proposed" });

describe("month grid", () => {
  it("covers a trip inside one month, and one that crosses a month end", () => {
    expect(monthsCovering("2027-03-13", "2027-03-16")).toEqual([{ year: 2027, month: 2 }]);
    expect(monthsCovering("2027-03-30", "2027-04-02")).toEqual([{ year: 2027, month: 2 }, { year: 2027, month: 3 }]);
    expect(monthsCovering("2026-12-30", "2027-01-02")).toEqual([{ year: 2026, month: 11 }, { year: 2027, month: 0 }]);
  });
  it("builds full Sunday-first weeks that contain every day of the month", () => {
    const weeks = monthWeeks({ year: 2027, month: 2 });
    expect(weeks.every((w) => w.length === 7)).toBe(true);
    const flat = weeks.flat();
    expect(flat).toContain("2027-03-01");
    expect(flat).toContain("2027-03-31");
    expect(new Date(`${weeks[0][0]}T12:00`).getDay()).toBe(0);
    expect(new Set(flat).size).toBe(flat.length);
  });
  it("handles a leap-year February", () => {
    expect(monthWeeks({ year: 2028, month: 1 }).flat()).toContain("2028-02-29");
  });
});

describe("day layout", () => {
  it("puts plans that do not overlap in one full-width column", () => {
    const b = layoutDay([act("a", "09:00", "10:00"), act("b", "10:00", "11:00")]);
    expect(b.map((x) => [x.col, x.cols])).toEqual([[0, 1], [0, 1]]);
  });
  it("splits the width between overlapping plans", () => {
    const b = layoutDay([act("a", "11:00", "13:00"), act("b", "12:00", "14:00"), act("c", "12:30", "13:30")]);
    expect(b.map((x) => x.col).sort()).toEqual([0, 1, 2]);
    expect(b.every((x) => x.cols === 3)).toBe(true);
  });
  it("reuses a freed column and keeps separate clusters independent", () => {
    const b = layoutDay([act("a", "09:00", "10:00"), act("b", "09:30", "11:00"), act("c", "10:00", "10:45"), act("d", "15:00", "16:00")]);
    const by = Object.fromEntries(b.map((x) => [x.activity.id, x]));
    expect(by.c.col).toBe(0);
    expect(by.d.cols).toBe(1);
  });
  it("treats a plan with no end time as two hours, and ignores plans with no time", () => {
    const b = layoutDay([act("a", "10:00"), act("b", "11:30"), act("c")]);
    expect(b).toHaveLength(2);
    expect(b[0].end - b[0].start).toBe(120);
    expect(b.every((x) => x.cols === 2)).toBe(true);
  });
  it("widens the visible hours for early and late plans only", () => {
    expect(visibleHours(layoutDay([act("a", "12:00", "13:00")]))).toEqual([9, 21]);
    expect(visibleHours(layoutDay([act("a", "06:30", "07:30"), act("b", "22:00", "23:30")]))).toEqual([6, 24]);
  });
});

describe("calendar data", () => {
  it("leaves out ideas, cancelled plans and undated plans", () => {
    for (const d of DEMO_TRIPS) {
      const s = d.create();
      const days = tripDays(s);
      for (const a of calendarActivities(s)) {
        expect(a.status === "idea" || a.status === "cancelled" || !a.date).toBe(false);
        expect(days).toContain(a.date);
      }
    }
  });
});

describe(".ics export", () => {
  const fixed = new Date(2027, 0, 1, 9, 0, 0);
  it("writes a valid calendar with one event per confirmed plan", () => {
    const s = createChicagoState();
    const confirmed = s.activities.filter((a) => a.status === "confirmed" && a.date).length;
    const ics = buildIcs(s, { now: fixed });
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect((ics.match(/BEGIN:VEVENT/g) ?? []).length).toBe(confirmed);
    expect(ics).toContain("DTSTART:20270314T150000");
    expect(ics).toContain("SUMMARY:Hotel check-in");
    expect(ics).not.toMatch(/(^|\n)[^\r\n]{76,}/);
  });
  it("exports a single chosen plan and uses a date-only start when the time is open", () => {
    const s = createChicagoState();
    const one = buildIcs(s, { only: ["a-boat"], now: fixed });
    expect((one.match(/BEGIN:VEVENT/g) ?? []).length).toBe(1);
    expect(one).toContain("STATUS:TENTATIVE");
    expect(one).toContain("DTEND:20270315T123000");
    const tbd = { ...s, activities: s.activities.map((a) => (a.id === "a-boat" ? { ...a, startTime: undefined, endTime: undefined, timeStatus: "tbd" as const } : a)) };
    expect(buildIcs(tbd, { only: ["a-boat"], now: fixed })).toContain("DTSTART;VALUE=DATE:20270315");
  });
  it("escapes commas, semicolons and line breaks", () => {
    const s = createChicagoState();
    const odd = { ...s, activities: s.activities.map((a) => (a.id === "a-boat" ? { ...a, title: "Boat; tour, deluxe", description: "Line one\nLine two" } : a)) };
    const ics = buildIcs(odd, { only: ["a-boat"], now: fixed });
    expect(ics).toContain("SUMMARY:Boat\; tour\\, deluxe");
    expect(ics).toContain("Line one\\nLine two");
  });
  it("can add the viewer's own flights", () => {
    const s = createChicagoState();
    const withFlights = buildIcs(s, { includeFlights: true, now: fixed });
    const mine = s.flights.filter((f) => f.userId === s.currentUserId).length;
    expect((withFlights.match(/SUMMARY:(Land|Fly home)/g) ?? []).length).toBe(mine);
  });
});
