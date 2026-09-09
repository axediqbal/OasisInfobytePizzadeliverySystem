import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      await adminLogin(formData.email, formData.password);
      navigate('/admin/inventory', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Admin authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute w-96 h-96 bg-accent/15 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="w-full max-w-md">
        <div className="glass-card rounded-modal p-8 shadow-warm border border-border">
          
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-accent/20 border border-accent/40 text-accent flex items-center justify-center mx-auto mb-4 shadow-warm">
              <Shield className="w-7 h-7" />
            </div>
            <h2 className="font-display text-3xl font-bold text-primary-text">
              Admin <span className="text-accent">Portal</span>
            </h2>
            <p className="text-primary-muted text-xs sm:text-sm mt-1">
              Restricted access for SliceHub kitchen staff & management
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-input bg-danger/10 border border-danger/30 text-danger text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-semibold text-primary-text mb-1.5 uppercase tracking-wider">
                Admin Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="admin@slicehub.test"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary-text mb-1.5 uppercase tracking-wider">
                Admin Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="form-input pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-sm py-3 mt-6 shadow-warm"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  <span>Access Management Portal</span>
                </div>
              )}
            </button>

          </form>

          <div className="mt-8 pt-6 border-t border-border text-center text-xs text-primary-muted">
            <span>Default seeded credentials:</span><br />
            <code className="text-accent font-semibold">admin@slicehub.test</code> / <code className="text-accent font-semibold">ChangeMe123!</code>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
