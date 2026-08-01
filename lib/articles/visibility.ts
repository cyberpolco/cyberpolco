// The article's "Publish date" doubles as a schedule gate: a future date
// keeps it hidden from the public site (listings, detail page, homepage,
// sitemap) until that date arrives. Admins always see every article
// regardless — this only affects the guest-facing queries/pages.
export function isArticlePublished(date: string, today: string = new Date().toISOString().slice(0, 10)): boolean {
  return date <= today;
}
