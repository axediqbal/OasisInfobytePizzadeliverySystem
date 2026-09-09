# Product Requirements Document (PRD)
## Project: SliceHub — Full-Stack Pizza Ordering & Inventory Platform

**Prepared for:** Ahmed Iqbal
**Track:** Web Development & Designing — Level 3
**Internship:** Oasis Infobyte SIP (AICTE)
**Document version:** 1.0

---

## 1. Overview

SliceHub is a production-style, full-stack pizza ordering platform with two
distinct experiences: a **customer-facing ordering app** and an **admin
operations dashboard**. The customer builds a custom pizza step-by-step, pays
through a test-mode Razorpay checkout, and tracks their order in real time.
The admin manages inventory, watches stock levels, and moves orders through
a kitchen workflow — with the system automatically emailing the admin when
any ingredient runs low.

This PRD defines *what* the product does and *why*, in plain business
language, so it can be handed to an AI coding tool (or a human developer)
as the single source of truth for scope.

## 2. Problem Statement

A small pizza business currently takes orders by phone and tracks stock on
paper. This causes three recurring problems:

1. **No visibility for the customer** — they don't know if their order is
   being made or already out for delivery.
2. **No visibility for the business** — ingredients run out mid-shift
   because nobody notices stock dropping until it's gone.
3. **No structured order history** — there's no reliable record of what was
   ordered, when, or by whom.

SliceHub solves all three with a connected ordering + inventory system.

## 3. Goals & Success Criteria

| Goal | Success looks like |
|---|---|
| Customers can self-serve an order end-to-end | Register → build pizza → pay → see live status, no manual intervention |
| Admin always knows stock levels | Dashboard shows real quantities; stock auto-decrements per order |
| Admin is warned before running out | Email fires automatically when any item crosses its threshold |
| Orders are trackable | Every order has a visible state that both sides can see update in real time |
| System is demo-able end-to-end | A single walkthrough (register → order → pay → admin updates status → user sees it change) works without errors |

## 4. Out of Scope (for this submission)

To keep the build achievable within the internship deadline, the following
are explicitly **not** required for v1:

- Real money / live Razorpay keys (test mode only, per task brief)
- Native mobile apps (web-responsive only)
- Delivery-partner-facing app or GPS tracking
- Multi-restaurant / multi-tenant support
- SMS notifications (email only, per task brief)
- Refunds/cancellation workflow (documented as a "future work" item only)

## 5. User Roles

### 5.1 Customer (User)
A person ordering pizza for themselves. Can register, log in, build and pay
for an order, and watch its status change.

### 5.2 Admin
Restaurant staff/owner. Logs in through a **separate, non-public** admin
login. Manages inventory and moves orders through their lifecycle.

> Note: Admin accounts are not created through the public registration
> flow. For this academic build, one admin account is seeded directly in
> the database (documented in the README) — there is no "become an admin"
> self-service path, matching the task brief's requirement that admin
> login be inaccessible from user registration.

## 6. User Stories

### Customer stories
1. As a new customer, I want to register with my email so I can place orders.
2. As a returning customer, I want to log in and stay logged in across page
   refreshes so I don't have to re-authenticate constantly.
3. As a customer who forgot my password, I want to reset it via an emailed
   link so I'm not locked out permanently.
4. As a customer, I want to build a pizza step-by-step (base → sauce →
   cheese → veggies) so I can customize exactly what I want.
5. As a customer, I want to see an order summary with the total price
   before I pay, so there are no surprises.
6. As a customer, I want to pay through a familiar checkout (Razorpay) so I
   trust the payment is secure.
7. As a customer, I want to see my order's status update (Received → In
   Kitchen → Sent to Delivery) without refreshing manually, so I know when
   to expect my food.

### Admin stories
8. As an admin, I want to log in separately from customers so my access is
   clearly distinct and protected.
9. As an admin, I want to see current stock of every ingredient at a glance
   so I can plan prep.
10. As an admin, I want stock to decrease automatically when an order is
    placed, so I don't have to update it by hand.
11. As an admin, I want to manually correct stock (e.g., after a delivery
    of fresh ingredients) so the numbers stay accurate.
12. As an admin, I want an email the moment any ingredient drops below a
    threshold I've set, so I never get caught out mid-shift.
13. As an admin, I want to see all incoming orders and change their status,
    so the kitchen workflow is reflected in the system.

## 7. Feature Requirements

### 7.1 Authentication
- Email/password registration with **email verification** before first
  login is allowed.
