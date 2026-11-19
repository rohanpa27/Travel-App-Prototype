"use client";

import Link from "next/link";
import { ArrowRight, Plus, Sparkles } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { useAppState } from "@/lib/store";
import { activeActivities, currentUser, getUser, members, pendingFor, sortActivities } from "@/lib/selectors";
import { scoreRecommendations } from "@/lib/recommendations";
import { ago, dayLabel, timeLabel } from "@/lib/format";
import { useNow } from "@/lib/useNow";
import { ButtonLink } from "@/components/ui/Button";
import { Avatar, AvatarStack } from "@/components/ui/Avatar";
import { TripCover } from "@/components/trip/TripCover";
import { Countdown } from "@/components/trip/Countdown";
import { ActivityCard } from "@/components/trip/ActivityCard";
import { CostSummary } from "@/components/trip/CostSummary";
import { RecommendationCard } from "@/components/trip/RecommendationCard";
import { EmptyState } from "@/components/trip/EmptyState";

export default function TripHome() {
  const s = useAppState();
  const me = currentUser(s);
  const now = useNow();
  const people = members(s);
  const pending = pendingFor(s);
  const upcoming = sortActivities(activeActivities(s).filter((a) => a.date && a.status !== "idea")).sort((a, b) => `${a.date}${a.startTime ?? ""}`.localeCompare(`${b.date}${b.startTime ?? ""}`) )[0];
  const recs = scoreRecommendations(s).slice(0, 2);

  return (
    <div className="space-y-8">
      <TripCover trip={s.trip} compact>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <AvatarStack users={people} max={6} size="md" />
          <Countdown startDate={s.trip.startDate} endDate={s.trip.endDate} />
        </div>
      </TripCover>

      <h1 className="text-4xl font-extrabold md:text-5xl">Hey {me.name}, here&apos;s the plan so far.</h1>

      {people.length === 1 && (
        <div className="flex flex-col items-start gap-3 rounded-card border-2 border-ink bg-sky/50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lg font-bold">Your trip is ready. Invite your friends to start voting.</p>
          <ButtonLink href={ROUTES.invite} variant="dark" size="sm">Preview the invitation</ButtonLink>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-8">
          <section aria-labelledby="needs-you" className="space-y-3">
            <h2 id="needs-you" className="text-3xl font-extrabold">Needs your answer {pending.length > 0 && <span className="ml-1 rounded-full bg-coral px-2.5 py-0.5 align-middle text-lg text-white">{pending.length}</span>}</h2>
            {pending.length === 0 ? (
              <EmptyState icon={<Sparkles className="size-6" aria-hidden />} title="You're all caught up" body="Nothing is waiting on you. Propose something new for the group." action={<ButtonLink href={ROUTES.activityEdit} size="sm"><Plus className="size-4" aria-hidden />Propose an activity</ButtonLink>} />
            ) : (
              pending.slice(0, 3).map((a) => <ActivityCard key={a.id} activity={a} />)
            )}
            {pending.length > 3 && <Link href={ROUTES.itinerary} className="inline-flex items-center gap-1 font-bold underline">See all {pending.length} in the itinerary <ArrowRight className="size-4" aria-hidden /></Link>}
          </section>

          {upcoming && (
            <section aria-labelledby="up-next" className="space-y-3">
              <h2 id="up-next" className="text-3xl font-extrabold">Up next</h2>
              <p className="text-ink-soft">{dayLabel(upcoming.date!)}{upcoming.startTime && ` at ${timeLabel(upcoming.startTime)}`}</p>
              {pending.some((p) => p.id === upcoming.id) ? <p className="rounded-card bg-white p-4 text-ink-soft shadow-soft">{upcoming.title} is waiting on your answer above.</p> : <ActivityCard activity={upcoming} />}
            </section>
          )}
        </div>

        <div className="space-y-8">
          <div className="space-y-3">
            <CostSummary compact />
            <Link href={ROUTES.costs} className="inline-flex items-center gap-1 font-bold underline">See the cost breakdown <ArrowRight className="size-4" aria-hidden /></Link>
          </div>

          <section aria-labelledby="recent" className="space-y-3">
            <h2 id="recent" className="text-3xl font-extrabold">Recent activity</h2>
            <ul className="space-y-3 rounded-card border border-line bg-white p-4 shadow-soft">
              {s.feed.slice(0, 6).map((f) => {
                const u = getUser(s, f.userId);
                return (
                  <li key={f.id} className="flex items-start gap-3">
                    {u && <Avatar user={u} size="sm" decorative />}
                    <p className="text-base"><span className="font-bold">{u?.name}</span> {f.text}{now && <span className="block text-sm text-ink-soft">{ago(f.at)}</span>}</p>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>

      <section aria-labelledby="for-you" className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <h2 id="for-you" className="text-3xl font-extrabold">For your group</h2>
          <Link href={ROUTES.recommendations} className="inline-flex items-center gap-1 font-bold underline">See all <ArrowRight className="size-4" aria-hidden /></Link>
        </div>
        {recs.length === 0 ? <EmptyState title="No suggestions right now" body="You've handled every suggestion. Check back after the plan changes." /> : <div className="grid gap-4 md:grid-cols-2">{recs.map((r) => <RecommendationCard key={r.rec.id} item={r} />)}</div>}
      </section>
    </div>
  );
}
