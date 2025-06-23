import Link from "next/link";
import Image from "next/image";
import { Navigation } from "./components/ui/Navigation";
import { Hero } from "./components/ui/Hero";
import { ScrollFade, StaggeredContainer } from "./components/animations/ScrollFade";
import { Button } from "./components/ui/Button";
import { Footer } from "./components/ui/Footer";

export default function Home() {
  const features = [
    {
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      title: "Premium Materials",
      description: "High-quality wood, glass, and acrylic frames designed to showcase your championship roster"
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Fantasy Champions",
      description: "Perfect for football and baseball fantasy league winners who want to immortalize their victory"
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Complete Solution",
      description: "Order your custom frame and player cards together in one seamless checkout experience"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navigation 
        logo="Roster Frame"
        links={[
          { href: '/build-and-buy', label: 'Build & Buy' },
          { href: '/marketplace', label: 'Marketplace' },
          { href: '/collection', label: 'Collection' },
        ]}
      />

      {/* Hero Section */}
      <Hero
        variant="centered"
        title="Showcase Your Fantasy Legacy"
        description="Create stunning custom plaques featuring your championship fantasy team. Premium materials, professional design, legendary results."
        primaryAction={{ 
          text: "Start Building Your Frame", 
          href: "/build-and-buy" 
        }}
        secondaryAction={{ 
          text: "View Gallery", 
          href: "/marketplace" 
        }}
      >
        <ScrollFade delay={600} className="mt-12">
          <div className="relative mx-auto max-w-md">
            <Image
              src="/images/RosterFrameBackground.png"
              alt="Custom Fantasy Roster Frame"
              width={400}
              height={300}
              className="rounded-xl shadow-2xl"
              priority
            />
            <div className="absolute -inset-4 bg-gradient-primary opacity-20 blur-2xl -z-10" />
          </div>
        </ScrollFade>
      </Hero>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-[var(--surface-0)] to-[var(--surface-1)]">
        <div className="container">
          <ScrollFade>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">
                <span className="gradient-text">Why Choose Roster Frame?</span>
              </h2>
              <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
                Premium quality meets personalized experience for serious fantasy players
              </p>
            </div>
          </ScrollFade>

          <StaggeredContainer staggerDelay={150}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center group">
                  <div className="card-hover bg-[var(--surface-0)] rounded-xl p-8 border border-[var(--surface-2)] h-full">
                    <div className="text-[var(--color-primary)] mb-6 flex justify-center">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">
                      {feature.title}
                    </h3>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </StaggeredContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-[var(--surface-1)] via-[var(--surface-2)] to-[var(--surface-1)]">
        <div className="container">
          <ScrollFade>
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-6">
                <span className="gradient-text">Ready to Create Your Legacy?</span>
              </h2>
              <p className="text-xl mb-8 text-[var(--text-secondary)] max-w-2xl mx-auto">
                Join thousands of fantasy champions who have immortalized their winning teams
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button 
                  variant="primary" 
                  size="lg" 
                  href="/build-and-buy"
                >
                  Build Your Frame
                </Button>
                <Button 
                  variant="secondary" 
                  size="lg" 
                  href="/collection"
                >
                  View Examples
                </Button>
              </div>
            </div>
          </ScrollFade>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}