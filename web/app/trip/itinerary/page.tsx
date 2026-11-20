"use client";

import { Lightbulb, Plus } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { useAppState } from "@/lib/store";
import { activeActivities, tripDays } from "@/lib/selectors";
import { dayLabel, dayShort } from "@/lib/format";
import { ButtonLink } from "@/components/ui/Button";
import { DaySection } from "@/components/trip/DaySection";
import { ActivityCard } from "@/components/trip/ActivityCard";
import { EmptyState } from "@/components/trip/EmptyState";
import { ItineraryViewToggle } from "@/components/trip/ItineraryViewToggle";

export default function Itinerary() {
  const s = useAppState();
  const all = activeActivities(s);
  const days = tripDays(s);
  const scheduled = (d: string) => all.filter((a) => a.date === d && a.status !== "idea");
  // Anything dated outside the trip window still needs a home, so it shows under Ideas.
  const ideas = all.filter((a) => a.status === "idea" || !a.date || !days.includes(a.date));
  const tbdOnDay = (d: string) => all.filter((a) => a.date === d && a.status !== "idea" && a.timeStatus === "tbd").length;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-5xl font-extrabold">Itinerary</h1>
        <ButtonLink href={ROUTES.activityEdit}><Plus className="size-5" aria-hidden />Add activity</ButtonLink>
      </div>
      <ItineraryViewToggle current="list" />
      <nav aria-label="Jump to a day" className="sticky top-[60px] z-20 -mx-4 flex gap-2 overflow-x-auto bg-paper/95 px-4 py-2 backdrop-blur lg:hidden">
        {days.map((d) => <a key={d} href={`#day-${d}`} className="min-h-10 shrink-0 rounded-full border-2 border-line bg-white px-4 py-2 text-sm font-bold">{dayShort(d)}</a>)}
        <a href="#ideas" className="min-h-10 shrink-0 rounded-full border-2 border-line bg-sky/40 px-4 py-2 text-sm font-bold">Ideas ({ideas.length})</a>
      </nav>
      {all.length === 0 && <EmptyState title="Nothing planned yet" body="Propose the first activity and your friends can start voting." action={<ButtonLink href={ROUTES.activityEdit}>Propose an activity</ButtonLink>} />}
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <div className="space-y-10">
          {days.map((d) => (
            <DaySection key={d} id={`day-${d}`} title={dayLabel(d)} subtitle={tbdOnDay(d) ? `${tbdOnDay(d)} with time TBD` : undefined} activities={scheduled(d)} />
          ))}
        </div>
        <section aria-labelledby="ideas-title" id="ideas" className="scroll-mt-28 space-y-3 rounded-xl2 bg-sky/30 p-4 lg:sticky lg:top-20">
          <div className="flex items-center gap-2"><Lightbulb className="size-6" aria-hidden /><h2 id="ideas-title" className="text-3xl font-extrabold">Ideas</h2></div>
          <p className="text-ink-soft">No final time yet. Vote on what&apos;s worth scheduling.</p>
          {ideas.length === 0 ? <p className="rounded-card border-2 border-dashed border-ink/20 p-5 text-center text-ink-soft">No open ideas. Add one, or check For your group.</p> : ideas.map((a) => <ActivityCard key={a.id} activity={a} />)}
        </section>
      </div>
    </div>
  );
}
