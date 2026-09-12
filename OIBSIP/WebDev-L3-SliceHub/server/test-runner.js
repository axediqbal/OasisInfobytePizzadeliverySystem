/**
 * SliceHub Full-Stack End-to-End Automated Test Suite
 * Tests all user and admin journeys, database persistence, atomic decrements, and status tracking.
 */
const http = require('http');
const mongoose = require('mongoose');
const app = require('./server');
const InventoryItem = require('./models/InventoryItem');
const Order = require('./models/Order');
const User = require('./models/User');
const { runLowStockCheck } = require('./jobs/lowStockCheck');

let server;
let port;
let baseUrl;

// Helper: Make HTTP request
function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({ status: res.statusCode, data: json });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Assert helper
let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failCount++;
  }
}

async function runTests() {
  console.log('\n=============================================================');
  console.log('🍕 SLICEHUB AUTOMATED END-TO-END TEST SUITE STARTING');
  console.log('=============================================================\n');

  // Start server on dynamic port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      console.log(`[Test Server] Running on ${baseUrl}\n`);
      resolve();
    });
  });

  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  let customerToken = null;
  let customerUserId = null;
  let adminToken = null;
  let sampleOrder = null;
  let testBase = null;
  let testSauce = null;
  let testCheese = null;
  let testVeggie = null;
  let baseInitialQty = 0;

  try {
    // -----------------------------------------------------------------
    // TEST 1: Health Check Endpoint
    // -----------------------------------------------------------------
    console.log('🔍 [SUITE 1] API Health & Database Connectivity');
    const healthRes = await request('GET', '/api/health');
    assert(healthRes.status === 200, 'GET /api/health returned HTTP 200');
    assert(healthRes.data.status === 'online', 'API health status is "online"');
    assert(healthRes.data.dbState === 'connected', 'MongoDB connection is confirmed active');

    // -----------------------------------------------------------------
    // TEST 2: Customer Registration & Email Verification Flow
    // -----------------------------------------------------------------
    console.log('\n🔍 [SUITE 2] User Registration & Verification Flow');
    const registerRes = await request('POST', '/api/auth/register', {
      name: 'Test Customer',
      email: testEmail,
      password: testPassword,
    });
    assert(registerRes.status === 201, 'POST /api/auth/register returned HTTP 201 Created');
    assert(registerRes.data.success === true, 'Registration marked success');

    // Fetch user from DB to obtain emailVerificationToken
    const registeredUser = await User.findOne({ email: testEmail }).select('+emailVerificationToken');
    assert(Boolean(registeredUser), 'User found persisted in MongoDB');
    assert(registeredUser.isEmailVerified === false, 'User is initially unverified');

    const verifyRes = await request('GET', `/api/auth/verify-email?token=${registeredUser.emailVerificationToken}`);
    assert(verifyRes.status === 200, 'GET /api/auth/verify-email returned HTTP 200');
    
    const verifiedUser = await User.findOne({ email: testEmail });
    assert(verifiedUser.isEmailVerified === true, 'User isEmailVerified successfully toggled to true in DB');

    // -----------------------------------------------------------------
    // TEST 3: Customer Login & JWT Generation
    // -----------------------------------------------------------------
    console.log('\n🔍 [SUITE 3] User Login & Authentication');
    const loginRes = await request('POST', '/api/auth/login', {
      email: testEmail,
      password: testPassword,
    });
    assert(loginRes.status === 200, 'POST /api/auth/login returned HTTP 200');
    assert(Boolean(loginRes.data.token), 'JWT token returned upon login');
    assert(loginRes.data.user.email === testEmail, 'User profile returned in login response');
    customerToken = loginRes.data.token;
    customerUserId = loginRes.data.user.id;

    // -----------------------------------------------------------------
    // TEST 4: Catalog Ingredients Fetching
    // -----------------------------------------------------------------
    console.log('\n🔍 [SUITE 4] Catalog & Ingredients API');
    const catalogRes = await request('GET', '/api/catalog');
    assert(catalogRes.status === 200, 'GET /api/catalog returned HTTP 200');
    assert(Array.isArray(catalogRes.data.data.bases) && catalogRes.data.data.bases.length > 0, 'Bases catalog populated');
    assert(Array.isArray(catalogRes.data.data.sauces) && catalogRes.data.data.sauces.length > 0, 'Sauces catalog populated');
    assert(Array.isArray(catalogRes.data.data.cheeses) && catalogRes.data.data.cheeses.length > 0, 'Cheeses catalog populated');
    assert(Array.isArray(catalogRes.data.data.vegetables) && catalogRes.data.data.vegetables.length > 0, 'Vegetables catalog populated');

    testBase = catalogRes.data.data.bases[0];
    testSauce = catalogRes.data.data.sauces[0];
    testCheese = catalogRes.data.data.cheeses[0];
    testVeggie = catalogRes.data.data.vegetables[0];

    // Record initial base quantity
    const baseDbItem = await InventoryItem.findById(testBase._id);
    baseInitialQty = baseDbItem.quantity;

    // -----------------------------------------------------------------
    // TEST 5: Custom Pizza Order Creation
    // -----------------------------------------------------------------
    console.log('\n🔍 [SUITE 5] 4-Step Custom Pizza Builder Order Creation');
    const orderPayload = {
      baseId: testBase._id,
      sauceId: testSauce._id,
      cheeseId: testCheese._id,
      vegetableIds: [testVeggie._id],
    };

    const createOrderRes = await request('POST', '/api/orders', orderPayload, customerToken);
    assert(createOrderRes.status === 201, 'POST /api/orders returned HTTP 201 Created');
    assert(createOrderRes.data.success === true, 'Order created successfully');
    sampleOrder = createOrderRes.data.data;
    assert(sampleOrder.paymentStatus === 'pending', 'Order paymentStatus initialized as "pending"');
    assert(sampleOrder.base._id.toString() === testBase._id.toString(), 'Order base subdocument preserves _id');
    assert(sampleOrder.sauce._id.toString() === testSauce._id.toString(), 'Order sauce subdocument preserves _id');
    assert(sampleOrder.cheese._id.toString() === testCheese._id.toString(), 'Order cheese subdocument preserves _id');
    assert(sampleOrder.vegetables[0]._id.toString() === testVeggie._id.toString(), 'Order veggie subdocument preserves _id');

    // -----------------------------------------------------------------
    // TEST 6: Razorpay Order Creation & Payment Verification with Atomic Decrement
    // -----------------------------------------------------------------
    console.log('\n🔍 [SUITE 6] Razorpay Simulation & Atomic Stock Decrement');
    const rzpOrderRes = await request('POST', `/api/orders/${sampleOrder._id}/create-razorpay-order`, {}, customerToken);
    assert(rzpOrderRes.status === 200, 'POST /create-razorpay-order returned HTTP 200');
    assert(Boolean(rzpOrderRes.data.razorpayOrderId), 'Razorpay Order ID generated');

    const paymentVerificationRes = await request('POST', `/api/orders/${sampleOrder._id}/verify-payment`, {
      razorpay_order_id: rzpOrderRes.data.razorpayOrderId,
      razorpay_payment_id: `pay_test_${Date.now()}`,
      razorpay_signature: 'test_mode_simulation_signature',
    }, customerToken);

    assert(paymentVerificationRes.status === 200, 'POST /verify-payment returned HTTP 200');
    assert(paymentVerificationRes.data.data.paymentStatus === 'paid', 'Order paymentStatus updated to "paid"');
    assert(paymentVerificationRes.data.data.orderStatus === 'Order Received', 'Order status set to "Order Received"');

    // Verify ATOMIC STOCK DECREMENT in database
    const baseAfterPayment = await InventoryItem.findById(testBase._id);
    assert(baseAfterPayment.quantity === baseInitialQty - 1, `Base inventory quantity atomically decremented from ${baseInitialQty} to ${baseAfterPayment.quantity}`);

    // -----------------------------------------------------------------
    // TEST 7: Customer Order History & Live Sync
    // -----------------------------------------------------------------
    console.log('\n🔍 [SUITE 7] Customer Order History (/mine)');
    const myOrdersRes = await request('GET', '/api/orders/mine', null, customerToken);
    assert(myOrdersRes.status === 200, 'GET /api/orders/mine returned HTTP 200');
    assert(Array.isArray(myOrdersRes.data.data), 'Order list is an array');
    assert(myOrdersRes.data.data.some(o => o._id === sampleOrder._id), 'Newly created order found in user order list');

    // -----------------------------------------------------------------
    // TEST 8: Admin Authentication & Access Control
    // -----------------------------------------------------------------
    console.log('\n🔍 [SUITE 8] Admin Authentication & RBAC');
    const adminLoginRes = await request('POST', '/api/admin/login', {
      email: 'admin@slicehub.test',
      password: 'ChangeMe123!',
    });
    assert(adminLoginRes.status === 200, 'POST /api/admin/login returned HTTP 200');
    assert(adminLoginRes.data.user.role === 'admin', 'Admin role verified in token');
    adminToken = adminLoginRes.data.token;

    // Verify non-admin blocked from admin endpoints
    const blockedRes = await request('GET', '/api/admin/inventory', null, customerToken);
    assert(blockedRes.status === 403, 'Customer token correctly blocked with HTTP 403 on admin endpoint');

    // -----------------------------------------------------------------
    // TEST 9: Admin Inventory Stock Management
    // -----------------------------------------------------------------
    console.log('\n🔍 [SUITE 9] Admin Inventory Management');
    const adminInventoryRes = await request('GET', '/api/admin/inventory', null, adminToken);
    assert(adminInventoryRes.status === 200, 'GET /api/admin/inventory returned HTTP 200');
    assert(adminInventoryRes.data.data.length >= 21, 'Admin inventory lists all seeded ingredients');

    // Update item stock/price
    const updateInventoryRes = await request('PATCH', `/api/admin/inventory/${testBase._id}`, {
      quantity: 99,
      threshold: 15,
      price: 199,
    }, adminToken);
    assert(updateInventoryRes.status === 200, 'PATCH /api/admin/inventory/:id returned HTTP 200');
    assert(updateInventoryRes.data.data.quantity === 99, 'Item quantity updated to 99 in DB');
    assert(updateInventoryRes.data.data.price === 199, 'Item price updated to 199 in DB');

    // -----------------------------------------------------------------
    // TEST 10: Admin Kitchen Queue & Order Status Progression
    // -----------------------------------------------------------------
    console.log('\n🔍 [SUITE 10] Admin Kitchen Queue & Order Dispatch Progression');
    const adminOrdersRes = await request('GET', '/api/admin/orders', null, adminToken);
    assert(adminOrdersRes.status === 200, 'GET /api/admin/orders returned HTTP 200');
    assert(adminOrdersRes.data.data.some(o => o._id === sampleOrder._id), 'Customer order appears in admin queue');

    // Progress to "In Kitchen"
    const progressKitchenRes = await request('PATCH', `/api/admin/orders/${sampleOrder._id}/status`, {
      orderStatus: 'In Kitchen',
    }, adminToken);
    assert(progressKitchenRes.status === 200, 'Progressed status to "In Kitchen"');
    assert(progressKitchenRes.data.data.orderStatus === 'In Kitchen', 'DB reflects "In Kitchen"');

    // Progress to "Sent to Delivery"
    const progressDeliveryRes = await request('PATCH', `/api/admin/orders/${sampleOrder._id}/status`, {
      orderStatus: 'Sent to Delivery',
    }, adminToken);
    assert(progressDeliveryRes.status === 200, 'Progressed status to "Sent to Delivery"');
    assert(progressDeliveryRes.data.data.orderStatus === 'Sent to Delivery', 'DB reflects "Sent to Delivery"');

    // Verify Customer sees new status in live polling
    const customerOrderCheck = await request('GET', `/api/orders/${sampleOrder._id}`, null, customerToken);
    assert(customerOrderCheck.data.data.orderStatus === 'Sent to Delivery', 'Customer live poll confirms status updated to "Sent to Delivery"');

    // -----------------------------------------------------------------
    // TEST 11: Low Stock Cron Job Verification
    // -----------------------------------------------------------------
    console.log('\n🔍 [SUITE 11] Low-Stock Cron Job Alert Verification');
    // Set an item below threshold
    await InventoryItem.findByIdAndUpdate(testVeggie._id, { quantity: 2, threshold: 20 });
    await runLowStockCheck();
    const updatedLowItem = await InventoryItem.findById(testVeggie._id);
    assert(Boolean(updatedLowItem.lastAlertedAt), 'Low stock cron executed and marked lastAlertedAt timestamp');

    // Restore item
    await InventoryItem.findByIdAndUpdate(testVeggie._id, { quantity: 50, threshold: 20 });

  } catch (error) {
    console.error('❌ Unhandled Test Suite Exception:', error);
    failCount++;
  } finally {
    if (server) {
      server.close();
    }
  }

  console.log('\n=============================================================');
  console.log(`🏁 TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('=============================================================\n');

  if (failCount > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ALL AUTOMATED TESTS COMPLETED WITH 100% SUCCESS!');
    process.exit(0);
  }
}

runTests();
