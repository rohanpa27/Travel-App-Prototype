"use client";

import { Crown, Plane } from "lucide-react";
import { useAppState, dispatch } from "@/lib/store";
import { confirmedCount, currentUser, members, personalCost } from "@/lib/selectors";
import { flightOf } from "@/lib/flights";
import { flightDay, flightTime, money } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import type { TripResponse } from "@/lib/types";

const label: Record<TripResponse, { text: string; cls: string }> = {
  going: { text: "Going", cls: "bg-lime" },
  maybe: { text: "Maybe", cls: "bg-sun" },
  not_going: { text: "Can't go", cls: "bg-coral-soft text-[#8a1c0c]" },
};

export default function Guests() {
  const s = useAppState();
  const me = currentUser(s);
  const people = members(s);
  const counts = { going: 0, maybe: 0, not_going: 0 } as Record<TripResponse, number>;
  s.memberships.forEach((m) => (counts[m.tripResponse] += 1));

  return (
    <div className="space-y-6">
      <h1 className="text-5xl font-extrabold">Guests</h1>
      <p className="text-lg text-ink-soft">{counts.going} going · {counts.maybe} maybe · {counts.not_going} can&apos;t go</p>
      <ul className="grid gap-4 md:grid-cols-2">
        {people.map((u) => {
          const m = s.memberships.find((x) => x.userId === u.id);
          const arrive = flightOf(s, u.id, "arrival");
          const leave = flightOf(s, u.id, "departure");
          const cost = personalCost(s, u.id);
          const isMe = u.id === me.id;
          return (
            <li key={u.id} className="rounded-card border border-line bg-white p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <Avatar user={u} size="lg" decorative />
                <div className="min-w-0 flex-1">
                  <h2 className="flex flex-wrap items-center gap-2 text-2xl font-bold">{u.name}{isMe && <span className="rounded-full bg-paper-deep px-2 py-0.5 text-sm">You</span>}</h2>
                  <p className="flex items-center gap-1 text-ink-soft">{m?.role === "host" ? <><Crown className="size-4" aria-hidden />Organizer</> : "Member"}{u.homeCity && <> · from {u.homeCity}</>}</p>
                </div>
                {m && (isMe ? (
                  <select aria-label="Your trip response" value={m.tripResponse} onChange={(e) => dispatch({ type: "setTripResponse", userId: u.id, response: e.target.value as TripResponse })} className={`min-h-10 rounded-full border-2 border-ink px-3 font-bold ${label[m.tripResponse].cls}`}>
                    <option value="going">Going</option><option value="maybe">Maybe</option><option value="not_going">Can&apos;t go</option>
                  </select>
                ) : <span className={`rounded-full border-2 border-ink px-3 py-1 font-bold ${label[m.tripResponse].cls}`}>{label[m.tripResponse].text}</span>)}
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-paper p-3 text-center">
                <div><dt className="text-sm text-ink-soft">Confirmed plans</dt><dd className="text-xl font-bold">{confirmedCount(s, u.id)}</dd></div>
                <div><dt className="text-sm text-ink-soft">Est. cost</dt><dd className="text-xl font-bold">{money(cost.total)}</dd></div>
                <div><dt className="text-sm text-ink-soft">Interests</dt><dd className="text-sm font-bold">{u.interests.slice(0, 2).join(", ") || "None yet"}</dd></div>
              </dl>
              <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-base">
                <Plane className="size-4" aria-hidden />
                {arrive ? <span>Lands {flightDay(arrive.arrivalTime)} at {flightTime(arrive.arrivalTime)}</span> : <span className="text-ink-soft">Arrival not added yet</span>}
                {leave && <span>Leaves {flightTime(leave.departureTime)}</span>}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
