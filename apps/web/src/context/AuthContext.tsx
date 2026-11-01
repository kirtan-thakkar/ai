import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
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
  token: 'guest_token',
  loading: false,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(defaultGuestUser);
  const [token, setToken] = useState<string | null>(localStorage.getItem('cinemind_token') || 'guest_token');
  const [loading, setLoading] = useState<boolean>(false);

  const refreshUser = async () => {
    try {
      const res = await authApi.getMe();
      if (res.data?.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      // Fallback to guest user silently without forcing login
      setUser(defaultGuestUser);
    }
  };

  useEffect(() => {
    if (token && token !== 'guest_token') {
      refreshUser();
    }
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('cinemind_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('cinemind_token');
    setToken('guest_token');
    setUser(defaultGuestUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
