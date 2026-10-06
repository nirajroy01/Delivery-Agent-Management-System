'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getStoredToken } from '@/lib/auth';
import Loading from './Loading';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.replace('/login');
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return <Loading label="Checking session..." />;
  }

  return <>{children}</>;
}
