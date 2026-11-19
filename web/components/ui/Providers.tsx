"use client";

import { useToasts } from "@/lib/toast";
import { Check } from "lucide-react";

export function Providers({ children }: { children: React.ReactNode }) {
  const toasts = useToasts();
  return (
    <>
      {children}
      <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-24 z-[80] flex flex-col items-center gap-2 px-4 md:bottom-6">
        {toasts.map((t) => (
          <div key={t.id} className="pop-in pointer-events-auto flex max-w-sm items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-paper shadow-soft">
            <Check className="size-4 shrink-0 text-lime" aria-hidden />
            {t.message}
          </div>
        ))}
      </div>
    </>
  );
}
