import { addMinutes, differenceInMinutes, format, parseISO } from "date-fns";
import type { AppState, Flight, User } from "./types";
import { getUser } from "./selectors";
import { flightTime } from "./format";

/** Demo mapping only: Chicago uses ORD, anything else gets a code made from its first letters. */
export const destinationAirport = (destination: string) => (/chicago/i.test(destination) ? "ORD" : destination.replace(/[^a-z]/gi, "").slice(0, 3).toUpperCase().padEnd(3, "X"));
export const ARRIVAL_DATE = (s: AppState) => s.trip.startDate;
export const DEPARTURE_DATE = (s: AppState) => s.trip.endDate;

export const flightOf = (s: AppState, userId: string, direction: Flight["direction"]) => s.flights.find((f) => f.userId === userId && f.direction === direction);

export type ImportState = "imported" | "needs_import";
export const importStateOf = (s: AppState, userId: string): ImportState => (flightOf(s, userId, "arrival") ? "imported" : "needs_import");
export const sourceLabel: Record<Flight["source"], string> = { manual: "Added by hand", calendar: "From calendar", email: "From confirmation", mock_search: "From search" };

export type PickupGroup = { airport: string; users: User[]; start: string; end: string; minutesApart: number };

/** Groups arrivals that land at the same airport within `windowMin` minutes of each other. */
export function pickupGroups(s: AppState, windowMin = 45): PickupGroup[] {
  const arrivals = s.flights.filter((f) => f.direction === "arrival").sort((a, b) => a.arrivalTime.localeCompare(b.arrivalTime));
  const groups: Flight[][] = [];
  for (const f of arrivals) {
    const g = groups.find((grp) => grp[0].arrivalAirport === f.arrivalAirport && differenceInMinutes(parseISO(f.arrivalTime), parseISO(grp[grp.length - 1].arrivalTime)) <= windowMin);
    if (g) g.push(f);
    else groups.push([f]);
  }
  return groups
    .filter((g) => g.length > 1)
    .map((g) => ({
      airport: g[0].arrivalAirport,
      users: g.map((f) => getUser(s, f.userId)).filter((u): u is User => !!u),
      start: g[0].arrivalTime,
      end: g[g.length - 1].arrivalTime,
      minutesApart: differenceInMinutes(parseISO(g[g.length - 1].arrivalTime), parseISO(g[0].arrivalTime)),
    }));
}

// ---- Mock coordinated search (demo data only) -------------------------------------
export type FlightOption = { id: string; airline: string; flightNumber: string; departureAirport: string; departureTime: string; arrivalTime: string; price: number; minutesFromAnchor: number; recommended: boolean; why: string };

const CARRIERS = [
  { airline: "United", code: "UA", base: 238 },
  { airline: "American", code: "AA", base: 226 },
  { airline: "Delta", code: "DL", base: 251 },
  { airline: "Southwest", code: "WN", base: 204 },
];

/** Builds three deterministic fake options around a group member's arrival time. */
export function findCoordinatedFlights(s: AppState, user: User): { options: FlightOption[]; anchor: User | undefined } {
  const others = s.flights.filter((f) => f.direction === "arrival" && f.userId !== user.id);
  const anchorFlight = others.find((f) => f.userId === s.trip.hostId) ?? others[0];
  const anchor = anchorFlight ? getUser(s, anchorFlight.userId) : undefined;
  const base = anchorFlight ? parseISO(anchorFlight.arrivalTime) : parseISO(`${s.trip.startDate}T12:00`);
  const origin = user.homeAirport ?? "JFK";
  const seed = origin.split("").reduce((n, c) => n + c.charCodeAt(0), 0);
  const offsets = [28, 125, -110];
  const raw = offsets.map((off, i) => {
    const c = CARRIERS[(seed + i) % CARRIERS.length];
    const arrival = addMinutes(base, off);
    return { c, arrival, price: c.base + (i === 0 ? 0 : i === 1 ? 42 : 31) + (seed % 7) * 3, off, num: 100 + ((seed * (i + 3)) % 900) };
  });
  const bestIdx = raw.reduce((best, o, i) => (Math.abs(o.off) < Math.abs(raw[best].off) ? i : best), 0);
  const nextCheapest = raw.filter((_, i) => i !== bestIdx).sort((a, b) => a.price - b.price)[0];
  const options = raw.map((o, i) => {
    const recommended = i === bestIdx;
    const saves = nextCheapest.price - o.price;
    const mins = Math.abs(o.off);
    const who = anchor?.name ?? "the group";
    const why = recommended
      ? `Best match for the group: arrives within ${mins} minutes of ${who}${saves > 0 ? ` and costs ${`$${saves}`} less than the next option.` : "."}`
      : o.off > 0
        ? `Arrives ${mins} minutes after ${who}, so you would miss the shared ride from the airport.`
        : `Lands ${mins} minutes before ${who}. Cheaper than some, but a long wait at the airport.`;
    return { id: `opt-${i}`, airline: o.c.airline, flightNumber: `${o.c.code} ${o.num}`, departureAirport: origin, departureTime: format(addMinutes(o.arrival, -170), "yyyy-MM-dd'T'HH:mm"), arrivalTime: format(o.arrival, "yyyy-MM-dd'T'HH:mm"), price: o.price, minutesFromAnchor: o.off, recommended, why };
  });
  return { options: options.sort((a, b) => Number(b.recommended) - Number(a.recommended)), anchor };
}

export function optionToFlights(s: AppState, user: User, opt: FlightOption, id: (p: string) => string): Flight[] {
  return [
    { id: id("f"), tripId: s.trip.id, userId: user.id, direction: "arrival", departureAirport: opt.departureAirport, arrivalAirport: destinationAirport(s.trip.destination), departureTime: opt.departureTime, arrivalTime: opt.arrivalTime, airline: opt.airline, flightNumber: opt.flightNumber, source: "mock_search" },
  ];
}

export const arrivalWindowLabel = (g: PickupGroup) => `${flightTime(g.start)}${g.start === g.end ? "" : ` to ${flightTime(g.end)}`}`;

/** Plausible fake itinerary used by the simulated calendar sync and email import. */
export function sampleFlightsFor(s: AppState, user: User, source: Flight["source"], id: (p: string) => string): Flight[] {
  const origin = user.homeAirport ?? "JFK";
  const dest = destinationAirport(s.trip.destination);
  const seed = origin.split("").reduce((n, c) => n + c.charCodeAt(0), 0);
  const carrier = CARRIERS[seed % CARRIERS.length];
  const arriveMin = 11 * 60 + 20 + (seed % 6) * 25;
  const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  return [
    { id: id("f"), tripId: s.trip.id, userId: user.id, direction: "arrival", departureAirport: origin, arrivalAirport: dest, departureTime: `${s.trip.startDate}T${hhmm(arriveMin - 160)}`, arrivalTime: `${s.trip.startDate}T${hhmm(arriveMin)}`, airline: carrier.airline, flightNumber: `${carrier.code} ${200 + (seed % 700)}`, source },
    { id: id("f"), tripId: s.trip.id, userId: user.id, direction: "departure", departureAirport: dest, arrivalAirport: origin, departureTime: `${s.trip.endDate}T16:15`, arrivalTime: `${s.trip.endDate}T19:30`, airline: carrier.airline, flightNumber: `${carrier.code} ${300 + (seed % 600)}`, source },
  ];
}
