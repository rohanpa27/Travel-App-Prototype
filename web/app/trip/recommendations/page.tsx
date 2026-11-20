"use client";

import { useState } from "react";
import { Bookmark, Sparkles } from "lucide-react";
import { useAppState } from "@/lib/store";
import { scoreRecommendations } from "@/lib/recommendations";
import { costsOn } from "@/lib/selectors";
import { RecommendationCard } from "@/components/trip/RecommendationCard";
import { EmptyState } from "@/components/trip/EmptyState";
import { Chip } from "@/components/ui/Field";

export default function Recommendations() {
  const s = useAppState();
  const [tab, setTab] = useState<"new" | "saved">("new");
  const scored = scoreRecommendations(s);
  const fresh = scored.filter((x) => x.rec.status !== "saved");
  const saved = scored.filter((x) => x.rec.status === "saved");
  const list = tab === "new" ? fresh : saved;

  return (
    <div className="space-y-6">
      <h1 className="text-5xl font-extrabold">For your group</h1>
      <p className="max-w-xl text-lg text-ink-soft">Ideas matched to your trip vibe ({s.trip.vibeTags.join(", ") || "none picked"}), everyone&apos;s interests, {costsOn(s) ? "your budget, " : ""}and the gaps in your schedule. Picked by simple rules on seeded data. No AI model is involved in this demo.</p>
      <div className="flex gap-2" role="group" aria-label="Filter suggestions">
        <Chip selected={tab === "new"} onClick={() => setTab("new")}>Suggested ({fresh.length})</Chip>
        <Chip selected={tab === "saved"} onClick={() => setTab("saved")}>Saved ({saved.length})</Chip>
      </div>
      {list.length === 0 ? (
        <EmptyState icon={tab === "saved" ? <Bookmark className="size-6" aria-hidden /> : <Sparkles className="size-6" aria-hidden />} title={tab === "saved" ? "Nothing saved yet" : "You're out of suggestions"} body={tab === "saved" ? "Save a suggestion to come back to it later." : "Dismissed ideas stay gone. Reset the demo in Profile to bring them back."} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">{list.map((r) => <RecommendationCard key={r.rec.id} item={r} headingLevel={2} />)}</div>
      )}
    </div>
  );
}
