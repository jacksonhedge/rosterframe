'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface BannerAdProps {
  position: 'left' | 'right';
}

// Individual banner ad components
const BankrollAd = () => (
  <Link 
    href="https://bankroll.live" 
    target="_blank" 
    rel="noopener noreferrer"
    className="block h-full"
  >
    <div className="h-full bg-gradient-to-b from-emerald-600 to-emerald-800 rounded-lg p-4 flex flex-col items-center justify-center text-white text-center">
      <div className="mb-3">
        <div className="text-4xl mb-2">💰</div>
        <div className="text-xl font-bold">Bankroll</div>
      </div>
      <div className="text-xs leading-tight mb-3">
        Hold League Dues in<br/>
        Smart Investments
      </div>
      <div className="text-[10px] opacity-80">
        Earn returns while<br/>
        managing your<br/>
        fantasy league funds
      </div>
      <div className="mt-auto pt-4">
        <div className="bg-white/20 rounded-full px-3 py-1 text-xs font-medium">
          Learn More →
        </div>
      </div>
    </div>
  </Link>
);

const EbayAd = () => (
  <Link 
    href="https://www.ebay.com/sch/i.html?_nkw=sports+cards" 
    target="_blank" 
    rel="noopener noreferrer"
    className="block h-full"
  >
    <div className="h-full bg-gradient-to-b from-blue-500 to-blue-700 rounded-lg p-4 flex flex-col items-center justify-center text-white text-center">
      <div className="mb-3">
        <div className="text-3xl font-bold mb-1">eBay</div>
      </div>
      <div className="text-sm font-medium mb-2">
        Sports Cards
      </div>
      <div className="text-xs leading-tight mb-3">
        Find the perfect cards<br/>
        for your collection
      </div>
      <div className="space-y-2 text-[10px]">
        <div>✓ Millions of cards</div>
        <div>✓ Best prices</div>
        <div>✓ Buyer protection</div>
      </div>
      <div className="mt-auto pt-4">
        <div className="bg-yellow-400 text-blue-800 rounded-full px-3 py-1 text-xs font-bold">
          Shop Now
        </div>
      </div>
    </div>
  </Link>
);

const GriddyAd = () => (
  <Link 
    href="https://griddy.com" 
    target="_blank" 
    rel="noopener noreferrer"
    className="block h-full"
  >
    <div className="h-full bg-gradient-to-b from-purple-600 to-purple-800 rounded-lg p-4 flex flex-col items-center justify-center text-white text-center">
      <div className="mb-3">
        <div className="text-2xl font-bold">GRIDDY</div>
      </div>
      <div className="text-sm font-medium mb-2">
        Fantasy Sports Hub
      </div>
      <div className="text-xs leading-tight mb-3">
        Level up your<br/>
        fantasy game
      </div>
      <div className="space-y-1 text-[10px]">
        <div>• Expert Analysis</div>
        <div>• Live Updates</div>
        <div>• Winning Strategies</div>
      </div>
      <div className="mt-auto pt-4">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-purple-900 rounded-full px-3 py-1 text-xs font-bold">
          Get Started
        </div>
      </div>
    </div>
  </Link>
);

// Placeholder for future ads
const ComingSoonAd = ({ name }: { name: string }) => (
  <div className="h-full bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg p-4 flex flex-col items-center justify-center text-gray-600 text-center">
    <div className="text-2xl mb-2">🎯</div>
    <div className="text-sm font-medium mb-1">Coming Soon</div>
    <div className="text-xs opacity-75">{name}</div>
    <div className="mt-auto pt-4">
      <div className="text-[10px] text-gray-500">
        Contact us to<br/>advertise here
      </div>
    </div>
  </div>
);

export function BannerAd({ position }: BannerAdProps) {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  
  // Define ads for each position
  const leftAds = [
    <BankrollAd key="bankroll" />,
    <GriddyAd key="griddy" />,
    <ComingSoonAd key="coming1" name="Partner Ad" />
  ];
  
  const rightAds = [
    <EbayAd key="ebay" />,
    <ComingSoonAd key="coming2" name="Sponsor Ad" />,
    <ComingSoonAd key="coming3" name="Featured Partner" />
  ];
  
  const ads = position === 'left' ? leftAds : rightAds;
  
  // Rotate ads every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [ads.length]);
  
  return (
    <div className="h-full relative">
      {/* Ad indicators */}
      <div className="absolute top-2 right-2 flex gap-1 z-10">
        {ads.map((_, index) => (
          <div
            key={index}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              index === currentAdIndex ? 'bg-white/80' : 'bg-white/30'
            }`}
          />
        ))}
      </div>
      
      {/* Current ad */}
      <div className="h-full">
        {ads[currentAdIndex]}
      </div>
    </div>
  );
}