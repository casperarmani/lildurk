"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { apiClient } from "@/lib/api-client";
import { getAuthToken, clearAuthToken, isTokenExpired, decodeToken } from "@/lib/auth";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  logout: () => void;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
  setUser: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    console.log("Logging out user");
    clearAuthToken();
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;

    const initAuth = async () => {
      const token = getAuthToken();
      console.log("Initializing auth, token exists:", !!token);
      
      if (token) {
        try {
          // Check if token needs immediate refresh
          if (isTokenExpired(token)) {
            console.log("Token expired or expiring soon, refreshing...");
            const refreshed = await apiClient.refreshToken();
            if (!refreshed) {
              console.log("Initial token refresh failed, logging out");
              logout();
              setLoading(false);
              return;
            }
          }

          // Set the user from the token
          const decoded = decodeToken(token);
          if (decoded) {
            setUser({
              id: decoded.sub,
              email: decoded.email,
              user_metadata: decoded.user_metadata || {},
              app_metadata: decoded.app_metadata || {},
              aud: decoded.aud,
              role: decoded.role,
            } as User);
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
          logout();
        }
      }
      
      setLoading(false);
    };

    const setupRefreshInterval = () => {
      // Clear any existing interval
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }

      // Set up new refresh interval
      refreshInterval = setInterval(async () => {
        const token = getAuthToken();
        if (token && isTokenExpired(token)) {
          console.log("Token refresh needed during interval check");
          try {
            const success = await apiClient.refreshToken();
            if (!success) {
              console.log("Token refresh failed during interval check");
              logout();
            }
          } catch (error) {
            console.error("Token refresh interval error:", error);
            logout();
          }
        }
      }, 60 * 1000); // Check every minute
    };

    initAuth();
    setupRefreshInterval();

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};