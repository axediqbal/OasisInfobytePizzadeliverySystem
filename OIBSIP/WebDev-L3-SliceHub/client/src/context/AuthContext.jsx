import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('slicehub_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('slicehub_user');
      const storedToken = localStorage.getItem('slicehub_token');
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
      localStorage.removeItem('slicehub_user');
      localStorage.removeItem('slicehub_token');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setUser(receivedUser);
      setToken(receivedToken);
      localStorage.setItem('slicehub_token', receivedToken);
      localStorage.setItem('slicehub_user', JSON.stringify(receivedUser));
      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const adminLogin = async (email, password) => {
    const res = await api.post('/admin/login', { email, password });
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      setUser(receivedUser);
      setToken(receivedToken);
      localStorage.setItem('slicehub_token', receivedToken);
      localStorage.setItem('slicehub_user', JSON.stringify(receivedUser));
      return res.data;
    }
    throw new Error(res.data.message || 'Admin login failed');
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('slicehub_token');
    localStorage.removeItem('slicehub_user');
  };

  const isAuthenticated = Boolean(user && token);
  const isAdmin = Boolean(user && user.role === 'admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        adminLogin,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
