"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Users } from "lucide-react";
import { DEMO_TRIPS } from "@/lib/demo";
import { ROUTES } from "@/lib/constants";
import { dateRange } from "@/lib/format";
import { dispatch } from "@/lib/store";
import { asset } from "@/lib/paths";

/** Landing-page row of demo trips. Opening one switches to it and keeps its own saved changes. */
export function DemoTripGallery() {
  const router = useRouter();
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {DEMO_TRIPS.map((d) => (
        <li key={d.id}>
          <button type="button" onClick={() => { dispatch({ type: "switchTrip", id: d.id }); router.push(ROUTES.trip); }} className="group flex h-full w-full flex-col overflow-hidden rounded-card border border-ink/15 bg-white text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-pop">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset(d.preview.coverImageUrl)} alt="" className="aspect-[3/2] w-full object-cover" />
            <span className="flex flex-1 flex-col p-4">
              <span className="font-display text-2xl font-extrabold leading-tight">{d.preview.title}</span>
              <span className="mt-1 text-base text-ink-soft">{d.preview.destination} · {dateRange(d.preview.startDate, d.preview.endDate)}</span>
              <span className="mt-2 flex-1 text-base">{d.blurb}</span>
              <span className="mt-3 flex items-center justify-between font-bold">
                <span className="inline-flex items-center gap-1.5"><Users className="size-4" aria-hidden />{d.preview.memberIds.length} friends</span>
                <span className="inline-flex items-center gap-1">Open trip <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden /></span>
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
