"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, Plus, Users, Menu } from "lucide-react";
import { ROUTES } from "@/lib/constants";

const items = [
  { href: ROUTES.trip, label: "Home", Icon: Home },
  { href: ROUTES.itinerary, label: "Itinerary", Icon: CalendarDays },
  { href: ROUTES.activityEdit, label: "Add", Icon: Plus, primary: true },
  { href: ROUTES.guests, label: "Guests", Icon: Users },
  { href: ROUTES.more, label: "More", Icon: Menu },
];
const MORE_ROUTES: string[] = [ROUTES.more, ROUTES.costs, ROUTES.travel, ROUTES.recommendations, ROUTES.profile];

export function BottomNavigation() {
  const path = usePathname().replace(/\/$/, "") || "/";
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="mx-auto flex max-w-lg items-end justify-around px-2 pt-1.5">
        {items.map(({ href, label, Icon, primary }) => {
          const active = href === ROUTES.more ? MORE_ROUTES.includes(path) : href === ROUTES.itinerary ? path === ROUTES.itinerary || path === ROUTES.calendar : path === href;
          return (
            <li key={href}>
              <Link href={href} aria-current={active ? "page" : undefined} className={`flex min-w-16 flex-col items-center gap-0.5 rounded-2xl px-2 py-1.5 text-xs font-bold ${active ? "text-ink" : "text-ink-soft"}`}>
                {primary ? (
                  <span className="-mt-6 grid size-14 place-items-center rounded-full bg-brand shadow-pop">
                    <Icon className="size-7 text-white" aria-hidden />
                  </span>
                ) : (
                  <span className={`grid h-8 w-12 place-items-center rounded-full ${active ? "bg-ink text-paper" : ""}`}>
                    <Icon className="size-5" aria-hidden />
                  </span>
                )}
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
