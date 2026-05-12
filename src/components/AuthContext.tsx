import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth, loginWithGoogle, logout } from '../lib/firebase';
import { getRedirectResult } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => null,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && mounted) {
          setUser(result.user);
        }
      } catch (error) {
        console.error("Error handling redirect result:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        setLoading(false);
      } else {
        // Only if we haven't already finished loading via getRedirectResult
        handleRedirect();
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const loginContext = async () => {
    return await loginWithGoogle();
  };

  const logoutContext = async () => {
    await logout();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login: loginContext, logout: logoutContext }}>
      {children}
    </AuthContext.Provider>
  );
};
