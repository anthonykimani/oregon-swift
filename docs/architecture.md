# Oregon Swift Deliveries — System Architecture

## 1. Agreed decisions

| # | Decision | Choice |
|---|---|---|
| 1 | Roles | Customer + Courier + Admin, all three views this phase |
| 2 | Payments | Invoicing only (per-delivery or bi-weekly), no card processing at MVP |
| 3 | Tracking | Status-based first; schema ready for GPS later |
| 4 | Pricing | Zone-based flat rates (no maps/distance API needed) |
| 5 | Accounts | Self-serve customer signup |
| 6 | Scheduling | Future-dated pickups with date + time window |
| 7 | POD | Configurable per service type (signature/photo toggles) |

## 2. System shape

Two-process architecture following the same conventions as `priest/flamingo/flamingo-api`:

```
oregon-courier/
  src/                    Next.js frontend (App Router) — existing
  api/                    Express API server (mirrors flamingo identity/game structure)
    service/
      configs/            ormconfig.ts, apiconfig.ts, corsconfig.ts
      controllers/        delivery.controller.ts, auth.controller.ts, ...
      enums/              DeliveryStatus.ts, ServiceType.ts, UserRole.ts, ...
      interfaces/         IResponse.ts, IDelivery.ts, ...
      middleware/         auth.middleware.ts, validation.middleware.ts
      models/             *.entity.ts (TypeORM decorators)
      repositories/       *.repo.ts (TypeORM repository classes)
      routes/             index.deliveries.ts, index.auth.ts, ...
      utils/              format.ts, sanitize.ts, validators/validator.ts
      index.ts            Entry: Express + DataSource.initialize() + routes
    .env.development       DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD/DB_SSL
    .env.production
    package.json           express, typeorm, pg, reflect-metadata, jsonwebtoken, bcrypt, cors, dotenv, zod, luxon
    tsconfig.json          experimentalDecorators, emitDecoratorMetadata, strict
  docs/
  src/
    app/
      (marketing)/         /, /track, /track/[number]     public
      (auth)/              /sign-in, /sign-up,             public
      (customer)/          /dashboard/*                    role: customer
      (courier)/           /courier/*                      role: courier, mobile-first
      (admin)/             /admin/*                        role: admin
    components/
      ui/                  shadcn-style primitives (button, card, table, dialog, etc.)
      layouts/             AdminLayout, DashboardLayout (shared sidebar pattern)
      deliveries/          delivery-specific components
      ...

  .claude/
    skills/
```

**Frontend (Next.js)** handles UI rendering, API calls to Express backend, and role-based route guards via middleware.

**Backend (Express API)** handles business logic, auth, data persistence, and serves REST JSON under `/api/v1/*`. The Next.js frontend calls the API via server components / client components -> `fetch('/api/v1/...')`.

The Express API follows flamingo patterns exactly:
- Controllers are classes with static methods, extend `Controller` base class
- Response format: `{ status: number, message: string, data: any, errors: string[] }`
- Auth: JWT Bearer token, verified in `auth.middleware.ts`, decoded to `req.user`
- Repositories wrap `AppDataSource.getRepository(Entity)`
- Routes use Express Router, exported as `index.xxx.ts`

## 3. Sitemap

### Public
- `/` — landing page (done)
- `/track` — enter tracking number
- `/track/[number]` — no-login delivery timeline
- `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`

### Customer — `/dashboard`
- `/dashboard` — overview (active deliveries, stats, recent activity)
- `/dashboard/book` — multi-step booking flow
- `/dashboard/deliveries` — list with status/date filters, search
- `/dashboard/deliveries/[id]` — detail: info, timeline, POD, invoice status
- `/dashboard/invoices` — list
- `/dashboard/invoices/[id]` — detail (printable)
- `/dashboard/account` — profile, company info, billing cycle pref, notifications

### Courier — `/courier` (mobile-first, drivers live on phones)
- `/courier` — today's jobs + upcoming queue
- `/courier/jobs/[id]` — detail, address/contact, status actions, POD capture
- `/courier/account` — profile, vehicle, availability toggle

