export const ROUTES = {
  home: "/",
  create: "/create",
  invite: "/invite",
  trip: "/trip",
  itinerary: "/trip/itinerary",
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
  { id: "Stay", color: "#8FD3FF" },
  { id: "Food", color: "#FFC857" },
  { id: "Drinks", color: "#FF8FC7" },
  { id: "Outdoors", color: "#8EDB5A" },
  { id: "Culture", color: "#B9A6FF" },
  { id: "Nightlife", color: "#FF5C45" },
  { id: "Transport", color: "#C9C3B6" },
  { id: "Other", color: "#E7E1D4" },
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
};

export const STORAGE_KEY = "trip-prototype:v1";
export const STATE_VERSION = 1;
