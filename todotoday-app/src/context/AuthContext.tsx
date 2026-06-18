import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as authApi from '../api/auth';
import { moveStale } from '../api/todos';
import { saveToken, getToken, clearToken } from '../api/client';
import { getTodayString } from '../utils/date';

interface AuthContextType {
  user: authApi.User | null;
  isLoading: boolean;
  staleMoved: number;
  clearStaleMoved: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<authApi.User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [staleMoved, setStaleMoved] = useState(0);

  const runStaleCheck = async () => {
    try {
      const { moved } = await moveStale(getTodayString());
      if (moved > 0) setStaleMoved(moved);
    } catch {
      // Stale check is best-effort — don't surface errors to the user
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = await getToken();
        if (token) {
          const { user } = await authApi.getMe();
          setUser(user);
          // Run stale check after confirming token is valid
          await runStaleCheck();
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
    await runStaleCheck();
  };

  const register = async (email: string, password: string, name: string) => {
    const { token, user } = await authApi.register(email, password, name);
    await saveToken(token);
    setUser(user);
    // No stale check on fresh register — new users have no todos
  };

  const logout = async () => {
    await clearToken();
    setUser(null);
    setStaleMoved(0);
  };

  const updateName = async (name: string) => {
    const { user } = await authApi.updateMe(name);
    setUser(user);
  };

  const clearStaleMoved = () => setStaleMoved(0);

  return (
    <AuthContext.Provider value={{ user, isLoading, staleMoved, clearStaleMoved, login, register, logout, updateName }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};