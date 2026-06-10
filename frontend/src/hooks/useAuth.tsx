import { createContext, useContext, useState, type ReactNode } from 'react';
import { type User, login as apiLogin, logout as apiLogout } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { return JSON.parse(stored); } catch { return null; }
    }
    return null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const navigate = useNavigate();

  const login = async (credentials: { username: string; password: string }) => {
    const data = await apiLogin(credentials);
    setUser(data.user);
    setToken(data.token);
    navigate('/admin');
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    setToken(null);
    navigate('/login');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
