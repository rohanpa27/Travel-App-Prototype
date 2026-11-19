"use client";

import { useMemo } from "react";

const COLORS = ["#d4ff3f", "#ff5c45", "#8fd3ff", "#ffc857", "#3d2c8d"];

/** A short burst of confetti. Hidden entirely when reduced motion is requested (see globals.css). */
export function Confetti({ active }: { active: boolean }) {
  const bits = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => {
        const a = (i / 28) * Math.PI * 2;
        const d = 70 + ((i * 37) % 60);
        return { i, dx: Math.cos(a) * d, dy: Math.sin(a) * d - 20, rot: (i * 97) % 360, c: COLORS[i % COLORS.length] };
      }),
    [],
  );
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center motion-reduce:hidden" aria-hidden>
      {bits.map((b) => (
        <span key={b.i} className="absolute h-2.5 w-1.5 rounded-sm" style={{ background: b.c, animation: "confetti-fall 1.1s ease-out forwards", ["--dx" as string]: `${b.dx}px`, ["--dy" as string]: `${b.dy}px`, ["--rot" as string]: `${b.rot}deg` }} />
      ))}
    </div>
  );
}
