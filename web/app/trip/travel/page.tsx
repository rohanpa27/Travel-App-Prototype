"use client";

import { useState } from "react";
import { CalendarSync, CheckCircle2, FileInput, PenLine, PlaneTakeoff, Search } from "lucide-react";
import { dispatch, newId, useAppState } from "@/lib/store";
import { currentUser, members } from "@/lib/selectors";
import { flightOf, importStateOf, sampleFlightsFor, sourceLabel } from "@/lib/flights";
import { flightDay, flightTime } from "@/lib/format";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Sticker } from "@/components/ui/Sticker";
import { FlightTimeline } from "@/components/trip/FlightTimeline";
import { FindFlightsDialog, ImportFlightDialog, ManualFlightDialog } from "@/components/trip/FlightDialogs";

export default function Travel() {
  const s = useAppState();
  const me = currentUser(s);
  const [dialog, setDialog] = useState<null | { kind: "manual" | "import" | "find"; userId: string }>(null);
  const [syncing, setSyncing] = useState(false);

  function connectCalendar() {
    if (s.calendarConnected) {
      dispatch({ type: "setCalendarConnected", value: false });
      return toast("Calendar disconnected");
    }
    setSyncing(true);
    setTimeout(() => {
      dispatch({ type: "setCalendarConnected", value: true });
      if (!flightOf(s, me.id, "arrival")) {
        dispatch({ type: "addFlights", flights: sampleFlightsFor(s, me, "calendar", newId) });
        toast("Calendar connected (demo). Found 2 flights.");
      } else toast("Calendar connected (demo). Your flights are up to date.");
      setSyncing(false);
    }, 1200);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-5xl font-extrabold">Travel</h1>
        <Sticker color="#FFC857" tilt={3}>Demo data</Sticker>
      </div>
      <p className="max-w-xl text-lg text-ink-soft">See when everyone lands. Flights and calendar sync are simulated in this prototype, so nothing is booked and no calendar is read.</p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Button variant="soft" onClick={connectCalendar} disabled={syncing} className="min-h-14 justify-start"><CalendarSync className="size-5" aria-hidden />{syncing ? "Connecting…" : s.calendarConnected ? "Google Calendar connected" : "Connect Google Calendar"}</Button>
        <Button variant="soft" onClick={() => setDialog({ kind: "import", userId: me.id })} className="min-h-14 justify-start"><FileInput className="size-5" aria-hidden />Import confirmation</Button>
        <Button variant="soft" onClick={() => setDialog({ kind: "manual", userId: me.id })} className="min-h-14 justify-start"><PenLine className="size-5" aria-hidden />Add manually</Button>
        <Button onClick={() => setDialog({ kind: "find", userId: me.id })} className="min-h-14 justify-start"><Search className="size-5" aria-hidden />Find coordinated flights</Button>
      </div>

      <section aria-labelledby="arrivals" className="space-y-3">
        <h2 id="arrivals" className="text-3xl font-extrabold">Who lands when</h2>
        <FlightTimeline />
      </section>

      <section aria-labelledby="travelers" className="space-y-3">
        <h2 id="travelers" className="text-3xl font-extrabold">Everyone&apos;s flights</h2>
        <ul className="grid gap-4 md:grid-cols-2">
          {members(s).map((u) => {
            const a = flightOf(s, u.id, "arrival");
            const d = flightOf(s, u.id, "departure");
            const state = importStateOf(s, u.id);
            return (
              <li key={u.id} className="rounded-card border border-line bg-white p-4 shadow-soft">
                <div className="flex items-center gap-3">
                  <Avatar user={u} size="md" decorative />
                  <div className="min-w-0 flex-1"><p className="text-xl font-bold">{u.name}{u.id === me.id && " (you)"}</p><p className="text-ink-soft">Flying from {u.homeCity ?? "somewhere"}{u.homeAirport && ` (${u.homeAirport})`}</p></div>
                  {state === "imported" ? <span className="inline-flex items-center gap-1 rounded-full bg-lime px-2.5 py-1 text-sm font-bold"><CheckCircle2 className="size-3.5" aria-hidden />{sourceLabel[a!.source]}</span> : <span className="rounded-full bg-coral-soft px-2.5 py-1 text-sm font-bold text-[#8a1c0c]">Needs import</span>}
                </div>
                {a || d ? (
                  <dl className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-paper p-3 text-base">
                    <div><dt className="text-sm text-ink-soft">Arrives</dt><dd className="font-bold">{a ? `${flightDay(a.arrivalTime)}, ${flightTime(a.arrivalTime)}` : "Not added"}</dd><dd className="text-sm text-ink-soft">{a && `${a.airline} ${a.flightNumber}`}</dd></div>
                    <div><dt className="text-sm text-ink-soft">Departs</dt><dd className="font-bold">{d ? `${flightDay(d.departureTime)}, ${flightTime(d.departureTime)}` : "Not added"}</dd><dd className="text-sm text-ink-soft">{d && `${d.airline} ${d.flightNumber}`}</dd></div>
                  </dl>
                ) : (
                  <div className="mt-3 rounded-2xl bg-paper p-3">
                    <p className="flex items-center gap-2 text-ink-soft"><PlaneTakeoff className="size-5 shrink-0" aria-hidden />No flights yet.</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button size="sm" variant="soft" onClick={() => setDialog({ kind: "import", userId: u.id })}>Import for {u.name}</Button>
                      <Button size="sm" variant="soft" onClick={() => setDialog({ kind: "manual", userId: u.id })}>Add flight for {u.name}</Button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <ManualFlightDialog key={`m-${dialog?.userId}`} open={dialog?.kind === "manual"} forUserId={dialog?.userId} onClose={() => setDialog(null)} />
      <ImportFlightDialog key={`i-${dialog?.userId}`} open={dialog?.kind === "import"} forUserId={dialog?.userId} onClose={() => setDialog(null)} />
      <FindFlightsDialog open={dialog?.kind === "find"} onClose={() => setDialog(null)} />
    </div>
  );
}
