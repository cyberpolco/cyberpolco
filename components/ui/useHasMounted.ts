"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

/** True only once mounted client-side — for portals that must not render during SSR/hydration. */
export function useHasMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
