"use client";

import { Sticker } from "@/components/ui/Sticker";
import { daysUntil } from "@/lib/selectors";
import { useNow } from "@/lib/useNow";

export function Countdown({ startDate, endDate }: { startDate: string; endDate: string }) {
  const now = useNow(3_600_000);
  if (!now) return <Sticker color="#FFC857">&nbsp;</Sticker>;
  const to = daysUntil(startDate, now);
  const left = daysUntil(endDate, now);
  const label = to > 1 ? `${to} days to go` : to === 1 ? "Tomorrow!" : to === 0 ? "Today is the day" : left >= 0 ? "Happening now" : "Trip complete";
  return <Sticker color="#D4FF3F" tilt={-3} wobble>{label}</Sticker>;
}
