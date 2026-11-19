"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronsUpDown, Share2 } from "lucide-react";
import { useAppState } from "@/lib/store";
import { currentUser } from "@/lib/selectors";
import { useHydrated } from "@/lib/useHydrated";
import { ROUTES } from "@/lib/constants";
import { brand } from "@/lib/brand";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { InviteModal } from "@/components/trip/InviteModal";
import { TripSwitcher } from "@/components/trip/TripSwitcher";
import { BottomNavigation } from "./BottomNavigation";
import { SideNavigation } from "./SideNavigation";

/** Shared chrome for every /trip page: side nav on desktop, bottom nav on phones. */
export function TripShell({ children }: { children: React.ReactNode }) {
  const s = useAppState();
  const me = currentUser(s);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [tripsOpen, setTripsOpen] = useState(false);
  const hydrated = useHydrated();

  // Wait for saved data so a returning visitor never sees the starter trip flash first.
  if (!hydrated) return <div className="min-h-dvh" aria-busy="true" aria-label="Loading your trip" />;

  return (
    <div className="mx-auto flex min-h-dvh max-w-[1200px]">
      <SideNavigation />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-paper/90 px-4 py-3 backdrop-blur md:px-8">
          <Link href={ROUTES.home} className="hidden font-display text-xl font-extrabold sm:block md:hidden">{brand.name}</Link>
          <button type="button" onClick={() => setTripsOpen(true)} aria-label={`Switch trip. Open now: ${s.trip.title}`} className="flex min-h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full px-3 text-base font-bold hover:bg-paper-deep md:flex-none md:justify-start">
            <span className="truncate">{s.trip.title}</span>
            <ChevronsUpDown className="size-4 shrink-0 text-ink-soft" aria-hidden />
          </button>
          <span className="hidden flex-1 md:block" />
          <div className="flex items-center gap-2">
            <Button size="sm" variant="dark" onClick={() => setInviteOpen(true)}><Share2 className="size-4" aria-hidden />Share</Button>
            <Link href={ROUTES.profile} aria-label={`Profile and preferences for ${me.name}`} className="rounded-full"><Avatar user={me} size="sm" /></Link>
          </div>
        </header>
        <main id="main" className="px-4 pb-32 pt-2 md:px-8 md:pb-16">{children}</main>
      </div>
      <BottomNavigation />
      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
      <TripSwitcher open={tripsOpen} onClose={() => setTripsOpen(false)} />
    </div>
  );
}
