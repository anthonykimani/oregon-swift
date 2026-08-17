# Marketing Pages Plan

Plan for expanding the Oregon Swift Deliveries landing site from a single-page
marketing site into a full multi-page site. Covers the requested pages
(Services, About, Location, Customer Care, Blog) plus the dangling
footer/hero links that are already advertised but missing.

Status: **proposed — nothing implemented yet.**

## Goal

Ship a coherent public marketing site where every nav/footer link resolves to a
real page, reusing the existing design system and landing sections, and add a
Sanity CMS-backed blog.

## Current State

- Landing page (`src/app/page.tsx`) inlines `<Navbar/>` and `<Footer/>`
  manually; no shared marketing layout exists.
- `/tracking` renders with neither navbar nor footer.
- Navbar advertises placeholder `#` links: Services, Location, About,
  Customer Care, Track (`src/components/navbar.tsx`).
- Footer advertises placeholder `#` links: About, Contact, Blog,
  Get a Quote, Schedule a Pickup, Real-Time Tracking, Terms & conditions,
  Privacy policy (`src/components/footer.tsx`).
- Design tokens live in `docs/design-system.md` (Oregon `#173420`, Swift
  `#F3BC24`, font stack, spacing, radius).
- No Sanity project, client, or env vars exist for this app yet.

## Page Set

| Route | Page | Notes |
|---|---|---|
| `/` | Homepage (existing) | Move into route group, otherwise unchanged |
| `/services` | Services | Expand the 6 service cards from `why-choose-us.tsx` (Legal, B2B, Medical, Same-Day, Emergency, Rush) into full sections + industries served + service FAQ |
| `/about` | About | Story, mission, values, stats, certifications (OSHA / HAZMAT / HIPAA / TWIC per `why-choose-us.tsx`), reuse `Testimonials` |
| `/location` | Location / Service Areas | Expand `service-area.tsx` (Portland metro cities + interstate WA/ID/CA/NV), reuse `ZoneMap` |
| `/customer-care` | Customer Care | Static info page: contact channels, hours, FAQ, links to `/tracking`. No backend work |
| `/blog` + `/blog/[slug]` | Blog | Sanity CMS-backed (see below) |
| `/get-a-quote` | Get a Quote | Quote process explainer + CTA to `/dashboard/book` / `/sign-up` |
| `/terms` | Terms & Conditions | Legal text page |
| `/privacy` | Privacy Policy | Legal text page |

Notes / decisions:
- Navbar labels the location item "Location"; "Service Areas" is more accurate
  for SEO but the page can serve either label. Keep route `/location`.
- Customer Care is intentionally static (no contact form). The existing
  messaging endpoints require auth (`api/service/controllers/message.controller.ts`),
  so a public form would need a new auth-less endpoint — out of scope for now.

## Architecture

1. Create `src/app/(marketing)/` route group with a `layout.tsx` that renders
   `Navbar + {children} + Footer`.
2. Move the existing homepage into the group (URL stays `/`).
3. Create each new page under the group (e.g. `(marketing)/services/page.tsx`).
4. Wire all `#` links:
   - Navbar: Services -> `/services`, Location -> `/location`,
     About -> `/about`, Customer Care -> `/customer-care`; Track already
     points to `/tracking`.
   - Footer: About -> `/about`, Contact -> `/customer-care`,
     Blog -> `/blog`, Get a Quote -> `/get-a-quote`,
     Schedule a Pickup -> `/dashboard/book` (or `/sign-up`),
     Real-Time Tracking -> `/tracking`, Terms -> `/terms`,
     Privacy -> `/privacy`.
5. Each page gets its own `metadata` (title/description) matching the pattern in
   `src/app/layout.tsx`.
6. Reuse existing landing sections as building blocks
   (`ServiceArea`, `WhyChooseUs`, `HowItWorks`, `Testimonials`,
   `MultiStateCTA`) and the `ui/` primitives (`button`, `input`, `textarea`,
   `card`, `badge`, etc.). Build FAQ with native `<details>`/`<summary>`
   (no new dependency) unless an accordion component is added later.

## Sanity Blog Setup

No Sanity project or client exists for this app yet.

1. **Create project** — `sanity_create_project` (new dedicated project; no
   existing project fits). Record the returned `projectId`, dataset, tokens.
2. **Deploy schema** — `sanity_deploy_schema` with:
   - `post`: title, slug, excerpt, body (Portable Text), mainImage,
     publishedAt, author (reference), categories (array of references)
   - `author`: name, bio, image
   - `category`: title, slug
   Follow the `schema` rule patterns (defineField, strict syntax, icons,
   validation).
