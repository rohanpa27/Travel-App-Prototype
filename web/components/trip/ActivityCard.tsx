"use client";

import Link from "next/link";
import { AlertTriangle, CalendarClock, Clock, DollarSign, MessageCircleQuestion, PartyPopper, Users } from "lucide-react";
import type { Activity } from "@/lib/types";
import { ROUTES } from "@/lib/constants";
import { useAppState } from "@/lib/store";
import { conflictsFor, costsOn, responseOf, tally } from "@/lib/selectors";
import { money, timeLabel } from "@/lib/format";
import { AvatarStack } from "@/components/ui/Avatar";
import { CategoryIcon } from "./CategoryIcon";
import { StatusBadge } from "./StatusBadge";
import { RSVPControl } from "./RSVPControl";

export function ActivityCard({ activity }: { activity: Activity }) {
  const s = useAppState();
  const t = tally(s, activity);
  const mine = responseOf(s, activity.id, s.currentUserId);
  const time = activity.timeStatus === "tbd" ? "Time TBD" : `${timeLabel(activity.startTime)}${activity.endTime ? ` to ${timeLabel(activity.endTime)}` : ""}`;
  const href = `${ROUTES.activity}?id=${activity.id}`;
  const conflicts = conflictsFor(s, activity);

  return (
    <article className="rounded-card border border-line bg-white p-4 shadow-soft md:p-5">
      <div className="flex items-start gap-3">
        <CategoryIcon category={activity.category} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge value={activity.status} />
            {t.everyoneIn && (
              <span className="inline-flex items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-sm font-bold text-brand-soft">
                <PartyPopper className="size-3.5" aria-hidden />Everyone&apos;s in
              </span>
            )}
          </div>
          <h3 className="mt-1.5 text-2xl font-bold leading-tight">
            <Link href={href} className="hover:underline">{activity.title}</Link>
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-base text-ink-soft">
            <span className="inline-flex items-center gap-1">{activity.timeStatus === "tbd" ? <CalendarClock className="size-4" aria-hidden /> : <Clock className="size-4" aria-hidden />}{time}</span>
            {costsOn(s) && activity.estimatedCostPerPerson !== undefined && <span className="inline-flex items-center gap-0.5 font-semibold text-ink"><DollarSign className="size-4" aria-hidden />{money(activity.estimatedCostPerPerson).slice(1)} each</span>}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AvatarStack users={t.yes} max={4} label={`${t.yes.length} going`} />
          <span className="text-base font-semibold">{t.yes.length} going</span>
        </div>
        <p className="text-base text-ink-soft">
          {t.maybe.length} maybe · {t.no.length} no{t.pending.length > 0 && <> · {t.pending.length} waiting</>}
        </p>
      </div>

      {(t.full || t.nearFull || (activity.status !== "confirmed" && activity.status !== "cancelled")) && (
        <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold">
          <Users className="size-4" aria-hidden />
          {t.full ? <span className="text-[#8a1c0c]">Full: {t.yes.length} of {t.capacity} spots taken</span> : t.nearFull ? <span className="text-[#8a5a00]">Almost full: {t.yes.length} of {t.capacity} spots taken</span> : t.enoughInterest ? <span className="text-[#1e6b3a]">Enough interest to book</span> : <span className="text-ink-soft">Needs a few more yeses before booking</span>}
        </p>
      )}

      {conflicts.length > 0 && (
        <p className="mt-2 flex items-start gap-1.5 rounded-xl bg-sun-soft px-3 py-2 text-sm font-semibold">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>Overlaps with {conflicts.map((c) => c.title).join(" and ")}. You may need to choose.</span>
        </p>
      )}

      <div className="mt-4">
        <RSVPControl activity={activity} />
        {!mine && (
          <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-ink-soft">
            <MessageCircleQuestion className="size-4" aria-hidden />You haven&apos;t responded yet
          </p>
        )}
      </div>
    </article>
  );
}
