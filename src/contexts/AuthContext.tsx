"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { login as apiLogin } from "@/lib/api";

export type AuthUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (input: { email: string; firstName: string; lastName: string; authProvider: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as AuthUser;
      if (parsed && parsed.token) {
        setUser(parsed);
      }
    } catch {
      // ignore corrupted storage
    }
  }, []);

  const login = useCallback(
    async (input: { email: string; firstName: string; lastName: string; authProvider: string }) => {
      setLoading(true);
      try {
        const result = await apiLogin(input);
        setUser(result);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

