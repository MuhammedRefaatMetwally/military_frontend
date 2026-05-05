'use client';

import { create } from 'zustand';

interface ThemeState {
    mode: 'dark' | 'light';
    toggleMode: () => void;
    setMode: (mode: 'dark' | 'light') => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
    mode: 'light',
    toggleMode: () => set((state) => ({ mode: state.mode === 'dark' ? 'light' : 'dark' })),
    setMode: (mode) => set({ mode }),
}));
