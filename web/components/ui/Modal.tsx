"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/** Bottom sheet on phones, centered dialog on larger screens. Closes on Escape or backdrop click. */
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const prev = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    prev.current = document.activeElement;
    const el = ref.current;
    el?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && el) {
        const f = el.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      (prev.current as HTMLElement | null)?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center md:items-center" role="presentation">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} aria-hidden />
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} className="pop-in relative max-h-[92dvh] w-full overflow-y-auto rounded-t-[28px] bg-paper p-6 shadow-soft outline-none md:max-w-lg md:rounded-[28px]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid size-10 shrink-0 place-items-center rounded-full bg-paper-deep hover:bg-line">
            <X className="size-5" aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
