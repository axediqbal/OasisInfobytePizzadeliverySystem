import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Pizza, ChefHat, Clock, AlertCircle, RefreshCw, ArrowRight, CheckCircle2, Sparkles, ExternalLink } from 'lucide-react';
import api from '../../api/axios';
import StatusStepper from '../../components/StatusStepper';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const pollingRef = useRef(null);

  const fetchOrders = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      setError(null);
      const res = await api.get('/orders/mine');
      if (res.data.success) {
        setOrders(res.data.data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      if (!isBackground) {
        setError(err.response?.data?.message || 'Failed to retrieve your orders.');
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // 5-second Polling interval for live status updates per TRD §6
    pollingRef.current = setInterval(() => {
      fetchOrders(true);
    }, 5000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl font-bold text-primary-text">
              My Pizza <span className="text-accent">Orders</span>
            </h1>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-success/15 border border-success/30 text-success text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span>Live Sync</span>
            </div>
          </div>
          <p className="text-xs text-primary-muted mt-1">
            Welcome back, {user?.name}. Watching your pizza orders in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchOrders(false)}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            title="Refresh Orders"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Now</span>
          </button>

          <Link to="/builder" className="btn-primary text-xs py-2 px-4 shadow-warm">
            <ChefHat className="w-4 h-4" />
            <span>Build Another Pizza</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-input bg-danger/10 border border-danger/30 text-danger text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => fetchOrders(false)} className="underline text-xs font-semibold">
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="glass-card rounded-card p-6 border border-border animate-pulse space-y-4">
              <div className="h-6 bg-surface-elevated rounded w-1/3"></div>
              <div className="h-16 bg-surface-elevated rounded w-full"></div>
              <div className="h-4 bg-surface-elevated rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        /* Empty State */
        <div className="glass-card rounded-modal p-12 text-center max-w-lg mx-auto border border-border space-y-5 my-8">
          <div className="w-16 h-16 rounded-full bg-accent/15 text-accent flex items-center justify-center mx-auto shadow-warm">
            <Pizza className="w-8 h-8 transform -rotate-12" />
          </div>
          <h2 className="font-display text-2xl font-bold text-primary-text">
            No Pizza Orders Placed Yet
          </h2>
          <p className="text-xs text-primary-muted leading-relaxed">
            Your customized culinary masterpiece is just 4 steps away. Pick your crust, sauce, cheese, and farm toppings now!
          </p>
          <div className="pt-2">
            <Link to="/builder" className="btn-primary inline-flex text-sm py-2.5 px-6 shadow-warm">
              <Sparkles className="w-4 h-4" />
              <span>Create Your First Pizza</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-6">
          {orders.map((order) => {
            const isPaid = order.paymentStatus === 'paid';
            const formattedDate = new Date(order.createdAt).toLocaleString('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'short',
            });

            return (
              <div
                key={order._id}
                className="glass-card rounded-modal p-6 sm:p-8 shadow-warm border border-border hover:border-accent/30 transition-all duration-200"
              >
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-border">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-lg font-bold text-primary-text">
                        Order #{order._id.slice(-6).toUpperCase()}
                      </h3>
                      {isPaid ? (
                        <span className="badge bg-success/20 border-success/30 text-success text-[11px] font-semibold">
                          Paid
                        </span>
                      ) : (
                        <span className="badge bg-amber-500/20 border-amber-500/30 text-amber-400 text-[11px] font-semibold">
                          Payment Pending
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-primary-muted">{formattedDate}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-semibold text-primary-muted block">
                        Amount
                      </span>
                      <span className="font-display text-xl font-bold text-accent">
                        Rs. {order.totalPrice.toFixed(2)}
                      </span>
                    </div>

                    {!isPaid && (
                      <Link
                        to={`/order-summary/${order._id}`}
                        className="btn-primary text-xs py-2 px-3"
                      >
                        Complete Payment
                      </Link>
                    )}
                  </div>
                </div>

                {/* Status Stepper Tracker (for Paid Orders) */}
                {isPaid ? (
                  <div className="py-6 border-b border-border">
                    <StatusStepper currentStatus={order.orderStatus} />
                  </div>
                ) : (
                  <div className="py-4 text-xs text-amber-400/90 italic">
                    * Status tracking will activate once payment verification is complete.
                  </div>
                )}

                {/* Pizza Recipe Snapshot Details */}
                <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-primary-muted block text-[10px] uppercase font-semibold">
                      Crust Dough
                    </span>
                    <span className="text-primary-text font-medium">{order.base?.name}</span>
                  </div>

                  <div>
                    <span className="text-primary-muted block text-[10px] uppercase font-semibold">
                      Sauce
                    </span>
                    <span className="text-primary-text font-medium">{order.sauce?.name}</span>
                  </div>

                  <div>
                    <span className="text-primary-muted block text-[10px] uppercase font-semibold">
                      Cheese
                    </span>
                    <span className="text-primary-text font-medium">{order.cheese?.name}</span>
                  </div>

                  <div>
                    <span className="text-primary-muted block text-[10px] uppercase font-semibold">
                      Toppings
                    </span>
                    <span className="text-primary-text font-medium truncate block">
                      {order.vegetables?.map((v) => v.name).join(', ') || 'None'}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-8 text-center text-xs text-primary-muted flex items-center justify-center gap-1">
        <span>Last synced at {lastUpdated.toLocaleTimeString()}</span>
        <span>• Auto-polling every 5 seconds</span>
      </div>

    </div>
  );
};

export default Dashboard;
