"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Plus, Rocket, X } from "lucide-react";
import { brand } from "@/lib/brand";
import { CATEGORIES, ROUTES, THEMES, VIBES } from "@/lib/constants";
import { buildTripState, type NewTripInput } from "@/lib/createTrip";
import { dispatch, newId } from "@/lib/store";
import { toast } from "@/lib/toast";
import { toFieldErrors, tripBasicsSchema, type FieldErrors } from "@/lib/schemas";
import { Button } from "@/components/ui/Button";
import { Chip, Field, Select, TextArea, TextInput } from "@/components/ui/Field";

const STEPS = ["The basics", "The vibe", "First ideas"];
type Starter = { title: string; category: string; cost: string };

export default function CreateTrip() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [form, setForm] = useState({ title: "", destination: "", startDate: "", endDate: "", description: "" });
  const [vibes, setVibes] = useState<string[]>([]);
  const [budget, setBudget] = useState("75");
  const [themeId, setThemeId] = useState<string>(THEMES[0].id);
  const [visibility, setVisibility] = useState<"invite_only" | "anyone_with_link">("anyone_with_link");
  const [guestsPropose, setGuestsPropose] = useState(true);
  const [starters, setStarters] = useState<Starter[]>([{ title: "", category: "Food", cost: "" }]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggleVibe = (v: string) => setVibes((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]));

  function next() {
    if (step === 0) {
      const r = tripBasicsSchema.safeParse(form);
      if (!r.success) return setErrors(toFieldErrors(r.error));
    }
    setErrors({});
    setStep((s) => s + 1);
  }

  function finish() {
    const r = tripBasicsSchema.safeParse(form);
    if (!r.success) {
      setErrors(toFieldErrors(r.error));
      return setStep(0);
    }
    const input: NewTripInput = {
      ...r.data,
      vibeTags: vibes,
      estimatedBudget: Number(budget) > 0 ? Number(budget) : undefined,
      themeId,
      visibility,
      allowGuestsToPropose: guestsPropose,
      starters: starters.filter((x) => x.title.trim()).map((x) => ({ title: x.title.trim(), category: x.category, cost: x.cost ? Number(x.cost) : undefined })),
    };
    dispatch({ type: "replaceTrip", state: buildTripState(input, newId) });
    toast("Trip created. Invite your friends!");
    router.push(ROUTES.trip);
  }

  return (
    <div className="mx-auto max-w-2xl px-5 pb-16 pt-6">
      <header className="flex items-center justify-between">
        <Link href={ROUTES.home} className="font-display text-2xl font-extrabold">{brand.name}</Link>
        <Link href={ROUTES.home} aria-label="Cancel and go back" className="grid size-10 place-items-center rounded-full hover:bg-paper-deep"><X className="size-5" aria-hidden /></Link>
      </header>

      <nav aria-label="Progress" className="mt-6 flex gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex-1" aria-current={i === step ? "step" : undefined}>
            <div className={`h-2 rounded-full ${i <= step ? "bg-ink" : "bg-line"}`} />
            <p className={`mt-1.5 text-sm font-bold ${i === step ? "text-ink" : "text-ink-soft"}`}>{label}</p>
          </div>
        ))}
      </nav>

      <main id="main" className="mt-8">
        {step === 0 && (
          <section className="space-y-5">
            <h1 className="text-5xl font-extrabold">Where are you headed?</h1>
            <Field label="Trip name" error={errors.title}><TextInput value={form.title} onChange={set("title")} placeholder="Chicago Birthday Weekend" autoFocus /></Field>
            <Field label="Destination" error={errors.destination}><TextInput value={form.destination} onChange={set("destination")} placeholder="Chicago, IL" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Starts" error={errors.startDate}><TextInput type="date" value={form.startDate} onChange={set("startDate")} /></Field>
              <Field label="Ends" error={errors.endDate}><TextInput type="date" value={form.endDate} min={form.startDate} onChange={set("endDate")} /></Field>
            </div>
            <Field label="One-line description" hint="Shown on the invitation." error={errors.description}><TextArea rows={2} value={form.description} onChange={set("description")} placeholder="Food, dancing, and recovering by the lake." /></Field>
          </section>
        )}

        {step === 1 && (
          <section className="space-y-7">
            <h1 className="text-5xl font-extrabold">Give it a personality.</h1>
            <fieldset>
              <legend className="mb-2 text-sm font-bold">Pick a look</legend>
              <div className="grid grid-cols-3 gap-3">
                {THEMES.map((t) => (
                  <button key={t.id} type="button" aria-pressed={themeId === t.id} onClick={() => setThemeId(t.id)} className={`relative overflow-hidden rounded-2xl border-2 text-left ${themeId === t.id ? "border-ink shadow-pop" : "border-line"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.cover} alt="" className="aspect-[4/3] w-full object-cover" />
                    <span className="block bg-white px-2.5 py-1.5 text-sm font-bold">{t.name}</span>
                    {themeId === t.id && <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-lime"><Check className="size-4" aria-hidden /></span>}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-2 text-sm font-bold">Trip vibe</legend>
              <div className="flex flex-wrap gap-2">{VIBES.map((v) => <Chip key={v} selected={vibes.includes(v)} onClick={() => toggleVibe(v)}>{v}</Chip>)}</div>
            </fieldset>
            <Field label="Activity budget per person" hint="A rough number helps us suggest things that fit."><TextInput inputMode="numeric" value={budget} onChange={(e) => setBudget(e.target.value.replace(/\D/g, ""))} placeholder="75" /></Field>
            <fieldset className="space-y-3">
              <legend className="mb-1 text-sm font-bold">Who can join?</legend>
              <Chip selected={visibility === "anyone_with_link"} onClick={() => setVisibility("anyone_with_link")}>Anyone with the link</Chip>{" "}
              <Chip selected={visibility === "invite_only"} onClick={() => setVisibility("invite_only")}>Invite only</Chip>
              <label className="flex min-h-11 items-center gap-3 font-semibold"><input type="checkbox" checked={guestsPropose} onChange={(e) => setGuestsPropose(e.target.checked)} className="size-5 accent-ink" />Friends can propose activities</label>
            </fieldset>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-5">
            <h1 className="text-5xl font-extrabold">Start with an idea or two.</h1>
            <p className="text-ink-soft">Optional. These land in your Ideas list so friends have something to vote on right away.</p>
            {starters.map((st, i) => (
              <div key={i} className="grid gap-3 rounded-card border border-line bg-white p-4 sm:grid-cols-[1fr_8rem_6rem_auto]">
                <Field label="Idea"><TextInput value={st.title} onChange={(e) => setStarters((l) => l.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} placeholder="Dinner at a rooftop spot" /></Field>
                <Field label="Type"><Select value={st.category} onChange={(e) => setStarters((l) => l.map((x, j) => (j === i ? { ...x, category: e.target.value } : x)))}>{CATEGORIES.map((c) => <option key={c.id}>{c.id}</option>)}</Select></Field>
                <Field label="$ each"><TextInput inputMode="numeric" value={st.cost} onChange={(e) => setStarters((l) => l.map((x, j) => (j === i ? { ...x, cost: e.target.value.replace(/\D/g, "") } : x)))} placeholder="40" /></Field>
                {starters.length > 1 && <button type="button" aria-label="Remove idea" onClick={() => setStarters((l) => l.filter((_, j) => j !== i))} className="mt-6 grid size-11 place-items-center rounded-full hover:bg-paper-deep"><X className="size-5" aria-hidden /></button>}
              </div>
            ))}
            {starters.length < 2 && <Button variant="soft" onClick={() => setStarters((l) => [...l, { title: "", category: "Outdoors", cost: "" }])}><Plus className="size-4" aria-hidden />Add another idea</Button>}
          </section>
        )}

        <div className="mt-10 flex items-center justify-between gap-3">
          {step > 0 ? <Button variant="ghost" onClick={() => setStep((s) => s - 1)}><ArrowLeft className="size-4" aria-hidden />Back</Button> : <span />}
          {step < 2 ? <Button size="lg" onClick={next}>Next <ArrowRight className="size-5" aria-hidden /></Button> : <Button size="lg" onClick={finish}><Rocket className="size-5" aria-hidden />Create trip</Button>}
        </div>
      </main>
    </div>
  );
}
