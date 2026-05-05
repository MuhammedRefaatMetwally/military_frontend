"use client";

import { create } from "zustand";

export type UserRole = "admin" | "analyst" | "executive";

export interface User {
  id: string;
  name: string;
  nameAr: string;
  role: UserRole;
  department: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  sessionExpiry: number | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  extendSession: () => void;
}

const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  sessionExpiry: null,

  login: async (username: string) => {
    // Simulated authentication — replace with real API
    await new Promise((r) => setTimeout(r, 1200));

    const mockUser: User = {
      id: "usr_001",
      name: username || "Admin Officer",
      nameAr: "مسؤول النظام",
      role: "admin",
      department: "القيادة العامة",
    };

    set({
      user: mockUser,
      token: "mock-jwt-token-xyz", // Replace with real token from API response
      isAuthenticated: true,
      sessionExpiry: Date.now() + SESSION_DURATION,
    });

    return true;
  },

  logout: () => {
    set({ user: null, token: null, isAuthenticated: false, sessionExpiry: null });
  },

  extendSession: () => {
    set({ sessionExpiry: Date.now() + SESSION_DURATION });
  },
}));
