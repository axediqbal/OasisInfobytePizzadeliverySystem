import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Pizza, User, LogOut, Menu, X, Shield, Sparkles, ChefHat } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-10 h-10 rounded-card bg-gradient-to-br from-accent to-orange-700 flex items-center justify-center shadow-warm group-hover:scale-105 transition-transform duration-200">
              <Pizza className="w-6 h-6 text-white transform -rotate-12" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-primary-text flex items-center gap-1.5">
                Slice<span className="text-accent">Hub</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase text-primary-muted font-semibold -mt-1">
                Artisan Pizza Bar
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <Link
              to="/builder"
              className={`px-4 py-2 rounded-input text-sm font-medium transition-colors ${
                isActive('/builder')
                  ? 'bg-accent/15 text-accent border border-accent/30'
                  : 'text-primary-text/80 hover:text-white hover:bg-surface'
              }`}
            >
              <span className="flex items-center gap-2">
                <ChefHat className="w-4 h-4" />
                Custom Builder
              </span>
            </Link>

            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded-input text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-accent/15 text-accent border border-accent/30'
                    : 'text-primary-text/80 hover:text-white hover:bg-surface'
                }`}
              >
                Live Orders
              </Link>
            )}

            {isAdmin && (
              <div className="flex items-center gap-1 bg-surface-elevated/70 p-1 rounded-input border border-border ml-2">
                <Link
                  to="/admin/inventory"
                  className={`px-3 py-1.5 rounded-input text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isActive('/admin/inventory')
                      ? 'bg-accent text-white shadow-warm'
                      : 'text-primary-muted hover:text-white'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Inventory
                </Link>
                <Link
                  to="/admin/orders"
                  className={`px-3 py-1.5 rounded-input text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isActive('/admin/orders')
                      ? 'bg-accent text-white shadow-warm'
                      : 'text-primary-muted hover:text-white'
                  }`}
                >
                  Kitchen Queue
                </Link>
              </div>
            )}
          </nav>

          {/* Desktop Right Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded-input border border-border">
                  <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-xs">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-xs font-medium text-primary-text max-w-[120px] truncate">
                    {user?.name}
                  </span>
                  {isAdmin && (
                    <span className="badge bg-accent/20 border-accent/40 text-accent text-[10px] uppercase font-bold px-1.5 py-0.2">
                      Admin
                    </span>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-primary-muted hover:text-white hover:bg-surface rounded-input transition-colors"
                  title="Log out"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-primary-text hover:text-white hover:bg-surface rounded-input transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm py-2 px-4 shadow-warm"
                >
                  <Sparkles className="w-4 h-4" />
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-input bg-surface border border-border text-primary-text focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-border px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
          <Link
            to="/builder"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-input text-base font-medium text-primary-text hover:bg-surface-elevated"
          >
            <ChefHat className="w-5 h-5 text-accent" />
            Custom Pizza Builder
          </Link>

          {isAuthenticated && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-input text-base font-medium text-primary-text hover:bg-surface-elevated"
            >
              <Pizza className="w-5 h-5 text-accent" />
              Live Orders & Tracker
            </Link>
          )}

          {isAdmin && (
            <div className="pt-2 border-t border-border space-y-1">
              <p className="px-3 text-xs uppercase font-bold text-accent tracking-wider">
                Admin Management
              </p>
              <Link
                to="/admin/inventory"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-input text-sm text-primary-text hover:bg-surface-elevated"
              >
                <Shield className="w-4 h-4 text-accent" />
                Inventory Dashboard
              </Link>
              <Link
                to="/admin/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-input text-sm text-primary-text hover:bg-surface-elevated"
              >
                <ChefHat className="w-4 h-4 text-accent" />
                Kitchen Orders Queue
              </Link>
            </div>
          )}

          <div className="pt-3 border-t border-border">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-3 py-2 bg-surface-elevated rounded-input">
                  <User className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full btn-secondary text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary text-center text-sm py-2"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary text-center text-sm py-2"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