3. **Deploy hosted Studio** — `sanity_deploy_studio` for content editing.
4. **Frontend deps** — add `next-sanity` + `@sanity/image-url`.
5. **Client + env** — `src/sanity/client.ts` using
   `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`; add to
   `.env.local` and `.env.example`.
6. **Queries** — GROQ with `defineQuery`:
   - posts list: `*[_type == "post" && defined(slug.current)] | order(publishedAt desc)` with projection (title, slug, excerpt, mainImage, publishedAt)
   - post by slug: `*[_type == "post" && slug.current == $slug][0]{..., body}`
7. **Pages** — `/blog` index (cards linking to `/blog/[slug]`), `/blog/[slug]`
   detail rendering `PortableText`.
8. **Caching** — time-based revalidation (`next: { revalidate: 60 }`) for the
   simple published-content path. `defineLive` / draft mode / visual editing
   deferred to a follow-up.
9. **Seed content** — 2-3 sample posts via `sanity_create_documents`, then
   `sanity_publish_documents`.

## Verification

- `pnpm lint`
- `pnpm build` (catches type and route issues)
- Manual smoke: click through every nav/footer link, confirm `/blog` ->
  `/blog/[slug]` renders, no dead `#` links remain.

## Open Decisions (resolve before execution)

1. Sanity project — fresh dedicated project vs. reuse an existing one
   (recommended: fresh).
2. Blog Studio — hosted-only via MCP vs. also adding a local `studio/` folder
   (recommended: hosted-only to start).
3. Get a Quote — explainer + CTA vs. a real form requiring a new auth-less
   endpoint (recommended: explainer + CTA).
4. Customer Care route naming — `/customer-care` vs `/support` (recommended:
   `/customer-care` to match navbar label).

## About Page — Design Spec

Reference: Figma file `ElementPay-Design-Moodboard`, node `FAQ` (`9:3796`) —
used as a layout/aesthetic moodboard only. Oregon brand identity is preserved.

### Decisions (locked)

