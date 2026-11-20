"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ROUTES } from "@/lib/constants";
import { calendarActivities } from "@/lib/calendar";
import { tripDays } from "@/lib/selectors";
import { useAppState } from "@/lib/store";

/** The whole trip as a row of days. Each day shows how many plans it has and opens that day in the calendar. */
export function TripStrip() {
  const s = useAppState();
  const today = format(new Date(), "yyyy-MM-dd");
  return (
    <section aria-labelledby="glance" className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="glance" className="text-3xl font-extrabold">Trip at a glance</h2>
        <Link href={ROUTES.calendar} className="font-bold underline">Open calendar</Link>
      </div>
      <ul className="flex gap-2 overflow-x-auto pb-1">
        {tripDays(s).map((d) => {
          const n = calendarActivities(s, d).length;
          const date = parseISO(d);
          return (
            <li key={d} className="shrink-0">
              <Link href={`${ROUTES.calendar}?day=${d}`} className={`flex w-20 flex-col items-center rounded-2xl border px-2 py-3 shadow-soft hover:border-brand/50 ${d === today ? "border-brand bg-brand-soft" : "border-line bg-white"}`}>
                <span className="text-sm font-semibold text-ink-soft">{format(date, "EEE")}</span>
                <span className="font-display text-3xl font-extrabold leading-none">{format(date, "d")}</span>
                <span className={`mt-2 rounded-full px-2 py-0.5 text-xs font-bold ${n ? "bg-ink text-paper" : "bg-paper-deep text-ink-soft"}`}>{n === 0 ? "Free" : `${n} ${n === 1 ? "plan" : "plans"}`}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
