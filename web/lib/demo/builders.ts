// Small helpers so each demo trip reads as data, not boilerplate.
import type { Activity, ActivityResponse, AppState, Flight, Recommendation, RsvpResponse, TripResponse, User } from "../types";
import { addDays, format, parseISO } from "date-fns";
import { STATE_VERSION } from "../constants";

/** Fixed "now" for seeded timestamps so every build produces identical demo data. */
export const seededAt = (hoursAgo: number) => new Date(Date.UTC(2026, 10, 18, 18, 0) - hoursAgo * 3600_000).toISOString();

export type PersonSpec = { id: string; name: string; avatar: string; airport: string; city: string; interests: string[]; budget: User["budgetPreference"]; trip?: TripResponse };

export const people = (specs: PersonSpec[]): User[] =>
  specs.map((p) => ({ id: p.id, name: p.name, avatarUrl: `/avatars/${p.avatar}.svg`, homeAirport: p.airport, homeCity: p.city, interests: p.interests, budgetPreference: p.budget }));

export type ActivitySpec = Omit<Activity, "tripId" | "timeStatus" | "status"> & { status: Activity["status"]; timeStatus?: Activity["timeStatus"] };

export const activities = (tripId: string, specs: ActivitySpec[]): Activity[] =>
  specs.map((a) => ({ tripId, timeStatus: a.startTime ? "scheduled" : "tbd", ...a }));

export type Votes = Partial<Record<RsvpResponse, string[]>>;

/** votes: { activityId: { yes: ["a","b"], maybe: [...], no: [...] } }. Older answers get larger hour offsets. */
export function responses(votes: Record<string, Votes>): ActivityResponse[] {
  const out: ActivityResponse[] = [];
  let h = 90;
  for (const [activityId, v] of Object.entries(votes)) {
    for (const response of ["yes", "maybe", "no"] as const) {
      for (const userId of v[response] ?? []) out.push({ activityId, userId, response, updatedAt: seededAt(h-- > 2 ? h : 2) });
    }
  }
  return out;
}

export type FlightSpec = { user: string; from: string; to: string; inCarrier: string; inNo: string; inDep: string; inArr: string; outCarrier?: string; outNo: string; outDep: string; outArr: string; source: Flight["source"] };

/** Arrival on the first trip date, departure on the last. Times are "HH:mm". Overnight flights leave the day before. */
export function flights(tripId: string, startDate: string, endDate: string, specs: FlightSpec[]): Flight[] {
  return specs.flatMap((f) => [
    { id: `f-${f.user}-in`, tripId, userId: f.user, direction: "arrival" as const, departureAirport: f.from, arrivalAirport: f.to, departureTime: `${f.inDep > f.inArr ? format(addDays(parseISO(startDate), -1), "yyyy-MM-dd") : startDate}T${f.inDep}`, arrivalTime: `${startDate}T${f.inArr}`, airline: f.inCarrier, flightNumber: f.inNo, source: f.source },
    { id: `f-${f.user}-out`, tripId, userId: f.user, direction: "departure" as const, departureAirport: f.to, arrivalAirport: f.from, departureTime: `${endDate}T${f.outDep}`, arrivalTime: `${f.outArr < f.outDep ? format(addDays(parseISO(endDate), 1), "yyyy-MM-dd") : endDate}T${f.outArr}`, airline: f.outCarrier ?? f.inCarrier, flightNumber: f.outNo, source: f.source },
  ]);
}

export type RecSpec = Pick<Recommendation, "id" | "title" | "description" | "category" | "estimatedCostPerPerson" | "suggestedDate" | "suggestedTime" | "vibes" | "interests" | "similarGroupsPercent" | "daypart">;
export const recs = (tripId: string, specs: RecSpec[]): Recommendation[] => specs.map((r) => ({ tripId, status: "new", explanation: "", ...r }));

type TripSpec = {
  id: string; slug: string; title: string; destination: string; description: string; startDate: string; endDate: string; cover: string; color: string;
  vibes: string[]; budget: number; hostId: string; users: User[]; tripResponses?: Record<string, TripResponse>;
  activities: Activity[]; responses: ActivityResponse[]; flights: Flight[]; recs: Recommendation[]; payments?: Record<string, "paid" | "unpaid">;
  feed: { userId: string; text: string; hoursAgo: number; activityId?: string }[]; visibility?: "invite_only" | "anyone_with_link";
};

export function assemble(t: TripSpec): AppState {
  return {
    version: STATE_VERSION,
    currentUserId: t.hostId,
    users: t.users,
    trip: { id: t.id, slug: t.slug, title: t.title, destination: t.destination, description: t.description, startDate: t.startDate, endDate: t.endDate, coverImageUrl: t.cover, themeColor: t.color, vibeTags: t.vibes, estimatedBudget: t.budget, hostId: t.hostId, memberIds: t.users.map((u) => u.id), visibility: t.visibility ?? "anyone_with_link", allowGuestsToPropose: true },
    memberships: t.users.map((u) => ({ tripId: t.id, userId: u.id, role: u.id === t.hostId ? ("host" as const) : ("member" as const), tripResponse: t.tripResponses?.[u.id] ?? ("going" as const) })),
    activities: t.activities,
    responses: t.responses,
    flights: t.flights,
    recommendations: t.recs,
    payments: t.payments ?? {},
    feed: t.feed.map((f, i) => ({ id: `fd-${i + 1}`, userId: f.userId, text: f.text, at: seededAt(f.hoursAgo), activityId: f.activityId })),
    calendarConnected: false,
    hasJoined: false,
  };
}
