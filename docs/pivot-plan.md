# Oregon Courier → ATREK-Style Dispatch & Brokerage Pivot

Progress tracker for pivoting the last-mile courier app toward ATREK's freight/TMS model.
Use this file to track what's done, what's next, and re-evaluate priorities against the goal.

## Goal

Shift selected functionality to ATREK's model while keeping the working app healthy:

- **Admin = broker.** Posts loads, sets commission %, runs auto-assign, approves payouts.
- **Courier = carrier/driver.** Toggles availability, streams browser GPS, sees loadboard, places bids, gets auto-assigned, receives payouts.
- **Customer booking flow stays** as an optional direct-booking path (admin can also post loads manually).

## Decisions (locked)

| Topic | Decision |
|---|---|
| Model direction | Admin acts as broker; carriers/drivers bid and get auto-assigned. Additive on top of courier model. |
| GPS source | Browser geolocation (`navigator.geolocation`, web-only, no mobile app). |
| Loadboard depth | Full reverse auction with bids + auto-assign. |
| Payroll model | Commission split: driver payout = load revenue × (1 − commission%). |
| Build order | Phase A first (live ops). |
| Git | Do NOT push until explicitly told to. |

## Status Legend

- [ ] not started
- [~] in progress
- [x] done

---

## Phase A — Live Operations (availability, GPS, ETA, live map)

Build FIRST. Availability unblocks the loadboard.

### A.1 Driver Availability
- [x] API: add `availabilityStatus` (varchar, default `"offline"`) + `lastSeenAt` (timestamp) to `courier_profiles`
- [x] API: `GET /courier/availability` → current status
- [x] API: `PATCH /courier/availability {status}` → set status + `lastSeenAt`, broadcast `courier:availability` to admin rooms
- [x] API: `GET /admin/couriers` includes `availabilityStatus` + `lastSeenAt`
- [x] Socket: join `role:admin` room on connect; `broadcastToRole` helper
- [x] UI: courier account page — real availability toggle (online/offline) wired to `PATCH`
- [x] Verify: api tsc, web tsc, eslint on changed files, manual smoke in courier + admin roles

### A.2 GPS Location Ingestion (browser geolocation)
- [x] API: new `courier_locations` entity (`courierId`, `lat`, `lng`, `accuracy`, `speed?`, `recordedAt`)
- [x] API: `POST /courier/location {lat,lng,accuracy,speed?}` — courier-only, writes row, updates `lastSeenAt`, broadcasts `location:update` to admins
- [x] Socket: `location:update` event wiring (reuse A.1 admin room)
- [x] UI: courier `watchPosition` reporter (~10s / significant movement), started only when available
- [x] UI: login-time location verification — `verifyLocationServices()` + `useLocationVerification()` in `CourierLayout` (actively prompts if undecided; toasts granted/denied/OS-off/unsupported; no blocking)
- [x] Verify: tsc + lint + smoke

### A.3 Routing-Based ETA
- [x] API: `GET /route/estimate?fromLat&fromLng&toLat&toLng` — proxy free OSRM; fallback to haversine/45mph
- [x] API: `GET /tracking/:trackingNumber` returns `courierLocation` + live `etaMinutes`
- [x] UI: LiveTrackingPanel shows last-seen, distance, ETA
- [x] Verify: tsc + lint + smoke

### A.4 Live Map (frontend)
- [x] UI: `TrackingMap` optional `courierPosition` marker
- [x] UI: admin tracking page subscribes to `location:update` + `courier:availability`; live driver markers
- [x] UI: VehicleInfoPanel — wire decorative Message/Call buttons (message → thread find-or-create; call → `tel:`)
- [x] Verify: tsc + lint + smoke

---

## Phase A Hardening (production readiness)

Complete before starting Phase B. Tracked separately from feature work.

- [x] Persist delivery pickup/dropoff coordinates on create; stop per-request geocoding
- [x] Public tracking returns coarse courier location; exact location only on authenticated customer/admin routes
- [x] Cache + rate limit OSRM/Nominatim; proper Nominatim User-Agent/contact
- [x] Validate Socket.IO conversation membership on `thread:join`
- [x] Vitest coverage: routing/haversine fallback, geocoding, tracking visibility, socket membership
- [x] CI: build + lint + typecheck + tests
- [x] TypeORM migrations; disable `synchronize` outside development
- [x] Central `requireRole` middleware + frontend auth/role guard

---

## Phase B — Loadboard + Reverse Auction + Auto-Assign

- [ ] API: extend `deliveries` — `loadStatus` (`posted|bidding|assigned|in-progress|delivered|cancelled`), `postedBy`, `baseRateCents`, `minRateCents`, `bidDeadline`, `auction` bool
- [ ] API: new `bids` entity (`loadId`, `courierId`, `amountCents`, `status`, `createdAt`)
- [ ] API: admin `POST /admin/loads`, `GET /admin/loads`, `GET /admin/loads/:id`, `POST /admin/loads/:id/auto-assign`
- [ ] API: courier `GET /courier/loadboard`, `GET /courier/loads/:id`, `POST /courier/loads/:id/bids`, `PATCH /courier/bids/:id`
- [ ] API: auto-assign — deadline/admin trigger → lowest bid ≥ min-rate (tiebreak nearest/available) → assign + notify
- [ ] Socket: `loadboard:update` event
- [ ] UI: admin "Dispatch" page (post loads, view bids, auto-assign)
- [ ] UI: courier "Loadboard" page (open loads, place/withdraw bids, status)
- [ ] Verify: tsc + lint + smoke

---

## Phase C — Broker Invoices + Commission Payroll

- [ ] API: `commissionPct` config (default + per-load override on posting)
- [ ] API: new `courier_payouts` entity (`courierId`, `periodStart/End`, `grossCents`, `commissionCents`, `netCents`, `status`)
- [ ] API: admin `POST /admin/payouts/generate`, `GET /admin/payouts`, `POST /admin/payouts/:id/approve`, `POST /admin/payouts/:id/pay`
- [ ] API: courier `GET /courier/payouts`
- [ ] API: broker invoices — commission = invoice total × `commissionPct`; driver net = total × (1 − commission)
- [ ] UI: admin payouts page
- [ ] UI: courier earnings shows period breakdown
- [ ] Verify: tsc + lint + smoke

---

## Phase D — Driver Docs / Onboarding / Compliance Portal

- [ ] Infra: add `multer` + local upload dir (`api/uploads`, served statically), storage abstraction for cloud swap
- [ ] API: new `driver_documents` entity (`courierId`, `type`, `filename`, `url`, `mime`, `size`, `status`, `expiresAt`, `verifiedBy`, `verifiedAt`)
- [ ] API: courier `POST /courier/documents`, `GET /courier/documents`
- [ ] API: admin `GET /admin/documents`, `POST /admin/documents/:id/verify`
- [ ] UI: courier account → document uploads + onboarding checklist with expiry warnings
- [ ] UI: admin applications → review documents, verify/reject, compliance status
- [ ] Verify: tsc + lint + smoke

---

## Notes / Re-eval Triggers

- OSRM requires internet at runtime; offline falls back to naive estimate. Re-eval if a paid routing API (Google/Mapbox) is wanted.
- Loadboard reuses `deliveries` (not a separate `loads` table) to keep existing tracking/invoice/messaging infra working.
- Re-eval point after Phase A: confirm GPS web-only accuracy is acceptable before investing in loadboard bidding.
