"use client";

import { useEffect } from "react";
import { trackArticleViewAction } from "@/lib/actions/analytics";

// Fires once per browser session per article — article pages are statically
// generated, so counting has to happen client-side on mount rather than in
// the Server Component (which only runs at build/revalidation time, not per
// visitor).
export default function ArticleViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `viewed:${slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    trackArticleViewAction(slug);
  }, [slug]);

  return null;
}
