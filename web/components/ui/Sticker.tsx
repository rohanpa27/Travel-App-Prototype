/** A small tilted label, like a sticker on a suitcase. */
export function Sticker({ children, color = "#D4FF3F", tilt = -3, wobble = false, className = "" }: { children: React.ReactNode; color?: string; tilt?: number; wobble?: boolean; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1 text-sm font-bold text-ink ${wobble ? "wobble" : ""} ${className}`}
      style={{ background: color, transform: `rotate(${tilt}deg)`, ["--tilt" as string]: `${tilt}deg` }}
    >
      {children}
    </span>
  );
}
