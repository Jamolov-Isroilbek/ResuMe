import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api/axiosClient';

export interface AuthUser {
  id: number;
  username: string;
  isGuest?: boolean;
}

interface AuthContextType {
  user: null | AuthUser;
  isAuthenticated: boolean;
  login: (access: string, refresh: string) => void;
  guestLogin: (guestToken: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<null | AuthUser>(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/me/');
          setUser(response.data); 
        } catch (error) {
          localStorage.removeItem('token');
          console.error('Token validation failed:', error);
        }
      }
      setLoading(false);
    };
    validateToken();
  }, []);

  const login = async (access: string, refresh: string) => {
    localStorage.setItem('token', access);
    localStorage.setItem('refresh_token', refresh);
    const response = await api.get('/me/');
    setUser(response.data);
  };

  const guestLogin = (guestToken: string) => {
    localStorage.setItem('guest_token', guestToken);
    setUser({ id: 0, username: "Guest", isGuest: true });
  }

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        guestLogin,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);