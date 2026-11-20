"use client";

/** One switch for "does this trip track money?". Controlled, so the create flow and the trip settings share it. */
export function CostsToggle({ checked, onChange, disabled = false, hint }: { checked: boolean; onChange: (value: boolean) => void; disabled?: boolean; hint?: string }) {
  return (
    <div className="flex items-start gap-4 rounded-card border border-line bg-white p-4">
      <div className="min-w-0 flex-1">
        <p id="costs-toggle-label" className="text-lg font-bold">Track costs</p>
        <p id="costs-toggle-hint" className="text-base text-ink-soft">{hint ?? "Show prices, your share, and who has paid. Turn off to plan without any money."}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby="costs-toggle-label"
        aria-describedby="costs-toggle-hint"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-1 h-8 w-14 shrink-0 rounded-full border-2 border-ink transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${checked ? "bg-lime" : "bg-paper-deep"}`}
      >
        <span aria-hidden className={`absolute top-0.5 size-6 rounded-full border-2 border-ink bg-white transition-all ${checked ? "left-6" : "left-0.5"}`} />
        <span className="sr-only">{checked ? "On" : "Off"}</span>
      </button>
    </div>
  );
}
