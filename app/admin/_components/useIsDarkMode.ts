"use client";

import { useEffect, useState } from "react";

/**
 * Charts need literal hex values (recharts fills aren't Tailwind classes),
 * but this app's dark mode is a client-side class toggle on <html>
 * (ThemeToggle.tsx), not an OS media query — so a chart can't just read
 * `prefers-color-scheme`. The lazy initializer reads the class directly
 * during the client render (guarded for SSR, where `document` doesn't
 * exist yet); the effect only subscribes to further changes, so it never
 * calls setState synchronously from the effect body itself.
 */
export function useIsDarkMode(): boolean {
  const [isDark, setIsDark] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains("dark"));
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}
