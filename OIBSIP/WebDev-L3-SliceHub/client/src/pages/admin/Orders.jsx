import React, { useState, useEffect } from 'react';
import { ChefHat, Clock, Truck, Check, RefreshCw, AlertCircle, Loader2, Filter, Search, User } from 'lucide-react';
import api from '../../api/axios';

const STATUS_OPTIONS = ['Order Received', 'In Kitchen', 'Sent to Delivery'];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [recentlyUpdated, setRecentlyUpdated] = useState({});

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/orders');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      const res = await api.patch(`/admin/orders/${orderId}/status`, { orderStatus: newStatus });
      if (res.data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? res.data.data : o))
        );
        setRecentlyUpdated((prev) => ({ ...prev, [orderId]: true }));
        setTimeout(() => {
          setRecentlyUpdated((prev) => ({ ...prev, [orderId]: false }));
        }, 2000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'all') return true;
    return order.orderStatus === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl font-bold text-primary-text">
              Kitchen <span className="text-accent">Order Dispatch</span>
            </h1>
            <span className="badge bg-accent/20 text-accent border-accent/40 text-xs font-semibold">
              Live Queue
            </span>
          </div>
          <p className="text-xs text-primary-muted mt-1">
            Advance orders through preparation stages. Changes reflect live on customer screens.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-input bg-danger/10 border border-danger/30 text-danger text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="glass-card rounded-modal p-4 mb-6 border border-border flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-semibold text-primary-muted uppercase tracking-wider mr-2 hidden sm:inline">
          Filter:
        </span>
        {['all', 'Order Received', 'In Kitchen', 'Sent to Delivery'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-input text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === status
                ? 'bg-accent text-white shadow-warm'
                : 'text-primary-muted hover:text-primary-text hover:bg-surface'
            }`}
          >
            {status === 'all' ? 'All Orders' : status}
          </button>
        ))}
      </div>

      {/* Orders Table / Cards */}
      {loading ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-10 h-10 text-accent animate-spin" />
          <p className="text-sm text-primary-muted">Fetching kitchen order queue...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="glass-card rounded-modal p-12 text-center text-primary-muted border border-border">
          No orders found matching the filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isUpdating = updatingId === order._id;
            const isSaved = recentlyUpdated[order._id];
            const formattedTime = new Date(order.createdAt).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            });
            const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={order._id}
                className="glass-card rounded-modal p-6 border border-border shadow-warm hover:border-accent/30 transition-all space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <span className="font-display font-bold text-lg text-primary-text">
                      #{order._id.slice(-6).toUpperCase()}
                    </span>
                    <span className="text-xs text-primary-muted">
                      {formattedDate}, {formattedTime}
                    </span>
                    {order.paymentStatus === 'paid' ? (
                      <span className="badge bg-success/20 border-success/30 text-success text-[10px] font-semibold">
                        Paid (Razorpay)
                      </span>
                    ) : (
                      <span className="badge bg-amber-500/20 border-amber-500/30 text-amber-400 text-[10px]">
                        Pending
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-display text-xl font-bold text-accent">
                      Rs. {order.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Customer & Pizza Details */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  
                  {/* Customer Info */}
                  <div className="md:col-span-4 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-primary-text">
                      <User className="w-3.5 h-3.5 text-accent" />
                      <span>{order.user?.name || 'Customer'}</span>
                    </div>
                    <div className="text-xs text-primary-muted">
                      {order.user?.email || 'N/A'}
                    </div>
                  </div>

                  {/* Pizza Recipe Snapshot */}
                  <div className="md:col-span-5 text-xs space-y-1 bg-surface/60 p-3 rounded-card border border-border/60">
                    <div className="text-primary-text font-medium">
                      <strong className="text-primary-muted">Base:</strong> {order.base?.name} • <strong className="text-primary-muted">Sauce:</strong> {order.sauce?.name} • <strong className="text-primary-muted">Cheese:</strong> {order.cheese?.name}
                    </div>
                    {order.vegetables?.length > 0 && (
                      <div className="text-primary-muted text-[11px] truncate">
                        <strong>Toppings:</strong> {order.vegetables.map(v => v.name).join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Status Dropdown / Controls */}
                  <div className="md:col-span-3 flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-2 w-full justify-end">
                      {isUpdating && <Loader2 className="w-4 h-4 text-accent animate-spin" />}
                      {isSaved && (
                        <span className="text-xs text-success flex items-center gap-1 font-semibold animate-fadeIn">
                          <Check className="w-3.5 h-3.5" /> Updated
                        </span>
                      )}
                      <select
                        value={order.orderStatus}
                        disabled={isUpdating}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`bg-surface border text-xs font-semibold rounded-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent transition-all ${
                          order.orderStatus === 'Sent to Delivery'
                            ? 'border-accent text-accent'
                            : order.orderStatus === 'In Kitchen'
                            ? 'border-success text-success'
                            : 'border-border text-primary-text'
                        }`}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                    <span className="text-[10px] text-primary-muted">
                      Syncs to user dashboard in &lt;5s
                    </span>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Orders;
