# Technical Requirements Document (TRD)
## Project: SliceHub — Full-Stack Pizza Ordering & Inventory Platform

**Prepared for:** Ahmed Iqbal
**Track:** Web Development & Designing — Level 3
**Document version:** 1.0
**Companion documents:** PRD, UI/UX Design Document, Backend Schema

---

## 1. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React (Vite) | Functional components + hooks |
| Frontend state | React Context + `useReducer`, or Redux Toolkit if preferred | Auth state, cart/builder state |
| Styling | Tailwind CSS | Matches Level 3's need for a polished, non-default UI |
| Backend | Node.js + Express.js | REST API |
| Database | MongoDB (Atlas free tier or local) | Via Mongoose ODM |
| Auth | JWT (`jsonwebtoken`) + `bcrypt` for hashing | Access token in httpOnly cookie or Authorization header (pick one, document it) |
| Payments | Razorpay Node SDK, test mode (`rzp_test_` keys) | Order creation + signature verification |
| Email | Nodemailer + Gmail App Password or Mailtrap (dev SMTP) | Verification links, password reset, low-stock alerts |
| Scheduled jobs | `node-cron` | Low-stock check job |
| Real-time updates | Polling (`setInterval` + REST GET) for v1; Socket.IO as stretch goal | See §6 |
| 3D hero (landing page only) | `three`, `@react-three/fiber`, `@react-three/drei` | Single glTF pizza model, lazy-loaded, poster fallback — see UI/UX §3.1 |

## 2. High-Level Architecture

```
┌─────────────────┐         HTTPS/REST          ┌──────────────────┐
│  React Frontend  │ ───────────────────────────▶│  Express API      │
│  (Vite, Tailwind)│ ◀─────────────────────────── │  (Node.js)         │
└─────────────────┘        JSON responses         └──────────────────┘
                                                          │
                          ┌───────────────────────────────┼─────────────────────┐
                          ▼                               ▼                     ▼
                  ┌───────────────┐              ┌────────────────┐   ┌──────────────────┐
                  │   MongoDB      │              │  Razorpay API   │   │  SMTP (Nodemailer)│
                  │ (Users, Orders,│              │  (test mode)    │   │  verification,     │
                  │  Inventory)    │              └────────────────┘   │  reset, alerts      │
                  └───────────────┘                                    └──────────────────┘
                          ▲
                          │
                  ┌───────────────┐
                  │  node-cron job │  (runs every N minutes, checks inventory,
                  │                │   triggers email if below threshold)
                  └───────────────┘
```

## 3. Folder Structure

```
OIBSIP/WebDev-L3-SliceHub/
├── client/                      # React frontend
│   ├── src/
│   │   ├── api/                 # axios instance + endpoint wrappers
│   │   ├── components/
│   │   ├── context/              # AuthContext, BuilderContext
│   │   ├── pages/
│   │   │   ├── user/             # Login, Register, Builder, OrderSummary, Dashboard
│   │   │   └── admin/            # AdminLogin, Inventory, Orders
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/                      # Express backend
│   ├── config/                   # db.js, razorpay.js, mailer.js
│   ├── models/                   # User.js, Order.js, InventoryItem.js
│   ├── routes/                   # auth.routes.js, order.routes.js, inventory.routes.js, admin.routes.js
│   ├── controllers/
│   ├── middleware/               # auth.js (JWT verify), adminOnly.js, errorHandler.js
│   ├── jobs/                     # lowStockCheck.js (node-cron)
│   ├── server.js
│   └── package.json
├── README.md
└── .env.example                  # never commit real .env
```

## 4. API Design

All routes prefixed `/api`. Protected routes require `Authorization: Bearer <token>`.

### 4.1 Auth
| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create user, send verification email |
| GET | `/api/auth/verify-email?token=` | Public | Confirm email, activate account |
| POST | `/api/auth/login` | Public | Return JWT on valid credentials |
| POST | `/api/auth/forgot-password` | Public | Email reset link |
| POST | `/api/auth/reset-password` | Public | Set new password with valid token |
| POST | `/api/admin/login` | Public (separate route) | Return admin-scoped JWT |

### 4.2 Catalog / Builder
| Method | Route | Access | Purpose |
|---|---|---|---|
| GET | `/api/catalog` | Public | Return available bases, sauces, cheeses, veggies + prices |

