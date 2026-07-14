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
| `DATABASE_URL` | Yes | Neon Postgres connection string — powers the admin panel (articles, jobs, inquiries, applications, settings) |
| `ADMIN_SESSION_SECRET` | Yes | Random secret for signing the admin session cookie — generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH` | Yes (first run only) | Bootstraps the first Super Admin account in the `users` table the first time anyone logs in. After that, these vars are inert — manage all admin accounts from `/admin/users`. Generate the hash with `node -e "console.log(require('bcryptjs').hashSync('YOUR_PASSWORD', 10))"` |
| `RESEND_API_KEY` | No | Enables real email delivery for contact/application notifications. Without it, emails are logged to the server console instead — the site still works end-to-end. |
| `EMAIL_FROM` | No | From-address for outgoing email (defaults to a placeholder) |
| `BLOB_READ_WRITE_TOKEN` | No | Enables Vercel Blob for CV storage. Without it, uploaded CVs are written to `data/uploads/` locally (does **not** persist in production — see below). |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | No | Enables Cloudflare Turnstile CAPTCHA. The widget is omitted from the form until these are set. |

The site is fully functional with **zero** optional variables set — it just
runs in "local/demo" mode for email and file storage.

## What's real vs. what's a documented stand-in

This build prioritizes shipping something that works end-to-end today over
wiring every external service before anyone has created an account for it.
One deliberate substitution remains from the original spec, called out in
code comments at the point of use:

- **Admin auth**: `lib/auth/session.ts` is a lightweight HMAC-signed cookie,
  not Auth.js/NextAuth. Multiple admin accounts and roles are supported
  (see "Admin panel" → "Roles" below) via a `users` table, but there's still
  no registration or OAuth — accounts are created directly by a Super Admin,
  which avoids pulling in a full session/provider framework for a small,
  invite-only team. Swap this module for Auth.js's Credentials provider if
  you need SSO or magic-link login later.

Persistence is real: `lib/db/*.ts` (articles, jobs, inquiries, applications,
settings) uses Neon Postgres via Drizzle ORM — see "Database" below. CV
uploads use Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set, falling back to
local disk (`data/uploads/`) for zero-setup local dev only.

Everything else in the spec (security headers, CSP, rate limiting, Zod
validation, file-type/size checks on CV uploads, FR/EN routing, the Africa
map, the bilingual content) is implemented as specified.

## Database (Neon + Drizzle)

`lib/db/schema.ts` defines six tables (`articles`, `jobs`, `inquiries`,
`applications`, `settings`, `users`) mirroring the types Drizzle infers from
it, and `lib/db/client.ts` opens a `neon-http` connection from
`DATABASE_URL`. `lib/db/articles.ts`, `jobs.ts`, `inquiries.ts`,
`applications.ts`, `settings.ts`, and `users.ts` expose the same typed CRUD
functions pages/server actions always called — only their internals
changed.

Setup for a fresh database:

1. Create a free Neon Postgres database at neon.tech and set `DATABASE_URL`
   in `.env.local` (and in Vercel's env vars for production)
2. `npm run db:migrate` — applies the SQL migrations in `drizzle/` to create
   the tables
3. `npm run db:seed` — inserts the seed articles (`lib/content/articles.ts`)
   and default homepage settings (`lib/content/company.ts`)

After changing `lib/db/schema.ts`, run `npm run db:generate` to produce a new
migration file, then `npm run db:migrate` to apply it.

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
  db/                   Data layer (Neon + Drizzle — see "Database" above)
  actions/              Server actions for admin CRUD
  auth/                 Admin session + credential verification
  validation/           Zod schemas for form input
  rate-limit/           In-memory rate limiter
  email/                Resend wrapper with console fallback
i18n/                   next-intl routing/navigation config
messages/               fr.json / en.json — UI chrome strings
proxy.ts                Locale routing + admin route guard
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

- **Dashboard** — activity overview, plus article view/share insights
  ("most read"/"most shared")
- **Articles** — create/edit/delete, both FR and EN required per article
- **CMS** — everything editable about the site's content, without a redeploy:
  - **Pages** — Home, About, Services, Careers, and Contact page copy
  - **Services** — add/edit/remove the services listed on the site
  - **Footer** — the tagline shown on every page
  - **Settings** — homepage stats and social media links
- **Jobs** — create/edit/delete, open/closed status (Careers page shows
  "no openings" automatically when none are open)
- **Applications** — hiring decision board (Kanban), CV downloads, notes
- **Inquiries** — contact form submissions, mark read/unread
- **Users** — manage admin accounts and roles (Super Admin only)

### Roles

Every admin account has exactly one role, set in `/admin/users`:

| Role | Can access |
|---|---|
| Super Admin | Everything, including Users |
| Content Editor | Articles, CMS |
| HR / Recruiter | Jobs, Applications |
| Viewer | Dashboard only, read-only |

New accounts are created with a temporary password chosen by a Super
Admin and must change it on first login. There is no email-invite flow —
the Super Admin communicates the temporary password directly.

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
