"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Luggage, Plane, Sparkles, UserRound, Wallet } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { useAppState } from "@/lib/store";
import { costsOn } from "@/lib/selectors";
import { TripSwitcher } from "@/components/trip/TripSwitcher";
import { ResetDemoButton } from "@/components/trip/ResetDemoButton";

const links = [
  { href: ROUTES.costs, label: "Costs", body: "Your share and the group total", Icon: Wallet },
  { href: ROUTES.travel, label: "Travel", body: "Flights and who lands when", Icon: Plane },
  { href: ROUTES.recommendations, label: "For your group", body: "Suggestions picked for this trip", Icon: Sparkles },
  { href: ROUTES.profile, label: "Profile and preferences", body: "Your name, interests, and who you're viewing as", Icon: UserRound },
];

export default function More() {
  const [tripsOpen, setTripsOpen] = useState(false);
  const showCosts = costsOn(useAppState());
  return (
    <div className="space-y-6">
      <h1 className="text-5xl font-extrabold">More</h1>
      <ul className="space-y-3">
        <li>
          <button type="button" onClick={() => setTripsOpen(true)} className="flex w-full items-center gap-4 rounded-card border border-line bg-white p-4 text-left shadow-soft">
            <span className="grid size-12 place-items-center rounded-2xl border border-ink/15 bg-sun"><Luggage className="size-6" aria-hidden /></span>
            <span className="flex-1"><span className="block text-xl font-bold">Switch trip</span><span className="text-ink-soft">Open another demo trip or one you made</span></span>
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </li>
        {links.filter((l) => showCosts || l.href !== ROUTES.costs).map(({ href, label, body, Icon }) => (
          <li key={href}>
            <Link href={href} className="flex items-center gap-4 rounded-card border border-line bg-white p-4 shadow-soft">
              <span className="grid size-12 place-items-center rounded-2xl border border-ink/15 bg-brand-soft"><Icon className="size-6" aria-hidden /></span>
              <span className="flex-1"><span className="block text-xl font-bold">{label}</span><span className="text-ink-soft">{body}</span></span>
              <ChevronRight className="size-5" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
      <TripSwitcher open={tripsOpen} onClose={() => setTripsOpen(false)} />
      <div className="rounded-card border border-line bg-white p-4">
        <p className="mb-3 text-ink-soft">Changes are saved in this browser only. Reset to restore every demo trip and remove the ones you made.</p>
        <ResetDemoButton />
      </div>
    </div>
  );
}