### 4.3 Orders
| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/api/orders` | User | Create a pending order (before payment) |
| POST | `/api/orders/:id/create-razorpay-order` | User | Get Razorpay `order_id` for checkout |
| POST | `/api/orders/:id/verify-payment` | User | Verify signature, mark order paid, decrement stock |
| GET | `/api/orders/mine` | User | List logged-in user's orders (for polling) |
| GET | `/api/admin/orders` | Admin | List all orders |
| PATCH | `/api/admin/orders/:id/status` | Admin | Update order status |

### 4.4 Inventory
| Method | Route | Access | Purpose |
|---|---|---|---|
| GET | `/api/admin/inventory` | Admin | List all ingredients + quantities + thresholds |
| PATCH | `/api/admin/inventory/:id` | Admin | Manually update quantity/threshold |

## 5. Payment Flow (Razorpay, test mode)

This follows Razorpay's standard order-then-verify pattern:

1. **Frontend** requests order creation → **Backend** calls
   `razorpay.orders.create({ amount, currency: "INR", receipt })` and
   returns the Razorpay `order_id` to the frontend.
2. **Frontend** opens Razorpay Checkout using that `order_id` (test mode
   keys only — `rzp_test_...`).
3. On completion, Razorpay returns `razorpay_order_id`,
   `razorpay_payment_id`, and `razorpay_signature` to the frontend.
4. **Frontend** sends these three values to
   `POST /api/orders/:id/verify-payment`.
5. **Backend** recomputes the expected signature:
   ```js
   const crypto = require('crypto');
   const body = razorpay_order_id + "|" + razorpay_payment_id;
   const expectedSignature = crypto
     .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
     .update(body)
     .digest('hex');
   // compare expectedSignature to razorpay_signature
   ```
6. If signatures match: mark order `paid`, decrement inventory
   atomically, set status to `Order Received`. If they don't match:
   reject, do not touch inventory.

> **Security note:** signature verification must happen server-side only.
> Never trust a "payment succeeded" message from the frontend alone —
> that is exactly what signature verification exists to prevent
> (a user forging a success callback without actually paying).

## 6. Real-Time Order Status

**v1 approach — polling (required):**
The customer's order dashboard calls `GET /api/orders/mine` on a
`setInterval` (every 5–10 seconds) while the tab is open, and re-renders
if status has changed. Simple, reliable, sufficient for a demo.

**Stretch goal — Socket.IO:**
If time allows, replace polling with a Socket.IO room per user; the admin
status-update endpoint emits an event to that room. Not required for
minimum completion — document in the README which approach was used.

## 7. Low-Stock Alert Job (node-cron)

```js
// jobs/lowStockCheck.js
const cron = require('node-cron');
const InventoryItem = require('../models/InventoryItem');
const { sendLowStockEmail } = require('../config/mailer');

// Runs every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  const lowItems = await InventoryItem.find({
    $expr: { $lt: ['$quantity', '$threshold'] }
  });
  if (lowItems.length > 0) {
    await sendLowStockEmail(lowItems); // one digest email, not one per item
  }
});
```

Key design decisions to document in the README:
- The job runs on an **interval**, not on every single order — this
  avoids spamming the admin's inbox if stock crosses the threshold and
  stays low across several orders in a row.
- Consider adding a `lastAlertedAt` field per item to avoid re-sending
  the same alert every 15 minutes once already notified (optional
  polish, not required for minimum completion).

## 8. Authentication & Authorization

- JWT payload includes `{ id, role: "user" | "admin" }`.
- Middleware `auth.js` verifies the token on protected routes.
- Middleware `adminOnly.js` additionally checks `role === "admin"` and
  rejects (403) otherwise — this is what keeps admin routes inaccessible
  to regular users, per the task brief.
- Admin login is a **separate endpoint and separate frontend page**
  (`/admin/login`), not a role toggle on the normal login form.

## 9. Error Handling & Edge Cases

| Case | Required behavior |
|---|---|
| Payment fails/cancelled | Order stays `pending`, stock untouched, user sees retry option |
| Two orders try to decrement the last unit of an ingredient simultaneously | Use a MongoDB atomic update (`findOneAndUpdate` with a quantity check) to prevent negative stock |
| Invalid/expired reset-password token | Clear error message, no crash |
| Admin tries a user-only route with a user token | 403 Forbidden |
| Email service temporarily down | Registration/order still succeeds; email failure is logged, not fatal to the request |

## 10. Environment Variables (`.env.example`)

```
MONGO_URI=
JWT_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
CLIENT_URL=http://localhost:5173
```

`.env` must be in `.gitignore` — only `.env.example` (no real values) is
committed, per the task brief's security expectations.

## 11. Testing Approach (lightweight, for demo confidence)

Given the timeline, formal test suites are not required by the task
brief, but a manual test checklist should be run before recording the
demo video:

- [ ] Register → verify email link → login works
- [ ] Forgot password → reset link → new password works
- [ ] Full builder flow → order summary shows correct total
- [ ] Razorpay test payment succeeds → order appears as paid → stock
      decremented correctly
- [ ] Razorpay test payment cancelled → order stays pending → stock
      unchanged
- [ ] Admin login works from `/admin/login`, fails from `/login`
- [ ] Admin manually edits stock → reflected immediately
- [ ] Dropping an item below its threshold triggers the cron email
      (can temporarily set cron to `*/1 * * * *` for testing, then
      revert to `*/15 * * * *`)
- [ ] Admin changes order status → customer's dashboard reflects it
      within one polling interval

## 11.5 3D Hero Implementation Notes

The landing page hero uses a single 3D pizza model. Keep this isolated
so it can never break the rest of the app:

- Component: `client/src/components/PizzaHero3D.jsx`, dynamically
  imported (`React.lazy` + `Suspense`) so the Three.js bundle only loads
  when the landing page actually renders — it must not add weight to
  the builder, dashboard, or admin bundles.
- Fallback chain: poster `<img>` renders immediately → `Suspense`
  fallback stays as that same poster while the 3D bundle + glTF asset
  load → canvas swaps in once ready. If loading fails (network error,
  low-end device), catch it and keep the poster image indefinitely —
  the hero must never show a broken/blank canvas.
- Source a free CC0/permissively-licensed glTF pizza model (e.g., from
  Poly Pizza or Sketchfab's free/CC0 filter) rather than hand-modeling
  one — document the source and license in the README's credits
  section.
- Keep the model low-poly and the canvas capped at a reasonable pixel
  ratio (`Math.min(window.devicePixelRatio, 2)`) so it doesn't tank
  Core Web Vitals on mid-range phones.

## 12. Deployment Notes (optional, for a stronger submission)

Not required by the task brief, but if time allows:
- Frontend: Vercel or Netlify (static build)
- Backend: Render or Railway (free tier)
- MongoDB: Atlas free cluster
- Document the live demo URL in the README if deployed — strengthens
  the submission per the evaluation criteria ("project completeness and
  functionality").
