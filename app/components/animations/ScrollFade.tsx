'use client';

import { ReactNode } from 'react';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';

interface ScrollFadeProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
}

export function ScrollFade({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 500,
}: ScrollFadeProps) {
  const [ref, isInView] = useScrollAnimation<HTMLDivElement>({
    threshold: 0.1,
    triggerOnce: true,
  });

  const getTransform = () => {
    switch (direction) {
      case 'up':
        return 'translateY(20px)';
      case 'down':
        return 'translateY(-20px)';
      case 'left':
        return 'translateX(20px)';
      case 'right':
        return 'translateX(-20px)';
      default:
        return 'translateY(20px)';
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translate(0)' : getTransform(),
        transition: `all ${duration}ms cubic-bezier(0, 0, 0.2, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// Staggered animation wrapper
interface StaggeredContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggeredContainer({
  children,
  className = '',
  staggerDelay = 100,
}: StaggeredContainerProps) {
  return (
    <div className={className}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <ScrollFade key={index} delay={index * staggerDelay}>
              {child}
            </ScrollFade>
          ))
        : children}
    </div>
  );
}