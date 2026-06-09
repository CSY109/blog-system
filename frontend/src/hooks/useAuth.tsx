import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, login as apiLogin, logout as apiLogout } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = async (credentials: any) => {
    try {
      const data = await apiLogin(credentials);
      setUser(data.user);
      setToken(data.token);
      navigate('/admin');
    } catch (error) {
      console.error('Login failed', error);
      // You might want to show an error message to the user
    }
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
