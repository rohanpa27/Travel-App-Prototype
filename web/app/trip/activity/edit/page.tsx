"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES, ROUTES, THEMES } from "@/lib/constants";
import { dispatch, newId, useAppState } from "@/lib/store";
import { toast } from "@/lib/toast";
import { activitySchema, toFieldErrors, type FieldErrors } from "@/lib/schemas";
import type { Activity } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Field, Select, TextArea, TextInput } from "@/components/ui/Field";

function Form() {
  const router = useRouter();
  const id = useSearchParams().get("id");
  const s = useAppState();
  const existing = s.activities.find((a) => a.id === id);
  // Key by id so the form re-initialises if the target activity changes.
  return <ActivityForm key={existing?.id ?? "new"} existing={existing} router={router} />;
}

function ActivityForm({ existing, router }: { existing?: Activity; router: ReturnType<typeof useRouter> }) {
  const s = useAppState();
  const [v, setV] = useState({
    title: existing?.title ?? "",
    category: existing?.category ?? "Food",
    date: existing?.date ?? s.trip.startDate,
    timeTbd: existing ? existing.timeStatus === "tbd" : false,
    startTime: existing?.startTime ?? "",
    endTime: existing?.endTime ?? "",
    address: existing?.address ?? "",
    cost: existing?.estimatedCostPerPerson?.toString() ?? "",
    link: existing?.externalUrl ?? "",
    deadline: existing?.reservationDeadline ?? "",
    capacity: existing?.capacity?.toString() ?? "",
    notes: existing?.description ?? "",
    image: existing?.imageUrl ?? "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const text = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setV((x) => ({ ...x, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = activitySchema.safeParse(v);
    if (!r.success) return setErrors(toFieldErrors(r.error));
    const d = r.data;
    const patch: Omit<Activity, "id" | "tripId" | "createdBy" | "status"> = {
      title: d.title,
      category: d.category,
      description: d.notes || undefined,
      date: d.date || undefined,
      timeStatus: d.timeTbd || !d.startTime ? "tbd" : "scheduled",
      startTime: d.timeTbd ? undefined : d.startTime || undefined,
      endTime: d.timeTbd ? undefined : d.endTime || undefined,
      address: d.address || undefined,
      imageUrl: v.image || undefined,
      externalUrl: d.link || undefined,
      estimatedCostPerPerson: d.cost ? Number(d.cost) : undefined,
      capacity: d.capacity ? Number(d.capacity) : undefined,
      reservationDeadline: d.deadline || undefined,
    };
    if (existing) {
      dispatch({ type: "updateActivity", id: existing.id, patch });
      toast("Changes saved");
      router.push(`${ROUTES.activity}?id=${existing.id}`);
    } else {
      const id = newId("a");
      // Without a day or a time it starts as an idea; otherwise it is proposed for the group to vote on.
      const status = patch.date && patch.timeStatus === "scheduled" ? "proposed" : "idea";
      dispatch({ type: "addActivity", activity: { id, tripId: s.trip.id, createdBy: s.currentUserId, status, ...patch } });
      toast(status === "idea" ? "Added to Ideas. Now the group can weigh in." : "Proposed. Now the group can weigh in.");
      router.push(`${ROUTES.activity}?id=${id}`);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-5xl font-extrabold">{existing ? "Edit activity" : "Propose an activity"}</h1>
      <Field label="What's the plan?" error={errors.title}><TextInput value={v.title} onChange={text("title")} placeholder="Sunset architecture cruise" autoFocus /></Field>
      <Field label="Type"><Select value={v.category} onChange={text("category")}>{CATEGORIES.map((c) => <option key={c.id}>{c.id}</option>)}</Select></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Day" error={errors.date}><TextInput type="date" value={v.date} min={s.trip.startDate} max={s.trip.endDate} onChange={text("date")} /></Field>
        <label className="mt-7 flex min-h-12 items-center gap-3 font-bold"><input type="checkbox" checked={v.timeTbd} onChange={(e) => setV((x) => ({ ...x, timeTbd: e.target.checked }))} className="size-5 accent-ink" />Time TBD</label>
      </div>
      {!v.timeTbd && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Starts"><TextInput type="time" value={v.startTime} onChange={text("startTime")} /></Field>
          <Field label="Ends (optional)" error={errors.endTime}><TextInput type="time" value={v.endTime} onChange={text("endTime")} /></Field>
        </div>
      )}
      <Field label="Address"><TextInput value={v.address} onChange={text("address")} placeholder="112 E Wacker Dr, Chicago" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Cost per person ($)" error={errors.cost}><TextInput inputMode="decimal" value={v.cost} onChange={text("cost")} placeholder="50" /></Field>
        <Field label="Capacity" error={errors.capacity} hint="Leave empty for no limit."><TextInput inputMode="numeric" value={v.capacity} onChange={text("capacity")} placeholder="8" /></Field>
      </div>
      <Field label="Link" error={errors.link}><TextInput type="url" value={v.link} onChange={text("link")} placeholder="https://" /></Field>
      <Field label="Reservation deadline"><TextInput type="date" value={v.deadline} onChange={text("deadline")} /></Field>
      <Field label="Notes"><TextArea value={v.notes} onChange={text("notes")} placeholder="Anything the group should know" /></Field>
      <fieldset>
        <legend className="mb-2 text-sm font-bold">Cover (optional)</legend>
        <div className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={!v.image} onClick={() => setV((x) => ({ ...x, image: "" }))} className={`min-h-10 rounded-full border-2 px-4 text-sm font-bold ${!v.image ? "border-ink bg-ink text-paper" : "border-line bg-white"}`}>None</button>
          {THEMES.map((t) => (
            <button key={t.id} type="button" aria-pressed={v.image === t.cover} aria-label={`${t.name} cover`} onClick={() => setV((x) => ({ ...x, image: t.cover }))} className={`overflow-hidden rounded-xl border-2 ${v.image === t.cover ? "border-ink shadow-pop" : "border-line"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.cover} alt="" className="h-12 w-16 object-cover" />
            </button>
          ))}
        </div>
      </fieldset>
      <div className="flex gap-3 pt-2">
        <Button type="submit" size="lg" className="flex-1">{existing ? "Save changes" : "Propose to the group"}</Button>
        <Button variant="ghost" size="lg" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}

export default function EditActivityPage() {
  return <Suspense fallback={null}><Form /></Suspense>;
}
