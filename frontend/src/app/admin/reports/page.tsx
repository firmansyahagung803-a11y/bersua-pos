'use client';
// Reports page - redirects to finance
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ReportsPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/admin/finance'); }, [router]);
  return null;
}

