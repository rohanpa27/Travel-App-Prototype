"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, CalendarDays, Users, Wallet, Plane, Sparkles, Plus, Settings } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { brand } from "@/lib/brand";
import { ButtonLink } from "@/components/ui/Button";

const items = [
  { href: ROUTES.trip, label: "Overview", Icon: LayoutGrid },
  { href: ROUTES.itinerary, label: "Itinerary", Icon: CalendarDays },
  { href: ROUTES.guests, label: "Guests", Icon: Users },
  { href: ROUTES.costs, label: "Costs", Icon: Wallet },
  { href: ROUTES.travel, label: "Travel", Icon: Plane },
  { href: ROUTES.recommendations, label: "For your group", Icon: Sparkles },
  { href: ROUTES.profile, label: "Profile", Icon: Settings },
];

export function SideNavigation() {
  const path = usePathname().replace(/\/$/, "") || "/";
  return (
    <aside aria-label="Trip menu" className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line px-5 py-6 md:flex">
      <Link href={ROUTES.home} className="font-display text-3xl font-extrabold tracking-tight">{brand.name}</Link>
      <nav aria-label="Main" className="mt-8 flex-1">
        <ul className="space-y-1">
          {items.map(({ href, label, Icon }) => {
            const active = path === href;
            return (
              <li key={href}>
                <Link href={href} aria-current={active ? "page" : undefined} className={`flex min-h-11 items-center gap-3 rounded-2xl px-3 text-base font-bold ${active ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-deep hover:text-ink"}`}>
                  <Icon className="size-5" aria-hidden />{label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <ButtonLink href={ROUTES.activityEdit}><Plus className="size-5" aria-hidden />Add activity</ButtonLink>
    </aside>
  );
}
