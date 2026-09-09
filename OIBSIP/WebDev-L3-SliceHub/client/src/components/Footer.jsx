import React from 'react';
import { Link } from 'react-router-dom';
import { Pizza, Heart, Shield, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-surface/50 border-t border-border mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-input bg-accent flex items-center justify-center">
                <Pizza className="w-5 h-5 text-white transform -rotate-12" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight">
                Slice<span className="text-accent">Hub</span>
              </span>
            </Link>
            <p className="text-primary-muted text-sm max-w-sm leading-relaxed">
              Real-time artisan pizza customization platform built with the MERN stack. 
              Fresh organic dough, slow-simmered sauces, and hot live tracking to your doorstep.
            </p>
            <div className="flex items-center gap-2 text-xs text-primary-muted">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Oasis Infobyte SIP — Level 3 Web Development Project</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-semibold text-primary-text uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-primary-muted">
              <li>
                <Link to="/builder" className="hover:text-accent transition-colors">
                  4-Step Pizza Builder
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-accent transition-colors">
                  Live Order Tracker
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-accent transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-accent transition-colors">
                  Customer Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Admin & Operations */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-semibold text-primary-text uppercase tracking-wider">
              Operations
            </h4>
            <ul className="space-y-2 text-sm text-primary-muted">
              <li>
                <Link to="/admin/login" className="flex items-center gap-1.5 hover:text-accent transition-colors">
                  <Shield className="w-3.5 h-3.5 text-accent" />
                  Staff & Admin Portal
                </Link>
              </li>
              <li>
                <Link to="/admin/inventory" className="hover:text-accent transition-colors">
                  Real-time Stock Monitor
                </Link>
              </li>
              <li>
                <Link to="/admin/orders" className="hover:text-accent transition-colors">
                  Live Kitchen Queue
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-primary-muted">
          <p>© {new Date().getFullYear()} SliceHub. Crafted for perfection.</p>
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-accent fill-accent" />
            <span>by Ahmed Iqbal (Oasis Infobyte SIP)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
