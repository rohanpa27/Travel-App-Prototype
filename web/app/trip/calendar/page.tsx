"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarPlus } from "lucide-react";
import { format } from "date-fns";
import { ROUTES } from "@/lib/constants";
import { useAppState } from "@/lib/store";
import { tripDays } from "@/lib/selectors";
import { buildIcs, downloadTextFile, monthsCovering } from "@/lib/calendar";
import { slugify } from "@/lib/format";
import { toast } from "@/lib/toast";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { ItineraryViewToggle } from "@/components/trip/ItineraryViewToggle";
import { MonthGrid } from "@/components/trip/MonthGrid";
import { DayTimeline } from "@/components/trip/DayTimeline";

function CalendarView() {
  const s = useAppState();
  const days = tripDays(s);
  const today = format(new Date(), "yyyy-MM-dd");
  const asked = useSearchParams().get("day");
  const first = asked && days.includes(asked) ? asked : days.includes(today) ? today : days[0];
  const [selected, setSelected] = useState(first);
  const months = useMemo(() => monthsCovering(s.trip.startDate, s.trip.endDate), [s.trip.startDate, s.trip.endDate]);

  function exportCalendar() {
    const ics = buildIcs(s, { includeFlights: true });
    const count = (ics.match(/BEGIN:VEVENT/g) ?? []).length;
    if (count === 0) return toast("Nothing confirmed yet. Confirm a plan and it will be included.");
    downloadTextFile(`${slugify(s.trip.title) || "trip"}.ics`, ics);
    toast(`Saved ${count} ${count === 1 ? "event" : "events"} for your calendar app`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-5xl font-extrabold">Calendar</h1>
        <ButtonLink href={ROUTES.activityEdit}><Plus className="size-5" aria-hidden />Add activity</ButtonLink>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ItineraryViewToggle current="calendar" />
        <Button variant="soft" size="sm" onClick={exportCalendar}><CalendarPlus className="size-4" aria-hidden />Add confirmed plans to my calendar</Button>
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold text-ink-soft" aria-label="Legend">
        <li className="flex items-center gap-2"><span className="size-3 rounded-full bg-brand" aria-hidden />Today</li>
        <li className="flex items-center gap-2"><span className="size-3 rounded-full bg-sun" aria-hidden />Confirmed: filled</li>
        <li className="flex items-center gap-2"><span className="size-3 rounded-full ring-2 ring-inset ring-ink/40" aria-hidden />Still being decided: outlined</li>
      </ul>
      <div className="space-y-6">
        <div className="space-y-6">{months.map((m) => <MonthGrid key={`${m.year}-${m.month}`} month={m} tripDays={days} selected={selected} today={today} onSelect={setSelected} />)}</div>
        <div className="max-w-3xl"><DayTimeline day={selected} /></div>
      </div>
    </div>
  );
}

export default function Calendar() {
  return <Suspense><CalendarView /></Suspense>;
}
