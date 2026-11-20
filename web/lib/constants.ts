export const ROUTES = {
  home: "/",
  create: "/create",
  invite: "/invite",
  trip: "/trip",
  itinerary: "/trip/itinerary",
  calendar: "/trip/calendar",
  activity: "/trip/activity",
  activityEdit: "/trip/activity/edit",
  guests: "/trip/guests",
  costs: "/trip/costs",
  travel: "/trip/travel",
  recommendations: "/trip/recommendations",
  more: "/trip/more",
  profile: "/trip/profile",
} as const;

export const VIBES = ["Foodie", "Nightlife", "Outdoors", "Relaxed", "Luxury", "Budget-friendly", "Adventure", "Culture"] as const;
export const INTERESTS = ["Food", "Nightlife", "Outdoors", "Music", "Art", "Sports", "Wellness", "Shopping"] as const;

export const CATEGORIES = [
  { id: "Stay", color: "#9AD2FF" },
  { id: "Food", color: "#FFC766" },
  { id: "Drinks", color: "#FFA3D4" },
  { id: "Outdoors", color: "#86E0A6" },
  { id: "Culture", color: "#BBB0FF" },
  { id: "Nightlife", color: "#FF7C69" },
  { id: "Transport", color: "#CDD2E6" },
  { id: "Other", color: "#E4E7F3" },
] as const;

export const THEMES = [
  { id: "chicago-skyline", name: "Skyline", color: "#FFC857", cover: "/covers/chicago-skyline.svg" },
  { id: "sunset-beach", name: "Sunset", color: "#FFB4A2", cover: "/covers/sunset-beach.svg" },
  { id: "alpine-weekend", name: "Alpine", color: "#B8E0F6", cover: "/covers/alpine-weekend.svg" },
  { id: "festival-night", name: "Festival", color: "#1B1A2E", cover: "/covers/festival-night.svg" },
  { id: "city-after-dark", name: "After dark", color: "#3D2C8D", cover: "/covers/city-after-dark.svg" },
  { id: "garden-brunch", name: "Garden", color: "#FFF1D6", cover: "/covers/garden-brunch.svg" },
] as const;

export const AVATARS = ["sunny", "plum", "pebble", "cherry", "maya", "jordan", "priya", "eli", "sofia", "noah"].map((n) => `/avatars/${n}.svg`);

export const AIRPORTS: Record<string, string> = {
  JFK: "New York", LGA: "New York", LAX: "Los Angeles", BOS: "Boston", AUS: "Austin", MIA: "Miami",
  SFO: "San Francisco", SEA: "Seattle", ATL: "Atlanta", DFW: "Dallas", DEN: "Denver", DCA: "Washington, DC",
  ORD: "Chicago", PHL: "Philadelphia", PDX: "Portland", SLC: "Salt Lake City", BNA: "Nashville",
};

export const STORAGE_KEY = "trip-prototype:v1";
/** Version of a single trip's data. */
export const STATE_VERSION = 1;
/** Version of the saved root object that holds every trip. */
export const STORE_VERSION = 2;
