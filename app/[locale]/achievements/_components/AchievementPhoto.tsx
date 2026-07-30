"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useHasMounted } from "@/components/ui/useHasMounted";

export default function AchievementPhoto({ src, sizes }: { src: string; sizes: string }) {
  const t = useTranslations("achievements");
  const [open, setOpen] = useState(false);
  const mounted = useHasMounted();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setOpen(true)}
        aria-label={t("viewPhoto")}
        className="relative aspect-square w-full overflow-hidden rounded-2xl border border-black/5"
      >
        <Image src={src} alt="" fill sizes={sizes} className="object-cover" />
      </button>

      {open &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
              className="fb-dialog-overlay absolute inset-0 bg-black/80"
              onClick={close}
              aria-hidden="true"
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label={t("viewPhoto")}
              className="fb-dialog-panel relative h-[85vh] w-[90vw] max-w-4xl"
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="90vw"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                className="select-none object-contain"
              />
            </div>
            <button
              type="button"
              ref={closeRef}
              onClick={close}
              aria-label={t("closePhoto")}
              className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white sm:right-6 sm:top-6"
            >
              <X size={22} />
            </button>
          </div>,
          document.body
        )}
    </>
  );
}