### Admin — `/admin`
- `/admin` — ops overview (today's board, KPIs, unassigned queue)
- `/admin/deliveries` — master table with filters (status/service/courier/date)
- `/admin/deliveries/[id]` — full control: edit, assign courier, override status/price
- `/admin/customers` — list
- `/admin/customers/[id]` — detail (deliveries, invoices, company)
- `/admin/couriers` — list
- `/admin/couriers/[id]` — detail (jobs, performance, certifications)
- `/admin/invoices` — generate batches, issue, mark paid, overdue list
- `/admin/settings` — zones, rate matrix, service types, team accounts

## 4. Booking flow (customer)

1. **Pickup** — zone dropdown (service areas), street address, contact, date + time window
2. **Dropoff** — same shape
3. **Package** — description, pieces, weight, size class, fragile flag
4. **Service type** — shows available options with the flat rate for that zone pair (same-day, rush, scheduled, legal, medical...)
5. **Review & confirm** -> generates tracking number (`OSD-XXXXXX`), status `pending`

If no rate exists for a zone pair -> falls back to **"request custom quote"**: booking saves with `needs_quote` flag, dispatch sets price manually, customer sees the confirmed price.

## 5. Delivery lifecycle (state machine)

```
pending -> assigned -> en_route_pickup -> picked_up -> in_transit -> delivered -> completed
  |                                                                                   |
  +-> cancelled (pre-pickup)                   failed / returned (from active states)
```

Every transition appends a `tracking_events` row (status, actor, timestamp, note, location_text). This single append-only log powers: the public tracking timeline, the customer's delivery detail, and the **chain-of-custody audit trail** required for legal/medical clients.

## 6. Pricing engine

```
zones           id, name, state, active             (Portland, Gresham, Salem, Seattle WA...)
rate_matrix     id, from_zone, to_zone, service_type, price_cents
```

Admin edits the rate matrix in settings (grid: from x to x service type). Booking price = single lookup. No geocoding, no distance API, no external dependency — zone dropdowns double as address validation.

Interstate runs (WA/ID/CA/NV) are just more zones.

## 7. Proof of delivery (per service type)

```
service_types   id, name, sla_hours, requires_signature, requires_photo, active
```

Courier's POD screen adapts per service type. Legal/medical can mandate on-screen signature + photo + recipient name; standard B2B might only need photo + name. Signature canvas + camera upload stored in object storage, linked to the delivery and shown on customer detail + public tracking (photo visible to authenticated customer).

## 8. Invoicing

```
invoices          id, customer_id, number, period_start/end,
                  status (draft -> issued -> paid / overdue), total_cents
invoice_items     invoice_id, delivery_id, amount_cents
```

`customer_profiles.billing_cycle` = `per_delivery` | `biweekly`. Per-delivery -> invoice generated on `delivered`. Bi-weekly -> admin runs a batch that aggregates each customer's uninvoiced deliveries into one invoice. Admin issues, tracks aging, marks paid manually.

Nullable `payment_provider` columns on the schema keep the door open for Stripe later with zero migration rework.

## 9. Data model (TypeORM entities)

```typescript
// models/user.entity.ts
@Entity("users")
class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column({ type: "enum", enum: UserRole }) role: UserRole;
  @Column() name: string;
  @Column() email: string;
  @Column() phone: string;
  @Column() password: string;
}

// models/customer-profile.entity.ts
@Entity("customer_profiles")
class CustomerProfile extends BaseEntity {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column() userId: string;
  @Column() companyName: string;
  @Column("simple-json") billingAddress: object;
  @Column({ type: "enum", enum: BillingCycle }) billingCycle: BillingCycle;
}

// models/courier-profile.entity.ts
@Entity("courier_profiles")
class CourierProfile extends BaseEntity {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column() userId: string;
  @Column() vehicleType: string;
  @Column("simple-array") zones: string[];
  @Column("simple-array") certifications: string[];
  @Column() active: boolean;
}

// models/service-type.entity.ts
@Entity("service_types")
class ServiceType extends BaseEntity {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column() name: string;
  @Column() slaHours: number;
  @Column() requiresSignature: boolean;
  @Column() requiresPhoto: boolean;
  @Column() active: boolean;
}

// models/zone.entity.ts
@Entity("zones")
class Zone extends BaseEntity {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column() name: string;
  @Column() state: string;
  @Column() active: boolean;
}

// models/rate-matrix.entity.ts
@Entity("rate_matrix")
class RateMatrix extends BaseEntity {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column() fromZoneId: string;
  @Column() toZoneId: string;
  @Column() serviceTypeId: string;
  @Column() priceCents: number;
}

// models/delivery.entity.ts
@Entity("deliveries")
class Delivery extends BaseEntity {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column() trackingNumber: string;          // OSD-XXXXXX
  @Column() customerId: string;
  @Column({ nullable: true }) courierId: string;
  @Column() serviceTypeId: string;
  @Column() status: string;
  @Column() priority: string;
  // Pickup
  @Column() pickupZoneId: string;
  @Column() pickupAddress: string;
  @Column() pickupContactName: string;
  @Column() pickupContactPhone: string;
  @Column({ nullable: true }) pickupWindowStart: string;
  @Column({ nullable: true }) pickupWindowEnd: string;
  // Dropoff
  @Column() dropoffZoneId: string;
  @Column() dropoffAddress: string;
  @Column() dropoffContactName: string;
  @Column() dropoffContactPhone: string;
  @Column({ nullable: true }) dropoffWindowStart: string;
  @Column({ nullable: true }) dropoffWindowEnd: string;
  @Column({ nullable: true }) scheduledDate: string;
  // Package
  @Column() packageDesc: string;
  @Column() packagePieces: number;
  @Column({ nullable: true }) packageWeight: string;
  @Column({ nullable: true }) packageSizeClass: string;
  @Column() packageFragile: boolean;
  // Pricing
  @Column({ nullable: true }) priceCents: number;
  @Column() needsQuote: boolean;
  @Column({ type: "timestamp" }) createdAt: Date;
  @Column({ type: "timestamp" }) updatedAt: Date;
}

// models/tracking-event.entity.ts
@Entity("tracking_events")
class TrackingEvent extends BaseEntity {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column() deliveryId: string;
  @Column() status: string;
  @Column() actorId: string;
  @Column({ nullable: true }) note: string;
  @Column({ nullable: true }) locationText: string;
  @Column({ type: "timestamp" }) createdAt: Date;
}

// models/proof-of-delivery.entity.ts
@Entity("proof_of_delivery")
class ProofOfDelivery extends BaseEntity {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column() deliveryId: string;
  @Column() recipientName: string;
  @Column({ nullable: true }) signatureUrl: string;
  @Column({ nullable: true }) photoUrl: string;
  @Column() capturedBy: string;
  @Column({ type: "timestamp" }) createdAt: Date;
}

// models/invoice.entity.ts
@Entity("invoices")
class Invoice extends BaseEntity {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column() customerId: string;
  @Column() number: string;
  @Column({ nullable: true }) periodStart: Date;
  @Column({ nullable: true }) periodEnd: Date;
  @Column() status: string;
  @Column() totalCents: number;
  @Column({ nullable: true }) issuedAt: Date;
  @Column({ nullable: true }) paidAt: Date;
}

// models/invoice-item.entity.ts
@Entity("invoice_items")
class InvoiceItem extends BaseEntity {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column() invoiceId: string;
  @Column() deliveryId: string;
  @Column() amountCents: number;
}

// models/notification.entity.ts
@Entity("notifications")
class Notification extends BaseEntity {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column() userId: string;
  @Column() type: string;
  @Column("simple-json") payload: object;
  @Column() readAt: Date;
  @Column({ type: "timestamp" }) createdAt: Date;
}
```

**Medical note:** we store shipment reference codes only — never patient names or info. The platform stays clear of PHI/HIPAA data obligations.

## 10. Notifications (MVP)

Transactional email (Resend + React Email):
- Booking confirmation
- Status changes (picked up, delivered)
- Invoice issued
- POD available

In-app notification center and SMS -> phase 2.

## 11. UI design system

Matching the patterns from `priest/akiri-web` (Vite + React + shadcn/ui + Tailwind + Phosphor icons), adapted to Next.js App Router.

### Component library

Add shadcn/ui to the existing Next.js project. The base components are identical — we already have `tailwind-merge` and `clsx`; add `class-variance-authority`, `tailwindcss-animate`, and the Radix primitives needed.

```json
// Additional dependencies (to add to existing Next.js project)
"@radix-ui/react-avatar": "^1.1.0",
"@radix-ui/react-dialog": "^1.1.2",
"@radix-ui/react-dropdown-menu": "^2.1.1",
"@radix-ui/react-select": "^2.1.1",
"@radix-ui/react-separator": "^1.1.0",
"@radix-ui/react-tabs": "^1.1.0",
"@radix-ui/react-tooltip": "^1.1.4",
"class-variance-authority": "^0.7.1",
"lucide-react": "^0.462.0",
"recharts": "^2.12.7",
"sonner": "^1.5.0",
"tailwindcss-animate": "^1.0.7",
"@tanstack/react-table": "^8.17.3",
"@tanstack/react-query": "^5.45.1",
"react-hook-form": "^7.53.0",
"@hookform/resolvers": "^3.9.0",
"date-fns": "^3.6.0",
```

### Color system

Convert the existing landing page brand to HSL CSS variables (matching akiri-web's approach):

```css
:root {
  --background: 220 20% 99%;
  --foreground: 120 5% 5%;
  --card: 0 0% 100%;
  --card-foreground: 120 5% 5%;
  --primary: 220 95% 41%;        /* #0a47c9 brand blue */
  --primary-foreground: 0 0% 100%;
  --secondary: 220 30% 95%;
  --secondary-foreground: 220 30% 20%;
  --muted: 210 25% 96%;
  --muted-foreground: 215 16% 47%;
  --accent: 220 95% 95%;
  --accent-foreground: 220 95% 30%;
  --border: 214 20% 91%;
  --input: 214 20% 91%;
  --ring: 220 95% 41%;
  --radius: 0.75rem;

  --sidebar-background: 220 20% 97%;
  --sidebar-foreground: 220 30% 20%;
  --sidebar-primary: 220 95% 41%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 220 95% 95%;
  --sidebar-accent-foreground: 220 95% 30%;
  --sidebar-border: 220 20% 90%;
  --sidebar-ring: 220 95% 41%;
}
```

### Layout pattern (adapted from akiri-web's DashboardLayout)

Each role gets a layout file (`src/app/(customer)/layout.tsx`, etc.) that wraps its pages with a shared sidebar + header shell:

```
+---------------------------------------------------+
| Sidebar (#f4f7fd)  |  Header (white)               |
|  282px / collapsible|  [toggle] [page title] [bell] |
|                     |  [gear] [avatar dropdown]     |
|  - Search (⌘K)     +-------------------------------+
|  - Nav items        |                               |
|    · active: white  |  Content area (bg-gray-50)    |
|      bg + primary   |                               |
|    · hover: #e5ecfa |                               |
|  - User card bottom |                               |
+---------------------+-------------------------------+
```

Key patterns from akiri-web to carry over:
- Sidebar: fixed on desktop (z-30), overlay on mobile, collapsible to icon-only
- Search bar inside sidebar filters nav items
- Nav items: Phosphor icon + label, active = white bg + primary text + font-semibold
- Sub-sections with expand/collapse chevron
- Header: toggle button, dynamic page title, notification bell, gear link, avatar dropdown with logout
- Content: `flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6` on `bg-gray-50`
- Stat cards: `bg-white border border-[#e3e6ed] rounded-lg p-5`
- Data tables: TanStack Table with the same border/header styling

### Responsive behavior
- Mobile: sidebar renders as fixed overlay with backdrop, toggle icon in header shows/hides
- Desktop: sidebar can collapse to icon-only (w-20) via button click, tooltips show nav labels

## 12. Build phases

| Phase | Scope | Exit criteria |
|---|---|---|
| 1 — Foundation | Schema, auth + roles, Express API shell, Next.js dashboard shells, shadcn/ui setup, sidebar layouts | All roles can sign in and see their shell |
| 2 — Core loop | Booking flow, admin dispatch/assign, courier status + POD, public tracking | A real delivery runs end-to-end |
| 3 — Money | Invoicing engine, customer invoice views, admin AR | Client can bill for deliveries |
| 4 — Polish | Email notifications, settings depth (zones/rates/service types), analytics, remaining screens | Full Figma scope matched |

## 13. Tech stack

### Frontend (existing Next.js + new dashboard UI)

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16 App Router (existing) | Already in place |
| UI components | shadcn/ui (Radix + Tailwind) | Matches akiri-web patterns |
| Styling | Tailwind CSS v4 (existing) + CSS variables | Already in place |
| Icons | Phosphor Icons (existing) | Already in place |
| Data fetching | TanStack React Query | Matches akiri-web |
| Tables | TanStack Table | Admin delivery master table |
| Charts | Recharts | Dashboard stat visualizations |
| Forms | React Hook Form + Zod | Type-safe, matches akiri-web |
| Toasts | sonner | Matches akiri-web |
| Dates | date-fns | Matches akiri-web |

### Backend (new Express API)

| Layer | Choice | Rationale |
|---|---|---|
| Runtime | Node.js 18+ | Matches flamingo pattern |
| Framework | Express 4.x | Matches flamingo pattern |
| ORM | TypeORM 0.3.x | Matches flamingo pattern |
| Database | PostgreSQL 15+ | Matches flamingo pattern |
| Auth | JWT (jsonwebtoken) + bcrypt | Matches flamingo identity service |
| Validation | Zod | Matches flamingo game service |
| Config | dotenv + .env.{NODE_ENV} files | Matches flamingo pattern |
| CORS | cors package | Matches flamingo pattern |
| Package manager | npm | Matches flamingo pattern |
| Dev runner | ts-node + nodemon | Matches flamingo pattern |
| Test runner | Mocha + Chai + Sinon | Matches flamingo pattern |
