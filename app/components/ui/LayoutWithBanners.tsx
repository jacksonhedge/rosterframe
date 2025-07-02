'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface LayoutWithBannersProps {
  children: ReactNode;
  announcement?: {
    text: string;
    link?: {
      href: string;
      text: string;
    };
  };
}

export function LayoutWithBanners({ 
  children, 
  announcement = {
    text: "🎉 New Year Special: 20% off all custom frames!",
    link: {
      href: "/build-and-buy",
      text: "Shop Now"
    }
  }
}: LayoutWithBannersProps) {
  return (
    <>
      {/* Announcement Bar - Below Navigation */}
      <div className="fixed top-16 md:top-20 left-0 right-0 z-40 bg-gradient-to-r from-orange-600 to-orange-500 text-white py-2 px-4 text-center border-b border-orange-700 shadow-md">
        <p className="text-sm font-medium">
          {announcement.text}
          {announcement.link && (
            <>
              {' '}
              <Link 
                href={announcement.link.href}
                className="underline hover:no-underline hover:text-orange-100 transition-colors"
              >
                {announcement.link.text}
              </Link>
            </>
          )}
        </p>
      </div>

      {/* Main Content - Add top padding only for announcement bar since navbar is in pages */}
      <div className="pt-10">
        {children}
      </div>
    </>
  );
}