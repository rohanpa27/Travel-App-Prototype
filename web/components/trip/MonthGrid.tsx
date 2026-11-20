"use client";

import { AlertTriangle, Check } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { calendarActivities, monthTitle, monthWeeks, type MonthRef } from "@/lib/calendar";
import { conflictsFor, sortActivities } from "@/lib/selectors";
import { useAppState } from "@/lib/store";
import { format, parseISO } from "date-fns";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const colorOf = (category: string) => CATEGORIES.find((c) => c.id === category)?.color ?? "#E4E7F3";

/** One month. Days outside the trip are dimmed and can't be picked. On phones each plan is a dot; on wide screens it is a labelled chip. */
export function MonthGrid({ month, tripDays, selected, today, onSelect }: { month: MonthRef; tripDays: string[]; selected: string; today: string; onSelect: (day: string) => void }) {
  const s = useAppState();
  const inTrip = new Set(tripDays);
  const title = monthTitle(month);

  return (
    <section aria-label={title} className="space-y-2">
      <h2 className="text-2xl font-extrabold">{title}</h2>
      <div className="grid grid-cols-7 gap-1 text-center text-sm font-bold text-ink-soft" aria-hidden>{WEEKDAYS.map((d) => <div key={d}>{d}</div>)}</div>
      <div className="space-y-1">
        {monthWeeks(month).filter((week) => week.some((day) => inTrip.has(day))).map((week) => (
          <div key={week[0]} className="grid grid-cols-7 gap-1">
            {week.map((day) => {
              const d = parseISO(day);
              const here = d.getMonth() === month.month;
              const plans = sortActivities(calendarActivities(s, day));
              const clash = plans.some((a) => conflictsFor(s, a).length > 0);
              const allowed = here && inTrip.has(day);
              const summary = `${format(d, "EEEE")}: ${plans.length === 0 ? "nothing planned" : `${plans.length} ${plans.length === 1 ? "plan" : "plans"}`}${clash ? ", some overlap" : ""}`;
              if (!here) return <div key={day} aria-hidden className="min-h-14 md:min-h-28" />;
              return (
                <button
                  key={day}
                  type="button"
                  disabled={!allowed}
                  aria-pressed={allowed ? selected === day : undefined}
                  aria-current={day === today ? "date" : undefined}
                  onClick={() => onSelect(day)}
                  className={`flex min-h-14 min-w-0 flex-col items-stretch gap-1 rounded-2xl border p-1.5 text-left transition md:min-h-28 md:p-2 ${
                    !allowed ? "cursor-default border-transparent bg-transparent text-ink/35" : selected === day ? "border-brand bg-brand-soft shadow-pop" : "border-line bg-white shadow-soft hover:border-brand/50"
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span className={`grid size-7 place-items-center rounded-full text-base font-bold ${day === today ? "bg-brand text-white" : ""}`}>{d.getDate()}</span>
                    {clash && allowed && <AlertTriangle className="size-4 text-[#8a5a00]" aria-hidden />}
                  </span>
                  {allowed && (
                    <>
                      <span className="sr-only">{summary}</span>
                      <span className="flex flex-wrap gap-1 md:hidden" aria-hidden>
                        {plans.slice(0, 4).map((a) => <span key={a.id} className={`size-2.5 rounded-full ${a.status === "confirmed" ? "" : "ring-2 ring-inset ring-ink/40"}`} style={{ background: a.status === "confirmed" ? colorOf(a.category) : "transparent" }} />)}
                      </span>
                      <span className="hidden min-w-0 flex-col gap-1 md:flex">
                        {plans.slice(0, 3).map((a) => (
                          <span key={a.id} className={`flex min-w-0 items-start gap-1 rounded-lg px-1.5 py-1 text-xs font-bold leading-tight ${a.status === "confirmed" ? "" : "border border-dashed border-ink/40"}`} style={{ background: a.status === "confirmed" ? colorOf(a.category) : "white" }}>
                            {a.status === "confirmed" && <Check className="mt-px size-3 shrink-0" />}
                            <span className="line-clamp-2 min-w-0">{a.title}</span>
                          </span>
                        ))}
                        {plans.length > 3 && <span className="px-1 text-xs font-bold text-ink-soft">+{plans.length - 3} more</span>}
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
