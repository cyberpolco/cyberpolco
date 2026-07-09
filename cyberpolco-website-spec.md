# Cyber PolCo — Website Specification
**Version 1.0 — July 2026**
Repo: `cyberpolco/cyberpolco` · Deploy: Vercel (`cyberpolco.vercel.app`, custom domain later)

---

## 1. Summary of Decisions

| Decision | Choice |
|---|---|
| Default language | **French**, with EN toggle on every page |
| Careers page | Admin-managed real openings only — **no** generic "submit your interest" form when empty |
| Homepage stats | Real/verifiable facts only (founding date, countries, founder) — **no** financial projections |
| Admin CMS | Custom-built (no third-party CMS subscription) |
| Career applications | On-site form **with CV/resume upload** |
| Hosting | Vercel, deployed from `cyberpolco/cyberpolco`, domain added later |

---

## 2. Technical Architecture

**Stack**
- **Next.js 15 (App Router)** + **TypeScript**
- **Tailwind CSS** for styling, using the brand tokens below
- **next-intl** for FR/EN routing (`/fr/...` and `/en/...`, French as default/root fallback)
- **Neon Postgres** (serverless, free tier) as the database
- **Drizzle ORM** for type-safe DB access and migrations
- **Auth.js (NextAuth)** — credentials-based login, single `admin` role, no public registration
- **Vercel Blob** — CV/resume uploads, article images
- **Resend** — transactional email (contact form, application notifications)
- **Cloudflare Turnstile** — CAPTCHA on public forms
- **Upstash Redis** — rate limiting on API routes
- **react-simple-maps** (d3-geo under the hood) — interactive Africa map, SVG-based, no API key required

**Why this stack:** everything runs on free tiers to start, lives in one repo, and avoids recurring CMS costs — appropriate for a pre-revenue company. It scales cleanly (upgrade Neon/Vercel Blob/Resend tiers) without re-architecting.

---

## 3. Security Requirements

| Area | Implementation |
|---|---|
| **Headers** | `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` — set via `next.config.js` headers or `middleware.ts` |
| **CSP** | Default-src 'self'; explicit allowlist for Vercel Blob, Resend webhook origins, Turnstile script/frame origins, fonts |
| **Rate limiting** | Per-IP limits on `/api/contact`, `/api/apply`, `/api/admin/login` via Upstash (e.g. 5 req/min) |
| **CAPTCHA** | Turnstile on contact form and job application form |
| **Input validation** | Zod schemas on every API route (server-side), mirrored client-side with react-hook-form |
| **File upload safety** | CV uploads restricted to PDF/DOCX, size-capped (~5MB), server-side MIME sniffing (not just extension check), stored in Vercel Blob with randomized keys |
| **Auth** | Hashed credentials (bcrypt/argon2) or magic-link, session via secure HTTP-only cookies, no public sign-up route exists at all |
| **Admin routes** | Protected by middleware checking session + role, all admin API routes re-verify server-side (never trust client role) |
| **CSRF** | Same-site cookies + Auth.js built-in CSRF protection on admin forms |
| **Secrets** | All API keys (Resend, Neon, Turnstile, Blob) in Vercel environment variables, never in repo |
| **Dependency hygiene** | Dependabot / `npm audit` in CI |
| **Logging** | No sensitive data (passwords, full CVs) in logs; inquiry data only in DB, access-controlled |

---

## 4. Internationalization (FR/EN)

- URL structure: `cyberpolco.com/fr/...` (default) and `cyberpolco.com/en/...`
- Root `/` redirects to `/fr`
- Language switcher persists selection across navigation (cookie-based)
- All static copy in `messages/fr.json` / `messages/en.json`
- Admin-authored content (articles, job posts) requires **both** FR and EN fields — admin panel enforces both before publishing, or allows saving a draft in one language with a "missing translation" flag

---

## 5. Site Map / Page Inventory

### Public pages (each exists in FR + EN = 2 URLs)

