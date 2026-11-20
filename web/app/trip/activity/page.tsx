"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, CalendarDays, CalendarPlus, Check, ExternalLink, Link2, MapPin, Pencil, Undo2, Users, Wallet, XCircle } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { dispatch, useAppState } from "@/lib/store";
import { canEditActivity, conflictsFor, costsOn, getUser, isHost, paymentState, responseOf, tally } from "@/lib/selectors";
import { dayLabel, money, slugify, timeLabel } from "@/lib/format";
import { toast } from "@/lib/toast";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { CategoryIcon } from "@/components/trip/CategoryIcon";
import { MapPlaceholder } from "@/components/trip/MapPlaceholder";
import { RSVPControl } from "@/components/trip/RSVPControl";
import { PaymentBadge, StatusBadge } from "@/components/trip/StatusBadge";
import { EmptyState } from "@/components/trip/EmptyState";
import type { RsvpResponse } from "@/lib/types";
import { asset } from "@/lib/paths";
import { buildIcs, downloadTextFile } from "@/lib/calendar";

/** One labelled fact. Keeps dt/dd directly inside a div so the description list stays valid. */
function Fact({ Icon, label, children }: { Icon: typeof CalendarDays; label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="flex items-center gap-2 text-sm text-ink-soft"><Icon className="size-4 shrink-0" aria-hidden />{label}</dt>
      <dd className="mt-0.5 font-bold">{children}</dd>
    </div>
  );
}

