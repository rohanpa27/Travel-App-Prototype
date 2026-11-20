import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, parseISO, startOfMonth, startOfWeek } from "date-fns";
import type { Activity, AppState } from "./types";
import { brand } from "./brand";
import { activeActivities, currentUser } from "./selectors";

/** Plans without an end time are drawn (and checked for overlap) as two hours long. */
export const DEFAULT_LENGTH = 120;

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

// ---- Month grid ----------------------------------------------------------------
export type MonthRef = { year: number; month: number }; // month is 0-based

/** Every calendar month the trip touches, in order. A trip that crosses a month end gets two. */
export function monthsCovering(startIso: string, endIso: string): MonthRef[] {
  const out: MonthRef[] = [];
  let cur = startOfMonth(parseISO(startIso));
  const last = startOfMonth(parseISO(endIso));
  while (cur <= last) {
    out.push({ year: cur.getFullYear(), month: cur.getMonth() });
    cur = addMonths(cur, 1);
  }
  return out;
}

/** Weeks (Sunday first) of yyyy-MM-dd strings, padded with the neighbouring months so every row has seven days. */
export function monthWeeks({ year, month }: MonthRef): string[][] {
  const first = startOfMonth(new Date(year, month, 1));
  const days = eachDayOfInterval({ start: startOfWeek(first), end: endOfWeek(endOfMonth(first)) }).map((d) => format(d, "yyyy-MM-dd"));
  const weeks: string[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}

export const monthTitle = ({ year, month }: MonthRef) => format(new Date(year, month, 1), "MMMM yyyy");

// ---- A day's schedule ---------------------------------------------------------
/** Activities that belong on the calendar: dated, not an idea, not cancelled. */
export const calendarActivities = (s: AppState, date?: string) => activeActivities(s).filter((a) => a.date && a.status !== "idea" && (!date || a.date === date));

export type DayBlock = { activity: Activity; start: number; end: number; col: number; cols: number };

/** Places timed plans on a day. Plans that overlap share the width side by side instead of covering each other. */
export function layoutDay(activities: Activity[]): DayBlock[] {
  const timed = activities
    .filter((a) => a.startTime)
    .map((a) => {
      const start = toMinutes(a.startTime!);
      return { activity: a, start, end: Math.min(1440, a.endTime ? toMinutes(a.endTime) : start + DEFAULT_LENGTH) };
    })
    .sort((a, b) => a.start - b.start || a.end - b.end || a.activity.title.localeCompare(b.activity.title));

  const blocks: DayBlock[] = [];
  let cluster: DayBlock[] = [];
  let clusterEnd = -1;
  const close = () => {
    const cols = Math.max(1, ...cluster.map((b) => b.col + 1));
    for (const b of cluster) b.cols = cols;
    blocks.push(...cluster);
    cluster = [];
  };
  for (const item of timed) {
    if (cluster.length && item.start >= clusterEnd) close();
    // First column whose last plan has already ended.
    const used = cluster.filter((b) => b.end > item.start).map((b) => b.col);
    let col = 0;
    while (used.includes(col)) col += 1;
    cluster.push({ ...item, col, cols: 1 });
    clusterEnd = Math.max(clusterEnd, item.end);
  }
  if (cluster.length) close();
  return blocks;
}

/** The hours to draw: at least 9am to 9pm, widened to fit the plans. */
export function visibleHours(blocks: DayBlock[]): [number, number] {
  const from = Math.min(9, ...blocks.map((b) => Math.floor(b.start / 60)));
  const to = Math.max(21, ...blocks.map((b) => Math.ceil(b.end / 60)));
  return [Math.max(0, from), Math.min(24, to)];
}

// ---- .ics export -----------------------------------------------------------------
const esc = (v: string) => v.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
/** Lines over 75 characters are folded, as the format requires. */
const fold = (line: string) => (line.length <= 75 ? line : [line.slice(0, 75), ...(line.slice(75).match(/.{1,74}/g) ?? []).map((x) => ` ${x}`)].join("\r\n"));
const stamp = (d: Date) => format(d, "yyyyMMdd'T'HHmmss");
const local = (date: string, hhmm: string) => `${date.replace(/-/g, "")}T${hhmm.replace(":", "")}00`;
const addMin = (date: string, hhmm: string, mins: number) => {
  const total = Math.min(24 * 60 - 1, toMinutes(hhmm) + mins);
  return local(date, `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`);
};

/** A calendar file (works in Apple Calendar, Google Calendar, Outlook). Times are left floating so they read the same in the trip's time zone. */
export function buildIcs(s: AppState, opts: { only?: string[]; includeFlights?: boolean; now?: Date } = {}): string {
  const now = opts.now ?? new Date();
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", `PRODID:-//${brand.name}//Trip plan//EN`, "CALSCALE:GREGORIAN", `X-WR-CALNAME:${esc(s.trip.title)}`];
  const events = calendarActivities(s).filter((a) => (opts.only ? opts.only.includes(a.id) : a.status === "confirmed"));
  for (const a of events) {
    lines.push("BEGIN:VEVENT", `UID:${a.id}@${brand.name.toLowerCase()}`, `DTSTAMP:${stamp(now)}`);
    if (a.startTime) {
      lines.push(`DTSTART:${local(a.date!, a.startTime)}`, `DTEND:${a.endTime ? local(a.date!, a.endTime) : addMin(a.date!, a.startTime, DEFAULT_LENGTH)}`);
    } else {
      lines.push(`DTSTART;VALUE=DATE:${a.date!.replace(/-/g, "")}`);
    }
    lines.push(`SUMMARY:${esc(a.title)}`);
    if (a.address) lines.push(`LOCATION:${esc(a.address)}`);
    const note = [a.description, a.timeStatus === "tbd" ? "Time to be decided." : "", a.externalUrl].filter(Boolean).join("\n");
    if (note) lines.push(`DESCRIPTION:${esc(note)}`);
    lines.push(`STATUS:${a.status === "confirmed" ? "CONFIRMED" : "TENTATIVE"}`, "END:VEVENT");
  }
  if (opts.includeFlights) {
    const me = currentUser(s);
    for (const f of s.flights.filter((x) => x.userId === me.id)) {
      const at = f.direction === "arrival" ? f.arrivalTime : f.departureTime;
      const [d, t] = at.split("T");
      lines.push("BEGIN:VEVENT", `UID:${f.id}@${brand.name.toLowerCase()}`, `DTSTAMP:${stamp(now)}`, `DTSTART:${local(d, t)}`, `DTEND:${addMin(d, t, 60)}`, `SUMMARY:${esc(`${f.direction === "arrival" ? "Land" : "Fly home"}: ${f.airline} ${f.flightNumber} (${f.departureAirport} to ${f.arrivalAirport})`)}`, "END:VEVENT");
    }
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}

/** Saves text as a file in the browser. */
export function downloadTextFile(filename: string, content: string, type = "text/calendar") {
  const url = URL.createObjectURL(new Blob([content], { type: `${type};charset=utf-8` }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
