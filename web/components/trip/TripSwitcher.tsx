"use client";

import { Check, Plus, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { DEMO_TRIPS } from "@/lib/demo";
import { ROUTES } from "@/lib/constants";
import { dateRange } from "@/lib/format";
import { dispatch, useTrips } from "@/lib/store";
import { toast } from "@/lib/toast";
import { Modal } from "@/components/ui/Modal";
import { ButtonLink } from "@/components/ui/Button";

/** Lists every saved trip and the demo trips you haven't opened yet. Each trip keeps its own changes. */
export function TripSwitcher({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { saved, unopenedDemos } = useTrips();
  const router = useRouter();
  const isDemo = (id: string) => DEMO_TRIPS.some((d) => d.id === id);

  function open_(id: string, title: string) {
    dispatch({ type: "switchTrip", id });
    toast(`Opened ${title}`);
    onClose();
    router.push(ROUTES.trip);
  }

  return (
    <Modal open={open} onClose={onClose} title="Your trips">
      <ul className="space-y-2">
        {saved.map((t) => (
          <li key={t.id} className="flex items-stretch gap-2">
            <button type="button" aria-current={t.active ? "true" : undefined} onClick={() => open_(t.id, t.title)} className={`flex min-h-16 flex-1 items-center gap-3 rounded-2xl border-2 p-2 pr-3 text-left ${t.active ? "border-ink bg-lime" : "border-line bg-white hover:border-ink/40"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.cover} alt="" className="size-14 shrink-0 rounded-xl border border-ink/20 object-cover" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-lg font-bold leading-tight">{t.title}</span>
                <span className="block truncate text-sm text-ink-soft">{t.destination} · {dateRange(t.startDate, t.endDate)}</span>
              </span>
              <span className="flex items-center gap-1 text-sm font-bold"><Users className="size-4" aria-hidden />{t.members}</span>
              {t.active && <Check className="size-5" aria-label="Open now" />}
            </button>
            {!isDemo(t.id) && (
              <button type="button" aria-label={`Remove ${t.title}`} onClick={() => { dispatch({ type: "deleteTrip", id: t.id }); toast(`Removed ${t.title}`); }} className="grid w-12 place-items-center rounded-2xl border-2 border-line bg-white text-[#8a1c0c] hover:bg-coral-soft"><Trash2 className="size-5" aria-hidden /></button>
            )}
          </li>
        ))}
      </ul>

      {unopenedDemos.length > 0 && (
        <section className="mt-6" aria-labelledby="more-demos">
          <h3 id="more-demos" className="text-xl font-bold">More demo trips</h3>
          <ul className="mt-2 space-y-2">
            {unopenedDemos.map((d) => {
              const full = { trip: DEMO_TRIPS.find((x) => x.id === d.id)!.preview };
              return (
                <li key={d.id}>
                  <button type="button" onClick={() => open_(d.id, full.trip.title)} className="flex min-h-16 w-full items-center gap-3 rounded-2xl border-2 border-dashed border-line bg-white/60 p-2 pr-3 text-left hover:border-ink/40 hover:bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={full.trip.coverImageUrl} alt="" className="size-14 shrink-0 rounded-xl border border-ink/20 object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-lg font-bold leading-tight">{full.trip.title}</span>
                      <span className="block text-sm text-ink-soft">{d.blurb}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="mt-6">
        <ButtonLink href={ROUTES.create} variant="dark" className="w-full" onClick={onClose}><Plus className="size-4" aria-hidden />Plan a new trip</ButtonLink>
      </div>
    </Modal>
  );
}
