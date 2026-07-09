# Cyber PolCo — Website

Bilingual (FR/EN) corporate website for Cyber PolCo: services, articles, careers,
contact, and a custom admin panel — built with Next.js, TypeScript, and Tailwind.

This README covers local setup, what's real vs. a documented placeholder, and
the upgrade paths described in the project's technical spec
(`cyberpolco-website-spec.md`).

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

Visit `http://localhost:3000` — it redirects to `/fr`. Admin panel is at
`/admin/login`.

## Required environment variables

Set these in `.env.local` for local dev, and in Vercel's dashboard for
production (Settings → Environment Variables).

| Variable | Required | Purpose |
|---|---|---|
| `ADMIN_EMAIL` | Yes | The one admin account's email |
| `ADMIN_PASSWORD_HASH` | Yes | bcrypt hash of the admin password — generate with `node -e "console.log(require('bcryptjs').hashSync('YOUR_PASSWORD', 10))"` |
| `ADMIN_SESSION_SECRET` | Yes | Random secret for signing the admin session cookie — generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `RESEND_API_KEY` | No | Enables real email delivery for contact/application notifications. Without it, emails are logged to the server console instead — the site still works end-to-end. |
| `EMAIL_FROM` | No | From-address for outgoing email (defaults to a placeholder) |
| `BLOB_READ_WRITE_TOKEN` | No | Enables Vercel Blob for CV storage. Without it, uploaded CVs are written to `data/uploads/` locally (does **not** persist in production — see below). |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | No | Enables Cloudflare Turnstile CAPTCHA. The widget is omitted from the form until these are set. |

The site is fully functional with **zero** optional variables set — it just
runs in "local/demo" mode for email and file storage.

## What's real vs. what's a documented stand-in

This build prioritizes shipping something that works end-to-end today over
wiring every external service before anyone has created an account for it.
Two deliberate substitutions from the original spec, both called out in code
comments at the point of use:

1. **Persistence**: `lib/db/store.ts` is a JSON-file-based data store
   (`data/db/*.json`), not Neon Postgres + Drizzle. It powers the entire
   admin panel (articles, jobs, inquiries, applications, settings) and works
   great for local development. **It will not persist across deploys on
   Vercel**, whose filesystem is ephemeral outside `/tmp`. See "Upgrading to
   production persistence" below before you rely on the admin panel in
   production.

2. **Admin auth**: `lib/auth/session.ts` is a lightweight HMAC-signed cookie,
   not Auth.js/NextAuth. There's exactly one admin account with no
   registration, roles, or OAuth, so this avoids pulling in a full session
   framework for a single credential pair. See "Upgrading admin auth" if you
   need multiple admins or SSO later.

Everything else in the spec (security headers, CSP, rate limiting, Zod
validation, file-type/size checks on CV uploads, FR/EN routing, the Africa
map, the bilingual content) is implemented as specified.

## Upgrading to production persistence (Neon + Drizzle)

Before the admin panel is used in production:

1. Create a free Neon Postgres database at neon.tech
2. `npm install drizzle-orm @neondatabase/serverless drizzle-kit --save`
3. Define schemas mirroring the shapes in `lib/db/*.ts` (`Article`, `Job`,
   `Inquiry`, `Application`, `SiteSettings` — the types are already there to
   copy from)
4. Replace the bodies of `lib/db/articles.ts`, `jobs.ts`, `inquiries.ts`,
   `applications.ts`, and `settings.ts` with Drizzle queries. Every function
   in those files has the same signature it'll need after the swap — nothing
   that imports them (pages, server actions) needs to change.
5. Add `DATABASE_URL` to your environment variables

## Upgrading rate limiting (Upstash)

`lib/rate-limit/index.ts` is in-memory, which doesn't survive across
serverless invocations. For real protection in production:

```bash
npm install @upstash/ratelimit @upstash/redis
```

Swap `checkRateLimit`'s implementation for `@upstash/ratelimit`'s `.limit()`
call — same signature, so `app/api/contact/route.ts` and
`app/api/apply/route.ts` don't need to change.

## Enabling CAPTCHA (Cloudflare Turnstile)

1. Create a free Turnstile site at the Cloudflare dashboard
2. Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`
3. Add the Turnstile script + widget to `components/forms/ContactForm.tsx`
   and `ApplicationForm.tsx` (marked with a comment at the right spot)
4. Verify the token server-side in `app/api/contact/route.ts` /
   `app/api/apply/route.ts` (also marked with a comment) against
   `https://challenges.cloudflare.com/turnstile/v0/siteverify`

## Adding the brand fonts

Infinite Justice and Telegraf are licensed Canva/dafont assets and can't be
fetched automatically in this build environment. To enable them:

1. Export/convert both fonts to `.woff2`
2. Add them to `/public/fonts/`
3. Uncomment the `@font-face` rules at the top of `app/globals.css`

Until then, headings gracefully fall back to a bold system stack, so the
site looks intentional either way. Poppins (body text) is already wired up
via Google Fonts.

## Adding real photography / logos

Every image slot (hero, service icons, article thumbnails, team photo)
currently uses the Cyber PolCo logo under a generic filename in
`/public/images/`:

- `placeholder-hero.png`
- `placeholder-service.png`
- `placeholder-article.png`
- `placeholder-team.png`
- `placeholder-client-logo.png`

Drop a real image in with the **same filename** to replace it — no code
changes needed.

## Project structure

```
app/
  [locale]/            Public site (fr/en) — home, services, about,
                        articles, careers, contact, privacy, terms
  admin/                Admin panel (auth-gated, bilingual UI)
  api/                  Contact + application form handlers
components/
  layout/               Header, Footer, LocaleSwitcher
  home/                 AfricaMap (the interactive presence map)
  forms/                ContactForm, ApplicationForm
lib/
  content/              Bilingual content: services, articles, company info
  db/                   Data layer (JSON store — see "Upgrading" above)
  actions/              Server actions for admin CRUD
  auth/                 Admin session + credential verification
  validation/           Zod schemas for form input
  rate-limit/           In-memory rate limiter
  email/                Resend wrapper with console fallback
i18n/                   next-intl routing/navigation config
messages/               fr.json / en.json — UI chrome strings
middleware.ts           Locale routing + admin route guard
next.config.ts          Security headers (CSP, HSTS, etc.) + next-intl plugin
```

## Deployment

The repo is already linked to Vercel (`cyberpolco.vercel.app`). Every push to
`main` triggers a build; every PR gets a preview URL automatically.

1. Push this code to `github.com/cyberpolco/cyberpolco`
2. In Vercel, set the environment variables listed above
3. When ready, attach the custom domain in Vercel's dashboard

## Admin panel

Go to `/admin/login`. Manage:

- **Articles** — create/edit/delete, both FR and EN required per article
- **Jobs** — create/edit/delete, open/closed status (Careers page shows
  "no openings" automatically when none are open)
- **Inquiries** — contact form submissions, mark read/unread
- **Applications** — job applications with CV download links
- **Settings** — homepage stats and social links, editable without a
  redeploy

## Legal content

Draft Privacy Policy and Terms of Use live in `lib/content/legal.ts`,
grounded in the DRC's Malabo Convention commitments and Namibia's
constitutional privacy right and pending Data Protection Bill. **This is a
starting draft, not legal advice** — have it reviewed by local counsel
before publishing, especially since Namibia's law may pass while the site
is live.

## Full spec

See `cyberpolco-website-spec.md` for the original architecture, security
requirements, and page-by-page content spec this build was built from.
