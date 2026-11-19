// Registry of the built-in demo trips. Chicago is first and is the default.
import type { AppState, Trip } from "../types";
import { createChicagoState } from "./chicago";
import { createAspenState } from "./aspen";
import { createLisbonState } from "./lisbon";
import { createAustinState } from "./austin";

export type DemoTrip = { id: string; label: string; blurb: string; create: () => AppState; /** Trip details for cards, built once. */ preview: Trip };

const define = (label: string, blurb: string, create: () => AppState): DemoTrip => {
  const preview = create().trip;
  return { id: preview.id, label, blurb, create, preview };
};

export const DEMO_TRIPS: DemoTrip[] = [
  define("Birthday weekend", "Six friends, a rooftop dinner, and a boat tour that is almost full.", createChicagoState),
  define("Ski trip", "Lift tickets, a limited-seat lesson, and a free hot tub night.", createAspenState),
  define("Bachelorette", "Two plans overlap on Saturday. Can the group agree?", createLisbonState),
  define("Festival weekend", "Five flights landing within a few hours, and a budget to protect.", createAustinState),
];

export const DEFAULT_TRIP_ID = DEMO_TRIPS[0].id;
export const createDemoTrip = (id: string): AppState | undefined => DEMO_TRIPS.find((d) => d.id === id)?.create();
