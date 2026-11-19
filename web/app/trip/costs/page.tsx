"use client";

import Link from "next/link";
import { useAppState, dispatch } from "@/lib/store";
import { costLines, currentUser, paymentState } from "@/lib/selectors";
import { money } from "@/lib/format";
import { ROUTES } from "@/lib/constants";
import { toast } from "@/lib/toast";
import { CostSummary } from "@/components/trip/CostSummary";
import { PaymentBadge, StatusBadge } from "@/components/trip/StatusBadge";
import { CategoryIcon } from "@/components/trip/CategoryIcon";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/trip/EmptyState";

export default function Costs() {
  const s = useAppState();
  const me = currentUser(s);
  const lines = costLines(s);
  const confirmed = lines.filter((l) => l.confirmed);
  const tentative = lines.filter((l) => !l.confirmed);

  const renderSection = (title: string, note: string, items: typeof lines) => (
    <section className="space-y-3" aria-label={title}>
      <div><h2 className="text-3xl font-extrabold">{title}</h2><p className="text-ink-soft">{note}</p></div>
      {items.length === 0 ? <p className="rounded-card border-2 border-dashed border-line p-5 text-center text-ink-soft">Nothing here yet.</p> : (
        <ul className="space-y-3">
          {items.map((l) => {
            const pay = paymentState(s, l.activity, me.id);
            return (
              <li key={l.activity.id} className="rounded-card border border-line bg-white p-4 shadow-soft">
                <div className="flex items-start gap-3">
                  <CategoryIcon category={l.activity.category} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xl font-bold leading-tight"><Link href={`${ROUTES.activity}?id=${l.activity.id}`} className="hover:underline">{l.activity.title}</Link></p>
                    <p className="text-ink-soft">{money(l.perPerson)} each · {l.yesCount} going · {money(l.groupTotal)} for the group</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusBadge value={l.activity.status} />
                      {l.mine === "yes" ? <span className="font-bold">You owe {money(l.perPerson)}</span> : l.mine === "maybe" ? <span className="font-semibold text-ink-soft">Maybe: {money(l.perPerson)} if you join</span> : <span className="text-ink-soft">Not in your total</span>}
                    </div>
                  </div>
                </div>
                {l.mine === "yes" && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                    <PaymentBadge value={pay} />
                    {pay !== "tbd" && <Button size="sm" variant="soft" onClick={() => { dispatch({ type: "setPayment", activityId: l.activity.id, userId: me.id, state: pay === "paid" ? "unpaid" : "paid" }); toast(pay === "paid" ? "Marked as not paid" : "Marked as paid"); }}>{pay === "paid" ? "Mark as not paid" : "Mark as paid"}</Button>}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );

  return (
    <div className="space-y-8">
      <h1 className="text-5xl font-extrabold">Costs</h1>
      <CostSummary />
      <p className="rounded-2xl bg-sun-soft p-4 text-base">Estimates only. Payment labels are visual, and no money moves in this prototype.</p>
      {lines.length === 0 ? <EmptyState title="No costs yet" body="Add a cost to an activity and it shows up here." /> : (
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          {renderSection("Confirmed", "Booked or locked in.", confirmed)}
          {renderSection("Tentative", "Still being decided.", tentative)}
        </div>
      )}
    </div>
  );
}
