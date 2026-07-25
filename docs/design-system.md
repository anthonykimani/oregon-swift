# Oregon Swift Deliveries — Design System

## 1. Brand Identity

| Token | Hex | HSL | Role |
|---|---|---|---|
| **Oregon** | `#173420` | `139 39% 15%` | Primary brand — all interactive elements, headings, nav active states, buttons |
| **Swift** | `#F3BC24` | `44 90% 55%` | Accent / CTA — primary action buttons, promotions, highlights, badges |
| **White** | `#FFFFFF` | `0 0% 100%` | Card backgrounds, sidebar, page canvas |
| **Page BG** | `#F5F4FD` | `249 44% 97%` | Content area background (hero/section) |
| **Border** | `#E3E6ED` | `220 17% 91%` | Panels, cards, header separators |
| **Sidebar Border** | `#DFE1E7` | `225 14% 89%` | Sidebar right edge |
| **Table Row Border** | `#E0E0E0` | `0 0% 88%` | Row separators |
| **Pagination Border** | `#EDEDED` | `0 0% 93%` | Bottom bar top edge |

### Green Palette (Oregon family)

| Token | Hex | Usage |
|---|---|---|
| `$green-900` | `#173420` | Primary, stat values, nav active text, button bg |
| `$green-800` | `#1F4228` | Dark hover states |
| `$green-700` | `#2D5A3A` | Stat card titles, secondary headings |
| `$green-600` | `#3D724D` | Muted interactive text |
| `$green-200` | `#DCE8D6` | Active pagination bg, table header bg |
| `$green-100` | `#EDF2EA` | Active nav bg, search ⌘K badge |
| `$green-50` | `#F4F8F2` | Lightest tint (hover rows) |

### Gold Palette (Swift family)

| Token | Hex | Usage |
|---|---|---|
| `$gold-500` | `#F3BC24` | Accent buttons, CTAs, stat change badges |
| `$gold-400` | `#F5C94A` | Hover state for accent |
| `$gold-300` | `#F8D776` | Light accent (disabled) |
| `$gold-100` | `#FEF7E0` | Badge background tint |
| `$gold-50` | `#FFFBEE` | Highlight backgrounds |

### Neutral Palette

| Token | Hex | Usage |
|---|---|---|
| `$neutral-900` | `#161618` | "Welcome" header, sidebar title |
| `$neutral-800` | `#333333` | Body text, table headers, table data |
| `$neutral-700` | `#45617D` | Search bar placeholder |
| `$neutral-600` | `#666D80` | Sidebar nav items (default) |
| `$neutral-500` | `#757575` | Category labels, timestamps |
| `$neutral-400` | `#8094A7` | Placeholder, subtitles, pagination info |
| `$neutral-300` | `#A4ACB9` | Nav section headers |
| `$neutral-200` | `#F0F0F0` | Icon button bg (sort, dots) |
| `$neutral-100` | `#F9F9F9` | Search bar bg |
| `$neutral-50` | `#FDFDFD` | Secondary button bg |

### Status Badge Colors

| Status | BG | Text |
|---|---|---|
| **In Transit** | `#E0E0E0` | `#333333` |
| **Out for Delivery** | `#FCDEE0` | `#F04A4A` |
| **Delivered** | `#D9F9E7` | `#007837` |
| **Processing** | `#E3EDFF` | `#235BC2` |
| **Pending** | `#FFF3D6` | `#B8860B` |
| **Cancelled** | `#F0F0F0` | `#999999` |

---

## 2. Typography

### Font Stack

| Font | Weight(s) | Usage |
|---|---|---|
| **Clash Display** | 400, 500, 600, 700 | Headings (h1-h3), brand headlines, page titles |
| **Geist** | 400, 500, 600 | Dashboard page headings ("Welcome"), button labels |
| **DM Sans** | 400, 500 | Body text, long-form content, paragraphs |
| **Manrope** | 400, 500, 600 | Sidebar nav items, table content, activity feed, titles |
| **Inter** | 400, 500, 600 | Stat card values/titles/subtitles, search, pagination, form labels |
| **Inter Tight** | 500, 600 | Change badges, nav section headers, bottom nav items |
| **Nunito Sans** | 400, 600 | Carrier column in tables only |
| **Outfit** | 400 | (reserved) |
| **Urbanist** | 400 | (reserved) |