| # | Page | Notes |
|---|---|---|
| 1 | Home | Hero, mission/vision, interactive Africa map, services overview, real stats, client logos, latest 3 articles, CTA |
| 2 | Services (overview) | Cards linking to the 5 service pages below |
| 3 | Service: Cybersecurity Consulting | |
| 4 | Service: SOC/MSSP (Security Operations Center / Managed Security Service Provider) | |
| 5 | Service: Trainings / Awareness Programs | |
| 6 | Service: Background Checks | |
| 7 | Service: Other Services | Catch-all page for additional/emerging offerings not covered above |
| 8 | About | Company story, mission, vision, leadership (Léon Atunakou), sector context |
| 9 | Articles (listing) | Filter/search, paginated |
| 10 | Article detail (dynamic `[slug]`) | One template, N articles |
| 11 | Careers (listing) | Admin-managed openings; empty state = "No open positions right now" (no interest form) |
| 12 | Career detail (dynamic `[slug]`) | Job description + on-site application form (CV upload) |
| 13 | Contact | Form (name, company, position, work email address, subject, message) + CAPTCHA, office info, social links, embedded map pin |
| 14 | Privacy Policy | Required for GDPR-style compliance given form data collection |
| 15 | Terms of Use | |

**Total public URLs:** 15 templates × 2 languages = 30, plus one URL per article and per job posting (dynamic, admin-created).

### Admin (auth-gated, not in public nav, **bilingual UI — both FR and EN**)

| Page | Function |
|---|---|
| Login | Credentials/magic-link |
| Dashboard | Stats overview: page views (if analytics wired in), inquiry count, application count, published articles/jobs |
| Articles manager | List, create, edit, delete, publish/draft (FR + EN fields) |
| Jobs manager | List, create, edit, delete, open/closed status (FR + EN fields) |
| Inquiries inbox | View contact form submissions, mark read/archived |
| Applications inbox | View job applications, download CVs |
| Site content editor | Edit specific homepage fields (stats numbers, client logos, social links) without a redeploy |

---

## 6. Interactive Africa Map — Spec

- Library: `react-simple-maps` with a public Africa TopoJSON
- Country states (by ISO code):
  - 🇨🇩 DRC (`COD`) — **Blue** — "Physical Presence" — click/hover shows Mbujimayi office info
  - 🇳🇦 Namibia (`NAM`) — **Blue** — "Physical Presence" — click/hover shows Windhoek office info
  - 🇿🇦 South Africa (`ZAF`) — **Yellow** — "Online Presence"
  - 🇦🇴 Angola (`AGO`) — **Yellow** — "Online Presence"
  - All other African countries — neutral gray fill, hover tooltip: **"Not yet"**
- Interaction: hover = tooltip; click on an active country (blue/yellow) = scroll to or link to relevant service/contact info
- Fully keyboard-accessible fallback: a text list of countries below the map for screen readers (map SVGs are not reliably accessible alone)
- Responsive: simplified list-view fallback on small mobile widths if the SVG becomes too cramped

---

## 7. Brand System

| Token | Value | Use |
|---|---|---|
| Blue | `#626fda` | Primary brand, "Physical Presence" map color, links |
| Red | `#e3484f` | Accent, alerts, headings emphasis |
| Yellow/Orange | `#e69c3f` | Secondary accent, "Online Presence" map color |
| Dark Blue | `#2f3555` | Dark backgrounds, footer |
| Gray | `#424242` | Body text, neutral map fill |
| Display font | Infinite Justice | Logo/hero only — **licensing confirmed for use** |
| Heading font | Telegraf | H1–H3 |
| Body font | Poppins | Body copy, forms, nav |

Assets already available: logo (`logo.png`), email signature (`Leon_Email_Signature.png`), site photos (`DSC_9696`, `DSC_9711`).

---

## 8. Content Sources (already in project, ready to adapt)

- Business plan → mission, vision, services, leadership bio, sector context
- Existing article drafts → AI, VPNs, Siri, Cyberbullying, Digital Footprint, International Data Privacy, World Backup Day, Who's Spying on Me, Cyber Security Awareness Month — these become the initial Articles library (need FR translations written, as they're currently EN-only)
- **Placeholder imagery:** until final photography/graphics are ready, all image slots (hero, service icons, article thumbnails, team photo, client logo grid) will use the Cyber PolCo logo under generic filenames (e.g. `placeholder-hero.png`, `placeholder-service-1.png`, `placeholder-article-1.png`) so every slot is visibly wired up and easy to swap later — just drop a real image in with the same filename to replace it

---

## 9. Folder Structure (proposed)

