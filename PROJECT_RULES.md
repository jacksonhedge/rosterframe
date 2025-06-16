# Roster Frame - Project Rules & Guidelines

## 🎯 Project Overview
**Roster Frame** is a Next.js application that allows fantasy sports enthusiasts to create custom frames showcasing their fantasy team players with sports cards. Users can select frames, input their team roster, choose player cards, and purchase everything in one seamless experience.

## 📋 Development Rules

### Code Standards

#### TypeScript
- **ALWAYS** use TypeScript for all new files
- **NEVER** use `any` type - prefer proper typing or `unknown`
- **ALWAYS** define interfaces for props and complex objects
- **PREFER** type inference over explicit typing when obvious

#### React/Next.js
- **USE** functional components with hooks (no class components)
- **PREFER** server components over client components unless interactivity is needed
- **ALWAYS** use the `"use client"` directive only when necessary
- **FOLLOW** Next.js App Router conventions (app directory structure)
- **USE** proper Next.js imports (`next/link`, `next/image`, etc.)

#### Styling
- **USE** Tailwind CSS for all styling
- **AVOID** custom CSS files unless absolutely necessary
- **PREFER** Tailwind utility classes over custom styles
- **MAINTAIN** consistent spacing using Tailwind's spacing scale
- **USE** responsive design classes (`sm:`, `md:`, `lg:`, `xl:`)

### File Organization

#### Directory Structure
```
app/
├── page.tsx              # Home page
├── layout.tsx            # Root layout
├── globals.css           # Global styles
├── [feature]/           # Feature-based routing
│   └── page.tsx         # Feature page
├── components/          # Reusable components
├── lib/                 # Utilities and helpers
└── types/               # TypeScript type definitions
```

#### Naming Conventions
- **FILES**: Use kebab-case for directories, PascalCase for React components
- **COMPONENTS**: PascalCase (e.g., `PlayerCard.tsx`)
- **VARIABLES**: camelCase
- **CONSTANTS**: UPPER_SNAKE_CASE
- **TYPES/INTERFACES**: PascalCase with descriptive names

### Component Rules

#### Component Structure
```typescript
// 1. Imports (external libraries first, then internal)
import { useState } from "react";
import Link from "next/link";

// 2. Types/Interfaces
interface ComponentProps {
  title: string;
  optional?: boolean;
}

// 3. Component definition
export default function Component({ title, optional }: ComponentProps) {
  // 4. Hooks
  const [state, setState] = useState("");
  
  // 5. Event handlers
  const handleClick = () => {
    // handler logic
  };
  
  // 6. Render
  return (
    <div className="container">
      {/* JSX */}
    </div>
  );
}
```

#### State Management
- **USE** `useState` for local component state
- **PREFER** props drilling for simple state sharing
- **CONSIDER** Context API for deeply nested state
- **AVOID** external state management until complexity demands it

### Performance Guidelines

#### Optimization
- **USE** `next/image` for all images
- **IMPLEMENT** proper loading states
- **AVOID** unnecessary re-renders with `useMemo` and `useCallback`
- **LAZY LOAD** components that are below the fold
- **OPTIMIZE** bundle size by avoiding large dependencies

#### SEO & Accessibility
- **ALWAYS** include proper meta tags
- **USE** semantic HTML elements
- **INCLUDE** alt text for images
- **ENSURE** keyboard navigation works
- **MAINTAIN** color contrast standards

## 🔄 Git Workflow Rules

### Branch Naming
- `main` - Production ready code
- `develop` - Development integration branch
- `feature/[description]` - New features
- `fix/[description]` - Bug fixes
- `hotfix/[description]` - Critical production fixes

### Commit Messages
Follow conventional commits format:
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Build process or auxiliary tool changes

**Examples:**
```
feat: add player card selection functionality
fix: resolve checkout calculation error
docs: update README with new setup instructions
```

### Pull Request Rules
- **ALWAYS** create PR from feature branch to `develop`
- **INCLUDE** clear description of changes
- **ADD** screenshots for UI changes
- **ENSURE** all tests pass
- **REQUEST** at least one code review
- **LINK** related issues in PR description

## 🚀 Deployment Guidelines

### Environment Setup
- **Development**: `npm run dev`
- **Production Build**: `npm run build`
- **Production Start**: `npm run start`
- **Linting**: `npm run lint`

### Environment Variables
- **NEVER** commit sensitive data
- **USE** `.env.local` for local development
- **DOCUMENT** all required environment variables
- **PREFIX** Next.js public variables with `NEXT_PUBLIC_`

### Pre-Deployment Checklist
- [ ] All tests pass
- [ ] No linting errors
- [ ] Build completes successfully
- [ ] Performance audit completed
- [ ] SEO meta tags verified
- [ ] Mobile responsiveness tested

## 🧪 Testing Strategy

### Required Tests
- **Unit tests** for utility functions
- **Component tests** for complex interactive components
- **Integration tests** for critical user flows
- **E2E tests** for checkout process

### Testing Libraries
- **Jest** for unit testing
- **React Testing Library** for component testing
- **Playwright** for E2E testing (when implemented)

## 🔒 Security Guidelines

### Best Practices
- **VALIDATE** all user inputs
- **SANITIZE** data before displaying
- **USE** HTTPS in production
- **IMPLEMENT** proper error handling
- **NEVER** expose sensitive data in client-side code
- **VALIDATE** environment variables

## 📦 Dependencies Management

### Adding Dependencies
- **EVALUATE** bundle size impact
- **PREFER** well-maintained packages
- **CHECK** TypeScript support
- **AVOID** dependencies with security vulnerabilities
- **DOCUMENT** reason for adding new dependencies

### Version Management
- **KEEP** dependencies up to date
- **TEST** thoroughly after updates
- **USE** exact versions for critical dependencies
- **REGULAR** security audits with `npm audit`

## 🐛 Error Handling

### Error Boundaries
- **IMPLEMENT** error boundaries for feature sections
- **PROVIDE** user-friendly error messages
- **LOG** errors for debugging
- **GRACEFUL** degradation when possible

### API Error Handling
- **HANDLE** network failures gracefully
- **SHOW** appropriate loading states
- **PROVIDE** retry mechanisms
- **VALIDATE** API responses

---

## ❗ Critical Rules - NEVER BREAK

1. **NEVER** commit directly to `main` branch
2. **NEVER** commit API keys or sensitive data
3. **NEVER** deploy without testing
4. **NEVER** ignore TypeScript errors
5. **NEVER** ship code with console.log statements
6. **ALWAYS** test on mobile devices before deployment
7. **ALWAYS** run linting before committing
8. **ALWAYS** write meaningful commit messages

---

*Last updated: [Current Date]*
*For questions about these rules, please create an issue or reach out to the project maintainer.* 