### Type Scale

| Level | Font | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| **h1** | Clash Display | 36px | 600 | 1.1 | -0.02em |
| **h2** | Clash Display | 28px | 600 | 1.2 | -0.01em |
| **h3** | Clash Display | 24px | 500 | 1.3 | 0 |
| **Page Heading** | Geist | 24px | 500 | 1.3 | 0 |
| **Card Title** | Inter | 14px | 500 | 1.4 | 0 |
| **Card Value** | Inter | 24px | 600 | 1.2 | -0.01em |
| **Table Title** | Manrope | 16px | 500 | 1.3 | 0 |
| **Table Header** | Manrope | 10px | 600 | 1.4 | 0.05em |
| **Table Cell** | Manrope | 10px | 400 | 1.4 | 0 |
| **Nav Item** | Manrope | 16px | 500 | 1.3 | 0 |
| **Nav Section** | Inter Tight | 14px | 500 | 1.3 | 0.05em |
| **Bottom Nav** | Inter Tight | 16px | 400 | 1.3 | 0 |
| **Badge** | Manrope | 10px | 600 | 1.2 | 0 |
| **Activity Text** | Manrope | 10px | 400 | 1.5 | 0 |
| **Timestamp** | Manrope | 10px | 400 | 1.4 | 0 |
| **Button Label** | Geist | 14px | 500 | 1.2 | 0 |
| **Small Button** | Inter | 12px | 500 | 1.2 | 0 |
| **Pagination** | Inter | 14px | 400 | 1.3 | 0 |
| **Search Text** | Inter | 14px | 400 | 1.3 | 0 |
| **Subtitle** | Inter | 12px | 400 | 1.3 | 0 |
| **Change %** | Inter Tight | 12px | 600 | 1.2 | 0 |
| **Stat Link** | Inter | 12px | 400 | 1.3 | 0 |

---

## 3. Spacing System

Base unit: **4px** (all spacing derived from multiples of 4).

| Token | Value | Usage |
|---|---|---|
| `$space-1` | 4px | Micro spacing, icon padding |
| `$space-2` | 8px | Button padding, input padding |
| `$space-3` | 12px | Tight gaps, small element padding |
| `$space-4` | 16px | Card padding, table cell padding |
| `$space-5` | 20px | Section padding, stat card padding |
| `$space-6` | 24px | Large gaps, list spacing |
| `$space-7` | 28px | Button height offset |
| `$space-8` | 32px | Button height, page section gaps |
| `$space-10` | 40px | Hero section top/bottom padding |
| `$space-12` | 48px | Section grouping |
| `$space-16` | 64px | Major sections |

### Layout Dimensions

| Element | Width | Height | Padding |
|---|---|---|---|
| **Sidebar** | 272px | Full height | — |
| **Sidebar Header** | 272px | 80px | 16px horizontal |
| **Main Header** | Full remaining | 79px | 20px all sides |
| **Stat Card** | 272px | 135px | 20px all sides |
| **Activity Panel** | 299px | Full available | 16px all sides |
| **Table Panel** | 820px | Full available | 16px all sides |

---

## 4. Border Radius

| Token | Value | Usage |
|---|---|---|
| `$radius-sm` | 6px | Small badges, icons inside buttons |
| `$radius-md` | 8px | Cards, stat cards, buttons, search inputs, table cells, pagination |
| `$radius-lg` | 10px | Primary CTA buttons |
| `$radius-xl` | 12px | Panel containers (table panel, activity panel), header search |
| `$radius-full` | 9999px | Status badges (pill), avatars, change % pills |

---

## 5. Shadows

| Token | Value | Usage |
|---|---|---|
| `$shadow-sm` | `0 1px 2px rgba(0,0,0,0.04)` | Subtle card separation |
| `$shadow-md` | `0 2px 8px rgba(0,0,0,0.06)` | Elevated cards, hover states |
| `$shadow-lg` | `0 4px 16px rgba(0,0,0,0.08)` | Modals, dropdowns |
| `$shadow-xl` | `0 8px 32px rgba(0,0,0,0.10)` | Sidebar overlap, full-screen modals |

---

## 6. Component Specs

### Sidebar (`AdminLayout.tsx`)

```
Width:          272px
BG:             #FFFFFF
Border Right:   1px solid #DFE1E7
```

