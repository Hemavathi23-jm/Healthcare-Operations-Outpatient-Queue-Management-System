import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on mount for active session
    try {
      const storedToken = localStorage.getItem('medqueue_token');
      const storedUser = localStorage.getItem('medqueue_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to parse auth from storage', e);
      localStorage.removeItem('medqueue_token');
      localStorage.removeItem('medqueue_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('medqueue_token', data.token);
    localStorage.setItem('medqueue_user', JSON.stringify(data.user));
    return data.user;
  };

  const register = async (patientData) => {
    const data = await authService.register(patientData);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('medqueue_token', data.token);
    localStorage.setItem('medqueue_user', JSON.stringify(data.user));
    return data.user;
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!user && !!token,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
