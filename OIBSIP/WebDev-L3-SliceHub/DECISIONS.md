# Architecture & Implementation Decisions (DECISIONS.md)

This document records the specific design and technical decisions made during the implementation of **SliceHub**, per the guidelines in `05_Implementation_Prompt_for_Agent.md`.

---

## 1. Ingredient Catalog & Pricing Decisions

The planning docs specified category structures and 5 bases / 5 sauces minimum. The following realistic culinary selection and pricing in Indian Rupees (₹) were configured in `server/seed.js`:

### Crust Bases (5 options)
- **Classic Thin Crust**: ₹150 (Default 50 units, Threshold: 20)
- **Deep Pan Crust**: ₹180 (Default 50 units, Threshold: 20)
- **Cheese Stuffed Crust**: ₹220 (Default 40 units, Threshold: 20)
- **Whole Wheat Organic Crust**: ₹170 (Default 45 units, Threshold: 20)
- **Gluten-Free Artisan Crust**: ₹210 (Default 35 units, Threshold: 15)

### Artisan Sauces (5 options)
- **San Marzano Tomato Sauce**: ₹40 (Default 60 units, Threshold: 20)
- **Smoky Chipotle BBQ Sauce**: ₹50 (Default 50 units, Threshold: 20)
- **Genovese Basil Pesto**: ₹60 (Default 40 units, Threshold: 15)
- **Creamy White Garlic Alfredo**: ₹55 (Default 45 units, Threshold: 20)
- **Spicy Arrabbiata Marinara**: ₹45 (Default 55 units, Threshold: 20)

### Cheeses (3 options)
- **Fior di Latte Mozzarella**: ₹70 (Default 80 units, Threshold: 25)
- **Sharp Cheddar & Gouda Blend**: ₹85 (Default 60 units, Threshold: 20)
- **Creamy Cashew Vegan Mozzarella**: ₹95 (Default 40 units, Threshold: 15)

### Fresh Vegetables & Herbs (8 options)
- **Button & Portobello Mushrooms**: ₹35 (Default 60 units, Threshold: 20)
- **Crisp Bell Pepper Medley**: ₹30 (Default 70 units, Threshold: 20)
- **Charred Red Onions**: ₹25 (Default 80 units, Threshold: 25)
- **Kalamata Black Olives**: ₹40 (Default 55 units, Threshold: 20)
- **Fire-Pickled Jalapeños**: ₹35 (Default 60 units, Threshold: 20)
- **Sweet Golden Corn**: ₹30 (Default 65 units, Threshold: 20)
- **Fresh Genovese Basil Leaves**: ₹25 (Default 50 units, Threshold: 15)
- **Slow-Roasted Cherry Tomatoes**: ₹35 (Default 55 units, Threshold: 20)

---

## 2. Real-Time Status Polling Interval

- **Decision**: 5-second interval (`5000ms`) via `setInterval` inside `client/src/pages/user/Dashboard.jsx`.
- **Rationale**: 5 seconds provides an immediate, responsive feeling when the admin updates an order status in `/admin/orders`, while remaining lightweight on CPU and network bandwidth.

---

## 3. Low-Stock Cron Frequency & Alert Throttling

- **Decision**: Scheduled `node-cron` job runs every 15 minutes (`*/15 * * * *`).
- **Throttling Refinement**: To prevent flooding the admin's inbox if stock remains low across several orders, an item is only included in the digest alert if it has not been alerted in the past 60 minutes (`lastAlertedAt` check).

---

## 4. 3D Hero Modeling Architecture

- **Decision**: Built an interactive procedural 3D artisan pizza in React Three Fiber with crust torus, sauce cylinder, melted cheese geometry, and individually positioned roasted tomato slices, mushroom caps, and basil leaves.
- **Rationale**: Procedural Three.js geometry avoids external binary `.gltf` network failures, guarantees instant load times, zero external CORS asset blockers, and allows full dynamic color control while respecting the `prefers-reduced-motion` accessibility standard.

---

## 5. Dev-Friendly Fallbacks for Payment & SMTP

- **Decision**: Implemented seamless test simulations for Razorpay and Nodemailer when external API credentials are not yet added to `.env`.
- **Rationale**: Allows any reviewer or evaluator to run `npm install && npm run dev` and test the entire register → email verification → build → pay → admin status cycle end-to-end immediately without needing pre-existing live API keys.
