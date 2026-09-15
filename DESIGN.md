# Oregon Swift Deliveries — Design System

Root-level, current source of truth for visual and interaction decisions.
`docs/design-system.md` is retained for the original component inventory, but
its typography section (multiple families, 10px table text) is superseded by
this file.

## 1. Brand

Forest green is the structural/system colour. Sun yellow is reserved for the
single primary action or an urgency signal, and because it is light it must
always pair with forest/dark text.

| Token | Hex | Role |
|---|---|---|
| `--color-forest` | `#173420` | Primary brand, headings, nav active, primary buttons |
| `--color-forest-800` | `#1f4228` | Dark hover |
| `--color-forest-700` | `#2d5a3a` | Secondary headings |
| `--color-forest-600` | `#3d724d` | Muted interactive text |
| `--color-forest-200` | `#dce8d6` | Active pagination / table header |
| `--color-forest-100` | `#edf2ea` | Active nav background, hover |
| `--color-forest-50` | `#f4f8f2` | Lightest tint |
| `--color-sun-500` | `#f3bc24` | Primary CTA (with dark text) |
| `--color-sun-400` | `#f5c94a` | CTA hover |
| `--color-sun-300` | `#f8d776` | Light accent |
| `--color-sun-100` | `#fef7e0` | Badge tint |
| `--color-sun-50` | `#fffbee` | Highlight background |

Supporting neutrals remain the existing `#161618`, `#333333`, `#45617D`,
`#666D80`, `#757575`, `#8094A7`, `#A4ACB9`, `#F0F0F0`, `#F3F4F6`, `#E3E6ED`,
`#DFE1E7`, and the `#F5F4FD` page canvas.

## 2. Typography

- **Manrope** is the single application and body family.
- **Clash Display** (locally hosted woff2) is the restrained marketing headline
  face only.
- Legacy class names are intentional aliases and must keep working:
  `font-inter`, `font-inter-tight`, `font-dm-sans`, `font-outfit`,
  `font-urbanist` all resolve to Manrope.

### Token implementation (important)

`next/font` owns exactly one real CSS variable, `--font-manrope-source`,
applied to `<html>`. `globals.css` defines `--font-manrope` and every legacy
alias as `var(--font-manrope-source)`.

Do **not** write `--font-manrope: var(--font-manrope)` or point an alias at
`var(--font-manrope)`; with Tailwind's `@theme inline`, intermediate tokens are
not guaranteed to be emitted and a self-reference invalidates the family.
Always alias the source.

### Size floor

- Operational text (labels, table cells, timestamps, badges, helper copy)
  renders at **12px minimum** (`text-xs`) and should not go smaller.
- Dense decorative data-viz labels (donut captions) may stay at 11px when
  12px would crowd the graphic. This is the only sanctioned sub-12px case.
- Display/heading sizes use Tailwind scale steps, not arbitrary px.

## 3. Layout & shells

- `AppShell` (`src/components/layouts/AppShell.tsx`) is the one shell for
  admin, customer, and courier. It owns the brand lock-up, sidebar, mobile
  overlay, header, page title, header action, and account avatar.
- Sidebar: 280px. Header: 80px. Content scrolls inside the shell.
- The authenticated shell uses a 280px deep-forest **dispatch rail** with a
  sun current-route marker, restrained translucent selection fields, and a
  compact signed-in identity block. This is the shared treatment for all
  customer, courier, and admin workspaces.
- The 80px application header sits on a warm neutral field and shows the
  workspace context above the active route. Its account control and primary
  action remain stable 44px targets.
- Authenticated content uses `#F3F5F1` as its canvas; white is reserved for
  purposeful surfaces rather than being the default background for every
  region.
- Mobile (<1024px): sidebar is a fixed drawer (z-50); a full-viewport scrim
  (z-40) sits behind it and closes on tap. Desktop (>=1024px): sidebar is
  static and always visible; the collapse control is only meaningful on the
  drawer.
- Customer overview pages use an **attention-first dispatch hierarchy**:
  one dominant operational state, one compact metrics strip, then supporting
  lists and timelines. Do not give every block equal white-card emphasis.
- The dominant customer-dashboard panel uses forest as the structural field;
  sun is reserved for its primary action and live progress emphasis.
- Dashboard headings and operational UI use Manrope. Clash Display remains
  marketing-only, including on authenticated overview pages.
- Overview loading states reserve the final panel and list geometry; errors
  remain inline, actionable, and do not displace the application shell.
- `BrandMark` is the shared lock-up. `PublicHeader` gives non-marketing public
  routes (tracking, auth, legal) a way home without the full navbar.
- Role layouts: `AdminLayout`, `CustomerLayout`, `CourierLayout`.

## 4. Components

- **Delivery sheets**: full-screen on narrow viewports and a maximum 680px
  right rail on larger screens. They use a sticky operational header, reserved
  map geometry, one primary role-specific action, and low-emphasis supporting
  sections on the application canvas.
- **Customer workspaces**: page introductions use an operational eyebrow,
  outcome-led heading, and one supporting sentence. Data regions use a single
  bordered surface with internal grouping instead of equal-weight card grids.
- **Status badges** (`StatusBadge`, `statusPillStyles`): colour + text label,
  never colour alone; `whitespace-nowrap`, `text-xs`.
- **Buttons**: forest for primary, sun for the single marketing CTA, outline
  for secondary. CTA heights 40–48px.
- **Focus**: one global `:focus-visible` treatment — 2px forest outline with a
  2px offset.
- **Scrollbars**: the global application scrollbar uses a light forest track
  and muted forest thumb; forced-colour behavior remains system-owned.
- **Reduced motion**: global transitions and animations collapse to an
  effectively immediate duration when `prefers-reduced-motion` is enabled.
- **Icons**: Phosphor; regular default, fill for active/selected.

## 5. Accessibility

- Text meets WCAG AA (4.5:1) against its background.
- Icon-only controls carry `aria-label`; toggles expose `aria-pressed` /
  `aria-expanded`.
- Live/async regions use `aria-live` / `role="alert"` where content swaps.
- Keyboard focus is always visible; the one focus ring is defined globally.

## 6. Placeholder content policy

Never promote placeholder contact details into chrome (nav, footer, headers).
Point to `/customer-care` and `/get-a-quote` instead. Pre-existing legal copy
that mentions placeholder details is left untouched unless the business
provides real values.
