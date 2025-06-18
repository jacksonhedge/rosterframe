import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-amber-900">Roster Frame</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/secret-sleeper"
                className="text-amber-700 hover:text-amber-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Secret Sleeper
              </Link>
              <Link
                href="/sleeper-code-graph"
                className="text-amber-700 hover:text-amber-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Code Graph
              </Link>
              <Link
                href="/build-and-buy"
                className="bg-gradient-to-r from-amber-700 to-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-amber-800 hover:to-yellow-700 transition-all shadow-md"
              >
                Build and Buy
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Background */}
      <div className="relative min-h-screen flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/RosterFrameBackground.png"
            alt="Roster Frame Background"
            fill
            className="object-cover"
            priority
            quality={85}
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-900/40 to-yellow-900/50"></div>
        </div>
        
        {/* Content */}
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl drop-shadow-lg">
              Showcase Your Fantasy Team
            </h2>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-100 drop-shadow-md">
              Create a custom frame featuring the football and baseball cards of your fantasy team players. 
              Order your personalized plaque and cards all in one place.
            </p>
            <div className="mt-10">
              <Link
                href="/build-and-buy"
                className="inline-block bg-gradient-to-r from-amber-600 to-yellow-500 text-white px-8 py-3 rounded-md text-lg font-medium hover:from-amber-700 hover:to-yellow-600 transition-all shadow-lg transform hover:scale-105"
              >
                Start Building Your Frame
              </Link>
            </div>
          </div>
        </main>
      </div>

      {/* Features Section */}
      <section className="bg-gradient-to-b from-amber-50 to-yellow-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-amber-900 mb-4">Why Choose Roster Frame?</h3>
            <p className="text-lg text-amber-700">Premium quality, personalized experience</p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="bg-gradient-to-br from-amber-100 to-yellow-100 rounded-lg p-6 mb-4 border border-amber-200">
                <svg className="mx-auto h-12 w-12 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-amber-900">Premium Frames</h3>
              <p className="mt-2 text-amber-700">High-quality frames designed to showcase your collection</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-br from-amber-100 to-yellow-100 rounded-lg p-6 mb-4 border border-amber-200">
                <svg className="mx-auto h-12 w-12 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-amber-900">Fantasy Champions</h3>
              <p className="mt-2 text-amber-700">Perfect for football and baseball fantasy league winners</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-br from-amber-100 to-yellow-100 rounded-lg p-6 mb-4 border border-amber-200">
                <svg className="mx-auto h-12 w-12 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-amber-900">Complete Solution</h3>
              <p className="mt-2 text-amber-700">Order your frame and player cards together in one checkout</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}