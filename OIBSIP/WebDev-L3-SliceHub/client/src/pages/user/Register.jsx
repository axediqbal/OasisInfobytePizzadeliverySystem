import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const calculatePasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = calculatePasswordStrength(formData.password);

  const getStrengthLabel = (score) => {
    if (formData.password.length === 0) return '';
    if (score <= 2) return 'Weak';
    if (score <= 4) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = (score) => {
    if (score <= 2) return 'bg-danger';
    if (score <= 4) return 'bg-amber-500';
    return 'bg-success';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      const res = await register(formData.name, formData.email, formData.password);
      setSuccessMessage(res.message || 'Registration successful! Please verify your email.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background glow */}
      <div className="absolute w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="w-full max-w-md">
        <div className="glass-card rounded-modal p-8 shadow-warm border border-border">
          
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl font-bold text-primary-text">
              Join <span className="text-accent">SliceHub</span>
            </h2>
            <p className="text-primary-muted text-sm mt-1">
              Create an account to customize pizzas & track live
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-input bg-danger/10 border border-danger/30 text-danger text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage ? (
            <div className="p-6 rounded-card bg-success/10 border border-success/30 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
              <h3 className="font-display font-bold text-lg text-primary-text">Check Your Inbox!</h3>
              <p className="text-xs text-primary-muted leading-relaxed">
                {successMessage}
              </p>
              <div className="pt-2">
                <Link to="/login" className="btn-primary text-sm w-full">
                  Proceed to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Name field */}
              <div>
                <label className="block text-xs font-semibold text-primary-text mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary-muted">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mario Rossi"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input pl-10"
                  />
                </div>
              </div>

              {/* Email field */}
              <div>
                <label className="block text-xs font-semibold text-primary-text mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary-muted">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input pl-10"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-xs font-semibold text-primary-text mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="form-input pl-10"
                  />
                </div>

                {/* Password Strength Meter */}
                {formData.password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-[11px] text-primary-muted font-medium">
                      <span>Strength</span>
                      <span className="font-semibold text-primary-text">
                        {getStrengthLabel(strength)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-elevated rounded-full overflow-hidden flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-full flex-1 transition-all duration-300 ${
                            level <= strength ? getStrengthColor(strength) : 'bg-transparent'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary text-sm py-3 mt-6"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Create Account</span>
                  </div>
                )}
              </button>

            </form>
          )}

          <div className="mt-8 pt-6 border-t border-border text-center text-xs text-primary-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:underline font-semibold">
              Sign In here
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
