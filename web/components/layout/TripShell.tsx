"use client";

import { useState } from "react";
import Link from "next/link";
import { Share2 } from "lucide-react";
import { useAppState } from "@/lib/store";
import { currentUser } from "@/lib/selectors";
import { ROUTES } from "@/lib/constants";
import { brand } from "@/lib/brand";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { InviteModal } from "@/components/trip/InviteModal";
import { BottomNavigation } from "./BottomNavigation";
import { SideNavigation } from "./SideNavigation";

/** Shared chrome for every /trip page: side nav on desktop, bottom nav on phones. */
export function TripShell({ children }: { children: React.ReactNode }) {
  const s = useAppState();
  const me = currentUser(s);
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <div className="mx-auto flex min-h-dvh max-w-[1200px]">
      <SideNavigation />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-paper/90 px-4 py-3 backdrop-blur md:px-8">
          <Link href={ROUTES.home} className="font-display text-xl font-extrabold md:hidden">{brand.name}</Link>
          <p className="hidden truncate text-base font-bold md:block">{s.trip.title}</p>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="dark" onClick={() => setInviteOpen(true)}><Share2 className="size-4" aria-hidden />Share</Button>
            <Link href={ROUTES.profile} aria-label={`Profile and preferences for ${me.name}`} className="rounded-full"><Avatar user={me} size="sm" /></Link>
          </div>
        </header>
        <main id="main" className="px-4 pb-32 pt-2 md:px-8 md:pb-16">{children}</main>
      </div>
      <BottomNavigation />
      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