| Part | Spec |
|---|---|
| **Logo block** | 32x32px, bg: `#173420`, radius: 6px, text "OC" white, bold |
| **Title** | Manrope 20px, `#173420` |
| **Toggle** | 24x24px, border `#DFE1E7`, radius: 6px |
| **Section header** | Inter Tight 14px, `#A4ACB9`, uppercase letter-spacing |
| **Nav item (default)** | Manrope 16px, `#666D80`, gap: 12px to icon, caret right |
| **Nav item (active)** | BG: `#EDF2EA`, text: `#173420`, 4px left bar green |
| **Nav item (hover)** | BG: `#EDF2EA`, text: `#666D80` |
| **Icons** | 20x20px, weight: "regular" default, "fill" active |
| **Bottom nav (logout)** | Inter Tight 16px, `#173420`, SignOut icon fill |

### Header

```
Height:         79px
BG:             #FFFFFF
Border Bottom:  1px solid #E3E6ED
```

| Part | Spec |
|---|---|
| **Page title** | Geist 24px, `#161618` |
| **Search bar** | 444x31px, bg: `#F9F9F9`, border: `#E3E6ED`, radius: 12px |
| **Search icon** | lucide:search 16px, `#8094A7` |
| **Search placeholder** | Inter 14px, `#8094A7` |
| **Primary CTA** | Geist 14px white, bg: `#F3BC24`, radius: 10px, 190x40px, plus icon |
| **Secondary btn** | Inter 12px `#173420`, bg: `#FDFDFD`, border: `#E3E6ED`, radius: 8px, 95x40px |

### Stat Cards

```
Dimensions:     272 x 135px
BG:             #FFFFFF
Border:         1px solid #E3E6ED
Radius:         8px
Padding:        20px
```

| Part | Spec |
|---|---|
| **Title row** | Inter 14px, `#2D5A3A` + DotsThree 16px `#173420` |
| **Value** | Inter 24px 600, `#173420` |
| **Change % pill** | Inter Tight 12px, bg: `#FEF7E0`, text: `#F3BC24`, radius: 9999px, px-2 py-0.5 |
| **Subtitle** | Inter 12px, `#8094A7` |
| **Link** | Inter 12px `#8094A7`, hover underline |

### Table Panel

```
Width:          820px
BG:             #FEFEFE
Border:         1px solid #E3E6ED
Radius:         12px
Padding:        16px
```

| Part | Spec |
|---|---|
| **Title** | Manrope 16px, `#333333` |
| **Search** | 500x38px, border: `#E3E6ED`, radius: 8px, bg: white |
| **Sort / Dots btns** | 28x28px, bg: `#F0F0F0`, radius: 8px |
| **Header row** | bg: `#DCE8D6`, radius: 8px, height: 42px |
| **Header text** | Manrope 10px 600, `#333333` + sort arrow 10px |
| **Row** | bottom border `#E0E0E0`, height: ~53px |
| **ID cell** | Manrope 10px, `#173420` (link color) |
| **Company** | Manrope 10px `#333333` / Category: `#757575` |
| **Carrier** | Nunito Sans 12px `#333333` |
| **Route / Date** | Manrope 10px `#333333` |
| **Checkbox** | 12x12px, bg: `#F0F0F0`, border: `#E0E0E0`, radius: 3px |

### Status Badge

```
Radius:         9999px (pill)
Padding:        2px 8px (3px 8px vertical/horizontal)
Font:           Manrope 10px 600
```

| Status | BG | Text |
|---|---|---|
| In Transit | `#E0E0E0` | `#333333` |
| Out for Delivery | `#FCDEE0` | `#F04A4A` |
| Delivered | `#D9F9E7` | `#007837` |
| Processing | `#E3EDFF` | `#235BC2` |
| Pending | `#FFF3D6` | `#B8860B` |
| Cancelled | `#F0F0F0` | `#999999` |

### Activity Panel

```
Width:          299px
BG:             #FEFEFE
Border:         1px solid #E3E6ED
Radius:         12px
Padding:        16px
```

