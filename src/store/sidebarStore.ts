'use client';

import { create } from 'zustand';

interface SidebarState {
    isCollapsed: boolean;
    /** Off-canvas open state for md and below. */
    isMobileOpen: boolean;
    activeSection: string;
    toggleSidebar: () => void;
    toggleMobile: () => void;
    setMobileOpen: (open: boolean) => void;
    setActiveSection: (section: string) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
    isCollapsed: false,
    isMobileOpen: false,
    activeSection: 'dashboard',
    toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
    toggleMobile: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
    setMobileOpen: (open) => set({ isMobileOpen: open }),
    setActiveSection: (section) => set({ activeSection: section }),
}));
