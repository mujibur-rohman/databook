"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = !!user;

  useEffect(() => {
    // Check if user is authenticated on app load
    const checkAuth = () => {
      try {
        const isAuthenticatedStorage = localStorage.getItem("isAuthenticated");
        const userData = localStorage.getItem("user");

        if (isAuthenticatedStorage === "true" && userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("user");
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    // Redirect logic
    if (!loading) {
      const publicPaths = ["/login"];
      const isPublicPath = publicPaths.includes(pathname);

      if (!isAuthenticated && !isPublicPath) {
        router.push("/login");
      } else if (isAuthenticated && pathname === "/login") {
        router.push("/admin/dashboard");
      } else if (isAuthenticated && pathname === "/") {
        router.push("/admin/dashboard");
      }
    }
  }, [isAuthenticated, pathname, loading, router]);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simple validation (replace with real API call)
      if (username === "admin" && password === "admin123") {
        const userData = { username, role: "admin" };

        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);

        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
