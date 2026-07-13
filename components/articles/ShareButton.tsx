"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function ShareButton({
  title,
  shareLabel,
  copiedLabel,
}: {
  title: string;
  shareLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled the native share sheet — nothing to do
      }
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-brand-dark transition-colors hover:border-brand-red hover:text-brand-red"
    >
      {copied ? <Check size={16} /> : <Share2 size={16} />}
      {copied ? copiedLabel : shareLabel}
    </button>
  );
}
