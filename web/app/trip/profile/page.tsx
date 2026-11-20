"use client";

import { useState } from "react";
import { Check, Eye } from "lucide-react";
import { AIRPORTS, AVATARS, INTERESTS } from "@/lib/constants";
import { dispatch, useAppState } from "@/lib/store";
import { costsOn, currentUser, isHost, members } from "@/lib/selectors";
import { toast } from "@/lib/toast";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Chip, Field, Select, TextInput } from "@/components/ui/Field";
import { ResetDemoButton } from "@/components/trip/ResetDemoButton";
import { CostsToggle } from "@/components/trip/CostsToggle";
import type { Budget } from "@/lib/types";

export default function Profile() {
  const s = useAppState();
  const me = currentUser(s);
  // Key the editor on the viewer so switching people loads their saved values.
  return (
    <div className="space-y-10">
      <h1 className="text-5xl font-extrabold">Profile</h1>
      <Editor key={me.id} />
      <section aria-labelledby="viewas" className="space-y-3">
        <h2 id="viewas" className="text-3xl font-extrabold">View the trip as</h2>
        <p className="text-ink-soft">Try the trip from a friend&apos;s seat. Only the organizer can confirm or cancel activities.</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {members(s).map((u) => (
            <li key={u.id}>
              <button type="button" aria-pressed={u.id === me.id} onClick={() => { dispatch({ type: "setViewer", userId: u.id }); toast(`Now viewing as ${u.name}`); }} className={`flex min-h-14 w-full items-center gap-3 rounded-2xl border-2 p-2 pr-4 text-left font-bold ${u.id === me.id ? "border-ink bg-brand-soft" : "border-line bg-white"}`}>
                <Avatar user={u} size="md" decorative />
                <span className="flex-1">{u.name}{u.id === s.trip.hostId && <span className="font-normal text-ink-soft"> · organizer</span>}</span>
                {u.id === me.id ? <Check className="size-5" aria-hidden /> : <Eye className="size-5 text-ink-soft" aria-hidden />}
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="trip-settings" className="space-y-3">
        <h2 id="trip-settings" className="text-3xl font-extrabold">Trip settings</h2>
        <CostsToggle
          checked={costsOn(s)}
          disabled={!isHost(s)}
          onChange={(value) => { dispatch({ type: "setShowCosts", value }); toast(value ? "Costs turned on" : "Costs turned off. Saved prices are kept."); }}
          hint={isHost(s) ? "Show prices, your share, and who has paid. Turn off to plan without any money. Saved prices come back if you turn it on again." : "Only the organizer can change this. Switch to the organizer above to try it."}
        />
      </section>
      <section className="space-y-3 border-t border-line pt-6">
        <h2 className="text-3xl font-extrabold">Demo controls</h2>
        <p className="text-ink-soft">Everything you do is stored in this browser only. Nothing is sent anywhere.</p>
        <ResetDemoButton />
      </section>
    </div>
  );
}

function Editor() {
  const s = useAppState();
  const me = currentUser(s);
  const [name, setName] = useState(me.name);
  const [error, setError] = useState("");

  function save() {
    if (!name.trim()) return setError("Your name can't be empty");
    setError("");
    dispatch({ type: "updateUser", id: me.id, patch: { name: name.trim() } });
    toast("Profile saved");
  }
  const toggle = (i: string) => dispatch({ type: "updateUser", id: me.id, patch: { interests: me.interests.includes(i) ? me.interests.filter((x) => x !== i) : [...me.interests, i] } });

  return (
    <section className="space-y-5 rounded-card border border-line bg-white p-5 shadow-soft">
      <div className="flex items-end gap-3">
        <Avatar user={me} size="xl" />
        <div className="flex-1"><Field label="Name" error={error}><TextInput value={name} onChange={(e) => setName(e.target.value)} onBlur={save} /></Field></div>
      </div>
      <Button size="sm" onClick={save}>Save name</Button>
      <fieldset>
        <legend className="mb-2 text-sm font-bold">Avatar</legend>
        <div className="flex flex-wrap gap-2">{AVATARS.map((a) => <button key={a} type="button" aria-pressed={me.avatarUrl === a} aria-label={`Avatar ${a.split("/").pop()?.replace(".svg", "")}`} onClick={() => dispatch({ type: "updateUser", id: me.id, patch: { avatarUrl: a } })} className={`rounded-full ${me.avatarUrl === a ? "ring-4 ring-ink" : ""}`}><Avatar user={{ name: "", avatarUrl: a }} size="md" ring={false} /></button>)}</div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Flying from"><Select value={me.homeAirport ?? ""} onChange={(e) => dispatch({ type: "updateUser", id: me.id, patch: { homeAirport: e.target.value || undefined, homeCity: e.target.value ? AIRPORTS[e.target.value] : undefined } })}><option value="">Not set</option>{Object.entries(AIRPORTS).map(([c, city]) => <option key={c} value={c}>{city} ({c})</option>)}</Select></Field>
        {costsOn(s) && <Field label="Spending style"><Select value={me.budgetPreference ?? ""} onChange={(e) => dispatch({ type: "updateUser", id: me.id, patch: { budgetPreference: (e.target.value || undefined) as Budget | undefined } })}><option value="">No preference</option><option value="budget">Budget-friendly</option><option value="moderate">Moderate</option><option value="premium">Treat ourselves</option></Select></Field>}
      </div>
      <fieldset>
        <legend className="mb-2 text-sm font-bold">Interests (these shape your group&apos;s suggestions)</legend>
        <div className="flex flex-wrap gap-2">{INTERESTS.map((i) => <Chip key={i} selected={me.interests.includes(i)} onClick={() => toggle(i)}>{i}</Chip>)}</div>
      </fieldset>
    </section>
  );
}
