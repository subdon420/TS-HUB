import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('th_token');
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch (error) {
          console.error('Failed to load authenticated user:', error);
          localStorage.removeItem('th_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password, portalRole) => {
    try {
      const data = await api.login(email, password, portalRole);
      localStorage.setItem('th_token', data.token);
      setUser(data);
      addToast(`Welcome back, ${data.name}! Role: ${data.role.toUpperCase()}`, 'success');
      return data;
    } catch (error) {
      addToast(error.message, 'error');
      throw error;
    }
  };

  const register = async (formData) => {
    try {
      const data = await api.register(formData);
      localStorage.setItem('th_token', data.token);
      setUser(data);
      addToast(`Account created successfully! Welcome to Tester's Home`, 'success');
      return data;
    } catch (error) {
      addToast(error.message, 'error');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('th_token');
    setUser(null);
    addToast('Signed out of Tester’s Home session', 'info');
  };

  const switchRole = async (newRole) => {
    try {
      const res = await api.switchRole(newRole);
      setUser(prev => ({
        ...prev,
        role: newRole,
        title: res.user.title,
      }));
      addToast(`Switched perspective to ${newRole.toUpperCase()} mode`, 'cyber');
      return res;
    } catch (error) {
      addToast(error.message, 'error');
      throw error;
    }
  };

  const quickLogin = async (roleType) => {
    try {
      if (roleType === 'tester') {
        return await login('tester@testers-home.io', 'tester123', 'tester');
      } else if (roleType === 'developer') {
        return await login('dev@testers-home.io', 'dev123', 'developer');
      } else {
        return await login('admin@testers-home.io', 'admin123', 'admin');
      }
    } catch (err) {
      addToast('Quick login failed. Ensure MongoDB is running and seeded.', 'error');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role || 'guest',
      loading,
      login,
      register,
      logout,
      switchRole,
      quickLogin,
      isTester: user?.role === 'tester' || user?.role === 'admin',
      isDeveloper: user?.role === 'developer' || user?.role === 'admin',
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

