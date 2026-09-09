# Backend Schema Document
## Project: SliceHub — Full-Stack Pizza Ordering & Inventory Platform

**Prepared for:** Ahmed Iqbal
**Track:** Web Development & Designing — Level 3
**Database:** MongoDB (via Mongoose)
**Document version:** 1.0

---

## 1. Entity Overview

```
User ──────< Order >──────── InventoryItem (referenced, not owned)
  │
  └── role: "user" (Admin is a separate, seeded document with role: "admin")

Order
  ├── customizations (embedded — base, sauce, cheese, veggies snapshot)
  ├── payment (embedded — Razorpay ids + status)
  └── status (enum, tracked over time)

InventoryItem
  └── category (enum: base | sauce | cheese | vegetable)
```

Design principle: **snapshot, don't just reference.** An order stores a
copy of the item names/prices at time of purchase (not just an ID pointing
at InventoryItem), so that if a topping's price or name changes later, past
orders still show what the customer actually paid for.

## 2. Collections

### 2.1 `users`

```js
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false // never returned by default queries
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
```

**Notes:**
- `passwordHash` — never store plain-text passwords; hash with bcrypt
  (`saltRounds: 10` is a reasonable default) before saving.
- Verification/reset tokens use `select: false` so a normal `User.find()`
  never accidentally leaks them in an API response.
- `role` distinguishes user vs. admin at the data level; the JWT middleware
  reads this to gate admin routes (see TRD §8).

### 2.2 `inventoryitems`

```js
const inventoryItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['base', 'sauce', 'cheese', 'vegetable'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  threshold: {
    type: Number,
    required: true,
    default: 20
  },
  lastAlertedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
```

**Notes:**
- `quantity` should never go negative — enforce this at the update level
  (see §4, atomic decrement pattern), not just with the schema `min: 0`,
  because schema validation alone doesn't prevent race conditions.
- `lastAlertedAt` supports the optional "don't re-email every 15 minutes
  for the same low item" refinement mentioned in the TRD.

### 2.3 `orders`

```js
const orderItemSnapshot = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  base: { type: orderItemSnapshot, required: true },
  sauce: { type: orderItemSnapshot, required: true },
  cheese: { type: orderItemSnapshot, required: true },
  vegetables: [orderItemSnapshot], // multi-select, can be empty array

  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },

  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },

  orderStatus: {
    type: String,
    enum: ['Order Received', 'In Kitchen', 'Sent to Delivery'],
    default: 'Order Received'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
```

**Notes:**
- `paymentStatus` and `orderStatus` are deliberately **separate fields.**
  A `pending` payment order should not appear in the admin's kitchen
  queue at all — only `paid` orders progress through `orderStatus`. This
  prevents unpaid abandoned carts from cluttering the kitchen view.
- `vegetables` is an array because the builder's veggie step is
  multi-select (per the PRD); `base`/`sauce`/`cheese` are single embedded
  documents because those steps are single-select.
- `createdAt` (from `timestamps: true`) doubles as the order's placed-at
  time for sorting the customer dashboard and admin order list.

## 3. Indexes

```js
userSchema.index({ email: 1 }, { unique: true });
orderSchema.index({ user: 1, createdAt: -1 }); // fast "my orders" lookup
orderSchema.index({ orderStatus: 1 });          // fast admin filtering
inventoryItemSchema.index({ category: 1 });
```

## 4. Critical Query Patterns

### 4.1 Atomic stock decrement (prevents overselling)

Never do a "read quantity, subtract in code, write back" pattern — that
has a race condition if two orders complete at nearly the same moment.
Instead, decrement and check in a single atomic operation:

```js
const result = await InventoryItem.findOneAndUpdate(
  { _id: itemId, quantity: { $gte: amountUsed } }, // only if enough stock
  { $inc: { quantity: -amountUsed } },
  { new: true }
);

if (!result) {
  // Not enough stock — reject the order at this line item
  throw new Error(`Insufficient stock for item ${itemId}`);
}
```

This must run for every ingredient in the order (base, sauce, cheese, each
vegetable) after payment signature verification succeeds — ideally inside
a MongoDB transaction (`session.startTransaction()`) if running a replica
set (Atlas gives you this by default); for a local single-node MongoDB
without replica sets, sequential atomic updates with rollback-on-failure
logic is an acceptable substitute for this academic project.

### 4.2 Low-stock scan (used by the node-cron job)

```js
const lowItems = await InventoryItem.find({
  $expr: { $lt: ['$quantity', '$threshold'] }
});
```

### 4.3 Customer's own orders (for dashboard polling)

```js
const myOrders = await Order.find({ user: req.user.id })
  .sort({ createdAt: -1 });
```

### 4.4 Admin order list with basic customer info

```js
const allOrders = await Order.find()
  .populate('user', 'name email')
  .sort({ createdAt: -1 });
```

## 5. Seed Data Requirements

Before the app is demoable, the database needs:

1. **One seeded admin user** — created via a one-off seed script (not the
   public register endpoint), e.g.:
   ```js
   await User.create({
     name: 'Admin',
     email: 'admin@slicehub.test',
     passwordHash: await bcrypt.hash('ChangeMe123!', 10),
     role: 'admin',
     isEmailVerified: true
   });
   ```
2. **Catalog inventory items** — at minimum 5 bases, 5 sauces, 1+ cheese
   options, and a topping list, each with a starting `quantity` above its
   `threshold` so the app starts in a "healthy stock" state for the demo.

Document the seed script's location and how to run it (e.g.,
`node server/seed.js`) in the README, per the OIBSIP submission
requirements.

## 6. Data Integrity Rules Summary

| Rule | Enforced by |
|---|---|
| Email is unique per user | Schema-level `unique: true` index |
| Password never stored in plain text | Application logic — hash before every save |
| Stock never goes negative | Atomic conditional update (§4.1), not just schema `min: 0` |
| Unpaid orders don't appear in kitchen workflow | `paymentStatus` gate before `orderStatus` is actioned |
| Verification/reset tokens don't leak in API responses | `select: false` on those fields |
| Order reflects price at time of purchase | Embedded snapshot subdocuments, not live references |
