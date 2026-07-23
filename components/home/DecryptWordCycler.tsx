"use client";

import { useEffect, useState } from "react";

const WORDS = ["LAM", "MAYU", "KIZA", "DJO", "ILO", "FLO"];
const SCRAMBLE_CHARS = "@#$%&01";
const LETTER_STEP_MS = 220;
const SCRAMBLE_TICK_MS = 55;
const HOLD_MS = 1300;
const TRANSITION_MS = 400;

function randomChar() {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

function buildDisplay(word: string, revealed: number) {
  return word
    .split("")
    .map((letter, i) => (i < revealed ? letter : randomChar()))
    .join("");
}

export default function DecryptWordCycler() {
  const [wordIndex, setWordIndex] = useState(0);
  const [display, setDisplay] = useState(() => buildDisplay(WORDS[0], 0));
  const [leaving, setLeaving] = useState(false);

  const word = WORDS[wordIndex];

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setDisplay(word);
      const t = setTimeout(() => {
        setWordIndex((i) => (i + 1) % WORDS.length);
      }, HOLD_MS + 1000);
      return () => clearTimeout(t);
    }

    let cancelled = false;
    let revealed = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    setLeaving(false);
    setDisplay(buildDisplay(word, 0));

    const scrambleInterval = setInterval(() => {
      if (cancelled) return;
      setDisplay(buildDisplay(word, revealed));
    }, SCRAMBLE_TICK_MS);

    word.split("").forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          if (cancelled) return;
          revealed = i + 1;
          setDisplay(buildDisplay(word, revealed));
        }, (i + 1) * LETTER_STEP_MS)
      );
    });

    const revealDuration = word.length * LETTER_STEP_MS;

    timers.push(
      setTimeout(() => {
        if (cancelled) return;
        clearInterval(scrambleInterval);
        setDisplay(word);
      }, revealDuration)
    );

    timers.push(
      setTimeout(() => {
        if (cancelled) return;
        setLeaving(true);
      }, revealDuration + HOLD_MS)
    );

    timers.push(
      setTimeout(() => {
        if (cancelled) return;
        setWordIndex((i) => (i + 1) % WORDS.length);
      }, revealDuration + HOLD_MS + TRANSITION_MS)
    );

    return () => {
      cancelled = true;
      clearInterval(scrambleInterval);
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordIndex]);

  return (
    <span
      key={wordIndex}
      aria-live="polite"
      className={`decrypt-word inline-block min-w-[5ch] font-mono tracking-[0.15em] ${
        leaving ? "decrypt-word-out" : "decrypt-word-in"
      }`}
    >
      {display}
    </span>
  );
}
