import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../../api/axios';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Missing reset token in link.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed or token expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-modal p-8 shadow-warm border border-border">
          
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl font-bold text-primary-text">
              Set New <span className="text-accent">Password</span>
            </h2>
            <p className="text-primary-muted text-sm mt-1">
              Enter your new password below
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-input bg-danger/10 border border-danger/30 text-danger text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="p-6 rounded-card bg-success/10 border border-success/30 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
              <h3 className="font-display font-bold text-lg text-primary-text">Password Updated!</h3>
              <p className="text-xs text-primary-muted leading-relaxed">
                Your password has been reset successfully. You can now log in with your new credentials.
              </p>
              <div className="pt-2">
                <Link to="/login" className="btn-primary text-sm w-full">
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-primary-text mb-1.5 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-primary-muted pointer-events-none" />
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary-text mb-1.5 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-primary-muted pointer-events-none" />
                  <input
                    type="password"
                    required
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input pl-10"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary text-sm py-3 mt-4"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Updating Password...</span>
                  </div>
                ) : (
                  <span>Update Password</span>
                )}
              </button>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
