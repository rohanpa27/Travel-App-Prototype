"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** False during server render and the first client render, then true. Lets pages that read saved data wait for it. */
export function useHydrated(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}
