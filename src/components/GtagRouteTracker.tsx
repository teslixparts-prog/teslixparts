'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function GtagRouteTracker({ id }: { id: string }) {
  const pathname = usePathname();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const gtag = (window as any).gtag as undefined | ((...args: any[]) => void);
    if (!gtag) return;
    gtag('config', id, { page_path: pathname });
    gtag('event', 'page_view', { send_to: id });
  }, [id, pathname]);
  return null;
}
