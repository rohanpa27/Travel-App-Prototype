import { ArrowRight, CalendarCheck, Plane, Vote } from "lucide-react";
import { brand } from "@/lib/brand";
import { ROUTES } from "@/lib/constants";
import { SEED_USERS } from "@/lib/seed";
import { ButtonLink } from "@/components/ui/Button";
import { Sticker } from "@/components/ui/Sticker";
import { AvatarStack } from "@/components/ui/Avatar";

const points = [
  { Icon: Vote, title: "Vote on everything", body: "Yes, Maybe, or No on each activity, so nobody gets pushed into a plan." },
  { Icon: CalendarCheck, title: "One shared itinerary", body: "Days, ideas, costs, and who is coming, all in one place." },
  { Icon: Plane, title: "See who lands when", body: "Everyone's flights on one timeline, so pickups basically plan themselves." },
];

export default function Landing() {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 pt-6 md:px-8">
      <header className="flex items-center justify-between">
        <span className="font-display text-2xl font-extrabold">{brand.name}</span>
        <ButtonLink href={ROUTES.trip} variant="ghost" size="sm">Open demo trip</ButtonLink>
      </header>

      <main id="main" className="mt-10 grid items-center gap-12 md:mt-16 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h1 className="text-[3.4rem] font-extrabold leading-[0.95] text-balance md:text-[5.5rem]">
            Make the plan with your friends, not for them.
          </h1>
          <p className="mt-6 max-w-lg text-xl text-ink-soft">{brand.promise}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={ROUTES.create} size="lg">Plan a trip <ArrowRight className="size-5" aria-hidden /></ButtonLink>
            <ButtonLink href={ROUTES.invite} size="lg" variant="ghost">See an invite</ButtonLink>
          </div>
          <p className="mt-4 text-sm text-ink-soft">Prototype with demo data. Everything stays in your browser.</p>
        </div>

        <div className="relative mx-auto w-full max-w-sm md:max-w-none" aria-hidden>
          <div className="relative rotate-[3deg] overflow-hidden rounded-xl2 border-2 border-ink bg-sun shadow-[8px_8px_0_var(--color-ink)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/covers/chicago-skyline.svg" alt="" className="aspect-[4/5] w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-5 text-white">
              <p className="font-display text-3xl font-extrabold">Chicago Birthday Weekend</p>
              <p className="font-semibold">Mar 14 to 16 · Hosted by Maya</p>
              <div className="mt-3"><AvatarStack users={SEED_USERS} max={6} size="md" /></div>
            </div>
          </div>
          <div className="absolute -left-2 top-8"><Sticker color="#FF5C45" tilt={-8} wobble>5 going</Sticker></div>
          <div className="absolute -right-1 top-24"><Sticker color="#8FD3FF" tilt={6}>Boat tour: 4 yes</Sticker></div>
          <div className="absolute -bottom-4 left-6"><Sticker color="#D4FF3F" tilt={-4}>Dinner at Aba is confirmed</Sticker></div>
        </div>
      </main>

      <section aria-label="How it works" className="mt-28 grid gap-5 md:grid-cols-3">
        {points.map(({ Icon, title, body }) => (
          <div key={title} className="rounded-card border border-line bg-white p-6 shadow-soft">
            <span className="grid size-12 place-items-center rounded-2xl border-2 border-ink bg-lime"><Icon className="size-6" aria-hidden /></span>
            <h2 className="mt-4 text-2xl font-bold">{title}</h2>
            <p className="mt-2 text-ink-soft">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
