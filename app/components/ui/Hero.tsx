import { ReactNode } from 'react';
import { ScrollFade } from '../animations/ScrollFade';
import { Button } from './Button';

interface HeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  primaryAction?: {
    text: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    text: string;
    href?: string;
    onClick?: () => void;
  };
  image?: {
    src: string;
    alt: string;
  };
  children?: ReactNode;
  variant?: 'default' | 'centered' | 'split';
}

export function Hero({
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
  image,
  children,
  variant = 'default',
}: HeroProps) {
  if (variant === 'centered') {
    return (
      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-1)] to-[var(--background)] opacity-50" />
        
        <div className="container relative z-10 text-center py-[var(--space-24)]">
          <ScrollFade>
            {subtitle && (
              <p className="text-[var(--color-primary)] font-[var(--font-medium)] mb-[var(--space-4)]">
                {subtitle}
              </p>
            )}
            <h1 className="text-[var(--text-5xl)] md:text-[4rem] font-[var(--font-bold)] mb-[var(--space-6)] leading-tight">
              <span className="gradient-text">{title}</span>
            </h1>
            {description && (
              <p className="text-[var(--text-xl)] text-[var(--text-secondary)] max-w-2xl mx-auto mb-[var(--space-8)]">
                {description}
              </p>
            )}
          </ScrollFade>

          <ScrollFade delay={200}>
            <div className="flex flex-wrap gap-[var(--space-4)] justify-center">
              {primaryAction && (
                <Button
                  size="lg"
                  href={primaryAction.href}
                  onClick={primaryAction.onClick}
                >
                  {primaryAction.text}
                </Button>
              )}
              {secondaryAction && (
                <Button
                  variant="secondary"
                  size="lg"
                  href={secondaryAction.href}
                  onClick={secondaryAction.onClick}
                >
                  {secondaryAction.text}
                </Button>
              )}
            </div>
          </ScrollFade>

          {children && (
            <ScrollFade delay={400} className="mt-[var(--space-12)]">
              {children}
            </ScrollFade>
          )}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-[var(--text-tertiary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>
    );
  }

  if (variant === 'split') {
    return (
      <section className="relative min-h-[100vh] flex items-center overflow-hidden">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--space-12)] items-center">
            <ScrollFade>
              <div>
                {subtitle && (
                  <p className="text-[var(--color-primary)] font-[var(--font-medium)] mb-[var(--space-4)]">
                    {subtitle}
                  </p>
                )}
                <h1 className="text-[var(--text-4xl)] md:text-[var(--text-5xl)] font-[var(--font-bold)] mb-[var(--space-6)] leading-tight">
                  {title}
                </h1>
                {description && (
                  <p className="text-[var(--text-lg)] text-[var(--text-secondary)] mb-[var(--space-8)]">
                    {description}
                  </p>
                )}
                <div className="flex flex-wrap gap-[var(--space-4)]">
                  {primaryAction && (
                    <Button
                      size="lg"
                      href={primaryAction.href}
                      onClick={primaryAction.onClick}
                    >
                      {primaryAction.text}
                    </Button>
                  )}
                  {secondaryAction && (
                    <Button
                      variant="secondary"
                      size="lg"
                      href={secondaryAction.href}
                      onClick={secondaryAction.onClick}
                    >
                      {secondaryAction.text}
                    </Button>
                  )}
                </div>
              </div>
            </ScrollFade>

            {image && (
              <ScrollFade direction="left" delay={200}>
                <div className="relative">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-auto rounded-[var(--radius-xl)] shadow-xl"
                  />
                  {/* Decorative gradient behind image */}
                  <div className="absolute -inset-4 bg-[var(--gradient-primary)] opacity-20 blur-2xl -z-10" />
                </div>
              </ScrollFade>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Default variant
  return (
    <section className="relative py-[var(--space-24)] overflow-hidden">
      <div className="container">
        <ScrollFade>
          <div className="max-w-3xl">
            {subtitle && (
              <p className="text-[var(--color-primary)] font-[var(--font-medium)] mb-[var(--space-4)]">
                {subtitle}
              </p>
            )}
            <h1 className="text-[var(--text-4xl)] md:text-[var(--text-5xl)] font-[var(--font-bold)] mb-[var(--space-6)] leading-tight">
              {title}
            </h1>
            {description && (
              <p className="text-[var(--text-lg)] text-[var(--text-secondary)] mb-[var(--space-8)]">
                {description}
              </p>
            )}
            <div className="flex flex-wrap gap-[var(--space-4)]">
              {primaryAction && (
                <Button
                  size="lg"
                  href={primaryAction.href}
                  onClick={primaryAction.onClick}
                >
                  {primaryAction.text}
                </Button>
              )}
              {secondaryAction && (
                <Button
                  variant="secondary"
                  size="lg"
                  href={secondaryAction.href}
                  onClick={secondaryAction.onClick}
                >
                  {secondaryAction.text}
                </Button>
              )}
            </div>
          </div>
        </ScrollFade>
        {children}
      </div>
    </section>
  );
}