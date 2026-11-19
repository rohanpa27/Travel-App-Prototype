"use client";

import { useSyncExternalStore } from "react";
import type { Activity, ActivityStatus, AppState, Flight, PaymentState, RsvpResponse, TripResponse, User } from "./types";
import { STATE_VERSION, STORAGE_KEY, STORE_VERSION } from "./constants";
import { createChicagoState } from "./demo/chicago";
import { DEFAULT_TRIP_ID, DEMO_TRIPS, createDemoTrip } from "./demo";

// ---- Actions -----------------------------------------------------------------
export type Action =
  | { type: "join"; user: User }
  | { type: "setViewer"; userId: string }
  | { type: "respond"; activityId: string; userId: string; response: RsvpResponse }
  | { type: "addActivity"; activity: Activity }
  | { type: "updateActivity"; id: string; patch: Partial<Activity> }
  | { type: "setStatus"; id: string; status: ActivityStatus }
  | { type: "setTripResponse"; userId: string; response: TripResponse }
  | { type: "setPayment"; activityId: string; userId: string; state: PaymentState }
  | { type: "addFlights"; flights: Flight[] }
  | { type: "setCalendarConnected"; value: boolean }
  | { type: "recAction"; id: string; action: "save" | "dismiss" | "idea" | "propose"; activity?: Activity }
  | { type: "updateUser"; id: string; patch: Partial<User> }
  | { type: "reset" };

/** Actions that act on the whole saved set of trips rather than the open one. */
export type RootAction = { type: "switchTrip"; id: string } | { type: "addTrip"; state: AppState } | { type: "resetAll" } | { type: "deleteTrip"; id: string };

