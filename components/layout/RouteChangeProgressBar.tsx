"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ProgressBar from "@/components/ui/ProgressBar";

const COSMETIC_DURATION_MS = 400;

/**
 * Public nav links aren't centralized (no shared Link wrapper), so there's no
 * true navigation-start signal to hook without wrapping every <Link>. This
 * animates a brief sweep after the pathname commits — a "something changed"
 * cue, not a real pending indicator. Admin has a real one via useLinkStatus.
 */
export default function RouteChangeProgressBar() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setActive(true);
    const timer = setTimeout(() => setActive(false), COSMETIC_DURATION_MS);
    return () => clearTimeout(timer);
  }, [pathname]);

  return <ProgressBar active={active} />;
}
