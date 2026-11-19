"use client";

import Link from "next/link";
import { ChevronRight, Plane, Sparkles, UserRound, Wallet } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { ResetDemoButton } from "@/components/trip/ResetDemoButton";

const links = [
  { href: ROUTES.costs, label: "Costs", body: "Your share and the group total", Icon: Wallet },
  { href: ROUTES.travel, label: "Travel", body: "Flights and who lands when", Icon: Plane },
  { href: ROUTES.recommendations, label: "For your group", body: "Suggestions picked for this trip", Icon: Sparkles },
  { href: ROUTES.profile, label: "Profile and preferences", body: "Your name, interests, and who you're viewing as", Icon: UserRound },
];

export default function More() {
  return (
    <div className="space-y-6">
      <h1 className="text-5xl font-extrabold">More</h1>
      <ul className="space-y-3">
        {links.map(({ href, label, body, Icon }) => (
          <li key={href}>
            <Link href={href} className="flex items-center gap-4 rounded-card border border-line bg-white p-4 shadow-soft">
              <span className="grid size-12 place-items-center rounded-2xl border-2 border-ink bg-lime"><Icon className="size-6" aria-hidden /></span>
              <span className="flex-1"><span className="block text-xl font-bold">{label}</span><span className="text-ink-soft">{body}</span></span>
              <ChevronRight className="size-5" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
      <div className="rounded-card border border-line bg-white p-4">
        <p className="mb-3 text-ink-soft">Changes are saved in this browser only. Reset to start the demo over.</p>
        <ResetDemoButton />
      </div>
    </div>
  );
}
