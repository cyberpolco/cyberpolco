"use client";

import { createContext, useCallback, useRef, useState } from "react";
import ToastViewport from "./ToastViewport";
import type { Toast, PushToastOptions } from "./types";

const EXIT_ANIMATION_MS = 150;
const DEFAULT_DURATION_MS = 4000;
const ERROR_DURATION_MS = 6000;

export type ToastContextValue = {
  push: (message: string, options?: PushToastOptions) => string;
  dismiss: (id: string) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const remove = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismiss = useCallback(
    (id: string) => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
      setTimeout(() => remove(id), EXIT_ANIMATION_MS);
    },
    [remove]
  );

  const push = useCallback(
    (message: string, options?: PushToastOptions) => {
      const id = String(nextId.current++);
      const variant = options?.variant ?? "info";
      const duration = options?.duration ?? (variant === "error" ? ERROR_DURATION_MS : DEFAULT_DURATION_MS);

      setToasts((prev) => [...prev, { id, variant, message, duration, exiting: false }]);

      const timer = setTimeout(() => dismiss(id), duration);
      timers.current.set(id, timer);

      return id;
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ push, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
