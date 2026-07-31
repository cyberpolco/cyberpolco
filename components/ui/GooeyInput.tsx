"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Search } from "lucide-react";

export type GooeyInputClassNames = {
  root?: string;
  filterWrap?: string;
  buttonRow?: string;
  trigger?: string;
  input?: string;
  bubble?: string;
  bubbleSurface?: string;
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function GooeyInput({
  placeholder = "Type to search...",
  className,
  classNames = {},
  collapsedWidth = 115,
  expandedWidth = 200,
  expandedOffset = 50,
  gooeyBlur = 5,
  value,
  defaultValue = "",
  onValueChange,
  onOpenChange,
  disabled = false,
}: {
  placeholder?: string;
  className?: string;
  classNames?: GooeyInputClassNames;
  collapsedWidth?: number;
  expandedWidth?: number;
  expandedOffset?: number;
  gooeyBlur?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}) {
  const filterId = useId();
  const [open, setOpen] = useState(false);
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentValue = value ?? uncontrolled;

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function setOpenState(next: boolean) {
    if (disabled || next === open) return;
    setOpen(next);
    onOpenChange?.(next);
  }

  const bubbleWidth = 40;

  return (
    <div
      className={cx("relative inline-block h-10 select-none", className, classNames.root)}
      style={{ width: open ? expandedWidth : collapsedWidth }}
    >
      <svg className="absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation={gooeyBlur} result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div
        className={cx("absolute inset-0 transition-[width] duration-300 ease-out", classNames.filterWrap)}
        style={{ filter: `url(#${filterId})` }}
      >
        <div
          className={cx(
            "absolute top-0 left-0 h-10 rounded-full bg-brand-blue transition-all duration-300 ease-out",
            classNames.bubbleSurface
          )}
          style={{ width: open ? bubbleWidth : collapsedWidth }}
        />
        <div
          className={cx(
            "absolute top-0 h-10 rounded-full bg-brand-blue transition-all duration-300 ease-out",
            classNames.bubble
          )}
          style={{
            left: expandedOffset,
            width: open ? Math.max(expandedWidth - expandedOffset, 0) : 0,
            opacity: open ? 1 : 0,
          }}
        />
      </div>

      <div className={cx("relative z-10 flex h-10 w-full items-center", classNames.buttonRow)}>
        <button
          type="button"
          aria-label={open ? "Close search" : "Search"}
          aria-expanded={open}
          disabled={disabled}
          onClick={() => setOpenState(!open)}
          className={cx(
            "flex h-10 shrink-0 items-center justify-center rounded-full text-white transition-all duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-50",
            classNames.trigger
          )}
          style={{ width: open ? bubbleWidth : collapsedWidth }}
        >
          <Search className="h-4 w-4" />
        </button>

        <input
          ref={inputRef}
          type="text"
          value={currentValue}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => {
            const next = e.target.value;
            if (value === undefined) setUncontrolled(next);
            onValueChange?.(next);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpenState(false);
          }}
          className={cx(
            "h-10 min-w-0 rounded-full bg-transparent px-3 text-sm text-white placeholder:text-white/70 outline-none transition-opacity duration-300 ease-out",
            classNames.input
          )}
          style={{
            width: open ? Math.max(expandedWidth - expandedOffset, 0) : 0,
            opacity: open ? 1 : 0,
            pointerEvents: open ? "auto" : "none",
          }}
        />
      </div>
    </div>
  );
}
