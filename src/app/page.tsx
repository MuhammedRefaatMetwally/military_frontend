'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function RootPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/sales');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0e17' }}>
      <div className="w-10 h-10 border-2 rounded-full animate-spin"
        style={{ borderColor: '#00e5a0', borderTopColor: 'transparent' }} />
    </div>
  );
}
