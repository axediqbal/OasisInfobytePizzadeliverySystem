import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ArrowRight, Mail } from 'lucide-react';
import api from '../../api/axios';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null); // 'success' | 'error'
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setStatus('error');
      setMessage('No verification token provided in the link.');
      return;
    }

    const verify = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(res.data.message || 'Email verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed or token expired.');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail) return;
    try {
      setResendStatus('loading');
      await api.post('/auth/resend-verification', { email: resendEmail });
      setResendStatus('sent');
    } catch (err) {
      setResendStatus('error');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-modal p-8 shadow-warm border border-border text-center">
          
          {loading ? (
            <div className="space-y-4 py-8">
              <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto" />
              <h2 className="font-display text-2xl font-bold text-primary-text">
                Verifying Your Email...
              </h2>
              <p className="text-sm text-primary-muted">
                Please hold on while we activate your SliceHub account.
              </p>
            </div>
          ) : status === 'success' ? (
            <div className="space-y-5 py-4">
              <div className="w-16 h-16 rounded-full bg-success/20 text-success flex items-center justify-center mx-auto shadow-warm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="font-display text-2xl font-bold text-primary-text">
                Account Verified!
              </h2>
              <p className="text-sm text-primary-muted leading-relaxed">
                {message}
              </p>
              <div className="pt-4">
                <Link to="/login" className="btn-primary w-full py-3">
                  <span>Sign In & Build Pizza</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-5 py-4">
              <div className="w-16 h-16 rounded-full bg-danger/20 text-danger flex items-center justify-center mx-auto shadow-warm">
                <XCircle className="w-10 h-10" />
              </div>
              <h2 className="font-display text-2xl font-bold text-primary-text">
                Verification Failed
              </h2>
              <p className="text-sm text-danger/90 leading-relaxed">
                {message}
              </p>

              {/* Resend Form */}
              <div className="pt-4 border-t border-border mt-4 text-left">
                <p className="text-xs font-semibold text-primary-text mb-2 uppercase tracking-wider">
                  Request New Verification Link
                </p>
                <form onSubmit={handleResend} className="space-y-2">
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-primary-muted" />
                    <input
                      type="email"
                      required
                      placeholder="your-registered@email.com"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="form-input pl-9 text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resendStatus === 'loading'}
                    className="w-full btn-secondary text-xs py-2"
                  >
                    {resendStatus === 'loading' ? 'Sending...' : 'Resend Verification Link'}
                  </button>
                  {resendStatus === 'sent' && (
                    <p className="text-xs text-success text-center">New verification link sent!</p>
                  )}
                  {resendStatus === 'error' && (
                    <p className="text-xs text-danger text-center">Failed to resend. Please check email address.</p>
                  )}
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
