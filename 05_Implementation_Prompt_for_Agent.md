# SliceHub — Implementation Prompt for AI Coding Agent

You are acting as a senior full-stack engineer. Attached/pasted below (or
referenced) are four planning documents for a project called **SliceHub**:

1. `01_Product_Requirements_Document.md`
2. `02_Technical_Requirements_Document.md`
3. `03_UI_UX_Design_Document.md`
4. `04_Backend_Schema.md`

Read all four fully before writing any code. They are the single source of
truth for scope, architecture, schema, and design system — do not invent
requirements they don't state, and do not skip requirements they do state.
If something is genuinely ambiguous after reading all four, make the most
reasonable decision yourself and document it in a short `DECISIONS.md` file
rather than stopping to ask — I want a complete, working build in one pass,
followed by iteration.

## Your task

Build the complete application described in these documents: a full-stack
MERN pizza ordering platform with a customer-facing app and an admin
dashboard, exactly matching the folder structure, API design, schema, and
UI system specified in the TRD, Backend Schema, and UI/UX docs.

## Build order (follow this sequence, don't jump ahead)

**Phase 1 — Foundation**
- Scaffold the `client/` (Vite + React + Tailwind) and `server/`
  (Express) projects exactly per the TRD's folder structure.
- Set up MongoDB connection, `.env.example`, and `.gitignore` (real
  `.env` must never be committed).
- Implement the Mongoose models exactly as written in the Backend Schema
  doc (`User`, `InventoryItem`, `Order`) — including the embedded
  snapshot subdocuments, indexes, and `select: false` fields.
- Write the seed script (`server/seed.js`) that creates the one admin
  user and populates catalog inventory items, per Backend Schema §5.

**Phase 2 — Auth**
- Registration with email verification, login (JWT), forgot/reset
  password, separate admin login — all per TRD §4.1 and §8.
- Passwords hashed with bcrypt, never logged or returned in API
  responses.
- Auth middleware (`auth.js`) and admin-gating middleware
  (`adminOnly.js`) exactly as described in TRD §8.

**Phase 3 — Core ordering flow**
- Catalog endpoint, 4-step pizza builder UI (base → sauce → cheese →
  vegetables) with the sticky/collapsible order-summary rail described
  in UI/UX §3.3.
- Order creation, order summary screen (UI/UX §3.4).
- Razorpay integration in test mode, following the exact
  create-order → checkout → verify-signature flow in TRD §5 — signature
  verification must happen server-side, never trust a frontend-only
  success callback.
- Atomic stock decrement on verified payment, using the conditional
  `findOneAndUpdate` pattern in Backend Schema §4.1 — no race conditions,
  stock must never go negative.

**Phase 4 — Order tracking + Admin**
- Customer dashboard with polling-based live status updates (TRD §6).
- Admin inventory dashboard (view + manually edit quantity/threshold).
- Admin order management panel (view all orders, change status) —
  status changes must reflect on the customer's dashboard within one
  polling cycle.
- node-cron low-stock job exactly as specified in TRD §7, sending a
  single digest email (not one email per item).

**Phase 5 — 3D landing page hero**
- Only after Phases 1–4 are fully working, add the 3D pizza hero to the
  landing page per UI/UX §3.1 and TRD §11.5.
- Use `three`, `@react-three/fiber`, `@react-three/drei`. Source a
  free CC0/permissively-licensed glTF pizza model — do not hand-model
  one — and credit its source in the README.
- Implement exactly the fallback chain in TRD §11.5: static poster
  image renders immediately, lazy-loaded 3D canvas swaps in once ready,
  poster stays permanently on load failure or low-end devices.
- This must be fully isolated to the landing page — confirm the
  Three.js bundle is not pulled into the builder, dashboard, or admin
  routes (check the bundle via code-splitting/lazy import, not a
  global import).
- If this phase runs short on time, it is the one item that can be
  descoped without affecting task completion — the landing page still
  works correctly with just the static poster image. Every other phase
  is required; this one is enhancement only.

**Phase 6 — Polish & completeness pass**
Do not skip this phase. Before considering the build done, verify every
item below:
- Every nav link and button does something real — zero dead `#` links.
- A working animated mobile menu (not desktop squeezed down).
- Every async action (login, order creation, payment, admin edits) has
  visible loading, success, and error states — per UI/UX §6.
- 404 page matches the app's visual language, not a browser default.
- Every interactive element visibly handles: default, hover,
  active/pressed, focus-visible, disabled, loading, success, error — per
  UI/UX §4.
- Full responsiveness per UI/UX §7 — test mobile, tablet, desktop.
- Accessibility basics from UI/UX §5: keyboard navigation, visible focus
  rings, color contrast, `prefers-reduced-motion` respected.
- Run through the manual test checklist in TRD §11 end-to-end yourself
  and fix anything that fails.

## Design system — apply consistently, don't default to generic Tailwind

Use exactly the tokens in the UI/UX Design Document §1: the OKLCH color
scale (dark background, single burnt-orange/tomato accent — no rainbow,
no default indigo/gray), the Clash Display + Inter type pairing, the
6/12/20px radius scale, and the warm-tinted shadow system. The signature
layout move (sticky order-summary rail on the builder) must be present —
this is the one distinctive interaction that should feel unmistakably
"this app," not a template.

Do not leave any screen looking like an unstyled Tailwind default. Every
page listed in UI/UX §2 (Information Architecture) must exist and be
reachable through real navigation.

## Constraints

- Test mode only for Razorpay — never wire up live keys.
- No feature outside the PRD's explicit scope (see PRD §4, Out of
  Scope) — don't add things like SMS notifications, multi-tenant
  support, or a delivery-partner app; stay inside brief.
- Keep secrets out of git — `.env` in `.gitignore`, only `.env.example`
  committed.
- Match the exact folder path from the TRD:
  `OIBSIP/WebDev-L3-SliceHub/` as the project root, with `client/` and
  `server/` inside it, so it drops straight into my existing OIBSIP repo
  structure.

## Deliverable checklist for this session

- [ ] Full working `client/` and `server/` code, runnable with
      `npm install && npm run dev` in each
- [ ] `.env.example` with every variable from TRD §10
- [ ] `server/seed.js` seed script, documented
- [ ] `README.md` at the project root covering: setup steps, env
      variables, how to run the seed script, how the real-time updates
      work (polling vs. sockets — state which you built), and a short
      "what I'd do with more time" section (refunds, WebSockets upgrade,
      etc.)
- [ ] A short `DECISIONS.md` noting anything you had to decide yourself
      because the docs left it open (e.g., exact topping list/prices,
      threshold defaults, polling interval, which glTF model/source was
      used for the 3D hero)

Once this is built, stop and give me a summary of what's done, what (if
anything) is incomplete, and exactly which manual steps I need to do
before recording the demo video (e.g., "add your own Razorpay test
keys to `.env`", "run `node server/seed.js` once").

Do not start recording a demo or writing LinkedIn copy — that's my job
once I've reviewed the build.
