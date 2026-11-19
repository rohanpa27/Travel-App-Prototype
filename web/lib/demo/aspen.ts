import type { AppState } from "../types";
import { activities, assemble, flights, people, recs, responses } from "./builders";

const ID = "trip-aspen";

export function createAspenState(): AppState {
  return assemble({
    id: ID, slug: "aspen-ski-weekend", title: "Aspen Ski Weekend", destination: "Aspen, CO",
    description: "Fresh powder by day, hot tubs by night.", startDate: "2027-02-05", endDate: "2027-02-07",
    cover: "/covers/alpine-weekend.svg", color: "#B8E0F6", vibes: ["Adventure", "Outdoors", "Luxury"], budget: 150, hostId: "dev",
    users: people([
      { id: "dev", name: "Dev", avatar: "jordan", airport: "DEN", city: "Denver", interests: ["Outdoors", "Sports", "Food"], budget: "premium" },
      { id: "lena", name: "Lena", avatar: "priya", airport: "SEA", city: "Seattle", interests: ["Outdoors", "Wellness"], budget: "moderate" },
      { id: "marcus", name: "Marcus", avatar: "plum", airport: "ATL", city: "Atlanta", interests: ["Sports", "Nightlife", "Food"], budget: "premium" },
      { id: "tess", name: "Tess", avatar: "sunny", airport: "BOS", city: "Boston", interests: ["Wellness", "Art"], budget: "budget" },
      { id: "owen", name: "Owen", avatar: "cherry", airport: "SFO", city: "San Francisco", interests: ["Outdoors", "Sports", "Music"], budget: "moderate" },
    ]),
    tripResponses: { tess: "maybe" },
    activities: activities(ID, [
      { id: "ap-cabin", title: "Cabin check-in", category: "Stay", status: "confirmed", createdBy: "dev", date: "2027-02-05", startTime: "16:00", address: "Red Mountain Rd, Aspen", estimatedCostPerPerson: 210, capacity: 5, description: "Slope-side cabin with a hot tub and a very large fireplace. Five beds, no couch heroics required." },
      { id: "ap-lifts", title: "Afternoon lift tickets", category: "Outdoors", status: "confirmed", createdBy: "dev", date: "2027-02-06", startTime: "12:00", endTime: "16:00", address: "Aspen Mountain gondola", estimatedCostPerPerson: 140, description: "Four-hour passes. Meet at the gondola at noon, after the lesson group is done." },
      { id: "ap-lesson", title: "Beginner ski lesson", category: "Outdoors", status: "proposed", createdBy: "tess", date: "2027-02-06", startTime: "09:30", endTime: "11:30", address: "Buttermilk base village", estimatedCostPerPerson: 95, capacity: 3, reservationDeadline: "2027-01-22", description: "Two hours with an instructor so nobody has to learn by sliding into a tree. Only three spots in this group." },
      { id: "ap-apres", title: "Après at the gondola bar", category: "Drinks", status: "proposed", createdBy: "marcus", date: "2027-02-06", startTime: "16:30", address: "Top of the Little Nell", estimatedCostPerPerson: 45, description: "Hot toddies, a heated patio, and ski boots optional." },
      { id: "ap-fondue", title: "Fondue dinner", category: "Food", status: "confirmed", createdBy: "dev", date: "2027-02-06", startTime: "19:30", endTime: "21:30", address: "Hyman Ave, Aspen", estimatedCostPerPerson: 70, capacity: 8, reservationDeadline: "2027-01-30", description: "A corner table for five and enough cheese to regret nothing." },
      { id: "ap-snowshoe", title: "Snowshoe through the aspens", category: "Outdoors", status: "idea", createdBy: "lena", address: "Hunter Creek Trail", estimatedCostPerPerson: 30, description: "A quiet two-hour loop if legs still work on Sunday." },
      { id: "ap-movie", title: "Hot tub and movie night", category: "Other", status: "idea", createdBy: "owen", address: "Back at the cabin", estimatedCostPerPerson: 0, description: "Free, warm, and a good plan if the weather turns." },
      { id: "ap-pancakes", title: "Sunday pancakes", category: "Food", status: "proposed", createdBy: "marcus", date: "2027-02-07", address: "Main Street, Aspen", estimatedCostPerPerson: 18, description: "Diner stack before everyone hits the road." },
    ]),
    responses: responses({
      "ap-cabin": { yes: ["dev", "lena", "marcus", "tess", "owen"] },
      "ap-lifts": { yes: ["dev", "lena", "marcus", "owen"], maybe: ["tess"] },
      "ap-lesson": { yes: ["tess", "lena"], no: ["marcus", "owen"] },
      "ap-apres": { yes: ["marcus", "owen", "lena"], maybe: ["tess"] },
      "ap-fondue": { yes: ["dev", "lena", "marcus", "tess", "owen"] },
      "ap-snowshoe": { yes: ["lena", "tess"], maybe: ["owen"] },
      "ap-movie": { yes: ["owen", "tess", "dev"], maybe: ["marcus"] },
      "ap-pancakes": { yes: ["marcus"], maybe: ["lena"] },
    }),
    flights: flights(ID, "2027-02-05", "2027-02-07", [
      { user: "dev", from: "DEN", to: "ASE", inCarrier: "United", inNo: "UA 5521", inDep: "10:05", inArr: "11:00", outNo: "UA 5530", outDep: "15:30", outArr: "16:25", source: "calendar" },
      { user: "lena", from: "SEA", to: "ASE", inCarrier: "Alaska", inNo: "AS 1102", inDep: "08:20", inArr: "12:10", outNo: "AS 1109", outDep: "16:40", outArr: "18:30", source: "email" },
      { user: "marcus", from: "ATL", to: "ASE", inCarrier: "Delta", inNo: "DL 1873", inDep: "09:00", inArr: "11:25", outNo: "DL 1880", outDep: "14:10", outArr: "18:35", source: "manual" },
      { user: "owen", from: "SFO", to: "ASE", inCarrier: "United", inNo: "UA 2204", inDep: "09:45", inArr: "13:05", outNo: "UA 2211", outDep: "17:00", outArr: "18:50", source: "calendar" },
    ]),
    recs: recs(ID, [
      { id: "ap-r-sleigh", title: "Sleigh ride and fondue under the stars", description: "Horse-drawn sleighs to a mountain hut, with dinner at the end.", category: "Outdoors", estimatedCostPerPerson: 120, suggestedDate: "2027-02-05", suggestedTime: "18:00", vibes: ["Luxury", "Outdoors"], interests: ["Outdoors", "Food"], similarGroupsPercent: 63, daypart: "evening" },
      { id: "ap-r-snowmobile", title: "Guided snowmobile tour", description: "Two hours on groomed trails with a guide and a thermos of cocoa.", category: "Outdoors", estimatedCostPerPerson: 140, suggestedDate: "2027-02-07", suggestedTime: "10:00", vibes: ["Adventure", "Outdoors"], interests: ["Sports", "Outdoors"], similarGroupsPercent: 71, daypart: "morning" },
      { id: "ap-r-spa", title: "Mineral spa soak", description: "Steam, soak, and a very quiet room to recover from first chair.", category: "Other", estimatedCostPerPerson: 85, suggestedDate: "2027-02-06", suggestedTime: "17:30", vibes: ["Luxury", "Relaxed"], interests: ["Wellness"], similarGroupsPercent: 58, daypart: "evening" },
      { id: "ap-r-cat", title: "Cat-skiing half day", description: "Snowcat access to untouched runs, with a guide who knows the good stuff.", category: "Outdoors", estimatedCostPerPerson: 190, suggestedDate: "2027-02-07", suggestedTime: "09:00", vibes: ["Adventure", "Luxury"], interests: ["Sports", "Outdoors"], similarGroupsPercent: 52, daypart: "morning" },
      { id: "ap-r-live", title: "Live music at the lodge", description: "Local bluegrass, a long bar, and a fire pit.", category: "Nightlife", estimatedCostPerPerson: 25, suggestedDate: "2027-02-05", suggestedTime: "21:30", vibes: ["Nightlife", "Relaxed"], interests: ["Music", "Nightlife"], similarGroupsPercent: 66, daypart: "evening" },
      { id: "ap-r-gallery", title: "Gallery walk and hot chocolate", description: "Low-effort, high-warmth afternoon in the galleries downtown.", category: "Culture", estimatedCostPerPerson: 12, suggestedDate: "2027-02-07", suggestedTime: "13:00", vibes: ["Culture", "Relaxed", "Budget-friendly"], interests: ["Art"], similarGroupsPercent: 47, daypart: "afternoon" },
    ]),
    payments: { "ap-cabin:dev": "paid", "ap-cabin:lena": "paid", "ap-cabin:marcus": "paid", "ap-cabin:tess": "unpaid", "ap-cabin:owen": "unpaid", "ap-lifts:dev": "paid" },
    feed: [
      { userId: "marcus", text: "suggested Sunday pancakes", hoursAgo: 5, activityId: "ap-pancakes" },
      { userId: "owen", text: "added Hot tub and movie night to the ideas", hoursAgo: 14, activityId: "ap-movie" },
      { userId: "tess", text: "proposed Beginner ski lesson", hoursAgo: 26, activityId: "ap-lesson" },
      { userId: "dev", text: "confirmed Fondue dinner", hoursAgo: 60, activityId: "ap-fondue" },
    ],
  });
}
