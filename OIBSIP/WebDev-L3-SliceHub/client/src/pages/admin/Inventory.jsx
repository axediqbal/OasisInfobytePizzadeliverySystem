import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle2, Edit3, Plus, Search, RefreshCw, X, Save, Loader2, Layers, Flame, Milk, Salad } from 'lucide-react';
import api from '../../api/axios';

const CATEGORIES = [
  { id: 'all', label: 'All Items' },
  { id: 'base', label: 'Bases', icon: Layers },
  { id: 'sauce', label: 'Sauces', icon: Flame },
  { id: 'cheese', label: 'Cheeses', icon: Milk },
  { id: 'vegetable', label: 'Vegetables', icon: Salad },
];

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Edit Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ quantity: 0, threshold: 20, price: 0 });
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/inventory');
      if (res.data.success) {
        setItems(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditForm({
      quantity: item.quantity,
      threshold: item.threshold,
      price: item.price,
    });
    setUpdateSuccess(false);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      setUpdating(true);
      const res = await api.patch(`/admin/inventory/${editingItem._id}`, editForm);
      if (res.data.success) {
        setItems((prev) =>
          prev.map((item) => (item._id === editingItem._id ? res.data.data : item))
        );
        setUpdateSuccess(true);
        setTimeout(() => {
          setEditingItem(null);
        }, 1000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update item.');
    } finally {
      setUpdating(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const lowStockCount = items.filter((i) => i.quantity < i.threshold).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl font-bold text-primary-text">
              Inventory <span className="text-accent">Stock Manager</span>
            </h1>
            <span className="badge bg-accent/20 text-accent border-accent/40 text-xs font-semibold">
              Admin Ops
            </span>
          </div>
          <p className="text-xs text-primary-muted mt-1">
            Real-time stock monitoring with automatic decrements & cron email alerts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchInventory}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Stock</span>
          </button>
        </div>
      </div>

      {/* Low Stock Warning Alert Banner */}
      {lowStockCount > 0 && (
        <div className="mb-6 p-4 rounded-card bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-center justify-between shadow-warm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold">{lowStockCount} ingredient(s)</span> are currently below their minimum threshold.
            </div>
          </div>
          <span className="text-xs text-amber-400/80 hidden sm:inline">Cron will dispatch digest alerts</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-modal p-4 mb-6 border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-input text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-accent text-white shadow-warm'
                  : 'text-primary-muted hover:text-primary-text hover:bg-surface'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-primary-muted" />
          <input
            type="text"
            placeholder="Search ingredient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input pl-9 text-xs py-2"
          />
        </div>
      </div>

      {/* Main Table / Grid */}
      {loading ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-10 h-10 text-accent animate-spin" />
          <p className="text-sm text-primary-muted">Fetching ingredient inventory...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-card rounded-modal p-12 text-center text-primary-muted border border-border">
          No ingredients matched your query.
        </div>
      ) : (
        <div className="glass-card rounded-modal overflow-hidden border border-border shadow-warm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-surface border-b border-border text-xs uppercase font-semibold text-primary-muted tracking-wider">
                  <th className="py-3.5 px-6">Ingredient Name</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Current Stock</th>
                  <th className="py-3.5 px-6">Threshold</th>
                  <th className="py-3.5 px-6">Price (Rs.)</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredItems.map((item) => {
                  const isLow = item.quantity < item.threshold;

                  return (
                    <tr
                      key={item._id}
                      className={`hover:bg-surface/50 transition-colors ${
                        isLow ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <td className="py-4 px-6 font-semibold text-primary-text">
                        {item.name}
                      </td>

                      <td className="py-4 px-6">
                        <span className="badge bg-surface-elevated border-border text-primary-muted text-xs capitalize">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`font-display text-base font-bold ${
                            item.quantity === 0
                              ? 'text-danger'
                              : isLow
                              ? 'text-amber-400'
                              : 'text-success'
                          }`}
                        >
                          {item.quantity} units
                        </span>
                      </td>

                      <td className="py-4 px-6 text-primary-muted">
                        {item.threshold} units
                      </td>

                      <td className="py-4 px-6 font-display font-semibold text-primary-text">
                        Rs. {item.price.toFixed(2)}
                      </td>

                      <td className="py-4 px-6">
                        {item.quantity === 0 ? (
                          <span className="badge bg-danger/20 border-danger/30 text-danger text-xs font-semibold">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="badge bg-amber-500/20 border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="badge bg-success/20 border-success/30 text-success text-xs font-semibold">
                            Healthy
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="btn-secondary text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Adjust</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Stock Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-modal p-6 sm:p-8 max-w-md w-full border border-border shadow-warm-lg animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="font-display text-xl font-bold text-primary-text">
                Adjust Stock: <span className="text-accent">{editingItem.name}</span>
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-primary-muted hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {updateSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
                <h4 className="font-display text-lg font-bold text-primary-text">
                  Stock Updated Successfully!
                </h4>
              </div>
            ) : (
              <form onSubmit={handleSaveEdit} className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-primary-text mb-1 uppercase tracking-wider">
                    Current Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editForm.quantity}
                    onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                    className="form-input"
                  />
                  <p className="text-[11px] text-primary-muted mt-1">
                    Directly updates the real-time database stock
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary-text mb-1 uppercase tracking-wider">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editForm.threshold}
                    onChange={(e) => setEditForm({ ...editForm, threshold: e.target.value })}
                    className="form-input"
                  />
                  <p className="text-[11px] text-primary-muted mt-1">
                    Threshold triggering automated cron alert email
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary-text mb-1 uppercase tracking-wider">
                    Unit Price (Rs.)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="btn-secondary text-xs py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="btn-primary text-xs py-2 px-5"
                  >
                    {updating ? 'Saving...' : 'Save Stock Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Inventory;
