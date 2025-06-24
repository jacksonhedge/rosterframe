'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { BannerAd } from './BannerAds';

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

      {/* Main Layout with Side Banners */}
      <div className="relative">
        {/* Left Banner - Desktop Only */}
        <div className="hidden xl:block fixed left-2 top-36 w-40 h-[600px] bg-white/90 backdrop-blur-sm rounded-lg shadow-xl z-30 border border-gray-200">
          <div className="p-3 h-full">
            <div className="text-center h-full flex flex-col">
              <p className="text-gray-500 text-xs font-medium mb-2 uppercase tracking-wider">Sponsored</p>
              <div className="flex-1">
                <BannerAd position="left" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Banner - Desktop Only */}
        <div className="hidden xl:block fixed right-2 top-36 w-40 h-[600px] bg-white/90 backdrop-blur-sm rounded-lg shadow-xl z-30 border border-gray-200">
          <div className="p-3 h-full">
            <div className="text-center h-full flex flex-col">
              <p className="text-gray-500 text-xs font-medium mb-2 uppercase tracking-wider">Sponsored</p>
              <div className="flex-1">
                <BannerAd position="right" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Add top padding only for announcement bar since navbar is in pages */}
        <div className="pt-10">
          {children}
        </div>
      </div>
    </>
  );
}