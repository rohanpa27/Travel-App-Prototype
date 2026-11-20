import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import type { Activity, AppState } from "./types";
import { createChicagoState } from "./demo/chicago";
import { slugify } from "./format";
import { THEMES } from "./constants";

export type NewTripInput = {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  description: string;
  vibeTags: string[];
  estimatedBudget?: number;
  themeId: string;
  visibility: "invite_only" | "anyone_with_link";
  allowGuestsToPropose: boolean;
  showCosts?: boolean;
  starters: { title: string; category: string; cost?: number }[];
};

// Seeded suggestions mention Chicago places. For other destinations we swap in neutral wording.
const GENERIC: Record<string, { title: string; description: string }> = {
  "r-sunset-cruise": { title: "Sunset boat or waterfront walk", description: "Golden-hour time on the water, or a slow walk along it if the weather turns." },
  "r-deep-dish": { title: "Local food crawl", description: "Three signature local bites in three neighborhoods, with a guide." },
  "r-comedy": { title: "Late-night comedy show", description: "Live improv or stand-up. Doors late, drinks at the bar." },
  "r-art-institute": { title: "Museum power hour", description: "A guided speed-run through the highlights, then coffee." },
  "r-lakefront-bikes": { title: "Group bike ride", description: "Rent bikes and roll the best scenic route in town." },
  "r-rooftop": { title: "Rooftop cocktails", description: "City views, a long drinks list, and a reservation that fits the group." },
  "r-spa": { title: "Group spa morning", description: "Steam rooms, soaking tubs, and zero planning for a few hours." },
  "r-jazz": { title: "Live music night", description: "A small venue, good sound, and a local band." },
};

const SEED_START = "2027-03-14";

/** Builds a fresh single-host trip. The viewer stays the predefined host user. */
export function buildTripState(input: NewTripInput, id: (p: string) => string): AppState {
  const base = createChicagoState();
  const host = base.users.find((u) => u.id === base.currentUserId)!;
  const theme = THEMES.find((t) => t.id === input.themeId) ?? THEMES[0];
  const tripId = id("trip");
  const isChicago = /chicago/i.test(input.destination);
  const city = input.destination.split(",")[0].trim();
  const span = differenceInCalendarDays(parseISO(input.endDate), parseISO(input.startDate));

  const starters: Activity[] = input.starters.map((st) => ({
    id: id("a"),
    tripId,
    createdBy: host.id,
    title: st.title,
    category: st.category,
    timeStatus: "tbd",
    estimatedCostPerPerson: input.showCosts === false ? undefined : st.cost,
    status: "idea",
  }));

  return {
    ...base,
    users: [host],
    trip: {
      id: tripId,
      slug: slugify(input.title) || "my-trip",
      title: input.title,
      destination: input.destination,
      description: input.description,
      startDate: input.startDate,
      endDate: input.endDate,
      coverImageUrl: theme.cover,
      themeColor: theme.color,
      vibeTags: input.vibeTags,
      estimatedBudget: input.showCosts === false ? undefined : input.estimatedBudget,
      hostId: host.id,
      memberIds: [host.id],
      visibility: input.visibility,
      allowGuestsToPropose: input.allowGuestsToPropose,
      showCosts: input.showCosts !== false,
    },
    memberships: [{ tripId, userId: host.id, role: "host", tripResponse: "going" }],
    activities: starters,
    responses: starters.map((a) => ({ activityId: a.id, userId: host.id, response: "yes" as const, updatedAt: new Date().toISOString() })),
    flights: [],
    payments: {},
    calendarConnected: false,
    hasJoined: false,
    recommendations: base.recommendations.map((r) => {
      const offset = r.suggestedDate ? differenceInCalendarDays(parseISO(r.suggestedDate), parseISO(SEED_START)) : 0;
      const g = GENERIC[r.id];
      return {
        ...r,
        tripId,
        suggestedDate: r.suggestedDate ? format(addDays(parseISO(input.startDate), Math.min(offset, span)), "yyyy-MM-dd") : undefined,
        title: isChicago || !g ? r.title : `${g.title} in ${city}`,
        description: isChicago || !g ? r.description : g.description,
      };
    }),
    feed: [{ id: id("fd"), userId: host.id, text: "created the trip", at: new Date().toISOString() }],
  };
}
