"use client";

import { useAppState } from "@/lib/store";
import { currentUser, groupCost, personalCost } from "@/lib/selectors";
import { money } from "@/lib/format";

/** Headline numbers for the group and for the current viewer. */
export function CostSummary({ compact = false }: { compact?: boolean }) {
  const s = useAppState();
  const me = currentUser(s);
  const mine = personalCost(s);
  const group = groupCost(s);
  return (
    <section aria-label="Cost summary" className={`grid gap-3 ${compact ? "" : "sm:grid-cols-2"}`}>
      <div className="rounded-card border border-ink/15 bg-brand-soft p-5">
        <p className="font-bold">{me.name}&apos;s estimated cost</p>
        <p className="mt-1 font-display text-6xl font-extrabold" aria-live="polite">{money(mine.total)}</p>
        <p className="mt-1 text-base font-semibold">{money(mine.confirmed)} confirmed · {money(mine.tentative)} tentative</p>
        {mine.ifMaybe > 0 && <p className="mt-1 text-sm">Up to {money(mine.total + mine.ifMaybe)} if your Maybes become Yeses.</p>}
      </div>
      {!compact && (
        <div className="rounded-card border border-line bg-white p-5 shadow-soft">
          <p className="font-bold">Whole group</p>
          <p className="mt-1 font-display text-6xl font-extrabold" aria-live="polite">{money(group.total)}</p>
          <p className="mt-1 text-base font-semibold text-ink-soft">{money(group.confirmed)} confirmed · {money(group.tentative)} tentative</p>
          <p className="mt-1 text-sm text-ink-soft">Based on everyone who said Yes so far.</p>
        </div>
      )}
    </section>
  );
}
