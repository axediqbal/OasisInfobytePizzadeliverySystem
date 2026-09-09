import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, ArrowLeft, CheckCircle2, AlertCircle, Sparkles, Loader2, ChefHat } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const OrderSummary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/orders/${id}`);
        if (res.data.success) {
          setOrder(res.data.data);
          if (res.data.data.paymentStatus === 'paid') {
            setPaymentSuccess(true);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order summary.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  const handleRazorpayPayment = async () => {
    try {
      setProcessingPayment(true);
      setError(null);

      // Step 1: Create Razorpay Order on server
      const rzpOrderRes = await api.post(`/orders/${id}/create-razorpay-order`);
      const { razorpayOrderId, amount, currency, keyId, isSimulation } = rzpOrderRes.data;

      // If Razorpay SDK is available in browser and not pure simulation
      if (window.Razorpay && !isSimulation && keyId && !keyId.includes('dummy')) {
        const options = {
          key: keyId,
          amount,
          currency: currency || 'PKR',
          name: 'SliceHub Pizza',
          description: `Custom Artisan Pizza Order #${id.slice(-6)}`,
          image: '/pizza-icon.svg',
          order_id: razorpayOrderId,
          handler: async function (response) {
            try {
              // Step 2: Verify signature on server
              const verifyRes = await api.post(`/orders/${id}/verify-payment`, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes.data.success) {
                confetti({
                  particleCount: 100,
                  spread: 70,
                  origin: { y: 0.6 },
                });
                setPaymentSuccess(true);
                setTimeout(() => navigate('/dashboard'), 2500);
              }
            } catch (verifyErr) {
              setError(verifyErr.response?.data?.message || 'Payment signature verification failed.');
              setProcessingPayment(false);
            }
          },
          prefill: {
            name: user?.name || 'Customer',
            email: user?.email || 'customer@slicehub.com',
          },
          theme: {
            color: '#e8590c',
          },
          modal: {
            ondismiss: function () {
              setProcessingPayment(false);
            },
          },
        };

        const rzpPayment = new window.Razorpay(options);
        rzpPayment.on('payment.failed', function (response) {
          setError(`Payment Failed: ${response.error.description}`);
          setProcessingPayment(false);
        });
        rzpPayment.open();

      } else {
        // Step 2 Fallback / Dev Simulator: Instant test mode checkout
        console.log('[Payment Simulation] Simulating Razorpay test verification...');
        const simulatedPaymentId = `pay_sim_${Date.now()}`;
        
        const verifyRes = await api.post(`/orders/${id}/verify-payment`, {
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: simulatedPaymentId,
          razorpay_signature: 'test_mode_simulation_signature',
        });

        if (verifyRes.data.success) {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
          });
          setPaymentSuccess(true);
          setTimeout(() => navigate('/dashboard'), 2500);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment initiation failed. Please try again.');
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-accent animate-spin" />
        <p className="font-display text-lg text-primary-text">Preparing order summary...</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 glass-card rounded-modal text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-danger mx-auto" />
        <h2 className="font-display text-2xl font-bold text-primary-text">Order Not Found</h2>
        <p className="text-sm text-primary-muted">{error}</p>
        <Link to="/builder" className="btn-primary mx-auto">
          Back to Pizza Builder
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/builder"
          className="inline-flex items-center gap-2 text-xs text-primary-muted hover:text-white transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pizza Builder
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left: Itemized Pizza Breakdown */}
        <div className="md:col-span-7 glass-card rounded-modal p-6 sm:p-8 shadow-warm border border-border space-y-6">
          
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary-text">
                Order <span className="text-accent">Summary</span>
              </h1>
              <p className="text-xs text-primary-muted mt-0.5">
                Review your handcrafted pizza recipe before payment
              </p>
            </div>
            <span className="badge bg-accent/15 border-accent/30 text-accent text-xs">
              Pending Checkout
            </span>
          </div>

          {error && (
            <div className="p-4 rounded-input bg-danger/10 border border-danger/30 text-danger text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Breakdown Items */}
          <div className="space-y-4 text-sm divide-y divide-border/60">
            
            {/* Crust */}
            <div className="pt-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-primary-muted uppercase tracking-wider block">
                  1. Crust Dough
                </span>
                <span className="font-medium text-primary-text">{order?.base?.name}</span>
              </div>
              <span className="font-display font-bold text-primary-text">
                Rs. {order?.base?.price?.toFixed(2)}
              </span>
            </div>

            {/* Sauce */}
            <div className="pt-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-primary-muted uppercase tracking-wider block">
                  2. Sauce Spread
                </span>
                <span className="font-medium text-primary-text">{order?.sauce?.name}</span>
              </div>
              <span className="font-display font-bold text-primary-text">
                Rs. {order?.sauce?.price?.toFixed(2)}
              </span>
            </div>

            {/* Cheese */}
            <div className="pt-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-primary-muted uppercase tracking-wider block">
                  3. Cheese Blend
                </span>
                <span className="font-medium text-primary-text">{order?.cheese?.name}</span>
              </div>
              <span className="font-display font-bold text-primary-text">
                Rs. {order?.cheese?.price?.toFixed(2)}
              </span>
            </div>

            {/* Vegetables */}
            <div className="pt-3">
              <span className="text-[11px] font-semibold text-primary-muted uppercase tracking-wider block mb-1">
                4. Farm Toppings ({order?.vegetables?.length || 0})
              </span>
              {order?.vegetables?.length > 0 ? (
                <div className="space-y-1.5 pl-2">
                  {order.vegetables.map((v, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-primary-muted">
                      <span>• {v.name}</span>
                      <span>Rs. {v.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-primary-muted italic">No extra toppings added</span>
              )}
            </div>

          </div>

          {/* Subtotal / GST Info */}
          <div className="pt-4 border-t border-border space-y-2 text-xs text-primary-muted">
            <div className="flex justify-between">
              <span>Ingredients Subtotal</span>
              <span className="text-primary-text font-semibold">Rs. {order?.totalPrice?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Stone Oven Baking & Packaging</span>
              <span className="text-success font-semibold">FREE</span>
            </div>
          </div>

        </div>

        {/* Right: Payment Box */}
        <div className="md:col-span-5 glass-card rounded-modal p-6 sm:p-8 shadow-warm border border-border space-y-6">
          
          <div className="text-center pb-4 border-b border-border space-y-1">
            <span className="text-xs text-primary-muted uppercase tracking-wider font-semibold">
              Total Amount Due
            </span>
            <div className="font-display text-4xl font-extrabold text-accent">
              Rs. {order?.totalPrice?.toFixed(2)}
            </div>
            <span className="text-[11px] text-primary-muted">Inclusive of all local taxes</span>
          </div>

          {paymentSuccess ? (
            <div className="p-6 rounded-card bg-success/10 border border-success/30 text-center space-y-3 animate-fadeIn">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
              <h3 className="font-display font-bold text-lg text-primary-text">Payment Verified!</h3>
              <p className="text-xs text-primary-muted">
                Your order is now confirmed and sent to the stone oven. Redirecting to live tracker...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={handleRazorpayPayment}
                disabled={processingPayment}
                className="w-full btn-primary text-base py-3.5 shadow-accent-glow"
              >
                {processingPayment ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Razorpay...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    <span>Pay with Razorpay (Test)</span>
                  </div>
                )}
              </button>

              {/* Trust Row */}
              <div className="pt-2 text-center space-y-2">
                <div className="inline-flex items-center justify-center gap-1.5 text-xs text-primary-muted">
                  <Lock className="w-3.5 h-3.5 text-accent" />
                  <span>Secure 256-Bit Test Mode Checkout</span>
                </div>
                <p className="text-[11px] text-primary-muted leading-relaxed">
                  Test cards, UPI simulation, or 1-click test checkout enabled.
                </p>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-primary-muted">
            <div className="flex items-center gap-1.5">
              <ChefHat className="w-4 h-4 text-accent" />
              <span>Freshly Prepared</span>
            </div>
            <span>~25 mins delivery</span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default OrderSummary;