- JWT-based login/session for both customer and admin (separate token
  scopes — an admin token must never authorize customer-only actions and
  vice versa).
- "Forgot password" flow: request → emailed reset link (time-limited
  token) → set new password.
- Passwords hashed (bcrypt) — never stored or logged in plain text.

### 7.2 Pizza Builder (Customer)
A guided 4-step flow, each step required before the next unlocks:
1. **Base** — choose 1 of 5 options (e.g., Thin Crust, Deep Pan, Stuffed
   Crust, Whole Wheat, Gluten-Free)
2. **Sauce** — choose 1 of 5 options (e.g., Tomato, BBQ, Pesto, White
   Garlic, Spicy Arrabbiata)
3. **Cheese** — choose 1 cheese type
4. **Vegetables** — multi-select from a toppings list

Each step shows a running price. The final screen is an **order summary**
(itemized: base, sauce, cheese, toppings, price) before payment.

### 7.3 Checkout
- Razorpay Checkout integrated in **test mode** only.
- On the test "Success" action, the order is confirmed and stock is
  decremented.
- On failure/cancellation, the order is not confirmed and stock is
  untouched — the customer sees a clear retry option.

### 7.4 Order Tracking (Customer-facing)
- Dashboard shows the customer's current and past orders.
- Each order shows one of three states: **Order Received → In Kitchen →
  Sent to Delivery**.
- Status updates reflect on the customer's screen without a manual page
  refresh (polling is acceptable; WebSockets is a stretch goal — see TRD).

### 7.5 Inventory Management (Admin)
- Dashboard lists every ingredient (bases, sauces, cheeses, vegetables)
  with current quantity.
- Quantity auto-decrements by the amount used whenever an order is
  confirmed (paid).
- Admin can manually edit any quantity (e.g., after restocking).
- Each ingredient has a **configurable low-stock threshold** (e.g., pizza
  bases < 20 units).
- When any item crosses below its threshold, the system automatically
  sends an email to the admin (via a scheduled job, not a real-time
  trigger — see TRD for the node-cron design).

### 7.6 Order Management (Admin)
- A panel listing all incoming orders with customer name, order contents,
  total, and current status.
- Admin can change an order's status; this change becomes visible on the
  customer's dashboard.

## 8. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Security | Passwords hashed, JWT auth on all protected routes, admin routes fully separated from user routes, no secrets committed to the repo (`.env` + `.gitignore`) |
| Usability | Mobile-responsive; every button/link functional; loading and error states shown for all async actions |
| Reliability | Stock updates and order confirmation are atomic — a failed payment must never decrement stock |
| Performance | Pages should load without visible layout shift; images/assets lazy-loaded where applicable |
| Demonstrability | The entire flow (register → order → pay test-success → admin updates status → customer sees update) must be repeatable live for the demo video |

## 9. Assumptions

- "Real-time" is satisfied by short-interval polling (e.g., every 5–10
  seconds) rather than a persistent WebSocket connection, unless time
  permits the stretch goal.
- A single seeded admin account is acceptable for this academic
  submission (no admin-invite system needed).
- Razorpay test mode does not require KYC and uses the standard
  `rzp_test_` key pair.
- Email sending uses a free/test SMTP provider (e.g., Gmail app password
  or Mailtrap) — not a production email service.

## 10. Open Questions (for Ahmed to decide before/while building)

- Final list of base/sauce/cheese/topping options and their prices (any
  realistic set is fine — document the final list in the README).
- Low-stock threshold values per ingredient (defaults can be hardcoded,
  e.g., 20 units).
- Whether polling interval is 5s or 10s (affects perceived "real-timeness"
  vs. server load — either is acceptable for this submission).

## 11. Deliverable Mapping (per OIBSIP task brief)

| Task brief requirement | Where it's covered |
|---|---|
| User registration + email verification | §7.1 |
| JWT-based login | §7.1 |
| Forgot password flow | §7.1 |
| Custom pizza builder (4 steps) | §7.2 |
| Order summary before payment | §7.2 |
| Razorpay checkout (test mode) | §7.3 |
| Real-time order status | §7.4 |
| Separate admin login | §7.1, §5.2 |
| Inventory dashboard | §7.5 |
| Auto stock decrement | §7.5 |
| Manual stock update | §7.5 |
| Automated low-stock email (node-cron) | §7.5 |
| Order management panel | §7.6 |
| Status change reflected on user side | §7.4, §7.6 |
