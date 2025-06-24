'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { LayoutWithBanners } from './LayoutWithBanners';

interface ConditionalBannersProps {
  children: ReactNode;
}

export function ConditionalBanners({ children }: ConditionalBannersProps) {
  const pathname = usePathname();
  
  // Don't show banners on admin pages or test pages
  const shouldShowBanners = !pathname.startsWith('/admin') && 
                           !pathname.startsWith('/test-') &&
                           !pathname.includes('-demo');
  
  if (shouldShowBanners) {
    return <LayoutWithBanners>{children}</LayoutWithBanners>;
  }
  
  return <>{children}</>;
}