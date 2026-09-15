# UX Contract — Oregon Swift Deliveries

Behavioural guarantees the shared shell and public surfaces must preserve.
Changes that break any item below are regressions, not refactors.

## Navigation

All role navigation is owned by `AppShell` and defined per layout. Routes that
exist must stay reachable from the sidebar.

| Role | Layout | Primary nav | Bottom nav |
|---|---|---|---|
| Customer | `CustomerLayout` | Dashboard, Book Delivery, My Deliveries, Invoices, Messages | Account, Help & Center, Sign Out |
| Courier | `CourierLayout` | Dashboard, My Deliveries, Invoices, Earnings, Messages | Account, Sign Out |
| Admin | `AdminLayout` | Dashboard, Deliveries, Tracking, Applications, Messages; Invoices, Carriers, Customers, Companies, Warehouses, Reports | Settings, Help & Center, Logout |

- Active state: the current route's nav item is highlighted and its icon is
  filled. The role root (`/dashboard`, `/courier`, `/admin`) is active only on
  the exact root, not on every child route.
- The header title resolves from the active nav item (both primary and bottom
  nav) and falls back to the role default.
- The header identifies the active role workspace and keeps its primary action
  and account control in stable positions across route changes.
- On mobile, opening navigation locks background scrolling, moves focus into
  the drawer, traps Tab navigation, closes with Escape or the scrim, and
  restores focus to the menu trigger.
- The sidebar identity block exposes the current account name and email and
  links to that role's established account destination.
- Section "Soon" markers exist in `AppShell` but must not be used to hide
  routes that are reachable, unless product explicitly deprecates them.

## Customer overview

- `/dashboard` leads with the authenticated customer's most recently updated
  active delivery. Active excludes `delivered` and `cancelled`; no other
  urgency ranking is inferred.
- When no active delivery exists, the same reserved region presents an
  all-clear state and a route to book a delivery.
- Summary metrics navigate to their owning delivery or invoice area.
- Recent delivery and activity rows open the existing delivery detail sheet.
- Dashboard-stat failures provide an inline retry action, ignore stale
  responses, and preserve the overview's loading geometry.

## Customer workspace

- Booking remains a three-step route, package, and review flow; the estimate
  and final action retain stable positions and duplicate submission is blocked.
- Delivery records preserve tab, search, sort, pagination, URL-selected detail,
  and click-to-open behavior. Every visible toolbar control performs a real
  action.
- Invoice records preserve status filtering, selection, download, send, and
  payment behavior. Detail remains visible beside the list on wide screens.
- Messages preserve URL-addressable thread selection and switch between list
  and conversation on narrow screens.
- Customer and courier delivery details are full-screen on narrow viewports and
  a right-hand sheet on larger screens. Radix owns focus containment, Escape,
  outside dismissal, scroll locking, and trigger-focus restoration.

## Messaging

- Every role's **Messages** item renders the live unread count from
  `useUnreadCount`; counts over 99 render `99+`. The badge is absent at zero.

## Courier operations

- Location reporting runs from `CourierLayout` via
  `useCourierLocationReporter(token, availabilityStatus === "online")` — it
  streams only while the courier is available.
- Location verification runs via `useLocationVerification(token)` on courier
  login and must not block navigation.
- Availability is surfaced in the header (`AvailabilityPill`) with an
  accessible `aria-pressed` toggle and disabled state while loading/toggling.

## Session

- Sign out calls `signOut({ callbackUrl: "/sign-in" })` from every role's
  bottom nav.
- Every explicit **Sign in with Google** action sends `prompt=select_account`
  so Google presents its account chooser, even when a Google browser session
  is already active.
- Oregon Swift sign out clears only the application's session. It must not
  revoke Google access, clear Google cookies, or sign the user out of other
  Google services.

## Responsive shell

- <1024px: sidebar is a fixed drawer that opens over the content. A scrim
  behind it dismisses on tap; the drawer and its links remain tappable.
- >=1024px: sidebar is static and visible; content scrolls independently.
- Drawer controls expose `aria-label` and `aria-expanded`; the scrim is
  labelled "Close navigation".

## Accessibility labels

- Brand lock-up: "Oregon Swift Deliveries home".
- Account avatar link: "Account".
- Sidebar: `aria-label="Primary"`.
- Icon-only header controls: descriptive `aria-label`.
- Availability toggle: "Go online" / "Go offline".
- Public tracking form: labelled input, described-by helper text, `aria-live`
  results region, `role="alert"` errors.

## Type & focus

- Operational text floor is 12px; see `DESIGN.md` for the single decorative
  exception.
- One global `:focus-visible` ring (2px forest, 2px offset) covers the product.

## Contact policy

- Placeholder phone/email must not appear as live `mailto:`/`tel:` links in
  shared chrome. Footer contact affordances route to `/customer-care` and
  `/get-a-quote`.
