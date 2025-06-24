'use client';

import Link from 'next/link';
import { useNavbarScroll } from '@/app/hooks/useScrollAnimation';

interface NavLink {
  href: string;
  label: string;
}

interface NavigationProps {
  links?: NavLink[];
  logo?: string;
}

export function Navigation({ 
  links = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
  ],
  logo = 'Roster Frame'
}: NavigationProps) {
  const { isScrolled, isHidden } = useNavbarScroll();

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300 ease-out
        ${isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
          : 'bg-gradient-to-r from-gray-100/80 to-gray-50/80 backdrop-blur-sm'
        }
        ${isHidden ? '-translate-y-full' : 'translate-y-0'}
      `}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl md:text-2xl font-bold transition-colors hover:scale-105 transform duration-200"
          >
            <span className={`${isScrolled 
              ? 'text-gray-800 hover:text-orange-600' 
              : 'text-gray-900 hover:text-orange-600'
            } transition-colors`}>
              {logo}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  relative text-sm font-medium
                  ${isScrolled 
                    ? 'text-gray-700 hover:text-orange-600' 
                    : 'text-gray-800 hover:text-orange-600'
                  }
                  transition-all duration-200 hover:scale-105 transform
                  after:content-[''] after:absolute after:left-0 after:bottom-[-4px]
                  after:w-0 after:h-[2px] after:bg-orange-600
                  after:transition-all after:duration-300
                  hover:after:w-full
                `}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/build-and-buy"
              className="
                px-6 py-2 text-sm font-semibold
                bg-gradient-to-r from-orange-600 to-orange-500
                text-white rounded-lg
                hover:from-orange-700 hover:to-orange-600
                transform hover:scale-105 transition-all duration-200
                shadow-md hover:shadow-lg
                border border-orange-700/20
              "
            >
              Build My Plaque
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`
              md:hidden p-2 rounded-lg
              ${isScrolled 
                ? 'text-gray-700 hover:text-orange-600 hover:bg-gray-100' 
                : 'text-gray-800 hover:text-orange-600 hover:bg-gray-200/50'
              }
              transition-colors duration-200
            `}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}