```
cyberpolco/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx                 # Home
│   │   ├── services/
│   │   │   ├── page.tsx
│   │   │   ├── consulting/page.tsx
│   │   │   ├── soc-mssp/page.tsx
│   │   │   ├── trainings/page.tsx
│   │   │   ├── background-checks/page.tsx
│   │   │   └── other-services/page.tsx
│   │   ├── about/page.tsx
│   │   ├── articles/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── careers/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── privacy/page.tsx
│   │   └── terms/page.tsx
│   ├── admin/
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── articles/...
│   │   ├── jobs/...
│   │   ├── inquiries/page.tsx
│   │   ├── applications/page.tsx
│   │   └── settings/page.tsx
│   └── api/
│       ├── contact/route.ts
│       ├── apply/route.ts
│       └── admin/...
├── components/
│   ├── layout/ (Header, Footer, LocaleSwitcher)
│   ├── home/ (Hero, AfricaMap, StatsBlock, ServicesGrid, ArticlePreview)
│   ├── forms/ (ContactForm, ApplicationForm)
│   └── admin/
├── lib/
│   ├── db/ (drizzle schema + client)
│   ├── auth/
│   ├── email/
│   ├── validation/ (zod schemas)
│   └── rate-limit/
├── messages/
│   ├── fr.json
│   └── en.json
├── public/
│   ├── logo.png
│   ├── images/
│   └── data/africa.topojson
├── middleware.ts                    # locale routing + admin auth guard
├── next.config.js                   # security headers
└── drizzle/                         # migrations
```

---

## 10. Deployment Workflow

1. Push to `main` on `github.com/cyberpolco/cyberpolco`
2. Vercel auto-builds and deploys on every push (already linked to `cyberpolco.vercel.app`)
3. **Recommended addition:** branch previews — every PR gets its own preview URL automatically (Vercel default behavior) so you can review changes before merging to `main`
4. Environment variables (Neon connection string, Resend key, Turnstile keys, Upstash keys, Auth secret) set in Vercel dashboard, not committed
5. When ready: attach custom domain in Vercel → DNS records at your registrar

**Global footer requirement:** every public page's footer ends with `© Cyber PolCo 2026. All rights reserved.` (localized as `© Cyber PolCo 2026. Tous droits réservés.` on the FR version), below the nav links, social icons, and legal page links.

---

## 11. Future Scalability

