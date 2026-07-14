"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";

const COOKIE_NAME = "cp_admin_theme";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export default function ThemeToggle({ initialTheme }: { initialTheme: "light" | "dark" }) {
  const [theme, setTheme] = useState(initialTheme);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    document.cookie = `${COOKIE_NAME}=${next}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-brand-gray hover:bg-brand-blue/10 hover:text-brand-blue dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      {theme === "dark" ? "Turn off dark mode" : "Turn on dark mode"}
    </button>
  );
}
