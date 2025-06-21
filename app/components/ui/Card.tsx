import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'outlined';
}

export function Card({
  children,
  className = '',
  hover = true,
  padding = 'md',
  variant = 'default',
}: CardProps) {
  const paddingClasses = {
    sm: 'p-[var(--space-4)]',
    md: 'p-[var(--space-6)]',
    lg: 'p-[var(--space-8)]',
  };

  const variantClasses = {
    default: 'bg-[var(--surface-0)] border border-[var(--surface-2)]',
    elevated: 'bg-[var(--surface-0)] shadow-lg',
    outlined: 'bg-transparent border-2 border-[var(--surface-3)]',
  };

  return (
    <div
      className={`
        rounded-[var(--radius-lg)]
        ${paddingClasses[padding]}
        ${variantClasses[variant]}
        ${hover ? 'card-hover' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Feature Card Component
interface FeatureCardProps {
  icon?: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  className = '',
}: FeatureCardProps) {
  return (
    <Card className={className}>
      {icon && (
        <div className="w-12 h-12 rounded-[var(--radius)] bg-[var(--surface-1)] flex items-center justify-center mb-[var(--space-4)]">
          {icon}
        </div>
      )}
      <h3 className="text-[var(--text-xl)] font-[var(--font-semibold)] mb-[var(--space-2)]">
        {title}
      </h3>
      <p className="text-[var(--text-secondary)] leading-relaxed">
        {description}
      </p>
    </Card>
  );
}

// Pricing Card Component
interface PricingCardProps {
  title: string;
  price: string;
  period?: string;
  features: string[];
  highlighted?: boolean;
  buttonText?: string;
  onButtonClick?: () => void;
}

export function PricingCard({
  title,
  price,
  period = '/month',
  features,
  highlighted = false,
  buttonText = 'Get Started',
  onButtonClick,
}: PricingCardProps) {
  return (
    <Card
      variant={highlighted ? 'elevated' : 'default'}
      className={`
        relative
        ${highlighted ? 'border-2 border-[var(--color-primary)]' : ''}
      `}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-[var(--gradient-primary)] text-white text-sm font-medium px-3 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}
      
      <div className="text-center mb-[var(--space-6)]">
        <h3 className="text-[var(--text-2xl)] font-[var(--font-bold)] mb-[var(--space-2)]">
          {title}
        </h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-[var(--text-5xl)] font-[var(--font-bold)]">
            {price}
          </span>
          <span className="text-[var(--text-secondary)]">{period}</span>
        </div>
      </div>

      <ul className="space-y-[var(--space-3)] mb-[var(--space-8)]">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-[var(--space-2)]">
            <svg
              className="w-5 h-5 text-[var(--color-success)] flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-[var(--text-secondary)]">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onButtonClick}
        className={`
          w-full
          ${highlighted ? 'btn btn-primary' : 'btn btn-secondary'}
        `}
      >
        {buttonText}
      </button>
    </Card>
  );
}