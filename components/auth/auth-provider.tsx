"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { apiClient } from "@/lib/api-client";
import { getAuthToken, clearAuthToken } from "@/lib/auth";

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
    const initAuth = async () => {
      const token = getAuthToken();
      console.log("Initializing auth, token exists:", !!token);
      
      if (token) {
        try {
          console.log("Refreshing token...");
          const response = await apiClient.refreshToken();
          console.log("Token refresh response:", response);
          
          if (response) {
            // Set the user from the token response
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            setUser({
              id: tokenData.sub,
              email: tokenData.email,
              user_metadata: tokenData.user_metadata || {},
              app_metadata: tokenData.app_metadata || {},
              aud: tokenData.aud,
              role: tokenData.role,
            } as User);
          } else {
            console.log("Token refresh failed, logging out");
            logout();
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
          logout();
        }
      }
      
      setLoading(false);
    };

    initAuth();

    // Check token expiration periodically
    const interval = setInterval(async () => {
      const currentToken = getAuthToken();
      if (currentToken) {
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
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
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