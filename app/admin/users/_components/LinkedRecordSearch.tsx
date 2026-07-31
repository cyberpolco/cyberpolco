"use client";

import { useEffect, useRef, useState } from "react";
import GooeyInput from "@/components/ui/GooeyInput";

export type LinkedRecordOption = {
  id: string;
  primary: string;
  secondary: string;
  email: string;
};

export default function LinkedRecordSearch({
  name,
  items,
  defaultValue,
  required = true,
  searchPlaceholder,
  emptyLabel,
  onSelect,
}: {
  name: string;
  items: LinkedRecordOption[];
  defaultValue?: string | null;
  required?: boolean;
  searchPlaceholder: string;
  emptyLabel: string;
  onSelect?: (item: LinkedRecordOption) => void;
}) {
  const [selectedId, setSelectedId] = useState(defaultValue ?? "");
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showResults) return;
    function handlePointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [showResults]);

  const selected = items.find((i) => i.id === selectedId);
  const q = query.trim().toLowerCase();
  const results = q
    ? items.filter((i) => i.primary.toLowerCase().includes(q) || i.secondary.toLowerCase().includes(q))
    : items;

  function handleSelect(item: LinkedRecordOption) {
    setSelectedId(item.id);
    setQuery("");
    setShowResults(false);
    onSelect?.(item);
  }

  return (
    <div ref={containerRef} className="relative">
      <input type="text" name={name} value={selectedId} required={required} readOnly className="sr-only" />

      <div className="flex items-center justify-between gap-3 rounded-lg border border-black/10 dark:border-white/15 px-4 py-2 dark:bg-white/5">
        <span
          className={
            selected
              ? "text-sm text-brand-dark dark:text-white"
              : "text-sm text-black/40 dark:text-white/40"
          }
        >
          {selected ? `${selected.primary} — ${selected.secondary}` : emptyLabel}
        </span>

        <GooeyInput
          placeholder={searchPlaceholder}
          value={query}
          onValueChange={(v) => {
            setQuery(v);
            setShowResults(true);
          }}
          onOpenChange={(open) => setShowResults(open)}
          collapsedWidth={40}
          expandedWidth={220}
          expandedOffset={40}
        />
      </div>

      {showResults && (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-brand-dark-2 shadow-lg">
          {results.length === 0 ? (
            <p className="px-4 py-2.5 text-sm text-black/40 dark:text-white/40">No matches.</p>
          ) : (
            results.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className="block w-full px-4 py-2.5 text-left text-sm text-brand-dark hover:bg-brand-blue/10 dark:text-white dark:hover:bg-white/10"
              >
                {item.primary} — {item.secondary}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
