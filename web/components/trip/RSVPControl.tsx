"use client";

import { useEffect, useRef, useState } from "react";
import { Check, HelpCircle, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { Activity, RsvpResponse } from "@/lib/types";
import { dispatch, useAppState } from "@/lib/store";
import { responseOf, tally } from "@/lib/selectors";
import { Confetti } from "./Confetti";
import { toast } from "@/lib/toast";

const options: { value: RsvpResponse; label: string; Icon: typeof Check; on: string }[] = [
  { value: "yes", label: "Yes", Icon: Check, on: "bg-brand-soft border-ink" },
  { value: "maybe", label: "Maybe", Icon: HelpCircle, on: "bg-sun border-ink" },
  { value: "no", label: "No", Icon: X, on: "bg-coral border-ink text-white" },
];

/** Yes / Maybe / No for the current viewer. Updates counts, avatars, and costs right away. */
export function RSVPControl({ activity }: { activity: Activity }) {
  const s = useAppState();
  const mine = responseOf(s, activity.id, s.currentUserId);
  const t = tally(s, activity);
  const reduce = useReducedMotion();
  const [burst, setBurst] = useState(false);
  const wasEveryoneIn = useRef(t.everyoneIn);

  useEffect(() => {
    if (t.everyoneIn && !wasEveryoneIn.current) {
      setBurst(true);
      toast("Everyone is in!");
      const id = setTimeout(() => setBurst(false), 1300);
      wasEveryoneIn.current = true;
      return () => clearTimeout(id);
    }
    wasEveryoneIn.current = t.everyoneIn;
  }, [t.everyoneIn]);

  const blockedByCapacity = t.full && mine !== "yes";

  return (
    <div className="relative">
      <Confetti active={burst} />
      <div role="radiogroup" aria-label={`Your response to ${activity.title}`} className="grid grid-cols-3 gap-2">
        {options.map(({ value, label, Icon, on }) => {
          const selected = mine === value;
          return (
            <motion.button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={value === "yes" && blockedByCapacity}
              whileTap={reduce ? undefined : { scale: 0.94 }}
              animate={reduce ? undefined : { scale: selected ? [1, 1.08, 1] : 1 }}
              transition={{ duration: 0.25 }}
              onClick={() => dispatch({ type: "respond", activityId: activity.id, userId: s.currentUserId, response: value })}
              className={`flex min-h-12 items-center justify-center gap-1.5 rounded-2xl border-2 px-2 font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${selected ? on : "border-line bg-white text-ink hover:border-ink/40"}`}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </motion.button>
          );
        })}
      </div>
      {blockedByCapacity && <p className="mt-2 text-sm font-semibold text-[#8a1c0c]">This one is full. You can still say Maybe to get on the waitlist.</p>}
    </div>
  );
}
