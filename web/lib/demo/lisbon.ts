import type { AppState } from "../types";
import { activities, assemble, flights, people, recs, responses } from "./builders";

const ID = "trip-lisbon";

export function createLisbonState(): AppState {
  return assemble({
    id: ID, slug: "lisbon-bachelorette-weekend", title: "Lisbon Bachelorette Weekend", destination: "Lisbon, Portugal",
    description: "One last fling in the sun, with pastries.", startDate: "2027-05-21", endDate: "2027-05-23",
    cover: "/covers/sunset-beach.svg", color: "#FFB4A2", vibes: ["Foodie", "Culture", "Nightlife", "Relaxed"], budget: 90, hostId: "zoe",
    users: people([
      { id: "zoe", name: "Zoe", avatar: "cherry", airport: "JFK", city: "New York", interests: ["Food", "Nightlife", "Music"], budget: "moderate" },
      { id: "ari", name: "Ari", avatar: "sofia", airport: "BOS", city: "Boston", interests: ["Art", "Food"], budget: "moderate" },
      { id: "bea", name: "Bea", avatar: "maya", airport: "MIA", city: "Miami", interests: ["Nightlife", "Shopping"], budget: "premium" },
      { id: "camila", name: "Camila", avatar: "eli", airport: "LAX", city: "Los Angeles", interests: ["Outdoors", "Food", "Wellness"], budget: "moderate" },
      { id: "dani", name: "Dani", avatar: "pebble", airport: "ATL", city: "Atlanta", interests: ["Music", "Art", "Nightlife"], budget: "budget" },
      { id: "esme", name: "Esme", avatar: "noah", airport: "SEA", city: "Seattle", interests: ["Outdoors", "Wellness", "Art"], budget: "budget" },
    ]),
    tripResponses: { esme: "maybe" },
    activities: activities(ID, [
      { id: "lx-hotel", title: "Boutique hotel check-in", category: "Stay", status: "confirmed", createdBy: "zoe", date: "2027-05-21", startTime: "15:00", address: "Rua da Misericordia, Lisbon", estimatedCostPerPerson: 160, description: "Three rooms in Chiado with a rooftop. Two to a room, so the cost is split evenly." },
      { id: "lx-fado", title: "Fado dinner in Alfama", category: "Food", status: "confirmed", createdBy: "zoe", date: "2027-05-21", startTime: "20:30", endTime: "23:00", address: "Rua de Sao Pedro, Alfama", estimatedCostPerPerson: 62, capacity: 8, reservationDeadline: "2027-05-07", description: "Live fado over grilled sardines. Book early, it fills up." },
      { id: "lx-tiles", title: "Tile painting workshop", category: "Culture", status: "proposed", createdBy: "ari", date: "2027-05-22", startTime: "11:00", endTime: "13:00", address: "Rua do Alecrim, Lisbon", estimatedCostPerPerson: 38, capacity: 6, reservationDeadline: "2027-05-10", description: "Paint your own azulejo and take it home as a souvenir." },
      { id: "lx-sintra", title: "Sintra day trip", category: "Outdoors", status: "proposed", createdBy: "camila", date: "2027-05-22", startTime: "09:00", endTime: "15:00", address: "Rossio Station, Lisbon", estimatedCostPerPerson: 75, capacity: 8, externalUrl: "https://example.com/sintra-day-trip", description: "Train to the palaces, with time for pastries in town." },
      { id: "lx-sail", title: "Sunset sailing on the Tagus", category: "Outdoors", status: "idea", createdBy: "bea", address: "Doca de Santo Amaro", estimatedCostPerPerson: 55, description: "Two hours on a sailboat with drinks and a very good view of the bridge." },
      { id: "lx-pasteis", title: "Pastel de nata crawl", category: "Food", status: "idea", createdBy: "dani", address: "Belem and Baixa", estimatedCostPerPerson: 20, description: "Four bakeries, one clear winner." },
      { id: "lx-beach", title: "Beach club afternoon", category: "Other", status: "proposed", createdBy: "bea", date: "2027-05-23", startTime: "12:00", endTime: "17:00", address: "Costa da Caparica", estimatedCostPerPerson: 48, description: "Sun loungers, cocktails, and zero plans." },
      { id: "lx-night", title: "Bairro Alto night out", category: "Nightlife", status: "proposed", createdBy: "zoe", date: "2027-05-22", startTime: "22:30", address: "Bairro Alto, Lisbon", estimatedCostPerPerson: 40, description: "Bar hopping through the narrow streets, ending somewhere with dancing." },
    ]),
    responses: responses({
      "lx-hotel": { yes: ["zoe", "ari", "bea", "camila", "dani"], maybe: ["esme"] },
      "lx-fado": { yes: ["zoe", "ari", "bea", "camila", "dani", "esme"] },
      "lx-tiles": { yes: ["ari", "dani", "esme", "zoe"], maybe: ["camila"], no: ["bea"] },
      "lx-sintra": { yes: ["camila", "esme", "ari"], maybe: ["zoe"], no: ["bea"] },
      "lx-sail": { yes: ["bea", "camila"], maybe: ["dani"] },
      "lx-pasteis": { yes: ["dani", "ari", "bea", "zoe", "camila", "esme"] },
      "lx-beach": { yes: ["bea"], maybe: ["camila", "dani"], no: ["esme"] },
      "lx-night": { yes: ["zoe", "bea", "dani"], maybe: ["ari"] },
    }),
    flights: flights(ID, "2027-05-21", "2027-05-23", [
      { user: "zoe", from: "JFK", to: "LIS", inCarrier: "TAP Air Portugal", inNo: "TP 202", inDep: "19:15", inArr: "11:30", outNo: "TP 203", outDep: "13:00", outArr: "16:20", source: "calendar" },
      { user: "ari", from: "BOS", to: "LIS", inCarrier: "TAP Air Portugal", inNo: "TP 236", inDep: "19:50", inArr: "11:50", outNo: "TP 237", outDep: "12:40", outArr: "15:30", source: "email" },
      { user: "bea", from: "MIA", to: "LIS", inCarrier: "TAP Air Portugal", inNo: "TP 206", inDep: "19:30", inArr: "10:50", outNo: "TP 207", outDep: "13:20", outArr: "17:00", source: "manual" },
      { user: "camila", from: "LAX", to: "LIS", inCarrier: "Delta", inNo: "DL 118", inDep: "14:00", inArr: "14:15", outNo: "DL 119", outDep: "15:45", outArr: "19:30", source: "email" },
    ]),
    recs: recs(ID, [
      { id: "lx-r-tram", title: "Vintage tram 28 and viewpoint hop", description: "Ride the yellow tram, then climb to three miradouros for sunset.", category: "Culture", estimatedCostPerPerson: 15, suggestedDate: "2027-05-22", suggestedTime: "17:00", vibes: ["Culture", "Relaxed"], interests: ["Art", "Outdoors"], similarGroupsPercent: 74, daypart: "evening" },
      { id: "lx-r-wine", title: "Portuguese wine tasting", description: "A guided flight of six wines and a cheese board in a cellar bar.", category: "Drinks", estimatedCostPerPerson: 45, suggestedDate: "2027-05-21", suggestedTime: "17:00", vibes: ["Foodie", "Luxury", "Relaxed"], interests: ["Food", "Nightlife"], similarGroupsPercent: 69, daypart: "evening" },
      { id: "lx-r-cooking", title: "Seafood cooking class", description: "Shop the market with a chef, then cook and eat what you bought.", category: "Food", estimatedCostPerPerson: 80, suggestedDate: "2027-05-23", suggestedTime: "10:00", vibes: ["Foodie", "Culture"], interests: ["Food", "Wellness"], similarGroupsPercent: 61, daypart: "morning" },
      { id: "lx-r-rooftop", title: "Rooftop sunset sessions", description: "DJ, spritzes, and the whole city turning gold.", category: "Nightlife", estimatedCostPerPerson: 35, suggestedDate: "2027-05-22", suggestedTime: "19:00", vibes: ["Nightlife", "Luxury"], interests: ["Music", "Nightlife"], similarGroupsPercent: 77, daypart: "evening" },
      { id: "lx-r-surf", title: "Surf lesson in Carcavelos", description: "Boards, wetsuits, and a very patient instructor.", category: "Outdoors", estimatedCostPerPerson: 55, suggestedDate: "2027-05-23", suggestedTime: "09:30", vibes: ["Adventure", "Outdoors"], interests: ["Outdoors", "Sports"], similarGroupsPercent: 44, daypart: "morning" },
      { id: "lx-r-museum", title: "Tile museum and garden lunch", description: "A calm morning among five centuries of azulejos.", category: "Culture", estimatedCostPerPerson: 22, suggestedDate: "2027-05-23", suggestedTime: "10:00", vibes: ["Culture", "Budget-friendly"], interests: ["Art"], similarGroupsPercent: 51, daypart: "morning" },
    ]),
    payments: { "lx-hotel:zoe": "paid", "lx-hotel:ari": "paid", "lx-hotel:bea": "unpaid", "lx-fado:zoe": "paid" },
    feed: [
      { userId: "zoe", text: "proposed Bairro Alto night out", hoursAgo: 4, activityId: "lx-night" },
      { userId: "dani", text: "added Pastel de nata crawl to the ideas", hoursAgo: 11, activityId: "lx-pasteis" },
      { userId: "camila", text: "proposed Sintra day trip", hoursAgo: 30, activityId: "lx-sintra" },
      { userId: "zoe", text: "confirmed Fado dinner in Alfama", hoursAgo: 70, activityId: "lx-fado" },
    ],
  });
}
