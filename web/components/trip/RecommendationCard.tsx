"use client";

import { BookmarkPlus, Lightbulb, Send, Sparkles, X, Check } from "lucide-react";
import { dispatch, newId, useAppState } from "@/lib/store";
import { recommendationToActivity, suggestedWhen, type ScoredRecommendation } from "@/lib/recommendations";
import { money } from "@/lib/format";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/Button";
import { CategoryIcon } from "./CategoryIcon";

export function RecommendationCard({ item, headingLevel = 3 }: { item: ScoredRecommendation; headingLevel?: 2 | 3 }) {
  const Heading = `h${headingLevel}` as const;
  const s = useAppState();
  const { rec } = item;
  const added = rec.status === "idea" || rec.status === "proposed";

  function add(kind: "idea" | "propose") {
    const activity = recommendationToActivity(rec, s.trip.id, s.currentUserId, kind === "idea", newId("a"));
    dispatch({ type: "recAction", id: rec.id, action: kind, activity });
    toast(kind === "idea" ? `${rec.title} added to ideas` : `${rec.title} proposed to the group`);
  }

  return (
    <article className="rounded-card border border-line bg-white p-5 shadow-soft">
      <div className="flex items-start gap-3">
        <CategoryIcon category={rec.category} />
        <div className="min-w-0 flex-1">
          <Heading className="text-2xl font-bold leading-tight">{rec.title}</Heading>
          <p className="mt-0.5 text-base text-ink-soft">{suggestedWhen(rec)}{rec.estimatedCostPerPerson !== undefined && <> · <span className="font-semibold text-ink">{money(rec.estimatedCostPerPerson)} each</span></>}</p>
        </div>
      </div>
      <p className="mt-3">{rec.description}</p>
      <div className="mt-3 rounded-2xl bg-sun-soft p-3.5">
        <p className="flex items-start gap-2 text-base">
          <Sparkles className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span><span className="font-bold">Why this one: </span>{item.explanation.replace(/^We think your group would like this because /, "")}</span>
        </p>
        <p className="mt-1.5 text-xs text-ink-soft">Picked by matching rules on your trip details. No AI model involved in this demo.</p>
      </div>
      {added ? (
        <p className="mt-4 flex items-center gap-2 font-bold text-[#1e6b3a]"><Check className="size-5" aria-hidden />{rec.status === "idea" ? "Added to your ideas" : "Proposed to the group"}</p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => add("propose")}><Send className="size-4" aria-hidden />Propose to group</Button>
          <Button size="sm" variant="soft" onClick={() => add("idea")}><Lightbulb className="size-4" aria-hidden />Add to ideas</Button>
          <Button size="sm" variant="ghost" aria-pressed={rec.status === "saved"} onClick={() => { dispatch({ type: "recAction", id: rec.id, action: "save" }); toast(`${rec.title} saved`); }}><BookmarkPlus className="size-4" aria-hidden />{rec.status === "saved" ? "Saved" : "Save"}</Button>
          <Button size="sm" variant="ghost" onClick={() => { dispatch({ type: "recAction", id: rec.id, action: "dismiss" }); toast("Dismissed"); }}><X className="size-4" aria-hidden />Dismiss</Button>
        </div>
      )}
    </article>
  );
}
