import type { Activity, ActivityResponse, AppState, Flight, Recommendation, RsvpResponse, User } from "../types";
import { STATE_VERSION } from "../constants";

const TRIP_ID = "trip-chicago";
const seededAt = (hoursAgo: number) => new Date(Date.UTC(2026, 10, 18, 18, 0) - hoursAgo * 3600_000).toISOString();

export const SEED_USERS: User[] = [
  { id: "maya", name: "Maya", avatarUrl: "/avatars/maya.svg", homeAirport: "JFK", homeCity: "New York", interests: ["Food", "Music", "Art"], budgetPreference: "moderate" },
  { id: "jordan", name: "Jordan", avatarUrl: "/avatars/jordan.svg", homeAirport: "LAX", homeCity: "Los Angeles", interests: ["Nightlife", "Music", "Food"], budgetPreference: "moderate" },
  { id: "priya", name: "Priya", avatarUrl: "/avatars/priya.svg", homeAirport: "BOS", homeCity: "Boston", interests: ["Outdoors", "Art", "Wellness"], budgetPreference: "budget" },
  { id: "eli", name: "Eli", avatarUrl: "/avatars/eli.svg", homeAirport: "AUS", homeCity: "Austin", interests: ["Outdoors", "Sports", "Food"], budgetPreference: "budget" },
  { id: "sofia", name: "Sofia", avatarUrl: "/avatars/sofia.svg", homeAirport: "MIA", homeCity: "Miami", interests: ["Nightlife", "Shopping", "Outdoors"], budgetPreference: "premium" },
  { id: "noah", name: "Noah", avatarUrl: "/avatars/noah.svg", homeAirport: "LGA", homeCity: "New York", interests: ["Outdoors", "Art", "Food"], budgetPreference: "moderate" },
];

const act = (a: Partial<Activity> & Pick<Activity, "id" | "title" | "category" | "status" | "createdBy">): Activity => ({
  tripId: TRIP_ID,
  timeStatus: "scheduled",
  ...a,
});

export const SEED_ACTIVITIES: Activity[] = [
  act({ id: "a-hotel", title: "Hotel check-in", category: "Stay", status: "confirmed", createdBy: "maya", date: "2027-03-14", startTime: "15:00", address: "505 N State St, Chicago", estimatedCostPerPerson: 120, description: "Two nights at a river-view hotel. Rooms are booked in pairs, so the cost is split evenly.", capacity: 6 }),
  act({ id: "a-aba", title: "Dinner at Aba", category: "Food", status: "confirmed", createdBy: "maya", date: "2027-03-14", startTime: "19:30", endTime: "21:30", address: "302 N Green St, Chicago", estimatedCostPerPerson: 65, capacity: 8, reservationDeadline: "2027-03-01", description: "Mediterranean small plates on the rooftop. We booked a long table for the whole group." }),
  act({ id: "a-drinks", title: "Drinks in West Loop", category: "Drinks", status: "proposed", createdBy: "jordan", date: "2027-03-15", startTime: "17:30", address: "Randolph Street, West Loop", estimatedCostPerPerson: 40, description: "Bar hop down Randolph Street before the boat. Jordan has three spots in mind." }),
  act({ id: "a-boat", title: "Architecture boat tour", category: "Culture", status: "proposed", createdBy: "priya", date: "2027-03-15", startTime: "11:00", endTime: "12:30", address: "112 E Wacker Dr, Chicago", estimatedCostPerPerson: 52, capacity: 5, reservationDeadline: "2027-03-05", externalUrl: "https://example.com/architecture-cruise", description: "90 minutes on the river learning why Chicago's skyline looks the way it does. Only five seats left on our time slot." }),
  act({ id: "a-picnic", title: "Beach picnic", category: "Outdoors", status: "idea", createdBy: "eli", timeStatus: "tbd", address: "North Avenue Beach, Chicago", estimatedCostPerPerson: 20, description: "Grab food, blankets, and a speaker and hang by the lake if the weather behaves." }),
  act({ id: "a-bday", title: "Birthday dinner", category: "Food", status: "confirmed", createdBy: "maya", date: "2027-03-15", startTime: "20:00", endTime: "22:30", address: "1 W Wacker Dr, Chicago", estimatedCostPerPerson: 95, capacity: 8, reservationDeadline: "2027-03-08", description: "The big one. Dress up, bring a toast." }),
  act({ id: "a-brunch", title: "Farewell brunch", category: "Food", status: "proposed", createdBy: "noah", date: "2027-03-16", timeStatus: "tbd", address: "Fulton Market, Chicago", estimatedCostPerPerson: 35, description: "Slow morning, big plates. Time depends on everyone's flights home." }),
];

