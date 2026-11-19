"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { CalendarHeart, Check, PartyPopper } from "lucide-react";
import { brand } from "@/lib/brand";
import { AIRPORTS, AVATARS, INTERESTS, ROUTES } from "@/lib/constants";
import { dispatch, newId, useAppState } from "@/lib/store";
import { members } from "@/lib/selectors";
import { dateRange } from "@/lib/format";
import { joinSchema, toFieldErrors, type FieldErrors } from "@/lib/schemas";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Avatar, AvatarStack } from "@/components/ui/Avatar";
import { Sticker } from "@/components/ui/Sticker";
import { Modal } from "@/components/ui/Modal";
import { Chip, Field, Select, TextInput } from "@/components/ui/Field";
import { Confetti } from "@/components/trip/Confetti";
import { TripCover } from "@/components/trip/TripCover";

/** Public invitation. Works without an account, then a short join flow. */
export default function InvitePage() {
  const s = useAppState();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [joining, setJoining] = useState(false);
  const [done, setDone] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [airport, setAirport] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});

  const host = s.users.find((u) => u.id === s.trip.hostId);
  const people = members(s);
  const already = s.hasJoined;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = joinSchema.safeParse({ name });
    if (!r.success) return setErrors(toFieldErrors(r.error));
    dispatch({ type: "join", user: { id: newId("u"), name: r.data.name, avatarUrl: avatar, homeAirport: airport || undefined, homeCity: airport ? AIRPORTS[airport] : undefined, interests } });
    setJoining(false);
    setDone(true);
    setTimeout(() => router.push(ROUTES.trip), reduce ? 400 : 1500);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-5">
      <header className="mb-4 flex items-center justify-between">
        <Link href={ROUTES.home} className="font-display text-2xl font-extrabold">{brand.name}</Link>
        <p className="text-sm font-semibold text-ink-soft">You&apos;re invited</p>
      </header>

      <main id="main">
        <motion.div initial={reduce ? false : { opacity: 0, y: 40, rotate: -2, scale: 0.94 }} animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 140, damping: 16 }}>
          <div className="relative">
            <TripCover trip={s.trip}>
              <p className="mt-3 max-w-md text-lg text-white/95">{s.trip.description}</p>
            </TripCover>
            <div className="absolute right-4 top-4"><Sticker color="#D4FF3F" tilt={6} wobble><CalendarHeart className="size-4" aria-hidden />{dateRange(s.trip.startDate, s.trip.endDate)}</Sticker></div>
          </div>
        </motion.div>

        <section className="mt-6 rounded-xl2 border border-line bg-white p-5 shadow-soft md:p-7">
          <div className="flex items-center gap-3">
            {host && <Avatar user={host} size="lg" />}
            <div>
              <p className="text-lg font-bold">Hosted by {host?.name}</p>
              <p className="text-ink-soft">{s.trip.vibeTags.join(" · ")}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-paper p-4">
            <AvatarStack users={people} max={6} size="md" />
            <p className="font-semibold">{people.length} {people.length === 1 ? "person is" : "people are"} on the list</p>
          </div>
          <div className="mt-6">
            {already ? (
              <ButtonLink href={ROUTES.trip} size="lg" className="w-full">You&apos;re in. Open the trip</ButtonLink>
            ) : (
              <Button size="lg" className="w-full" onClick={() => setJoining(true)}><PartyPopper className="size-5" aria-hidden />Join the trip</Button>
            )}
            <p className="mt-3 text-center text-sm text-ink-soft">No account needed. Just a name and an avatar.</p>
          </div>
        </section>
      </main>

      <Modal open={joining} onClose={() => setJoining(false)} title="Join the trip">
        <form onSubmit={submit} className="space-y-5" noValidate>
          <Field label="Your name" error={errors.name}><TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex" autoFocus /></Field>
          <fieldset>
            <legend className="mb-2 text-sm font-bold">Choose an avatar</legend>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map((a) => (
                <button key={a} type="button" aria-pressed={avatar === a} aria-label={`Avatar ${a.split("/").pop()?.replace(".svg", "")}`} onClick={() => setAvatar(a)} className={`relative rounded-full ${avatar === a ? "ring-4 ring-ink" : ""}`}>
                  <Avatar user={{ name: "", avatarUrl: a }} size="md" ring={false} />
                  {avatar === a && <Check className="absolute -right-1 -top-1 size-5 rounded-full bg-lime p-0.5" aria-hidden />}
                </button>
              ))}
            </div>
          </fieldset>
          <Field label="Flying from (optional)" hint="Helps the group line up arrivals.">
            <Select value={airport} onChange={(e) => setAirport(e.target.value)}>
              <option value="">Not sure yet</option>
              {Object.entries(AIRPORTS).map(([code, city]) => <option key={code} value={code}>{city} ({code})</option>)}
            </Select>
          </Field>
          <fieldset>
            <legend className="mb-2 text-sm font-bold">What are you into? (optional)</legend>
            <div className="flex flex-wrap gap-2">{INTERESTS.map((i) => <Chip key={i} selected={interests.includes(i)} onClick={() => setInterests((c) => (c.includes(i) ? c.filter((x) => x !== i) : [...c, i]))}>{i}</Chip>)}</div>
          </fieldset>
          <Button type="submit" size="lg" className="w-full">Count me in</Button>
        </form>
      </Modal>

      {done && (
        <div className="fixed inset-0 z-[75] grid place-items-center bg-lime" role="status">
          <div className="relative text-center">
            <Confetti active />
            <PartyPopper className="mx-auto size-16" aria-hidden />
            <p className="mt-3 font-display text-5xl font-extrabold">You&apos;re in!</p>
            <p className="mt-1 text-lg font-semibold">Taking you to the trip…</p>
          </div>
        </div>
      )}
    </div>
  );
}