| Part | Spec |
|---|---|
| **Title** | Manrope 12px, `#333333` |
| **Icon bg** | 36x36px, radius: 24px |
| **Icon color** | Icon color inherits, icon bg alternates `#FCDEE0` / `#F0F0F0` |
| **Activity text** | Manrope 10px, `#333333`, leading: 1.5 |
| **Timestamp** | Manrope 10px, `#757575` |
| **Connecting line** | 1px stroke `#E0E0E0`, between icons |

### Pagination Bar

```
Height:         72px
Border Top:     1px solid #EDEDED
Padding:        20px 16px
```

| Part | Spec |
|---|---|
| **Button** | 32x32px, bg: `#FFFFFF`, border: `#E3E6ED`, radius: 8px |
| **Active page** | bg: `#DCE8D6`, text: `#173420` |
| **Info text** | Inter 14px, `#8094A7` |
| **Show All btn** | Inter 14px, `#173420`, icon: FileArrowDown `#B1B1B4` |

---

## 7. Button Styles

### Primary CTA (Swift)
```
BG:             #F3BC24
Text:           #FFFFFF
Font:           Geist 14px 500
Radius:         10px
Height:         40px
Padding:        0 16px
Icon:           Phosphor plus (18px white)
Hover:          #F5C94A
Active:         darken 5%
```

### Primary (Oregon)
```
BG:             #173420
Text:           #FFFFFF
Font:           Geist 14px 500
Radius:         10px
Height:         40px
Padding:        0 16px
Hover:          #1F4228
Active:         darken 5%
```

### Secondary / Outline
```
BG:             #FDFDFD
Border:         1px solid #E3E6ED
Text:           #173420
Font:           Inter 12px 500
Radius:         8px
Height:         40px
Padding:        0 12px
Hover:          bg #F4F8F2
```

### Icon Button
```
Dimensions:     28x28px
BG:             #F0F0F0
Radius:         8px
Icon:           Phosphor 16px #333333
Hover:          darken bg 5%
```

---

## 8. Form Elements

### Text Input
```
BG:             #FFFFFF or #F9F9F9
Border:         1px solid #E3E6ED
Radius:         12px (header search) / 8px (table search)
Text:           Inter 14px #45617D
Placeholder:    Inter 14px #8094A7
Height:         38px (table) / 31px (header)
Padding:        0 12px
Focus:          ring 2px rgba(23,52,32,0.2)
```

### Select
```
Same as Text Input
Chevron:        Phosphor CaretDown
```

### Checkbox
```
Dimensions:     12x12px
BG:             #F0F0F0
Border:         1px solid #E0E0E0
Radius:         3px
Checked:        BG #173420, checkmark white
```

---

## 9. Iconography

| Icon Set | Size | Context |
|---|---|---|
| **Phosphor Icons** | 20px | Sidebar navigation |
| **Phosphor Icons** | 18px | Activity feed icons |
| **Phosphor Icons** | 16px | Buttons, toolbars, stat card menus |
| **Phosphor Icons** | 14px | Carets, sort arrows, pagination |
| **Lucide Icons** | 16px | Search bars |

Icon weight: "regular" by default, "fill" for active/highlighted states.

---

## 10. Responsive Breakpoints

| Breakpoint | Width | Behavior |
|---|---|---|
| **Desktop** | ≥ 1280px | Full layout (sidebar 272px visible) |
| **Laptop** | ≥ 1024px | Sidebar collapsible |
| **Tablet** | ≥ 768px | Sidebar hidden by default, hamburger toggle |
| **Mobile** | < 768px | Single column, stacked stat cards, scrollable tables |

---

## 11. Accessibility

- All text meets WCAG AA contrast ratios (minimum 4.5:1 for normal text)
- Green `#173420` on white passes AA (contrast ~9:1)
- Gold `#F3BC24` on white is functional for large text/accents (contrast ~1.7:1 — use on dark backgrounds or for decorative elements only)
- Active/focus states use a 2px ring in `rgba(23,52,32,0.2)`
- Status is communicated with both color AND text label (never color alone)
- All icon buttons have `aria-label`

---

## 12. Motion & Transitions

| Element | Duration | Easing | Property |
|---|---|---|---|
| Sidebar collapse | 300ms | ease-in-out | width |
| Hover states | 150ms | ease | background-color, border-color |
| Button press | 100ms | ease | transform scale(0.98) |
| Page transitions | 200ms | ease | opacity, transform |
| Dropdown / popover | 200ms | ease | opacity, y-offset |
