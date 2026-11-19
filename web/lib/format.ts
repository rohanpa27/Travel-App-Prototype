import { format, formatDistanceToNowStrict, parseISO } from "date-fns";

export const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
export const dayLabel = (iso: string) => format(parseISO(iso), "EEE, MMM d");
export const dayShort = (iso: string) => format(parseISO(iso), "EEE d");

export function timeLabel(hhmm?: string) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  return format(new Date(2000, 0, 1, h, m), "h:mm a");
}

export function dateRange(startIso: string, endIso: string) {
  const s = parseISO(startIso);
  const e = parseISO(endIso);
  return s.getMonth() === e.getMonth() ? `${format(s, "MMM d")}–${format(e, "d, yyyy")}` : `${format(s, "MMM d")} – ${format(e, "MMM d, yyyy")}`;
}

export const flightTime = (iso: string) => format(parseISO(iso), "h:mm a");
export const flightDay = (iso: string) => format(parseISO(iso), "EEE MMM d");
export const ago = (iso: string) => `${formatDistanceToNowStrict(parseISO(iso))} ago`;
export const listNames = (names: string[]) => (names.length <= 2 ? names.join(" and ") : `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`);
export const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
