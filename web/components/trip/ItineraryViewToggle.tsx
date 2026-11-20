import Link from "next/link";
import { CalendarDays, List } from "lucide-react";
import { ROUTES } from "@/lib/constants";

/** Switches between the day-by-day list and the calendar. Both are the same plan, shown two ways. */
export function ItineraryViewToggle({ current }: { current: "list" | "calendar" }) {
  const item = (href: string, label: string, Icon: typeof List, on: boolean) => (
    <Link href={href} aria-current={on ? "page" : undefined} className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 font-bold ${on ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"}`}>
      <Icon className="size-4" aria-hidden />{label}
    </Link>
  );
  return (
    <nav aria-label="Itinerary view" className="inline-flex gap-1 rounded-full border border-line bg-white p-1 shadow-soft">
      {item(ROUTES.itinerary, "List", List, current === "list")}
      {item(ROUTES.calendar, "Calendar", CalendarDays, current === "calendar")}
    </nav>
  );
}