- Add analytics (Vercel Analytics or Plausible) to power real homepage stats over time
- Swap the custom admin's article editor for a richer WYSIWYG (Tiptap) as content volume grows
- If hiring picks up, the careers module already supports multiple simultaneous listings
- If client volume grows, the "client logos" section can move from a static array to an admin-managed table
- Multi-region DB read replicas if traffic grows regionally (SADC-wide)
- Add a French AND Portuguese option later if Angola engagement grows (Portuguese is Angola's official language) — worth keeping in mind since next-intl scales to more locales easily

---

## 12. Social & Contact Channels (confirmed)

| Channel | Handle / Link |
|---|---|
| X (Twitter) | [www.x.com/cyber_polco](https://www.x.com/cyber_polco) |
| LinkedIn | [www.linkedin.com/company/cyberpolco](https://www.linkedin.com/company/cyberpolco) |
| TikTok | [www.tiktok.com/@cyberpolco](https://www.tiktok.com/@cyberpolco) |
| YouTube | [www.youtube.com/cyberpolco](https://www.youtube.com/cyberpolco) |
| GitHub | [www.github.com/cyberpolco](https://www.github.com/cyberpolco) |
| WhatsApp (DRC) | +243 82 811 77 10 |
| WhatsApp (Namibia) | +264 81 23 14 352 |
| WhatsApp Channel | [Cyber PolCo channel](https://whatsapp.com/channel/0029VaZmU8sDZ4LfWF6YTe1G) |
| WhatsApp handle | @cyberpolco (reserved) |

**Where these appear:**
- **Footer** (every page): icon row linking to X, LinkedIn, TikTok, YouTube, GitHub, WhatsApp channel
- **Contact page**: full list above, plus both WhatsApp numbers as click-to-chat links (`https://wa.me/243828117710` / `https://wa.me/264812314352`, formatted per WhatsApp's international dialing convention)
- **Admin-manageable**: these live in the "Site content editor" (Section 5) as editable fields, not hardcoded, so they can be updated without a redeploy if a handle ever changes

---

## 13. Draft Legal Text — Privacy Policy & Terms of Use

*Drafted to align with the regulatory environment in Cyber PolCo's two physical-presence markets, based on what's already in the project (DRC's National Cybersecurity Strategy) plus current public regulatory status in Namibia (checked live, since this changes frequently). **This is a starting draft, not legal advice** — have it reviewed by DRC/Namibian counsel before publishing, especially since Namibia's law is actively in motion.*

**Regulatory grounding:**
- **DRC**: No single comprehensive data-protection statute is yet in force. The national strategy commits DRC to ratifying the **African Union Convention on Cyber Security and Personal Data Protection ("Malabo Convention," 2014)** and to creating a national personal-data-protection authority alongside the planned "Code du Numérique." Our policy is written to already meet Malabo Convention-style principles (lawfulness, purpose limitation, data subject rights) so Cyber PolCo is ahead of the local framework rather than waiting on it.
- **Namibia**: There is currently **no enacted, comprehensive data protection act** — only sector-specific rules and the constitutional privacy right (Article 13 of the Namibian Constitution). A **Data Protection Bill** has been through drafting and is moving toward Parliament, but is not yet law as of writing. Our policy is written to already comply with what that bill would require (a supervisory authority, controller/processor obligations, data subject rights) so no rework is needed once it passes.

---

### Privacy Policy (draft — English master, translate to FR for the `/fr` route)

**Last updated:** [date of publication]

Cyber PolCo ("we," "us," "our") respects your privacy. This policy explains what personal data we collect through cyberpolco.com, why, and your rights over it.

**1. Data we collect**
- Contact form: name, company, position, work email address, subject, message
- Career applications: name, contact details, CV/resume file, cover message
- Automatically: standard server logs (IP address, browser type) for security purposes only

**2. Why we collect it**
- To respond to inquiries about our services (consulting, SOC/MSSP, trainings, background checks, other services)
- To evaluate job applications
- To maintain the security and integrity of our systems

**3. Legal basis and principles**
We process personal data lawfully, fairly, and transparently; only for the specific purpose collected; kept no longer than necessary; and protected against unauthorized access — principles consistent with the Malabo Convention and with Namibia's draft Data Protection Bill.

**4. Data sharing**
We do not sell personal data. Data may be processed by our infrastructure providers (hosting, email delivery, file storage) strictly to operate the site, under confidentiality obligations.

**5. Data retention**
- Contact inquiries: retained for [X months] then deleted or archived
- Job applications: retained for [X months] after the position closes, then deleted, unless you consent to longer retention for future openings

**6. Your rights**
You may request access to, correction of, or deletion of your personal data by writing to **info@cyberpolco.com**. We will respond within a reasonable time.

**7. Security**
We apply technical safeguards (encryption in transit, access controls, rate limiting) appropriate to the sensitivity of the data collected.

**8. Contact**
Questions about this policy: **info@cyberpolco.com**.

---

### Terms of Use (draft)

**Last updated:** [date of publication]

**1. Acceptance**
By accessing cyberpolco.com, you agree to these Terms of Use.

**2. Purpose of the site**
This site provides information about Cyber PolCo's cybersecurity services, published articles, career opportunities, and a means to contact us. It does not itself provide security services — engagements are governed by separate signed agreements.

**3. Intellectual property**
All content (text, logo, articles, graphics) is the property of Cyber PolCo unless otherwise credited, and may not be reproduced without written permission.

**4. Acceptable use**
You agree not to misuse the site (e.g., attempting unauthorized access, submitting false information via forms, uploading malicious files).

**5. No warranty**
Content is provided for general informational purposes and is not a substitute for a tailored security assessment of your organization.

**6. Governing law**
These terms are governed by the laws of the Democratic Republic of Congo, without prejudice to mandatory consumer or data protection provisions applicable in a user's home jurisdiction (e.g., Namibia).

**7. Changes**
We may update these terms; continued use of the site after changes constitutes acceptance.

**8. Contact**
**info@cyberpolco.com**

---

## 14. Open Items Before Build Starts

1. ~~Font licensing~~ — ✅ confirmed, Infinite Justice + Telegraf approved for use
2. ~~Admin UI language~~ — ✅ both FR and EN
3. ~~Placeholder images~~ — ✅ logo used under generic filenames until final assets are ready
4. ~~Social links~~ — ✅ confirmed (Section 12)
5. ~~Legal text~~ — ✅ draft above; **recommend legal review before publishing**, particularly given Namibia's law is still pending enactment

All open items are now resolved. Next step: scaffold the actual Next.js project into the `cyberpolco/cyberpolco` repo.
