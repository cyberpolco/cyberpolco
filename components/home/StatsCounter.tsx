"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_DURATION_MS = 3000;

function parseValue(value: string) {
  const match = value.match(/^(\D*)([\d,]+)(\D*)$/);
  if (!match) return { prefix: "", number: 0, suffix: "" };
  const [, prefix, numStr, suffix] = match;
  return { prefix, number: parseInt(numStr.replace(/,/g, ""), 10), suffix };
}

export default function StatsCounter({
  value,
  durationMs = DEFAULT_DURATION_MS,
}: {
  value: string;
  durationMs?: number;
}) {
  const { prefix, number, suffix } = parseValue(value);
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || number === 0) return;

    let frame: number;

    const animate = () => {
      setDisplay(0);
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / durationMs, 1);
        setDisplay(Math.round(progress * number));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        cancelAnimationFrame(frame);
        animate();
      },
      { threshold: 0.4 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [number, durationMs]);

  return (
    <p ref={ref} className="font-display text-4xl font-bold text-brand-yellow">
      {prefix}
      {number === 0 ? value : display}
      {suffix}
    </p>
  );
}