const r = (activityId: string, userId: string, response: RsvpResponse, hoursAgo: number): ActivityResponse => ({ activityId, userId, response, updatedAt: seededAt(hoursAgo) });

// Maya (the default viewer) is deliberately pending on a few, so Trip home has decisions waiting.
export const SEED_RESPONSES: ActivityResponse[] = [
  r("a-hotel", "maya", "yes", 90), r("a-hotel", "jordan", "yes", 80), r("a-hotel", "priya", "yes", 70), r("a-hotel", "eli", "maybe", 60), r("a-hotel", "sofia", "yes", 50), r("a-hotel", "noah", "yes", 40),
  r("a-aba", "maya", "yes", 85), r("a-aba", "jordan", "yes", 75), r("a-aba", "priya", "yes", 65), r("a-aba", "eli", "yes", 55), r("a-aba", "sofia", "yes", 45), r("a-aba", "noah", "yes", 35),
  r("a-bday", "maya", "yes", 84), r("a-bday", "jordan", "yes", 74), r("a-bday", "priya", "yes", 64), r("a-bday", "eli", "maybe", 54), r("a-bday", "sofia", "yes", 44), r("a-bday", "noah", "yes", 34),
  r("a-drinks", "jordan", "yes", 30), r("a-drinks", "priya", "yes", 26), r("a-drinks", "eli", "yes", 22), r("a-drinks", "sofia", "yes", 20), r("a-drinks", "noah", "yes", 18),
  r("a-boat", "priya", "yes", 28), r("a-boat", "jordan", "maybe", 24), r("a-boat", "eli", "yes", 21), r("a-boat", "sofia", "no", 17), r("a-boat", "noah", "yes", 15),
  r("a-picnic", "eli", "yes", 12), r("a-picnic", "priya", "yes", 10), r("a-picnic", "sofia", "maybe", 9), r("a-picnic", "jordan", "maybe", 8), r("a-picnic", "noah", "no", 7),
  r("a-brunch", "noah", "yes", 6), r("a-brunch", "jordan", "maybe", 5), r("a-brunch", "priya", "yes", 4),
];

const fl = (f: Omit<Flight, "tripId" | "arrivalAirport"> & { arrivalAirport?: string }): Flight => ({ tripId: TRIP_ID, arrivalAirport: "ORD", ...f });

