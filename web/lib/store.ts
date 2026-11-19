"use client";

import { useSyncExternalStore } from "react";
import type { Activity, ActivityStatus, AppState, Flight, PaymentState, RsvpResponse, TripResponse, User } from "./types";
import { STATE_VERSION, STORAGE_KEY } from "./constants";
import { createSeedState } from "./seed";

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
  | { type: "replaceTrip"; state: AppState }
  | { type: "reset" };

const now = () => new Date().toISOString();
const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}`;

function reducer(s: AppState, a: Action): AppState {
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
    case "replaceTrip":
      return a.state;
    case "reset":
      return createSeedState();
  }
}

// ---- External store (localStorage-backed) ---------------------------------------
const SEED = createSeedState();
let state: AppState = SEED;
let loaded = false;
const listeners = new Set<() => void>();

function load(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed.version === STATE_VERSION && parsed.trip && Array.isArray(parsed.activities) && Array.isArray(parsed.users)) return parsed;
    }
  } catch {
    // Storage blocked or corrupt: fall back to the seed.
  }
  return createSeedState();
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode or quota: the demo still works for this session.
  }
}

function getSnapshot(): AppState {
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

export function dispatch(action: Action) {
  state = reducer(getSnapshot(), action);
  persist();
  listeners.forEach((l) => l());
}

/** Reads the whole prototype state. Server render and first hydration use the seed. */
export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getSnapshot, () => SEED);
}

export function newId(prefix: string) {
  return uid(prefix);
}
