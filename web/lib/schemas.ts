import { z } from "zod";

export const tripBasicsSchema = z
  .object({
    title: z.string().trim().min(2, "Give your trip a name").max(60, "Keep the name under 60 characters"),
    destination: z.string().trim().min(2, "Where are you going?").max(60),
    startDate: z.string().min(1, "Pick a start date"),
    endDate: z.string().min(1, "Pick an end date"),
    description: z.string().trim().max(140, "Keep it under 140 characters"),
  })
  .refine((v) => !v.startDate || !v.endDate || v.endDate >= v.startDate, { path: ["endDate"], message: "The trip can't end before it starts" });

export const joinSchema = z.object({
  name: z.string().trim().min(1, "Add your name so friends know who joined").max(30, "Keep it under 30 characters"),
});

export const activitySchema = z
  .object({
    title: z.string().trim().min(2, "Name the activity").max(80),
    category: z.string().min(1),
    date: z.string().optional(),
    timeTbd: z.boolean(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    address: z.string().trim().max(120).optional(),
    cost: z.string().optional().refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 5000), "Enter a cost between $0 and $5,000"),
    link: z.string().trim().optional().refine((v) => !v || /^https?:\/\/\S+\.\S+/.test(v), "Links should start with http:// or https://"),
    deadline: z.string().optional(),
    capacity: z.string().optional().refine((v) => !v || (Number.isInteger(Number(v)) && Number(v) >= 1 && Number(v) <= 100), "Capacity should be a whole number"),
    notes: z.string().trim().max(400).optional(),
  })
  .refine((v) => v.timeTbd || !!v.date, { path: ["date"], message: "Pick a day, or choose Time TBD" })
  .refine((v) => v.timeTbd || !v.startTime || !v.endTime || v.endTime > v.startTime, { path: ["endTime"], message: "End time should be after the start" });

export const flightSchema = z.object({
  airline: z.string().trim().min(2, "Add the airline"),
  flightNumber: z.string().trim().min(2, "Add the flight number"),
  arrivalTime: z.string().min(1, "Add your arrival time"),
  departureTime: z.string().min(1, "Add your departure time"),
});

export type FieldErrors = Record<string, string>;
/** Turns a zod failure into { fieldName: message } for inline display. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
