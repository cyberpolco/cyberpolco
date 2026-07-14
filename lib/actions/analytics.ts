"use server";

import { incrementArticleView, incrementArticleShare } from "@/lib/db/articles";

// Public, unauthenticated actions — any site visitor viewing or sharing an
// article triggers these, not just logged-in admins.

export async function trackArticleViewAction(slug: string) {
  await incrementArticleView(slug);
}

export async function trackArticleShareAction(slug: string) {
  await incrementArticleShare(slug);
}