export const SEED_FLIGHTS: Flight[] = [
  fl({ id: "f-maya-in", userId: "maya", direction: "arrival", departureAirport: "JFK", departureTime: "2027-03-14T08:30", arrivalTime: "2027-03-14T10:40", airline: "United", flightNumber: "UA 1432", source: "calendar" }),
  fl({ id: "f-maya-out", userId: "maya", direction: "departure", arrivalAirport: "JFK", departureAirport: "ORD", departureTime: "2027-03-16T17:10", arrivalTime: "2027-03-16T20:25", airline: "United", flightNumber: "UA 1587", source: "calendar" }),
  fl({ id: "f-noah-in", userId: "noah", direction: "arrival", departureAirport: "LGA", departureTime: "2027-03-14T08:50", arrivalTime: "2027-03-14T11:05", airline: "American", flightNumber: "AA 2210", source: "manual" }),
  fl({ id: "f-noah-out", userId: "noah", direction: "departure", arrivalAirport: "LGA", departureAirport: "ORD", departureTime: "2027-03-16T16:00", arrivalTime: "2027-03-16T19:15", airline: "American", flightNumber: "AA 2251", source: "manual" }),
  fl({ id: "f-priya-in", userId: "priya", direction: "arrival", departureAirport: "BOS", departureTime: "2027-03-14T10:45", arrivalTime: "2027-03-14T12:35", airline: "JetBlue", flightNumber: "B6 421", source: "manual" }),
  fl({ id: "f-priya-out", userId: "priya", direction: "departure", arrivalAirport: "BOS", departureAirport: "ORD", departureTime: "2027-03-16T15:30", arrivalTime: "2027-03-16T18:50", airline: "JetBlue", flightNumber: "B6 424", source: "manual" }),
  fl({ id: "f-jordan-in", userId: "jordan", direction: "arrival", departureAirport: "LAX", departureTime: "2027-03-14T09:15", arrivalTime: "2027-03-14T15:10", airline: "Delta", flightNumber: "DL 880", source: "email" }),
  fl({ id: "f-jordan-out", userId: "jordan", direction: "departure", arrivalAirport: "LAX", departureTime: "2027-03-16T18:00", arrivalTime: "2027-03-16T20:20", departureAirport: "ORD", airline: "Delta", flightNumber: "DL 911", source: "email" }),
  fl({ id: "f-eli-in", userId: "eli", direction: "arrival", departureAirport: "AUS", departureTime: "2027-03-14T12:00", arrivalTime: "2027-03-14T14:20", airline: "Southwest", flightNumber: "WN 1306", source: "calendar" }),
  fl({ id: "f-eli-out", userId: "eli", direction: "departure", arrivalAirport: "AUS", departureAirport: "ORD", departureTime: "2027-03-16T14:40", arrivalTime: "2027-03-16T17:05", airline: "Southwest", flightNumber: "WN 1311", source: "calendar" }),
];

const rec = (x: Omit<Recommendation, "tripId" | "status" | "explanation" | "imageUrl"> & { imageUrl?: string }): Recommendation => ({ tripId: TRIP_ID, status: "new", explanation: "", ...x });

export const SEED_RECOMMENDATIONS: Recommendation[] = [
  rec({ id: "r-sunset-cruise", title: "Sunset skyline cruise", description: "Golden-hour ride down the river and out to the lake with the skyline lit up.", category: "Outdoors", estimatedCostPerPerson: 58, suggestedDate: "2027-03-14", suggestedTime: "17:30", vibes: ["Outdoors", "Relaxed", "Luxury"], interests: ["Outdoors", "Art"], similarGroupsPercent: 72, daypart: "evening" }),
  rec({ id: "r-deep-dish", title: "Deep-dish pizza crawl", description: "Three famous slices in three neighborhoods, with a guide who has strong opinions.", category: "Food", estimatedCostPerPerson: 45, suggestedDate: "2027-03-15", suggestedTime: "13:30", vibes: ["Foodie", "Budget-friendly"], interests: ["Food"], similarGroupsPercent: 81, daypart: "afternoon" }),
  rec({ id: "r-comedy", title: "Late-night comedy show", description: "Improv and sketch in Old Town. Doors at 10, drinks at the bar.", category: "Nightlife", estimatedCostPerPerson: 32, suggestedDate: "2027-03-14", suggestedTime: "22:00", vibes: ["Nightlife", "Culture"], interests: ["Nightlife", "Music"], similarGroupsPercent: 64, daypart: "evening" }),
  rec({ id: "r-art-institute", title: "Art Institute power hour", description: "A guided speed-run through the greatest hits, then coffee in the garden.", category: "Culture", estimatedCostPerPerson: 32, suggestedDate: "2027-03-16", suggestedTime: "10:00", vibes: ["Culture", "Relaxed"], interests: ["Art"], similarGroupsPercent: 58, daypart: "morning" }),
  rec({ id: "r-lakefront-bikes", title: "Lakefront bike ride", description: "Rent bikes and roll the lakefront trail from Navy Pier to North Avenue Beach.", category: "Outdoors", estimatedCostPerPerson: 24, suggestedDate: "2027-03-16", suggestedTime: "09:30", vibes: ["Outdoors", "Adventure", "Budget-friendly"], interests: ["Outdoors", "Sports"], similarGroupsPercent: 69, daypart: "morning" }),
  rec({ id: "r-rooftop", title: "Rooftop cocktails", description: "Skyline views, a long drinks list, and a reservation that fits six.", category: "Drinks", estimatedCostPerPerson: 55, suggestedDate: "2027-03-14", suggestedTime: "21:30", vibes: ["Luxury", "Nightlife"], interests: ["Nightlife", "Shopping"], similarGroupsPercent: 76, daypart: "evening" }),
  rec({ id: "r-spa", title: "Group spa morning", description: "Steam rooms, soaking tubs, and zero planning for a few hours.", category: "Other", estimatedCostPerPerson: 78, suggestedDate: "2027-03-16", suggestedTime: "09:30", vibes: ["Relaxed", "Luxury"], interests: ["Wellness"], similarGroupsPercent: 49, daypart: "morning" }),
  rec({ id: "r-jazz", title: "Live jazz in a basement club", description: "Two sets, small tables, and a very good house band.", category: "Nightlife", estimatedCostPerPerson: 28, suggestedDate: "2027-03-15", suggestedTime: "22:30", vibes: ["Culture", "Nightlife", "Relaxed"], interests: ["Music", "Nightlife"], similarGroupsPercent: 61, daypart: "evening" }),
];

