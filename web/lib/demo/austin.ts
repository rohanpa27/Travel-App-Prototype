import type { AppState } from "../types";
import { activities, assemble, flights, people, recs, responses } from "./builders";

const ID = "trip-austin";

export function createAustinState(): AppState {
  return assemble({
    id: ID, slug: "austin-live-music-weekend", title: "Austin Live Music Weekend", destination: "Austin, TX",
    description: "Three nights, too many stages, and breakfast tacos for recovery.", startDate: "2027-04-09", endDate: "2027-04-11",
    cover: "/covers/festival-night.svg", color: "#1B1A2E", vibes: ["Nightlife", "Budget-friendly", "Foodie"], budget: 60, hostId: "rae",
    users: people([
      { id: "rae", name: "Rae", avatar: "plum", airport: "DEN", city: "Denver", interests: ["Music", "Nightlife", "Food"], budget: "budget" },
      { id: "kofi", name: "Kofi", avatar: "noah", airport: "ATL", city: "Atlanta", interests: ["Music", "Sports", "Food"], budget: "moderate" },
      { id: "mina", name: "Mina", avatar: "sofia", airport: "SFO", city: "San Francisco", interests: ["Music", "Art", "Outdoors"], budget: "budget" },
      { id: "theo", name: "Theo", avatar: "jordan", airport: "ORD", city: "Chicago", interests: ["Nightlife", "Food"], budget: "moderate" },
      { id: "luz", name: "Luz", avatar: "sunny", airport: "MIA", city: "Miami", interests: ["Music", "Shopping", "Nightlife"], budget: "moderate" },
      { id: "sam", name: "Sam", avatar: "pebble", airport: "PHL", city: "Philadelphia", interests: ["Outdoors", "Art"], budget: "budget" },
    ]),
    tripResponses: { sam: "maybe", luz: "maybe" },
    activities: activities(ID, [
      { id: "au-stay", title: "Rental house check-in", category: "Stay", status: "confirmed", createdBy: "rae", date: "2027-04-09", startTime: "15:00", address: "East 6th St, Austin", estimatedCostPerPerson: 95, description: "A big house ten minutes from downtown. Porch included." },
      { id: "au-passes", title: "Festival weekend passes", category: "Nightlife", status: "confirmed", createdBy: "rae", date: "2027-04-09", startTime: "17:00", endTime: "23:59", address: "Zilker Park", estimatedCostPerPerson: 145, description: "Wristbands for all three nights. Pick them up at the Friday check-in tent." },
      { id: "au-tacos", title: "Breakfast tacos", category: "Food", status: "proposed", createdBy: "kofi", date: "2027-04-10", startTime: "10:00", address: "Cesar Chavez St, Austin", estimatedCostPerPerson: 14, description: "Fuel before day two." },
      { id: "au-bbq", title: "BBQ lunch", category: "Food", status: "confirmed", createdBy: "rae", date: "2027-04-10", startTime: "12:30", endTime: "14:00", address: "South Lamar Blvd, Austin", estimatedCostPerPerson: 28, capacity: 8, description: "Brisket by the pound. We pooled the order so nothing goes to waste." },
      { id: "au-springs", title: "Barton Springs swim", category: "Outdoors", status: "proposed", createdBy: "mina", date: "2027-04-10", startTime: "14:30", endTime: "16:00", address: "Barton Springs Pool", estimatedCostPerPerson: 9, description: "A cold-water reset between the barbecue and the headliners." },
      { id: "au-late", title: "Late-night club set", category: "Nightlife", status: "proposed", createdBy: "luz", date: "2027-04-10", startTime: "23:00", address: "Red River District", estimatedCostPerPerson: 40, capacity: 6, description: "A club show that starts when the festival ends." },
      { id: "au-kayak", title: "Lady Bird Lake kayaks", category: "Outdoors", status: "idea", createdBy: "sam", address: "Rowing Dock, Austin", estimatedCostPerPerson: 30, capacity: 4, description: "Paddle past the skyline if the wind is calm." },
      { id: "au-records", title: "Record store crawl", category: "Culture", status: "idea", createdBy: "mina", address: "South Congress, Austin", estimatedCostPerPerson: 0, description: "Free to browse, dangerous to leave." },
      { id: "au-brunch", title: "Sunday gospel brunch", category: "Food", status: "proposed", createdBy: "kofi", date: "2027-04-11", startTime: "11:00", endTime: "13:00", address: "East 11th St, Austin", estimatedCostPerPerson: 38, description: "Live choir, big plates, and a slow goodbye." },
    ]),
    responses: responses({
      "au-stay": { yes: ["rae", "kofi", "mina", "theo", "luz"], maybe: ["sam"] },
      "au-passes": { yes: ["rae", "kofi", "mina", "theo", "luz"], maybe: ["sam"] },
      "au-tacos": { yes: ["kofi", "theo", "rae"], maybe: ["mina"], no: ["luz"] },
      "au-bbq": { yes: ["rae", "kofi", "theo", "luz", "mina"], maybe: ["sam"] },
      "au-springs": { yes: ["mina", "sam"], maybe: ["rae"], no: ["theo"] },
      "au-late": { yes: ["luz", "theo", "kofi", "rae", "mina"], no: ["sam"] },
      "au-kayak": { yes: ["sam", "mina"] },
      "au-records": { yes: ["mina", "luz", "kofi"], maybe: ["rae"] },
      "au-brunch": { yes: ["kofi", "luz", "rae"], maybe: ["theo"] },
    }),
    flights: flights(ID, "2027-04-09", "2027-04-11", [
      { user: "rae", from: "DEN", to: "AUS", inCarrier: "Southwest", inNo: "WN 2210", inDep: "09:05", inArr: "12:20", outNo: "WN 2218", outDep: "16:30", outArr: "17:50", source: "calendar" },
      { user: "kofi", from: "ATL", to: "AUS", inCarrier: "Delta", inNo: "DL 2301", inDep: "10:10", inArr: "11:50", outNo: "DL 2310", outDep: "17:15", outArr: "20:30", source: "email" },
      { user: "mina", from: "SFO", to: "AUS", inCarrier: "United", inNo: "UA 1190", inDep: "07:00", inArr: "12:50", outNo: "UA 1198", outDep: "15:00", outArr: "17:10", source: "manual" },
      { user: "theo", from: "ORD", to: "AUS", inCarrier: "American", inNo: "AA 1870", inDep: "09:30", inArr: "12:15", outNo: "AA 1877", outDep: "16:00", outArr: "18:45", source: "calendar" },
      { user: "luz", from: "MIA", to: "AUS", inCarrier: "American", inNo: "AA 902", inDep: "11:00", inArr: "13:00", outNo: "AA 909", outDep: "14:30", outArr: "17:30", source: "email" },
    ]),
    recs: recs(ID, [
      { id: "au-r-honky", title: "Honky-tonk dance lesson", description: "Learn the two-step in an hour, then try it on a real dance floor.", category: "Nightlife", estimatedCostPerPerson: 20, suggestedDate: "2027-04-09", suggestedTime: "13:00", vibes: ["Nightlife", "Budget-friendly"], interests: ["Music", "Nightlife"], similarGroupsPercent: 68, daypart: "afternoon" },
      { id: "au-r-bats", title: "Congress Avenue bat watching", description: "Free, strange, and a better sunset than expected.", category: "Outdoors", estimatedCostPerPerson: 0, suggestedDate: "2027-04-10", suggestedTime: "19:30", vibes: ["Budget-friendly", "Adventure"], interests: ["Outdoors"], similarGroupsPercent: 59, daypart: "evening" },
      { id: "au-r-food-trucks", title: "Food truck lot crawl", description: "Four trucks, one picnic table, and no rules.", category: "Food", estimatedCostPerPerson: 24, suggestedDate: "2027-04-11", suggestedTime: "13:30", vibes: ["Foodie", "Budget-friendly"], interests: ["Food"], similarGroupsPercent: 80, daypart: "afternoon" },
      { id: "au-r-mural", title: "Street art and mural walk", description: "A guided loop through East Austin's best walls.", category: "Culture", estimatedCostPerPerson: 18, suggestedDate: "2027-04-11", suggestedTime: "09:30", vibes: ["Culture", "Budget-friendly"], interests: ["Art"], similarGroupsPercent: 53, daypart: "morning" },
      { id: "au-r-dive", title: "Dive bar live set", description: "A tiny stage, cheap beer, and a band you'll tell people about.", category: "Nightlife", estimatedCostPerPerson: 15, suggestedDate: "2027-04-09", suggestedTime: "22:30", vibes: ["Nightlife", "Budget-friendly"], interests: ["Music", "Nightlife"], similarGroupsPercent: 72, daypart: "evening" },
      { id: "au-r-bikes", title: "Hike-and-bike trail rental", description: "Cheap bikes along the lake trail before the heat hits.", category: "Outdoors", estimatedCostPerPerson: 22, suggestedDate: "2027-04-11", suggestedTime: "09:00", vibes: ["Adventure", "Outdoors", "Budget-friendly"], interests: ["Outdoors", "Sports"], similarGroupsPercent: 55, daypart: "morning" },
    ]),
    payments: { "au-stay:rae": "paid", "au-stay:kofi": "paid", "au-stay:mina": "unpaid", "au-stay:theo": "unpaid", "au-stay:luz": "unpaid", "au-passes:rae": "paid", "au-passes:kofi": "paid", "au-passes:luz": "paid", "au-bbq:rae": "paid" },
    feed: [
      { userId: "kofi", text: "suggested Sunday gospel brunch", hoursAgo: 3, activityId: "au-brunch" },
      { userId: "mina", text: "added Record store crawl to the ideas", hoursAgo: 9, activityId: "au-records" },
      { userId: "luz", text: "proposed Late-night club set", hoursAgo: 22, activityId: "au-late" },
      { userId: "rae", text: "confirmed BBQ lunch", hoursAgo: 52, activityId: "au-bbq" },
    ],
  });
}
