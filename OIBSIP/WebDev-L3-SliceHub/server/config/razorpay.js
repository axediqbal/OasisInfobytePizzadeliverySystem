const Razorpay = require('razorpay');

let razorpayInstance = null;

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_slicehub_dummy_key';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'slicehub_dummy_secret';

  if (!razorpayInstance) {
    try {
      razorpayInstance = new Razorpay({
        key_id,
        key_secret,
      });
    } catch (err) {
      console.warn('[Razorpay] Initialization warning:', err.message);
    }
  }

  return {
    instance: razorpayInstance,
    key_id,
    key_secret,
    isConfigured: Boolean(
      process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      !process.env.RAZORPAY_KEY_ID.includes('your_') &&
      !process.env.RAZORPAY_KEY_ID.includes('demo')
    )
  };
};

module.exports = getRazorpayInstance;

