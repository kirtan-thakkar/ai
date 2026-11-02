import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isGuest: boolean;
  login: (token: string, user: User) => void;
  quickLogin: (role: 'host' | 'guest') => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const defaultGuestUser: User = {
  id: 'guest_user_1',
  name: 'Cinema Explorer',
  email: 'explorer@cinemind.ai',
  status: 'active',
  created_at: new Date().toISOString()
};

const AuthContext = createContext<AuthContextType>({
  user: defaultGuestUser,
  token: null,
  loading: false,
  isGuest: true,
  login: () => {},
  quickLogin: async () => {},
  logout: () => {},
  refreshUser: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('cinemind_token'));
  const [user, setUser] = useState<User | null>(defaultGuestUser);
  const [loading, setLoading] = useState<boolean>(false);

  const isGuest = !token || token === 'guest_token';

  const refreshUser = async () => {
    if (!token || token === 'guest_token') {
      setUser(defaultGuestUser);
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.getMe();
      if (res.data?.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      // If token expired, clear it
      localStorage.removeItem('cinemind_token');
      setToken(null);
      setUser(defaultGuestUser);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      refreshUser();
    } else {
      setUser(defaultGuestUser);
    }
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('cinemind_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const quickLogin = async (role: 'host' | 'guest') => {
    setLoading(true);
    try {
      const res = await authApi.quickLogin(role);
      login(res.data.token, res.data.user);
    } catch (err) {
      console.error('Quick login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('cinemind_token');
    setToken(null);
    setUser(defaultGuestUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, isGuest, login, quickLogin, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
