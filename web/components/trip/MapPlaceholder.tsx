import { MapPin } from "lucide-react";

/** Styled static stand-in for a map. It never calls a map service. */
export function MapPlaceholder({ address }: { address?: string }) {
  return (
    <div className="relative h-28 overflow-hidden rounded-2xl border border-line bg-mint" role="img" aria-label={address ? `Map placeholder for ${address}` : "Map placeholder"}>
      <svg className="absolute inset-0 size-full" viewBox="0 0 300 112" preserveAspectRatio="none" aria-hidden>
        <path d="M0 80 L300 60" stroke="#fff" strokeWidth="10" />
        <path d="M90 0 L120 112" stroke="#fff" strokeWidth="8" />
        <path d="M210 0 L180 112" stroke="#fff" strokeWidth="6" />
        <path d="M0 20 Q150 50 300 10" stroke="#8fd3ff" strokeWidth="14" fill="none" />
      </svg>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[70%]">
        <MapPin className="size-8 fill-coral text-ink" aria-hidden />
      </div>
      <span className="absolute bottom-2 left-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-bold text-ink-soft">Map preview</span>
    </div>
  );
}
