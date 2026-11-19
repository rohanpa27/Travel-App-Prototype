import type { Activity, AppState, Recommendation } from "./types";
import { activeActivities, members, tally } from "./selectors";
import { dayLabel, listNames, money, timeLabel } from "./format";

export type ScoredRecommendation = {
  rec: Recommendation;
  score: number;
  reasons: string[];
  /** One readable sentence built from the signals that matched. */
  explanation: string;
  fits: { budget: boolean; window: boolean };
};

const budgetCap = (s: AppState) => s.trip.estimatedBudget ?? 75;
const hour = (hhmm?: string) => (hhmm ? Number(hhmm.split(":")[0]) : undefined);
const DAYPART = { morning: [6, 12], afternoon: [12, 17], evening: [17, 24] } as const;

/** Is the suggested day-part still open for the group on that date? */
function windowOpen(s: AppState, rec: Recommendation): boolean {
  if (!rec.suggestedDate) return true;
  const [from, to] = DAYPART[rec.daypart];
  return !activeActivities(s).some((a) => {
    const h = hour(a.startTime);
    return a.date === rec.suggestedDate && h !== undefined && h >= from && h < to && a.status !== "idea";
  });
}

/** Categories the group has already said yes to in confirmed plans. */
function acceptedCategories(s: AppState): Set<string> {
  return new Set(s.activities.filter((a) => a.status === "confirmed" && tally(s, a).yes.length >= 3).map((a) => a.category));
}

/** Deterministic matching: the same state always produces the same ranking. No model is involved. */
export function scoreRecommendations(s: AppState): ScoredRecommendation[] {
  const people = members(s);
  const accepted = acceptedCategories(s);
  const cap = budgetCap(s);

  return s.recommendations
    .filter((r) => r.status !== "dismissed")
    .map((rec) => {
      const vibeHits = rec.vibes.filter((v) => s.trip.vibeTags.includes(v));
      const interested = people.filter((u) => u.interests.some((i) => rec.interests.includes(i)));
      const fitsBudget = (rec.estimatedCostPerPerson ?? 0) <= cap;
      const open = windowOpen(s, rec);
      const similarAccepted = accepted.has(rec.category);

      const reasons: string[] = [];
      if (interested.length >= 2) reasons.push(`${interested.length === people.length ? "everyone" : numberWord(interested.length)} in the group listed ${listNames([...new Set(rec.interests)].map((i) => i.toLowerCase()))} as an interest`);
      if (vibeHits.length) reasons.push(`it matches your ${listNames(vibeTagsLower(vibeHits))} trip vibe`);
      if (open && rec.suggestedDate) reasons.push(`${dayLabel(rec.suggestedDate)} ${rec.daypart} is open`);
      if (fitsBudget) reasons.push(`it fits the ${money(cap)} activity budget`);
      if (rec.similarGroupsPercent >= 60) reasons.push(`${rec.similarGroupsPercent}% of similar groups added it`);
      if (similarAccepted) reasons.push(`your group already said yes to ${rec.category.toLowerCase()} plans`);

      const score = vibeHits.length * 3 + interested.length * 2 + (open ? 3 : -4) + (fitsBudget ? 2 : -3) + rec.similarGroupsPercent / 20 + (similarAccepted ? 1.5 : 0);
      const lead = reasons.slice(0, 4);
      const explanation = lead.length ? `We think your group would like this because ${joinReasons(lead)}.` : "A flexible pick that could fit anywhere in your plan.";
      return { rec, score, reasons, explanation, fits: { budget: fitsBudget, window: open } };
    })
    .sort((a, b) => b.score - a.score || a.rec.id.localeCompare(b.rec.id));
}

const vibeTagsLower = (v: string[]) => v.map((x) => x.toLowerCase());
const numberWord = (n: number) => ["no one", "one member", "two members", "three members", "four members", "five members", "six members"][n] ?? `${n} members`;
const joinReasons = (r: string[]) => (r.length === 1 ? r[0] : `${r.slice(0, -1).join(", ")}, and ${r[r.length - 1]}`);

export function recommendationToActivity(rec: Recommendation, tripId: string, userId: string, asIdea: boolean, id: string): Activity {
  return {
    id,
    tripId,
    createdBy: userId,
    title: rec.title,
    description: rec.description,
    category: rec.category,
    date: asIdea ? undefined : rec.suggestedDate,
    startTime: asIdea ? undefined : rec.suggestedTime,
    timeStatus: asIdea || !rec.suggestedTime ? "tbd" : "scheduled",
    estimatedCostPerPerson: rec.estimatedCostPerPerson,
    status: asIdea ? "idea" : "proposed",
  };
}

export const suggestedWhen = (rec: Recommendation) => (rec.suggestedDate ? `${dayLabel(rec.suggestedDate)}${rec.suggestedTime ? `, ${timeLabel(rec.suggestedTime)}` : ""}` : "Any time");
