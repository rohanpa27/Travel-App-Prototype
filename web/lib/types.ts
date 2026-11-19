// Data model for the prototype (see docs/TRAVELY_PROTOTYPE_PROTOCOL.md, section 10).

export type Budget = "budget" | "moderate" | "premium";
export type RsvpResponse = "yes" | "maybe" | "no";
export type TripResponse = "going" | "maybe" | "not_going";
export type ActivityStatus = "idea" | "proposed" | "confirmed" | "cancelled";
export type PaymentState = "paid" | "unpaid" | "tbd";

export type User = {
  id: string;
  name: string;
  avatarUrl: string;
  homeAirport?: string;
  homeCity?: string;
  interests: string[];
  budgetPreference?: Budget;
};

export type Trip = {
  id: string;
  slug: string;
  title: string;
  destination: string;
  description: string;
  startDate: string; // yyyy-MM-dd
  endDate: string;
  coverImageUrl: string;
  themeColor: string;
  vibeTags: string[];
  estimatedBudget?: number; // per person, for activities
  hostId: string;
  memberIds: string[];
  visibility: "invite_only" | "anyone_with_link";
  allowGuestsToPropose: boolean;
};

export type Activity = {
  id: string;
  tripId: string;
  createdBy: string;
  title: string;
  description?: string;
  category: string;
  date?: string;
  startTime?: string; // HH:mm
  endTime?: string;
  timeStatus: "scheduled" | "tbd";
  address?: string;
  imageUrl?: string;
  externalUrl?: string;
  estimatedCostPerPerson?: number;
  capacity?: number;
  reservationDeadline?: string;
  status: ActivityStatus;
};

export type ActivityResponse = {
  activityId: string;
  userId: string;
  response: RsvpResponse;
  updatedAt: string;
};

export type TripMembership = {
  tripId: string;
  userId: string;
  role: "host" | "member";
  tripResponse: TripResponse;
};

export type Flight = {
  id: string;
  tripId: string;
  userId: string;
  direction: "arrival" | "departure";
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string; // local ISO yyyy-MM-ddTHH:mm
  arrivalTime: string;
  airline: string;
  flightNumber: string;
  source: "manual" | "calendar" | "email" | "mock_search";
};

export type Recommendation = {
  id: string;
  tripId: string;
  title: string;
  description: string;
  imageUrl?: string;
  estimatedCostPerPerson?: number;
  suggestedDate?: string;
  suggestedTime?: string;
  explanation: string; // seed fallback; the UI builds a live explanation from signals
  status: "new" | "saved" | "proposed" | "idea" | "dismissed";
  category: string;
  vibes: string[];
  interests: string[];
  similarGroupsPercent: number;
  daypart: "morning" | "afternoon" | "evening";
};

export type FeedItem = {
  id: string;
  userId: string;
  text: string;
  at: string; // ISO timestamp
  activityId?: string;
};

export type AppState = {
  version: number;
  currentUserId: string;
  users: User[];
  trip: Trip;
  memberships: TripMembership[];
  activities: Activity[];
  responses: ActivityResponse[];
  flights: Flight[];
  recommendations: Recommendation[];
  payments: Record<string, PaymentState>; // key: `${activityId}:${userId}`
  feed: FeedItem[];
  calendarConnected: boolean;
  hasJoined: boolean; // has the viewer joined through the invite page
};
