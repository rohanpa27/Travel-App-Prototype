"use client";

import { useSyncExternalStore } from "react";

export type Toast = { id: number; message: string };
let toasts: Toast[] = [];
let counter = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/** Shows a short confirmation for simulated and real actions alike. */
export function toast(message: string) {
  const t = { id: ++counter, message };
  toasts = [...toasts, t].slice(-3);
  emit();
  setTimeout(() => {
    toasts = toasts.filter((x) => x.id !== t.id);
    emit();
  }, 3200);
}

const empty: Toast[] = [];
export function useToasts(): Toast[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => toasts,
    () => empty,
  );
}
