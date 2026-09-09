import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api/axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'sent' | 'error'
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      const res = await api.post('/auth/forgot-password', { email });
      setStatus('sent');
      setMessage(res.data.message || 'If an account exists, a password reset link has been dispatched.');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-modal p-8 shadow-warm border border-border">
          
          <div className="mb-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-primary-muted hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </div>

          <div className="text-center mb-8">
            <h2 className="font-display text-3xl font-bold text-primary-text">
              Reset <span className="text-accent">Password</span>
            </h2>
            <p className="text-primary-muted text-sm mt-1">
              Enter your email and we'll send a secure password reset link.
            </p>
          </div>

          {status === 'sent' ? (
            <div className="p-6 rounded-card bg-success/10 border border-success/30 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
              <h3 className="font-display font-bold text-lg text-primary-text">Check Your Inbox</h3>
              <p className="text-xs text-primary-muted leading-relaxed">
                {message}
              </p>
              <div className="pt-2">
                <Link to="/login" className="btn-primary text-sm w-full">
                  Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {status === 'error' && (
                <div className="p-3.5 rounded-input bg-danger/10 border border-danger/30 text-danger text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-primary-text mb-1.5 uppercase tracking-wider">
                  Registered Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-primary-muted pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    <span>Sending Link...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    <span>Send Reset Link</span>
                  </div>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
