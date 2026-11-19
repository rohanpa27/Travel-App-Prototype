"use client";

import { useEffect, useState } from "react";
import { Mail, Search, Sparkles } from "lucide-react";
import { dispatch, newId, useAppState } from "@/lib/store";
import { currentUser } from "@/lib/selectors";
import { findCoordinatedFlights, optionToFlights, sampleFlightsFor, destinationAirport } from "@/lib/flights";
import { flightTime, money } from "@/lib/format";
import { flightSchema, toFieldErrors, type FieldErrors } from "@/lib/schemas";
import { toast } from "@/lib/toast";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { Sticker } from "@/components/ui/Sticker";

type Props = { open: boolean; onClose: () => void };

export function ManualFlightDialog({ open, onClose }: Props) {
  const s = useAppState();
  const me = currentUser(s);
  const [v, setV] = useState({ airline: "", flightNumber: "", arrivalTime: `${s.trip.startDate}T13:00`, departureTime: `${s.trip.endDate}T17:00` });
  const [errors, setErrors] = useState<FieldErrors>({});
  const dest = destinationAirport(s.trip.destination);
  const origin = me.homeAirport ?? "JFK";
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => setV((x) => ({ ...x, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = flightSchema.safeParse(v);
    if (!r.success) return setErrors(toFieldErrors(r.error));
    const base = { tripId: s.trip.id, userId: me.id, airline: r.data.airline, source: "manual" as const };
    dispatch({
      type: "addFlights",
      flights: [
        { ...base, id: newId("f"), direction: "arrival", departureAirport: origin, arrivalAirport: dest, departureTime: r.data.arrivalTime, arrivalTime: r.data.arrivalTime, flightNumber: r.data.flightNumber },
        { ...base, id: newId("f"), direction: "departure", departureAirport: dest, arrivalAirport: origin, departureTime: r.data.departureTime, arrivalTime: r.data.departureTime, flightNumber: r.data.flightNumber },
      ],
    });
    toast("Flight added. The group can see when you land.");
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Add a flight by hand">
      <form onSubmit={submit} noValidate className="space-y-4">
        <p className="text-ink-soft">Flying {origin} to {dest} and back. Times are local.</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Airline" error={errors.airline}><TextInput value={v.airline} onChange={set("airline")} placeholder="United" autoFocus /></Field>
          <Field label="Flight number" error={errors.flightNumber}><TextInput value={v.flightNumber} onChange={set("flightNumber")} placeholder="UA 1432" /></Field>
        </div>
        <Field label="You land" error={errors.arrivalTime}><TextInput type="datetime-local" value={v.arrivalTime} onChange={set("arrivalTime")} /></Field>
        <Field label="You fly home" error={errors.departureTime}><TextInput type="datetime-local" value={v.departureTime} onChange={set("departureTime")} /></Field>
        <Button type="submit" size="lg" className="w-full">Add flight</Button>
      </form>
    </Modal>
  );
}

export function ImportFlightDialog({ open, onClose }: Props) {
  const s = useAppState();
  const me = currentUser(s);
  const [busy, setBusy] = useState(false);
  const sample = sampleFlightsFor(s, me, "email", () => "x");
  const text = `Your trip is confirmed\n\nOutbound: ${sample[0].airline} ${sample[0].flightNumber}\n${sample[0].departureAirport} to ${sample[0].arrivalAirport}\nArrives ${flightTime(sample[0].arrivalTime)}\n\nReturn: ${sample[1].airline} ${sample[1].flightNumber}\n${sample[1].departureAirport} to ${sample[1].arrivalAirport}\nDeparts ${flightTime(sample[1].departureTime)}`;

  function run() {
    setBusy(true);
    setTimeout(() => {
      dispatch({ type: "addFlights", flights: sampleFlightsFor(s, me, "email", newId) });
      setBusy(false);
      toast("Confirmation imported (demo)");
      onClose();
    }, 1100);
  }

  return (
    <Modal open={open} onClose={onClose} title="Import a confirmation">
      <p className="text-ink-soft">Demo: this sample confirmation is already filled in. Nothing is read from your inbox, and nothing leaves this browser.</p>
      <label className="mt-4 block"><span className="mb-1.5 flex items-center gap-1.5 text-sm font-bold"><Mail className="size-4" aria-hidden />Confirmation text</span><TextArea readOnly rows={8} value={text} className="font-mono text-sm" /></label>
      <Button size="lg" className="mt-4 w-full" onClick={run} disabled={busy}>{busy ? "Reading confirmation…" : "Import flights"}</Button>
    </Modal>
  );
}

export function FindFlightsDialog({ open, onClose }: Props) {
  const s = useAppState();
  const me = currentUser(s);
  const [searching, setSearching] = useState(true);
  const { options, anchor } = findCoordinatedFlights(s, me);

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => setSearching(false), 900);
    return () => clearTimeout(id);
  }, [open]);
  function close() {
    setSearching(true);
    onClose();
  }

  return (
    <Modal open={open} onClose={close} title="Coordinated flights">
      <Sticker color="#FFC857" tilt={-2}>Demo data, not live fares</Sticker>
      {searching ? (
        <p role="status" className="mt-6 flex items-center gap-2 font-semibold"><Search className="size-5 animate-pulse" aria-hidden />Comparing arrivals for {s.users.length > 1 ? "the group" : "your trip"}…</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {options.map((o) => (
            <li key={o.id} className={`rounded-card border-2 p-4 ${o.recommended ? "border-ink bg-lime" : "border-line bg-white"}`}>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-xl font-bold">{o.airline} {o.flightNumber}</p>
                <p className="text-2xl font-extrabold">{money(o.price)}</p>
              </div>
              <p className="text-base">{o.departureAirport} {flightTime(o.departureTime)} to {flightTime(o.arrivalTime)}</p>
              <p className="mt-2 flex items-start gap-1.5 text-base font-semibold">{o.recommended && <Sparkles className="mt-0.5 size-4 shrink-0" aria-hidden />}{o.why}</p>
              <Button size="sm" variant={o.recommended ? "dark" : "soft"} className="mt-3" onClick={() => { dispatch({ type: "addFlights", flights: [...optionToFlights(s, me, o, newId), ...sampleFlightsFor(s, me, "mock_search", newId).filter((f) => f.direction === "departure")] }); toast(`${o.airline} ${o.flightNumber} added to your travel`); close(); }}>Use this flight</Button>
            </li>
          ))}
          {!anchor && <li className="text-sm text-ink-soft">No one has added a flight yet, so options are centered on midday arrival.</li>}
        </ul>
      )}
    </Modal>
  );
}