| Topic | Decision |
|---|---|
| Layout / structure | Follow the moodboard page anatomy (centered hero + pill badge, `100px` horizontal padding, card sections, radius 16/24/100) |
| Accent color | Oregon brand green `#173420` (NOT moodboard emerald `#07955f`) |
| Secondary CTA | Oregon gold `#F3BC24` |
| Headings | Clash Display (NOT moodboard's DM Sans-only) |
| Body / nav | DM Sans (matches moodboard + existing site) |
| Nav / Footer | Reuse existing `navbar.tsx` + `footer.tsx` unchanged |

### Color mapping (moodboard → Oregon)

| Moodboard | Oregon |
|---|---|
| Emerald `#07955f` | `#173420` (hover `#1F4228`) |
| Ink `#0d0e0c` | `#161618` |
| Body gray `#504c4c` | `#504c4c` (kept) |
| Card `#f7f7f7` | `#f7f7f7` (kept) |
| Border `#e2e2e2` / `#efefef` | `#e5e5e5` (kept, matches site) |
| Page bg `#fcfcfc` | `#fcfcfc` (kept) |

### Sections

| # | Section | Spec |
|---|---|---|
| 1 | Nav | existing `navbar.tsx` |
| 2 | Hero | centered, `100px` padding; pill badge (white bg, `#e5e5e5` border, radius 100, "About Oregon Swift") → Clash Display 56px heading `#173420` → 18px DM Sans `#504c4c` subtext |
| 3 | Story / Mission | two-column, 64px vertical padding; left eyebrow + 40px heading + body; right image (radius 24) |
| 4 | Values | 3-card grid, `#f7f7f7` cards radius 16, 32px padding — Integrity · Reliability · Precision |
| 5 | Stats band | 4-up, Clash Display numerals in `#173420` — placeholder values |
| 6 | Certifications | pill badges (radius full) — OSHA · HAZMAT · HIPAA · TWIC |
| 7 | Testimonials | centered 40px heading + cards (`#f7f7f7`, radius 16), reuses `testimonials.tsx` reviews |
| 8 | CTA band | full-width radius-24 image card + overlay 40px heading + gold CTA → `/sign-up` |
| 9 | Footer | existing `footer.tsx` |

### Assets

- Story image → `van-illustration.svg` (placeholder, `TODO: replace with real photo`)
- CTA background → `hero-bg.jpg` (placeholder, `TODO: replace with real photo`)

---

## Blog Pages — Design Spec & Implementation

Reference: Figma `ElementPay-Design-Moodboard` nodes `Blog` (`9:3967`) and
`Blog - Template page` (`9:4551`). Same Oregon mapping as the About page
(`#07955f` → `#173420`, `#cdeadf` → `#edf2ea`, ink → `#161618`, Clash Display
headings, DM Sans body, existing nav/footer).

### Decisions (locked)

| Topic | Decision |
|---|---|
| Index sections | Lean: header + featured + post grid + newsletter CTA |
| Backend | Sanity CMS, wired now (MCP-managed schema + hosted Studio) |
| Body blocks | Rich Portable Text: `image`, `imageWithCaption`, `callout`, `quote` |

### Sanity project

- Project `tynfgqkz`, dataset `production`
- Hosted Studio: https://oregon-swift-blog.sanity.studio/
- Schema: `post`, `author`, `category` + objects `imageWithCaption`, `callout`, `quote`
- Env: `NEXT_PUBLIC_SANITY_PROJECT_ID=tynfgqkz`, `NEXT_PUBLIC_SANITY_DATASET=production`

### Frontend

- Deps: `next-sanity`, `@sanity/image-url`
- `src/sanity/client.ts` (`apiVersion: "2026-08-16"`, `useCdn: true`)
- `src/sanity/image.ts` (`urlFor`), `queries.ts`, `types.ts`, `portable-text.tsx`
- Routes: `(marketing)/blog/page.tsx`, `(marketing)/blog/[slug]/page.tsx`
- Caching: `next: { revalidate: 60 }`
- Components: `blog-hero`, `blog-featured`, `blog-grid`, `post-card`,
  `newsletter-cta`, `article-hero`, `article-body`

### Sections

**`/blog`** — Nav → centered header (pill "Blog" + Clash Display "Insights &
updates" + subtitle) → featured (latest 3: 1 full-width + 2 half image cards,
radius 24, category pill + white title overlay) → "Latest articles" grid
(3-col cards, image + category + title + date) → green `#173420` newsletter
CTA → Footer.

**`/blog/[slug]`** — Nav → article hero (full-bleed image + `#173420/70`
overlay + centered category pill + Clash Display title + date/author) →
body (800px column: author byline, PortableText, tags) → "Read more"
(3 related cards) → newsletter CTA → Footer.

### Seed content (6 posts)

1 featured + 5 standard posts, categories `Insights`/`Tips`/`News`, author
"Jordan Chen". Cover images generated via `sanity_generate_image` (AI), with
branded `#edf2ea`/OC fallback in the frontend while images render.

### Notes / TODO

- `mainImage` cover images: generated via AI (async); cards fall back to a
  branded placeholder until they resolve.
- Blog is not in the main nav yet — reachable via footer "Blog" and direct
  URL. Add a navbar link when the nav is revisited.

---

## Remaining Pages — Design Spec (built)

Shared building blocks: `shared/page-hero.tsx`, `shared/faq-accordion.tsx`,
`shared/cta-panel.tsx`. Same moodboard + Oregon mapping as About/Blog.

| Route | Sections |
|---|---|
| `/services` | page-hero → 6 alternating service rows (`services/service-rows.tsx`, data from `why-choose-us.tsx`) → `deliverables.tsx` checklist → faq-accordion → cta-panel |
| `/location` | page-hero ("Service Areas") → `coverage.tsx` (text + `map-illustration.png`) → `cities-grid.tsx` (by state) → cta-panel |
| `/customer-care` | page-hero → `contact-channels.tsx` (4 cards, placeholder contact info) → faq-accordion → cta-panel |
| `/get-a-quote` | page-hero → `quote-process.tsx` (3 steps, data from `how-it-works.tsx`) + CTA buttons → faq-accordion → cta-panel |
| `/terms`, `/privacy` | page-hero ("Legal") → `legal-prose.tsx` (800px prose, placeholder copy) |

### Link wiring

- Navbar: Services → `/services`, Location → `/location`, About → `/about`,
  Customer Care → `/customer-care`, Blog → `/blog`, Track → `/tracking`,
  Home → `/`.
- Footer: About → `/about`, Contact → `/customer-care`, Blog → `/blog`,
  Get a Quote → `/get-a-quote`, Schedule a Pickup → `/dashboard/book`,
  Real-Time Tracking → `/tracking`, Terms → `/terms`, Privacy → `/privacy`.

### Notes / TODO

- `ZoneMap.tsx` requires zone data + client state (admin/dashboard use), so the
  marketing Location page uses the static `map-illustration.png` instead.
- Placeholder copy to replace with real content: Customer Care contact details +
  FAQ answers, Terms/Privacy legal text, stats figures on About.
