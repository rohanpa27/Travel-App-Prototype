"use client";

import { Car, PlaneLanding } from "lucide-react";
import { useAppState } from "@/lib/store";
import { getUser } from "@/lib/selectors";
import { arrivalWindowLabel, pickupGroups } from "@/lib/flights";
import { dayLabel, flightTime } from "@/lib/format";
import { Avatar, AvatarStack } from "@/components/ui/Avatar";
import { EmptyState } from "./EmptyState";

/** Everyone's arrival on one shared timeline, with ride-share hints from seeded data. */
export function FlightTimeline() {
  const s = useAppState();
  const arrivals = s.flights.filter((f) => f.direction === "arrival").sort((a, b) => a.arrivalTime.localeCompare(b.arrivalTime));
  const groups = pickupGroups(s);

  if (!arrivals.length) return <EmptyState icon={<PlaneLanding className="size-6" aria-hidden />} title="No arrivals yet" body="Add your flight and friends will see when you land." />;

  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <div key={g.users.map((u) => u.id).join("-")} className="flex items-start gap-3 rounded-card border-2 border-ink bg-lime p-4">
          <Car className="mt-1 size-6 shrink-0" aria-hidden />
          <div>
            <p className="text-lg font-bold">Ride share opportunity</p>
            <p>{g.users.map((u) => u.name).join(" and ")} land at {g.airport} {g.minutesApart === 0 ? "at the same time" : `within ${g.minutesApart} minutes`} ({arrivalWindowLabel(g)}). They could share a ride to the hotel.</p>
          </div>
        </div>
      ))}
      <ol className="relative space-y-3 border-l-4 border-ink/15 pl-6">
        {arrivals.map((f) => {
          const u = getUser(s, f.userId);
          if (!u) return null;
          const together = groups.find((g) => g.users.some((x) => x.id === u.id));
          return (
            <li key={f.id} className="relative">
              <span className="absolute -left-[2.05rem] top-4 size-4 rounded-full border-4 border-paper bg-ink" aria-hidden />
              <div className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3 shadow-soft">
                <Avatar user={u} size="md" decorative />
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{u.name} <span className="font-normal text-ink-soft">· {f.airline} {f.flightNumber}</span></p>
                  <p className="text-ink-soft">From {f.departureAirport}{together && <> · riding with {together.users.filter((x) => x.id !== u.id).map((x) => x.name).join(", ")}</>}</p>
                </div>
                <p className="text-right"><span className="block text-xl font-extrabold">{flightTime(f.arrivalTime)}</span><span className="text-sm text-ink-soft">{dayLabel(f.arrivalTime.slice(0, 10))}</span></p>
              </div>
            </li>
          );
        })}
      </ol>
      {groups.length === 0 && <AvatarStack users={arrivals.map((f) => getUser(s, f.userId)).filter((u): u is NonNullable<typeof u> => !!u)} />}
    </div>
  );
}