function Detail() {
  const id = useSearchParams().get("id");
  const s = useAppState();
  const a = s.activities.find((x) => x.id === id);

  if (!a) return <EmptyState title="We can't find that activity" body="It may have been removed when the demo was reset." action={<ButtonLink href={ROUTES.itinerary}>Back to itinerary</ButtonLink>} />;

  const t = tally(s, a);
  const creator = getUser(s, a.createdBy);
  const host = isHost(s);
  const groups: { key: RsvpResponse | "pending"; label: string; users: typeof t.yes }[] = [
    { key: "yes", label: "Going", users: t.yes },
    { key: "maybe", label: "Maybe", users: t.maybe },
    { key: "no", label: "Can't make it", users: t.no },
    { key: "pending", label: "Hasn't responded", users: t.pending },
  ];
  const myPay = paymentState(s, a, s.currentUserId);
  const myResponse = responseOf(s, a.id, s.currentUserId);

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <Link href={ROUTES.itinerary} className="inline-flex min-h-10 items-center gap-1 font-bold"><ArrowLeft className="size-4" aria-hidden />Itinerary</Link>
      <header className="flex items-start gap-4">
        <CategoryIcon category={a.category} size="lg" />
        <div>
          <StatusBadge value={a.status} />
          <h1 className="mt-2 text-4xl font-extrabold md:text-5xl">{a.title}</h1>
          {creator && <p className="mt-2 flex items-center gap-2 text-ink-soft"><Avatar user={creator} size="xs" />Suggested by {creator.name}</p>}
        </div>
      </header>

      {a.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={asset(a.imageUrl)} alt="" className="h-48 w-full rounded-card border border-ink/15 object-cover" />
      )}

      <dl className="grid gap-4 rounded-card border border-line bg-white p-5 shadow-soft sm:grid-cols-2">
        <Fact Icon={CalendarDays} label="When">{a.date ? dayLabel(a.date) : "No day yet"}, {a.timeStatus === "tbd" ? "time TBD" : `${timeLabel(a.startTime)}${a.endTime ? ` to ${timeLabel(a.endTime)}` : ""}`}</Fact>
        {costsOn(s) && <Fact Icon={Wallet} label="Cost per person">{a.estimatedCostPerPerson !== undefined ? money(a.estimatedCostPerPerson) : "Not set"}</Fact>}
        {a.address && <Fact Icon={MapPin} label="Where">{a.address}</Fact>}
        {a.capacity && <Fact Icon={Users} label="Capacity">{t.yes.length} of {a.capacity} spots taken</Fact>}
        {a.reservationDeadline && <Fact Icon={CalendarDays} label="Book by">{dayLabel(a.reservationDeadline)}</Fact>}
        {a.externalUrl && <Fact Icon={Link2} label="Link"><a href={a.externalUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline">Open link <ExternalLink className="size-3.5" aria-hidden /></a></Fact>}
      </dl>

      {conflictsFor(s, a).length > 0 && (
        <p className="flex items-start gap-2 rounded-2xl bg-sun-soft p-4 font-semibold"><AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />This overlaps with {conflictsFor(s, a).map((c) => c.title).join(" and ")}. Friends may need to choose one.</p>
      )}
      {a.description && <p className="text-lg">{a.description}</p>}
      <MapPlaceholder address={a.address} />

      <section aria-labelledby="your-answer" className="rounded-card border border-ink/15 bg-sun-soft p-5">
        <h2 id="your-answer" className="mb-3 text-2xl font-bold">{myResponse ? "Your answer" : "Are you in?"}</h2>
        <RSVPControl activity={a} />
        {a.status !== "confirmed" && a.status !== "cancelled" && (
          <p className="mt-3 text-sm font-semibold">{t.full ? "This one is full." : t.enoughInterest ? "Enough people are in to book it." : "It needs a few more yeses before booking."}</p>
        )}
      </section>

      {costsOn(s) && a.status === "confirmed" && a.estimatedCostPerPerson ? (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-white p-4">
          <div className="flex items-center gap-2"><span className="font-bold">Your share</span><PaymentBadge value={myPay} /></div>
          <Button size="sm" variant="soft" onClick={() => { dispatch({ type: "setPayment", activityId: a.id, userId: s.currentUserId, state: myPay === "paid" ? "unpaid" : "paid" }); toast(myPay === "paid" ? "Marked as not paid" : "Marked as paid"); }}>{myPay === "paid" ? "Mark as not paid" : "Mark as paid"}</Button>
          <p className="w-full text-sm text-ink-soft">Visual only. No money moves in this prototype.</p>
        </section>
      ) : null}

      <section aria-labelledby="who" className="space-y-3">
        <h2 id="who" className="text-3xl font-extrabold">Who&apos;s in</h2>
        {groups.map((g) => g.users.length > 0 && (
          <div key={g.key} className="rounded-2xl bg-white p-4 shadow-soft">
            <p className="mb-2 font-bold">{g.label} ({g.users.length})</p>
            <ul className="flex flex-wrap gap-3">{g.users.map((u) => <li key={u.id} className="flex items-center gap-2"><Avatar user={u} size="sm" decorative /><span>{u.name}</span></li>)}</ul>
          </div>
        ))}
      </section>

      <section aria-label="Organizer actions" className="flex flex-wrap gap-2 border-t border-line pt-5">
        {a.date && a.status !== "cancelled" && <Button size="sm" variant="soft" onClick={() => { downloadTextFile(`${slugify(a.title) || "plan"}.ics`, buildIcs(s, { only: [a.id] })); toast(`${a.title} saved for your calendar app`); }}><CalendarPlus className="size-4" aria-hidden />Add to my calendar</Button>}
        {canEditActivity(s, a) && <ButtonLink href={`${ROUTES.activityEdit}?id=${a.id}`} variant="soft" size="sm"><Pencil className="size-4" aria-hidden />Edit</ButtonLink>}
        {host && a.status !== "confirmed" && a.status !== "cancelled" && <Button size="sm" onClick={() => { dispatch({ type: "setStatus", id: a.id, status: "confirmed" }); toast(`${a.title} confirmed`); }}><Check className="size-4" aria-hidden />Confirm for the group</Button>}
        {host && a.status === "confirmed" && <Button size="sm" variant="soft" onClick={() => { dispatch({ type: "setStatus", id: a.id, status: "proposed" }); toast("Moved back to proposed"); }}><Undo2 className="size-4" aria-hidden />Unconfirm</Button>}
        {host && a.status !== "cancelled" && <Button size="sm" variant="danger" onClick={() => { dispatch({ type: "setStatus", id: a.id, status: "cancelled" }); toast(`${a.title} cancelled`); }}><XCircle className="size-4" aria-hidden />Cancel activity</Button>}
        {!host && <p className="self-center text-sm text-ink-soft">Only the organizer can confirm or cancel. Switch to Maya in Profile to try it.</p>}
      </section>
    </article>
  );
}

export default function ActivityPage() {
  return <Suspense fallback={null}><Detail /></Suspense>;
}
