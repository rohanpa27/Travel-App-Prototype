import type { Trip } from "@/lib/types";
import { dateRange } from "@/lib/format";
import { MapPin } from "lucide-react";
import { asset } from "@/lib/paths";

/** Large editorial cover. `compact` is used on the trip header; the full size is for the invitation. */
export function TripCover({ trip, compact = false, children }: { trip: Trip; compact?: boolean; children?: React.ReactNode }) {
  return (
    <section className={`relative isolate overflow-hidden rounded-xl2 border border-ink/15 ${compact ? "min-h-48" : "min-h-[26rem] md:min-h-[32rem]"}`} style={{ background: trip.themeColor }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset(trip.coverImageUrl)} alt="" className="absolute inset-0 -z-10 size-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/85 via-ink/45 to-ink/5" aria-hidden />
      <div className={`flex h-full flex-col justify-end text-white ${compact ? "p-5" : "p-6 md:p-10"}`} style={{ minHeight: "inherit" }}>
        <h1 style={{ textShadow: "0 2px 12px rgba(23,21,28,0.55)" }} className={`${compact ? "text-3xl md:text-4xl" : "text-5xl md:text-7xl"} font-extrabold text-balance`}>{trip.title}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-base font-semibold md:text-lg">
          <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" aria-hidden />{trip.destination}</span>
          <span>{dateRange(trip.startDate, trip.endDate)}</span>
        </p>
        {children}
      </div>
    </section>
  );
}
