import { differenceInCalendarDays, eachDayOfInterval, format, parseISO } from "date-fns";
import type { Activity, ActivityResponse, AppState, PaymentState, RsvpResponse, User } from "./types";

export const getUser = (s: AppState, id: string): User | undefined => s.users.find((u) => u.id === id);
export const currentUser = (s: AppState): User => getUser(s, s.currentUserId) ?? s.users[0];
export const members = (s: AppState): User[] => s.trip.memberIds.map((id) => getUser(s, id)).filter((u): u is User => !!u);
export const isHost = (s: AppState, userId = s.currentUserId) => s.trip.hostId === userId;
export const activeActivities = (s: AppState) => s.activities.filter((a) => a.status !== "cancelled");

export function responseOf(s: AppState, activityId: string, userId: string): RsvpResponse | undefined {
  return s.responses.find((r) => r.activityId === activityId && r.userId === userId)?.response;
}

export type Tally = { yes: User[]; maybe: User[]; no: User[]; pending: User[]; capacity?: number; full: boolean; nearFull: boolean; enoughInterest: boolean; everyoneIn: boolean };

/** Counts only members who are still going or maybe going on the trip. */
export function tally(s: AppState, activity: Activity): Tally {
  const eligible = members(s).filter((u) => s.memberships.find((m) => m.userId === u.id)?.tripResponse !== "not_going");
  const by = (r: RsvpResponse) => eligible.filter((u) => responseOf(s, activity.id, u.id) === r);
  const yes = by("yes");
  const pending = eligible.filter((u) => !responseOf(s, activity.id, u.id));
  const full = !!activity.capacity && yes.length >= activity.capacity;
  const nearFull = !!activity.capacity && !full && yes.length >= activity.capacity - 1;
  const needed = Math.max(2, Math.ceil(eligible.length / 2));
  return { yes, maybe: by("maybe"), no: by("no"), pending, capacity: activity.capacity, full, nearFull, enoughInterest: yes.length >= needed, everyoneIn: eligible.length > 1 && yes.length === eligible.length };
}

export function paymentState(s: AppState, activity: Activity, userId: string): PaymentState {
  if (activity.status !== "confirmed" || !activity.estimatedCostPerPerson) return "tbd";
  return s.payments[`${activity.id}:${userId}`] ?? "unpaid";
}

export type CostLine = { activity: Activity; perPerson: number; yesCount: number; groupTotal: number; mine: "yes" | "maybe" | "none"; confirmed: boolean };

export function costLines(s: AppState, userId = s.currentUserId): CostLine[] {
  return activeActivities(s)
    .filter((a) => a.estimatedCostPerPerson)
    .map((a) => {
      const t = tally(s, a);
      const resp = responseOf(s, a.id, userId);
      return { activity: a, perPerson: a.estimatedCostPerPerson ?? 0, yesCount: t.yes.length, groupTotal: (a.estimatedCostPerPerson ?? 0) * t.yes.length, mine: resp === "yes" ? ("yes" as const) : resp === "maybe" ? ("maybe" as const) : ("none" as const), confirmed: a.status === "confirmed" };
    });
}

export function personalCost(s: AppState, userId = s.currentUserId) {
  const lines = costLines(s, userId);
  const sum = (f: (l: CostLine) => boolean) => lines.filter(f).reduce((n, l) => n + l.perPerson, 0);
  const confirmed = sum((l) => l.mine === "yes" && l.confirmed);
  const tentative = sum((l) => l.mine === "yes" && !l.confirmed);
  const ifMaybe = sum((l) => l.mine === "maybe");
  return { confirmed, tentative, total: confirmed + tentative, ifMaybe };
}

export function groupCost(s: AppState) {
  const lines = costLines(s);
  const confirmed = lines.filter((l) => l.confirmed).reduce((n, l) => n + l.groupTotal, 0);
  const tentative = lines.filter((l) => !l.confirmed).reduce((n, l) => n + l.groupTotal, 0);
  return { confirmed, tentative, total: confirmed + tentative };
}

export const confirmedCount = (s: AppState, userId: string) =>
  s.activities.filter((a) => a.status === "confirmed" && responseOf(s, a.id, userId) === "yes").length;

export const pendingFor = (s: AppState, userId = s.currentUserId) =>
  activeActivities(s).filter((a) => !responseOf(s, a.id, userId));

export function tripDays(s: AppState): string[] {
  return eachDayOfInterval({ start: parseISO(s.trip.startDate), end: parseISO(s.trip.endDate) }).map((d) => format(d, "yyyy-MM-dd"));
}

export const daysUntil = (iso: string, from = new Date()) => differenceInCalendarDays(parseISO(iso), from);

export function sortActivities(list: Activity[]) {
  return [...list].sort((a, b) => (a.startTime ?? "99:99").localeCompare(b.startTime ?? "99:99") || a.title.localeCompare(b.title));
}

export type ResponseView = ActivityResponse;

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const range = (a: Activity): [number, number] | undefined => (a.startTime ? [toMin(a.startTime), a.endTime ? toMin(a.endTime) : toMin(a.startTime) + 120] : undefined);

/** Other plans on the same day whose time ranges overlap this one. Ideas, cancelled plans, and plans without a time are ignored. */
export function conflictsFor(s: AppState, activity: Activity): Activity[] {
  const mine = range(activity);
  if (!mine || !activity.date || activity.status === "idea" || activity.status === "cancelled") return [];
  return s.activities.filter((o) => {
    if (o.id === activity.id || o.date !== activity.date || o.status === "idea" || o.status === "cancelled") return false;
    const theirs = range(o);
    return !!theirs && mine[0] < theirs[1] && theirs[0] < mine[1];
  });
}

/** The organizer, or whoever suggested the activity, can edit it. */
export const canEditActivity = (s: AppState, activity: Activity, userId = s.currentUserId) => isHost(s, userId) || activity.createdBy === userId;
