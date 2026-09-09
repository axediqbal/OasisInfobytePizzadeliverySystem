# UI/UX Design Document
## Project: SliceHub — Full-Stack Pizza Ordering & Inventory Platform

**Prepared for:** Ahmed Iqbal
**Track:** Web Development & Designing — Level 3
**Document version:** 1.0

---

## 1. Design Direction

**Mood:** Warm, appetite-driven, confident — not a generic SaaS look.
**Art direction in one line:** A dark, moody backdrop that makes photography
and the accent color pop, like a modern restaurant's dark-mode menu app.

| Token | Value | Notes |
|---|---|---|
| Base background | `oklch(0.16 0.02 260)` (near-black, faint blue undertone) | Primary app background |
| Surface / card | `oklch(0.21 0.02 260)` | Cards, modals, nav |
| Accent (single, confident) | `oklch(0.68 0.19 35)` — a warm burnt-orange/tomato red | CTAs, active states, price highlights |
| Accent hover | `oklch(0.74 0.19 35)` | Hover/active feedback |
| Success | `oklch(0.72 0.17 145)` (green) | "In Kitchen" / paid states |
| Warning | `oklch(0.78 0.16 85)` (amber) | Low stock indicator |
| Text primary | `oklch(0.95 0 0)` | Headlines, body |
| Text muted | `oklch(0.65 0.01 260)` | Secondary text, labels |
| Border/hairline | `oklch(1 0 0 / 0.08)` | Card borders, dividers |

**Typography pairing:**
- Display/headings: **Clash Display** (or **General Sans** as fallback) —
  bold, geometric, used for hero text, prices, section titles.
- Body/UI: **Inter** at 400/500 weight only for body copy and form labels
  — never left at Tailwind's untouched defaults; tracked slightly tighter
  than default for a designed feel.

**Signature layout move:** The pizza builder uses a **persistent side-rail
order summary** (sticky on desktop, collapsible drawer on mobile) that
updates live as each step is completed — the price and current selections
are always visible, never hidden behind a "next" click into the void.

**Radius & shadow system:**
- Radius scale: `6px` (inputs), `12px` (cards), `20px` (modals/hero panels)
- Shadow: soft, warm-tinted (`0 8px 24px rgba(0,0,0,0.35)`), never a flat
  default Tailwind `shadow-md` gray.

## 2. Information Architecture

```
/                       → Landing / marketing page
/register               → Customer registration
/login                  → Customer login
/verify-email           → Email verification landing (from emailed link)
/forgot-password        → Request reset
/reset-password         → Set new password (from emailed link)
/builder                → 4-step pizza builder (protected)
/order-summary/:id      → Pre-payment summary + Razorpay checkout trigger
/dashboard               → Customer's order history + live status
/admin/login             → Separate admin login (not linked from /login)
/admin/inventory         → Inventory dashboard
/admin/orders            → Order management panel
/404                     → Not found
```

## 3. Key Screens — Wireframe-Level Detail

### 3.1 Landing Page
- Hero: bold headline ("Build your pizza. Track every step."), subheadline,
  single primary CTA ("Start Ordering") — real visual centerpiece: an
  **interactive 3D pizza model** (React Three Fiber + drei), slowly
  auto-rotating, with subtle pointer-based tilt on desktop. This is the
  one "wow" moment of the app — everywhere else stays clean and
  functional, but the hero earns a genuine 3D centerpiece instead of a
  flat illustration.
  - Asset: a single glTF 2.0 pizza model (low-poly is fine — a stylized
    pizza with visible toppings reads better at low poly counts than a
    photoreal attempt).
  - **Lazy-loaded** off the critical path — the 3D canvas mounts after
    initial page render, never blocking first paint.
  - **Static poster-image fallback** (a pre-rendered PNG of the same
    model) shown immediately, swapped for the live 3D canvas once
    Three.js/the glTF asset finish loading. Low-end devices or failed
    asset loads keep the poster image permanently — never a blank
    space.
  - Respects `prefers-reduced-motion`: auto-rotation stops, only
    reacts to explicit drag/interaction if the user chooses to engage
    with it.
  - This is the **only** 3D element in the app. Every other screen
    (builder, dashboard, admin) stays flat UI per the rest of this
    document — 3D is a hero moment, not a recurring motif.
- Bento-style feature section: 3 cards — "Build Your Way", "Pay Securely",
  "Track Live" — varied card sizes, not identical grid boxes.
- Footer: links (Home, Menu, Contact placeholder), social icons, legal
  placeholder text.

### 3.2 Registration / Login
- Centered card (max-width ~420px) on the dark background, glass-panel
  style (frosted card per the liquid-glass spec) floating over a subtle
  blurred pizza photo background.
- Real-time inline validation (email format, password strength meter for
  registration).
- Clear link to the opposite action ("Already have an account? Log in").
- Loading state on submit button (spinner + disabled), success/error toast.

