import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BuilderProvider } from './context/BuilderContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// User Pages
import Landing from './pages/Landing';
import Register from './pages/user/Register';
import Login from './pages/user/Login';
import VerifyEmail from './pages/user/VerifyEmail';
import ForgotPassword from './pages/user/ForgotPassword';
import ResetPassword from './pages/user/ResetPassword';
import Builder from './pages/user/Builder';
import OrderSummary from './pages/user/OrderSummary';
import Dashboard from './pages/user/Dashboard';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import Inventory from './pages/admin/Inventory';
import Orders from './pages/admin/Orders';

// 404
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <BuilderProvider>
          <div className="flex flex-col min-h-screen bg-background text-primary-text selection:bg-accent selection:text-white">
            <Navbar />
            
            <main className="flex-grow">
              <Routes>
                {/* Public Marketing & Auth Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Customer Routes (Protected) */}
                <Route
                  path="/builder"
                  element={
                    <ProtectedRoute>
                      <Builder />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/order-summary/:id"
                  element={
                    <ProtectedRoute>
                      <OrderSummary />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes (Separate non-public login & gated pages) */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin/inventory"
                  element={
                    <AdminRoute>
                      <Inventory />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <AdminRoute>
                      <Orders />
                    </AdminRoute>
                  }
                />

                {/* 404 Catch-all */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </BuilderProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
