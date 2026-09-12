# SliceHub — Full-Stack Pizza Ordering & Inventory Platform 🍕

**Oasis Infobyte SIP — Level 3 Web Development & Designing Project**  
**Author:** Ahmed Iqbal  
**Architecture:** MERN Stack (MongoDB, Express, React/Vite, Node.js) with Tailwind CSS, 3D Hero, and Razorpay Checkout

---

## 📖 1. Project Overview

**SliceHub** is a production-style, end-to-end pizza ordering and kitchen inventory platform. It features two interconnected applications:
1. **Customer-Facing App**: 4-step artisan pizza customizer (Base → Sauce → Cheese → Toppings) with a sticky real-time price rail, secure test-mode Razorpay checkout, email verification, password reset, and a live polling order status tracker.
2. **Admin Operations Dashboard**: Dedicated separate portal for kitchen managers to monitor ingredient inventory in real-time, receive automated `node-cron` low-stock digest emails, manually adjust stock quantities/thresholds, and advance orders through preparation stages (*Order Received → In Kitchen → Sent to Delivery*).

---

## 🛠️ 2. Tech Stack & Libraries

| Layer | Technologies | Purpose |
|---|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS | UI components, reactive state, OKLCH theme tokens |
| **Icons & Visuals** | Lucide React, Canvas Confetti | Modern UI icons & celebratory payment animations |
| **3D Graphics** | Three.js, `@react-three/fiber`, `@react-three/drei` | Interactive rotating pizza hero with poster fallback |
| **Routing & State** | React Router DOM v6, React Context API | Client-side routing, Auth & Pizza Builder state |
| **Backend API** | Node.js, Express.js | REST API, controllers, and custom middlewares |
| **Database** | MongoDB & Mongoose ODM | Documents with embedded snapshots & atomic updates |
| **Authentication** | JWT (`jsonwebtoken`), `bcryptjs` | Role-based token authentication (`user` vs `admin`) |
| **Payment Gateway** | Razorpay Node SDK (Test Mode) | Order creation & server-side HMAC-SHA256 signature verification |
| **Email Service** | Nodemailer | Verification links, password reset, low-stock alerts |
| **Scheduled Jobs** | `node-cron` | Automated background low-stock inventory scanner |
| **Test Runner** | Node Test Runner | 49-assertion automated end-to-end integration test suite |

---

## 🧪 3. Automated End-to-End Test Suite

SliceHub includes a native automated test suite verifying all customer and admin flows:
```bash
cd server
node test-runner.js
```
**Results:** 49/49 Passing assertions covering DB connectivity, registration, verification, JWT auth, custom pizza creation, Razorpay HMAC/simulation, atomic stock decrements, 5-second live polling, admin inventory editing, and kitchen dispatch lifecycle.


### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance on `mongodb://localhost:27017` or MongoDB Atlas URI)

### Step 1: Clone or Navigate to Project
```bash
cd OIBSIP/WebDev-L3-SliceHub
```

### Step 2: Configure Environment Variables
Copy the `.env.example` file to create your `.env` in both `server/` and root:
```bash
cp .env.example .env
```
*(Optionally provide your own Razorpay test keys or Gmail SMTP credentials. If left blank, the app will run with dev-safe simulated fallbacks!)*

### Step 3: Install Dependencies
Open two terminal windows:

**Terminal 1 (Backend Server):**
```bash
cd server
npm install
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm install
```

### Step 4: Seed Database (Admin & Catalog Items)
Run the automated seed script to populate the initial 5 bases, 5 sauces, 3 cheeses, 8 toppings, and the admin account:
```bash
cd server
npm run seed
# or: node seed.js
```

### Step 5: Start the Development Servers
**In Terminal 1 (Server):**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**In Terminal 2 (Client):**
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

Open `http://localhost:5173` in your browser!

---

## 🔑 4. Default Seeded Credentials

| Role | Login Route | Email | Password |
|---|---|---|---|
| **Admin** | `/admin/login` | `admin@slicehub.test` | `ChangeMe123!` |
| **Customer** | `/register` or `/login` | Register your own email | (Set during registration) |

*Note: In development mode, email verification links and reset links are printed directly to the server terminal console.*

---

## 📡 5. Real-Time Architecture: Polling vs. WebSockets

For this v1 release, **SliceHub utilizes short-interval polling (5 seconds)** via `setInterval` and `GET /api/orders/mine`.

### Why Polling Was Chosen for v1:
- **Zero Connection Overhead**: Extremely lightweight and resilient against network disconnects or sleeping tabs.
- **Immediate Consistency**: When kitchen staff change status in `/admin/orders`, the update reflects on the customer's dashboard in ≤ 5 seconds.
- **Production Simplicity**: Works seamlessly behind serverless proxies, CDNs, and load balancers without requiring WebSocket session stickiness.

---

## 🍕 6. 3D Hero Architecture & Fallback Chain

The landing page hero features an interactive, stone-baked 3D artisan pizza rendered using **Three.js, React Three Fiber, and Drei**:
1. **Lazy Loading**: `PizzaHero3D.jsx` is code-split via `React.lazy()` and `Suspense`, ensuring the 3D bundle is never loaded into builder, dashboard, or admin views.
2. **Graceful Fallback Chain**: A stylized poster renders instantly upon initial paint. Once WebGL assets mount, the interactive canvas smoothly swaps in.
3. **Error Resilience**: A React Error Boundary catches low-end devices or WebGL context failures and permanently preserves the clean poster view.
4. **Accessibility**: Respects `prefers-reduced-motion` by disabling auto-rotation.

---

## 🔮 7. Future Enhancements ("What I'd do with more time")

- **WebSocket (Socket.IO) Push Updates**: Upgrade from 5-second polling to persistent bi-directional rooms for zero-latency status broadcasts.
- **Refunds & Cancellation Workflow**: Automated Razorpay webhook integration for customer-initiated order cancellation before kitchen baking starts.
- **Live GPS Driver Dispatch**: Mapbox / Google Maps integration for live delivery scooter tracking.
- **Multi-Location Inventory**: Support for multi-branch pizza outlets with independent regional stock levels.

---

## 📄 License & Credits
- Built by Ahmed Iqbal for Oasis Infobyte SIP (AICTE Approved).
- Free procedural 3D model & Font assets via Google Fonts & Fontshare (Clash Display / Inter).
