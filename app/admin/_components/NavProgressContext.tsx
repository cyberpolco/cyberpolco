"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type NavProgressContextValue = {
  active: boolean;
  report: (id: string, pending: boolean) => void;
};

const NavProgressContext = createContext<NavProgressContextValue | null>(null);

export function NavProgressProvider({ children }: { children: React.ReactNode }) {
  const pendingIds = useRef(new Set<string>());
  const [active, setActive] = useState(false);

  const report = useCallback((id: string, pending: boolean) => {
    if (pending) pendingIds.current.add(id);
    else pendingIds.current.delete(id);
    setActive(pendingIds.current.size > 0);
  }, []);

  return (
    <NavProgressContext.Provider value={{ active, report }}>{children}</NavProgressContext.Provider>
  );
}

export function useNavProgress() {
  const ctx = useContext(NavProgressContext);
  if (!ctx) {
    throw new Error("useNavProgress must be used within a NavProgressProvider");
  }
  return ctx;
}
