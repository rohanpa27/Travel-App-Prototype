"use client";

import Link from "next/link";
import { AlertTriangle, CalendarClock, Check, Plane } from "lucide-react";
import { CATEGORIES, ROUTES } from "@/lib/constants";
import { calendarActivities, layoutDay, visibleHours } from "@/lib/calendar";
import { conflictsFor, members, tally } from "@/lib/selectors";
import { useAppState } from "@/lib/store";
import { dayLabel, flightTime, timeLabel } from "@/lib/format";
import { ButtonLink } from "@/components/ui/Button";
import { Plus } from "lucide-react";

const HOUR_PX = 56;
const colorOf = (category: string) => CATEGORIES.find((c) => c.id === category)?.color ?? "#E4E7F3";
const hourText = (h: number) => (h === 0 || h === 24 ? "12 AM" : h === 12 ? "12 PM" : h < 12 ? `${h} AM` : `${h - 12} PM`);

/** One day as a schedule: timed plans on an hour grid (overlaps sit side by side), then plans with no time, then who is flying in or out. */
export function DayTimeline({ day }: { day: string }) {
  const s = useAppState();
  const plans = calendarActivities(s, day);
  const blocks = layoutDay(plans);
  const untimed = plans.filter((a) => !a.startTime);
  const [from, to] = visibleHours(blocks);
  const hours = Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const people = members(s);
  const trips = s.flights
    .filter((f) => (f.direction === "arrival" ? f.arrivalTime : f.departureTime).startsWith(day))
    .map((f) => ({ f, user: people.find((u) => u.id === f.userId), at: f.direction === "arrival" ? f.arrivalTime : f.departureTime }))
    .filter((x) => x.user)
    .sort((a, b) => a.at.localeCompare(b.at));

  return (
    <section aria-labelledby="day-heading" className="space-y-4 rounded-xl2 border border-line bg-white p-4 shadow-soft md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="day-heading" className="text-3xl font-extrabold">{dayLabel(day)}</h2>
          <p className="text-ink-soft">{plans.length === 0 ? "Nothing planned yet" : `${plans.length} ${plans.length === 1 ? "plan" : "plans"}`}</p>
        </div>
        <ButtonLink href={`${ROUTES.activityEdit}?date=${day}`} size="sm"><Plus className="size-4" aria-hidden />Add to this day</ButtonLink>
      </div>

      {blocks.length > 0 && (
        <div className="relative" style={{ height: (to - from) * HOUR_PX }}>
          {hours.map((h) => (
            <div key={h} aria-hidden className="absolute inset-x-0 flex items-start gap-3" style={{ top: (h - from) * HOUR_PX }}>
              <span className="-mt-2.5 w-12 shrink-0 text-right text-xs font-semibold text-ink-soft">{hourText(h)}</span>
              <span className="mt-0 h-px flex-1 bg-line" />
            </div>
          ))}
          <div className="absolute inset-y-0 left-[60px] right-0">
            {blocks.map((b) => {
              const t = tally(s, b.activity);
              const clash = conflictsFor(s, b.activity).length > 0;
              const confirmed = b.activity.status === "confirmed";
              const height = Math.max(30, ((b.end - b.start) / 60) * HOUR_PX - 3);
              return (
                <Link
                  key={b.activity.id}
                  href={`${ROUTES.activity}?id=${b.activity.id}`}
                  data-overlap={clash ? "true" : undefined}
                  className={`absolute overflow-hidden rounded-xl p-2 text-sm leading-tight shadow-soft ${confirmed ? "border border-ink/10" : "border-2 border-dashed border-ink/40"}`}
                  style={{ top: ((b.start - from * 60) / 60) * HOUR_PX, height, left: `calc(${(b.col / b.cols) * 100}% + 2px)`, width: `calc(${100 / b.cols}% - 4px)`, background: confirmed ? colorOf(b.activity.category) : "#fff" }}
                >
                  <span className="flex items-center gap-1 font-bold">{confirmed && <Check className="size-3.5 shrink-0" aria-hidden />}{clash && <AlertTriangle className="size-3.5 shrink-0" aria-hidden />}<span className="truncate">{b.activity.title}</span>{clash && <span className="sr-only"> (overlaps another plan)</span>}</span>
                  <span className="block truncate text-xs font-semibold text-ink/70">{timeLabel(b.activity.startTime)} · {t.yes.length} going</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {untimed.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-xl font-bold"><CalendarClock className="size-5" aria-hidden />Time to be decided</h3>
          <ul className="space-y-2">
            {untimed.map((a) => (
              <li key={a.id}><Link href={`${ROUTES.activity}?id=${a.id}`} className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-paper px-4 py-3 font-bold hover:border-brand/50"><span>{a.title}</span><span className="text-sm font-semibold text-ink-soft">{tally(s, a).yes.length} going</span></Link></li>
            ))}
          </ul>
        </div>
      )}

      {trips.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-xl font-bold"><Plane className="size-5" aria-hidden />Flights</h3>
          <ul className="space-y-1.5 text-base">
            {trips.map(({ f, user, at }) => (
              <li key={f.id}><span className="font-bold">{user!.name}</span> {f.direction === "arrival" ? "lands" : "leaves"} at {flightTime(at)} <span className="text-ink-soft">· {f.airline} {f.flightNumber}, {f.departureAirport} to {f.arrivalAirport}</span></li>
            ))}
          </ul>
        </div>
      )}

      {plans.length === 0 && trips.length === 0 && <p className="rounded-2xl border-2 border-dashed border-line p-6 text-center text-ink-soft">A free day. Add something, or leave it open.</p>}
    </section>
  );
}