const now = () => new Date().toISOString();
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}`;

export function reducer(s: AppState, a: Action): AppState {
  switch (a.type) {
    case "join": {
      if (s.users.some((u) => u.id === a.user.id)) return s;
      return {
        ...s,
        users: [...s.users, a.user],
        currentUserId: a.user.id,
        hasJoined: true,
        trip: { ...s.trip, memberIds: [...s.trip.memberIds, a.user.id] },
        memberships: [...s.memberships, { tripId: s.trip.id, userId: a.user.id, role: "member", tripResponse: "going" }],
        feed: [{ id: uid("fd"), userId: a.user.id, text: "joined the trip", at: now() }, ...s.feed],
      };
    }
    case "setViewer":
      return { ...s, currentUserId: a.userId };
    case "respond": {
      const rest = s.responses.filter((r) => !(r.activityId === a.activityId && r.userId === a.userId));
      const title = s.activities.find((x) => x.id === a.activityId)?.title ?? "an activity";
      const word = { yes: "is in for", maybe: "might join", no: "can't make" }[a.response];
      return {
        ...s,
        responses: [...rest, { activityId: a.activityId, userId: a.userId, response: a.response, updatedAt: now() }],
        feed: [{ id: uid("fd"), userId: a.userId, text: `${word} ${title}`, at: now(), activityId: a.activityId }, ...s.feed].slice(0, 40),
      };
    }
    case "addActivity":
      return {
        ...s,
        activities: [...s.activities, a.activity],
        responses: [...s.responses, { activityId: a.activity.id, userId: a.activity.createdBy, response: "yes", updatedAt: now() }],
        feed: [{ id: uid("fd"), userId: a.activity.createdBy, text: a.activity.status === "idea" ? `added ${a.activity.title} to the ideas` : `proposed ${a.activity.title}`, at: now(), activityId: a.activity.id }, ...s.feed].slice(0, 40),
      };
    case "updateActivity":
      return { ...s, activities: s.activities.map((x) => (x.id === a.id ? { ...x, ...a.patch } : x)) };
    case "setStatus": {
      const title = s.activities.find((x) => x.id === a.id)?.title ?? "an activity";
      return {
        ...s,
        activities: s.activities.map((x) => (x.id === a.id ? { ...x, status: a.status } : x)),
        feed: [{ id: uid("fd"), userId: s.currentUserId, text: `${a.status === "confirmed" ? "confirmed" : a.status === "cancelled" ? "cancelled" : "moved to ideas:"} ${title}`, at: now(), activityId: a.id }, ...s.feed].slice(0, 40),
      };
    }
    case "setTripResponse":
      return { ...s, memberships: s.memberships.map((m) => (m.userId === a.userId ? { ...m, tripResponse: a.response } : m)) };
    case "setPayment":
      return { ...s, payments: { ...s.payments, [`${a.activityId}:${a.userId}`]: a.state } };
    case "addFlights": {
      const replaced = s.flights.filter((f) => !a.flights.some((n) => n.userId === f.userId && n.direction === f.direction));
      return { ...s, flights: [...replaced, ...a.flights] };
    }
    case "setCalendarConnected":
      return { ...s, calendarConnected: a.value };
    case "recAction": {
      const status = { save: "saved", dismiss: "dismissed", idea: "idea", propose: "proposed" }[a.action] as AppState["recommendations"][number]["status"];
      let next: AppState = { ...s, recommendations: s.recommendations.map((r) => (r.id === a.id ? { ...r, status } : r)) };
      if (a.activity) next = reducer(next, { type: "addActivity", activity: a.activity });
      return next;
    }
    case "updateUser":
      return { ...s, users: s.users.map((u) => (u.id === a.id ? { ...u, ...a.patch } : u)) };
    case "reset":
      return createChicagoState();
  }
}

// ---- Root store: every trip is saved separately, one is open ----------------------
export type RootState = { version: number; activeId: string; trips: Record<string, AppState> };

const freshRoot = (): RootState => {
  const chicago = createChicagoState();
  return { version: STORE_VERSION, activeId: chicago.trip.id, trips: { [chicago.trip.id]: chicago } };
};

export function rootReducer(root: RootState, a: Action | RootAction): RootState {
  switch (a.type) {
    case "switchTrip": {
      if (root.trips[a.id]) return { ...root, activeId: a.id };
      const demo = createDemoTrip(a.id);
      return demo ? { ...root, activeId: a.id, trips: { ...root.trips, [a.id]: demo } } : root;
    }
    case "addTrip":
      return { ...root, activeId: a.state.trip.id, trips: { ...root.trips, [a.state.trip.id]: a.state } };
    case "deleteTrip": {
      const { [a.id]: _removed, ...rest } = root.trips;
      void _removed;
      if (!Object.keys(rest).length) return freshRoot();
      return { ...root, trips: rest, activeId: root.activeId === a.id ? (rest[DEFAULT_TRIP_ID] ? DEFAULT_TRIP_ID : Object.keys(rest)[0]) : root.activeId };
    }
    case "resetAll":
      return freshRoot();
    case "reset":
      return freshRoot();
    default: {
      const current = root.trips[root.activeId];
      return { ...root, trips: { ...root.trips, [root.activeId]: reducer(current, a) } };
    }
  }
}

// ---- External store (localStorage-backed) ---------------------------------------
const SEED = freshRoot();
let state: RootState = SEED;
let loaded = false;
const listeners = new Set<() => void>();

const looksLikeTrip = (t: unknown): t is AppState => !!t && typeof t === "object" && "trip" in t && Array.isArray((t as AppState).activities) && Array.isArray((t as AppState).users);

function load(): RootState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.version === STORE_VERSION && parsed.trips && parsed.trips[parsed.activeId] && Object.values(parsed.trips).every(looksLikeTrip)) return parsed as RootState;
      // Saved by the first prototype version: a single trip. Keep the person's changes.
      if (looksLikeTrip(parsed) && parsed.version === STATE_VERSION) return { version: STORE_VERSION, activeId: parsed.trip.id, trips: { [parsed.trip.id]: parsed } };
    }
  } catch {
    // Storage blocked or corrupt: fall back to the seed.
  }
  return freshRoot();
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode or quota: the demo still works for this session.
  }
}

function getSnapshot(): RootState {
  if (!loaded) {
    loaded = true;
    state = load();
  }
  return state;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      state = load();
      listeners.forEach((l) => l());
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function dispatch(action: Action | RootAction) {
  state = rootReducer(getSnapshot(), action);
  persist();
  listeners.forEach((l) => l());
}

const useRoot = () => useSyncExternalStore(subscribe, getSnapshot, () => SEED);

/** The trip that is currently open. Server render and first hydration use the Chicago seed. */
export function useAppState(): AppState {
  const root = useRoot();
  return root.trips[root.activeId];
}

export type TripSummary = { id: string; title: string; destination: string; startDate: string; endDate: string; cover: string; members: number; active: boolean };
export type DemoOption = { id: string; label: string; blurb: string; loaded: boolean };

/** Every saved trip, plus the built-in demo trips that have not been opened yet. */
export function useTrips(): { saved: TripSummary[]; unopenedDemos: DemoOption[]; activeId: string } {
  const root = useRoot();
  const saved = Object.values(root.trips).map((t) => ({ id: t.trip.id, title: t.trip.title, destination: t.trip.destination, startDate: t.trip.startDate, endDate: t.trip.endDate, cover: t.trip.coverImageUrl, members: t.trip.memberIds.length, active: t.trip.id === root.activeId }));
  const unopenedDemos = DEMO_TRIPS.filter((d) => !root.trips[d.id]).map((d) => ({ id: d.id, label: d.label, blurb: d.blurb, loaded: false }));
  return { saved, unopenedDemos, activeId: root.activeId };
}

export function newId(prefix: string) {
  return uid(prefix);
}
