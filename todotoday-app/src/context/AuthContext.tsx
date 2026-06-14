import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as authApi from '../api/auth';
import { saveToken, getToken, clearToken } from '../api/client';

interface AuthContextType {
  user: authApi.User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<authApi.User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = await getToken();
        if (token) {
          const { user } = await authApi.getMe();
          setUser(user);
        }
      } catch {
        await clearToken();
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user } = await authApi.login(email, password);
    await saveToken(token);
    setUser(user);
  };

  const register = async (email: string, password: string, name: string) => {
    const { token, user } = await authApi.register(email, password, name);
    await saveToken(token);
    setUser(user);
  };

  const logout = async () => {
    await clearToken();
    setUser(null);
  };

  const updateName = async (name: string) => {
    const { user } = await authApi.updateMe(name);
    setUser(user);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateName }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
