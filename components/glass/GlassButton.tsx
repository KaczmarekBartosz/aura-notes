'use client';

import { cn } from '@/lib/utils';
import { useTheme, useReducedMotion } from '@/lib/theme';
import { type ReactNode, type ButtonHTMLAttributes, forwardRef } from 'react';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Visual variant */
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'destructive';
  /** Size preset */
  size?: 'sm' | 'md' | 'lg' | 'icon';
  /** Full width button */
  fullWidth?: boolean;
  /** Show shimmer effect on hover */
  shimmer?: boolean;
  /** Is loading state */
  loading?: boolean;
}

/**
 * GlassButton - Liquid glass button component
 * 
 * Morphing button with glassmorphism effects.
 * Adapts to current theme automatically.
 */
export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  function GlassButton(
    {
      children,
      className,
      variant = 'default',
      size = 'md',
      fullWidth = false,
      shimmer = true,
      loading = false,
      disabled,
      ...props
    },
    ref
  ) {
    const { isGlass } = useTheme();
    const reducedMotion = useReducedMotion();

    // Brutalist fallback
    if (!isGlass) {
      const brutalistVariants = {
        default: 'bg-primary text-primary-foreground border-2 border-transparent hover:border-foreground hover:shadow-[4px_4px_0_var(--foreground)]',
        primary: 'bg-primary text-primary-foreground border-2 border-transparent hover:border-foreground hover:shadow-[4px_4px_0_var(--foreground)]',
        secondary: 'bg-secondary text-secondary-foreground border-2 border-foreground hover:shadow-[4px_4px_0_var(--foreground)]',
        ghost: 'hover:bg-foreground hover:text-background text-foreground border-2 border-transparent',
        destructive: 'bg-destructive text-destructive-foreground border-2 border-transparent hover:border-foreground hover:shadow-[4px_4px_0_var(--destructive)]',
      };

      const brutalistSizes = {
        sm: 'h-9 px-4 text-xs font-bold uppercase',
        md: 'h-11 px-6 text-sm font-bold uppercase tracking-wider',
        lg: 'h-14 px-8 text-base font-black uppercase text-lg',
        icon: 'size-11',
      };

      return (
        <button
          ref={ref}
          className={cn(
            'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none',
            'transition-all duration-150 hover:-translate-y-1 active:translate-y-0 active:shadow-none',
            brutalistVariants[variant],
            brutalistSizes[size],
            fullWidth && 'w-full',
            (disabled || loading) && 'opacity-50 pointer-events-none',
            className
          )}
          disabled={disabled || loading}
          {...props}
        >
          {loading && (
            <span className="animate-spin mr-2">⟳</span>
          )}
          {children}
        </button>
      );
    }

    // Glass variants
    const glassVariants = {
      default: 'glass-button',
      primary: 'glass-button glass-button-primary',
      secondary: 'glass-button bg-[var(--secondary)]',
      ghost: 'glass-button bg-transparent border-transparent hover:bg-[var(--glass-bg-hover)]',
      destructive: 'glass-button bg-[var(--destructive)] text-white border-transparent',
    };

    const glassSizes = {
      sm: 'h-9 px-4 text-xs font-semibold',
      md: 'h-11 px-6 text-sm font-semibold',
      lg: 'h-14 px-8 text-base font-bold',
      icon: 'size-11',
    };

    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2 whitespace-nowrap',
          'relative overflow-hidden',
          // Glass styling
          glassVariants[variant],
          glassSizes[size],
          // Layout
          fullWidth && 'w-full',
          // Shimmer effect
          shimmer && !reducedMotion && 'before:opacity-0 hover:before:opacity-100',
          // Disabled state
          (disabled || loading) && 'opacity-50 pointer-events-none',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {/* Liquid gradient background */}
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:animate-shimmer" />
        
        {/* Loading spinner */}
        {loading && (
          <svg
            className="animate-spin h-4 w-4 mr-1"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {/* Content */}
        <span className="relative z-10">{children}</span>
      </button>
    );
  }
);

/**
 * GlassIconButton - Circular icon button variant
 */
interface GlassIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'ghost';
}

export const GlassIconButton = forwardRef<HTMLButtonElement, GlassIconButtonProps>(
  function GlassIconButton(
    { children, className, size = 'md', variant = 'default', ...props },
    ref
  ) {
    const { isGlass } = useTheme();

    const sizes = {
      sm: 'size-8',
      md: 'size-11',
      lg: 'size-14',
    };

    const iconSizes = {
      sm: '[&_*&:not(svg)]:size-4 [&_svg]:size-4',
      md: '[&_*&:not(svg)]:size-5 [&_svg]:size-5',
      lg: '[&_*&:not(svg)]:size-6 [&_svg]:size-6',
    };

    if (!isGlass) {
      const brutalistVariants = {
        default: 'bg-primary text-primary-foreground border-2 border-transparent hover:border-foreground hover:shadow-[4px_4px_0_var(--foreground)]',
        primary: 'bg-primary text-primary-foreground border-2 border-transparent hover:border-foreground hover:shadow-[4px_4px_0_var(--foreground)]',
        ghost: 'hover:bg-foreground hover:text-background text-foreground border-2 border-transparent',
      };

      return (
        <button
          ref={ref}
          className={cn(
            'inline-flex items-center justify-center rounded-none',
            'transition-all duration-150 hover:-translate-y-1 active:translate-y-0',
            brutalistVariants[variant],
            sizes[size],
            iconSizes[size],
            className
          )}
          {...props}
        >
          {children}
        </button>
      );
    }

    const glassVariants = {
      default: 'glass-button',
      primary: 'glass-button glass-button-primary',
      ghost: 'glass-button bg-transparent border-transparent hover:bg-[var(--glass-bg-hover)]',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full',
          'transition-all duration-300',
          glassVariants[variant],
          sizes[size],
          iconSizes[size],
          'hover:scale-110 active:scale-95',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