export function createChicagoState(): AppState {
  return {
    version: STATE_VERSION,
    currentUserId: "maya",
    users: structuredClone(SEED_USERS),
    trip: {
      id: TRIP_ID,
      slug: "chicago-birthday-weekend",
      title: "Chicago Birthday Weekend",
      destination: "Chicago, IL",
      description: "Food, dancing, and recovering by the lake.",
      startDate: "2027-03-14",
      endDate: "2027-03-16",
      coverImageUrl: "/covers/chicago-skyline.svg",
      themeColor: "#FFC857",
      vibeTags: ["Foodie", "Nightlife", "Outdoors"],
      estimatedBudget: 75,
      hostId: "maya",
      memberIds: SEED_USERS.map((u) => u.id),
      visibility: "anyone_with_link",
      allowGuestsToPropose: true,
    },
    memberships: SEED_USERS.map((u) => ({
      tripId: TRIP_ID,
      userId: u.id,
      role: u.id === "maya" ? ("host" as const) : ("member" as const),
      tripResponse: u.id === "eli" ? ("maybe" as const) : ("going" as const),
    })),
    activities: structuredClone(SEED_ACTIVITIES),
    responses: structuredClone(SEED_RESPONSES),
    flights: structuredClone(SEED_FLIGHTS),
    recommendations: structuredClone(SEED_RECOMMENDATIONS),
    payments: {
      "a-hotel:maya": "paid", "a-hotel:jordan": "paid", "a-hotel:priya": "unpaid", "a-hotel:eli": "unpaid", "a-hotel:sofia": "paid", "a-hotel:noah": "paid",
      "a-aba:maya": "paid", "a-aba:jordan": "unpaid",
    },
    feed: [
      { id: "fd-1", userId: "noah", text: "suggested Farewell brunch", at: seededAt(6), activityId: "a-brunch" },
      { id: "fd-2", userId: "eli", text: "added Beach picnic to the ideas", at: seededAt(12), activityId: "a-picnic" },
      { id: "fd-3", userId: "priya", text: "proposed Architecture boat tour", at: seededAt(28), activityId: "a-boat" },
      { id: "fd-4", userId: "jordan", text: "proposed Drinks in West Loop", at: seededAt(30), activityId: "a-drinks" },
      { id: "fd-5", userId: "maya", text: "confirmed Birthday dinner", at: seededAt(84), activityId: "a-bday" },
    ],
    calendarConnected: false,
    hasJoined: false,
  };
}