### 3.3 Pizza Builder (core screen)
- **Left/main area:** current step's options as large selectable cards
  (image placeholder + name + price delta), radio-style selection for
  base/sauce/cheese, checkbox-style multi-select for veggies.
- **Right rail (sticky):** running order summary — selected items, running
  total, "Next Step" / "Back" navigation, progress indicator (Step 2 of 4).
- Step progress shown as a horizontal stepper at the top (Base → Sauce →
  Cheese → Veggies → Summary), current step highlighted in accent color.
- Mobile: right rail collapses into a bottom sheet, expandable by tapping
  the running total bar.

### 3.4 Order Summary / Checkout
- Full itemized breakdown (base, sauce, cheese, each topping, subtotal,
  any taxes/fees, total).
- Single prominent "Pay with Razorpay" button — opens Razorpay's own
  checkout modal (test mode).
- Below the button: small trust row (lock icon + "Secure test-mode
  payment") — sets honest expectations since this is not live payment.

### 3.5 Customer Dashboard
- List of orders, most recent first, each as a card showing: order items
  (condensed), total, and a **status tracker** — three connected dots/steps
  (Received → In Kitchen → Sent to Delivery) with the current one
  highlighted and animated (subtle pulse), not just plain text.
- Empty state (no orders yet): friendly illustration + "Build your first
  pizza" CTA.

### 3.6 Admin — Inventory Dashboard
- Table/grid of ingredients: name, category (base/sauce/cheese/veg),
  current quantity, threshold, status badge (green = OK, amber = Low).
- Inline "Edit" action per row (opens a small modal or inline input) to
  manually adjust quantity/threshold.
- Low-stock items visually pulled to the top or flagged with a warning
  icon — admin shouldn't have to hunt for what needs attention.

### 3.7 Admin — Order Management
- Table of all orders: customer, items (condensed/expandable), total,
  current status, timestamp.
- Status is a dropdown/segmented control per row (Received / In Kitchen /
  Sent to Delivery) — changing it fires the update immediately with a
  small inline confirmation (no separate "save" page).

### 3.8 404 Page
- On-brand, not a bare browser default: short message, illustration in
  the same visual language, button back to `/`.

## 4. Component States (apply to every interactive element)

Per element, all of the following must be visibly distinct:
`default → hover → active/pressed → focus-visible → disabled → loading
→ success → error`.

Examples specific to this app:
- **Builder option card:** default (subtle border) → hover (border
  brightens, slight lift) → selected (accent border + checkmark badge) →
  disabled (greyed, e.g., an out-of-stock topping).
- **Pay button:** default → hover (accent brightens) → loading (spinner,
  disabled, "Processing…") → success (brief checkmark before redirect) →
  error (shake + inline message, button re-enabled).
- **Admin stock field:** default → focus (accent ring) → saving (subtle
  spinner inline) → saved (brief green flash) → error (red ring +
  message if a negative number is entered).

## 5. Accessibility

- All interactive elements keyboard-navigable; visible focus ring (never
  `outline: none` without a replacement).
- Color contrast: body text ≥ 4.5:1, large text/headlines ≥ 3:1 against
  the dark background — verify the accent-on-dark combination meets this
  before finalizing (burnt-orange on near-black typically passes at
  large sizes; test body-sized text separately).
- Form errors announced via `aria-live` regions, not color alone (icon +
  text, not just a red border).
- `prefers-reduced-motion`: disable the status-tracker pulse animation
  and any hero entrance animation; keep state changes instant instead.

## 6. Empty / Loading / Error States (required, not optional)

| Context | Empty | Loading | Error |
|---|---|---|---|
| Dashboard, no orders | Illustration + CTA to build first pizza | Skeleton cards | "Couldn't load your orders — retry" button |
| Admin inventory, DB empty | "No ingredients seeded yet" note | Skeleton rows | Inline retry |
| Builder, catalog fails to load | — | Skeleton option cards | Full-width banner + retry, blocks progressing to next step |
| Order summary, payment fails | — | Button shows "Processing…" | Inline red message + "Try again" — order remains editable, not lost |

## 7. Responsive Breakpoints

- Mobile: < 640px — single column, bottom-sheet builder summary, stacked
  admin tables become card lists (not horizontally scrolling tables).
- Tablet: 640–1024px — two-column where sensible (e.g., builder options
  in a 2-col grid).
- Desktop: > 1024px — sticky side rail active, full data tables for admin.

## 8. Deliverable Mapping (per OIBSIP evaluation criteria)

| Evaluation criterion | Where it's addressed |
|---|---|
| Creativity / non-generic UI | §1 design tokens, §3.1 hero, signature layout move |
| Completeness (no dead links, all states) | §6, §4 |
| Responsive design | §7 |
| Accessibility (implied by "clean, functional") | §5 |
