import type { ComponentProps } from "react";

const input = "w-full rounded-2xl border-2 border-line bg-white px-4 py-3 text-base text-ink placeholder:text-ink-soft/70 focus:border-ink focus:outline-none focus-visible:outline-none";

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-sm text-ink-soft">{hint}</span>}
      {error && <span role="alert" className="mt-1 block text-sm font-semibold text-[#b3261e]">{error}</span>}
    </label>
  );
}

export const TextInput = (p: ComponentProps<"input">) => <input {...p} className={`${input} ${p.className ?? ""}`} />;
export const TextArea = (p: ComponentProps<"textarea">) => <textarea rows={3} {...p} className={`${input} ${p.className ?? ""}`} />;
export const Select = (p: ComponentProps<"select">) => <select {...p} className={`${input} ${p.className ?? ""}`} />;

/** A tag that can be toggled on and off. */
export function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={selected} onClick={onClick} className={`min-h-10 rounded-full border-2 px-4 text-sm font-bold transition ${selected ? "border-ink bg-ink text-paper" : "border-line bg-white text-ink hover:border-ink/40"}`}>
      {children}
    </button>
  );
}
